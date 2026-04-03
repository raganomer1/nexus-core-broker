import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { initializePrices, updateAllPrices, type PriceMap } from '@/services/priceService';
import { useStore } from '@/store/useStore';
import { marketAssetBySymbol } from '@/services/marketData';

interface TradingContextValue {
  prices: PriceMap;
  getPrice: (symbol: string) => number;
}

const TradingContext = createContext<TradingContextValue>({
  prices: {},
  getPrice: () => 0,
});

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<PriceMap>(initializePrices);
  const pricesRef = useRef(prices);
  pricesRef.current = prices;

  const updateAssetPricesInStore = useStore(s => s.updateAssetPrices);
  const checkOverrideExpiry = useStore(s => s.checkOverrideExpiry);

  // Fetch & update every 3 seconds
  useEffect(() => {
    let active = true;

    const tick = async () => {
      if (!active) return;
      const newPrices = await updateAllPrices(pricesRef.current);
      if (!active) return;
      setPrices(newPrices);
      // Push prices into zustand store for asset/position updates
      updateAssetPricesInStore(newPrices);
      checkOverrideExpiry();
    };

    // Initial fetch
    tick();
    const interval = setInterval(tick, 3000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const getPrice = useCallback((symbol: string) => {
    return prices[symbol] || 0;
  }, [prices]);

  return (
    <TradingContext.Provider value={{ prices, getPrice }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingPrices() {
  return useContext(TradingContext);
}
