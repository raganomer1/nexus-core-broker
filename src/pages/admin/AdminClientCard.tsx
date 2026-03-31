import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminClientCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { lang } = useSettingsStore();
  const { clients, employees, desks, clientNotes, tradingAccounts, updateClient, addClientNote, impersonateClient, auth, addHistoryEvent, history } = store;

  const [tab, setTab] = useState<'overview' | 'edit' | 'history'>('overview');
  const [newNote, setNewNote] = useState('');
  const [editData, setEditData] = useState<any>(null);

  const client = clients.find(c => c.id === id);
  const resp = client ? employees.find(e => e.id === client.responsibleId) : null;
  const desk = client ? desks.find(d => d.id === client.deskId) : null;
  const notes = client ? clientNotes.filter(n => n.clientId === client.id) : [];
  const accounts = client ? tradingAccounts.filter(a => a.clientId === client.id) : [];

  useEffect(() => {
    if (auth.employeeId && client) {
      addHistoryEvent({ clientId: client.id, clientName: `${client.lastName} ${client.firstName}`, section: 'Clients', authorId: auth.employeeId, authorName: (() => { const e = employees.find(emp => emp.id === auth.employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })(), source: 'Employee', description: t(lang, 'viewingClientCard') });
    }
  }, [id]);

  if (!client) return <div className="p-6">{t(lang, 'clientNotFound')}</div>;

  const handleImpersonate = () => { if (auth.employeeId) { impersonateClient(client.id, auth.employeeId); navigate('/client'); } };

  const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium text-right">{value || '—'}</span></div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/clients')}><ArrowLeft size={16} className="mr-1" /> {t(lang, 'back')}</Button>
          <h1 className="text-lg md:text-xl font-semibold truncate">{client.lastName} {client.firstName} {client.middleName || ''}</h1>
          <span className={`status-badge ${client.status === 'Live' ? 'status-live' : client.status === 'Hot' ? 'status-hot' : 'status-new'}`}>{client.status}</span>
        </div>
        <div className="sm:ml-auto"><Button variant="outline" size="sm" onClick={handleImpersonate}><ExternalLink size={14} className="mr-1" /> {t(lang, 'enterCabinet')}</Button></div>
      </div>

      <div className="flex gap-1 mb-4 md:mb-6 overflow-x-auto">
        {(['overview', 'edit', 'history'] as const).map(tb => (
          <button key={tb} onClick={() => { if (tb === 'edit') setEditData({ ...client }); setTab(tb); }}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {tb === 'overview' ? t(lang, 'overview') : tb === 'edit' ? t(lang, 'edit') : t(lang, 'history')}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'generalInfo')}</h3>
            <InfoField label={t(lang, 'lastName')} value={client.lastName} />
            <InfoField label={t(lang, 'firstName')} value={client.firstName} />
            <InfoField label={t(lang, 'middleName')} value={client.middleName} />
            <InfoField label={t(lang, 'desk')} value={desk?.name} />
            <InfoField label={t(lang, 'responsible')} value={resp ? `${resp.firstName} ${resp.lastName}` : undefined} />
            <InfoField label={t(lang, 'type')} value={client.type} />
            <InfoField label={t(lang, 'status')} value={client.status} />
            <InfoField label={t(lang, 'created')} value={new Date(client.createdAt).toLocaleString()} />
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'contacts')}</h3>
            <InfoField label={t(lang, 'country')} value={client.country} />
            <InfoField label={t(lang, 'city')} value={client.city} />
            <InfoField label={t(lang, 'email')} value={client.email} />
            <InfoField label={t(lang, 'phone')} value={client.phone} />
            <InfoField label={t(lang, 'source')} value={client.source} />
            <InfoField label={t(lang, 'verification')} value={client.verificationStatus} />
            <InfoField label={t(lang, 'birthday')} value={client.birthday} />
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'tradingAccounts')}</h3>
            {accounts.length === 0 ? <p className="text-sm text-muted-foreground">{t(lang, 'noData')}</p> : accounts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-2">
                <div><div className="text-sm font-medium">#{a.accountNumber}</div><div className="text-xs text-muted-foreground">{a.group} · {a.isDemo ? 'Demo' : 'Real'}</div></div>
                <div className="text-right"><div className="text-sm font-semibold">${a.balance.toFixed(2)}</div><div className={`text-xs ${a.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</div></div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'notes')}</h3>
            {notes.map(n => { const author = employees.find(e => e.id === n.authorId); return (<div key={n.id} className="p-3 bg-muted/30 rounded-lg mb-2"><div className="flex justify-between mb-1"><span className="text-xs font-medium">{author ? `${author.firstName} ${author.lastName}` : '—'}</span><span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span></div><p className="text-sm">{n.text}</p></div>); })}
            <div className="flex gap-2 mt-3"><Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={t(lang, 'notePlaceholder')} className="min-h-[50px]" /><Button onClick={() => { if (newNote.trim()) { addClientNote(client.id, newNote); setNewNote(''); } }} className="self-end">+</Button></div>
          </div>
        </div>
      )}

      {tab === 'edit' && editData && (
        <div className="max-w-2xl bg-card rounded-lg border p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">{t(lang, 'lastName')}</label><Input value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'firstName')}</label><Input value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'email')}</label><Input value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'phone')}</label><Input value={editData.phone||''} onChange={e => setEditData({...editData, phone: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'country')}</label><Input value={editData.country||''} onChange={e => setEditData({...editData, country: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'city')}</label><Input value={editData.city||''} onChange={e => setEditData({...editData, city: e.target.value})} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'status')}</label>
              <Select value={editData.status} onValueChange={v => setEditData({...editData, status: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['New','Hot','Cold','Lead','Live','Demo','Spam'].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'type')}</label>
              <Select value={editData.type} onValueChange={v => setEditData({...editData, type: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Lead">Lead</SelectItem><SelectItem value="Live">Live</SelectItem><SelectItem value="Demo">Demo</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex gap-2"><Button onClick={() => { updateClient(client.id, editData); setTab('overview'); }}><Save size={14} className="mr-1" /> {t(lang, 'save')}</Button><Button variant="outline" onClick={() => setTab('overview')}>{t(lang, 'cancel')}</Button></div>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table"><thead><tr className="bg-muted/30"><th>{t(lang, 'date')}</th><th>{t(lang, 'section')}</th><th>{t(lang, 'author')}</th><th>{t(lang, 'description')}</th></tr></thead>
              <tbody>{history.filter(h => h.clientId === client.id).slice(0, 50).map(h => (
                <tr key={h.id}><td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td><td><span className="status-badge status-new">{h.section}</span></td><td className="text-sm">{h.authorName}</td><td className="text-sm">{h.description}</td></tr>
              ))}</tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}
