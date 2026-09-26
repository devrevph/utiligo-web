"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConfigError } from "@/components/app/config-error";
import { BoltMark } from "@/components/icons";
import { Toaster } from "@/components/ui/feedback";
import { nextPathFromLocation } from "@/lib/navigation";
import { missingFirebaseConfig } from "@/lib/firebase";
import { startAuthListener, useAuthStore } from "@/lib/stores/auth";

const MISSING_CONFIG = missingFirebaseConfig();

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (MISSING_CONFIG.length > 0) return <ConfigError missing={MISSING_CONFIG} />;
  return <AuthLayoutInner>{children}</AuthLayoutInner>;
}

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const hasProfile = useAuthStore((s) => !!s.user);

  useEffect(() => {
    startAuthListener();
  }, []);

  // Wait for the profile, not just the Firebase session: during signup the
  // session exists before the backend profile does.
  useEffect(() => {
    if (status === "signedIn" && hasProfile) router.replace(nextPathFromLocation());
  }, [status, hasProfile, router]);

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/15">
            <BoltMark className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">Utiligo</span>
        </Link>
        <div>
          <p className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight">
            Everyday errands,
            <br />
            delivered.
          </p>
          <p className="mt-5 max-w-sm text-white/80">
            Water refills, LPG, laundry pickup, and garbage collection from merchants in your neighborhood.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Local delivery · Philippines</p>
      </aside>

      <main className="flex min-w-0 flex-col px-4 py-8 sm:px-8">
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)]">
            <BoltMark className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">Utiligo</span>
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
