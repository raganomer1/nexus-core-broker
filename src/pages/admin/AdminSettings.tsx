import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

export default function AdminSettings() {
  const {
    clientStatusConfigs, addClientStatusConfig, updateClientStatusConfig, deleteClientStatusConfig,
    actionStatusConfigs, addActionStatusConfig, updateActionStatusConfig, deleteActionStatusConfig,
    reminderIntervals, addReminderInterval, updateReminderInterval, deleteReminderInterval,
    securitySettings, updateSecuritySettings,
  } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'statuses' | 'actions' | 'reminders' | 'security' | 'misc'>('statuses');
  const { state: delState, confirmDelete, close: closeDelete } = useConfirmDelete();

  // Edit forms
  const [editStatus, setEditStatus] = useState<{ id?: string; name: string; color: string; isDefault: boolean } | null>(null);
  const [editAction, setEditAction] = useState<{ id?: string; name: string; isCompleted: boolean } | null>(null);
  const [editReminder, setEditReminder] = useState<{ id?: string; label: string; minutes: number; isDefault: boolean } | null>(null);
  const [ipForm, setIpForm] = useState({ from: '', to: '', label: '' });

  const tabs = [
    { id: 'statuses', label: 'Статусы клиентов' },
    { id: 'actions', label: 'Статусы действий' },
    { id: 'reminders', label: 'Напоминания' },
    { id: 'security', label: 'Безопасность' },
    { id: 'misc', label: 'Дополнительно' },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'settings')}</h1>
      <div className="flex gap-1 mb-4 md:mb-6 flex-wrap overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${tab === tb.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'statuses' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Статусы клиентов</h3>
            <Button size="sm" variant="outline" onClick={() => setEditStatus({ name: '', color: '#6366f1', isDefault: false })}><Plus size={14} className="mr-1" />Добавить</Button>
          </div>
          <div className="space-y-2">
            {clientStatusConfigs.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-sm flex-1">{s.name}</span>
                {s.isDefault && <span className="text-xs text-primary">По умолчанию</span>}
                <Button variant="ghost" size="sm" onClick={() => setEditStatus({ id: s.id, name: s.name, color: s.color, isDefault: s.isDefault })}><Edit2 size={12} /></Button>
                <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить статус', `Удалить статус "${s.name}"?`, () => deleteClientStatusConfig(s.id))}><Trash2 size={12} className="text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'actions' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Статусы действий</h3>
            <Button size="sm" variant="outline" onClick={() => setEditAction({ name: '', isCompleted: false })}><Plus size={14} className="mr-1" />Добавить</Button>
          </div>
          <div className="space-y-2">
            {actionStatusConfigs.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <span className="text-sm flex-1">{s.name}</span>
                {s.isCompleted && <span className="status-badge status-live">Завершающий</span>}
                <Button variant="ghost" size="sm" onClick={() => setEditAction({ id: s.id, name: s.name, isCompleted: s.isCompleted })}><Edit2 size={12} /></Button>
                <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить статус', `Удалить "${s.name}"?`, () => deleteActionStatusConfig(s.id))}><Trash2 size={12} className="text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reminders' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Интервалы напоминаний</h3>
            <Button size="sm" variant="outline" onClick={() => setEditReminder({ label: '', minutes: 15, isDefault: false })}><Plus size={14} className="mr-1" />Добавить</Button>
          </div>
          <div className="space-y-2">
            {reminderIntervals.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <span className="text-sm flex-1">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.minutes} мин</span>
                {r.isDefault && <span className="text-xs text-primary">По умолчанию</span>}
                <Button variant="ghost" size="sm" onClick={() => setEditReminder({ id: r.id, label: r.label, minutes: r.minutes, isDefault: r.isDefault })}><Edit2 size={12} /></Button>
                <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить интервал', `Удалить "${r.label}"?`, () => deleteReminderInterval(r.id))}><Trash2 size={12} className="text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4 md:space-y-6 max-w-2xl">
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">Защита контактов</h3>
            <label className="flex items-center gap-2 text-sm mb-3"><Checkbox checked={securitySettings.contactProtection} onCheckedChange={v => updateSecuritySettings({ contactProtection: !!v })} /> Активировать защиту контактов</label>
            {securitySettings.contactProtection && <div className="text-xs text-muted-foreground">Скрытые поля: {securitySettings.protectedFields.join(', ')}</div>}
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">Защита редактирования</h3>
            <label className="flex items-center gap-2 text-sm mb-3"><Checkbox checked={securitySettings.editProtection} onCheckedChange={v => updateSecuritySettings({ editProtection: !!v })} /> Активировать защиту редактирования</label>
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">IP белый список</h3>
            <div className="space-y-2 mb-3">
              {securitySettings.ipWhitelist.map((ip, idx) => (
                <div key={ip.id} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                  <span className="flex-1 text-xs">{ip.from} — {ip.to} {ip.label && `(${ip.label})`}</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const newList = securitySettings.ipWhitelist.filter(i => i.id !== ip.id);
                    updateSecuritySettings({ ipWhitelist: newList });
                  }}><Trash2 size={12} className="text-destructive" /></Button>
                </div>
              ))}
              {securitySettings.ipWhitelist.length === 0 && <p className="text-sm text-muted-foreground">Нет ограничений</p>}
            </div>
            <div className="flex gap-2 items-end">
              <div><label className="text-xs text-muted-foreground">IP от</label><Input value={ipForm.from} onChange={e => setIpForm({...ipForm, from: e.target.value})} placeholder="192.168.1.1" className="h-8 text-xs" /></div>
              <div><label className="text-xs text-muted-foreground">IP до</label><Input value={ipForm.to} onChange={e => setIpForm({...ipForm, to: e.target.value})} placeholder="192.168.1.255" className="h-8 text-xs" /></div>
              <div><label className="text-xs text-muted-foreground">Метка</label><Input value={ipForm.label} onChange={e => setIpForm({...ipForm, label: e.target.value})} className="h-8 text-xs" /></div>
              <Button size="sm" onClick={() => {
                if (!ipForm.from || !ipForm.to) return;
                updateSecuritySettings({ ipWhitelist: [...securitySettings.ipWhitelist, { id: Date.now().toString(), ...ipForm }] });
                setIpForm({ from: '', to: '', label: '' });
              }}>Добавить</Button>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">Дополнительно</h3>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={securitySettings.showFullPhoneNumbers} onCheckedChange={v => updateSecuritySettings({ showFullPhoneNumbers: !!v })} /> Показывать полные номера телефонов</label>
          </div>
        </div>
      )}

      {tab === 'misc' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">Дополнительные настройки</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Конвертировать в Live при депозите</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox /> Разрешить редактирование даты создания</label>
          </div>
        </div>
      )}

      {/* Edit Status Dialog */}
      <Dialog open={!!editStatus} onOpenChange={() => setEditStatus(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader><DialogTitle>{editStatus?.id ? 'Редактировать' : 'Новый'} статус</DialogTitle></DialogHeader>
          {editStatus && (
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Название</label><Input value={editStatus.name} onChange={e => setEditStatus({...editStatus, name: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Цвет</label><Input type="color" value={editStatus.color} onChange={e => setEditStatus({...editStatus, color: e.target.value})} className="h-10 w-20" /></div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={editStatus.isDefault} onCheckedChange={v => setEditStatus({...editStatus, isDefault: !!v})} /> По умолчанию</label>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (editStatus.id) updateClientStatusConfig(editStatus.id, { name: editStatus.name as any, color: editStatus.color, isDefault: editStatus.isDefault });
                  else addClientStatusConfig({ name: editStatus.name as any, color: editStatus.color, isDefault: editStatus.isDefault });
                  setEditStatus(null);
                }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditStatus(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Action Dialog */}
      <Dialog open={!!editAction} onOpenChange={() => setEditAction(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader><DialogTitle>{editAction?.id ? 'Редактировать' : 'Новый'} статус действия</DialogTitle></DialogHeader>
          {editAction && (
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Название</label><Input value={editAction.name} onChange={e => setEditAction({...editAction, name: e.target.value})} /></div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={editAction.isCompleted} onCheckedChange={v => setEditAction({...editAction, isCompleted: !!v})} /> Завершающий статус</label>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (editAction.id) updateActionStatusConfig(editAction.id, { name: editAction.name as any, isCompleted: editAction.isCompleted });
                  else addActionStatusConfig({ name: editAction.name as any, isCompleted: editAction.isCompleted });
                  setEditAction(null);
                }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditAction(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Reminder Dialog */}
      <Dialog open={!!editReminder} onOpenChange={() => setEditReminder(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader><DialogTitle>{editReminder?.id ? 'Редактировать' : 'Новый'} интервал</DialogTitle></DialogHeader>
          {editReminder && (
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Название</label><Input value={editReminder.label} onChange={e => setEditReminder({...editReminder, label: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Минут</label><Input type="number" value={editReminder.minutes} onChange={e => setEditReminder({...editReminder, minutes: Number(e.target.value)})} /></div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={editReminder.isDefault} onCheckedChange={v => setEditReminder({...editReminder, isDefault: !!v})} /> По умолчанию</label>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (editReminder.id) updateReminderInterval(editReminder.id, { label: editReminder.label, minutes: editReminder.minutes, isDefault: editReminder.isDefault });
                  else addReminderInterval({ label: editReminder.label, minutes: editReminder.minutes, isDefault: editReminder.isDefault });
                  setEditReminder(null);
                }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditReminder(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
    </div>
  );
}
