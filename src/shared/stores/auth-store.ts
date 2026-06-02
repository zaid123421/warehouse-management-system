import { create } from "zustand";
import type { Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";
import type { UserMeProfile } from "@/modules/user/types/user-profile";

interface AuthState {
  role: Role | null;
  user: AuthUser | null;
  userProfile: UserMeProfile | null;
  setRole: (role: Role | null) => void;
  setUser: (user: AuthUser | null) => void;
  setUserProfile: (profile: UserMeProfile | null) => void;
  setSession: (role: Role, user: AuthUser, userProfile?: UserMeProfile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  user: null,
  userProfile: null,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setSession: (role, user, userProfile = null) =>
    set({ role, user, userProfile }),
  clearAuth: () => set({ role: null, user: null, userProfile: null }),
}));
