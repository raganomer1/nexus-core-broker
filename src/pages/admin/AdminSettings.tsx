import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Copy, Key, Link, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSettings() {
  const {
    clientStatusConfigs, addClientStatusConfig, updateClientStatusConfig, deleteClientStatusConfig,
    actionStatusConfigs, addActionStatusConfig, updateActionStatusConfig, deleteActionStatusConfig,
    reminderIntervals, addReminderInterval, updateReminderInterval, deleteReminderInterval,
    securitySettings, updateSecuritySettings,
    apiIntegrations, addApiIntegration, updateApiIntegration, deleteApiIntegration,
    clientRestrictions, addClientRestriction, updateClientRestriction, deleteClientRestriction,
    clients, desks, employees,
    roles, addRole, updateRole, deleteRole,
  } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'statuses' | 'actions' | 'reminders' | 'security' | 'api' | 'restrictions' | 'roles' | 'emailTemplates' | 'misc'>('statuses');
  const { state: delState, confirmDelete, close: closeDelete } = useConfirmDelete();

  const [editStatus, setEditStatus] = useState<{ id?: string; name: string; color: string; isDefault: boolean } | null>(null);
  const [editAction, setEditAction] = useState<{ id?: string; name: string; isCompleted: boolean } | null>(null);
  const [editReminder, setEditReminder] = useState<{ id?: string; label: string; minutes: number; isDefault: boolean } | null>(null);
  const [ipForm, setIpForm] = useState({ from: '', to: '', label: '' });

  // API Integration
  const [editApi, setEditApi] = useState<{ id?: string; name: string; webhookUrl: string; type: 'leads' | 'clients' | 'both'; isActive: boolean } | null>(null);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // Client Restrictions
  const [editRestriction, setEditRestriction] = useState<{
    id?: string; name: string; message: string;
    restrictTrading: boolean; restrictWithdrawal: boolean; restrictFullAccess: boolean;
    targetType: 'clients' | 'desks' | 'filters'; targetIds: string[]; isActive: boolean;
  } | null>(null);

  const tabs = [
    { id: 'statuses', label: 'Статусы клиентов' },
    { id: 'actions', label: 'Статусы действий' },
    { id: 'reminders', label: 'Напоминания' },
    { id: 'security', label: 'Безопасность' },
    { id: 'api', label: 'API интеграции' },
    { id: 'restrictions', label: 'Ограничения' },
    { id: 'misc', label: 'Дополнительно' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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

      {/* ============ STATUSES ============ */}
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

      {/* ============ ACTIONS ============ */}
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

      {/* ============ REMINDERS ============ */}
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

      {/* ============ SECURITY ============ */}
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
              {securitySettings.ipWhitelist.map(ip => (
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

      {/* ============ API INTEGRATIONS ============ */}
      {tab === 'api' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">API интеграции</h3>
                <p className="text-xs text-muted-foreground mt-1">Создавайте API ключи для импорта лидов и клиентов из внешних источников</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditApi({ name: '', webhookUrl: '', type: 'both', isActive: true })}>
                <Plus size={14} className="mr-1" />Новая интеграция
              </Button>
            </div>

            {apiIntegrations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Key size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Нет активных интеграций</p>
                <p className="text-xs mt-1">Создайте API ключ для подключения внешних систем</p>
              </div>
            )}

            <div className="space-y-3">
              {apiIntegrations.map(api => (
                <div key={api.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${api.isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                      <span className="text-sm font-medium">{api.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                        {api.type === 'leads' ? 'Лиды' : api.type === 'clients' ? 'Клиенты' : 'Лиды + Клиенты'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={api.isActive} onCheckedChange={v => updateApiIntegration(api.id, { isActive: v })} />
                      <Button variant="ghost" size="sm" onClick={() => setEditApi({ id: api.id, name: api.name, webhookUrl: api.webhookUrl || '', type: api.type, isActive: api.isActive })}>
                        <Edit2 size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить интеграцию', `Удалить "${api.name}"?`, () => deleteApiIntegration(api.id))}>
                        <Trash2 size={12} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono truncate">
                      {showApiKey === api.id ? api.apiKey : '••••••••••••••••••••••'}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => setShowApiKey(showApiKey === api.id ? null : api.id)}>
                      {showApiKey === api.id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(api.apiKey)}>
                      <Copy size={12} />
                    </Button>
                  </div>
                  {api.webhookUrl && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <Link size={10} /> {api.webhookUrl}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Создано: {new Date(api.createdAt).toLocaleDateString('ru')}
                    {api.lastUsed && ` • Последнее использование: ${new Date(api.lastUsed).toLocaleDateString('ru')}`}
                  </div>

                  {/* API Endpoints info */}
                  <div className="mt-3 p-2 bg-muted/30 rounded text-xs space-y-1">
                    <div className="font-medium mb-1">Эндпоинты:</div>
                    <div className="font-mono text-muted-foreground">POST /api/v1/leads — Создание лида</div>
                    <div className="font-mono text-muted-foreground">POST /api/v1/clients — Создание клиента</div>
                    <div className="font-mono text-muted-foreground">GET /api/v1/leads — Список лидов</div>
                    <div className="font-mono text-muted-foreground">GET /api/v1/clients — Список клиентов</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ RESTRICTIONS ============ */}
      {tab === 'restrictions' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2"><Shield size={16} /> Ограничения клиентов</h3>
                <p className="text-xs text-muted-foreground mt-1">Показывайте клиентам окно с сообщением и ограничивайте доступ к функциям</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditRestriction({
                name: '', message: 'Ваш аккаунт временно ограничен. Обратитесь в поддержку.',
                restrictTrading: false, restrictWithdrawal: false, restrictFullAccess: false,
                targetType: 'clients', targetIds: [], isActive: true,
              })}>
                <Plus size={14} className="mr-1" />Новое ограничение
              </Button>
            </div>

            {clientRestrictions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Нет активных ограничений</p>
              </div>
            )}

            <div className="space-y-3">
              {clientRestrictions.map(r => (
                <div key={r.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-red-500' : 'bg-muted-foreground'}`} />
                      <span className="text-sm font-medium">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={r.isActive} onCheckedChange={v => updateClientRestriction(r.id, { isActive: v })} />
                      <Button variant="ghost" size="sm" onClick={() => setEditRestriction({
                        id: r.id, name: r.name, message: r.message,
                        restrictTrading: r.restrictTrading, restrictWithdrawal: r.restrictWithdrawal,
                        restrictFullAccess: r.restrictFullAccess,
                        targetType: r.targetType, targetIds: r.targetIds, isActive: r.isActive,
                      })}><Edit2 size={12} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить ограничение', `Удалить "${r.name}"?`, () => deleteClientRestriction(r.id))}>
                        <Trash2 size={12} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{r.message}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.restrictTrading && <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">Торговля</span>}
                    {r.restrictWithdrawal && <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full">Вывод</span>}
                    {r.restrictFullAccess && <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Полный доступ</span>}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Цель: {r.targetType === 'clients' ? `Клиенты (${r.targetIds.length})` : r.targetType === 'desks' ? `Дески (${r.targetIds.length})` : 'По фильтрам'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ MISC ============ */}
      {tab === 'misc' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">Дополнительные настройки</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Конвертировать в Live при депозите</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox /> Разрешить редактирование даты создания</label>
          </div>
        </div>
      )}

      {/* ===== Edit Status Dialog ===== */}
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

      {/* ===== Edit Action Dialog ===== */}
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

      {/* ===== Edit Reminder Dialog ===== */}
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

      {/* ===== Edit API Integration Dialog ===== */}
      <Dialog open={!!editApi} onOpenChange={() => setEditApi(null)}>
        <DialogContent className="mx-4 max-w-md">
          <DialogHeader><DialogTitle>{editApi?.id ? 'Редактировать' : 'Новая'} интеграция</DialogTitle></DialogHeader>
          {editApi && (
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Название</label><Input value={editApi.name} onChange={e => setEditApi({...editApi, name: e.target.value})} placeholder="CRM, Landing page..." /></div>
              <div>
                <label className="text-xs text-muted-foreground">Тип данных</label>
                <Select value={editApi.type} onValueChange={v => setEditApi({...editApi, type: v as any})}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leads">Только лиды</SelectItem>
                    <SelectItem value="clients">Только клиенты</SelectItem>
                    <SelectItem value="both">Лиды + Клиенты</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Webhook URL (опционально)</label><Input value={editApi.webhookUrl} onChange={e => setEditApi({...editApi, webhookUrl: e.target.value})} placeholder="https://..." /></div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (!editApi.name) return;
                  if (editApi.id) updateApiIntegration(editApi.id, { name: editApi.name, webhookUrl: editApi.webhookUrl || undefined, type: editApi.type, isActive: editApi.isActive });
                  else addApiIntegration({ name: editApi.name, webhookUrl: editApi.webhookUrl || undefined, type: editApi.type, isActive: editApi.isActive });
                  setEditApi(null);
                }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditApi(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Edit Restriction Dialog ===== */}
      <Dialog open={!!editRestriction} onOpenChange={() => setEditRestriction(null)}>
        <DialogContent className="mx-4 max-w-lg">
          <DialogHeader><DialogTitle>{editRestriction?.id ? 'Редактировать' : 'Новое'} ограничение</DialogTitle></DialogHeader>
          {editRestriction && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="text-xs text-muted-foreground">Название</label><Input value={editRestriction.name} onChange={e => setEditRestriction({...editRestriction, name: e.target.value})} placeholder="Блокировка по задолженности..." /></div>
              <div><label className="text-xs text-muted-foreground">Сообщение для клиента</label><Textarea value={editRestriction.message} onChange={e => setEditRestriction({...editRestriction, message: e.target.value})} rows={3} /></div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Ограничения</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editRestriction.restrictTrading} onCheckedChange={v => setEditRestriction({...editRestriction, restrictTrading: !!v})} /> Запретить торговлю</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editRestriction.restrictWithdrawal} onCheckedChange={v => setEditRestriction({...editRestriction, restrictWithdrawal: !!v})} /> Запретить вывод средств</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editRestriction.restrictFullAccess} onCheckedChange={v => setEditRestriction({...editRestriction, restrictFullAccess: !!v, restrictTrading: !!v || editRestriction.restrictTrading, restrictWithdrawal: !!v || editRestriction.restrictWithdrawal})} /> Полная блокировка (окно поверх кабинета)</label>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Применить к</label>
                <Select value={editRestriction.targetType} onValueChange={v => setEditRestriction({...editRestriction, targetType: v as any, targetIds: []})}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clients">Конкретные клиенты</SelectItem>
                    <SelectItem value="desks">Дески</SelectItem>
                    <SelectItem value="filters">По фильтрам</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editRestriction.targetType === 'clients' && (
                <div>
                  <label className="text-xs text-muted-foreground">Выберите клиентов</label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                    {clients.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 p-1 rounded">
                        <Checkbox checked={editRestriction.targetIds.includes(c.id)}
                          onCheckedChange={v => {
                            const ids = v ? [...editRestriction.targetIds, c.id] : editRestriction.targetIds.filter(i => i !== c.id);
                            setEditRestriction({...editRestriction, targetIds: ids});
                          }} />
                        {c.lastName} {c.firstName} — {c.email}
                      </label>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Выбрано: {editRestriction.targetIds.length}</div>
                </div>
              )}

              {editRestriction.targetType === 'desks' && (
                <div>
                  <label className="text-xs text-muted-foreground">Выберите дески</label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                    {desks.map(d => (
                      <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 p-1 rounded">
                        <Checkbox checked={editRestriction.targetIds.includes(d.id)}
                          onCheckedChange={v => {
                            const ids = v ? [...editRestriction.targetIds, d.id] : editRestriction.targetIds.filter(i => i !== d.id);
                            setEditRestriction({...editRestriction, targetIds: ids});
                          }} />
                        {d.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {editRestriction.targetType === 'filters' && (
                <div className="p-3 bg-muted/30 rounded text-xs text-muted-foreground">
                  Фильтры будут применяться по статусу, стране и другим критериям клиентов автоматически.
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={() => {
                  if (!editRestriction.name) return;
                  if (editRestriction.id) updateClientRestriction(editRestriction.id, {
                    name: editRestriction.name, message: editRestriction.message,
                    restrictTrading: editRestriction.restrictTrading, restrictWithdrawal: editRestriction.restrictWithdrawal,
                    restrictFullAccess: editRestriction.restrictFullAccess,
                    targetType: editRestriction.targetType, targetIds: editRestriction.targetIds, isActive: editRestriction.isActive,
                  });
                  else addClientRestriction({
                    name: editRestriction.name, message: editRestriction.message,
                    restrictTrading: editRestriction.restrictTrading, restrictWithdrawal: editRestriction.restrictWithdrawal,
                    restrictFullAccess: editRestriction.restrictFullAccess,
                    targetType: editRestriction.targetType, targetIds: editRestriction.targetIds, isActive: editRestriction.isActive,
                  });
                  setEditRestriction(null);
                }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditRestriction(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
    </div>
  );
}