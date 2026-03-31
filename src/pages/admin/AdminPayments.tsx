import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Check, X, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentStatus } from '@/types';

export default function AdminPayments() {
  const { payments, clients, tradingAccounts, employees, updatePaymentStatus, auth } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Deposit' | 'Withdrawal' | 'Transfer'>('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const statusTabs: { label: string; value: PaymentStatus | 'All' }[] = [
    { label: t(lang, 'all'), value: 'All' },
    { label: t(lang, 'newPayments'), value: 'New' },
    { label: t(lang, 'pending'), value: 'Pending' },
    { label: t(lang, 'approved'), value: 'Approved' },
    { label: t(lang, 'rejected'), value: 'Rejected' },
  ];

  const typeLabel = (type: string) => type === 'Deposit' ? t(lang, 'depositType') : type === 'Withdrawal' ? t(lang, 'withdrawalType') : t(lang, 'transferType');

  const managers = useMemo(() => {
    const ids = new Set(clients.map(c => c.responsibleId).filter(Boolean));
    return employees.filter(e => ids.has(e.id));
  }, [clients, employees]);

  const filtered = useMemo(() => {
    let result = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter);
    if (typeFilter !== 'All') result = result.filter(p => p.type === typeFilter);
    if (managerFilter !== 'All') {
      result = result.filter(p => {
        const client = clients.find(c => c.id === p.clientId);
        return client?.responsibleId === managerFilter;
      });
    }
    if (dateFrom) result = result.filter(p => new Date(p.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter(p => new Date(p.createdAt) <= new Date(dateTo + 'T23:59:59'));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => {
        const client = clients.find(c => c.id === p.clientId);
        return client && (client.lastName.toLowerCase().includes(s) || client.email.toLowerCase().includes(s) || p.id.includes(s));
      });
    }
    return result;
  }, [payments, statusFilter, typeFilter, managerFilter, dateFrom, dateTo, search, clients]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'payments')}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} className="mr-1" />Фильтры</Button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {tab.label}
            <span className="ml-1 opacity-60">{tab.value === 'All' ? payments.length : payments.filter(p => p.status === tab.value).length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-muted/30 rounded-lg border">
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все типы</SelectItem>
              <SelectItem value="Deposit">Депозит</SelectItem>
              <SelectItem value="Withdrawal">Вывод</SelectItem>
              <SelectItem value="Transfer">Перевод</SelectItem>
            </SelectContent>
          </Select>
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Менеджер" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все менеджеры</SelectItem>
              {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" placeholder="От" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" placeholder="До" />
          <Button variant="ghost" size="sm" onClick={() => { setTypeFilter('All'); setManagerFilter('All'); setDateFrom(''); setDateTo(''); }}>Сброс</Button>
        </div>
      )}

      <div className="md:hidden space-y-3">
        {filtered.map(p => {
          const client = clients.find(c => c.id === p.clientId);
          return (
            <div key={p.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : p.type === 'Withdrawal' ? 'status-hot' : 'status-new'}`}>{typeLabel(p.type)}</span>
                <span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : p.status === 'Pending' ? 'status-pending' : 'status-new'}`}>{p.status}</span>
              </div>
              <div className="text-sm font-medium">{client?.lastName} {client?.firstName}</div>
              <div className="text-xs text-muted-foreground">{client?.email}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold">${p.amount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              {(p.status === 'New' || p.status === 'Pending') && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => updatePaymentStatus(p.id, 'Approved', auth.employeeId)}><Check size={14} className="mr-1" /> {t(lang, 'confirm')}</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={() => updatePaymentStatus(p.id, 'Rejected', auth.employeeId)}><X size={14} className="mr-1" /> {t(lang, 'reject')}</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>ID</th><th>{t(lang, 'date')}</th><th>{t(lang, 'client')}</th><th>{t(lang, 'account')}</th><th>{t(lang, 'method')}</th><th>{t(lang, 'type')}</th><th>{t(lang, 'amount')}</th><th>{t(lang, 'status')}</th><th>{t(lang, 'actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const client = clients.find(c => c.id === p.clientId);
                const account = tradingAccounts.find(a => a.id === p.accountId);
                return (
                  <tr key={p.id}>
                    <td className="text-xs text-muted-foreground">{p.id}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="text-sm font-medium">{client?.lastName} {client?.firstName}</div>
                      <div className="text-xs text-muted-foreground">{client?.email}</div>
                    </td>
                    <td className="text-sm">{account?.accountNumber || '—'}</td>
                    <td className="text-sm">{p.paymentMethod}</td>
                    <td><span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : p.type === 'Withdrawal' ? 'status-hot' : 'status-new'}`}>{typeLabel(p.type)}</span></td>
                    <td className="font-semibold">${p.amount.toLocaleString()}</td>
                    <td><span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : p.status === 'Pending' ? 'status-pending' : 'status-new'}`}>{p.status}</span></td>
                    <td>
                      {(p.status === 'New' || p.status === 'Pending') && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => updatePaymentStatus(p.id, 'Approved', auth.employeeId)}><Check size={14} /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-yellow-600" onClick={() => updatePaymentStatus(p.id, 'Pending', auth.employeeId)}><Clock size={14} /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => updatePaymentStatus(p.id, 'Rejected', auth.employeeId)}><X size={14} /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">Показано {filtered.length} из {payments.length}</div>
      </div>
    </div>
  );
}
