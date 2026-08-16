"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Warehouse,
  Import,
  ArrowUpFromLine,
  Users,
  ChartBar,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getAllowedNavEntries } from "@/shared/config/permissions";
import { useRole } from "@/shared/hooks/use-can-access";
import { useWarehouseAccount } from "@/shared/hooks/use-warehouse-account";
import { performClientLogout } from "@/application/auth/logout.use-case";

const KEY_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  warehouseStructure: Warehouse,
  inboundSessions: Import,
  outboundSessions: ArrowUpFromLine,
  employees: Users,
  reports: ChartBar,
  settings: Settings,
};

const SIDEBAR_COLLAPSED_KEY = "treadx.sidebar.collapsed";

function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col border-b border-surface-container",
        collapsed ? "items-center gap-2 px-2 py-3" : "h-16 flex-row items-center justify-between gap-2 px-4",
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          "flex min-w-0 items-center transition-opacity hover:opacity-90",
          collapsed && "justify-center",
        )}
        title={t("appName")}
      >
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden">
          <Image
            src="/images/x_blue_square.png"
            alt={tAuth("logoAlt")}
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        {!collapsed ? (
          <span className="mt-2 truncate font-bold text-2xl text-foreground">
            Tread<span className="text-primary-dark">X</span>
          </span>
        ) : null}
      </Link>

      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
          title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className={cn("size-4", isRtl && "rotate-180")} />
          ) : (
            <PanelLeftClose className={cn("size-4", isRtl && "rotate-180")} />
          )}
        </button>
      ) : null}
    </header>
  );
}

function SidebarContent({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const role = useRole();
  const { displayName, roleDisplay, avatarInitials, position } = useWarehouseAccount();
  const navEntries = getAllowedNavEntries(role);

  async function handleLogout() {
    onNavigate?.();
    await performClientLogout();
  }

  return (
    <>
      <nav className={cn("flex-1 space-y-1.5 overflow-auto p-3", collapsed && "px-2")}>
        {navEntries.map(({ path, key }) => {
          const Icon = KEY_ICON_MAP[key] ?? LayoutDashboard;
          const label = t(key);
          const isActive =
            key === "dashboard"
              ? pathname === path
              : pathname === path || pathname.startsWith(path + "/");
          return (
            <Link
              key={path}
              href={path}
              onClick={onNavigate}
              title={label}
              className={cn(
                "flex items-center rounded-lg border text-sm font-medium transition-colors",
                collapsed
                  ? "justify-center px-2 py-2.5"
                  : "justify-between gap-2 px-3 py-2.5",
                isActive
                  ? "border-primary-dark bg-primary-dark/10 text-primary-dark dark:bg-primary-dark/15"
                  : "border-transparent text-muted-foreground hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground",
              )}
            >
              <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                <Icon className="size-5 shrink-0" />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </div>
              {!collapsed && isActive ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark">
                  {t("active")}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto shrink-0 space-y-3 border-t border-border p-3",
          collapsed && "px-2",
        )}
      >
        <div
          className={cn(
            "rounded-lg border border-border bg-muted",
            collapsed ? "flex justify-center p-2" : "p-3",
          )}
          title={`${displayName} · ${roleDisplay}`}
        >
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-xs font-bold uppercase tracking-tight text-primary-dark"
              aria-hidden
            >
              {avatarInitials}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                  {roleDisplay}
                </p>
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {displayName}
                </p>
                {position ? (
                  <span className="mt-1 inline-block max-w-full truncate rounded-full bg-primary-dark px-2 py-0.5 text-[10px] font-medium text-primary-on-container">
                    {position}
                  </span>
                ) : (
                  <span className="mt-1 inline-block max-w-full truncate rounded-full bg-primary-dark px-2 py-0.5 text-[10px] font-medium text-primary-on-container">
                    {t("professionalPlan")}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={t("logout")}
          aria-label={t("logout")}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground",
            collapsed ? "justify-center px-2 py-2" : "justify-center px-3 py-2",
          )}
        >
          {collapsed ? <LogOut className="size-4" /> : t("logout")}
        </button>
      </div>
    </>
  );
}

export function AppSidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const sheetSide = isRtl ? "right" : "left";

  if (typeof window !== "undefined" && !ready) {
    let storedCollapsed = false;
    try {
      storedCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      storedCollapsed = false;
    }
    setCollapsed(storedCollapsed);
    setReady(true);
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  return (
    <>
      {/* Mobile header — visible below sm */}
      <header className="flex h-14 items-center gap-2 border-b border-border bg-surface-light px-3 dark:bg-surface-default sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={t("openSidebar")}
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
        >
          <Menu className="size-5" />
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground hover:underline"
        >
          <Image
            src="/images/x_blue_square.png"
            alt={tAuth("logoAlt")}
            width={28}
            height={28}
            className="object-contain"
          />
          {t("appName")}
        </Link>
      </header>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={sheetSide}
          className="flex w-[260px] max-w-[85vw] flex-col gap-0 bg-surface-light p-0 dark:bg-surface-default"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{t("appName")} Menu</SheetTitle>
          <SidebarHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — hidden below sm */}
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-e border-border bg-surface-light text-foreground transition-[width] duration-200 ease-out dark:bg-surface-default sm:flex",
          ready ? (collapsed ? "w-[72px]" : "w-[260px]") : "w-[260px]",
        )}
      >
        <SidebarHeader collapsed={collapsed} onToggle={toggleCollapsed} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SidebarContent collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
