import React, { useState, useMemo } from 'react';
import { useConfirmDelete, ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Search, Check, X, Clock, Filter, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentStatus, PaymentRequest } from '@/types';
import { toast } from 'sonner';
import { useTableControls } from '@/hooks/useTableControls';
import TablePagination from '@/components/TablePagination';

export default function AdminPayments() {
  const { payments, clients, tradingAccounts, employees, updatePaymentStatus, updatePayment, deletePayment, auth } = useStore();
  const { lang } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Deposit' | 'Withdrawal' | 'Transfer'>('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Detail dialog
  const [detailPayment, setDetailPayment] = useState<PaymentRequest | null>(null);

  // Edit dialog
  const [editPayment, setEditPayment] = useState<any>(null);

  const statusTabs: { label: string; value: PaymentStatus | 'All' }[] = [
    { label: t(lang, 'all'), value: 'All' },
    { label: t(lang, 'newPayments'), value: 'New' },
    { label: t(lang, 'pending'), value: 'Pending' },
    { label: t(lang, 'approved'), value: 'Approved' },
    { label: t(lang, 'rejected'), value: 'Rejected' },
  ];

  const typeLabel = (type: string) => type === 'Deposit' ? t(lang, 'depositType') : type === 'Withdrawal' ? t(lang, 'withdrawalType') : t(lang, 'transferType');

  const managers = useMemo(() => {
    const ids = new Set(clients.map(c => c.responsibleId).filter(Boolean));
    return employees.filter(e => ids.has(e.id));
  }, [clients, employees]);

  const filtered = useMemo(() => {
    let result = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter);
    if (typeFilter !== 'All') result = result.filter(p => p.type === typeFilter);
    if (managerFilter !== 'All') {
      result = result.filter(p => {
        const client = clients.find(c => c.id === p.clientId);
        return client?.responsibleId === managerFilter;
      });
    }
    if (dateFrom) result = result.filter(p => new Date(p.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter(p => new Date(p.createdAt) <= new Date(dateTo + 'T23:59:59'));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => {
        const client = clients.find(c => c.id === p.clientId);
        return client && (client.lastName.toLowerCase().includes(s) || client.email.toLowerCase().includes(s) || p.id.includes(s));
      });
    }
    return result;
  }, [payments, statusFilter, typeFilter, managerFilter, dateFrom, dateTo, search, clients]);

  const { paginated, page, setPage, perPage, setPerPage, totalPages } = useTableControls(filtered);

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right ml-4">{value || '—'}</span>
    </div>
  );

  const handleSaveEdit = () => {
    if (!editPayment) return;
    updatePayment(editPayment.id, {
      amount: editPayment.amount,
      paymentMethod: editPayment.paymentMethod,
      comment: editPayment.comment,
      wallet: editPayment.wallet,
      creditAmount: editPayment.creditAmount,
    });
    setEditPayment(null);
    toast.success('Платёж обновлён');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'payments')}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter size={14} className="mr-1" />Фильтры</Button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {tab.label}
            <span className="ml-1 opacity-60">{tab.value === 'All' ? payments.length : payments.filter(p => p.status === tab.value).length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-muted/30 rounded-lg border">
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все типы</SelectItem>
              <SelectItem value="Deposit">Депозит</SelectItem>
              <SelectItem value="Withdrawal">Вывод</SelectItem>
              <SelectItem value="Transfer">Перевод</SelectItem>
            </SelectContent>
          </Select>
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Менеджер" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Все менеджеры</SelectItem>
              {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.lastName} {m.firstName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" placeholder="От" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" placeholder="До" />
          <Button variant="ghost" size="sm" onClick={() => { setTypeFilter('All'); setManagerFilter('All'); setDateFrom(''); setDateTo(''); }}>Сброс</Button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map(p => {
          const client = clients.find(c => c.id === p.clientId);
          return (
            <div key={p.id} className="bg-card rounded-lg border p-4 cursor-pointer" onClick={() => setDetailPayment(p)}>
              <div className="flex items-center justify-between mb-2">
                <span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : p.type === 'Withdrawal' ? 'status-hot' : 'status-new'}`}>{typeLabel(p.type)}</span>
                <span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : p.status === 'Pending' ? 'status-pending' : 'status-new'}`}>{p.status}</span>
              </div>
              <div className="text-sm font-medium">{client?.lastName} {client?.firstName}</div>
              <div className="text-xs text-muted-foreground">{client?.email}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold">${p.amount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>ID</th><th>{t(lang, 'date')}</th><th>{t(lang, 'client')}</th><th>{t(lang, 'account')}</th><th>{t(lang, 'method')}</th><th>{t(lang, 'type')}</th><th>{t(lang, 'amount')}</th><th>{t(lang, 'status')}</th><th className="w-32">{t(lang, 'actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => {
                const client = clients.find(c => c.id === p.clientId);
                const account = tradingAccounts.find(a => a.id === p.accountId);
                return (
                  <tr key={p.id} className="cursor-pointer hover:bg-muted/20" onClick={() => setDetailPayment(p)}>
                    <td className="text-xs text-muted-foreground">{p.id}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.createdAt).toLocaleString('ru-RU')}</td>
                    <td>
                      <div className="text-sm font-medium">{client?.lastName} {client?.firstName}</div>
                      <div className="text-xs text-muted-foreground">{client?.email}</div>
                    </td>
                    <td className="text-sm">{account?.accountNumber || '—'}</td>
                    <td className="text-sm">{p.paymentMethod}</td>
                    <td><span className={`status-badge ${p.type === 'Deposit' ? 'status-live' : p.type === 'Withdrawal' ? 'status-hot' : 'status-new'}`}>{typeLabel(p.type)}</span></td>
                    <td className="font-semibold">${p.amount.toLocaleString()}</td>
                    <td><span className={`status-badge ${p.status === 'Approved' ? 'status-approved' : p.status === 'Rejected' ? 'status-rejected' : p.status === 'Pending' ? 'status-pending' : 'status-new'}`}>{p.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-0.5">
                        {(p.status === 'New' || p.status === 'Pending') && (
                          <>
                            <button onClick={() => updatePaymentStatus(p.id, 'Approved', auth.employeeId)} className="p-1.5 rounded hover:bg-muted text-emerald-600 transition-colors" title="Подтвердить"><Check size={14} /></button>
                            <button onClick={() => updatePaymentStatus(p.id, 'Pending', auth.employeeId)} className="p-1.5 rounded hover:bg-muted text-amber-600 transition-colors" title="В ожидание"><Clock size={14} /></button>
                            <button onClick={() => updatePaymentStatus(p.id, 'Rejected', auth.employeeId)} className="p-1.5 rounded hover:bg-muted text-destructive transition-colors" title="Отклонить"><X size={14} /></button>
                          </>
                        )}
                        <button onClick={() => setEditPayment({ ...p })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Редактировать"><Edit2 size={14} /></button>
                        <button onClick={() => { deletePayment(p.id); toast.success('Платёж удалён'); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Удалить"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} totalPages={totalPages} total={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Payment Detail Dialog */}
      <Dialog open={!!detailPayment} onOpenChange={() => setDetailPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Детали платежа</DialogTitle></DialogHeader>
          {detailPayment && (() => {
            const client = clients.find(c => c.id === detailPayment.clientId);
            const account = tradingAccounts.find(a => a.id === detailPayment.accountId);
            return (
              <div className="space-y-1">
                <InfoRow label="ID" value={detailPayment.id} />
                <InfoRow label="Дата создания" value={new Date(detailPayment.createdAt).toLocaleString('ru-RU')} />
                <InfoRow label="Клиент" value={client ? `${client.lastName} ${client.firstName}` : '—'} />
                <InfoRow label="Email" value={client?.email} />
                <InfoRow label="Телефон" value={client?.phone} />
                <InfoRow label="Счёт" value={account?.accountNumber} />
                <InfoRow label="Тип" value={typeLabel(detailPayment.type)} />
                <InfoRow label="Сумма" value={`$${detailPayment.amount.toLocaleString()} ${detailPayment.currency}`} />
                <InfoRow label="Метод оплаты" value={detailPayment.paymentMethod} />
                <InfoRow label="Статус" value={detailPayment.status} />
                {detailPayment.processedAt && <InfoRow label="Обработан" value={new Date(detailPayment.processedAt).toLocaleString('ru-RU')} />}
                {detailPayment.processedBy && (() => {
                  const processor = employees.find(e => e.id === detailPayment.processedBy);
                  return <InfoRow label="Обработал" value={processor ? `${processor.firstName} ${processor.lastName}` : detailPayment.processedBy} />;
                })()}

                {/* Withdrawal requisites */}
                {detailPayment.type === 'Withdrawal' && (
                  <div className="mt-4 pt-3 border-t">
                    <h4 className="text-sm font-semibold mb-2">Реквизиты вывода</h4>
                    <InfoRow label="Кошелёк / Реквизиты" value={detailPayment.wallet} />
                    {detailPayment.creditAmount !== undefined && <InfoRow label="Сумма кредита" value={`$${detailPayment.creditAmount}`} />}
                  </div>
                )}

                {detailPayment.comment && (
                  <div className="mt-4 pt-3 border-t">
                    <h4 className="text-sm font-semibold mb-2">Комментарий</h4>
                    <p className="text-sm text-muted-foreground">{detailPayment.comment}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t mt-4">
                  {(detailPayment.status === 'New' || detailPayment.status === 'Pending') && (
                    <>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { updatePaymentStatus(detailPayment.id, 'Approved', auth.employeeId); setDetailPayment(null); toast.success('Платёж подтверждён'); }}>
                        <Check size={14} className="mr-1" /> Подтвердить
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { updatePaymentStatus(detailPayment.id, 'Rejected', auth.employeeId); setDetailPayment(null); toast.success('Платёж отклонён'); }}>
                        <X size={14} className="mr-1" /> Отклонить
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setDetailPayment(null); setEditPayment({ ...detailPayment }); }}>
                    <Edit2 size={14} className="mr-1" /> Редактировать
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive ml-auto" onClick={() => { deletePayment(detailPayment.id); setDetailPayment(null); toast.success('Платёж удалён'); }}>
                    <Trash2 size={14} className="mr-1" /> Удалить
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={!!editPayment} onOpenChange={() => setEditPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Редактировать платёж</DialogTitle></DialogHeader>
          {editPayment && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Сумма</label>
                <Input type="number" value={editPayment.amount} onChange={e => setEditPayment({ ...editPayment, amount: Number(e.target.value) })} min="0" step="0.01" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Метод оплаты</label>
                <Input value={editPayment.paymentMethod} onChange={e => setEditPayment({ ...editPayment, paymentMethod: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Кошелёк / Реквизиты</label>
                <Input value={editPayment.wallet || ''} onChange={e => setEditPayment({ ...editPayment, wallet: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Статус</label>
                <Select value={editPayment.status} onValueChange={v => setEditPayment({ ...editPayment, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Комментарий</label>
                <Textarea value={editPayment.comment || ''} onChange={e => setEditPayment({ ...editPayment, comment: e.target.value })} rows={3} />
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={handleSaveEdit}>Сохранить</Button>
                <Button variant="outline" onClick={() => setEditPayment(null)}>Отмена</Button>
                <Button variant="destructive" className="ml-auto" onClick={() => { deletePayment(editPayment.id); setEditPayment(null); toast.success('Платёж удалён'); }}>
                  <Trash2 size={14} className="mr-1" /> Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
