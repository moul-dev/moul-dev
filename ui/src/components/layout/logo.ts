import { html } from 'lit';

/**
 * The moul.dev mark: a 2D projection of a dodecahedron. Inherits `currentColor` unless
 * `color` is given.
 */
export function logoIcon(size: number | string = 24, color = 'currentColor') {
  return html`
    <svg
      viewBox="0 0 100 100"
      width=${size}
      height=${size}
      fill=${color}
      style="display: block; flex-shrink: 0"
      aria-hidden="true"
    >
      <title>moul.dev</title>
      <!-- Center Pentagon -->
      <polygon points="80.29,50.00 65.06,73.08 35.53,66.00 35.53,34.00 65.06,26.92" />
      <!-- Right Face -->
      <polygon points="82.01,51.24 95.00,51.24 88.99,72.83 71.53,88.94 66.78,74.32" />
      <!-- Bottom Face -->
      <polygon points="64.33,75.29 69.08,89.92 43.24,94.02 17.82,80.55 34.80,68.21" />
      <!-- Bottom-Left Face -->
      <polygon points="33.04,66.00 16.06,78.34 5.00,50.00 16.06,21.66 33.04,34.00" />
      <!-- Top-Left Face -->
      <polygon points="34.80,31.79 17.82,19.45 43.24,5.98 69.08,10.08 64.33,24.71" />
      <!-- Top-Right Face -->
      <polygon points="66.78,25.68 71.53,11.06 88.99,27.17 95.00,48.76 82.01,48.76" />
    </svg>
  `;
}
