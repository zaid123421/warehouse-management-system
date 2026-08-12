import { ENDPOINTS } from "@/services/endpoints";
import type { ReportDefinition, ReportKind } from "@/modules/reports/types/report";

export const REPORT_DEFINITIONS: readonly ReportDefinition[] = [
  {
    kind: "sla",
    excelEndpoint: ENDPOINTS.WMS_REPORTS.SLA_EXPORT,
    pdfEndpoint: ENDPOINTS.WMS_REPORTS.SLA_EXPORT_PDF,
    badgeClassName: "border-0 bg-sky-600 text-white hover:bg-sky-600",
  },
  {
    kind: "performance",
    excelEndpoint: ENDPOINTS.WMS_REPORTS.PERFORMANCE_EXPORT,
    pdfEndpoint: ENDPOINTS.WMS_REPORTS.PERFORMANCE_EXPORT_PDF,
    badgeClassName: "border-0 bg-emerald-600 text-white hover:bg-emerald-600",
  },
  {
    kind: "pending",
    excelEndpoint: ENDPOINTS.WMS_REPORTS.PENDING_EXPORT,
    pdfEndpoint: ENDPOINTS.WMS_REPORTS.PENDING_EXPORT_PDF,
    badgeClassName: "border-0 bg-amber-600 text-white hover:bg-amber-600",
  },
  {
    kind: "occupancy",
    excelEndpoint: ENDPOINTS.WMS_REPORTS.OCCUPANCY_EXPORT,
    pdfEndpoint: ENDPOINTS.WMS_REPORTS.OCCUPANCY_EXPORT_PDF,
    badgeClassName: "border-0 bg-violet-600 text-white hover:bg-violet-600",
  },
  {
    kind: "inventory",
    excelEndpoint: ENDPOINTS.WMS_REPORTS.INVENTORY_EXPORT,
    pdfEndpoint: ENDPOINTS.WMS_REPORTS.INVENTORY_EXPORT_PDF,
    badgeClassName: "border-0 bg-slate-700 text-white hover:bg-slate-700",
  },
] as const;

export function isReportKind(value: string): value is ReportKind {
  return REPORT_DEFINITIONS.some((item) => item.kind === value);
}
