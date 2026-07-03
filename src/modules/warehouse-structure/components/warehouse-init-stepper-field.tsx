"use client";

import type { LucideIcon } from "lucide-react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, RequiredMark } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fieldGroupWrapperClass } from "@/lib/field-validation";
import { FIELD_ERROR_MESSAGE_CLASS } from "@/lib/field-validation";
import {
  clampInitFieldValue,
  type InitFieldKey,
} from "@/modules/warehouse-structure/lib/warehouse-init-utils";
import { INITIATE_WAREHOUSE_LIMITS } from "@/modules/warehouse-structure/types/my-warehouse";

export type WarehouseInitStepperFieldProps = {
  fieldKey: InitFieldKey;
  step: number;
  icon: LucideIcon;
  label: string;
  hint: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function WarehouseInitStepperField({
  fieldKey,
  step,
  icon: Icon,
  label,
  hint,
  value,
  error,
  disabled,
  onChange,
}: WarehouseInitStepperFieldProps) {
  const limits = INITIATE_WAREHOUSE_LIMITS[fieldKey];
  const fieldId = `warehouse-init-${fieldKey}`;
  const invalid = Boolean(error);
  const numericValue = Number(value);
  const canDecrement = !disabled && Number.isFinite(numericValue) && numericValue > limits.min;
  const canIncrement = !disabled && Number.isFinite(numericValue) && numericValue < limits.max;

  function setNumeric(next: number) {
    onChange(String(clampInitFieldValue(fieldKey, next)));
  }

  function handleInputChange(raw: string) {
    if (raw === "") {
      onChange("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onChange(String(clampInitFieldValue(fieldKey, parsed)));
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-colors",
        invalid
          ? "border-error-main/60"
          : "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-dark/10 text-primary-dark"
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary-dark text-xs font-bold text-white">
              {step}
            </span>
            <Label htmlFor={fieldId} className="text-title-md font-semibold text-foreground">
              {label}
              <RequiredMark />
            </Label>
          </div>

          <p className="text-body-sm text-muted-foreground">{hint}</p>

          <div className={fieldGroupWrapperClass(invalid)}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-primary-dark hover:bg-primary-dark/10"
              disabled={!canDecrement}
              onClick={() => setNumeric(Number.isFinite(numericValue) ? numericValue - 1 : limits.min)}
              aria-label={`Decrease ${label}`}
            >
              <Minus className="size-4" />
            </Button>

            <Input
              id={fieldId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value}
              disabled={disabled}
              onChange={(e) => handleInputChange(e.target.value)}
              aria-invalid={invalid}
              className="h-11 rounded-none border-0 bg-transparent text-center text-title-md font-semibold shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-primary-dark hover:bg-primary-dark/10"
              disabled={!canIncrement}
              onClick={() => setNumeric(Number.isFinite(numericValue) ? numericValue + 1 : limits.min)}
              aria-label={`Increase ${label}`}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {limits.min} – {limits.max.toLocaleString()}
          </p>

          {error ? <p className={FIELD_ERROR_MESSAGE_CLASS}>{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
