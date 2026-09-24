import { api } from "@/lib/api";
import type { PickedAddress, User } from "@/lib/types";

export type OrderType = "buy" | "refill" | "laundry_pickup" | "garbage_pickup";
export type DeliveryType = "door to door" | "pickup";
export type OrderRequestStatus = "pending" | "accepted" | "rejected";

/** After a laundry pickup request is accepted, the merchant advances this workflow. */
export type LaundryPhase = "pickup_en_route" | "processing" | "out_for_delivery";

/** Garbage collection request lifecycle after the merchant accepts. */
export type GarbagePickupStatus = "pending" | "accepted" | "pickup_coming" | "picked_up" | "rejected";

export type OrderAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  formattedAddress?: string;
  notes?: string;
};

export type CreateOrderPayload = {
  serviceId: number;
  merchantId: string;
  orderType: OrderType;
  deliveryType: DeliveryType;
  modeOfPayment?: string;
  containerType?: string;
  containerImageUrl?: string;
  deliveryAddress: OrderAddress;
  quantity?: number;
  /** Buy or refill: catalog product at this merchant (refill requires `product.refillable`). */
  productId?: string;
  /** Free text for laundry/garbage pickup (bags, access, fragile items). */
  pickupNotes?: string;
};

export type OrderRow = {
  id: string;
  orderType: OrderType;
  deliveryType: DeliveryType;
  paid: boolean;
  modeOfPayment?: string | null;
  containerType?: string | null;
  containerImageUrl?: string | null;
  quantity?: number | null;
  requestStatus?: OrderRequestStatus;
  rejectionReason?: string | null;
  delivered?: boolean;
  deliveredAt?: string | null;
  deliveryAddress: OrderAddress;
  createdAt: string;
  service?: { id: number; title: string };
  merchant?: { id: string; name: string };
  orderedBy?: { id: string; firstName: string; lastName: string; mobileNumber: string };
  laundryPhase?: LaundryPhase | null;
  laundryWeightKg?: number | null;
  laundryTotalPrice?: number | null;
  laundryCurrency?: string | null;
  garbagePickupStatus?: GarbagePickupStatus | null;
  garbageCollectionRate?: number | null;
  garbageCollectionRateUnit?: string | null;
  garbageCollectionRateCurrency?: string | null;
  productLineTotal?: number | null;
  product?: { id: string; name: string } | null;
};

/** Ensure the API always receives finite numbers (profile JSON uses string decimals). */
function normalizeDeliveryAddress(addr: OrderAddress): OrderAddress {
  const lat = Number(addr.latitude);
  const lng = Number(addr.longitude);
  return { ...addr, latitude: Number.isFinite(lat) ? lat : 0, longitude: Number.isFinite(lng) ? lng : 0 };
}

export const createOrder = (payload: CreateOrderPayload) =>
  api.post<OrderRow>("/orders", { ...payload, deliveryAddress: normalizeDeliveryAddress(payload.deliveryAddress) });

/** Customer: orders you placed (newest first). */
export async function listMyOrders(limit?: number): Promise<OrderRow[]> {
  const q = limit != null ? `?limit=${Math.min(100, Math.max(1, Math.floor(limit)))}` : "";
  const rows = await api.get<OrderRow[]>(`/orders/mine${q}`);
  return Array.isArray(rows) ? rows : [];
}

export async function listMyMerchantOrders(): Promise<OrderRow[]> {
  const rows = await api.get<OrderRow[]>("/orders/my-merchant");
  return Array.isArray(rows) ? rows : [];
}

export const ORDER_STATS_RANGE_DAYS = [7, 14, 30, 90] as const;
export type OrderStatsRangeDays = (typeof ORDER_STATS_RANGE_DAYS)[number];

export type OrderStatsResponse = {
  rangeDays: OrderStatsRangeDays;
  from: string;
  to: string;
  totals: { orders: number; revenue: number; pending: number; accepted: number; rejected: number };
  /** `date` is YYYY-MM-DD, UTC. */
  daily: { date: string; orders: number; revenue: number }[];
  statusBreakdown: { status: OrderRequestStatus; count: number }[];
};

