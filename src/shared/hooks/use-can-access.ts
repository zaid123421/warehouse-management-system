"use client";

import { useEffect } from "react";
import { canAccess as checkCanAccess } from "@/shared/config/permissions";
import { useAuthStore } from "@/shared/stores/auth-store";
import TokenService from "@/infrastructure/auth/token-service";
import { readUserProfileCache } from "@/modules/user/lib/user-profile-cache";

/**
 * يملأ الـ store من الـ cookies عند التحميل (دور + ملف المستخدم).
 */
function useSyncAuthFromCookie() {
  const setRole = useAuthStore((s) => s.setRole);
  const setUser = useAuthStore((s) => s.setUser);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);

  useEffect(() => {
    const role = TokenService.getRole();
    const user = TokenService.getAuthProfile();
    setRole(role);
    setUser(user);
    if (!useAuthStore.getState().userProfile) {
      const cached = readUserProfileCache();
      if (cached) setUserProfile(cached);
    }
  }, [setRole, setUser, setUserProfile]);
}

/**
 * يرجع هل المستخدم الحالي يملك صلاحية الوصول للمسار المعطى.
 */
export function useCanAccess(pathname: string): boolean {
  useSyncAuthFromCookie();
  const role = useAuthStore((s) => s.role);
  return checkCanAccess(role, pathname);
}

/**
 * دور المستخدم الحالي (من الـ store بعد مزامنته مع GET /v1/users/me).
 */
export function useRole() {
  useSyncAuthFromCookie();
  return useAuthStore((s) => s.role);
}

/**
 * بيانات المستخدم من GET /v1/users/me (بعد مزامنة الجلسة).
 */
export function useAuthUser() {
  useSyncAuthFromCookie();
  return useAuthStore((s) => s.user);
}

/** معرف المستخدم من GET /v1/users/me */
export function useUserId(): number | null {
  const profile = useUserProfile();
  const user = useAuthUser();
  if (profile?.id != null && profile.id > 0) return profile.id;
  if (user?.userId != null && user.userId > 0) return user.userId;
  return null;
}

/** الملف الكامل من GET /v1/users/me */
export function useUserProfile() {
  useSyncAuthFromCookie();
  return useAuthStore((s) => s.userProfile);
}

/** @deprecated استخدم useUserId */
export function useWarehouseId(): number | null {
  return useUserId();
}

/** @deprecated استخدم useUserProfile */
export function useWarehouseProfile() {
  return useUserProfile();
}
