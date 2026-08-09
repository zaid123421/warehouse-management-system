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
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { EmployeeAvatar } from "@/modules/employees/components/employee-avatar";
import { EmployeeStatusBadge } from "@/modules/employees/components/employee-status-badge";
import { useUpdateStaffStatus } from "@/modules/employees/hooks/use-update-staff-status";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";

export type EmployeeStatusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: WarehouseStaffAssignment | null;
};

export function EmployeeStatusModal({ open, onOpenChange, staff }: EmployeeStatusModalProps) {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const updateStatus = useUpdateStaffStatus();

  const currentlyActive = staff?.user.active ?? false;
  const nextActive = !currentlyActive;

  async function handleConfirm() {
    if (!staff || staff.user.id <= 0) return;

    try {
      await updateStatus.mutateAsync({
        userId: staff.user.id,
        payload: { active: nextActive },
      });
      toast.success(nextActive ? t("activateSuccess") : t("deactivateSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("statusError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DIALOG_SHELL_CLASS, "max-w-md gap-0 overflow-hidden p-0")}>
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle>
            {nextActive ? t("activate") : t("deactivate")}
          </DialogTitle>
          <DialogDescription>
            {nextActive ? t("activateConfirm") : t("deactivateConfirm")}
          </DialogDescription>
        </DialogHeader>

        {staff ? (
          <div className="px-6 pb-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <EmployeeAvatar row={staff} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{staffFullName(staff)}</p>
                <p className="truncate text-sm text-muted-foreground">{staff.user.email}</p>
              </div>
              <EmployeeStatusBadge active={staff.user.active} className="ms-auto shrink-0" />
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 p-6 pt-4 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={updateStatus.isPending}
            onClick={() => onOpenChange(false)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            disabled={updateStatus.isPending || !staff}
            onClick={() => void handleConfirm()}
            className={cn(
              nextActive
                ? PRIMARY_BUTTON_CLASS
                : "border-0 bg-warning-dark text-white hover:bg-warning-dark/90",
            )}
          >
            {nextActive ? t("activate") : t("deactivate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
