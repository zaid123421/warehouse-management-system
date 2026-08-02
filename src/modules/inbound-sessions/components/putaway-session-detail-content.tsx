"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/lib/format-number";
import { SessionProgressBar } from "@/modules/inbound-sessions/components/shared/session-progress-bar";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { usePutawaySessionDetail } from "@/modules/inbound-sessions/hooks/use-putaway-session-detail";

type PutawaySessionDetailContentProps = {
  sessionId: number;
};

export function PutawaySessionDetailContent({ sessionId }: PutawaySessionDetailContentProps) {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = usePutawaySessionDetail(sessionId);

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
          {t("putawayDetailTitle", { id: sessionId })}
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">{t("putawayDetailIntro")}</p>
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
            <DetailField label={t("columnZone")} value={data.zoneName ?? "—"} />
            <DetailField
              label={t("columnTires")}
              value={`${data.completedCount}/${data.tireCount}`}
            />
            <DetailField
              label={t("columnAssignedStaff")}
              value={formatCount(data.assignedStaffCount ?? data.assignedStaffUserIds?.length ?? 0)}
            />
          </div>

          <SessionProgressBar
            value={data.progressPercent ?? 0}
            label={t("columnProgress")}
          />

          <section className="space-y-3">
            <h2 className="text-label-lg font-semibold text-foreground">{t("putawayLinesTitle")}</h2>
            <StyledTable
              columns={[
                {
                  header: t("columnTireId"),
                  render: (row) => row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                },
                {
                  header: t("columnLocation"),
                  render: (row) => row.reservedLocationBarcode ?? "—",
                },
                {
                  header: t("columnStatus"),
                  render: (row) => (
                    <SessionStatusBadge status={row.lineStatus ?? row.status ?? "—"} />
                  ),
                },
              ]}
              rows={data.lines}
              keyProp={(row) =>
                row.tireUniqueId ??
                String(row.tireId ?? row.reservedLocationBarcode ?? "line")
              }
              emptyText={t("noPutawayLines")}
              horizontalScroll
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
    <div className="rounded-lg border border-border/50 dark:border-white/5 bg-card px-3 py-2.5">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <div className="mt-1 text-body-md font-medium text-foreground">{value}</div>
    </div>
  );
}
