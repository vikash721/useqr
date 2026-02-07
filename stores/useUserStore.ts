"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserProfile = {
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  plan: string;
  createdAt?: string;
};

type UserStore = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
};

const STORAGE_KEY = "useqr-user";

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: STORAGE_KEY }
  )
);
