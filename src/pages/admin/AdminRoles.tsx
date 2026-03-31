import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const permissionGroups = [
  { key: 'permMain', perms: ['main.view'] },
  { key: 'permEmployees', perms: ['employees.view', 'employees.create', 'employees.edit', 'employees.delete'] },
  { key: 'permClients', perms: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.viewContacts', 'clients.loginCabinet', 'clients.export', 'clients.import'] },
  { key: 'permTrading', perms: ['trading.view', 'trading.edit', 'trading.close'] },
  { key: 'permAssets', perms: ['assets.view', 'assets.edit', 'assets.priceOverride', 'assets.commission', 'assets.swap', 'assets.margin', 'assets.stopLevel', 'assets.tradingToggle'] },
  { key: 'permPayments', perms: ['payments.view', 'payments.approve', 'payments.reject'] },
  { key: 'permVerification', perms: ['verification.view', 'verification.approve', 'verification.reject', 'verification.ban'] },
  { key: 'permReports', perms: ['reports.view'] },
  { key: 'permSettings', perms: ['settings.view', 'settings.edit'] },
  { key: 'permSupport', perms: ['support.view', 'support.respond'] },
  { key: 'permDesks', perms: ['desks.view', 'desks.edit'] },
  { key: 'permHistory', perms: ['history.view'] },
  { key: 'permNotes', perms: ['notes.view', 'notes.create'] },
  { key: 'permCRM', perms: ['crm.view', 'crm.edit'] },
  { key: 'permSecurity', perms: ['security.view', 'security.edit'] },
];

export default function AdminRoles() {
  const { roles, employees, addRole, updateRole } = useStore();
  const { lang } = useSettingsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', employeeType: 'Admin' as any, permissions: {} as Record<string, boolean> });

  const startEdit = (id: string) => { const r = roles.find(ro => ro.id === id); if (r) { setForm({ name: r.name, employeeType: r.employeeType, permissions: { ...r.permissions } }); setEditingId(id); } };
  const saveRole = () => { if (editingId) { updateRole(editingId, form); setEditingId(null); } else if (form.name) { addRole(form); setShowCreate(false); } setForm({ name: '', employeeType: 'Admin', permissions: {} }); };
  const togglePerm = (perm: string) => setForm(f => ({ ...f, permissions: { ...f.permissions, [perm]: !f.permissions[perm] } }));
  const isEditing = showCreate || editingId;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'rolesAndPermissions')}</h1>
        <Button size="sm" onClick={() => { setForm({ name: '', employeeType: 'Admin', permissions: {} }); setShowCreate(true); }}><Plus size={14} className="mr-1" /> {t(lang, 'newRole')}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className={`bg-card rounded-lg border overflow-hidden ${isEditing ? 'hidden lg:block' : ''}`}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr className="bg-muted/30"><th>{t(lang, 'role')}</th><th>{t(lang, 'type')}</th><th>{t(lang, 'employeesCount')}</th><th></th></tr></thead>
              <tbody>{roles.map(r => (
                <tr key={r.id} className={editingId === r.id ? 'bg-primary/5' : ''}>
                  <td className="font-medium">{r.name}</td>
                  <td><span className="status-badge status-new">{r.employeeType}</span></td>
                  <td>{employees.filter(e => e.roleId === r.id).length}</td>
                  <td><Button variant="ghost" size="sm" onClick={() => startEdit(r.id)}>✎</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {isEditing && (
          <div className="bg-card rounded-lg border p-4 md:p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <button onClick={() => { setShowCreate(false); setEditingId(null); }}><ArrowLeft size={18} /></button>
              <span className="font-semibold text-sm">{t(lang, 'backToRoles')}</span>
            </div>
            <h3 className="text-sm font-semibold mb-4">{editingId ? t(lang, 'editRole') : t(lang, 'newRole')}</h3>
            <div className="space-y-3 mb-4">
              <div><label className="text-xs text-muted-foreground">{t(lang, 'name')}</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">{t(lang, 'accessRights')}</h4>
            {permissionGroups.map(g => (
              <div key={g.key} className="mb-4">
                <div className="text-xs font-semibold mb-2">{t(lang, g.key as any)}</div>
                <div className="grid grid-cols-2 gap-1">
                  {g.perms.map(p => (
                    <label key={p} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                      <Checkbox checked={!!form.permissions[p]} onCheckedChange={() => togglePerm(p)} />
                      {p.split('.')[1]}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <Button onClick={saveRole}>{t(lang, 'save')}</Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); setEditingId(null); }}>{t(lang, 'cancel')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
