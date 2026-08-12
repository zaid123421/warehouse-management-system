"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ReportExportCard } from "@/modules/reports/components/report-export-card";
import { REPORT_DEFINITIONS } from "@/modules/reports/lib/report-catalog";
import { defaultReportDateRange } from "@/modules/reports/lib/report-utils";

export function ReportsPageContent() {
  const t = useTranslations("reports");
  const initialRange = useMemo(() => defaultReportDateRange(), []);

  return (
    <div className="space-y-6 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-body-md text-muted-foreground">{t("intro")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {REPORT_DEFINITIONS.map((definition) => (
          <ReportExportCard
            key={definition.kind}
            definition={definition}
            initialRange={initialRange}
          />
        ))}
      </div>
    </div>
  );
}
