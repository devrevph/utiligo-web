"use client";

import { useState } from "react";
import { errorMessage } from "@/lib/api";
import { markMerchantOrderPaid, orderNeedsPaymentAmount, type OrderRow } from "@/lib/data/orders";
import { toast } from "@/lib/stores/ui";
import { Button, Dialog, TextField } from "@/components/ui/primitives";

// Handles both "1,500.00" (comma thousands) and "50,5" (comma decimal) — a
// bare replace(",", ".") would turn the former into 1.5 without complaint.
export function parseAmountInput(input: string): number {
  const trimmed = input.trim();
  const normalized = trimmed.includes(",") && trimmed.includes(".") ? trimmed.replace(/,/g, "") : trimmed.replace(",", ".");
  return Number(normalized);
}

/** Confirms a cash payment; refill orders also collect the amount, since their price isn't known until delivery. */
export function MarkPaidDialog({
  order,
  onClose,
  onPaid,
}: {
  order: OrderRow | null;
  onClose: () => void;
  onPaid: (updated: OrderRow) => void;
}) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsAmount = order ? orderNeedsPaymentAmount(order) : false;

  const close = () => {
    if (busy) return;
    setAmount("");
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    let parsed: number | undefined;
    if (needsAmount) {
      parsed = parseAmountInput(amount);
      if (!amount.trim() || !Number.isFinite(parsed) || parsed < 0) {
        setError("Enter the amount you collected (0 or more).");
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await markMerchantOrderPaid(order.id, { modeOfPayment: "Cash", amount: parsed });
      onPaid(updated);
      toast({ tone: "success", title: "Marked as paid" });
      setAmount("");
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Couldn't update payment. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!order} onClose={close} title="Mark paid (cash)" size="sm" dismissible={!busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          {needsAmount
            ? "Enter the amount the customer paid for this refill."
            : "Confirm you received payment from the customer (e.g. cash on delivery)."}
        </p>
        {needsAmount ? (
          <TextField
            label="Amount collected (PHP)"
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" icon="cash" loading={busy} tone="var(--merchant)">
            Mark paid
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
