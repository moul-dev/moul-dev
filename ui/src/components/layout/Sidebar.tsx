import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  SquaresFour,
  Database,
  Broadcast,
  ChartLineUp,
  Queue,
  Flag,
  Gear,
  BookOpen,
  SignOut,
  CaretRight,
} from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { useAuth } from '../../context/AuthContext';

const styles = stylex.create({
  sidebar: {
    width: '260px',
    backgroundColor: colors.bgSidebar,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    userSelect: 'none',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBlock: spacing.lg,
    paddingInline: spacing.lg,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    textDecoration: 'none',
  },
  brandIcon: {
    width: '32px',
    height: '32px',
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    fontFamily: fonts.mono,
  },
  brandName: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    letterSpacing: '-0.025em',
  },
  badge: {
    fontSize: '0.625rem',
    paddingBlock: '2px',
    paddingInline: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
    color: colors.primary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    fontFamily: fonts.mono,
  },
  nav: {
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xxs,
    overflowY: 'auto',
    flex: 1,
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.075em',
    color: colors.textMuted,
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xxs,
    fontFamily: fonts.sans,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    borderRadius: radii.md,
    color: colors.textSecondary,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    fontFamily: fonts.sans,
    transition: 'all 0.12s ease',
  },
  navItemHover: {
    backgroundColor: {
      ':hover': colors.bgCardHover,
    },
    color: {
      ':hover': colors.textPrimary,
    },
  },
  navItemActive: {
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
    fontWeight: 600,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontFamily: fonts.sans,
    padding: spacing.xs,
    borderRadius: radii.sm,
    transition: 'color 0.15s ease',
  },
});

interface NavLinkConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const mainNavLinks: NavLinkConfig[] = [
  { to: '/', label: 'Overview', icon: <SquaresFour size={18} /> },
  { to: '/collections', label: 'Collections', icon: <Database size={18} /> },
  { to: '/realtime', label: 'Realtime SSE', icon: <Broadcast size={18} /> },
  { to: '/analytics', label: 'Analytics & Logs', icon: <ChartLineUp size={18} /> },
  { to: '/workers', label: 'Worker Queue', icon: <Queue size={18} /> },
  { to: '/flags', label: 'Feature Flags', icon: <Flag size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Gear size={18} /> },
  { to: '/docs', label: 'API Reference', icon: <BookOpen size={18} /> },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside {...stylex.props(styles.sidebar)}>
      <Link to="/" {...stylex.props(styles.brand)}>
        <div {...stylex.props(styles.brandIcon)}>M</div>
        <span {...stylex.props(styles.brandName)}>mould</span>
        <span {...stylex.props(styles.badge)}>ADMIN</span>
      </Link>

      <nav {...stylex.props(styles.nav)}>
        <div {...stylex.props(styles.sectionTitle)}>Management</div>
        {mainNavLinks.map((link) => {
          const isActive =
            link.to === '/'
              ? currentPath === '/' || currentPath === ''
              : currentPath.startsWith(link.to);

          return (
            <Link
              key={link.to}
              to={link.to}
              {...stylex.props(
                styles.navItem,
                styles.navItemHover,
                isActive && styles.navItemActive
              )}
            >
              {link.icon}
              <span style={{ flex: 1 }}>{link.label}</span>
              {isActive && <CaretRight size={14} />}
            </Link>
          );
        })}
      </nav>

      <div {...stylex.props(styles.footer)}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mould console</span>
        <button {...stylex.props(styles.logoutBtn)} onClick={logout} title="Sign Out">
          <SignOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
