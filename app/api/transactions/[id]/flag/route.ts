/**
 * PATCH /api/transactions/[id]/flag - Mark transaction as flagged (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_ACCESS } from '@/lib/auth-config';
import { setTransactionOverride } from '@/lib/mock-transactions';

export const dynamic = 'force-dynamic';

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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Forbidden: only admins can flag transactions', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const isFlagged = body.isFlagged === true;

  setTransactionOverride(id, {
    isFlagged,
    ...(isFlagged ? { status: 'flagged' as const } : { status: undefined }),
  });

  return NextResponse.json({
    id,
    isFlagged,
    message: isFlagged ? 'Transaction flagged' : 'Transaction unflagged',
  });
}
