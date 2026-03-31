import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, Upload, Eye, EyeOff, Trash2, UserCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientStatus, Client } from '@/types';
import { exportClientsToXlsx, parseXlsxFile, mapRowsToClients } from '@/lib/xlsxUtils';
import { toast } from 'sonner';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';

const statusTabs: { label: string; value: ClientStatus | 'All' }[] = [
  { label: 'Все', value: 'All' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Spam', value: 'Spam' },
  { label: 'Live', value: 'Live' },
  { label: 'Demo', value: 'Demo' },
  { label: 'New', value: 'New' },
  { label: 'Cold', value: 'Cold' },
];

const statusColors: Record<string, string> = {
  New: 'status-new', Hot: 'status-hot', Lead: 'status-lead', Spam: 'status-spam',
  Live: 'status-live', Demo: 'status-demo', Cold: 'bg-gray-100 text-gray-600',
  'Not interesting': 'bg-gray-100 text-gray-500', 'No answer': 'status-pending',
};

export default function AdminClients() {
  const navigate = useNavigate();
  const { clients, employees, desks, addClient, deleteClient, updateClient, securitySettings } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'All'>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contactsVisible, setContactsVisible] = useState<Set<string>>(new Set());
  const [filterConditions, setFilterConditions] = useState<{ field: string; operator: string; value: string }[]>([]);

  const [newClient, setNewClient] = useState({ lastName: '', firstName: '', email: '', phone: '', country: '', type: 'Lead' as const, status: 'New' as ClientStatus, deskId: '', responsibleId: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseXlsxFile(file);
      const mapped = mapRowsToClients(rows);
      if (mapped.length === 0) { toast.error('Не найдено валидных записей (нужны Фамилия и Email)'); return; }
      mapped.forEach(c => addClient({ lastName: c.lastName!, firstName: c.firstName || '', email: c.email!, phone: c.phone, country: c.country, type: (c as any).type || 'Lead', status: (c as any).status || 'New', middleName: '', verificationStatus: 'Unverified', source: (c as any).source }));
      toast.success(`Импортировано ${mapped.length} клиентов`);
    } catch { toast.error('Ошибка чтения файла'); }
    e.target.value = '';
  };

  const filtered = useMemo(() => {
    let result = clients;
    if (statusFilter !== 'All') result = result.filter(c => c.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.lastName.toLowerCase().includes(s) || c.firstName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))
      );
    }
    filterConditions.forEach(fc => {
      if (!fc.value) return;
      result = result.filter(c => {
        const val = (c as any)[fc.field];
        if (!val) return false;
        if (fc.operator === 'equals') return val === fc.value;
        if (fc.operator === 'contains') return String(val).toLowerCase().includes(fc.value.toLowerCase());
        return true;
      });
    });
    return result;
  }, [clients, statusFilter, search, filterConditions]);

  const toggleContact = (id: string) => {
    setContactsVisible(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const maskValue = (val: string) => val.substring(0, 3) + '***' + val.substring(val.length - 2);

  const handleCreate = () => {
    if (!newClient.lastName || !newClient.email) return;
    addClient({ ...newClient, middleName: '', verificationStatus: 'Unverified' });
    setShowCreate(false);
    setNewClient({ lastName: '', firstName: '', email: '', phone: '', country: '', type: 'Lead', status: 'New', deskId: '', responsibleId: '' });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const { paginated, page, setPage, perPage, setPerPage, totalPages, toggleSort, sortIcon } = useTableControls(filtered);

  const clientColumns: { key: string; label: string }[] = [
    { key: 'lastName', label: 'ФИО' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Телефон' },
    { key: 'country', label: 'Страна' },
    { key: 'createdAt', label: 'Создан' },
    { key: 'type', label: 'Тип' },
    { key: 'status', label: 'Статус' },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">Клиенты</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={14} className="mr-1" /> Фильтры
          </Button>
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => fileInputRef.current?.click()}><Upload size={14} className="mr-1" /> Импорт</Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => exportClientsToXlsx(filtered)}><Download size={14} className="mr-1" /> Экспорт</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} className="mr-1" /> <span className="hidden sm:inline">Новый клиент</span><span className="sm:hidden">Новый</span>
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 flex-wrap overflow-x-auto">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {tab.label}
            <span className="ml-1 opacity-60">
              {tab.value === 'All' ? clients.length : clients.filter(c => c.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Выбрано: {selected.size}</span>
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={v => {
              selected.forEach(id => updateClient(id, { status: v as ClientStatus }));
              toast.success(`Статус изменён у ${selected.size} клиентов`);
              setSelected(new Set());
            }}>
              <SelectTrigger className="w-36 h-8 text-xs"><Tag size={12} className="mr-1" /><SelectValue placeholder="Сменить статус" /></SelectTrigger>
              <SelectContent>
                {['New', 'Hot', 'Lead', 'Live', 'Demo', 'Cold', 'Spam'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={v => {
              selected.forEach(id => updateClient(id, { responsibleId: v }));
              const emp = employees.find(e => e.id === v);
              toast.success(`Ответственный назначен: ${emp?.firstName} ${emp?.lastName}`);
              setSelected(new Set());
            }}>
              <SelectTrigger className="w-44 h-8 text-xs"><UserCheck size={12} className="mr-1" /><SelectValue placeholder="Назначить отв." /></SelectTrigger>
              <SelectContent>
                {employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => {
              selected.forEach(id => deleteClient(id));
              toast.success(`Удалено ${selected.size} клиентов`);
              setSelected(new Set());
            }}>
              <Trash2 size={12} className="mr-1" /> Удалить
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={() => setSelected(new Set())}>Снять выбор</Button>
        </div>
      )}

      {/* Filter builder */}
      {showFilter && (
        <div className="mb-4 p-3 md:p-4 bg-card rounded-lg border space-y-2">
          {filterConditions.map((fc, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-center">
              <Select value={fc.field} onValueChange={v => { const n = [...filterConditions]; n[i].field = v; setFilterConditions(n); }}>
                <SelectTrigger className="w-32 md:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="country">Страна</SelectItem>
                  <SelectItem value="type">Тип</SelectItem>
                  <SelectItem value="status">Статус</SelectItem>
                  <SelectItem value="responsibleId">Ответственный</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fc.operator} onValueChange={v => { const n = [...filterConditions]; n[i].operator = v; setFilterConditions(n); }}>
                <SelectTrigger className="w-28 md:w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Равно</SelectItem>
                  <SelectItem value="contains">Содержит</SelectItem>
                </SelectContent>
              </Select>
              <Input value={fc.value} onChange={e => { const n = [...filterConditions]; n[i].value = e.target.value; setFilterConditions(n); }} className="w-32 md:w-40" placeholder="Значение" />
              <Button variant="ghost" size="sm" onClick={() => setFilterConditions(fc => fc.filter((_, idx) => idx !== i))}>✕</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setFilterConditions(f => [...f, { field: 'country', operator: 'equals', value: '' }])}>+ Добавить условие</Button>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} selectedCount={selected.size} />
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg mx-4">
          <DialogHeader><DialogTitle>Новый клиент</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Фамилия *</label><Input value={newClient.lastName} onChange={e => setNewClient(n => ({ ...n, lastName: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Имя *</label><Input value={newClient.firstName} onChange={e => setNewClient(n => ({ ...n, firstName: e.target.value }))} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Email *</label><Input value={newClient.email} onChange={e => setNewClient(n => ({ ...n, email: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Телефон</label><Input value={newClient.phone} onChange={e => setNewClient(n => ({ ...n, phone: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Страна</label><Input value={newClient.country} onChange={e => setNewClient(n => ({ ...n, country: e.target.value }))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Desk</label>
                <Select value={newClient.deskId} onValueChange={v => setNewClient(n => ({ ...n, deskId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{desks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Ответственный</label>
                <Select value={newClient.responsibleId} onValueChange={v => setNewClient(n => ({ ...n, responsibleId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
              <Button onClick={handleCreate}>Создать</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
