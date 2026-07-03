export type WarehouseStaffRole = {
  id: number;
  name: string;
  description: string;
  systemGenerated: boolean;
  active: boolean;
  system: boolean;
};

export type WarehouseStaffUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  role: WarehouseStaffRole;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  active: boolean;
  system: boolean;
};

export type WarehouseStaffAssignment = {
  assignmentId: number;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  user: WarehouseStaffUser;
};

export type CreateStaffRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  position: string;
};

export type UpdateStaffRequest = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  position: string;
};

export type UpdateStaffStatusRequest = {
  active: boolean;
};
