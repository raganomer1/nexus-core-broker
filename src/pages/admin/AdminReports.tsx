import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminReports() {
  const { clients, tradingAccounts, positions, payments } = useStore();
  const { lang } = useSettingsStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'all' | 'custom'>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const now = Date.now();
  let periodMs: number;
  if (period === 'custom' && dateFrom && dateTo) {
    periodMs = now; // will use custom logic below
  } else {
    periodMs = period === 'week' ? 7 * 86400000 : period === 'month' ? 30 * 86400000 : Infinity;
  }

  const inPeriod = (dateStr: string) => {
    if (period === 'all') return true;
    if (period === 'custom' && dateFrom && dateTo) {
      const d = new Date(dateStr).getTime();
      return d >= new Date(dateFrom).getTime() && d <= new Date(dateTo + 'T23:59:59').getTime();
    }
    return (now - new Date(dateStr).getTime()) < periodMs;
  };

  const totalDeposits = payments.filter(p => p.status === 'Approved' && p.type === 'Deposit' && inPeriod(p.createdAt)).reduce((s, p) => s + p.amount, 0);
  const totalWithdrawals = payments.filter(p => p.status === 'Approved' && p.type === 'Withdrawal' && inPeriod(p.createdAt)).reduce((s, p) => s + p.amount, 0);
  const totalBalance = tradingAccounts.reduce((s, a) => s + a.balance, 0);
  const totalEquity = tradingAccounts.reduce((s, a) => s + a.equity, 0);
  const totalProfit = tradingAccounts.reduce((s, a) => s + a.profit, 0);
  const openPositionsCount = positions.filter(p => p.status === 'Open').length;
  const closedPositionsCount = positions.filter(p => p.status === 'Closed' && inPeriod(p.closeDate || '')).length;

  const stats = [
    { label: t(lang, 'totalClients'), value: clients.length },
    { label: t(lang, 'totalAccounts'), value: tradingAccounts.length },
    { label: t(lang, 'totalBalance'), value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { label: t(lang, 'totalEquity'), value: `$${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { label: t(lang, 'totalProfit'), value: `$${totalProfit.toFixed(2)}`, color: totalProfit >= 0 },
    { label: t(lang, 'depositsForPeriod'), value: `$${totalDeposits.toLocaleString()}` },
    { label: t(lang, 'withdrawalsForPeriod'), value: `$${totalWithdrawals.toLocaleString()}` },
    { label: t(lang, 'openPositionsCount'), value: openPositionsCount },
    { label: t(lang, 'closedForPeriod'), value: closedPositionsCount },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'reportsTitle')}</h1>
        <Button variant="outline" size="sm"><Download size={14} className="mr-1" /> {t(lang, 'download')}</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['week', 'month', 'all', 'custom'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {p === 'week' ? t(lang, 'week') : p === 'month' ? t(lang, 'month') : p === 'all' ? t(lang, 'allTime') : 'Произвольный'}
          </button>
        ))}
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 h-8 text-xs" />
            <span className="text-xs text-muted-foreground">—</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 h-8 text-xs" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-lg border p-3 md:p-5">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">{s.label}</div>
            <div className={`text-lg md:text-2xl font-bold ${'color' in s ? (s.color ? 'text-green-600' : 'text-destructive') : ''}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-base md:text-lg font-semibold mb-3">{t(lang, 'topAccountsByEquity')}</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'account')}</th><th>{t(lang, 'client')}</th><th>{t(lang, 'group')}</th><th>{t(lang, 'balance')}</th><th>{t(lang, 'equity')}</th><th>{t(lang, 'profit')}</th></tr></thead>
            <tbody>
              {[...tradingAccounts].sort((a, b) => b.equity - a.equity).slice(0, 10).map(a => {
                const client = clients.find(c => c.id === a.clientId);
                return (
                  <tr key={a.id}>
                    <td className="font-medium">{a.accountNumber}</td>
                    <td className="whitespace-nowrap">{client?.lastName} {client?.firstName}</td>
                    <td><span className="status-badge status-new">{a.group}</span></td>
                    <td>${a.balance.toFixed(2)}</td>
                    <td className="font-semibold">${a.equity.toFixed(2)}</td>
                    <td className={a.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</td>
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
