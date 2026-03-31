import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

type SortKey = 'fullName' | 'email' | 'lastLogin' | 'accountNumber';

export default function AdminOnline() {
  const { sessions, clients } = useStore();
  const { lang } = useSettingsStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('lastLogin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  const filtered = useMemo(() => {
    let result = sessions.filter(s => {
      if (statusFilter === 'Online' && !s.isOnline) return false;
      if (statusFilter === 'Offline' && s.isOnline) return false;
      if (typeFilter === 'Demo' && !s.isDemo) return false;
      if (typeFilter === 'Real' && s.isDemo) return false;
      if (search) { const q = search.toLowerCase(); return (s.fullName?.toLowerCase().includes(q)) || s.accountNumber?.includes(q) || s.email?.toLowerCase().includes(q); }
      return true;
    });
    result.sort((a, b) => {
      const av = (a as any)[sortKey] || '';
      const bv = (b as any)[sortKey] || '';
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [sessions, search, statusFilter, typeFilter, sortKey, sortDir]);

  const handleClickClient = (s: any) => {
    const client = clients.find(c => c.id === s.clientId);
    if (client) navigate(`/admin/clients/${client.id}`);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'onlineClients')}</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="All">Все</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem></SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="All">Все типы</SelectItem><SelectItem value="Real">Real</SelectItem><SelectItem value="Demo">Demo</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-card rounded-lg border p-4 cursor-pointer hover:bg-muted/50" onClick={() => handleClickClient(s)}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{s.fullName || '—'}</span>
              <div className="flex items-center gap-1.5"><Circle size={8} fill={s.isOnline ? 'hsl(142, 71%, 45%)' : 'hsl(220, 10%, 50%)'} stroke="none" /><span className="text-xs">{s.isOnline ? 'Online' : 'Offline'}</span></div>
            </div>
            <div className="text-xs text-muted-foreground">{s.accountNumber} · {s.email || '—'}</div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30">
              <th>{t(lang, 'group')}</th>
              <th className="cursor-pointer" onClick={() => toggleSort('accountNumber')}>Счёт{sortIcon('accountNumber')}</th>
              <th className="cursor-pointer" onClick={() => toggleSort('fullName')}>Имя{sortIcon('fullName')}</th>
              <th className="cursor-pointer" onClick={() => toggleSort('email')}>Email{sortIcon('email')}</th>
              <th>IP рег.</th><th>IP текущий</th><th>Статус</th>
              <th className="cursor-pointer" onClick={() => toggleSort('lastLogin')}>Авторизация{sortIcon('lastLogin')}</th>
              <th>Отключение</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleClickClient(s)}>
                  <td><span className="status-badge status-new">{s.group}</span></td>
                  <td className="font-medium">{s.accountNumber}</td>
                  <td>{s.fullName || '—'}</td>
                  <td className="text-sm">{s.email || '—'}</td>
                  <td className="text-xs text-muted-foreground font-mono">{s.registrationIp || '—'}</td>
                  <td className="text-xs text-muted-foreground font-mono">{s.currentIp || '—'}</td>
                  <td><div className="flex items-center gap-1.5"><Circle size={8} fill={s.isOnline ? 'hsl(142, 71%, 45%)' : 'hsl(220, 10%, 50%)'} stroke="none" /><span className="text-xs">{s.isOnline ? 'Online' : 'Offline'}</span></div></td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{s.lastLogin ? new Date(s.lastLogin).toLocaleString() : '—'}</td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{s.lastDisconnect ? new Date(s.lastDisconnect).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
