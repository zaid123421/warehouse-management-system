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
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { formatCount } from "@/lib/format-number";
import { OutboundSessionStatusBadge } from "@/modules/outbound-sessions/components/shared/session-status-badge";
import { useCreateShippingFromTruck } from "@/modules/outbound-sessions/hooks/use-outbound-truck-mutations";
import { useReadyToShipTrucks } from "@/modules/outbound-sessions/hooks/use-ready-to-ship-trucks";
import { useShippingSessions } from "@/modules/outbound-sessions/hooks/use-shipping-sessions";
import { formatDayLabel } from "@/modules/outbound-sessions/lib/status-utils";
import {
  buildTabHighlightHref,
  useHighlightId,
  useScrollToHighlight,
} from "@/shared/hooks/use-highlight-id";

export function OutboundReadyToShipBoard() {
  const t = useTranslations("outboundSessions");
  const router = useRouter();
  const { data = [], isPending, isError, error, refetch } = useReadyToShipTrucks();
  const { data: shippingSessions = [] } = useShippingSessions();
  const createShippingMutation = useCreateShippingFromTruck();
  const highlightId = useHighlightId();
  useScrollToHighlight(highlightId);

  const shippingIdByTruck = useMemo(() => {
    const map = new Map<number, number>();
    for (const session of shippingSessions) {
      if (session.outboundTruckId && !map.has(session.outboundTruckId)) {
        map.set(session.outboundTruckId, session.id);
      }
    }
    return map;
  }, [shippingSessions]);

  function resolveShippingSessionId(truckId: number, fromTruck?: number): number | null {
    if (fromTruck && fromTruck > 0) return fromTruck;
    return shippingIdByTruck.get(truckId) ?? null;
  }

  async function handleCreateShipping(truckId: number, version?: number) {
    try {
      const session = await createShippingMutation.mutateAsync({
        truckId,
        version: version ?? 0,
      });
      toast.success(
        t("createShippingFromTruckSuccess", {
          sessionId: session.id,
          label: session.outboundTruckLabel ?? `#${truckId}`,
        }),
      );
      router.push(
        buildTabHighlightHref(ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST, "shipping", session.id),
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
            render: (row) => (
              <span
                data-highlight-id={row.truckId}
                className={
                  highlightId === row.truckId
                    ? "rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-700 ring-2 ring-emerald-500/50 dark:text-emerald-300"
                    : undefined
                }
              >
                {row.label ?? t("truckLabel", { id: row.truckId })}
              </span>
            ),
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
            render: (row) => formatCount(row.assignedTires ?? 0),
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
            render: (row) => {
              const linkedShippingId = resolveShippingSessionId(
                row.truckId,
                row.shippingSessionId,
              );
              const hasLinked = linkedShippingId != null;
              const createDisabled = createShippingMutation.isPending || !row.ready || hasLinked;

              return (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {!hasLinked ? (
                    <div title={!row.ready ? t("readyToShipNotReady") : undefined}>
                      <Button
                        type="button"
                        size="sm"
                        className={PRIMARY_BUTTON_CLASS}
                        disabled={createDisabled}
                        onClick={() => void handleCreateShipping(row.truckId, row.version)}
                      >
                        <PackagePlus className="size-4" />
                        {t("createShippingSession")}
                      </Button>
                    </div>
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
                          ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST,
                          "shipping",
                          linkedShippingId,
                        )}
                      >
                        <ArrowRight className="size-4" />
                        {t("goToShippingAction")}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ArrowRight className="size-4" />
                        {t("goToShippingAction")}
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
