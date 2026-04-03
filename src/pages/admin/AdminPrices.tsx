import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Edit2, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminPrices() {
  const { assets, manualOverrides, setManualPrice, resetManualPrice, checkOverrideExpiry, simulatePriceMovement, auth } = useStore();
  const { lang } = useSettingsStore();
  const [editSymbol, setEditSymbol] = useState<any>(null);
  const [newBid, setNewBid] = useState('');
  const [newAsk, setNewAsk] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => { simulatePriceMovement(); checkOverrideExpiry(); setNow(Date.now()); }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return '00:00';
    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSetPrice = () => {
    if (!editSymbol || !newBid || !newAsk) return;
    setManualPrice(editSymbol.id, Number(newBid), Number(newAsk), auth.employeeId || '');
    setEditSymbol(null);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-2">{t(lang, 'pricesManual')}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t(lang, 'pricesDescription')}</p>

      <div className="md:hidden space-y-3">
        {assets.filter(a => a.isActive).map(a => {
          const override = manualOverrides.find(o => o.symbolId === a.id && o.isActive);
          const isUp = a.prevBid !== undefined ? a.bid > a.prevBid : true;
          return (
            <div key={a.id} className={`bg-card rounded-lg border p-4 ${override ? 'border-warning/50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{a.symbol}</span>
                <div className="flex items-center gap-2">
                   {override && (<div className="flex items-center gap-1"><AlertTriangle size={12} className="text-warning" /><span className="text-xs font-mono text-warning">{getTimeRemaining(override.expiresAt)}</span><Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => resetManualPrice(a.id)} title="Сбросить"><RotateCcw size={12} /></Button></div>)}
                  <Button variant="ghost" size="sm" onClick={() => { setEditSymbol(a); setNewBid(a.bid.toString()); setNewAsk(a.ask.toString()); }}><Edit2 size={14} /></Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={`font-mono font-semibold ${isUp ? 'text-success' : 'text-destructive'}`}>{a.bid.toFixed(a.precision)}</span>
                <span className="font-mono text-muted-foreground">{a.ask.toFixed(a.precision)}</span>
                <span className="text-xs text-muted-foreground">Spread: {(a.ask - a.bid).toFixed(a.precision)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'symbol')}</th><th>{t(lang, 'description')}</th><th>Bid</th><th>Ask</th><th>Spread</th><th>{t(lang, 'swapLong')}</th><th>{t(lang, 'swapShort')}</th><th>{t(lang, 'calcType')}</th><th>{t(lang, 'precision')}</th><th>Override</th><th></th></tr></thead>
            <tbody>{assets.filter(a => a.isActive).map(a => {
              const override = manualOverrides.find(o => o.symbolId === a.id && o.isActive);
              const isUp = a.prevBid !== undefined ? a.bid > a.prevBid : true;
              return (
                <tr key={a.id} className={override ? 'bg-warning/5' : ''}>
                  <td className="font-medium">{a.symbol}</td>
                  <td className="text-sm text-muted-foreground">{a.description}</td>
                  <td className={`font-mono font-semibold ${isUp ? 'text-success' : 'text-destructive'}`}>{a.bid.toFixed(a.precision)}</td>
                  <td className="font-mono">{a.ask.toFixed(a.precision)}</td>
                  <td className="text-sm">{(a.ask - a.bid).toFixed(a.precision)}</td>
                  <td className="text-sm">{a.swapLong}</td><td className="text-sm">{a.swapShort}</td>
                  <td className="text-xs">{a.calcType}</td><td className="text-xs">{a.precision}</td>
                  <td>{override && (<div className="flex items-center gap-1"><AlertTriangle size={12} className="text-warning" /><span className="text-xs font-mono text-warning">{getTimeRemaining(override.expiresAt)}</span><Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => resetManualPrice(a.id)} title="Сбросить"><RotateCcw size={12} /></Button></div>)}</td>
                  <td><Button variant="ghost" size="sm" onClick={() => { setEditSymbol(a); setNewBid(a.bid.toString()); setNewAsk(a.ask.toString()); }}><Edit2 size={14} /></Button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editSymbol} onOpenChange={() => setEditSymbol(null)}>
        <DialogContent className="mx-4"><DialogHeader><DialogTitle>{t(lang, 'changePrice')} — {editSymbol?.symbol}</DialogTitle></DialogHeader>
          {editSymbol && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <div>{t(lang, 'currentBid')}: <b>{editSymbol.bid.toFixed(editSymbol.precision)}</b></div>
                <div>{t(lang, 'currentAsk')}: <b>{editSymbol.ask.toFixed(editSymbol.precision)}</b></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'newBid')}</label><Input type="number" step="any" value={newBid} onChange={e => setNewBid(e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'newAsk')}</label><Input type="number" step="any" value={newAsk} onChange={e => setNewAsk(e.target.value)} /></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={12} /> {t(lang, 'priceActiveFor')}</div>
              <div className="flex gap-2"><Button onClick={handleSetPrice}>{t(lang, 'apply')}</Button><Button variant="outline" onClick={() => setEditSymbol(null)}>{t(lang, 'cancel')}</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
