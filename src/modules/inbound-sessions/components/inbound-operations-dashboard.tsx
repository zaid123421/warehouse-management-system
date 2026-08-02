"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/lib/format-number";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useOperationsDashboard } from "@/modules/inbound-sessions/hooks/use-operations-dashboard";

export function InboundOperationsDashboard() {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = useOperationsDashboard();

  if (isError) {
    return (
      <ErrorAlert
        message={error instanceof Error ? error.message : t("errorLoading")}
        onRetry={() => void refetch()}
        retryLabel={t("retry")}
      />
    );
  }

  if (isPending || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  const counterEntries = [
    { label: t("counterActiveRequests"), value: data.counters.activeInboundRequestCount },
    { label: t("counterExpectedTires"), value: data.counters.totalExpectedTires },
    { label: t("counterReceivedTires"), value: data.counters.totalReceivedTires },
    { label: t("counterStoredTires"), value: data.counters.totalStoredTires },
    { label: t("counterReservedLines"), value: data.counters.reservedLineCount },
    { label: t("counterExpiredReservations"), value: data.counters.expiredReservationCount },
    { label: t("counterReceivingExceptions"), value: data.counters.receivingExceptionScanCount },
    { label: t("counterPutawayExceptions"), value: data.counters.putawayExceptionScanCount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counterEntries.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--color-surface-light-container)] bg-card px-3 py-2.5 dark:border-[var(--color-surface-container-high)]"
          >
            <p className="text-body-sm text-muted-foreground">{item.label}</p>
            <p className="text-headline-sm font-bold text-foreground">{formatCount(item.value)}</p>
          </div>
        ))}
      </div>

      {data.alerts.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-label-lg font-semibold text-foreground">{t("alertsTitle")}</h3>
          <ul className="space-y-2">
            {data.alerts.map((alert, index) => (
              <li
                key={`${alert.type ?? "alert"}-${index}`}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-body-md text-foreground"
              >
                {alert.message ?? alert.type ?? t("alertGeneric")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-label-lg font-semibold text-foreground">{t("receivingSessionsTitle")}</h3>
          <StyledTable
            columns={[
              { header: t("columnSession"), render: (row) => `#${row.sessionId}` },
              {
                header: t("columnStatus"),
                render: (row) => <SessionStatusBadge status={row.status} />,
              },
              {
                header: t("columnProgress"),
                render: (row) => (
                  <SessionProgressBar value={row.progressPercent ?? 0} />
                ),
              },
              {
                header: t("columnTires"),
                render: (row) => `${row.receivedTires}/${row.expectedTires}`,
              },
              {
                header: t("columnActions"),
                render: (row) => (
                  <Link
                    href={ROUTES.DASHBOARD.INBOUND_SESSIONS.RECEIVING_DETAIL(row.sessionId)}
                    className="text-body-sm font-medium text-primary hover:underline"
                  >
                    {t("viewDetails")}
                  </Link>
                ),
              },
            ]}
            rows={data.receivingSessions}
            keyProp={(row) => row.sessionId}
            emptyText={t("noReceivingSessions")}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-label-lg font-semibold text-foreground">{t("putawaySessionsTitle")}</h3>
          <StyledTable
            columns={[
              {
                header: t("columnZone"),
                render: (row) => row.zoneName ?? `#${row.sessionId}`,
              },
              {
                header: t("columnStatus"),
                render: (row) => <SessionStatusBadge status={row.status} />,
              },
              {
                header: t("columnProgress"),
                render: (row) => (
                  <SessionProgressBar value={row.progressPercent ?? 0} />
                ),
              },
              {
                header: t("columnTires"),
                render: (row) => `${row.completedCount}/${row.tireCount}`,
              },
              {
                header: t("columnActions"),
                render: (row) => (
                  <Link
                    href={ROUTES.DASHBOARD.INBOUND_SESSIONS.PUTAWAY_DETAIL(row.sessionId)}
                    className="text-body-sm font-medium text-primary hover:underline"
                  >
                    {t("viewDetails")}
                  </Link>
                ),
              },
            ]}
            rows={data.putawaySessions}
            keyProp={(row) => row.sessionId}
            emptyText={t("noPutawaySessions")}
          />
        </section>
      </div>

      {data.attentionInboundRequests.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-label-lg font-semibold text-foreground">{t("attentionRequestsTitle")}</h3>
          <StyledTable
            columns={[
              { header: t("columnRequestId"), render: (row) => `#${row.id}` },
              {
                header: t("columnDealer"),
                render: (row) => row.dealerName ?? "—",
              },
              {
                header: t("columnStatus"),
                render: (row) => <SessionStatusBadge status={row.status} />,
              },
              {
                header: t("columnActions"),
                render: () => "—",
              },
            ]}
            rows={data.attentionInboundRequests}
            keyProp={(row) => row.id}
            emptyText={t("noAttentionRequests")}
          />
        </section>
      ) : null}
    </div>
  );
}
