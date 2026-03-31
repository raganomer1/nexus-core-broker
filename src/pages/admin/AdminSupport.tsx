import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Send, ArrowLeft, Search, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

type SortKey = 'date' | 'subject' | 'client';

export default function AdminSupport() {
  const { tickets, messages, clients, employees, addMessage, updateTicket, updateTicketStatus, deleteTicket, auth } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'Open' | 'Closed'>('Open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editSubject, setEditSubject] = useState<{ id: string; subject: string } | null>(null);
  const { state: delState, confirmDelete, close: closeDelete } = useConfirmDelete();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let result = tickets.filter(tk => tk.status === tab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(tk => {
        const c = clients.find(cl => cl.id === tk.clientId);
        return tk.subject.toLowerCase().includes(s) || (c && (`${c.lastName} ${c.firstName} ${c.email}`.toLowerCase().includes(s)));
      });
    }
    if (assignedFilter !== 'All') result = result.filter(tk => tk.assignedTo === assignedFilter);

    result.sort((a, b) => {
      if (sortKey === 'date') {
        const cmp = new Date(a.lastMessageAt).getTime() - new Date(b.lastMessageAt).getTime();
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'subject') {
        const cmp = a.subject.localeCompare(b.subject);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'client') {
        const ca = clients.find(c => c.id === a.clientId);
        const cb = clients.find(c => c.id === b.clientId);
        const cmp = (ca?.lastName || '').localeCompare(cb?.lastName || '');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });

    return result;
  }, [tickets, tab, search, assignedFilter, clients, sortKey, sortDir]);

  const selected = tickets.find(t => t.id === selectedId);
  const selectedMsgs = selected ? messages.filter(m => m.ticketId === selected.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];
  const selectedClient = selected ? clients.find(c => c.id === selected.clientId) : null;

  const assignees = useMemo(() => {
    const ids = new Set(tickets.map(t => t.assignedTo).filter(Boolean));
    return employees.filter(e => ids.has(e.id));
  }, [tickets, employees]);

  const handleReply = () => { if (!reply.trim() || !selected) return; addMessage({ ticketId: selected.id, authorId: auth.employeeId || '', authorType: 'Employee', text: reply }); setReply(''); };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'support')}</h1>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['Open', 'Closed'] as const).map(tb => (
          <button key={tb} onClick={() => { setTab(tb); setSelectedId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${tab === tb ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb === 'Open' ? 'Открытые' : 'Закрытые'}
            <span className="ml-1 opacity-60">{tickets.filter(tk => tk.status === tb).length}</span>
          </button>
        ))}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Ответственный" /></SelectTrigger>
          <SelectContent><SelectItem value="All">Все</SelectItem>{assignees.map(a => <SelectItem key={a.id} value={a.id}>{a.lastName} {a.firstName}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2 mb-3 text-xs">
        <span className="text-muted-foreground">Сортировка:</span>
        {([['date', 'По дате'], ['subject', 'По теме'], ['client', 'По клиенту']] as [SortKey, string][]).map(([k, l]) => (
          <button key={k} onClick={() => toggleSort(k)} className={`text-xs ${sortKey === k ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {l}{sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6" style={{ minHeight: '60vh' }}>
        <div className={`bg-card rounded-lg border overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="divide-y">
            {filtered.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Нет тикетов</div>}
            {filtered.map(tk => {
              const client = clients.find(c => c.id === tk.clientId);
              const assigned = employees.find(e => e.id === tk.assignedTo);
              return (
                <div key={tk.id} className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${selectedId === tk.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex-1 min-w-0" onClick={() => setSelectedId(tk.id)}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium truncate">{tk.subject}</span><span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(tk.lastMessageAt).toLocaleDateString()}</span></div>
                    <div className="text-xs text-muted-foreground">{client?.lastName} {client?.firstName}</div>
                    {assigned && <div className="text-xs text-muted-foreground mt-0.5">→ {assigned.firstName} {assigned.lastName[0]}.</div>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditSubject({ id: tk.id, subject: tk.subject }); }}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); confirmDelete('Удалить обращение', `Удалить тикет "${tk.subject}"?`, () => { deleteTicket(tk.id); setSelectedId(null); }); }}><Trash2 size={14} className="text-destructive" /></Button>
                  </div>
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
                {selected.status === 'Open' && (<Button variant="outline" size="sm" onClick={() => updateTicketStatus(selected.id, 'Closed')}>Закрыть</Button>)}
                {selected.status === 'Closed' && (<Button variant="outline" size="sm" onClick={() => updateTicketStatus(selected.id, 'Open')}>Открыть</Button>)}
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
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Введите ответ..." className="min-h-[40px] flex-1" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
                <Button onClick={handleReply} className="self-end"><Send size={14} /></Button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-2 bg-card rounded-lg border items-center justify-center text-muted-foreground text-sm">Выберите тикет</div>
        )}
      </div>

      {/* Edit subject dialog */}
      <Dialog open={!!editSubject} onOpenChange={() => setEditSubject(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader><DialogTitle>Редактировать тему</DialogTitle></DialogHeader>
          {editSubject && (
            <div className="space-y-3">
              <Input value={editSubject.subject} onChange={e => setEditSubject({ ...editSubject, subject: e.target.value })} />
              <div className="flex gap-2">
                <Button onClick={() => { updateTicket(editSubject.id, { subject: editSubject.subject }); setEditSubject(null); }}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditSubject(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog state={delState} onClose={closeDelete} />
    </div>
  );
}
