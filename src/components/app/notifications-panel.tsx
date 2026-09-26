"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatNotificationTime, type AppNotification } from "@/lib/data/notifications";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { useUiStore } from "@/lib/stores/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button, Dialog, EmptyState, Spinner, cx } from "@/components/ui/primitives";

function iconFor(type: string): IconName {
  switch (type) {
    case "merchant_new_order":
      return "receipt";
    case "order_accepted":
    case "merchant_verification_status":
      return "check-circle";
    case "order_rejected":
      return "x";
    case "order_delivered":
      return "bike";
    case "laundry_updated":
      return "shirt";
    case "garbage_pickup_updated":
      return "garbage";
    case "order_paid":
      return "cash";
    case "verification_document_reviewed":
      return "file";
    default:
      return "bell";
  }
}

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const items = useNotificationsStore((s) => s.items);
  const loading = useNotificationsStore((s) => s.loading);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const load = useNotificationsStore((s) => s.loadNotifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const requestOpenOrder = useUiStore((s) => s.requestOpenOrder);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const handleClick = (n: AppNotification) => {
    if (!n.readAt) void markRead(n.id);
    const orderId = n.data?.orderId;
    if (orderId) {
      const merchantSide = n.type === "merchant_new_order";
      requestOpenOrder(merchantSide ? "merchant" : "customer", orderId);
      router.push(merchantSide ? "/merchant/orders" : "/orders");
      onClose();
    } else if (n.type === "verification_document_reviewed" || n.type === "merchant_verification_status") {
      router.push("/merchant/verification");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : undefined}
      footer={
        unreadCount > 0 ? (
          <Button variant="ghost" icon="check" onClick={() => void markAllRead()}>
            Mark all read
          </Button>
        ) : undefined
      }
    >
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-10 text-accent">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="bell" title="No notifications yet" body="Order updates and alerts will show up here." />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((n) => {
            const unread = !n.readAt;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={cx(
                    "flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-surface-2",
                    unread && "bg-accent-tint/60",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      unread ? "bg-accent-tint text-accent" : "bg-surface-2 text-muted",
                    )}
                  >
                    <Icon name={iconFor(n.type)} className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cx("truncate text-sm", unread ? "font-semibold text-ink" : "text-ink")}>
                        {n.title}
                      </span>
                      {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{n.body}</span>
                    <span className="mt-1 block text-xs text-muted">{formatNotificationTime(n.createdAt)}</span>
                  </span>
                  {n.data?.orderId ? <Icon name="chevron-right" className="mt-2 h-4 w-4 shrink-0 text-muted" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Dialog>
  );
}
