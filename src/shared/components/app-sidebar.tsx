"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllowedNavEntries } from "@/shared/config/permissions";
import { useRole } from "@/shared/hooks/use-can-access";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ThemeSwitcher } from "./theme-switcher";
import { LocaleSwitcher } from "./locale-switcher";

const KEY_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ShoppingCart,
  inventory: Warehouse,
  profile: User,
};

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const role = useRole();
  const navEntries = getAllowedNavEntries(role);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    TokenService.removeRefreshToken();
    clearAuth();
    window.location.href = "/auth";
  }

  return (
    <aside className="flex h-full w-[240px] flex-col border-e border-surface-container bg-surface-light dark:bg-surface-default text-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-surface-container px-4">
        <Link
          href="/dashboard"
          className="font-semibold text-foreground hover:underline"
        >
          {t("appName")}
        </Link>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-auto p-2">
        {navEntries.map(({ path, key }) => {
          const Icon = KEY_ICON_MAP[key] ?? LayoutDashboard;
          const isActive =
            pathname === path || pathname.startsWith(path + "/");
          return (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-surface-container p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{t("role")}</span>
          <span className="text-xs font-medium text-foreground">{role ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LocaleSwitcher />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="w-full hover:bg-primary"
        >
          {t("logout")}
        </Button>
      </div>
    </aside>
  );
}
