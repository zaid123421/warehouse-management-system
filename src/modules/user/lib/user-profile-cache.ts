import type { UserMeProfile } from "@/modules/user/types/user-profile";

const CACHE_KEY = "wms-user-profile-cache";

export function readUserProfileCache(): UserMeProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserMeProfile;
  } catch {
    return null;
  }
}

export function writeUserProfileCache(profile: UserMeProfile): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore quota errors */
  }
}

export function clearUserProfileCache(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem("wms-warehouse-profile-cache");
}
