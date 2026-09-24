"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductForm, type ProductFormValues } from "@/components/merchant/product-form";
import { PageHeader } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { createProduct, updateProduct } from "@/lib/data/products";
import { uploadProductImage } from "@/lib/data/storage";
import { useMerchantStore } from "@/lib/stores/merchant";
import { toast } from "@/lib/stores/ui";

export default function NewProductPage() {
  const router = useRouter();
  const merchant = useMerchantStore((s) => s.merchant);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async ({ input, newFiles }: ProductFormValues) => {
    if (!merchant) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createProduct(input);
      // The product exists from here on: any failure below must not send the
      // user back to this form, where saving again would create a duplicate.
      const uploaded: string[] = [];
      let uploadFailed = false;
      for (const file of newFiles) {
        try {
          uploaded.push(await uploadProductImage(merchant.id, created.id, file));
        } catch {
          uploadFailed = true;
          break;
        }
      }
      if (uploaded.length) {
        try {
          await updateProduct(created.id, { imageUrls: uploaded });
        } catch {
          uploadFailed = true;
        }
      }
      toast(
        uploadFailed
          ? { tone: "error", title: "Product saved, but some photos didn't upload", body: "Open it to add them again." }
          : { tone: "success", title: "Product added" },
      );
      router.replace("/merchant/products");
    } catch (e) {
      setError(errorMessage(e, "Couldn't save the product."));
      setSaving(false);
    }
  };

  return (
    <>
      <title>New product · Business · Utiligo</title>
      <PageHeader title="New product" back={{ href: "/merchant/products", label: "Products" }} />
      <ProductForm submitLabel="Save product" onSubmit={(v) => void save(v)} saving={saving} error={error} />
    </>
  );
}
