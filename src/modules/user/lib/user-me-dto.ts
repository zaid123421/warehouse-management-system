import type {
  UserMePermission,
  UserMeProfile,
  UserMeRole,
} from "@/modules/user/types/user-profile";
import { asRecord, bool, num, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";

function normalizePermission(raw: unknown): UserMePermission | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const name = str(rec.name);
  if (!name) return null;
  return {
    id: pickNumber(rec, "id"),
    name,
    description: str(rec.description),
    resource: str(rec.resource),
    action: str(rec.action),
    systemGenerated: bool(rec.systemGenerated),
    active: bool(rec.active),
  };
}

function normalizePermissions(raw: unknown): UserMePermission[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizePermission(item))
    .filter((item): item is UserMePermission => item != null);
}

function normalizeRole(raw: unknown): UserMeRole | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const name = str(rec.name);
  if (!name) return null;
  return {
    id: pickNumber(rec, "id"),
    name,
    description: str(rec.description),
    systemGenerated: bool(rec.systemGenerated),
    active: bool(rec.active),
    system: bool(rec.system),
  };
}

/** Accepts GET /v1/users/me response body (wrapped or unwrapped). */
export function normalizeUserMeDto(data: unknown): UserMeProfile | null {
  const payload = unwrapPayload(data);
  const email = str(payload.email);
  if (!email) return null;

  const role = normalizeRole(payload.role);
  if (!role) return null;

  return {
    id: pickNumber(payload, "id"),
    email,
    firstName: str(payload.firstName),
    lastName: str(payload.lastName),
    position: str(payload.position),
    role,
    additionalPermissions: normalizePermissions(payload.additionalPermissions),
    createdAt: str(payload.createdAt),
    updatedAt: str(payload.updatedAt),
    createdBy: pickNumber(payload, "createdBy"),
    updatedBy: pickNumber(payload, "updatedBy"),
    active: bool(payload.active),
    system: bool(payload.system),
  };
}
