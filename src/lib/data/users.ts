import { api } from "@/lib/api";
import type { PickedAddress, User } from "@/lib/types";
import type { AddressPayload } from "./merchants";

export type CreateProfilePayload = {
  email: string | null;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  address: AddressPayload;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  address?: Partial<AddressPayload>;
};

export const createUserProfile = (payload: CreateProfilePayload) => api.post<User>("/users", payload);
export const fetchUserProfile = () => api.get<User>("/users/me");
export const updateUserProfile = (payload: UpdateProfilePayload) => api.patch<User>("/users/me", payload);
export const deleteMyAccount = () => api.delete<{ deleted: true }>("/users/me");

export function addressPayloadFromPick(p: PickedAddress, notes?: string): AddressPayload {
  const trimmedNotes = notes?.trim();
  return {
    line1: p.addressLine1,
    ...(p.addressLine2 ? { line2: p.addressLine2 } : {}),
    city: p.city,
    state: p.state,
    postalCode: p.postalCode,
    country: p.country,
    latitude: p.latitude,
    longitude: p.longitude,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  };
}
