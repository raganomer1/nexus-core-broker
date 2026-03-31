import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, Upload, Eye, EyeOff, Trash2, UserCheck, Tag, X, CalendarDays, Settings2, Pencil, Save, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientStatus, Client } from '@/types';
import { exportClientsToXlsx, parseXlsxFile, mapRowsToClients } from '@/lib/xlsxUtils';
import { toast } from 'sonner';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';

const allStatuses: ClientStatus[] = ['New','Hot','Warm','Cold','Lead','Live','Demo','Call Back','No potential','Not interesting','No answer','Spam'];

const statusColors: Record<string, string> = {
  New: 'status-new', Hot: 'status-hot', Warm: 'bg-orange-100 text-orange-700',
  Lead: 'status-lead', Spam: 'status-spam',
  Live: 'status-live', Demo: 'status-demo', Cold: 'bg-gray-100 text-gray-600',
  'Not interesting': 'bg-gray-100 text-gray-500', 'No answer': 'status-pending',
  'No potential': 'bg-slate-100 text-slate-600', 'Call Back': 'bg-indigo-100 text-indigo-700',
};

interface SavedFilter {
  id: string;
  label: string;
  statuses: ClientStatus[];
  managerId: string;
  deskId: string;
  country: string;
  verification: string;
  deposit: string;
  dateFrom: string;
  dateTo: string;
  source: string;
  affiliateId: string;
}

const defaultFilters: SavedFilter[] = [
  { id: 'all', label: 'Все', statuses: [], managerId: '', deskId: '', country: '', verification: '', deposit: '', dateFrom: '', dateTo: '', source: '', affiliateId: '' },
  ...allStatuses.map(s => ({ id: s, label: s === 'Not interesting' ? 'Not intr.' : s, statuses: [s], managerId: '', deskId: '', country: '', verification: '', deposit: '', dateFrom: '', dateTo: '', source: '', affiliateId: '' })),
];

const emptyClient = {
  salutation: '', lastName: '', firstName: '', middleName: '', deskId: '', responsibleId: '',
  status: 'New' as ClientStatus, affiliateId: '', country: '', region: '', city: '', zip: '',
  address: '', email: '', phone: '', additionalContact: '', citizenship: '', campaignId: '',
  tag1: '', tag2: '', passport: '', birthday: '', purpose: '', source: '', description: '',
  type: 'Lead' as const,
};

const emptyFilterEdit = (): Omit<SavedFilter, 'id'> => ({
  label: '', statuses: [], managerId: '', deskId: '', country: '', verification: '', deposit: '', dateFrom: '', dateTo: '', source: '', affiliateId: '',
});

const FieldRow = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <label className="text-xs text-muted-foreground w-28 shrink-0">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
    <div className="flex-1">{children}</div>
  </div>
);

