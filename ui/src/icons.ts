import { css, html, LitElement, nothing } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

// Phosphor icons as raw SVG strings: only the icons and weights listed here are bundled.
// Add an import and a REGISTRY entry when a page needs a new icon or weight.
import appleLogoFill from '@phosphor-icons/core/fill/apple-logo-fill.svg?raw';
import arrowRight from '@phosphor-icons/core/regular/arrow-right.svg?raw';
import arrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg?raw';
import arrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg?raw';
import arrowsCounterClockwise from '@phosphor-icons/core/regular/arrows-counter-clockwise.svg?raw';
import article from '@phosphor-icons/core/regular/article.svg?raw';
import bookOpen from '@phosphor-icons/core/regular/book-open.svg?raw';
import bracketsCurly from '@phosphor-icons/core/regular/brackets-curly.svg?raw';
import broadcast from '@phosphor-icons/core/regular/broadcast.svg?raw';
import broadcastBold from '@phosphor-icons/core/bold/broadcast-bold.svg?raw';
import broadcastFill from '@phosphor-icons/core/fill/broadcast-fill.svg?raw';
import calendarBlank from '@phosphor-icons/core/regular/calendar-blank.svg?raw';
import caretDown from '@phosphor-icons/core/regular/caret-down.svg?raw';
import caretLeft from '@phosphor-icons/core/regular/caret-left.svg?raw';
import caretRight from '@phosphor-icons/core/regular/caret-right.svg?raw';
import caretUp from '@phosphor-icons/core/regular/caret-up.svg?raw';
import chartLineUp from '@phosphor-icons/core/regular/chart-line-up.svg?raw';
import chartLineUpFill from '@phosphor-icons/core/fill/chart-line-up-fill.svg?raw';
import check from '@phosphor-icons/core/regular/check.svg?raw';
import checkCircle from '@phosphor-icons/core/regular/check-circle.svg?raw';
import checkCircleBold from '@phosphor-icons/core/bold/check-circle-bold.svg?raw';
import checkCircleFill from '@phosphor-icons/core/fill/check-circle-fill.svg?raw';
import clock from '@phosphor-icons/core/regular/clock.svg?raw';
import cloud from '@phosphor-icons/core/regular/cloud.svg?raw';
import cloudArrowUp from '@phosphor-icons/core/regular/cloud-arrow-up.svg?raw';
import code from '@phosphor-icons/core/regular/code.svg?raw';
import compass from '@phosphor-icons/core/regular/compass.svg?raw';
import copy from '@phosphor-icons/core/regular/copy.svg?raw';
import cpu from '@phosphor-icons/core/regular/cpu.svg?raw';
import database from '@phosphor-icons/core/regular/database.svg?raw';
import databaseFill from '@phosphor-icons/core/fill/database-fill.svg?raw';
import desktop from '@phosphor-icons/core/regular/desktop.svg?raw';
import desktopFill from '@phosphor-icons/core/fill/desktop-fill.svg?raw';
import dotsThreeOutlineVertical from '@phosphor-icons/core/regular/dots-three-outline-vertical.svg?raw';
import dotsThreeOutlineVerticalFill from '@phosphor-icons/core/fill/dots-three-outline-vertical-fill.svg?raw';
import downloadSimple from '@phosphor-icons/core/regular/download-simple.svg?raw';
import envelopeSimple from '@phosphor-icons/core/regular/envelope-simple.svg?raw';
import eye from '@phosphor-icons/core/regular/eye.svg?raw';
import file from '@phosphor-icons/core/regular/file.svg?raw';
import fileCode from '@phosphor-icons/core/regular/file-code.svg?raw';
import fileCsv from '@phosphor-icons/core/regular/file-csv.svg?raw';
import flag from '@phosphor-icons/core/regular/flag.svg?raw';
import flask from '@phosphor-icons/core/regular/flask.svg?raw';
import floppyDisk from '@phosphor-icons/core/regular/floppy-disk.svg?raw';
import funnel from '@phosphor-icons/core/regular/funnel.svg?raw';
import gauge from '@phosphor-icons/core/regular/gauge.svg?raw';
import gear from '@phosphor-icons/core/regular/gear.svg?raw';
import githubLogoFill from '@phosphor-icons/core/fill/github-logo-fill.svg?raw';
import globe from '@phosphor-icons/core/regular/globe.svg?raw';
import globeHemisphereWest from '@phosphor-icons/core/regular/globe-hemisphere-west.svg?raw';
import googleLogoBold from '@phosphor-icons/core/bold/google-logo-bold.svg?raw';
import hardDrives from '@phosphor-icons/core/regular/hard-drives.svg?raw';
import hash from '@phosphor-icons/core/regular/hash.svg?raw';
import info from '@phosphor-icons/core/regular/info.svg?raw';
import link from '@phosphor-icons/core/regular/link.svg?raw';
import linkSimple from '@phosphor-icons/core/regular/link-simple.svg?raw';
import listBullets from '@phosphor-icons/core/regular/list-bullets.svg?raw';
import listDashes from '@phosphor-icons/core/regular/list-dashes.svg?raw';
import lock from '@phosphor-icons/core/regular/lock.svg?raw';
import lockKey from '@phosphor-icons/core/regular/lock-key.svg?raw';
import moon from '@phosphor-icons/core/regular/moon.svg?raw';
import moonFill from '@phosphor-icons/core/fill/moon-fill.svg?raw';
import moonDuotone from '@phosphor-icons/core/duotone/moon-duotone.svg?raw';
import paperclip from '@phosphor-icons/core/regular/paperclip.svg?raw';
import pencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg?raw';
import play from '@phosphor-icons/core/regular/play.svg?raw';
import playFill from '@phosphor-icons/core/fill/play-fill.svg?raw';
import plus from '@phosphor-icons/core/regular/plus.svg?raw';
import plusBold from '@phosphor-icons/core/bold/plus-bold.svg?raw';
import prohibit from '@phosphor-icons/core/regular/prohibit.svg?raw';
import pulse from '@phosphor-icons/core/regular/pulse.svg?raw';
import queue from '@phosphor-icons/core/regular/queue.svg?raw';
import shareNetwork from '@phosphor-icons/core/regular/share-network.svg?raw';
import shieldCheck from '@phosphor-icons/core/regular/shield-check.svg?raw';
import shieldCheckFill from '@phosphor-icons/core/fill/shield-check-fill.svg?raw';
import signOut from '@phosphor-icons/core/regular/sign-out.svg?raw';
import signOutBold from '@phosphor-icons/core/bold/sign-out-bold.svg?raw';
import sliders from '@phosphor-icons/core/regular/sliders.svg?raw';
import sparkle from '@phosphor-icons/core/regular/sparkle.svg?raw';
import sparkleDuotone from '@phosphor-icons/core/duotone/sparkle-duotone.svg?raw';
import squaresFour from '@phosphor-icons/core/regular/squares-four.svg?raw';
import squaresFourFill from '@phosphor-icons/core/fill/squares-four-fill.svg?raw';
import stop from '@phosphor-icons/core/regular/stop.svg?raw';
import sun from '@phosphor-icons/core/regular/sun.svg?raw';
import sunFill from '@phosphor-icons/core/fill/sun-fill.svg?raw';
import sunDuotone from '@phosphor-icons/core/duotone/sun-duotone.svg?raw';
import table from '@phosphor-icons/core/regular/table.svg?raw';
import tag from '@phosphor-icons/core/regular/tag.svg?raw';
import textAa from '@phosphor-icons/core/regular/text-aa.svg?raw';
import toggleLeft from '@phosphor-icons/core/regular/toggle-left.svg?raw';
import trash from '@phosphor-icons/core/regular/trash.svg?raw';
import uploadSimple from '@phosphor-icons/core/regular/upload-simple.svg?raw';
import user from '@phosphor-icons/core/regular/user.svg?raw';
import userGear from '@phosphor-icons/core/regular/user-gear.svg?raw';
import users from '@phosphor-icons/core/regular/users.svg?raw';
import warningCircle from '@phosphor-icons/core/regular/warning-circle.svg?raw';
import x from '@phosphor-icons/core/regular/x.svg?raw';
import xCircleBold from '@phosphor-icons/core/bold/x-circle-bold.svg?raw';

