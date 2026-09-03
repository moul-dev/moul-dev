import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '@moul-dev/ui/tokens.stylex';

const styles = stylex.create({
  logoWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    textDecoration: 'none',
    color: tokens.colorFg,
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: tokens.colorFg,
  },
  brandText: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    letterSpacing: '-0.025em',
    whiteSpace: 'nowrap',
  },
});

export interface LogoIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

/**
 * LogoIcon renders the mathematical 2D dodecahedron projection of the moul.dev logo.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 24,
  color = 'currentColor',
  style,
  ...props
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill={color}
    style={{ display: 'block', flexShrink: 0, ...style }}
    aria-hidden="true"
    {...props}
  >
    <title>moul.dev</title>
    {/* Center Pentagon */}
    <polygon points="80.29,50.00 65.06,73.08 35.53,66.00 35.53,34.00 65.06,26.92" />
    {/* Right Face */}
    <polygon points="82.01,51.24 95.00,51.24 88.99,72.83 71.53,88.94 66.78,74.32" />
    {/* Bottom Face */}
    <polygon points="64.33,75.29 69.08,89.92 43.24,94.02 17.82,80.55 34.80,68.21" />
    {/* Bottom-Left Face */}
    <polygon points="33.04,66.00 16.06,78.34 5.00,50.00 16.06,21.66 33.04,34.00" />
    {/* Top-Left Face */}
    <polygon points="34.80,31.79 17.82,19.45 43.24,5.98 69.08,10.08 64.33,24.71" />
    {/* Top-Right Face */}
    <polygon points="66.78,25.68 71.53,11.06 88.99,27.17 95.00,48.76 82.01,48.76" />
  </svg>
);

export interface LogoProps {
  size?: number | string;
  text?: string;
  iconOnly?: boolean;
  badge?: React.ReactNode;
  style?: stylex.StyleXStyles;
}

export const Logo: React.FC<LogoProps> = ({
  size = 24,
  text = 'moul',
  iconOnly = false,
  badge,
  style,
}) => {
  const iconElement = <LogoIcon size={size} />;

  if (iconOnly) {
    return (
      <div {...stylex.props(styles.icon, style)}>
        {iconElement}
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.logoWrapper, style)}>
      <div {...stylex.props(styles.icon)}>{iconElement}</div>
      {text && <span {...stylex.props(styles.brandText)}>{text}</span>}
      {badge}
    </div>
  );
};
