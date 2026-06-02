import type { Role } from "@/shared/config/roles";
import { ROLES } from "@/shared/config/roles";
import { normalizeBackendRole } from "@/shared/lib/normalize-backend-role";
import type { AuthUser } from "@/shared/types/auth-session";
import type { UserMeProfile } from "@/modules/user/types/user-profile";
import { getUserMe } from "@/modules/user/services/user-me.service";
import { writeUserProfileCache } from "@/modules/user/lib/user-profile-cache";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";

export type SyncUserSessionResult = {
  user: AuthUser;
  role: Role;
  profile: UserMeProfile;
};

export function mapUserProfileToAuthUser(
  profile: UserMeProfile,
  expiresInSeconds?: number,
): AuthUser {
  const existing = TokenService.getAuthProfile();

  return {
    userId: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    position: profile.position,
    backendRole: profile.role.name,
    accessLevel: profile.position || profile.role.description,
    userActive: profile.userActive,
    tenantType: "WAREHOUSE",
    tenantId: 0,
    tenantName: profile.position || profile.role.description,
    expiresInSeconds:
      expiresInSeconds ??
      existing?.expiresInSeconds ??
      900,
  };
}

export function mapUserProfileToAppRole(profile: UserMeProfile): Role {
  return normalizeBackendRole(profile.role.name) ?? ROLES.SUPPLIER;
}

/** Fetches GET /v1/users/me and syncs cookies + auth store. */
export async function syncUserSessionFromMeApi(): Promise<SyncUserSessionResult> {
  const profile = await getUserMe();
  const user = mapUserProfileToAuthUser(profile);
  const role = mapUserProfileToAppRole(profile);

  TokenService.updateAuthSession({ user, appRole: role });
  useAuthStore.getState().setSession(role, user, profile);
  writeUserProfileCache(profile);

  return { user, role, profile };
}
