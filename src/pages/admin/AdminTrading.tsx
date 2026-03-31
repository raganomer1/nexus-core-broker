import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminTrading() {
  const { tradingAccounts, positions, clients, assets, updatePosition, closePosition, deletePosition, updateTradingAccount, getEffectivePrice } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [editPosition, setEditPosition] = useState<any>(null);
  const [editAccount, setEditAccount] = useState<any>(null);

  const accounts = tradingAccounts.filter(a => {
    if (groupFilter !== 'All' && a.group !== groupFilter) return false;
    if (search) {
      const client = clients.find(c => c.id === a.clientId);
      const s = search.toLowerCase();
      return a.accountNumber.includes(s) || (client && (client.lastName.toLowerCase().includes(s) || client.firstName.toLowerCase().includes(s)));
    }
    return true;
  });

  const openPositions = selectedAccount ? positions.filter(p => p.accountId === selectedAccount && p.status === 'Open') : [];
  const groups = [...new Set(tradingAccounts.map(a => a.group))];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'trading')}</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={groupFilter} onValueChange={setGroupFilter}><SelectTrigger className="w-36 md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">{t(lang, 'allGroups')}</SelectItem>{groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'group')}</th><th>{t(lang, 'account')}</th><th>{t(lang, 'fullName')}</th><th className="hidden sm:table-cell">{t(lang, 'deposited')}</th><th className="hidden sm:table-cell">{t(lang, 'withdrawn')}</th><th>{t(lang, 'balance')}</th><th className="hidden md:table-cell">{t(lang, 'equity')}</th><th>{t(lang, 'profit')}</th><th className="hidden sm:table-cell">{t(lang, 'trades')}</th><th></th></tr></thead>
            <tbody>{accounts.map(a => {
              const client = clients.find(c => c.id === a.clientId);
              return (
                <tr key={a.id} className={`cursor-pointer ${selectedAccount === a.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedAccount(a.id)}>
                  <td><span className="status-badge status-new">{a.group}</span></td>
                  <td className="font-medium">{a.accountNumber}</td>
                  <td className="whitespace-nowrap">{client ? `${client.lastName} ${client.firstName}` : '—'}</td>
                  <td className="text-success hidden sm:table-cell">${a.deposited.toLocaleString()}</td>
                  <td className="text-destructive hidden sm:table-cell">${a.withdrawn.toLocaleString()}</td>
                  <td className="font-semibold">${a.balance.toFixed(2)}</td>
                  <td className="hidden md:table-cell">${a.equity.toFixed(2)}</td>
                  <td className={a.profit >= 0 ? 'text-success' : 'text-destructive'}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</td>
                  <td className="hidden sm:table-cell">{a.tradesCount}</td>
                  <td><Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditAccount({ ...a }); }}><Edit2 size={14} /></Button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>

      {selectedAccount && (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3">{t(lang, 'openPositionsFor')} — #{tradingAccounts.find(a => a.id === selectedAccount)?.accountNumber}</h2>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr className="bg-muted/30"><th>{t(lang, 'symbol')}</th><th>{t(lang, 'type')}</th><th>{t(lang, 'volume')}</th><th>{t(lang, 'openPrice')}</th><th>{t(lang, 'currentPrice')}</th><th className="hidden sm:table-cell">{t(lang, 'swap')}</th><th className="hidden sm:table-cell">{t(lang, 'commission')}</th><th>{t(lang, 'profit')}</th><th>{t(lang, 'actions')}</th></tr></thead>
                <tbody>{openPositions.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.symbol}</td>
                    <td><span className={`status-badge ${p.type === 'Buy' ? 'status-live' : 'status-hot'}`}>{p.type}</span></td>
                    <td>{p.volume}</td><td>{p.openPrice}</td><td>{p.currentPrice}</td>
                    <td className="hidden sm:table-cell">{p.swap.toFixed(2)}</td>
                    <td className="hidden sm:table-cell">{p.commission.toFixed(2)}</td>
                    <td className={p.profit >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>{p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditPosition({ ...p })}><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => closePosition(p.id)}>{t(lang, 'closePosition')}</Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {openPositions.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">{t(lang, 'noOpenPositions')}</div>}
          </div>
        </div>
      )}

      <Dialog open={!!editPosition} onOpenChange={() => setEditPosition(null)}>
        <DialogContent className="mx-4"><DialogHeader><DialogTitle>{t(lang, 'editPosition')}</DialogTitle></DialogHeader>
          {editPosition && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'symbol')}</label><Input value={editPosition.symbol} disabled /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'type')}</label><Input value={editPosition.type} disabled /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'volume')}</label><Input type="number" value={editPosition.volume} onChange={e => setEditPosition({...editPosition, volume: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'openPrice')}</label><Input type="number" value={editPosition.openPrice} onChange={e => setEditPosition({...editPosition, openPrice: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'swap')}</label><Input type="number" value={editPosition.swap} onChange={e => setEditPosition({...editPosition, swap: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'commission')}</label><Input type="number" value={editPosition.commission} onChange={e => setEditPosition({...editPosition, commission: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'takeProfit')}</label><Input type="number" value={editPosition.takeProfit||''} onChange={e => setEditPosition({...editPosition, takeProfit: Number(e.target.value)||undefined})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'stopLoss')}</label><Input type="number" value={editPosition.stopLoss||''} onChange={e => setEditPosition({...editPosition, stopLoss: Number(e.target.value)||undefined})} /></div>
              </div>
              <div className="flex gap-2"><Button onClick={() => { updatePosition(editPosition.id, editPosition); setEditPosition(null); }}>{t(lang, 'save')}</Button><Button variant="outline" onClick={() => setEditPosition(null)}>{t(lang, 'cancel')}</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto mx-4"><DialogHeader><DialogTitle>{t(lang, 'editAccount')} #{editAccount?.accountNumber}</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'group')}</label><Input value={editAccount.group} onChange={e => setEditAccount({...editAccount, group: e.target.value})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'leverage')}</label><Input type="number" value={editAccount.leverage} onChange={e => setEditAccount({...editAccount, leverage: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'stopOut')}</label><Input type="number" value={editAccount.stopOut} onChange={e => setEditAccount({...editAccount, stopOut: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'maxOrders')}</label><Input type="number" value={editAccount.maxOrders} onChange={e => setEditAccount({...editAccount, maxOrders: Number(e.target.value)})} /></div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAccount.tradingAllowed} onCheckedChange={v => setEditAccount({...editAccount, tradingAllowed: !!v})} /> {t(lang, 'tradingAllowed')}</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAccount.robotsAllowed} onCheckedChange={v => setEditAccount({...editAccount, robotsAllowed: !!v})} /> {t(lang, 'robotsAllowed')}</label>
              </div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'status')}</label>
                <Select value={editAccount.status} onValueChange={v => setEditAccount({...editAccount, status: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Blocked">Blocked</SelectItem></SelectContent></Select></div>
              <div className="flex gap-2"><Button onClick={() => { updateTradingAccount(editAccount.id, editAccount); setEditAccount(null); }}>{t(lang, 'save')}</Button><Button variant="outline" onClick={() => setEditAccount(null)}>{t(lang, 'cancel')}</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
