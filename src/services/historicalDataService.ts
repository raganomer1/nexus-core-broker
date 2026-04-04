import { API_KEYS, ENDPOINTS } from '@/config/apiKeys';
import { marketAssets, type MarketAsset } from './marketData';
import { toOandaInstrument } from './marketDataService';
import type { CandleData } from './marketDataService';

const FIVE_YEARS_MS = 5 * 365.25 * 24 * 3600 * 1000;

export type CandleInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

const LOOKBACK_MS: Record<CandleInterval, number> = {
  '1m': 2 * 24 * 3600 * 1000,
  '5m': 7 * 24 * 3600 * 1000,
  '15m': 30 * 24 * 3600 * 1000,
  '30m': 60 * 24 * 3600 * 1000,
  '1h': 180 * 24 * 3600 * 1000,
  '4h': 365 * 24 * 3600 * 1000,
  '1d': FIVE_YEARS_MS,
  '1w': FIVE_YEARS_MS,
};

const BINANCE_INTERVALS: Record<CandleInterval, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1w': '1w',
};

const FINNHUB_RESOLUTIONS: Record<CandleInterval, string> = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '30m': '30',
  '1h': '60',
  '4h': '240',
  '1d': 'D',
  '1w': 'W',
};

const OANDA_GRANULARITIES: Record<CandleInterval, string> = {
  '1m': 'M1',
  '5m': 'M5',
  '15m': 'M15',
  '30m': 'M30',
  '1h': 'H1',
  '4h': 'H4',
  '1d': 'D',
  '1w': 'W',
};

const TWELVE_DATA_INTERVALS: Record<CandleInterval, string> = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1h': '1h',
  '4h': '4h',
  '1d': '1day',
  '1w': '1week',
};

const cache = new Map<string, CandleData[]>();
const pendingRequests = new Map<string, Promise<CandleData[]>>();
const errorMap = new Map<string, string>();
let finnhubQueue = Promise.resolve();

export function getHistoryError(symbol: string): string | undefined {
  return errorMap.get(symbol);
}

async function fetchWithRetry(provider: string, url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[${provider}] URL: ${url}`);
      const response = await fetch(url, options);
      console.log(`[${provider}] Status: ${response.status}`);
      if (response.ok) return response;

      const text = await response.text();
      const message = `${response.status} ${text || response.statusText}`.trim();
      if (response.status === 429 && attempt < retries - 1) {
        const delay = Math.pow(2, attempt + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(message);
    } catch (error: any) {
      console.error(`[${provider}] request failed`, { url, attempt: attempt + 1, error: error?.message || error });
      if (attempt === retries - 1) throw error;
      const delay = Math.pow(2, attempt + 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${provider}: Max retries exceeded`);
}

async function queueFinnhubRequest<T>(request: () => Promise<T>): Promise<T> {
  const previous = finnhubQueue;
  let release = () => {};
  finnhubQueue = new Promise<void>(resolve => {
    release = resolve;
  });

  await previous;
  try {
    return await request();
  } finally {
    setTimeout(release, 1000);
  }
}

function normalizeCandles(candles: CandleData[]): CandleData[] {
  const unique = new Map<number, CandleData>();
  candles.forEach(candle => unique.set(candle.time, candle));
  return [...unique.values()].sort((a, b) => a.time - b.time);
}

function aggregateWeekly(candles: CandleData[]): CandleData[] {
  const weeks = new Map<number, CandleData>();

  candles.forEach(candle => {
    const date = new Date(candle.time * 1000);
    const dayOffset = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - dayOffset);
    date.setUTCHours(0, 0, 0, 0);
    const weekStart = Math.floor(date.getTime() / 1000);

    const existing = weeks.get(weekStart);
    if (!existing) {
      weeks.set(weekStart, { ...candle, time: weekStart });
      return;
    }

    existing.high = Math.max(existing.high, candle.high);
    existing.low = Math.min(existing.low, candle.low);
    existing.close = candle.close;
    existing.volume += candle.volume;
  });

  return normalizeCandles([...weeks.values()]);
}

async function fetchBinanceCandles(symbol: string, binanceSymbol: string, interval: CandleInterval): Promise<CandleData[]> {
  const now = Date.now();
  let startTime = now - LOOKBACK_MS[interval];
  const candles: CandleData[] = [];

  while (startTime < now) {
    const url = `${ENDPOINTS.BINANCE_REST}/klines?symbol=${binanceSymbol}&interval=${BINANCE_INTERVALS[interval]}&startTime=${startTime}&limit=1000`;
    const response = await fetchWithRetry('Binance', url);
    const data: any[] = await response.json();
    console.log(`[Binance] ${symbol} candles: ${data.length}`);
    if (data.length === 0) break;

    candles.push(...data.map(item => ({
      time: Math.floor(item[0] / 1000),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    })));

    startTime = Number(data[data.length - 1][0]) + 1;
    if (data.length < 1000) break;
  }

  return normalizeCandles(candles);
}

