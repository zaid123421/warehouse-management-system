"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { SchedulingCellDetailPanelFrame } from "@/shared/components/scheduling/scheduling-cell-detail-panel-frame";
import { formatSchedulingDayLabel } from "@/shared/lib/scheduling-grid-utils";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { useApproveOutboundSchedulingCell } from "@/modules/outbound-sessions/hooks/use-approve-outbound-scheduling-cell";
import { useOutboundSchedulingCell } from "@/modules/outbound-sessions/hooks/use-outbound-scheduling-cell";
import { canApproveOutboundSchedulingCell } from "@/modules/outbound-sessions/lib/status-utils";

type OutboundSchedulingCellDetailPanelProps = {
  cellId: number | null;
  onClose?: () => void;
};

export function OutboundSchedulingCellDetailPanel({
  cellId,
  onClose,
}: OutboundSchedulingCellDetailPanelProps) {
  const t = useTranslations("outboundSessions");
  const enabled = cellId != null && cellId > 0;
  const { data, isPending, isError, error, refetch } = useOutboundSchedulingCell(cellId, {
    enabled,
  });
  const approveMutation = useApproveOutboundSchedulingCell();

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
          ? `${formatSchedulingDayLabel(data.deliveryDay)} · ${data.regionProvinceName ?? "—"}`
          : t("cellDetailLoading")
      }
      onClose={onClose}
      closeLabel={t("closePanel")}
      footer={
        data && canApproveOutboundSchedulingCell(data.status) ? (
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
            <OutboundSessionStatusBadge status={data.status} />
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
                    key={request.outboundRequestId}
                    className="rounded-lg border border-[var(--color-surface-light-container)] px-3 py-2 dark:border-[var(--color-surface-container-high)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-body-md font-medium text-foreground">
                          {request.dealerName ?? t("unknownDealer")}
                        </p>
                        <p className="text-body-sm text-muted-foreground">
                          #{request.outboundRequestId}
                          {request.totalVolume != null
                            ? ` · ${t("gridCellTires", { count: request.totalVolume })}`
                            : ""}
                        </p>
                      </div>
                      <OutboundSessionStatusBadge status={request.status} />
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
