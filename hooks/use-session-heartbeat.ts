'use client';

/**
 * Proactive session keepalive - periodically validates the session.
 * When the access token expires, the next request returns 401 and triggers
 * refresh via apiClient interceptor. Ensures /api/auth/refresh is called even
 * when no other API requests are made (e.g. user idle on page with initialData).
 */

import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { TOKEN_EXPIRY_SECONDS } from '@/lib/auth-config';

const ME_URL = '/api/auth/me';

/** Poll interval: slightly more frequent than token expiry to catch 401 promptly */
const HEARTBEAT_INTERVAL_MS = Math.max(1000, (TOKEN_EXPIRY_SECONDS - 1) * 1000);

export function useSessionHeartbeat(enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      apiClient.get(ME_URL).catch(() => {
        /* refresh/logout handled by apiClient interceptor */
      });
    };

    tick();
    intervalRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);
}
