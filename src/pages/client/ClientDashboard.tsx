import React from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { auth, tradingAccounts, payments } = useStore();
  const { lang } = useSettingsStore();
  const accounts = tradingAccounts.filter(a => a.clientId === auth.clientId);
  const recentPayments = payments.filter(p => p.clientId === auth.clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'tradingAccountsTitle')}</h1>
        {/* open account button removed for clients */}
      </div>
      {accounts.length === 0 ? (
        <div className="bg-card rounded-lg border p-6 md:p-8 text-center">
          <CreditCard size={48} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">{t(lang, 'noActiveAccounts')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t(lang, 'openAccountToStart')}</p>
          {/* open account button removed */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {accounts.map(a => (
            <div key={a.id} className="bg-card rounded-lg border p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div><div className="text-sm font-semibold">#{a.accountNumber}</div><span className={`status-badge text-xs ${a.isDemo ? 'status-demo' : 'status-live'}`}>{a.isDemo ? 'Demo' : a.group}</span></div>
                <CreditCard size={24} className="text-muted-foreground" />
              </div>
              <div className="mb-4">
                <div className="text-xl md:text-2xl font-bold">${a.balance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{t(lang, 'equity')}: ${a.equity.toFixed(2)}</div>
                <div className={`text-sm font-medium ${a.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)} USD</div>
              </div>
              {a.balance === 0 && !a.isDemo && (<div className="mb-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">{t(lang, 'depositToStart')}</div>)}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate('/terminal')}><TrendingUp size={14} className="mr-1" /> {t(lang, 'terminal')}</Button>
                <Button size="sm" className="flex-1 text-xs" onClick={() => navigate('/client/payments/deposit')}><ArrowDownCircle size={14} className="mr-1" /> {t(lang, 'deposit')}</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-base md:text-lg font-semibold mb-3">{t(lang, 'recentPaymentsTitle')}</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'date')}</th><th>{t(lang, 'type')}</th><th>{t(lang, 'method')}</th><th>{t(lang, 'amount')}</th><th>{t(lang, 'status')}</th></tr></thead>
            <tbody>
              {recentPayments.length === 0 ? (<tr><td colSpan={5} className="text-center text-muted-foreground py-6">{t(lang, 'noPayments')}</td></tr>) : recentPayments.map(p => (
                <tr key={p.id}>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : 'status-hot'}`}>{p.type === 'Deposit' ? t(lang, 'depositType') : t(lang, 'withdrawalType')}</span></td>
                  <td className="text-sm">{p.paymentMethod}</td>
                  <td className="font-semibold">${p.amount.toLocaleString()}</td>
                  <td><span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : 'status-pending'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
