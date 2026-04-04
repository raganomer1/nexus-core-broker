// Historical candle data service — 5 years of data per asset
import { API_KEYS, ENDPOINTS } from '@/config/apiKeys';
import { marketAssets, type MarketAsset } from './marketData';
import type { CandleData } from './marketDataService';

const FIVE_YEARS_MS = 5 * 365.25 * 24 * 3600 * 1000;

// In-memory cache to avoid re-fetching
const cache = new Map<string, CandleData[]>();

// Retry with exponential backoff
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok) return resp;
      if (resp.status === 429 && i < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw new Error(`HTTP ${resp.status}`);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

// ════════════════════════════════════════
// BINANCE — Crypto klines
// ════════════════════════════════════════
async function fetchBinanceCandles(binanceSymbol: string, interval: string = '1d'): Promise<CandleData[]> {
  const now = Date.now();
  const start = now - FIVE_YEARS_MS;
  const allCandles: CandleData[] = [];

  // Binance max 1000 per request; 5 years daily ~ 1825, need 2 requests
  let startTime = start;
  while (startTime < now) {
    const url = `${ENDPOINTS.BINANCE_REST}/klines?symbol=${binanceSymbol}&interval=${interval}&startTime=${startTime}&limit=1000`;
    try {
      const resp = await fetchWithRetry(url);
      const data: any[] = await resp.json();
      if (data.length === 0) break;
      for (const k of data) {
        allCandles.push({
          time: Math.floor(k[0] / 1000),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        });
      }
      startTime = data[data.length - 1][0] + 1;
      if (data.length < 1000) break;
    } catch (e) {
      console.error(`Binance candles error (${binanceSymbol}):`, e);
      break;
    }
  }
  return allCandles;
}

// ════════════════════════════════════════
// FINNHUB — Stock candles
// ════════════════════════════════════════
async function fetchFinnhubCandles(symbol: string): Promise<CandleData[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = Math.floor((Date.now() - FIVE_YEARS_MS) / 1000);
  const url = `${ENDPOINTS.FINNHUB_REST}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${API_KEYS.FINNHUB}`;

  try {
    const resp = await fetchWithRetry(url);
    const data = await resp.json();
    if (data.s !== 'ok' || !data.t) return [];

    return data.t.map((t: number, i: number) => ({
      time: t,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch (e) {
    console.error(`Finnhub candles error (${symbol}):`, e);
    return [];
  }
}

// ════════════════════════════════════════
// OANDA — Forex candles
// ════════════════════════════════════════
async function fetchOandaCandles(instrument: string): Promise<CandleData[]> {
  // OANDA max 5000 candles; 5 years daily ≈ 1825 — one request
  const from = new Date(Date.now() - FIVE_YEARS_MS).toISOString();
  const url = `${ENDPOINTS.OANDA_REST}/instruments/${instrument}/candles?granularity=D&from=${from}&count=5000`;

  try {
    const resp = await fetchWithRetry(url, {
      headers: { 'Authorization': `Bearer ${API_KEYS.OANDA_TOKEN}` },
    });
    const data = await resp.json();
    if (!data.candles) {
      console.warn('OANDA candles response:', data);
      return [];
    }
    return data.candles
      .filter((c: any) => c.complete !== false)
      .map((c: any) => ({
        time: Math.floor(new Date(c.time).getTime() / 1000),
        open: parseFloat(c.mid.o),
        high: parseFloat(c.mid.h),
        low: parseFloat(c.mid.l),
        close: parseFloat(c.mid.c),
        volume: c.volume || 0,
      }));
  } catch (e) {
    console.error(`OANDA candles error (${instrument}):`, e);
    return [];
  }
}

// ════════════════════════════════════════
// ALPHA VANTAGE — Commodities
// ════════════════════════════════════════
async function fetchAlphaVantageCandles(symbol: string): Promise<CandleData[]> {
  // Map commodity symbols
  let avSymbol = symbol;
  let fn = 'TIME_SERIES_DAILY';

  // For gold/silver, Alpha Vantage doesn't have them as regular stocks
  // Use forex-like approach
  if (symbol === 'XAUUSD') { avSymbol = 'XAUUSD'; fn = 'FX_DAILY'; }
  else if (symbol === 'XAGUSD') { avSymbol = 'XAGUSD'; fn = 'FX_DAILY'; }

  let url: string;
  if (fn === 'FX_DAILY') {
    const from = symbol.slice(0, 3);
    const to = symbol.slice(3);
    url = `${ENDPOINTS.ALPHA_VANTAGE}?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&outputsize=full&apikey=${API_KEYS.ALPHA_VANTAGE}`;
  } else {
    url = `${ENDPOINTS.ALPHA_VANTAGE}?function=${fn}&symbol=${avSymbol}&outputsize=full&apikey=${API_KEYS.ALPHA_VANTAGE}`;
  }

  try {
    const resp = await fetchWithRetry(url);
    const data = await resp.json();

    // Check for rate limit
    if (data.Note || data['Error Message']) {
      console.warn('Alpha Vantage limit:', data.Note || data['Error Message']);
      return [];
    }

    const tsKey = fn === 'FX_DAILY' ? 'Time Series FX (Daily)' : 'Time Series (Daily)';
    const ts = data[tsKey];
    if (!ts) return [];

    const cutoff = Date.now() - FIVE_YEARS_MS;
    return Object.entries(ts)
      .map(([date, vals]: [string, any]) => ({
        time: Math.floor(new Date(date).getTime() / 1000),
        open: parseFloat(vals['1. open']),
        high: parseFloat(vals['2. high']),
        low: parseFloat(vals['3. low']),
        close: parseFloat(vals['4. close']),
        volume: parseFloat(vals['5. volume'] || '0'),
      }))
      .filter(c => c.time * 1000 > cutoff)
      .sort((a, b) => a.time - b.time);
  } catch (e) {
    console.error(`Alpha Vantage error (${symbol}):`, e);
    return [];
  }
}

// ════════════════════════════════════════
// UNIFIED FETCH — auto-routes by asset type
// ════════════════════════════════════════
export async function fetchHistoricalCandles(symbol: string): Promise<CandleData[]> {
  // Check cache
  const cacheKey = `${symbol}_D`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const asset = marketAssets.find(a => a.symbol === symbol);
  if (!asset) return [];

  let candles: CandleData[] = [];

  switch (asset.market) {
    case 'crypto':
      if (asset.binanceSymbol) {
        candles = await fetchBinanceCandles(asset.binanceSymbol, '1d');
      }
      break;
    case 'stocks':
      candles = await fetchFinnhubCandles(symbol);
      break;
    case 'forex': {
      const instrument = symbol.length === 6 ? symbol.slice(0, 3) + '_' + symbol.slice(3) : symbol;
      candles = await fetchOandaCandles(instrument);
      break;
    }
    case 'commodities':
      candles = await fetchAlphaVantageCandles(symbol);
      break;
    case 'indices':
      // No free API for indices history — generate synthetic data
      candles = generateSyntheticCandles(asset);
      break;
  }

  if (candles.length > 0) {
    cache.set(cacheKey, candles);
  }
  return candles;
}

// Generate synthetic candles for assets without historical API
function generateSyntheticCandles(asset: MarketAsset): CandleData[] {
  const candles: CandleData[] = [];
  const days = 365 * 5;
  let price = asset.basePrice * 0.7; // Start lower

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = 0.015;
    const drift = 0.0002;
    const change = drift + (Math.random() - 0.5) * 2 * volatility;
    const open = price;
    const close = Number((price * (1 + change)).toFixed(asset.decimals));
    const high = Number((Math.max(open, close) * (1 + Math.random() * volatility * 0.5)).toFixed(asset.decimals));
    const low = Number((Math.min(open, close) * (1 - Math.random() * volatility * 0.5)).toFixed(asset.decimals));
    price = close;

    candles.push({
      time: Math.floor(date.getTime() / 1000),
      open, high, low, close,
      volume: Math.floor(Math.random() * 1000000),
    });
  }
  return candles;
}

// Clear cache
export function clearHistoryCache() {
  cache.clear();
}
