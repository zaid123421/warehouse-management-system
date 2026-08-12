import { asRecord, bool, pickNumber, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  SlotPositionQrItem,
  SlotPositionQrPage,
} from "@/modules/warehouse-structure/types/slot-position-qr";

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeQrItem(raw: unknown): SlotPositionQrItem | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  const storagePositionId = pickNumber(rec, "storagePositionId");
  const qrPngBase64 = str(rec.qrPngBase64);
  if (!storagePositionId || !qrPngBase64) return null;

  return {
    storagePositionId,
    positionNumber: pickNumber(rec, "positionNumber"),
    locationBarcode: optionalString(rec.locationBarcode),
    qrPngBase64,
  };
}

export function normalizeSlotPositionQrPage(data: unknown): SlotPositionQrPage {
  const root = unwrapPayload(data);
  const itemsRaw = Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.content)
      ? root.content
      : Array.isArray(root.body)
        ? root.body
        : [];

  const page = pickNumber(root, "page");
  const size = pickNumber(root, "size") || pickNumber(root, "perPage") || 20;
  const totalElements =
    pickNumber(root, "totalElements") || pickNumber(root, "total") || itemsRaw.length;
  const totalPages =
    pickNumber(root, "totalPages") ||
    Math.max(1, Math.ceil(totalElements / Math.max(size, 1)));

  return {
    slotId: pickNumber(root, "slotId"),
    slotNumber: pickNumber(root, "slotNumber"),
    qrSizePx: pickNumber(root, "qrSizePx"),
    first: "first" in root ? bool(root.first) : page <= 0,
    last: "last" in root ? bool(root.last) : page + 1 >= totalPages,
    totalPages,
    items: itemsRaw
      .map(normalizeQrItem)
      .filter((item): item is SlotPositionQrItem => item != null),
    pageable: {
      page,
      perPage: size,
      total: totalElements,
    },
  };
}

export function toQrDataUrl(qrPngBase64: string): string {
  const trimmed = qrPngBase64.trim();
  if (trimmed.startsWith("data:image/")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload = ""] = dataUrl.split(",", 2);
  const mimeMatch = /^data:([^;]+)/.exec(header);
  const mime = mimeMatch?.[1] ?? "image/png";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function openQrInNewTab(qrPngBase64: string): void {
  const dataUrl = toQrDataUrl(qrPngBase64);
  const blobUrl = URL.createObjectURL(dataUrlToBlob(dataUrl));
  const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
