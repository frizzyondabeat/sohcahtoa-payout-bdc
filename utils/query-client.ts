import { isServer, QueryClient } from '@tanstack/react-query';

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const initializeQueryClient = (): QueryClient =>
  isServer ? createQueryClient() : (browserQueryClient ??= createQueryClient());
