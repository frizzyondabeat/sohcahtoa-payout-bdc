/**
 * Transactions dashboard - Server Component fetches initial data, Client handles interactivity
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { AUTH_COOKIE_ACCESS } from '@/lib/auth-config';
import { verifyToken } from '@/lib/jwt';
import { getTransactions } from '@/lib/transactions-service';

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_ACCESS)?.value;
  if (!token) redirect('/auth/login');

  const payload = await verifyToken(token);
  if (!payload) redirect('/auth/login');
  const isAdmin = payload.role === 'admin';

  const data = await getTransactions({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground">
          Monitor and manage transaction activity
        </p>
      </div>
      <TransactionsTable initialData={data} isAdmin={isAdmin} />
    </div>
  );
}
