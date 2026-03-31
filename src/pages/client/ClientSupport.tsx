import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Plus, Send, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ClientSupport() {
  const { auth, tickets, messages, employees, addTicket, addMessage } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'Open' | 'Closed'>('Open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const clientTickets = tickets.filter(tk => tk.clientId === auth.clientId && tk.status === tab);
  const filteredTickets = search ? clientTickets.filter(tk => tk.subject.toLowerCase().includes(search.toLowerCase())) : clientTickets;
  const selected = tickets.find(tk => tk.id === selectedId);
  const selectedMsgs = selected ? messages.filter(m => m.ticketId === selected.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];

  const handleCreate = () => { if (!newSubject.trim() || !newMessage.trim()) return; const ticket = addTicket({ clientId: auth.clientId!, subject: newSubject }); addMessage({ ticketId: (ticket as any).id, authorId: auth.clientId!, authorType: 'Client', text: newMessage }); setShowCreate(false); setNewSubject(''); setNewMessage(''); };
  const handleReply = () => { if (!reply.trim() || !selected) return; addMessage({ ticketId: selected.id, authorId: auth.clientId!, authorType: 'Client', text: reply }); setReply(''); };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'support')}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> {t(lang, 'create')}</Button>
      </div>
      <div className="flex gap-1 mb-4">
        {(['Open', 'Closed'] as const).map(tb => (<button key={tb} onClick={() => { setTab(tb); setSelectedId(null); }} className={`px-3 py-1.5 rounded-full text-xs font-medium ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{tb === 'Open' ? t(lang, 'openTicketsTab') : t(lang, 'archiveTab')}</button>))}
      </div>
      <div className="relative mb-4 max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6" style={{ minHeight: '50vh' }}>
        <div className={`bg-card rounded-lg border overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="divide-y">
            {filteredTickets.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">{t(lang, 'noTickets')}</div>}
            {filteredTickets.map(tk => (<div key={tk.id} onClick={() => setSelectedId(tk.id)} className={`p-4 cursor-pointer transition-colors ${selectedId === tk.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}><div className="text-sm font-medium mb-1">{tk.subject}</div><div className="text-xs text-muted-foreground">{new Date(tk.lastMessageAt).toLocaleString()}</div></div>))}
          </div>
        </div>
        {selected ? (
          <div className={`lg:col-span-2 bg-card rounded-lg border flex flex-col overflow-hidden ${!selectedId ? 'hidden lg:flex' : ''}`}>
            <div className="p-3 md:p-4 border-b flex items-center gap-3"><button className="lg:hidden p-1" onClick={() => setSelectedId(null)}><ArrowLeft size={18} /></button><div><h3 className="font-semibold text-sm">{selected.subject}</h3><p className="text-xs text-muted-foreground">#{selected.id}</p></div></div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3" style={{ maxHeight: '45vh' }}>
              {selectedMsgs.map(m => { const isClient = m.authorType === 'Client'; return (<div key={m.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-lg text-sm ${isClient ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><div className="text-xs opacity-70 mb-1">{new Date(m.createdAt).toLocaleTimeString()}</div>{m.text}</div></div>); })}
            </div>
            {selected.status === 'Open' && (<div className="p-3 md:p-4 border-t flex gap-2"><Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder={t(lang, 'writePlaceholder')} className="min-h-[40px] flex-1" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} /><Button onClick={handleReply} className="self-end"><Send size={14} /></Button></div>)}
          </div>
        ) : (<div className="hidden lg:flex lg:col-span-2 bg-card rounded-lg border items-center justify-center text-muted-foreground text-sm">{t(lang, 'selectTicketClient')}</div>)}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent><DialogHeader><DialogTitle>{t(lang, 'newTicket')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">{t(lang, 'subject')}</label><Input value={newSubject} onChange={e => setNewSubject(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, 'message')}</label><Textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} /></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setShowCreate(false)}>{t(lang, 'cancel')}</Button><Button onClick={handleCreate}>{t(lang, 'create')}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
