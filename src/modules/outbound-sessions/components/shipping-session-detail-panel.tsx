"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { SchedulingCellDetailPanelFrame } from "@/shared/components/scheduling/scheduling-cell-detail-panel-frame";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { useWarehouseStaff } from "@/modules/employees/hooks/use-warehouse-staff";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { useShippingSessionDetail } from "@/modules/outbound-sessions/hooks/use-shipping-session-detail";
import {
  formatDayLabel,
  formatDealerSummary,
} from "@/modules/outbound-sessions/lib/status-utils";

type ShippingSessionDetailPanelProps = {
  sessionId: number | null;
  onClose?: () => void;
};

export function ShippingSessionDetailPanel({
  sessionId,
  onClose,
}: ShippingSessionDetailPanelProps) {
  const t = useTranslations("outboundSessions");
  const { data, isPending, isError, error, refetch } = useShippingSessionDetail(sessionId);
  const { data: staff = [] } = useWarehouseStaff({ enabled: sessionId != null });

  const assignedStaffLabel = useMemo(() => {
    if (!data?.assignedStaffUserIds?.length) return t("notAssignedYet");
    const names = data.assignedStaffUserIds
      .map((userId) => {
        const row = staff.find((s) => s.user.id === userId);
        return row ? staffFullName(row) : `#${userId}`;
      })
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : t("notAssignedYet");
  }, [data?.assignedStaffUserIds, staff, t]);

  const remainingTires = useMemo(() => {
    if (!data) return 0;
    return Math.max(0, data.expectedTires - data.shippedTires - data.missingTires);
  }, [data]);

  if (!sessionId) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card px-4 py-10 text-center dark:border-[var(--color-surface-container-high)]">
        <p className="text-body-md text-muted-foreground">{t("shippingDetailPlaceholder")}</p>
      </div>
    );
  }

  return (
    <SchedulingCellDetailPanelFrame
      title={t("shippingDetailTitle", { id: sessionId })}
      subtitle={
        data
          ? `${formatDayLabel(data.deliveryDay ?? "")} · ${formatDealerSummary(data.outboundRequests, t("unknownDealer"))}`
          : t("shippingDetailLoading")
      }
      onClose={onClose}
      closeLabel={t("closePanel")}
    >
      {isError ? (
        <div className="space-y-3">
          <p className="text-body-md text-destructive">
            {error instanceof Error ? error.message : t("errorLoading")}
          </p>
          <button
            type="button"
            className="text-body-sm font-medium text-primary hover:underline"
            onClick={() => void refetch()}
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      {isPending ? <Skeleton className="h-40 w-full rounded-lg" /> : null}

      {data ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <OutboundSessionStatusBadge status={data.status} />
            <span className="text-body-sm text-muted-foreground">{assignedStaffLabel}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Metric label={t("shippingTotalTires")} value={data.expectedTires} />
            <Metric label={t("shippingScanned")} value={data.shippedTires} />
            <Metric label={t("shippingRemaining")} value={remainingTires} />
          </div>

          {data.missingTires > 0 ? (
            <p className="text-body-sm text-amber-700 dark:text-amber-400">
              {t("shippingMissingCount", { count: data.missingTires })}
            </p>
          ) : (
            <p className="text-body-sm text-emerald-700 dark:text-emerald-400">
              {t("shippingNoMissing")}
            </p>
          )}

          <SessionProgressBar
            value={data.progressPercent ?? 0}
            label={t("shippingScanProgress", {
              shipped: data.shippedTires,
              expected: data.expectedTires,
            })}
          />

          <section className="space-y-2">
            <h4 className="text-body-sm font-semibold text-foreground">
              {t("shippingLinkedRequestsTitle")}
            </h4>
            {data.outboundRequests.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">{t("noLinkedRequests")}</p>
            ) : (
              <ul className="space-y-2">
                {data.outboundRequests.map((request) => (
                  <li
                    key={request.outboundRequestId}
                    className="rounded-lg border border-[var(--color-surface-light-container)] px-3 py-2 dark:border-[var(--color-surface-container-high)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-body-md font-medium text-foreground">
                          {request.dealerName ?? t("unknownDealer")}
                        </p>
                        <p className="text-body-sm text-muted-foreground">
                          #{request.outboundRequestId}
                        </p>
                      </div>
                      <OutboundSessionStatusBadge status={request.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {data.lines.length > 0 ? (
            <section className="space-y-2">
              <h4 className="text-body-sm font-semibold text-foreground">
                {t("shippingManifestTitle")}
              </h4>
              <StyledTable
                columns={[
                  {
                    header: t("columnTireId"),
                    render: (row) => row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                  },
                  {
                    header: t("shippingColumnCustomer"),
                    render: (row) => row.customerName ?? row.dealerName ?? "—",
                  },
                  {
                    header: t("columnStatus"),
                    render: (row) => (
                      <OutboundSessionStatusBadge
                        status={row.lineStatus ?? row.status ?? "—"}
                      />
                    ),
                  },
                  {
                    header: t("shippingColumnScannedAt"),
                    render: (row) => row.scannedAt ?? "—",
                  },
                ]}
                rows={data.lines}
                keyProp={(row) =>
                  row.tireUniqueId ??
                  String(row.outboundRequestLineId ?? row.tireId ?? "line")
                }
                emptyText={t("shippingNoManifestLines")}
                horizontalScroll
              />
            </section>
          ) : null}
        </>
      ) : null}
    </SchedulingCellDetailPanelFrame>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-surface-light-container)] bg-muted/20 px-2 py-2 text-center dark:border-[var(--color-surface-container-high)]">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <p className="text-body-md font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
