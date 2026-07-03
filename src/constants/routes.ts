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
    INBOUND_SESSIONS: "/dashboard/inbound-sessions",
    OUTBOUND_SESSIONS: "/dashboard/outbound-sessions",
    EMPLOYEES: "/dashboard/employees",
    REPORTS: "/dashboard/reports",
  },

  ERRORS: {
    NOT_FOUND: "/404",
    FORBIDDEN: "/403",
  },
} as const;

export type AppRoutes = typeof ROUTES;
