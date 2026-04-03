// Market data catalog with TradingView symbol mappings

export interface MarketAsset {
  id: string;
  symbol: string; // Internal symbol matching generatedAssets
  name: string;
  market: 'crypto' | 'forex' | 'stocks' | 'commodities' | 'indices';
  basePrice: number;
  decimals: number;
  lotSize: number;
  tvSymbol: string; // TradingView widget symbol
  binanceSymbol?: string; // Binance ticker for crypto
}

// Map internal symbols to TradingView symbols and Binance tickers
export const marketAssets: MarketAsset[] = [
  // === CRYPTO (Binance real prices) ===
  { id: 'btcusd', symbol: 'BTCUSD', name: 'Bitcoin', market: 'crypto', basePrice: 87250, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:BTCUSDT', binanceSymbol: 'BTCUSDT' },
  { id: 'ethusd', symbol: 'ETHUSD', name: 'Ethereum', market: 'crypto', basePrice: 3420, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:ETHUSDT', binanceSymbol: 'ETHUSDT' },
  { id: 'xrpusd', symbol: 'XRPUSD', name: 'Ripple', market: 'crypto', basePrice: 0.625, decimals: 4, lotSize: 1, tvSymbol: 'BINANCE:XRPUSDT', binanceSymbol: 'XRPUSDT' },
  { id: 'ltcusd', symbol: 'LTCUSD', name: 'Litecoin', market: 'crypto', basePrice: 85.5, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:LTCUSDT', binanceSymbol: 'LTCUSDT' },
  { id: 'adausd', symbol: 'ADAUSD', name: 'Cardano', market: 'crypto', basePrice: 0.452, decimals: 4, lotSize: 1, tvSymbol: 'BINANCE:ADAUSDT', binanceSymbol: 'ADAUSDT' },
  { id: 'solusd', symbol: 'SOLUSD', name: 'Solana', market: 'crypto', basePrice: 145.8, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:SOLUSDT', binanceSymbol: 'SOLUSDT' },
  { id: 'dotusd', symbol: 'DOTUSD', name: 'Polkadot', market: 'crypto', basePrice: 7.25, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:DOTUSDT', binanceSymbol: 'DOTUSDT' },
  { id: 'dogeusd', symbol: 'DOGEUSD', name: 'Dogecoin', market: 'crypto', basePrice: 0.1785, decimals: 4, lotSize: 1, tvSymbol: 'BINANCE:DOGEUSDT', binanceSymbol: 'DOGEUSDT' },
  { id: 'avaxusd', symbol: 'AVAXUSD', name: 'Avalanche', market: 'crypto', basePrice: 38.5, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:AVAXUSDT', binanceSymbol: 'AVAXUSDT' },
  { id: 'linkusd', symbol: 'LINKUSD', name: 'Chainlink', market: 'crypto', basePrice: 15.8, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:LINKUSDT', binanceSymbol: 'LINKUSDT' },
  { id: 'maticusd', symbol: 'MATICUSD', name: 'Polygon', market: 'crypto', basePrice: 0.585, decimals: 4, lotSize: 1, tvSymbol: 'BINANCE:POLUSDT', binanceSymbol: 'POLUSDT' },
  { id: 'uniusd', symbol: 'UNIUSD', name: 'Uniswap', market: 'crypto', basePrice: 8.25, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:UNIUSDT', binanceSymbol: 'UNIUSDT' },
  { id: 'atomusd', symbol: 'ATOMUSD', name: 'Cosmos', market: 'crypto', basePrice: 9.85, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:ATOMUSDT', binanceSymbol: 'ATOMUSDT' },
  { id: 'nearusd', symbol: 'NEARUSD', name: 'NEAR Protocol', market: 'crypto', basePrice: 5.42, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:NEARUSDT', binanceSymbol: 'NEARUSDT' },
  { id: 'aptusd', symbol: 'APTUSD', name: 'Aptos', market: 'crypto', basePrice: 9.15, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:APTUSDT', binanceSymbol: 'APTUSDT' },
  { id: 'arbusd', symbol: 'ARBUSD', name: 'Arbitrum', market: 'crypto', basePrice: 1.25, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:ARBUSDT', binanceSymbol: 'ARBUSDT' },
  { id: 'opusd', symbol: 'OPUSD', name: 'Optimism', market: 'crypto', basePrice: 2.35, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:OPUSDT', binanceSymbol: 'OPUSDT' },
  { id: 'filusd', symbol: 'FILUSD', name: 'Filecoin', market: 'crypto', basePrice: 5.85, decimals: 3, lotSize: 1, tvSymbol: 'BINANCE:FILUSDT', binanceSymbol: 'FILUSDT' },
  { id: 'injusd', symbol: 'INJUSD', name: 'Injective', market: 'crypto', basePrice: 25.5, decimals: 2, lotSize: 1, tvSymbol: 'BINANCE:INJUSDT', binanceSymbol: 'INJUSDT' },
  { id: 'tonusd', symbol: 'TONUSD', name: 'Toncoin', market: 'crypto', basePrice: 3.85, decimals: 3, lotSize: 1, tvSymbol: 'OKX:TONUSDT', binanceSymbol: 'TONUSDT' },

  // === FOREX ===
  { id: 'eurusd', symbol: 'EURUSD', name: 'EUR/USD', market: 'forex', basePrice: 1.08542, decimals: 5, lotSize: 100000, tvSymbol: 'FX:EURUSD' },
  { id: 'gbpusd', symbol: 'GBPUSD', name: 'GBP/USD', market: 'forex', basePrice: 1.2634, decimals: 5, lotSize: 100000, tvSymbol: 'FX:GBPUSD' },
  { id: 'usdjpy', symbol: 'USDJPY', name: 'USD/JPY', market: 'forex', basePrice: 151.234, decimals: 3, lotSize: 100000, tvSymbol: 'FX:USDJPY' },
  { id: 'usdchf', symbol: 'USDCHF', name: 'USD/CHF', market: 'forex', basePrice: 0.8812, decimals: 5, lotSize: 100000, tvSymbol: 'FX:USDCHF' },
  { id: 'audusd', symbol: 'AUDUSD', name: 'AUD/USD', market: 'forex', basePrice: 0.6543, decimals: 5, lotSize: 100000, tvSymbol: 'FX:AUDUSD' },
  { id: 'usdcad', symbol: 'USDCAD', name: 'USD/CAD', market: 'forex', basePrice: 1.3625, decimals: 5, lotSize: 100000, tvSymbol: 'FX:USDCAD' },
  { id: 'nzdusd', symbol: 'NZDUSD', name: 'NZD/USD', market: 'forex', basePrice: 0.5987, decimals: 5, lotSize: 100000, tvSymbol: 'FX:NZDUSD' },
  { id: 'eurgbp', symbol: 'EURGBP', name: 'EUR/GBP', market: 'forex', basePrice: 0.8592, decimals: 5, lotSize: 100000, tvSymbol: 'FX:EURGBP' },
  { id: 'eurjpy', symbol: 'EURJPY', name: 'EUR/JPY', market: 'forex', basePrice: 163.85, decimals: 3, lotSize: 100000, tvSymbol: 'FX:EURJPY' },
  { id: 'gbpjpy', symbol: 'GBPJPY', name: 'GBP/JPY', market: 'forex', basePrice: 191.12, decimals: 3, lotSize: 100000, tvSymbol: 'FX:GBPJPY' },
  { id: 'eurchf', symbol: 'EURCHF', name: 'EUR/CHF', market: 'forex', basePrice: 0.9543, decimals: 5, lotSize: 100000, tvSymbol: 'FX:EURCHF' },
  { id: 'audcad', symbol: 'AUDCAD', name: 'AUD/CAD', market: 'forex', basePrice: 0.8925, decimals: 5, lotSize: 100000, tvSymbol: 'FX:AUDCAD' },
  { id: 'audnzd', symbol: 'AUDNZD', name: 'AUD/NZD', market: 'forex', basePrice: 1.0932, decimals: 5, lotSize: 100000, tvSymbol: 'FX:AUDNZD' },
  { id: 'audjpy', symbol: 'AUDJPY', name: 'AUD/JPY', market: 'forex', basePrice: 98.75, decimals: 3, lotSize: 100000, tvSymbol: 'FX:AUDJPY' },
  { id: 'cadchf', symbol: 'CADCHF', name: 'CAD/CHF', market: 'forex', basePrice: 0.6472, decimals: 5, lotSize: 100000, tvSymbol: 'FX:CADCHF' },
  { id: 'cadjpy', symbol: 'CADJPY', name: 'CAD/JPY', market: 'forex', basePrice: 110.95, decimals: 3, lotSize: 100000, tvSymbol: 'FX:CADJPY' },
  { id: 'chfjpy', symbol: 'CHFJPY', name: 'CHF/JPY', market: 'forex', basePrice: 171.62, decimals: 3, lotSize: 100000, tvSymbol: 'FX:CHFJPY' },
  { id: 'euraud', symbol: 'EURAUD', name: 'EUR/AUD', market: 'forex', basePrice: 1.6587, decimals: 5, lotSize: 100000, tvSymbol: 'FX:EURAUD' },
  { id: 'eurcad', symbol: 'EURCAD', name: 'EUR/CAD', market: 'forex', basePrice: 1.4783, decimals: 5, lotSize: 100000, tvSymbol: 'FX:EURCAD' },
  { id: 'eurnzd', symbol: 'EURNZD', name: 'EUR/NZD', market: 'forex', basePrice: 1.8125, decimals: 5, lotSize: 100000, tvSymbol: 'FX:EURNZD' },
  { id: 'gbpaud', symbol: 'GBPAUD', name: 'GBP/AUD', market: 'forex', basePrice: 1.9312, decimals: 5, lotSize: 100000, tvSymbol: 'FX:GBPAUD' },
  { id: 'gbpcad', symbol: 'GBPCAD', name: 'GBP/CAD', market: 'forex', basePrice: 1.7215, decimals: 5, lotSize: 100000, tvSymbol: 'FX:GBPCAD' },
  { id: 'gbpchf', symbol: 'GBPCHF', name: 'GBP/CHF', market: 'forex', basePrice: 1.1134, decimals: 5, lotSize: 100000, tvSymbol: 'FX:GBPCHF' },
  { id: 'gbpnzd', symbol: 'GBPNZD', name: 'GBP/NZD', market: 'forex', basePrice: 2.1105, decimals: 5, lotSize: 100000, tvSymbol: 'FX:GBPNZD' },
  { id: 'nzdcad', symbol: 'NZDCAD', name: 'NZD/CAD', market: 'forex', basePrice: 0.8152, decimals: 5, lotSize: 100000, tvSymbol: 'FX:NZDCAD' },
  { id: 'usdtry', symbol: 'USDTRY', name: 'USD/TRY', market: 'forex', basePrice: 32.15, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDTRY' },
  { id: 'usdzar', symbol: 'USDZAR', name: 'USD/ZAR', market: 'forex', basePrice: 18.235, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDZAR' },
  { id: 'usdmxn', symbol: 'USDMXN', name: 'USD/MXN', market: 'forex', basePrice: 17.085, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDMXN' },
  { id: 'usdsek', symbol: 'USDSEK', name: 'USD/SEK', market: 'forex', basePrice: 10.452, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDSEK' },
  { id: 'usdnok', symbol: 'USDNOK', name: 'USD/NOK', market: 'forex', basePrice: 10.723, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDNOK' },
  { id: 'usdsgd', symbol: 'USDSGD', name: 'USD/SGD', market: 'forex', basePrice: 1.3425, decimals: 5, lotSize: 100000, tvSymbol: 'FX:USDSGD' },
  { id: 'usdpln', symbol: 'USDPLN', name: 'USD/PLN', market: 'forex', basePrice: 3.975, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDPLN' },
  { id: 'usdcnh', symbol: 'USDCNH', name: 'USD/CNH', market: 'forex', basePrice: 7.245, decimals: 4, lotSize: 100000, tvSymbol: 'FX:USDCNH' },

  // === COMMODITIES ===
  { id: 'xauusd', symbol: 'XAUUSD', name: 'Gold', market: 'commodities', basePrice: 3024.5, decimals: 2, lotSize: 100, tvSymbol: 'TVC:GOLD' },
  { id: 'xagusd', symbol: 'XAGUSD', name: 'Silver', market: 'commodities', basePrice: 33.45, decimals: 3, lotSize: 5000, tvSymbol: 'TVC:SILVER' },
  { id: 'xptusd', symbol: 'XPTUSD', name: 'Platinum', market: 'commodities', basePrice: 985.5, decimals: 2, lotSize: 100, tvSymbol: 'TVC:PLATINUM' },
  { id: 'xtiusd', symbol: 'XTIUSD', name: 'Crude Oil WTI', market: 'commodities', basePrice: 78.45, decimals: 2, lotSize: 1000, tvSymbol: 'TVC:USOIL' },
  { id: 'xbrusd', symbol: 'XBRUSD', name: 'Brent Crude', market: 'commodities', basePrice: 82.3, decimals: 2, lotSize: 1000, tvSymbol: 'TVC:UKOIL' },
  { id: 'xngusd', symbol: 'XNGUSD', name: 'Natural Gas', market: 'commodities', basePrice: 2.185, decimals: 3, lotSize: 10000, tvSymbol: 'TVC:NATURALGAS' },

  // === INDICES ===
  { id: 'us500', symbol: 'US500', name: 'S&P 500', market: 'indices', basePrice: 5780.5, decimals: 2, lotSize: 10, tvSymbol: 'FOREXCOM:SPXUSD' },
  { id: 'us30', symbol: 'US30', name: 'Dow Jones 30', market: 'indices', basePrice: 42850, decimals: 2, lotSize: 1, tvSymbol: 'FOREXCOM:DJI' },
  { id: 'us100', symbol: 'US100', name: 'Nasdaq 100', market: 'indices', basePrice: 20450, decimals: 2, lotSize: 1, tvSymbol: 'FOREXCOM:NSXUSD' },
  { id: 'uk100', symbol: 'UK100', name: 'FTSE 100', market: 'indices', basePrice: 8250.5, decimals: 2, lotSize: 1, tvSymbol: 'FOREXCOM:UKXGBP' },
  { id: 'de40', symbol: 'DE40', name: 'DAX 40', market: 'indices', basePrice: 22450, decimals: 2, lotSize: 1, tvSymbol: 'FOREXCOM:DEUIDX' },
  { id: 'jp225', symbol: 'JP225', name: 'Nikkei 225', market: 'indices', basePrice: 39850, decimals: 2, lotSize: 1, tvSymbol: 'TVC:NI225' },

  // === US STOCKS ===
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', market: 'stocks', basePrice: 178.5, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:AAPL' },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft', market: 'stocks', basePrice: 415.2, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:MSFT' },
  { id: 'googl', symbol: 'GOOGL', name: 'Alphabet', market: 'stocks', basePrice: 155.8, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:GOOGL' },
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon', market: 'stocks', basePrice: 185.5, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:AMZN' },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla', market: 'stocks', basePrice: 175.3, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:TSLA' },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA', market: 'stocks', basePrice: 875.5, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:NVDA' },
  { id: 'meta', symbol: 'META', name: 'Meta Platforms', market: 'stocks', basePrice: 505.2, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:META' },
  { id: 'nflx', symbol: 'NFLX', name: 'Netflix', market: 'stocks', basePrice: 625.8, decimals: 2, lotSize: 1, tvSymbol: 'NASDAQ:NFLX' },
  { id: 'bac', symbol: 'BAC', name: 'Bank of America', market: 'stocks', basePrice: 37.8, decimals: 2, lotSize: 1, tvSymbol: 'NYSE:BAC' },
  { id: 'jpm', symbol: 'JPM', name: 'JPMorgan Chase', market: 'stocks', basePrice: 198.5, decimals: 2, lotSize: 1, tvSymbol: 'NYSE:JPM' },
];

// Build lookup maps
export const marketAssetBySymbol = new Map<string, MarketAsset>();
export const marketAssetById = new Map<string, MarketAsset>();
marketAssets.forEach(a => {
  marketAssetBySymbol.set(a.symbol, a);
  marketAssetById.set(a.id, a);
});

// Get TradingView symbol for an internal symbol
export function getTvSymbol(symbol: string): string {
  return marketAssetBySymbol.get(symbol)?.tvSymbol || `FX:${symbol}`;
}

// Get all crypto Binance symbols
export function getBinanceSymbols(): string[] {
  return marketAssets
    .filter(a => a.market === 'crypto' && a.binanceSymbol)
    .map(a => a.binanceSymbol!);
}

// Map Binance symbol back to internal symbol
const binanceToInternal = new Map<string, string>();
marketAssets.forEach(a => {
  if (a.binanceSymbol) binanceToInternal.set(a.binanceSymbol, a.symbol);
});
export function binanceSymbolToInternal(binanceSym: string): string | undefined {
  return binanceToInternal.get(binanceSym);
}
