export type RackSlot = {
  zoneId: string;
  position: [number, number, number];
  rotationY?: number;
};

/** One warehouse zone: its own rack grid + inventory metadata for UI */
export type WarehouseZoneConfig = {
  id: string;
  colorHex: string;
  labelKey: string;
  descriptionKey: string;
  statsKey: string;
  rackCols: number;
  rackRows: number;
  shelfLevels: number;
  tireCount: number;
  origin: [number, number];
  spacingX: number;
  spacingZ: number;
};

export const WAREHOUSE_ZONES: WarehouseZoneConfig[] = [
  {
    id: "zone-a",
    colorHex: "#C47F08",
    labelKey: "warehouseZones.zoneA.label",
    descriptionKey: "warehouseZones.zoneA.description",
    statsKey: "warehouseZones.zoneA.stats",
    rackCols: 2,
    rackRows: 1,
    shelfLevels: 4,
    tireCount: 96,
    origin: [-5.2, -2.4],
    spacingX: 2.5,
    spacingZ: 2.5,
  },
  {
    id: "zone-b",
    colorHex: "#0284C7",
    labelKey: "warehouseZones.zoneB.label",
    descriptionKey: "warehouseZones.zoneB.description",
    statsKey: "warehouseZones.zoneB.stats",
    rackCols: 3,
    rackRows: 2,
    shelfLevels: 5,
    tireCount: 420,
    origin: [3.2, -1.2],
    spacingX: 2.45,
    spacingZ: 2.45,
  },
  {
    id: "zone-c",
    colorHex: "#16A34A",
    labelKey: "warehouseZones.zoneC.label",
    descriptionKey: "warehouseZones.zoneC.description",
    statsKey: "warehouseZones.zoneC.stats",
    rackCols: 1,
    rackRows: 3,
    shelfLevels: 3,
    tireCount: 54,
    origin: [-6.0, 3.0],
    spacingX: 2.5,
    spacingZ: 2.5,
  },
  {
    id: "zone-d",
    colorHex: "#9333EA",
    labelKey: "warehouseZones.zoneD.label",
    descriptionKey: "warehouseZones.zoneD.description",
    statsKey: "warehouseZones.zoneD.stats",
    rackCols: 2,
    rackRows: 2,
    shelfLevels: 4,
    tireCount: 192,
    origin: [3.0, 3.4],
    spacingX: 2.5,
    spacingZ: 2.5,
  },
];

function buildSlotsForZone(zone: WarehouseZoneConfig): RackSlot[] {
  const slots: RackSlot[] = [];
  const [cx, cz] = zone.origin;
  const { rackCols, rackRows, spacingX, spacingZ } = zone;
  for (let r = 0; r < rackRows; r++) {
    for (let c = 0; c < rackCols; c++) {
      const x = cx + (c - (rackCols - 1) / 2) * spacingX;
      const posZ = cz + (r - (rackRows - 1) / 2) * spacingZ;
      slots.push({ zoneId: zone.id, position: [x, 0, posZ] });
    }
  }
  return slots;
}

export function getAllRackSlots(): RackSlot[] {
  return WAREHOUSE_ZONES.flatMap(buildSlotsForZone);
}

export function getWarehouseZoneById(
  id: string
): WarehouseZoneConfig | undefined {
  return WAREHOUSE_ZONES.find((z) => z.id === id);
}
