import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Check, X, Ban, FileText, ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VerificationStatus } from '@/types';

export default function AdminVerification() {
  const { verificationRequests, clients, employees, updateVerificationStatus, auth } = useStore();
  const { lang } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<VerificationStatus>('Pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [managerFilter, setManagerFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const tabs: { label: string; value: VerificationStatus }[] = [
    { label: t(lang, 'pendingReview'), value: 'Pending' },
    { label: t(lang, 'unverified'), value: 'Unverified' },
    { label: t(lang, 'rejectedStatus'), value: 'Rejected' },
    { label: t(lang, 'verified'), value: 'Verified' },
    { label: t(lang, 'banned'), value: 'Banned' },
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
      result = result.filter(v => {
        const c = clients.find(cl => cl.id === v.clientId);
        return c && (c.lastName.toLowerCase().includes(s) || c.firstName.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
      });
    }
    if (managerFilter !== 'All') {
      result = result.filter(v => {
        const c = clients.find(cl => cl.id === v.clientId);
        return c?.responsibleId === managerFilter;
      });
    }
    if (countryFilter !== 'All') {
      result = result.filter(v => {
        const c = clients.find(cl => cl.id === v.clientId);
        return c?.country === countryFilter;
      });
    }
    return result;
  }, [verificationRequests, activeTab, search, managerFilter, countryFilter, clients]);

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
            <SelectContent>
              <SelectItem value="All">Все менеджеры</SelectItem>
              {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Страна" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все страны</SelectItem>
              {countries.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setManagerFilter('All'); setCountryFilter('All'); }}>Сброс</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className={`bg-card rounded-lg border overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="divide-y">
            {filtered.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">{t(lang, 'noApplications')}</div>}
            {filtered.map(v => {
              const client = clients.find(c => c.id === v.clientId);
              return (
                <div key={v.id} onClick={() => setSelectedId(v.id)} className={`p-4 cursor-pointer transition-colors ${selectedId === v.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between"><span className="font-medium text-sm">{client?.lastName} {client?.firstName}</span><span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span></div>
                  <div className="text-xs text-muted-foreground mt-1">{client?.email} · {t(lang, 'documents')}: {v.documents.length}{client?.country ? ` · ${client.country}` : ''}</div>
                </div>
              );
            })}
          </div>
        </div>

        {selected && selectedClient && (
          <div className={`bg-card rounded-lg border p-4 md:p-5 ${!selectedId ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center gap-3 mb-3 lg:hidden"><button onClick={() => setSelectedId(null)}><ArrowLeft size={18} /></button><span className="font-semibold text-sm">{t(lang, 'back')}</span></div>
            <h3 className="text-lg font-semibold mb-1">{selectedClient.lastName} {selectedClient.firstName}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedClient.email} · {selectedClient.country || '—'}</p>
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">{t(lang, 'documents')}</h4>
              {selected.documents.length === 0 ? (<p className="text-sm text-muted-foreground">{t(lang, 'noDocuments')}</p>) : (
                <div className="space-y-2">{selected.documents.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <FileText size={20} className="text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0"><div className="text-sm font-medium truncate">{d.fileName}</div><div className="text-xs text-muted-foreground">{d.fileType} · {new Date(d.uploadedAt).toLocaleString()}</div></div>
                  </div>
                ))}</div>
              )}
            </div>
            {activeTab === 'Pending' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => updateVerificationStatus(selected.id, 'Verified', auth.employeeId)}><Check size={14} className="mr-1" /> {t(lang, 'verify')}</Button>
                <Button variant="outline" size="sm" onClick={() => updateVerificationStatus(selected.id, 'Rejected', auth.employeeId)}><X size={14} className="mr-1" /> {t(lang, 'reject')}</Button>
                <Button variant="destructive" size="sm" onClick={() => updateVerificationStatus(selected.id, 'Banned', auth.employeeId)}><Ban size={14} className="mr-1" /> {t(lang, 'ban')}</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
