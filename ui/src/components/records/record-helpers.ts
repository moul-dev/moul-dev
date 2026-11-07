// Display helpers shared by the records table, the record drawer and its field inputs.

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

/** A file value is either a URL string or the upload API's `{ url, filename, size, … }` object. */
export function getFileUrl(fileData: any): string {
  if (!fileData) return '';
  if (typeof fileData === 'string') return fileData;
  return fileData.url || '';
}

export function getFileName(fileData: any): string {
  if (!fileData) return '';
  if (typeof fileData === 'string') {
    const parts = fileData.split('/');
    return parts[parts.length - 1] || fileData;
  }
  return fileData.filename || fileData.name || 'file';
}

export function isImageFile(fileData: any): boolean {
  if (!fileData) return false;
  const url = typeof fileData === 'string' ? fileData : fileData.url || '';
  const filename = typeof fileData === 'string' ? fileData : fileData.filename || fileData.name || '';
  const isImgExt = /\.(jpg|jpeg|png|webp|gif|svg|avif|ico|bmp)$/i.test(url || filename);
  const hasThumb = Boolean(fileData.thumbhash || (fileData.thumbs && Object.keys(fileData.thumbs).length > 0));
  return isImgExt || hasThumb;
}

/** The most human field of a related record, for chips and pickers. */
export function getRecordDisplayLabel(rec: any): string {
  if (!rec) return '';
  if (typeof rec === 'string') return rec;
  for (const key of ['name', 'title', 'username', 'email', 'label', 'slug', 'id']) {
    if (rec[key]) return String(rec[key]);
  }
  return JSON.stringify(rec);
}

/** Badge tone for a worker job state; `undefined` means a neutral (bordered) badge. */
export function workerStateTone(state?: string): 'success' | 'warning' | 'error' | 'primary' | undefined {
  switch (String(state || '').toLowerCase()) {
    case 'completed':
      return 'success';
    case 'executing':
    case 'processing':
      return 'primary';
    case 'retryable':
      return 'warning';
    case 'discarded':
    case 'failed':
    case 'cancelled':
      return 'error';
    default:
      return undefined;
  }
}

/** Writes text to the clipboard; resolves false when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Columns the records grid shows itself for these collection types, and the system keys that
// never become inferred columns.
const AUTH_COLUMNS = new Set(['username', 'email']);
const WORKER_COLUMNS = new Set(['worker', 'state', 'queue', 'attempt']);
const NON_FIELD_KEYS = new Set([
  'id', 'createdAt', 'updatedAt', 'created_at', 'updated_at',
  'username', 'email', 'passwordHash', 'otpCode', 'otpExpiresAt', 'passkeys', 'resetToken', 'resetTokenExpiresAt', 'oauthProviders',
  'worker', 'state', 'queue', 'attempt', 'max_attempts', 'priority', 'inserted_at', 'scheduled_at', 'attempted_at', 'attempted_by',
  'completed_at', 'discarded_at', 'cancelled_at', 'errors', 'last_error', 'tags', 'meta', 'args', 'expand',
]);

/**
 * Fields shown as grid columns and form inputs: the schema's fields minus the ones auth and
 * worker collections render specially, or, for a collection without a schema, every
 * non-system key found in the records (typed as text).
 */
export function displayFieldsFor(moul: any, records: any[]): { name: string; type: string; [key: string]: any }[] {
  const type = moul?.type;
  if (moul?.fields?.length > 0) {
    return moul.fields.filter(
      (f: any) => !(type === 'auth' && AUTH_COLUMNS.has(f.name)) && !(type === 'worker' && WORKER_COLUMNS.has(f.name)),
    );
  }
  const keys = new Set<string>();
  for (const rec of records) {
    for (const key of Object.keys(rec)) {
      // `$`-prefixed keys are TanStack DB's row metadata, not record fields.
      if (!NON_FIELD_KEYS.has(key) && !key.startsWith('$')) keys.add(key);
    }
  }
  return [...keys].map((name) => ({ name, type: 'text' }));
}
