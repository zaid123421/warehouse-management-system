"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DIALOG_SHELL_CLASS } from "@/lib/radius";
import { EmployeeAvatar } from "@/modules/employees/components/employee-avatar";
import { useDeleteStaff } from "@/modules/employees/hooks/use-delete-staff";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";

export type EmployeeDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: WarehouseStaffAssignment | null;
};

export function EmployeeDeleteModal({ open, onOpenChange, staff }: EmployeeDeleteModalProps) {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const deleteStaff = useDeleteStaff();

  async function handleDelete() {
    if (!staff || staff.user.id <= 0) return;

    try {
      await deleteStaff.mutateAsync(staff.user.id);
      toast.success(t("deleteSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("deleteError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DIALOG_SHELL_CLASS, "max-w-md gap-0 overflow-hidden p-0")}>
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle>{t("deleteEmployeeTitle")}</DialogTitle>
          <DialogDescription>{t("deleteEmployeeDescription")}</DialogDescription>
        </DialogHeader>

        {staff ? (
          <div className="px-6 pb-2">
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <EmployeeAvatar row={staff} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{staffFullName(staff)}</p>
                <p className="truncate text-sm text-muted-foreground">{staff.user.email}</p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 p-6 pt-4 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={deleteStaff.isPending}
            onClick={() => onOpenChange(false)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteStaff.isPending || !staff}
            onClick={() => void handleDelete()}
          >
            {t("deleteEmployeeConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
