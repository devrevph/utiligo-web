"use client";

import { useRouter } from "next/navigation";
import { create } from "zustand";
import { useUiStore } from "@/lib/stores/ui";
import { Icon } from "./icon";
import { Button, Dialog, cx } from "./primitives";

/* ---------------------------------------------------------------- Toasts */

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-lg"
        >
          <span
            className={cx(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              t.tone === "success" && "bg-success-tint text-success",
              t.tone === "error" && "bg-danger-tint text-danger",
              t.tone === "info" && "bg-accent-tint text-accent",
            )}
          >
            <Icon name={t.tone === "error" ? "alert" : t.tone === "success" ? "check" : "bell"} className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.body ? <p className="mt-0.5 text-sm text-muted">{t.body}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="rounded p-0.5 text-muted hover:text-ink"
            aria-label="Dismiss"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Confirm */

type ConfirmRequest = {
  title: string;
  body?: string;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  resolve: (ok: boolean) => void;
};

const useConfirmStore = create<{ request: ConfirmRequest | null }>(() => ({ request: null }));

/** Promise-based confirm, e.g. `if (await confirm({ title: "Delete?" })) …`. */
export function confirm(options: Omit<ConfirmRequest, "resolve">): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.setState({ request: { ...options, resolve } }));
}

export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  const settle = (ok: boolean) => {
    request?.resolve(ok);
    useConfirmStore.setState({ request: null });
  };
  return (
    <Dialog
      open={!!request}
      onClose={() => settle(false)}
      title={request?.title ?? ""}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => settle(false)}>
            Cancel
          </Button>
          <Button variant={request?.tone === "danger" ? "danger" : "primary"} onClick={() => settle(true)}>
            {request?.confirmLabel ?? "Confirm"}
          </Button>
        </>
      }
    >
      {request?.body ? <p className="text-sm text-muted">{request.body}</p> : null}
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Verify email gate */

export function VerifyEmailPrompt() {
  const message = useUiStore((s) => s.verifyEmailPrompt);
  const close = useUiStore((s) => s.closeVerifyEmailPrompt);
  const router = useRouter();
  return (
    <Dialog
      open={!!message}
      onClose={close}
      title="Verify your email"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Not now
          </Button>
          <Button
            icon="mail"
            onClick={() => {
              close();
              router.push("/verify-email");
            }}
          >
            Verify now
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Dialog>
  );
}
