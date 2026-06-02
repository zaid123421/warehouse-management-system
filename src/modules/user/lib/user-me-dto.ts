import type { UserMeProfile, UserMeRole } from "@/modules/user/types/user-profile";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function stringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => str(item)).filter(Boolean);
}

function unwrapPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}

function normalizeRole(raw: unknown): UserMeRole | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const name = str(rec.name);
  if (!name) return null;
  return {
    id: num(rec.id),
    name,
    description: str(rec.description),
    active: rec.active !== false,
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
    id: num(payload.id),
    email,
    firstName: str(payload.firstName),
    lastName: str(payload.lastName),
    position: str(payload.position),
    role,
    userActive: payload.active !== false,
    additionalPermissions: stringArray(payload.additionalPermissions),
  };
}
