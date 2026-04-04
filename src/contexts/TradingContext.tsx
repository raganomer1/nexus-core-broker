import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { PriceMap } from '@/services/priceService';
import { RealtimeService, type PriceUpdate, type ConnectionStatus } from '@/services/realtimeService';
import { useStore } from '@/store/useStore';

interface TradingContextValue {
  prices: PriceMap;
  getPrice: (symbol: string) => number;
  connectionStatus: Record<string, ConnectionStatus>;
  priceDetails: Record<string, PriceUpdate>;
}

const TradingContext = createContext<TradingContextValue>({
  prices: {},
  getPrice: () => 0,
  connectionStatus: {},
  priceDetails: {},
});

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [priceDetails, setPriceDetails] = useState<Record<string, PriceUpdate>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({});

  const assets = useStore(s => s.assets);
  const updateAssetPricesFull = useStore(s => s.updateAssetPricesFull);
  const checkOverrideExpiry = useStore(s => s.checkOverrideExpiry);

  const pendingDetails = useRef<Record<string, PriceUpdate>>({});
  const flushTimer = useRef<ReturnType<typeof setInterval>>();

  const prices = useMemo<PriceMap>(() => {
    return assets.reduce<PriceMap>((acc, asset) => {
      acc[asset.symbol] = asset.bid;
      return acc;
    }, {});
  }, [assets]);

  useEffect(() => {
    let mounted = true;

    const service = new RealtimeService(
      (update: PriceUpdate) => {
        pendingDetails.current[update.symbol] = update;
      },
      (provider: string, status: ConnectionStatus) => {
        if (!mounted) return;
        setConnectionStatus(prev => prev[provider] === status ? prev : { ...prev, [provider]: status });
      }
    );

    const cachedPrices = service.getCachedPrices();
    if (Object.keys(cachedPrices).length > 0) {
      setPriceDetails(cachedPrices);
      updateAssetPricesFull(cachedPrices);
    }

    flushTimer.current = setInterval(() => {
      const details = pendingDetails.current;
      if (Object.keys(details).length > 0) {
        pendingDetails.current = {};
        setPriceDetails(prev => ({ ...prev, ...details }));
        updateAssetPricesFull(details);
      }
      checkOverrideExpiry();
    }, 1000);

    service.start();

    return () => {
      mounted = false;
      service.stop();
      if (flushTimer.current) clearInterval(flushTimer.current);
    };
  }, [checkOverrideExpiry, updateAssetPricesFull]);

  const getPrice = useCallback((symbol: string) => {
    return prices[symbol] || 0;
  }, [prices]);

  return (
    <TradingContext.Provider value={{ prices, getPrice, connectionStatus, priceDetails }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingPrices() {
  return useContext(TradingContext);
}
