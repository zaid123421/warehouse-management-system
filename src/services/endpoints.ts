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
} as const;

export type Endpoints = typeof ENDPOINTS;
