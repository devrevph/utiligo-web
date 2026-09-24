"use client";

import { useState } from "react";
import { CustomerOrderDialog, CustomerOrderRow } from "@/components/orders/customer-orders";
import { ButtonLink, Card, EmptyState, ErrorState, PageHeader, PageSpinner } from "@/components/ui/primitives";
import { listMyOrders, type OrderRow } from "@/lib/data/orders";
import { useOnOrderEvent } from "@/lib/hooks/use-app";
import { useResource } from "@/lib/hooks/use-resource";
import { useUiStore } from "@/lib/stores/ui";

export default function OrdersPage() {
  const { data: rows, error, reload } = useResource(() => listMyOrders(100), "my-orders");
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const pendingOrder = useUiStore((s) => s.pendingOrder);
  const clearPendingOrder = useUiStore((s) => s.clearPendingOrder);

  useOnOrderEvent(reload);

  // A notification asked to open one of these orders.
  const requested = pendingOrder?.scope === "customer" ? (rows?.find((r) => r.id === pendingOrder.orderId) ?? null) : null;
  const shown = selected ?? requested;

  return (
    <>
      <title>My orders · Utiligo</title>
      <PageHeader title="My orders" subtitle="All requests and purchases you've placed." />
      {error ? (
        <Card>
          <ErrorState message="Couldn't load your orders." onRetry={reload} />
        </Card>
      ) : rows === null ? (
        <PageSpinner />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon="receipt"
            title="No orders yet"
            body="When you book a service, your orders will appear here."
            action={<ButtonLink href="/home">Browse services</ButtonLink>}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {rows.map((o) => (
              <li key={o.id}>
                <CustomerOrderRow row={o} onOpen={() => setSelected(o)} />
              </li>
            ))}
          </ul>
        </Card>
      )}
      <CustomerOrderDialog
        order={shown}
        onClose={() => {
          setSelected(null);
          clearPendingOrder();
        }}
      />
    </>
  );
}
