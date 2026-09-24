"use client";

import { useEffect } from "react";
import { API_BASE_URL, getIdToken } from "@/lib/api";
import type { NotificationStreamEvent } from "@/lib/data/notifications";
import { ORDER_NOTIFICATION_TYPES } from "@/lib/data/orders";
import { useAuthStore } from "@/lib/stores/auth";
import { useNotificationsStore } from "@/lib/stores/notifications";

const MAX_RETRY_MS = 30_000;

/**
 * Keeps an SSE connection open while signed in so the bell (and any open
 * order list) updates the moment the server creates a notification.
 * EventSource can't send an Authorization header, so this reads the stream
 * with fetch instead.
 */
export function useNotificationsStream(): void {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);

  useEffect(() => {
    if (!uid) return;
    const store = useNotificationsStore.getState();
    void store.refreshUnreadCount();

    let stopped = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1_000;

    const handleFrame = (raw: string) => {
      try {
        const parsed = JSON.parse(raw) as NotificationStreamEvent;
        if (parsed.event === "notification" && parsed.notification) {
          const n = parsed.notification;
          useNotificationsStore.getState().applyIncoming(n, ORDER_NOTIFICATION_TYPES.has(n.type));
        }
      } catch {
        // ignore malformed frames
      }
    };

    const scheduleReconnect = () => {
      if (stopped) return;
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
    };

    async function connect() {
      if (stopped) return;
      controller = new AbortController();
      try {
        const token = await getIdToken();
        if (!token || stopped) return;
        const res = await fetch(`${API_BASE_URL}/notifications/stream`, {
          headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);

        retryDelay = 1_000;
        // Anything that arrived while disconnected isn't replayed by the stream.
        void useNotificationsStore.getState().refreshUnreadCount();

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        while (!stopped) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value.replace(/\r\n/g, "\n");
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const data = frame
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.replace(/^data:\s?/, ""))
              .join("\n");
            if (data) handleFrame(data);
          }
        }
      } catch {
        // network drop, abort, or auth error — reconnect below
      }
      scheduleReconnect();
    }

    void connect();

    // Browsers throttle background tabs, so resync the badge when the tab returns.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void useNotificationsStore.getState().refreshUnreadCount();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      controller?.abort();
      if (retryTimer) clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [uid]);
}
