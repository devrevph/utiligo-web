"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/app/app-shell";
import { BoltMark } from "@/components/icons";
import { ConfirmHost, Toaster, VerifyEmailPrompt } from "@/components/ui/feedback";
import { Button, ButtonLink, Spinner } from "@/components/ui/primitives";
import { useNotificationsStream } from "@/lib/hooks/use-notifications-stream";
import { startAuthListener, useAuthStore } from "@/lib/stores/auth";
import { useMerchantStore } from "@/lib/stores/merchant";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const profileError = useAuthStore((s) => s.profileError);
  const loadProfile = useAuthStore((s) => s.loadProfile);
  const logOut = useAuthStore((s) => s.logOut);
  const merchantLoaded = useMerchantStore((s) => s.merchant !== undefined);
  const refreshMerchant = useMerchantStore((s) => s.refresh);

  useEffect(() => {
    startAuthListener();
  }, []);

  useEffect(() => {
    if (status === "signedOut") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  useEffect(() => {
    if (user && !merchantLoaded) void refreshMerchant();
  }, [user, merchantLoaded, refreshMerchant]);

  useNotificationsStream();

  if (status === "signedIn" && !user && profileError) {
    return (
      <FullScreen>
        <h1 className="font-display text-3xl font-bold tracking-tight">Almost there</h1>
        <p className="mt-2 max-w-sm text-muted">{profileError}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button icon="refresh" onClick={() => void loadProfile()}>
            Try again
          </Button>
          <ButtonLink href="/signup" variant="secondary">
            Finish signing up
          </ButtonLink>
          <Button
            variant="ghost"
            onClick={() => {
              void logOut().then(() => router.replace("/login"));
            }}
          >
            Sign out
          </Button>
        </div>
      </FullScreen>
    );
  }

  if (status !== "signedIn" || !user) {
    return (
      <FullScreen>
        <Spinner className="h-7 w-7 text-accent" />
      </FullScreen>
    );
  }

  return (
    <>
      <AppShell>{children}</AppShell>
      <VerifyEmailPrompt />
      <ConfirmHost />
      <Toaster />
    </>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)]">
        <BoltMark className="h-6 w-6 text-white" />
      </span>
      {children}
    </div>
  );
}
