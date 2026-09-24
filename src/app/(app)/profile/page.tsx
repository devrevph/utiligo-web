"use client";

import Link from "next/link";
import { useState } from "react";
import { LocationField } from "@/components/map/location-field";
import { Icon } from "@/components/ui/icon";
import { Badge, Button, Card, PageHeader, TextField } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { addressPayloadFromPick, updateUserProfile, type UpdateProfilePayload } from "@/lib/data/users";
import { useAuthStore } from "@/lib/stores/auth";
import { toast } from "@/lib/stores/ui";
import { formatAddress, type PickedAddress, type User } from "@/lib/types";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  // Keyed by account so a different sign-in starts from fresh form state.
  return <ProfileForm key={user.id} user={user} />;
}

function ProfileForm({ user }: { user: User }) {
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const setUser = useAuthStore((s) => s.setUser);
  const refreshEmailVerified = useAuthStore((s) => s.refreshEmailVerified);

  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    mobileNumber: user.mobileNumber ?? "",
  });
  const [location, setLocation] = useState<PickedAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return setError("Enter your first and last name.");
    if (!form.email.trim()) return setError("Enter your email.");
    if (!form.mobileNumber.trim()) return setError("Enter your mobile number.");
    setSaving(true);
    setError(null);
    try {
      const nextEmail = form.email.trim();
      const emailChanged = nextEmail !== user.email;
      const payload: UpdateProfilePayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: nextEmail,
        mobileNumber: form.mobileNumber.trim(),
        ...(location ? { address: addressPayloadFromPick(location) } : {}),
      };
      const updated = await updateUserProfile(payload);
      setLocation(null);
      if (emailChanged) {
        await refreshEmailVerified();
        toast({ tone: "success", title: "Profile saved", body: "You changed your email — please verify it again." });
      } else {
        toast({ tone: "success", title: "Profile saved" });
      }
      setUser(updated);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <title>Profile · Utiligo</title>
      <PageHeader title="Profile" subtitle="Your account details and delivery address." />
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="font-semibold text-ink">Personal details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} />
            <TextField label="Last name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} />
          </div>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            hint={
              <span className="inline-flex items-center gap-2">
                {emailVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge>}
                {!emailVerified ? (
                  <Link href="/verify-email" className="font-medium text-accent hover:underline">
                    Verify now
                  </Link>
                ) : null}
              </span>
            }
          />
          <TextField label="Mobile number" type="tel" autoComplete="tel" value={form.mobileNumber} onChange={set("mobileNumber")} />
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="font-semibold text-ink">Delivery address</h2>
          <LocationField
            label="Home / delivery location"
            required
            value={location}
            onChange={setLocation}
            currentLabel={formatAddress(user.address)}
            initial={user.address}
            pickerTitle="Your address"
          />
        </Card>

        <div className="flex flex-col items-start gap-3 lg:col-span-2">
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" loading={saving} icon="check">
            Save profile
          </Button>
        </div>
      </form>

      <Link
        href="/settings"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm transition-colors hover:border-border-strong"
      >
        <Icon name="settings" className="h-5 w-5 text-muted" />
        <span className="flex-1">
          <span className="block font-medium text-ink">Settings</span>
          <span className="text-muted">Delete your business or account</span>
        </span>
        <Icon name="chevron-right" className="h-4 w-4 text-muted" />
      </Link>
    </>
  );
}
