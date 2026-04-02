import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Edit2, Search, Ban, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { toast } from 'sonner';

const defaultNewAsset = {
  symbol: '', description: '', category: 'Currencies' as any, calcType: 'Forex' as any,
  groupName: '', spreadBid: 0, spreadAsk: 0, stopLevel: 0, gapLevel: 0,
  swapLong: 0, swapShort: 0, tradingAllowed: true, contractSize: 100000,
  marginPercent: 1, precision: 5, hedgeMargin: 0, spreadType: 'Variable' as any,
  marginCurrency: 'USD', profitCurrency: 'USD', commission: 0, bid: 0, ask: 0,
  isActive: true, quotesPackage: '',
};

export default function AdminAssets() {
  const { assets, addAsset, updateAsset, deleteAsset } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [editAsset, setEditAsset] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newAsset, setNewAsset] = useState({ ...defaultNewAsset });
  const { state: confirmState, confirmDelete, close: closeConfirm } = useConfirmDelete();

  const categories = [...new Set(assets.map(a => a.category))];
  const allCategories = ['Currencies', 'Commodities', 'Crypto', 'Indices', 'US Stocks', 'EU Stocks', 'RU Stocks', 'Asian Stocks'];
  const filtered = assets.filter(a => {
    if (catFilter !== 'All' && a.category !== catFilter) return false;
    if (search) return a.symbol.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const handleSave = () => {
    if (!editAsset) return;
    updateAsset(editAsset.id, editAsset);
    setEditAsset(null);
    toast.success('Актив обновлён');
  };

  const handleCreate = () => {
    if (!newAsset.symbol) { toast.error('Укажите символ'); return; }
    addAsset({ ...newAsset, bid: newAsset.bid || 1, ask: newAsset.ask || 1 });
    setShowCreate(false);
    setNewAsset({ ...defaultNewAsset });
    toast.success(`Актив ${newAsset.symbol} добавлен`);
  };

  const Field = ({ label, field, type = 'text', step, obj, setObj }: { label: string; field: string; type?: string; step?: string; obj: any; setObj: (v: any) => void }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input type={type} step={step} value={obj?.[field] ?? ''}
        onChange={e => setObj({ ...obj, [field]: type === 'number' ? Number(e.target.value) : e.target.value })} />
    </div>
  );

  const AssetForm = ({ asset, setAsset, onSave, saveLabel }: { asset: any; setAsset: (v: any) => void; onSave: () => void; saveLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Пакет котировок" field="quotesPackage" obj={asset} setObj={setAsset} />
        <div>
          <label className="text-xs text-muted-foreground">Группа символов</label>
          <Select value={asset.category} onValueChange={v => setAsset({ ...asset, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Обозначение" field="symbol" obj={asset} setObj={setAsset} />
        <Field label="Группа" field="groupName" obj={asset} setObj={setAsset} />
      </div>
      <Field label="Описание" field="description" obj={asset} setObj={setAsset} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Своп шорт" field="swapShort" type="number" step="any" obj={asset} setObj={setAsset} />
        <div>
          <label className="text-xs text-muted-foreground">Тип спреда</label>
          <Select value={asset.spreadType || 'Variable'} onValueChange={v => setAsset({ ...asset, spreadType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Fixed">Фиксированный</SelectItem><SelectItem value="Variable">Плавающий</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Своп лонг" field="swapLong" type="number" step="any" obj={asset} setObj={setAsset} />
        <Field label="Спред бида" field="spreadBid" type="number" step="any" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Стоп левел" field="stopLevel" type="number" obj={asset} setObj={setAsset} />
        <Field label="Спред аска" field="spreadAsk" type="number" step="any" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Гап левел" field="gapLevel" type="number" obj={asset} setObj={setAsset} />
        <Field label="Размер контракта" field="contractSize" type="number" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Процент залога" field="marginPercent" type="number" step="0.1" obj={asset} setObj={setAsset} />
        <Field label="Валюта залога" field="marginCurrency" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Тип расчета</label>
          <Select value={asset.calcType} onValueChange={v => setAsset({ ...asset, calcType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Forex">Forex</SelectItem><SelectItem value="CFD">CFD</SelectItem><SelectItem value="Crypto">Crypto</SelectItem></SelectContent>
          </Select>
        </div>
        <Field label="Валюта прибыли" field="profitCurrency" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Точность" field="precision" type="number" obj={asset} setObj={setAsset} />
        <Field label="Обработка" field="processing" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Хеджирование залога" field="hedgeMargin" type="number" obj={asset} setObj={setAsset} />
        <Field label="Комиссия" field="commission" type="number" step="any" obj={asset} setObj={setAsset} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bid (цена покупки)" field="bid" type="number" step="any" obj={asset} setObj={setAsset} />
        <Field label="Ask (цена продажи)" field="ask" type="number" step="any" obj={asset} setObj={setAsset} />
      </div>
      <label className="flex items-center gap-2 text-sm mt-2">
        <Checkbox checked={!asset.tradingAllowed} onCheckedChange={v => setAsset({ ...asset, tradingAllowed: !v })} />
        Торговля запрещена
      </label>
      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={onSave}>{saveLabel}</Button>
        <Button variant="outline" onClick={() => { setEditAsset(null); setShowCreate(false); }}>Закрыть</Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'assetsInstruments')}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" />Добавить актив</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-40 md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">{t(lang, 'allCategories')}</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{a.symbol}</span>
              <div className="flex items-center gap-1">
                {a.tradingAllowed ? <Check size={14} className="text-emerald-500" /> : <Ban size={14} className="text-destructive" />}
                <Button variant="ghost" size="sm" onClick={() => setEditAsset({ ...a })}><Edit2 size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить актив', `Удалить ${a.symbol}?`, () => { deleteAsset(a.id); toast.success('Удалён'); })}><Trash2 size={14} className="text-destructive" /></Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{a.description}</div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div><span className="text-muted-foreground">Spread:</span> {a.spreadBid}/{a.spreadAsk}</div>
              <div><span className="text-muted-foreground">Swap:</span> {a.swapLong}/{a.swapShort}</div>
              <div><span className="text-muted-foreground">Комиссия:</span> {a.commission}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'symbol')}</th><th>{t(lang, 'description')}</th><th>{t(lang, 'calcType')}</th><th>{t(lang, 'group')}</th><th>Спред бида</th><th>Спред аска</th><th>Стоп левел</th><th>Своп лонг</th><th>Своп шорт</th><th>Комиссия</th><th>Торговля</th><th></th></tr></thead>
            <tbody>{filtered.map(a => (
              <tr key={a.id}>
                <td className="font-medium">{a.symbol}</td><td className="text-sm text-muted-foreground">{a.description}</td>
                <td><span className="status-badge status-new">{a.calcType}</span></td><td className="text-sm">{a.groupName}</td>
                <td>{a.spreadBid}</td><td>{a.spreadAsk}</td><td>{a.stopLevel}</td>
                <td>{a.swapLong}</td><td>{a.swapShort}</td><td>{a.commission}</td>
                <td>{a.tradingAllowed ? <Check size={14} className="text-emerald-500" /> : <Ban size={14} className="text-destructive" />}</td>
                <td>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => setEditAsset({ ...a })}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить актив', `Удалить ${a.symbol}?`, () => { deleteAsset(a.id); toast.success('Удалён'); })}><Trash2 size={14} className="text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="px-3 py-2 border-t text-xs text-muted-foreground">Всего: {filtered.length}</div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editAsset} onOpenChange={() => setEditAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>Изменить символ — {editAsset?.symbol}</DialogTitle></DialogHeader>
          {editAsset && <AssetForm asset={editAsset} setAsset={setEditAsset} onSave={handleSave} saveLabel="Изменить" />}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>Новый актив</DialogTitle></DialogHeader>
          <AssetForm asset={newAsset} setAsset={setNewAsset} onSave={handleCreate} saveLabel="Создать" />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog state={confirmState} onClose={closeConfirm} />
    </div>
  );
}
