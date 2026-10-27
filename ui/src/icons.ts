import { css, html, LitElement, nothing } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

// Phosphor icons as raw SVG strings: only the icons and weights listed here are bundled.
// Add an import and a REGISTRY entry when a page needs a new icon or weight.
import arrowRight from '@phosphor-icons/core/regular/arrow-right.svg?raw';
import arrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg?raw';
import arrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg?raw';
import bookOpen from '@phosphor-icons/core/regular/book-open.svg?raw';
import broadcast from '@phosphor-icons/core/regular/broadcast.svg?raw';
import broadcastBold from '@phosphor-icons/core/bold/broadcast-bold.svg?raw';
import broadcastFill from '@phosphor-icons/core/fill/broadcast-fill.svg?raw';
import caretDown from '@phosphor-icons/core/regular/caret-down.svg?raw';
import chartLineUp from '@phosphor-icons/core/regular/chart-line-up.svg?raw';
import chartLineUpFill from '@phosphor-icons/core/fill/chart-line-up-fill.svg?raw';
import clock from '@phosphor-icons/core/regular/clock.svg?raw';
import compass from '@phosphor-icons/core/regular/compass.svg?raw';
import cpu from '@phosphor-icons/core/regular/cpu.svg?raw';
import database from '@phosphor-icons/core/regular/database.svg?raw';
import databaseFill from '@phosphor-icons/core/fill/database-fill.svg?raw';
import desktop from '@phosphor-icons/core/regular/desktop.svg?raw';
import desktopFill from '@phosphor-icons/core/fill/desktop-fill.svg?raw';
import dotsThreeOutlineVertical from '@phosphor-icons/core/regular/dots-three-outline-vertical.svg?raw';
import dotsThreeOutlineVerticalFill from '@phosphor-icons/core/fill/dots-three-outline-vertical-fill.svg?raw';
import flag from '@phosphor-icons/core/regular/flag.svg?raw';
import gear from '@phosphor-icons/core/regular/gear.svg?raw';
import globe from '@phosphor-icons/core/regular/globe.svg?raw';
import hardDrives from '@phosphor-icons/core/regular/hard-drives.svg?raw';
import listBullets from '@phosphor-icons/core/regular/list-bullets.svg?raw';
import moon from '@phosphor-icons/core/regular/moon.svg?raw';
import moonFill from '@phosphor-icons/core/fill/moon-fill.svg?raw';
import moonDuotone from '@phosphor-icons/core/duotone/moon-duotone.svg?raw';
import play from '@phosphor-icons/core/regular/play.svg?raw';
import plus from '@phosphor-icons/core/regular/plus.svg?raw';
import pulse from '@phosphor-icons/core/regular/pulse.svg?raw';
import queue from '@phosphor-icons/core/regular/queue.svg?raw';
import shieldCheckFill from '@phosphor-icons/core/fill/shield-check-fill.svg?raw';
import signOut from '@phosphor-icons/core/regular/sign-out.svg?raw';
import signOutBold from '@phosphor-icons/core/bold/sign-out-bold.svg?raw';
import sparkleDuotone from '@phosphor-icons/core/duotone/sparkle-duotone.svg?raw';
import squaresFour from '@phosphor-icons/core/regular/squares-four.svg?raw';
import squaresFourFill from '@phosphor-icons/core/fill/squares-four-fill.svg?raw';
import stop from '@phosphor-icons/core/regular/stop.svg?raw';
import sun from '@phosphor-icons/core/regular/sun.svg?raw';
import sunFill from '@phosphor-icons/core/fill/sun-fill.svg?raw';
import sunDuotone from '@phosphor-icons/core/duotone/sun-duotone.svg?raw';
import trash from '@phosphor-icons/core/regular/trash.svg?raw';
import userGear from '@phosphor-icons/core/regular/user-gear.svg?raw';
import users from '@phosphor-icons/core/regular/users.svg?raw';
import warningCircle from '@phosphor-icons/core/regular/warning-circle.svg?raw';
import x from '@phosphor-icons/core/regular/x.svg?raw';

export type IconWeight = 'regular' | 'bold' | 'fill' | 'duotone';

const REGISTRY: Record<string, Partial<Record<IconWeight, string>>> = {
  'arrow-right': { regular: arrowRight },
  'arrow-square-out': { regular: arrowSquareOut },
  'arrows-clockwise': { regular: arrowsClockwise },
  'book-open': { regular: bookOpen },
  broadcast: { regular: broadcast, bold: broadcastBold, fill: broadcastFill },
  'caret-down': { regular: caretDown },
  'chart-line-up': { regular: chartLineUp, fill: chartLineUpFill },
  clock: { regular: clock },
  compass: { regular: compass },
  cpu: { regular: cpu },
  database: { regular: database, fill: databaseFill },
  desktop: { regular: desktop, fill: desktopFill },
  'dots-three-outline-vertical': { regular: dotsThreeOutlineVertical, fill: dotsThreeOutlineVerticalFill },
  flag: { regular: flag },
  gear: { regular: gear },
  globe: { regular: globe },
  'hard-drives': { regular: hardDrives },
  'list-bullets': { regular: listBullets },
  moon: { regular: moon, fill: moonFill, duotone: moonDuotone },
  play: { regular: play },
  plus: { regular: plus },
  pulse: { regular: pulse },
  queue: { regular: queue },
  'shield-check': { fill: shieldCheckFill },
  'sign-out': { regular: signOut, bold: signOutBold },
  sparkle: { duotone: sparkleDuotone },
  'squares-four': { regular: squaresFour, fill: squaresFourFill },
  stop: { regular: stop },
  sun: { regular: sun, fill: sunFill, duotone: sunDuotone },
  trash: { regular: trash },
  'user-gear': { regular: userGear },
  users: { regular: users },
  'warning-circle': { regular: warningCircle },
  x: { regular: x },
};

/**
 * `<admin-icon name="database" size="18" weight="fill">` renders a Phosphor icon in
 * `currentColor`. Set `color` to tint it. Icons are decorative (`aria-hidden`); label
 * the control that contains them instead.
 */
export class AdminIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      flex-shrink: 0;
      inline-size: var(--_size, 1em);
      block-size: var(--_size, 1em);
      color: var(--_color, currentColor);
      line-height: 0;
    }
    svg {
      inline-size: 100%;
      block-size: 100%;
    }
  `;

  static override properties = {
    name: { type: String },
    size: { type: Number },
    weight: { type: String },
    color: { type: String },
  };

  declare name: string;
  declare size: number | undefined;
  declare weight: IconWeight;
  declare color: string;

  constructor() {
    super();
    this.name = '';
    this.size = undefined;
    this.weight = 'regular';
    this.color = '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  override willUpdate(): void {
    this.style.setProperty('--_size', this.size ? `${this.size}px` : null);
    this.style.setProperty('--_color', this.color || null);
  }

  override render() {
    const weights = REGISTRY[this.name];
    const source = weights?.[this.weight] ?? weights?.regular;
    if (!source) {
      if (import.meta.env.DEV) console.warn(`<admin-icon>: "${this.name}" (${this.weight}) is not registered in src/icons.ts`);
      return nothing;
    }
    return html`${unsafeSVG(source)}`;
  }
}

if (!customElements.get('admin-icon')) customElements.define('admin-icon', AdminIcon);

declare global {
  interface HTMLElementTagNameMap {
    'admin-icon': AdminIcon;
  }
}
