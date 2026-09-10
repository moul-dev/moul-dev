import { MoulField, isReservedFieldName, isValidCamelCase } from '../components/collections/FieldsBuilder';

/**
 * Validates a single collection field value according to its schema constraints.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateFieldValue(
  field: MoulField,
  val: any,
  _isUpdate = false
): string | null {
  const isNil = val === null || val === undefined;
  const isStr = typeof val === 'string';
  const trimmedStr = isStr ? val.trim() : '';

  // 1. Required constraint checking
  if (field.required) {
    if (isNil) {
      return `"${field.name}" is required.`;
    }
    if (isStr && trimmedStr === '') {
      return `"${field.name}" is required and cannot be empty.`;
    }
    if (Array.isArray(val) && val.length === 0) {
      return `"${field.name}" requires at least one selection.`;
    }
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0 && field.type === 'file') {
      return `"${field.name}" requires a file to be uploaded.`;
    }
  }

  // If value is empty / not provided and not required, it is valid
  if (isNil || (isStr && trimmedStr === '')) {
    return null;
  }

  // 2. Type-specific constraint validations
  switch (field.type) {
    case 'number': {
      const num = typeof val === 'number' ? val : Number(val);
      if (Number.isNaN(num)) {
        return `"${field.name}" must be a valid number.`;
      }
      if (field.min !== undefined && field.min !== null && num < field.min) {
        return `"${field.name}" must be at least ${field.min}.`;
      }
      if (field.max !== undefined && field.max !== null && num > field.max) {
        return `"${field.name}" must be at most ${field.max}.`;
      }
      break;
    }

    case 'text':
    case 'editor': {
      if (isStr) {
        // Count unicode characters accurately
        const charCount = Array.from(val).length;
        if (field.min !== undefined && field.min !== null && charCount < field.min) {
          return `"${field.name}" must be at least ${field.min} characters (currently ${charCount}).`;
        }
        if (field.max !== undefined && field.max !== null && charCount > field.max) {
          return `"${field.name}" must be at most ${field.max} characters (currently ${charCount}).`;
        }
      }
      break;
    }

    case 'email': {
      if (isStr && trimmedStr !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedStr)) {
          return `"${field.name}" must be a valid email address (e.g. user@example.com).`;
        }
      }
      break;
    }

    case 'url': {
      if (isStr && trimmedStr !== '') {
        try {
          const parsed = new URL(trimmedStr);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return `"${field.name}" URL must use http:// or https://.`;
          }
          if (!parsed.hostname) {
            return `"${field.name}" URL must have a valid domain host.`;
          }
        } catch {
          return `"${field.name}" must be a valid URL (e.g. https://example.com).`;
        }
      }
      break;
    }

    case 'date': {
      if (isStr && trimmedStr !== '') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(trimmedStr)) {
          return `"${field.name}" must be a date in YYYY-MM-DD format.`;
        }
        const [year, month, day] = trimmedStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return `"${field.name}" is not a valid calendar date.`;
        }
      }
      break;
    }

    case 'datetime': {
      if (isStr && trimmedStr !== '') {
        const parsed = Date.parse(trimmedStr);
        if (Number.isNaN(parsed)) {
          return `"${field.name}" must be a valid ISO 8601 date & time string.`;
        }
      }
      break;
    }

    case 'json': {
      if (isStr && trimmedStr !== '') {
        try {
          JSON.parse(trimmedStr);
        } catch (err: any) {
          return `"${field.name}" invalid JSON syntax: ${err.message || 'Check quotes and brackets'}.`;
        }
      }
      break;
    }

    case 'select': {
      if (field.options && field.options.length > 0) {
        const strVal = String(val);
        if (!field.options.includes(strVal)) {
          return `"${field.name}" must be one of: ${field.options.join(', ')}.`;
        }
      }
      break;
    }

    case 'relation': {
      if (field.required) {
        if (field.relationConfig?.cardinality === 'M:N') {
          if (!Array.isArray(val) || val.length === 0) {
            return `Please select at least one related record for "${field.name}".`;
          }
        } else {
          if (!val || String(val).trim() === '') {
            return `Please select a related record for "${field.name}".`;
          }
        }
      }
      break;
    }

    case 'file': {
      if (field.required && !val) {
        return `Please upload a file for "${field.name}".`;
      }
      break;
    }
  }

  return null;
}

/**
 * Validates auth-specific credentials fields (username, email, password, passwordConfirm).
 */
export function validateAuthFields(
  formData: Record<string, any>,
  isCreate: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};

  // 1. Username
  const username = String(formData.username || '').trim();
  if (isCreate && !username) {
    errors.username = 'Username is required.';
  } else if (username && username.length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  }

  // 2. Email
  const email = String(formData.email || '').trim();
  if (isCreate && !email) {
    errors.email = 'Email is required.';
  } else if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Must be a valid email address.';
    }
  }

  // 3. Passwords
  const password = formData.password || '';
  const passwordConfirm = formData.passwordConfirm || '';

  if (isCreate) {
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = 'Please confirm your password.';
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match.';
    }
  } else if (password) {
    // Updating password
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (passwordConfirm && password !== passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match.';
    }
  }

  return errors;
}

