/**
 * Proxy - Protects /dashboard/* and redirects unauthenticated users to login
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_ACCESS, LOGIN_PATH } from "@/lib/auth-config";

const DASHBOARD_PREFIX = "/dashboard";

function isDashboardPath(pathname: string): boolean {
  return (
    pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isDashboardPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;
  if (!accessToken) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
