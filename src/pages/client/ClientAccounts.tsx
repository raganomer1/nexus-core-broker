import React from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ClientAccounts() {
  const navigate = useNavigate();
  const { auth, tradingAccounts } = useStore();
  const { lang } = useSettingsStore();
  const accounts = tradingAccounts.filter(a => a.clientId === auth.clientId);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'myAccounts')}</h1>
        {/* open account button removed for clients */}
      </div>
      <div className="md:hidden space-y-3">
        {accounts.map(a => (
          <div key={a.id} className="bg-card rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between"><span className="font-semibold">#{a.accountNumber}</span><span className={`status-badge ${a.isDemo ? 'status-demo' : 'status-live'}`}>{a.isDemo ? 'Demo' : 'Real'}</span></div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground text-xs">{t(lang, 'group')}</span><div>{a.group}</div></div>
              <div><span className="text-muted-foreground text-xs">{t(lang, 'leverage')}</span><div>1:{a.leverage}</div></div>
              <div><span className="text-muted-foreground text-xs">{t(lang, 'balance')}</span><div className="font-semibold">${a.balance.toFixed(2)}</div></div>
              <div><span className="text-muted-foreground text-xs">{t(lang, 'equity')}</span><div>${a.equity.toFixed(2)}</div></div>
              <div><span className="text-muted-foreground text-xs">{t(lang, 'freeMargin')}</span><div>${a.freeMargin.toFixed(2)}</div></div>
              <div><span className="text-muted-foreground text-xs">{t(lang, 'profit')}</span><div className={a.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</div></div>
            </div>
            <div className="flex items-center justify-between pt-1"><span className={`status-badge ${a.status === 'Active' ? 'status-live' : 'status-rejected'}`}>{a.status}</span></div>
          </div>
        ))}
      </div>
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>#</th><th>{t(lang, 'type')}</th><th>{t(lang, 'group')}</th><th>{t(lang, 'leverage')}</th><th>{t(lang, 'balance')}</th><th>{t(lang, 'equity')}</th><th>{t(lang, 'margin')}</th><th>{t(lang, 'freeMargin')}</th><th>{t(lang, 'profit')}</th><th>{t(lang, 'status')}</th></tr></thead>
            <tbody>{accounts.map(a => (
              <tr key={a.id}>
                <td className="font-medium">{a.accountNumber}</td>
                <td><span className={`status-badge ${a.isDemo ? 'status-demo' : 'status-live'}`}>{a.isDemo ? 'Demo' : 'Real'}</span></td>
                <td>{a.group}</td><td>1:{a.leverage}</td>
                <td className="font-semibold">${a.balance.toFixed(2)}</td><td>${a.equity.toFixed(2)}</td><td>${a.margin.toFixed(2)}</td><td>${a.freeMargin.toFixed(2)}</td>
                <td className={a.profit >= 0 ? 'text-green-600' : 'text-destructive'}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</td>
                <td><span className={`status-badge ${a.status === 'Active' ? 'status-live' : 'status-rejected'}`}>{a.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
