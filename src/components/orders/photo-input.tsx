"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/primitives";

/** Single optional photo with preview. On phones `capture` offers the camera directly. */
export function PhotoInput({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label} <span className="font-normal text-muted">(optional)</span>
      </label>
      {hint ? <p className="-mt-1 text-xs text-muted">{hint}</p> : null}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {preview ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img src={preview} alt="Selected photo preview" className="h-20 w-20 rounded-lg border border-border object-cover" />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="camera" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button variant="ghost" icon="trash" onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-4 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Icon name="camera" className="h-5 w-5" />
          Take or upload a photo
        </button>
      )}
    </div>
  );
}
