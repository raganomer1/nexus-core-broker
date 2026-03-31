import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Plus, Download, Upload, ArrowRight, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportLeadsToXlsx, parseXlsxFile, mapRowsToLeads } from '@/lib/xlsxUtils';
import { toast } from 'sonner';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';

export default function AdminLeads() {
  const { leads, employees, desks, addLead, convertLeadToClient, updateLead } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [filterManager, setFilterManager] = useState('All');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

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

  const filtered = useMemo(() => {
    let result = leads.filter(l => !l.convertedClientId);
    if (statusFilter !== 'All') result = result.filter(l => l.status === statusFilter);
    if (filterManager !== 'All') result = result.filter(l => l.responsibleId === filterManager);
    if (filterCountry) result = result.filter(l => l.country?.toLowerCase().includes(filterCountry.toLowerCase()));
    if (filterDateFrom) result = result.filter(l => l.createdAt >= filterDateFrom);
    if (filterDateTo) result = result.filter(l => l.createdAt <= filterDateTo);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => l.lastName.toLowerCase().includes(s) || l.firstName.toLowerCase().includes(s) || l.email.toLowerCase().includes(s));
    }
    return result;
  }, [leads, statusFilter, search, filterManager, filterCountry, filterDateFrom, filterDateTo]);

  const handleCreate = () => {
    if (!newLead.lastName || !newLead.email) { toast.error('Фамилия и Email обязательны'); return; }
    addLead(newLead);
    setShowCreate(false);
    setNewLead({ lastName: '', firstName: '', email: '', phone: '', country: '', status: 'New', source: '', responsibleId: '', notes: '' });
    toast.success('Лид создан');
  };

  const hasActiveFilters = filterManager !== 'All' || filterCountry || filterDateFrom || filterDateTo;
  const clearFilters = () => { setFilterManager('All'); setFilterCountry(''); setFilterDateFrom(''); setFilterDateTo(''); };

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
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={hasActiveFilters ? 'border-primary text-primary' : ''}>
            <Filter size={14} className="mr-1" /> {t(lang, 'filters') || 'Фильтры'}
          </Button>
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload size={14} className="mr-1" /> {t(lang, 'import')}</Button>
          <Button variant="outline" size="sm" onClick={() => exportLeadsToXlsx(filtered)}><Download size={14} className="mr-1" /> {t(lang, 'export')}</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'newLead')}</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 md:w-40"><SelectValue placeholder={t(lang, 'status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t(lang, 'all')}</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Hot">Hot</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="No answer">No answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-card rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Расширенные фильтры</span>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7"><X size={12} className="mr-1" /> Сбросить</Button>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <label className="text-xs text-muted-foreground mb-1 block">Страна</label>
              <Input value={filterCountry} onChange={e => setFilterCountry(e.target.value)} placeholder="Страна" className="h-9 text-xs" />
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

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(lead => {
          const resp = employees.find(e => e.id === lead.responsibleId);
          return (
            <div key={lead.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{lead.lastName} {lead.firstName}</span>
                <span className={`status-badge ${lead.status === 'Hot' ? 'status-hot' : lead.status === 'New' ? 'status-new' : 'status-lead'}`}>{lead.status}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>{lead.email}</div>
                <div>{lead.phone || '—'} · {lead.country || '—'}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{resp ? `${resp.firstName} ${resp.lastName[0]}.` : '—'}</span>
                <Button variant="ghost" size="sm" onClick={() => convertLeadToClient(lead.id)} title={t(lang, 'convertToClient')}><ArrowRight size={14} /></Button>
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
                    <td><span className={`status-badge ${lead.status === 'Hot' ? 'status-hot' : lead.status === 'New' ? 'status-new' : 'status-lead'}`}>{lead.status}</span></td>
                    <td className="text-sm text-muted-foreground">{lead.source || '—'}</td>
                    <td className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="text-sm">{resp ? `${resp.firstName} ${resp.lastName[0]}.` : '—'}</td>
                    <td><Button variant="ghost" size="sm" onClick={() => convertLeadToClient(lead.id)} title={t(lang, 'convertToClient')}><ArrowRight size={14} /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Create Lead Dialog — Multi-block */}
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
                    <SelectContent>{['New','Hot','Lead','No answer'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
    </div>
  );
}
