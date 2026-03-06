/**
 * Proxy - Protects /dashboard/* and redirects unauthenticated users to login
 */
import { AUTH_COOKIE_ACCESS, LOGIN_PATH } from '@/lib/auth-config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PREFIX = '/dashboard';
const LOGIN_ALIAS_PATH = '/login';
const AUTHENTICATED_REDIRECT_PATH = '/dashboard';

function isDashboardPath(pathname: string): boolean {
  return (
    pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`)
  );
}

function isLoginPath(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname === LOGIN_ALIAS_PATH;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;

  if (isDashboardPath(pathname) && !accessToken) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath(pathname) && accessToken) {
    return NextResponse.redirect(
      new URL(AUTHENTICATED_REDIRECT_PATH, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/login'],
};
