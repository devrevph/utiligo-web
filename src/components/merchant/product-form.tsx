"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, ProductInput } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { Button, Card, Switch, TextAreaField, TextField } from "@/components/ui/primitives";

export type ProductFormValues = {
  input: ProductInput;
  /** Already-uploaded image URLs to keep. */
  keptImageUrls: string[];
  /** New files to upload. */
  newFiles: File[];
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
  saving,
  error,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    stock: initial ? String(initial.stock) : "",
    currency: initial?.currency ?? "PHP",
    unit: initial?.unit ?? "",
    sku: initial?.sku ?? "",
    category: initial?.category ?? "",
  });
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [refillable, setRefillable] = useState(initial?.refillable ?? false);
  const [keptImageUrls, setKeptImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [attempted, setAttempted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const price = Number(form.price);
  const stock = Number(form.stock);
  const errors = {
    name: !form.name.trim() ? "Enter a product name." : null,
    price: form.price.trim() === "" || !Number.isFinite(price) || price < 0 ? "Enter a price of 0 or more." : null,
    stock: form.stock.trim() === "" || !Number.isInteger(stock) || stock < 0 ? "Enter a whole number of 0 or more." : null,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (errors.name || errors.price || errors.stock) return;
    onSubmit({
      input: {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        stock,
        currency: form.currency.trim() || "PHP",
        unit: form.unit.trim() || undefined,
        sku: form.sku.trim() || undefined,
        category: form.category.trim() || undefined,
        isActive,
        refillable,
      },
      keptImageUrls,
      newFiles,
    });
  };

  const show = (msg: string | null) => (attempted ? msg : null);

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-4">
        <TextField label="Product name" placeholder="e.g. Mineral water (5 gallon)" value={form.name} onChange={set("name")} error={show(errors.name)} />
        <TextAreaField label="Description" optional value={form.description} onChange={set("description")} />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Price" inputMode="decimal" placeholder="0.00" value={form.price} onChange={set("price")} error={show(errors.price)} />
          <TextField label="Currency" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} />
          <TextField label="Stock" inputMode="numeric" placeholder="0" value={form.stock} onChange={set("stock")} error={show(errors.stock)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Unit" optional placeholder="e.g. gallon" value={form.unit} onChange={set("unit")} />
          <TextField label="SKU" optional value={form.sku} onChange={set("sku")} />
          <TextField label="Category" optional value={form.category} onChange={set("category")} />
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <Switch
            label="Refillable"
            description="Customers can choose this item in a refill request (water, gas tank size, etc.)."
            checked={refillable}
            onChange={setRefillable}
            tone="var(--merchant)"
          />
          <Switch
            label="Active"
            description="Inactive products are hidden from customers."
            checked={isActive}
            onChange={setIsActive}
            tone="var(--merchant)"
          />
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">Photos</h2>
          {keptImageUrls.length + newFiles.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2">
              {keptImageUrls.map((url) => (
                <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Firebase Storage URLs */}
                  <img src={url} alt="Product photo" className="h-full w-full object-cover" />
                  <RemoveButton onClick={() => setKeptImageUrls((prev) => prev.filter((u) => u !== url))} />
                </li>
              ))}
              {previews.map((url, i) => (
                <li key={url} className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-merchant">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img src={url} alt="New photo, not uploaded yet" className="h-full w-full object-cover" />
                  <RemoveButton onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No photos yet. Products with photos get more orders.</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Add product photos"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setNewFiles((prev) => [...prev, ...files]);
              e.target.value = "";
            }}
          />
          <Button variant="secondary" icon="image" className="self-start" onClick={() => fileRef.current?.click()}>
            Add photos
          </Button>
        </Card>

        {error ? (
          <p role="alert" className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" loading={saving} tone="var(--merchant)" icon="check" className="self-start">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove photo"
      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
    >
      <Icon name="x" className="h-3.5 w-3.5" />
    </button>
  );
}
