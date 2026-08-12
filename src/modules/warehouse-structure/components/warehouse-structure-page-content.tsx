"use client";

import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TireUniqueIdLookupCard } from "@/modules/warehouse-structure/components/tire-unique-id-lookup-card";
import { WarehouseInitForm } from "@/modules/warehouse-structure/components/warehouse-init-form";
import { WarehouseStructureBrowser } from "@/modules/warehouse-structure/components/warehouse-structure-browser";
import { useMyWarehouse } from "@/modules/warehouse-structure/hooks/use-my-warehouse";

function WarehouseStructureSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}

export function WarehouseStructurePageContent() {
  const t = useTranslations("warehouseStructure");
  const { data: warehouse, isPending, isError, error, refetch } = useMyWarehouse();

  if (isPending) {
    return <WarehouseStructureSkeleton />;
  }

  if (isError || !warehouse) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("intro")}</p>
        </div>
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
        />
      </div>
    );
  }

  const warehouseLabel = [warehouse.warehouseName, warehouse.warehouseCode]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-body-md font-normal text-muted-foreground">{t("intro")}</p>
        {warehouseLabel ? (
          <p className="mt-2 text-label-lg font-semibold tracking-wide text-primary-dark">
            {warehouseLabel}
          </p>
        ) : null}
      </div>

      {warehouse.initialized ? (
        <>
          <TireUniqueIdLookupCard />
          <WarehouseStructureBrowser warehouse={warehouse} />
        </>
      ) : (
        <WarehouseInitForm />
      )}
    </div>
  );
}
