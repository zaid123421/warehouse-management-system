import { toIsoDate } from "@/shared/lib/scheduling-week";
import type { ReportDateRange } from "@/modules/reports/types/report";

/** Default range: last 30 days inclusive through today (local). */
export function defaultReportDateRange(now: Date = new Date()): ReportDateRange {
  const to = toIsoDate(now);
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 30);
  return { from: toIsoDate(fromDate), to };
}

export function isValidReportDateRange(range: ReportDateRange): boolean {
  if (!range.from || !range.to) return false;
  return range.from <= range.to;
}

export function filenameFromContentDisposition(
  header: string | undefined,
  fallback: string,
): string {
  if (!header) return fallback;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/["']/g, ""));
    } catch {
      return utfMatch[1].trim().replace(/["']/g, "");
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(header);
  if (plainMatch?.[1]) return plainMatch[1].trim();
  return fallback;
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
