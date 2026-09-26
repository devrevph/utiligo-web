import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

// Same object paths as utiligo-app so both clients share Storage rules.

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/.test(fromName)) return fromName;
  const fromType = file.type.split("/")[1];
  return fromType && fromType.length <= 5 ? fromType : "jpg";
}

async function upload(path: string, file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That file is larger than 10 MB. Choose a smaller photo.");
  }
  const objectRef = ref(getFirebaseStorage(), path);
  await uploadBytes(objectRef, file, { contentType: file.type || undefined });
  return getDownloadURL(objectRef);
}

const randomSuffix = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function uploadProductImage(merchantId: string, productId: string, file: File): Promise<string> {
  return upload(`merchants/${merchantId}/products/${productId}/${randomSuffix()}.${extensionFor(file)}`, file);
}

export function uploadVerificationDocument(merchantId: string, requirementCode: string, file: File): Promise<string> {
  return upload(`merchants/${merchantId}/verification/${requirementCode}-${Date.now()}.${extensionFor(file)}`, file);
}

export function uploadContainerImage(merchantId: string, file: File): Promise<string> {
  return upload(`merchants/${merchantId}/container-requests/${randomSuffix()}.${extensionFor(file)}`, file);
}
