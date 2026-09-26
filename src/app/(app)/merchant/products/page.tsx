"use client";

import Link from "next/link";
import { confirm } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Badge, ButtonLink, Card, EmptyState, ErrorState, PageSpinner } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { deleteProduct, listMyProducts } from "@/lib/data/products";
import { toast } from "@/lib/stores/ui";
import { formatMoney, type Product } from "@/lib/types";

export default function ProductsPage() {
  const { data: products, error, reload, setData: setProducts } = useResource(listMyProducts, "my-products");


  const remove = async (p: Product) => {
    const ok = await confirm({ title: `Delete "${p.name}"?`, body: "Customers will no longer see it.", confirmLabel: "Delete", tone: "danger" });
    if (!ok) return;
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev?.filter((x) => x.id !== p.id) ?? prev);
      toast({ tone: "success", title: "Product deleted" });
    } catch (e) {
      toast({ tone: "error", title: "Couldn't delete", body: errorMessage(e, "Try again.") });
    }
  };

  const addButton = (
    <ButtonLink href="/merchant/products/new" icon="plus" tone="var(--merchant)">
      Add product
    </ButtonLink>
  );

  return (
    <>
      <title>Products · Business · Utiligo</title>
      <div className="mb-5 flex justify-end">{addButton}</div>
      {error ? (
        <Card>
          <ErrorState message="Couldn't load your products." onRetry={reload} />
        </Card>
      ) : products === null ? (
        <PageSpinner />
      ) : products.length === 0 ? (
        <Card>
          <EmptyState icon="package" title="No products yet" body="Add what you sell so customers can order it." action={addButton} />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <Link href={`/merchant/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-muted">
                    {p.imageUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Firebase Storage URLs
                      <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon name="image" className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{p.name}</span>
                      {!p.isActive ? <Badge>Inactive</Badge> : null}
                      {p.refillable ? <Badge tone="info">Refillable</Badge> : null}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatMoney(p.price, p.currency)} · Stock {p.stock}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(p)}
                  className="rounded-lg p-2 text-muted hover:bg-danger-tint hover:text-danger"
                  aria-label={`Delete ${p.name}`}
                >
                  <Icon name="trash" className="h-4.5 w-4.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
