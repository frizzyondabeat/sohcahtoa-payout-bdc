"use client";

/**
 * Transactions table with server-side pagination, sorting, and filters
 */

import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useTransactionStream } from "@/hooks/use-transaction-stream";
import { TransactionDetailPanel } from "@/components/dashboard/transaction-detail-panel";
import { escapeHtml } from "@/lib/sanitize";
import { currencyFormatter } from "@/lib/utils";
import type {
  Transaction,
  TransactionListParams,
  TransactionListResponse,
} from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_PARAMS: TransactionListParams = {
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};
async function fetchTransactions(
  params: TransactionListParams,
): Promise<TransactionListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const { data } = await apiClient.get<TransactionListResponse>(
    `/api/transactions?${search}`,
  );
  return data;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskCard(last4: string | undefined): string {
  if (!last4) return "—";
  return `**** ${last4}`;
}

interface TransactionsTableProps {
  initialData?: TransactionListResponse;
  isAdmin?: boolean;
}

export function TransactionsTable({
  initialData,
  isAdmin = false,
}: TransactionsTableProps) {
  const [params, setParams] = useState<TransactionListParams>(DEFAULT_PARAMS);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useTransactionStream(true);

  const queryKey = useMemo(
    () =>
      [
        "transactions",
        params.page ?? DEFAULT_PARAMS.page,
        params.pageSize ?? DEFAULT_PARAMS.pageSize,
        params.sortBy ?? DEFAULT_PARAMS.sortBy,
        params.sortOrder ?? DEFAULT_PARAMS.sortOrder,
        params.status ?? "",
        params.dateFrom ?? "",
        params.dateTo ?? "",
      ] as const,
    [params],
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchTransactions(params),
    initialData:
      params.page === 1 &&
      params.pageSize === 10 &&
      params.sortBy === "createdAt" &&
      params.sortOrder === "desc" &&
      !params.status &&
      !params.dateFrom &&
      !params.dateTo
        ? initialData
        : undefined,
    placeholderData: (prev) => prev,
  });

  const updateParams = useCallback(
    (updates: Partial<TransactionListParams>) => {
      setParams((prev) => ({ ...prev, ...updates, page: 1 }));
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const toggleSort = useCallback(
    (column: "amount" | "createdAt" | "status" | "description") => {
      setParams((prev) => ({
        ...prev,
        sortBy: column,
        sortOrder:
          prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
        page: 1,
      }));
    },
    [],
  );

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.total / data.pageSize) : 0),
    [data],
  );

  if (isError) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-destructive mb-4">
          {String((error as Error).message)}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={params.status ?? "all"}
          onValueChange={(value) =>
            updateParams({
              status:
                value === "all" ? undefined : (value as Transaction["status"]),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="From"
          className="w-[160px]"
          value={params.dateFrom ?? ""}
          onChange={(event) =>
            updateParams({ dateFrom: event.target.value || undefined })
          }
        />
        <Input
          type="date"
          placeholder="To"
          className="w-[160px]"
          value={params.dateTo ?? ""}
          onChange={(event) =>
            updateParams({ dateTo: event.target.value || undefined })
          }
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("description")}
                    className="hover:underline"
                  >
                    Description
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("amount")}
                    className="hover:underline"
                  >
                    Amount
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="hover:underline"
                  >
                    Status
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium">Card</th>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("createdAt")}
                    className="hover:underline"
                  >
                    Date
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-t hover:bg-muted/30 cursor-pointer"
                  data-transaction-id={txn.id}
                  onClick={() => {
                    setSelectedTransaction(txn);
                    setPanelOpen(true);
                  }}
                >
                  <td className="px-4 py-3">
                    <span>{escapeHtml(txn.description)}</span>
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      txn.amount >= 0 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {txn.amount >= 0 ? "+" : ""}
                    {currencyFormatter(txn.amount, txn.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        txn.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : txn.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : txn.status === "flagged"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {escapeHtml(txn.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {maskCard(txn.cardLast4)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(txn.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.page - 1) * data.pageSize + 1}–
            {Math.min(data.page * data.pageSize, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(params.page! - 1)}
              disabled={params.page! <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(params.page! + 1)}
              disabled={params.page! >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <TransactionDetailPanel
        transaction={selectedTransaction}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        isAdmin={isAdmin}
      />
    </div>
  );
}
