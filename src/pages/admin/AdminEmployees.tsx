import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

const permissionGroups = [
  { key: 'Основное', perms: [{ k: 'main.view', l: 'Просмотр' }] },
  { key: 'Сотрудники администрации', perms: [{ k: 'employees.view', l: 'Смотреть' }, { k: 'employees.create', l: 'Создать/Изменить' }, { k: 'employees.delete', l: 'Удалить' }] },
  { key: 'Отчеты', perms: [{ k: 'reports.view', l: 'Смотреть' }] },
  { key: 'Настройки', perms: [{ k: 'settings.view', l: 'Смотреть' }, { k: 'settings.edit', l: 'Создать/Изменить' }] },
  { key: 'CRM', isGroup: true },
  { key: 'Дески', perms: [{ k: 'desks.view', l: 'Смотреть' }, { k: 'desks.edit', l: 'Создать/Изменить' }, { k: 'desks.delete', l: 'Удалить' }] },
  { key: 'Менеджеры по продажам', perms: [{ k: 'sales.view', l: 'Смотреть' }, { k: 'sales.edit', l: 'Создать/Изменить' }, { k: 'sales.delete', l: 'Удалить' }] },
  { key: 'Управление безопасностью', perms: [{ k: 'security.manage', l: 'Разрешить' }] },
  { key: 'Клиенты', perms: [{ k: 'clients.view', l: 'Смотреть' }, { k: 'clients.create', l: 'Создать' }, { k: 'clients.edit', l: 'Редактировать' }] },
  { key: 'Авторизация в Trader\'s Room', perms: [{ k: 'auth.traders_room', l: 'Разрешить' }] },
  { key: 'Верификация', perms: [{ k: 'verification.view', l: 'Смотреть' }, { k: 'verification.addDocs', l: 'Добавить документы' }, { k: 'verification.changeStatus', l: 'Изменить статус' }, { k: 'verification.deleteDocs', l: 'Удалить документы' }] },
  { key: 'Действия', perms: [{ k: 'actions.view', l: 'Смотреть' }, { k: 'actions.edit', l: 'Создать/Изменить' }, { k: 'actions.delete', l: 'Удалить' }] },
  { key: 'Заметки', perms: [{ k: 'notes.create', l: 'Создать' }, { k: 'notes.edit', l: 'Редактировать' }, { k: 'notes.delete', l: 'Удалить' }] },
  { key: 'Просмотр истории', perms: [{ k: 'history.view', l: 'Разрешить' }] },
  { key: 'Экспорт клиентов', perms: [{ k: 'clients.export', l: 'Разрешить' }, { k: 'clients.exportContacts', l: 'С контактами' }] },
  { key: 'Импорт клиентов', perms: [{ k: 'clients.import', l: 'Разрешить' }] },
  { key: 'Счета', isGroup: true },
  { key: 'Торговые счета', perms: [{ k: 'accounts.view', l: 'Смотреть' }, { k: 'accounts.edit', l: 'Создать/Изменить' }, { k: 'accounts.deposit', l: 'Пополнить/Вывести' }, { k: 'accounts.delete', l: 'Удалить' }] },
  { key: 'Платежи', isGroup: true },
  { key: 'Платежи ', perms: [{ k: 'payments.view', l: 'Смотреть' }, { k: 'payments.edit', l: 'Редактировать' }, { k: 'payments.delete', l: 'Удалить' }] },
  { key: 'Обращения', isGroup: true },
  { key: 'Обращения ', perms: [{ k: 'support.view', l: 'Смотреть' }, { k: 'support.reply', l: 'Создать/Ответить' }, { k: 'support.deleteMsg', l: 'Удалить сообщение' }, { k: 'support.editSubject', l: 'Редактировать тему' }, { k: 'support.changeStatus', l: 'Изменить статус' }, { k: 'support.delete', l: 'Удалить обращение' }] },
];

type FormType = {
  lastName: string; firstName: string; middleName: string; birthday: string; type: any;
  position: string; department: string; country: string; region: string; city: string;
  zip: string; address: string; email: string; phone: string; additionalContact: string;
  password: string; ipRestriction: string; canViewContacts: boolean; canEdit: boolean;
  isActive: boolean; roleId: string; desks: string[]; signature: string;
  permissions: Record<string, boolean>;
};

