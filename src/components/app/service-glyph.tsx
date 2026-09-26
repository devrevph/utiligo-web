import type { CSSProperties } from "react";
import type { ServiceConfig } from "@/lib/service-config";
import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/components/ui/primitives";

const ICONS: Record<ServiceConfig["icon"], IconName> = {
  water: "water",
  flame: "flame",
  shirt: "shirt",
  trash: "garbage",
};

export function ServiceGlyph({ service, size = "md" }: { service: ServiceConfig; size?: "sm" | "md" | "lg" }) {
  const box = { sm: "h-9 w-9 rounded-lg", md: "h-11 w-11 rounded-xl", lg: "h-14 w-14 rounded-2xl" }[size];
  const icon = { sm: "h-4.5 w-4.5", md: "h-5.5 w-5.5", lg: "h-7 w-7" }[size];
  return (
    <span
      className={cx("flex shrink-0 items-center justify-center", box)}
      style={{ background: service.tint, color: service.color } as CSSProperties}
    >
      <Icon name={ICONS[service.icon]} className={icon} />
    </span>
  );
}
