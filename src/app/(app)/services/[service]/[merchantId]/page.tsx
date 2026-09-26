"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { OpenStatus, VerifiedPill } from "@/components/app/merchant-bits";
import { ServiceGlyph } from "@/components/app/service-glyph";
import { OrderFormDialog, type OrderIntent } from "@/components/orders/order-form-dialog";
import { Icon } from "@/components/ui/icon";
import { Button, Card, EmptyState, ErrorState, PageHeader, PageSpinner, SectionTitle } from "@/components/ui/primitives";
import { formatGarbageCollectionRate, getPublicMerchant } from "@/lib/data/merchants";
import { listPublicMerchantProducts } from "@/lib/data/products";
import { isMerchantVerified } from "@/lib/data/verification";
import { useResource } from "@/lib/hooks/use-resource";
import { serviceBySlug } from "@/lib/service-config";
import { toast } from "@/lib/stores/ui";
import { formatAddress, formatMoney } from "@/lib/types";

export default function MerchantShopPage() {
  const router = useRouter();
  const { service: slug, merchantId } = useParams<{ service: string; merchantId: string }>();
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const [intent, setIntent] = useState<OrderIntent | null>(null);
  const { data, error, loading, reload } = useResource(
    async () => {
      const [merchant, products] = await Promise.all([getPublicMerchant(merchantId), listPublicMerchantProducts(merchantId)]);
      return { merchant, products };
    },
    `shop-${merchantId}`,
  );

  const back = { href: `/services/${service.slug}`, label: service.name };

  if (!data && loading) return <PageSpinner />;
  if (error || !data) {
    return (
      <>
        <PageHeader title="Merchant" back={back} />
        <Card>
          <ErrorState message="Couldn't load this merchant." onRetry={reload} />
        </Card>
      </>
    );
  }

  const { merchant, products } = data;
  const rate = service.slug === "garbage" ? formatGarbageCollectionRate(merchant) : null;

  return (
    <>
      <title>{`${merchant.name} · Utiligo`}</title>
      <PageHeader title={merchant.name} subtitle={service.merchantSubtitle} back={back} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 lg:order-1">
          <SectionTitle>{service.slug === "laundry" ? "Shop catalog" : "Products"}</SectionTitle>
          {products.length === 0 ? (
            <Card>
              <EmptyState icon="package" title="No products listed yet" />
            </Card>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
                  <div className="aspect-[4/3] bg-surface-2">
                    {p.imageUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Firebase Storage URLs
                      <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted">
                        <Icon name="image" className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="font-semibold text-ink">{p.name}</p>
                    {p.unit ? <p className="text-xs text-muted">{p.unit}</p> : null}
                    {p.description ? <p className="line-clamp-2 text-sm text-muted">{p.description}</p> : null}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <span className="font-semibold" style={{ color: service.color }}>
                        {formatMoney(p.price, p.currency)}
                      </span>
                      <Button variant="secondary" onClick={() => setIntent({ kind: "buy", product: p })}>
                        Buy
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="order-1 flex flex-col gap-4 lg:order-2">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ServiceGlyph service={service} size="lg" />
              <div className="flex flex-col gap-1">
                {isMerchantVerified(merchant.verificationStatus) ? <VerifiedPill /> : null}
                <OpenStatus hours={merchant.operatingHours} />
              </div>
            </div>
            {merchant.description ? <p className="text-sm text-ink">{merchant.description}</p> : null}
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex gap-2">
                <dt className="sr-only">Address</dt>
                <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <dd className="text-ink">{formatAddress(merchant.address)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="sr-only">Phone</dt>
                <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <dd>
                  <a href={`tel:${merchant.mobileNumber}`} className="text-accent hover:underline">
                    {merchant.mobileNumber}
                  </a>
                  {merchant.telephoneNo ? <span className="text-muted"> · {merchant.telephoneNo}</span> : null}
                </dd>
              </div>
            </dl>
            {service.slug === "garbage" ? (
              <div className="rounded-xl p-3.5" style={{ background: service.tint }}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Collection rate</p>
                <p className="mt-0.5 font-display text-2xl font-bold" style={{ color: service.color }}>
                  {rate ?? "Not listed"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {rate ? "Estimated price for a garbage pickup." : "Contact the merchant for pricing."}
                </p>
              </div>
            ) : null}
            <Button block tone={service.color} className="py-3" onClick={() => setIntent({ kind: "request" })}>
              {service.requestCta}
            </Button>
          </Card>
        </aside>
      </div>

      <OrderFormDialog
        intent={intent}
        service={service}
        serviceId={merchant.service.id}
        merchant={merchant}
        products={products}
        onClose={() => setIntent(null)}
        onPlaced={() => {
          setIntent(null);
          toast({ tone: "success", title: "Request sent", body: `${merchant.name} will review it shortly.` });
          router.push("/orders");
        }}
      />
    </>
  );
}
