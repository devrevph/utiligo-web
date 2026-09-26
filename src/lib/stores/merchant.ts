"use client";

import { create } from "zustand";
import { getMyMerchant, type MyMerchant } from "@/lib/data/merchants";

type MerchantState = {
  /** undefined = not loaded yet; null = the signed-in user has no merchant. */
  merchant: MyMerchant | null | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<MyMerchant | null>;
  setMerchant: (merchant: MyMerchant | null) => void;
  reset: () => void;
};

/** The signed-in user's own merchant, shared by the nav, dashboard and settings. */
export const useMerchantStore = create<MerchantState>((set) => ({
  merchant: undefined,
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const merchant = (await getMyMerchant()) ?? null;
      set({ merchant, loading: false });
      return merchant;
    } catch {
      set({ loading: false, error: "Couldn't load your business. Try again." });
      return null;
    }
  },

  setMerchant: (merchant) => set({ merchant, error: null }),
  reset: () => set({ merchant: undefined, loading: false, error: null }),
}));
