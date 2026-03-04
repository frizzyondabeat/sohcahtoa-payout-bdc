/**
 * PATCH /api/transactions/[id]/note - Add or update internal note
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_ACCESS } from '@/lib/auth-config';
import { setTransactionOverride } from '@/lib/mock-transactions';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  internalNote: z.string().max(1000),
});

async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid body', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  setTransactionOverride(id, { internalNote: parsed.data.internalNote });

  return NextResponse.json({
    id,
    internalNote: parsed.data.internalNote,
    message: 'Note updated',
  });
}
