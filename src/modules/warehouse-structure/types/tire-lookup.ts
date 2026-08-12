export const TIRE_UNIQUE_ID_LENGTH = 27;

export type TireStatusHistoryEntry = {
  id: number | null;
  tireId: number | null;
  historyType: string;
  status: string;
  notes: string;
  historyDate: string | null;
  createdAt: string | null;
};

export type TireLocationHistoryEntry = {
  id: number | null;
  storagePositionId: number | null;
  tireId: number | null;
  action: string;
  previousLocation: string | null;
  newLocation: string | null;
  actionDate: string | null;
  notes: string;
};

export type TireLookupLocation = {
  storagePositionId: number | null;
  locationBarcode: string | null;
  occupancy: string;
  positionStatus: string;
  zoneId: number | null;
  zoneName: string;
  rowId: number | null;
  rowNumber: number | null;
  rackId: number | null;
  rackNumber: number | null;
  slotId: number | null;
  slotNumber: number | null;
  positionNumber: number | null;
};

export type TireLookupResult = {
  tireId: number | null;
  tireUniqueId: string;
  status: string;
  dealerId: number | null;
  dealerName: string;
  location: TireLookupLocation | null;
  statusHistory: TireStatusHistoryEntry[];
  locationHistory: TireLocationHistoryEntry[];
};
