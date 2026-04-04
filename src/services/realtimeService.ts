import { API_KEYS, ENDPOINTS } from '@/config/apiKeys';
import { marketAssets } from './marketData';
import { fromOandaInstrument, getBinanceStreams, getFinnhubSymbols, getOandaInstruments } from './marketDataService';

export type PriceUpdate = {
  symbol: string;
  bid: number;
  ask: number;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  source: string;
  timestamp: number;
};

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

type StatusCallback = (provider: string, status: ConnectionStatus) => void;
type PriceCallback = (update: PriceUpdate) => void;

function createThrottle(intervalMs: number) {
  const lastCall = new Map<string, number>();
  return (key: string, fn: () => void) => {
    const now = Date.now();
    const last = lastCall.get(key) || 0;
    if (now - last >= intervalMs) {
      lastCall.set(key, now);
      fn();
    }
  };
}

function binanceToInternal(binanceSymbol: string): string | undefined {
  return marketAssets.find(asset => asset.binanceSymbol === binanceSymbol)?.symbol;
}

export class RealtimeService {
  private onPrice: PriceCallback;
  private onStatus: StatusCallback;
  private throttle = createThrottle(1000);
  private binanceWs: WebSocket | null = null;
  private finnhubWs: WebSocket | null = null;
  private oandaAbort: AbortController | null = null;
  private simInterval: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;
  private simPrices: Record<string, number> = {};
  private latestPrices: Record<string, PriceUpdate> = {};

  constructor(onPrice: PriceCallback, onStatus: StatusCallback) {
    this.onPrice = onPrice;
    this.onStatus = onStatus;

    try {
      const cached = localStorage.getItem('rt_prices');
      if (cached) this.latestPrices = JSON.parse(cached);
    } catch {}
  }

  start() {
    this.destroyed = false;
    this.connectBinance();
    this.connectFinnhub();
    this.connectOanda();
    this.startSimulation();
  }

  stop() {
    this.destroyed = true;
    this.binanceWs?.close();
    this.finnhubWs?.close();
    this.oandaAbort?.abort();
    if (this.simInterval) clearInterval(this.simInterval);

    try {
      localStorage.setItem('rt_prices', JSON.stringify(this.latestPrices));
    } catch {}
  }

  getCachedPrices(): Record<string, PriceUpdate> {
    return { ...this.latestPrices };
  }

  private emit(update: PriceUpdate) {
    this.latestPrices[update.symbol] = update;
    this.throttle(update.symbol, () => this.onPrice(update));
  }

