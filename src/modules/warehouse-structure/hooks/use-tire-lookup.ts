import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { lookupTireByUniqueId } from "@/modules/warehouse-structure/services/tire-lookup.service";
import type { TireLookupResult } from "@/modules/warehouse-structure/types/tire-lookup";

export const tireLookupQueryKey = (uniqueId: string) =>
  ["warehouse", "tires", "lookup", uniqueId] as const;

export function useTireLookup(
  uniqueId: string | null,
  options?: { enabled?: boolean },
) {
  const trimmed = uniqueId?.trim() ?? "";
  const enabled =
    (options?.enabled ?? true) &&
    trimmed.length > 0 &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: tireLookupQueryKey(trimmed),
    queryFn: (): Promise<TireLookupResult> => lookupTireByUniqueId(trimmed),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}
