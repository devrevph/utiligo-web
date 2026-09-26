import { API_BASE_URL } from "./api-base-url";

export type MerchantService = {
  id: number;
  title: string;
  description: string | null;
};

// Matches the same regexes utiligo-app uses (isWaterMerchantService,
// isGasMerchantService, etc.) so both surfaces categorize services identically.
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
  tagline: "Order from verified local merchants near you.",
};

export function metaForService(title: string): ServiceMeta {
  return SERVICE_META.find((s) => s.test.test(title))?.meta ?? FALLBACK_META;
}

export async function getServices(): Promise<MerchantService[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/merchants/services`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
