"use client";

import { create } from "zustand";

export type Toast = { id: number; tone: "success" | "error" | "info"; title: string; body?: string };

type UiState = {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  /** Message for the "verify your email" prompt; null when closed. */
  verifyEmailPrompt: string | null;
  openVerifyEmailPrompt: (message: string) => void;
  closeVerifyEmailPrompt: () => void;
  /** Set when a notification asks to open an order; the matching page consumes and clears it. */
  pendingOrder: { scope: "customer" | "merchant"; orderId: string } | null;
  requestOpenOrder: (scope: "customer" | "merchant", orderId: string) => void;
  clearPendingOrder: () => void;
};

let nextToastId = 1;

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = nextToastId++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), t.tone === "error" ? 7000 : 4500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

  verifyEmailPrompt: null,
  openVerifyEmailPrompt: (message) => set({ verifyEmailPrompt: message }),
  closeVerifyEmailPrompt: () => set({ verifyEmailPrompt: null }),

  pendingOrder: null,
  requestOpenOrder: (scope, orderId) => set({ pendingOrder: { scope, orderId } }),
  clearPendingOrder: () => set({ pendingOrder: null }),
}));

export const toast = (t: Omit<Toast, "id">) => useUiStore.getState().toast(t);
