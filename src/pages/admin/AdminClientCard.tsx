import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { ExternalLink, Save, Plus, X, Pencil, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const InfoRow = ({ label, value, isLink, onEdit }: { label: string; value?: string | null; isLink?: boolean; onEdit?: () => void }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 min-h-[40px] group">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <div className="flex items-center gap-1 ml-4">
      {isLink && value ? (
        <a href={`mailto:${value}`} className="text-sm font-medium text-primary hover:underline truncate">{value}</a>
      ) : (
        <span className="text-sm font-medium text-right truncate">{value || ''}</span>
      )}
      {onEdit && (
        <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
          <Pencil size={11} />
        </button>
      )}
    </div>
  </div>
);

export default function AdminClientCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { lang } = useSettingsStore();
  const { clients, employees, desks, clientNotes, tradingAccounts, updateClient, addClientNote, addTradingAccount, impersonateClient, auth, addHistoryEvent, updateHistoryEvent, deleteHistoryEvent, history } = store;

  const [newNote, setNewNote] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddDesc, setShowAddDesc] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [actionData, setActionData] = useState({ type: 'Phone call', description: '', responsibleId: '', status: 'New', actionDate: new Date().toISOString().slice(0, 16) });
  const [editStatusId, setEditStatusId] = useState<string | null>(null);
  const [editStatusValue, setEditStatusValue] = useState('');

  // Inline edit
  const [editField, setEditField] = useState<{ field: string; value: string; label: string } | null>(null);

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

  const handleRegisterAccount = () => {
    const num = `${Math.floor(100000 + Math.random() * 900000)}`;
    addTradingAccount({
      clientId: client.id, accountNumber: num, group: 'Standard', leverage: 100, stopOut: 50, maxOrders: 200,
      minDeposit: 100, balance: 0, equity: 0, margin: 0, freeMargin: 0, profit: 0, bonus: 0, currency: 'USD',
      isDemo: false, tradingAllowed: true, robotsAllowed: false, showBonus: false, spendBonus: false,
      status: 'Active', deposited: 0, withdrawn: 0, tradesCount: 0, bonusSpent: 0,
    });
    toast.success(`Счёт ${num} создан (USD)`);
  };

  const saveField = () => {
    if (!editField) return;
    updateClient(client.id, { [editField.field]: editField.value });
    toast.success(`${editField.label} обновлено`);
    setEditField(null);
  };

  const startEdit = (field: string, label: string) => {
    setEditField({ field, value: (client as any)[field] || '', label });
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold">{client.lastName} {client.firstName}</h1>
          <span className="px-2.5 py-0.5 rounded border text-xs font-medium text-muted-foreground bg-muted">ID {client.id}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleRegisterAccount} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <ExternalLink size={14} className="mr-1" /> Зарегистрировать счёт
          </Button>
          <Button size="sm" variant="outline" onClick={handleImpersonate}>
            <LogIn size={14} className="mr-1" /> Войти в кабинет
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/clients')}>Закрыть</Button>
        </div>
      </div>

      {/* 3-column info blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Общая информация</h3>
          <InfoRow label="Обращение" value={client.salutation} onEdit={() => startEdit('salutation', 'Обращение')} />
          <InfoRow label="Фамилия" value={client.lastName} onEdit={() => startEdit('lastName', 'Фамилия')} />
          <InfoRow label="Имя" value={client.firstName} onEdit={() => startEdit('firstName', 'Имя')} />
          <InfoRow label="Отчество" value={client.middleName} onEdit={() => startEdit('middleName', 'Отчество')} />
          <InfoRow label="Деск" value={desk?.name} />
          <InfoRow label="Ответственный" value={resp ? `${resp.firstName} ${resp.lastName}` : undefined} />
          <InfoRow label="Тип" value={client.type} />
          <InfoRow label="Статус" value={client.status} />
          <InfoRow label="Affiliate id" value={client.affiliateId} onEdit={() => startEdit('affiliateId', 'Affiliate ID')} />
          <InfoRow label="Создан" value={new Date(client.createdAt).toLocaleString()} />
        </div>

        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Контактная информация</h3>
          <InfoRow label="Страна" value={client.country || 'Default'} onEdit={() => startEdit('country', 'Страна')} />
          <InfoRow label="Регион" value={client.region} onEdit={() => startEdit('region', 'Регион')} />
          <InfoRow label="Город" value={client.city} onEdit={() => startEdit('city', 'Город')} />
          <InfoRow label="Индекс" value={client.zip} onEdit={() => startEdit('zip', 'Индекс')} />
          <InfoRow label="Адрес" value={client.address} onEdit={() => startEdit('address', 'Адрес')} />
          <InfoRow label="Email" value={client.email} isLink onEdit={() => startEdit('email', 'Email')} />
          <InfoRow label="Телефон" value={client.phone} onEdit={() => startEdit('phone', 'Телефон')} />
          <InfoRow label="Дополнительный контакт" value={client.additionalContact} onEdit={() => startEdit('additionalContact', 'Доп. контакт')} />
          <InfoRow label="Был в кабинете" value={client.lastCabinetVisit ? new Date(client.lastCabinetVisit).toLocaleString() : ''} />
          <InfoRow label="Был в терминале" value={client.lastTerminalVisit ? new Date(client.lastTerminalVisit).toLocaleString() : ''} />
        </div>

        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Дополнительная информация</h3>
          <InfoRow label="Origin" value={client.origin || 'None'} />
          <InfoRow label="Верификация" value={client.verificationStatus === 'Unverified' ? 'Не верифицирован' : client.verificationStatus} />
          <InfoRow label="Гражданство" value={client.citizenship} onEdit={() => startEdit('citizenship', 'Гражданство')} />
          <InfoRow label="Campaign id" value={client.campaignId} onEdit={() => startEdit('campaignId', 'Campaign ID')} />
          <InfoRow label="Tag 1" value={client.tag1} onEdit={() => startEdit('tag1', 'Tag 1')} />
          <InfoRow label="Tag 2" value={client.tag2} onEdit={() => startEdit('tag2', 'Tag 2')} />
          <InfoRow label="Паспорт" value={client.passport} onEdit={() => startEdit('passport', 'Паспорт')} />
          <InfoRow label="Дата рождения" value={client.birthday} onEdit={() => startEdit('birthday', 'Дата рождения')} />
          <InfoRow label="Цель" value={client.purpose} onEdit={() => startEdit('purpose', 'Цель')} />
          <InfoRow label="Источник" value={client.source || 'Default source'} onEdit={() => startEdit('source', 'Источник')} />
        </div>
      </div>

      {/* Description + Notes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Описание</h3>
          {client.description ? <p className="text-sm text-muted-foreground mb-3">{client.description}</p> : null}
          {showAddDesc ? (
            <div className="space-y-2">
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Введите текст" rows={2} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { if (newDesc.trim()) { updateClient(client.id, { description: (client.description ? client.description + '\n' : '') + newDesc }); setNewDesc(''); setShowAddDesc(false); toast.success('Описание обновлено'); } }}>Сохранить</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddDesc(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddDesc(true)} className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Plus size={14} /> Добавить</button>
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
            <button onClick={() => setShowAddNote(true)} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"><Plus size={14} /> Добавить</button>
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
                <th>Дата действия</th>
                <th>Тип</th>
                <th>Создатель</th>
                <th>Описание</th>
                <th>Ответственный</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {clientHistory.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-4">Нет действий</td></tr>
              ) : clientHistory.map(h => (
                <tr key={h.id}>
                  <td className="text-xs whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="text-sm">{h.actionType || h.section}</td>
                  <td className="text-sm">{h.authorName}</td>
                  <td className="text-sm max-w-[300px] truncate">{h.description}</td>
                  <td className="text-sm">{(() => { const r = h.responsibleId ? employees.find(e => e.id === h.responsibleId) : resp; return r ? `${r.firstName} ${r.lastName}` : '—'; })()}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {editStatusId === h.id ? (
                        <Select value={editStatusValue} onValueChange={v => { setEditStatusValue(v); updateHistoryEvent(h.id, { actionStatus: v }); setEditStatusId(null); toast.success('Статус обновлён'); }}>
                          <SelectTrigger className="h-6 text-xs w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In progress">In progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${h.actionStatus === 'Done' ? 'bg-blue-500' : h.actionStatus === 'In progress' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {h.actionStatus || 'New'}
                          </span>
                          <button onClick={() => { setEditStatusId(h.id); setEditStatusValue(h.actionStatus || 'New'); }} className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                            <Pencil size={10} />
                          </button>
                          {auth.role?.name === 'Admin' && (
                            <button onClick={() => { deleteHistoryEvent(h.id); toast.success('Действие удалено'); }} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                              <X size={10} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Всего: {clientHistory.length}</span>
        </div>
      </div>

      {/* Inline edit dialog */}
      <Dialog open={!!editField} onOpenChange={() => setEditField(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Редактировать: {editField?.label}</DialogTitle></DialogHeader>
          {editField && (
            <div className="space-y-3">
              <Input value={editField.value} onChange={e => setEditField({ ...editField, value: e.target.value })} autoFocus />
              <div className="flex gap-2">
                <Button onClick={saveField}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditField(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Action Dialog */}
      <Dialog open={showAction} onOpenChange={setShowAction}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Новое действие</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground w-36 shrink-0">Клиент *</label>
              <Input value={`${client.lastName} ${client.firstName}`} disabled className="bg-muted/30" />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground w-36 shrink-0">Ответственный *</label>
              <Select value={actionData.responsibleId || (auth.employeeId || '')} onValueChange={v => setActionData({ ...actionData, responsibleId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground w-36 shrink-0">Тип</label>
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
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground w-36 shrink-0">Статус</label>
              <Select value={actionData.status} onValueChange={v => setActionData({ ...actionData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground w-36 shrink-0">Дата действия *</label>
              <Input type="datetime-local" value={actionData.actionDate} onChange={e => setActionData({ ...actionData, actionDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Описание *</label>
              <Textarea value={actionData.description} onChange={e => setActionData({ ...actionData, description: e.target.value })} placeholder="О чём пообщались с клиентом..." rows={5} />
            </div>
            <div className="flex justify-center gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => {
                if (!actionData.description.trim()) { toast.error('Заполните описание'); return; }
                const respId = actionData.responsibleId || auth.employeeId || '';
                const authorName = (() => { const e = employees.find(emp => emp.id === auth.employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })();
                addHistoryEvent({
                  clientId: client.id, clientName: `${client.lastName} ${client.firstName}`,
                  section: 'Clients' as const, authorId: auth.employeeId || '', authorName,
                  source: 'Employee', description: actionData.description,
                  actionType: actionData.type, actionStatus: actionData.status,
                  responsibleId: respId, actionDate: actionData.actionDate,
                });
                toast.success('Действие сохранено');
                setShowAction(false);
                setActionData({ type: 'Phone call', description: '', responsibleId: '', status: 'New', actionDate: new Date().toISOString().slice(0, 16) });
              }}>Сохранить</Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => {
                if (!actionData.description.trim()) { toast.error('Заполните описание'); return; }
                const respId = actionData.responsibleId || auth.employeeId || '';
                const authorName = (() => { const e = employees.find(emp => emp.id === auth.employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })();
                addHistoryEvent({
                  clientId: client.id, clientName: `${client.lastName} ${client.firstName}`,
                  section: 'Clients' as const, authorId: auth.employeeId || '', authorName,
                  source: 'Employee', description: actionData.description,
                  actionType: actionData.type, actionStatus: actionData.status,
                  responsibleId: respId, actionDate: actionData.actionDate,
                });
                toast.success('Действие сохранено');
                setActionData({ type: 'Phone call', description: '', responsibleId: '', status: 'New', actionDate: new Date().toISOString().slice(0, 16) });
              }}>Сохранить и создать</Button>
              <Button variant="outline" onClick={() => setShowAction(false)}>Отмена</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
