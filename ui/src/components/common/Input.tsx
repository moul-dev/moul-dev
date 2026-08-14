import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    width: '100%',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  input: {
    width: '100%',
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    fontSize: '0.875rem',
    fontFamily: fonts.sans,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  },
  inputFocus: {
    borderColor: {
      ':focus': colors.primary,
    },
    backgroundColor: {
      ':focus': colors.bgInputFocus,
    },
  },
  errorInput: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: '0.75rem',
    color: colors.dangerText,
    fontFamily: fonts.sans,
  },
  helperText: {
    fontSize: '0.75rem',
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
});

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div {...stylex.props(styles.wrapper)}>
      {label && (
        <label htmlFor={inputId} {...stylex.props(styles.label)}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...stylex.props(
          styles.input,
          styles.inputFocus,
          Boolean(error) && styles.errorInput
        )}
        {...props}
      />
      {error && <span {...stylex.props(styles.errorText)}>{error}</span>}
      {!error && helperText && <span {...stylex.props(styles.helperText)}>{helperText}</span>}
    </div>
  );
};
