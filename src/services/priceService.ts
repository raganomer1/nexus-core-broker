// Price service: Binance real-time for crypto + micro-tick simulation for rest

import { marketAssets, getBinanceSymbols, binanceSymbolToInternal, type MarketAsset } from './marketData';

export type PriceMap = Record<string, number>;

// Fetch real crypto prices from Binance REST API
export async function fetchBinancePrices(): Promise<Record<string, number>> {
  const symbols = getBinanceSymbols();
  if (symbols.length === 0) return {};
  
  try {
    const symbolsParam = JSON.stringify(symbols);
    const resp = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(symbolsParam)}`);
    if (!resp.ok) throw new Error(`Binance API ${resp.status}`);
    const data: { symbol: string; price: string }[] = await resp.json();
    
    const result: Record<string, number> = {};
    for (const item of data) {
      const internalSymbol = binanceSymbolToInternal(item.symbol);
      if (internalSymbol) {
        result[internalSymbol] = parseFloat(item.price);
      }
    }
    return result;
  } catch (e) {
    console.warn('Binance price fetch failed, using simulation:', e);
    return {};
  }
}

// Micro-tick simulation for non-crypto assets
export function microTick(currentPrice: number, asset: MarketAsset): number {
  const volatility = asset.market === 'forex' ? 0.00003 : 0.0002;
  const change = (Math.random() - 0.5) * 2 * volatility;
  const newPrice = currentPrice * (1 + change);
  return Number(newPrice.toFixed(asset.decimals));
}

// Initialize all prices from basePrice
export function initializePrices(): PriceMap {
  const prices: PriceMap = {};
  for (const asset of marketAssets) {
    prices[asset.symbol] = asset.basePrice;
  }
  return prices;
}

// Update all prices: real Binance for crypto, microTick for rest
export async function updateAllPrices(currentPrices: PriceMap): Promise<PriceMap> {
  const newPrices = { ...currentPrices };
  
  // Fetch real crypto prices
  const binancePrices = await fetchBinancePrices();
  
  for (const asset of marketAssets) {
    if (asset.market === 'crypto' && binancePrices[asset.symbol] !== undefined) {
      // Real Binance price
      newPrices[asset.symbol] = Number(binancePrices[asset.symbol].toFixed(asset.decimals));
    } else {
      // Micro-tick simulation
      const current = currentPrices[asset.symbol] || asset.basePrice;
      newPrices[asset.symbol] = microTick(current, asset);
    }
  }
  
  return newPrices;
}
