/**
 * GET /api/transactions - Fetch transactions with pagination, sorting, and filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_ACCESS } from '@/lib/auth-config';
import { getTransactions } from '@/lib/transactions-service';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['amount', 'createdAt', 'status', 'description']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['pending', 'completed', 'failed', 'flagged']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query params', errors: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const result = await getTransactions(parsed.data);
  return NextResponse.json(result);
}