  private connectBinance(backoff = 1000) {
    if (this.destroyed) return;
    this.onStatus('binance', 'connecting');

    const streams = getBinanceStreams();
    if (streams.length === 0) return;

    const ws = new WebSocket(ENDPOINTS.BINANCE_WS);
    this.binanceWs = ws;

    ws.onopen = () => {
      this.onStatus('binance', 'connected');
      ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: streams, id: 1 }));
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (!data.s || !data.c) return;

        const symbol = binanceToInternal(data.s);
        const asset = marketAssets.find(item => item.symbol === symbol);
        if (!symbol || !asset) return;

        const price = parseFloat(data.c);
        const spread = price * 0.0001;

        this.emit({
          symbol,
          price,
          bid: Number((price - spread / 2).toFixed(asset.decimals)),
          ask: Number((price + spread / 2).toFixed(asset.decimals)),
          change: parseFloat(data.p || '0'),
          changePercent: parseFloat(data.P || '0'),
          high24h: parseFloat(data.h || '0'),
          low24h: parseFloat(data.l || '0'),
          volume: parseFloat(data.v || '0'),
          source: 'binance',
          timestamp: Number(data.E || Date.now()),
        });
      } catch (error) {
        console.error('Binance stream parse error:', error);
      }
    };

    ws.onclose = () => {
      this.onStatus('binance', 'disconnected');
      if (!this.destroyed) {
        const delay = Math.min(backoff, 30000);
        setTimeout(() => this.connectBinance(backoff * 2), delay);
      }
    };

    ws.onerror = () => ws.close();
  }

  private connectFinnhub(backoff = 1000) {
    if (this.destroyed) return;
    this.onStatus('finnhub', 'connecting');

    const symbols = getFinnhubSymbols();
    if (symbols.length === 0) return;

    const ws = new WebSocket(`${ENDPOINTS.FINNHUB_WS}?token=${API_KEYS.FINNHUB}`);
    this.finnhubWs = ws;

    ws.onopen = () => {
      this.onStatus('finnhub', 'connected');
      symbols.forEach(symbol => ws.send(JSON.stringify({ type: 'subscribe', symbol })));
    };

    ws.onmessage = event => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type !== 'trade' || !payload.data) return;

        payload.data.forEach((trade: any) => {
          const asset = marketAssets.find(item => item.symbol === trade.s);
          if (!asset) return;

          const price = Number(trade.p);
          const spread = price * 0.0002;

          this.emit({
            symbol: trade.s,
            price,
            bid: Number((price - spread / 2).toFixed(asset.decimals)),
            ask: Number((price + spread / 2).toFixed(asset.decimals)),
            change: 0,
            changePercent: 0,
            high24h: 0,
            low24h: 0,
            volume: Number(trade.v || 0),
            source: 'finnhub',
            timestamp: Number(trade.t || Date.now()),
          });
        });
      } catch (error) {
        console.error('Finnhub stream parse error:', error);
      }
    };

    ws.onclose = () => {
      this.onStatus('finnhub', 'disconnected');
      if (!this.destroyed) {
        const delay = Math.min(backoff, 30000);
        setTimeout(() => this.connectFinnhub(backoff * 2), delay);
      }
    };

    ws.onerror = () => ws.close();
  }

  private async connectOanda(backoff = 1000) {
    if (this.destroyed) return;
    this.onStatus('oanda', 'connecting');

    const instruments = getOandaInstruments();
    if (instruments.length === 0) return;

    this.oandaAbort = new AbortController();
    let lastHeartbeat = Date.now();
    let timedOut = false;

    const heartbeatCheck = setInterval(() => {
      if (Date.now() - lastHeartbeat > 15000) {
        timedOut = true;
        this.onStatus('oanda', 'disconnected');
        this.oandaAbort?.abort();
      }
    }, 5000);

    try {
      const url = `${ENDPOINTS.OANDA_STREAM}/accounts/${API_KEYS.OANDA_ACCOUNT_ID}/pricing/stream?instruments=${instruments.join(',')}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_KEYS.OANDA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: this.oandaAbort.signal,
      });

      if (!response.ok) throw new Error(`OANDA ${response.status}`);
      if (!response.body) throw new Error('OANDA stream body missing');

      this.onStatus('oanda', 'connected');
      lastHeartbeat = Date.now();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!this.destroyed) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            if (data.type === 'HEARTBEAT') {
              lastHeartbeat = Date.now();
              this.onStatus('oanda', 'connected');
              continue;
            }

            if (data.type !== 'PRICE') continue;

            lastHeartbeat = Date.now();
            const symbol = fromOandaInstrument(data.instrument);
            const asset = marketAssets.find(item => item.symbol === symbol);
            if (!asset) continue;

            const bid = parseFloat(data.bids?.[0]?.price || '0');
            const ask = parseFloat(data.asks?.[0]?.price || '0');
            const price = (bid + ask) / 2;

            this.emit({
              symbol,
              bid: Number(bid.toFixed(asset.decimals)),
              ask: Number(ask.toFixed(asset.decimals)),
              price: Number(price.toFixed(asset.decimals)),
              change: 0,
              changePercent: 0,
              high24h: 0,
              low24h: 0,
              volume: 0,
              source: 'oanda',
              timestamp: new Date(data.time).getTime(),
            });
          } catch (error) {
            console.error('OANDA stream parse error:', error);
          }
        }
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError' || !timedOut) {
        console.error('OANDA stream error:', error);
      }
      this.onStatus('oanda', 'disconnected');
    } finally {
      clearInterval(heartbeatCheck);
    }

    if (!this.destroyed) {
      const delay = Math.min(backoff, 30000);
      setTimeout(() => this.connectOanda(backoff * 2), delay);
    }
  }

  private startSimulation() {
    const simulatedAssets = marketAssets.filter(asset => asset.market === 'commodities' || asset.market === 'indices');

    simulatedAssets.forEach(asset => {
      this.simPrices[asset.symbol] = this.simPrices[asset.symbol] || asset.basePrice;
    });

    this.simInterval = setInterval(() => {
      simulatedAssets.forEach(asset => {
        const current = this.simPrices[asset.symbol] || asset.basePrice;
        const volatility = asset.market === 'commodities' ? 0.0002 : 0.00025;
        const nextPrice = Number((current * (1 + (Math.random() - 0.5) * 2 * volatility)).toFixed(asset.decimals));
        const spread = nextPrice * (asset.market === 'commodities' ? 0.0003 : 0.0002);

        this.simPrices[asset.symbol] = nextPrice;

        this.emit({
          symbol: asset.symbol,
          bid: Number((nextPrice - spread / 2).toFixed(asset.decimals)),
          ask: Number((nextPrice + spread / 2).toFixed(asset.decimals)),
          price: nextPrice,
          change: 0,
          changePercent: 0,
          high24h: 0,
          low24h: 0,
          volume: 0,
          source: 'simulation',
          timestamp: Date.now(),
        });
      });
    }, 1000);
  }
}
