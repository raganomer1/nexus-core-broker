import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, X, Download } from 'lucide-react';
import { createChart, CandlestickSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';

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

function generateCandles(currentPrice: number, count: number) {
  const candles = [];
  let price = currentPrice * 0.98;
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.005;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * price * 0.002;
    const low = Math.min(open, close) - Math.random() * price * 0.002;
    candles.push({ time: now - i * 300, open, high, low, close });
    price = close;
  }
  return candles;
}

export default function TerminalMain() {
  const ctx = useOutletContext<TerminalContext>();
  const { assets, tradingAccounts, positions, openPosition, closePosition, auth } = useStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);

  const [tf, setTf] = useState('H1');
  const [showOrder, setShowOrder] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderVolume, setOrderVolume] = useState('0.1');
  const [orderTP, setOrderTP] = useState('');
  const [orderSL, setOrderSL] = useState('');
  const [orderError, setOrderError] = useState('');
  const [reportTab, setReportTab] = useState<'trades' | 'deposits' | 'executed'>('trades');
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

  // Chart
  useEffect(() => {
    if (!chartRef.current || !asset) return;
    chartRef.current.innerHTML = '';

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: { background: { color: 'hsl(220, 25%, 8%)' }, textColor: 'hsl(220, 14%, 60%)' },
      grid: { vertLines: { color: 'hsl(220, 20%, 15%)' }, horzLines: { color: 'hsl(220, 20%, 15%)' } },
      crosshair: { mode: 0 },
      timeScale: { borderColor: 'hsl(220, 20%, 20%)' },
      rightPriceScale: { borderColor: 'hsl(220, 20%, 20%)' },
    });
    chartApiRef.current = chart;

    const candles = generateCandles(asset.bid, 100);
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(142, 71%, 45%)', downColor: 'hsl(0, 84%, 60%)',
      borderUpColor: 'hsl(142, 71%, 45%)', borderDownColor: 'hsl(0, 84%, 60%)',
      wickUpColor: 'hsl(142, 71%, 45%)', wickDownColor: 'hsl(0, 84%, 60%)',
    });
    candleSeries.setData(candles as any);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume', color: 'hsl(217, 91%, 55%, 0.3)',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volumeSeries.setData(candles.map(c => ({ time: c.time, value: Math.random() * 1000 + 100 })) as any);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight });
    });
    resizeObserver.observe(chartRef.current);

    return () => { chart.remove(); resizeObserver.disconnect(); };
  }, [ctx.selectedSymbol, tf]);

  const handleOrder = () => {
    setOrderError('');
    if (!asset || !account) return;
    const result = openPosition({
      accountId: ctx.selectedAccountId,
      symbol: asset.symbol,
      type: orderType,
      volume: Number(orderVolume),
      openPrice: orderType === 'Buy' ? asset.ask : asset.bid,
      openDate: new Date().toISOString(),
      swap: 0,
      commission: asset.commission * Number(orderVolume),
      margin: 0,
      takeProfit: orderTP ? Number(orderTP) : undefined,
      stopLoss: orderSL ? Number(orderSL) : undefined,
    });
    if (!result.success) setOrderError(result.error || 'Error');
    else setShowOrder(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe tabs + symbol name */}
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
        <div className="ml-auto flex gap-1 md:gap-2 flex-shrink-0">
          <button onClick={() => { setOrderType('Buy'); setShowOrder(true); }} className="buy-btn text-xs px-2 md:px-3">Купить</button>
          <button onClick={() => { setOrderType('Sell'); setShowOrder(true); }} className="sell-btn text-xs px-2 md:px-3">Продать</button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-[200px]" ref={chartRef} />

      {/* Bottom panel: positions */}
      <div className="border-t flex-shrink-0" style={{ borderColor: 'hsl(220, 20%, 20%)', background: 'hsl(220, 25%, 10%)', maxHeight: '35%', overflow: 'auto' }}>
        <div className="flex items-center justify-between px-2 md:px-3 py-2 border-b" style={{ borderColor: 'hsl(220, 20%, 20%)' }}>
          <button onClick={() => setShowPositions(!showPositions)} className="flex gap-2 items-center">
            <span className="text-xs font-medium" style={{ color: 'hsl(220, 14%, 80%)' }}>Портфель ({openPos.length})</span>
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowReport(true)} className="text-xs px-2 py-1 rounded" style={{ color: 'hsl(217, 91%, 55%)', background: 'hsl(217, 91%, 55%, 0.1)' }}>
              <Download size={12} className="inline mr-1" />Отчёт
            </button>
          </div>
        </div>
        {showPositions && (
          <>
            {/* Mobile position cards */}
            <div className="md:hidden p-2 space-y-2">
              {openPos.length === 0 && <div className="text-center py-4 text-xs" style={{ color: 'hsl(220, 14%, 40%)' }}>Нет открытых позиций</div>}
              {openPos.map(p => (
                <div key={p.id} className="rounded p-2 flex items-center justify-between" style={{ background: 'hsl(220, 25%, 12%)', border: '1px solid hsl(220, 20%, 18%)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'hsl(220, 14%, 90%)' }}>{p.symbol} <span style={{ color: p.type === 'Buy' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{p.type}</span></div>
                    <div className="text-xs" style={{ color: 'hsl(220, 14%, 50%)' }}>{p.volume} лот · {p.openPrice}</div>
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

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'hsl(220, 14%, 70%)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(220, 20%, 20%)' }}>
                    <th className="text-left px-3 py-2 font-medium">Символ</th>
                    <th className="text-left px-2 py-2 font-medium">Тип</th>
                    <th className="text-right px-2 py-2 font-medium">Объем</th>
                    <th className="text-right px-2 py-2 font-medium">Цена откр.</th>
                    <th className="text-right px-2 py-2 font-medium">Текущая</th>
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
                    <tr><td colSpan={8} className="text-center py-4" style={{ color: 'hsl(220, 14%, 40%)' }}>Нет открытых позиций</td></tr>
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
              <div className="text-sm text-muted-foreground">{asset.description}</div>
              <div className="flex gap-2">
                <button onClick={() => setOrderType('Buy')} className={`flex-1 py-2 rounded font-semibold text-sm ${orderType === 'Buy' ? 'buy-btn' : 'bg-muted text-muted-foreground'}`}>
                  Покупка {asset.ask.toFixed(asset.precision)}
                </button>
                <button onClick={() => setOrderType('Sell')} className={`flex-1 py-2 rounded font-semibold text-sm ${orderType === 'Sell' ? 'sell-btn' : 'bg-muted text-muted-foreground'}`}>
                  Продажа {asset.bid.toFixed(asset.precision)}
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Объем (лот)</label>
                <Input type="number" step="0.01" value={orderVolume} onChange={e => setOrderVolume(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Take Profit</label><Input type="number" step="any" value={orderTP} onChange={e => setOrderTP(e.target.value)} placeholder="—" /></div>
                <div><label className="text-xs text-muted-foreground">Stop Loss</label><Input type="number" step="any" value={orderSL} onChange={e => setOrderSL(e.target.value)} placeholder="—" /></div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Свободные средства: <b>${account.freeMargin.toFixed(2)}</b></div>
                <div>Комиссия: <b>${(asset.commission * Number(orderVolume)).toFixed(2)}</b></div>
                <div>Требуемый залог: <b>${((Number(orderVolume) * asset.contractSize * (orderType === 'Buy' ? asset.ask : asset.bid) * asset.marginPercent) / 100 / account.leverage).toFixed(2)}</b></div>
              </div>
              {orderError && <div className="text-sm text-destructive font-medium">{orderError}</div>}
              <div className="flex gap-2">
                <Button onClick={handleOrder} className={orderType === 'Buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                  {orderType === 'Buy' ? 'Купить' : 'Продать'}
                </Button>
                <Button variant="outline" onClick={() => setShowOrder(false)}>Отмена</Button>
              </div>
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
                {addAssets.map(a => {
                  const inWatchlist = ctx.watchlist.includes(a.symbol);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                      <div className="min-w-0 mr-2">
                        <div className="text-sm font-medium">{a.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{a.description}</div>
                      </div>
                      <Button variant={inWatchlist ? 'outline' : 'default'} size="sm" className="h-7 flex-shrink-0"
                        onClick={() => inWatchlist ? ctx.setWatchlist((w: string[]) => w.filter(s => s !== a.symbol)) : ctx.setWatchlist((w: string[]) => [...w, a.symbol])}>
                        {inWatchlist ? <X size={12} /> : <Plus size={12} />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>Торговый отчёт</DialogTitle></DialogHeader>
          <div className="flex gap-1 mb-4 overflow-x-auto">
            {(['trades', 'deposits', 'executed'] as const).map(t => (
              <button key={t} onClick={() => setReportTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${reportTab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {t === 'trades' ? 'Торговля' : t === 'deposits' ? 'Депозиты' : 'Исполненные'}
              </button>
            ))}
          </div>

          {reportTab === 'trades' && (
            <div className="overflow-x-auto">
              <table className="data-table text-xs">
                <thead><tr className="bg-muted/30"><th>ID</th><th>Дата откр.</th><th>Тип</th><th>Символ</th><th>Объем</th><th>Цена откр.</th><th>Цена закр.</th><th>Своп</th><th>Прибыль</th></tr></thead>
                <tbody>
                  {[...openPos, ...closedPos].map(p => (
                    <tr key={p.id}>
                      <td className="text-muted-foreground">{p.id}</td>
                      <td className="text-muted-foreground whitespace-nowrap">{new Date(p.openDate).toLocaleDateString()}</td>
                      <td><span style={{ color: p.type === 'Buy' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{p.type}</span></td>
                      <td className="font-medium">{p.symbol}</td>
                      <td>{p.volume}</td>
                      <td>{p.openPrice}</td>
                      <td>{p.closePrice || p.currentPrice}</td>
                      <td>{p.swap.toFixed(2)}</td>
                      <td className={p.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {account && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-muted/30 rounded p-3 text-center"><div className="text-xs text-muted-foreground">Баланс</div><div className="font-semibold">${account.balance.toFixed(2)}</div></div>
              <div className="bg-muted/30 rounded p-3 text-center"><div className="text-xs text-muted-foreground">Прибыль</div><div className={`font-semibold ${account.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>{account.profit >= 0 ? '+' : ''}{account.profit.toFixed(2)}</div></div>
              <div className="bg-muted/30 rounded p-3 text-center"><div className="text-xs text-muted-foreground">Введено</div><div className="font-semibold">${account.deposited.toLocaleString()}</div></div>
              <div className="bg-muted/30 rounded p-3 text-center"><div className="text-xs text-muted-foreground">Снято</div><div className="font-semibold">${account.withdrawn.toLocaleString()}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
