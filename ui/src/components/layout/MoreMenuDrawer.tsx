import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  QueueIcon,
  FlagIcon,
  GearIcon,
  BookOpenIcon,
  UserGearIcon,
  SignOutIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import {
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  Avatar,
  Badge,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { useTheme } from '../../context/ThemeContext';

const styles = stylex.create({
  overlay: {
    zIndex: 100,
  },
  dialog: {
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    backgroundColor: tokens.colorBg,
    borderColor: tokens.colorBorderSubtle,
    maxHeight: '85vh',
  },
  handleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '10px',
    paddingBottom: '4px',
    width: '100%',
  },
  handle: {
    width: '40px',
    height: '4px',
    borderRadius: '9999px',
    backgroundColor: tokens.colorBorder,
  },
  drawerHeader: {
    paddingInline: tokens.spacing4,
    paddingBlock: tokens.spacing2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorBorderSubtle,
  },
  drawerTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    padding: tokens.spacing4,
    overflowY: 'auto',
    paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing3,
    padding: tokens.spacing3,
    borderRadius: tokens.radiusLg,
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
    minWidth: 0,
    flex: 1,
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  userNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  userName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: tokens.colorFg,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userSub: {
    fontSize: '0.75rem',
    color: tokens.colorFgSubtle,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: tokens.colorFgSubtle,
    marginTop: tokens.spacing1,
    marginBottom: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacing2,
  },
  navCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    padding: tokens.spacing3,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    backgroundColor: {
      default: tokens.colorBgSubtle,
      ':hover': tokens.colorBgElevated,
      ':active': tokens.colorBgElevated,
    },
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    outline: 'none',
    boxSizing: 'border-box',
    textDecoration: 'none',
  },
  navCardActive: {
    borderColor: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgElevated,
  },
  navCardIconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBg,
    color: tokens.colorFg,
    marginBottom: '2px',
  },
  navCardIconWrapperActive: {
    backgroundColor: tokens.colorPrimary500,
    color: tokens.colorFgOnPrimary,
  },
  navCardTitle: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: tokens.colorFg,
  },
  navCardSub: {
    fontSize: '0.6875rem',
    color: tokens.colorFgSubtle,
    lineHeight: 1.2,
  },
  settingsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing3,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  settingsRowLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: tokens.colorFg,
  },
  themeLabelIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorFgSubtle,
  },
  divider: {
    height: '1px',
    backgroundColor: tokens.colorBorderSubtle,
    marginBlock: tokens.spacing1,
  },
  signOutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing2,
    paddingBlock: tokens.spacing3,
    paddingInline: tokens.spacing4,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorAlertBorderError,
    backgroundColor: {
      default: tokens.colorAlertBgError,
      ':hover': tokens.colorAlertHoverError,
      ':active': tokens.colorAlertActiveError,
    },
    color: tokens.colorError500,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
});

interface SecondaryNavItem {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const secondaryNavItems: SecondaryNavItem[] = [
  {
    to: '/workers',
    label: 'Worker Queue',
    description: 'Background tasks & jobs',
    icon: <QueueIcon size={18} />,
  },
  {
    to: '/flags',
    label: 'Feature Flags',
    description: 'Toggles & rollouts',
    icon: <FlagIcon size={18} />,
  },
  {
    to: '/settings',
    label: 'Settings',
    description: 'System config & keys',
    icon: <GearIcon size={18} />,
  },
  {
    to: '/docs',
    label: 'API Reference',
    description: 'OpenAPI & endpoints',
    icon: <BookOpenIcon size={18} />,
  },
];

export interface MoreMenuDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentPath: string;
  displayName: string;
  displayUsername: string;
  displayEmail: string;
  userInitials: string;
  hasCustomName: boolean;
  onNavigate: (to: string, search?: Record<string, any>) => void;
  onLogout: () => void;
}

