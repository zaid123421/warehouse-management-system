import { ROUTES } from '@/constants/routes';
import type { Role } from './roles';

/**
 * مسارات/بادئات المسارات المسموحة لكل دور.
 * admin: كل الـ dashboard.
 * supplier: المنتجات، الطلبات، المخزون.
 * user: لوحة التحكم والملف الشخصي فقط (عرض محدود).
 */
const ROLE_ROUTE_PREFIXES: Record<Role, string[]> = {
  admin: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.WAREHOUSE_STRUCTURE,
    ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST,
    '/dashboard/inbound-sessions/',
    ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST,
    '/dashboard/outbound-sessions/',
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.EMPLOYEES,
    '/dashboard/employees/',
    ROUTES.DASHBOARD.REPORTS,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.STOCK,
  ],
  supplier: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.WAREHOUSE_STRUCTURE,
    ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST,
    '/dashboard/inbound-sessions/',
    ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST,
    '/dashboard/outbound-sessions/',
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.EMPLOYEES,
    '/dashboard/employees/',
    ROUTES.DASHBOARD.REPORTS,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.STOCK,
  ],
  user: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.PROFILE,
  ],
};

/**
 * يتحقق مما إذا كان الدور مسموحاً له بالوصول للمسار المعطى.
 */
export function canAccess(role: Role | null | undefined, pathname: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ROUTE_PREFIXES[role];
  if (!allowed) return false;
  const normalized = pathname.replace(/\/$/, '') || '/';
  return allowed.some((prefix) => normalized === prefix || normalized.startsWith(prefix + '/'));
}

export const NAV_ENTRIES = [
  { path: ROUTES.DASHBOARD.ROOT, label: 'Overview', key: 'dashboard' },
  { path: ROUTES.DASHBOARD.WAREHOUSE_STRUCTURE, label: 'Warehouse Structure', key: 'warehouseStructure' },
  { path: ROUTES.DASHBOARD.INBOUND_SESSIONS.LIST, label: 'Inbound Sessions', key: 'inboundSessions' },
  { path: ROUTES.DASHBOARD.OUTBOUND_SESSIONS.LIST, label: 'Outbound Sessions', key: 'outboundSessions' },
  { path: ROUTES.DASHBOARD.EMPLOYEES, label: 'Employees', key: 'employees' },
  { path: ROUTES.DASHBOARD.REPORTS, label: 'Reports', key: 'reports' },
  { path: ROUTES.DASHBOARD.PROFILE, label: 'Settings', key: 'settings' },
] as const;

export function getAllowedNavEntries(role: Role | null | undefined): { path: string; label: string; key: string }[] {
  if (!role) return [];
  return NAV_ENTRIES.filter((entry) => canAccess(role, entry.path));
}
