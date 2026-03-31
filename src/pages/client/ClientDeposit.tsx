import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownCircle, MessageSquare } from 'lucide-react';

export default function ClientDeposit() {
  const { auth, tradingAccounts, paymentMethods, addPayment } = useStore();
  const { lang } = useSettingsStore();
  const accounts = tradingAccounts.filter(a => a.clientId === auth.clientId);
  const activeMethods = paymentMethods.filter(m => m.isActive);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const selectedMethod = activeMethods.find(m => m.name === method);
  const commission = selectedMethod?.commission ? (Number(amount) * selectedMethod.commission / 100) : 0;

  const handleSubmit = () => { if (!accountId || !method || !amount) return; addPayment({ clientId: auth.clientId!, accountId, type: 'Deposit', amount: Number(amount), currency: 'USD', paymentMethod: method, creditAmount: Number(amount) - commission }); setSubmitted(true); };

  if (submitted) {
    return (<div className="p-4 md:p-6"><div className="max-w-md mx-auto bg-card rounded-lg border p-6 md:p-8 text-center">
      <ArrowDownCircle size={48} className="mx-auto text-green-600 mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t(lang, 'requestCreated')}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t(lang, 'depositRequestSent')}</p>
      <Button onClick={() => { setSubmitted(false); setAmount(''); }}>{t(lang, 'newDeposit')}</Button>
    </div></div>);
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{t(lang, 'accountDeposit')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg border p-4 md:p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'account')}</label>
            <Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>#{a.accountNumber} ({a.group}) — ${a.balance.toFixed(2)}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'paymentMethod')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {activeMethods.map(m => (<button key={m.id} onClick={() => setMethod(m.name)} className={`p-3 rounded-lg border text-sm text-left transition-colors ${method === m.name ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                <div className="font-medium">{m.name}</div>
                {m.commission ? <div className="text-xs text-muted-foreground">{t(lang, 'commissionLabel')}: {m.commission}%</div> : <div className="text-xs text-green-600">{t(lang, 'noCommission')}</div>}
              </button>))}
            </div></div>
          <div><label className="text-sm font-medium mb-1 block">{t(lang, 'amountUSD')}</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            {selectedMethod?.minAmount && <p className="text-xs text-muted-foreground mt-1">{t(lang, 'min')}: ${selectedMethod.minAmount} · {t(lang, 'max')}: ${selectedMethod.maxAmount?.toLocaleString()}</p>}</div>
          {commission > 0 && <div className="text-sm text-muted-foreground">{t(lang, 'commissionLabel')}: ${commission.toFixed(2)} · {t(lang, 'toCredit')}: ${(Number(amount) - commission).toFixed(2)}</div>}
          <Button onClick={handleSubmit} disabled={!accountId || !method || !amount}>{t(lang, 'depositBtn')}</Button>
        </div>
        <div className="bg-card rounded-lg border p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3"><MessageSquare size={18} className="text-primary" /><h3 className="font-semibold text-sm">{t(lang, 'reportPayment')}</h3></div>
          <p className="text-sm text-muted-foreground mb-3">{t(lang, 'reportPaymentDesc')}</p>
          <Button variant="outline" size="sm" className="w-full">{t(lang, 'report')}</Button>
        </div>
      </div>
    </div>
  );
}
