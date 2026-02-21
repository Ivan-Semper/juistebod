import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_token';

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/admin/content') ||
    pathname.startsWith('/admin/orders') ||
    pathname.startsWith('/admin/images') ||
    (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login'))
  ) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch {
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/content/:path*',
    '/admin/orders/:path*',
    '/admin/images/:path*',
    '/api/admin/content/:path*',
    '/api/admin/images/:path*',
    '/api/admin/logout/:path*',
  ]
};