export const MoreMenuDrawer: React.FC<MoreMenuDrawerProps> = ({
  isOpen,
  onOpenChange,
  currentPath,
  displayName,
  displayUsername,
  displayEmail,
  userInitials,
  hasCustomName,
  onNavigate,
  onLogout,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <DrawerOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      placement="bottom"
      size="lg"
      style={styles.overlay}
    >
      <Drawer placement="bottom" size="lg" style={styles.dialog}>
        <DrawerDialog>
          {/* iOS / Instagram style drag indicator */}
          <div {...stylex.props(styles.handleContainer)}>
            <div {...stylex.props(styles.handle)} />
          </div>

          <DrawerHeader style={styles.drawerHeader}>
            <DrawerTitle style={styles.drawerTitle}>Menu & System Tools</DrawerTitle>
            <DrawerCloseButton aria-label="Close menu" />
          </DrawerHeader>

          <DrawerBody style={styles.body}>
            {/* User Profile Card */}
            <div {...stylex.props(styles.userCard)}>
              <div {...stylex.props(styles.userInfo)}>
                <Avatar initials={userInitials} alt={displayName} size="md" />
                <div {...stylex.props(styles.userMeta)}>
                  <div {...stylex.props(styles.userNameRow)}>
                    <span {...stylex.props(styles.userName)}>{displayName}</span>
                    <Badge variant="primary" size="sm">ROOT</Badge>
                  </div>
                  <span {...stylex.props(styles.userSub)}>
                    {hasCustomName
                      ? `@${displayUsername}${displayEmail ? ` • ${displayEmail}` : ''}`
                      : (displayEmail ? `${displayEmail} (@${displayUsername})` : `@${displayUsername}`)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Account Settings"
                onPress={() => {
                  onOpenChange(false);
                  onNavigate('/settings', { tab: 'account' });
                }}
              >
                <UserGearIcon size={18} />
              </Button>
            </div>

            {/* System Tools Grid */}
            <div>
              <div {...stylex.props(styles.sectionTitle)}>System Modules</div>
              <div {...stylex.props(styles.grid)}>
                {secondaryNavItems.map((item) => {
                  const isActive = currentPath.startsWith(item.to);
                  return (
                    <button
                      key={item.to}
                      type="button"
                      {...stylex.props(
                        styles.navCard,
                        isActive && styles.navCardActive
                      )}
                      onClick={() => {
                        onOpenChange(false);
                        onNavigate(item.to);
                      }}
                    >
                      <div
                        {...stylex.props(
                          styles.navCardIconWrapper,
                          isActive && styles.navCardIconWrapperActive
                        )}
                      >
                        {item.icon}
                      </div>
                      <span {...stylex.props(styles.navCardTitle)}>{item.label}</span>
                      <span {...stylex.props(styles.navCardSub)}>{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Settings Row */}
            <div>
              <div {...stylex.props(styles.sectionTitle)}>Preferences</div>
              <div {...stylex.props(styles.settingsRow)}>
                <div {...stylex.props(styles.settingsRowLabel)}>
                  <span {...stylex.props(styles.themeLabelIcon)}>
                    <SunIcon size={18} />
                  </span>
                  <span>Theme</span>
                </div>
                <ToggleButtonGroup
                  animated
                  size="sm"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={[theme]}
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
                  <ToggleButton id="light" isIcon aria-label="Light Theme">
                    <SunIcon size={14} weight={theme === 'light' ? 'fill' : 'regular'} />
                  </ToggleButton>
                  <ToggleButton id="dark" isIcon aria-label="Dark Theme">
                    <MoonIcon size={14} weight={theme === 'dark' ? 'fill' : 'regular'} />
                  </ToggleButton>
                  <ToggleButton id="system" isIcon aria-label="System Theme">
                    <DesktopIcon size={14} weight={theme === 'system' ? 'fill' : 'regular'} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>

            <div {...stylex.props(styles.divider)} />

            {/* Sign Out Button */}
            <button
              type="button"
              {...stylex.props(styles.signOutButton)}
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
            >
              <SignOutIcon size={18} weight="bold" />
              <span>Sign Out</span>
            </button>
          </DrawerBody>
        </DrawerDialog>
      </Drawer>
    </DrawerOverlay>
  );
};
