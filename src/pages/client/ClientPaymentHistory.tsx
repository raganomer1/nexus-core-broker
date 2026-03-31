import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentRequest } from '@/types';

export default function ClientPaymentHistory() {
  const { auth, payments, tradingAccounts } = useStore();
  const { lang } = useSettingsStore();
  const [detail, setDetail] = useState<PaymentRequest | null>(null);
  const clientPayments = payments.filter(p => p.clientId === auth.clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const typeLabel = (type: string) => type === 'Deposit' ? t(lang, 'depositType') : type === 'Withdrawal' ? t(lang, 'withdrawalType') : t(lang, 'transferType');

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right ml-4">{value || '—'}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'paymentHistory')}</h1>
      <div className="md:hidden space-y-3">
        {clientPayments.length === 0 && <div className="text-center text-muted-foreground py-6">{t(lang, 'noPayments')}</div>}
        {clientPayments.map(p => {
          const acc = tradingAccounts.find(a => a.id === p.accountId);
          return (
            <div key={p.id} className="bg-card rounded-lg border p-4 space-y-1 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setDetail(p)}>
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
                  <tr key={p.id} className="cursor-pointer hover:bg-muted/20" onClick={() => setDetail(p)}>
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

      {/* Payment Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Детали платежа</DialogTitle></DialogHeader>
          {detail && (() => {
            const acc = tradingAccounts.find(a => a.id === detail.accountId);
            return (
              <div className="space-y-1">
                <InfoRow label="ID" value={detail.id} />
                <InfoRow label="Дата" value={new Date(detail.createdAt).toLocaleString()} />
                <InfoRow label="Счёт" value={acc?.accountNumber} />
                <InfoRow label="Тип" value={typeLabel(detail.type)} />
                <InfoRow label="Сумма" value={`$${detail.amount.toLocaleString()} ${detail.currency}`} />
                <InfoRow label="Метод" value={detail.paymentMethod} />
                <InfoRow label="Статус" value={detail.status} />
                {detail.processedAt && <InfoRow label="Обработан" value={new Date(detail.processedAt).toLocaleString()} />}
                {detail.comment && (
                  <div className="pt-2 border-t mt-2">
                    <p className="text-xs text-muted-foreground">{detail.comment}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
