import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";

export type StaffStatusFilter = "all" | "active" | "inactive";

export function filterStaffBySearch(
  rows: WarehouseStaffAssignment[],
  query: string,
): WarehouseStaffAssignment[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;

  const terms = q.split(/\s+/).filter(Boolean);

  return rows.filter((row) => {
    const fields = [
      row.user.firstName,
      row.user.lastName,
      staffFullName(row),
      row.user.email,
      row.user.position,
      row.user.role.name,
    ]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const haystack = fields.join(" ");
    return terms.every((term) => haystack.includes(term));
  });
}

export function filterStaffByStatus(
  rows: WarehouseStaffAssignment[],
  status: StaffStatusFilter,
): WarehouseStaffAssignment[] {
  if (status === "all") return rows;
  if (status === "active") return rows.filter((row) => row.user.active);
  return rows.filter((row) => !row.user.active);
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  if (!iso) return "—";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "—";
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr ago`;
}
