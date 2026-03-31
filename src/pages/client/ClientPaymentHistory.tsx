import React from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';

export default function ClientPaymentHistory() {
  const { auth, payments, tradingAccounts } = useStore();
  const { lang } = useSettingsStore();
  const clientPayments = payments.filter(p => p.clientId === auth.clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const typeLabel = (type: string) => type === 'Deposit' ? t(lang, 'depositType') : type === 'Withdrawal' ? t(lang, 'withdrawalType') : t(lang, 'transferType');

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'paymentHistory')}</h1>
      <div className="md:hidden space-y-3">
        {clientPayments.length === 0 && <div className="text-center text-muted-foreground py-6">{t(lang, 'noPayments')}</div>}
        {clientPayments.map(p => {
          const acc = tradingAccounts.find(a => a.id === p.accountId);
          return (
            <div key={p.id} className="bg-card rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : p.type === 'Withdrawal' ? 'status-hot' : 'status-new'}`}>{typeLabel(p.type)}</span>
                <span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : p.status === 'Pending' ? 'status-pending' : 'status-new'}`}>{p.status}</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{p.paymentMethod}</span><span className="font-semibold">${p.amount.toLocaleString()}</span></div>
              <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()} · {t(lang, 'account')}: {acc?.accountNumber || '—'}</div>
            </div>
          );
        })}
      </div>
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>ID</th><th>{t(lang, 'date')}</th><th>{t(lang, 'account')}</th><th>{t(lang, 'type')}</th><th>{t(lang, 'method')}</th><th>{t(lang, 'amount')}</th><th>{t(lang, 'status')}</th></tr></thead>
            <tbody>
              {clientPayments.length === 0 ? (<tr><td colSpan={7} className="text-center text-muted-foreground py-6">{t(lang, 'noPayments')}</td></tr>) : clientPayments.map(p => {
                const acc = tradingAccounts.find(a => a.id === p.accountId);
                return (
                  <tr key={p.id}>
                    <td className="text-xs text-muted-foreground">{p.id}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</td>
                    <td>{acc?.accountNumber || '—'}</td>
                    <td><span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : p.type === 'Withdrawal' ? 'status-hot' : 'status-new'}`}>{typeLabel(p.type)}</span></td>
                    <td className="text-sm">{p.paymentMethod}</td>
                    <td className="font-semibold">${p.amount.toLocaleString()}</td>
                    <td><span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : p.status === 'Pending' ? 'status-pending' : 'status-new'}`}>{p.status}</span></td>
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
