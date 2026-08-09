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
import { useApproveSchedulingCellDealer } from "@/modules/inbound-sessions/hooks/use-approve-scheduling-cell-dealer";
import { useSchedulingCell } from "@/modules/inbound-sessions/hooks/use-scheduling-cell";
import {
  canApproveSchedulingDealer,
  canOpenInboundTruckPlanning,
} from "@/modules/inbound-sessions/lib/status-utils";
import type {
  SchedulingCellDealer,
  SchedulingCellDetail,
  SchedulingCellRequest,
} from "@/modules/inbound-sessions/types/scheduling";

type SchedulingCellDetailPanelProps = {
  cellId: number | null;
  onClose?: () => void;
  onOpenPlanning?: (cellId?: number) => void;
};

type DealerGroup = {
  dealer: SchedulingCellDealer;
  requests: SchedulingCellRequest[];
};

function buildDealerGroups(detail: SchedulingCellDetail): DealerGroup[] {
  if (detail.dealers.length > 0) {
    return detail.dealers.map((dealer) => ({
      dealer,
      requests: detail.requests.filter((request) => request.dealerId === dealer.dealerId),
    }));
  }

  const byDealer = new Map<number | string, DealerGroup>();
  for (const request of detail.requests) {
    const key = request.dealerId ?? request.dealerName ?? "unknown";
    const existing = byDealer.get(key);
    if (existing) {
      existing.requests.push(request);
      existing.dealer.requestCount += 1;
      existing.dealer.totalVolume += request.totalVolume ?? 0;
      continue;
    }
    byDealer.set(key, {
      dealer: {
        dealerId: request.dealerId ?? 0,
        dealerName: request.dealerName ?? "—",
        requestCount: 1,
        totalVolume: request.totalVolume ?? 0,
        approved: request.scheduleStatus === "APPROVED",
        readyForApproval: request.scheduleStatus !== "APPROVED",
      },
      requests: [request],
    });
  }
  return Array.from(byDealer.values());
}

export function SchedulingCellDetailPanel({
  cellId,
  onClose,
  onOpenPlanning,
}: SchedulingCellDetailPanelProps) {
  const t = useTranslations("inboundSessions");
  const enabled = cellId != null && cellId > 0;
  const { data, isPending, isError, error, refetch } = useSchedulingCell(cellId, { enabled });
  const approveMutation = useApproveSchedulingCellDealer();

  const dealerGroups = useMemo(() => (data ? buildDealerGroups(data) : []), [data]);

  const summaryLine = useMemo(() => {
    if (!data) return "";
    return t("cellDetailSummary", {
      tires: data.totalVolume,
      requests: data.requests.length,
      trucks: data.estimatedTrucks,
    });
  }, [data, t]);

  if (!cellId) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card px-4 py-10 text-center dark:border-[var(--color-surface-container-high)]">
        <p className="text-body-md text-muted-foreground">{t("cellDetailPlaceholder")}</p>
      </div>
    );
  }

  async function handleApproveDealer(dealerId: number) {
    if (!cellId || !data || dealerId <= 0) return;
    try {
      await approveMutation.mutateAsync({
        cellId,
        dealerId,
        version: data.version,
      });
      toast.success(t("approveDealerSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  const regionName = data?.regionCityName || data?.regionProvinceName || "—";

  return (
    <SchedulingCellDetailPanelFrame
      title={t("cellDetailTitle")}
      subtitle={
        data
          ? [data.serviceDate, formatSchedulingDayLabel(String(data.receivingDay)), regionName]
              .filter(Boolean)
              .join(" · ")
          : t("cellDetailLoading")
      }
      onClose={onClose}
      closeLabel={t("closePanel")}
      footer={
        data && canOpenInboundTruckPlanning(data.status) ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenPlanning?.(data.cellId)}
          >
            <ArrowRight className="size-4" />
            {t("openTruckPlanning")}
          </Button>
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

      {isPending ? <Skeleton className="h-40 w-full rounded-lg" /> : null}

      {data ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SessionStatusBadge status={data.status} />
              <span className="text-body-sm text-muted-foreground">{summaryLine}</span>
            </div>
            <p className="text-body-sm text-muted-foreground">
              {t("cellDealersProgress", {
                approved: data.approvedDealerCount,
                total: data.totalDealerCount,
              })}
            </p>
            {data.cutoffAt ? (
              <p className="text-body-sm text-muted-foreground">
                {t("cellCutoffAt", { cutoff: data.cutoffAt })}
              </p>
            ) : null}
            {data.readyForApproval === false && data.status !== "APPROVED" ? (
              <p className="text-body-sm text-amber-700 dark:text-amber-400">
                {t("cellCutoffPendingHint")}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <h4 className="text-body-sm font-semibold text-foreground">
              {t("cellDealersTitle")}
            </h4>
            {dealerGroups.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">{t("noCellDealers")}</p>
            ) : (
              <ul className="space-y-3">
                {dealerGroups.map(({ dealer, requests }) => {
                  const canApprove = canApproveSchedulingDealer(dealer);
                  const approvingThis =
                    approveMutation.isPending &&
                    approveMutation.variables?.dealerId === dealer.dealerId;

                  return (
                    <li
                      key={dealer.dealerId || dealer.dealerName}
                      className="overflow-hidden rounded-xl border border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 bg-muted/30 px-3 py-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-body-md font-semibold text-foreground">
                            {dealer.dealerName || t("unknownDealer")}
                          </p>
                          <p className="text-body-sm text-muted-foreground">
                            {t("cellDealerSummary", {
                              requests: dealer.requestCount,
                              tires: dealer.totalVolume,
                            })}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {dealer.approved ? (
                              <SessionStatusBadge status="APPROVED" />
                            ) : dealer.readyForApproval ? (
                              <span className="text-body-sm text-amber-700 dark:text-amber-400">
                                {t("dealerReadyForApproval")}
                              </span>
                            ) : (
                              <span className="text-body-sm text-muted-foreground">
                                {t("dealerWaitingCutoff")}
                              </span>
                            )}
                          </div>
                        </div>
                        {canApprove ? (
                          <Button
                            type="button"
                            size="sm"
                            className={PRIMARY_BUTTON_CLASS}
                            disabled={approveMutation.isPending}
                            onClick={() => void handleApproveDealer(dealer.dealerId)}
                          >
                            <Check className="size-4" />
                            {approvingThis ? t("saving") : t("approveDealer")}
                          </Button>
                        ) : null}
                      </div>

                      <ul className="divide-y divide-[var(--color-surface-light-container)] dark:divide-[var(--color-surface-container-high)]">
                        {requests.length === 0 ? (
                          <li className="px-3 py-2.5 text-body-sm text-muted-foreground">
                            {t("noDealerRequests")}
                          </li>
                        ) : (
                          requests.map((request) => (
                            <li key={request.inboundRequestId} className="px-3 py-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-body-md font-medium text-foreground">
                                    #{request.inboundRequestId}
                                    {request.shipmentRequestId
                                      ? ` · SR-${request.shipmentRequestId}`
                                      : ""}
                                  </p>
                                  <p className="text-body-sm text-muted-foreground">
                                    {request.totalVolume != null
                                      ? t("gridCellTires", { count: request.totalVolume })
                                      : "—"}
                                    {request.scheduleStatus
                                      ? ` · ${request.scheduleStatus.replaceAll("_", " ")}`
                                      : ""}
                                  </p>
                                </div>
                                <SessionStatusBadge status={request.status} />
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </SchedulingCellDetailPanelFrame>
  );
}
