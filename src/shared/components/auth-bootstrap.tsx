"use client";

import { useUserMe } from "@/modules/user/hooks/use-user-me";

/** Loads GET /v1/users/me on dashboard mount and keeps auth store in sync. */
export function AuthBootstrap() {
  useUserMe();
  return null;
}
