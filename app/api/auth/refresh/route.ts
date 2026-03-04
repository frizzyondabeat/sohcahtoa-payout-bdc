/**
 * POST /api/auth/refresh - Refresh access token using refresh token
 * Prevents concurrent refresh calls via serialized processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { createAccessToken, createRefreshToken } from '@/lib/jwt';
import {
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
  AUTH_COOKIE_USER,
  TOKEN_EXPIRY_SECONDS,
  REFRESH_EXPIRY_SECONDS,
} from '@/lib/auth-config';

/** In-memory lock to prevent concurrent refresh (single-instance only; use Redis in production) */
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

export async function POST(request: NextRequest) {
  const refreshTokenCookie = request.cookies.get(AUTH_COOKIE_REFRESH)?.value;
  if (!refreshTokenCookie) {
    return NextResponse.json(
      { message: 'Refresh token missing', code: 'REFRESH_FAILED' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(refreshTokenCookie);
  if (!payload || payload.type !== 'refresh') {
    const res = NextResponse.json(
      { message: 'Invalid or expired refresh token', code: 'REFRESH_FAILED' },
      { status: 401 }
    );
    res.cookies.delete(AUTH_COOKIE_ACCESS);
    res.cookies.delete(AUTH_COOKIE_REFRESH);
    res.cookies.delete(AUTH_COOKIE_USER);
    return res;
  }

  const user = {
    id: payload.sub,
    role: payload.role,
  };

  const doRefresh = async () => {
    const [accessToken, newRefreshToken] = await Promise.all([
      createAccessToken(user.id, user.role),
      createRefreshToken(user.id, user.role),
    ]);
    return { accessToken, refreshToken: newRefreshToken };
  };

  if (!refreshPromise) {
    refreshPromise = doRefresh();
  }

  try {
    const tokens = await refreshPromise;
    refreshPromise = null;

    const response = NextResponse.json({
      expiresIn: TOKEN_EXPIRY_SECONDS,
      user,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set(AUTH_COOKIE_ACCESS, tokens.accessToken, {
      ...cookieOptions,
      maxAge: TOKEN_EXPIRY_SECONDS,
    });
    response.cookies.set(AUTH_COOKIE_REFRESH, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRY_SECONDS,
    });

    const userCookie = request.cookies.get(AUTH_COOKIE_USER)?.value;
    if (userCookie) {
      response.cookies.set(AUTH_COOKIE_USER, userCookie, {
        ...cookieOptions,
        maxAge: REFRESH_EXPIRY_SECONDS,
      });
    }

    return response;
  } catch {
    refreshPromise = null;
    const res = NextResponse.json(
      { message: 'Refresh failed', code: 'REFRESH_FAILED' },
      { status: 401 }
    );
    res.cookies.delete(AUTH_COOKIE_ACCESS);
    res.cookies.delete(AUTH_COOKIE_REFRESH);
    res.cookies.delete(AUTH_COOKIE_USER);
    return res;
  }
}
