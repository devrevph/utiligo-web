import type { MerchantService } from "@/lib/data/merchants";

export type ServiceSlug = "water" | "gas" | "laundry" | "garbage";

/** Which extra request a merchant page offers besides buying catalog products. */
export type ServiceRequestKind = "refill" | "laundry_pickup" | "garbage_pickup";

export type ServiceConfig = {
  slug: ServiceSlug;
  name: string;
  /** Same matching rules as utiligo-app, so both clients map API services identically. */
  match: RegExp;
  icon: "water" | "flame" | "shirt" | "trash";
  /** CSS custom properties from globals.css. */
  color: string;
  tint: string;
  listSubtitle: string;
  merchantSubtitle: string;
  requestKind: ServiceRequestKind;
  requestCta: string;
  requestTitle: string;
  requestSubmit: string;
  requestNotesLabel: string;
  requestNotesPlaceholder: string;
};

export const SERVICES: ServiceConfig[] = [
  {
    slug: "water",
    name: "Mineral water",
    match: /mineral|water/i,
    icon: "water",
    color: "var(--water)",
    tint: "var(--water-tint)",
    listSubtitle: "Choose a merchant to browse products and send a refill or purchase request.",
    merchantSubtitle: "Browse products and place a refill or purchase request.",
    requestKind: "refill",
    requestCta: "Request water refill",
    requestTitle: "Refill request",
    requestSubmit: "Send refill request",
    requestNotesLabel: "Container / notes (optional)",
    requestNotesPlaceholder: "e.g. 5-gallon slim",
  },
  {
    slug: "gas",
    name: "Gas for stoves",
    match: /gas|stove|lpg/i,
    icon: "flame",
    color: "var(--gas)",
    tint: "var(--gas-tint)",
    listSubtitle: "Choose a merchant to browse products and send a refill or purchase request.",
    merchantSubtitle: "Browse products and place a refill or purchase request.",
    requestKind: "refill",
    requestCta: "Request gas refill",
    requestTitle: "Refill request",
    requestSubmit: "Send refill request",
    requestNotesLabel: "Container / notes (optional)",
    requestNotesPlaceholder: "e.g. 11 kg LPG tank",
  },
  {
    slug: "laundry",
    name: "Laundry pickup",
    match: /laundry/i,
    icon: "shirt",
    color: "var(--laundry)",
    tint: "var(--laundry-tint)",
    listSubtitle: "Choose a shop, then request pickup from your address.",
    merchantSubtitle:
      "Buy from the catalog or request laundry pickup. Weight and price are confirmed after your laundry arrives.",
    requestKind: "laundry_pickup",
    requestCta: "Request laundry pickup",
    requestTitle: "Laundry pickup",
    requestSubmit: "Send pickup request",
    requestNotesLabel: "Notes for the shop (optional)",
    requestNotesPlaceholder: "e.g. 2 bags, side gate, fragile items",
  },
  {
    slug: "garbage",
    name: "Garbage collection",
    // Checked last: "collection" is broad, and water/gas/laundry titles must win first.
    match: /garbage|waste|trash|rubbish|collection/i,
    icon: "trash",
    color: "var(--garbage)",
    tint: "var(--garbage-tint)",
    listSubtitle: "Choose a merchant to see their collection rate and request a pickup.",
    merchantSubtitle: "Buy products or request garbage collection from this merchant.",
    requestKind: "garbage_pickup",
    requestCta: "Request garbage pickup",
    requestTitle: "Garbage pickup request",
    requestSubmit: "Send pickup request",
    requestNotesLabel: "Pickup instructions (optional)",
    requestNotesPlaceholder: "e.g. Bags by the gate, 2nd floor",
  },
];

export function serviceBySlug(slug: string): ServiceConfig | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function serviceForTitle(title: string | undefined): ServiceConfig | undefined {
  return SERVICES.find((s) => s.match.test(title ?? ""));
}

/** The API service row that backs a web service page. */
export function findApiService(services: MerchantService[], config: ServiceConfig): MerchantService | undefined {
  return services.find((s) => serviceForTitle(s.title)?.slug === config.slug);
}
