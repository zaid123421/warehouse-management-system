"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { useCreateShippingFromTruck } from "@/modules/outbound-sessions/hooks/use-outbound-truck-mutations";
import { useReadyToShipTrucks } from "@/modules/outbound-sessions/hooks/use-ready-to-ship-trucks";
import {
  formatDayLabel,
  isTodayServiceDate,
} from "@/modules/outbound-sessions/lib/status-utils";

export function OutboundReadyToShipBoard() {
  const t = useTranslations("outboundSessions");
  const { data = [], isPending, isError, error, refetch } = useReadyToShipTrucks();
  const createShippingMutation = useCreateShippingFromTruck();

  async function handleCreateShipping(truckId: number, serviceDate?: string) {
    if (!isTodayServiceDate(serviceDate)) {
      toast.error(t("shippingServiceDateGuard"));
      return;
    }
    try {
      const session = await createShippingMutation.mutateAsync(truckId);
      toast.success(
        t("createShippingFromTruckSuccess", {
          sessionId: session.id,
          label: session.outboundTruckLabel ?? `#${truckId}`,
        }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-muted-foreground">{t("readyToShipIntro")}</p>

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
            render: (row) => (row.deliveryDay ? formatDayLabel(row.deliveryDay) : "—"),
          },
          {
            header: t("columnServiceDate"),
            render: (row) => row.serviceDate ?? "—",
          },
          {
            header: t("columnTires"),
            render: (row) => (row.assignedTires ?? 0).toLocaleString(),
          },
          {
            header: t("columnStatus"),
            render: (row) => <OutboundSessionStatusBadge status={row.status} />,
          },
          {
            header: t("columnReady"),
            render: (row) =>
              row.ready ? (
                <span className="text-body-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {t("readyToShipReady")}
                </span>
              ) : (
                <span className="text-body-sm text-muted-foreground">
                  {t("readyToShipNotReady")}
                </span>
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
                  disabled={
                    createShippingMutation.isPending ||
                    !row.ready ||
                    !isTodayServiceDate(row.serviceDate)
                  }
                  onClick={() => void handleCreateShipping(row.truckId, row.serviceDate)}
                >
                  <PackagePlus className="size-4" />
                  {t("createShippingSession")}
                </Button>
              </div>
            ),
          },
        ]}
        rows={data}
        keyProp={(row) => row.truckId}
        isLoading={isPending}
        emptyText={t("noReadyToShipTrucks")}
        horizontalScroll
      />

      <p className="text-body-sm text-muted-foreground">
        {t("readyToShipHint")}{" "}
        <Link
          href={`${ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST}?tab=shipping`}
          className="font-medium text-primary hover:underline"
        >
          {t("tabShipping")}
        </Link>
      </p>
    </div>
  );
}
