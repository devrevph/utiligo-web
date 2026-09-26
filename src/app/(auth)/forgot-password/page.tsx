"use client";

import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { errorMessage } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import { Icon } from "@/components/ui/icon";
import { Button, TextField } from "@/components/ui/primitives";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setSent(true);
    } catch (err) {
      const code = (err as { code?: string }).code;
      // Don't reveal whether an account exists for this email.
      if (code === "auth/user-not-found" || code === "auth/invalid-email") setSent(true);
      else setError(errorMessage(err, "Couldn't send the reset email. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <title>Reset password · Utiligo</title>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <Icon name="chevron-left" className="h-4 w-4" />
        Back to sign in
      </Link>

      {sent ? (
        <div>
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success">
            <Icon name="mail" className="h-6 w-6" />
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-2 text-muted">
            If an account exists for <span className="font-medium text-ink">{email.trim()}</span>, we sent a link to
            reset your password. Check your spam folder too.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-4xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="mt-2 text-muted">Enter your email and we&apos;ll send you a link to reset it.</p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
            <Button type="submit" block loading={submitting} disabled={!email.trim()} className="py-3">
              Send reset link
            </Button>
          </form>
        </>
      )}
    </>
  );
}