export const getMyMerchantOrderStats = (days: OrderStatsRangeDays) =>
  api.get<OrderStatsResponse>(`/orders/my-merchant/stats?days=${days}`);

export const respondToOrder = (orderId: string, payload: { decision: "accept" | "reject"; rejectionReason?: string }) =>
  api.patch<OrderRow>(`/orders/my-merchant/${orderId}/respond`, payload);

/** Accepted orders for the merchant's delivery run. */
export async function listMerchantDeliveryQueue(): Promise<OrderRow[]> {
  const rows = await api.get<OrderRow[]>("/orders/my-merchant/delivery-queue");
  return Array.isArray(rows) ? rows : [];
}

export const markOrderDelivered = (orderId: string) =>
  api.patch<OrderRow>(`/orders/my-merchant/${orderId}/mark-delivered`, {});

/**
 * Record payment after delivery. `amount` is required for refill orders
 * (gas/water), whose price isn't known until delivery.
 */
export const markMerchantOrderPaid = (orderId: string, payload?: { modeOfPayment?: string; amount?: number }) =>
  api.patch<OrderRow>(`/orders/my-merchant/${orderId}/mark-paid`, payload ?? {});

export const updateLaundryMerchantOrder = (
  orderId: string,
  payload:
    | { action: "set_pickup_en_route" }
    | { action: "set_processing"; weightKg: number; totalPrice: number }
    | { action: "set_out_for_delivery" },
) => api.patch<OrderRow>(`/orders/my-merchant/${orderId}/laundry`, payload);

export const advanceGarbageMerchantPickup = (orderId: string, payload: { to: "pickup_coming" | "picked_up" }) =>
  api.patch<OrderRow>(`/orders/my-merchant/${orderId}/garbage-pickup/advance`, payload);

/** Refill orders have no price until delivery — the merchant must enter the amount collected. */
export function orderNeedsPaymentAmount(order: OrderRow): boolean {
  return order.orderType === "refill" && order.productLineTotal == null;
}

export function isWaterService(title: string | undefined): boolean {
  return /water|mineral/i.test(title ?? "");
}
export function isGasService(title: string | undefined): boolean {
  return /gas|stove|lpg/i.test(title ?? "");
}
export function isLaundryService(title: string | undefined): boolean {
  return /laundry/i.test(title ?? "");
}
export function isGarbageService(title: string | undefined): boolean {
  return /garbage|waste|trash|rubbish|collection/i.test(title ?? "");
}
export function isLaundryOrder(row: Pick<OrderRow, "orderType" | "service">): boolean {
  return row.orderType === "laundry_pickup" || isLaundryService(row.service?.title);
}
export function isGarbageOrder(row: Pick<OrderRow, "orderType">): boolean {
  return row.orderType === "garbage_pickup";
}

export function garbagePickupStatusLabel(status: GarbagePickupStatus | null | undefined): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "pickup_coming":
      return "Pickup on the way";
    case "picked_up":
      return "Picked up";
    case "rejected":
      return "Rejected";
    default:
      return "—";
  }
}

export function laundryPhaseLabel(phase: LaundryPhase | null | undefined, requestAccepted: boolean): string {
  if (!requestAccepted) return "—";
  switch (phase) {
    case null:
    case undefined:
      return "Accepted · schedule pickup";
    case "pickup_en_route":
      return "Pickup on the way";
    case "processing":
      return "In progress (at shop)";
    case "out_for_delivery":
      return "Out for delivery";
    default:
      return String(phase);
  }
}

export function orderTypeLabel(orderType: OrderType): string {
  switch (orderType) {
    case "buy":
      return "Purchase";
    case "refill":
      return "Refill";
    case "laundry_pickup":
      return "Laundry pickup";
    case "garbage_pickup":
      return "Garbage pickup";
    default:
      return orderType;
  }
}

