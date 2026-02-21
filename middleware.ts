import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/admin/auth';

const ADMIN_PROTECTED_PATHS = [
  '/admin/dashboard',
  '/admin/content',
  '/admin/orders',
  '/admin/images'
];

function isProtectedPath(pathname: string): boolean {
  return ADMIN_PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/admin', request.url));
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/content/:path*',
    '/admin/orders/:path*',
    '/admin/images/:path*'
  ]
};
