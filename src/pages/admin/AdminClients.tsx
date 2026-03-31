import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, Upload, Eye, EyeOff, Trash2, UserCheck, Tag, X, CalendarDays } from 'lucide-react';
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

const statusTabs: { label: string; value: ClientStatus | 'All' }[] = [
  { label: 'Все', value: 'All' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Live', value: 'Live' },
  { label: 'Demo', value: 'Demo' },
  { label: 'New', value: 'New' },
  { label: 'Cold', value: 'Cold' },
  { label: 'Spam', value: 'Spam' },
];

const statusColors: Record<string, string> = {
  New: 'status-new', Hot: 'status-hot', Lead: 'status-lead', Spam: 'status-spam',
  Live: 'status-live', Demo: 'status-demo', Cold: 'bg-gray-100 text-gray-600',
  'Not interesting': 'bg-gray-100 text-gray-500', 'No answer': 'status-pending',
};

const emptyClient = {
  salutation: '', lastName: '', firstName: '', middleName: '', deskId: '', responsibleId: '',
  status: 'New' as ClientStatus, affiliateId: '', country: '', region: '', city: '', zip: '',
  address: '', email: '', phone: '', additionalContact: '', citizenship: '', campaignId: '',
  tag1: '', tag2: '', passport: '', birthday: '', purpose: '', source: '', description: '',
  type: 'Lead' as const,
};

export default function AdminClients() {
  const navigate = useNavigate();
  const { clients, employees, desks, addClient, deleteClient, updateClient, securitySettings, tradingAccounts } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'All'>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contactsVisible, setContactsVisible] = useState<Set<string>>(new Set());

  // Advanced filters
  const [filterManager, setFilterManager] = useState('All');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterDesk, setFilterDesk] = useState('All');
  const [filterVerification, setFilterVerification] = useState('All');
  const [filterDeposit, setFilterDeposit] = useState('All'); // All | HasDeposit | NoDeposit
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

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

  const filtered = useMemo(() => {
    let result = clients;
    if (statusFilter !== 'All') result = result.filter(c => c.status === statusFilter);
    if (filterManager !== 'All') result = result.filter(c => c.responsibleId === filterManager);
    if (filterDesk !== 'All') result = result.filter(c => c.deskId === filterDesk);
    if (filterCountry) result = result.filter(c => c.country?.toLowerCase().includes(filterCountry.toLowerCase()));
    if (filterVerification !== 'All') result = result.filter(c => c.verificationStatus === filterVerification);
    if (filterDeposit === 'HasDeposit') {
      const clientsWithDeposit = new Set(tradingAccounts.filter(a => a.deposited > 0).map(a => a.clientId));
      result = result.filter(c => clientsWithDeposit.has(c.id));
    } else if (filterDeposit === 'NoDeposit') {
      const clientsWithDeposit = new Set(tradingAccounts.filter(a => a.deposited > 0).map(a => a.clientId));
      result = result.filter(c => !clientsWithDeposit.has(c.id));
    }
    if (filterDateFrom) result = result.filter(c => c.createdAt >= filterDateFrom);
    if (filterDateTo) result = result.filter(c => c.createdAt <= filterDateTo);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.lastName.toLowerCase().includes(s) || c.firstName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))
      );
    }
    return result;
  }, [clients, statusFilter, search, filterManager, filterDesk, filterCountry, filterVerification, filterDeposit, filterDateFrom, filterDateTo, tradingAccounts]);

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

  const clearFilters = () => {
    setFilterManager('All'); setFilterCountry(''); setFilterDesk('All');
    setFilterVerification('All'); setFilterDeposit('All');
    setFilterDateFrom(''); setFilterDateTo('');
  };

  const hasActiveFilters = filterManager !== 'All' || filterCountry || filterDesk !== 'All' || filterVerification !== 'All' || filterDeposit !== 'All' || filterDateFrom || filterDateTo;

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
          <Button variant="outline" size="sm" onClick={() => setShowFilter(!showFilter)} className={hasActiveFilters ? 'border-primary text-primary' : ''}>
            <Filter size={14} className="mr-1" /> Фильтры {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
          </Button>
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

      {/* Advanced filters */}
      {showFilter && (
        <div className="mb-4 p-4 bg-card rounded-lg border space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Расширенные фильтры</span>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7"><X size={12} className="mr-1" /> Сбросить</Button>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Менеджер</label>
              <Select value={filterManager} onValueChange={setFilterManager}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Все</SelectItem>
                  {employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Desk</label>
              <Select value={filterDesk} onValueChange={setFilterDesk}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Все</SelectItem>
                  {desks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Страна</label>
              <Input value={filterCountry} onChange={e => setFilterCountry(e.target.value)} placeholder="Страна" className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Верификация</label>
              <Select value={filterVerification} onValueChange={setFilterVerification}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Все</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Unverified">Unverified</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Депозит</label>
              <Select value={filterDeposit} onValueChange={setFilterDeposit}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Все</SelectItem>
                  <SelectItem value="HasDeposit">С депозитом</SelectItem>
                  <SelectItem value="NoDeposit">Без депозита</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Дата от</label>
              <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Дата до</label>
              <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Выбрано: {selected.size}</span>
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={v => { selected.forEach(id => updateClient(id, { status: v as ClientStatus })); toast.success(`Статус изменён у ${selected.size} клиентов`); setSelected(new Set()); }}>
              <SelectTrigger className="w-36 h-8 text-xs"><Tag size={12} className="mr-1" /><SelectValue placeholder="Сменить статус" /></SelectTrigger>
              <SelectContent>{['New', 'Hot', 'Lead', 'Live', 'Demo', 'Cold', 'Spam'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                      <SelectContent>{['New','Hot','Cold','Lead','Live','Demo','Spam'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
