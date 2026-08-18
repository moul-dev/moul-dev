import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useRouterState, useNavigate, Link } from '@tanstack/react-router';
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
} from '@phosphor-icons/react';
import {
  Sidebar,
  SidebarAside,
  SidebarHeader,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarDivider,
  SidebarMain,
  Badge,
  Button,
  Avatar,
} from '@moul-dev/ui';
import { Header } from './Header';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { useAuth } from '../../context/AuthContext';

const styles = stylex.create({
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    textDecoration: 'none',
    width: '100%',
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
  footerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.xs,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    overflow: 'hidden',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '0.6875rem',
    color: colors.textMuted,
    fontFamily: fonts.sans,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  main: {
    backgroundColor: colors.bgApp,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.xl,
    backgroundColor: colors.bgApp,
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

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;

  const currentSelectedKey =
    mainNavLinks.find(
      (link) => link.to !== '/' && currentPath.startsWith(link.to)
    )?.to || '/';

  const userName = user?.username || 'admin';
  const userRole = user?.role || 'Administrator';
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <Sidebar
      selectedKey={currentSelectedKey}
      onSelectionChange={(key) => navigate({ to: key })}
      variant="solid"
    >
      <SidebarAside showCollapseToggle>
        <SidebarHeader>
          <Link to="/" {...stylex.props(styles.brand)}>
            <div {...stylex.props(styles.brandIcon)}>M</div>
            <span {...stylex.props(styles.brandName)}>mould</span>
            <Badge variant="primary">ADMIN</Badge>
          </Link>
        </SidebarHeader>

        <SidebarGroup collapsible={false}>
          {mainNavLinks.map((link) => (
            <SidebarItem
              key={link.to}
              id={link.to}
              icon={link.icon}
              isSelected={currentSelectedKey === link.to}
            >
              {link.label}
            </SidebarItem>
          ))}
        </SidebarGroup>

        <SidebarDivider />

        <SidebarFooter showBorder>
          <div {...stylex.props(styles.footerContent)}>
            <div {...stylex.props(styles.userInfo)}>
              <Avatar
                initials={userInitials}
                alt={userName}
              />
              <div {...stylex.props(styles.userMeta)}>
                <span {...stylex.props(styles.userName)}>{userName}</span>
                <span {...stylex.props(styles.userRole)}>{userRole}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onPress={logout}
              aria-label="Sign Out"
            >
              <SignOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </SidebarFooter>
      </SidebarAside>

      <SidebarMain style={styles.main}>
        <Header />
        <main {...stylex.props(styles.content)}>{children}</main>
      </SidebarMain>
    </Sidebar>
  );
};



