// API Keys Configuration
// This file contains API keys for market data providers

export const API_KEYS = {
  // OANDA v20 — Forex real-time prices (free demo account)
  OANDA_TOKEN: '8bbb3fa9f257da546568901da619c741-2b65f7413a78929c4f1fc3076fe721de',
  OANDA_ACCOUNT_ID: '101-001-38980825-001',

  // Finnhub — US Stocks real-time prices (free tier: 60 req/min)
  FINNHUB: 'd78hah9r01qsbhvtsjv0d78hah9r01qsbhvtsjvg',

  // Alpha Vantage — Commodities historical data (free tier: 25 req/day)
  ALPHA_VANTAGE: 'E0QI1NRYDIPJT1GV',

  // Twelve Data — Backup/fallback API (free tier: 800 req/day)
  TWELVE_DATA: '2d7592979b8b4061b26a0b302b03497c',
};

// API Endpoints
export const ENDPOINTS = {
  // Forex — OANDA v20 (market maker, direct prices)
  OANDA_REST: 'https://api-fxpractice.oanda.com/v3',
  OANDA_STREAM: 'https://stream-fxpractice.oanda.com/v3',
  // Stocks — Finnhub
  FINNHUB_REST: 'https://finnhub.io/api/v1',
  FINNHUB_WS: 'wss://ws.finnhub.io',
  // Crypto — Binance (no key needed)
  BINANCE_REST: 'https://api.binance.com/api/v3',
  BINANCE_WS: 'wss://stream.binance.com:9443/ws',
  // Commodities — Alpha Vantage
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  // Backup — Twelve Data
  TWELVE_DATA: 'https://api.twelvedata.com',
};

// API Routing — which provider to use for each asset type
export const API_ROUTING = {
  crypto: 'binance',
  stock: 'finnhub',
  forex: 'oanda',
  commodity: 'alpha_vantage',
};
