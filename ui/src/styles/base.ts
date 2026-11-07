import { css } from 'lit';

/**
 * Include first in every console element's `styles`: document CSS (index.css) does not reach
 * into shadow roots, so the border-box sizing the StyleX build relied on is restated here.
 */
export const baseStyles = css`
  :host {
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
