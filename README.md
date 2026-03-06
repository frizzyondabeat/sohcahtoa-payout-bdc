# SohCahToa Payout BDC — Transaction Monitoring Dashboard

A secure fintech transaction monitoring admin dashboard built with Next.js (App Router), TypeScript, and simulated backend via Route Handlers.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with any email and password `password123`. Use `admin@sohcahtoa.com` for admin role (flag transactions).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS, shadcn/ui
- TanStack Query, Zustand
- jose (JWT), zod (validation)

## Architecture

### Auth Flow

- **Login** (`/auth/login`): Client form → POST `/api/auth/login` → HTTP-only cookies set
- **Middleware**: Protects `/dashboard/*`; redirects unauthenticated users to `/auth/login`
- **Token refresh**: `/api/auth/refresh` issues new access + refresh tokens; client uses `fetchWithAuth` which intercepts 401, triggers refresh, retries

### Token Refresh Race Conditions

To prevent multiple simultaneous refresh calls:

1. **Client (`hooks/use-auth.ts`)**: A single `refreshPromise` is shared. When a 401 occurs, `doRefresh()` is called. If a refresh is already in flight, subsequent 401 handlers await the same promise instead of starting new requests. The lock is cleared after the refresh completes or fails.
2. **Server (`/api/auth/refresh`)**: An in-memory `refreshPromise` ensures concurrent refresh requests from the same session are coalesced into one token issuance. (For multi-instance production, use a distributed lock.)

### Server vs Client Components

- **Server Components**: Auth check and initial data on `/dashboard/transactions`, layout, static shell
- **Client Components**: Login form, transactions table (filters, pagination, sort), detail panel (flag, note), sidebar

### Route Handlers

- Typed request/response
- Input validation via zod
- Normalized error shape: `{ message, code }`

### Caching Strategy

- Transactions API: `dynamic = 'force-dynamic'` — real-time data must not be cached
- Auth endpoints: dynamic
- Static pages: `/`, `/auth/login` pre-rendered

### Middleware Limitations

- Runs on the Edge runtime: no Node.js APIs, limited crypto
- Token validation in middleware is minimal (cookie presence only); full JWT verification happens in Route Handlers
- Redirects use `NextResponse.redirect()` with a safe internal path

## Security

### XSS Mitigation

- All user-supplied and API-sourced content is escaped via `escapeHtml()` (lib/sanitize.ts) before render
- No `dangerouslySetInnerHTML` for transaction data
- One mock transaction contains `<script>alert("xss")</script>` — it renders as escaped text and does not execute

### Session Handling

- On token expiry or refresh failure: `fetchWithAuth` calls `logout()` → POST `/api/auth/logout` → cookies cleared → `window.location.href = '/auth/login'`
- In-flight requests are abandoned on redirect; no tokens are logged

### CSRF Mitigation

- Auth cookies use `sameSite: 'lax'` and `httpOnly: true`
- `sameSite: 'lax'` blocks cross-site POST requests from other origins; GET is allowed for top-level navigation (e.g. links)
- For stricter protection, add a CSRF token to mutation routes and validate it server-side

### Sensitive Data

- Card numbers masked as `**** 1234` in the UI
- Tokens stored only in HTTP-only cookies; never exposed to client JavaScript
- No sensitive data in logs or error messages

## Features

- **Transactions dashboard**: Server-side pagination, sorting, filters (status, date range)
- **Real-time updates**: SSE stream (`/api/transactions/stream`) pushes new transactions; merged into React Query cache without full re-render
- **Detail panel**: Click a row → slide-over with transaction details
- **Admin actions**: Flag (admin only), add internal note; optimistic UI with rollback on failure
- **Role-based access**: `admin` can flag; `analyst` can add notes

## Project Structure

```
app/
  api/
    auth/           # login, refresh, logout, me
    transactions/   # list, stream, [id]/flag, [id]/note
  auth/login/
  dashboard/
    home/
    transactions/
lib/
  auth-config.ts
  jwt.ts
  mock-transactions.ts
  sanitize.ts
  transactions-service.ts
types/
  auth.ts
  transaction.ts
hooks/
  use-auth.ts
  use-transaction-stream.ts
components/
  dashboard/
    transactions-table.tsx
    transaction-detail-panel.tsx
proxy.ts # middleware
```
