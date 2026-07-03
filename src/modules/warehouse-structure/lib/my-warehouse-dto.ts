import { asRecord, bool, pickNumber, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  MyWarehouse,
  WarehouseAddress,
  WarehouseInitializationStatus,
} from "@/modules/warehouse-structure/types/my-warehouse";

const INITIALIZATION_STATUSES = new Set<WarehouseInitializationStatus>([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
]);

function normalizeInitializationStatus(raw: unknown): WarehouseInitializationStatus {
  const value = str(raw);
  if (INITIALIZATION_STATUSES.has(value as WarehouseInitializationStatus)) {
    return value as WarehouseInitializationStatus;
  }
  return "NOT_STARTED";
}

function normalizeAddress(raw: unknown): WarehouseAddress | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    id: pickNumber(rec, "id"),
    streetName: str(rec.streetName),
    streetNumber: str(rec.streetNumber),
    postalCode: str(rec.postalCode),
    unitNumber: str(rec.unitNumber),
    city: str(rec.city),
    province: str(rec.province),
    country: str(rec.country),
    specialInstructions: str(rec.specialInstructions),
  };
}

export function normalizeMyWarehouse(raw: unknown): MyWarehouse | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id");
  if (!id) return null;
  return {
    id,
    warehouseName: str(rec.warehouseName),
    warehouseCode: str(rec.warehouseCode),
    email: str(rec.email),
    phoneNumber: str(rec.phoneNumber),
    address: normalizeAddress(rec.address),
    status: str(rec.status),
    initialized: bool(rec.initialized),
    initializationStatus: normalizeInitializationStatus(rec.initializationStatus),
    latestJobId: pickNumber(rec, "latestJobId") || null,
    zonesCount: pickNumber(rec, "zonesCount"),
    createdAt: str(rec.createdAt),
    updatedAt: str(rec.updatedAt),
  };
}

export function normalizeMyWarehouseResponse(data: unknown): MyWarehouse {
  const direct = normalizeMyWarehouse(data);
  if (direct) return direct;

  const payload = unwrapPayload(data);
  const fromPayload = normalizeMyWarehouse(payload);
  if (fromPayload) return fromPayload;

  throw new Error("Invalid warehouse response");
}
