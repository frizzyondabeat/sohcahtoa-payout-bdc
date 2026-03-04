/**
 * GET /api/transactions/stream - Server-Sent Events for real-time transaction updates
 */

import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_ACCESS } from '@/lib/auth-config';
import type { Transaction } from '@/types/transaction';
import { applyOverrides } from '@/lib/mock-transactions';

export const dynamic = 'force-dynamic';

function getRandomTransaction(existingIds: Set<string>): Transaction | null {
  const descriptions = ['Live transfer from John', 'Real-time FX purchase', 'Instant PTA credit'];
  for (let attempt = 0; attempt < 20; attempt++) {
    const id = `txn_live_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    if (existingIds.has(id)) continue;
    return applyOverrides({
      id,
      amount: Math.round((Math.random() * 500) * 100) / 100,
      currency: 'USD',
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status: 'completed',
      createdAt: new Date().toISOString(),
      cardLast4: `${1000 + Math.floor(Math.random() * 9000)}`,
    });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sentIds = new Set<string>();
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      sendEvent('connected', { timestamp: new Date().toISOString() });

      const interval = setInterval(() => {
        const txn = getRandomTransaction(sentIds);
        if (txn) {
          sentIds.add(txn.id);
          sendEvent('transaction', txn);
        }
      }, 5000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
