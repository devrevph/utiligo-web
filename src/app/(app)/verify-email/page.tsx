"use client";

import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonLink, Card } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth";
import { toast } from "@/lib/stores/ui";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const email = useAuthStore((s) => s.firebaseUser?.email);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const refreshEmailVerified = useAuthStore((s) => s.refreshEmailVerified);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const autoSent = useRef(false);

  // Send one email on arrival so the user doesn't have to click first.
  useEffect(() => {
    const current = getFirebaseAuth().currentUser;
    if (autoSent.current || !current || current.emailVerified) return;
    autoSent.current = true;
    sendEmailVerification(current).catch(() => {
      // Silent — "Resend" is right there.
    });
    const start = setTimeout(() => setCooldown(RESEND_COOLDOWN_SECONDS), 0);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resend = async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current || cooldown > 0) return;
    setSending(true);
    setNotice(null);
    try {
      await sendEmailVerification(current);
      setNotice("Verification email sent — check your inbox and spam folder.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setNotice(errorMessage(e, "Couldn't send the email. Try again shortly."));
    } finally {
      setSending(false);
    }
  };

  const check = async () => {
    setChecking(true);
    setNotice(null);
    try {
      if (await refreshEmailVerified()) {
        toast({ tone: "success", title: "Email verified", body: "You can now request services." });
        router.replace("/home");
      } else {
        setNotice("Still not verified — open the link in the email we sent, then try again.");
      }
    } catch (e) {
      setNotice(errorMessage(e, "Couldn't check verification status. Try again."));
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <title>Verify email · Utiligo</title>
      <Card className="mx-auto mt-4 flex max-w-lg flex-col items-center text-center sm:p-10">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-tint text-accent">
          <Icon name={emailVerified ? "check-circle" : "mail"} className="h-7 w-7" />
        </span>
        {emailVerified ? (
          <>
            <h1 className="font-display text-3xl font-bold tracking-tight">Your email is verified</h1>
            <p className="mt-2 text-muted">You&apos;re all set to request services.</p>
            <ButtonLink href="/home" className="mt-6">
              Go to home
            </ButtonLink>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold tracking-tight">Check your inbox</h1>
            <p className="mt-2 text-muted">
              We sent a verification link to <span className="font-medium text-ink">{email ?? "your email"}</span>. Open it, then
              come back and click &ldquo;I&apos;ve verified&rdquo;.
            </p>
            {notice ? (
              <p role="status" className="mt-4 rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-ink">
                {notice}
              </p>
            ) : null}
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button icon="check" loading={checking} onClick={() => void check()}>
                I&apos;ve verified
              </Button>
              <Button variant="secondary" loading={sending} disabled={cooldown > 0} onClick={() => void resend()}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
