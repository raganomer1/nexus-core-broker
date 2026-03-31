import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { ExternalLink, Save, Plus, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const InfoRow = ({ label, value, isLink }: { label: string; value?: string | null; isLink?: boolean }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 min-h-[40px]">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    {isLink && value ? (
      <a href={`mailto:${value}`} className="text-sm font-medium text-primary hover:underline truncate ml-4">{value}</a>
    ) : (
      <span className="text-sm font-medium text-right truncate ml-4">{value || ''}</span>
    )}
  </div>
);

export default function AdminClientCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { lang } = useSettingsStore();
  const { clients, employees, desks, clientNotes, tradingAccounts, updateClient, addClientNote, impersonateClient, auth, addHistoryEvent, history } = store;

  const [newNote, setNewNote] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddDesc, setShowAddDesc] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [actionData, setActionData] = useState({ type: 'Phone call', description: '', responsibleId: '', status: 'New', actionDate: new Date().toISOString().slice(0, 16) });

  const client = clients.find(c => c.id === id);
  const resp = client ? employees.find(e => e.id === client.responsibleId) : null;
  const desk = client ? desks.find(d => d.id === client.deskId) : null;
  const notes = client ? clientNotes.filter(n => n.clientId === client.id) : [];
  const accounts = client ? tradingAccounts.filter(a => a.clientId === client.id) : [];
  const clientHistory = client ? history.filter(h => h.clientId === client.id).slice(0, 20) : [];

  useEffect(() => {
    if (auth.employeeId && client) {
      addHistoryEvent({ clientId: client.id, clientName: `${client.lastName} ${client.firstName}`, section: 'Clients', authorId: auth.employeeId, authorName: (() => { const e = employees.find(emp => emp.id === auth.employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })(), source: 'Employee', description: t(lang, 'viewingClientCard') });
    }
  }, [id]);

  if (!client) return <div className="p-6">{t(lang, 'clientNotFound')}</div>;

  const handleImpersonate = () => { if (auth.employeeId) { impersonateClient(client.id, auth.employeeId); navigate('/client'); } };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold">{client.lastName} {client.firstName}</h1>
          <span className="px-2.5 py-0.5 rounded border text-xs font-medium text-muted-foreground bg-muted">ID {client.id.slice(0, 5)}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleImpersonate} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <ExternalLink size={14} className="mr-1" /> Зарегистрировать
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/clients')}>Закрыть</Button>
        </div>
      </div>

      {/* 3-column info blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* General */}
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Общая информация</h3>
          <InfoRow label="Обращение" value={client.salutation} />
          <InfoRow label="Фамилия" value={client.lastName} />
          <InfoRow label="Имя" value={client.firstName} />
          <InfoRow label="Отчество" value={client.middleName} />
          <InfoRow label="Деск" value={desk?.name} />
          <InfoRow label="Ответственный" value={resp ? `${resp.firstName} ${resp.lastName}` : undefined} />
          <InfoRow label="Тип" value={client.type} />
          <InfoRow label="Статус" value={client.status} />
          <InfoRow label="Affiliate id" value={client.affiliateId} />
          <InfoRow label="Создан" value={new Date(client.createdAt).toLocaleString()} />
        </div>

        {/* Contacts */}
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Контактная информация</h3>
          <InfoRow label="Страна" value={client.country || 'Default'} />
          <InfoRow label="Регион" value={client.region} />
          <InfoRow label="Город" value={client.city} />
          <InfoRow label="Индекс" value={client.zip} />
          <InfoRow label="Адрес" value={client.address} />
          <InfoRow label="Email" value={client.email} isLink />
          <InfoRow label="Телефон" value={client.phone} />
          <InfoRow label="Дополнительный контакт" value={client.additionalContact} />
          <InfoRow label="Был в кабинете" value={client.lastCabinetVisit ? new Date(client.lastCabinetVisit).toLocaleString() : ''} />
          <InfoRow label="Был в терминале" value={client.lastTerminalVisit ? new Date(client.lastTerminalVisit).toLocaleString() : ''} />
        </div>

        {/* Additional */}
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Дополнительная информация</h3>
          <InfoRow label="Origin" value={client.origin || 'None'} />
          <InfoRow label="Верификация" value={client.verificationStatus === 'Unverified' ? 'Не верифицирован' : client.verificationStatus} />
          <InfoRow label="Гражданство" value={client.citizenship} />
          <InfoRow label="Campaign id" value={client.campaignId} />
          <InfoRow label="Tag 1" value={client.tag1} />
          <InfoRow label="Tag 2" value={client.tag2} />
          <InfoRow label="Паспорт" value={client.passport} />
          <InfoRow label="Дата рождения" value={client.birthday} />
          <InfoRow label="Цель" value={client.purpose} />
          <InfoRow label="Источник" value={client.source || 'Default source'} />
        </div>
      </div>

      {/* Description + Notes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Описание</h3>
          {client.description ? (
            <p className="text-sm text-muted-foreground mb-3">{client.description}</p>
          ) : null}
          {showAddDesc ? (
            <div className="space-y-2">
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Введите текст" rows={2} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { if (newDesc.trim()) { updateClient(client.id, { description: (client.description ? client.description + '\n' : '') + newDesc }); setNewDesc(''); setShowAddDesc(false); toast.success('Описание обновлено'); } }}>Сохранить</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddDesc(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddDesc(true)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus size={14} /> Добавить
            </button>
          )}
        </div>

        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Заметки</h3>
          {notes.map(n => {
            const author = employees.find(e => e.id === n.authorId);
            return (
              <div key={n.id} className="p-2.5 bg-muted/30 rounded mb-2 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{author ? `${author.firstName} ${author.lastName}` : '—'}</span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p>{n.text}</p>
              </div>
            );
          })}
          {showAddNote ? (
            <div className="space-y-2 mt-2">
              <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Введите заметку" rows={2} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { if (newNote.trim()) { addClientNote(client.id, newNote); setNewNote(''); setShowAddNote(false); } }}>Сохранить</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddNote(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddNote(true)} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2">
              <Plus size={14} /> Добавить
            </button>
          )}
        </div>
      </div>

      {/* Actions table */}
      <div className="border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Действия</h3>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAction(true)}><Plus size={14} /></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Дата действ...</th>
                <th>Закрыто</th>
                <th>Тип</th>
                <th>Создатель</th>
                <th>Описание</th>
                <th>Ответственный</th>
                <th>Статус</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {clientHistory.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-4">Нет действий</td></tr>
              ) : clientHistory.map(h => {
                const author = employees.find(e => e.id === h.authorId);
                return (
                  <tr key={h.id}>
                    <td className="text-xs whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                    <td className="text-xs"></td>
                    <td className="text-sm">{h.section}</td>
                    <td className="text-sm">{h.authorName}</td>
                    <td className="text-sm">{h.description}</td>
                    <td className="text-sm">{resp ? `${resp.firstName} ${resp.lastName}` : '—'}</td>
                    <td><span className="flex items-center gap-1.5 text-xs"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> New</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="p-1 text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                        <button className="p-1 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            Показать
            <Select defaultValue="20">
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
            </Select>
          </div>
          <span>Всего: {clientHistory.length}</span>
        </div>
      </div>

      {/* Add Action Dialog */}
      <Dialog open={showAction} onOpenChange={setShowAction}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Новое действие</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Тип</label>
              <Select value={actionData.type} onValueChange={v => setActionData({ ...actionData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phone call">Phone call</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Описание</label>
              <Input value={actionData.description} onChange={e => setActionData({ ...actionData, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ответственный</label>
              <Select value={actionData.responsibleId} onValueChange={v => setActionData({ ...actionData, responsibleId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => {
                if (auth.employeeId) {
                  addHistoryEvent({ clientId: client.id, clientName: `${client.lastName} ${client.firstName}`, section: 'Clients' as const, authorId: auth.employeeId, authorName: (() => { const e = employees.find(emp => emp.id === auth.employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })(), source: 'Employee', description: `${actionData.type}: ${actionData.description}` });
                  toast.success('Действие добавлено');
                  setShowAction(false);
                  setActionData({ type: 'Phone call', description: '', responsibleId: '' });
                }
              }}>Сохранить</Button>
              <Button variant="outline" onClick={() => setShowAction(false)}>Отмена</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
