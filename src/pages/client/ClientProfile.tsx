import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Upload, Shield, Settings, User } from 'lucide-react';

export default function ClientProfile() {
  const { auth, clients, updateClient, verificationRequests } = useStore();
  const { lang } = useSettingsStore();
  const client = clients.find(c => c.id === auth.clientId);
  const [tab, setTab] = useState<'personal' | 'settings' | 'verification'>('personal');
  const [editData, setEditData] = useState<any>(client ? { ...client } : {});
  const verification = verificationRequests.find(v => v.clientId === auth.clientId);

  if (!client) return <div className="p-6">{t(lang, 'profileNotFound')}</div>;

  const tabs = [
    { id: 'personal', label: t(lang, 'personalData'), icon: User },
    { id: 'settings', label: t(lang, 'settings'), icon: Settings },
    { id: 'verification', label: t(lang, 'verification'), icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{t(lang, 'myProfile')}</h1>
      <div className="flex gap-1 mb-4 md:mb-6 overflow-x-auto">
        {tabs.map(tb => (<button key={tb.id} onClick={() => setTab(tb.id as any)} className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap ${tab === tb.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><tb.icon size={16} /> {tb.label}</button>))}
      </div>

      {tab === 'personal' && (
        <div className="max-w-2xl bg-card rounded-lg border p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl md:text-2xl font-bold">{client.firstName[0]}{client.lastName[0]}</div>
            <Button variant="outline" size="sm"><Upload size={14} className="mr-1" /> {t(lang, 'uploadPhoto')}</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div><label className="text-xs text-muted-foreground">{t(lang, 'lastName')}</label><Input value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'firstName')}</label><Input value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'birthday')}</label><Input type="date" value={editData.birthday || ''} onChange={e => setEditData({ ...editData, birthday: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'country')}</label><Input value={editData.country || ''} onChange={e => setEditData({ ...editData, country: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'city')}</label><Input value={editData.city || ''} onChange={e => setEditData({ ...editData, city: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'address')}</label><Input value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'phone')}</label><Input value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'email')}</label><Input value={editData.email} disabled /></div>
          </div>
          <div className="flex gap-2"><Button onClick={() => updateClient(client.id, editData)}><Save size={14} className="mr-1" /> {t(lang, 'save')}</Button><Button variant="outline" onClick={() => setEditData({ ...client })}>{t(lang, 'cancel')}</Button></div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-lg bg-card rounded-lg border p-4 md:p-6 space-y-4">
          <h3 className="font-semibold text-sm mb-3">{t(lang, 'changePassword')}</h3>
          <Input type="password" placeholder={t(lang, 'currentPassword')} />
          <Input type="password" placeholder={t(lang, 'newPassword')} />
          <Input type="password" placeholder={t(lang, 'confirmPassword')} />
          <Button>{t(lang, 'changePasswordBtn')}</Button>
        </div>
      )}

      {tab === 'verification' && (
        <div className="max-w-lg bg-card rounded-lg border p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className={client.verificationStatus === 'Verified' ? 'text-green-600' : 'text-muted-foreground'} />
            <div><div className="font-semibold">{t(lang, 'verificationStatus')}: <span className={`status-badge ${client.verificationStatus === 'Verified' ? 'status-approved' : client.verificationStatus === 'Pending' ? 'status-pending' : 'status-new'}`}>{client.verificationStatus}</span></div></div>
          </div>
          {client.verificationStatus !== 'Verified' && (
            <>
              <div className="mb-4"><h4 className="text-sm font-semibold mb-2">{t(lang, 'requiredDocuments')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1"><li>• {t(lang, 'passportId')}</li><li>• {t(lang, 'addressProof')}</li></ul></div>
              <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed text-center mb-4">
                <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t(lang, 'dragDropFiles')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t(lang, 'fileFormats')}</p>
              </div>
              <Button className="w-full">{t(lang, 'submitVerification')}</Button>
            </>
          )}
          {verification && verification.documents.length > 0 && (
            <div className="mt-4"><h4 className="text-sm font-semibold mb-2">{t(lang, 'uploadedDocuments')}</h4>
              {verification.documents.map(d => (<div key={d.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded mb-1"><span className="text-sm truncate">{d.fileName}</span><span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(d.uploadedAt).toLocaleDateString()}</span></div>))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
