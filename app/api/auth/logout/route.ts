/**
 * POST /api/auth/logout - Clear auth cookies and redirect to login
 */

import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
  AUTH_COOKIE_USER,
} from '@/lib/auth-config';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  response.cookies.set(AUTH_COOKIE_ACCESS, '', {
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(AUTH_COOKIE_REFRESH, '', {
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(AUTH_COOKIE_USER, '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
