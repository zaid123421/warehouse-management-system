"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportTypeBadge } from "@/modules/reports/components/report-type-badge";
import { isValidReportDateRange } from "@/modules/reports/lib/report-utils";
import { downloadWarehouseReport } from "@/modules/reports/services/reports.service";
import type {
  ReportDateRange,
  ReportDefinition,
  ReportExportFormat,
} from "@/modules/reports/types/report";

type ReportExportCardProps = {
  definition: ReportDefinition;
  initialRange: ReportDateRange;
};

export function ReportExportCard({ definition, initialRange }: ReportExportCardProps) {
  const t = useTranslations("reports");
  const [range, setRange] = useState<ReportDateRange>(initialRange);
  const [busyFormat, setBusyFormat] = useState<ReportExportFormat | null>(null);

  const rangeValid = isValidReportDateRange(range);
  const showRangeError = Boolean(range.from && range.to && !rangeValid);

  async function handleExport(format: ReportExportFormat) {
    if (!rangeValid) {
      toast.error(t("invalidDateRange"));
      return;
    }

    setBusyFormat(format);
    try {
      await downloadWarehouseReport({
        endpoint: format === "pdf" ? definition.pdfEndpoint : definition.excelEndpoint,
        kind: definition.kind,
        format,
        range,
      });
      toast.success(t("downloadStarted"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("downloadFailed"));
    } finally {
      setBusyFormat(null);
    }
  }

  return (
    <Card className="border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ReportTypeBadge kind={definition.kind} badgeClassName={definition.badgeClassName} />
          <span className="text-label-sm text-muted-foreground">
            {t(`kinds.${definition.kind}.tagline`)}
          </span>
        </div>
        <CardTitle className="text-title-lg text-foreground">
          {t(`kinds.${definition.kind}.title`)}
        </CardTitle>
        <CardDescription className="text-body-md text-muted-foreground">
          {t(`kinds.${definition.kind}.description`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${definition.kind}-from`}>{t("from")}</Label>
            <Input
              id={`${definition.kind}-from`}
              type="date"
              value={range.from}
              max={range.to || undefined}
              onChange={(event) =>
                setRange((prev) => ({ ...prev, from: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${definition.kind}-to`}>{t("to")}</Label>
            <Input
              id={`${definition.kind}-to`}
              type="date"
              value={range.to}
              min={range.from || undefined}
              onChange={(event) =>
                setRange((prev) => ({ ...prev, to: event.target.value }))
              }
            />
          </div>
        </div>
        {showRangeError ? <FieldError>{t("invalidDateRange")}</FieldError> : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busyFormat != null || !rangeValid}
            onClick={() => void handleExport("excel")}
            className="gap-1.5"
          >
            {busyFormat === "excel" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-4" />
            )}
            {t("exportExcel")}
          </Button>
          <Button
            type="button"
            disabled={busyFormat != null || !rangeValid}
            onClick={() => void handleExport("pdf")}
            className="gap-1.5"
          >
            {busyFormat === "pdf" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}
            {t("exportPdf")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
