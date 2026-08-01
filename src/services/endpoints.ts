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

  WMS_INBOUND_SCHEDULING: {
    BOARD: "/v1/wms/my-warehouse/scheduling/board",
    CELL: (cellId: number) => `/v1/wms/my-warehouse/scheduling/cells/${cellId}`,
    APPROVE_CELL: (cellId: number) =>
      `/v1/wms/my-warehouse/scheduling/cells/${cellId}/approve`,
  },

  WMS_INBOUND_REQUESTS: {
    LIST: "/v1/wms/my-warehouse/inbound-requests",
    BY_ID: (requestId: number) => `/v1/wms/my-warehouse/inbound-requests/${requestId}`,
  },

  WMS_INBOUND_TRUCKS: {
    PLANNING_POOL: "/v1/wms/my-warehouse/inbound-trucks/planning-pool",
    PLANNING: "/v1/wms/my-warehouse/inbound-trucks/planning",
    CREATE: "/v1/wms/my-warehouse/inbound-trucks",
    BY_ID: (truckId: number) => `/v1/wms/my-warehouse/inbound-trucks/${truckId}`,
    ASSIGN: (truckId: number, inboundRequestId: number) =>
      `/v1/wms/my-warehouse/inbound-trucks/${truckId}/assign/${inboundRequestId}`,
    APPROVE: (truckId: number) => `/v1/wms/my-warehouse/inbound-trucks/${truckId}/approve`,
    TRANSIT: "/v1/wms/my-warehouse/inbound-trucks/transit",
    CREATE_RECEIVING_SESSION: (truckId: number) =>
      `/v1/wms/my-warehouse/inbound-trucks/${truckId}/create-receiving-session`,
  },

  WMS_RECEIVING_SESSIONS: {
    LIST: "/v1/wms/my-warehouse/receiving-sessions",
    BY_ID: (sessionId: number) => `/v1/wms/my-warehouse/receiving-sessions/${sessionId}`,
    APPROVE: (sessionId: number) =>
      `/v1/wms/my-warehouse/receiving-sessions/${sessionId}/approve`,
    REJECT: (sessionId: number) =>
      `/v1/wms/my-warehouse/receiving-sessions/${sessionId}/reject`,
    ASSIGN: (sessionId: number) =>
      `/v1/wms/my-warehouse/receiving-sessions/${sessionId}/assign`,
    START: (sessionId: number) =>
      `/v1/wms/my-warehouse/receiving-sessions/${sessionId}/start`,
    COMPLETE: (sessionId: number) =>
      `/v1/wms/my-warehouse/receiving-sessions/${sessionId}/complete`,
  },

  WMS_PUTAWAY_SESSIONS: {
    LIST: "/v1/wms/my-warehouse/putaway-sessions",
    BY_ID: (sessionId: number) => `/v1/wms/my-warehouse/putaway-sessions/${sessionId}`,
    APPROVE: (sessionId: number) =>
      `/v1/wms/my-warehouse/putaway-sessions/${sessionId}/approve`,
    ASSIGN: (sessionId: number) =>
      `/v1/wms/my-warehouse/putaway-sessions/${sessionId}/assign`,
    START: (sessionId: number) => `/v1/wms/my-warehouse/putaway-sessions/${sessionId}/start`,
  },

  WMS_OPERATIONS: {
    DASHBOARD: "/v1/wms/my-warehouse/operations/dashboard",
  },

  WMS_OUTBOUND_SCHEDULING: {
    BOARD: "/v1/wms/my-warehouse/outbound-scheduling/board",
    CELL: (cellId: number) =>
      `/v1/wms/my-warehouse/outbound-scheduling/cells/${cellId}`,
    APPROVE_CELL: (cellId: number) =>
      `/v1/wms/my-warehouse/outbound-scheduling/cells/${cellId}/approve`,
    GENERATE_PICKING: "/v1/wms/my-warehouse/outbound-scheduling/generate-picking-sessions",
  },

  WMS_OUTBOUND_TRUCKS: {
    CREATE: "/v1/wms/my-warehouse/outbound-trucks",
    LIST: "/v1/wms/my-warehouse/outbound-trucks",
    PLANNING_POOL: "/v1/wms/my-warehouse/outbound-trucks/planning-pool",
    PLANNING: "/v1/wms/my-warehouse/outbound-trucks/planning",
    READY_TO_SHIP: "/v1/wms/my-warehouse/outbound-trucks/ready-to-ship",
    SHIPPING: "/v1/wms/my-warehouse/outbound-trucks/shipping",
    BY_ID: (truckId: number) => `/v1/wms/my-warehouse/outbound-trucks/${truckId}`,
    ASSIGN: (truckId: number, outboundRequestId: number) =>
      `/v1/wms/my-warehouse/outbound-trucks/${truckId}/assign/${outboundRequestId}`,
    APPROVE: (truckId: number) =>
      `/v1/wms/my-warehouse/outbound-trucks/${truckId}/approve`,
    CREATE_SHIPPING_SESSION: (truckId: number) =>
      `/v1/wms/my-warehouse/outbound-trucks/${truckId}/create-shipping-session`,
    DELETE: (truckId: number) => `/v1/wms/my-warehouse/outbound-trucks/${truckId}`,
  },

  WMS_PICKING_SESSIONS: {
    LIST: "/v1/wms/my-warehouse/picking-sessions",
    BY_ID: (sessionId: number) => `/v1/wms/my-warehouse/picking-sessions/${sessionId}`,
    APPROVE: (sessionId: number) =>
      `/v1/wms/my-warehouse/picking-sessions/${sessionId}/approve`,
    CANCEL: (sessionId: number) =>
      `/v1/wms/my-warehouse/picking-sessions/${sessionId}/cancel`,
    ASSIGN: (sessionId: number) =>
      `/v1/wms/my-warehouse/picking-sessions/${sessionId}/assign`,
    START: (sessionId: number) =>
      `/v1/wms/my-warehouse/picking-sessions/${sessionId}/start`,
    COMPLETE: (sessionId: number) =>
      `/v1/wms/my-warehouse/picking-sessions/${sessionId}/complete`,
    DISPATCH: (sessionId: number) =>
      `/v1/wms/my-warehouse/picking-sessions/${sessionId}/dispatch`,
  },

  WMS_SHIPPING_SESSIONS: {
    LIST: "/v1/wms/my-warehouse/shipping-sessions",
    GENERATE: "/v1/wms/my-warehouse/shipping-sessions/generate",
    BY_ID: (sessionId: number) => `/v1/wms/my-warehouse/shipping-sessions/${sessionId}`,
    APPROVE: (sessionId: number) =>
      `/v1/wms/my-warehouse/shipping-sessions/${sessionId}/approve`,
    CANCEL: (sessionId: number) =>
      `/v1/wms/my-warehouse/shipping-sessions/${sessionId}/cancel`,
    ASSIGN: (sessionId: number) =>
      `/v1/wms/my-warehouse/shipping-sessions/${sessionId}/assign`,
    START: (sessionId: number) =>
      `/v1/wms/my-warehouse/shipping-sessions/${sessionId}/start`,
    COMPLETE: (sessionId: number) =>
      `/v1/wms/my-warehouse/shipping-sessions/${sessionId}/complete`,
  },
} as const;

export type Endpoints = typeof ENDPOINTS;
