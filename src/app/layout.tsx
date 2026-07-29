import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Public_Sans } from "next/font/google";
import Link from "next/link";
import { BoltMark } from "@/components/icons";
import "./globals.css";

const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Utiligo — Everyday errands, delivered",
  description:
    "Order water refills, gas, laundry pickup, and garbage collection from local stations near you — delivered by motorcycle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${publicSans.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)]">
                <BoltMark className="h-4.5 w-4.5 text-white" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                Utiligo
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/#services" className="text-muted hover:text-ink transition-colors">
                Services
              </Link>
              <Link href="/#features" className="text-muted hover:text-ink transition-colors">
                Features
              </Link>
              <Link href="/#pricing" className="text-muted hover:text-ink transition-colors">
                Pricing
              </Link>
              <Link href="/privacy" className="text-muted hover:text-ink transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
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
      </body>
    </html>
  );
}
