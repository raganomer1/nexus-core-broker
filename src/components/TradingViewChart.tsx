import React, { useEffect, useRef, memo } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentId = ++widgetIdRef.current;
    const tvInterval = TV_INTERVALS[interval] || '60';
    const bgColor = theme === 'dark' ? 'rgba(13, 17, 28, 1)' : 'rgba(255, 255, 255, 1)';
    const gridColor = theme === 'dark' ? 'rgba(30, 38, 55, 0.5)' : 'rgba(200, 200, 200, 0.3)';

    // Build TradingView widget URL (iframe-based, no script injection)
    const config = {
      autosize: true,
      symbol,
      interval: tvInterval,
      timezone: 'Etc/UTC',
      theme,
      style: '1',
      locale: 'ru',
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      studies: [],
      backgroundColor: bgColor,
      gridColor,
    };

    const encodedConfig = encodeURIComponent(JSON.stringify(config));
    const iframeSrc = `https://s.tradingview.com/widgetembed/?hideideas=1&overrides={}&enabled_features=[]&disabled_features=[]&locale=ru#${encodedConfig}`;

    // Clear previous
    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms';
    iframe.loading = 'lazy';

    if (currentId === widgetIdRef.current) {
      containerRef.current.appendChild(iframe);
    }

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
