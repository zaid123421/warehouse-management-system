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
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { useApproveOutboundSchedulingCellDealer } from "@/modules/outbound-sessions/hooks/use-approve-outbound-scheduling-cell-dealer";
import { useOutboundSchedulingCell } from "@/modules/outbound-sessions/hooks/use-outbound-scheduling-cell";
import {
  canApproveOutboundSchedulingDealer,
  canOpenOutboundTruckPlanning,
} from "@/modules/outbound-sessions/lib/status-utils";
import type {
  OutboundSchedulingCellDealer,
  OutboundSchedulingCellDetail,
  OutboundSchedulingCellRequest,
} from "@/modules/outbound-sessions/types/scheduling";

type OutboundSchedulingCellDetailPanelProps = {
  cellId: number | null;
  onClose?: () => void;
  onOpenPlanning?: (cellId?: number) => void;
};

type DealerGroup = {
  dealer: OutboundSchedulingCellDealer;
  requests: OutboundSchedulingCellRequest[];
};

function buildDealerGroups(detail: OutboundSchedulingCellDetail): DealerGroup[] {
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

export function OutboundSchedulingCellDetailPanel({
  cellId,
  onClose,
  onOpenPlanning,
}: OutboundSchedulingCellDetailPanelProps) {
  const t = useTranslations("outboundSessions");
  const enabled = cellId != null && cellId > 0;
  const { data, isPending, isError, error, refetch } = useOutboundSchedulingCell(cellId, {
    enabled,
  });
  const approveMutation = useApproveOutboundSchedulingCellDealer();

  const dealerGroups = useMemo(() => (data ? buildDealerGroups(data) : []), [data]);

  const cityName = data?.regionCityName || data?.regionProvinceName || "—";
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

  return (
    <SchedulingCellDetailPanelFrame
      title={t("cellDetailTitle")}
      subtitle={
        data
          ? [data.serviceDate, formatSchedulingDayLabel(String(data.deliveryDay)), cityName]
              .filter(Boolean)
              .join(" · ")
          : t("cellDetailLoading")
      }
      onClose={onClose}
      closeLabel={t("closePanel")}
      footer={
        data && canOpenOutboundTruckPlanning(data.status) ? (
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
              <OutboundSessionStatusBadge status={data.status} />
              <span className="text-body-sm text-muted-foreground">{summaryLine}</span>
            </div>
            <p className="text-body-sm text-muted-foreground">
              {t("cellDealersProgress", {
                approved: data.approvedDealerCount ?? 0,
                total: data.totalDealerCount ?? dealerGroups.length,
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
                  const canApprove = canApproveOutboundSchedulingDealer(dealer);
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
                              <OutboundSessionStatusBadge status="APPROVED" />
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
                            <li key={request.outboundRequestId} className="px-3 py-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-body-md font-medium text-foreground">
                                    #{request.outboundRequestId}
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
                                <OutboundSessionStatusBadge status={request.status} />
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
