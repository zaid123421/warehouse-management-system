import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getStoragePositionHistory } from "@/modules/warehouse-structure/services/storage-position-history.service";
import type { StoragePositionHistoryEntry } from "@/modules/warehouse-structure/types/storage-position-history";

export const storagePositionHistoryQueryKey = (storagePositionId: number) =>
  ["warehouse", "storage-positions", "history", storagePositionId] as const;

export function useStoragePositionHistory(
  storagePositionId: number | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    storagePositionId != null &&
    storagePositionId > 0 &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: storagePositionHistoryQueryKey(storagePositionId ?? 0),
    queryFn: (): Promise<StoragePositionHistoryEntry[]> =>
      getStoragePositionHistory(storagePositionId as number),
    enabled,
    staleTime: 30_000,
  });
}
