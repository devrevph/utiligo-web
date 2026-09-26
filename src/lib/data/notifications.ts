import { api } from "@/lib/api";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, string> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationStreamEvent =
  | { event: "notification"; notification: AppNotification }
  | { event: "ping" }
  | { event: string; notification?: undefined };

export async function fetchNotifications(limit = 50): Promise<AppNotification[]> {
  const data = await api.get<AppNotification[]>(`/notifications?limit=${limit}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const data = await api.get<{ count?: number }>("/notifications/unread-count");
  return typeof data?.count === "number" ? data.count : 0;
}

export const markNotificationRead = (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`, {});
export const markAllNotificationsRead = () => api.patch<unknown>("/notifications/read-all", {});

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
