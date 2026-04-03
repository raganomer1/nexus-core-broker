import {
  Activity,
  BarChart3,
  Building2,
  Clock,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export type PermissionItem = { k: string; l: string };
export type PermissionGroup = { key: string; perms: PermissionItem[] };

export const rolePermissionGroups: PermissionGroup[] = [
  { key: 'Основное', perms: [{ k: 'main.view', l: 'Дашборд' }] },
  { key: 'CRM', perms: [{ k: 'crm.view', l: 'Просмотр CRM' }, { k: 'crm.edit', l: 'Редактирование CRM' }] },
  {
    key: 'Клиенты',
    perms: [
      { k: 'clients.view', l: 'Просмотр' },
      { k: 'clients.create', l: 'Создание' },
      { k: 'clients.edit', l: 'Редактирование' },
      { k: 'clients.delete', l: 'Удаление' },
      { k: 'clients.viewContacts', l: 'Контакты' },
      { k: 'clients.loginCabinet', l: 'Вход в кабинет' },
      { k: 'clients.export', l: 'Экспорт' },
      { k: 'clients.import', l: 'Импорт' },
    ],
  },
  {
    key: 'Сотрудники',
    perms: [
      { k: 'employees.view', l: 'Просмотр' },
      { k: 'employees.create', l: 'Создание' },
      { k: 'employees.edit', l: 'Редактирование' },
      { k: 'employees.delete', l: 'Удаление' },
    ],
  },
  {
    key: 'Торговые счета',
    perms: [
      { k: 'accounts.view', l: 'Просмотр' },
      { k: 'accounts.create', l: 'Создание' },
      { k: 'accounts.edit', l: 'Редактирование' },
      { k: 'accounts.deposit', l: 'Пополнение / вывод' },
    ],
  },
  {
    key: 'Торговля',
    perms: [
      { k: 'trading.view', l: 'Просмотр' },
      { k: 'trading.edit', l: 'Редактирование' },
      { k: 'trading.close', l: 'Закрытие позиций' },
    ],
  },
  {
    key: 'Активы и котировки',
    perms: [
      { k: 'assets.view', l: 'Просмотр' },
      { k: 'assets.edit', l: 'Редактирование' },
      { k: 'assets.priceOverride', l: 'Ручные котировки' },
      { k: 'assets.commission', l: 'Комиссия' },
      { k: 'assets.swap', l: 'Свопы' },
      { k: 'assets.margin', l: 'Маржа' },
      { k: 'assets.stopLevel', l: 'Stop level' },
      { k: 'assets.tradingToggle', l: 'Переключение торговли' },
    ],
  },
  {
    key: 'Платежи',
    perms: [
      { k: 'payments.view', l: 'Просмотр' },
      { k: 'payments.approve', l: 'Подтверждение' },
      { k: 'payments.reject', l: 'Отклонение / удаление' },
    ],
  },
  {
    key: 'Верификация',
    perms: [
      { k: 'verification.view', l: 'Просмотр' },
      { k: 'verification.approve', l: 'Подтверждение / возврат' },
      { k: 'verification.reject', l: 'Отклонение' },
      { k: 'verification.ban', l: 'Блокировка' },
    ],
  },
  {
    key: 'Поддержка',
    perms: [
      { k: 'support.view', l: 'Просмотр' },
      { k: 'support.respond', l: 'Ответ / изменение / удаление' },
    ],
  },
  {
    key: 'Действия и история',
    perms: [
      { k: 'actions.view', l: 'Просмотр действий' },
      { k: 'actions.edit', l: 'Создание / редактирование действий' },
      { k: 'actions.delete', l: 'Удаление действий' },
      { k: 'history.view', l: 'История' },
      { k: 'notes.view', l: 'Просмотр заметок' },
      { k: 'notes.create', l: 'Создание заметок' },
    ],
  },
  { key: 'Дески', perms: [{ k: 'desks.view', l: 'Просмотр' }, { k: 'desks.edit', l: 'Редактирование' }] },
  { key: 'Отчеты', perms: [{ k: 'reports.view', l: 'Просмотр отчетов' }] },
  {
    key: 'Настройки и безопасность',
    perms: [
      { k: 'settings.view', l: 'Просмотр настроек' },
      { k: 'settings.edit', l: 'Изменение настроек и ролей' },
      { k: 'security.view', l: 'Просмотр безопасности' },
      { k: 'security.edit', l: 'Изменение безопасности' },
    ],
  },
];

export const ADMIN_ROUTE_PERMISSIONS = {
  dashboard: ['main.view'],
  clients: ['clients.view'],
  leads: ['crm.view', 'clients.view'],
  accounts: ['accounts.view'],
  payments: ['payments.view'],
  trading: ['trading.view'],
  assets: ['assets.view'],
  prices: ['assets.view'],
  history: ['history.view'],
  employees: ['employees.view'],
  roles: ['settings.view'],
  desks: ['desks.view'],
  verification: ['verification.view'],
  support: ['support.view'],
  reports: ['reports.view'],
  settings: ['settings.view'],
  online: ['main.view'],
} as const;

export const adminNavItems: {
  to: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  permissions: readonly string[];
  exact?: boolean;
}[] = [
  { to: '/admin', labelKey: 'dashboard', icon: LayoutDashboard, permissions: ADMIN_ROUTE_PERMISSIONS.dashboard, exact: true },
  { to: '/admin/clients', labelKey: 'clients', icon: Users, permissions: ADMIN_ROUTE_PERMISSIONS.clients },
  { to: '/admin/leads', labelKey: 'leads', icon: Users, permissions: ADMIN_ROUTE_PERMISSIONS.leads },
  { to: '/admin/accounts', labelKey: 'accounts', icon: CreditCard, permissions: ADMIN_ROUTE_PERMISSIONS.accounts },
  { to: '/admin/payments', labelKey: 'payments', icon: CreditCard, permissions: ADMIN_ROUTE_PERMISSIONS.payments },
  { to: '/admin/trading', labelKey: 'trading', icon: TrendingUp, permissions: ADMIN_ROUTE_PERMISSIONS.trading },
  { to: '/admin/assets', labelKey: 'assets', icon: Activity, permissions: ADMIN_ROUTE_PERMISSIONS.assets },
  { to: '/admin/prices', labelKey: 'prices', icon: BarChart3, permissions: ADMIN_ROUTE_PERMISSIONS.prices },
  { to: '/admin/history', labelKey: 'history', icon: Clock, permissions: ADMIN_ROUTE_PERMISSIONS.history },
  { to: '/admin/employees', labelKey: 'employees', icon: UserCog, permissions: ADMIN_ROUTE_PERMISSIONS.employees },
  { to: '/admin/desks', labelKey: 'desks', icon: Building2, permissions: ADMIN_ROUTE_PERMISSIONS.desks },
  { to: '/admin/verification', labelKey: 'verification', icon: ShieldCheck, permissions: ADMIN_ROUTE_PERMISSIONS.verification },
  { to: '/admin/support', labelKey: 'support', icon: MessageSquare, permissions: ADMIN_ROUTE_PERMISSIONS.support },
  { to: '/admin/reports', labelKey: 'reports', icon: BarChart3, permissions: ADMIN_ROUTE_PERMISSIONS.reports },
  { to: '/admin/settings', labelKey: 'settings', icon: Settings, permissions: ADMIN_ROUTE_PERMISSIONS.settings },
  { to: '/admin/online', labelKey: 'online', icon: Activity, permissions: ADMIN_ROUTE_PERMISSIONS.online },
];

export const getFirstAllowedAdminPath = (canAccess: (permissions: readonly string[]) => boolean) => {
  const firstAllowed = adminNavItems.find(item => canAccess(item.permissions));
  return firstAllowed?.to || '/admin';
};