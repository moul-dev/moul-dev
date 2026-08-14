import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';

const styles = stylex.create({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBlock: '2px',
    paddingInline: spacing.sm,
    borderRadius: radii.full,
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: fonts.mono,
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  neutral: {
    backgroundColor: colors.bgCard,
    color: colors.textSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primaryMuted,
    color: colors.primaryText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  success: {
    backgroundColor: colors.successBg,
    color: colors.successText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warningBg,
    color: colors.warningText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.warning,
  },
  danger: {
    backgroundColor: colors.dangerBg,
    color: colors.dangerText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.danger,
  },
  info: {
    backgroundColor: colors.infoBg,
    color: colors.infoText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.info,
  },
});

interface BadgeProps {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
}) => {
  return (
    <span {...stylex.props(styles.badge, styles[variant])}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
