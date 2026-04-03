import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, X, AlertTriangle, BarChart3 } from 'lucide-react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi } from 'lightweight-charts';

type TerminalContext = {
  selectedSymbol: string;
  setSelectedSymbol: (s: string) => void;
  selectedAccountId: string;
  setSelectedAccountId: (s: string) => void;
  watchlist: string[];
  setWatchlist: (fn: (w: string[]) => string[]) => void;
  showAddSymbol: boolean;
  setShowAddSymbol: (v: boolean) => void;
};

const timeframes = ['M1', 'M15', 'H1', 'H4', 'D1'];

// Generate candles that end exactly at currentPrice
function generateCandles(currentPrice: number, count: number) {
  const candles = [];
  let price = currentPrice * (0.97 + Math.random() * 0.02);
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i >= 1; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.004;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * price * 0.0015;
    const low = Math.min(open, close) - Math.random() * price * 0.0015;
    candles.push({ time: now - i * 300, open, high, low, close });
    price = close;
  }
  // Last candle closes at exactly current price
  const lastOpen = price;
  const high = Math.max(lastOpen, currentPrice) + Math.random() * currentPrice * 0.001;
  const low = Math.min(lastOpen, currentPrice) - Math.random() * currentPrice * 0.001;
  candles.push({ time: now, open: lastOpen, high, low, close: currentPrice });
  return candles;
}

