import { create } from "zustand";
import type { Profile } from "@/types";

interface AuthStore {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
