import { css, html, nothing, type TemplateResult } from 'lit';

/**
 * Layout shared by every console page: a column that tracks `--content-max-width` (full width
 * while the sidebar is collapsed), a title row, and card section titles. Set `--page-gap` on
 * `:host` to change the spacing between sections.
 */
export const pageStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    gap: var(--page-gap, var(--spacing-6));
    width: 100%;
    max-width: var(--content-max-width, 1200px);
    transition: max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: var(--font-family-base);
    color: var(--color-fg);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-3);
    flex-wrap: wrap;
  }

  .page-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--color-fg);
  }

  .page-subtitle {
    display: block;
    margin-top: var(--spacing-1);
    font-size: var(--font-size-sm);
    color: var(--color-fg-subtle);
  }

  .page-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-fg);
  }

  .muted {
    color: var(--color-fg-subtle);
  }

  .mono {
    font-family: var(--font-mono);
  }
`;

/** Title, subtitle and optional actions at the top of a page. */
export function pageHeader(title: string, subtitle: string, actions?: TemplateResult) {
  return html`
    <div class="page-header">
      <div>
        <h1 class="page-title">${title}</h1>
        <span class="page-subtitle">${subtitle}</span>
      </div>
      ${actions ? html`<div class="page-actions">${actions}</div>` : nothing}
    </div>
  `;
}
