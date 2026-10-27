import { html, LitElement } from 'lit';
import { onPress } from '../../lib/press';
import { StoreController } from '../../lib/store';
import { theme, type ThemeMode } from '../../state/theme';

const DETAILS: Record<ThemeMode, { icon: string; label: string; next: string }> = {
  system: { icon: 'sparkle', label: 'System', next: 'Light' },
  light: { icon: 'sun', label: 'Light', next: 'Dark' },
  dark: { icon: 'moon', label: 'Dark', next: 'System' },
};

/** Outline icon button that cycles the theme: system → light → dark. */
export class AdminThemeToggle extends LitElement {
  constructor() {
    super();
    new StoreController(this, theme);
  }

  override render() {
    const { icon, label, next } = DETAILS[theme.theme];
    const current = theme.theme === 'system' ? `System (${theme.resolvedTheme})` : label;
    return html`
      <moul-tooltip content=${label} delay="250" placement="bottom">
        <moul-button
          variant="outline"
          is-icon
          aria-label=${`Current theme: ${current}. Click to switch to ${next} mode`}
          @click=${onPress(() => theme.cycleTheme())}
        >
          <admin-icon name=${icon} weight="duotone" size="16"></admin-icon>
        </moul-button>
      </moul-tooltip>
    `;
  }
}

customElements.define('admin-theme-toggle', AdminThemeToggle);

declare global {
  interface HTMLElementTagNameMap {
    'admin-theme-toggle': AdminThemeToggle;
  }
}
