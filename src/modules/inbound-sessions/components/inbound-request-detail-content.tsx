"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useAcceptInboundRequest } from "@/modules/inbound-sessions/hooks/use-accept-inbound-request";
import { useInboundRequestDetail } from "@/modules/inbound-sessions/hooks/use-inbound-request-detail";
import { useRejectInboundRequest } from "@/modules/inbound-sessions/hooks/use-reject-inbound-request";
import {
  canAcceptInboundRequest,
  canRejectInboundRequest,
  formatDayLabel,
} from "@/modules/inbound-sessions/lib/status-utils";

type InboundRequestDetailContentProps = {
  requestId: number;
};

export function InboundRequestDetailContent({ requestId }: InboundRequestDetailContentProps) {
  const t = useTranslations("inboundSessions");
  const { data, isPending, isError, error, refetch } = useInboundRequestDetail(requestId);
  const acceptMutation = useAcceptInboundRequest();
  const rejectMutation = useRejectInboundRequest();

  async function handleAccept() {
    try {
      await acceptMutation.mutateAsync(requestId);
      toast.success(t("acceptSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  async function handleReject() {
    try {
      await rejectMutation.mutateAsync(requestId);
      toast.success(t("rejectSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button type="button" variant="ghost" size="sm" className="mb-2 -ms-2" asChild>
            <Link href={ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}>
              <ArrowLeft className="size-4" />
              {t("backToInbound")}
            </Link>
          </Button>
          <h1 className="text-headline-sm font-bold text-foreground">
            {t("requestDetailTitle", { id: requestId })}
          </h1>
        </div>
        {data ? (
          <div className="flex flex-wrap gap-2">
            {canAcceptInboundRequest(data.status) ? (
              <Button
                type="button"
                className={PRIMARY_BUTTON_CLASS}
                disabled={acceptMutation.isPending}
                onClick={() => void handleAccept()}
              >
                <Check className="size-4" />
                {t("acceptRequest")}
              </Button>
            ) : null}
            {canRejectInboundRequest(data.status) ? (
              <Button
                type="button"
                variant="destructive"
                disabled={rejectMutation.isPending}
                onClick={() => void handleReject()}
              >
                <X className="size-4" />
                {t("rejectRequest")}
              </Button>
            ) : null}
          </div>
        ) : null}
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
            <DetailField label={t("columnDealer")} value={data.dealerName ?? "—"} />
            <DetailField
              label={t("columnDay")}
              value={data.receivingDay ? formatDayLabel(data.receivingDay) : "—"}
            />
            <DetailField
              label={t("columnExpectedTires")}
              value={data.expectedTireCount.toLocaleString()}
            />
            {data.receivedTireCount != null ? (
              <DetailField
                label={t("columnReceivedTires")}
                value={data.receivedTireCount.toLocaleString()}
              />
            ) : null}
            {data.storedTireCount != null ? (
              <DetailField
                label={t("columnStoredTires")}
                value={data.storedTireCount.toLocaleString()}
              />
            ) : null}
          </div>

          <section className="space-y-3">
            <h2 className="text-label-lg font-semibold text-foreground">{t("reservationLinesTitle")}</h2>
            <StyledTable
              columns={[
                {
                  header: t("columnTireId"),
                  render: (row) => row.tireUniqueId ?? (row.tireId ? `#${row.tireId}` : "—"),
                },
                {
                  header: t("columnLocation"),
                  render: (row) => row.reservedPositionBarcode ?? "—",
                },
                {
                  header: t("columnStatus"),
                  render: (row) => <SessionStatusBadge status={row.status} />,
                },
              ]}
              rows={data.lines}
              keyProp={(row) =>
                row.tireUniqueId ?? String(row.tireId ?? row.reservedPositionBarcode ?? "line")
              }
              emptyText={t("noReservationLines")}
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
    <div className="rounded-lg border border-[var(--color-surface-light-container)] bg-card px-3 py-2.5 dark:border-[var(--color-surface-container-high)]">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <div className="mt-1 text-body-md font-medium text-foreground">{value}</div>
    </div>
  );
}
