export type OccupancySummary = {
  empty: number;
  occupied: number;
  reservedInbound: number;
  reservedOutbound: number;
  total: number;
};

export type WarehouseZone = {
  id: number;
  warehouseId: number;
  zoneName: string;
  description: string;
  rowCount: number;
  summary: OccupancySummary;
};

export type WarehouseRow = {
  id: number;
  zoneId: number;
  zoneName: string;
  rowNumber: number;
  rackCount: number;
  summary: OccupancySummary;
};

export type WarehouseRack = {
  id: number;
  rowId: number;
  rowNumber: number;
  rackNumber: number;
  slotCount: number;
  summary: OccupancySummary;
};

export type WarehouseSlot = {
  id: number;
  rackId: number;
  rackNumber: number;
  slotNumber: number;
  summary: OccupancySummary;
};

export type WarehousePosition = {
  id: number;
  positionNumber: number;
  locationBarcode: string | null;
  status: string;
  tireLabel: string;
  tireId: number | null;
  reservedForTireId: number | null;
};

export type PageableMeta = {
  page: number;
  perPage: number;
  total: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pageable: PageableMeta;
};

export type VisualizationQueryParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
  includePositions?: boolean;
};

export const VISUALIZATION_DEFAULT_PAGE_SIZE = 20;
