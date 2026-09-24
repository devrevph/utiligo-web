/** Address lat/lng arrive from the API as decimal strings (Postgres `decimal`, no numeric transformer). */
export function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Straight-line distance between two coordinates (haversine formula), in km. */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Same assumptions as utiligo-app: local roads rarely run point-to-point, so
// pad straight-line distance, then apply a typical motorcycle speed in mixed
// city/subdivision traffic.
const ROUTE_FACTOR = 1.3;
const MOTORCYCLE_AVG_SPEED_KMH = 30;

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatMotorcycleEta(straightLineDistanceKm: number): string {
  const minutes = ((straightLineDistanceKm * ROUTE_FACTOR) / MOTORCYCLE_AVG_SPEED_KMH) * 60;
  if (minutes < 1) return "<1 min";
  return `~${Math.round(minutes)} min`;
}

/** Bounded 2–10 km, same as utiligo-app (no "all distances" option). */
export const DISTANCE_FILTER_OPTIONS_KM = [2, 5, 10] as const;
export type DistanceFilterKm = (typeof DISTANCE_FILTER_OPTIONS_KM)[number];
