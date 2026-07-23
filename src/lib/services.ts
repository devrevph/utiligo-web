const API_BASE_URL =
  process.env.NEXT_PUBLIC_UTILIGO_API_BASE_URL ??
  "https://utiligo-api-production.up.railway.app";

export type StationService = {
  id: number;
  title: string;
  description: string | null;
};

// Matches the same regexes utiligo-app uses (isWaterStationService,
// isGasStationService, etc.) so both surfaces categorize services identically.
export type ServiceMeta = {
  icon: "water" | "flame" | "shirt" | "trash" | "store";
  tagline: string;
};

const SERVICE_META: { test: RegExp; meta: ServiceMeta }[] = [
  {
    test: /mineral|water/i,
    meta: { icon: "water", tagline: "Refill or buy purified water, delivered to your door." },
  },
  {
    test: /gas|stove|lpg/i,
    meta: { icon: "flame", tagline: "LPG tank refills and swaps, without the trip to the depot." },
  },
  {
    test: /laundry/i,
    meta: { icon: "shirt", tagline: "Pickup, wash, and delivery from a shop near you." },
  },
  {
    test: /garbage|waste|trash|rubbish|collection/i,
    meta: { icon: "trash", tagline: "Scheduled pickup for household waste and bulk trash." },
  },
];

const FALLBACK_META: ServiceMeta = {
  icon: "store",
  tagline: "Order from verified local stations near you.",
};

export function metaForService(title: string): ServiceMeta {
  return SERVICE_META.find((s) => s.test.test(title))?.meta ?? FALLBACK_META;
}

export async function getServices(): Promise<StationService[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/stations/services`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
