/**
 * Auth types for token-based authentication flow
 */

export type UserRole = 'admin' | 'analyst';

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
}

export interface LoginResponse {
  expiresIn: number;
  user: User;
}

export interface TokenPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat: number;
  type: 'access' | 'refresh';
}
