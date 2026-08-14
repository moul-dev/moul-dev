import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useRouterState } from '@tanstack/react-router';
import { ShieldCheck, Cpu } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';

const styles = stylex.create({
  header: {
    height: '60px',
    backgroundColor: colors.bgHeader,
    backdropFilter: 'blur(8px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: spacing.xl,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: '0.875rem',
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  activePage: {
    color: colors.textPrimary,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBlock: '3px',
    paddingInline: spacing.sm,
    borderRadius: radii.full,
    fontSize: '0.75rem',
    fontFamily: fonts.mono,
    backgroundColor: colors.successBg,
    color: colors.successText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.success,
  },
  systemBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBlock: '3px',
    paddingInline: spacing.sm,
    borderRadius: radii.full,
    fontSize: '0.75rem',
    fontFamily: fonts.mono,
    backgroundColor: colors.primaryMuted,
    color: colors.primaryText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
});

export const Header: React.FC = () => {
  const routerState = useRouterState();
  const path = routerState.location.pathname;
  const segments = path.split('/').filter(Boolean);
  const currentTitle = segments.length > 0 ? segments[segments.length - 1] : 'Dashboard';

  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.breadcrumb)}>
        <span>mould</span>
        <span>/</span>
        <span {...stylex.props(styles.activePage)}>{currentTitle}</span>
      </div>

      <div {...stylex.props(styles.actions)}>
        <div {...stylex.props(styles.systemBadge)}>
          <Cpu size={14} />
          <span>Engine Online</span>
        </div>
        <div {...stylex.props(styles.badge)}>
          <ShieldCheck size={14} weight="fill" />
          <span>Root Auth</span>
        </div>
      </div>
    </header>
  );
};
