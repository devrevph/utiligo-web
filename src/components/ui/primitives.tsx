"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "./icon";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- Button */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[var(--btn,var(--accent))] text-on-accent hover:brightness-110",
  secondary: "border border-border-strong bg-surface text-ink hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-on-accent hover:brightness-110",
  "danger-outline": "border border-danger text-danger hover:bg-danger-tint",
};

type ButtonProps = {
  variant?: ButtonVariant;
  /** CSS color for primary buttons, e.g. "var(--gas)". */
  tone?: string;
  loading?: boolean;
  icon?: IconName;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  tone,
  loading,
  icon,
  block,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], block && "w-full", className)}
      style={tone ? ({ "--btn": tone } as CSSProperties) : undefined}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon ? <Icon name={icon} className="h-4.5 w-4.5" /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  tone,
  icon,
  block,
  className,
  children,
}: ButtonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], block && "w-full", className)}
      style={tone ? ({ "--btn": tone } as CSSProperties) : undefined}
    >
      {icon ? <Icon name={icon} className="h-4.5 w-4.5" /> : null}
      {children}
    </Link>
  );
}

export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx("inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-80", className)}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex justify-center py-16 text-accent">
      <Spinner />
    </div>
  );
}

/* ---------------------------------------------------------------- Form fields */

const INPUT_CLASS =
  "w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-60";

type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
};

export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
      </label>
      {children(id, describedBy)}
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  ...input
}: Omit<FieldProps, "children"> & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={INPUT_CLASS}
          {...input}
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  optional,
  className,
  ...input
}: Omit<FieldProps, "children"> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(id, describedBy) => (
        <textarea
          id={id}
          rows={3}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cx(INPUT_CLASS, "resize-y")}
          {...input}
        />
      )}
    </Field>
  );
}

export function PasswordField({
  label,
  hint,
  error,
  className,
  ...input
}: Omit<FieldProps, "children" | "optional"> & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(id, describedBy) => (
        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={cx(INPUT_CLASS, "pr-11")}
            {...input}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            <Icon name={visible ? "eye-off" : "eye"} className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </Field>
  );
}

/** Mutually exclusive options rendered as pill buttons (a radio group). */
export function ChoiceChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
  tone,
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  tone?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <label
              key={String(o.value)}
              className={cx(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                on ? "border-[var(--chip)] bg-[var(--chip-tint)] text-[var(--chip)]" : "border-border-strong text-muted hover:text-ink",
              )}
              style={
                {
                  "--chip": tone ?? "var(--accent)",
                  "--chip-tint": "color-mix(in srgb, var(--chip) 12%, transparent)",
                } as CSSProperties
              }
            >
              <input type="radio" className="sr-only" checked={on} onChange={() => onChange(o.value)} />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  tone,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  tone?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted">{description}</span> : null}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60",
          checked ? "bg-[var(--sw)]" : "bg-border-strong",
        )}
        style={{ "--sw": tone ?? "var(--accent)" } as CSSProperties}
      >
        <span
          className={cx(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- Layout bits */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-2xl border border-border bg-surface p-5 sm:p-6", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl font-bold tracking-tight text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => unknown }) {
  const [retrying, setRetrying] = useState(false);
  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
    }
  };
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-tint text-warning">
        <Icon name="alert" className="h-6 w-6" />
      </span>
      <p className="max-w-sm text-sm text-ink">{message}</p>
      {onRetry ? (
        <Button variant="secondary" icon="refresh" className="mt-4" loading={retrying} onClick={() => void retry()}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  info: "bg-accent-tint text-accent",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", BADGE_TONES[tone])}>
      {children}
    </span>
  );
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-border py-2.5 text-sm last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

/* ---------------------------------------------------------------- Dialog */

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** False while a request is in flight, so Esc/backdrop can't close mid-save. */
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && dismissible) onClose();
      }}
      className={cx(
        "m-auto max-h-[min(90dvh,56rem)] w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50",
        widths[size],
      )}
    >
      {open ? (
        <div className="flex max-h-[min(90dvh,56rem)] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-ink">
                {title}
              </h2>
              {description ? <div className="mt-0.5 text-sm text-muted">{description}</div> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={!dismissible}
              className="-mr-1 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40"
              aria-label="Close"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
