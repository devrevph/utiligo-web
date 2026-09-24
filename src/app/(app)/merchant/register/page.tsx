"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ServiceGlyph } from "@/components/app/service-glyph";
import { LocationField } from "@/components/map/location-field";
import { OperatingHoursEditor } from "@/components/merchant/operating-hours-editor";
import { Button, ButtonLink, Card, EmptyState, PageHeader, PageSpinner, TextAreaField, TextField, cx } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import {
  DEFAULT_OPERATING_HOURS,
  createMerchant,
  isValidOperatingHours,
  listMerchantServices,
  type MerchantService,
} from "@/lib/data/merchants";
import { addressPayloadFromPick } from "@/lib/data/users";
import { serviceForTitle } from "@/lib/service-config";
import { useAuthStore } from "@/lib/stores/auth";
import { useMerchantStore } from "@/lib/stores/merchant";
import { toast } from "@/lib/stores/ui";
import type { PickedAddress } from "@/lib/types";

export default function RegisterMerchantPage() {
  const router = useRouter();
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const merchant = useMerchantStore((s) => s.merchant);
  const setMerchant = useMerchantStore((s) => s.setMerchant);

  const [services, setServices] = useState<MerchantService[] | null>(null);
  const [form, setForm] = useState({ name: "", description: "", mobileNumber: "", telephoneNo: "", notes: "" });
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [hours, setHours] = useState(DEFAULT_OPERATING_HOURS);
  const [location, setLocation] = useState<PickedAddress | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already registered (e.g. a stale tab): go to the next step instead.
  useEffect(() => {
    if (merchant) router.replace("/merchant/verification");
  }, [merchant, router]);

  useEffect(() => {
    listMerchantServices()
      .then((rows) => setServices(Array.isArray(rows) ? rows : []))
      .catch(() => setServices([]));
  }, []);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const missing = {
    name: !form.name.trim(),
    mobileNumber: !form.mobileNumber.trim(),
    service: serviceId === null,
    location: !location,
    hours: !isValidOperatingHours(hours),
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.values(missing).some(Boolean) || !location || serviceId === null) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createMerchant({
        name: form.name.trim(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        serviceId,
        mobileNumber: form.mobileNumber.trim(),
        ...(form.telephoneNo.trim() ? { telephoneNo: form.telephoneNo.trim() } : {}),
        address: addressPayloadFromPick(location, form.notes),
        operatingHours: hours,
      });
      toast({ tone: "success", title: "Merchant registered", body: "Next, submit your documents to get verified." });
      setMerchant(created);
    } catch (err) {
      setError(errorMessage(err, "Couldn't register your merchant."));
      setSaving(false);
    }
  };

  if (!emailVerified) {
    return (
      <Card className="mx-auto max-w-lg">
        <EmptyState
          icon="mail"
          title="Verify your email first"
          body="Only verified users can register a merchant."
          action={<ButtonLink href="/verify-email">Verify email</ButtonLink>}
        />
      </Card>
    );
  }
  if (merchant === undefined || merchant) return <PageSpinner />;

  const show = (bad: boolean, msg: string) => (attempted && bad ? msg : null);

  return (
    <>
      <title>Register a merchant · Utiligo</title>
      <PageHeader
        title="Register a merchant"
        subtitle="Add your business and start receiving orders from nearby customers."
        back={{ href: "/home", label: "Home" }}
      />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">What do you offer?</h2>
            {services === null ? (
              <PageSpinner />
            ) : services.length === 0 ? (
              <p className="text-sm text-muted">No services are available yet. Please try again later.</p>
            ) : (
              <fieldset>
                <legend className="sr-only">Service</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {services.map((s) => {
                    const config = serviceForTitle(s.title);
                    const on = serviceId === s.id;
                    return (
                      <label
                        key={s.id}
                        className={cx(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                          on ? "border-merchant bg-merchant-tint" : "border-border hover:border-border-strong",
                        )}
                      >
                        <input type="radio" name="service" className="sr-only" checked={on} onChange={() => setServiceId(s.id)} />
                        {config ? <ServiceGlyph service={config} size="sm" /> : null}
                        <span className="text-sm font-medium text-ink">{s.title}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
            {attempted && missing.service ? (
              <p className="text-sm text-danger">Choose the service you offer.</p>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Details</h2>
            <TextField
              label="Business name"
              placeholder="e.g. Aqua Fresh — Quezon City"
              value={form.name}
              onChange={set("name")}
              error={show(missing.name, "Enter your business name.")}
            />
            <TextAreaField label="Description" optional placeholder="Tell customers what you offer" value={form.description} onChange={set("description")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Mobile number"
                type="tel"
                placeholder="09xx xxx xxxx"
                value={form.mobileNumber}
                onChange={set("mobileNumber")}
                error={show(missing.mobileNumber, "Enter a mobile number.")}
              />
              <TextField label="Telephone" type="tel" optional placeholder="(02) 8xxx-xxxx" value={form.telephoneNo} onChange={set("telephoneNo")} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Location</h2>
            <LocationField
              label="Business location"
              required
              value={location}
              onChange={setLocation}
              pickerTitle="Pin your business"
              error={show(missing.location, "Pin your business location.")}
            />
            <TextAreaField
              label="Notes to help customers find you"
              optional
              placeholder="e.g. Beside the barangay hall"
              value={form.notes}
              onChange={set("notes")}
            />
          </Card>
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Opening hours</h2>
            <OperatingHoursEditor value={hours} onChange={setHours} />
            {attempted && missing.hours ? (
              <p className="text-sm text-danger">Each open day needs a closing time after its opening time.</p>
            ) : null}
          </Card>
          {error ? (
            <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" loading={saving} tone="var(--merchant)" icon="store" className="self-start py-3">
            Register merchant
          </Button>
        </div>
      </form>
    </>
  );
}
