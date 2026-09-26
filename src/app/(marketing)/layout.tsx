import Link from "next/link";
import { BoltMark } from "@/components/icons";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)]">
              <BoltMark className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">Utiligo</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/#services" className="hidden text-muted hover:text-ink transition-colors md:inline">
              Services
            </Link>
            <Link href="/#features" className="hidden text-muted hover:text-ink transition-colors md:inline">
              Features
            </Link>
            <Link href="/#pricing" className="hidden text-muted hover:text-ink transition-colors md:inline">
              Pricing
            </Link>
            <Link href="/login" className="text-muted hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-accent px-3.5 py-2 text-white transition-colors hover:bg-accent-strong"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <BoltMark className="h-3.5 w-3.5 text-accent" />
            <span>Utiligo</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="/delete-account" className="hover:text-ink transition-colors">
              Delete Account
            </Link>
            <span className="font-mono text-xs">&copy; 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
