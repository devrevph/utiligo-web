"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ServiceGlyph } from "@/components/app/service-glyph";
import { CustomerOrderDialog, CustomerOrderRow } from "@/components/orders/customer-orders";
import { Icon } from "@/components/ui/icon";
import { ButtonLink, Card, EmptyState, ErrorState, SectionTitle, Spinner } from "@/components/ui/primitives";
import { listMyOrders, type OrderRow } from "@/lib/data/orders";
import { verificationStatusLabel } from "@/lib/data/verification";
import { useOnOrderEvent, useRequireVerifiedEmail } from "@/lib/hooks/use-app";
import { useResource } from "@/lib/hooks/use-resource";
import { SERVICES } from "@/lib/service-config";
import { useAuthStore } from "@/lib/stores/auth";
import { useMerchantStore } from "@/lib/stores/merchant";
import { formatAddress } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const merchant = useMerchantStore((s) => s.merchant);
  const requireVerified = useRequireVerifiedEmail();

  const { data: orders, error: ordersError, reload: reloadOrders } = useResource(() => listMyOrders(5), "recent-orders");
  const [selected, setSelected] = useState<OrderRow | null>(null);
  useOnOrderEvent(reloadOrders);

  return (
    <>
      <title>Home · Utiligo</title>
      <div className="mb-8">
        <p className="text-sm font-medium text-muted">Welcome back,</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {user?.firstName} {user?.lastName}
        </h1>
      </div>

      {!emailVerified ? (
        <Link
          href="/verify-email"
          className="mb-6 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm text-ink transition-colors hover:border-warning/60"
        >
          <Icon name="mail" className="h-5 w-5 shrink-0 text-warning" />
          <span className="flex-1">
            <span className="font-semibold">Verify your email</span> to request services and register a merchant.
          </span>
          <Icon name="chevron-right" className="h-4 w-4 text-muted" />
        </Link>
      ) : null}

      {merchant ? (
        <Link
          href="/merchant"
          className="mb-8 flex items-center gap-4 rounded-2xl border border-merchant/30 bg-merchant-tint p-4 transition-colors hover:border-merchant/60"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-merchant text-on-accent">
            <Icon name="store" className="h-5.5 w-5.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Business dashboard</span>
            <span className="block truncate text-sm text-muted">
              {merchant.name} · {merchant.service?.title ?? "Service"} · {verificationStatusLabel(merchant.verificationStatus)}
            </span>
          </span>
          <Icon name="chevron-right" className="h-5 w-5 text-muted" />
        </Link>
      ) : null}

      <section aria-labelledby="services-title" className="mb-10">
        <SectionTitle>
          <span id="services-title">Our services</span>
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <button
              key={service.slug}
              type="button"
              onClick={() =>
                requireVerified("Only verified users can request a service.", () => router.push(`/services/${service.slug}`))
              }
              className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong sm:p-5"
            >
              <ServiceGlyph service={service} size="lg" />
              <span>
                <span className="block font-semibold text-ink">{service.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-sm text-muted group-hover:text-ink">
                  Find merchants <Icon name="chevron-right" className="h-3.5 w-3.5" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="recent-title">
          <SectionTitle
            action={
              <Link href="/orders" className="text-sm font-semibold text-accent hover:underline">
                View all
              </Link>
            }
          >
            <span id="recent-title">Recent orders</span>
          </SectionTitle>
          <Card className="overflow-hidden p-0 sm:p-0">
            {ordersError ? (
              <ErrorState message="Couldn't load your orders." onRetry={reloadOrders} />
            ) : orders === null ? (
              <div className="flex justify-center py-10 text-accent">
                <Spinner />
              </div>
            ) : orders.length === 0 ? (
              <EmptyState icon="receipt" title="No orders yet" body="Book a service above to see your activity here." />
            ) : (
              <ul className="divide-y divide-border">
                {orders.map((o) => (
                  <li key={o.id}>
                    <CustomerOrderRow row={o} onOpen={() => setSelected(o)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="account-title">
          <SectionTitle
            action={
              <Link href="/profile" className="text-sm font-semibold text-accent hover:underline">
                Edit
              </Link>
            }
          >
            <span id="account-title">Account details</span>
          </SectionTitle>
          <Card>
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="text-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="text-ink">{user?.mobileNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Delivery address</dt>
                <dd className="text-ink">{formatAddress(user?.address)}</dd>
              </div>
            </dl>
            {!merchant && merchant !== undefined ? (
              <div className="mt-5 border-t border-border pt-5">
                <p className="text-sm font-semibold text-ink">Run a water, gas, laundry, or garbage business?</p>
                <p className="mt-1 text-sm text-muted">Register your merchant to receive orders here.</p>
                <ButtonLink href="/merchant/register" variant="secondary" icon="store" className="mt-3">
                  Register a merchant
                </ButtonLink>
              </div>
            ) : null}
          </Card>
        </section>
      </div>

      <CustomerOrderDialog order={selected} onClose={() => setSelected(null)} />
    </>
  );
}
