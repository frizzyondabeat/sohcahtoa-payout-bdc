/**
 * JWT utilities for creating and verifying tokens (simulated backend)
 */

import { SignJWT, jwtVerify } from 'jose';
import type { TokenPayload, UserRole } from '@/types/auth';
import {
  TOKEN_EXPIRY_SECONDS,
  REFRESH_EXPIRY_SECONDS,
} from '@/lib/auth-config';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sohcahtoa-demo-secret-key-min-32-chars'
);

export async function createAccessToken(
  userId: string,
  role: UserRole
): Promise<string> {
  return new SignJWT({ role, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(SECRET);
}

export async function createRefreshToken(
  userId: string,
  role: UserRole
): Promise<string> {
  return new SignJWT({ role, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_EXPIRY_SECONDS}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
