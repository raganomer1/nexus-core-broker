import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminEmployees() {
  const { employees, roles, desks, addEmployee } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'Admin' | 'Sales' | 'Archived'>('Admin');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ lastName: '', firstName: '', email: '', type: 'Admin' as any, position: '', department: '', roleId: '', desks: [] as string[], canViewContacts: true, canEdit: true, isActive: true, phone: '' });

  const filtered = employees.filter(e => {
    if (tab === 'Archived') return !e.isActive;
    return e.isActive && e.type === tab;
  }).filter(e => !search || e.lastName.toLowerCase().includes(search.toLowerCase()) || e.firstName.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => { if (!form.lastName || !form.email) return; addEmployee(form); setShowCreate(false); };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'employees')}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'newEmployee')}</Button>
      </div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {(['Admin', 'Sales', 'Archived'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb === 'Admin' ? t(lang, 'administration') : tb === 'Sales' ? t(lang, 'managers') : t(lang, 'archive')}
          </button>
        ))}
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="bg-card rounded-lg border p-4">
            <div className="font-medium text-sm">{e.lastName} {e.firstName}</div>
            <div className="text-xs text-muted-foreground mt-1">{e.email}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs">{e.desks.map(d => desks.find(dk => dk.id === d)?.name).filter(Boolean).join(', ') || '—'}</span>
              {e.canViewContacts ? <span className="text-success text-xs">{t(lang, 'contacts')}: {t(lang, 'yes')}</span> : <span className="text-destructive text-xs">{t(lang, 'contacts')}: {t(lang, 'no')}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>{t(lang, 'name')}</th><th>{t(lang, 'desks')}</th><th>{t(lang, 'email')}</th><th>{t(lang, 'contactAccess')}</th><th>{t(lang, 'lastLogin')}</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.lastName} {e.firstName}</td>
                  <td className="text-sm">{e.desks.map(d => desks.find(dk => dk.id === d)?.name).filter(Boolean).join(', ') || '—'}</td>
                  <td>{e.email}</td>
                  <td>{e.canViewContacts ? <span className="text-success text-xs">{t(lang, 'yes')}</span> : <span className="text-destructive text-xs">{t(lang, 'no')}</span>}</td>
                  <td className="text-xs text-muted-foreground">{e.lastLogin ? new Date(e.lastLogin).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader><DialogTitle>{t(lang, 'newEmployee')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{t(lang, 'lastName')} *</label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'firstName')} *</label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'email')} *</label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'phone')}</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{t(lang, 'position')}</label><Input value={form.position} onChange={e => setForm({...form, position: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">{t(lang, 'department')}</label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'type')}</label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Sales">Sales</SelectItem></SelectContent></Select></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'role')}</label>
              <Select value={form.roleId} onValueChange={v => setForm({...form, roleId: v})}><SelectTrigger><SelectValue placeholder={t(lang, 'selectOption')} /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>{t(lang, 'cancel')}</Button><Button onClick={handleCreate}>{t(lang, 'create')}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
