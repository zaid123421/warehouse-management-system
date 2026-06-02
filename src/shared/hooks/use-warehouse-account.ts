"use client";

import { useTranslations } from "next-intl";
import { ROLES, type Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";
import { useAuthUser, useRole, useUserProfile } from "@/shared/hooks/use-can-access";

function getRoleLabel(role: Role | null | undefined, t: (key: string) => string): string {
  if (!role) return "—";
  switch (role) {
    case ROLES.ADMIN:
      return t("roleAdmin");
    case ROLES.SUPPLIER:
      return t("roleSupplier");
    case ROLES.USER:
      return t("roleUser");
    default:
      return role;
  }
}

export function getAvatarInitials(
  user: Pick<AuthUser, "firstName" | "lastName" | "email"> | null | undefined,
  fallback: string,
): string {
  if (user) {
    const fi = user.firstName?.trim();
    const la = user.lastName?.trim();
    if (fi && la) return `${fi[0]}${la[0]}`.toUpperCase();
    if (fi && fi.length >= 2) return fi.slice(0, 2).toUpperCase();
    if (fi) return `${fi[0]}${fi[0]}`.toUpperCase();
    const em = user.email?.trim();
    if (em) {
      const alpha = em.replace(/[^a-zA-Z\u0600-\u06FF]/g, "");
      if (alpha.length >= 2) return alpha.slice(0, 2).toUpperCase();
      return em.slice(0, 2).toUpperCase();
    }
  }
  const p = fallback.trim();
  const words = p.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  if (p.length >= 2) return p.slice(0, 2).toUpperCase();
  return "?";
}

/** Display helpers from GET /v1/users/me */
export function useWarehouseAccount() {
  const tNav = useTranslations("nav");
  const user = useAuthUser();
  const profile = useUserProfile();
  const role = useRole();

  const displayName = (() => {
    if (!user) return tNav("defaultAccountName");
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || tNav("defaultAccountName");
  })();

  const position = profile?.position?.trim() || user?.position?.trim() || null;
  const roleDescription = profile?.role?.description?.trim() || null;

  const roleDisplay =
    position ||
    roleDescription ||
    user?.backendRole?.trim() ||
    getRoleLabel(role, tNav);

  const accessLevel =
    user?.accessLevel?.trim() || profile?.position?.trim() || profile?.role?.description?.trim() || null;

  const avatarInitials = getAvatarInitials(user, displayName);

  return {
    user,
    profile,
    displayName,
    roleDisplay,
    position,
    roleDescription,
    accessLevel,
    avatarInitials,
  };
}
