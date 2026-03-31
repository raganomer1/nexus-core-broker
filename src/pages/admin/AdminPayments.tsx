import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Check, X, Clock, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentStatus } from '@/types';

export default function AdminPayments() {
  const { payments, clients, tradingAccounts, updatePaymentStatus, auth } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');

  const statusTabs: { label: string; value: PaymentStatus | 'All' }[] = [
    { label: t(lang, 'all'), value: 'All' },
    { label: t(lang, 'newPayments'), value: 'New' },
    { label: t(lang, 'pending'), value: 'Pending' },
    { label: t(lang, 'approved'), value: 'Approved' },
    { label: t(lang, 'rejected'), value: 'Rejected' },
  ];

  const typeLabel = (type: string) => type === 'Deposit' ? t(lang, 'depositType') : type === 'Withdrawal' ? t(lang, 'withdrawalType') : t(lang, 'transferType');

  const filtered = useMemo(() => {
    let result = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => {
        const client = clients.find(c => c.id === p.clientId);
        return client && (client.lastName.toLowerCase().includes(s) || client.email.toLowerCase().includes(s) || p.id.includes(s));
      });
    }
    return result;
  }, [payments, statusFilter, search, clients]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'payments')}</h1>

      <div className="flex gap-1 mb-4 flex-wrap">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {tab.label}
            <span className="ml-1 opacity-60">{tab.value === 'All' ? payments.length : payments.filter(p => p.status === tab.value).length}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

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
      </div>
    </div>
  );
}
