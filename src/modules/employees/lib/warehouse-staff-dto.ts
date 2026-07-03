import { asRecord, bool, pickNumber, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  WarehouseStaffAssignment,
  WarehouseStaffRole,
  WarehouseStaffUser,
} from "@/modules/employees/types/warehouse-staff";

function normalizeRole(raw: unknown): WarehouseStaffRole {
  const rec = asRecord(raw) ?? {};
  return {
    id: pickNumber(rec, "id"),
    name: str(rec.name),
    description: str(rec.description),
    systemGenerated: bool(rec.systemGenerated),
    active: bool(rec.active),
    system: bool(rec.system),
  };
}

function normalizeUser(raw: unknown): WarehouseStaffUser | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    id: pickNumber(rec, "id"),
    email: str(rec.email),
    firstName: str(rec.firstName),
    lastName: str(rec.lastName),
    position: str(rec.position),
    role: normalizeRole(rec.role),
    createdAt: str(rec.createdAt),
    updatedAt: str(rec.updatedAt),
    createdBy: pickNumber(rec, "createdBy"),
    updatedBy: pickNumber(rec, "updatedBy"),
    active: bool(rec.active),
    system: bool(rec.system),
  };
}

export function normalizeStaffAssignment(raw: unknown): WarehouseStaffAssignment | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const user = normalizeUser(rec.user);
  if (!user) return null;
  const assignmentId = pickNumber(rec, "assignmentId");
  if (!assignmentId) return null;
  return {
    assignmentId,
    warehouseId: pickNumber(rec, "warehouseId"),
    warehouseName: str(rec.warehouseName),
    warehouseCode: str(rec.warehouseCode),
    user,
  };
}

export function normalizeStaffList(data: unknown): WarehouseStaffAssignment[] {
  if (Array.isArray(data)) {
    return data
      .map((item) => normalizeStaffAssignment(item))
      .filter((item): item is WarehouseStaffAssignment => item != null);
  }

  const payload = unwrapPayload(data);
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeStaffAssignment(item))
      .filter((item): item is WarehouseStaffAssignment => item != null);
  }

  const content = payload.content;
  if (Array.isArray(content)) {
    return content
      .map((item) => normalizeStaffAssignment(item))
      .filter((item): item is WarehouseStaffAssignment => item != null);
  }

  return [];
}

export function staffFullName(row: WarehouseStaffAssignment): string {
  const parts = [row.user.firstName?.trim(), row.user.lastName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : row.user.email?.trim() || "—";
}

export function staffInitials(row: WarehouseStaffAssignment): string {
  const first = row.user.firstName?.trim().charAt(0) ?? "";
  const last = row.user.lastName?.trim().charAt(0) ?? "";
  const combined = `${first}${last}`.toUpperCase();
  if (combined) return combined;
  const email = row.user.email?.trim();
  return email ? email.charAt(0).toUpperCase() : "?";
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, spaceIndex).trim(),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}
