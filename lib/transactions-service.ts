/**
 * Shared transaction fetching logic for API route and Server Components
 */

import type {
  Transaction,
  TransactionListParams,
  TransactionListResponse,
} from "@/types/transaction";
import {
  generateMockTransactions,
  applyOverrides,
} from "@/lib/mock-transactions";

const TRANSACTION_DATE_KEYS: Array<keyof Transaction> = ["createdAt"];

function compareValues(
  left: Transaction[keyof Transaction],
  right: Transaction[keyof Transaction],
  sortBy: keyof Transaction,
): number {
  if (TRANSACTION_DATE_KEYS.includes(sortBy)) {
    return new Date(String(left)).getTime() - new Date(String(right)).getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right));
}

export async function getTransactions(
  params: TransactionListParams,
): Promise<TransactionListResponse> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    dateFrom,
    dateTo,
  } = params;

  const fromTimestamp = dateFrom ? new Date(dateFrom).getTime() : null;
  const toTimestamp = dateTo ? new Date(dateTo).getTime() : null;

  const transactions = generateMockTransactions(100)
    .map(applyOverrides)
    .filter((txn) => {
      if (status && txn.status !== status) {
        return false;
      }

      if (fromTimestamp === null && toTimestamp === null) {
        return true;
      }

      const createdAtTimestamp = new Date(txn.createdAt).getTime();
      if (fromTimestamp !== null && createdAtTimestamp < fromTimestamp) {
        return false;
      }
      if (toTimestamp !== null && createdAtTimestamp > toTimestamp) {
        return false;
      }

      return true;
    });

  const total = transactions.length;
  const sortKey = sortBy as keyof Transaction;
  transactions.sort((a, b) => {
    const result = compareValues(a[sortKey], b[sortKey], sortKey);
    return sortOrder === "asc" ? result : -result;
  });

  const start = (page - 1) * pageSize;
  const data = transactions.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}
