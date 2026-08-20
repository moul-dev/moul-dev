import React from 'react';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { MoulDevtoolsPanel } from './MoulDevtoolsPanel';

export function AppDevtools() {
  return (
    <TanStackDevtools
      plugins={[
        {
          id: 'tanstack-router',
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          id: 'tanstack-query',
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          id: 'mould-inspector',
          name: 'Mould Inspector',
          render: <MoulDevtoolsPanel />,
        },
      ]}
    />
  );
}
