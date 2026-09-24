"use client";

import { useMemo, useState } from "react";
import { MerchantOrderDialog } from "@/components/orders/merchant-order-dialog";
import { Icon } from "@/components/ui/icon";
import { Badge, Card, ChoiceChips, EmptyState, ErrorState, PageSpinner } from "@/components/ui/primitives";
import {
  formatOrderDate,
  garbagePickupStatusLabel,
  isGarbageOrder,
  isLaundryOrder,
  laundryPhaseLabel,
  listMyMerchantOrders,
  merchantOrderTitle,
  requestStatusLabel,
  type OrderRequestStatus,
  type OrderRow,
} from "@/lib/data/orders";
import { useOnOrderEvent } from "@/lib/hooks/use-app";
import { useResource } from "@/lib/hooks/use-resource";
import { useUiStore } from "@/lib/stores/ui";
import { formatAddress } from "@/lib/types";

type Filter = "all" | OrderRequestStatus;

function subtitle(o: OrderRow): string {
  const accepted = o.requestStatus === "accepted";
  if (isLaundryOrder(o) && accepted) return laundryPhaseLabel(o.laundryPhase, true);
  if (isGarbageOrder(o)) return garbagePickupStatusLabel(o.garbagePickupStatus);
  return `${o.deliveryType === "pickup" ? "Pickup" : "Door to door"} · Qty ${o.quantity ?? "—"}`;
}

export default function MerchantOrdersPage() {
  const { data: rows, error, reload, setData: setRows } = useResource(listMyMerchantOrders, "merchant-orders");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pendingOrder = useUiStore((s) => s.pendingOrder);
  const clearPendingOrder = useUiStore((s) => s.clearPendingOrder);

  useOnOrderEvent(reload);


  const counts = useMemo(() => {
    const c = { all: 0, pending: 0, accepted: 0, rejected: 0 };
    for (const r of rows ?? []) {
      c.all++;
      c[r.requestStatus ?? "pending"]++;
    }
    return c;
  }, [rows]);

  const visible = (rows ?? []).filter((r) => filter === "all" || (r.requestStatus ?? "pending") === filter);
  // A notification may have asked to open one of these orders.
  const openId = selectedId ?? (pendingOrder?.scope === "merchant" ? pendingOrder.orderId : null);
  const selected = rows?.find((r) => r.id === openId) ?? null;

  const onUpdated = (updated: OrderRow) =>
    setRows((prev) => prev?.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) ?? prev);

  return (
    <>
      <title>Orders · Business · Utiligo</title>
      <div className="mb-5">
        <ChoiceChips
          label="Show"
          tone="var(--merchant)"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "pending", label: `Pending (${counts.pending})` },
            { value: "accepted", label: `Accepted (${counts.accepted})` },
            { value: "rejected", label: `Rejected (${counts.rejected})` },
          ]}
        />
      </div>

      {error ? (
        <Card>
          <ErrorState message="Couldn't load orders." onRetry={reload} />
        </Card>
      ) : rows === null ? (
        <PageSpinner />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon="receipt"
            title={rows.length === 0 ? "No orders yet" : "Nothing here"}
            body={rows.length === 0 ? "New requests from customers will appear here instantly." : "No orders match this filter."}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {visible.map((o) => {
              const status = o.requestStatus ?? "pending";
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:px-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{merchantOrderTitle(o)}</span>
                        <Badge tone={status === "accepted" ? "success" : status === "rejected" ? "danger" : "warning"}>
                          {requestStatusLabel(status)}
                        </Badge>
                        <Badge tone={o.paid ? "success" : "neutral"}>{o.paid ? "Paid" : "Unpaid"}</Badge>
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {o.orderedBy ? `${o.orderedBy.firstName} ${o.orderedBy.lastName} · ` : ""}
                        {subtitle(o)} · {formatOrderDate(o.createdAt)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{formatAddress(o.deliveryAddress)}</span>
                    </span>
                    <Icon name="chevron-right" className="mt-1 h-4 w-4 shrink-0 text-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <MerchantOrderDialog order={selected} onClose={() => {
          setSelectedId(null);
          clearPendingOrder();
        }} onUpdated={onUpdated} />
    </>
  );
}
