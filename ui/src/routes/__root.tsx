import React from 'react';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Button } from '@moul-dev/ui';
import { AuthProvider } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme/tokens.stylex';

const styles = stylex.create({
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: colors.bgApp,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: spacing.xl,
    backgroundColor: colors.bgApp,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    textAlign: 'center',
  },
});

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: () => (
    <div {...stylex.props(styles.loading)}>
      <span>Loading mould console...</span>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div {...stylex.props(styles.errorContainer)}>
      <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Console Application Error</h2>
      <p style={{ color: '#94a3b8', maxWidth: '600px', marginBottom: '1.5rem' }}>
        {error.message || 'An unexpected error occurred in the admin console.'}
      </p>
      <Button
        variant="primary"
        onPress={() => window.location.reload()}
      >
        Reload Console
      </Button>
    </div>
  ),
});

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      {process.env.NODE_ENV === 'development' && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )}
    </AuthProvider>
  );
}
