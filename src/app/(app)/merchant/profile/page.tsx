"use client";

import { useState } from "react";
import { LocationField } from "@/components/map/location-field";
import { OperatingHoursEditor } from "@/components/merchant/operating-hours-editor";
import { Button, Card, TextAreaField, TextField } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import {
  DEFAULT_OPERATING_HOURS,
  isValidOperatingHours,
  updateMyMerchant,
  type MyMerchant,
  type UpdateMyMerchantPayload,
} from "@/lib/data/merchants";
import { addressPayloadFromPick } from "@/lib/data/users";
import { useMerchantStore } from "@/lib/stores/merchant";
import { toast } from "@/lib/stores/ui";
import { formatAddress, type PickedAddress } from "@/lib/types";

export default function BusinessProfilePage() {
  const merchant = useMerchantStore((s) => s.merchant);
  if (!merchant) return null;
  return <BusinessProfileForm key={merchant.id} merchant={merchant} />;
}

function BusinessProfileForm({ merchant }: { merchant: MyMerchant }) {
  const setMerchant = useMerchantStore((s) => s.setMerchant);
  const [form, setForm] = useState({
    name: merchant.name ?? "",
    description: merchant.description ?? "",
    mobileNumber: merchant.mobileNumber ?? "",
    telephoneNo: merchant.telephoneNo ?? "",
  });
  const [hours, setHours] = useState(merchant.operatingHours ?? DEFAULT_OPERATING_HOURS);
  const [location, setLocation] = useState<PickedAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Enter your business name.");
    if (!form.mobileNumber.trim()) return setError("Enter your business mobile number.");
    if (!isValidOperatingHours(hours)) return setError("Check your opening hours — each open day needs a closing time after its opening time.");
    setSaving(true);
    setError(null);
    try {
      const payload: UpdateMyMerchantPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        mobileNumber: form.mobileNumber.trim(),
        telephoneNo: form.telephoneNo.trim(),
        operatingHours: hours,
        ...(location ? { address: addressPayloadFromPick(location) } : {}),
      };
      setMerchant(await updateMyMerchant(payload));
      setLocation(null);
      toast({ tone: "success", title: "Business profile saved" });
    } catch (err) {
      setError(errorMessage(err, "Couldn't save your business profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <title>Business profile · Utiligo</title>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Details</h2>
            <p className="-mt-2 text-sm text-muted">{merchant.service?.title ?? "Business"}</p>
            <TextField label="Business name" value={form.name} onChange={set("name")} />
            <TextAreaField label="Description" optional placeholder="Tell customers what you offer" value={form.description} onChange={set("description")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Mobile number" type="tel" value={form.mobileNumber} onChange={set("mobileNumber")} />
              <TextField label="Telephone" type="tel" optional value={form.telephoneNo} onChange={set("telephoneNo")} />
            </div>
          </Card>
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Location</h2>
            <LocationField
              label="Business location"
              required
              value={location}
              onChange={setLocation}
              currentLabel={formatAddress(merchant.address)}
              initial={merchant.address}
              pickerTitle="Business location"
            />
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Opening hours</h2>
            <OperatingHoursEditor value={hours} onChange={setHours} />
          </Card>
          {error ? (
            <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" loading={saving} icon="check" tone="var(--merchant)" className="self-start">
            Save business profile
          </Button>
        </div>
      </form>
    </>
  );
}
