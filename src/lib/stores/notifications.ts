"use client";

import { create } from "zustand";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/data/notifications";

type NotificationsState = {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  /** Bumped for every order-related notification so open lists can refetch. */
  orderEventId: number;
  refreshUnreadCount: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  applyIncoming: (notification: AppNotification, isOrderEvent: boolean) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  orderEventId: 0,

  refreshUnreadCount: async () => {
    try {
      set({ unreadCount: await fetchUnreadNotificationCount() });
    } catch {
      // keep the last known count
    }
  },

  loadNotifications: async () => {
    set({ loading: true });
    try {
      const items = await fetchNotifications(50);
      set({ items });
      await get().refreshUnreadCount();
    } catch {
      // keep what's already shown
    } finally {
      set({ loading: false });
    }
  },

  applyIncoming: (notification, isOrderEvent) => {
    set((state) => {
      const exists = state.items.some((n) => n.id === notification.id);
      const items = exists
        ? state.items.map((n) => (n.id === notification.id ? { ...n, ...notification } : n))
        : [notification, ...state.items].slice(0, 50);
      const unreadCount = !exists && !notification.readAt ? state.unreadCount + 1 : state.unreadCount;
      return {
        items,
        unreadCount,
        orderEventId: isOrderEvent ? state.orderEventId + 1 : state.orderEventId,
      };
    });
  },

  markRead: async (id) => {
    const wasUnread = !get().items.find((n) => n.id === id)?.readAt;
    try {
      const updated = await markNotificationRead(id);
      set((state) => ({
        items: state.items.map((n) => (n.id === id ? updated : n)),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }));
    } catch {
      await get().loadNotifications();
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      set((state) => ({
        items: state.items.map((n) => ({ ...n, readAt: n.readAt ?? now })),
        unreadCount: 0,
      }));
    } catch {
      await get().loadNotifications();
    }
  },

  reset: () => set({ items: [], unreadCount: 0, loading: false, orderEventId: 0 }),
}));
