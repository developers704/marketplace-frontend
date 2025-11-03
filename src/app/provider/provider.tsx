'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function Providers({ children }: React.PropsWithChildren) {
  const queryClientRef = React.useRef<any>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default Providers;
