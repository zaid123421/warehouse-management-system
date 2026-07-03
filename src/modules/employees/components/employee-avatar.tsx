import { cn } from "@/lib/utils";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";
import { staffInitials } from "@/modules/employees/lib/warehouse-staff-dto";

type EmployeeAvatarProps = {
  row: WarehouseStaffAssignment;
  className?: string;
};

export function EmployeeAvatar({ row, className }: EmployeeAvatarProps) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-dark/15 text-xs font-bold uppercase text-primary-dark",
        className,
      )}
      aria-hidden
    >
      {staffInitials(row)}
    </div>
  );
}
