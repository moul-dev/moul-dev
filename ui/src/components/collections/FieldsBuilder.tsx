import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Button,
  TextField,
  NumberField,
  ComboBox,
  ComboBoxItem,
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
  LockKeyIcon,
  TextAaIcon,
  HashIcon,
  ToggleLeftIcon,
  EnvelopeSimpleIcon,
  CalendarBlankIcon,
  ClockIcon,
  PaperclipIcon,
  BracketsCurlyIcon,
  ArticleIcon,
  ListDashesIcon,
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
  systemFieldsBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
    paddingBlock: tokens.spacing2,
    paddingInline: tokens.spacing3,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
  },
  systemFieldsBannerLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  systemFieldsBannerRight: {
    fontSize: '0.6875rem',
    color: tokens.colorFgSubtle,
    fontStyle: 'italic',
  },
  systemFieldsBannerLabel: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 600,
    color: tokens.colorFgSubtle,
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing1,
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
  columnHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '72px minmax(130px, 1.8fr) minmax(160px, 1.5fr) 64px minmax(110px, 1.1fr) 40px',
    gap: tokens.spacing3,
    alignItems: 'center',
    paddingInline: tokens.spacing3,
    paddingBottom: '2px',
  },
  headerCol: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: tokens.colorFgSubtle,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: tokens.fontFamilyBase,
  },
  headerColCenter: {
    textAlign: 'center',
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
    gridTemplateColumns: '72px minmax(130px, 1.8fr) minmax(160px, 1.5fr) 64px minmax(110px, 1.1fr) 40px',
    gap: tokens.spacing3,
    alignItems: 'center',
    padding: tokens.spacing3,
  },
  orderCell: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  orderNumber: {
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono, monospace)',
    color: tokens.colorFgSubtle,
    fontWeight: 500,
    minWidth: '14px',
    textAlign: 'center',
  },
  orderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  checkboxCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsCell: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  truncatedText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  placeholderDash: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    width: '100%',
    textAlign: 'center',
    userSelect: 'none',
  },
  comboBoxItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  emptyMenuState: {
    padding: '8px 12px',
    fontSize: tokens.fontSizeSm,
    color: tokens.colorFgSubtle,
  },
  fieldValidationRow: {
    paddingInline: tokens.spacing3,
    paddingBottom: tokens.spacing2,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
  },
  fieldConflictWarning: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
    color: tokens.colorError500,
    fontSize: tokens.fontSizeXs,
    fontFamily: tokens.fontFamilyBase,
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
  panelSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
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
  emptyOptionsState: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontStyle: 'italic',
  },
  addOptionRow: {
    display: 'flex',
    gap: tokens.spacing2,
    maxWidth: '360px',
  },
  constraintSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
  constraintLabel: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 500,
    color: tokens.colorFg,
  },
  numberInputsRow: {
    display: 'flex',
    gap: tokens.spacing2,
    maxWidth: '380px',
  },
  securityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  securityTitle: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 600,
    color: tokens.colorFg,
  },
  securityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  securityCheckboxLabel: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 500,
    color: tokens.colorFg,
  },
  securityDescription: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    paddingLeft: tokens.spacing4,
  },
});

export const FIELD_TYPES = [
  { id: 'text', label: 'Text (String)', icon: TextAaIcon },
  { id: 'number', label: 'Number', icon: HashIcon },
  { id: 'bool', label: 'Boolean', icon: ToggleLeftIcon },
  { id: 'email', label: 'Email', icon: EnvelopeSimpleIcon },
  { id: 'url', label: 'URL', icon: LinkIcon },
  { id: 'date', label: 'Date', icon: CalendarBlankIcon },
  { id: 'datetime', label: 'Date & Time', icon: ClockIcon },
  { id: 'file', label: 'File Attachment', icon: PaperclipIcon },
  { id: 'json', label: 'JSON Object', icon: BracketsCurlyIcon },
  { id: 'editor', label: 'Rich Text', icon: ArticleIcon },
  { id: 'select', label: 'Single Select (Enum)', icon: ListDashesIcon },
  { id: 'relation', label: 'Relation (Foreign Key)', icon: LinkIcon },
  { id: 'cloak', label: 'Encrypted (Cloak)', icon: LockKeyIcon },
] as const;

