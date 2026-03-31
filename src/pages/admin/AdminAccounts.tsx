import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Plus, Edit2, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminAccounts() {
  const { tradingAccounts, clients, employees, addTradingAccount, updateTradingAccount, deleteTradingAccount } = useStore();
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

  const handleCreate = () => {
    if (!form.clientId) return;
    const num = `${form.isDemo ? 'D' : ''}${Math.floor(100000 + Math.random() * 900000)}`;
    addTradingAccount({ ...form, accountNumber: num });
    setShowCreate(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'accounts')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} className="mr-1" />Фильтры</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'newAccount')}</Button>
        </div>
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
          <Select value={demoFilter} onValueChange={v => setDemoFilter(v as any)}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все</SelectItem>
              <SelectItem value="Real">Real</SelectItem>
              <SelectItem value="Demo">Demo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Менеджер" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все менеджеры</SelectItem>
              {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('All'); setDemoFilter('All'); setManagerFilter('All'); }}>Сброс</Button>
        </div>
      )}

      <div className="md:hidden space-y-3">
        {filtered.map(a => {
          const client = clients.find(c => c.id === a.clientId);
          return (
            <div key={a.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div><span className="font-medium">{a.accountNumber}</span>{a.isDemo && <span className="text-xs text-muted-foreground ml-1">(Demo)</span>}</div>
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${a.status === 'Active' ? 'status-live' : a.status === 'Blocked' ? 'status-rejected' : 'status-pending'}`}>{a.status}</span>
                  <Button variant="ghost" size="sm" onClick={() => setEditAccount({ ...a })}><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { deleteTradingAccount(a.id); }}><Trash2 size={14} /></Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{client ? `${client.lastName} ${client.firstName}` : '—'}</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>{t(lang, 'balance')}: <b>${a.balance.toFixed(2)}</b></div>
                <div>{t(lang, 'equity')}: <b>${a.equity.toFixed(2)}</b></div>
                <div className={a.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{t(lang, 'profit')}: {a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</div>
                <div>{t(lang, 'leverage')}: 1:{a.leverage}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'account')}</th><th>{t(lang, 'client')}</th><th>{t(lang, 'group')}</th><th>{t(lang, 'leverage')}</th><th>{t(lang, 'balance')}</th><th>{t(lang, 'equity')}</th><th>{t(lang, 'margin')}</th><th>{t(lang, 'freeMargin')}</th><th>{t(lang, 'profit')}</th><th>{t(lang, 'status')}</th><th></th></tr></thead>
            <tbody>
              {filtered.map(a => {
                const client = clients.find(c => c.id === a.clientId);
                return (
                  <tr key={a.id}>
                    <td className="font-medium">{a.accountNumber} {a.isDemo && <span className="text-xs text-muted-foreground">(Demo)</span>}</td>
                    <td className="whitespace-nowrap">{client ? `${client.lastName} ${client.firstName}` : '—'}</td>
                    <td><span className="status-badge status-new">{a.group}</span></td>
                    <td>1:{a.leverage}</td>
                    <td className="font-semibold">${a.balance.toFixed(2)}</td>
                    <td>${a.equity.toFixed(2)}</td>
                    <td>${a.margin.toFixed(2)}</td>
                    <td>${a.freeMargin.toFixed(2)}</td>
                    <td className={a.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</td>
                    <td><span className={`status-badge ${a.status === 'Active' ? 'status-live' : a.status === 'Blocked' ? 'status-rejected' : 'status-pending'}`}>{a.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditAccount({ ...a })}><Edit2 size={13} /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteTradingAccount(a.id)}><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">Показано {filtered.length} из {tradingAccounts.length}</div>
      </div>

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
                <Button onClick={() => { updateTradingAccount(editAccount.id, editAccount); setEditAccount(null); }}>{t(lang, 'save')}</Button>
                <Button variant="outline" onClick={() => setEditAccount(null)}>{t(lang, 'cancel')}</Button>
                <Button variant="destructive" className="ml-auto" onClick={() => { deleteTradingAccount(editAccount.id); setEditAccount(null); }}><Trash2 size={14} className="mr-1" /> Удалить</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
