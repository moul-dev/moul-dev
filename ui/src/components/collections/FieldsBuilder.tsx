import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Button,
  TextField,
  NumberField,
  Select,
  SelectItem,
  Checkbox,
  Badge,
  EmptyState,
  TagGroup,
  Tag,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import {
  PlusIcon,
  TrashIcon,
  LinkIcon,
  SlidersIcon,
  TagIcon,
  CaretDownIcon,
  CaretUpIcon,
  InfoIcon,
  UserIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  title: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
    margin: 0,
  },
  subtitle: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  systemFieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
  },
  systemFieldsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  systemFieldGroup: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing1,
  },
  systemFieldPill: {
    backgroundColor: tokens.colorBgElevated,
    paddingBlock: '2px',
    paddingInline: tokens.spacing2,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    fontFamily: 'var(--font-mono, monospace)',
    color: tokens.colorFg,
    fontSize: '0.6875rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  authFieldPill: {
    backgroundColor: tokens.colorBgElevated,
    paddingBlock: '2px',
    paddingInline: tokens.spacing2,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorPrimary500,
    fontFamily: 'var(--font-mono, monospace)',
    color: tokens.colorPrimary500,
    fontSize: '0.6875rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  fieldConflictWarning: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
    color: tokens.colorError500,
    fontSize: tokens.fontSizeXs,
    fontFamily: tokens.fontFamilyBase,
    gridColumn: '1 / -1',
    marginTop: '-4px',
    paddingTop: '2px',
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
  fieldCard: {
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    overflow: 'hidden',
    transition: 'border-color 0.15s ease',
  },
  fieldCardRelation: {
    borderColor: tokens.colorPrimary500,
  },
  fieldCardConflict: {
    borderColor: tokens.colorError500,
  },
  fieldMainRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(140px, 1.8fr) minmax(160px, 1.6fr) auto auto',
    gap: tokens.spacing3,
    alignItems: 'center',
    padding: tokens.spacing3,
  },
  fieldControls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  expandedConfigPanel: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorBorder,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgSubtle,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  relationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing3,
  },
  relationHelperBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
});

export interface MoulField {
  name: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  relationConfig?: {
    targetMoul: string;
    cardinality: '1:1' | '1:N' | 'M:N';
    onDelete: 'SET_NULL' | 'CASCADE' | 'RESTRICT';
  };
}

