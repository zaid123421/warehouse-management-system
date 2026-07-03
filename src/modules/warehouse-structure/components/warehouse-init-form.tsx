"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Boxes,
  Grid3x3,
  LayoutGrid,
  Loader2,
  Package,
  Rows3,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PRIMARY_BUTTON_CLASS, PRIMARY_BUTTON_RESPONSIVE } from "@/lib/primary-button-styles";
import { WarehouseInitStepperField } from "@/modules/warehouse-structure/components/warehouse-init-stepper-field";
import { WarehouseInitSummaryPanel } from "@/modules/warehouse-structure/components/warehouse-init-summary-panel";
import { useInitiateWarehouse } from "@/modules/warehouse-structure/hooks/use-initiate-warehouse";
import {
  computeWarehouseInitSummary,
  INIT_FIELD_ORDER,
  parseInitFieldValue,
  type InitFieldKey,
} from "@/modules/warehouse-structure/lib/warehouse-init-utils";
import {
  INITIATE_WAREHOUSE_DEFAULTS,
  INITIATE_WAREHOUSE_LIMITS,
  type InitiateWarehouseRequest,
} from "@/modules/warehouse-structure/types/my-warehouse";

const FIELD_META: { key: InitFieldKey; icon: LucideIcon }[] = [
  { key: "zonesCount", icon: LayoutGrid },
  { key: "rowsPerZone", icon: Rows3 },
  { key: "racksPerRow", icon: Boxes },
  { key: "slotsPerRack", icon: Grid3x3 },
  { key: "positionsPerSlot", icon: Package },
];

export function WarehouseInitForm() {
  const t = useTranslations("warehouseStructure");
  const initiateWarehouse = useInitiateWarehouse();

  const [form, setForm] = useState<Record<InitFieldKey, string>>(() =>
    Object.fromEntries(
      INIT_FIELD_ORDER.map((key) => [key, String(INITIATE_WAREHOUSE_DEFAULTS[key])]),
    ) as Record<InitFieldKey, string>,
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<InitFieldKey, string>>>({});

  const summary = useMemo(() => computeWarehouseInitSummary(form), [form]);

  function validate(): InitiateWarehouseRequest | null {
    const errors: Partial<Record<InitFieldKey, string>> = {};
    const payload = {} as InitiateWarehouseRequest;

    for (const key of INIT_FIELD_ORDER) {
      const limits = INITIATE_WAREHOUSE_LIMITS[key];
      const value = parseInitFieldValue(form[key]);

      if (value == null) {
        errors[key] = t("validationRequired");
        continue;
      }
      if (value < limits.min || value > limits.max) {
        errors[key] = t("validationRange", { min: limits.min, max: limits.max });
        continue;
      }
      payload[key] = value;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 ? payload : null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = validate();
    if (!payload) return;

    try {
      await initiateWarehouse.mutateAsync(payload);
      toast.success(t("initSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("initError"));
    }
  }

  return (
    <Card className="max-w-5xl overflow-hidden border-0 bg-surface-container shadow-sm">
      <CardHeader className="border-b border-[var(--color-surface-light-container)] bg-card/60 pb-6 dark:border-[var(--color-surface-container-high)]">
        <div className="flex items-start gap-4">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-dark text-white shadow-sm"
            aria-hidden
          >
            <Warehouse className="size-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-title-lg font-bold text-foreground">
              {t("initFormTitle")}
            </CardTitle>
            <CardDescription className="text-body-md">{t("initFormDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[minmax(240px,300px)_1fr]">
          <WarehouseInitSummaryPanel summary={summary} />

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-4 p-6">
              {FIELD_META.map(({ key, icon }, index) => (
                <WarehouseInitStepperField
                  key={key}
                  fieldKey={key}
                  step={index + 1}
                  icon={icon}
                  label={t(`fields.${key}.label`)}
                  hint={t(`fields.${key}.hint`)}
                  value={form[key]}
                  error={fieldErrors[key]}
                  disabled={initiateWarehouse.isPending}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, [key]: value }));
                    if (fieldErrors[key]) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                      });
                    }
                  }}
                />
              ))}
            </div>

            <div className="mt-auto border-t border-[var(--color-surface-light-container)] bg-card/40 px-6 py-5 dark:border-[var(--color-surface-container-high)]">
              <Button
                type="submit"
                className={cn("gap-2", PRIMARY_BUTTON_CLASS, PRIMARY_BUTTON_RESPONSIVE)}
                disabled={initiateWarehouse.isPending}
              >
                {initiateWarehouse.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {t("initializing")}
                  </>
                ) : (
                  t("submitInitialization")
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
