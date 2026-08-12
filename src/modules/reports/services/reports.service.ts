import api from "@/lib/api";
import { toReportsError } from "@/modules/reports/lib/reports-error";
import {
  filenameFromContentDisposition,
  triggerBrowserDownload,
} from "@/modules/reports/lib/report-utils";
import type { ReportDateRange, ReportExportFormat, ReportKind } from "@/modules/reports/types/report";

export async function downloadWarehouseReport(options: {
  endpoint: string;
  kind: ReportKind;
  format: ReportExportFormat;
  range: ReportDateRange;
}): Promise<void> {
  const { endpoint, kind, format, range } = options;
  const extension = format === "pdf" ? "pdf" : "xlsx";
  const fallbackFilename = `${kind}-report_${range.from}_${range.to}.${extension}`;

  try {
    const response = await api.get<Blob>(endpoint, {
      params: { from: range.from, to: range.to },
      responseType: "blob",
    });

    const contentType =
      typeof response.headers["content-type"] === "string"
        ? response.headers["content-type"]
        : format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const blob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: contentType });

    const disposition =
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined;

    triggerBrowserDownload(
      blob,
      filenameFromContentDisposition(disposition, fallbackFilename),
    );
  } catch (err: unknown) {
    await toReportsError(err);
  }
}
