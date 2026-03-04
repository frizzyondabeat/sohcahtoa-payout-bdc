'use client';

/**
 * Transaction detail panel - slide-over with flag and note actions
 * Optimistic updates with rollback on failure
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { escapeHtml } from '@/lib/sanitize';
import { currencyFormatter } from '@/lib/utils';
import type { Transaction, TransactionListResponse } from '@/types/transaction';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function maskCard(last4: string | undefined): string {
  if (!last4) return '—';
  return `**** ${last4}`;
}

interface TransactionDetailPanelProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}

export function TransactionDetailPanel({
  transaction,
  open,
  onOpenChange,
  isAdmin,
}: TransactionDetailPanelProps) {
  const queryClient = useQueryClient();
  const [noteValue, setNoteValue] = useState(transaction?.internalNote ?? '');

  React.useEffect(() => {
    setNoteValue(transaction?.internalNote ?? '');
  }, [transaction?.internalNote]);

  const flagMutation = useMutation({
    mutationFn: async ({
      id,
      isFlagged,
    }: {
      id: string;
      isFlagged: boolean;
    }) => {
      const { data } = await apiClient.patch(`/api/transactions/${id}/flag`, {
        isFlagged,
      });
      return data;
    },
    onMutate: async ({ id, isFlagged }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previous = queryClient.getQueriesData<TransactionListResponse>({
        queryKey: ['transactions'],
      });
      queryClient.setQueriesData<TransactionListResponse>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id
                ? { ...item, isFlagged, status: isFlagged ? 'flagged' : item.status }
                : item
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update flag');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: async ({
      id,
      internalNote,
    }: {
      id: string;
      internalNote: string;
    }) => {
      const { data } = await apiClient.patch(`/api/transactions/${id}/note`, {
        internalNote,
      });
      return data;
    },
    onMutate: async ({ id, internalNote }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previous = queryClient.getQueriesData<TransactionListResponse>({
        queryKey: ['transactions'],
      });
      queryClient.setQueriesData<TransactionListResponse>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, internalNote } : item
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to save note');
    },
    onSuccess: () => {
      toast.success('Note saved');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  if (!transaction) return null;

  const handleFlag = () => {
    const next = !transaction.isFlagged;
    flagMutation.mutate({ id: transaction.id, isFlagged: next });
    if (next) toast.success('Transaction flagged');
    else toast.success('Transaction unflagged');
  };

  const handleSaveNote = () => {
    noteMutation.mutate({ id: transaction.id, internalNote: noteValue });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Transaction details</SheetTitle>
          <SheetDescription>ID: {escapeHtml(transaction.id)}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{escapeHtml(transaction.description)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p
              className={`font-semibold ${
                transaction.amount >= 0 ? 'text-green-600' : 'text-orange-600'
              }`}
            >
              {transaction.amount >= 0 ? '+' : ''}
              {currencyFormatter(transaction.amount, transaction.currency)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{escapeHtml(transaction.status)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Card</p>
            <p className="font-medium">{maskCard(transaction.cardLast4)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">
              {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>

          {isAdmin && (
            <div>
              <Button
                variant={transaction.isFlagged ? 'destructive' : 'outline'}
                onClick={handleFlag}
                disabled={flagMutation.isPending}
              >
                {transaction.isFlagged ? 'Unflag' : 'Flag transaction'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Internal note</p>
            <Textarea
              value={noteValue}
              onChange={(event) => setNoteValue(event.target.value)}
              placeholder="Add internal note..."
              rows={3}
              className="resize-none"
            />
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={noteMutation.isPending || noteValue === (transaction.internalNote ?? '')}
            >
              {noteMutation.isPending ? 'Saving...' : 'Save note'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
