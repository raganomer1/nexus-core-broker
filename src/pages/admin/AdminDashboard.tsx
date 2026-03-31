import React from 'react';
import { useStore } from '@/store/useStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { useNavigate } from 'react-router-dom';
import {
  Users, CreditCard, MessageSquare, ShieldCheck, TrendingUp, ArrowUpRight,
  DollarSign, Activity, UserPlus, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { clients, leads, payments, tickets, tradingAccounts, positions, verificationRequests, employees } = useStore();
  const { notifications } = useNotificationStore();
  const { lang } = useSettingsStore();

  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const pendingPayments = payments.filter(p => p.status === 'New' || p.status === 'Pending').length;
  const pendingVerifications = verificationRequests.filter(v => v.status === 'Pending').length;
  const activeLeads = leads.filter(l => !l.convertedClientId).length;
  const openPositions = positions.filter(p => p.status === 'Open').length;
  const totalDeposits = payments.filter(p => p.type === 'Deposit' && p.status === 'Approved').reduce((s, p) => s + p.amount, 0);
  const totalWithdrawals = payments.filter(p => p.type === 'Withdrawal' && p.status === 'Approved').reduce((s, p) => s + p.amount, 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const stats = [
    { label: t(lang, 'clients'), value: clients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/admin/clients' },
    { label: t(lang, 'leads'), value: activeLeads, icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/admin/leads' },
    { label: t(lang, 'pendingPayments'), value: pendingPayments, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10', link: '/admin/payments', alert: pendingPayments > 0 },
    { label: t(lang, 'openTickets'), value: openTickets, icon: MessageSquare, color: 'text-rose-500', bg: 'bg-rose-500/10', link: '/admin/support', alert: openTickets > 0 },
    { label: t(lang, 'verification'), value: pendingVerifications, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/admin/verification', alert: pendingVerifications > 0 },
    { label: t(lang, 'openPositions'), value: openPositions, icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10', link: '/admin/trading' },
  ];

  const recentPayments = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold">{t(lang, 'dashboard')}</h1>
        {unreadNotifs > 0 && (
          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
            {unreadNotifs} {t(lang, 'newNotifications')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <button key={s.label} onClick={() => navigate(s.link)} className="bg-card rounded-xl border p-4 text-left hover:shadow-md transition-shadow group relative">
            {s.alert && <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />}
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}><s.icon size={18} className={s.color} /></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">{s.label}<ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign size={14} /> {t(lang, 'depositsApproved')}</div>
          <div className="text-xl font-bold text-emerald-600">${totalDeposits.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign size={14} /> {t(lang, 'withdrawalsApproved')}</div>
          <div className="text-xl font-bold text-rose-600">${totalWithdrawals.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity size={14} /> {t(lang, 'tradingAccounts')}</div>
          <div className="text-xl font-bold">{tradingAccounts.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-medium text-sm">{t(lang, 'recentPayments')}</span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/admin/payments')}>{t(lang, 'allLink')}</Button>
          </div>
          <div className="divide-y">
            {recentPayments.map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{client ? `${client.lastName} ${client.firstName}` : '—'}</div>
                    <div className="text-xs text-muted-foreground">{p.type} · {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${p.type === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>{p.type === 'Deposit' ? '+' : '-'}${p.amount}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-medium text-sm">{t(lang, 'recentTickets')}</span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/admin/support')}>{t(lang, 'allLink')}</Button>
          </div>
          <div className="divide-y">
            {recentTickets.map(tk => {
              const client = clients.find(c => c.id === tk.clientId);
              return (
                <div key={tk.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{tk.subject}</div>
                    <div className="text-xs text-muted-foreground">{client ? `${client.lastName} ${client.firstName}` : '—'} · {new Date(tk.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${tk.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>{tk.status === 'Open' ? t(lang, 'opened') : t(lang, 'closed')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
