import type { QueryClient } from "@tanstack/react-query";
import { userMeQueryKey } from "@/modules/user/hooks/use-user-me";

export function invalidateUserMe(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: userMeQueryKey });
}
