"use client";

import { useMemo, useState } from "react";
import { ServiceGlyph } from "@/components/app/service-glyph";
import { MarkPaidDialog } from "@/components/orders/mark-paid-dialog";
import { confirm } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Badge, Button, Card, ChoiceChips, EmptyState, ErrorState, PageSpinner } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { isGarbageOrder, isLaundryOrder, listMerchantDeliveryQueue, markOrderDelivered, type OrderRow } from "@/lib/data/orders";
import { MAX_STOPS_PER_ROUTE, directionsUrl, multiStopRoute, stopQueryForOrder } from "@/lib/maps-links";
import { useOnOrderEvent } from "@/lib/hooks/use-app";
import { useResource } from "@/lib/hooks/use-resource";
import { serviceForTitle } from "@/lib/service-config";
import { toast } from "@/lib/stores/ui";
import { formatAddress, formatMoney } from "@/lib/types";

type Tab = "undelivered" | "delivered";

function typeLine(o: OrderRow): string {
  if (isLaundryOrder(o)) return "Laundry return";
  if (isGarbageOrder(o)) return "Garbage pickup";
  return o.orderType === "refill" ? "Refill" : "Purchase";
}

export default function DeliveryPage() {
  const { data: rows, error, reload, setData: setRows } = useResource(listMerchantDeliveryQueue, "delivery-queue");
  const [tab, setTab] = useState<Tab>("undelivered");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payOrder, setPayOrder] = useState<OrderRow | null>(null);

  useOnOrderEvent(reload);

  const undelivered = useMemo(() => (rows ?? []).filter((r) => !r.delivered), [rows]);
  const delivered = useMemo(() => (rows ?? []).filter((r) => r.delivered), [rows]);
  const list = tab === "undelivered" ? undelivered : delivered;
  const route = useMemo(() => multiStopRoute(undelivered), [undelivered]);

  const replace = (updated: OrderRow) => setRows((prev) => prev?.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) ?? prev);

  const markDelivered = async (order: OrderRow) => {
    const ok = await confirm(
      order.paid
        ? { title: "Mark delivered?", body: "Confirm this order has reached the customer.", confirmLabel: "Mark delivered" }
        : {
            title: "Order not paid yet",
            body: "Mark it delivered only if payment was agreed for delivery or you'll collect it separately.",
            confirmLabel: "Mark delivered",
          },
    );
    if (!ok) return;
    setBusyId(order.id);
    try {
      const updated = await markOrderDelivered(order.id);
      replace(updated);
      toast({ tone: "success", title: "Marked delivered" });
      if (!updated.paid) setPayOrder(updated);
    } catch (e) {
      toast({ tone: "error", title: "Couldn't update", body: errorMessage(e, "Try again.") });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <title>Deliveries · Business · Utiligo</title>
      <p className="mb-5 max-w-2xl text-sm text-muted">
        Accepted water, gas, laundry-return, and garbage pickup orders. Open directions for each stop, then mark it delivered.
      </p>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <ChoiceChips
          label="Show"
          tone="var(--merchant)"
          value={tab}
          onChange={setTab}
          options={[
            { value: "undelivered", label: `To deliver (${undelivered.length})` },
            { value: "delivered", label: `Delivered (${delivered.length})` },
          ]}
        />
        {tab === "undelivered" && route ? (
          <a
            href={route.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            <Icon name="map" className="h-4.5 w-4.5" />
            Route all {route.usedCount} stop{route.usedCount === 1 ? "" : "s"} in Google Maps
          </a>
        ) : null}
      </div>
      {tab === "undelivered" && route && (route.truncated || route.skippedNoAddress > 0) ? (
        <p className="mb-4 text-xs text-muted">
          {route.truncated ? `The route includes the ${MAX_STOPS_PER_ROUTE} oldest stops. ` : ""}
          {route.skippedNoAddress > 0 ? `${route.skippedNoAddress} order(s) skipped — no usable address.` : ""}
        </p>
      ) : null}

      {error ? (
        <Card>
          <ErrorState message="Couldn't load your delivery queue." onRetry={reload} />
        </Card>
      ) : rows === null ? (
        <PageSpinner />
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon="truck"
            title={rows.length === 0 ? "No deliveries yet" : tab === "undelivered" ? "Nothing left to deliver" : "No completed deliveries yet"}
            body={
              rows.length === 0
                ? "Accept requests from Orders first. Laundry returns appear after you mark them out for delivery."
                : tab === "undelivered"
                  ? "Completed stops are listed under Delivered."
                  : "Mark orders delivered after each stop."
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((o) => {
            const service = serviceForTitle(o.service?.title);
            const stop = stopQueryForOrder(o);
            return (
              <li key={o.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  {service ? <ServiceGlyph service={service} size="sm" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {typeLine(o)}
                      {o.quantity && !isLaundryOrder(o) && !isGarbageOrder(o) ? ` · Qty ${o.quantity}` : ""}
                    </p>
                    <p className="text-sm text-muted">
                      {o.orderedBy ? `${o.orderedBy.firstName} ${o.orderedBy.lastName}` : "—"}
                      {o.orderedBy?.mobileNumber ? (
                        <>
                          {" · "}
                          <a href={`tel:${o.orderedBy.mobileNumber}`} className="text-accent hover:underline">
                            {o.orderedBy.mobileNumber}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={o.paid ? "success" : "warning"}>{o.paid ? "Paid" : "Unpaid"}</Badge>
                    {o.delivered ? <Badge tone="info">Delivered</Badge> : null}
                  </div>
                </div>
                <p className="text-sm text-ink">
                  {o.deliveryType === "pickup" ? <span className="font-medium">[Pickup] </span> : null}
                  {formatAddress(o.deliveryAddress)}
                </p>
                {o.containerType && !isLaundryOrder(o) ? <p className="text-xs text-muted">Note: {o.containerType}</p> : null}
                {isLaundryOrder(o) && o.laundryWeightKg != null ? (
                  <p className="text-xs text-muted">
                    {Number(o.laundryWeightKg)} kg · {formatMoney(o.laundryTotalPrice, o.laundryCurrency ?? "PHP")}
                  </p>
                ) : null}
                {o.delivered && o.deliveredAt ? (
                  <p className="text-xs text-muted">Delivered {new Date(o.deliveredAt).toLocaleString()}</p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {stop ? (
                    <a
                      href={directionsUrl(stop)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-3.5 py-2 text-sm font-semibold text-ink hover:bg-surface-2"
                    >
                      <Icon name="map-pin" className="h-4 w-4" /> Directions
                    </a>
                  ) : null}
                  {!o.delivered ? (
                    <Button icon="check" tone="var(--merchant)" loading={busyId === o.id} onClick={() => void markDelivered(o)}>
                      Mark delivered
                    </Button>
                  ) : !o.paid ? (
                    <Button icon="cash" tone="var(--merchant)" onClick={() => setPayOrder(o)}>
                      Mark paid (cash)
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <MarkPaidDialog order={payOrder} onClose={() => setPayOrder(null)} onPaid={replace} />
    </>
  );
}
