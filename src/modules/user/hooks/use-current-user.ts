"use client";

import { useUserMe, userMeQueryKey } from "@/modules/user/hooks/use-user-me";
import { useAuthUser, useUserId, useUserProfile } from "@/shared/hooks/use-can-access";
import type { UserMeProfile } from "@/modules/user/types/user-profile";
import type { AuthUser } from "@/shared/types/auth-session";

export { userMeQueryKey };

export type CurrentUserState = {
  profile: UserMeProfile | null;
  user: AuthUser | null;
  userId: number | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Single entry point for GET /v1/users/me across the app.
 * Fetches when a token exists and exposes normalized profile + session user.
 */
export function useCurrentUser(options?: { enabled?: boolean }): CurrentUserState {
  const query = useUserMe(options);
  const profile = useUserProfile();
  const user = useAuthUser();
  const userId = useUserId();

  return {
    profile,
    user,
    userId,
    isLoading: query.isPending && profile == null,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
