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

  const handleSave = () => {
    if (!editAsset) return;
    updateAsset(editAsset.id, editAsset);
    setEditAsset(null);
  };

  const Field = ({ label, field, type = 'text', step }: { label: string; field: string; type?: string; step?: string }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        type={type}
        step={step}
        value={(editAsset as any)?.[field] ?? ''}
        onChange={e => setEditAsset({ ...editAsset, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
      />
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'assetsInstruments')}</h1>
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
              <div className="flex items-center gap-2">
                {a.tradingAllowed ? <Check size={14} className="text-success" /> : <Ban size={14} className="text-destructive" />}
                <Button variant="ghost" size="sm" onClick={() => setEditAsset({...a})}><Edit2 size={14} /></Button>
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
                <td>{a.tradingAllowed ? <Check size={14} className="text-success" /> : <Ban size={14} className="text-destructive" />}</td>
                <td><Button variant="ghost" size="sm" onClick={() => setEditAsset({...a})}><Edit2 size={14} /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog — full params like reference */}
      <Dialog open={!!editAsset} onOpenChange={() => setEditAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>Изменить символ — {editAsset?.symbol}</DialogTitle></DialogHeader>
          {editAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Пакет котировок" field="quotesPackage" />
                <div>
                  <label className="text-xs text-muted-foreground">Группа символов</label>
                  <Select value={editAsset.category} onValueChange={v => setEditAsset({...editAsset, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Обозначение" field="symbol" />
                <Field label="Группа" field="groupName" />
              </div>
              <Field label="Описание" field="description" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Своп шорт" field="swapShort" type="number" step="any" />
                <div>
                  <label className="text-xs text-muted-foreground">Тип спреда</label>
                  <Select value={editAsset.spreadType || 'Variable'} onValueChange={v => setEditAsset({...editAsset, spreadType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Fixed">Фиксированный</SelectItem><SelectItem value="Variable">Плавающий</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Своп лонг" field="swapLong" type="number" step="any" />
                <Field label="Спред бида" field="spreadBid" type="number" step="any" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Стоп левел" field="stopLevel" type="number" />
                <Field label="Спред аска" field="spreadAsk" type="number" step="any" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Гап левел" field="gapLevel" type="number" />
                <Field label="Размер контракта" field="contractSize" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Процент залога" field="marginPercent" type="number" step="0.1" />
                <Field label="Валюта залога" field="marginCurrency" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Тип расчета</label>
                  <Select value={editAsset.calcType} onValueChange={v => setEditAsset({...editAsset, calcType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Forex">Forex</SelectItem><SelectItem value="CFD">CFD</SelectItem><SelectItem value="Crypto">Crypto</SelectItem></SelectContent>
                  </Select>
                </div>
                <Field label="Валюта прибыли" field="profitCurrency" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Точность" field="precision" type="number" />
                <Field label="Обработка" field="processing" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Хеджирование залога" field="hedgeMargin" type="number" />
                <Field label="Комиссия" field="commission" type="number" step="any" />
              </div>
              <label className="flex items-center gap-2 text-sm mt-2">
                <Checkbox checked={!editAsset.tradingAllowed} onCheckedChange={v => setEditAsset({...editAsset, tradingAllowed: !v})} />
                Торговля запрещена
              </label>
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={handleSave}>Изменить</Button>
                <Button variant="outline" onClick={() => setEditAsset(null)}>Закрыть</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
