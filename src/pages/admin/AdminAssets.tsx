import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Edit2, Search, Ban, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminAssets() {
  const { assets, updateAsset } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [editAsset, setEditAsset] = useState<any>(null);

  const categories = [...new Set(assets.map(a => a.category))];
  const filtered = assets.filter(a => {
    if (catFilter !== 'All' && a.category !== catFilter) return false;
    if (search) return a.symbol.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'assetsInstruments')}</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-40 md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">{t(lang, 'allCategories')}</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{a.symbol}</span>
              <div className="flex items-center gap-2">
                {a.tradingAllowed ? <Check size={14} className="text-success" /> : <Ban size={14} className="text-destructive" />}
                <Button variant="ghost" size="sm" onClick={() => setEditAsset({...a})}><Edit2 size={14} /></Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{a.description}</div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div><span className="text-muted-foreground">Spread:</span> {a.spreadBid}/{a.spreadAsk}</div>
              <div><span className="text-muted-foreground">Swap:</span> {a.swapLong}/{a.swapShort}</div>
              <div><span className="text-muted-foreground">{t(lang, 'commission')}:</span> {a.commission}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'symbol')}</th><th>{t(lang, 'description')}</th><th>{t(lang, 'calcType')}</th><th>{t(lang, 'group')}</th><th>{t(lang, 'spreadBid')}</th><th>{t(lang, 'spreadAsk')}</th><th>{t(lang, 'stopLevel')}</th><th>{t(lang, 'gapLevel')}</th><th>{t(lang, 'swapLong')}</th><th>{t(lang, 'swapShort')}</th><th>{t(lang, 'commission')}</th><th>{t(lang, 'trading')}</th><th></th></tr></thead>
            <tbody>{filtered.map(a => (
              <tr key={a.id}>
                <td className="font-medium">{a.symbol}</td><td className="text-sm text-muted-foreground">{a.description}</td>
                <td><span className="status-badge status-new">{a.calcType}</span></td><td className="text-sm">{a.groupName}</td>
                <td>{a.spreadBid}</td><td>{a.spreadAsk}</td><td>{a.stopLevel}</td><td>{a.gapLevel}</td>
                <td>{a.swapLong}</td><td>{a.swapShort}</td><td>{a.commission}</td>
                <td>{a.tradingAllowed ? <Check size={14} className="text-success" /> : <Ban size={14} className="text-destructive" />}</td>
                <td><Button variant="ghost" size="sm" onClick={() => setEditAsset({...a})}><Edit2 size={14} /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editAsset} onOpenChange={() => setEditAsset(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto mx-4"><DialogHeader><DialogTitle>{t(lang, 'editAsset')} {editAsset?.symbol}</DialogTitle></DialogHeader>
          {editAsset && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'description')}</label><Input value={editAsset.description} onChange={e => setEditAsset({...editAsset, description: e.target.value})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'group')}</label><Input value={editAsset.groupName} onChange={e => setEditAsset({...editAsset, groupName: e.target.value})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'spreadBid')}</label><Input type="number" step="any" value={editAsset.spreadBid} onChange={e => setEditAsset({...editAsset, spreadBid: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'spreadAsk')}</label><Input type="number" step="any" value={editAsset.spreadAsk} onChange={e => setEditAsset({...editAsset, spreadAsk: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'stopLevel')}</label><Input type="number" value={editAsset.stopLevel} onChange={e => setEditAsset({...editAsset, stopLevel: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'gapLevel')}</label><Input type="number" value={editAsset.gapLevel} onChange={e => setEditAsset({...editAsset, gapLevel: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'swapLong')}</label><Input type="number" step="any" value={editAsset.swapLong} onChange={e => setEditAsset({...editAsset, swapLong: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'swapShort')}</label><Input type="number" step="any" value={editAsset.swapShort} onChange={e => setEditAsset({...editAsset, swapShort: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'commission')}</label><Input type="number" step="any" value={editAsset.commission} onChange={e => setEditAsset({...editAsset, commission: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'contractSize')}</label><Input type="number" value={editAsset.contractSize} onChange={e => setEditAsset({...editAsset, contractSize: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'marginPercent')}</label><Input type="number" step="any" value={editAsset.marginPercent} onChange={e => setEditAsset({...editAsset, marginPercent: Number(e.target.value)})} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'precision')}</label><Input type="number" value={editAsset.precision} onChange={e => setEditAsset({...editAsset, precision: Number(e.target.value)})} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAsset.tradingAllowed} onCheckedChange={v => setEditAsset({...editAsset, tradingAllowed: !!v})} /> {t(lang, 'tradingAllowed')}</label>
              <div className="flex gap-2"><Button onClick={() => { updateAsset(editAsset.id, editAsset); setEditAsset(null); }}>{t(lang, 'save')}</Button><Button variant="outline" onClick={() => setEditAsset(null)}>{t(lang, 'cancel')}</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
