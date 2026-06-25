import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications: ({ notifications, unreadCount }) => set({ notifications, unreadCount }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 30),
      unreadCount:   s.unreadCount + 1,
    })),

  markRead: (id) =>
    set((s) => {
      const was = s.notifications.find((n) => n._id === id || n.tempId === id);
      return {
        notifications: s.notifications.map((n) =>
          n._id === id || n.tempId === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - (was?.read ? 0 : 1)),
      };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount:   0,
    })),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
