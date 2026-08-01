"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";
import { useWarehouseStaff } from "@/modules/employees/hooks/use-warehouse-staff";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";

type AssignStaffDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  initialStaffIds?: number[];
  onConfirm: (staffUserIds: number[]) => Promise<void>;
  isPending?: boolean;
  translationNamespace?: string;
};

export function AssignStaffDialog({
  open,
  onOpenChange,
  title,
  description,
  initialStaffIds = [],
  onConfirm,
  isPending = false,
  translationNamespace = "inboundSessions",
}: AssignStaffDialogProps) {
  const t = useTranslations(translationNamespace);
  const { data: staff = [], isPending: staffLoading } = useWarehouseStaff({ enabled: open });
  const activeStaff = useMemo(() => staff.filter((row) => row.user.active), [staff]);
  const [selected, setSelected] = useState<number[]>(initialStaffIds);

  useEffect(() => {
    if (open) setSelected(initialStaffIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, JSON.stringify(initialStaffIds)]);

  function toggleStaff(userId: number) {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  async function handleConfirm() {
    if (selected.length === 0) return;
    await onConfirm(selected);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="max-h-64 space-y-2 overflow-y-auto py-1">
          {staffLoading ? (
            <p className="text-body-md text-muted-foreground">{t("loadingStaff")}</p>
          ) : activeStaff.length === 0 ? (
            <p className="text-body-md text-muted-foreground">{t("noActiveStaff")}</p>
          ) : (
            activeStaff.map((row) => {
              const checked = selected.includes(row.user.id);
              return (
                <button
                  key={row.user.id}
                  type="button"
                  onClick={() => toggleStaff(row.user.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-start transition-colors",
                    checked
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span className="text-body-md font-medium text-foreground">
                    {staffFullName(row)}
                  </span>
                  <span className="text-body-sm text-muted-foreground">{row.user.email}</span>
                </button>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            disabled={selected.length === 0 || isPending}
            onClick={() => void handleConfirm()}
          >
            {isPending ? t("saving") : t("assignStaff")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
