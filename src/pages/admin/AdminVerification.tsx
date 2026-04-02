import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Check, X, Ban, FileText, ArrowLeft, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationStatus } from '@/types';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

type SortKey = 'date' | 'client' | 'docs';

export default function AdminVerification() {
  const { verificationRequests, clients, employees, updateVerificationStatus, deleteVerificationRequest, auth } = useStore();
  const { lang } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<VerificationStatus>('Pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [managerFilter, setManagerFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editComment, setEditComment] = useState<{ id: string; comment: string } | null>(null);
  const { state: delState, confirmDelete, close: closeDelete } = useConfirmDelete();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const tabs: { label: string; value: VerificationStatus }[] = [
    { label: 'На рассмотрении', value: 'Pending' },
    { label: 'Не верифицирован', value: 'Unverified' },
    { label: 'Отклонён', value: 'Rejected' },
    { label: 'Верифицирован', value: 'Verified' },
    { label: 'Заблокирован', value: 'Banned' },
  ];

  const managers = useMemo(() => {
    const ids = new Set(clients.map(c => c.responsibleId).filter(Boolean));
    return employees.filter(e => ids.has(e.id));
  }, [clients, employees]);

  const countries = useMemo(() => [...new Set(clients.map(c => c.country).filter(Boolean))].sort(), [clients]);

  const filtered = useMemo(() => {
    let result = verificationRequests.filter(v => v.status === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(v => { const c = clients.find(cl => cl.id === v.clientId); return c && (`${c.lastName} ${c.firstName} ${c.email}`.toLowerCase().includes(s)); });
    }
    if (managerFilter !== 'All') result = result.filter(v => { const c = clients.find(cl => cl.id === v.clientId); return c?.responsibleId === managerFilter; });
    if (countryFilter !== 'All') result = result.filter(v => { const c = clients.find(cl => cl.id === v.clientId); return c?.country === countryFilter; });

    result.sort((a, b) => {
      if (sortKey === 'date') {
        const cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'client') {
        const ca = clients.find(c => c.id === a.clientId);
        const cb = clients.find(c => c.id === b.clientId);
        const cmp = (ca?.lastName || '').localeCompare(cb?.lastName || '');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'docs') return sortDir === 'asc' ? a.documents.length - b.documents.length : b.documents.length - a.documents.length;
      return 0;
    });
    return result;
  }, [verificationRequests, activeTab, search, managerFilter, countryFilter, clients, sortKey, sortDir]);

  const selected = verificationRequests.find(v => v.id === selectedId);
  const selectedClient = selected ? clients.find(c => c.id === selected.clientId) : null;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'verification')}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} className="mr-1" />Фильтры</Button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.value} onClick={() => { setActiveTab(tb.value); setSelectedId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === tb.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb.label}<span className="ml-1 opacity-60">{verificationRequests.filter(v => v.status === tb.value).length}</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Поиск по клиенту..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-muted/30 rounded-lg border">
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Менеджер" /></SelectTrigger>
            <SelectContent><SelectItem value="All">Все менеджеры</SelectItem>{managers.map(m => <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Страна" /></SelectTrigger>
            <SelectContent><SelectItem value="All">Все страны</SelectItem>{countries.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setManagerFilter('All'); setCountryFilter('All'); }}>Сброс</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className={`bg-card rounded-lg border overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground border-b">
            <span className="cursor-pointer" onClick={() => toggleSort('client')}>Клиент{sortKey === 'client' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
            <span className="cursor-pointer" onClick={() => toggleSort('date')}>Дата{sortKey === 'date' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
            <span className="cursor-pointer" onClick={() => toggleSort('docs')}>Док.{sortKey === 'docs' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
            <span></span>
          </div>
          <div className="divide-y">
            {filtered.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Нет заявок</div>}
            {filtered.map(v => {
              const client = clients.find(c => c.id === v.clientId);
              return (
                <div key={v.id} className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${selectedId === v.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex-1 min-w-0" onClick={() => setSelectedId(v.id)}>
                    <div className="font-medium text-sm">{client?.lastName} {client?.firstName}</div>
                    <div className="text-xs text-muted-foreground">{client?.email} · Док: {v.documents.length} · {new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditComment({ id: v.id, comment: v.comment || '' }); }}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); confirmDelete('Удалить заявку', `Удалить заявку верификации для ${client?.lastName}?`, () => deleteVerificationRequest(v.id)); }}><Trash2 size={14} className="text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selected && selectedClient && (
          <div className={`bg-card rounded-lg border p-4 md:p-5 ${!selectedId ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center gap-3 mb-3 lg:hidden"><button onClick={() => setSelectedId(null)}><ArrowLeft size={18} /></button><span className="font-semibold text-sm">Назад</span></div>
            <h3 className="text-lg font-semibold mb-1">{selectedClient.lastName} {selectedClient.firstName}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedClient.email} · {selectedClient.country || '—'}</p>
            {selected.comment && <div className="p-2 bg-muted/30 rounded text-sm mb-3">Комментарий: {selected.comment}</div>}
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Документы</h4>
              {selected.documents.length === 0 ? <p className="text-sm text-muted-foreground">Нет документов</p> : (
                <div className="space-y-2">{selected.documents.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <FileText size={20} className="text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0"><div className="text-sm font-medium truncate">{d.fileName}</div><div className="text-xs text-muted-foreground">{d.fileType} · {new Date(d.uploadedAt).toLocaleString()}</div></div>
                  </div>
                ))}</div>
              )}
            </div>
            {/* Show actions for any tab - allow changing status back */}
            <div className="flex flex-wrap gap-2">
              {activeTab !== 'Verified' && <Button size="sm" onClick={() => { updateVerificationStatus(selected.id, 'Verified', auth.employeeId); toast.success('Верифицирован'); }}><Check size={14} className="mr-1" /> Верифицировать</Button>}
              {activeTab !== 'Pending' && <Button variant="outline" size="sm" onClick={() => { updateVerificationStatus(selected.id, 'Pending', auth.employeeId); toast.success('Возвращено на рассмотрение'); }}>На рассмотрение</Button>}
              {activeTab !== 'Unverified' && <Button variant="outline" size="sm" onClick={() => { updateVerificationStatus(selected.id, 'Unverified', auth.employeeId); toast.success('Не верифицирован'); }}>Снять верификацию</Button>}
              {activeTab !== 'Rejected' && <Button variant="outline" size="sm" onClick={() => { updateVerificationStatus(selected.id, 'Rejected', auth.employeeId); toast.success('Отклонён'); }}><X size={14} className="mr-1" /> Отклонить</Button>}
              {activeTab !== 'Banned' && <Button variant="destructive" size="sm" onClick={() => { updateVerificationStatus(selected.id, 'Banned', auth.employeeId); toast.success('Заблокирован'); }}><Ban size={14} className="mr-1" /> Заблокировать</Button>}
            </div>
          </div>
        )}
      </div>

      {/* Edit comment dialog */}
      <Dialog open={!!editComment} onOpenChange={() => setEditComment(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader><DialogTitle>Комментарий</DialogTitle></DialogHeader>
          {editComment && (
            <div className="space-y-3">
              <Input value={editComment.comment} onChange={e => setEditComment({ ...editComment, comment: e.target.value })} placeholder="Комментарий к заявке..." />
              <div className="flex gap-2">
                <Button onClick={() => { /* Would need updateVerificationRequest */ setEditComment(null); }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditComment(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
    </div>
  );
}
