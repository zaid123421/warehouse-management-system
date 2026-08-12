"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Users,
  Warehouse,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/format-number";
import {
  HorizontalBar,
  OccupancyDonut,
  OverviewKpiCard,
  OverviewPanel,
  SlaGauge,
  TireFlowBars,
} from "@/modules/warehouse-overview/components/overview-chart-primitives";
import { useWarehouseOverview } from "@/modules/warehouse-overview/hooks/use-warehouse-overview";

function formatMaybeDate(
  value: string | null,
  format: ReturnType<typeof useFormatter>,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format.dateTime(date, { dateStyle: "medium", timeStyle: "short" });
}

export function WarehouseOverviewPageContent() {
  const t = useTranslations("warehouseOverview");
  const format = useFormatter();
  const { data, isPending, isError, error, refetch } = useWarehouseOverview();

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
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const usage = data.capacity.warehouse;
  const occupancySegments = [
    {
      label: t("usage.occupied"),
      value: usage.occupied,
      color: "var(--color-primary-main-light)",
    },
    {
      label: t("usage.empty"),
      value: usage.empty,
      color: "#94A3B8",
    },
    {
      label: t("usage.reservedInbound"),
      value: usage.reservedInbound,
      color: "#F59E0B",
    },
    {
      label: t("usage.reservedOutbound"),
      value: usage.reservedOutbound,
      color: "#8B5CF6",
    },
  ];

  const sessionTiles = [
    {
      key: "receiving",
      label: t("live.receivingInProgress"),
      value: data.live.receivingSessionsInProgress,
      icon: ArrowDownToLine,
    },
    {
      key: "putaway",
      label: t("live.putawayInProgress"),
      value: data.live.putawaySessionsInProgress,
      icon: Package,
    },
    {
      key: "picking",
      label: t("live.pickingInProgress"),
      value: data.live.pickingSessionsInProgress,
      icon: Package,
    },
    {
      key: "shipping",
      label: t("live.openShipping"),
      value: data.live.openShippingSessionCount,
      icon: ArrowUpFromLine,
    },
  ];

  const maxPerformerScans = Math.max(
    ...data.activity.topPerformers.map((p) => p.matchScans),
    1,
  );

  return (
    <div className="space-y-6 break-words">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary-dark">
            <Warehouse className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {t("eyebrow")}
            </span>
          </div>
          <h1 className="mt-1 text-headline-sm font-bold text-foreground">
            {data.warehouseName}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">
            {t("activityWindow", {
              days: data.activityWindow.days || 30,
              from: formatMaybeDate(data.activityWindow.from, format),
              to: formatMaybeDate(data.activityWindow.to, format),
            })}
          </p>
        </div>
        {data.generatedAt ? (
          <p className="text-xs text-muted-foreground">
            {t("generatedAt", { value: formatMaybeDate(data.generatedAt, format) })}
          </p>
        ) : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewKpiCard
          tone="primary"
          label={t("kpi.occupancy")}
          value={`${data.capacity.occupancyPercent.toFixed(
            data.capacity.occupancyPercent % 1 === 0 ? 0 : 1,
          )}%`}
          hint={t("kpi.designedCapacity", {
            count: formatCount(data.capacity.designedCapacity),
          })}
        />
        <OverviewKpiCard
          tone="success"
          label={t("kpi.staff")}
          value={`${formatCount(data.staff.staffActive)} / ${formatCount(data.staff.staffTotal)}`}
          hint={t("kpi.staffHint")}
        />
        <OverviewKpiCard
          tone="default"
          label={t("kpi.pending")}
          value={formatCount(data.activity.pendingInbound + data.activity.pendingOutbound)}
          hint={t("kpi.pendingHint", {
            inbound: formatCount(data.activity.pendingInbound),
            outbound: formatCount(data.activity.pendingOutbound),
          })}
        />
        <OverviewKpiCard
          tone={data.activity.slaOpenOverdue > 0 ? "warning" : "default"}
          label={t("kpi.slaOverdue")}
          value={formatCount(data.activity.slaOpenOverdue)}
          hint={t("kpi.activeRequests", {
            count: formatCount(data.live.activeInboundRequestCount),
          })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OverviewPanel
          title={t("capacity.title")}
          description={t("capacity.description")}
        >
          <OccupancyDonut
            percent={data.capacity.occupancyPercent}
            centerLabel={t("capacity.donutCenter")}
            segments={occupancySegments}
          />
        </OverviewPanel>

        <OverviewPanel
          title={t("zones.title")}
          description={t("zones.description")}
        >
          {data.capacity.topZones.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-muted-foreground">
              {t("zones.empty")}
            </p>
          ) : (
            <div className="space-y-4">
              {data.capacity.topZones.map((zone) => (
                <HorizontalBar
                  key={zone.zoneId}
                  label={zone.zoneName}
                  valueLabel={`${zone.occupancyPercent.toFixed(
                    zone.occupancyPercent % 1 === 0 ? 0 : 1,
                  )}%`}
                  percent={zone.occupancyPercent}
                  colorClass="bg-primary-dark"
                />
              ))}
            </div>
          )}
        </OverviewPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OverviewPanel
          title={t("flow.title")}
          description={t("flow.description")}
        >
          <TireFlowBars
            expected={data.live.totalExpectedTires}
            received={data.live.totalReceivedTires}
            stored={data.live.totalStoredTires}
            labels={{
              expected: t("flow.expected"),
              received: t("flow.received"),
              stored: t("flow.stored"),
            }}
          />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[var(--color-surface-light-container)] px-3 py-2 dark:border-[var(--color-surface-container-high)]">
              <p className="text-xs text-muted-foreground">{t("live.reservedLines")}</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCount(data.live.reservedLineCount)}
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2">
              <p className="text-xs text-muted-foreground">{t("live.expiredReservations")}</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCount(data.live.expiredReservationCount)}
              </p>
            </div>
          </div>
        </OverviewPanel>

        <OverviewPanel title={t("sla.title")} description={t("sla.description")}>
          <div className="flex flex-wrap items-center justify-around gap-6 py-2">
            <SlaGauge
              label={t("sla.inbound")}
              percent={data.activity.slaInboundOnTimePercent}
            />
            <SlaGauge
              label={t("sla.outbound")}
              percent={data.activity.slaOutboundOnTimePercent}
            />
          </div>
        </OverviewPanel>
      </div>

      <OverviewPanel title={t("live.title")} description={t("live.description")}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sessionTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.key}
                className="rounded-xl border border-[var(--color-surface-light-container)] bg-[var(--color-surface-light-container)]/40 px-4 py-3 dark:border-[var(--color-surface-container-high)] dark:bg-[var(--color-surface-container-high)]/30"
              >
                <div className="flex items-center gap-2 text-primary-dark">
                  <Icon className="size-4" />
                  <p className="text-xs font-medium text-muted-foreground">{tile.label}</p>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                  {formatCount(tile.value)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: t("exceptions.receiving"),
              value: data.live.receivingExceptionScanCount,
            },
            {
              label: t("exceptions.putaway"),
              value: data.live.putawayExceptionScanCount,
            },
            {
              label: t("exceptions.picking"),
              value: data.live.pickingExceptionScanCount,
            },
            {
              label: t("exceptions.pickingMissing"),
              value: data.live.pickingMissingLineCount,
            },
            {
              label: t("exceptions.shipping"),
              value: data.live.shippingExceptionScanCount,
            },
            {
              label: t("exceptions.shippingMissing"),
              value: data.live.shippingMissingLineCount,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-[var(--color-surface-light-container)] px-3 py-2 text-body-sm dark:border-[var(--color-surface-container-high)]"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatCount(item.value)}
              </span>
            </div>
          ))}
        </div>
      </OverviewPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <OverviewPanel
          title={t("attention.title")}
          description={t("attention.description")}
          action={
            data.attention.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-3.5" />
                {formatCount(data.attention.length)}
              </span>
            ) : null
          }
        >
          {data.attention.length === 0 && data.operationsAlerts.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-muted-foreground">
              {t("attention.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {data.operationsAlerts.map((alert) => (
                <div
                  key={alert}
                  className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-body-sm text-foreground"
                >
                  {alert}
                </div>
              ))}
              {data.attention.map((item, index) => (
                <article
                  key={`${item.type}-${item.entityId ?? "x"}-${index}`}
                  className="rounded-lg border border-[var(--color-surface-light-container)] px-3 py-3 dark:border-[var(--color-surface-container-high)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.type.replaceAll("_", " ")}
                    </span>
                  </div>
                  {item.subtitle ? (
                    <p className="mt-1 text-body-sm text-muted-foreground">{item.subtitle}</p>
                  ) : null}
                  {item.occurredAt ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatMaybeDate(item.occurredAt, format)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </OverviewPanel>

        <OverviewPanel
          title={t("performers.title")}
          description={t("performers.description")}
          action={
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {t("performers.badge")}
            </span>
          }
        >
          {data.activity.topPerformers.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-muted-foreground">
              {t("performers.empty")}
            </p>
          ) : (
            <div className="space-y-4">
              {data.activity.topPerformers.map((performer) => (
                <HorizontalBar
                  key={performer.userId}
                  label={performer.displayName}
                  valueLabel={t("performers.scans", {
                    count: formatCount(performer.matchScans),
                  })}
                  percent={(performer.matchScans / maxPerformerScans) * 100}
                  colorClass="bg-primary-dark"
                />
              ))}
            </div>
          )}
        </OverviewPanel>
      </div>

      {(data.receivingSessions.length > 0 || data.putawaySessions.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <OverviewPanel title={t("sessions.receiving")}>
            <SessionList
              empty={t("sessions.empty")}
              rows={data.receivingSessions}
            />
          </OverviewPanel>
          <OverviewPanel title={t("sessions.putaway")}>
            <SessionList empty={t("sessions.empty")} rows={data.putawaySessions} />
          </OverviewPanel>
        </div>
      )}
    </div>
  );
}

function SessionList({
  rows,
  empty,
}: {
  rows: {
    sessionId: number;
    label: string;
    detail: string;
    progressPercent: number;
    status: string;
  }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-body-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.sessionId}
          className="rounded-lg border border-[var(--color-surface-light-container)] px-3 py-3 dark:border-[var(--color-surface-container-high)]"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">{row.label}</p>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {row.status.replaceAll("_", " ")}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-body-sm text-muted-foreground">
            <span>{row.detail}</span>
            <span className="tabular-nums text-foreground">{row.progressPercent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-full rounded-full bg-primary-dark transition-all"
              style={{ width: `${Math.min(100, Math.max(0, row.progressPercent))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
