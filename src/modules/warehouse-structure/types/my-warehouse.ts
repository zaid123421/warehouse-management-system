export type WarehouseInitializationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export type WarehouseAddress = {
  id: number;
  streetName: string;
  streetNumber: string;
  postalCode: string;
  unitNumber: string;
  city: string;
  province: string;
  country: string;
  specialInstructions: string;
};

export type MyWarehouse = {
  id: number;
  warehouseName: string;
  warehouseCode: string;
  email: string;
  phoneNumber: string;
  address: WarehouseAddress | null;
  status: string;
  initialized: boolean;
  initializationStatus: WarehouseInitializationStatus;
  latestJobId: number | null;
  zonesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type InitiateWarehouseRequest = {
  zonesCount: number;
  rowsPerZone: number;
  racksPerRow: number;
  slotsPerRack: number;
  positionsPerSlot: number;
};

export const INITIATE_WAREHOUSE_LIMITS = {
  zonesCount: { min: 1, max: 100 },
  rowsPerZone: { min: 1, max: 500 },
  racksPerRow: { min: 1, max: 500 },
  slotsPerRack: { min: 1, max: 1000 },
  positionsPerSlot: { min: 1, max: 1000 },
} as const;

export const INITIATE_WAREHOUSE_DEFAULTS: InitiateWarehouseRequest = {
  zonesCount: 4,
  rowsPerZone: 10,
  racksPerRow: 5,
  slotsPerRack: 4,
  positionsPerSlot: 2,
};
