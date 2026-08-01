export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
  },

  DASHBOARD: {
    ROOT: "/dashboard",
    PROFILE: "/dashboard/profile",

    PRODUCTS: {
      LIST: "/dashboard/products",
      ADD: "/dashboard/products/add",
      DETAILS: (id: string | number) => `/dashboard/products/${id}`,
    },

    ORDERS: {
      LIST: "/dashboard/orders",
      DETAILS: (id: string | number) => `/dashboard/orders/${id}`,
    },

    INVENTORY: "/dashboard/inventory",
    STOCK: "/dashboard/stock",
    WAREHOUSE_STRUCTURE: "/dashboard/warehouse-structure",
    INBOUND_SESSIONS: {
      LIST: "/dashboard/inbound-sessions",
      TRUCK_PLANNING: (cellId: string | number) =>
        `/dashboard/inbound-sessions/truck-planning/${cellId}`,
      RECEIVING_DETAIL: (id: string | number) => `/dashboard/inbound-sessions/receiving/${id}`,
      PUTAWAY_DETAIL: (id: string | number) => `/dashboard/inbound-sessions/putaway/${id}`,
    },
    OUTBOUND_SESSIONS: {
      LIST: "/dashboard/outbound-sessions",
      TRUCK_PLANNING: (cellId: string | number) =>
        `/dashboard/outbound-sessions/truck-planning/${cellId}`,
      PICKING_DETAIL: (id: string | number) => `/dashboard/outbound-sessions/picking/${id}`,
    },
    EMPLOYEES: "/dashboard/employees",
    REPORTS: "/dashboard/reports",
  },

  ERRORS: {
    NOT_FOUND: "/404",
    FORBIDDEN: "/403",
  },
} as const;

export type AppRoutes = typeof ROUTES;
