'use client';

/**
 * Auth utilities: logout, fetch wrapper with token refresh
 * Prevents refresh race conditions by using a single in-flight refresh promise
 */

const REFRESH_URL = '/api/auth/refresh';
const LOGOUT_URL = '/api/auth/logout';

let refreshPromise: Promise<boolean> | null = null;

/**
 * Triggers token refresh. Only one refresh runs at a time; concurrent callers await the same promise.
 */
async function doRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    try {
      const response = await fetch(REFRESH_URL, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) return true;
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * Performs logout: calls API to clear cookies, then redirects to login.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(LOGOUT_URL, { method: 'POST', credentials: 'include' });
  } finally {
    window.location.href = '/auth/login';
  }
}

export interface FetchWithAuthOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch wrapper that:
 * - Sends credentials (cookies)
 * - On 401: triggers refresh once, retries original request
 * - On refresh failure: redirects to login
 */
export async function fetchWithAuth(
  url: string | URL,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuth, ...init } = options;
  const withCredentials: RequestInit = {
    ...init,
    credentials: 'include',
  };

  let response = await fetch(url, withCredentials);

  if (response.status === 401 && !skipAuth) {
    const refreshed = await doRefresh();
    if (!refreshed) {
      await logout();
      return response;
    }
    response = await fetch(url, withCredentials);
  }

  return response;
}
