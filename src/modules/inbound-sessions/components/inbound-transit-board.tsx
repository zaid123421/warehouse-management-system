"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowRight, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { StyledTable } from "@/components/ui/styled-table";
import { ROUTES } from "@/constants/routes";
import { formatCount } from "@/lib/format-number";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { SessionStatusBadge } from "@/modules/inbound-sessions/components/shared/session-status-badge";
import { useCreateReceivingFromTruck } from "@/modules/inbound-sessions/hooks/use-inbound-truck-mutations";
import { useReceivingSessions } from "@/modules/inbound-sessions/hooks/use-receiving-sessions";
import { useTransitTrucks } from "@/modules/inbound-sessions/hooks/use-transit-trucks";
import { formatDayLabel } from "@/modules/inbound-sessions/lib/status-utils";
import { buildTabHighlightHref } from "@/shared/hooks/use-highlight-id";

export function InboundTransitBoard() {
  const t = useTranslations("inboundSessions");
  const router = useRouter();
  const { data = [], isPending, isError, error, refetch } = useTransitTrucks();
  const { data: receivingSessions = [] } = useReceivingSessions();
  const createReceivingMutation = useCreateReceivingFromTruck();

  const receivingIdByTruck = useMemo(() => {
    const map = new Map<number, number>();
    for (const session of receivingSessions) {
      if (session.inboundTruckId && !map.has(session.inboundTruckId)) {
        map.set(session.inboundTruckId, session.id);
      }
    }
    return map;
  }, [receivingSessions]);

  function resolveReceivingSessionId(truckId: number, fromTruck?: number): number | null {
    if (fromTruck && fromTruck > 0) return fromTruck;
    return receivingIdByTruck.get(truckId) ?? null;
  }

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
      router.push(
        buildTabHighlightHref(ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST, "receiving", session.id),
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
            render: (row) => {
              const linkedReceivingId = resolveReceivingSessionId(
                row.truckId,
                row.receivingSessionId,
              );
              const hasLinked = linkedReceivingId != null;
              return (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {!hasLinked ? (
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
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                    disabled={!hasLinked}
                    asChild={hasLinked}
                  >
                    {hasLinked ? (
                      <Link
                        href={buildTabHighlightHref(
                          ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST,
                          "receiving",
                          linkedReceivingId,
                        )}
                      >
                        <ArrowRight className="size-4" />
                        {t("goToReceivingAction")}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ArrowRight className="size-4" />
                        {t("goToReceivingAction")}
                      </span>
                    )}
                  </Button>
                </div>
              );
            },
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
          href={`${ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST}?tab=receiving`}
          className="font-medium text-primary hover:underline"
        >
          {t("tabReceiving")}
        </Link>
      </p>
    </div>
  );
}
