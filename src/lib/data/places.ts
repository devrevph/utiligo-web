import { api } from "@/lib/api";
import type { PickedAddress } from "@/lib/types";

export type PlaceSuggestion = { placeId: string; description: string };

export async function searchPlaces(input: string): Promise<PlaceSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 2) return [];
  const data = await api.get<{ suggestions: PlaceSuggestion[] }>(
    `/users/places/autocomplete?input=${encodeURIComponent(trimmed)}`,
  );
  return data.suggestions ?? [];
}

export const getPlaceDetails = (placeId: string) =>
  api.get<PickedAddress>(`/users/places/details?placeId=${encodeURIComponent(placeId)}`);

export const reverseGeocode = (latitude: number, longitude: number) =>
  api.get<PickedAddress>(`/users/places/reverse?lat=${latitude}&lng=${longitude}`);

export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location isn't available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? "Location access was blocked. Allow it in your browser, or pin your address on the map."
              : "Couldn't get your location. Try again, or pin your address on the map.",
          ),
        ),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}

export async function pickCurrentLocation(): Promise<PickedAddress> {
  const { latitude, longitude } = await getCurrentPosition();
  return reverseGeocode(latitude, longitude);
}
