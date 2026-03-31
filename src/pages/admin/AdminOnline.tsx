import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminOnline() {
  const { sessions } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = sessions.filter(s => {
    if (statusFilter === 'Online' && !s.isOnline) return false;
    if (statusFilter === 'Offline' && s.isOnline) return false;
    if (typeFilter === 'Demo' && !s.isDemo) return false;
    if (typeFilter === 'Real' && s.isDemo) return false;
    if (search) { const q = search.toLowerCase(); return (s.fullName?.toLowerCase().includes(q)) || s.accountNumber?.includes(q) || s.email?.toLowerCase().includes(q); }
    return true;
  });

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'onlineClients')}</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 md:w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="All">{t(lang, 'all')}</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem></SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28 md:w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="All">{t(lang, 'allTypes')}</SelectItem><SelectItem value="Real">Real</SelectItem><SelectItem value="Demo">Demo</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{s.fullName || '—'}</span>
              <div className="flex items-center gap-1.5"><Circle size={8} fill={s.isOnline ? 'hsl(142, 71%, 45%)' : 'hsl(220, 10%, 50%)'} stroke="none" /><span className="text-xs">{s.isOnline ? 'Online' : 'Offline'}</span></div>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>{t(lang, 'account')}: {s.accountNumber} · <span className="status-badge status-new">{s.group}</span></div>
              <div>{s.email || '—'}</div>
              <div>IP: {s.currentIp || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'group')}</th><th>{t(lang, 'account')}</th><th>{t(lang, 'fullName')}</th><th>{t(lang, 'email')}</th><th>{t(lang, 'registrationIp')}</th><th>{t(lang, 'currentIp')}</th><th>{t(lang, 'status')}</th><th>{t(lang, 'authorization')}</th><th>{t(lang, 'disconnection')}</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
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
