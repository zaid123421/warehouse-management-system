"use client";

import { useTranslations } from "next-intl";
import {
  ArrowDown,
  Boxes,
  Grid3x3,
  LayoutGrid,
  Package,
  Rows3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WarehouseInitSummary } from "@/modules/warehouse-structure/lib/warehouse-init-utils";

const HIERARCHY_ITEMS = [
  { key: "hierarchyZones", icon: LayoutGrid },
  { key: "hierarchyRows", icon: Rows3 },
  { key: "hierarchyRacks", icon: Boxes },
  { key: "hierarchySlots", icon: Grid3x3 },
  { key: "hierarchyPositions", icon: Package },
] as const;

export type WarehouseInitSummaryPanelProps = {
  summary: WarehouseInitSummary | null;
};

export function WarehouseInitSummaryPanel({ summary }: WarehouseInitSummaryPanelProps) {
  const t = useTranslations("warehouseStructure");

  return (
    <aside className="flex flex-col gap-6 border-b border-[var(--color-surface-light-container)] bg-primary-dark/[0.04] p-6 dark:border-[var(--color-surface-container-high)] dark:bg-primary-dark/[0.08] lg:border-b-0 lg:border-e">
      <div className="space-y-2">
        <p className="text-label-md font-semibold uppercase tracking-wide text-primary-dark">
          {t("hierarchyTitle")}
        </p>
        <p className="text-body-sm text-muted-foreground">{t("hierarchyDescription")}</p>
      </div>

      <ol className="space-y-1">
        {HIERARCHY_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === HIERARCHY_ITEMS.length - 1;
          return (
            <li key={item.key}>
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card text-primary-dark shadow-sm">
                  <Icon className="size-4" strokeWidth={1.75} />
                </div>
                <span className="text-body-md font-medium text-foreground">{t(item.key)}</span>
              </div>
              {!isLast ? (
                <div className="flex justify-center py-0.5 text-primary-dark/50" aria-hidden>
                  <ArrowDown className="size-4" />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-primary-dark/15 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary-dark" aria-hidden />
          <p className="text-label-md font-semibold uppercase tracking-wide text-primary-dark">
            {t("summaryTitle")}
          </p>
        </div>

        {summary ? (
          <dl className="space-y-3">
            <SummaryRow label={t("summaryZones")} value={summary.zones.toLocaleString()} />
            <SummaryRow
              label={t("summaryRacksPerZone")}
              value={t("summaryCount", { count: summary.racksPerZone.toLocaleString() })}
            />
            <SummaryRow
              label={t("summarySlotsPerZone")}
              value={t("summaryCount", { count: summary.slotsPerZone.toLocaleString() })}
            />
            <div className="border-t border-[var(--color-surface-light-container)] pt-3 dark:border-[var(--color-surface-container-high)]">
              <SummaryRow
                label={t("summaryTotalPositions")}
                value={summary.totalPositions.toLocaleString()}
                highlight
              />
            </div>
          </dl>
        ) : (
          <p className="text-body-sm text-muted-foreground">{t("summaryIncomplete")}</p>
        )}
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-body-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-end font-semibold tabular-nums",
          highlight ? "text-title-md text-primary-dark" : "text-body-md text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
