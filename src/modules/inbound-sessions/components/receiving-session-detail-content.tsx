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
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useReceivingSessionDetail } from "@/modules/inbound-sessions/hooks/use-receiving-session-detail";
import { InboundRequestDetailExpandedRow } from "@/modules/inbound-sessions/components/inbound-request-detail-expanded-row";

type ReceivingSessionDetailContentProps = {
  sessionId: number;
};

export function ReceivingSessionDetailContent({ sessionId }: ReceivingSessionDetailContentProps) {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = useReceivingSessionDetail(sessionId);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
          <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}>
            <ArrowLeft className="size-4" />
            {t("backToInbound")}
          </Link>
        </Button>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("receivingDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("receivingDetailIntro")}</p>
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
            <DetailField label={t("columnStatus")} value={<SessionStatusBadge status={data.status} />} />
            <DetailField
              label={t("columnTires")}
              value={`${data.receivedTires}/${data.expectedTires}`}
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

          <SessionProgressBar
            value={data.progressPercent ?? 0}
            label={t("columnProgress")}
          />

          <section className="space-y-3">
            <h2 className="text-label-lg font-semibold text-foreground">{t("linkedRequestsTitle")}</h2>
            <StyledTable
              columns={[
                {
                  header: t("columnRequestId"),
                  render: (row) => `#${row.inboundRequestId}`,
                },
                {
                  header: t("columnDealer"),
                  render: (row) => row.dealerName ?? "—",
                },
                {
                  header: t("columnStatus"),
                  render: (row) => <SessionStatusBadge status={row.status} />,
                },
              ]}
              rows={data.inboundRequests}
              keyProp={(row) => row.inboundRequestId}
              emptyText={t("noLinkedRequests")}
              horizontalScroll
              renderExpanded={(row) => <InboundRequestDetailExpandedRow requestId={row.inboundRequestId} />}
            />
          </section>
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
