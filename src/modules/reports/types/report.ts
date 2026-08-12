export type ReportKind =
  | "sla"
  | "performance"
  | "pending"
  | "occupancy"
  | "inventory";

export type ReportExportFormat = "excel" | "pdf";

export type ReportDateRange = {
  from: string;
  to: string;
};

export type ReportDefinition = {
  kind: ReportKind;
  excelEndpoint: string;
  pdfEndpoint: string;
  badgeClassName: string;
};
