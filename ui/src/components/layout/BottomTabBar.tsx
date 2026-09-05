import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  SquaresFourIcon,
  DatabaseIcon,
  ChartLineUpIcon,
  BroadcastIcon,
  DotsThreeOutlineVerticalIcon,
} from '@phosphor-icons/react';
import { tokens } from '@moul-dev/ui/tokens.stylex';

const styles = stylex.create({
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    display: {
      default: 'flex',
      '@media (min-width: 768px)': 'none',
    },
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingInline: tokens.spacing2,
    backgroundColor: {
      default: 'light-dark(rgba(255, 255, 255, 0.88), rgba(11, 13, 19, 0.88))',
    },
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorBorderSubtle,
    boxSizing: 'border-box',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
  },
  tabItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    flex: 1,
    maxWidth: '72px',
    height: '46px',
    padding: '4px',
    borderRadius: tokens.radiusMd,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens.colorFgSubtle,
    cursor: 'pointer',
    textDecoration: 'none',
    outline: 'none',
    transition: 'all 0.15s ease',
    WebkitTapHighlightColor: 'transparent',
    position: 'relative',
  },
  tabItemActive: {
    color: tokens.colorPrimary500,
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '24px',
    position: 'relative',
    transition: 'transform 0.15s ease',
  },
  iconWrapperActive: {
    transform: 'scale(1.08)',
  },
  activeIndicatorDot: {
    position: 'absolute',
    top: '-2px',
    right: '2px',
    width: '5px',
    height: '5px',
    borderRadius: '9999px',
    backgroundColor: tokens.colorPrimary500,
  },
  tabLabel: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    color: 'inherit',
    transition: 'font-weight 0.15s ease',
  },
  tabLabelActive: {
    fontWeight: 600,
    color: tokens.colorPrimary500,
  },
});

export interface BottomTabBarProps {
  currentPath: string;
  onNavigate: (to: string) => void;
  onOpenMore: () => void;
  isMoreOpen?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentPath,
  onNavigate,
  onOpenMore,
  isMoreOpen = false,
}) => {
  const isOverviewActive = currentPath === '/overview' || currentPath === '/';
  const isCollectionsActive =
    currentPath.startsWith('/collections') || currentPath.startsWith('/records');
  const isAnalyticsActive = currentPath.startsWith('/analytics');
  const isRealtimeActive = currentPath.startsWith('/realtime');
  const isMoreActive =
    isMoreOpen ||
    currentPath.startsWith('/workers') ||
    currentPath.startsWith('/flags') ||
    currentPath.startsWith('/settings') ||
    currentPath.startsWith('/docs');

  const barProps = stylex.props(styles.tabBar);

  return (
    <nav
      {...barProps}
      className={`mobile-only-tabs ${barProps.className || ''}`.trim()}
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 1. Overview */}
      <button
        type="button"
        {...stylex.props(styles.tabItem, isOverviewActive && styles.tabItemActive)}
        onClick={() => onNavigate('/overview')}
        aria-label="Overview"
        aria-current={isOverviewActive ? 'page' : undefined}
      >
        <div
          {...stylex.props(
            styles.iconWrapper,
            isOverviewActive && styles.iconWrapperActive
          )}
        >
          <SquaresFourIcon
            size={22}
            weight={isOverviewActive ? 'fill' : 'regular'}
          />
        </div>
        <span
          {...stylex.props(
            styles.tabLabel,
            isOverviewActive && styles.tabLabelActive
          )}
        >
          Overview
        </span>
      </button>

      {/* 2. Collections */}
      <button
        type="button"
        {...stylex.props(styles.tabItem, isCollectionsActive && styles.tabItemActive)}
        onClick={() => onNavigate('/collections')}
        aria-label="Collections"
        aria-current={isCollectionsActive ? 'page' : undefined}
      >
        <div
          {...stylex.props(
            styles.iconWrapper,
            isCollectionsActive && styles.iconWrapperActive
          )}
        >
          <DatabaseIcon
            size={22}
            weight={isCollectionsActive ? 'fill' : 'regular'}
          />
        </div>
        <span
          {...stylex.props(
            styles.tabLabel,
            isCollectionsActive && styles.tabLabelActive
          )}
        >
          Collections
        </span>
      </button>

      {/* 3. Analytics */}
      <button
        type="button"
        {...stylex.props(styles.tabItem, isAnalyticsActive && styles.tabItemActive)}
        onClick={() => onNavigate('/analytics')}
        aria-label="Analytics"
        aria-current={isAnalyticsActive ? 'page' : undefined}
      >
        <div
          {...stylex.props(
            styles.iconWrapper,
            isAnalyticsActive && styles.iconWrapperActive
          )}
        >
          <ChartLineUpIcon
            size={22}
            weight={isAnalyticsActive ? 'fill' : 'regular'}
          />
        </div>
        <span
          {...stylex.props(
            styles.tabLabel,
            isAnalyticsActive && styles.tabLabelActive
          )}
        >
          Analytics
        </span>
      </button>

      {/* 4. Realtime */}
      <button
        type="button"
        {...stylex.props(styles.tabItem, isRealtimeActive && styles.tabItemActive)}
        onClick={() => onNavigate('/realtime')}
        aria-label="Realtime Hub"
        aria-current={isRealtimeActive ? 'page' : undefined}
      >
        <div
          {...stylex.props(
            styles.iconWrapper,
            isRealtimeActive && styles.iconWrapperActive
          )}
        >
          <BroadcastIcon
            size={22}
            weight={isRealtimeActive ? 'fill' : 'regular'}
          />
        </div>
        <span
          {...stylex.props(
            styles.tabLabel,
            isRealtimeActive && styles.tabLabelActive
          )}
        >
          Realtime
        </span>
      </button>

      {/* 5. More */}
      <button
        type="button"
        {...stylex.props(styles.tabItem, isMoreActive && styles.tabItemActive)}
        onClick={onOpenMore}
        aria-label="More navigation and system settings"
        aria-expanded={isMoreOpen}
      >
        <div
          {...stylex.props(
            styles.iconWrapper,
            isMoreActive && styles.iconWrapperActive
          )}
        >
          <DotsThreeOutlineVerticalIcon
            size={22}
            weight={isMoreActive ? 'fill' : 'regular'}
          />
          {isMoreActive && !isMoreOpen && (
            <div {...stylex.props(styles.activeIndicatorDot)} />
          )}
        </div>
        <span
          {...stylex.props(
            styles.tabLabel,
            isMoreActive && styles.tabLabelActive
          )}
        >
          More
        </span>
      </button>
    </nav>
  );
};
