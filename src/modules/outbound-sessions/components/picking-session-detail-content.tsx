"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { usePickingSessionDetail } from "@/modules/outbound-sessions/hooks/use-picking-session-detail";
import { formatDayLabel } from "@/modules/outbound-sessions/lib/status-utils";

type PickingSessionDetailContentProps = {
  sessionId: number;
};

export function PickingSessionDetailContent({ sessionId }: PickingSessionDetailContentProps) {
  const t = useTranslations("outboundSessions");
  const { data, isPending, isError, error, refetch } = usePickingSessionDetail(sessionId);

  const pickedCount = data?.pickedTires ?? data?.completedCount ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST}>
            <ArrowLeft className="size-4" />
            {t("backToOutbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("pickingDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("pickingDetailIntro")}</p>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      {isPending || !data ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailField label={t("columnStatus")} value={<OutboundSessionStatusBadge status={data.status} />} />
            <DetailField
              label={t("columnDay")}
              value={data.deliveryDay ? formatDayLabel(data.deliveryDay) : "—"}
            />
            <DetailField
              label={t("columnTires")}
              value={`${pickedCount}/${data.expectedTires}`}
            />
            <DetailField
              label={t("columnAssignedStaff")}
              value={(data.assignedStaffCount ?? data.assignedStaffUserIds?.length ?? 0).toLocaleString()}
            />
            {data.exceptionScanCount != null ? (
              <DetailField
                label={t("columnExceptions")}
                value={data.exceptionScanCount.toLocaleString()}
              />
            ) : null}
          </div>

          <SessionProgressBar value={data.progressPercent ?? 0} label={t("columnProgress")} />

          <section className="space-y-3">
            <h2 className="text-label-lg font-semibold text-foreground">{t("linkedRequestsTitle")}</h2>
            <StyledTable
              columns={[
                {
                  header: t("columnRequestId"),
                  render: (row) => `#${row.outboundRequestId}`,
                },
                {
                  header: t("columnDealer"),
                  render: (row) => row.dealerName ?? "—",
                },
                {
                  header: t("columnVolume"),
                  render: (row) => (row.totalVolume ?? 0).toLocaleString(),
                },
                {
                  header: t("columnStatus"),
                  render: (row) => <OutboundSessionStatusBadge status={row.status} />,
                },
              ]}
              rows={data.outboundRequests}
              keyProp={(row) => row.outboundRequestId}
              emptyText={t("noLinkedRequests")}
              horizontalScroll
            />
          </section>

          {data.lines.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-label-lg font-semibold text-foreground">{t("pickingLinesTitle")}</h2>
              <StyledTable
                columns={[
                  {
                    header: t("columnTireId"),
                    render: (row) => row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                  },
                  {
                    header: t("columnLocation"),
                    render: (row) => row.locationBarcode ?? "—",
                  },
                  {
                    header: t("columnStatus"),
                    render: (row) => (
                      <OutboundSessionStatusBadge
                        status={row.lineStatus ?? row.status ?? "—"}
                      />
                    ),
                  },
                ]}
                rows={data.lines}
                keyProp={(row) =>
                  row.tireUniqueId ?? String(row.tireId ?? row.locationBarcode ?? "line")
                }
                emptyText={t("noPickingLines")}
                horizontalScroll
              />
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-surface-light-container)] bg-card px-3 py-2.5 dark:border-[var(--color-surface-container-high)]">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <div className="mt-1 text-body-md font-medium text-foreground">{value}</div>
    </div>
  );
}