/**
 * Runs full validation across all collection fields and any auth credentials.
 */
export function validateRecordForm(
  fields: MoulField[],
  formData: Record<string, any>,
  isAuth: boolean,
  isCreate: boolean
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate auth credentials if auth collection
  if (isAuth) {
    Object.assign(errors, validateAuthFields(formData, isCreate));
  }

  // Validate custom schema fields
  for (const field of fields) {
    const err = validateFieldValue(field, formData[field.name], !isCreate);
    if (err) {
      errors[field.name] = err;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitizes and normalizes form data before API dispatch.
 * Prevents accidental numeric coercions (e.g. "" -> 0) and formats dates.
 */
export function formatFormDataForSubmit(
  fields: MoulField[],
  formData: Record<string, any>
): Record<string, any> {
  const cleaned: Record<string, any> = { ...formData };

  for (const field of fields) {
    const val = cleaned[field.name];

    if (field.type === 'number') {
      if (val === '' || val === null || val === undefined) {
        cleaned[field.name] = null;
      } else {
        const num = Number(val);
        cleaned[field.name] = Number.isNaN(num) ? null : num;
      }
    } else if (field.type === 'datetime') {
      if (typeof val === 'string' && val.trim() !== '') {
        const trimmed = val.trim();
        // If from input type="datetime-local", e.g. "2026-08-12T10:15"
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
          cleaned[field.name] = `${trimmed}:00Z`;
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
          cleaned[field.name] = `${trimmed}Z`;
        } else {
          cleaned[field.name] = trimmed;
        }
      }
    } else if (field.type === 'json') {
      if (typeof val === 'string' && val.trim() !== '') {
        try {
          cleaned[field.name] = JSON.parse(val.trim());
        } catch {
          cleaned[field.name] = val;
        }
      }
    } else if (typeof val === 'string') {
      cleaned[field.name] = val.trim();
    }
  }

  return cleaned;
}

/**
 * Validates fields in the collection schema builder (FieldsBuilder).
 * Catches empty names, reserved names, camelCase violations, duplicates,
 * and constraint inconsistencies (min > max).
 */
export function validateSchemaFields(
  fields: MoulField[],
  collectionType = 'base'
): { isValid: boolean; fieldErrors: Record<number, Record<string, string>>; summaryErrors: string[] } {
  const fieldErrors: Record<number, Record<string, string>> = {};
  const summaryErrors: string[] = [];
  const seenNames = new Map<string, number>();

  fields.forEach((f, idx) => {
    const errors: Record<string, string> = {};
    const trimmedName = (f.name || '').trim();

    // 1. Name required
    if (!trimmedName) {
      errors.name = 'Field name is required.';
      summaryErrors.push(`Field #${idx + 1}: Name is required.`);
    } else {
      const lower = trimmedName.toLowerCase();

      // 2. Reserved field name
      if (isReservedFieldName(trimmedName, collectionType)) {
        errors.name = `"${trimmedName}" is a reserved built-in column name for ${collectionType} collections.`;
        summaryErrors.push(`Field "${trimmedName}": Reserved built-in column name.`);
      }

      // 3. camelCase convention
      if (!isValidCamelCase(trimmedName)) {
        errors.name = `Field "${trimmedName}" must be camelCase (e.g. "authorId").`;
        summaryErrors.push(`Field "${trimmedName}": Must be camelCase.`);
      }

      // 4. Duplicate field name
      if (seenNames.has(lower)) {
        const prevIdx = seenNames.get(lower)!;
        errors.name = `Duplicate field name "${trimmedName}" (already used in Field #${prevIdx + 1}).`;
        summaryErrors.push(`Duplicate field name "${trimmedName}".`);
      } else {
        seenNames.set(lower, idx);
      }
    }

    // 5. Min / Max range check
    if (f.min !== undefined && f.min !== null && f.max !== undefined && f.max !== null) {
      if (f.min > f.max) {
        errors.min = `Minimum (${f.min}) cannot be greater than Maximum (${f.max}).`;
        summaryErrors.push(`Field "${f.name || idx + 1}": Minimum cannot be greater than maximum.`);
      }
    }

    // 6. Select field options check
    if (f.type === 'select') {
      if (!f.options || f.options.length === 0) {
        errors.options = 'Select field must have at least one allowed option.';
        summaryErrors.push(`Field "${f.name || idx + 1}": At least one option is required.`);
      }
    }

    // 7. Relation target collection check
    if (f.type === 'relation') {
      if (!f.relationConfig?.targetMoul) {
        errors.relation = 'Relation field must specify a target collection.';
        summaryErrors.push(`Field "${f.name || idx + 1}": Target collection is required.`);
      }
    }

    if (Object.keys(errors).length > 0) {
      fieldErrors[idx] = errors;
    }
  });

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    summaryErrors,
  };
}