export function requestStatusLabel(status: OrderRequestStatus | undefined): string {
  const s = status ?? "pending";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Map picker output → API order address (a different delivery location). */
export function orderAddressFromPick(p: PickedAddress): OrderAddress {
  const formatted = [p.addressLine1, p.addressLine2, p.city, p.state, p.postalCode, p.country]
    .filter(Boolean)
    .join(", ");
  return {
    line1: (p.addressLine1 || formatted || "Address").trim(),
    line2: p.addressLine2?.trim() || undefined,
    city: p.city?.trim() || "—",
    state: p.state?.trim() || "—",
    postalCode: p.postalCode?.trim() || "—",
    country: p.country?.trim() || "—",
    latitude: Number(p.latitude) || 0,
    longitude: Number(p.longitude) || 0,
    formattedAddress: formatted || undefined,
  };
}

/** Saved profile address → API order address. */
export function deliveryAddressFromUser(user: User | null): OrderAddress | null {
  if (!user?.address) return null;
  const a = user.address;
  const line1 = a.line1?.trim() || a.formattedAddress?.split(",")[0]?.trim() || "";
  if (!line1) return null;
  const lat = Number(a.latitude);
  const lng = Number(a.longitude);
  return {
    line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    latitude: Number.isFinite(lat) ? lat : 0,
    longitude: Number.isFinite(lng) ? lng : 0,
    placeId: a.placeId ?? undefined,
    formattedAddress: a.formattedAddress ?? undefined,
    notes: a.notes ?? undefined,
  };
}

/** Customer-facing coarse status for list rows. */
export type CustomerOrderDisplayStatus = "pending" | "active" | "delivered" | "completed" | "cancelled";

export function getCustomerOrderDisplayStatus(
  row: Pick<OrderRow, "requestStatus" | "delivered" | "paid">,
): CustomerOrderDisplayStatus {
  if (row.requestStatus === "rejected") return "cancelled";
  if (row.requestStatus === "pending" || !row.requestStatus) return "pending";
  if (!row.delivered) return "active";
  if (!row.paid) return "delivered";
  return "completed";
}

export function customerOrderStatusLabel(status: CustomerOrderDisplayStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "active":
      return "In progress";
    case "delivered":
      return "Awaiting payment";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

export function formatOrderListTitle(row: OrderRow): string {
  const svc = row.service?.title?.trim() ?? "Order";
  const merchant = row.merchant?.name?.trim();
  return merchant ? `${svc} · ${merchant}` : svc;
}

export function formatGarbageOrderRate(row: OrderRow): string | null {
  const rate = Number(row.garbageCollectionRate);
  if (row.garbageCollectionRate == null || !Number.isFinite(rate)) return null;
  const currency = (row.garbageCollectionRateCurrency ?? "PHP").trim();
  const unit = row.garbageCollectionRateUnit?.trim();
  const amount = `${currency} ${rate.toFixed(2)}`;
  return unit ? `${amount} ${unit}` : amount;
}

export function formatOrderAmount(row: OrderRow): string {
  if (row.productLineTotal != null && Number.isFinite(Number(row.productLineTotal))) {
    return `PHP ${Number(row.productLineTotal).toFixed(2)}`;
  }
  if (row.laundryTotalPrice != null && Number.isFinite(Number(row.laundryTotalPrice))) {
    return `${(row.laundryCurrency ?? "PHP").trim()} ${Number(row.laundryTotalPrice).toFixed(2)}`;
  }
  return formatGarbageOrderRate(row) ?? "—";
}

export function formatOrderDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Merchant list title for an order row. */
export function merchantOrderTitle(o: OrderRow): string {
  if (isLaundryOrder(o)) return "Laundry pickup";
  if (isGarbageOrder(o)) return "Garbage pickup";
  if (o.orderType === "buy" && o.product) return `Buy · ${o.product.name}`;
  if (o.orderType === "refill") return o.product ? `Refill · ${o.product.name}` : "Refill";
  return "Order";
}

/** Order notification types that should trigger an order-list refresh. */
export const ORDER_NOTIFICATION_TYPES = new Set([
  "merchant_new_order",
  "order_accepted",
  "order_rejected",
  "order_delivered",
  "laundry_updated",
  "garbage_pickup_updated",
  "order_paid",
]);