const emptyForm: FormType = {
  lastName: '', firstName: '', middleName: '', birthday: '', type: 'Admin',
  position: '', department: '', country: '', region: '', city: '',
  zip: '', address: '', email: '', phone: '', additionalContact: '',
  password: '', ipRestriction: '', canViewContacts: true, canEdit: true,
  isActive: true, roleId: '', desks: [], signature: '',
  permissions: {},
};

export default function AdminEmployees() {
  const { employees, roles, desks, addEmployee, updateEmployee, deleteEmployee, addRole, updateRole, deleteRole } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'Admin' | 'Sales' | 'Archived'>('Admin');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>({ ...emptyForm });
  const { state: delState, confirmDelete, close: closeDelete } = useConfirmDelete();

  // Roles tab state
  const [showRoles, setShowRoles] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', employeeType: 'Admin' as any, permissions: {} as Record<string, boolean> });
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);

  const filtered = employees.filter(e => {
    if (tab === 'Archived') return !e.isActive;
    return e.isActive && e.type === tab;
  }).filter(e => !search || `${e.lastName} ${e.firstName} ${e.email}`.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (id: string) => {
    const e = employees.find(emp => emp.id === id);
    if (!e) return;
    const role = roles.find(r => r.id === e.roleId);
    setForm({
      lastName: e.lastName, firstName: e.firstName, middleName: e.middleName || '', birthday: e.birthday || '',
      type: e.type, position: e.position, department: e.department, country: e.country || '',
      region: e.region || '', city: e.city || '', zip: e.zip || '', address: e.address || '',
      email: e.email, phone: e.phone || '', additionalContact: e.additionalContact || '',
      password: '', ipRestriction: e.ipRestriction || '', canViewContacts: e.canViewContacts,
      canEdit: e.canEdit, isActive: e.isActive, roleId: e.roleId, desks: [...e.desks],
      signature: e.signature || '', permissions: role?.permissions ? { ...role.permissions } : {},
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.lastName || !form.email) return;
    if (editingId) {
      updateEmployee(editingId, { ...form, middleName: form.middleName || undefined, birthday: form.birthday || undefined });
    } else {
      addEmployee({ ...form, middleName: form.middleName || undefined, birthday: form.birthday || undefined } as any);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleDelete = (id: string) => {
    const e = employees.find(emp => emp.id === id);
    confirmDelete('Удалить сотрудника', `Вы уверены что хотите удалить ${e?.lastName} ${e?.firstName}?`, () => deleteEmployee(id));
  };

  // Roles
  const startEditRole = (id: string) => {
    const r = roles.find(ro => ro.id === id);
    if (r) { setRoleForm({ name: r.name, employeeType: r.employeeType, permissions: { ...r.permissions } }); setEditingRoleId(id); setShowRoleForm(true); }
  };
  const saveRole = () => {
    if (editingRoleId) { updateRole(editingRoleId, roleForm); } else if (roleForm.name) { addRole(roleForm); }
    setEditingRoleId(null); setShowRoleForm(false); setRoleForm({ name: '', employeeType: 'Admin', permissions: {} });
  };
  const togglePerm = (perm: string, target: 'role' | 'employee' = 'employee') => {
    if (target === 'role') setRoleForm(f => ({ ...f, permissions: { ...f.permissions, [perm]: !f.permissions[perm] } }));
    else setForm(f => ({ ...f, permissions: { ...f.permissions, [perm]: !f.permissions[perm] } }));
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowForm(false); setEditingId(null); }}><ArrowLeft size={18} /></button>
            <h1 className="text-lg font-semibold">{editingId ? 'Редактировать сотрудника' : 'Новый сотрудник'}</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Сохранить</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Закрыть</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* General Info */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-3">Общая информация</h3>
            <div className="space-y-2">
              <div><label className="text-xs text-muted-foreground">Фамилия *</label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Имя *</label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Отчество</label><Input value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">День рождения</label><Input type="date" value={form.birthday} onChange={e => setForm({...form, birthday: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Тип *</label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Admin">Сотрудники администрации</SelectItem><SelectItem value="Sales">Менеджеры по продажам</SelectItem></SelectContent></Select></div>
              <div><label className="text-xs text-muted-foreground">Должность</label><Input value={form.position} onChange={e => setForm({...form, position: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Отдел</label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-3">Контактная информация</h3>
            <div className="space-y-2">
              <div><label className="text-xs text-muted-foreground">Страна</label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Регион</label><Input value={form.region} onChange={e => setForm({...form, region: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Город</label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Почтовый индекс</label><Input value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Адрес</label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Email *</label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Телефон *</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><label className="text-xs text-muted-foreground">Дополнительный контакт</label><Input value={form.additionalContact} onChange={e => setForm({...form, additionalContact: e.target.value})} /></div>
            </div>
          </div>

          {/* Right column: Password, Security, Desks */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Пароль</h3>
              <div><label className="text-xs text-muted-foreground">Пароль *</label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Безопасность</h3>
              <div className="space-y-2">
                <div><label className="text-xs text-muted-foreground">Ограничение по IP</label><Input placeholder="192.168.1.0/24" value={form.ipRestriction} onChange={e => setForm({...form, ipRestriction: e.target.value})} /></div>
                <div><label className="text-xs text-muted-foreground">Просмотр контактов</label>
                  <Select value={form.canViewContacts ? 'allowed' : 'denied'} onValueChange={v => setForm({...form, canViewContacts: v === 'allowed'})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="allowed">По умолчанию (Разрешено)</SelectItem><SelectItem value="denied">Запрещено</SelectItem></SelectContent>
                  </Select></div>
                <div><label className="text-xs text-muted-foreground">Редактирование</label>
                  <Select value={form.canEdit ? 'allowed' : 'denied'} onValueChange={v => setForm({...form, canEdit: v === 'allowed'})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="allowed">По умолчанию (Разрешено)</SelectItem><SelectItem value="denied">Запрещено</SelectItem></SelectContent>
                  </Select></div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Дески *</h3>
              <div className="space-y-1">
                {desks.map(d => (
                  <label key={d.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.desks.includes(d.id)} onCheckedChange={() => setForm(f => ({ ...f, desks: f.desks.includes(d.id) ? f.desks.filter(x => x !== d.id) : [...f.desks, d.id] }))} />
                    {d.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Обращения</h3>
              <div><label className="text-xs text-muted-foreground">Подпись сотрудника</label>
                <Select value={form.signature || 'name'} onValueChange={v => setForm({...form, signature: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="name">Имя</SelectItem><SelectItem value="fullname">Полное имя</SelectItem><SelectItem value="none">Без подписи</SelectItem></SelectContent>
                </Select></div>
            </div>
          </div>
        </div>

        {/* Permissions section */}
        <div className="mt-4 bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Права</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Роль</span>
              <Select value={form.roleId || '__none''} onValueChange={v => {
                const rid = v === '__none' ? '' : v;
                const role = roles.find(r => r.id === rid);
                setForm(f => ({ ...f, roleId: rid, permissions: role?.permissions ? { ...role.permissions } : f.permissions }));
              }}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent><SelectItem value="__none">Другое</SelectItem>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            {permissionGroups.map(g => {
              if ('isGroup' in g && g.isGroup) {
                return <div key={g.key} className="flex items-center gap-2 pt-3 pb-1"><Checkbox /><span className="font-semibold text-sm">{g.key}</span></div>;
              }
              return (
                <div key={g.key} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-1 border-b border-muted/30">
                  <span className="text-sm min-w-[180px]">{g.key}</span>
                  {g.perms?.map(p => (
                    <label key={p.k} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox checked={!!form.permissions[p.k]} onCheckedChange={() => togglePerm(p.k)} />
                      {p.l}
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
      </div>
    );
  }

  if (showRoles) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setShowRoles(false)}><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-semibold">Роли и права доступа</h1>
          <Button size="sm" className="ml-auto" onClick={() => { setRoleForm({ name: '', employeeType: 'Admin', permissions: {} }); setShowRoleForm(true); setEditingRoleId(null); }}><Plus size={14} className="mr-1" /> Новая роль</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead><tr className="bg-muted/30"><th>Роль</th><th>Тип</th><th>Сотрудников</th><th></th></tr></thead>
              <tbody>{roles.map(r => (
                <tr key={r.id} className={editingRoleId === r.id ? 'bg-primary/5' : ''}>
                  <td className="font-medium">{r.name}</td>
                  <td><span className="status-badge status-new">{r.employeeType}</span></td>
                  <td>{employees.filter(e => e.roleId === r.id).length}</td>
                  <td className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEditRole(r.id)}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete('Удалить роль', `Удалить роль "${r.name}"?`, () => deleteRole(r.id))}><Trash2 size={14} className="text-destructive" /></Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {showRoleForm && (
            <div className="bg-card rounded-lg border p-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-sm font-semibold mb-3">{editingRoleId ? 'Редактировать роль' : 'Новая роль'}</h3>
              <div className="mb-3"><label className="text-xs text-muted-foreground">Название</label><Input value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} /></div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Права доступа</h4>
              {permissionGroups.map(g => {
                if ('isGroup' in g && g.isGroup) return <div key={g.key} className="font-semibold text-sm pt-2">{g.key}</div>;
                return (
                  <div key={g.key} className="mb-2">
                    <div className="text-xs font-semibold mb-1">{g.key}</div>
                    <div className="grid grid-cols-2 gap-1">
                      {g.perms?.map(p => (
                        <label key={p.k} className="flex items-center gap-2 text-xs py-0.5 cursor-pointer">
                          <Checkbox checked={!!roleForm.permissions[p.k]} onCheckedChange={() => togglePerm(p.k, 'role')} />
                          {p.l}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2 mt-3">
                <Button onClick={saveRole}>Сохранить</Button>
                <Button variant="outline" onClick={() => { setShowRoleForm(false); setEditingRoleId(null); }}>Отмена</Button>
              </div>
            </div>
          )}
        </div>
        <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'employees')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowRoles(true)}>Роли и права</Button>
          <Button size="sm" onClick={() => { setForm({ ...emptyForm }); setEditingId(null); setShowForm(true); }}><Plus size={14} className="mr-1" /> {t(lang, 'newEmployee')}</Button>
        </div>
      </div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {(['Admin', 'Sales', 'Archived'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb === 'Admin' ? t(lang, 'administration') : tb === 'Sales' ? t(lang, 'managers') : t(lang, 'archive')}
            <span className="ml-1 opacity-60">{employees.filter(e => tb === 'Archived' ? !e.isActive : e.isActive && e.type === tb).length}</span>
          </button>
        ))}
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr className="bg-muted/30"><th>Имя</th><th>Дески</th><th>Email</th><th>Доступ к контактам</th><th>IP последнего входа</th><th>Последний вход</th><th></th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.lastName} {e.firstName}</td>
                  <td className="text-sm">{e.desks.map(d => desks.find(dk => dk.id === d)?.name).filter(Boolean).join(', ') || '—'}</td>
                  <td>{e.email}</td>
                  <td>{e.canViewContacts ? <span className="text-success text-xs">Да</span> : <span className="text-destructive text-xs">Нет</span>}</td>
                  <td className="text-xs text-muted-foreground font-mono">{e.ipRestriction || '—'}</td>
                  <td className="text-xs text-muted-foreground">{e.lastLogin ? new Date(e.lastLogin).toLocaleString() : '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(e.id)}><Edit2 size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm">{e.lastName} {e.firstName}</div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(e.id)}><Edit2 size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 size={14} className="text-destructive" /></Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{e.email}</div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span>{e.desks.map(d => desks.find(dk => dk.id === d)?.name).filter(Boolean).join(', ') || '—'}</span>
              {e.canViewContacts ? <span className="text-success">Контакты: Да</span> : <span className="text-destructive">Контакты: Нет</span>}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
    </div>
  );
}
