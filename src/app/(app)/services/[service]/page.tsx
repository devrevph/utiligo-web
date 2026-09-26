"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DistanceLine, OpenStatus, VerifiedPill } from "@/components/app/merchant-bits";
import { ServiceGlyph } from "@/components/app/service-glyph";
import { Icon } from "@/components/ui/icon";
import { Card, ChoiceChips, EmptyState, ErrorState, PageHeader, PageSpinner } from "@/components/ui/primitives";
import { DISTANCE_FILTER_OPTIONS_KM, haversineDistanceKm, toFiniteNumber, type DistanceFilterKm } from "@/lib/distance";
import { formatGarbageCollectionRate, listMerchantServices, listMerchantsByService, type PublicMerchant } from "@/lib/data/merchants";
import { isMerchantVerified } from "@/lib/data/verification";
import { useResource } from "@/lib/hooks/use-resource";
import { findApiService, serviceBySlug } from "@/lib/service-config";
import { useAuthStore } from "@/lib/stores/auth";
import { formatAddress } from "@/lib/types";

type Row = PublicMerchant & { distanceKm: number | null };

export default function ServiceMerchantsPage() {
  const { service: slug } = useParams<{ service: string }>();
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const userAddress = useAuthStore((s) => s.user?.address);
  const [maxKm, setMaxKm] = useState<DistanceFilterKm>(10);
  const { data: merchants, error, reload } = useResource(
    async () => {
      const apiService = findApiService(await listMerchantServices(), service);
      if (!apiService) throw new Error(`${service.name} isn't available yet.`);
      return listMerchantsByService(apiService.id);
    },
    `merchants-${service.slug}`,
    "Couldn't load merchants. Check your connection and try again.",
  );

  const userLat = toFiniteNumber(userAddress?.latitude);
  const userLng = toFiniteNumber(userAddress?.longitude);
  const hasLocation = userLat != null && userLng != null;

  const rows = useMemo<Row[]>(() => {
    const withDistance = (merchants ?? []).map((m) => {
      const lat = toFiniteNumber(m.address?.latitude);
      const lng = toFiniteNumber(m.address?.longitude);
      const distanceKm =
        userLat != null && userLng != null && lat != null && lng != null ? haversineDistanceKm(userLat, userLng, lat, lng) : null;
      return { ...m, distanceKm };
    });
    if (userLat == null || userLng == null) return withDistance;
    return withDistance
      .filter((m) => m.distanceKm == null || m.distanceKm <= maxKm)
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [merchants, userLat, userLng, maxKm]);

  return (
    <>
      <title>{`${service.name} · Utiligo`}</title>
      <PageHeader title={service.name} subtitle={service.listSubtitle} back={{ href: "/home", label: "Home" }} />

      {hasLocation ? (
        <div className="mb-5">
          <ChoiceChips
            label="Distance from your address"
            tone={service.color}
            value={maxKm}
            onChange={setMaxKm}
            options={DISTANCE_FILTER_OPTIONS_KM.map((km) => ({ value: km, label: `Within ${km} km` }))}
          />
        </div>
      ) : null}

      {error && !merchants?.length ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : merchants === null ? (
        <PageSpinner />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon="store"
            title={merchants.length === 0 ? "No merchants yet" : `No merchants within ${maxKm} km`}
            body={merchants.length === 0 ? "No one offers this service near you yet — check back soon." : "Try a wider distance."}
          />
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((m) => {
            const rate = service.slug === "garbage" ? formatGarbageCollectionRate(m) : null;
            return (
              <li key={m.id}>
                <Link
                  href={`/services/${service.slug}/${m.id}`}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <ServiceGlyph service={service} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{m.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {isMerchantVerified(m.verificationStatus) ? <VerifiedPill /> : null}
                        <OpenStatus hours={m.operatingHours} />
                      </div>
                    </div>
                    <Icon name="chevron-right" className="mt-1 h-5 w-5 text-muted" />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted">{formatAddress(m.address)}</p>
                  {service.slug === "garbage" ? (
                    <p className="text-sm">
                      <span className="text-muted">Collection rate: </span>
                      <span className="font-semibold" style={{ color: service.color }}>
                        {rate ?? "Not listed — contact the merchant"}
                      </span>
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <DistanceLine km={m.distanceKm} />
                    <span className="text-sm font-medium" style={{ color: service.color }}>
                      {m.mobileNumber}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
