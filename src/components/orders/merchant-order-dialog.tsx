"use client";

import { useState } from "react";
import { errorMessage } from "@/lib/api";
import {
  advanceGarbageMerchantPickup,
  formatGarbageOrderRate,
  formatOrderDate,
  garbagePickupStatusLabel,
  isGarbageOrder,
  isLaundryOrder,
  laundryPhaseLabel,
  merchantOrderTitle,
  orderTypeLabel,
  requestStatusLabel,
  respondToOrder,
  updateLaundryMerchantOrder,
  type OrderRow,
} from "@/lib/data/orders";
import { directionsUrl, searchUrl, stopQueryForOrder } from "@/lib/maps-links";
import { toast } from "@/lib/stores/ui";
import { formatAddress, formatMoney } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { Badge, Button, DetailRow, Dialog, TextAreaField, TextField } from "@/components/ui/primitives";
import { OrderPhoto } from "./customer-orders";
import { MarkPaidDialog, parseAmountInput } from "./mark-paid-dialog";

type Mode = "view" | "reject" | "weigh";

export function MerchantOrderDialog({
  order,
  onClose,
  onUpdated,
}: {
  order: OrderRow | null;
  onClose: () => void;
  onUpdated: (row: OrderRow) => void;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [payOrder, setPayOrder] = useState<OrderRow | null>(null);

  const reset = () => {
    setMode("view");
    setError(null);
    setReason("");
    setWeight("");
    setPrice("");
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const run = async (action: () => Promise<OrderRow>, success?: string) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      onUpdated(updated);
      setMode("view");
      if (success) toast({ tone: "success", title: success });
    } catch (e) {
      setError(errorMessage(e, "Couldn't update this order. Try again."));
    } finally {
      setBusy(false);
    }
  };

  if (!order) return <Dialog open={false} onClose={close} title="" />;

  const status = order.requestStatus ?? "pending";
  const laundry = isLaundryOrder(order);
  const garbage = isGarbageOrder(order);
  const accepted = status === "accepted";
  const stop = stopQueryForOrder(order);

  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Give the customer a short reason.");
      return;
    }
    void run(() => respondToOrder(order.id, { decision: "reject", rejectionReason: reason.trim() }), "Request rejected");
  };

  const submitWeigh = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseAmountInput(weight);
    const total = parseAmountInput(price);
    if (!Number.isFinite(kg) || kg <= 0) {
      setError("Enter the weighed laundry in kg (e.g. 4.5).");
      return;
    }
    if (!price.trim() || !Number.isFinite(total) || total < 0) {
      setError("Enter the total price for this batch.");
      return;
    }
    void run(() => updateLaundryMerchantOrder(order.id, { action: "set_processing", weightKg: kg, totalPrice: total }));
  };

  let actions: React.ReactNode = null;
  if (mode === "reject") {
    actions = (
      <form onSubmit={submitReject} className="flex flex-col gap-3">
        <TextAreaField
          label="Reason for rejecting"
          hint="The customer will see this."
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setMode("view")} disabled={busy}>
            Back
          </Button>
          <Button type="submit" variant="danger" loading={busy}>
            Reject request
          </Button>
        </div>
      </form>
    );
  } else if (mode === "weigh") {
    actions = (
      <form onSubmit={submitWeigh} className="flex flex-col gap-3">
        <p className="text-sm text-muted">Weigh the batch and enter the price for this order.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Weight (kg)" inputMode="decimal" placeholder="e.g. 5.5" autoFocus value={weight} onChange={(e) => setWeight(e.target.value)} />
          <TextField label="Total price (PHP)" inputMode="decimal" placeholder="e.g. 450" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setMode("view")} disabled={busy}>
            Back
          </Button>
          <Button type="submit" loading={busy} tone="var(--laundry)">
            Save
          </Button>
        </div>
      </form>
    );
  } else if (status === "pending") {
    actions = (
      <div className="flex justify-end gap-2">
        <Button variant="danger-outline" onClick={() => setMode("reject")} disabled={busy}>
          Reject
        </Button>
        <Button
          icon="check"
          tone="var(--merchant)"
          loading={busy}
          onClick={() => void run(() => respondToOrder(order.id, { decision: "accept" }), "Request accepted")}
        >
          Accept
        </Button>
      </div>
    );
  } else if (laundry && accepted && !order.delivered) {
    actions = !order.laundryPhase ? (
      <Button block icon="truck" tone="var(--laundry)" loading={busy} onClick={() => void run(() => updateLaundryMerchantOrder(order.id, { action: "set_pickup_en_route" }))}>
        Pickup on the way
      </Button>
    ) : order.laundryPhase === "pickup_en_route" ? (
      <Button block icon="scale" tone="var(--laundry)" onClick={() => setMode("weigh")}>
        Laundry arrived — enter weight and price
      </Button>
    ) : order.laundryPhase === "processing" ? (
      <Button
        block
        icon="bike"
        tone="var(--laundry)"
        loading={busy}
        onClick={() =>
          void run(
            () => updateLaundryMerchantOrder(order.id, { action: "set_out_for_delivery" }),
            "Added to your delivery queue",
          )
        }
      >
        Out for delivery (clean laundry)
      </Button>
    ) : (
      <p className="text-sm text-muted">
        This batch is in your delivery queue. Mark it delivered from Deliveries when the customer receives it.
      </p>
    );
  } else if (garbage && accepted && !order.delivered) {
    actions =
      order.garbagePickupStatus === "accepted" ? (
        <Button block icon="truck" tone="var(--garbage)" loading={busy} onClick={() => void run(() => advanceGarbageMerchantPickup(order.id, { to: "pickup_coming" }))}>
          Pickup on the way
        </Button>
      ) : order.garbagePickupStatus === "pickup_coming" ? (
        <Button
          block
          icon="check-circle"
          tone="var(--garbage)"
          loading={busy}
          onClick={() => void run(() => advanceGarbageMerchantPickup(order.id, { to: "picked_up" }), "Pickup completed")}
        >
          Mark picked up
        </Button>
      ) : null;
  } else if (order.delivered && !order.paid) {
    actions = (
      <Button block icon="cash" tone="var(--merchant)" onClick={() => setPayOrder(order)}>
        Mark paid (cash)
      </Button>
    );
  }

  return (
    <>
      <Dialog open={!!order} onClose={close} title={merchantOrderTitle(order)} description={`Placed ${formatOrderDate(order.createdAt)}`} dismissible={!busy} footer={actions ? <div className="w-full">{actions}</div> : undefined}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={status === "accepted" ? "success" : status === "rejected" ? "danger" : "warning"}>
              {requestStatusLabel(status)}
            </Badge>
            <Badge tone={order.paid ? "success" : "warning"}>{order.paid ? "Paid" : "Unpaid"}</Badge>
            {order.delivered ? <Badge tone="info">Delivered</Badge> : null}
          </div>

          <dl>
            {status === "rejected" && order.rejectionReason ? <DetailRow label="Reject reason">{order.rejectionReason}</DetailRow> : null}
            <DetailRow label="Customer">
              {order.orderedBy ? `${order.orderedBy.firstName} ${order.orderedBy.lastName}` : "—"}
            </DetailRow>
            <DetailRow label="Phone">
              {order.orderedBy?.mobileNumber ? (
                <a href={`tel:${order.orderedBy.mobileNumber}`} className="text-accent hover:underline">
                  {order.orderedBy.mobileNumber}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Type">
              {orderTypeLabel(order.orderType)} · {order.deliveryType === "pickup" ? "Pickup at merchant" : "Door to door"}
            </DetailRow>
            {order.product ? <DetailRow label="Product">{order.product.name}</DetailRow> : null}
            {!laundry && !garbage ? <DetailRow label="Quantity">{order.quantity ?? "—"}</DetailRow> : null}
            {order.productLineTotal != null && Number.isFinite(Number(order.productLineTotal)) ? (
              <DetailRow label="Line total">{formatMoney(order.productLineTotal)}</DetailRow>
            ) : null}
            <DetailRow label="Payment">
              {order.modeOfPayment ?? "—"} {order.paid ? "(paid)" : "(unpaid)"}
            </DetailRow>
            {laundry || garbage ? (
              <DetailRow label="Pickup notes">{order.containerType?.trim() || "—"}</DetailRow>
            ) : order.containerType ? (
              <DetailRow label="Notes">{order.containerType}</DetailRow>
            ) : null}
            {laundry ? (
              <>
                <DetailRow label="Laundry status">{laundryPhaseLabel(order.laundryPhase, accepted)}</DetailRow>
                {order.laundryWeightKg != null && Number.isFinite(Number(order.laundryWeightKg)) ? (
                  <DetailRow label="Weight">{Number(order.laundryWeightKg)} kg</DetailRow>
                ) : null}
                {order.laundryTotalPrice != null && Number.isFinite(Number(order.laundryTotalPrice)) ? (
                  <DetailRow label="Batch price">{formatMoney(order.laundryTotalPrice, order.laundryCurrency ?? "PHP")}</DetailRow>
                ) : null}
              </>
            ) : null}
            {garbage ? (
              <>
                {formatGarbageOrderRate(order) ? <DetailRow label="Collection rate">{formatGarbageOrderRate(order)}</DetailRow> : null}
                <DetailRow label="Pickup progress">{garbagePickupStatusLabel(order.garbagePickupStatus)}</DetailRow>
              </>
            ) : null}
            <DetailRow label="Delivered">{order.delivered ? "Yes" : "No"}</DetailRow>
            <DetailRow label="Location">
              <span className="block">{formatAddress(order.deliveryAddress)}</span>
              {stop ? (
                <span className="mt-2 flex flex-wrap gap-3">
                  <a href={searchUrl(stop)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                    <Icon name="map" className="h-4 w-4" /> View on map
                  </a>
                  <a href={directionsUrl(stop)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                    <Icon name="truck" className="h-4 w-4" /> Directions
                  </a>
                </span>
              ) : null}
            </DetailRow>
          </dl>

          {order.containerImageUrl ? <OrderPhoto url={order.containerImageUrl} /> : null}

          {error ? (
            <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
      <MarkPaidDialog order={payOrder} onClose={() => setPayOrder(null)} onPaid={onUpdated} />
    </>
  );
}
