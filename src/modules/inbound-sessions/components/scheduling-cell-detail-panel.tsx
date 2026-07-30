"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { SchedulingCellDetailPanelFrame } from "@/shared/components/scheduling/scheduling-cell-detail-panel-frame";
import { formatSchedulingDayLabel } from "@/shared/lib/scheduling-grid-utils";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useApproveSchedulingCell } from "@/modules/inbound-sessions/hooks/use-approve-scheduling-cell";
import { useSchedulingCell } from "@/modules/inbound-sessions/hooks/use-scheduling-cell";
import { canApproveSchedulingCell } from "@/modules/inbound-sessions/lib/status-utils";

type SchedulingCellDetailPanelProps = {
  cellId: number | null;
  onClose?: () => void;
  onOpenPlanning?: (cellId?: number) => void;
};

export function SchedulingCellDetailPanel({
  cellId,
  onClose,
  onOpenPlanning,
}: SchedulingCellDetailPanelProps) {
  const t = useTranslations("inboundSessions");
  const enabled = cellId != null && cellId > 0;
  const { data, isPending, isError, error, refetch } = useSchedulingCell(cellId, { enabled });
  const approveMutation = useApproveSchedulingCell();

  const summaryLine = useMemo(() => {
    if (!data) return "";
    return t("cellDetailSummary", {
      tires: data.totalVolume ?? 0,
      requests: data.requests.length,
      trucks: data.estimatedTrucks ?? 0,
    });
  }, [data, t]);

  if (!cellId) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card px-4 py-10 text-center dark:border-[var(--color-surface-container-high)]">
        <p className="text-body-md text-muted-foreground">{t("cellDetailPlaceholder")}</p>
      </div>
    );
  }

  async function handleApprove() {
    if (!cellId) return;
    try {
      await approveMutation.mutateAsync(cellId);
      toast.success(t("approveCellSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <SchedulingCellDetailPanelFrame
      title={t("cellDetailTitle")}
      subtitle={
        data
          ? `${formatSchedulingDayLabel(data.receivingDay)} · ${data.regionProvinceName ?? "—"}`
          : t("cellDetailLoading")
      }
      onClose={onClose}
      closeLabel={t("closePanel")}
      footer={
        data ? (
          <>
            {canApproveSchedulingCell(data.status) ? (
              <>
                <p className="text-body-sm text-muted-foreground">{t("cellDetailApproveHint")}</p>
                <Button
                  type="button"
                  className={PRIMARY_BUTTON_CLASS}
                  disabled={approveMutation.isPending}
                  onClick={() => void handleApprove()}
                >
                  <Check className="size-4" />
                  {t("approveCellGenerate")}
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenPlanning?.(data.cellId)}
            >
              <ArrowRight className="size-4" />
              {t("openTruckPlanning")}
            </Button>
          </>
        ) : undefined
      }
    >
      {isError ? (
        <div className="space-y-3">
          <p className="text-body-md text-destructive">
            {error instanceof Error ? error.message : t("errorLoading")}
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            {t("retry")}
          </Button>
        </div>
      ) : null}

      {isPending ? <Skeleton className="h-32 w-full rounded-lg" /> : null}

      {data ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SessionStatusBadge status={data.status} />
            <span className="text-body-sm text-muted-foreground">{summaryLine}</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-body-sm font-semibold text-foreground">{t("cellRequestsTitle")}</h4>
            {data.requests.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">{t("noCellRequests")}</p>
            ) : (
              <ul className="space-y-2">
                {data.requests.map((request) => (
                  <li
                    key={request.inboundRequestId}
                    className="rounded-lg border border-[var(--color-surface-light-container)] px-3 py-2 dark:border-[var(--color-surface-container-high)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-body-md font-medium text-foreground">
                          {request.dealerName ?? t("unknownDealer")}
                        </p>
                        <p className="text-body-sm text-muted-foreground">
                          #{request.inboundRequestId}
                          {request.totalVolume != null
                            ? ` · ${t("gridCellTires", { count: request.totalVolume })}`
                            : ""}
                        </p>
                      </div>
                      <SessionStatusBadge status={request.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </SchedulingCellDetailPanelFrame>
  );
}
