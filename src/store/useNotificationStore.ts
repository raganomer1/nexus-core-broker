import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'ticket' | 'payment' | 'verification' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

let nId = 5000;

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    { id: 'n1', type: 'ticket', title: 'Новое обращение', message: 'Клиент Смирнов А. создал обращение #T001', read: false, link: '/admin/support', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'n2', type: 'payment', title: 'Новый платёж', message: 'Депозит $5000 от Козлова Н. ожидает одобрения', read: false, link: '/admin/payments', createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: 'n3', type: 'payment', title: 'Новый платёж', message: 'Вывод $1200 от Смирнова А. ожидает одобрения', read: true, link: '/admin/payments', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  addNotification: (n) => {
    const notification: AppNotification = { ...n, id: `n_${++nId}`, read: false, createdAt: new Date().toISOString() };
    set(s => ({ notifications: [notification, ...s.notifications] }));
  },
  markRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
  unreadCount: () => get().notifications.filter(n => !n.read).length,
}));
