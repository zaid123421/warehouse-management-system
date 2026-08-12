"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DIALOG_SHELL_CLASS } from "@/lib/radius";
import { VisualizationPagination } from "@/modules/warehouse-structure/components/visualization-pagination";
import { useSlotPositionQr } from "@/modules/warehouse-structure/hooks/use-slot-position-qr";
import {
  openQrInNewTab,
  toQrDataUrl,
} from "@/modules/warehouse-structure/lib/slot-position-qr-dto";
import type { SlotPositionQrItem } from "@/modules/warehouse-structure/types/slot-position-qr";
import type { WarehouseSlot } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type SlotPositionQrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: WarehouseSlot | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function printQrItems(args: {
  title: string;
  items: SlotPositionQrItem[];
  labels: {
    position: string;
    noBarcode: string;
  };
}): void {
  const { title, items, labels } = args;
  const cards = items
    .map((item) => {
      const barcode = item.locationBarcode?.trim() || labels.noBarcode;
      return `
        <article class="label">
          <p class="position">${escapeHtml(labels.position)} #${escapeHtml(String(item.positionNumber))}</p>
          <img class="qr" src="${toQrDataUrl(item.qrPngBase64)}" alt="QR ${escapeHtml(String(item.positionNumber))}" />
          <p class="barcode">${escapeHtml(barcode)}</p>
        </article>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      /* Square thermal-friendly label size; printer dialog can still override paper. */
      @page {
        size: 50mm 50mm;
        margin: 1.5mm;
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
        color: #000;
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .label {
        width: 47mm;
        min-height: 47mm;
        margin: 0 auto;
        padding: 1.5mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        page-break-after: always;
        break-after: page;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .label:last-child {
        page-break-after: auto;
        break-after: auto;
      }

      .position {
        margin: 0;
        font-size: 9pt;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0.02em;
      }

      .qr {
        display: block;
        width: 32mm;
        height: 32mm;
        object-fit: contain;
        margin: 1mm 0;
      }

      .barcode {
        margin: 0;
        max-width: 100%;
        font-size: 6.5pt;
        font-weight: 600;
        line-height: 1.25;
        word-break: break-all;
        overflow-wrap: anywhere;
      }

      @media print {
        .label {
          width: auto;
          min-height: auto;
          height: 100%;
        }
      }
    </style>
  </head>
  <body>
    ${cards}
  </body>
</html>`;

  // Hidden iframe avoids blank tabs from window.open(..., "noopener").
  // Keep a real size so the browser can render QR images before printing.
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "50mm";
  iframe.style.height = "50mm";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    iframe.remove();
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  const cleanup = () => {
    iframe.remove();
  };

  const triggerPrint = () => {
    try {
      frameWindow.focus();
      frameWindow.print();
    } finally {
      window.setTimeout(cleanup, 1000);
    }
  };

  const images = Array.from(frameDocument.images);
  if (images.length === 0) {
    triggerPrint();
    return;
  }

  let remaining = images.length;
  const onReady = () => {
    remaining -= 1;
    if (remaining <= 0) triggerPrint();
  };

  for (const image of images) {
    if (image.complete) {
      onReady();
    } else {
      image.addEventListener("load", onReady, { once: true });
      image.addEventListener("error", onReady, { once: true });
    }
  }
}

function MetaChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-surface-light-container)] bg-[var(--color-surface-light-container)]/60 px-3 py-2 dark:border-[var(--color-surface-container-high)] dark:bg-[var(--color-surface-container-high)]/50">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function SlotPositionQrDialog({
  open,
  onOpenChange,
  slot,
}: SlotPositionQrDialogProps) {
  const t = useTranslations("warehouseStructure.slotPositionQr");
  const [page, setPage] = useState(0);
  const [pageContext, setPageContext] = useState({
    open,
    slotId: slot?.id ?? null,
  });

  if (open !== pageContext.open || (slot?.id ?? null) !== pageContext.slotId) {
    setPageContext({ open, slotId: slot?.id ?? null });
    if (open) setPage(0);
  }

  const query = useSlotPositionQr(slot?.id ?? null, page, {
    enabled: open && slot != null,
  });

  const data = query.data;
  const items = data?.items ?? [];
  const slotNumber = data?.slotNumber || slot?.slotNumber || "—";
  const canPrint = items.length > 0 && !query.isPending;

  function handlePrint() {
    printQrItems({
      title: t("title", { number: slotNumber }),
      items,
      labels: {
        position: t("fields.positionNumber"),
        noBarcode: t("noBarcode"),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          DIALOG_SHELL_CLASS,
          "flex max-h-[min(90vh,52rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <DialogHeader className="space-y-4 border-b border-[var(--border)] p-6 pe-14 pb-5 text-start">
          <div className="space-y-2">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-dark/12 text-primary-dark">
                <QrCode className="size-5" />
              </span>
              {t("title", { number: slotNumber })}
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </DialogDescription>
          </div>

          {data ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <MetaChip label={t("fields.slotId")} value={data.slotId} />
              <MetaChip label={t("fields.slotNumber")} value={data.slotNumber} />
              <MetaChip label={t("fields.qrSizePx")} value={`${data.qrSizePx}px`} />
              <MetaChip label={t("fields.totalElements")} value={data.pageable.total} />
              <MetaChip
                label={t("fields.page")}
                value={`${data.pageable.page + 1}/${Math.max(data.totalPages, 1)}`}
              />
              <MetaChip label={t("fields.size")} value={data.pageable.perPage} />
            </div>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
          {query.isError ? (
            <ErrorAlert
              message={
                query.error instanceof Error ? query.error.message : t("errorLoading")
              }
              onRetry={() => void query.refetch()}
              retryLabel={t("retry")}
            />
          ) : query.isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((item) => {
                const src = toQrDataUrl(item.qrPngBase64);
                return (
                  <article
                    key={item.storagePositionId}
                    className="overflow-hidden rounded-xl border border-[var(--color-surface-light-container)] bg-card shadow-sm dark:border-[var(--color-surface-container-high)]"
                  >
                    <div className="space-y-2 border-b border-[var(--color-surface-light-container)] px-4 py-3.5 dark:border-[var(--color-surface-container-high)]">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground">
                          {t("fields.positionNumber")}{" "}
                          <span className="text-primary-dark">#{item.positionNumber}</span>
                        </h3>
                        <span className="shrink-0 rounded-md bg-primary-dark/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-dark">
                          ID {item.storagePositionId}
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t("fields.locationBarcode")}
                        </p>
                        <p className="mt-0.5 break-all font-mono text-xs leading-relaxed text-foreground/90">
                          {item.locationBarcode ?? t("noBarcode")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="group block w-full bg-[var(--color-surface-light-container)]/40 p-4 transition-colors hover:bg-primary-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-dark dark:bg-[var(--color-surface-container-high)]/30"
                      onClick={() => openQrInNewTab(item.qrPngBase64)}
                      aria-label={t("openQrAria", { number: item.positionNumber })}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={t("qrAlt", { number: item.positionNumber })}
                        className="mx-auto size-44 rounded-md bg-white object-contain p-2 shadow-sm ring-1 ring-black/5"
                      />
                      <span className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary-dark group-hover:underline">
                        <ExternalLink className="size-3.5" />
                        {t("openInNewTab")}
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--color-surface-light-container)]/35 px-6 py-3.5 dark:bg-[var(--color-surface-container-high)]/25 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-1.5 self-start sm:self-auto"
            disabled={!canPrint}
            onClick={handlePrint}
          >
            <Printer className="size-3.5" />
            {t("print")}
          </Button>

          {data?.pageable ? (
            <VisualizationPagination
              pageable={data.pageable}
              onPageChange={setPage}
              className="sm:ms-auto"
            />
          ) : (
            <span className="text-xs text-muted-foreground" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
