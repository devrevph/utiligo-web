import { api } from "@/lib/api";

export type VerificationDocumentStatus = "pending" | "approved" | "rejected";
export type MerchantVerificationStatus = "unsubmitted" | "pending_review" | "approved";

export type DocumentRequirement = {
  id: number;
  code: string;
  label: string;
  description?: string | null;
  isRequired: boolean;
  sortOrder: number;
};

export type VerificationDocumentEntry = {
  id: string;
  fileUrl: string;
  status: VerificationDocumentStatus;
  reviewerNote: string | null;
  reviewedAt: string | null;
};

export type VerificationChecklistItem = {
  requirement: DocumentRequirement;
  document: VerificationDocumentEntry | null;
};

export type MyVerification = {
  verificationStatus: MerchantVerificationStatus;
  checklist: VerificationChecklistItem[];
};

export const getMyVerification = () => api.get<MyVerification>("/verification/me");

export const submitVerificationDocument = (payload: { documentRequirementId: number; fileUrl: string }) =>
  api.post<VerificationChecklistItem>("/verification/me/documents", payload);

export function isMerchantVerified(status: MerchantVerificationStatus | undefined): boolean {
  return status === "approved";
}

export function verificationStatusLabel(status: MerchantVerificationStatus | undefined): string {
  switch (status) {
    case "approved":
      return "Verified";
    case "pending_review":
      return "Pending review";
    default:
      return "Not submitted";
  }
}
