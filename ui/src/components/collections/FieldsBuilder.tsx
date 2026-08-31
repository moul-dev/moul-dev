import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Button,
  TextField,
  NumberField,
  Select,
  SelectItem,
  Checkbox,
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
    flexWrap: 'wrap',
    gap: tokens.spacing1,
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  systemFieldPill: {
    backgroundColor: tokens.colorBgElevated,
    paddingBlock: '1px',
    paddingInline: tokens.spacing2,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    fontFamily: 'var(--font-mono, monospace)',
    color: tokens.colorFg,
    fontSize: '0.6875rem',
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
  tagGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacing1,
    alignItems: 'center',
  },
  tagItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    paddingBlock: '3px',
    paddingInline: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    borderRadius: tokens.radiusSm,
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  tagDeleteBtn: {
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    color: tokens.colorFgSubtle,
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    lineHeight: 1,
  },
  emptyNotice: {
    padding: tokens.spacing4,
    textAlign: 'center',
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tokens.colorBorder,
    color: tokens.colorFgSubtle,
    fontSize: tokens.fontSizeXs,
    fontFamily: tokens.fontFamilyBase,
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
}

export function FieldsBuilder({
  fields,
  onChange,
  currentMoulName = '',
  allMouls = [],
}: FieldsBuilderProps) {
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>({});
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});

  const handleAddField = () => {
    const nextIdx = fields.length;
    const next = [
      ...fields,
      {
        name: `field_${nextIdx + 1}`,
        type: 'text',
        required: false,
      },
    ];
    onChange(next);
  };

  const handleAddRelationField = () => {
    const nextIdx = fields.length;
    const otherMoul = allMouls?.find((m: any) => m.name !== currentMoulName)?.name || currentMoulName || 'users';
    const defaultName = otherMoul === currentMoulName ? 'parent_id' : `${otherMoul.replace(/s$/, '')}_id`;

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
      if (!updated.relationConfig) {
        const defaultTarget = allMouls?.find((m: any) => m.name !== currentMoulName)?.name || currentMoulName || 'users';
        updated.relationConfig = {
          targetMoul: defaultTarget,
          cardinality: '1:N',
          onDelete: 'SET_NULL',
        };
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

      {/* Built-in System Fields Row */}
      <div {...stylex.props(styles.systemFieldsBanner)}>
        <InfoIcon size={14} color={tokens.colorPrimary500} />
        <span>Built-in system columns:</span>
        <span {...stylex.props(styles.systemFieldPill)}>id</span>
        <span {...stylex.props(styles.systemFieldPill)}>created_at</span>
        <span {...stylex.props(styles.systemFieldPill)}>updated_at</span>
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <div {...stylex.props(styles.emptyNotice)}>
          No custom fields yet. Click <strong>Add Field</strong> or <strong>Add Relation</strong> above to add fields.
        </div>
      ) : (
        <div {...stylex.props(styles.fieldList)}>
          {fields.map((field, idx) => {
            const isRelation = field.type === 'relation';
            const isSelect = field.type === 'select';
            const isNumber = field.type === 'number';
            const isConfigurable = isRelation || isSelect || isNumber;
            const isExpanded = Boolean(expandedFields[idx]);

            return (
              <div
                key={idx}
                {...stylex.props(
                  styles.fieldCard,
                  isRelation && styles.fieldCardRelation
                )}
              >
                {/* Main Row */}
                <div {...stylex.props(styles.fieldMainRow)}>
                  <TextField
                    placeholder="Field name"
                    value={field.name}
                    onChange={(val) => handleFieldChange(idx, 'name', val)}
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
                        ) : (
                          <>
                            <SlidersIcon size={14} />
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
                        <span style={{ fontSize: tokens.fontSizeXs, fontWeight: 500, color: tokens.colorFg }}>
                          Allowed Options:
                        </span>
                        <div {...stylex.props(styles.tagGroup)}>
                          {(field.options || []).map((opt: string) => (
                            <span key={opt} {...stylex.props(styles.tagItem)}>
                              <span>{opt}</span>
                              <button
                                type="button"
                                {...stylex.props(styles.tagDeleteBtn)}
                                onClick={() => handleRemoveOption(idx, opt)}
                                aria-label={`Remove option ${opt}`}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
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

                    {/* 3. Number Min/Max Constraints */}
                    {isNumber && (
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
