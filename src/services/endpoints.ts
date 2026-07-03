export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    LOGOUT: "/v1/auth/logout",
    REFRESH: "/v1/auth/refresh",
    FORGOT_PASSWORD: "/v1/auth/forgot-password",
    CHANGE_PASSWORD: "/v1/auth/change-password",
  },
  USER: {
    ME: "/v1/users/me",
  },

  WMS_STAFF: {
    LIST: "/v1/wms/my-warehouse/staff",
    BY_ID: (userId: number) => `/v1/wms/my-warehouse/staff/${userId}`,
    STATUS: (userId: number) => `/v1/wms/my-warehouse/staff/${userId}/status`,
  },

  WMS_WAREHOUSE: {
    MY: "/v1/wms/my-warehouse",
    INITIATE: "/v1/wms/my-warehouse/initiate",
  },

  WMS_WAREHOUSE_VISUALIZATION: {
    ZONES: "/v1/wms/my-warehouse/visualization/zones",
    ZONE_ROWS: (zoneId: number) =>
      `/v1/wms/my-warehouse/visualization/zones/${zoneId}/rows`,
    ROW_RACKS: (rowId: number) =>
      `/v1/wms/my-warehouse/visualization/rows/${rowId}/racks`,
    RACK_SLOTS: (rackId: number) =>
      `/v1/wms/my-warehouse/visualization/racks/${rackId}/slots`,
    SLOT_POSITIONS: (slotId: number) =>
      `/v1/wms/my-warehouse/visualization/slots/${slotId}/positions`,
  },
} as const;

export type Endpoints = typeof ENDPOINTS;
