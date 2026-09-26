"use client";

import Link from "next/link";
import { useState } from "react";
import { GarbageRateCard } from "@/components/merchant/garbage-rate-card";
import { OrderStats } from "@/components/merchant/order-stats";
import { Icon } from "@/components/ui/icon";
import { Badge, Card, ChoiceChips, ErrorState, PageSpinner, SectionTitle } from "@/components/ui/primitives";
import {
  ORDER_STATS_RANGE_DAYS,
  getMyMerchantOrderStats,
  isGarbageService,
  type OrderStatsRangeDays,
} from "@/lib/data/orders";
import { isMerchantVerified, verificationStatusLabel } from "@/lib/data/verification";
import { useOnOrderEvent } from "@/lib/hooks/use-app";
import { useResource } from "@/lib/hooks/use-resource";
import { useMerchantStore } from "@/lib/stores/merchant";

export default function MerchantDashboardPage() {
  const merchant = useMerchantStore((s) => s.merchant);
  const setMerchant = useMerchantStore((s) => s.setMerchant);
  const [days, setDays] = useState<OrderStatsRangeDays>(30);
  const { data: stats, error, reload } = useResource(() => getMyMerchantOrderStats(days), `stats-${days}`);

  useOnOrderEvent(reload);

  if (!merchant) return null;
  const verified = isMerchantVerified(merchant.verificationStatus);

  return (
    <>
      <title>Business dashboard · Utiligo</title>

      {!verified ? (
        <Link
          href="/merchant/verification"
          className="mb-6 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm transition-colors hover:border-warning/60"
        >
          <Icon name="shield" className="h-5 w-5 shrink-0 text-warning" />
          <span className="flex-1 text-ink">
            <span className="font-semibold">Verification: {verificationStatusLabel(merchant.verificationStatus)}.</span>{" "}
            {merchant.verificationStatus === "pending_review"
              ? "We're reviewing your documents."
              : "Submit your business documents to get the Verified badge."}
          </span>
          <Icon name="chevron-right" className="h-4 w-4 text-muted" />
        </Link>
      ) : null}

      <SectionTitle
        action={
          <div className="hidden sm:block">
            <RangePicker days={days} onChange={setDays} />
          </div>
        }
      >
        Performance
      </SectionTitle>
      <div className="mb-4 sm:hidden">
        <RangePicker days={days} onChange={setDays} />
      </div>

      {error ? (
        <Card>
          <ErrorState message="Couldn't load your stats." onRetry={reload} />
        </Card>
      ) : stats ? (
        <OrderStats stats={stats} />
      ) : (
        <PageSpinner />
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Business</h3>
          <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="text-ink">{merchant.name}</dd>
            <dt className="text-muted">Service</dt>
            <dd className="text-ink">{merchant.service?.title ?? "—"}</dd>
            <dt className="text-muted">Verification</dt>
            <dd>
              <Badge tone={verified ? "success" : merchant.verificationStatus === "pending_review" ? "info" : "warning"}>
                {verificationStatusLabel(merchant.verificationStatus)}
              </Badge>
            </dd>
          </dl>
          <Link href="/merchant/profile" className="mt-1 text-sm font-semibold text-merchant hover:underline">
            Edit business profile
          </Link>
        </Card>
        {isGarbageService(merchant.service?.title) ? <GarbageRateCard merchant={merchant} onUpdated={setMerchant} /> : null}
      </div>
    </>
  );
}

function RangePicker({ days, onChange }: { days: OrderStatsRangeDays; onChange: (d: OrderStatsRangeDays) => void }) {
  return (
    <ChoiceChips
      label="Date range"
      tone="var(--merchant)"
      value={days}
      onChange={onChange}
      options={ORDER_STATS_RANGE_DAYS.map((d) => ({ value: d, label: `${d} days` }))}
    />
  );
}
