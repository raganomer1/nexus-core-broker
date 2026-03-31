import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminHistory() {
  const { history, employees } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const filtered = useMemo(() => {
    let result = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (sectionFilter !== 'All') result = result.filter(h => h.section === sectionFilter);
    if (sourceFilter !== 'All') result = result.filter(h => h.source === sourceFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(h => h.description.toLowerCase().includes(s) || (h.clientName && h.clientName.toLowerCase().includes(s)) || h.authorName.toLowerCase().includes(s));
    }
    return result;
  }, [history, sectionFilter, sourceFilter, search]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'historyActions')}</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-36 md:w-40"><SelectValue placeholder={t(lang, 'section')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t(lang, 'allSections')}</SelectItem>
              {['Clients','Accounts','Payments','Trading','Verification','Support','Assets','Settings','Employees','Auth'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-32 md:w-40"><SelectValue placeholder={t(lang, 'sourceFilter')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t(lang, 'allSources')}</SelectItem>
              <SelectItem value="Employee">{t(lang, 'employee')}</SelectItem>
              <SelectItem value="Client">{t(lang, 'client')}</SelectItem>
              <SelectItem value="System">{t(lang, 'system')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {filtered.slice(0, 100).map(h => (
          <div key={h.id} className="bg-card rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="status-badge status-new">{h.section}</span>
              <span className={`status-badge ${h.source === 'Employee' ? 'status-live' : h.source === 'Client' ? 'status-demo' : 'status-pending'}`}>{h.source}</span>
            </div>
            <div className="text-sm">{h.description}</div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between"><span>{h.authorName}</span><span>{new Date(h.timestamp).toLocaleString()}</span></div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'dateTime')}</th><th>{t(lang, 'client')}</th><th>{t(lang, 'desk')}</th><th>{t(lang, 'section')}</th><th>{t(lang, 'author')}</th><th>{t(lang, 'sourceFilter')}</th><th>{t(lang, 'description')}</th></tr></thead>
            <tbody>
              {filtered.slice(0, 100).map(h => (
                <tr key={h.id}>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="text-sm">{h.clientName || '—'}</td>
                  <td className="text-sm text-muted-foreground">{h.deskName || '—'}</td>
                  <td><span className="status-badge status-new">{h.section}</span></td>
                  <td className="text-sm">{h.authorName}</td>
                  <td><span className={`status-badge ${h.source === 'Employee' ? 'status-live' : h.source === 'Client' ? 'status-demo' : 'status-pending'}`}>{h.source}</span></td>
                  <td className="text-sm">{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">{t(lang, 'showing')} {Math.min(filtered.length, 100)} {t(lang, 'of')} {filtered.length}</div>
      </div>
    </div>
  );
}
