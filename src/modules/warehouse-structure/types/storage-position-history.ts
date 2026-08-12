export type StoragePositionHistoryEntry = {
  id: number | null;
  action: string;
  occurredAt: string | null;
  actor: string;
  tireUniqueId: string;
  tireId: number | null;
  note: string;
  raw: Record<string, unknown>;
};
