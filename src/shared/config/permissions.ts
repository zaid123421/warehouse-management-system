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
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.STOCK,
  ],
  supplier: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.STOCK,
  ],
  user: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.INVENTORY,
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
  { path: ROUTES.DASHBOARD.ROOT, label: 'Overview', key: 'overview' },
  { path: ROUTES.DASHBOARD.INVENTORY, label: 'Inventory', key: 'inventory' },
  { path: ROUTES.DASHBOARD.ORDERS.LIST, label: 'Orders', key: 'orders' },
  { path: ROUTES.DASHBOARD.PRODUCTS.LIST, label: 'Products', key: 'products' },
  { path: ROUTES.DASHBOARD.STOCK, label: 'Stock', key: 'stock' },
  { path: ROUTES.DASHBOARD.PROFILE, label: 'Settings', key: 'settings' },
] as const;

export function getAllowedNavEntries(role: Role | null | undefined): { path: string; label: string; key: string }[] {
  if (!role) return [];
  return NAV_ENTRIES.filter((entry) => canAccess(role, entry.path));
}
