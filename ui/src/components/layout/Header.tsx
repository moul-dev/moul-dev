import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useRouterState, Link as RouterLink } from '@tanstack/react-router';
import { ShieldCheck, Cpu } from '@phosphor-icons/react';
import { Breadcrumbs, BreadcrumbItem, Badge, Link } from '@moul-dev/ui';
import { colors, spacing } from '../../theme/tokens.stylex';

const styles = stylex.create({
  header: {
    height: '64px',
    backgroundColor: colors.bgHeader,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: spacing.xl,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

export const Header: React.FC = () => {
  const routerState = useRouterState();
  const path = routerState.location.pathname;
  const segments = path.split('/').filter(Boolean);
  const currentTitle =
    segments.length > 0
      ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : 'Dashboard';

  return (
    <header {...stylex.props(styles.header)}>
      <Breadcrumbs aria-label="Breadcrumbs">
        <BreadcrumbItem>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Link variant="primary">mould</Link>
          </RouterLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>{currentTitle}</BreadcrumbItem>
      </Breadcrumbs>

      <div {...stylex.props(styles.actions)}>
        <Badge variant="primary">
          <span {...stylex.props(styles.badgeContent)}>
            <Cpu size={14} />
            <span>Engine Online</span>
          </span>
        </Badge>
        <Badge variant="success">
          <span {...stylex.props(styles.badgeContent)}>
            <ShieldCheck size={14} weight="fill" />
            <span>Root Auth</span>
          </span>
        </Badge>
      </div>
    </header>
  );
};


