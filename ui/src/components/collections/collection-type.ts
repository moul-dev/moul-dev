import { html } from 'lit';

type BadgeTone = 'primary' | 'accent' | 'success' | 'warning' | 'error';

const TYPE_TONES: Record<string, BadgeTone> = {
  auth: 'primary',
  worker: 'warning',
  analytic: 'success',
};

/** Badge for a collection's type: toned for auth, worker and analytic, outlined for base. */
export function collectionTypeBadge(type: string) {
  const tone = TYPE_TONES[type];
  return tone ? html`<moul-badge tone=${tone}>${type}</moul-badge>` : html`<moul-badge variant="bordered">${type}</moul-badge>`;
}
