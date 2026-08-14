import React from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getAuthToken, getStoredAdminKey } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const token = getAuthToken();
    const adminKey = getStoredAdminKey();
    if (!token && !adminKey) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
