"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/lib/format-number";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useCreateReceivingFromTruck } from "@/modules/inbound-sessions/hooks/use-inbound-truck-mutations";
import { useTransitTrucks } from "@/modules/inbound-sessions/hooks/use-transit-trucks";
import { formatDayLabel } from "@/modules/inbound-sessions/lib/status-utils";

export function InboundTransitBoard() {
  const t = useTranslations("inboundSessions");
  const { data = [], isPending, isError, error, refetch } = useTransitTrucks();
  const createReceivingMutation = useCreateReceivingFromTruck();

  async function handleCreateReceiving(truckId: number, version?: number) {
    try {
      const session = await createReceivingMutation.mutateAsync({
        truckId,
        version: version ?? 0,
      });
      toast.success(
        t("createReceivingFromTruckSuccess", {
          sessionId: session.id,
          label: session.inboundTruckLabel ?? `#${truckId}`,
        }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-muted-foreground">{t("transitIntro")}</p>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      ) : null}

      <StyledTable
        columns={[
          {
            header: t("columnTruck"),
            render: (row) => row.label ?? t("truckLabel", { id: row.truckId }),
          },
          {
            header: t("columnDay"),
            render: (row) => (row.receivingDay ? formatDayLabel(row.receivingDay) : "—"),
          },
          {
            header: t("columnServiceDate"),
            render: (row) => row.serviceDate ?? "—",
          },
          {
            header: t("columnTires"),
            render: (row) =>
              formatCount(row.assignedTires ?? row.expectedTires ?? 0),
          },
          {
            header: t("columnStatus"),
            render: (row) => <SessionStatusBadge status={row.status} />,
          },
          {
            header: t("columnReady"),
            render: (row) =>
              row.ready ? (
                <span className="text-body-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {t("transitReady")}
                </span>
              ) : (
                <span className="text-body-sm text-muted-foreground">{t("transitNotReady")}</span>
              ),
          },
          {
            header: t("columnActions"),
            render: (row) => (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className={PRIMARY_BUTTON_CLASS}
                  disabled={createReceivingMutation.isPending}
                  onClick={() => void handleCreateReceiving(row.truckId, row.version)}
                >
                  <PackagePlus className="size-4" />
                  {t("createReceivingSession")}
                </Button>
              </div>
            ),
          },
        ]}
        rows={data}
        keyProp={(row) => row.truckId}
        isLoading={isPending}
        emptyText={t("noTransitTrucks")}
        horizontalScroll
      />

      <p className="text-body-sm text-muted-foreground">
        {t("transitHandoverHint")}{" "}
        <Link
          href={ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}
          className="font-medium text-primary hover:underline"
        >
          {t("tabReceiving")}
        </Link>
      </p>
    </div>
  );
}
