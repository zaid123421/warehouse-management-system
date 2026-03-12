import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';
import { canAccess } from '@/shared/config/permissions';
import { parseRole } from '@/shared/config/roles';

const USER_ROLE_COOKIE = 'user-role';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('refresh-token')?.value;
  const roleCookie = request.cookies.get(USER_ROLE_COOKIE)?.value;
  const role = parseRole(roleCookie);
  const { pathname } = request.nextUrl;

  const loginPath = ROUTES.AUTH.LOGIN;
  const dashboardPath = ROUTES.DASHBOARD.ROOT;
  const forbiddenPath = ROUTES.ERRORS.FORBIDDEN;

  // 1. حماية صفحات الـ Dashboard: بدون توكن → تسجيل الدخول
  if (!token && pathname.startsWith(dashboardPath)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // 2. منع المسجلين من دخول صفحات Auth (تسجيل الدخول أو التسجيل)
  const registerPath = ROUTES.AUTH.REGISTER;
  if (
    token &&
    (pathname === loginPath || pathname === '/auth' || pathname === registerPath)
  ) {
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // 3. صلاحيات: إذا كان داخل الـ dashboard وبدون دور أو دور لا يسمح بالمسار → 403
  if (token && pathname.startsWith(dashboardPath)) {
    if (!role || !canAccess(role, pathname)) {
      return NextResponse.redirect(new URL(forbiddenPath, request.url));
    }
  }

  return NextResponse.next();
}

// 4. الـ Matcher (لا يقبل المتغيرات، نكتب المسارات يدوياً)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/auth',
    '/register',
  ],
};