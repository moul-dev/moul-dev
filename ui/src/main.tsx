import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@moul-dev/ui/style.css';
import { ToastContainer, toastQueue } from '@moul-dev/ui';
import { AppThemeProvider } from './context/ThemeContext';
import './index.css';

// Automatically dismiss toasts after 3 seconds by default if no timeout is specified
const originalToastAdd = toastQueue.add.bind(toastQueue);
toastQueue.add = (content, options) => {
  const timeout = options?.timeout ?? (content as { timeout?: number })?.timeout ?? 3000;
  const mergedOptions = timeout > 0 ? { timeout, ...options } : { ...options };
  return originalToastAdd(content, mergedOptions);
};

// Import the auto-generated route tree
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      retry: 1,
    },
  },
});

// Set up a Router instance with basepath /_moul_
const router = createRouter({
  routeTree,
  basepath: '/_moul_',
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <ToastContainer />
          <RouterProvider router={router} />
        </AppThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