export type IconWeight = 'regular' | 'bold' | 'fill' | 'duotone';

const REGISTRY: Record<string, Partial<Record<IconWeight, string>>> = {
  'apple-logo': { fill: appleLogoFill },
  'arrow-right': { regular: arrowRight },
  'arrow-square-out': { regular: arrowSquareOut },
  'arrows-clockwise': { regular: arrowsClockwise },
  'arrows-counter-clockwise': { regular: arrowsCounterClockwise },
  article: { regular: article },
  'book-open': { regular: bookOpen },
  'brackets-curly': { regular: bracketsCurly },
  broadcast: { regular: broadcast, bold: broadcastBold, fill: broadcastFill },
  'calendar-blank': { regular: calendarBlank },
  'caret-down': { regular: caretDown },
  'caret-left': { regular: caretLeft },
  'caret-right': { regular: caretRight },
  'caret-up': { regular: caretUp },
  'chart-line-up': { regular: chartLineUp, fill: chartLineUpFill },
  check: { regular: check },
  'check-circle': { regular: checkCircle, bold: checkCircleBold, fill: checkCircleFill },
  clock: { regular: clock },
  cloud: { regular: cloud },
  'cloud-arrow-up': { regular: cloudArrowUp },
  code: { regular: code },
  compass: { regular: compass },
  copy: { regular: copy },
  cpu: { regular: cpu },
  database: { regular: database, fill: databaseFill },
  desktop: { regular: desktop, fill: desktopFill },
  'dots-three-outline-vertical': { regular: dotsThreeOutlineVertical, fill: dotsThreeOutlineVerticalFill },
  'download-simple': { regular: downloadSimple },
  'envelope-simple': { regular: envelopeSimple },
  eye: { regular: eye },
  file: { regular: file },
  'file-code': { regular: fileCode },
  'file-csv': { regular: fileCsv },
  flag: { regular: flag },
  flask: { regular: flask },
  'floppy-disk': { regular: floppyDisk },
  funnel: { regular: funnel },
  gauge: { regular: gauge },
  gear: { regular: gear },
  'github-logo': { fill: githubLogoFill },
  globe: { regular: globe },
  'globe-hemisphere-west': { regular: globeHemisphereWest },
  'google-logo': { bold: googleLogoBold },
  'hard-drives': { regular: hardDrives },
  hash: { regular: hash },
  info: { regular: info },
  link: { regular: link },
  'link-simple': { regular: linkSimple },
  'list-bullets': { regular: listBullets },
  'list-dashes': { regular: listDashes },
  lock: { regular: lock },
  'lock-key': { regular: lockKey },
  moon: { regular: moon, fill: moonFill, duotone: moonDuotone },
  paperclip: { regular: paperclip },
  'pencil-simple': { regular: pencilSimple },
  play: { regular: play, fill: playFill },
  plus: { regular: plus, bold: plusBold },
  prohibit: { regular: prohibit },
  pulse: { regular: pulse },
  queue: { regular: queue },
  'share-network': { regular: shareNetwork },
  'shield-check': { regular: shieldCheck, fill: shieldCheckFill },
  'sign-out': { regular: signOut, bold: signOutBold },
  sliders: { regular: sliders },
  sparkle: { regular: sparkle, duotone: sparkleDuotone },
  'squares-four': { regular: squaresFour, fill: squaresFourFill },
  stop: { regular: stop },
  sun: { regular: sun, fill: sunFill, duotone: sunDuotone },
  table: { regular: table },
  tag: { regular: tag },
  'text-aa': { regular: textAa },
  'toggle-left': { regular: toggleLeft },
  trash: { regular: trash },
  'upload-simple': { regular: uploadSimple },
  user: { regular: user },
  'user-gear': { regular: userGear },
  users: { regular: users },
  'warning-circle': { regular: warningCircle },
  x: { regular: x },
  'x-circle': { bold: xCircleBold },
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
