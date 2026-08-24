import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useRouterState, useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  SquaresFourIcon,
  DatabaseIcon,
  BroadcastIcon,
  ChartLineUpIcon,
  QueueIcon,
  FlagIcon,
  GearIcon,
  BookOpenIcon,
  UserGearIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  SignOutIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import {
  Sidebar,
  SidebarAside,
  SidebarHeader,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarMain,
  Avatar,
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverDialog,
  ToggleButtonGroup,
  ToggleButton,
} from '@moul-dev/ui';
import { Header } from './Header';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';
import { LogoIcon } from './Logo';

const styles = stylex.create({
  footer: {
    paddingBlock: '4px',
    paddingInline: tokens.spacing2,
    minHeight: '38px',
    display: 'flex',
    alignItems: 'center',
  },
  footerCollapsed: {
    paddingInline: 0,
    justifyContent: 'center',
  },
  footerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 0,
    minHeight: 'auto',
  },
  footerContentCollapsed: {
    justifyContent: 'center',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: tokens.colorFg,
    flexShrink: 0,
    padding: '2px',
    borderRadius: tokens.radiusMd,
    lineHeight: 1,
  },
  userTrigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing2,
    paddingBlock: tokens.spacing2,
    paddingInline: tokens.spacing3,
    height: '36px',
    borderRadius: tokens.radiusMd,
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.colorBgSubtle,
    },
    color: tokens.colorFg,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 'normal',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
  userTriggerCollapsed: {
    paddingInline: 0,
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  },
  userInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
    minWidth: 0,
    overflow: 'hidden',
    flex: 1,
  },
  userTriggerName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  popover: {
    minWidth: '240px',
    maxWidth: '260px',
    backgroundColor: tokens.colorBg,
    borderRadius: tokens.radiusLg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
    padding: '6px',
    outline: 'none',
    zIndex: 1000,
  },
  popoverDialog: {
    outline: 'none',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  menuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    paddingBlock: '6px',
    paddingInline: '8px',
  },
  menuHeaderMeta: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    flex: 1,
    gap: '2px',
  },
  menuHeaderNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
    minWidth: 0,
  },
  menuHeaderName: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  menuHeaderSub: {
    fontSize: '0.6875rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: tokens.colorBorderSubtle,
    marginBlock: '4px',
    marginInline: '4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    paddingBlock: '7px',
    paddingInline: '8px',
    borderRadius: tokens.radiusMd,
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.colorBgSubtle,
    },
    color: tokens.colorFg,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.8125rem',
    fontWeight: 500,
    fontFamily: tokens.fontFamilyBase,
    transition: 'background-color 0.15s ease',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  menuItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: tokens.colorFgSubtle,
  },
  menuItemLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    flex: 1,
  },
  menuItemDanger: {
    color: tokens.colorError500,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(239, 68, 68, 0.08)',
    },
  },
  menuItemIconDanger: {
    color: tokens.colorError500,
  },
  menuItemLabelDanger: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: tokens.colorError500,
    fontFamily: tokens.fontFamilyBase,
    flex: 1,
  },
  themeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: '6px',
    paddingInline: '8px',
  },
  themeRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  themeToggleGroup: {
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    borderRadius: tokens.radiusMd,
    padding: '2px',
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorFgSubtle,
    cursor: 'pointer',
    borderRadius: tokens.radiusSm,
    transition: 'all 0.15s ease',
  },
  themeToggleBtnActive: {
    color: tokens.colorFg,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
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
    paddingBlock: tokens.spacing4,
    paddingInlineStart: tokens.spacing2,
    paddingInlineEnd: tokens.spacing4,
    overflowY: 'auto',
    backgroundColor: tokens.colorBg,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
});

