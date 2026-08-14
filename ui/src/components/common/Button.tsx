import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    fontFamily: fonts.sans,
    fontWeight: 500,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    outline: 'none',
    userSelect: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  // Sizes
  sm: {
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    fontSize: '0.75rem',
  },
  md: {
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    fontSize: '0.875rem',
  },
  lg: {
    paddingBlock: spacing.md,
    paddingInline: spacing.lg,
    fontSize: '1rem',
  },
  // Variants
  primary: {
    backgroundColor: {
      default: colors.primary,
      ':hover': colors.primaryHover,
      ':active': colors.primaryActive,
    },
    color: '#ffffff',
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: {
      default: colors.bgCard,
      ':hover': colors.bgCardHover,
      ':active': colors.bgCardActive,
    },
    color: colors.textPrimary,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCard,
      ':active': colors.bgCardHover,
    },
    color: colors.textSecondary,
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: {
      default: colors.danger,
      ':hover': '#dc2626',
      ':active': '#b91c1c',
    },
    color: '#ffffff',
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      {...stylex.props(
        styles.base,
        styles[size],
        styles[variant],
        disabled && styles.disabled
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
