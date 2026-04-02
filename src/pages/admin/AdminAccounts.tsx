import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Plus, Edit2, Filter, Trash2, DollarSign, FileText, CreditCard, Copy, X, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';

export default function AdminAccounts() {
  const navigate = useNavigate();
  const { tradingAccounts, clients, employees, positions, payments, addTradingAccount, updateTradingAccount, deleteTradingAccount, addPayment, addHistoryEvent, auth } = useStore();
  const { state: confirmState, confirmDelete, close: closeConfirm } = useConfirmDelete();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [demoFilter, setDemoFilter] = useState<'All' | 'Real' | 'Demo'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId: '', group: 'Standard', leverage: 100, stopOut: 50, maxOrders: 200, minDeposit: 100, balance: 0, equity: 0, margin: 0, freeMargin: 0, profit: 0, bonus: 0, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: false, showBonus: false, spendBonus: false, status: 'Active' as const, deposited: 0, withdrawn: 0, tradesCount: 0, bonusSpent: 0, accountNumber: '' });

  // Deposit/Withdraw dialog
  const [fundAccount, setFundAccount] = useState<any>(null);
  const [fundTab, setFundTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [fundAmount, setFundAmount] = useState('');
  const [fundComment, setFundComment] = useState('Deposited by manager');
  const [fundCreatePayment, setFundCreatePayment] = useState(true);
  const [fundMethod, setFundMethod] = useState('manager');

  // Reports dialog
  const [reportAccount, setReportAccount] = useState<any>(null);

  // Deposits history dialog
  const [depositsAccount, setDepositsAccount] = useState<any>(null);

  const groups = [...new Set(tradingAccounts.map(a => a.group))];
  const managers = useMemo(() => {
    const ids = new Set(clients.map(c => c.responsibleId).filter(Boolean));
    return employees.filter(e => ids.has(e.id));
  }, [clients, employees]);

  const filtered = useMemo(() => {
    return tradingAccounts.filter(a => {
      if (groupFilter !== 'All' && a.group !== groupFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (demoFilter === 'Real' && a.isDemo) return false;
      if (demoFilter === 'Demo' && !a.isDemo) return false;
      if (managerFilter !== 'All') {
        const client = clients.find(c => c.id === a.clientId);
        if (client?.responsibleId !== managerFilter) return false;
      }
      if (search) {
        const client = clients.find(c => c.id === a.clientId);
        const q = search.toLowerCase();
        return a.accountNumber.includes(q) || (client && (client.lastName.toLowerCase().includes(q) || client.firstName.toLowerCase().includes(q)));
      }
      return true;
    });
  }, [tradingAccounts, groupFilter, statusFilter, demoFilter, managerFilter, search, clients]);

  const { paginated, page, setPage, perPage, setPerPage, totalPages } = useTableControls(filtered);

  const handleCreate = () => {
    if (!form.clientId) return;
    const num = `${form.isDemo ? 'D' : ''}${Math.floor(100000 + Math.random() * 900000)}`;
    addTradingAccount({ ...form, accountNumber: num });
    setShowCreate(false);
  };

  const handleFund = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) { toast.error('Введите сумму'); return; }
    if (!fundAccount) return;

    const client = clients.find(c => c.id === fundAccount.clientId);
    const isDeposit = fundTab === 'deposit';

    if (!isDeposit && amount > fundAccount.balance) {
      toast.error('Недостаточно средств на счёте');
      return;
    }

    // Update account balance
    const newBalance = isDeposit ? fundAccount.balance + amount : fundAccount.balance - amount;
    const newEquity = isDeposit ? fundAccount.equity + amount : fundAccount.equity - amount;
    const newFreeMargin = isDeposit ? fundAccount.freeMargin + amount : fundAccount.freeMargin - amount;
    const updates: any = {
      balance: newBalance,
      equity: newEquity,
      freeMargin: newFreeMargin,
    };
    if (isDeposit) updates.deposited = (fundAccount.deposited || 0) + amount;
    else updates.withdrawn = (fundAccount.withdrawn || 0) + amount;

    updateTradingAccount(fundAccount.id, updates);

    // Create payment record if checkbox is checked
    if (fundCreatePayment) {
      addPayment({
        clientId: fundAccount.clientId,
        accountId: fundAccount.id,
        type: isDeposit ? 'Deposit' : 'Withdrawal',
        amount,
        currency: fundAccount.currency || 'USD',
        paymentMethod: fundMethod === 'manager' ? 'Пополнение менеджером' : fundMethod,
        comment: fundComment,
      });
    }

    // History event
    if (auth.employeeId) {
      addHistoryEvent({
        clientId: fundAccount.clientId,
        clientName: client ? `${client.lastName} ${client.firstName}` : '',
        section: 'Payments',
        authorId: auth.employeeId,
        authorName: (() => { const e = employees.find(emp => emp.id === auth.employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })(),
        source: 'Employee',
        description: `${isDeposit ? 'Пополнение' : 'Вывод'} ${amount} ${fundAccount.currency || 'USD'} — счёт ${fundAccount.accountNumber}. ${fundComment}`,
      });
    }

    toast.success(`${isDeposit ? 'Пополнено' : 'Выведено'}: ${amount} ${fundAccount.currency || 'USD'}`);
    setFundAccount(null);
    setFundAmount('');
    setFundComment('Deposited by manager');
  };

  const openFund = (a: any, tab: 'deposit' | 'withdraw') => {
    setFundAccount(a);
    setFundTab(tab);
    setFundAmount('');
    setFundComment(tab === 'deposit' ? 'Deposited by manager' : 'Withdrawn by manager');
    setFundCreatePayment(true);
    setFundMethod('manager');
  };

  // Get positions for an account
  const getAccountPositions = (accountId: string) => positions.filter(p => p.accountId === accountId);

  // Get payments for an account
  const getAccountPayments = (accountId: string) => payments.filter(p => p.accountId === accountId);

  const ActionIcons = ({ a }: { a: any }) => (
    <div className="flex gap-0.5">
      <button onClick={() => openFund(a, 'deposit')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Пополнить/Вывести">
        <DollarSign size={14} />
      </button>
      <button onClick={() => setReportAccount(a)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Отчёт">
        <FileText size={14} />
      </button>
      <button onClick={() => setDepositsAccount(a)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Депозиты">
        <CreditCard size={14} />
      </button>
      <button onClick={() => setEditAccount({ ...a })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Редактировать">
        <Edit2 size={14} />
      </button>
      <button onClick={() => confirmDelete('Удаление счёта', `Удалить счёт ${a.accountNumber}?`, () => { deleteTradingAccount(a.id); toast.success('Счёт удалён'); })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Удалить">
        <X size={14} />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'accounts')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const rows = filtered.map(a => {
              const client = clients.find(c => c.id === a.clientId);
              return { 'Счёт': a.accountNumber, 'ФИО': client ? `${client.lastName} ${client.firstName}` : '', 'Email': client?.email || '', 'Тип': a.isDemo ? 'Demo' : 'Real', 'Группа': a.group, 'Плечо': `1:${a.leverage}`, 'Баланс': a.balance, 'Бонус': a.bonus || 0, 'Депозиты': a.deposited, 'Выводы': a.withdrawn, 'Прибыль': a.profit, 'Статус': a.status, 'Создан': new Date(a.createdAt).toLocaleDateString('ru') };
            });
            import('@/lib/xlsxUtils').then(m => { const XLSX = require('xlsx'); const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Счета'); XLSX.writeFile(wb, `accounts_${new Date().toISOString().slice(0,10)}.xlsx`); });
          }}><Download size={14} className="mr-1" />Экспорт</Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} className="mr-1" />Фильтры</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'newAccount')}</Button>
        </div>
      </div>

      {/* Tabs Real/Demo */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setDemoFilter(demoFilter === 'Real' ? 'All' : 'Real')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${demoFilter === 'Real' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Реальные
        </button>
        <button onClick={() => setDemoFilter(demoFilter === 'Demo' ? 'All' : 'Demo')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${demoFilter === 'Demo' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Демо
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-36 md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t(lang, 'allGroups')}</SelectItem>
            {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-muted/30 rounded-lg border">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Статус" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все статусы</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Менеджер" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все менеджеры</SelectItem>
              {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('All'); setManagerFilter('All'); }}>Сброс</Button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(a => {
          const client = clients.find(c => c.id === a.clientId);
          return (
            <div key={a.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div><span className="font-medium">{a.accountNumber}</span>{a.isDemo && <span className="text-xs text-muted-foreground ml-1">(Demo)</span>}</div>
                <span className={`status-badge ${a.status === 'Active' ? 'status-live' : a.status === 'Blocked' ? 'status-rejected' : 'status-pending'}`}>{a.status}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{client ? `${client.lastName} ${client.firstName}` : '—'}</div>
              <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                <div>{t(lang, 'balance')}: <b>${a.balance.toFixed(2)}</b></div>
                <div>{t(lang, 'equity')}: <b>${a.equity.toFixed(2)}</b></div>
                <div className={a.profit >= 0 ? 'text-emerald-600' : 'text-destructive'}>{t(lang, 'profit')}: {a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</div>
                <div>{t(lang, 'leverage')}: 1:{a.leverage}</div>
              </div>
              <ActionIcons a={a} />
            </div>
          );
        })}
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Счет</th>
                <th>ФИО</th>
                <th>Email</th>
                <th>Тип счета</th>
                <th>Создан</th>
                <th>Плечо</th>
                <th className="text-right">Баланс</th>
                <th className="text-right">Бонусы</th>
                <th className="w-36"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => {
                const client = clients.find(c => c.id === a.clientId);
                return (
                  <tr key={a.id}>
                    <td className="font-medium">{a.accountNumber}</td>
                    <td className="whitespace-nowrap">
                      {client ? (
                        <span className="text-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${client.id}`); }}>{client.lastName} {client.firstName}</span>
                      ) : '—'}
                    </td>
                    <td className="text-sm text-muted-foreground">{client?.email || '—'}</td>
                    <td>{a.isDemo ? 'Demo' : 'Real'} ({a.currency || 'USD'})</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString('ru-RU')} {new Date(a.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>1:{a.leverage}</td>
                    <td className="text-right font-semibold">{a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right">{(a.bonus || 0).toFixed(2)}</td>
                    <td><ActionIcons a={a} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Create Account Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>{t(lang, 'newAccount')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">{t(lang, 'client')} *</label>
              <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                <SelectTrigger><SelectValue placeholder={t(lang, 'selectClient')} /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.lastName} {c.firstName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{t(lang, 'group')}</label><Input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'leverage')}</label><Input type="number" value={form.leverage} onChange={e => setForm({ ...form, leverage: Number(e.target.value) })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.isDemo} onCheckedChange={v => setForm({ ...form, isDemo: !!v })} /> {t(lang, 'demoAccount')}</label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>{t(lang, 'cancel')}</Button>
              <Button onClick={handleCreate}>{t(lang, 'create')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>{t(lang, 'edit')} #{editAccount?.accountNumber}</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'group')}</label><Input value={editAccount.group} onChange={e => setEditAccount({ ...editAccount, group: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'leverage')}</label><Input type="number" value={editAccount.leverage} onChange={e => setEditAccount({ ...editAccount, leverage: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'stopOut')}</label><Input type="number" value={editAccount.stopOut} onChange={e => setEditAccount({ ...editAccount, stopOut: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'maxOrders')}</label><Input type="number" value={editAccount.maxOrders} onChange={e => setEditAccount({ ...editAccount, maxOrders: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">Баланс</label><Input type="number" value={editAccount.balance} onChange={e => setEditAccount({ ...editAccount, balance: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">Бонус</label><Input type="number" value={editAccount.bonus || 0} onChange={e => setEditAccount({ ...editAccount, bonus: Number(e.target.value) })} /></div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAccount.tradingAllowed} onCheckedChange={v => setEditAccount({ ...editAccount, tradingAllowed: !!v })} /> {t(lang, 'tradingAllowed')}</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAccount.robotsAllowed} onCheckedChange={v => setEditAccount({ ...editAccount, robotsAllowed: !!v })} /> {t(lang, 'robotsAllowed')}</label>
              </div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'status')}</label>
                <Select value={editAccount.status} onValueChange={v => setEditAccount({ ...editAccount, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Blocked">Blocked</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={() => { updateTradingAccount(editAccount.id, editAccount); setEditAccount(null); toast.success('Счёт обновлён'); }}>{t(lang, 'save')}</Button>
                <Button variant="outline" onClick={() => setEditAccount(null)}>{t(lang, 'cancel')}</Button>
                <Button variant="destructive" className="ml-auto" onClick={() => confirmDelete('Удаление счёта', `Удалить счёт ${editAccount.accountNumber}?`, () => { deleteTradingAccount(editAccount.id); setEditAccount(null); toast.success('Счёт удалён'); })}><Trash2 size={14} className="mr-1" /> Удалить</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deposit/Withdraw Dialog */}
      <Dialog open={!!fundAccount} onOpenChange={() => setFundAccount(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Пополнить / Вывести</DialogTitle></DialogHeader>
          {fundAccount && (() => {
            const client = clients.find(c => c.id === fundAccount.clientId);
            return (
              <div className="space-y-5">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button onClick={() => { setFundTab('deposit'); setFundComment('Deposited by manager'); }}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${fundTab === 'deposit' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    Пополнить счет
                  </button>
                  <button onClick={() => { setFundTab('withdraw'); setFundComment('Withdrawn by manager'); }}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${fundTab === 'withdraw' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    Вывести со счета
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-muted-foreground w-32 shrink-0">Клиент</label>
                    <span className="text-sm font-medium">{client ? `${client.firstName} ${client.lastName}` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-muted-foreground w-32 shrink-0">Счет</label>
                    <span className="text-sm font-medium">{fundAccount.accountNumber}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-muted-foreground w-32 shrink-0">Текущий баланс</label>
                    <span className="text-sm font-semibold">{fundAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {fundAccount.currency || 'USD'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-muted-foreground w-32 shrink-0">Сумма <span className="text-destructive">*</span></label>
                    <div className="flex-1 flex items-center gap-2">
                      <Input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0" className="flex-1" min="0" step="0.01" />
                      <span className="text-sm text-muted-foreground">{fundAccount.currency || 'USD'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Комментарий к {fundTab === 'deposit' ? 'депозитной' : 'выводной'} операции <span className="text-destructive">*</span>
                    </label>
                    <Textarea value={fundComment} onChange={e => setFundComment(e.target.value)} rows={3} />
                    <p className="text-xs text-muted-foreground mt-1">Комментарий будет виден трейдеру</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={fundCreatePayment} onCheckedChange={v => setFundCreatePayment(!!v)} />
                    Создать заявку по платежу со статусом исполнена
                  </label>
                  {fundCreatePayment && (
                    <div className="flex items-center gap-4 pl-6 border-l-2 border-border">
                      <label className="text-sm text-muted-foreground w-32 shrink-0">Платёжный метод</label>
                      <Select value={fundMethod} onValueChange={setFundMethod}>
                        <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Пополнение менеджером</SelectItem>
                          <SelectItem value="bank">Банковский перевод</SelectItem>
                          <SelectItem value="crypto">Криптовалюта</SelectItem>
                          <SelectItem value="card">Банковская карта</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={handleFund}>{fundTab === 'deposit' ? 'Пополнить' : 'Вывести'}</Button>
                  <Button variant="outline" onClick={() => setFundAccount(null)}>Отмена</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Trading Report Dialog */}
      <Dialog open={!!reportAccount} onOpenChange={() => setReportAccount(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Отчёт по счёту #{reportAccount?.accountNumber}</DialogTitle></DialogHeader>
          {reportAccount && (() => {
            const acctPositions = getAccountPositions(reportAccount.id);
            const openPos = acctPositions.filter(p => p.status === 'Open');
            const closedPos = acctPositions.filter(p => p.status === 'Closed');
            const totalProfit = closedPos.reduce((s, p) => s + (p.profit || 0), 0);
            return (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Баланс</div>
                    <div className="text-lg font-bold">${reportAccount.balance.toFixed(2)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Equity</div>
                    <div className="text-lg font-bold">${reportAccount.equity.toFixed(2)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Открытых</div>
                    <div className="text-lg font-bold">{openPos.length}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Прибыль (закр.)</div>
                    <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}</div>
                  </div>
                </div>

                {/* Open positions */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Открытые позиции ({openPos.length})</h3>
                  {openPos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет открытых позиций</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="data-table text-xs">
                        <thead><tr className="bg-muted/30"><th>Инструмент</th><th>Тип</th><th>Объём</th><th>Цена открытия</th><th>Текущая</th><th>P&L</th></tr></thead>
                        <tbody>
                          {openPos.map(p => (
                            <tr key={p.id}>
                              <td className="font-medium">{p.symbol}</td>
                              <td><span className={p.type === 'Buy' ? 'text-emerald-600' : 'text-destructive'}>{p.type}</span></td>
                              <td>{p.volume}</td>
                              <td>{p.openPrice.toFixed(5)}</td>
                              <td>{(p.currentPrice || p.openPrice).toFixed(5)}</td>
                              <td className={`font-medium ${(p.profit || 0) >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{(p.profit || 0) >= 0 ? '+' : ''}{(p.profit || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Closed positions */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Закрытые позиции ({closedPos.length})</h3>
                  {closedPos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет закрытых позиций</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="data-table text-xs">
                        <thead><tr className="bg-muted/30"><th>Инструмент</th><th>Тип</th><th>Объём</th><th>Открытие</th><th>Закрытие</th><th>P&L</th></tr></thead>
                        <tbody>
                          {closedPos.slice(0, 50).map(p => (
                            <tr key={p.id}>
                              <td className="font-medium">{p.symbol}</td>
                              <td><span className={p.type === 'Buy' ? 'text-emerald-600' : 'text-destructive'}>{p.type}</span></td>
                              <td>{p.volume}</td>
                              <td>{p.openPrice.toFixed(5)}</td>
                              <td>{(p.closePrice || 0).toFixed(5)}</td>
                              <td className={`font-medium ${(p.profit || 0) >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{(p.profit || 0) >= 0 ? '+' : ''}{(p.profit || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Deposits History Dialog */}
      <Dialog open={!!depositsAccount} onOpenChange={() => setDepositsAccount(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Депозиты — счёт #{depositsAccount?.accountNumber}</DialogTitle></DialogHeader>
          {depositsAccount && (() => {
            const acctPayments = getAccountPayments(depositsAccount.id);
            const deposits = acctPayments.filter(p => p.type === 'Deposit');
            const withdrawals = acctPayments.filter(p => p.type === 'Withdrawal');
            const totalDep = deposits.reduce((s, p) => s + p.amount, 0);
            const totalWith = withdrawals.reduce((s, p) => s + p.amount, 0);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Всего пополнений</div>
                    <div className="text-lg font-bold text-emerald-600">${totalDep.toFixed(2)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Всего выводов</div>
                    <div className="text-lg font-bold text-destructive">${totalWith.toFixed(2)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Нетто</div>
                    <div className={`text-lg font-bold ${(totalDep - totalWith) >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>${(totalDep - totalWith).toFixed(2)}</div>
                  </div>
                </div>

                {acctPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет операций по этому счёту</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table text-xs">
                      <thead><tr className="bg-muted/30"><th>Дата</th><th>Тип</th><th>Сумма</th><th>Метод</th><th>Статус</th><th>Комментарий</th></tr></thead>
                      <tbody>
                        {acctPayments.map(p => (
                          <tr key={p.id}>
                            <td className="whitespace-nowrap">{new Date(p.createdAt).toLocaleString('ru-RU')}</td>
                            <td><span className={p.type === 'Deposit' ? 'text-emerald-600 font-medium' : 'text-destructive font-medium'}>{p.type === 'Deposit' ? 'Пополнение' : 'Вывод'}</span></td>
                            <td className="font-semibold">{p.type === 'Deposit' ? '+' : '-'}{p.amount.toFixed(2)} {p.currency}</td>
                            <td>{p.paymentMethod || '—'}</td>
                            <td><span className={`status-badge ${p.status === 'Approved' ? 'status-live' : p.status === 'Pending' ? 'status-pending' : 'status-rejected'}`}>{p.status}</span></td>
                            <td className="text-muted-foreground">{(p as any).comment || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-center pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => { setDepositsAccount(null); openFund(depositsAccount, 'deposit'); }}>
                    <DollarSign size={14} className="mr-1" /> Пополнить
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog state={confirmState} onClose={closeConfirm} />
    </div>
  );
}
