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
  select: {
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
    cursor: 'pointer',
  },
  selectFocus: {
    borderColor: {
      ':focus': colors.primary,
    },
  },
  errorSelect: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: '0.75rem',
    color: colors.dangerText,
    fontFamily: fonts.sans,
  },
});

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div {...stylex.props(styles.wrapper)}>
      {label && (
        <label htmlFor={selectId} {...stylex.props(styles.label)}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...stylex.props(
          styles.select,
          styles.selectFocus,
          Boolean(error) && styles.errorSelect
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span {...stylex.props(styles.errorText)}>{error}</span>}
    </div>
  );
};
