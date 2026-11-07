/**
 * Activation handler for `<moul-button>`: `@click=${onPress(() => …)}`.
 *
 * `@moul-dev/ui` 2026.10.27 fired `press` twice per mouse click (once on pointerup, again on
 * click), which flipped toggles back and repeated mutations. The native `click` fires once for
 * mouse, touch, Enter and Space; this wrapper also skips it while the button is disabled or
 * pending, as `press` would. `@moul-dev/web-component` 1.0.0-alpha.1 presses once per activation,
 * so call sites can move back to `@press`.
 */
export function onPress<E extends Event>(handler: (event: E) => void): (event: E) => void {
  return (event) => {
    const button = event.currentTarget as { isDisabled?: boolean; isPending?: boolean } | null;
    if (button?.isDisabled || button?.isPending) return;
    handler(event);
  };
}
