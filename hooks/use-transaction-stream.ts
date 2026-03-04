"use client";

/**
 * SSE hook for real-time transaction updates
 * Merges updates into React Query cache without full re-render, prevents duplicates
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Transaction, TransactionListResponse } from "@/types/transaction";

const STREAM_URL = "/api/transactions/stream";
const RECONNECT_DELAY_MS = 3000;
const MAX_SEEN_TRANSACTION_IDS = 1000;

type TransactionsQueryKey = readonly [
  "transactions",
  number,
  number,
  string,
  "asc" | "desc",
  string,
  string,
  string,
];

function isTransactionsQueryKey(
  queryKey: readonly unknown[],
): queryKey is TransactionsQueryKey {
  return queryKey.length >= 8 && queryKey[0] === "transactions";
}

function matchesFilters(
  txn: Transaction,
  statusFilter: string,
  dateFrom: string,
  dateTo: string,
) {
  if (statusFilter && txn.status !== statusFilter) {
    return false;
  }

  const timestamp = new Date(txn.createdAt).getTime();
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    if (timestamp < from) {
      return false;
    }
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime();
    if (timestamp > to) {
      return false;
    }
  }

  return true;
}

export function useTransactionStream(enabled: boolean) {
  const queryClient = useQueryClient();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      const eventSource = new EventSource(STREAM_URL);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("transaction", (event) => {
        try {
          const txn = JSON.parse((event as MessageEvent).data) as Transaction;
          if (seenIdsRef.current.has(txn.id)) return;
          seenIdsRef.current.add(txn.id);
          if (seenIdsRef.current.size > MAX_SEEN_TRANSACTION_IDS) {
            seenIdsRef.current.clear();
            seenIdsRef.current.add(txn.id);
          }

          const transactionsQueries =
            queryClient.getQueriesData<TransactionListResponse>({
              queryKey: ["transactions"],
            });

          transactionsQueries.forEach(([queryKey, old]) => {
            if (
              !old ||
              !Array.isArray(queryKey) ||
              !isTransactionsQueryKey(queryKey)
            ) {
              return;
            }

            const [, , , sortBy, sortOrder, statusFilter, dateFrom, dateTo] =
              queryKey;
            const matches = matchesFilters(txn, statusFilter, dateFrom, dateTo);
            const existingIndex = old.data.findIndex(
              (item) => item.id === txn.id,
            );

            if (existingIndex >= 0) {
              if (!matches) {
                queryClient.setQueryData<TransactionListResponse>(queryKey, {
                  ...old,
                  data: old.data.filter((item) => item.id !== txn.id),
                  total: Math.max(0, old.total - 1),
                });
                return;
              }

              const nextData = [...old.data];
              nextData[existingIndex] = txn;
              queryClient.setQueryData<TransactionListResponse>(queryKey, {
                ...old,
                data: nextData,
              });
              return;
            }

            if (!matches) {
              return;
            }

            const isAppendableToCurrentList =
              old.page === 1 && sortBy === "createdAt" && sortOrder === "desc";

            if (isAppendableToCurrentList) {
              queryClient.setQueryData<TransactionListResponse>(queryKey, {
                ...old,
                data: [txn, ...old.data].slice(0, old.pageSize),
                total: old.total + 1,
              });
              return;
            }

            queryClient.setQueryData<TransactionListResponse>(queryKey, {
              ...old,
              total: old.total + 1,
            });
          });
        } catch {}
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        if (!isUnmounted) {
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [enabled, queryClient]);
}