// Simple Moving Average
function calcSMA(data: { close: number; time: number }[], period: number) {
  const result: { time: number; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

// Exponential Moving Average
function calcEMA(data: { close: number; time: number }[], period: number) {
  const result: { time: number; value: number }[] = [];
  const k = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
  result.push({ time: data[period - 1].time, value: ema });
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

// Bollinger Bands
function calcBollinger(data: { close: number; time: number }[], period: number) {
  const upper: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];
  const middle: { time: number; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, d) => s + d.close, 0) / period;
    const variance = slice.reduce((s, d) => s + (d.close - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    middle.push({ time: data[i].time, value: mean });
    upper.push({ time: data[i].time, value: mean + 2 * std });
    lower.push({ time: data[i].time, value: mean - 2 * std });
  }
  return { upper, middle, lower };
}

type IndicatorType = 'sma20' | 'sma50' | 'ema20' | 'bollinger';
const INDICATOR_OPTIONS: { key: IndicatorType; label: string }[] = [
  { key: 'sma20', label: 'SMA 20' },
  { key: 'sma50', label: 'SMA 50' },
  { key: 'ema20', label: 'EMA 20' },
  { key: 'bollinger', label: 'Bollinger Bands' },
];

export default function TerminalMain() {
  const ctx = useOutletContext<TerminalContext>();
  const { assets, tradingAccounts, positions, payments, openPosition, closePosition, auth } = useStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);

  const [tf, setTf] = useState('H1');
  const [showOrder, setShowOrder] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<IndicatorType[]>([]);
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderVolume, setOrderVolume] = useState('0.1');
  const [orderTP, setOrderTP] = useState('');
  const [orderSL, setOrderSL] = useState('');
  const [tpMode, setTpMode] = useState<'price' | 'points'>('price');
  const [slMode, setSlMode] = useState<'price' | 'points'>('price');
  const [orderError, setOrderError] = useState('');
  const [reportTab, setReportTab] = useState<'trades' | 'deposits' | 'executed'>('trades');
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [addSearch, setAddSearch] = useState('');
  const [addCategory, setAddCategory] = useState('All');
  const [showPositions, setShowPositions] = useState(true);

  const asset = assets.find(a => a.symbol === ctx.selectedSymbol);
  const account = tradingAccounts.find(a => a.id === ctx.selectedAccountId);
  const openPos = positions.filter(p => p.accountId === ctx.selectedAccountId && p.status === 'Open');
  const closedPos = positions.filter(p => p.accountId === ctx.selectedAccountId && p.status === 'Closed');

  const categories = ['All', ...new Set(assets.map(a => a.category))];
  const addAssets = assets.filter(a => {
    if (addCategory !== 'All' && a.category !== addCategory) return false;
    if (addSearch) return a.symbol.toLowerCase().includes(addSearch.toLowerCase()) || a.description.toLowerCase().includes(addSearch.toLowerCase());
    return a.isActive;
  });

  // Margin calculation
  const requiredMargin = useMemo(() => {
    if (!asset || !account) return 0;
    const price = orderType === 'Buy' ? asset.ask : asset.bid;
    return (Number(orderVolume) * asset.contractSize * price * asset.marginPercent) / 100 / account.leverage;
  }, [asset, account, orderType, orderVolume]);

  const commission = useMemo(() => {
    if (!asset) return 0;
    return asset.commission * Number(orderVolume);
  }, [asset, orderVolume]);

  // Залог (deposit) = margin required
  const depositAmount = requiredMargin;

  const marginWarning = useMemo(() => {
    if (!account) return '';
    const total = requiredMargin + commission;
    if (total > account.freeMargin) return 'Недостаточно свободных средств для открытия ордера';
    if (total > account.freeMargin * 0.8) return 'Внимание: ордер использует более 80% свободных средств';
    return '';
  }, [account, requiredMargin, commission]);

  // TP/SL converters
  const getTPPrice = (): number | undefined => {
    if (!orderTP || !asset) return undefined;
    const val = Number(orderTP);
    if (isNaN(val)) return undefined;
    if (tpMode === 'price') return val;
    const pointSize = Math.pow(10, -asset.precision);
    const price = orderType === 'Buy' ? asset.ask : asset.bid;
    return orderType === 'Buy' ? price + val * pointSize : price - val * pointSize;
  };

  const getSLPrice = (): number | undefined => {
    if (!orderSL || !asset) return undefined;
    const val = Number(orderSL);
    if (isNaN(val)) return undefined;
    if (slMode === 'price') return val;
    const pointSize = Math.pow(10, -asset.precision);
    const price = orderType === 'Buy' ? asset.ask : asset.bid;
    return orderType === 'Buy' ? price - val * pointSize : price + val * pointSize;
  };

  // Report data
  const periodMs = reportPeriod === 'week' ? 7 * 86400000 : reportPeriod === 'month' ? 30 * 86400000 : 0;
  const reportPositions = useMemo(() => {
    let list = [...openPos, ...closedPos];
    if (periodMs > 0) { const cutoff = Date.now() - periodMs; list = list.filter(p => new Date(p.openDate).getTime() >= cutoff); }
    return list.sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
  }, [openPos, closedPos, periodMs]);

  const reportDeposits = useMemo(() => {
    let list = payments.filter(p => p.accountId === ctx.selectedAccountId && (p.type === 'Deposit' || p.type === 'Withdrawal') && p.status === 'Approved');
    if (periodMs > 0) { const cutoff = Date.now() - periodMs; list = list.filter(p => new Date(p.createdAt).getTime() >= cutoff); }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, ctx.selectedAccountId, periodMs]);

  const executedOrders = useMemo(() => {
    let list = closedPos;
    if (periodMs > 0) { const cutoff = Date.now() - periodMs; list = list.filter(p => p.closeDate && new Date(p.closeDate).getTime() >= cutoff); }
    return list.sort((a, b) => new Date(b.closeDate || b.openDate).getTime() - new Date(a.closeDate || a.openDate).getTime());
  }, [closedPos, periodMs]);

  const reportSummary = useMemo(() => {
    const totalProfit = reportPositions.reduce((s, p) => s + p.profit, 0);
    const totalSwap = reportPositions.reduce((s, p) => s + p.swap, 0);
    const totalCommission = reportPositions.reduce((s, p) => s + p.commission, 0);
    const deposited = reportDeposits.filter(p => p.type === 'Deposit').reduce((s, p) => s + p.amount, 0);
    const withdrawn = reportDeposits.filter(p => p.type === 'Withdrawal').reduce((s, p) => s + p.amount, 0);
    return { totalProfit, totalSwap, totalCommission, deposited, withdrawn, balance: account?.balance || 0 };
  }, [reportPositions, reportDeposits, account]);

  // Chart — prices synced with asset
  useEffect(() => {
    if (!chartRef.current || !asset) return;
    chartRef.current.innerHTML = '';
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth, height: chartRef.current.clientHeight,
      layout: { background: { color: 'hsl(220, 25%, 8%)' }, textColor: 'hsl(220, 14%, 60%)' },
      grid: { vertLines: { color: 'hsl(220, 20%, 15%)' }, horzLines: { color: 'hsl(220, 20%, 15%)' } },
      crosshair: { mode: 0 },
      timeScale: { borderColor: 'hsl(220, 20%, 20%)' },
      rightPriceScale: { borderColor: 'hsl(220, 20%, 20%)' },
    });
    chartApiRef.current = chart;

    // Use actual bid price as latest close so chart matches asset price
    const candles = generateCandles(asset.bid, 100);
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(142, 71%, 45%)', downColor: 'hsl(0, 84%, 60%)',
      borderUpColor: 'hsl(142, 71%, 45%)', borderDownColor: 'hsl(0, 84%, 60%)',
      wickUpColor: 'hsl(142, 71%, 45%)', wickDownColor: 'hsl(0, 84%, 60%)',
    });
    candleSeries.setData(candles as any);

    // Volume
    const volumeSeries = chart.addSeries(HistogramSeries, { priceScaleId: 'volume', color: 'hsl(217, 91%, 55%, 0.3)' });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volumeSeries.setData(candles.map(c => ({ time: c.time, value: Math.random() * 1000 + 100 })) as any);

    // Indicators
    if (activeIndicators.includes('sma20')) {
      const sma = calcSMA(candles, 20);
      const s = chart.addSeries(LineSeries, { color: 'hsl(45, 100%, 55%)', lineWidth: 1, priceScaleId: 'right' });
      s.setData(sma as any);
    }
    if (activeIndicators.includes('sma50')) {
      const sma = calcSMA(candles, 50);
      const s = chart.addSeries(LineSeries, { color: 'hsl(280, 80%, 65%)', lineWidth: 1, priceScaleId: 'right' });
      s.setData(sma as any);
    }
    if (activeIndicators.includes('ema20')) {
      const ema = calcEMA(candles, 20);
      const s = chart.addSeries(LineSeries, { color: 'hsl(200, 90%, 55%)', lineWidth: 1, priceScaleId: 'right' });
      s.setData(ema as any);
    }
    if (activeIndicators.includes('bollinger')) {
      const bb = calcBollinger(candles, 20);
      const su = chart.addSeries(LineSeries, { color: 'hsl(0, 0%, 60%)', lineWidth: 1, lineStyle: 2, priceScaleId: 'right' });
      su.setData(bb.upper as any);
      const sm = chart.addSeries(LineSeries, { color: 'hsl(0, 0%, 50%)', lineWidth: 1, priceScaleId: 'right' });
      sm.setData(bb.middle as any);
      const sl = chart.addSeries(LineSeries, { color: 'hsl(0, 0%, 60%)', lineWidth: 1, lineStyle: 2, priceScaleId: 'right' });
      sl.setData(bb.lower as any);
    }

    chart.timeScale().fitContent();
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight });
    });
    resizeObserver.observe(chartRef.current);
    return () => { chart.remove(); resizeObserver.disconnect(); };
  }, [ctx.selectedSymbol, tf, activeIndicators]);

  const toggleIndicator = (ind: IndicatorType) => {
    setActiveIndicators(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  };

  const handleOrder = () => {
    setOrderError('');
    if (!asset || !account) return;
    if (!asset.tradingAllowed) { setOrderError('Торговля по данному инструменту отключена'); return; }
    const vol = Number(orderVolume);
    if (vol <= 0) { setOrderError('Некорректный объем'); return; }

    const tpPrice = getTPPrice();
    const slPrice = getSLPrice();

    if (tpPrice !== undefined) {
      const price = orderType === 'Buy' ? asset.ask : asset.bid;
      const minDist = asset.stopLevel * Math.pow(10, -asset.precision);
      if (orderType === 'Buy' && tpPrice <= price + minDist) { setOrderError(`Take Profit должен быть выше ${(price + minDist).toFixed(asset.precision)}`); return; }
      if (orderType === 'Sell' && tpPrice >= price - minDist) { setOrderError(`Take Profit должен быть ниже ${(price - minDist).toFixed(asset.precision)}`); return; }
    }
    if (slPrice !== undefined) {
      const price = orderType === 'Buy' ? asset.ask : asset.bid;
      const minDist = asset.stopLevel * Math.pow(10, -asset.precision);
      if (orderType === 'Buy' && slPrice >= price - minDist) { setOrderError(`Stop Loss должен быть ниже ${(price - minDist).toFixed(asset.precision)}`); return; }
      if (orderType === 'Sell' && slPrice <= price + minDist) { setOrderError(`Stop Loss должен быть выше ${(price + minDist).toFixed(asset.precision)}`); return; }
    }

    const result = openPosition({
      accountId: ctx.selectedAccountId, symbol: asset.symbol, type: orderType, volume: vol,
      openPrice: orderType === 'Buy' ? asset.ask : asset.bid, openDate: new Date().toISOString(),
      swap: 0, commission: asset.commission * vol, margin: depositAmount,
      takeProfit: tpPrice, stopLoss: slPrice,
    });
    if (!result.success) setOrderError(result.error || 'Ошибка');
    else { setShowOrder(false); setOrderTP(''); setOrderSL(''); setOrderVolume('0.1'); }
  };

  // Pre-fill TP/SL with asset price when switching to price mode
  const currentPrice = asset ? (orderType === 'Buy' ? asset.ask : asset.bid) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe tabs + symbol + indicators */}
      <div className="h-9 flex items-center px-2 md:px-3 gap-1 md:gap-2 border-b flex-shrink-0 overflow-x-auto" style={{ borderColor: 'hsl(220, 20%, 20%)', background: 'hsl(220, 25%, 10%)' }}>
        <span className="text-xs md:text-sm font-semibold mr-1 md:mr-3 whitespace-nowrap" style={{ color: 'hsl(220, 14%, 90%)' }}>{asset?.symbol}</span>
        <span className="text-xs mr-2 md:mr-4 hidden sm:inline whitespace-nowrap" style={{ color: 'hsl(220, 14%, 50%)' }}>{asset?.description}</span>
        {timeframes.map(t => (
          <button key={t} onClick={() => setTf(t)}
            className={`px-1.5 md:px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${tf === t ? '' : 'opacity-40 hover:opacity-70'}`}
            style={tf === t ? { background: 'hsl(217, 91%, 55%, 0.2)', color: 'hsl(217, 91%, 55%)' } : { color: 'hsl(220, 14%, 60%)' }}>
            {t}
          </button>
        ))}
        <div className="ml-auto relative flex-shrink-0">
          <button onClick={() => setShowIndicators(!showIndicators)} className="flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{ color: activeIndicators.length > 0 ? 'hsl(217, 91%, 55%)' : 'hsl(220, 14%, 60%)', background: activeIndicators.length > 0 ? 'hsl(217, 91%, 55%, 0.15)' : 'transparent' }}>
            <BarChart3 size={14} /> <span className="hidden sm:inline">Индикаторы</span>
            {activeIndicators.length > 0 && <span className="ml-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{activeIndicators.length}</span>}
          </button>
          {showIndicators && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-xl p-2 min-w-[180px]" style={{ background: 'hsl(220, 25%, 12%)', borderColor: 'hsl(220, 20%, 20%)' }}>
              {INDICATOR_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => toggleIndicator(opt.key)}
                  className="w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between hover:bg-white/5"
                  style={{ color: activeIndicators.includes(opt.key) ? 'hsl(217, 91%, 55%)' : 'hsl(220, 14%, 70%)' }}>
                  {opt.label}
                  {activeIndicators.includes(opt.key) && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">ON</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-[200px]" ref={chartRef} onClick={() => showIndicators && setShowIndicators(false)} />

      {/* Buy / Sell buttons below chart */}
      <div className="flex items-center gap-2 px-2 md:px-3 py-2 border-t border-b flex-shrink-0" style={{ borderColor: 'hsl(220, 20%, 20%)', background: 'hsl(220, 25%, 10%)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(220, 14%, 60%)' }}>
          <span className="font-medium" style={{ color: 'hsl(220, 14%, 90%)' }}>{asset?.symbol}</span>
          <span>Bid: <b style={{ color: 'hsl(142, 71%, 45%)' }}>{asset?.bid.toFixed(asset?.precision)}</b></span>
          <span>Ask: <b style={{ color: 'hsl(0, 84%, 60%)' }}>{asset?.ask.toFixed(asset?.precision)}</b></span>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setOrderType('Buy'); setShowOrder(true); }} className="buy-btn text-xs px-4 md:px-6 py-1.5 font-semibold rounded">
            Купить {asset?.ask.toFixed(asset?.precision)}
          </button>
          <button onClick={() => { setOrderType('Sell'); setShowOrder(true); }} className="sell-btn text-xs px-4 md:px-6 py-1.5 font-semibold rounded">
            Продать {asset?.bid.toFixed(asset?.precision)}
          </button>
        </div>
      </div>

      {/* Bottom panel: positions */}
      <div className="flex-shrink-0" style={{ background: 'hsl(220, 25%, 10%)', maxHeight: '35%', overflow: 'auto' }}>
        <div className="flex items-center justify-between px-2 md:px-3 py-2 border-b" style={{ borderColor: 'hsl(220, 20%, 20%)' }}>
          <button onClick={() => setShowPositions(!showPositions)} className="flex gap-2 items-center">
            <span className="text-xs font-medium" style={{ color: 'hsl(220, 14%, 80%)' }}>Портфель ({openPos.length})</span>
          </button>
          <button onClick={() => setShowReport(true)} className="text-xs px-2 py-1 rounded" style={{ color: 'hsl(217, 91%, 55%)', background: 'hsl(217, 91%, 55%, 0.1)' }}>
            Отчёт
          </button>
        </div>
        {showPositions && (
          <>
            <div className="md:hidden p-2 space-y-2">
              {openPos.length === 0 && <div className="text-center py-4 text-xs" style={{ color: 'hsl(220, 14%, 40%)' }}>Нет открытых позиций</div>}
              {openPos.map(p => (
                <div key={p.id} className="rounded p-2 flex items-center justify-between" style={{ background: 'hsl(220, 25%, 12%)', border: '1px solid hsl(220, 20%, 18%)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'hsl(220, 14%, 90%)' }}>{p.symbol} <span style={{ color: p.type === 'Buy' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{p.type}</span></div>
                    <div className="text-xs" style={{ color: 'hsl(220, 14%, 50%)' }}>{p.volume} лот · {p.openPrice}</div>
                    <div className="text-[10px]" style={{ color: 'hsl(220, 14%, 40%)' }}>Залог: ${p.margin.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold" style={{ color: p.profit >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>
                      {p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}
                    </div>
                    <button onClick={() => closePosition(p.id)} className="text-xs px-2 py-0.5 rounded mt-0.5" style={{ background: 'hsl(0, 84%, 60%, 0.2)', color: 'hsl(0, 84%, 60%)' }}>Закрыть</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'hsl(220, 14%, 70%)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(220, 20%, 20%)' }}>
                    <th className="text-left px-3 py-2 font-medium">Символ</th>
                    <th className="text-left px-2 py-2 font-medium">Тип</th>
                    <th className="text-right px-2 py-2 font-medium">Объем</th>
                    <th className="text-right px-2 py-2 font-medium">Цена откр.</th>
                    <th className="text-right px-2 py-2 font-medium">Текущая</th>
                    <th className="text-right px-2 py-2 font-medium">TP/SL</th>
                    <th className="text-right px-2 py-2 font-medium">Залог</th>
                    <th className="text-right px-2 py-2 font-medium">Своп</th>
                    <th className="text-right px-2 py-2 font-medium">Прибыль</th>
                    <th className="text-right px-3 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {openPos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid hsl(220, 20%, 15%)' }}>
                      <td className="px-3 py-2 font-medium" style={{ color: 'hsl(220, 14%, 90%)' }}>{p.symbol}</td>
                      <td className="px-2 py-2"><span style={{ color: p.type === 'Buy' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{p.type}</span></td>
                      <td className="text-right px-2 py-2">{p.volume}</td>
                      <td className="text-right px-2 py-2">{p.openPrice}</td>
                      <td className="text-right px-2 py-2">{p.currentPrice}</td>
                      <td className="text-right px-2 py-2" style={{ color: 'hsl(220, 14%, 50%)' }}>
                        {p.takeProfit ? `TP:${p.takeProfit}` : ''}{p.takeProfit && p.stopLoss ? ' ' : ''}{p.stopLoss ? `SL:${p.stopLoss}` : ''}{!p.takeProfit && !p.stopLoss ? '—' : ''}
                      </td>
                      <td className="text-right px-2 py-2">${p.margin.toFixed(2)}</td>
                      <td className="text-right px-2 py-2">{p.swap.toFixed(2)}</td>
                      <td className="text-right px-2 py-2 font-semibold" style={{ color: p.profit >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>
                        {p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}
                      </td>
                      <td className="text-right px-3 py-2">
                        <button onClick={() => closePosition(p.id)} className="text-xs px-2 py-0.5 rounded" style={{ background: 'hsl(0, 84%, 60%, 0.2)', color: 'hsl(0, 84%, 60%)' }}>Закрыть</button>
                      </td>
                    </tr>
                  ))}
                  {openPos.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-4" style={{ color: 'hsl(220, 14%, 40%)' }}>Нет открытых позиций</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* New Order Dialog */}
      <Dialog open={showOrder} onOpenChange={setShowOrder}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader><DialogTitle>Новый ордер — {asset?.symbol}</DialogTitle></DialogHeader>
          {asset && account && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{asset.description}</span>
                <span className="font-mono">Спред: {(asset.ask - asset.bid).toFixed(asset.precision)}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setOrderType('Buy')} className={`flex-1 py-2.5 rounded font-semibold text-sm transition-all ${orderType === 'Buy' ? 'buy-btn' : 'bg-muted text-muted-foreground'}`}>
                  Buy {asset.ask.toFixed(asset.precision)}
                </button>
                <button onClick={() => setOrderType('Sell')} className={`flex-1 py-2.5 rounded font-semibold text-sm transition-all ${orderType === 'Sell' ? 'sell-btn' : 'bg-muted text-muted-foreground'}`}>
                  Sell {asset.bid.toFixed(asset.precision)}
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Объем (лот)</label>
                <div className="flex gap-1 mt-1">
                  {['0.01', '0.1', '0.5', '1.0'].map(v => (
                    <button key={v} onClick={() => setOrderVolume(v)}
                      className={`px-2 py-1 rounded text-xs font-medium ${orderVolume === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {v}
                    </button>
                  ))}
                  <Input type="number" step="0.01" min="0.01" value={orderVolume} onChange={e => setOrderVolume(e.target.value)} className="h-7 text-xs flex-1" />
                </div>
              </div>

              {/* TP / SL with price/points toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs text-muted-foreground">Take Profit</label>
                    <div className="flex gap-0.5 ml-auto">
                      <button onClick={() => { setTpMode('price'); if (tpMode === 'points' && orderTP) setOrderTP(''); }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tpMode === 'price' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Цена</button>
                      <button onClick={() => { setTpMode('points'); if (tpMode === 'price' && orderTP) setOrderTP(''); }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tpMode === 'points' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Пункты</button>
                    </div>
                  </div>
                  <Input type="number" step="any" value={orderTP} onChange={e => setOrderTP(e.target.value)}
                    placeholder={tpMode === 'price' ? currentPrice.toFixed(asset.precision) : '0'} className="h-8" />
                  {orderTP && tpMode === 'points' && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">≈ {getTPPrice()?.toFixed(asset.precision)}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs text-muted-foreground">Stop Loss</label>
                    <div className="flex gap-0.5 ml-auto">
                      <button onClick={() => { setSlMode('price'); if (slMode === 'points' && orderSL) setOrderSL(''); }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${slMode === 'price' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Цена</button>
                      <button onClick={() => { setSlMode('points'); if (slMode === 'price' && orderSL) setOrderSL(''); }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${slMode === 'points' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Пункты</button>
                    </div>
                  </div>
                  <Input type="number" step="any" value={orderSL} onChange={e => setOrderSL(e.target.value)}
                    placeholder={slMode === 'price' ? currentPrice.toFixed(asset.precision) : '0'} className="h-8" />
                  {orderSL && slMode === 'points' && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">≈ {getSLPrice()?.toFixed(asset.precision)}</div>
                  )}
                </div>
              </div>

              {/* Info block with залог */}
              <div className="rounded-lg p-3 space-y-1.5" style={{ background: 'hsl(var(--muted))' }}>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Свободные средства</span><b>${account.freeMargin.toFixed(2)}</b></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Залог (маржа)</span><b className="text-primary">${depositAmount.toFixed(2)}</b></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Комиссия</span><b>${commission.toFixed(2)}</b></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Контракт</span><b>{asset.contractSize}</b></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Кредитное плечо</span><b>1:{account.leverage}</b></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Своп (Long/Short)</span><b>{asset.swapLong}/{asset.swapShort}</b></div>
              </div>

              {marginWarning && (
                <div className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${requiredMargin + commission > account.freeMargin ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-600'}`}>
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{marginWarning}</span>
                </div>
              )}

              {!asset.tradingAllowed && (
                <div className="flex items-start gap-2 rounded-lg p-2.5 text-xs bg-destructive/10 text-destructive">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Торговля по данному инструменту отключена</span>
                </div>
              )}

              {orderError && <div className="text-sm text-destructive font-medium">{orderError}</div>}

              <Button onClick={handleOrder} className={`w-full ${orderType === 'Buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                disabled={requiredMargin + commission > account.freeMargin || !asset.tradingAllowed}>
                {orderType === 'Buy' ? 'Купить' : 'Продать'} {Number(orderVolume)} лот
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Symbol Dialog */}
      <Dialog open={ctx.showAddSymbol} onOpenChange={ctx.setShowAddSymbol}>
        <DialogContent className="max-w-lg max-h-[80vh] mx-4">
          <DialogHeader><DialogTitle>Добавить инструмент</DialogTitle></DialogHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex sm:flex-col sm:w-40 gap-1 overflow-x-auto sm:overflow-x-visible sm:border-r sm:pr-3">
              {categories.map(c => (
                <button key={c} onClick={() => setAddCategory(c)}
                  className={`sm:w-full text-left px-2 py-1.5 rounded text-xs whitespace-nowrap ${addCategory === c ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
                  {c} {c !== 'All' && <span className="opacity-50">({assets.filter(a => a.category === c).length})</span>}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Поиск..." value={addSearch} onChange={e => setAddSearch(e.target.value)} className="pl-8 h-8 text-sm" />
              </div>
              <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                {addAssets.slice(0, 50).map(a => {
                  const inWatchlist = ctx.watchlist.includes(a.symbol);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                      <div className="min-w-0 mr-2">
                        <div className="text-sm font-medium">{a.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{a.description} · <span className="opacity-60">{a.category}</span></div>
                      </div>
                      <Button variant={inWatchlist ? 'outline' : 'default'} size="sm" className="h-7 flex-shrink-0"
                        onClick={() => inWatchlist ? ctx.setWatchlist((w: string[]) => w.filter(s => s !== a.symbol)) : ctx.setWatchlist((w: string[]) => [...w, a.symbol])}>
                        {inWatchlist ? <X size={12} /> : <Plus size={12} />}
                      </Button>
                    </div>
                  );
                })}
                {addAssets.length > 50 && <div className="text-xs text-center text-muted-foreground py-2">Показано 50 из {addAssets.length}. Уточните поиск.</div>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>Торговый отчёт</DialogTitle></DialogHeader>

          <div className="flex gap-1 overflow-x-auto">
            {([['trades', 'Торговля'], ['deposits', 'Депозиты'], ['executed', 'Исполненные']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setReportTab(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${reportTab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {([['week', 'Неделя'], ['month', 'Месяц'], ['all', 'Всё время']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setReportPeriod(key)}
                className={`px-2.5 py-1 rounded text-xs ${reportPeriod === key ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>

          {reportTab === 'trades' && (
            <div className="overflow-x-auto">
              <table className="data-table text-xs">
                <thead><tr className="bg-muted/30">
                  <th>Дата откр.</th><th>Тип</th><th>Символ</th><th>Объем</th><th>Цена откр.</th><th>Дата закр.</th><th>Цена закр.</th><th>TP</th><th>SL</th><th>Залог</th><th>Своп</th><th>Прибыль</th>
                </tr></thead>
                <tbody>
                  {reportPositions.map(p => (
                    <tr key={p.id}>
                      <td className="text-muted-foreground whitespace-nowrap">{new Date(p.openDate).toLocaleDateString()}</td>
                      <td><span style={{ color: p.type === 'Buy' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{p.type}</span></td>
                      <td className="font-medium">{p.symbol}</td>
                      <td>{p.volume}</td>
                      <td>{p.openPrice}</td>
                      <td className="text-muted-foreground whitespace-nowrap">{p.closeDate ? new Date(p.closeDate).toLocaleDateString() : '—'}</td>
                      <td>{p.closePrice || p.currentPrice}</td>
                      <td className="text-muted-foreground">{p.takeProfit || '—'}</td>
                      <td className="text-muted-foreground">{p.stopLoss || '—'}</td>
                      <td>${p.margin.toFixed(2)}</td>
                      <td>{p.swap.toFixed(2)}</td>
                      <td className={p.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                  {reportPositions.length === 0 && <tr><td colSpan={12} className="text-center py-4 text-muted-foreground">Нет данных</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {reportTab === 'deposits' && (
            <div className="overflow-x-auto">
              <table className="data-table text-xs">
                <thead><tr className="bg-muted/30"><th>Дата</th><th>Тип</th><th>Сумма</th><th>Метод</th><th>Статус</th></tr></thead>
                <tbody>
                  {reportDeposits.map(p => (
                    <tr key={p.id}>
                      <td className="text-muted-foreground whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td><span className={p.type === 'Deposit' ? 'text-green-600' : 'text-destructive'}>{p.type === 'Deposit' ? 'Пополнение' : 'Снятие'}</span></td>
                      <td className="font-semibold">${p.amount.toLocaleString()}</td>
                      <td>{p.paymentMethod}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                  {reportDeposits.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">Нет данных</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {reportTab === 'executed' && (
            <div className="overflow-x-auto">
              <table className="data-table text-xs">
                <thead><tr className="bg-muted/30"><th>Дата откр.</th><th>Тип</th><th>Символ</th><th>Объем</th><th>Цена откр.</th><th>Цена закр.</th><th>Прибыль</th><th>Закрытие</th></tr></thead>
                <tbody>
                  {executedOrders.map(p => (
                    <tr key={p.id}>
                      <td className="text-muted-foreground whitespace-nowrap">{new Date(p.openDate).toLocaleDateString()}</td>
                      <td><span style={{ color: p.type === 'Buy' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{p.type}</span></td>
                      <td className="font-medium">{p.symbol}</td>
                      <td>{p.volume}</td>
                      <td>{p.openPrice}</td>
                      <td>{p.closePrice}</td>
                      <td className={p.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}</td>
                      <td className="text-muted-foreground">{p.closeType || '—'}</td>
                    </tr>
                  ))}
                  {executedOrders.length === 0 && <tr><td colSpan={8} className="text-center py-4 text-muted-foreground">Нет данных</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {account && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2 border-t">
              <div className="bg-muted/30 rounded p-2.5 text-center"><div className="text-xs text-muted-foreground">Баланс</div><div className="font-semibold text-sm">${reportSummary.balance.toFixed(2)}</div></div>
              <div className="bg-muted/30 rounded p-2.5 text-center"><div className="text-xs text-muted-foreground">Прибыль</div><div className={`font-semibold text-sm ${reportSummary.totalProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>{reportSummary.totalProfit >= 0 ? '+' : ''}{reportSummary.totalProfit.toFixed(2)}</div></div>
              <div className="bg-muted/30 rounded p-2.5 text-center"><div className="text-xs text-muted-foreground">Своп</div><div className="font-semibold text-sm">{reportSummary.totalSwap.toFixed(2)}</div></div>
              <div className="bg-muted/30 rounded p-2.5 text-center"><div className="text-xs text-muted-foreground">Комиссия</div><div className="font-semibold text-sm">{reportSummary.totalCommission.toFixed(2)}</div></div>
              <div className="bg-muted/30 rounded p-2.5 text-center"><div className="text-xs text-muted-foreground">Введено</div><div className="font-semibold text-sm">${reportSummary.deposited.toLocaleString()}</div></div>
              <div className="bg-muted/30 rounded p-2.5 text-center"><div className="text-xs text-muted-foreground">Снято</div><div className="font-semibold text-sm">${reportSummary.withdrawn.toLocaleString()}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
