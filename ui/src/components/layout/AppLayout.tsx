import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useRouterState, useNavigate, Link } from '@tanstack/react-router';
import {
  SquaresFourIcon,
  DatabaseIcon,
  BroadcastIcon,
  ChartLineUpIcon,
  QueueIcon,
  FlagIcon,
  GearIcon,
  BookOpenIcon,
  SignOutIcon,
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
import { LogoIcon } from './Logo';

const styles = stylex.create({
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    textDecoration: 'none',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    color: tokens.colorFg,
  },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: tokens.colorFg,
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
  { to: '/', label: 'Overview', icon: <SquaresFourIcon size={18} /> },
  { to: '/collections', label: 'Collections', icon: <DatabaseIcon size={18} /> },
  { to: '/realtime', label: 'Realtime SSE', icon: <BroadcastIcon size={18} /> },
  { to: '/analytics', label: 'Analytics & Logs', icon: <ChartLineUpIcon size={18} /> },
];

const systemNavLinks: NavLinkConfig[] = [
  { to: '/workers', label: 'Worker Queue', icon: <QueueIcon size={18} /> },
  { to: '/flags', label: 'Feature Flags', icon: <FlagIcon size={18} /> },
  { to: '/settings', label: 'Settings', icon: <GearIcon size={18} /> },
  { to: '/docs', label: 'API Reference', icon: <BookOpenIcon size={18} /> },
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
            <div {...stylex.props(styles.brandIcon)}>
              <LogoIcon size={24} />
            </div>
            <div {...stylex.props(styles.brandTextWrapper)}>
              <span {...stylex.props(styles.brandName)}>Moul</span>
              {/* <Badge variant="primary">ADMIN</Badge> */}
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
              <SignOutIcon size={16} />
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



