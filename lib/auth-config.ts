/**
 * Auth configuration: cookie names, expiry constants, and public routes
 */

export const AUTH_COOKIE_ACCESS = 'auth_access_token';
export const AUTH_COOKIE_REFRESH = 'auth_refresh_token';
export const AUTH_COOKIE_USER = 'auth_user';
export const TOKEN_EXPIRY_SECONDS = 900; // 15 minutes for access token
export const REFRESH_EXPIRY_SECONDS = 604800; // 7 days for refresh token

/** Routes that do not require authentication */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/login',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
];

export const LOGIN_PATH = '/auth/login';
export const DASHBOARD_PATH = '/dashboard';