async function fetchFinnhubCandles(symbol: string, interval: CandleInterval): Promise<CandleData[]> {
  return queueFinnhubRequest(async () => {
    const now = Math.floor(Date.now() / 1000);
    const from = Math.floor((Date.now() - LOOKBACK_MS[interval]) / 1000);
    const url = `${ENDPOINTS.FINNHUB_REST}/stock/candle?symbol=${symbol}&resolution=${FINNHUB_RESOLUTIONS[interval]}&from=${from}&to=${now}&token=${API_KEYS.FINNHUB}`;
    const response = await fetchWithRetry('Finnhub', url);
    const data = await response.json();

    console.log(`[Finnhub] ${symbol} API=${data.s} candles=${data.t?.length || 0}`);

    if (data.s !== 'ok' || !Array.isArray(data.t) || data.t.length === 0) {
      throw new Error(data.s === 'no_data' ? 'Finnhub: нет исторических данных' : `Finnhub: ${data.s || 'unknown error'}`);
    }

    return normalizeCandles(data.t.map((time: number, index: number) => ({
      time,
      open: Number(data.o[index]),
      high: Number(data.h[index]),
      low: Number(data.l[index]),
      close: Number(data.c[index]),
      volume: Number(data.v[index] || 0),
    })));
  });
}

async function fetchTwelveDataCandles(symbol: string, interval: CandleInterval): Promise<CandleData[]> {
  const url = `${ENDPOINTS.TWELVE_DATA}/time_series?symbol=${symbol}&interval=${TWELVE_DATA_INTERVALS[interval]}&outputsize=${interval === '1d' || interval === '1w' ? 5000 : 2000}&apikey=${API_KEYS.TWELVE_DATA}`;
  const response = await fetchWithRetry('TwelveData', url);
  const data = await response.json();

  if (data.status === 'error' || !Array.isArray(data.values)) {
    throw new Error(`TwelveData: ${data.message || 'нет данных'}`);
  }

  const candles = normalizeCandles(data.values.map((item: any) => ({
    time: Math.floor(new Date(item.datetime).getTime() / 1000),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseFloat(item.volume || '0'),
  })));

  console.log(`[TwelveData] ${symbol} candles=${candles.length}`);
  return candles;
}

async function fetchOandaCandles(symbol: string, interval: CandleInterval): Promise<CandleData[]> {
  const instrument = toOandaInstrument(symbol);
  const from = encodeURIComponent(new Date(Date.now() - LOOKBACK_MS[interval]).toISOString());
  const url = `${ENDPOINTS.OANDA_REST}/instruments/${instrument}/candles?price=M&granularity=${OANDA_GRANULARITIES[interval]}&from=${from}&count=5000`;
  const response = await fetchWithRetry('OANDA', url, {
    headers: {
      Authorization: `Bearer ${API_KEYS.OANDA_TOKEN}`,
    },
  });
  const data = await response.json();

  if (!Array.isArray(data.candles) || data.candles.length === 0) {
    throw new Error(`OANDA: ${data.errorMessage || 'нет исторических данных'}`);
  }

  const candles = normalizeCandles(data.candles.filter((item: any) => item.complete !== false).map((item: any) => ({
    time: Math.floor(new Date(item.time).getTime() / 1000),
    open: parseFloat(item.mid.o),
    high: parseFloat(item.mid.h),
    low: parseFloat(item.mid.l),
    close: parseFloat(item.mid.c),
    volume: Number(item.volume || 0),
  })));

  console.log(`[OANDA] ${symbol} candles=${candles.length}`);
  return candles;
}

