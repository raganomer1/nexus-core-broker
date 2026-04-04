import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { initializePrices, type PriceMap } from '@/services/priceService';
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
  const [prices, setPrices] = useState<PriceMap>(initializePrices);
  const [priceDetails, setPriceDetails] = useState<Record<string, PriceUpdate>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({});

  const updateAssetPricesInStore = useStore(s => s.updateAssetPrices);
  const updateAssetPricesFull = useStore(s => s.updateAssetPricesFull);
  const checkOverrideExpiry = useStore(s => s.checkOverrideExpiry);

  // Batch price updates to reduce re-renders
  const pendingUpdates = useRef<Record<string, number>>({});
  const pendingDetails = useRef<Record<string, PriceUpdate>>({});
  const flushTimer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const service = new RealtimeService(
      // Price callback
      (update: PriceUpdate) => {
        pendingUpdates.current[update.symbol] = update.price;
        pendingDetails.current[update.symbol] = update;
      },
      // Status callback
      (provider: string, status: ConnectionStatus) => {
        setConnectionStatus(prev => ({ ...prev, [provider]: status }));
      }
    );

    // Flush batched updates every 1s
    flushTimer.current = setInterval(() => {
      const updates = pendingUpdates.current;
      const details = pendingDetails.current;
      if (Object.keys(updates).length === 0) return;

      pendingUpdates.current = {};
      pendingDetails.current = {};

      setPrices(prev => {
        const next = { ...prev };
        for (const [sym, price] of Object.entries(updates)) {
          next[sym] = price;
        }
        return next;
      });

      setPriceDetails(prev => ({ ...prev, ...details }));

      // Push FULL price data (bid/ask/spread) to zustand store
      updateAssetPricesFull(details);
      checkOverrideExpiry();
    }, 1000);

    service.start();

    return () => {
      service.stop();
      if (flushTimer.current) clearInterval(flushTimer.current);
    };
  }, []);

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
