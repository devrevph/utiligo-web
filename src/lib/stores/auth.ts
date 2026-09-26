"use client";

import { onIdTokenChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { create } from "zustand";
import { ApiError } from "@/lib/api";
import { fetchUserProfile } from "@/lib/data/users";
import { getFirebaseAuth } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { useMerchantStore } from "./merchant";
import { useNotificationsStore } from "./notifications";

type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthState = {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  /** Backend profile (GET /users/me). Null until loaded, or if it doesn't exist yet. */
  user: User | null;
  profileError: string | null;
  emailVerified: boolean;
  setUser: (user: User) => void;
  loadProfile: () => Promise<void>;
  refreshEmailVerified: () => Promise<boolean>;
  logOut: () => Promise<void>;
};

// Firebase signs the user in as soon as createUserWithEmailAndPassword
// resolves, which fires onIdTokenChanged before signup has created the
// backend profile. This flag stops the listener from racing a GET /users/me
// (which would 404) against that in-flight profile creation.
let signingUp = false;
export function setSigningUp(value: boolean) {
  signingUp = value;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  firebaseUser: null,
  user: null,
  profileError: null,
  emailVerified: false,

  setUser: (user) => set({ user, profileError: null }),

  loadProfile: async () => {
    try {
      const user = await fetchUserProfile();
      set({ user, profileError: null });
    } catch (e) {
      set({
        profileError:
          e instanceof ApiError && e.status === 404
            ? "We couldn't find your Utiligo profile."
            : "We couldn't load your profile. Check your connection and try again.",
      });
    }
  },

  refreshEmailVerified: async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return false;
    await current.reload();
    // email_verified is baked into the ID token at issuance — force a new one
    // so the API stops rejecting verified-email-only requests.
    await current.getIdToken(true);
    set({ firebaseUser: current, emailVerified: current.emailVerified });
    return current.emailVerified;
  },

  logOut: async () => {
    await signOut(getFirebaseAuth());
    set({ status: "signedOut", firebaseUser: null, user: null, profileError: null, emailVerified: false });
    useMerchantStore.getState().reset();
    useNotificationsStore.getState().reset();
  },
}));

let listening = false;

/** Subscribes once per page load; safe to call from every layout that needs auth. */
export function startAuthListener() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  let lastUid: string | null = null;

  // onIdTokenChanged (not onAuthStateChanged) so the store also sees Firebase's
  // hourly token refresh and email-verification changes.
  onIdTokenChanged(getFirebaseAuth(), async (firebaseUser) => {
    if (!firebaseUser) {
      lastUid = null;
      useMerchantStore.getState().reset();
      useNotificationsStore.getState().reset();
      useAuthStore.setState({
        status: "signedOut",
        firebaseUser: null,
        user: null,
        profileError: null,
        emailVerified: false,
      });
      return;
    }

    const isNewUser = firebaseUser.uid !== lastUid;
    lastUid = firebaseUser.uid;
    useAuthStore.setState({ firebaseUser, emailVerified: firebaseUser.emailVerified });

    if (isNewUser && !signingUp) {
      await useAuthStore.getState().loadProfile();
    }
    useAuthStore.setState({ status: "signedIn" });
  });
}