export interface MoulField {
  name: string;
  type: string;
  required?: boolean;
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

  const handleMoveField = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const nextFields = [...fields];
    const temp = nextFields[index];
    nextFields[index] = nextFields[targetIndex];
    nextFields[targetIndex] = temp;
    onChange(nextFields);

    setExpandedFields((prev) => {
      const nextExpanded = { ...prev };
      const currentExp = Boolean(prev[index]);
      const targetExp = Boolean(prev[targetIndex]);
      nextExpanded[index] = targetExp;
      nextExpanded[targetIndex] = currentExp;
      return nextExpanded;
    });
  };

  const handleRemoveField = (idx: number) => {
    const next = fields.filter((_, i) => i !== idx);
    onChange(next);
    const nextExp: Record<number, boolean> = {};
    Object.entries(expandedFields).forEach(([key, val]) => {
      const numKey = Number(key);
      if (numKey < idx) {
        nextExp[numKey] = val;
      } else if (numKey > idx) {
        nextExp[numKey - 1] = val;
      }
    });
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

    if (key === 'type' && val === 'cloak') {
      if (updated.searchable === undefined) {
        updated.searchable = false;
      }
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
          <Button variant="primary" onPress={handleAddField}>
            <PlusIcon size={16} />
            <span>Add Field</span>
          </Button>
        </div>
      </div>

      {/* Built-in System Columns Compact Banner */}
      <div {...stylex.props(styles.systemFieldsBanner)}>
        <div {...stylex.props(styles.systemFieldsBannerLeft)}>
          <span {...stylex.props(styles.systemFieldsBannerLabel)}>
            <InfoIcon size={14} color={tokens.colorPrimary500} />
            <span>{collectionType === 'auth' ? 'Auth & System Columns:' : 'System Columns:'}</span>
          </span>

          {collectionType === 'auth' ? (
            <div {...stylex.props(styles.systemFieldGroup)}>
              <span {...stylex.props(styles.systemFieldPill)} title="Primary Key (string)">
                <span>id</span>
                <Badge variant="neutral" size="sm">PK</Badge>
              </span>
              <span {...stylex.props(styles.authFieldPill)} title="Required unique login username">
                <UserIcon size={11} />
                <span>username</span>
                <Badge variant="primary" size="sm">unique</Badge>
              </span>
              <span {...stylex.props(styles.authFieldPill)} title="Required unique email address">
                <UserIcon size={11} />
                <span>email</span>
                <Badge variant="primary" size="sm">unique</Badge>
              </span>
              <span {...stylex.props(styles.authFieldPill)} title="Bcrypt password hash (hidden from read APIs)">
                <ShieldCheckIcon size={11} />
                <span>passwordHash</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Creation ISO-8601 timestamp">
                <span>createdAt</span>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Last updated ISO-8601 timestamp">
                <span>updatedAt</span>
              </span>
            </div>
          ) : (
            <div {...stylex.props(styles.systemFieldGroup)}>
              <span {...stylex.props(styles.systemFieldPill)} title="Primary Key (string)">
                <span>id</span>
                <Badge variant="neutral" size="sm">PK</Badge>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Creation ISO-8601 timestamp">
                <span>createdAt</span>
                <Badge variant="neutral" size="sm">datetime</Badge>
              </span>
              <span {...stylex.props(styles.systemFieldPill)} title="Last updated ISO-8601 timestamp">
                <span>updatedAt</span>
                <Badge variant="neutral" size="sm">datetime</Badge>
              </span>
            </div>
          )}
        </div>

        <span {...stylex.props(styles.systemFieldsBannerRight)}>
          Auto-managed
        </span>
      </div>

      {/* Field List & Column Headers */}
      {fields.length === 0 ? (
        <EmptyState
          variant="dashed"
          title="No custom fields"
          description="Click '+ Add Field' to start defining custom columns."
        />
      ) : (
        <div {...stylex.props(styles.fieldList)}>
          {/* Subtle Column Header Row */}
          <div {...stylex.props(styles.columnHeaderRow)}>
            <span {...stylex.props(styles.headerCol, styles.headerColCenter)}>#</span>
            <span {...stylex.props(styles.headerCol)}>Field Name</span>
            <span {...stylex.props(styles.headerCol)}>Data Type</span>
            <span {...stylex.props(styles.headerCol, styles.headerColCenter)}>Required</span>
            <span {...stylex.props(styles.headerCol)}>Options / Rules</span>
            <span {...stylex.props(styles.headerCol, styles.headerColCenter)}>Actions</span>
          </div>

          {fields.map((field, idx) => {
            const isRelation = field.type === 'relation';
            const isSelect = field.type === 'select';
            const isNumber = field.type === 'number';
            const isText = field.type === 'text' || field.type === 'editor';
            const isCloak = field.type === 'cloak';
            const isConfigurable = isRelation || isSelect || isNumber || isText || isCloak;
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
                  {/* 1. Order & Reorder Controls */}
                  <div {...stylex.props(styles.orderCell)}>
                    <span {...stylex.props(styles.orderNumber)}>{idx + 1}</span>
                    <div {...stylex.props(styles.orderActions)}>
                      <Button
                        variant="outline"
                        size="sm"
                        isIcon
                        aria-label={`Move ${field.name || `field ${idx + 1}`} up`}
                        isDisabled={idx === 0}
                        onPress={() => handleMoveField(idx, -1)}
                      >
                        <CaretUpIcon size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        isIcon
                        aria-label={`Move ${field.name || `field ${idx + 1}`} down`}
                        isDisabled={idx === fields.length - 1}
                        onPress={() => handleMoveField(idx, 1)}
                      >
                        <CaretDownIcon size={12} />
                      </Button>
                    </div>
                  </div>

                  {/* 2. Field Name */}
                  <TextField
                    aria-label={`Field ${idx + 1} name`}
                    placeholder="fieldName (e.g. authorId)"
                    value={field.name}
                    onChange={(val) => handleFieldChange(idx, 'name', val)}
                    isInvalid={isInvalid}
                  />

                  {/* 3. Field Type Selector */}
                  <ComboBox
                    aria-label={`Field ${idx + 1} type`}
                    placeholder="Select Type"
                    menuTrigger="focus"
                    selectedKey={field.type}
                    onSelectionChange={(val) => {
                      if (val) handleFieldChange(idx, 'type', String(val));
                    }}
                    renderEmptyState={() => (
                      <div {...stylex.props(styles.emptyMenuState)}>
                        No matching types found
                      </div>
                    )}
                  >
                    {FIELD_TYPES.map((t) => {
                      const IconComp = t.icon;
                      return (
                        <ComboBoxItem key={t.id} id={t.id} textValue={t.label}>
                          <div {...stylex.props(styles.comboBoxItemContent)}>
                            <IconComp size={15} color={tokens.colorPrimary500} />
                            <span>{t.label}</span>
                          </div>
                        </ComboBoxItem>
                      );
                    })}
                  </ComboBox>

                  {/* 4. Required Checkbox */}
                  <div {...stylex.props(styles.checkboxCell)}>
                    <Checkbox
                      aria-label={`${field.name || `Field ${idx + 1}`} is required`}
                      isSelected={Boolean(field.required)}
                      onChange={(checked) => handleFieldChange(idx, 'required', checked)}
                    />
                  </div>

                  {/* 5. Options & Rules Button */}
                  <div {...stylex.props(styles.optionsCell)}>
                    {isConfigurable ? (
                      <Button
                        variant={
                          isRelation
                            ? (field.relationConfig?.targetMoul ? 'secondary' : 'outline')
                            : isCloak
                              ? (field.searchable ? 'secondary' : 'outline')
                              : ((isText && (field.min !== undefined || field.max !== undefined)) ||
                                (isNumber && (field.min !== undefined || field.max !== undefined)) ||
                                (isSelect && (field.options || []).length > 0))
                                ? 'secondary'
                                : 'outline'
                        }
                        aria-label={`Configure options for ${field.name || `field ${idx + 1}`}`}
                        onPress={() => toggleExpand(idx)}
                      >
                        {isRelation ? (
                          <>
                            <LinkIcon size={13} color={tokens.colorPrimary500} />
                            <span {...stylex.props(styles.truncatedText)}>
                              {field.relationConfig?.targetMoul
                                ? `➔ ${field.relationConfig.targetMoul}`
                                : 'Configure'}
                            </span>
                            {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                          </>
                        ) : isCloak ? (
                          <>
                            <LockKeyIcon size={13} color={tokens.colorPrimary500} />
                            <span>{field.searchable ? 'Searchable' : 'Options'}</span>
                            {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                          </>
                        ) : isSelect ? (
                          <>
                            <TagIcon size={13} color={tokens.colorPrimary500} />
                            <span>{(field.options || []).length} options</span>
                            {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                          </>
                        ) : isText ? (
                          <>
                            <SlidersIcon size={13} color={tokens.colorPrimary500} />
                            <span>
                              {field.min !== undefined || field.max !== undefined
                                ? `${field.min ?? 0}..${field.max ?? '∞'} chars`
                                : 'Length'}
                            </span>
                            {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                          </>
                        ) : (
                          <>
                            <SlidersIcon size={13} color={tokens.colorPrimary500} />
                            <span>
                              {field.min !== undefined || field.max !== undefined
                                ? `${field.min ?? '-∞'}..${field.max ?? '+∞'}`
                                : 'Min/Max'}
                            </span>
                            {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                          </>
                        )}
                      </Button>
                    ) : (
                      <span {...stylex.props(styles.placeholderDash)}>
                        —
                      </span>
                    )}
                  </div>

                  {/* 6. Actions (Delete) */}
                  <div {...stylex.props(styles.actionsCell)}>
                    <Button
                      variant="ghost"
                      isIcon
                      size="sm"
                      aria-label={`Remove field ${field.name || `field ${idx + 1}`}`}
                      onPress={() => handleRemoveField(idx)}
                    >
                      <TrashIcon size={16} color={tokens.colorError500} />
                    </Button>
                  </div>
                </div>

                {/* Validation Warnings Section */}
                {isInvalid && (
                  <div {...stylex.props(styles.fieldValidationRow)}>
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
                            size="sm"
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
                )}

                {/* Expandable Configuration Section */}
                {isExpanded && isConfigurable && (
                  <div {...stylex.props(styles.expandedConfigPanel)}>
                    {/* 1. Relation Configurator */}
                    {isRelation && (
                      <div {...stylex.props(styles.panelSection)}>
                        <div {...stylex.props(styles.relationHelperBanner)}>
                          <InfoIcon size={15} color={tokens.colorPrimary500} />
                          <span>
                            Relational link from <strong>{currentMoulName || 'this collection'}</strong> to target collection.
                          </span>
                        </div>

                        <div {...stylex.props(styles.relationGrid)}>
                          <ComboBox
                            label="Target Collection"
                            placeholder="Choose collection"
                            menuTrigger="focus"
                            selectedKey={field.relationConfig?.targetMoul || (allMouls?.[0]?.name || 'users')}
                            onSelectionChange={(key) => {
                              if (key) handleRelationConfigChange(idx, 'targetMoul', String(key));
                            }}
                            renderEmptyState={() => (
                              <div {...stylex.props(styles.emptyMenuState)}>
                                No matching items found
                              </div>
                            )}
                          >
                            {(allMouls || []).map((m: any) => (
                              <ComboBoxItem key={m.name} id={m.name} textValue={m.name}>
                                {m.name} {m.name === currentMoulName ? '(Self)' : `(${m.type})`}
                              </ComboBoxItem>
                            ))}
                          </ComboBox>

                          <ComboBox
                            label="Relationship Type"
                            placeholder="Choose cardinality"
                            menuTrigger="focus"
                            selectedKey={field.relationConfig?.cardinality || '1:N'}
                            onSelectionChange={(key) => {
                              if (key) handleRelationConfigChange(idx, 'cardinality', String(key));
                            }}
                            renderEmptyState={() => (
                              <div {...stylex.props(styles.emptyMenuState)}>
                                No matching items found
                              </div>
                            )}
                          >
                            <ComboBoxItem id="1:N" textValue="1:N Single Reference">1:N — Single Reference (Many-to-One)</ComboBoxItem>
                            <ComboBoxItem id="1:1" textValue="1:1 Unique Reference">1:1 — Unique Reference (One-to-One)</ComboBoxItem>
                            <ComboBoxItem id="M:N" textValue="M:N Multiple References">M:N — Multiple References (Many-to-Many)</ComboBoxItem>
                          </ComboBox>

                          <ComboBox
                            label="When Target is Deleted"
                            placeholder="Choose delete rule"
                            menuTrigger="focus"
                            selectedKey={field.relationConfig?.onDelete || 'SET_NULL'}
                            onSelectionChange={(key) => {
                              if (key) handleRelationConfigChange(idx, 'onDelete', String(key));
                            }}
                            renderEmptyState={() => (
                              <div {...stylex.props(styles.emptyMenuState)}>
                                No matching items found
                              </div>
                            )}
                          >
                            <ComboBoxItem id="SET_NULL" textValue="SET_NULL">SET_NULL (Clear link, keep record)</ComboBoxItem>
                            <ComboBoxItem id="CASCADE" textValue="CASCADE">CASCADE (Delete record too)</ComboBoxItem>
                            <ComboBoxItem id="RESTRICT" textValue="RESTRICT">RESTRICT (Prevent deleting target)</ComboBoxItem>
                          </ComboBox>
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
                            <span {...stylex.props(styles.emptyOptionsState)}>
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
                        <div {...stylex.props(styles.addOptionRow)}>
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
                      <div {...stylex.props(styles.constraintSection)}>
                        <span {...stylex.props(styles.constraintLabel)}>
                          Character Length Limits (optional):
                        </span>
                        <div {...stylex.props(styles.numberInputsRow)}>
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
                      <div {...stylex.props(styles.constraintSection)}>
                        <span {...stylex.props(styles.constraintLabel)}>
                          Numeric Range Limits (optional):
                        </span>
                        <div {...stylex.props(styles.numberInputsRow)}>
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

                    {/* 5. Encrypted Cloak Constraints */}
                    {isCloak && (
                      <div {...stylex.props(styles.panelSection)}>
                        <div {...stylex.props(styles.securityHeader)}>
                          <LockKeyIcon size={16} color={tokens.colorPrimary500} />
                          <span {...stylex.props(styles.securityTitle)}>
                            Encrypted Field (Cloak) Security Configuration
                          </span>
                        </div>
                        <div {...stylex.props(styles.securityRow)}>
                          <Checkbox
                            isSelected={Boolean(field.searchable)}
                            onChange={(checked) => handleFieldChange(idx, 'searchable', checked)}
                          >
                            <span {...stylex.props(styles.securityCheckboxLabel)}>
                              Enable Searchable Ciphertext (Blind Indexing)
                            </span>
                          </Checkbox>
                        </div>
                        <span {...stylex.props(styles.securityDescription)}>
                          Enables exact equality queries on encrypted fields using a deterministic blind index HMAC without revealing plaintext to the database server.
                        </span>
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
