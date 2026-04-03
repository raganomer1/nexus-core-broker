import React, { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  interval?: string;
  className?: string;
}

// Map internal timeframes to TradingView intervals
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const tvInterval = TV_INTERVALS[interval] || '60';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: tvInterval,
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1', // candlestick
      locale: 'ru',
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      studies: [],
      backgroundColor: theme === 'dark' ? 'rgba(13, 17, 28, 1)' : 'rgba(255, 255, 255, 1)',
      gridColor: theme === 'dark' ? 'rgba(30, 38, 55, 0.5)' : 'rgba(200, 200, 200, 0.3)',
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, interval]);

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container ${className || ''}`}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
