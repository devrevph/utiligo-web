import { formatDistanceKm, formatMotorcycleEta } from "@/lib/distance";
import { getTodayOperatingStatus, type OperatingHours } from "@/lib/data/merchants";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/components/ui/primitives";

export function OpenStatus({ hours }: { hours: OperatingHours | null | undefined }) {
  const status = getTodayOperatingStatus(hours);
  if (!status) return null;
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-xs font-medium", status.open ? "text-success" : "text-muted")}>
      <span className={cx("h-2 w-2 rounded-full", status.open ? "bg-success" : "bg-border-strong")} />
      {status.label}
    </span>
  );
}

export function DistanceLine({ km }: { km: number | null }) {
  if (km == null) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Icon name="bike" className="h-3.5 w-3.5" />
      {formatDistanceKm(km)} away · {formatMotorcycleEta(km)} by motorcycle
    </span>
  );
}

export function VerifiedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">
      <Icon name="check-circle" className="h-3.5 w-3.5" />
      Verified
    </span>
  );
}
