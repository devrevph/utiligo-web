"use client";

import { useState } from "react";
import { errorMessage } from "@/lib/api";
import { pickCurrentLocation } from "@/lib/data/places";
import { formatPickedAddress, type PickedAddress } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { Button, cx } from "@/components/ui/primitives";
import { AddressPickerDialog } from "./address-picker";

/**
 * Pinned-address summary with "pin on map" / "use current location" actions.
 * `currentLabel` shows a saved address when nothing new has been picked yet.
 */
export function LocationField({
  label,
  value,
  onChange,
  currentLabel,
  initial,
  pickerTitle,
  required,
  error,
}: {
  label: string;
  value: PickedAddress | null;
  onChange: (value: PickedAddress) => void;
  currentLabel?: string;
  initial?: { latitude: unknown; longitude: unknown } | null;
  pickerTitle: string;
  required?: boolean;
  error?: string | null;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const pickCurrent = async () => {
    setLocating(true);
    setLocateError(null);
    try {
      onChange(await pickCurrentLocation());
    } catch (e) {
      setLocateError(errorMessage(e, "Couldn't get your location. Pin it on the map instead."));
    } finally {
      setLocating(false);
    }
  };

  const shownError = error ?? locateError;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">
        {label}
        {required ? null : <span className="font-normal text-muted"> (optional)</span>}
      </span>
      <div
        className={cx(
          "flex items-start gap-3 rounded-xl border p-3.5",
          value ? "border-accent/40 bg-accent-tint" : currentLabel ? "border-border bg-surface-2" : "border-dashed border-border-strong",
        )}
      >
        <Icon name="map-pin" className={cx("mt-0.5 h-5 w-5 shrink-0", value ? "text-accent" : "text-muted")} />
        <div className="min-w-0 text-sm">
          {value ? (
            <>
              <p className="font-medium text-ink">{formatPickedAddress(value)}</p>
              {currentLabel ? <p className="mt-1 text-xs text-muted">New location — save to apply.</p> : null}
            </>
          ) : currentLabel ? (
            <p className="text-ink">{currentLabel}</p>
          ) : (
            <p className="text-muted">No location pinned yet.</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon="map" onClick={() => setPickerOpen(true)}>
          {value || currentLabel ? "Change on map" : "Pin on map"}
        </Button>
        <Button variant="ghost" icon="locate" loading={locating} onClick={() => void pickCurrent()}>
          Use current location
        </Button>
      </div>
      {shownError ? (
        <p role="alert" className="text-sm text-danger">
          {shownError}
        </p>
      ) : null}
      <AddressPickerDialog
        open={pickerOpen}
        title={pickerTitle}
        initial={value ?? initial}
        onClose={() => setPickerOpen(false)}
        onConfirm={(picked) => {
          onChange(picked);
          setLocateError(null);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
