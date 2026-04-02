import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Edit2, X, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';
import { ResizableTh } from '@/components/ResizableTableHeader';

export default function AdminTrading() {
  const { tradingAccounts, positions, clients, payments, updatePosition, closePosition, deletePosition, updateTradingAccount, getEffectivePrice, simulatePriceMovement } = useStore();
  const { lang } = useSettingsStore();

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => { simulatePriceMovement(); }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sorting
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const sortIcon = (field: string) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  // Filters
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All');
  const [withdrawnFilter, setWithdrawnFilter] = useState('All');
  const [profitFilter, setProfitFilter] = useState('All');
  const [demoFilter, setDemoFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(true);

  // Selected account & position edit
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [editPosition, setEditPosition] = useState<any>(null);
  const [editAccount, setEditAccount] = useState<any>(null);

  // TP/SL toggles for edit dialog
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);

  const groups = useMemo(() => [...new Set(tradingAccounts.map(a => a.group))], [tradingAccounts]);

  const filtered = useMemo(() => {
    let result = [...tradingAccounts];
    if (groupFilter !== 'All') result = result.filter(a => a.group === groupFilter);
    if (demoFilter !== 'All') {
      if (demoFilter === 'Real') result = result.filter(a => !a.isDemo);
      else result = result.filter(a => a.isDemo);
    }
    if (balanceFilter !== 'All') {
      if (balanceFilter === '>0') result = result.filter(a => a.balance > 0);
      else if (balanceFilter === '=0') result = result.filter(a => a.balance === 0);
    }
    if (withdrawnFilter !== 'All') {
      if (withdrawnFilter === '>0') result = result.filter(a => a.withdrawn > 0);
      else if (withdrawnFilter === '=0') result = result.filter(a => a.withdrawn === 0);
    }
    if (profitFilter !== 'All') {
      if (profitFilter === '>0') result = result.filter(a => a.profit > 0);
      else if (profitFilter === '<0') result = result.filter(a => a.profit < 0);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a => {
        const client = clients.find(c => c.id === a.clientId);
        return a.accountNumber.includes(s) || (client && (client.lastName.toLowerCase().includes(s) || client.firstName.toLowerCase().includes(s)));
      });
    }
    return result;
  }, [tradingAccounts, groupFilter, demoFilter, balanceFilter, withdrawnFilter, profitFilter, search, clients]);

  const { paginated, page, setPage, perPage, setPerPage, totalPages } = useTableControls(filtered);

  const selectedAcc = tradingAccounts.find(a => a.id === selectedAccount);
  const accountPositions = selectedAccount ? positions.filter(p => p.accountId === selectedAccount && p.status === 'Open') : [];

  const getMarginDeposit = (pos: any) => {
    return (pos.openPrice * pos.volume * 100000 / (selectedAcc?.leverage || 100)).toFixed(2);
  };

  const openEditPosition = (p: any) => {
    setEditPosition({ ...p });
    setTpEnabled(!!p.takeProfit);
    setSlEnabled(!!p.stopLoss);
  };

  const handleSavePosition = () => {
    if (!editPosition) return;
    const updates = {
      volume: editPosition.volume,
      openPrice: editPosition.openPrice,
      openDate: editPosition.openDate,
      swap: editPosition.swap,
      commission: editPosition.commission,
      takeProfit: tpEnabled ? editPosition.takeProfit : undefined,
      stopLoss: slEnabled ? editPosition.stopLoss : undefined,
    };
    updatePosition(editPosition.id, updates);
    setEditPosition(null);
  };

  const resetFilters = () => {
    setGroupFilter('All'); setBalanceFilter('All'); setWithdrawnFilter('All'); setProfitFilter('All'); setDemoFilter('All'); setSearch('');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'trading')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const rows = filtered.map(a => {
              const client = clients.find(c => c.id === a.clientId);
              return { 'Группа': a.group, 'Номер': a.accountNumber, 'ФИО': client ? `${client.lastName} ${client.firstName}` : '', 'Демо': a.isDemo ? 'Да' : 'Нет', 'Депозиты': a.deposited, 'Выводы': a.withdrawn, 'Сделки': a.tradesCount, 'Прибыль': a.profit, 'Средства': a.equity };
            });
            const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Торговля'); XLSX.writeFile(wb, `trading_${new Date().toISOString().slice(0,10)}.xlsx`);
          }}><Download size={14} className="mr-1" />Экспорт</Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} className="mr-1" />Фильтры
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/30 rounded-lg border items-end">
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Группа</label>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Средства</label>
            <Select value={balanceFilter} onValueChange={setBalanceFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                <SelectItem value=">0">&gt; 0</SelectItem>
                <SelectItem value="=0">= 0</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Выводил</label>
            <Select value={withdrawnFilter} onValueChange={setWithdrawnFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                <SelectItem value=">0">Да</SelectItem>
                <SelectItem value="=0">Нет</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Торгует прибыльно</label>
            <Select value={profitFilter} onValueChange={setProfitFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                <SelectItem value=">0">Да</SelectItem>
                <SelectItem value="<0">Нет</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Демо/Реальный</label>
            <Select value={demoFilter} onValueChange={setDemoFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                <SelectItem value="Real">Реальный</SelectItem>
                <SelectItem value="Demo">Демо</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Поиск</label>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Имя или номер счёта" value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-8 text-xs" />
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetFilters}>Сброс</Button>
        </div>
      )}

      {/* Accounts table */}
      <div className="bg-card rounded-lg border overflow-hidden mb-1">
        <div className="overflow-x-auto">
          <table className="data-table text-xs" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr className="bg-muted/30">
                <ResizableTh className="whitespace-nowrap" initialWidth={120}>Группа</ResizableTh>
                <ResizableTh className="whitespace-nowrap" initialWidth={80}>Номер</ResizableTh>
                <ResizableTh className="whitespace-nowrap" initialWidth={140}>Ф.И.О</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={100}>Введено</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={80}>Снято</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={130}>Введено/выведено</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={100}>Ввод-вывод</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={70}>Сделки</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={110}>Уровень средств</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={120}>Потрачено бонусов</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={90}>Прибыль</ResizableTh>
                <ResizableTh className="whitespace-nowrap text-right" initialWidth={90}>Средства</ResizableTh>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => {
                const client = clients.find(c => c.id === a.clientId);
                const netDeposit = a.deposited - a.withdrawn;
                const depositWithdrawnRatio = `${a.deposited.toFixed(2)}/${a.withdrawn.toFixed(2)}`;
                const marginLevel = a.margin > 0 ? ((a.equity / a.margin) * 100).toFixed(2) : '0.00';
                const isSelected = selectedAccount === a.id;
                return (
                  <tr key={a.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 font-medium' : 'hover:bg-muted/20'}`}
                    onClick={() => setSelectedAccount(a.id)}
                  >
                    <td><span className="text-xs px-1.5 py-0.5 rounded bg-muted">{a.group} ({a.isDemo ? 'demo' : 'live'})</span></td>
                    <td className="font-medium">{a.accountNumber}</td>
                    <td className="whitespace-nowrap">{client ? `${client.lastName} ${client.firstName}` : '—'}</td>
                    <td className="text-right tabular-nums">{a.deposited.toFixed(2)}</td>
                    <td className="text-right tabular-nums">{a.withdrawn.toFixed(2)}</td>
                    <td className="text-right tabular-nums text-muted-foreground">{depositWithdrawnRatio}</td>
                    <td className="text-right tabular-nums">{netDeposit.toFixed(2)}</td>
                    <td className="text-right tabular-nums">{a.tradesCount}</td>
                    <td className="text-right tabular-nums">{marginLevel}</td>
                    <td className="text-right tabular-nums">{a.bonusSpent.toFixed(2)}</td>
                    <td className={`text-right tabular-nums font-medium ${a.profit > 0 ? 'text-emerald-500' : a.profit < 0 ? 'text-red-500' : ''}`}>
                      {a.profit.toFixed(2)}
                    </td>
                    <td className="text-right tabular-nums font-semibold">{a.equity.toFixed(2)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditAccount({ ...a })} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Edit2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
          <span>Всего счетов: {filtered.length}</span>
          <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
        </div>
      </div>

      {/* Positions for selected account */}
      {selectedAccount && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold mb-2">
            Торговля — {selectedAcc?.accountNumber}
          </h2>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table text-xs" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr className="bg-muted/30">
                    <ResizableTh initialWidth={100}>Символ</ResizableTh>
                    <ResizableTh initialWidth={80}>Номер</ResizableTh>
                    <ResizableTh initialWidth={100}>Тип</ResizableTh>
                    <ResizableTh className="text-right" initialWidth={90}>Объем</ResizableTh>
                    <ResizableTh className="text-right" initialWidth={120}>Цена открытия</ResizableTh>
                    <ResizableTh className="text-right" initialWidth={120}>Текущая цена</ResizableTh>
                    <ResizableTh className="text-right" initialWidth={100}>Прибыль</ResizableTh>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {accountPositions.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted-foreground py-6">Нет открытых позиций</td></tr>
                  ) : accountPositions.map(p => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.symbol}</td>
                      <td className="text-muted-foreground">{p.id}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 ${p.type === 'Buy' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {p.type === 'Buy' ? '↑' : '↓'} {p.type === 'Buy' ? 'Покупка' : 'Продажа'}
                        </span>
                      </td>
                      <td className="text-right tabular-nums">{p.volume.toFixed(2)} лот</td>
                      <td className="text-right tabular-nums">{p.openPrice}</td>
                      <td className="text-right tabular-nums">{p.currentPrice}</td>
                      <td className={`text-right tabular-nums font-medium ${p.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}
                      </td>
                      <td>
                        <div className="flex gap-0.5 justify-end">
                          <button onClick={() => openEditPosition(p)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Изменить">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => closePosition(p.id)} className="p-1 rounded hover:bg-muted text-red-500" title="Закрыть">
                            <X size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Dialog — matching reference screenshot */}
      <Dialog open={!!editPosition} onOpenChange={() => setEditPosition(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Изменить позицию #{editPosition?.id}</DialogTitle>
          </DialogHeader>
          {editPosition && (() => {
            const currentPrice = getEffectivePrice(editPosition.symbol);
            const price = editPosition.type === 'Buy' ? currentPrice.bid : currentPrice.ask;
            const pipDiff = editPosition.type === 'Buy'
              ? (price - editPosition.openPrice)
              : (editPosition.openPrice - price);
            const calcProfit = pipDiff * editPosition.volume * 100000;
            const marginVal = (editPosition.openPrice * editPosition.volume * 100000 / (selectedAcc?.leverage || 100));

            return (
              <div className="space-y-4">
                {/* Symbol header */}
                <div className="flex items-center gap-2 text-base font-semibold">
                  <span>{editPosition.symbol}</span>
                  <span className={editPosition.type === 'Buy' ? 'text-emerald-600' : 'text-red-500'}>
                    {editPosition.type === 'Buy' ? '▲ Покупка' : '▼ Продажа'}
                  </span>
                </div>

                {/* Row 1: Volume, Open Price, Open Date */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Объем (лот)</label>
                    <Input type="number" value={editPosition.volume} step="0.01" min="0.01"
                      onChange={e => setEditPosition({ ...editPosition, volume: Number(e.target.value) })} className="h-9" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Цена открытия</label>
                    <Input type="number" value={editPosition.openPrice} step="0.00001"
                      onChange={e => setEditPosition({ ...editPosition, openPrice: Number(e.target.value) })} className="h-9" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Дата открытия</label>
                    <Input type="date" value={editPosition.openDate?.split('T')[0] || ''}
                      onChange={e => setEditPosition({ ...editPosition, openDate: e.target.value + 'T' + (editPosition.openDate?.split('T')[1] || '00:00:00') })} className="h-9" />
                  </div>
                </div>

                {/* Margin info */}
                <div className="text-xs text-muted-foreground">
                  Залог: <span className="font-medium text-foreground">${marginVal.toFixed(2)}</span>
                </div>

                {/* Row 2: Swap, Commission, Open Time */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Своп (USD)</label>
                    <Input type="number" value={editPosition.swap} step="0.01"
                      onChange={e => setEditPosition({ ...editPosition, swap: Number(e.target.value) })} className="h-9" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Комиссия (USD)</label>
                    <Input type="number" value={editPosition.commission} step="0.01"
                      onChange={e => setEditPosition({ ...editPosition, commission: Number(e.target.value) })} className="h-9" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Время открытия</label>
                    <Input type="time" value={editPosition.openDate?.split('T')[1]?.substring(0, 5) || '00:00'}
                      onChange={e => setEditPosition({ ...editPosition, openDate: (editPosition.openDate?.split('T')[0] || '2026-01-01') + 'T' + e.target.value + ':00' })} className="h-9" />
                  </div>
                </div>

                {/* TP / SL */}
                <div className="border-t pt-3">
                  <div className="text-xs font-medium mb-2">Ограничения</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-xs mb-1.5">
                        <Checkbox checked={tpEnabled} onCheckedChange={v => setTpEnabled(!!v)} />
                        Take Profit
                      </label>
                      {tpEnabled && (
                        <Input type="number" value={editPosition.takeProfit || ''} step="0.00001" placeholder="—"
                          onChange={e => setEditPosition({ ...editPosition, takeProfit: Number(e.target.value) || undefined })} className="h-9" />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs mb-1.5">
                        <Checkbox checked={slEnabled} onCheckedChange={v => setSlEnabled(!!v)} />
                        Stop Loss
                      </label>
                      {slEnabled && (
                        <Input type="number" value={editPosition.stopLoss || ''} step="0.00001" placeholder="—"
                          onChange={e => setEditPosition({ ...editPosition, stopLoss: Number(e.target.value) || undefined })} className="h-9" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Current price & profit display */}
                <div className="border-t pt-3 flex items-center gap-6 text-sm">
                  <div>
                    Текущая цена: <span className="font-semibold tabular-nums">{price.toFixed(5)}</span>
                  </div>
                  <div>
                    Прибыль: <span className={`font-semibold tabular-nums ${calcProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {calcProfit >= 0 ? '+' : ''}${calcProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button onClick={handleSavePosition}>Изменить</Button>
                  <Button variant="outline" onClick={() => setEditPosition(null)}>Отмена</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Редактировать счёт #{editAccount?.accountNumber}</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Группа</label><Input value={editAccount.group} onChange={e => setEditAccount({ ...editAccount, group: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Плечо</label><Input type="number" value={editAccount.leverage} onChange={e => setEditAccount({ ...editAccount, leverage: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">Stop Out (%)</label><Input type="number" value={editAccount.stopOut} onChange={e => setEditAccount({ ...editAccount, stopOut: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">Макс. ордеров</label><Input type="number" value={editAccount.maxOrders} onChange={e => setEditAccount({ ...editAccount, maxOrders: Number(e.target.value) })} /></div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAccount.tradingAllowed} onCheckedChange={v => setEditAccount({ ...editAccount, tradingAllowed: !!v })} /> Торговля разрешена</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAccount.robotsAllowed} onCheckedChange={v => setEditAccount({ ...editAccount, robotsAllowed: !!v })} /> Роботы разрешены</label>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Статус</label>
                <Select value={editAccount.status} onValueChange={v => setEditAccount({ ...editAccount, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={() => { updateTradingAccount(editAccount.id, editAccount); setEditAccount(null); }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditAccount(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
