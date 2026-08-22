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
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { useAuth } from '../../context/AuthContext';

const styles = stylex.create({
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    textDecoration: 'none',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
  brandIcon: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorAlertBgAccent,
    color: tokens.colorPrimary500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    fontFamily: 'var(--font-mono, monospace)',
    flexShrink: 0,
  },
  brandTextWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  brandName: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    letterSpacing: '-0.025em',
  },
  footerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: tokens.spacing1,
    minWidth: 0,
    overflow: 'hidden',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
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
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '0.6875rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  main: {
    backgroundColor: tokens.colorBg,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBg,
  },
});

interface NavLinkConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const platformNavLinks: NavLinkConfig[] = [
  { to: '/', label: 'Overview', icon: <SquaresFour size={18} /> },
  { to: '/collections', label: 'Collections', icon: <Database size={18} /> },
  { to: '/realtime', label: 'Realtime SSE', icon: <Broadcast size={18} /> },
  { to: '/analytics', label: 'Analytics & Logs', icon: <ChartLineUp size={18} /> },
];

const systemNavLinks: NavLinkConfig[] = [
  { to: '/workers', label: 'Worker Queue', icon: <Queue size={18} /> },
  { to: '/flags', label: 'Feature Flags', icon: <Flag size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Gear size={18} /> },
  { to: '/docs', label: 'API Reference', icon: <BookOpen size={18} /> },
];

const allNavLinks = [...platformNavLinks, ...systemNavLinks];

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;

  const currentSelectedKey =
    allNavLinks.find(
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
      style={{ height: '100vh', width: '100vw' }}
    >
      <SidebarAside showCollapseToggle>
        <SidebarHeader>
          <Link to="/" {...stylex.props(styles.brand)}>
            <div {...stylex.props(styles.brandIcon)}>M</div>
            <div {...stylex.props(styles.brandTextWrapper)}>
              <span {...stylex.props(styles.brandName)}>mould</span>
              <Badge variant="primary">ADMIN</Badge>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarGroup title="Platform" collapsible defaultExpanded>
          {platformNavLinks.map((link) => (
            <SidebarItem
              key={link.to}
              id={link.to}
              icon={link.icon}
            >
              {link.label}
            </SidebarItem>
          ))}
        </SidebarGroup>

        <SidebarGroup title="System" collapsible defaultExpanded>
          {systemNavLinks.map((link) => (
            <SidebarItem
              key={link.to}
              id={link.to}
              icon={link.icon}
            >
              {link.label}
            </SidebarItem>
          ))}
        </SidebarGroup>

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



