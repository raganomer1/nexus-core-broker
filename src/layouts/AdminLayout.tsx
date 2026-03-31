import React, { useState } from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { ThemeLangToggle } from '@/components/ThemeLangToggle';
import {
  Users, CreditCard, Activity, Clock, UserCog, Building2, ShieldCheck, MessageSquare,
  BarChart3, Settings, TrendingUp, LogOut, Bell, Menu, X, ChevronLeft, ChevronRight,
  CheckCheck, LayoutDashboard
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const navItems: { to: string; labelKey: TranslationKey; icon: React.ElementType; exact?: boolean }[] = [
  { to: '/admin', labelKey: 'dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/clients', labelKey: 'clients', icon: Users },
  { to: '/admin/leads', labelKey: 'leads', icon: Users },
  { to: '/admin/accounts', labelKey: 'accounts', icon: CreditCard },
  { to: '/admin/payments', labelKey: 'payments', icon: CreditCard },
  { to: '/admin/trading', labelKey: 'trading', icon: TrendingUp },
  { to: '/admin/assets', labelKey: 'assets', icon: Activity },
  { to: '/admin/prices', labelKey: 'prices', icon: BarChart3 },
  { to: '/admin/history', labelKey: 'history', icon: Clock },
  { to: '/admin/employees', labelKey: 'employees', icon: UserCog },
  { to: '/admin/roles', labelKey: 'roles', icon: ShieldCheck },
  { to: '/admin/desks', labelKey: 'desks', icon: Building2 },
  { to: '/admin/verification', labelKey: 'verification', icon: ShieldCheck },
  { to: '/admin/support', labelKey: 'support', icon: MessageSquare },
  { to: '/admin/reports', labelKey: 'reports', icon: BarChart3 },
  { to: '/admin/settings', labelKey: 'settings', icon: Settings },
  { to: '/admin/online', labelKey: 'online', icon: Activity },
];

const typeIcons: Record<string, string> = { ticket: '💬', payment: '💰', verification: '🔍', system: '⚙️' };

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, employees, logout } = useStore();
  const { notifications, markRead, markAllRead, unreadCount } = useNotificationStore();
  const { lang } = useSettingsStore();
  const currentEmployee = employees.find(e => e.id === auth.employeeId);
  const unread = unreadCount();

  const handleNavClick = () => setMobileOpen(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`
        admin-sidebar flex flex-col flex-shrink-0 z-50
        fixed md:static inset-y-0 left-0 transition-all duration-200
        ${mobileOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-16' : 'md:w-60'}
      `}>
        <div className="h-14 flex items-center px-4 border-b border-white/10">
          {(!collapsed || mobileOpen) && <span className="text-lg font-bold text-primary-foreground tracking-wide">BrokerCRM</span>}
          <button onClick={() => { if (window.innerWidth < 768) setMobileOpen(false); else setCollapsed(!collapsed); }} className="ml-auto text-primary-foreground/60 hover:text-primary-foreground">
            {mobileOpen ? <X size={18} /> : collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navItems.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to) && item.to !== '/admin';
            return (
              <NavLink key={item.to} to={item.to} onClick={handleNavClick} className={`admin-sidebar-item ${isActive ? 'active' : ''}`}>
                <item.icon size={18} />
                {(!collapsed || mobileOpen) && <span>{t(lang, item.labelKey)}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          {(!collapsed || mobileOpen) && currentEmployee && (
            <div className="mb-2 px-2">
              <div className="text-sm font-medium text-primary-foreground">{currentEmployee.firstName} {currentEmployee.lastName}</div>
              <div className="text-xs text-primary-foreground/50">{currentEmployee.position}</div>
            </div>
          )}
          <div className="flex gap-2">
            <NavLink to="/admin/login" className="admin-sidebar-item text-xs flex-1 justify-center" onClick={() => { logout(); handleNavClick(); }}>
              <LogOut size={16} />
              {(!collapsed || mobileOpen) && <span>{t(lang, 'logout')}</span>}
            </NavLink>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} className="text-muted-foreground" /></button>
            <div className="text-sm text-muted-foreground">
              {t(lang, navItems.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== '/admin')?.labelKey || 'admin')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeLangToggle />
            <div className="relative">
              <button className="relative p-2 rounded-lg hover:bg-muted" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} className="text-muted-foreground" />
                {unread > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-lg border shadow-xl z-50 max-h-[70vh] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <span className="font-semibold text-sm">{t(lang, 'notifications')}</span>
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <CheckCheck size={12} /> {t(lang, 'readAll')}
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">{t(lang, 'noNotifications')}</div>
                      ) : (
                        notifications.slice(0, 20).map(n => (
                          <button
                            key={n.id}
                            className={`w-full text-left px-4 py-3 hover:bg-muted/50 border-b last:border-0 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                            onClick={() => { markRead(n.id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[n.type] || '📢'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{n.title}</span>
                                  {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                  {new Date(n.createdAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="hidden sm:block text-sm text-muted-foreground">{currentEmployee?.firstName} {currentEmployee?.lastName}</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto"><Outlet /></div>
      </main>
    </div>
  );
}
