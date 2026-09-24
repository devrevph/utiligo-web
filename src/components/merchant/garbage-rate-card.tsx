"use client";

import { useState } from "react";
import { errorMessage } from "@/lib/api";
import {
  GARBAGE_COLLECTION_RATE_UNITS,
  formatGarbageCollectionRate,
  updateMyGarbageCollectionRate,
  type GarbageCollectionRateUnit,
  type MyMerchant,
} from "@/lib/data/merchants";
import { toast } from "@/lib/stores/ui";
import { confirm } from "@/components/ui/feedback";
import { Button, Card, ChoiceChips, Dialog, TextField } from "@/components/ui/primitives";
import { parseAmountInput } from "@/components/orders/mark-paid-dialog";

export function GarbageRateCard({ merchant, onUpdated }: { merchant: MyMerchant; onUpdated: (m: MyMerchant) => void }) {
  const [open, setOpen] = useState(false);
  const current = formatGarbageCollectionRate(merchant);

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">Collection rate</h3>
        <p className="mt-1 text-sm text-muted">Shown to customers before they request a pickup.</p>
      </div>
      <p className="font-display text-2xl font-bold text-ink">{current ?? "Not set"}</p>
      <Button variant="secondary" icon="pencil" className="self-start" onClick={() => setOpen(true)}>
        {current ? "Edit rate" : "Set a rate"}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Collection rate" size="sm">
        {open ? <RateForm merchant={merchant} onDone={(m) => { onUpdated(m); setOpen(false); }} /> : null}
      </Dialog>
    </Card>
  );
}

function RateForm({ merchant, onDone }: { merchant: MyMerchant; onDone: (m: MyMerchant) => void }) {
  const initialUnit = merchant.garbageCollectionRateUnit?.trim() as GarbageCollectionRateUnit | undefined;
  const [rate, setRate] = useState(merchant.garbageCollectionRate != null ? String(merchant.garbageCollectionRate) : "");
  const [unit, setUnit] = useState<GarbageCollectionRateUnit>(
    initialUnit && GARBAGE_COLLECTION_RATE_UNITS.includes(initialUnit) ? initialUnit : "per bag",
  );
  const [currency, setCurrency] = useState(merchant.garbageCollectionRateCurrency?.trim() || "PHP");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRate = formatGarbageCollectionRate(merchant) != null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseAmountInput(rate);
    if (!rate.trim() || !Number.isFinite(value) || value < 0) {
      setError("Enter a valid price (0 or more).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onDone(await updateMyGarbageCollectionRate({ rate: value, unit, currency: currency.trim() || "PHP" }));
      toast({ tone: "success", title: "Rate saved", body: "Customers will see it when requesting pickup." });
    } catch (err) {
      setError(errorMessage(err, "Couldn't save the rate."));
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    const ok = await confirm({
      title: "Remove rate?",
      body: "Customers won't see a collection price until you set one again.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      onDone(await updateMyGarbageCollectionRate({ clear: true }));
    } catch (err) {
      setError(errorMessage(err, "Couldn't remove the rate."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <TextField label="Price" inputMode="decimal" placeholder="e.g. 50" value={rate} onChange={(e) => setRate(e.target.value)} />
        <TextField label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
      </div>
      <ChoiceChips
        label="Unit"
        tone="var(--garbage)"
        value={unit}
        onChange={setUnit}
        options={GARBAGE_COLLECTION_RATE_UNITS.map((u) => ({ value: u, label: u }))}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-between gap-2">
        {hasRate ? (
          <Button variant="ghost" onClick={() => void clear()} disabled={busy}>
            Remove rate
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" loading={busy} tone="var(--garbage)">
          Save rate
        </Button>
      </div>
    </form>
  );
}
