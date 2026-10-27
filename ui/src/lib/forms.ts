/**
 * Restores Enter-to-submit for forms built from `<moul-text-field>`: their `<input>` sits in
 * a shadow root, outside the form, so the browser's implicit submission never fires.
 *
 *   <form @submit=${this.onSubmit} @keydown=${submitOnEnter}>
 */
export function submitOnEnter(event: KeyboardEvent): void {
  if (event.key !== 'Enter' || event.isComposing || event.defaultPrevented) return;
  if (!(event.composedPath()[0] instanceof HTMLInputElement)) return;
  event.preventDefault();
  (event.currentTarget as HTMLFormElement).requestSubmit();
}

/** Reads `value` from the `input` event of a `<moul-*>` field. */
export function fieldValue(event: Event): string {
  return (event.target as HTMLInputElement).value ?? '';
}
