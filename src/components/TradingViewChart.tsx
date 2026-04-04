import React, { memo, useMemo } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  interval?: string;
  className?: string;
}

const TV_INTERVALS: Record<string, string> = {
  'M1': '1',
  'M5': '5',
  'M15': '15',
  'M30': '30',
  'H1': '60',
  'H4': '240',
  'D1': 'D',
  'W1': 'W',
  'MN': 'M',
};

function TradingViewChartInner({ symbol, theme = 'dark', interval = 'H1', className }: TradingViewChartProps) {
  const tvInterval = TV_INTERVALS[interval] || '60';

  const src = useMemo(() => {
    const params = new URLSearchParams({
      symbol,
      interval: tvInterval,
      theme,
      style: '1',
      locale: 'ru',
      hide_side_toolbar: '0',
      allow_symbol_change: '0',
      save_image: '0',
      calendar: '0',
      hide_volume: '0',
      support_host: 'https://www.tradingview.com',
    });
    return `https://www.tradingview.com/widgetembed/?frameElementId=tv_chart&${params.toString()}`;
  }, [symbol, tvInterval, theme]);

  return (
    <div className={`tradingview-widget-container ${className || ''}`} style={{ height: '100%', width: '100%' }}>
      <iframe
        key={`${symbol}-${tvInterval}-${theme}`}
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
