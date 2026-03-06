'use client';

/**
 * Login page - Client form that submits to /api/auth/login
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SohcahtoaLogo from '@/components/common/app-logo';
import { getValidRedirectPath } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Login failed');
        setIsLoading(false);
        return;
      }

      const redirectTo =
        getValidRedirectPath(searchParams.get('redirect')) ?? '/dashboard';
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-2">
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <SohcahtoaLogo className="h-20 w-full" />
          </Link>
        </div>
        <h1 className="text-center text-2xl font-semibold text-foreground">
          Sign in
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@sohcahtoa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Demo: use any email + password{" "}
            <code className="rounded bg-muted px-1">password123</code>. Admin:
            admin@sohcahtoa.com
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          SohCahToa Holdings — Frontend Assessment
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
