import type { PageableMeta } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type SlotPositionQrItem = {
  storagePositionId: number;
  positionNumber: number;
  locationBarcode: string | null;
  qrPngBase64: string;
};

export type SlotPositionQrPage = {
  slotId: number;
  slotNumber: number;
  qrSizePx: number;
  first: boolean;
  last: boolean;
  totalPages: number;
  items: SlotPositionQrItem[];
  pageable: PageableMeta;
};

export const SLOT_POSITION_QR_DEFAULT_PAGE_SIZE = 20;
