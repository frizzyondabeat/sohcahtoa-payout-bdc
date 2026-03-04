'use client';

/**
 * Mounts session heartbeat on dashboard - ensures token refresh is triggered
 * when access token expires even if no other API calls occur
 */

import { useSessionHeartbeat } from '@/hooks/use-session-heartbeat';

export function SessionHeartbeat() {
  useSessionHeartbeat(true);
  return null;
}
