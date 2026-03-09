import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';

export function proxy(request: NextRequest) {
  // 1. جلب التوكن من الكوكيز (الاسم مطابق لما وضعه في token-service)
  const token = request.cookies.get('refresh-token')?.value;
  const { pathname } = request.nextUrl;

  // تعريف المسارات من ملف الـ constants
  const loginPath = ROUTES.AUTH.LOGIN;
  const dashboardPath = ROUTES.DASHBOARD.ROOT;

  // 2. حماية صفحات الـ Dashboard
  // إذا حاول الدخول لأي مسار يبدأ بـ /dashboard وهو لا يملك توكن
  if (!token && pathname.startsWith(dashboardPath)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // 3. منع المسجلين من دخول صفحة الـ Login
  if (token && pathname === loginPath) {
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

// 4. الـ Matcher (لا يقبل المتغيرات، نكتب المسارات يدوياً)
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login',            
  ],
};