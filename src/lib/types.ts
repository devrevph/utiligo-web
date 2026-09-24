/** Matches the backend Address embeddable (utiligo-api src/common/embeddables/address.embeddable.ts). */
export interface Address {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  /** Postgres `decimal` — arrives as a string; coerce with toFiniteNumber before use. */
  latitude: number | string;
  longitude: number | string;
  placeId: string | null;
  formattedAddress: string | null;
  notes: string | null;
}

export interface Role {
  id: number;
  title: string;
}

export interface User {
  id: string;
  firebaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  address: Address;
  role?: Role;
}

/** Address shape produced by the map picker and the places endpoints. */
export type PickedAddress = {
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Product = {
  id: string;
  merchantId: string;
  merchant?: { id: string; name?: string };
  name: string;
  description?: string | null;
  imageUrls: string[];
  price: number;
  stock: number;
  currency: string;
  isActive: boolean;
  /** Shown in refill flows; the owner sets it when adding/editing the product. */
  refillable?: boolean;
  sku?: string | null;
  category?: string | null;
  unit?: string | null;
};

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  currency?: string;
  isActive?: boolean;
  refillable?: boolean;
  sku?: string;
  category?: string;
  unit?: string;
  imageUrls?: string[];
};

export function formatAddress(
  a:
    | Partial<Pick<Address, "line1" | "line2" | "city" | "state" | "postalCode" | "country" | "formattedAddress">>
    | null
    | undefined,
): string {
  if (!a) return "—";
  if (a.formattedAddress) return a.formattedAddress;
  const joined = [a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ");
  return joined || "—";
}

export function formatPickedAddress(p: PickedAddress): string {
  return [p.addressLine1, p.addressLine2, p.city, p.state, p.postalCode, p.country].filter(Boolean).join(", ");
}

export function formatMoney(amount: number | string | null | undefined, currency = "PHP"): string {
  const n = Number(amount);
  if (amount == null || !Number.isFinite(n)) return "—";
  return `${currency.trim() || "PHP"} ${n.toFixed(2)}`;
}
