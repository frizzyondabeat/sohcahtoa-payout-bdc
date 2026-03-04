/**
 * Transaction types for the admin dashboard
 */

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'flagged';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  cardLast4?: string;
  internalNote?: string;
  isFlagged?: boolean;
}

export interface TransactionListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}
