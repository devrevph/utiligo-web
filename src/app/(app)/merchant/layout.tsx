"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button, Card, EmptyState, ErrorState, PageSpinner, cx } from "@/components/ui/primitives";
import { isGarbageService, isGasService, isLaundryService, isWaterService } from "@/lib/data/orders";
import { useRequireVerifiedEmail } from "@/lib/hooks/use-app";
import { useMerchantStore } from "@/lib/stores/merchant";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const merchant = useMerchantStore((s) => s.merchant);
  const error = useMerchantStore((s) => s.error);
  const refresh = useMerchantStore((s) => s.refresh);
  const requireVerified = useRequireVerifiedEmail();

  if (pathname === "/merchant/register") return <>{children}</>;

  if (merchant === undefined) {
    return error ? (
      <Card>
        <ErrorState message={error} onRetry={() => void refresh()} />
      </Card>
    ) : (
      <PageSpinner />
    );
  }

  if (merchant === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <EmptyState
          icon="store"
          title="You haven't registered a merchant"
          body="Register your water, gas, laundry, or garbage business to start receiving orders."
          action={
            <Button
              icon="plus"
              tone="var(--merchant)"
              onClick={() => requireVerified("Only verified users can register a merchant.", () => router.push("/merchant/register"))}
            >
              Register a merchant
            </Button>
          }
        />
      </Card>
    );
  }

  const title = merchant.service?.title;
  const hasDelivery = isWaterService(title) || isGasService(title) || isLaundryService(title) || isGarbageService(title);
  const tabs: Array<{ href: string; label: string; icon: IconName }> = [
    { href: "/merchant", label: "Dashboard", icon: "gauge" },
    { href: "/merchant/orders", label: "Orders", icon: "receipt" },
    ...(hasDelivery ? [{ href: "/merchant/delivery", label: "Deliveries", icon: "truck" as const }] : []),
    { href: "/merchant/products", label: "Products", icon: "tag" },
    { href: "/merchant/verification", label: "Verification", icon: "shield" },
    { href: "/merchant/profile", label: "Business profile", icon: "building" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-merchant text-on-accent">
          <Icon name="store" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{merchant.name}</p>
          <p className="text-sm text-muted">{title ?? "Business"}</p>
        </div>
      </div>
      <nav aria-label="Business" className="-mx-4 mb-8 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-1">
          {tabs.map((t) => {
            const active = t.href === "/merchant" ? pathname === "/merchant" : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "border-merchant text-merchant" : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  <Icon name={t.icon} className="h-4.5 w-4.5" />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </>
  );
}
