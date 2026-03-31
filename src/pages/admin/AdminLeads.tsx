import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Plus, Download, Upload, ArrowRight, X, Pencil, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportLeadsToXlsx, parseXlsxFile, mapRowsToLeads } from '@/lib/xlsxUtils';
import { toast } from 'sonner';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';

type LeadStatus = 'New' | 'Hot' | 'Warm' | 'Cold' | 'Lead' | 'Call Back' | 'No potential' | 'Not interesting' | 'No answer';

const allStatuses: LeadStatus[] = ['New', 'Hot', 'Warm', 'Cold', 'Lead', 'Call Back', 'No potential', 'Not interesting', 'No answer'];

const statusColors: Record<string, string> = {
  New: 'status-new', Hot: 'status-hot', Warm: 'bg-orange-100 text-orange-700',
  Lead: 'status-lead', Cold: 'bg-gray-100 text-gray-600',
  'Not interesting': 'bg-gray-100 text-gray-500', 'No answer': 'status-pending',
  'No potential': 'bg-slate-100 text-slate-600', 'Call Back': 'bg-indigo-100 text-indigo-700',
};

interface SavedFilter {
  id: string;
  label: string;
  statuses: LeadStatus[];
  managerId: string;
  country: string;
  source: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: SavedFilter[] = [
  { id: 'all', label: 'Все', statuses: [], managerId: '', country: '', source: '', dateFrom: '', dateTo: '' },
  ...allStatuses.map(s => ({ id: s, label: s === 'Not interesting' ? 'Not intr.' : s, statuses: [s] as LeadStatus[], managerId: '', country: '', source: '', dateFrom: '', dateTo: '' })),
];

const emptyFilterEdit = (): Omit<SavedFilter, 'id'> => ({
  label: '', statuses: [], managerId: '', country: '', source: '', dateFrom: '', dateTo: '',
});

export default function AdminLeads() {
  const { leads, employees, addLead, updateLead, deleteLead, convertLeadToClient } = useStore();
  const { state: confirmState, confirmDelete, close: closeConfirm } = useConfirmDelete();
  const [editLead, setEditLead] = useState<any>(null);
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Saved filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(defaultFilters);
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [showFilterEditor, setShowFilterEditor] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [newLead, setNewLead] = useState({
    lastName: '', firstName: '', email: '', phone: '', country: '', status: 'New' as any,
    source: '', responsibleId: '', notes: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseXlsxFile(file);
      const mapped = mapRowsToLeads(rows);
      if (mapped.length === 0) { toast.error(t(lang, 'noValidRecords')); return; }
      mapped.forEach(l => addLead({ lastName: l.lastName!, firstName: l.firstName || '', email: l.email!, phone: l.phone, country: l.country, status: (l as any).status || 'New', source: l.source, responsibleId: '' }));
      toast.success(`${t(lang, 'imported')} ${mapped.length} ${t(lang, 'leadsImported')}`);
    } catch { toast.error(t(lang, 'fileReadError')); }
    e.target.value = '';
  };

  const activeFilter = savedFilters.find(f => f.id === activeFilterId) || savedFilters[0];

  const applyFilter = useCallback((f: SavedFilter, list: typeof leads) => {
    let result = list.filter(l => !l.convertedClientId);
    if (f.statuses.length > 0) result = result.filter(l => f.statuses.includes(l.status as LeadStatus));
    if (f.managerId) result = result.filter(l => l.responsibleId === f.managerId);
    if (f.country) result = result.filter(l => l.country?.toLowerCase().includes(f.country.toLowerCase()));
    if (f.source) result = result.filter(l => l.source?.toLowerCase().includes(f.source.toLowerCase()));
    if (f.dateFrom) result = result.filter(l => l.createdAt >= f.dateFrom);
    if (f.dateTo) result = result.filter(l => l.createdAt <= f.dateTo);
    return result;
  }, []);

  const filtered = useMemo(() => {
    let result = applyFilter(activeFilter, leads);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => l.lastName.toLowerCase().includes(s) || l.firstName.toLowerCase().includes(s) || l.email.toLowerCase().includes(s));
    }
    return result;
  }, [leads, activeFilter, search, applyFilter]);

  const getFilterCount = useCallback((f: SavedFilter) => applyFilter(f, leads).length, [applyFilter, leads]);

  const handleCreate = () => {
    if (!newLead.lastName || !newLead.email) { toast.error('Фамилия и Email обязательны'); return; }
    addLead(newLead);
    setShowCreate(false);
    setNewLead({ lastName: '', firstName: '', email: '', phone: '', country: '', status: 'New', source: '', responsibleId: '', notes: '' });
    toast.success('Лид создан');
  };

  const handleSaveFilter = () => {
    if (!editingFilter) return;
    if (!editingFilter.label.trim()) { toast.error('Введите название'); return; }
    if (editingFilter.id) {
      setSavedFilters(prev => prev.map(f => f.id === editingFilter.id ? editingFilter : f));
    } else {
      const newF = { ...editingFilter, id: `custom-${Date.now()}` };
      setSavedFilters(prev => [...prev, newF]);
      setActiveFilterId(newF.id);
    }
    setShowFilterEditor(false);
    setEditingFilter(null);
    toast.success('Фильтр сохранён');
  };

  const handleDeleteFilter = (fId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== fId));
    if (activeFilterId === fId) setActiveFilterId('all');
    toast.success('Фильтр удалён');
  };

  const handleRename = (fId: string) => {
    setSavedFilters(prev => prev.map(f => f.id === fId ? { ...f, label: renameValue } : f));
    setRenamingId(null);
    setRenameValue('');
  };

  const isCustom = (fId: string) => fId.startsWith('custom-');

  const { paginated, page, setPage, perPage, setPerPage, totalPages, toggleSort, sortIcon } = useTableControls(filtered);

  const leadColumns = [
    { key: 'lastName', label: t(lang, 'fullName') },
    { key: 'email', label: t(lang, 'email') },
    { key: 'phone', label: t(lang, 'phone') },
    { key: 'country', label: t(lang, 'country') },
    { key: 'status', label: t(lang, 'status') },
    { key: 'source', label: t(lang, 'source') },
    { key: 'createdAt', label: t(lang, 'created') },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'leads')}</h1>
        <div className="flex flex-wrap gap-2">
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload size={14} className="mr-1" /> {t(lang, 'import')}</Button>
          <Button variant="outline" size="sm" onClick={() => exportLeadsToXlsx(filtered)}><Download size={14} className="mr-1" /> {t(lang, 'export')}</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'newLead')}</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Saved filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap items-center">
        {savedFilters.map(f => (
          <div key={f.id} className="relative group">
            {renamingId === f.id ? (
              <div className="flex items-center gap-1">
                <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} className="h-7 w-28 text-xs" autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(f.id); if (e.key === 'Escape') setRenamingId(null); }} />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleRename(f.id)}><Save size={12} /></Button>
              </div>
            ) : (
              <button
                onClick={() => setActiveFilterId(f.id)}
                onDoubleClick={() => { setRenamingId(f.id); setRenameValue(f.label); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeFilterId === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
                <span className="ml-1 opacity-60">{getFilterCount(f)}</span>
              </button>
            )}
            {renamingId !== f.id && activeFilterId === f.id && (
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); setEditingFilter({ ...f }); setShowFilterEditor(true); }} className="w-4 h-4 rounded-full bg-card border shadow flex items-center justify-center"><Pencil size={8} /></button>
                {isCustom(f.id) && <button onClick={e => { e.stopPropagation(); handleDeleteFilter(f.id); }} className="w-4 h-4 rounded-full bg-card border shadow flex items-center justify-center text-destructive"><X size={8} /></button>}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => { setEditingFilter({ ...emptyFilterEdit(), id: '' } as any); setShowFilterEditor(true); }}
          className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted border border-dashed border-border transition-colors"
        >
          <Plus size={12} className="inline mr-0.5" /> Фильтр
        </button>
      </div>

      {/* Filter editor dialog */}
      <Dialog open={showFilterEditor} onOpenChange={setShowFilterEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingFilter?.id ? 'Редактировать фильтр' : 'Новый фильтр'}</DialogTitle></DialogHeader>
          {editingFilter && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Название фильтра</label>
                <Input value={editingFilter.label} onChange={e => setEditingFilter({ ...editingFilter, label: e.target.value })} placeholder="Например: Горячие лиды EU" className="h-9" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Статусы (множественный выбор)</label>
                <div className="flex flex-wrap gap-1.5">
                  {allStatuses.map(s => (
                    <button key={s} onClick={() => {
                      const has = editingFilter.statuses.includes(s);
                      setEditingFilter({ ...editingFilter, statuses: has ? editingFilter.statuses.filter(x => x !== s) : [...editingFilter.statuses, s] });
                    }} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      editingFilter.statuses.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Менеджер</label>
                  <Select value={editingFilter.managerId || '_none'} onValueChange={v => setEditingFilter({ ...editingFilter, managerId: v === '_none' ? '' : v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Все</SelectItem>
                      {employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Страна</label>
                  <Input value={editingFilter.country} onChange={e => setEditingFilter({ ...editingFilter, country: e.target.value })} placeholder="Любая" className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Источник</label>
                  <Input value={editingFilter.source} onChange={e => setEditingFilter({ ...editingFilter, source: e.target.value })} placeholder="Любой" className="h-9 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Дата создания от</label>
                  <Input type="date" value={editingFilter.dateFrom} onChange={e => setEditingFilter({ ...editingFilter, dateFrom: e.target.value })} className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Дата создания до</label>
                  <Input type="date" value={editingFilter.dateTo} onChange={e => setEditingFilter({ ...editingFilter, dateTo: e.target.value })} className="h-9 text-xs" />
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <div>
                  {editingFilter.id && isCustom(editingFilter.id) && (
                    <Button variant="destructive" size="sm" onClick={() => { handleDeleteFilter(editingFilter.id); setShowFilterEditor(false); }}>
                      <Trash2 size={12} className="mr-1" /> Удалить
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowFilterEditor(false)}>Отмена</Button>
                  <Button size="sm" onClick={handleSaveFilter}><Save size={12} className="mr-1" /> Сохранить</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(lead => {
          const resp = employees.find(e => e.id === lead.responsibleId);
          return (
            <div key={lead.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{lead.lastName} {lead.firstName}</span>
                <span className={`status-badge ${statusColors[lead.status] || 'status-new'}`}>{lead.status}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>{lead.email}</div>
                <div>{lead.phone || '—'} · {lead.country || '—'}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{resp ? `${resp.firstName} ${resp.lastName[0]}.` : '—'}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditLead({ ...lead })}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => convertLeadToClient(lead.id)} title={t(lang, 'convertToClient')}><ArrowRight size={14} /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => confirmDelete('Удаление лида', `Удалить лида ${lead.lastName} ${lead.firstName}?`, () => { deleteLead(lead.id); toast.success('Лид удалён'); })}><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          );
        })}
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                {leadColumns.map(col => (
                  <th key={col.key} className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleSort(col.key)}>
                    {col.label}<span className="text-xs opacity-50">{sortIcon(col.key)}</span>
                  </th>
                ))}
                <th>{t(lang, 'responsible')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(lead => {
                const resp = employees.find(e => e.id === lead.responsibleId);
                return (
                  <tr key={lead.id}>
                    <td className="font-medium">{lead.lastName} {lead.firstName}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone || '—'}</td>
                    <td>{lead.country || '—'}</td>
                    <td><span className={`status-badge ${statusColors[lead.status] || 'status-new'}`}>{lead.status}</span></td>
                    <td className="text-sm text-muted-foreground">{lead.source || '—'}</td>
                    <td className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="text-sm">{resp ? `${resp.firstName} ${resp.lastName[0]}.` : '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditLead({ ...lead })}><Pencil size={13} /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => convertLeadToClient(lead.id)} title={t(lang, 'convertToClient')}><ArrowRight size={13} /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => confirmDelete('Удаление лида', `Удалить лида ${lead.lastName} ${lead.firstName}?`, () => { deleteLead(lead.id); toast.success('Лид удалён'); })}><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Create Lead Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>{t(lang, 'newLead')}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-primary">Общая информация</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'lastName')} *</label><Input value={newLead.lastName} onChange={e => setNewLead(n => ({ ...n, lastName: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'firstName')} *</label><Input value={newLead.firstName} onChange={e => setNewLead(n => ({ ...n, firstName: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'status')}</label>
                  <Select value={newLead.status} onValueChange={v => setNewLead(n => ({ ...n, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'responsible')}</label>
                  <Select value={newLead.responsibleId} onValueChange={v => setNewLead(n => ({ ...n, responsibleId: v }))}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-primary">Контакты</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'email')} *</label><Input value={newLead.email} onChange={e => setNewLead(n => ({ ...n, email: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'phone')}</label><Input value={newLead.phone} onChange={e => setNewLead(n => ({ ...n, phone: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'country')}</label><Input value={newLead.country} onChange={e => setNewLead(n => ({ ...n, country: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'source')}</label><Input value={newLead.source} onChange={e => setNewLead(n => ({ ...n, source: e.target.value }))} /></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-primary">Заметки</h3>
              <Textarea value={newLead.notes || ''} onChange={e => setNewLead(n => ({ ...n, notes: e.target.value }))} placeholder="Комментарий к лиду..." rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowCreate(false)}>{t(lang, 'cancel')}</Button>
              <Button onClick={handleCreate}>{t(lang, 'create')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Редактировать лид</DialogTitle></DialogHeader>
          {editLead && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t(lang, 'lastName')}</label><Input value={editLead.lastName} onChange={e => setEditLead({ ...editLead, lastName: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'firstName')}</label><Input value={editLead.firstName} onChange={e => setEditLead({ ...editLead, firstName: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'email')}</label><Input value={editLead.email} onChange={e => setEditLead({ ...editLead, email: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'phone')}</label><Input value={editLead.phone || ''} onChange={e => setEditLead({ ...editLead, phone: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'country')}</label><Input value={editLead.country || ''} onChange={e => setEditLead({ ...editLead, country: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, 'source')}</label><Input value={editLead.source || ''} onChange={e => setEditLead({ ...editLead, source: e.target.value })} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'status')}</label>
                <Select value={editLead.status} onValueChange={v => setEditLead({ ...editLead, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'responsible')}</label>
                <Select value={editLead.responsibleId || '_none'} onValueChange={v => setEditLead({ ...editLead, responsibleId: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={() => { updateLead(editLead.id, editLead); setEditLead(null); toast.success('Лид обновлён'); }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditLead(null)}>Отмена</Button>
                <Button variant="destructive" className="ml-auto" onClick={() => confirmDelete('Удаление лида', `Удалить лида ${editLead.lastName} ${editLead.firstName}?`, () => { deleteLead(editLead.id); setEditLead(null); toast.success('Лид удалён'); })}><Trash2 size={14} className="mr-1" /> Удалить</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
