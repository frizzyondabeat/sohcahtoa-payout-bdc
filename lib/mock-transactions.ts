/**
 * Mock transaction data for development and assessment
 * Includes one transaction with XSS payload for security testing
 */

import type { Transaction } from '@/types/transaction';

const BASE_DATE = new Date('2025-03-01');
const DESCRIPTIONS = [
  'Transfer to Ruth',
  'Wallet to wallet',
  'Transfer from Tochukwu',
  'FX Purchase - USD',
  '<script>alert("xss")</script>',
  'Card payment - Amazon',
  'PTA Transfer',
  'BTA Medical allowance',
  'International remittance',
  'Fee deduction',
];

const STATUSES = ['pending', 'completed', 'failed', 'flagged'] as const;

function idForIndex(index: number): string {
  return `txn_${index}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function generateMockTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  for (let index = 0; index < count; index++) {
    const status = STATUSES[index % STATUSES.length];
    const descIndex = index % DESCRIPTIONS.length;
    transactions.push({
      id: idForIndex(index),
      amount: Math.round((Math.random() * 2000 - 500) * 100) / 100,
      currency: 'USD',
      description: DESCRIPTIONS[descIndex],
      status,
      createdAt: addDays(BASE_DATE, -index).toISOString(),
      cardLast4: index % 3 === 0 ? `${1000 + (index % 9000)}` : undefined,
      internalNote: index % 5 === 0 ? 'Reviewed' : undefined,
      isFlagged: status === 'flagged',
    });
  }
  return transactions;
}

/** In-memory store for simulated mutations (flag, note) */
const transactionOverrides = new Map<
  string,
  Partial<Pick<Transaction, 'isFlagged' | 'internalNote' | 'status'>>
>();

export function getTransactionOverrides(id: string) {
  return transactionOverrides.get(id);
}

export function setTransactionOverride(
  id: string,
  overrides: Partial<Pick<Transaction, 'isFlagged' | 'internalNote' | 'status'>>
) {
  const existing = transactionOverrides.get(id) ?? {};
  transactionOverrides.set(id, { ...existing, ...overrides });
}

export function applyOverrides(transaction: Transaction): Transaction {
  const overrides = transactionOverrides.get(transaction.id);
  if (!overrides) return transaction;
  const filtered = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined)
  ) as Partial<Pick<Transaction, 'isFlagged' | 'internalNote' | 'status'>>;
  return { ...transaction, ...filtered };
}
