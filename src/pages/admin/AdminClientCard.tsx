import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { ArrowLeft, ExternalLink, Save, Clock, Mail, Phone, MapPin, Shield, User, Briefcase, FileText } from 'lucide-react';
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
    <div className="flex justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/clients')}><ArrowLeft size={16} className="mr-1" /> {t(lang, 'back')}</Button>
          <h1 className="text-lg md:text-xl font-semibold truncate">{client.lastName} {client.firstName} {client.middleName || ''}</h1>
          <span className={`status-badge ${client.status === 'Live' ? 'status-live' : client.status === 'Hot' ? 'status-hot' : 'status-new'}`}>{client.status}</span>
        </div>
        <div className="sm:ml-auto"><Button variant="outline" size="sm" onClick={handleImpersonate}><ExternalLink size={14} className="mr-1" /> {t(lang, 'enterCabinet')}</Button></div>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar navigation */}
        <div className="hidden md:flex flex-col gap-1 w-40 shrink-0">
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => navigate('/admin/clients')}>
            <ArrowLeft size={14} className="mr-2" /> {t(lang, 'back')}
          </Button>
          {(['overview', 'edit', 'history'] as const).map(tb => (
            <button key={tb} onClick={() => { if (tb === 'edit') setEditData({ ...client }); setTab(tb); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${tab === tb ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              {tb === 'overview' ? t(lang, 'overview') : tb === 'edit' ? t(lang, 'edit') : t(lang, 'history')}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 mb-4 w-full">
          {(['overview', 'edit', 'history'] as const).map(tb => (
            <button key={tb} onClick={() => { if (tb === 'edit') setEditData({ ...client }); setTab(tb); }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {tb === 'overview' ? t(lang, 'overview') : tb === 'edit' ? t(lang, 'edit') : t(lang, 'history')}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* General Information */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold">{t(lang, 'generalInfo')}</h3>
                </div>
                <InfoField label="Обращение" value={client.salutation} />
                <InfoField label={t(lang, 'lastName')} value={client.lastName} />
                <InfoField label={t(lang, 'firstName')} value={client.firstName} />
                <InfoField label={t(lang, 'middleName')} value={client.middleName} />
                <InfoField label={t(lang, 'desk')} value={desk?.name} />
                <InfoField label={t(lang, 'responsible')} value={resp ? `${resp.firstName} ${resp.lastName}` : undefined} />
                <InfoField label={t(lang, 'type')} value={client.type} />
                <InfoField label={t(lang, 'status')} value={client.status} />
                <InfoField label="Affiliate ID" value={client.affiliateId} />
                <InfoField label={t(lang, 'created')} value={new Date(client.createdAt).toLocaleString()} />
              </div>

              {/* Contact Information */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Mail size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold">{t(lang, 'contacts')}</h3>
                </div>
                <InfoField label={t(lang, 'country')} value={client.country} />
                <InfoField label="Регион" value={client.region} />
                <InfoField label={t(lang, 'city')} value={client.city} />
                <InfoField label="Индекс" value={client.zip} />
                <InfoField label="Адрес" value={client.address} />
                <InfoField label={t(lang, 'email')} value={client.email} />
                <InfoField label={t(lang, 'phone')} value={client.phone} />
                <InfoField label="Доп. контакт" value={client.additionalContact} />
                <InfoField label="Кабинет" value={client.lastCabinetVisit ? new Date(client.lastCabinetVisit).toLocaleString() : '—'} />
                <InfoField label="Терминал" value={client.lastTerminalVisit ? new Date(client.lastTerminalVisit).toLocaleString() : '—'} />
              </div>

              {/* Additional Information */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold">Дополнительная информация</h3>
                </div>
                <InfoField label="Происхождение" value={client.origin} />
                <InfoField label={t(lang, 'verification')} value={client.verificationStatus} />
                <InfoField label="Гражданство" value={client.citizenship} />
                <InfoField label="Campaign ID" value={client.campaignId} />
                <InfoField label="Тег 1" value={client.tag1} />
                <InfoField label="Тег 2" value={client.tag2} />
                <InfoField label="Паспорт" value={client.passport} />
                <InfoField label={t(lang, 'birthday')} value={client.birthday} />
                <InfoField label="Цель" value={client.purpose} />
                <InfoField label={t(lang, 'source')} value={client.source} />
              </div>

              {/* Trading accounts */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold">{t(lang, 'tradingAccounts')}</h3>
                </div>
                {accounts.length === 0 ? <p className="text-sm text-muted-foreground">{t(lang, 'noData')}</p> : accounts.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-2">
                    <div>
                      <div className="text-sm font-medium">#{a.accountNumber}</div>
                      <div className="text-xs text-muted-foreground">{a.group} · {a.isDemo ? 'Demo' : 'Real'} · {a.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${a.balance.toFixed(2)}</div>
                      <div className={`text-xs ${a.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {client.description && (
                <div className="bg-card rounded-lg border p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold mb-3">Описание</h3>
                  <p className="text-sm text-muted-foreground">{client.description}</p>
                </div>
              )}

              {/* Notes */}
              <div className="bg-card rounded-lg border p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-3">{t(lang, 'notes')}</h3>
                {notes.map(n => {
                  const author = employees.find(e => e.id === n.authorId);
                  return (
                    <div key={n.id} className="p-3 bg-muted/30 rounded-lg mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">{author ? `${author.firstName} ${author.lastName}` : '—'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{n.text}</p>
                    </div>
                  );
                })}
                <div className="flex gap-2 mt-3">
                  <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={t(lang, 'notePlaceholder')} className="min-h-[50px]" />
                  <Button onClick={() => { if (newNote.trim()) { addClientNote(client.id, newNote); setNewNote(''); } }} className="self-end">+</Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'edit' && editData && (
            <div className="space-y-5">
              <div className="bg-card rounded-lg border p-5">
                <h3 className="text-sm font-semibold mb-3 text-primary">Общая информация</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground">Обращение</label>
                    <Select value={editData.salutation || ''} onValueChange={v => setEditData({...editData, salutation: v})}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent><SelectItem value="Mr">Mr</SelectItem><SelectItem value="Mrs">Mrs</SelectItem><SelectItem value="Ms">Ms</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'lastName')}</label><Input value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'firstName')}</label><Input value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'middleName')}</label><Input value={editData.middleName || ''} onChange={e => setEditData({...editData, middleName: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'status')}</label>
                    <Select value={editData.status} onValueChange={v => setEditData({...editData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{['New','Hot','Cold','Lead','Live','Demo','Spam'].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'type')}</label>
                    <Select value={editData.type} onValueChange={v => setEditData({...editData, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Lead">Lead</SelectItem><SelectItem value="Live">Live</SelectItem><SelectItem value="Demo">Demo</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs text-muted-foreground">Desk</label>
                    <Select value={editData.deskId || ''} onValueChange={v => setEditData({...editData, deskId: v})}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{desks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'responsible')}</label>
                    <Select value={editData.responsibleId || ''} onValueChange={v => setEditData({...editData, responsibleId: v})}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{employees.filter(e => e.isActive).map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs text-muted-foreground">Affiliate ID</label><Input value={editData.affiliateId || ''} onChange={e => setEditData({...editData, affiliateId: e.target.value})} /></div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-5">
                <h3 className="text-sm font-semibold mb-3 text-primary">Контакты</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'email')}</label><Input value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'phone')}</label><Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'country')}</label><Input value={editData.country || ''} onChange={e => setEditData({...editData, country: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Регион</label><Input value={editData.region || ''} onChange={e => setEditData({...editData, region: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'city')}</label><Input value={editData.city || ''} onChange={e => setEditData({...editData, city: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Индекс</label><Input value={editData.zip || ''} onChange={e => setEditData({...editData, zip: e.target.value})} /></div>
                  <div className="sm:col-span-2"><label className="text-xs text-muted-foreground">Адрес</label><Input value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Доп. контакт</label><Input value={editData.additionalContact || ''} onChange={e => setEditData({...editData, additionalContact: e.target.value})} /></div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-5">
                <h3 className="text-sm font-semibold mb-3 text-primary">Дополнительно</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground">Гражданство</label><Input value={editData.citizenship || ''} onChange={e => setEditData({...editData, citizenship: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Campaign ID</label><Input value={editData.campaignId || ''} onChange={e => setEditData({...editData, campaignId: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Тег 1</label><Input value={editData.tag1 || ''} onChange={e => setEditData({...editData, tag1: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Тег 2</label><Input value={editData.tag2 || ''} onChange={e => setEditData({...editData, tag2: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Паспорт</label><Input value={editData.passport || ''} onChange={e => setEditData({...editData, passport: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'birthday')}</label><Input type="date" value={editData.birthday || ''} onChange={e => setEditData({...editData, birthday: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">Цель</label><Input value={editData.purpose || ''} onChange={e => setEditData({...editData, purpose: e.target.value})} /></div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, 'source')}</label><Input value={editData.source || ''} onChange={e => setEditData({...editData, source: e.target.value})} /></div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-5">
                <h3 className="text-sm font-semibold mb-3 text-primary">Описание</h3>
                <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { updateClient(client.id, editData); setTab('overview'); }}><Save size={14} className="mr-1" /> {t(lang, 'save')}</Button>
                <Button variant="outline" onClick={() => setTab('overview')}>{t(lang, 'cancel')}</Button>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr className="bg-muted/30"><th>{t(lang, 'date')}</th><th>{t(lang, 'section')}</th><th>{t(lang, 'author')}</th><th>{t(lang, 'description')}</th></tr></thead>
                  <tbody>{history.filter(h => h.clientId === client.id).slice(0, 50).map(h => (
                    <tr key={h.id}>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                      <td><span className="status-badge status-new">{h.section}</span></td>
                      <td className="text-sm">{h.authorName}</td>
                      <td className="text-sm">{h.description}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
