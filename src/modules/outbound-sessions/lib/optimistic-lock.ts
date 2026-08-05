export type WmsOptimisticLockBody = {
  version: number;
};

/** Body token from the last GET of the mutated resource. Defaults to 0 if unread. */
export function toVersionBody(version?: number | null): WmsOptimisticLockBody {
  return { version: version ?? 0 };
}
