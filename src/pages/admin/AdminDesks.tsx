import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDesks() {
  const { desks, employees, addDesk } = useStore();
  const { lang } = useSettingsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', managerId: '', employeeIds: [] as string[] });

  const handleCreate = () => { if (!form.name) return; addDesk(form); setShowCreate(false); setForm({ name: '', description: '', managerId: '', employeeIds: [] }); };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'desks')}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'newDesk')}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {desks.map(d => {
          const manager = employees.find(e => e.id === d.managerId);
          const members = employees.filter(e => d.employeeIds.includes(e.id));
          return (
            <div key={d.id} className="bg-card rounded-lg border p-4 md:p-5">
              <h3 className="text-base md:text-lg font-semibold mb-1">{d.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{d.description || t(lang, 'noDescription')}</p>
              <div className="text-sm mb-2"><span className="text-muted-foreground">{t(lang, 'manager')}: </span><span className="font-medium">{manager ? `${manager.firstName} ${manager.lastName}` : '—'}</span></div>
              <div className="text-sm mb-3"><span className="text-muted-foreground">{t(lang, 'employeesInDesk')}: </span><span className="font-medium">{members.length}</span></div>
              <div className="flex flex-wrap gap-1">{members.map(m => (<span key={m.id} className="status-badge status-new">{m.firstName} {m.lastName[0]}.</span>))}</div>
            </div>
          );
        })}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>{t(lang, 'newDesk')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">{t(lang, 'name')} *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'description')}</label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'manager')}</label>
              <Select value={form.managerId} onValueChange={v => setForm({ ...form, managerId: v })}>
                <SelectTrigger><SelectValue placeholder={t(lang, 'selectOption')} /></SelectTrigger>
                <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>{t(lang, 'cancel')}</Button><Button onClick={handleCreate}>{t(lang, 'create')}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
