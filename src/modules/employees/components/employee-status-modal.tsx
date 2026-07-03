"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
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
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open || !staff) return;
    setActive(staff.user.active);
  }, [open, staff]);

  async function handleSave() {
    if (!staff || staff.user.id <= 0) return;
    if (active === staff.user.active) {
      onOpenChange(false);
      return;
    }

    try {
      await updateStatus.mutateAsync({
        userId: staff.user.id,
        payload: { active },
      });
      toast.success(active ? t("activateSuccess") : t("deactivateSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("statusError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DIALOG_SHELL_CLASS, "max-w-md gap-0 overflow-hidden p-0")}>
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle>{t("changeStatusTitle")}</DialogTitle>
          <DialogDescription>{t("changeStatusDescription")}</DialogDescription>
        </DialogHeader>

        {staff ? (
          <div className="space-y-5 px-6 pb-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <EmployeeAvatar row={staff} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{staffFullName(staff)}</p>
                <p className="truncate text-sm text-muted-foreground">{staff.user.email}</p>
              </div>
              <EmployeeStatusBadge active={staff.user.active} className="ms-auto shrink-0" />
            </div>

            <div className="space-y-2">
              <Label>{t("statusLabel")}</Label>
              <div className="inline-flex w-full rounded-lg border border-border p-1">
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => setActive(true)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-dark text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("statusActive")}
                </button>
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => setActive(false)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    !active
                      ? "bg-primary-dark text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("statusInactive")}
                </button>
              </div>
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
            onClick={() => void handleSave()}
            className={PRIMARY_BUTTON_CLASS}
          >
            {t("saveStatus")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
