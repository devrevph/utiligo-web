import { api } from "@/lib/api";
import type { Product, ProductInput } from "@/lib/types";

type ProductRow = Partial<Product> & { merchant?: { id: string | number; name?: string } };

function normalizeProduct(row: ProductRow): Product {
  return {
    id: String(row?.id ?? ""),
    merchantId: String(row?.merchantId ?? row?.merchant?.id ?? ""),
    merchant: row?.merchant ? { id: String(row.merchant.id), name: row.merchant.name } : undefined,
    name: String(row?.name ?? ""),
    description: row?.description ?? null,
    imageUrls: Array.isArray(row?.imageUrls) ? row.imageUrls.map(String) : [],
    price: Number(row?.price ?? 0),
    stock: Number(row?.stock ?? 0),
    currency: String(row?.currency ?? "PHP"),
    isActive: Boolean(row?.isActive ?? true),
    refillable: Boolean(row?.refillable ?? false),
    sku: row?.sku ?? null,
    category: row?.category ?? null,
    unit: row?.unit ?? null,
  };
}

// The merchant is inferred server-side from the token for all /my-merchant routes.
export async function createProduct(input: ProductInput): Promise<Product> {
  return normalizeProduct(await api.post<ProductRow>("/products/my-merchant", input));
}

export async function getProduct(productId: string): Promise<Product> {
  return normalizeProduct(await api.get<ProductRow>(`/products/my-merchant/${encodeURIComponent(productId)}`));
}

export async function listMyProducts(): Promise<Product[]> {
  const rows = await api.get<ProductRow[]>("/products/my-merchant");
  return Array.isArray(rows) ? rows.map(normalizeProduct) : [];
}

/** Catalog for a specific merchant (no auth; active products only). */
export async function listPublicMerchantProducts(merchantId: string): Promise<Product[]> {
  const rows = await api.get<ProductRow[]>(`/products/merchant/${encodeURIComponent(merchantId)}`);
  return Array.isArray(rows) ? rows.map(normalizeProduct) : [];
}

export async function updateProduct(productId: string, patch: Partial<ProductInput>): Promise<Product> {
  return normalizeProduct(await api.patch<ProductRow>(`/products/my-merchant/${encodeURIComponent(productId)}`, patch));
}

export const deleteProduct = (productId: string) =>
  api.delete<unknown>(`/products/my-merchant/${encodeURIComponent(productId)}`);
