/**
 * Activation handler for `<moul-button>`: `@click=${onPress(() => …)}`.
 *
 * `@moul-dev/ui` 2026.10.27 fires `press` twice per mouse click (once on pointerup, again on
 * click), which flips toggles back and repeats mutations. The native `click` fires once for mouse,
 * touch, Enter and Space; this wrapper also skips it while the button is disabled or pending, as
 * `press` would. Revisit once the library fixes `press`.
 */
export function onPress<E extends Event>(handler: (event: E) => void): (event: E) => void {
  return (event) => {
    const button = event.currentTarget as { isDisabled?: boolean; isPending?: boolean } | null;
    if (button?.isDisabled || button?.isPending) return;
    handler(event);
  };
}
