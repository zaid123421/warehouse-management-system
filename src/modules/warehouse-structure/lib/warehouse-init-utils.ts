import {
  INITIATE_WAREHOUSE_LIMITS,
  type InitiateWarehouseRequest,
} from "@/modules/warehouse-structure/types/my-warehouse";

export type InitFieldKey = keyof InitiateWarehouseRequest;

export const INIT_FIELD_ORDER: InitFieldKey[] = [
  "zonesCount",
  "rowsPerZone",
  "racksPerRow",
  "slotsPerRack",
  "positionsPerSlot",
];

export function parseInitFieldValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isInteger(value)) return null;
  return value;
}

export function clampInitFieldValue(key: InitFieldKey, value: number): number {
  const { min, max } = INITIATE_WAREHOUSE_LIMITS[key];
  return Math.min(max, Math.max(min, value));
}

export type WarehouseInitSummary = {
  zones: number;
  racksPerZone: number;
  slotsPerZone: number;
  totalPositions: number;
};

export function computeWarehouseInitSummary(
  form: Record<InitFieldKey, string>,
): WarehouseInitSummary | null {
  const parsed = INIT_FIELD_ORDER.map((key) => parseInitFieldValue(form[key]));
  if (parsed.some((value) => value == null)) return null;

  const [zones, rowsPerZone, racksPerRow, slotsPerRack, positionsPerSlot] = parsed as number[];
  const racksPerZone = rowsPerZone * racksPerRow;
  const slotsPerZone = racksPerZone * slotsPerRack;
  const totalPositions = zones * slotsPerZone * positionsPerSlot;

  return {
    zones,
    racksPerZone,
    slotsPerZone,
    totalPositions,
  };
}
