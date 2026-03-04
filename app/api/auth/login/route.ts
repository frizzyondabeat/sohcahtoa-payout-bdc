/**
 * POST /api/auth/login - Authenticate user and set HTTP-only cookies
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import {
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
  AUTH_COOKIE_USER,
  TOKEN_EXPIRY_SECONDS,
  REFRESH_EXPIRY_SECONDS,
} from "@/lib/auth-config";
import type { LoginResponse, User } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Simulated credentials - any email + "password123" works */
const MOCK_PASSWORD = "password123";

function simulateUserLookup(email: string): User | null {
  const normalized = email.toLowerCase().trim();
  const isAdmin = normalized === "admin@sohcahtoa.com";
  return {
    id: `user_${Date.now()}`,
    role: isAdmin ? "admin" : "analyst",
    email: normalized,
    name: email.split("@")[0],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email or password", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }
    const { email, password } = parsed.data;

    if (password !== MOCK_PASSWORD) {
      return NextResponse.json(
        { message: "Invalid credentials", code: "AUTH_FAILED" },
        { status: 401 },
      );
    }

    const user = simulateUserLookup(email);
    if (!user) {
      return NextResponse.json(
        { message: "User not found", code: "AUTH_FAILED" },
        { status: 401 },
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(user.id, user.role),
      createRefreshToken(user.id, user.role),
    ]);

    const response = NextResponse.json({
      expiresIn: TOKEN_EXPIRY_SECONDS,
      user,
    } satisfies LoginResponse);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set(AUTH_COOKIE_ACCESS, accessToken, {
      ...cookieOptions,
      maxAge: TOKEN_EXPIRY_SECONDS,
    });
    response.cookies.set(AUTH_COOKIE_REFRESH, refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRY_SECONDS,
    });
    response.cookies.set(AUTH_COOKIE_USER, JSON.stringify(user), {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRY_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
