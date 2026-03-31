import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

export default function AdminDesks() {
  const { desks, employees, addDesk, updateDesk, deleteDesk } = useStore();
  const { lang } = useSettingsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', managerId: '', employeeIds: [] as string[] });
  const { state: delState, confirmDelete, close: closeDelete } = useConfirmDelete();

  const handleSave = () => {
    if (!form.name) return;
    if (editingId) updateDesk(editingId, form);
    else addDesk(form);
    setShowForm(false); setEditingId(null); setForm({ name: '', description: '', managerId: '', employeeIds: [] });
  };

  const startEdit = (id: string) => {
    const d = desks.find(dk => dk.id === id);
    if (d) { setForm({ name: d.name, description: d.description || '', managerId: d.managerId || '', employeeIds: [...d.employeeIds] }); setEditingId(id); setShowForm(true); }
  };

  const viewDesk = desks.find(d => d.id === viewId);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'desks')}</h1>
        <Button size="sm" onClick={() => { setForm({ name: '', description: '', managerId: '', employeeIds: [] }); setEditingId(null); setShowForm(true); }}><Plus size={14} className="mr-1" /> {t(lang, 'newDesk')}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {desks.map(d => {
          const manager = employees.find(e => e.id === d.managerId);
          const members = employees.filter(e => d.employeeIds.includes(e.id));
          return (
            <div key={d.id} className="bg-card rounded-lg border p-4 md:p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold">{d.name}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewId(d.id)}><Eye size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(d.id)}><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить деск', `Удалить деск "${d.name}"?`, () => deleteDesk(d.id))}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{d.description || 'Без описания'}</p>
              <div className="text-sm mb-2"><span className="text-muted-foreground">Менеджер: </span><span className="font-medium">{manager ? `${manager.firstName} ${manager.lastName}` : '—'}</span></div>
              <div className="text-sm mb-3"><span className="text-muted-foreground">Сотрудников: </span><span className="font-medium">{members.length}</span></div>
              <div className="flex flex-wrap gap-1">{members.map(m => (<span key={m.id} className="status-badge status-new">{m.firstName} {m.lastName[0]}.</span>))}</div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingId(null); }}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>{editingId ? 'Редактировать деск' : t(lang, 'newDesk')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Название *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">Описание</label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">Менеджер</label>
              <Select value={form.managerId || '__none'} onValueChange={v => setForm({ ...form, managerId: v === '__none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent><SelectItem value="__none">—</SelectItem>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Сотрудники</label>
              <div className="max-h-40 overflow-y-auto space-y-1 mt-1">
                {employees.filter(e => e.isActive).map(e => (
                  <label key={e.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.employeeIds.includes(e.id)} onCheckedChange={() => setForm(f => ({ ...f, employeeIds: f.employeeIds.includes(e.id) ? f.employeeIds.filter(x => x !== e.id) : [...f.employeeIds, e.id] }))} />
                    {e.firstName} {e.lastName}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Отмена</Button><Button onClick={handleSave}>{editingId ? 'Сохранить' : 'Создать'}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Деск: {viewDesk?.name}</DialogTitle></DialogHeader>
          {viewDesk && (
            <div className="space-y-3">
              <div><span className="text-sm text-muted-foreground">Описание:</span><p className="text-sm">{viewDesk.description || '—'}</p></div>
              <div><span className="text-sm text-muted-foreground">Менеджер:</span><p className="text-sm font-medium">{(() => { const m = employees.find(e => e.id === viewDesk.managerId); return m ? `${m.firstName} ${m.lastName}` : '—'; })()}</p></div>
              <div><span className="text-sm text-muted-foreground">Сотрудники:</span>
                <div className="mt-1 space-y-1">{employees.filter(e => viewDesk.employeeIds.includes(e.id)).map(e => (
                  <div key={e.id} className="text-sm p-1.5 bg-muted/30 rounded">{e.firstName} {e.lastName} — {e.email}</div>
                ))}</div>
              </div>
              <div className="text-xs text-muted-foreground">Создан: {new Date(viewDesk.createdAt).toLocaleDateString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
    </div>
  );
}
