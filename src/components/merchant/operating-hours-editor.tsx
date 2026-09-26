"use client";

import { WEEK_DAYS, type DayHours, type OperatingHours, type WeekDay } from "@/lib/data/merchants";
import { cx } from "@/components/ui/primitives";

const DAY_LABELS: Record<WeekDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const TIME_INPUT =
  "w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25";

export function OperatingHoursEditor({ value, onChange }: { value: OperatingHours; onChange: (next: OperatingHours) => void }) {
  const setDay = (day: WeekDay, patch: Partial<DayHours>) => {
    const current = value[day];
    const next: DayHours = { ...current, ...patch };
    // Reopening a day with no times would fail validation — seed the default hours.
    if (patch.closed === false && (!next.open || !next.close)) {
      next.open = next.open || "09:00";
      next.close = next.close || "18:00";
    }
    onChange({ ...value, [day]: next });
  };

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {WEEK_DAYS.map((day) => {
        const d = value[day];
        const invalid = !d.closed && !!d.open && !!d.close && d.open >= d.close;
        return (
          <div key={day} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 px-3.5 py-2.5 sm:grid-cols-[7.5rem_auto_1fr]">
            <span className="text-sm font-medium text-ink">{DAY_LABELS[day]}</span>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={!d.closed}
                onChange={(e) => setDay(day, { closed: !e.target.checked })}
                className="h-4 w-4 accent-[var(--merchant)]"
              />
              Open
            </label>
            {d.closed ? (
              <span className="col-span-2 text-sm text-muted sm:col-span-1">Closed</span>
            ) : (
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <input
                  type="time"
                  aria-label={`${DAY_LABELS[day]} opening time`}
                  value={d.open ?? ""}
                  onChange={(e) => setDay(day, { open: e.target.value })}
                  className={cx(TIME_INPUT, invalid && "border-danger")}
                />
                <span className="text-sm text-muted">to</span>
                <input
                  type="time"
                  aria-label={`${DAY_LABELS[day]} closing time`}
                  value={d.close ?? ""}
                  onChange={(e) => setDay(day, { close: e.target.value })}
                  className={cx(TIME_INPUT, invalid && "border-danger")}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
