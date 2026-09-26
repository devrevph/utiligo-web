"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BoltMark } from "@/components/icons";
import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/components/ui/primitives";
import { useRequireVerifiedEmail } from "@/lib/hooks/use-app";
import { useAuthStore } from "@/lib/stores/auth";
import { useMerchantStore } from "@/lib/stores/merchant";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { NotificationsPanel } from "./notifications-panel";

type NavItem = { href: string; label: string; icon: IconName; match: (p: string) => boolean };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logOut = useAuthStore((s) => s.logOut);
  const merchant = useMerchantStore((s) => s.merchant);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const requireVerified = useRequireVerifiedEmail();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const nav: NavItem[] = [
    { href: "/home", label: "Home", icon: "home", match: (p) => p === "/home" || p.startsWith("/services") },
    { href: "/orders", label: "My orders", icon: "receipt", match: (p) => p.startsWith("/orders") },
    ...(merchant
      ? [{ href: "/merchant", label: "Business", icon: "store" as const, match: (p: string) => p.startsWith("/merchant") }]
      : []),
  ];

  const handleLogout = async () => {
    await logOut();
    router.replace("/login");
  };

  const goRegister = () =>
    requireVerified("Only verified users can register a merchant.", () => router.push("/merchant/register"));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)]">
              <BoltMark className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">Utiligo</span>
          </Link>

          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.match(pathname) ? "page" : undefined}
                className={cx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.match(pathname) ? "bg-accent-tint text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            >
              <Icon name="bell" className="h-5.5 w-5.5" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>
            <AccountMenu
              name={user ? `${user.firstName} ${user.lastName}` : ""}
              email={user?.email ?? ""}
              hasMerchant={!!merchant}
              onRegister={goRegister}
              onLogout={() => void handleLogout()}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-8">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md">
          {[...nav, { href: "/profile", label: "Account", icon: "user" as const, match: (p: string) => p === "/profile" || p === "/settings" }].map(
            (item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                    active ? "text-accent" : "text-muted",
                  )}
                >
                  <Icon name={item.icon} className="h-5.5 w-5.5" />
                  {item.label}
                </Link>
              );
            },
          )}
        </div>
      </nav>

      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}

function AccountMenu({
  name,
  email,
  hasMerchant,
  onRegister,
  onLogout,
}: {
  name: string;
  email: string;
  hasMerchant: boolean;
  onRegister: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const itemClass = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-surface-2";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)] text-sm font-semibold text-white"
        aria-label="Account menu"
      >
        {initials || <Icon name="user" className="h-4.5 w-4.5" />}
      </button>
      {open ? (
        <div role="menu" onClick={() => setOpen(false)} className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{name || "Your account"}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <div className="my-1 border-t border-border" />
          <Link role="menuitem" href="/profile" className={itemClass}>
            <Icon name="user" className="h-4.5 w-4.5 text-muted" /> My profile
          </Link>
          <Link role="menuitem" href="/orders" className={itemClass}>
            <Icon name="history" className="h-4.5 w-4.5 text-muted" /> Order history
          </Link>
          {hasMerchant ? (
            <Link role="menuitem" href="/merchant/profile" className={itemClass}>
              <Icon name="building" className="h-4.5 w-4.5 text-muted" /> Business profile
            </Link>
          ) : (
            <button role="menuitem" type="button" onClick={onRegister} className={itemClass}>
              <Icon name="building" className="h-4.5 w-4.5 text-muted" /> Register a merchant
            </button>
          )}
          <Link role="menuitem" href="/settings" className={itemClass}>
            <Icon name="settings" className="h-4.5 w-4.5 text-muted" /> Settings
          </Link>
          <div className="my-1 border-t border-border" />
          <button role="menuitem" type="button" onClick={onLogout} className={cx(itemClass, "text-danger")}>
            <Icon name="logout" className="h-4.5 w-4.5" /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
