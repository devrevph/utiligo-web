"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirm } from "@/components/ui/feedback";
import { Button, Card, EmptyState, PageHeader, PageSpinner } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { deleteMyMerchant } from "@/lib/data/merchants";
import { deleteMyAccount } from "@/lib/data/users";
import { useAuthStore } from "@/lib/stores/auth";
import { useMerchantStore } from "@/lib/stores/merchant";
import { toast } from "@/lib/stores/ui";

export default function SettingsPage() {
  const router = useRouter();
  const logOut = useAuthStore((s) => s.logOut);
  const merchant = useMerchantStore((s) => s.merchant);
  const setMerchant = useMerchantStore((s) => s.setMerchant);
  const [busy, setBusy] = useState<"business" | "account" | null>(null);

  const deleteBusiness = async () => {
    if (!merchant) return;
    const ok = await confirm({
      title: "Delete business?",
      body: `This permanently removes "${merchant.name}", its products, and all related orders. This can't be undone.`,
      confirmLabel: "Delete business",
      tone: "danger",
    });
    if (!ok) return;
    setBusy("business");
    try {
      await deleteMyMerchant();
      setMerchant(null);
      toast({ tone: "success", title: "Business removed" });
      router.replace("/home");
    } catch (e) {
      toast({ tone: "error", title: "Couldn't delete business", body: errorMessage(e, "Try again.") });
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async () => {
    const ok = await confirm({
      title: "Delete account?",
      body: merchant
        ? "Your merchant, products, orders, and profile will be permanently deleted. You'll be signed out."
        : "Your profile and order history will be permanently deleted. You'll be signed out.",
      confirmLabel: "Delete account",
      tone: "danger",
    });
    if (!ok) return;
    setBusy("account");
    try {
      await deleteMyAccount();
      await logOut();
      router.replace("/login");
    } catch (e) {
      toast({ tone: "error", title: "Couldn't delete account", body: errorMessage(e, "Try again.") });
      setBusy(null);
    }
  };

  return (
    <>
      <title>Settings · Utiligo</title>
      <PageHeader title="Settings" subtitle="Account and business options." back={{ href: "/profile", label: "Profile" }} />
      <div className="flex max-w-2xl flex-col gap-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Business</h2>
          {merchant === undefined ? (
            <PageSpinner />
          ) : merchant ? (
            <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-semibold text-ink">Delete business</p>
                <p className="mt-1 text-sm text-muted">
                  Remove {merchant.name} ({merchant.service?.title ?? "merchant"}). Products and merchant orders are deleted. Your
                  personal account stays active.
                </p>
              </div>
              <Button variant="danger-outline" loading={busy === "business"} disabled={busy !== null} onClick={() => void deleteBusiness()}>
                Delete my business
              </Button>
            </Card>
          ) : (
            <Card>
              <EmptyState icon="store" title="No business registered" body="Register a merchant from the account menu if you run a business." />
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Account</h2>
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-semibold text-ink">Delete account</p>
              <p className="mt-1 text-sm text-muted">
                Permanently remove your Utiligo profile, order history, and sign-in. If you own a merchant, it&apos;s removed too.
              </p>
            </div>
            <Button variant="danger" loading={busy === "account"} disabled={busy !== null} onClick={() => void deleteAccount()}>
              Delete my account
            </Button>
          </Card>
        </section>
      </div>
    </>
  );
}
