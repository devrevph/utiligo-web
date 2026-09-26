"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useState } from "react";
import { errorMessage } from "@/lib/api";
import {
  getCurrentPosition,
  getPlaceDetails,
  reverseGeocode,
  searchPlaces,
  type PlaceSuggestion,
} from "@/lib/data/places";
import { toFiniteNumber } from "@/lib/distance";
import type { PickedAddress } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { Button, Dialog, Spinner } from "@/components/ui/primitives";
import type { LatLng } from "./map-canvas";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-accent">
      <Spinner />
    </div>
  ),
});

// Quezon City — same default as utiligo-app's map picker.
const DEFAULT_CENTER: LatLng = { latitude: 14.676, longitude: 121.0437 };
const SEARCH_DEBOUNCE_MS = 300;

export function AddressPickerDialog({
  open,
  title,
  initial,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  /** Existing location to start from (e.g. the saved profile address). */
  initial?: { latitude: unknown; longitude: unknown } | null;
  onClose: () => void;
  onConfirm: (address: PickedAddress) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="xl">
      {open ? <PickerBody initial={initial} onConfirm={onConfirm} onCancel={onClose} /> : null}
    </Dialog>
  );
}

function PickerBody({
  initial,
  onConfirm,
  onCancel,
}: {
  initial?: { latitude: unknown; longitude: unknown } | null;
  onConfirm: (address: PickedAddress) => void;
  onCancel: () => void;
}) {
  const initialLat = toFiniteNumber(initial?.latitude);
  const initialLng = toFiniteNumber(initial?.longitude);
  const start = initialLat != null && initialLng != null && !(initialLat === 0 && initialLng === 0)
    ? { latitude: initialLat, longitude: initialLng }
    : null;

  const [marker, setMarker] = useState<LatLng | null>(start);
  const [focus, setFocus] = useState<(LatLng & { key: number }) | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState<"place" | "locate" | "confirm" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listId = useId();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(trimmed);
        if (!cancelled) setSuggestions(results);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Short queries show nothing without clearing state, so a stale result can't flash back.
  const queryReady = query.trim().length >= 2;
  const shownSuggestions = queryReady ? suggestions : [];

  const moveTo = useCallback((p: LatLng) => {
    setMarker(p);
    setFocus({ ...p, key: Date.now() });
  }, []);

  const handlePick = useCallback((p: LatLng) => {
    setMarker(p);
    setSuggestions([]);
    setError(null);
  }, []);

  const selectSuggestion = async (s: PlaceSuggestion) => {
    setQuery(s.description);
    setSuggestions([]);
    setBusy("place");
    setError(null);
    try {
      const place = await getPlaceDetails(s.placeId);
      moveTo({ latitude: place.latitude, longitude: place.longitude });
    } catch {
      setError("Couldn't load that place. Try again or tap the map.");
    } finally {
      setBusy(null);
    }
  };

  const locateMe = async () => {
    setBusy("locate");
    setError(null);
    try {
      moveTo(await getCurrentPosition());
    } catch (e) {
      setError(errorMessage(e, "Couldn't get your location."));
    } finally {
      setBusy(null);
    }
  };

  const confirmLocation = async () => {
    if (!marker) {
      setError("Search for a place or tap the map to drop a pin first.");
      return;
    }
    setBusy("confirm");
    setError(null);
    try {
      onConfirm(await reverseGeocode(marker.latitude, marker.longitude));
    } catch (e) {
      setError(errorMessage(e, "Address lookup failed. Try again."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={`${listId}-q`} className="sr-only">
            Search for a place or address
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <Icon name="search" className="h-4.5 w-4.5" />
          </span>
          <input
            id={`${listId}-q`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a place or address"
            autoComplete="off"
            role="combobox"
            aria-expanded={shownSuggestions.length > 0}
            aria-controls={listId}
            className="w-full rounded-lg border border-border-strong bg-surface py-2.5 pl-10 pr-10 text-[15px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          {(queryReady && searching) || busy === "place" ? (
            <span className="absolute inset-y-0 right-3 flex items-center text-accent">
              <Spinner className="h-4 w-4" />
            </span>
          ) : null}
          {shownSuggestions.length > 0 ? (
            <ul
              id={listId}
              role="listbox"
              className="absolute inset-x-0 top-full z-[1000] mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
            >
              {shownSuggestions.map((s) => (
                <li key={s.placeId} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => void selectSuggestion(s)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
                  >
                    <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {s.description}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Button variant="secondary" icon="locate" loading={busy === "locate"} onClick={() => void locateMe()}>
          Use my location
        </Button>
      </div>

      <div className="h-[min(55dvh,26rem)] overflow-hidden rounded-xl border border-border">
        <MapCanvas initialCenter={start ?? DEFAULT_CENTER} marker={marker} focus={focus} onPick={handlePick} />
      </div>

      <p className="text-xs text-muted">Search above, or tap the map to place a pin. Drag the pin to adjust.</p>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel} disabled={busy === "confirm"}>
          Cancel
        </Button>
        <Button icon="check" loading={busy === "confirm"} disabled={!marker || busy === "place"} onClick={() => void confirmLocation()}>
          Use this location
        </Button>
      </div>
    </div>
  );
}