async function fetchAlphaVantageCandles(symbol: string, interval: CandleInterval): Promise<CandleData[]> {
  if (interval !== '1d' && interval !== '1w') {
    throw new Error('AlphaVantage: для этого таймфрейма реальная история недоступна');
  }

  const isFx = symbol === 'XAUUSD' || symbol === 'XAGUSD';
  const url = isFx
    ? `${ENDPOINTS.ALPHA_VANTAGE}?function=FX_DAILY&from_symbol=${symbol.slice(0, 3)}&to_symbol=${symbol.slice(3)}&outputsize=full&apikey=${API_KEYS.ALPHA_VANTAGE}`
    : `${ENDPOINTS.ALPHA_VANTAGE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEYS.ALPHA_VANTAGE}`;

  const response = await fetchWithRetry('AlphaVantage', url);
  const data = await response.json();

  if (data.Note) throw new Error('AlphaVantage: лимит запросов исчерпан');

  const series = data[isFx ? 'Time Series FX (Daily)' : 'Time Series (Daily)'];
  if (!series) {
    throw new Error(`AlphaVantage: ${data['Error Message'] || 'нет данных'}`);
  }

  const candles = normalizeCandles(Object.entries(series).map(([date, values]: [string, any]) => ({
    time: Math.floor(new Date(date).getTime() / 1000),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseFloat(values['5. volume'] || '0'),
  })).filter(item => item.time * 1000 >= Date.now() - FIVE_YEARS_MS));

  return interval === '1w' ? aggregateWeekly(candles) : candles;
}

function generateSyntheticCandles(asset: MarketAsset, interval: CandleInterval): CandleData[] {
  const bucketMs = interval === '1w' ? 7 * 24 * 3600 * 1000 : interval === '1d' ? 24 * 3600 * 1000 : interval === '4h' ? 4 * 3600 * 1000 : interval === '1h' ? 3600 * 1000 : interval === '30m' ? 30 * 60 * 1000 : interval === '15m' ? 15 * 60 * 1000 : interval === '5m' ? 5 * 60 * 1000 : 60 * 1000;
  const count = Math.min(Math.floor(LOOKBACK_MS[interval] / bucketMs), 5000);
  const candles: CandleData[] = [];
  let price = asset.basePrice;

  for (let index = count; index >= 0; index--) {
    const time = Math.floor((Date.now() - index * bucketMs) / 1000);
    const volatility = asset.market === 'indices' ? 0.0009 : asset.market === 'commodities' ? 0.0007 : 0.0005;
    const open = price;
    const close = Number((price * (1 + (Math.random() - 0.5) * 2 * volatility)).toFixed(asset.decimals));
    const high = Number((Math.max(open, close) * (1 + Math.random() * volatility)).toFixed(asset.decimals));
    const low = Number((Math.min(open, close) * (1 - Math.random() * volatility)).toFixed(asset.decimals));
    price = close;

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.round(500 + Math.random() * 5000),
    });
  }

  return normalizeCandles(candles);
}

export async function fetchHistoricalCandles(symbol: string, interval: CandleInterval = '1d'): Promise<CandleData[]> {
  const cacheKey = `${symbol}_${interval}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey)!;

  const request = (async () => {
    const asset = marketAssets.find(item => item.symbol === symbol);
    if (!asset) {
      errorMap.set(symbol, `Неизвестный инструмент: ${symbol}`);
      return [];
    }

    errorMap.delete(symbol);

    try {
      let candles: CandleData[] = [];

      switch (asset.market) {
        case 'crypto':
          if (!asset.binanceSymbol) throw new Error('Binance symbol missing');
          candles = await fetchBinanceCandles(symbol, asset.binanceSymbol, interval);
          break;
        case 'stocks':
          try {
            candles = await fetchFinnhubCandles(symbol, interval);
          } catch (error: any) {
            console.error(`[HistoricalData] Finnhub failed for ${symbol}:`, error?.message || error);
            candles = await fetchTwelveDataCandles(symbol, interval);
            errorMap.set(symbol, error?.message || 'Finnhub unavailable, using TwelveData');
          }
          break;
        case 'forex':
          candles = await fetchOandaCandles(symbol, interval);
          break;
        case 'commodities':
          candles = await fetchAlphaVantageCandles(symbol, interval);
          break;
        case 'indices':
          candles = generateSyntheticCandles(asset, interval);
          errorMap.set(symbol, 'Для этого инструмента используются резервные свечи');
          break;
      }

      if (candles.length === 0) throw new Error(getHistoryError(symbol) || 'Нет исторических данных');

      cache.set(cacheKey, candles);
      console.log(`[HistoricalData] ${symbol} ${interval} candles=${candles.length}`);
      return candles;
    } catch (error: any) {
      const message = error?.message || 'Ошибка загрузки истории';
      console.error(`[HistoricalData] ${symbol} ${interval}:`, message);
      const fallback = generateSyntheticCandles(asset, interval);
      errorMap.set(symbol, `${message} — показаны резервные свечи`);
      cache.set(cacheKey, fallback);
      return fallback;
    }
  })();

  pendingRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

export function clearHistoryCache() {
  cache.clear();
  pendingRequests.clear();
  errorMap.clear();
}
