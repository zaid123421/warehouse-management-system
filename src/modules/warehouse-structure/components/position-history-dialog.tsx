"use client";

import { useFormatter, useTranslations } from "next-intl";
import { History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorAlert } from "@/components/ui/error-alert";
import { StyledTable } from "@/components/ui/styled-table";
import { cn } from "@/lib/utils";
import { DIALOG_SHELL_CLASS } from "@/lib/radius";
import { PositionStatusBadge } from "@/modules/warehouse-structure/components/position-status-badge";
import { useStoragePositionHistory } from "@/modules/warehouse-structure/hooks/use-storage-position-history";
import type { WarehousePosition } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type PositionHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: WarehousePosition | null;
};

function formatMaybeDate(
  value: string | null,
  format: ReturnType<typeof useFormatter>,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format.dateTime(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PositionHistoryDialog({
  open,
  onOpenChange,
  position,
}: PositionHistoryDialogProps) {
  const t = useTranslations("warehouseStructure.positionHistory");
  const format = useFormatter();
  const query = useStoragePositionHistory(position?.id ?? null, {
    enabled: open && position != null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(DIALOG_SHELL_CLASS, "max-w-3xl gap-0 overflow-hidden p-0")}
      >
        <DialogHeader className="space-y-2 p-6 pb-4 text-start">
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            {t("title", { number: position?.positionNumber ?? "—" })}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
          {position ? (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-body-sm text-muted-foreground">
              <span className="font-mono">
                {position.locationBarcode ?? t("noBarcode")}
              </span>
              <PositionStatusBadge status={position.status} />
              {position.tireLabel ? (
                <span className="text-foreground">{position.tireLabel}</span>
              ) : null}
            </div>
          ) : null}
        </DialogHeader>

        <div className="max-h-[min(28rem,60vh)] overflow-auto px-6 pb-6">
          {query.isError ? (
            <ErrorAlert
              message={
                query.error instanceof Error ? query.error.message : t("errorLoading")
              }
              onRetry={() => void query.refetch()}
              retryLabel={t("retry")}
            />
          ) : (
            <StyledTable
              horizontalScroll
              isLoading={query.isPending}
              emptyText={t("empty")}
              keyProp={(row) =>
                row.id != null
                  ? row.id
                  : `${row.action}-${row.occurredAt ?? ""}-${row.tireUniqueId}`
              }
              rows={query.data ?? []}
              columns={[
                {
                  header: t("columns.when"),
                  render: (row) => formatMaybeDate(row.occurredAt, format),
                },
                {
                  header: t("columns.action"),
                  render: (row) => (
                    <span className="font-medium text-foreground">{row.action}</span>
                  ),
                },
                {
                  header: t("columns.actor"),
                  render: (row) => row.actor || "—",
                },
                {
                  header: t("columns.tire"),
                  className: "!whitespace-normal max-w-[12rem]",
                  render: (row) =>
                    row.tireUniqueId ||
                    (row.tireId != null ? `#${row.tireId}` : "—"),
                },
                {
                  header: t("columns.note"),
                  className: "!whitespace-normal max-w-[14rem]",
                  render: (row) => row.note || "—",
                },
              ]}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
