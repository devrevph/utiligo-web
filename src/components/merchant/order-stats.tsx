"use client";

import { useSyncExternalStore } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OrderRequestStatus, OrderStatsResponse } from "@/lib/data/orders";
import { Card } from "@/components/ui/primitives";

// Reference status palette (validated): paired with a text label, never color alone.
const STATUS: Record<OrderRequestStatus, { label: string; color: string }> = {
  accepted: { label: "Accepted", color: "#0ca30c" },
  pending: { label: "Pending", color: "#fab219" },
  rejected: { label: "Rejected", color: "#d03b3b" },
};

const TOKENS = ["--accent", "--merchant", "--border", "--muted", "--surface", "--ink"] as const;
type Tokens = Record<(typeof TOKENS)[number], string>;

/** SVG presentation attributes don't resolve var(), so read the theme tokens and follow dark-mode changes. */
function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
let cachedKey = "";
let cachedTokens: Tokens | null = null;
function readTokens(): Tokens | null {
  const style = getComputedStyle(document.documentElement);
  const values = TOKENS.map((t) => style.getPropertyValue(t).trim());
  const key = values.join("|");
  if (key !== cachedKey) {
    cachedKey = key;
    cachedTokens = Object.fromEntries(TOKENS.map((t, i) => [t, values[i]])) as Tokens;
  }
  return cachedTokens;
}
function useThemeTokens(): Tokens | null {
  return useSyncExternalStore(subscribe, readTokens, () => null);
}

function shortDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

const peso = (n: number) => `PHP ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function OrderStats({ stats }: { stats: OrderStatsResponse }) {
  const tokens = useThemeTokens();
  const data = stats.daily.map((d) => ({ ...d, label: shortDate(d.date) }));
  const maxStatus = Math.max(1, ...stats.statusBreakdown.map((s) => s.count));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Orders" value={stats.totals.orders.toLocaleString()} />
        <StatTile label="Revenue (paid)" value={peso(stats.totals.revenue)} />
        <StatTile label="Pending" value={stats.totals.pending.toLocaleString()} />
        <StatTile label="Accepted" value={stats.totals.accepted.toLocaleString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart
          title="Orders per day"
          data={data}
          dataKey="orders"
          color={tokens?.["--accent"]}
          tokens={tokens}
          format={(v) => v.toLocaleString()}
          empty="No orders in this range"
        />
        <TrendChart
          title="Revenue per day (paid orders)"
          data={data}
          dataKey="revenue"
          color={tokens?.["--merchant"]}
          tokens={tokens}
          format={peso}
          empty="No paid revenue in this range"
        />
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-ink">Status breakdown</h3>
        <ul className="flex flex-col gap-3">
          {stats.statusBreakdown.map((s) => (
            <li key={s.status} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[s.status].color }} aria-hidden="true" />
                {STATUS[s.status].label}
              </span>
              <span className="h-3 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${(s.count / maxStatus) * 100}%`, background: STATUS[s.status].color }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums text-ink">{s.count}</span>
            </li>
          ))}
        </ul>
      </Card>

      <details className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-ink">Show daily numbers as a table</summary>
        <div className="mt-3 max-h-72 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-surface text-muted">
              <tr>
                <th className="py-1.5 font-medium">Date</th>
                <th className="py-1.5 text-right font-medium">Orders</th>
                <th className="py-1.5 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.map((d) => (
                <tr key={d.date} className="border-t border-border">
                  <td className="py-1.5 text-ink">{d.label}</td>
                  <td className="py-1.5 text-right text-ink">{d.orders}</td>
                  <td className="py-1.5 text-right text-ink">{peso(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function TrendChart({
  title,
  data,
  dataKey,
  color,
  tokens,
  format,
  empty,
}: {
  title: string;
  data: Array<{ label: string; orders: number; revenue: number }>;
  dataKey: "orders" | "revenue";
  color: string | undefined;
  tokens: Tokens | null;
  format: (v: number) => string;
  empty: string;
}) {
  const hasData = data.some((d) => d[dataKey] > 0);
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {!hasData ? (
        <p className="flex h-48 items-center justify-center text-sm text-muted">{empty}</p>
      ) : !tokens || !color ? (
        <div className="h-48" />
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={tokens["--border"]} strokeWidth={1} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: tokens["--border"] }}
                tick={{ fill: tokens["--muted"], fontSize: 11 }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={dataKey === "revenue"}
                tickLine={false}
                axisLine={false}
                width={dataKey === "revenue" ? 56 : 32}
                tick={{ fill: tokens["--muted"], fontSize: 11 }}
                tickFormatter={(v: number) => (dataKey === "revenue" && v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K` : String(v))}
              />
              <Tooltip
                cursor={{ stroke: tokens["--muted"], strokeWidth: 1 }}
                contentStyle={{
                  background: tokens["--surface"],
                  border: `1px solid ${tokens["--border"]}`,
                  borderRadius: 10,
                  fontSize: 12,
                  color: tokens["--ink"],
                }}
                labelStyle={{ color: tokens["--muted"] }}
                formatter={(v) => [format(Number(v)), title.split(" per ")[0]]}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.1}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: tokens["--surface"], strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
