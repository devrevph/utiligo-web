import { api } from "@/lib/api";
import type { MerchantVerificationStatus } from "./verification";

export const GARBAGE_COLLECTION_RATE_UNITS = ["per bag", "per trip", "per kg", "per load", "flat rate"] as const;
export type GarbageCollectionRateUnit = (typeof GARBAGE_COLLECTION_RATE_UNITS)[number];

export type GarbageCollectionRateFields = {
  garbageCollectionRate?: number | null;
  garbageCollectionRateUnit?: string | null;
  garbageCollectionRateCurrency?: string | null;
};

export const WEEK_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export type DayHours = { closed: boolean; open?: string; close?: string };
export type OperatingHours = Record<WeekDay, DayHours>;

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { closed: false, open: "09:00", close: "18:00" },
  tuesday: { closed: false, open: "09:00", close: "18:00" },
  wednesday: { closed: false, open: "09:00", close: "18:00" },
  thursday: { closed: false, open: "09:00", close: "18:00" },
  friday: { closed: false, open: "09:00", close: "18:00" },
  saturday: { closed: false, open: "09:00", close: "18:00" },
  sunday: { closed: true },
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidOperatingHours(hours: OperatingHours): boolean {
  return WEEK_DAYS.every((day) => {
    const d = hours[day];
    if (!d) return false;
    if (d.closed) return true;
    return !!d.open && !!d.close && TIME_PATTERN.test(d.open) && TIME_PATTERN.test(d.close) && d.open < d.close;
  });
}

export type MerchantService = { id: number; title: string; description?: string | null };

export type MerchantAddress = {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | string;
  longitude: number | string;
  placeId?: string | null;
  formattedAddress?: string | null;
  notes?: string | null;
};

export type AddressPayload = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  notes?: string;
};

export type CreateMerchantPayload = {
  name: string;
  description?: string;
  serviceId: number;
  mobileNumber: string;
  telephoneNo?: string;
  address: AddressPayload;
  operatingHours?: OperatingHours;
};

export type MyMerchant = {
  id: string;
  name: string;
  description?: string | null;
  mobileNumber: string;
  telephoneNo?: string | null;
  verificationStatus: MerchantVerificationStatus;
  service: MerchantService;
  address?: MerchantAddress;
  operatingHours?: OperatingHours | null;
} & GarbageCollectionRateFields;

/** Merchant card for customer discovery. */
export type PublicMerchant = MyMerchant & { address: MerchantAddress };

export type UpdateMyMerchantPayload = {
  name?: string;
  description?: string;
  mobileNumber?: string;
  telephoneNo?: string;
  address?: Partial<AddressPayload>;
  operatingHours?: OperatingHours;
};

export const createMerchant = (data: CreateMerchantPayload) => api.post<MyMerchant>("/merchants", data);
export const listMerchantServices = () => api.get<MerchantService[]>("/merchants/services");
export const getMyMerchant = () => api.get<MyMerchant | null>("/merchants/me");
export const updateMyMerchant = (payload: UpdateMyMerchantPayload) => api.patch<MyMerchant>("/merchants/me", payload);
export const deleteMyMerchant = () => api.delete<{ deleted: true }>("/merchants/me");
export const getPublicMerchant = (merchantId: string) =>
  api.get<PublicMerchant>(`/merchants/${encodeURIComponent(merchantId)}`);

export async function listMerchantsByService(serviceId: number): Promise<PublicMerchant[]> {
  const rows = await api.get<PublicMerchant[]>(`/merchants/by-service/${serviceId}`);
  return Array.isArray(rows) ? rows : [];
}

export const updateMyGarbageCollectionRate = (
  payload: { rate: number; unit: GarbageCollectionRateUnit; currency?: string } | { clear: true },
) => api.patch<MyMerchant>("/merchants/me/garbage-collection-rate", payload);

export type TodayOperatingStatus = { open: boolean; label: string };

/** Today's open/closed status for a merchant, in the viewer's local time. */
export function getTodayOperatingStatus(
  hours: OperatingHours | null | undefined,
  now: Date = new Date(),
): TodayOperatingStatus | null {
  if (!hours) return null;
  const day = hours[WEEK_DAYS[(now.getDay() + 6) % 7]];
  if (!day) return null;
  if (day.closed || !day.open || !day.close) return { open: false, label: "Closed today" };

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = day.open.split(":").map(Number);
  const [closeH, closeM] = day.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (minutesNow >= openMinutes && minutesNow < closeMinutes) {
    return { open: true, label: `Open now · closes ${day.close}` };
  }
  if (minutesNow < openMinutes) return { open: false, label: `Closed · opens ${day.open}` };
  return { open: false, label: `Closed · today ${day.open}–${day.close}` };
}

export function formatGarbageCollectionRate(merchant: GarbageCollectionRateFields | null | undefined): string | null {
  if (!merchant) return null;
  const rate = Number(merchant.garbageCollectionRate);
  if (merchant.garbageCollectionRate == null || !Number.isFinite(rate)) return null;
  const currency = (merchant.garbageCollectionRateCurrency ?? "PHP").trim() || "PHP";
  const unit = merchant.garbageCollectionRateUnit?.trim();
  const amount = `${currency} ${rate.toFixed(2)}`;
  return unit ? `${amount} ${unit}` : amount;
}
