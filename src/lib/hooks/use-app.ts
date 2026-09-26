"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { useUiStore } from "@/lib/stores/ui";

/** Runs `action` only for users with a verified email; otherwise shows the verify prompt. */
export function useRequireVerifiedEmail() {
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const open = useUiStore((s) => s.openVerifyEmailPrompt);
  return (message: string, action: () => void) => {
    if (emailVerified) action();
    else open(message);
  };
}

/** Calls `refetch` whenever an order-related notification arrives over the live stream. */
export function useOnOrderEvent(refetch: () => void) {
  const orderEventId = useNotificationsStore((s) => s.orderEventId);
  const latest = useRef(refetch);
  useEffect(() => {
    latest.current = refetch;
  });
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    latest.current();
  }, [orderEventId]);
}
