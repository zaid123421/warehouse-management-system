import { getTranslations } from "next-intl/server";
import { WAREHOUSE_ZONES } from "@/shared/config/warehouse-zones";
import { cn } from "@/lib/utils";

type WarehouseZoneLegendProps = {
  className?: string;
};

export async function WarehouseZoneLegend({ className }: WarehouseZoneLegendProps) {
  const t = await getTranslations("dashboard");
  const tr = t as unknown as (
    key: string,
    values?: Record<string, string | number>
  ) => string;

  return (
    <aside
      className={cn(
        "rounded-lg border border-border/60 bg-muted/30 p-3 text-sm",
        className
      )}
      aria-label={t("warehouseZonesLegendTitle")}
    >
      <h3 className="mb-2 text-label-md font-semibold text-foreground">
        {t("warehouseZonesLegendTitle")}
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        {t("warehouseZonesLegendHint")}
      </p>
      <ul className="space-y-2.5">
        {WAREHOUSE_ZONES.map((z) => (
          <li key={z.id} className="flex gap-2.5">
            <span
              className="mt-0.5 size-3.5 shrink-0 rounded-sm border border-border/80 shadow-sm"
              style={{ backgroundColor: z.colorHex }}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="font-medium text-foreground">
                {(t as (key: string) => string)(z.labelKey)}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {(t as (key: string) => string)(z.descriptionKey)}
              </span>
              <span className="mt-1 block text-xs font-medium tabular-nums text-foreground/90">
                {tr(z.statsKey, {
                  rackCols: z.rackCols,
                  rackRows: z.rackRows,
                  shelves: z.shelfLevels,
                  tires: z.tireCount,
                })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
