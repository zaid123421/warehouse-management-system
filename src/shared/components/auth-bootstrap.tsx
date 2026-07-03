"use client";

import { useCurrentUser } from "@/modules/user/hooks/use-current-user";

/** Loads GET /v1/users/me on dashboard mount and keeps auth store in sync. */
export function AuthBootstrap() {
  useCurrentUser();
  return null;
}