export interface FieldsBuilderProps {
  fields: MoulField[];
  onChange: (fields: MoulField[]) => void;
  currentMoulName?: string;
  allMouls?: any[];
  collectionType?: string;
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

export function FieldsBuilder({
  fields,
  onChange,
  currentMoulName = '',
  allMouls = [],
  collectionType = 'base',
}: FieldsBuilderProps) {
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>({});
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});

  const handleAddField = () => {
    const defaultName = getNextDefaultFieldName(fields);
    const next = [
      ...fields,
      {
        name: defaultName,
        type: 'text',
        required: false,
      },
    ];
    onChange(next);
  };

  const handleAddRelationField = () => {
    const nextIdx = fields.length;
    const otherMoul = allMouls?.find((m: any) => m.name !== currentMoulName)?.name || currentMoulName || 'users';
    const defaultName = getNextDefaultRelationName(otherMoul, currentMoulName, fields);

    const next = [
      ...fields,
      {
        name: defaultName,
        type: 'relation',
        required: false,
        relationConfig: {
          targetMoul: otherMoul,
          cardinality: '1:N' as const,
          onDelete: 'SET_NULL' as const,
        },
      },
    ];
    onChange(next);
    setExpandedFields((prev) => ({ ...prev, [nextIdx]: true }));
  };

  const handleRemoveField = (idx: number) => {
    const next = fields.filter((_, i) => i !== idx);
    onChange(next);
    const nextExp = { ...expandedFields };
    delete nextExp[idx];
    setExpandedFields(nextExp);
  };

  const handleFieldChange = (idx: number, key: string, val: any) => {
    const next = [...fields];
    const updated = { ...next[idx], [key]: val };

    if (key === 'type' && val === 'relation') {
      const defaultTarget = allMouls?.find((m: any) => m.name !== currentMoulName)?.name || currentMoulName || 'users';
      if (!updated.relationConfig) {
        updated.relationConfig = {
          targetMoul: defaultTarget,
          cardinality: '1:N',
          onDelete: 'SET_NULL',
        };
      }
      if (/^field\d+$/i.test(updated.name)) {
        updated.name = getNextDefaultRelationName(defaultTarget, currentMoulName, fields.filter((_, i) => i !== idx));
      }
      setExpandedFields((prev) => ({ ...prev, [idx]: true }));
    }

    if (key === 'type' && val === 'select') {
      if (!updated.options || updated.options.length === 0) {
        updated.options = ['option1', 'option2'];
      }
      setExpandedFields((prev) => ({ ...prev, [idx]: true }));
    }

    next[idx] = updated;
    onChange(next);
  };

  const handleRelationConfigChange = (idx: number, key: string, val: any) => {
    const next = [...fields];
    const currConfig = next[idx].relationConfig || {
      targetMoul: currentMoulName || 'users',
      cardinality: '1:N',
      onDelete: 'SET_NULL',
    };
    next[idx] = {
      ...next[idx],
      relationConfig: {
        ...currConfig,
        [key]: val,
      },
    };
    onChange(next);
  };

  const handleAddOption = (idx: number) => {
    const val = (newOptionInputs[idx] || '').trim();
    if (!val) return;
    const next = [...fields];
    const currOpts = next[idx].options || [];
    if (!currOpts.includes(val)) {
      next[idx] = { ...next[idx], options: [...currOpts, val] };
      onChange(next);
    }
    setNewOptionInputs((prev) => ({ ...prev, [idx]: '' }));
  };

  const handleRemoveOption = (idx: number, optToRemove: string) => {
    const next = [...fields];
    const currOpts = next[idx].options || [];
    next[idx] = { ...next[idx], options: currOpts.filter((o: string) => o !== optToRemove) };
    onChange(next);
  };

  const toggleExpand = (idx: number) => {
    setExpandedFields((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div {...stylex.props(styles.container)}>
      {/* Header */}
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.titleGroup)}>
          <h3 {...stylex.props(styles.title)}>
            <SlidersIcon size={16} color={tokens.colorPrimary500} />
            <span>Schema Fields</span>
          </h3>
          <span {...stylex.props(styles.subtitle)}>
            Define custom columns, data types, and relationships.
          </span>
        </div>

        <div {...stylex.props(styles.actions)}>
          <Button variant="outline" onPress={handleAddRelationField}>
            <LinkIcon size={16} />
            <span>Add Relation</span>
          </Button>
          <Button variant="primary" onPress={handleAddField}>
            <PlusIcon size={16} />
            <span>Add Field</span>
          </Button>
        </div>
      </div>

      {/* Built-in System & Default Fields Section */}
      <div {...stylex.props(styles.systemFieldsContainer)}>
        <div {...stylex.props(styles.systemFieldsHeader)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
            <InfoIcon size={15} color={tokens.colorPrimary500} />
            <span style={{ fontWeight: 600, fontSize: tokens.fontSizeXs, color: tokens.colorFg }}>
              {collectionType === 'auth' ? 'Built-in Auth & System Columns' : 'Built-in System Columns'}
            </span>
            <Badge variant={collectionType === 'auth' ? 'primary' : 'neutral'}>
              {collectionType === 'auth' ? '12 default columns' : '3 default columns'}
            </Badge>
          </div>
          <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle }}>
            {collectionType === 'auth'
              ? 'Managed automatically: Identity, credentials, 2FA, and timestamps'
              : 'Managed automatically: Primary key and audit timestamps'}
          </span>
        </div>

        {collectionType === 'auth' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing2 }}>
            {/* Core & Primary Auth Identity Fields */}
            <div {...stylex.props(styles.systemFieldGroup)}>
              <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, fontWeight: 500 }}>
                Core & Identity:
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Primary Key (string)">
                <span>id</span>
                <Badge variant="neutral">PK</Badge>
              </span>
              <span {...stylex.props(styles.authFieldPill)} title="Required unique login username">
                <UserIcon size={12} />
                <span>username</span>
                <Badge variant="primary">unique</Badge>
              </span>
              <span {...stylex.props(styles.authFieldPill)} title="Required unique email address">
                <UserIcon size={12} />
                <span>email</span>
                <Badge variant="primary">unique</Badge>
              </span>
              <span {...stylex.props(styles.authFieldPill)} title="Bcrypt password hash (hidden from read APIs)">
                <ShieldCheckIcon size={12} />
                <span>passwordHash</span>
                <Badge variant="neutral">secure</Badge>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Creation ISO-8601 timestamp">
                <span>createdAt</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Last updated ISO-8601 timestamp">
                <span>updatedAt</span>
              </span>
            </div>

            {/* Extended Security Columns */}
            <div {...stylex.props(styles.systemFieldGroup)}>
              <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, fontWeight: 500 }}>
                Security & 2FA:
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="One-time password login code">
                <span>otpCode</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="OTP expiration timestamp">
                <span>otpExpiresAt</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="WebAuthn credentials list">
                <span>passkeys</span>
                <Badge variant="neutral">json</Badge>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Password reset token">
                <span>resetToken</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Reset token expiration timestamp">
                <span>resetTokenExpiresAt</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="OAuth provider identities">
                <span>oauthProviders</span>
                <Badge variant="neutral">json</Badge>
              </span>
            </div>
          </div>
        ) : (
          <div {...stylex.props(styles.systemFieldGroup)}>
            <span {...stylex.props(styles.systemFieldPill)} title="Primary Key (string)">
              <span>id</span>
              <Badge variant="neutral">PK</Badge>
            </span>
            <span {...stylex.props(styles.systemFieldPill)} title="Creation ISO-8601 timestamp">
              <span>createdAt</span>
              <Badge variant="neutral">datetime</Badge>
            </span>
            <span {...stylex.props(styles.systemFieldPill)} title="Last updated ISO-8601 timestamp">
              <span>updatedAt</span>
              <Badge variant="neutral">datetime</Badge>
            </span>
          </div>
        )}
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <EmptyState
          variant="dashed"
          title="No custom fields"
          description="Add fields or relations to define this collection schema."
        />
      ) : (
        <div {...stylex.props(styles.fieldList)}>
          {fields.map((field, idx) => {
            const isRelation = field.type === 'relation';
            const isSelect = field.type === 'select';
            const isNumber = field.type === 'number';
            const isText = field.type === 'text' || field.type === 'editor';
            const isConfigurable = isRelation || isSelect || isNumber || isText;
            const isExpanded = Boolean(expandedFields[idx]);
            const trimmedName = (field.name || '').trim();
            const isEmpty = !trimmedName;
            const isConflict = Boolean(trimmedName && isReservedFieldName(trimmedName, collectionType));
            const isInvalidCamel = Boolean(trimmedName && !isValidCamelCase(trimmedName));
            const isDuplicate = Boolean(
              trimmedName &&
              fields.some((f, i) => i !== idx && (f.name || '').trim().toLowerCase() === trimmedName.toLowerCase())
            );
            const hasMinMaxConflict = Boolean(
              field.min !== undefined &&
              field.min !== null &&
              field.max !== undefined &&
              field.max !== null &&
              field.min > field.max
            );
            const hasSelectError = Boolean(
              isSelect && (!field.options || field.options.length === 0)
            );
            const isInvalid = isEmpty || isConflict || isInvalidCamel || isDuplicate || hasMinMaxConflict || hasSelectError;
            const suggestedCamel = toCamelCase(trimmedName);
            const canSuggestFix = Boolean(
              isInvalidCamel &&
              suggestedCamel &&
              suggestedCamel !== trimmedName &&
              isValidCamelCase(suggestedCamel) &&
              !isReservedFieldName(suggestedCamel, collectionType)
            );

            return (
              <div
                key={idx}
                {...stylex.props(
                  styles.fieldCard,
                  isRelation && styles.fieldCardRelation,
                  isInvalid && styles.fieldCardConflict
                )}
              >
                {/* Main Row */}
                <div {...stylex.props(styles.fieldMainRow)}>
                  <TextField
                    placeholder="fieldName (e.g. authorId)"
                    value={field.name}
                    onChange={(val) => handleFieldChange(idx, 'name', val)}
                    isInvalid={isInvalid}
                  />

                  <Select
                    placeholder="Select Type"
                    selectedKey={field.type}
                    onSelectionChange={(val) => handleFieldChange(idx, 'type', String(val))}
                  >
                    <SelectItem id="text">Text (String)</SelectItem>
                    <SelectItem id="number">Number</SelectItem>
                    <SelectItem id="bool">Boolean</SelectItem>
                    <SelectItem id="email">Email</SelectItem>
                    <SelectItem id="url">URL</SelectItem>
                    <SelectItem id="date">Date</SelectItem>
                    <SelectItem id="datetime">Date & Time</SelectItem>
                    <SelectItem id="file">File Attachment</SelectItem>
                    <SelectItem id="json">JSON Object</SelectItem>
                    <SelectItem id="editor">Rich Text</SelectItem>
                    <SelectItem id="select">Single Select (Enum)</SelectItem>
                    <SelectItem id="relation">Relation (Foreign Key)</SelectItem>
                  </Select>

                  <Checkbox
                    isSelected={Boolean(field.required)}
                    onChange={(checked) => handleFieldChange(idx, 'required', checked)}
                  >
                    Required
                  </Checkbox>

                  {/* Config & Remove Controls */}
                  <div {...stylex.props(styles.fieldControls)}>
                    {isConfigurable && (
                      <Button
                        variant={isRelation ? 'secondary' : 'outline'}
                        aria-label={`Configure ${field.name}`}
                        onPress={() => toggleExpand(idx)}
                      >
                        {isRelation ? (
                          <>
                            <LinkIcon size={14} color={tokens.colorPrimary500} />
                            <span>
                              {field.relationConfig?.targetMoul
                                ? `➔ ${field.relationConfig.targetMoul}`
                                : 'Configure'}
                            </span>
                            {isExpanded ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
                          </>
                        ) : isSelect ? (
                          <>
                            <TagIcon size={14} />
                            <span>
                              {(field.options || []).length} options
                            </span>
                            {isExpanded ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
                          </>
                        ) : isText ? (
                          <>
                            <SlidersIcon size={14} />
                            <span>
                              {field.min !== undefined || field.max !== undefined
                                ? `${field.min ?? 0}..${field.max ?? '∞'} chars`
                                : 'Length'}
                            </span>
                            {isExpanded ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
                          </>
                        ) : (
                          <>
                            <SlidersIcon size={14} />
                            <span>
                              {field.min !== undefined || field.max !== undefined
                                ? `${field.min ?? '-∞'}..${field.max ?? '+∞'}`
                                : 'Min/Max'}
                            </span>
                            {isExpanded ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      isIcon
                      aria-label={`Remove field ${field.name || idx}`}
                      onPress={() => handleRemoveField(idx)}
                    >
                      <TrashIcon size={18} color={tokens.colorError500} />
                    </Button>
                  </div>

                  {isEmpty && (
                    <div {...stylex.props(styles.fieldConflictWarning)}>
                      <WarningCircleIcon size={14} color={tokens.colorError500} />
                      <span>Field name is required.</span>
                    </div>
                  )}

                  {isConflict && (
                    <div {...stylex.props(styles.fieldConflictWarning)}>
                      <WarningCircleIcon size={14} color={tokens.colorError500} />
                      <span>
                        &ldquo;{field.name}&rdquo; is already a built-in default column for {collectionType} collections. Please rename or remove it.
                      </span>
                    </div>
                  )}
                  {!isConflict && !isEmpty && isInvalidCamel && (
                    <div {...stylex.props(styles.fieldConflictWarning)}>
                      <WarningCircleIcon size={14} color={tokens.colorError500} />
                      <span>
                        Field name &ldquo;{field.name}&rdquo; must be camelCase (e.g. &ldquo;authorId&rdquo;, &ldquo;viewsCount&rdquo;).
                      </span>
                      {canSuggestFix && (
                        <Button
                          variant="secondary"
                          onPress={() => handleFieldChange(idx, 'name', suggestedCamel)}
                        >
                          Use &ldquo;{suggestedCamel}&rdquo;
                        </Button>
                      )}
                    </div>
                  )}
                  {isDuplicate && !isConflict && (
                    <div {...stylex.props(styles.fieldConflictWarning)}>
                      <WarningCircleIcon size={14} color={tokens.colorError500} />
                      <span>
                        Field name &ldquo;{field.name}&rdquo; is already used in another field. Field names must be unique.
                      </span>
                    </div>
                  )}
                  {hasMinMaxConflict && (
                    <div {...stylex.props(styles.fieldConflictWarning)}>
                      <WarningCircleIcon size={14} color={tokens.colorError500} />
                      <span>
                        Minimum ({field.min}) cannot be greater than maximum ({field.max}).
                      </span>
                    </div>
                  )}
                  {hasSelectError && (
                    <div {...stylex.props(styles.fieldConflictWarning)}>
                      <WarningCircleIcon size={14} color={tokens.colorError500} />
                      <span>
                        Select field requires at least one allowed option.
                      </span>
                    </div>
                  )}
                </div>

                {/* Expandable Configuration Section */}
                {isExpanded && isConfigurable && (
                  <div {...stylex.props(styles.expandedConfigPanel)}>
                    {/* 1. Relation Configurator */}
                    {isRelation && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing2 }}>
                        <div {...stylex.props(styles.relationHelperBanner)}>
                          <InfoIcon size={15} color={tokens.colorPrimary500} style={{ flexShrink: 0 }} />
                          <span>
                            Relational link from <strong>{currentMoulName || 'this collection'}</strong> to target collection.
                          </span>
                        </div>

                        <div {...stylex.props(styles.relationGrid)}>
                          <Select
                            label="Target Collection"
                            placeholder="Choose collection"
                            selectedKey={field.relationConfig?.targetMoul || (allMouls?.[0]?.name || 'users')}
                            onSelectionChange={(key) => handleRelationConfigChange(idx, 'targetMoul', String(key))}
                          >
                            {(allMouls || []).map((m: any) => (
                              <SelectItem key={m.name} id={m.name} textValue={m.name}>
                                {m.name} {m.name === currentMoulName ? '(Self)' : `(${m.type})`}
                              </SelectItem>
                            ))}
                          </Select>

                          <Select
                            label="Relationship Type"
                            placeholder="Choose cardinality"
                            selectedKey={field.relationConfig?.cardinality || '1:N'}
                            onSelectionChange={(key) => handleRelationConfigChange(idx, 'cardinality', String(key))}
                          >
                            <SelectItem id="1:N" textValue="1:N Single Reference">1:N — Single Reference (Many-to-One)</SelectItem>
                            <SelectItem id="1:1" textValue="1:1 Unique Reference">1:1 — Unique Reference (One-to-One)</SelectItem>
                            <SelectItem id="M:N" textValue="M:N Multiple References">M:N — Multiple References (Many-to-Many)</SelectItem>
                          </Select>

                          <Select
                            label="When Target is Deleted"
                            placeholder="Choose delete rule"
                            selectedKey={field.relationConfig?.onDelete || 'SET_NULL'}
                            onSelectionChange={(key) => handleRelationConfigChange(idx, 'onDelete', String(key))}
                          >
                            <SelectItem id="SET_NULL" textValue="SET_NULL">SET_NULL (Clear link, keep record)</SelectItem>
                            <SelectItem id="CASCADE" textValue="CASCADE">CASCADE (Delete record too)</SelectItem>
                            <SelectItem id="RESTRICT" textValue="RESTRICT">RESTRICT (Prevent deleting target)</SelectItem>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* 2. Select Options Configurator */}
                    {isSelect && (
                      <div {...stylex.props(styles.optionsGrid)}>
                        <TagGroup
                          label="Allowed Options"
                          size="sm"
                          isInvalid={!field.options || field.options.length === 0}
                          errorMessage={
                            !field.options || field.options.length === 0
                              ? 'Select field requires at least one allowed option.'
                              : undefined
                          }
                          renderEmptyState={() => (
                            <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, fontStyle: 'italic' }}>
                              No options added yet. Type an option name below and press Add.
                            </span>
                          )}
                          onRemove={(keys) => {
                            Array.from(keys).forEach((k) => handleRemoveOption(idx, String(k)));
                          }}
                        >
                          {(field.options || []).map((opt: string) => (
                            <Tag key={opt} id={opt} variant="secondary" size="sm">
                              {opt}
                            </Tag>
                          ))}
                        </TagGroup>
                        <div style={{ display: 'flex', gap: tokens.spacing2, maxWidth: '360px' }}>
                          <TextField
                            aria-label="New option name"
                            placeholder="Option name (e.g. published)"
                            value={newOptionInputs[idx] || ''}
                            onChange={(val) => setNewOptionInputs((prev) => ({ ...prev, [idx]: val }))}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOption(idx);
                              }
                            }}
                          />
                          <Button variant="secondary" onPress={() => handleAddOption(idx)}>
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 3. Text Length Constraints */}
                    {isText && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing2 }}>
                        <span style={{ fontSize: tokens.fontSizeXs, fontWeight: 500, color: tokens.colorFg }}>
                          Character Length Limits (optional):
                        </span>
                        <div style={{ display: 'flex', gap: tokens.spacing2, maxWidth: '380px' }}>
                          <NumberField
                            label="Min Characters"
                            minValue={0}
                            value={field.min ?? undefined}
                            onChange={(val) => handleFieldChange(idx, 'min', val)}
                          />
                          <NumberField
                            label="Max Characters"
                            minValue={0}
                            value={field.max ?? undefined}
                            onChange={(val) => handleFieldChange(idx, 'max', val)}
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. Number Min/Max Constraints */}
                    {isNumber && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing2 }}>
                        <span style={{ fontSize: tokens.fontSizeXs, fontWeight: 500, color: tokens.colorFg }}>
                          Numeric Range Limits (optional):
                        </span>
                        <div style={{ display: 'flex', gap: tokens.spacing2, maxWidth: '380px' }}>
                          <NumberField
                            label="Minimum Value"
                            value={field.min ?? undefined}
                            onChange={(val) => handleFieldChange(idx, 'min', val)}
                          />
                          <NumberField
                            label="Maximum Value"
                            value={field.max ?? undefined}
                            onChange={(val) => handleFieldChange(idx, 'max', val)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