export default function AdminClients() {
  const navigate = useNavigate();
  const { clients, employees, desks, addClient, deleteClient, updateClient, securitySettings, tradingAccounts } = useStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contactsVisible, setContactsVisible] = useState<Set<string>>(new Set());

  // Saved filters (custom views)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(defaultFilters);
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [showFilterEditor, setShowFilterEditor] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [newClient, setNewClient] = useState({ ...emptyClient });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseXlsxFile(file);
      const mapped = mapRowsToClients(rows);
      if (mapped.length === 0) { toast.error('Не найдено валидных записей'); return; }
      mapped.forEach(c => addClient({ lastName: c.lastName!, firstName: c.firstName || '', email: c.email!, phone: c.phone, country: c.country, type: (c as any).type || 'Lead', status: (c as any).status || 'New', middleName: '', verificationStatus: 'Unverified', source: (c as any).source }));
      toast.success(`Импортировано ${mapped.length} клиентов`);
    } catch { toast.error('Ошибка чтения файла'); }
    e.target.value = '';
  };

  const countries = useMemo(() => [...new Set(clients.map(c => c.country).filter(Boolean))].sort(), [clients]);

  const activeFilter = savedFilters.find(f => f.id === activeFilterId) || savedFilters[0];

  const applyFilter = useCallback((f: SavedFilter, list: typeof clients) => {
    let result = list;
    if (f.statuses.length > 0) result = result.filter(c => f.statuses.includes(c.status));
    if (f.managerId) result = result.filter(c => c.responsibleId === f.managerId);
    if (f.deskId) result = result.filter(c => c.deskId === f.deskId);
    if (f.country) result = result.filter(c => c.country?.toLowerCase().includes(f.country.toLowerCase()));
    if (f.verification) result = result.filter(c => c.verificationStatus === f.verification);
    if (f.deposit === 'HasDeposit') {
      const withDep = new Set(tradingAccounts.filter(a => a.deposited > 0).map(a => a.clientId));
      result = result.filter(c => withDep.has(c.id));
    } else if (f.deposit === 'NoDeposit') {
      const withDep = new Set(tradingAccounts.filter(a => a.deposited > 0).map(a => a.clientId));
      result = result.filter(c => !withDep.has(c.id));
    }
    if (f.dateFrom) result = result.filter(c => c.createdAt >= f.dateFrom);
    if (f.dateTo) result = result.filter(c => c.createdAt <= f.dateTo);
    if (f.source) result = result.filter(c => c.source?.toLowerCase().includes(f.source.toLowerCase()));
    if (f.affiliateId) result = result.filter(c => c.affiliateId?.toLowerCase().includes(f.affiliateId.toLowerCase()));
    return result;
  }, [tradingAccounts]);

  const filtered = useMemo(() => {
    let result = applyFilter(activeFilter, clients);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.lastName.toLowerCase().includes(s) || c.firstName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))
      );
    }
    return result;
  }, [clients, activeFilter, search, applyFilter]);

  const getFilterCount = useCallback((f: SavedFilter) => applyFilter(f, clients).length, [applyFilter, clients]);

  const toggleContact = (id: string) => {
    setContactsVisible(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const maskValue = (val: string) => val.substring(0, 3) + '***' + val.substring(val.length - 2);

  const handleCreate = () => {
    if (!newClient.lastName || !newClient.email) { toast.error('Фамилия и Email обязательны'); return; }
    addClient({ ...newClient, verificationStatus: 'Unverified' });
    setShowCreate(false);
    setNewClient({ ...emptyClient });
    toast.success('Клиент создан');
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
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
  const isDefault = (fId: string) => !fId.startsWith('custom-');

  const { paginated, page, setPage, perPage, setPerPage, totalPages, toggleSort, sortIcon } = useTableControls(filtered);

  const clientColumns = [
    { key: 'lastName', label: 'ФИО' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Телефон' },
    { key: 'country', label: 'Страна' },
    { key: 'createdAt', label: 'Создан' },
    { key: 'type', label: 'Тип' },
    { key: 'status', label: 'Статус' },
  ];

  const nc = newClient;
  const setNc = (field: string, value: string) => setNewClient(prev => ({ ...prev, [field]: value }));

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">Клиенты</h1>
        <div className="flex flex-wrap gap-2">
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => fileInputRef.current?.click()}><Upload size={14} className="mr-1" /> Импорт</Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => exportClientsToXlsx(filtered)}><Download size={14} className="mr-1" /> Экспорт</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} className="mr-1" /> <span className="hidden sm:inline">Новый клиент</span><span className="sm:hidden">Новый</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Поиск по имени, email, телефону..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
            {/* Context actions on hover */}
            {renamingId !== f.id && activeFilterId === f.id && (
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); setEditingFilter({ ...f }); setShowFilterEditor(true); }} className="w-4 h-4 rounded-full bg-card border shadow flex items-center justify-center"><Pencil size={8} /></button>
                {isCustom(f.id) && <button onClick={e => { e.stopPropagation(); handleDeleteFilter(f.id); }} className="w-4 h-4 rounded-full bg-card border shadow flex items-center justify-center text-destructive"><X size={8} /></button>}
              </div>
            )}
          </div>
        ))}
        {/* Add new filter */}
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
                  <label className="text-xs text-muted-foreground mb-1 block">Desk</label>
                  <Select value={editingFilter.deskId || '_none'} onValueChange={v => setEditingFilter({ ...editingFilter, deskId: v === '_none' ? '' : v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Все</SelectItem>
                      {desks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Страна</label>
                  <Input value={editingFilter.country} onChange={e => setEditingFilter({ ...editingFilter, country: e.target.value })} placeholder="Любая" className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Верификация</label>
                  <Select value={editingFilter.verification || '_none'} onValueChange={v => setEditingFilter({ ...editingFilter, verification: v === '_none' ? '' : v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Все</SelectItem>
                      <SelectItem value="Verified">Verified</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Unverified">Unverified</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Депозит</label>
                  <Select value={editingFilter.deposit || '_none'} onValueChange={v => setEditingFilter({ ...editingFilter, deposit: v === '_none' ? '' : v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Все</SelectItem>
                      <SelectItem value="HasDeposit">С депозитом</SelectItem>
                      <SelectItem value="NoDeposit">Без депозита</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Affiliate ID</label>
                  <Input value={editingFilter.affiliateId} onChange={e => setEditingFilter({ ...editingFilter, affiliateId: e.target.value })} placeholder="Любой" className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Источник</label>
                  <Input value={editingFilter.source} onChange={e => setEditingFilter({ ...editingFilter, source: e.target.value })} placeholder="Любой" className="h-9 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Дата регистрации от</label>
                  <Input type="date" value={editingFilter.dateFrom} onChange={e => setEditingFilter({ ...editingFilter, dateFrom: e.target.value })} className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Дата регистрации до</label>
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

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Выбрано: {selected.size}</span>
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={v => { selected.forEach(id => updateClient(id, { status: v as ClientStatus })); toast.success(`Статус изменён у ${selected.size} клиентов`); setSelected(new Set()); }}>
              <SelectTrigger className="w-36 h-8 text-xs"><Tag size={12} className="mr-1" /><SelectValue placeholder="Сменить статус" /></SelectTrigger>
              <SelectContent>{['New','Hot','Warm','Cold','Lead','Live','Demo','Call Back','No potential','Not interesting','No answer','Spam'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={v => { selected.forEach(id => updateClient(id, { responsibleId: v })); const emp = employees.find(e => e.id === v); toast.success(`Ответственный: ${emp?.firstName} ${emp?.lastName}`); setSelected(new Set()); }}>
              <SelectTrigger className="w-44 h-8 text-xs"><UserCheck size={12} className="mr-1" /><SelectValue placeholder="Назначить отв." /></SelectTrigger>
              <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => { selected.forEach(id => deleteClient(id)); toast.success(`Удалено ${selected.size}`); setSelected(new Set()); }}>
              <Trash2 size={12} className="mr-1" /> Удалить
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={() => setSelected(new Set())}>Снять выбор</Button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(client => {
          const resp = employees.find(e => e.id === client.responsibleId);
          return (
            <div key={client.id} onClick={() => navigate(`/admin/clients/${client.id}`)} className="bg-card rounded-lg border p-4 cursor-pointer active:bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{client.lastName} {client.firstName}</span>
                <span className={`status-badge ${statusColors[client.status] || 'status-new'}`}>{client.status}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>{client.email}</div>
                <div>{client.phone || '—'} · {client.country || '—'}</div>
                <div className="flex justify-between mt-1">
                  <span className={`status-badge ${client.type === 'Live' ? 'status-live' : client.type === 'Demo' ? 'status-demo' : 'status-lead'}`}>{client.type}</span>
                  <span>{resp ? `${resp.firstName} ${resp.lastName[0]}.` : '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th className="w-10"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                {clientColumns.map(col => (
                  <th key={col.key} className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleSort(col.key)}>
                    {col.label}<span className="text-xs opacity-50">{sortIcon(col.key)}</span>
                  </th>
                ))}
                <th>Ответственный</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(client => {
                const resp = employees.find(e => e.id === client.responsibleId);
                const showContacts = contactsVisible.has(client.id) || !securitySettings.contactProtection;
                return (
                  <tr key={client.id} className="cursor-pointer" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(client.id)} onChange={() => {
                        setSelected(prev => { const n = new Set(prev); n.has(client.id) ? n.delete(client.id) : n.add(client.id); return n; });
                      }} />
                    </td>
                    <td className="font-medium">{client.lastName} {client.firstName}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {showContacts ? client.email : maskValue(client.email)}
                        <button onClick={e => { e.stopPropagation(); toggleContact(client.id); }} className="text-muted-foreground hover:text-foreground">
                          {showContacts ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </td>
                    <td>{client.phone ? (showContacts ? client.phone : maskValue(client.phone)) : '—'}</td>
                    <td>{client.country || '—'}</td>
                    <td className="text-muted-foreground text-xs">{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${client.type === 'Live' ? 'status-live' : client.type === 'Demo' ? 'status-demo' : 'status-lead'}`}>{client.type}</span></td>
                    <td><span className={`status-badge ${statusColors[client.status] || 'status-new'}`}>{client.status}</span></td>
                    <td className="text-sm">{resp ? `${resp.firstName} ${resp.lastName[0]}.` : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate(`/admin/clients/${client.id}`)}><Pencil size={13} /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { deleteClient(client.id); toast.success('Клиент удалён'); }}><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} selectedCount={selected.size} />
      </div>

      {/* Create Client — Full page form matching screenshot layout */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-[95vw] w-[1400px] h-[85vh] flex flex-col p-0 gap-0 mx-4">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
            <DialogTitle className="text-base font-semibold">Новый клиент</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-primary border-primary/30" onClick={handleCreate}>Сохранить</Button>
              <Button variant="outline" size="sm" onClick={() => { handleCreate(); }}>Сохранить и закрыть</Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Отмена</Button>
            </div>
          </div>

          {/* Form body — 3 columns + description, no scroll */}
          <div className="flex-1 overflow-hidden p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
              {/* Column 1: General */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-4">Общая информация</h3>
                <div className="space-y-3">
                  <FieldRow label="Обращение">
                    <Select value={nc.salutation} onValueChange={v => setNc('salutation', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent><SelectItem value="Mr">Mr</SelectItem><SelectItem value="Mrs">Mrs</SelectItem><SelectItem value="Ms">Ms</SelectItem></SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Фамилия"><Input className="h-8 text-sm" value={nc.lastName} onChange={e => setNc('lastName', e.target.value)} /></FieldRow>
                  <FieldRow label="Имя" required><Input className="h-8 text-sm" value={nc.firstName} onChange={e => setNc('firstName', e.target.value)} /></FieldRow>
                  <FieldRow label="Отчество"><Input className="h-8 text-sm" value={nc.middleName} onChange={e => setNc('middleName', e.target.value)} /></FieldRow>
                  <FieldRow label="Деск" required>
                    <Select value={nc.deskId} onValueChange={v => setNc('deskId', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>{desks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Ответственный">
                    <Select value={nc.responsibleId} onValueChange={v => setNc('responsibleId', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Статус" required>
                    <Select value={nc.status} onValueChange={v => setNc('status', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{['New','Hot','Warm','Cold','Lead','Live','Demo','Call Back','No potential','Not interesting','No answer','Spam'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Affiliate ID"><Input className="h-8 text-sm" value={nc.affiliateId} onChange={e => setNc('affiliateId', e.target.value)} /></FieldRow>
                </div>
              </div>

              {/* Column 2: Contacts */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-4">Контактная информация</h3>
                <div className="space-y-3">
                  <FieldRow label="Страна">
                    <Select value={nc.country} onValueChange={v => setNc('country', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Default" /></SelectTrigger>
                      <SelectContent>
                        {['Russia','United States','United Kingdom','Germany','France','China','Japan','Turkey','UAE','Cyprus','Default'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Регион"><Input className="h-8 text-sm" value={nc.region} onChange={e => setNc('region', e.target.value)} /></FieldRow>
                  <FieldRow label="Город"><Input className="h-8 text-sm" value={nc.city} onChange={e => setNc('city', e.target.value)} /></FieldRow>
                  <FieldRow label="Индекс"><Input className="h-8 text-sm" value={nc.zip} onChange={e => setNc('zip', e.target.value)} /></FieldRow>
                  <FieldRow label="Адрес"><Input className="h-8 text-sm" value={nc.address} onChange={e => setNc('address', e.target.value)} /></FieldRow>
                  <FieldRow label="Email" required><Input className="h-8 text-sm" value={nc.email} onChange={e => setNc('email', e.target.value)} /></FieldRow>
                  <FieldRow label="Телефон"><Input className="h-8 text-sm" value={nc.phone} onChange={e => setNc('phone', e.target.value)} /></FieldRow>
                  <FieldRow label="Доп. контакт"><Input className="h-8 text-sm" value={nc.additionalContact} onChange={e => setNc('additionalContact', e.target.value)} /></FieldRow>
                </div>
              </div>

              {/* Column 3: Additional */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-4">Дополнительная информация</h3>
                <div className="space-y-3">
                  <FieldRow label="Гражданство"><Input className="h-8 text-sm" value={nc.citizenship} onChange={e => setNc('citizenship', e.target.value)} /></FieldRow>
                  <FieldRow label="Campaign ID"><Input className="h-8 text-sm" value={nc.campaignId} onChange={e => setNc('campaignId', e.target.value)} /></FieldRow>
                  <FieldRow label="Tag 1"><Input className="h-8 text-sm" value={nc.tag1} onChange={e => setNc('tag1', e.target.value)} /></FieldRow>
                  <FieldRow label="Tag 2"><Input className="h-8 text-sm" value={nc.tag2} onChange={e => setNc('tag2', e.target.value)} /></FieldRow>
                  <FieldRow label="Паспорт"><Input className="h-8 text-sm" value={nc.passport} onChange={e => setNc('passport', e.target.value)} /></FieldRow>
                  <FieldRow label="Дата рождения"><Input type="date" className="h-8 text-sm" value={nc.birthday} onChange={e => setNc('birthday', e.target.value)} /></FieldRow>
                  <FieldRow label="Цель">
                    <Select value={nc.purpose} onValueChange={v => setNc('purpose', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent><SelectItem value="trading">Trading</SelectItem><SelectItem value="investment">Investment</SelectItem><SelectItem value="hedging">Hedging</SelectItem></SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Источник">
                    <Select value={nc.source} onValueChange={v => setNc('source', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Default source" /></SelectTrigger>
                      <SelectContent><SelectItem value="website">Website</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="ads">Ads</SelectItem><SelectItem value="organic">Organic</SelectItem></SelectContent>
                    </Select>
                  </FieldRow>
                </div>
              </div>
            </div>

            {/* Description — full width bottom */}
            <div className="border rounded-lg p-4 shrink-0">
              <h3 className="text-sm font-semibold mb-3">Описание</h3>
              <Textarea value={nc.description} onChange={e => setNc('description', e.target.value)} placeholder="Введите текст" rows={3} className="text-sm resize-none" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
