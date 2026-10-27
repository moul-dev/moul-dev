import { css, html } from 'lit';
import type { ThemeMode } from '../../state/theme';

const OPTIONS: { key: ThemeMode; icon: string; label: string }[] = [
  { key: 'light', icon: 'sun', label: 'Light Theme' },
  { key: 'dark', icon: 'moon', label: 'Dark Theme' },
  { key: 'system', icon: 'desktop', label: 'System Theme' },
];

export const themeSwitcherStyles = css`
  moul-toggle-button-group moul-toggle-button::part(button) {
    padding-inline: 6px;
  }
`;

/** Light / dark / system segmented control used in the account menu and the mobile drawer. */
export function themeSwitcher(current: ThemeMode, onChange: (theme: ThemeMode) => void) {
  return html`
    <moul-toggle-button-group
      selected-key=${current}
      aria-label="Theme switcher"
      @selectionchange=${(event: CustomEvent<{ selectedKey: string }>) => {
        const next = event.detail.selectedKey;
        if (next === 'light' || next === 'dark' || next === 'system') onChange(next);
      }}
    >
      ${OPTIONS.map(
        (option) => html`
          <moul-toggle-button value=${option.key} size="sm" aria-label=${option.label}>
            <admin-icon name=${option.icon} size="14" weight=${current === option.key ? 'fill' : 'regular'}></admin-icon>
          </moul-toggle-button>
        `,
      )}
    </moul-toggle-button-group>
  `;
}
