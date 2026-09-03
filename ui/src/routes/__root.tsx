import React from 'react';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Button } from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { AuthProvider } from '../context/AuthContext';
import { AppDevtools } from '../devtools';
import { LogoIcon } from '../components/layout/Logo';

const styles = stylex.create({
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: tokens.colorBgSubtle,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
    gap: tokens.spacing3,
  },
  loadingIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorFg,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: tokens.spacing6,
    backgroundColor: tokens.colorBgSubtle,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
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
      <div {...stylex.props(styles.loadingIcon)}>
        <LogoIcon size={32} />
      </div>
      <span style={{ fontSize: '0.875rem' }}>Loading moul console...</span>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div {...stylex.props(styles.errorContainer)}>
      <h2 style={{ color: tokens.colorError500, marginBottom: '1rem' }}>Console Application Error</h2>
      <p style={{ color: tokens.colorFgSubtle, maxWidth: '600px', marginBottom: '1.5rem' }}>
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
      <AppDevtools />
    </AuthProvider>
  );
}

