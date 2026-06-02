import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { syncUserSessionFromMeApi } from "@/application/auth/sync-user-session.use-case";
import type { UserMeProfile } from "@/modules/user/types/user-profile";

export const userMeQueryKey = ["user", "me"] as const;

export function useUserMe(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: userMeQueryKey,
    queryFn: async (): Promise<UserMeProfile> => {
      const { profile } = await syncUserSessionFromMeApi();
      return profile;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
