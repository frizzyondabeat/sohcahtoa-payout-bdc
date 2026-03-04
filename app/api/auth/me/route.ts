/**
 * GET /api/auth/me - Return current user from session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_USER } from '@/lib/auth-config';
import type { User } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;
  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const userCookie = request.cookies.get(AUTH_COOKIE_USER)?.value;
  let user: User;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie) as User;
    } catch {
      user = { id: payload.sub, role: payload.role as User['role'] };
    }
  } else {
    user = { id: payload.sub, role: payload.role as User['role'] };
  }

  return NextResponse.json({ user });
}
