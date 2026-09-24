import type { OrderRow } from "@/lib/data/orders";

/** Maps `destination` for an order — coordinates preferred, else the address text. */
export function stopQueryForOrder(order: Pick<OrderRow, "deliveryAddress">): string | null {
  const a = order.deliveryAddress;
  if (!a) return null;
  const lat = Number(a.latitude);
  const lng = Number(a.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) return `${lat},${lng}`;
  const addr = (a.formattedAddress ?? [a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")).trim();
  return addr || null;
}

/** @see https://developers.google.com/maps/documentation/urls/get-started#directions-action */
export function directionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.trim())}&travelmode=driving`;
}

/** @see https://developers.google.com/maps/documentation/urls/get-started#search-action */
export function searchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

/** Max stops per Maps link (waypoints + destination) to stay within URL limits. */
export const MAX_STOPS_PER_ROUTE = 23;

/** One multi-stop route, oldest orders first. */
export function multiStopRoute(orders: OrderRow[]): {
  url: string;
  usedCount: number;
  skippedNoAddress: number;
  truncated: boolean;
} | null {
  const stops = [...orders]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(stopQueryForOrder);
  const usable = stops.filter((s): s is string => s !== null);
  if (usable.length === 0) return null;
  const capped = usable.slice(0, MAX_STOPS_PER_ROUTE);
  const last = capped[capped.length - 1];
  const waypoints = capped.slice(0, -1).join("|");
  return {
    url:
      capped.length === 1
        ? directionsUrl(last)
        : `https://www.google.com/maps/dir/?api=1&waypoints=${encodeURIComponent(waypoints)}&destination=${encodeURIComponent(last)}&travelmode=driving`,
    usedCount: capped.length,
    skippedNoAddress: stops.length - usable.length,
    truncated: usable.length > MAX_STOPS_PER_ROUTE,
  };
}
