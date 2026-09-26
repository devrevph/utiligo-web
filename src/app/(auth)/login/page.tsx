"use client";

import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { errorMessage } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth";
import { Button, PasswordField, TextField } from "@/components/ui/primitives";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const profileError = useAuthStore((s) => s.profileError);
  const status = useAuthStore((s) => s.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // The auth layout redirects once the listener has loaded the profile.
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password"
          ? "Invalid email or password."
          : code === "auth/invalid-email"
            ? "Enter a valid email address."
            : errorMessage(err, "Something went wrong. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const signedInWithoutProfile = status === "signedIn" && !!profileError;

  return (
    <>
      <title>Sign in · Utiligo</title>
      <h1 className="font-display text-4xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted">Sign in to order from merchants near you or manage your business.</p>

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
        <div className="flex flex-col gap-1.5">
          <PasswordField
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link href="/forgot-password" className="self-end text-sm font-medium text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

        {error || signedInWithoutProfile ? (
          <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
            {error ?? profileError}
          </p>
        ) : null}

        <Button
          type="submit"
          block
          loading={submitting || (status === "signedIn" && !profileError)}
          disabled={!email.trim() || !password}
          className="mt-2 py-3"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to Utiligo?{" "}
        <Link href="/signup" className="font-semibold text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
