import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';

export default function ClientWithdraw() {
  const { auth, tradingAccounts, paymentMethods, addPayment } = useStore();
  const { lang } = useSettingsStore();
  const accounts = tradingAccounts.filter(a => a.clientId === auth.clientId && !a.isDemo);
  const activeMethods = paymentMethods.filter(m => m.isActive);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const account = accounts.find(a => a.id === accountId);

  const handleSubmit = () => { if (!accountId || !method || !amount || !wallet) return; addPayment({ clientId: auth.clientId!, accountId, type: 'Withdrawal', amount: Number(amount), currency: 'USD', paymentMethod: method, wallet, comment }); setSubmitted(true); };

  if (submitted) {
    return (<div className="p-4 md:p-6"><div className="max-w-md mx-auto bg-card rounded-lg border p-6 md:p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">{t(lang, 'withdrawRequestCreated')}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t(lang, 'withdrawRequestProcessing')}</p>
      <Button onClick={() => { setSubmitted(false); setAmount(''); setWallet(''); }}>{t(lang, 'newWithdraw')}</Button>
    </div></div>);
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{t(lang, 'withdrawFunds')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg border p-4 md:p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'account')}</label>
            <Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>#{a.accountNumber} — ${a.balance.toFixed(2)}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'paymentMethod')}</label>
            <Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue placeholder={t(lang, 'selectOption')} /></SelectTrigger>
              <SelectContent>{activeMethods.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'amountUSD')}</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            {account && <p className="text-xs text-muted-foreground mt-1">{t(lang, 'available')}: ${account.freeMargin.toFixed(2)}</p>}</div>
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'walletDetails')}</label><Input value={wallet} onChange={e => setWallet(e.target.value)} placeholder={t(lang, 'walletPlaceholder')} /></div>
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'comment')}</label><Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={t(lang, 'additionalInfo')} /></div>
          <Button onClick={handleSubmit} disabled={!accountId || !method || !amount || !wallet}>{t(lang, 'continue')}</Button>
        </div>
        <div className="bg-card rounded-lg border p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3"><Info size={18} className="text-primary" /><h3 className="font-semibold text-sm">{t(lang, 'withdrawInfo')}</h3></div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• {t(lang, 'withdrawProcessingTime')}</li>
            <li>• {t(lang, 'withdrawMinAmount')}</li>
            <li>• {t(lang, 'withdrawSameDetails')}</li>
            <li>• {t(lang, 'withdrawVerification')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
