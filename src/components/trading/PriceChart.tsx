import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';
import { fetchHistoricalCandles, getHistoryError, clearHistoryCache } from '@/services/historicalDataService';
import type { CandleData } from '@/services/marketDataService';

interface PriceChartProps {
  symbol: string;
  height?: number;
  theme?: 'dark' | 'light';
}

const TIMEFRAMES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '5Y', days: 1825 },
];

const PriceChart = memo(function PriceChart({ symbol, height = 400, theme = 'dark' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [selectedTf, setSelectedTf] = useState('5Y');
  const [allCandles, setAllCandles] = useState<CandleData[]>([]);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'hsl(220, 25%, 8%)' : '#ffffff';
  const textColor = isDark ? 'hsl(220, 14%, 60%)' : '#333';
  const gridColor = isDark ? 'hsl(220, 20%, 15%)' : '#f0f0f0';

  // Fetch data on symbol change or retry
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchHistoricalCandles(symbol).then(candles => {
      if (!active) return;
      if (candles.length === 0) {
        const apiError = getHistoryError(symbol);
        setError(apiError || 'Нет исторических данных');
      }
      setAllCandles(candles);
      setLoading(false);
    }).catch((e) => {
      if (active) {
        setError(e?.message || 'Ошибка загрузки данных');
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [symbol, retryCount]);

  const handleRetry = useCallback(() => {
    // Clear cache for this symbol so it re-fetches
    clearHistoryCache();
    setRetryCount(c => c + 1);
  }, []);

  // Create/update chart
  useEffect(() => {
    if (!containerRef.current || allCandles.length === 0) return;

    const tf = TIMEFRAMES.find(t => t.label === selectedTf) || TIMEFRAMES[4];
    const cutoff = Math.floor((Date.now() - tf.days * 86400000) / 1000);
    const filtered = allCandles.filter(c => c.time >= cutoff);
    if (filtered.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = containerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: height - 40,
      layout: { background: { color: bgColor }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: gridColor },
      timeScale: { borderColor: gridColor, timeVisible: true },
    });
    chartRef.current = chart;

    if (chartType === 'candle') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#00d68f', downColor: '#ff6b6b',
        borderUpColor: '#00d68f', borderDownColor: '#ff6b6b',
        wickUpColor: '#00d68f', wickDownColor: '#ff6b6b',
      });
      series.setData(filtered.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
    } else {
      const series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2 });
      series.setData(filtered.map(c => ({ time: c.time as any, value: c.close })));
    }

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volSeries.setData(filtered.map(c => ({
      time: c.time as any, value: c.volume,
      color: c.close >= c.open ? 'rgba(0,214,143,0.2)' : 'rgba(255,107,107,0.2)',
    })));

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(container);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; };
  }, [allCandles, selectedTf, chartType, height, bgColor, textColor, gridColor]);

  if (loading) {
    return (
      <div style={{ height, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div style={{ width: 200, height: 16, background: gridColor, borderRadius: 4 }} />
          <div style={{ width: 150, height: 12, background: gridColor, borderRadius: 4 }} />
          <div style={{ fontSize: 11, color: textColor, marginTop: 4 }}>Загрузка {symbol}...</div>
        </div>
      </div>
    );
  }

  if (error && allCandles.length === 0) {
    return (
      <div style={{ height, background: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: textColor }}>
        <div style={{ fontSize: 13 }}>{error}</div>
        <button
          onClick={handleRetry}
          style={{
            padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
            background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)',
          }}
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div style={{ height, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: isDark ? 'hsl(220, 25%, 10%)' : '#fafafa', borderBottom: `1px solid ${gridColor}` }}>
        {TIMEFRAMES.map(tf => (
          <button key={tf.label} onClick={() => setSelectedTf(tf.label)}
            style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: selectedTf === tf.label ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: selectedTf === tf.label ? '#3b82f6' : textColor,
            }}>
            {tf.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={() => setChartType('candle')}
            style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 11, border: 'none', cursor: 'pointer',
              background: chartType === 'candle' ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: chartType === 'candle' ? '#3b82f6' : textColor,
            }}>Свечи</button>
          <button onClick={() => setChartType('line')}
            style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 11, border: 'none', cursor: 'pointer',
              background: chartType === 'line' ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: chartType === 'line' ? '#3b82f6' : textColor,
            }}>Линия</button>
        </div>
      </div>
      {error && (
        <div style={{ padding: '2px 8px', fontSize: 10, color: '#eab308', background: 'rgba(234,179,8,0.1)' }}>
          ⚠ {error}
        </div>
      )}
      <div ref={containerRef} style={{ flex: 1 }} />
    </div>
  );
});

export default PriceChart;
