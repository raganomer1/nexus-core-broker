import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Plus, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSupport() {
  const { tickets, messages, clients, employees, addMessage, updateTicketStatus, auth } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'Open' | 'Closed'>('Open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const filtered = tickets.filter(t => t.status === tab).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  const selected = tickets.find(t => t.id === selectedId);
  const selectedMsgs = selected ? messages.filter(m => m.ticketId === selected.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];
  const selectedClient = selected ? clients.find(c => c.id === selected.clientId) : null;

  const handleReply = () => { if (!reply.trim() || !selected) return; addMessage({ ticketId: selected.id, authorId: auth.employeeId || '', authorType: 'Employee', text: reply }); setReply(''); };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'support')}</h1>
      <div className="flex gap-1 mb-4">
        {(['Open', 'Closed'] as const).map(tb => (
          <button key={tb} onClick={() => { setTab(tb); setSelectedId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb === 'Open' ? t(lang, 'openStatus') : t(lang, 'closedStatus')}
            <span className="ml-1 opacity-60">{tickets.filter(tk => tk.status === tb).length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6" style={{ minHeight: '60vh' }}>
        <div className={`bg-card rounded-lg border overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="divide-y">
            {filtered.map(tk => {
              const client = clients.find(c => c.id === tk.clientId);
              const assigned = employees.find(e => e.id === tk.assignedTo);
              return (
                <div key={tk.id} onClick={() => setSelectedId(tk.id)} className={`p-4 cursor-pointer transition-colors ${selectedId === tk.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium truncate">{tk.subject}</span><span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(tk.lastMessageAt).toLocaleDateString()}</span></div>
                  <div className="text-xs text-muted-foreground">{client?.lastName} {client?.firstName}</div>
                  {assigned && <div className="text-xs text-muted-foreground mt-0.5">→ {assigned.firstName} {assigned.lastName[0]}.</div>}
                </div>
              );
            })}
          </div>
        </div>

        {selected && selectedClient ? (
          <div className={`lg:col-span-2 bg-card rounded-lg border flex flex-col overflow-hidden ${!selectedId ? 'hidden lg:flex' : ''}`}>
            <div className="p-3 md:p-4 border-b flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button className="lg:hidden p-1 flex-shrink-0" onClick={() => setSelectedId(null)}><ArrowLeft size={18} /></button>
                <div className="min-w-0"><h3 className="font-semibold text-sm truncate">{selected.subject}</h3><p className="text-xs text-muted-foreground">{selectedClient.lastName} {selectedClient.firstName} · #{selected.id}</p></div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {selected.status === 'Open' && (<Button variant="outline" size="sm" onClick={() => updateTicketStatus(selected.id, 'Closed')}>{t(lang, 'close')}</Button>)}
                {selected.status === 'Closed' && (<Button variant="outline" size="sm" onClick={() => updateTicketStatus(selected.id, 'Open')}>{t(lang, 'reopen')}</Button>)}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3" style={{ maxHeight: '50vh' }}>
              {selectedMsgs.map(m => {
                const isEmployee = m.authorType === 'Employee';
                const author = isEmployee ? employees.find(e => e.id === m.authorId) : selectedClient;
                return (
                  <div key={m.id} className={`flex ${isEmployee ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-lg text-sm ${isEmployee ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <div className="text-xs opacity-70 mb-1">{isEmployee ? `${(author as any)?.firstName || ''}` : `${selectedClient.firstName}`} · {new Date(m.createdAt).toLocaleTimeString()}</div>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
            {selected.status === 'Open' && (
              <div className="p-3 md:p-4 border-t flex gap-2">
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder={t(lang, 'replyPlaceholder')} className="min-h-[40px] flex-1" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
                <Button onClick={handleReply} className="self-end"><Send size={14} /></Button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-2 bg-card rounded-lg border items-center justify-center text-muted-foreground text-sm">{t(lang, 'selectTicket')}</div>
        )}
      </div>
    </div>
  );
}
