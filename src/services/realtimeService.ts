// Real-time price streaming service
// Binance WS (crypto) + Finnhub WS (stocks) + OANDA HTTP Stream (forex) + simulation (commodities/indices)
import { API_KEYS, ENDPOINTS } from '@/config/apiKeys';
import { marketAssets, type MarketAsset } from './marketData';
import { getOandaInstruments, fromOandaInstrument, getBinanceStreams, getFinnhubSymbols } from './marketDataService';

export type PriceUpdate = {
  symbol: string; // internal symbol e.g. BTCUSD, EURUSD, AAPL
  bid: number;
  ask: number;
  price: number; // mid
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  source: string;
};

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

type StatusCallback = (provider: string, status: ConnectionStatus) => void;
type PriceCallback = (update: PriceUpdate) => void;

// Throttle helper: max 1 call per interval per key
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

// Map Binance symbol to internal: BTCUSDT -> BTCUSD
function binanceToInternal(binSym: string): string | undefined {
  const asset = marketAssets.find(a => a.binanceSymbol === binSym);
  return asset?.symbol;
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

  // Cached prices for localStorage
  private latestPrices: Record<string, PriceUpdate> = {};

  constructor(onPrice: PriceCallback, onStatus: StatusCallback) {
    this.onPrice = onPrice;
    this.onStatus = onStatus;

    // Load cached prices
    try {
      const cached = localStorage.getItem('rt_prices');
      if (cached) this.latestPrices = JSON.parse(cached);
    } catch {}
  }

  start() {
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

    // Save prices to cache
    try {
      localStorage.setItem('rt_prices', JSON.stringify(this.latestPrices));
    } catch {}
  }

  private emit(update: PriceUpdate) {
    this.latestPrices[update.symbol] = update;
    this.throttle(update.symbol, () => this.onPrice(update));
  }

  // ════════════════════════════════════════
  // BINANCE WebSocket (crypto)
  // ════════════════════════════════════════
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

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.s || !data.c) return;
        const sym = binanceToInternal(data.s);
        if (!sym) return;
        const price = parseFloat(data.c);
        const asset = marketAssets.find(a => a.symbol === sym);
        if (!asset) return;
        // Binance doesn't give bid/ask for spot, approximate with tiny spread
        const spread = price * 0.0001;
        this.emit({
          symbol: sym,
          price,
          bid: Number((price - spread / 2).toFixed(asset.decimals)),
          ask: Number((price + spread / 2).toFixed(asset.decimals)),
          change: 0,
          changePercent: parseFloat(data.P || '0'),
          high24h: parseFloat(data.h || '0'),
          low24h: parseFloat(data.l || '0'),
          volume: parseFloat(data.v || '0'),
          source: 'binance',
        });
      } catch {}
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

  // ════════════════════════════════════════
  // FINNHUB WebSocket (stocks)
  // ════════════════════════════════════════
  private connectFinnhub(backoff = 1000) {
    if (this.destroyed) return;
    this.onStatus('finnhub', 'connecting');

    const symbols = getFinnhubSymbols();
    if (symbols.length === 0) return;

    const ws = new WebSocket(`${ENDPOINTS.FINNHUB_WS}?token=${API_KEYS.FINNHUB}`);
    this.finnhubWs = ws;

    ws.onopen = () => {
      this.onStatus('finnhub', 'connected');
      symbols.forEach(s => ws.send(JSON.stringify({ type: 'subscribe', symbol: s })));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type !== 'trade' || !data.data) return;
        for (const t of data.data) {
          const sym = t.s as string;
          const asset = marketAssets.find(a => a.symbol === sym);
          if (!asset) continue;
          const price = t.p as number;
          const spread = price * 0.0002;
          this.emit({
            symbol: sym,
            price,
            bid: Number((price - spread / 2).toFixed(asset.decimals)),
            ask: Number((price + spread / 2).toFixed(asset.decimals)),
            change: 0,
            changePercent: 0,
            high24h: 0,
            low24h: 0,
            volume: t.v || 0,
            source: 'finnhub',
          });
        }
      } catch {}
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

  // ════════════════════════════════════════
  // OANDA HTTP Streaming (forex)
  // ════════════════════════════════════════
  private async connectOanda(backoff = 1000) {
    if (this.destroyed) return;
    this.onStatus('oanda', 'connecting');

    const instruments = getOandaInstruments();
    if (instruments.length === 0) return;

    this.oandaAbort = new AbortController();
    let lastHeartbeat = Date.now();

    // Heartbeat monitor
    const hbCheck = setInterval(() => {
      if (Date.now() - lastHeartbeat > 15000) {
        this.onStatus('oanda', 'disconnected');
      }
    }, 5000);

    try {
      const url = `${ENDPOINTS.OANDA_STREAM}/accounts/${API_KEYS.OANDA_ACCOUNT_ID}/pricing/stream?instruments=${instruments.join(',')}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_KEYS.OANDA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: this.oandaAbort.signal,
      });

      if (!response.ok) throw new Error(`OANDA ${response.status}`);
      this.onStatus('oanda', 'connected');
      lastHeartbeat = Date.now();

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (!this.destroyed) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'HEARTBEAT') {
              lastHeartbeat = Date.now();
              this.onStatus('oanda', 'connected');
              continue;
            }
            if (data.type === 'PRICE') {
              lastHeartbeat = Date.now();
              const internalSym = fromOandaInstrument(data.instrument);
              const asset = marketAssets.find(a => a.symbol === internalSym);
              if (!asset) continue;
              const bid = parseFloat(data.bids[0].price);
              const ask = parseFloat(data.asks[0].price);
              const mid = (bid + ask) / 2;
              this.emit({
                symbol: internalSym,
                price: Number(mid.toFixed(asset.decimals)),
                bid: Number(bid.toFixed(asset.decimals)),
                ask: Number(ask.toFixed(asset.decimals)),
                change: 0,
                changePercent: 0,
                high24h: 0,
                low24h: 0,
                volume: 0,
                source: 'oanda',
              });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error('OANDA stream error:', e);
      this.onStatus('oanda', 'disconnected');
    } finally {
      clearInterval(hbCheck);
    }

    // Reconnect
    if (!this.destroyed) {
      const delay = Math.min(backoff, 30000);
      setTimeout(() => this.connectOanda(backoff * 2), delay);
    }
  }

  // ════════════════════════════════════════
  // Simulation (commodities, indices, forex fallback)
  // ════════════════════════════════════════
  private startSimulation() {
    // Assets not covered by live feeds
    const simAssets = marketAssets.filter(a =>
      a.market === 'commodities' || a.market === 'indices'
    );

    // Init sim prices
    for (const a of simAssets) {
      this.simPrices[a.symbol] = a.basePrice;
    }

    this.simInterval = setInterval(() => {
      for (const a of simAssets) {
        const current = this.simPrices[a.symbol] || a.basePrice;
        const volatility = a.market === 'commodities' ? 0.0002 : 0.0002;
        const change = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = Number((current * (1 + change)).toFixed(a.decimals));
        this.simPrices[a.symbol] = newPrice;

        const spread = newPrice * (a.market === 'commodities' ? 0.0003 : 0.0002);
        this.emit({
          symbol: a.symbol,
          price: newPrice,
          bid: Number((newPrice - spread / 2).toFixed(a.decimals)),
          ask: Number((newPrice + spread / 2).toFixed(a.decimals)),
          change: 0,
          changePercent: 0,
          high24h: 0,
          low24h: 0,
          volume: 0,
          source: 'simulation',
        });
      }
    }, 3000);
  }

  getCachedPrices(): Record<string, PriceUpdate> {
    return { ...this.latestPrices };
  }
}
