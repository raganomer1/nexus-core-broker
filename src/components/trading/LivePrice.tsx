import React, { memo, useState, useEffect, useRef, useMemo } from 'react';

interface LivePriceProps {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  spread?: number;
  changePercent?: number;
  volume?: number;
  decimals?: number;
  showBidAsk?: boolean;
}

const LivePrice = memo(function LivePrice({
  symbol, price, bid, ask, spread, changePercent = 0, volume, decimals = 2, showBidAsk = false,
}: LivePriceProps) {
  const [flashDir, setFlashDir] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(price);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (price !== prevPrice.current && prevPrice.current > 0) {
      const dir = price > prevPrice.current ? 'up' : 'down';
      setFlashDir(dir);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFlashDir(null), 300);
    }
    prevPrice.current = price;
  }, [price]);

  const formattedPrice = useMemo(() => price.toFixed(decimals), [price, decimals]);
  const arrow = flashDir === 'up' ? '▲' : flashDir === 'down' ? '▼' : '';
  const arrowColor = flashDir === 'up' ? '#00d68f' : '#ff6b6b';

  const bgStyle = flashDir === 'up'
    ? 'rgba(0,214,143,0.15)'
    : flashDir === 'down'
    ? 'rgba(255,107,107,0.15)'
    : 'transparent';

  return (
    <div
      style={{
        padding: '6px 10px',
        background: bgStyle,
        transition: 'background 0.3s ease',
        borderBottom: '1px solid hsl(220, 20%, 18%)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'hsl(220, 14%, 90%)', fontWeight: 600, fontSize: 13 }}>{symbol}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'hsl(220, 14%, 95%)', fontFamily: 'monospace', fontSize: 14, fontWeight: 600 }}>
            {formattedPrice}
          </span>
          {arrow && <span style={{ color: arrowColor, fontSize: 10 }}>{arrow}</span>}
        </div>
      </div>

      {showBidAsk && bid !== undefined && ask !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'hsl(220, 14%, 50%)', marginTop: 2 }}>
          <span>Bid: {bid.toFixed(decimals)}</span>
          <span>Ask: {ask.toFixed(decimals)}</span>
          {spread !== undefined && <span>Spread: {(spread * Math.pow(10, Math.max(decimals - 1, 0))).toFixed(1)}p</span>}
        </div>
      )}

      {(changePercent !== 0 || volume) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'hsl(220, 14%, 45%)', marginTop: 1 }}>
          {changePercent !== 0 && (
            <span style={{ color: changePercent >= 0 ? '#00d68f' : '#ff6b6b' }}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          )}
          {volume ? <span>Vol: {volume > 1e6 ? (volume / 1e6).toFixed(1) + 'M' : volume > 1e3 ? (volume / 1e3).toFixed(0) + 'K' : volume.toFixed(0)}</span> : null}
        </div>
      )}
    </div>
  );
});

export default LivePrice;
