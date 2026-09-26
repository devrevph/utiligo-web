import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const ENV_NAMES: Record<keyof typeof firebaseConfig, string> = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

/**
 * Env vars that were empty when this bundle was built. NEXT_PUBLIC_* values are
 * inlined at build time, so fixing them on the host requires a redeploy.
 */
export function missingFirebaseConfig(): string[] {
  return (Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>)
    .filter((k) => !firebaseConfig[k]?.trim())
    .map((k) => ENV_NAMES[k]);
}

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let storageInstance: FirebaseStorage | undefined;

// Lazy for the same reason as utiligo-admin: Next evaluates module imports
// during prerendering, and initializing Firebase at module scope would crash
// the build wherever NEXT_PUBLIC_FIREBASE_* isn't set at build time.
function getFirebaseApp(): FirebaseApp {
  app = app ?? getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  authInstance = authInstance ?? getAuth(getFirebaseApp());
  return authInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  storageInstance = storageInstance ?? getStorage(getFirebaseApp());
  return storageInstance;
}
