import React, { useState } from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { ThemeLangToggle } from '@/components/ThemeLangToggle';
import {
  Home, CreditCard, MessageSquare, User, ChevronDown, ChevronRight, LogOut,
  TrendingUp, DollarSign, ArrowDownCircle, ArrowUpCircle, RefreshCw, Clock, Menu, X
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const paymentSubItems: { to: string; labelKey: TranslationKey; icon: React.ElementType }[] = [
  { to: '/client/payments/deposit', labelKey: 'deposit', icon: ArrowDownCircle },
  { to: '/client/payments/withdraw', labelKey: 'withdraw', icon: ArrowUpCircle },
  { to: '/client/payments/transfer', labelKey: 'transfer', icon: RefreshCw },
  { to: '/client/payments/history', labelKey: 'history', icon: Clock },
];

export default function ClientLayout() {
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { auth, clients, employees, stopImpersonation } = useStore();
  const { lang } = useSettingsStore();
  const client = clients.find(c => c.id === auth.clientId);
  const manager = client?.responsibleId ? employees.find(e => e.id === client.responsibleId) : null;

  const handleNavClick = () => setSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen">
      {auth.impersonating && (
        <div className="bg-warning/90 text-warning-foreground px-4 py-1.5 text-sm flex items-center justify-between">
          <span className="truncate">{t(lang, 'viewingAs')}: {client?.lastName} {client?.firstName}</span>
          <button onClick={() => { stopImpersonation(); navigate('/admin/clients'); }} className="underline font-medium whitespace-nowrap ml-2">{t(lang, 'backToCRM')}</button>
        </div>
      )}

      <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-[hsl(var(--client-header))] text-[hsl(var(--client-header-foreground))]">
        <div className="flex items-center gap-3 md:gap-6">
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-bold text-lg">TraderRoom</span>
          <NavLink to="/terminal" className="hidden sm:flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100"><TrendingUp size={16} /> {t(lang, 'terminal')}</NavLink>
          <NavLink to="/client" className="hidden sm:flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100"><Home size={16} /> {t(lang, 'cabinet')}</NavLink>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeLangToggle variant="header" />
          <NavLink to="/client/profile" className="flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100">
            <User size={16} /> <span className="hidden sm:inline">{client?.firstName} {client?.lastName}</span>
          </NavLink>
          <button onClick={() => navigate('/')} className="opacity-60 hover:opacity-100"><LogOut size={16} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={`
          w-56 bg-card border-r flex flex-col flex-shrink-0 z-40
          fixed md:static inset-y-0 left-0 top-14 transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <div className="sm:hidden space-y-1 mb-2 pb-2 border-b">
              <NavLink to="/terminal" onClick={handleNavClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted text-foreground">
                <TrendingUp size={18} /> {t(lang, 'terminal')}
              </NavLink>
            </div>

            <NavLink to="/client" end onClick={handleNavClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}>
              <Home size={18} /> {t(lang, 'home')}
            </NavLink>
            <NavLink to="/client/accounts" onClick={handleNavClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}>
              <CreditCard size={18} /> {t(lang, 'accounts')}
            </NavLink>

            <div>
              <button onClick={() => setPaymentsOpen(!paymentsOpen)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full hover:bg-muted text-foreground">
                <DollarSign size={18} /> {t(lang, 'payments')}
                <span className="ml-auto">{paymentsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              </button>
              {paymentsOpen && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {paymentSubItems.map(item => (
                    <NavLink key={item.to} to={item.to} onClick={handleNavClick} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded text-sm ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                      <item.icon size={14} /> {t(lang, item.labelKey)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/client/support" onClick={handleNavClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}>
              <MessageSquare size={18} /> {t(lang, 'support')}
            </NavLink>
          </nav>

          {manager && (
            <div className="border-t p-4">
              <div className="text-xs text-muted-foreground mb-2">{t(lang, 'yourManager')}</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {manager.firstName[0]}{manager.lastName[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{manager.firstName} {manager.lastName}</div>
                  <div className="text-xs text-muted-foreground">{manager.position}</div>
                </div>
              </div>
              {manager.phone && <div className="mt-2 text-xs text-muted-foreground">{manager.phone}</div>}
              <button className="mt-2 text-xs text-primary hover:underline">{t(lang, 'sendMessage')}</button>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