interface NavLinkConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const platformNavLinks: NavLinkConfig[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <SquaresFourIcon size={18} /> },
  { to: '/collections', label: 'Collections', icon: <DatabaseIcon size={18} /> },
  { to: '/realtime', label: 'Realtime Hub', icon: <BroadcastIcon size={18} /> },
  { to: '/analytics', label: 'Analytics', icon: <ChartLineUpIcon size={18} /> },
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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;

  const { data: account } = useQuery({
    queryKey: ['rootAccount'],
    queryFn: api.getRootAccount,
    staleTime: 1000 * 60 * 5,
  });

  const currentSelectedKey =
    allNavLinks.find(
      (link) => link.to !== '/' && currentPath.startsWith(link.to)
    )?.to || '/';

  const effectiveUser = account || user;
  const hasCustomName = Boolean(
    effectiveUser?.name &&
    effectiveUser.name.trim() !== '' &&
    effectiveUser.name.trim().toLowerCase() !== effectiveUser.username?.trim().toLowerCase()
  );
  const displayName = hasCustomName ? effectiveUser!.name!.trim() : (effectiveUser?.username || 'admin');
  const displayUsername = effectiveUser?.username || 'admin';
  const displayEmail = effectiveUser?.email || '';

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };
  const userInitials = getInitials(displayName || displayUsername);

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onCollapseChange={setIsCollapsed}
      selectedKey={currentSelectedKey}
      onSelectionChange={(key) => navigate({ to: key })}
      variant="solid"
      style={{ height: '100vh', width: '100vw' }}
    >
      <SidebarAside showCollapseToggle>
        <SidebarHeader>
          <PopoverTrigger>
            <Button
              variant="ghost"
              style={[styles.userTrigger, isCollapsed && styles.userTriggerCollapsed]}
              aria-label="Root User Menu"
            >
              <div {...stylex.props(styles.userInfoRow)}>
                <Avatar initials={userInitials} alt={displayName} size="sm" />
                {!isCollapsed && (
                  <span {...stylex.props(styles.userTriggerName)}>{displayName}</span>
                )}
              </div>
              {!isCollapsed && <CaretDownIcon size={12} color={tokens.colorFgSubtle} />}
            </Button>

            <Popover placement="bottom start" showArrow={false} style={styles.popover}>
              <PopoverDialog style={styles.popoverDialog}>
                {({ close }) => (
                  <div {...stylex.props(styles.menuContainer)}>
                    {/* User profile summary */}
                    <div {...stylex.props(styles.menuHeader)}>
                      <Avatar initials={userInitials} alt={displayName} />
                      <div {...stylex.props(styles.menuHeaderMeta)}>
                        <div {...stylex.props(styles.menuHeaderNameRow)}>
                          <span {...stylex.props(styles.menuHeaderName)}>{displayName}</span>
                          <Badge variant="primary">ROOT</Badge>
                        </div>
                        <span {...stylex.props(styles.menuHeaderSub)}>
                          {hasCustomName
                            ? `@${displayUsername}${displayEmail ? ` • ${displayEmail}` : ''}`
                            : (displayEmail ? `${displayEmail} (@${displayUsername})` : `@${displayUsername}`)}
                        </span>
                      </div>
                    </div>

                    <div {...stylex.props(styles.menuDivider)} />

                    {/* Account Option */}
                    <button
                      type="button"
                      {...stylex.props(styles.menuItem)}
                      onClick={() => {
                        close();
                        navigate({ to: '/settings', search: { tab: 'account' } as any });
                      }}
                    >
                      <div {...stylex.props(styles.menuItemIcon)}>
                        <UserGearIcon size={16} />
                      </div>
                      <span {...stylex.props(styles.menuItemLabel)}>Account</span>
                    </button>

                    {/* Theme Option */}
                    <div {...stylex.props(styles.themeRow)}>
                      <div {...stylex.props(styles.themeRowLeft)}>
                        <div {...stylex.props(styles.menuItemIcon)}>
                          <SunIcon size={16} />
                        </div>
                        <span>Theme</span>
                      </div>
                      <ToggleButtonGroup
                        animated
                        size="sm"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={[theme]}
                        style={styles.themeToggleGroup}
                        onSelectionChange={(keys) => {
                          if (keys instanceof Set) {
                            const selected = Array.from(keys)[0] as string;
                            if (selected === 'light' || selected === 'dark' || selected === 'system') {
                              setTheme(selected);
                            }
                          }
                        }}
                        aria-label="Theme switcher"
                      >
                        <ToggleButton
                          id="light"
                          isIcon
                          aria-label="Light Theme"
                          style={[
                            styles.themeToggleBtn,
                            theme === 'light' && styles.themeToggleBtnActive,
                          ]}
                        >
                          <SunIcon size={14} weight={theme === 'light' ? 'fill' : 'regular'} />
                        </ToggleButton>
                        <ToggleButton
                          id="dark"
                          isIcon
                          aria-label="Dark Theme"
                          style={[
                            styles.themeToggleBtn,
                            theme === 'dark' && styles.themeToggleBtnActive,
                          ]}
                        >
                          <MoonIcon size={14} weight={theme === 'dark' ? 'fill' : 'regular'} />
                        </ToggleButton>
                        <ToggleButton
                          id="system"
                          isIcon
                          aria-label="System Theme"
                          style={[
                            styles.themeToggleBtn,
                            theme === 'system' && styles.themeToggleBtnActive,
                          ]}
                        >
                          <DesktopIcon size={14} weight={theme === 'system' ? 'fill' : 'regular'} />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>

                    <div {...stylex.props(styles.menuDivider)} />

                    {/* Logout Option */}
                    <button
                      type="button"
                      {...stylex.props(styles.menuItem, styles.menuItemDanger)}
                      onClick={() => {
                        close();
                        logout();
                      }}
                    >
                      <div {...stylex.props(styles.menuItemIcon, styles.menuItemIconDanger)}>
                        <SignOutIcon size={16} />
                      </div>
                      <span {...stylex.props(styles.menuItemLabelDanger)}>Sign Out</span>
                    </button>
                  </div>
                )}
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
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

        <SidebarFooter
          showBorder
          style={[styles.footer, isCollapsed && styles.footerCollapsed]}
        >
          <div {...stylex.props(styles.footerContent, isCollapsed && styles.footerContentCollapsed)}>
            <Link to="/" {...stylex.props(styles.brand)} aria-label="moul.dev">
              <LogoIcon size={32} color={tokens.colorFg} />
            </Link>
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
