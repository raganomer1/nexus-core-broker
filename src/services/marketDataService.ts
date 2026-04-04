// Unified market data service — routes to correct API per asset type
import { API_KEYS, ENDPOINTS, API_ROUTING } from '@/config/apiKeys';
import { marketAssets, type MarketAsset } from './marketData';

export interface MarketPrice {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  timestamp: number;
  source: 'binance' | 'finnhub' | 'oanda' | 'alpha_vantage' | 'simulation';
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Get the provider for a given asset
export function getProvider(asset: MarketAsset): string {
  if (asset.market === 'crypto') return API_ROUTING.crypto;
  if (asset.market === 'stocks') return API_ROUTING.stock;
  if (asset.market === 'forex') return API_ROUTING.forex;
  if (asset.market === 'commodities') return API_ROUTING.commodity;
  return 'simulation';
}

// OANDA instrument format: EUR_USD
export function toOandaInstrument(symbol: string): string {
  // EURUSD -> EUR_USD
  if (symbol.length === 6 && !symbol.includes('_')) {
    return symbol.slice(0, 3) + '_' + symbol.slice(3);
  }
  // XAUUSD -> XAU_USD
  if (symbol.length === 6 && symbol.startsWith('X')) {
    return symbol.slice(0, 3) + '_' + symbol.slice(3);
  }
  return symbol;
}

export function fromOandaInstrument(instrument: string): string {
  return instrument.replace('_', '');
}

// Get all forex symbols for OANDA streaming
export function getOandaInstruments(): string[] {
  return marketAssets
    .filter(a => a.market === 'forex')
    .map(a => toOandaInstrument(a.symbol));
}

// Get all stock symbols for Finnhub
export function getFinnhubSymbols(): string[] {
  return marketAssets
    .filter(a => a.market === 'stocks')
    .map(a => a.symbol);
}

// Get all crypto streams for Binance WS
export function getBinanceStreams(): string[] {
  return marketAssets
    .filter(a => a.market === 'crypto' && a.binanceSymbol)
    .map(a => `${a.binanceSymbol!.toLowerCase()}@ticker`);
}
