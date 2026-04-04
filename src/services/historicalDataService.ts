// Historical candle data service — 5 years of data per asset
import { API_KEYS, ENDPOINTS } from '@/config/apiKeys';
import { marketAssets, type MarketAsset } from './marketData';
import type { CandleData } from './marketDataService';

const FIVE_YEARS_MS = 5 * 365.25 * 24 * 3600 * 1000;

// In-memory cache to avoid re-fetching
const cache = new Map<string, CandleData[]>();

// Track errors per symbol for UI
const errorMap = new Map<string, string>();
export function getHistoryError(symbol: string): string | undefined {
  return errorMap.get(symbol);
}

// Retry with exponential backoff
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok) return resp;
      if (resp.status === 429 && i < retries - 1) {
        console.warn(`Rate limited, retrying in ${Math.pow(2, i + 1)}s...`);
        await new Promise(r => setTimeout(r, Math.pow(2, i + 1) * 1000));
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

  let startTime = start;
  while (startTime < now) {
    const url = `${ENDPOINTS.BINANCE_REST}/klines?symbol=${binanceSymbol}&interval=${interval}&startTime=${startTime}&limit=1000`;
    console.log(`[Binance] Fetching candles: ${binanceSymbol}, from=${new Date(startTime).toISOString()}`);
    try {
      const resp = await fetchWithRetry(url);
      const data: any[] = await resp.json();
      console.log(`[Binance] ${binanceSymbol}: received ${data.length} candles`);
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
    } catch (e: any) {
      console.error(`[Binance] candles error (${binanceSymbol}):`, e?.message);
      errorMap.set(binanceSymbol, `Binance: ${e?.message}`);
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

  console.log(`[Finnhub] Fetching candles: ${symbol}`);
  try {
    const resp = await fetchWithRetry(url);
    const data = await resp.json();
    console.log(`[Finnhub] ${symbol}: status=${data.s}, candles=${data.t?.length || 0}`);
    
    if (data.s === 'no_data' || !data.t) {
      console.warn(`[Finnhub] No data for ${symbol}`);
      errorMap.set(symbol, `Finnhub: нет данных для ${symbol}`);
      return [];
    }
    if (data.s !== 'ok') {
      errorMap.set(symbol, `Finnhub: ${data.s || 'unknown error'}`);
      return [];
    }

    return data.t.map((t: number, i: number) => ({
      time: t,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch (e: any) {
    console.error(`[Finnhub] candles error (${symbol}):`, e?.message);
    errorMap.set(symbol, `Finnhub: ${e?.message}`);
    // Fallback to Twelve Data
    return fetchTwelveDataCandles(symbol);
  }
}

// ════════════════════════════════════════
// TWELVE DATA — Fallback for stocks
// ════════════════════════════════════════
async function fetchTwelveDataCandles(symbol: string): Promise<CandleData[]> {
  const url = `${ENDPOINTS.TWELVE_DATA}/time_series?symbol=${symbol}&interval=1day&outputsize=5000&apikey=${API_KEYS.TWELVE_DATA}`;
  console.log(`[TwelveData] Fallback fetch: ${symbol}`);
  try {
    const resp = await fetchWithRetry(url);
    const data = await resp.json();
    if (data.status === 'error' || !data.values) {
      console.warn(`[TwelveData] Error for ${symbol}:`, data.message);
      errorMap.set(symbol, `TwelveData: ${data.message || 'нет данных'}`);
      return [];
    }
    console.log(`[TwelveData] ${symbol}: received ${data.values.length} candles`);
    errorMap.delete(symbol); // Clear error on success
    return data.values
      .map((v: any) => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || '0'),
      }))
      .sort((a: CandleData, b: CandleData) => a.time - b.time);
  } catch (e: any) {
    console.error(`[TwelveData] error (${symbol}):`, e?.message);
    errorMap.set(symbol, `TwelveData: ${e?.message}`);
    return [];
  }
}

// ════════════════════════════════════════
// OANDA — Forex candles
// ════════════════════════════════════════
async function fetchOandaCandles(instrument: string): Promise<CandleData[]> {
  const from = new Date(Date.now() - FIVE_YEARS_MS).toISOString();
  const url = `${ENDPOINTS.OANDA_REST}/instruments/${instrument}/candles?granularity=D&from=${from}&count=5000`;

  console.log(`[OANDA] Fetching candles: ${instrument}`);
  try {
    const resp = await fetchWithRetry(url, {
      headers: { 'Authorization': `Bearer ${API_KEYS.OANDA_TOKEN}` },
    });
    const data = await resp.json();
    if (!data.candles) {
      console.warn('[OANDA] candles response:', data);
      errorMap.set(instrument, `OANDA: ${data.errorMessage || 'нет данных'}`);
      return [];
    }
    console.log(`[OANDA] ${instrument}: received ${data.candles.length} candles`);
    errorMap.delete(instrument);
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
  } catch (e: any) {
    console.error(`[OANDA] candles error (${instrument}):`, e?.message);
    errorMap.set(instrument, `OANDA: ${e?.message}`);
    return [];
  }
}

// ════════════════════════════════════════
// ALPHA VANTAGE — Commodities
// ════════════════════════════════════════
async function fetchAlphaVantageCandles(symbol: string): Promise<CandleData[]> {
  let fn = 'TIME_SERIES_DAILY';

  if (symbol === 'XAUUSD' || symbol === 'XAGUSD') {
    fn = 'FX_DAILY';
  }

  let url: string;
  if (fn === 'FX_DAILY') {
    const from = symbol.slice(0, 3);
    const to = symbol.slice(3);
    url = `${ENDPOINTS.ALPHA_VANTAGE}?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&outputsize=full&apikey=${API_KEYS.ALPHA_VANTAGE}`;
  } else {
    url = `${ENDPOINTS.ALPHA_VANTAGE}?function=${fn}&symbol=${symbol}&outputsize=full&apikey=${API_KEYS.ALPHA_VANTAGE}`;
  }

  console.log(`[AlphaVantage] Fetching: ${symbol}`);
  try {
    const resp = await fetchWithRetry(url);
    const data = await resp.json();

    if (data.Note || data['Error Message']) {
      const msg = data.Note || data['Error Message'];
      console.warn('[AlphaVantage] limit:', msg);
      errorMap.set(symbol, `AlphaVantage: лимит запросов исчерпан`);
      return [];
    }

    const tsKey = fn === 'FX_DAILY' ? 'Time Series FX (Daily)' : 'Time Series (Daily)';
    const ts = data[tsKey];
    if (!ts) {
      errorMap.set(symbol, `AlphaVantage: нет данных`);
      return [];
    }

    const cutoff = Date.now() - FIVE_YEARS_MS;
    console.log(`[AlphaVantage] ${symbol}: received ${Object.keys(ts).length} entries`);
    errorMap.delete(symbol);
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
  } catch (e: any) {
    console.error(`[AlphaVantage] error (${symbol}):`, e?.message);
    errorMap.set(symbol, `AlphaVantage: ${e?.message}`);
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
  if (!asset) {
    errorMap.set(symbol, `Неизвестный инструмент: ${symbol}`);
    return [];
  }

  let candles: CandleData[] = [];
  errorMap.delete(symbol);

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
      candles = generateSyntheticCandles(asset);
      break;
  }

  // If primary source failed, try synthetic as last resort
  if (candles.length === 0 && asset.market !== 'indices') {
    console.warn(`[HistoricalData] No data from API for ${symbol}, generating synthetic candles`);
    candles = generateSyntheticCandles(asset);
    if (!errorMap.has(symbol)) {
      errorMap.set(symbol, 'Используются синтетические данные');
    }
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
  let price = asset.basePrice * 0.7;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
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
  errorMap.clear();
}
