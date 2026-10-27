import { html } from 'lit';
import { onPress } from '../../lib/press';

export interface DeleteCollectionDialogOptions {
  isOpen: boolean;
  name: string;
  isPending: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation before deleting a collection and all its records. It stays open while the
 * delete runs (`isPending`): the buttons don't use `<moul-alert-dialog>`'s confirm/cancel
 * slots, which close the dialog immediately.
 */
export function deleteCollectionDialog(options: DeleteCollectionDialogOptions) {
  return html`
    <moul-alert-dialog
      tone="error"
      size="sm"
      ?is-open=${options.isOpen}
      @openchange=${(e: CustomEvent<{ isOpen: boolean }>) => {
        if (!e.detail.isOpen) options.onCancel();
      }}
    >
      <span slot="header">Delete Collection</span>
      <p slot="body" style="margin: 0; font-size: var(--font-size-sm); color: var(--color-fg-subtle)">
        Are you sure you want to delete collection <strong>“${options.name}”</strong>?
        <br /><br />
        This will permanently delete the collection and all of its records. This action cannot be undone.
      </p>
      <moul-button slot="footer" variant="outline" @click=${onPress(options.onCancel)}>Cancel</moul-button>
      <moul-button slot="footer" variant="danger" ?is-pending=${options.isPending} @click=${onPress(options.onConfirm)}>
        ${options.confirmLabel ?? 'Delete'}
      </moul-button>
    </moul-alert-dialog>
  `;
}
