import { NextRequest, NextResponse } from 'next/server';
import {
  validateCredentials,
  signToken,
  COOKIE_NAME
} from '@/lib/admin/auth';
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit';

export async function POST(request: NextRequest) {
  // Max 5 loginpogingen per kwartier per IP tegen brute-force
  const ip = getClientIP(request);
  const { allowed } = rateLimit(`admin-login:${ip}`, 5, 15 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Te veel loginpogingen. Probeer het later opnieuw.' },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await signToken({ username });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
