"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProductForm, type ProductFormValues } from "@/components/merchant/product-form";
import { Card, ErrorState, PageHeader, PageSpinner } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { getProduct, updateProduct } from "@/lib/data/products";
import { uploadProductImage } from "@/lib/data/storage";
import { useResource } from "@/lib/hooks/use-resource";
import { useMerchantStore } from "@/lib/stores/merchant";
import { toast } from "@/lib/stores/ui";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const merchant = useMerchantStore((s) => s.merchant);
  const { data: product, error: loadError, reload } = useResource(() => getProduct(id), `product-${id}`, "Couldn't load this product.");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async ({ input, keptImageUrls, newFiles }: ProductFormValues) => {
    if (!merchant || !product) return;
    setSaving(true);
    setError(null);
    // Upload first, stopping at the first failure — but still save the other
    // edits plus whatever uploaded, so nothing is orphaned in Storage.
    const imageUrls = [...keptImageUrls];
    let uploadFailed = false;
    for (const file of newFiles) {
      try {
        imageUrls.push(await uploadProductImage(merchant.id, product.id, file));
      } catch {
        uploadFailed = true;
        break;
      }
    }
    try {
      await updateProduct(product.id, { ...input, imageUrls });
      toast(
        uploadFailed
          ? { tone: "error", title: "Saved, but some photos didn't upload", body: "Try adding the rest again." }
          : { tone: "success", title: "Product updated" },
      );
      router.push("/merchant/products");
    } catch (e) {
      setError(errorMessage(e, "Couldn't save the product."));
      setSaving(false);
    }
  };

  return (
    <>
      <title>Edit product · Business · Utiligo</title>
      <PageHeader title={product?.name ?? "Edit product"} back={{ href: "/merchant/products", label: "Products" }} />
      {loadError ? (
        <Card>
          <ErrorState message={loadError} onRetry={reload} />
        </Card>
      ) : !product ? (
        <PageSpinner />
      ) : (
        <ProductForm initial={product} submitLabel="Save changes" onSubmit={(v) => void save(v)} saving={saving} error={error} />
      )}
    </>
  );
}
