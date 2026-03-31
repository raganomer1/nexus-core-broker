import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

export default function ClientTransfer() {
  const { auth, tradingAccounts, addPayment } = useStore();
  const { lang } = useSettingsStore();
  const accounts = tradingAccounts.filter(a => a.clientId === auth.clientId);
  const [from, setFrom] = useState(accounts[0]?.id || '');
  const [to, setTo] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);
  const fromAcc = accounts.find(a => a.id === from);

  const handleTransfer = () => { if (!from || !to || from === to || !amount) return; addPayment({ clientId: auth.clientId!, accountId: from, type: 'Transfer', amount: Number(amount), currency: 'USD', paymentMethod: 'Internal Transfer' }); setDone(true); };

  if (done) {
    return (<div className="p-4 md:p-6"><div className="max-w-md mx-auto bg-card rounded-lg border p-6 md:p-8 text-center">
      <RefreshCw size={48} className="mx-auto text-primary mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t(lang, 'transferDone')}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t(lang, 'transferProcessing')}</p>
      <Button onClick={() => { setDone(false); setAmount(''); }}>{t(lang, 'newTransfer')}</Button>
    </div></div>);
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{t(lang, 'transferBetweenAccounts')}</h1>
      <div className="max-w-lg bg-card rounded-lg border p-4 md:p-6 space-y-4">
        <div><label className="text-sm font-medium mb-1 block">{t(lang, 'from')}</label>
          <Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>#{a.accountNumber} — ${a.balance.toFixed(2)}</SelectItem>)}</SelectContent></Select></div>
        <div><label className="text-sm font-medium mb-1 block">{t(lang, 'to')}</label>
          <Select value={to} onValueChange={setTo}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{accounts.filter(a => a.id !== from).map(a => <SelectItem key={a.id} value={a.id}>#{a.accountNumber} — ${a.balance.toFixed(2)}</SelectItem>)}</SelectContent></Select></div>
        <div><label className="text-sm font-medium mb-1 block">{t(lang, 'amount')}</label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          {fromAcc && <p className="text-xs text-muted-foreground mt-1">{t(lang, 'available')}: ${fromAcc.freeMargin.toFixed(2)}</p>}</div>
        <Button onClick={handleTransfer} disabled={!from || !to || from === to || !amount}>{t(lang, 'transferBtn')}</Button>
      </div>
    </div>
  );
}
