"use client";

import { useMemo, useState } from "react";
import { errorMessage } from "@/lib/api";
import {
  createOrder,
  deliveryAddressFromUser,
  orderAddressFromPick,
  type DeliveryType,
  type OrderType,
} from "@/lib/data/orders";
import { formatGarbageCollectionRate, type PublicMerchant } from "@/lib/data/merchants";
import { uploadContainerImage } from "@/lib/data/storage";
import type { ServiceConfig } from "@/lib/service-config";
import { useAuthStore } from "@/lib/stores/auth";
import { formatAddress, formatMoney, formatPickedAddress, type PickedAddress, type Product } from "@/lib/types";
import { AddressPickerDialog } from "@/components/map/address-picker";
import { Icon } from "@/components/ui/icon";
import { Button, ChoiceChips, Dialog, Switch, TextAreaField, TextField, cx } from "@/components/ui/primitives";
import { PhotoInput } from "./photo-input";

const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "GCash", label: "GCash" },
] as const;

const DELIVERY_MODES: ReadonlyArray<{ value: DeliveryType; label: string }> = [
  { value: "door to door", label: "Door to door" },
  { value: "pickup", label: "Pickup at merchant" },
];

export type OrderIntent = { kind: "buy"; product: Product } | { kind: "request" };

export function OrderFormDialog({
  intent,
  service,
  serviceId,
  merchant,
  products,
  onClose,
  onPlaced,
}: {
  intent: OrderIntent | null;
  service: ServiceConfig;
  serviceId: number;
  merchant: PublicMerchant;
  products: Product[];
  onClose: () => void;
  onPlaced: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const title = !intent ? "" : intent.kind === "buy" ? `Order: ${intent.product.name}` : service.requestTitle;
  return (
    <Dialog open={!!intent} onClose={() => !busy && onClose()} title={title} description={merchant.name} dismissible={!busy}>
      {intent ? (
        <OrderForm
          key={intent.kind === "buy" ? intent.product.id : "request"}
          intent={intent}
          service={service}
          serviceId={serviceId}
          merchant={merchant}
          products={products}
          busy={busy}
          setBusy={setBusy}
          onCancel={onClose}
          onPlaced={onPlaced}
        />
      ) : null}
    </Dialog>
  );
}

function OrderForm({
  intent,
  service,
  serviceId,
  merchant,
  products,
  busy,
  setBusy,
  onCancel,
  onPlaced,
}: {
  intent: OrderIntent;
  service: ServiceConfig;
  serviceId: number;
  merchant: PublicMerchant;
  products: Product[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  onCancel: () => void;
  onPlaced: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const profileAddress = useMemo(() => deliveryAddressFromUser(user), [user]);
  const isBuy = intent.kind === "buy";
  const isRefill = !isBuy && service.requestKind === "refill";
  const refillable = useMemo(() => products.filter((p) => p.refillable), [products]);

  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [refillProductId, setRefillProductId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [otherAddress, setOtherAddress] = useState<PickedAddress | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("door to door");
  const [payment, setPayment] = useState<string>("Cash");
  const [error, setError] = useState<string | null>(null);

  const needsQuantity = isBuy || isRefill;
  const rateLabel = service.requestKind === "garbage_pickup" && !isBuy ? formatGarbageCollectionRate(merchant) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = Number.parseInt(quantity, 10);
    if (needsQuantity && (!Number.isFinite(qty) || qty < 1)) {
      setError("Enter a quantity of at least 1.");
      return;
    }
    if (isRefill && refillable.length > 0 && !refillProductId) {
      setError("Choose which item you want refilled.");
      return;
    }
    const deliveryAddress = useProfileAddress ? profileAddress : otherAddress ? orderAddressFromPick(otherAddress) : null;
    if (!deliveryAddress) {
      setError(
        useProfileAddress
          ? "Your profile has no complete address. Pin a different location below, or update your profile."
          : "Pin the location for this order on the map.",
      );
      return;
    }

    const refillProduct = refillable.find((p) => p.id === refillProductId) ?? null;
    const noteText = notes.trim();
    const orderType: OrderType = isBuy ? "buy" : service.requestKind;

    setBusy(true);
    try {
      let containerImageUrl: string | undefined;
      if (isRefill && photo) containerImageUrl = await uploadContainerImage(merchant.id, photo);

      if (isBuy) {
        await createOrder({
          serviceId,
          merchantId: merchant.id,
          orderType,
          deliveryType,
          modeOfPayment: payment,
          quantity: qty,
          productId: intent.product.id,
          containerType: [`Product: ${intent.product.name}`, noteText || null].filter(Boolean).join(" · "),
          deliveryAddress,
        });
      } else if (isRefill) {
        await createOrder({
          serviceId,
          merchantId: merchant.id,
          orderType,
          deliveryType,
          modeOfPayment: payment,
          quantity: qty,
          ...(refillProduct ? { productId: refillProduct.id } : {}),
          containerType:
            [refillProduct ? `Product: ${refillProduct.name}` : null, noteText || null].filter(Boolean).join(" · ") || undefined,
          containerImageUrl,
          deliveryAddress,
        });
      } else {
        await createOrder({
          serviceId,
          merchantId: merchant.id,
          orderType,
          deliveryType,
          modeOfPayment: payment,
          ...(orderType === "laundry_pickup" ? { quantity: 1 } : {}),
          // Laundry stores its notes in containerType too, matching the mobile app.
          ...(noteText ? { pickupNotes: noteText, ...(orderType === "laundry_pickup" ? { containerType: noteText } : {}) } : {}),
          deliveryAddress,
        });
      }
      onPlaced();
    } catch (err) {
      setError(errorMessage(err, "Couldn't send your request. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {isBuy ? (
        <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-ink">
          <span className="font-semibold">{formatMoney(intent.product.price, intent.product.currency)}</span>
          {intent.product.unit ? <span className="text-muted"> per {intent.product.unit}</span> : null}
        </p>
      ) : null}

      {rateLabel ? (
        <p className="rounded-lg px-3.5 py-2.5 text-sm" style={{ background: service.tint }}>
          <span className="text-muted">Collection rate: </span>
          <span className="font-semibold" style={{ color: service.color }}>
            {rateLabel}
          </span>
        </p>
      ) : null}

      {isRefill ? (
        refillable.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Which item are you refilling?</legend>
            <div className="flex flex-col gap-2">
              {refillable.map((p) => {
                const on = refillProductId === p.id;
                return (
                  <label
                    key={p.id}
                    className={cx(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                      on ? "border-[var(--svc)] bg-[var(--svc-tint)]" : "border-border hover:border-border-strong",
                    )}
                    style={{ "--svc": service.color, "--svc-tint": service.tint } as React.CSSProperties}
                  >
                    <input type="radio" name="refill-product" className="sr-only" checked={on} onChange={() => setRefillProductId(p.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{p.name}</span>
                      <span className="block text-xs text-muted">
                        {p.unit ? `${p.unit} · ` : ""}
                        {formatMoney(p.price, p.currency)}
                      </span>
                    </span>
                    <span
                      className={cx("flex h-5 w-5 items-center justify-center rounded-full border-2", on ? "border-[var(--svc)]" : "border-border-strong")}
                    >
                      {on ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--svc)]" /> : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="text-sm text-muted">This merchant hasn&apos;t listed refill sizes yet — describe your container below.</p>
        )
      ) : null}

      {needsQuantity ? (
        <TextField
          label="Quantity"
          type="number"
          min={1}
          inputMode="numeric"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="max-w-40"
        />
      ) : null}

      <TextAreaField
        label={isBuy ? "Notes for the merchant" : service.requestNotesLabel.replace(" (optional)", "")}
        optional
        placeholder={isBuy ? "e.g. Ring the gate bell" : service.requestNotesPlaceholder}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {isRefill ? (
        <PhotoInput
          label="Container photo"
          hint="Help the merchant identify your container before delivery."
          file={photo}
          onChange={setPhoto}
        />
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <p className="text-sm font-medium text-ink">{isBuy || isRefill ? "Delivery address" : "Pickup address"}</p>
        <Switch
          label="Use my profile address"
          description={formatAddress(user?.address)}
          checked={useProfileAddress}
          onChange={setUseProfileAddress}
          tone={service.color}
        />
        {!useProfileAddress ? (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {otherAddress ? (
              <p className="flex items-start gap-2 text-sm text-ink">
                <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0" />
                {formatPickedAddress(otherAddress)}
              </p>
            ) : (
              <p className="text-sm text-muted">No other address chosen yet.</p>
            )}
            <Button variant="secondary" icon="map" className="self-start" onClick={() => setPickerOpen(true)}>
              {otherAddress ? "Change location" : "Choose on map"}
            </Button>
          </div>
        ) : null}
      </div>

      <ChoiceChips label="Delivery" options={DELIVERY_MODES} value={deliveryType} onChange={setDeliveryType} tone={service.color} />
      <ChoiceChips label="Payment" options={PAYMENT_MODES} value={payment} onChange={setPayment} tone={service.color} />

      {error ? (
        <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy} tone={service.color}>
          {isBuy ? "Place order" : service.requestSubmit}
        </Button>
      </div>

      <AddressPickerDialog
        open={pickerOpen}
        title={isBuy || isRefill ? "Delivery location" : "Pickup location"}
        initial={otherAddress ?? user?.address}
        onClose={() => setPickerOpen(false)}
        onConfirm={(picked) => {
          setOtherAddress(picked);
          setPickerOpen(false);
        }}
      />
    </form>
  );
}
