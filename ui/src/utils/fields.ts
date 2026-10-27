// Field-schema helpers shared by the collection editor, record forms and validation.
// Framework-free; moved out of the React FieldsBuilder.

export const FIELD_TYPES = [
  { id: 'text', label: 'Text (String)', icon: 'text-aa' },
  { id: 'number', label: 'Number', icon: 'hash' },
  { id: 'bool', label: 'Boolean', icon: 'toggle-left' },
  { id: 'email', label: 'Email', icon: 'envelope-simple' },
  { id: 'url', label: 'URL', icon: 'link' },
  { id: 'date', label: 'Date', icon: 'calendar-blank' },
  { id: 'datetime', label: 'Date & Time', icon: 'clock' },
  { id: 'file', label: 'File Attachment', icon: 'paperclip' },
  { id: 'json', label: 'JSON Object', icon: 'brackets-curly' },
  { id: 'editor', label: 'Rich Text', icon: 'article' },
  { id: 'select', label: 'Single Select (Enum)', icon: 'list-dashes' },
  { id: 'relation', label: 'Relation (Foreign Key)', icon: 'link' },
  { id: 'cloak', label: 'Encrypted (Cloak)', icon: 'lock-key' },
] as const;

export interface MoulField {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  searchable?: boolean;
  relationConfig?: {
    targetMoul: string;
    cardinality: '1:1' | '1:N' | 'M:N';
    onDelete: 'SET_NULL' | 'CASCADE' | 'RESTRICT';
  };
}

export function isEligibleForUnique(type: string): boolean {
  return ['text', 'number', 'date', 'datetime', 'url', 'email'].includes(type);
}

export function isValidCamelCase(name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

export function toCamelCase(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return '';
  const camel = trimmed
    .replace(/[-_\s]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/[-_\s]+/g, '');
  if (!camel) return '';
  return camel.charAt(0).toLowerCase() + camel.slice(1);
}

export function getNextDefaultFieldName(existingFields: MoulField[]): string {
  const existingNames = new Set(existingFields.map((f) => (f.name || '').trim().toLowerCase()));
  let idx = 1;
  while (existingNames.has(`field${idx}`)) {
    idx++;
  }
  return `field${idx}`;
}

export function getNextDefaultRelationName(
  targetMoul: string,
  currentMoul: string,
  existingFields: MoulField[]
): string {
  const existingNames = new Set(existingFields.map((f) => (f.name || '').trim().toLowerCase()));
  let baseName = 'parentId';

  if (targetMoul && targetMoul !== currentMoul) {
    let clean = targetMoul.replace(/[-_]([a-z0-9])/gi, (_, char) => char.toUpperCase());
    if (clean.toLowerCase().endsWith('ies')) {
      clean = clean.slice(0, -3) + 'y';
    } else if (clean.toLowerCase().endsWith('s') && !clean.toLowerCase().endsWith('ss')) {
      clean = clean.slice(0, -1);
    }
    clean = clean.charAt(0).toLowerCase() + clean.slice(1);
    baseName = `${clean}Id`;
  }

  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.has(`${baseName}${counter}`.toLowerCase())) {
    counter++;
  }
  return `${baseName}${counter}`;
}

export function isReservedFieldName(name: string, collectionType: string = 'base'): boolean {
  const lower = name.trim().toLowerCase();
  const baseReserved = ['id', 'createdat', 'updatedat', 'created_at', 'updated_at'];
  if (baseReserved.includes(lower)) return true;
  if (collectionType === 'auth') {
    const authReserved = [
      'username',
      'email',
      'passwordhash',
      'password',
      'otpcode',
      'otpexpiresat',
      'passkeys',
      'resettoken',
      'resettokenexpiresat',
      'oauthproviders',
    ];
    return authReserved.includes(lower);
  }
  return false;
}
