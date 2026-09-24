"use client";

import {
  customerOrderStatusLabel,
  formatGarbageOrderRate,
  formatOrderAmount,
  formatOrderDate,
  formatOrderListTitle,
  garbagePickupStatusLabel,
  getCustomerOrderDisplayStatus,
  isGarbageOrder,
  isLaundryOrder,
  laundryPhaseLabel,
  orderTypeLabel,
  requestStatusLabel,
  type CustomerOrderDisplayStatus,
  type OrderRow,
} from "@/lib/data/orders";
import { formatAddress } from "@/lib/types";
import { serviceForTitle } from "@/lib/service-config";
import { Icon } from "@/components/ui/icon";
import { Badge, DetailRow, Dialog, cx, type BadgeTone } from "@/components/ui/primitives";
import { ServiceGlyph } from "@/components/app/service-glyph";

const STATUS_TONE: Record<CustomerOrderDisplayStatus, BadgeTone> = {
  pending: "warning",
  active: "info",
  delivered: "info",
  completed: "success",
  cancelled: "danger",
};

export function CustomerOrderStatusBadge({ row }: { row: OrderRow }) {
  const status = getCustomerOrderDisplayStatus(row);
  return <Badge tone={STATUS_TONE[status]}>{customerOrderStatusLabel(status)}</Badge>;
}

export function CustomerOrderRow({ row, onOpen }: { row: OrderRow; onOpen: () => void }) {
  const service = serviceForTitle(row.service?.title);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:px-5"
    >
      {service ? <ServiceGlyph service={service} size="sm" /> : null}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{formatOrderListTitle(row)}</span>
          <CustomerOrderStatusBadge row={row} />
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {orderTypeLabel(row.orderType)} · {formatOrderDate(row.createdAt)}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-ink">{formatOrderAmount(row)}</span>
      <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}

export function CustomerOrderDialog({ order, onClose }: { order: OrderRow | null; onClose: () => void }) {
  const amount = order ? formatOrderAmount(order) : "—";
  const knownAmount = amount !== "—";

  return (
    <Dialog open={!!order} onClose={onClose} title="Order details" description={order ? formatOrderListTitle(order) : undefined}>
      {order ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Order amount</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{amount}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={order.paid ? "success" : "warning"}>{order.paid ? "Paid" : "Unpaid"}</Badge>
              {order.paid && order.modeOfPayment ? <span className="text-sm text-muted">via {order.modeOfPayment}</span> : null}
            </div>
            <p className="mt-2 text-sm text-muted">
              {order.paid
                ? knownAmount
                  ? `Amount paid: ${amount}`
                  : null
                : knownAmount
                  ? `Amount due: ${amount}`
                  : "The merchant will confirm the final amount."}
            </p>
          </div>

          <dl>
            <DetailRow label="Status">
              <CustomerOrderStatusBadge row={order} />
            </DetailRow>
            <DetailRow label="Request">{requestStatusLabel(order.requestStatus)}</DetailRow>
            {order.requestStatus === "rejected" && order.rejectionReason ? (
              <DetailRow label="Reason">{order.rejectionReason}</DetailRow>
            ) : null}
            <DetailRow label="Service">{order.service?.title ?? "—"}</DetailRow>
            <DetailRow label="Merchant">{order.merchant?.name ?? "—"}</DetailRow>
            <DetailRow label="Order type">{orderTypeLabel(order.orderType)}</DetailRow>
            <DetailRow label="Delivery">{order.deliveryType === "pickup" ? "Pickup at merchant" : "Door to door"}</DetailRow>
            <DetailRow label="Placed on">{formatOrderDate(order.createdAt)}</DetailRow>
            {order.product ? <DetailRow label="Product">{order.product.name}</DetailRow> : null}
            {order.quantity != null && !isLaundryOrder(order) && !isGarbageOrder(order) ? (
              <DetailRow label="Quantity">{order.quantity}</DetailRow>
            ) : null}
            {isLaundryOrder(order) ? (
              <>
                <DetailRow label="Pickup notes">{order.containerType?.trim() || "—"}</DetailRow>
                <DetailRow label="Laundry status">
                  {laundryPhaseLabel(order.laundryPhase, order.requestStatus === "accepted")}
                </DetailRow>
                {order.laundryWeightKg != null && Number.isFinite(Number(order.laundryWeightKg)) ? (
                  <DetailRow label="Weight">{Number(order.laundryWeightKg)} kg</DetailRow>
                ) : null}
              </>
            ) : null}
            {isGarbageOrder(order) ? (
              <>
                {formatGarbageOrderRate(order) ? (
                  <DetailRow label="Collection rate">{formatGarbageOrderRate(order)}</DetailRow>
                ) : null}
                <DetailRow label="Pickup notes">{order.containerType?.trim() || "—"}</DetailRow>
                <DetailRow label="Pickup progress">{garbagePickupStatusLabel(order.garbagePickupStatus)}</DetailRow>
              </>
            ) : null}
            {!isLaundryOrder(order) && !isGarbageOrder(order) && order.containerType?.trim() ? (
              <DetailRow label="Notes">{order.containerType}</DetailRow>
            ) : null}
            <DetailRow label="Delivered">
              {order.delivered ? (order.deliveredAt ? `Yes · ${formatOrderDate(order.deliveredAt)}` : "Yes") : "No"}
            </DetailRow>
            <DetailRow label="Location">{formatAddress(order.deliveryAddress)}</DetailRow>
          </dl>

          {order.containerImageUrl ? <OrderPhoto url={order.containerImageUrl} /> : null}
        </div>
      ) : null}
    </Dialog>
  );
}

export function OrderPhoto({ url, className }: { url: string; className?: string }) {
  return (
    <figure className={cx("flex flex-col gap-2", className)}>
      <figcaption className="text-sm text-muted">Container photo</figcaption>
      {/* eslint-disable-next-line @next/next/no-img-element -- Firebase Storage URLs; no need for next/image optimization */}
      <img src={url} alt="Photo of the container for this order" className="max-h-64 w-full rounded-xl border border-border object-cover" />
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
        Open full image <Icon name="external" className="h-3.5 w-3.5" />
      </a>
    </figure>
  );
}
