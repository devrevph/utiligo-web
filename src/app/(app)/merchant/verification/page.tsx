"use client";

import { useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Badge, Button, Card, EmptyState, ErrorState, PageSpinner, cx, type BadgeTone } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { uploadVerificationDocument } from "@/lib/data/storage";
import {
  getMyVerification,
  submitVerificationDocument,
  type MerchantVerificationStatus,
  type VerificationChecklistItem,
  type VerificationDocumentStatus,
} from "@/lib/data/verification";
import { useMerchantStore } from "@/lib/stores/merchant";
import { toast } from "@/lib/stores/ui";

const BANNER: Record<MerchantVerificationStatus, { tone: string; icon: IconName; text: string }> = {
  unsubmitted: { tone: "bg-warning-tint text-warning", icon: "alert", text: "Submit your documents below to start verification." },
  pending_review: {
    tone: "bg-accent-tint text-accent",
    icon: "clock",
    text: "Your documents are being reviewed. This usually takes a few business days.",
  },
  approved: { tone: "bg-success-tint text-success", icon: "check-circle", text: "Your business is verified." },
};

const DOC_STATUS: Record<VerificationDocumentStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export default function VerificationPage() {
  const merchant = useMerchantStore((s) => s.merchant);
  const refreshMerchant = useMerchantStore((s) => s.refresh);
  const { data, error, reload } = useResource(getMyVerification, "my-verification");
  const [uploadingId, setUploadingId] = useState<number | null>(null);


  const upload = async (item: VerificationChecklistItem, file: File) => {
    if (!merchant) return;
    setUploadingId(item.requirement.id);
    try {
      const fileUrl = await uploadVerificationDocument(merchant.id, item.requirement.code, file);
      await submitVerificationDocument({ documentRequirementId: item.requirement.id, fileUrl });
      // Refetch: the document resets to pending and the overall status may roll up.
      reload();
      await refreshMerchant();
      toast({ tone: "success", title: "Document submitted", body: item.requirement.label });
    } catch (e) {
      toast({ tone: "error", title: "Upload failed", body: errorMessage(e, "Try again.") });
    } finally {
      setUploadingId(null);
    }
  };

  if (error) {
    return (
      <Card>
        <ErrorState message="Couldn't load your verification checklist." onRetry={reload} />
      </Card>
    );
  }
  if (!data) return <PageSpinner />;

  const banner = BANNER[data.verificationStatus];

  return (
    <>
      <title>Verification · Business · Utiligo</title>
      <div className={cx("mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm", banner.tone)}>
        <Icon name={banner.icon} className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="font-medium">{banner.text}</p>
      </div>
      {data.checklist.length === 0 ? (
        <Card>
          <EmptyState icon="file" title="No documents required yet" body="There are no requirements for this service yet." />
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.checklist.map((item) => (
            <DocumentCard
              key={item.requirement.id}
              item={item}
              uploading={uploadingId === item.requirement.id}
              disabled={uploadingId !== null}
              onFile={(f) => void upload(item, f)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function DocumentCard({
  item,
  uploading,
  disabled,
  onFile,
}: {
  item: VerificationChecklistItem;
  uploading: boolean;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { requirement, document } = item;
  const status = document ? DOC_STATUS[document.status] : null;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            {requirement.label}
            {!requirement.isRequired ? <span className="font-normal text-muted"> (optional)</span> : null}
          </p>
          {requirement.description ? <p className="mt-1 text-xs text-muted">{requirement.description}</p> : null}
        </div>
        {status ? <Badge tone={status.tone}>{status.label}</Badge> : <Badge>Not submitted</Badge>}
      </div>
      {document?.status === "rejected" && document.reviewerNote ? (
        <p className="rounded-lg bg-danger-tint px-3 py-2 text-xs text-danger">Reviewer note: {document.reviewerNote}</p>
      ) : null}
      {document?.fileUrl ? (
        <a href={document.fileUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- Firebase Storage URLs */}
          <img src={document.fileUrl} alt={`Submitted ${requirement.label}`} className="h-36 w-full object-cover" />
        </a>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`Upload ${requirement.label}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
      <Button
        variant="secondary"
        icon={document ? "refresh" : "camera"}
        loading={uploading}
        disabled={disabled}
        className="mt-auto self-start"
        onClick={() => inputRef.current?.click()}
      >
        {document ? "Replace" : "Upload photo"}
      </Button>
    </li>
  );
}
