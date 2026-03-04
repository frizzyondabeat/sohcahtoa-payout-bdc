"use client";

import { initializeQueryClient } from "@/utils/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React, { FC, PropsWithChildren } from "react";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (module) => module.ReactQueryDevtools,
    ),
  { ssr: false },
);

const QueryProvider: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = initializeQueryClient();
  const showDevtools = process.env.NODE_ENV !== "production";

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools ? (
        <ReactQueryDevtools initialIsOpen={false} position="left" />
      ) : null}
    </QueryClientProvider>
  );
};
export default QueryProvider;
