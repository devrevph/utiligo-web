"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { useState } from "react";
import { errorMessage } from "@/lib/api";
import { addressPayloadFromPick, createUserProfile } from "@/lib/data/users";
import { getFirebaseAuth } from "@/lib/firebase";
import { setSigningUp, useAuthStore } from "@/lib/stores/auth";
import type { PickedAddress } from "@/lib/types";
import { LocationField } from "@/components/map/location-field";
import { Button, PasswordField, TextAreaField, TextField } from "@/components/ui/primitives";

const MIN_PASSWORD = 6;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    deliveryNotes: "",
  });
  const [location, setLocation] = useState<PickedAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const passwordMismatch = form.confirmPassword !== "" && form.password !== form.confirmPassword;
  const missing = {
    firstName: !form.firstName.trim(),
    lastName: !form.lastName.trim(),
    email: !form.email.trim(),
    mobileNumber: !form.mobileNumber.trim(),
    password: form.password.length < MIN_PASSWORD,
    location: !location,
  };
  const isValid = !Object.values(missing).some(Boolean) && !passwordMismatch && !!form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid || !location) return;
    setSubmitting(true);
    setError(null);
    setSigningUp(true);

    const auth = getFirebaseAuth();
    const email = form.email.trim();
    try {
      // If a previous attempt created the Firebase account but failed to save
      // the profile, reuse that account instead of hitting email-already-in-use.
      let firebaseUser = auth.currentUser;
      if (!firebaseUser || firebaseUser.email?.toLowerCase() !== email.toLowerCase()) {
        const cred = await createUserWithEmailAndPassword(auth, email, form.password);
        firebaseUser = cred.user;
        await updateProfile(firebaseUser, {
          displayName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        });
      }

      const profile = await createUserProfile({
        email: firebaseUser.email,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: addressPayloadFromPick(location, form.deliveryNotes),
      });
      useAuthStore.getState().setUser(profile);

      sendEmailVerification(firebaseUser).catch(() => {
        // Non-fatal — the verify-email page can resend.
      });
      router.replace("/home");
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === "auth/email-already-in-use"
          ? "An account with this email already exists. Try signing in instead."
          : code === "auth/weak-password"
            ? `Password is too weak. Use at least ${MIN_PASSWORD} characters.`
            : code === "auth/invalid-email"
              ? "Enter a valid email address."
              : errorMessage(err, "Couldn't create your account. Please try again."),
      );
    } finally {
      setSigningUp(false);
      setSubmitting(false);
    }
  };

  const req = (bad: boolean, msg: string) => (attempted && bad ? msg : null);

  return (
    <>
      <title>Create account · Utiligo</title>
      <h1 className="font-display text-4xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted">Order from local merchants, or register your own business later.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6" noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">About you</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="First name"
              autoComplete="given-name"
              value={form.firstName}
              onChange={set("firstName")}
              error={req(missing.firstName, "Enter your first name.")}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              value={form.lastName}
              onChange={set("lastName")}
              error={req(missing.lastName, "Enter your last name.")}
            />
          </div>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={set("email")}
            error={req(missing.email, "Enter your email.")}
          />
          <TextField
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            placeholder="09xx xxx xxxx"
            value={form.mobileNumber}
            onChange={set("mobileNumber")}
            error={req(missing.mobileNumber, "Enter your mobile number.")}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Password</legend>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            hint={`At least ${MIN_PASSWORD} characters.`}
            error={req(missing.password, `Use at least ${MIN_PASSWORD} characters.`)}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            error={passwordMismatch ? "Passwords don't match." : req(!form.confirmPassword, "Confirm your password.")}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Delivery address</legend>
          <LocationField
            label="Home / delivery location"
            required
            value={location}
            onChange={setLocation}
            pickerTitle="Pin your address"
            error={req(missing.location, "Pin your address so merchants can find you.")}
          />
          <TextAreaField
            label="Notes for riders"
            optional
            placeholder="e.g. Blue gate, 2nd floor"
            value={form.deliveryNotes}
            onChange={set("deliveryNotes")}
          />
        </fieldset>

        {error ? (
          <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" block loading={submitting} className="py-3">
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
