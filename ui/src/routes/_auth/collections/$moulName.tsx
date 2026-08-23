import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  PlusIcon,
  TrashIcon,
  FloppyDiskIcon,
  DatabaseIcon,
  LockKeyIcon,
  LinkIcon,
  ShareNetworkIcon,
  ArrowRightIcon,
  InfoIcon,
  CaretDownIcon,
  CaretUpIcon,
  SlidersIcon,
  TagIcon,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  TextField,
  NumberField,
  Select,
  SelectItem,
  Checkbox,
  Badge,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
    maxWidth: '1100px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  fieldCard: {
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    overflow: 'hidden',
    transition: 'border-color 0.15s ease',
  },
  fieldCardRelation: {
    borderColor: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgElevated,
  },
  fieldMainRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, 2fr) minmax(180px, 1.5fr) auto auto auto',
    gap: tokens.spacing3,
    alignItems: 'center',
    padding: tokens.spacing3,
  },
  fieldControls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  expandedConfigPanel: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorBorderSubtle,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgSubtle,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  relationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: tokens.spacing3,
  },
  relationHelperBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacing2,
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
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
    gap: '4px',
    paddingBlock: '2px',
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
  },
  associationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacing4,
  },
  associationColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
  associationColTitle: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  associationItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    fontSize: tokens.fontSizeXs,
    fontFamily: tokens.fontFamilyBase,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: tokens.spacing3,
  },
});

export const Route = createFileRoute('/_auth/collections/$moulName')({
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { moulName } = useParams({ from: '/_auth/collections/$moulName' });
  const queryClient = useQueryClient();

  // 1. Load active collection
  const { data: moul, isLoading } = useQuery({
    queryKey: ['moul', moulName],
    queryFn: () => api.getMoul(moulName),
  });

  // 2. Load all collections for target relation options & association graph
  const { data: allMouls } = useQuery({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  });

  const [fields, setFields] = useState<any[]>([]);
  const [rules, setRules] = useState<any>({
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
  });

  // Track expanded config state for each field
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>({});
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (moul) {
      setFields(moul.fields || []);
      setRules(moul.rules || {});
      // Auto expand relation & select fields initially
      const initialExpanded: Record<number, boolean> = {};
      (moul.fields || []).forEach((f: any, idx: number) => {
        if (f.type === 'relation' || f.type === 'select') {
          initialExpanded[idx] = true;
        }
      });
      setExpandedFields(initialExpanded);
    }
  }, [moul]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateMoul(moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moul', moulName] });
      queryClient.invalidateQueries({ queryKey: ['mouls'] });
      toastQueue.add({
        title: 'Schema Saved',
        description: 'Collection schema and associations saved successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Save Failed',
        description: err.message || 'Failed to save collection schema.',
        variant: 'error',
      });
    },
  });

  const handleAddField = () => {
    const nextIdx = fields.length;
    setFields([
      ...fields,
      {
        name: `field_${nextIdx + 1}`,
        type: 'text',
        required: false,
      },
    ]);
  };

  const handleAddRelationField = () => {
    const nextIdx = fields.length;
    // Pick first other collection or current collection
    const otherMoul = allMouls?.find((m: any) => m.name !== moulName)?.name || moulName;
    const defaultName = otherMoul === moulName ? 'parent_id' : `${otherMoul.replace(/s$/, '')}_id`;

    setFields([
      ...fields,
      {
        name: defaultName,
        type: 'relation',
        required: false,
        relationConfig: {
          targetMoul: otherMoul,
          cardinality: '1:N',
          onDelete: 'SET_NULL',
        },
      },
    ]);

    setExpandedFields((prev) => ({ ...prev, [nextIdx]: true }));
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
    const nextExp = { ...expandedFields };
    delete nextExp[idx];
    setExpandedFields(nextExp);
  };

  const handleFieldChange = (idx: number, key: string, val: any) => {
    const next = [...fields];
    const updated = { ...next[idx], [key]: val };

    // If changing type to relation, guarantee relationConfig is present
    if (key === 'type' && val === 'relation') {
      if (!updated.relationConfig) {
        const defaultTarget = allMouls?.find((m: any) => m.name !== moulName)?.name || moulName;
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
    setFields(next);
  };

  const handleRelationConfigChange = (idx: number, key: string, val: any) => {
    const next = [...fields];
    const currConfig = next[idx].relationConfig || {
      targetMoul: moulName,
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
    setFields(next);
  };

  const handleAddOption = (idx: number) => {
    const val = (newOptionInputs[idx] || '').trim();
    if (!val) return;
    const next = [...fields];
    const currOpts = next[idx].options || [];
    if (!currOpts.includes(val)) {
      next[idx] = { ...next[idx], options: [...currOpts, val] };
      setFields(next);
    }
    setNewOptionInputs((prev) => ({ ...prev, [idx]: '' }));
  };

  const handleRemoveOption = (idx: number, optToRemove: string) => {
    const next = [...fields];
    const currOpts = next[idx].options || [];
    next[idx] = { ...next[idx], options: currOpts.filter((o: string) => o !== optToRemove) };
    setFields(next);
  };

  const toggleExpand = (idx: number) => {
    setExpandedFields((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSave = () => {
    // Clean up fields before saving
    const cleanedFields = fields.map((f) => {
      const cleanField = { ...f, name: f.name.trim() };
      if (cleanField.type === 'relation') {
        if (!cleanField.relationConfig) {
          cleanField.relationConfig = {
            targetMoul: moulName,
            cardinality: '1:N',
            onDelete: 'SET_NULL',
          };
        }
      }
      return cleanField;
    });

    updateMutation.mutate({
      name: moulName,
      fields: cleanedFields,
      rules,
    });
  };

  // Compute Outgoing and Incoming Relationships for Association Summary Card
  const outgoingRelations = useMemo(() => {
    return fields.filter((f) => f.type === 'relation' && f.relationConfig);
  }, [fields]);

  const incomingRelations = useMemo(() => {
    if (!allMouls) return [];
    const incoming: { sourceMoul: string; fieldName: string; cardinality: string; onDelete: string }[] = [];
    allMouls.forEach((m: any) => {
      if (m.name === moulName) return; // ignore self, already in outgoing
      (m.fields || []).forEach((f: any) => {
        if (f.type === 'relation' && f.relationConfig?.targetMoul === moulName) {
          incoming.push({
            sourceMoul: m.name,
            fieldName: f.name,
            cardinality: f.relationConfig.cardinality || '1:N',
            onDelete: f.relationConfig.onDelete || 'SET_NULL',
          });
        }
      });
    });
    return incoming;
  }, [allMouls, moulName]);

  if (isLoading) {
    return <div style={{ color: tokens.colorFgSubtle }}>Loading collection schema...</div>;
  }

  return (
    <div {...stylex.props(styles.container)}>
      {/* Top Header */}
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <DatabaseIcon size={24} color={tokens.colorPrimary500} />
            <span>{moulName}</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Configure relational associations, schema constraints, and CEL security access rules.
          </span>
        </div>
        <div {...stylex.props(styles.headerActions)}>
          <Button
            variant="primary"
            onPress={handleSave}
            isDisabled={updateMutation.isPending}
          >
            <FloppyDiskIcon size={16} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Schema'}</span>
          </Button>
        </div>
      </div>

      {/* Associations Graph / Summary Card */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.sectionHeader)}>
            <h2 {...stylex.props(styles.sectionTitle)}>
              <ShareNetworkIcon size={18} color={tokens.colorPrimary500} />
              <span>Associations & Relationships Graph</span>
            </h2>
            <Badge variant={outgoingRelations.length > 0 || incomingRelations.length > 0 ? 'primary' : 'neutral'}>
              {outgoingRelations.length + incomingRelations.length} active association{outgoingRelations.length + incomingRelations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div {...stylex.props(styles.associationsGrid)}>
            {/* Outgoing References */}
            <div {...stylex.props(styles.associationColumn)}>
              <div {...stylex.props(styles.associationColTitle)}>
                <ArrowRightIcon size={14} color={tokens.colorPrimary500} />
                <span>Outgoing References ({outgoingRelations.length})</span>
              </div>
              {outgoingRelations.length === 0 ? (
                <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeXs }}>
                  No outgoing foreign relations configured in this collection.
                </span>
              ) : (
                outgoingRelations.map((f, i) => (
                  <div key={i} {...stylex.props(styles.associationItem)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LinkIcon size={14} color={tokens.colorPrimary500} />
                      <strong style={{ color: tokens.colorFg }}>{f.name}</strong>
                      <span style={{ color: tokens.colorFgSubtle }}>➔</span>
                      <strong style={{ color: tokens.colorPrimary400 }}>{f.relationConfig.targetMoul}</strong>
                      {f.relationConfig.targetMoul === moulName && (
                        <Badge size="sm" variant="neutral">self</Badge>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Badge size="sm" variant="primary">{f.relationConfig.cardinality || '1:N'}</Badge>
                      <Badge size="sm" variant="neutral">{f.relationConfig.onDelete || 'SET_NULL'}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Incoming References */}
            <div {...stylex.props(styles.associationColumn)}>
              <div {...stylex.props(styles.associationColTitle)}>
                <ShareNetworkIcon size={14} color={tokens.colorSuccess500} />
                <span>Incoming References ({incomingRelations.length})</span>
              </div>
              {incomingRelations.length === 0 ? (
                <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeXs }}>
                  No other collections reference {moulName} yet.
                </span>
              ) : (
                incomingRelations.map((inc, i) => (
                  <div key={i} {...stylex.props(styles.associationItem)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: tokens.colorPrimary400 }}>{inc.sourceMoul}</strong>
                      <span style={{ color: tokens.colorFgSubtle }}>({inc.fieldName})</span>
                      <span style={{ color: tokens.colorFgSubtle }}>➔</span>
                      <strong style={{ color: tokens.colorFg }}>{moulName}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Badge size="sm" variant="success">{inc.cardinality}</Badge>
                      <Badge size="sm" variant="neutral">{inc.onDelete}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Fields Definition Designer */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.sectionHeader)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
              <SlidersIcon size={18} color={tokens.colorPrimary500} />
              <h2 {...stylex.props(styles.sectionTitle)}>Fields Definition & Associations</h2>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing2 }}>
              <Button size="sm" variant="secondary" onPress={handleAddRelationField}>
                <LinkIcon size={14} />
                <span>Add Relation</span>
              </Button>
              <Button size="sm" variant="primary" onPress={handleAddField}>
                <PlusIcon size={14} />
                <span>Add Field</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {fields.length === 0 ? (
            <div style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm, textAlign: 'center', padding: tokens.spacing4 }}>
              No custom fields defined. Click "Add Field" or "Add Relation" to begin modeling.
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
                        placeholder="Field name (e.g. author_id)"
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
                        <SelectItem id="datetime">DateTime</SelectItem>
                        <SelectItem id="file">File Attachment</SelectItem>
                        <SelectItem id="json">JSON Object</SelectItem>
                        <SelectItem id="editor">Rich Text / HTML</SelectItem>
                        <SelectItem id="select">Single Select (Enum)</SelectItem>
                        <SelectItem id="relation">🔗 Relation (Association)</SelectItem>
                      </Select>

                      <Checkbox
                        isSelected={Boolean(field.required)}
                        onChange={(checked) => handleFieldChange(idx, 'required', checked)}
                      >
                        Required
                      </Checkbox>

                      {/* Association / Config Trigger */}
                      <div {...stylex.props(styles.fieldControls)}>
                        {isConfigurable && (
                          <Button
                            size="sm"
                            variant={isRelation ? 'secondary' : 'outline'}
                            aria-label={`Configure ${field.name}`}
                            onPress={() => toggleExpand(idx)}
                          >
                            {isRelation ? (
                              <>
                                <LinkIcon size={14} color={tokens.colorPrimary500} />
                                <span style={{ fontSize: tokens.fontSizeXs }}>
                                  {field.relationConfig?.targetMoul
                                    ? `➔ ${field.relationConfig.targetMoul} (${field.relationConfig.cardinality || '1:N'})`
                                    : 'Configure Relation'}
                                </span>
                                {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                              </>
                            ) : isSelect ? (
                              <>
                                <TagIcon size={14} />
                                <span style={{ fontSize: tokens.fontSizeXs }}>
                                  {(field.options || []).length} Options
                                </span>
                                {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                              </>
                            ) : (
                              <>
                                <SlidersIcon size={14} />
                                {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Remove field ${field.name || idx}`}
                          onPress={() => handleRemoveField(idx)}
                        >
                          <TrashIcon size={16} color={tokens.colorError500} />
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Configuration Section */}
                    {isExpanded && isConfigurable && (
                      <div {...stylex.props(styles.expandedConfigPanel)}>
                        {/* 1. Relation Configurator */}
                        {isRelation && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing3 }}>
                            <div {...stylex.props(styles.relationHelperBanner)}>
                              <InfoIcon size={16} color={tokens.colorPrimary500} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <strong>Relational Association Settings:</strong> Build 1:1, 1:N (foreign key), or M:N (many-to-many) associations directly linking <code>{moulName}</code> with any collection in your database.
                              </div>
                            </div>

                            <div {...stylex.props(styles.relationGrid)}>
                              {/* Target Collection */}
                              <Select
                                label="Target Collection"
                                placeholder="Choose collection"
                                selectedKey={field.relationConfig?.targetMoul || (allMouls?.[0]?.name || moulName)}
                                onSelectionChange={(key) => handleRelationConfigChange(idx, 'targetMoul', String(key))}
                              >
                                {(allMouls || []).map((m: any) => (
                                  <SelectItem key={m.name} id={m.name} textValue={m.name}>
                                    {m.name} {m.name === moulName ? '(Self Referencing / Tree)' : `(${m.type})`}
                                  </SelectItem>
                                ))}
                              </Select>

                              {/* Cardinality */}
                              <Select
                                label="Cardinality / Association Type"
                                placeholder="Choose cardinality"
                                selectedKey={field.relationConfig?.cardinality || '1:N'}
                                onSelectionChange={(key) => handleRelationConfigChange(idx, 'cardinality', String(key))}
                              >
                                <SelectItem id="1:1" textValue="1:1 One-to-One">
                                  1:1 — One-to-One (Unique target record)
                                </SelectItem>
                                <SelectItem id="1:N" textValue="1:N Many-to-One">
                                  1:N — Many-to-One (Single foreign reference)
                                </SelectItem>
                                <SelectItem id="M:N" textValue="M:N Many-to-Many">
                                  M:N — Many-to-Many (Multiple record IDs array)
                                </SelectItem>
                              </Select>

                              {/* On-Delete Policy */}
                              <Select
                                label="On-Delete Policy"
                                placeholder="Choose delete rule"
                                selectedKey={field.relationConfig?.onDelete || 'SET_NULL'}
                                onSelectionChange={(key) => handleRelationConfigChange(idx, 'onDelete', String(key))}
                              >
                                <SelectItem id="SET_NULL" textValue="SET_NULL (Default)">
                                  SET_NULL — Clear reference when target is deleted
                                </SelectItem>
                                <SelectItem id="CASCADE" textValue="CASCADE (Delete Cascade)">
                                  CASCADE — Delete this record when target is deleted
                                </SelectItem>
                                <SelectItem id="RESTRICT" textValue="RESTRICT (Block Delete)">
                                  RESTRICT — Block deleting target if referenced here
                                </SelectItem>
                              </Select>
                            </div>
                          </div>
                        )}

                        {/* 2. Select Options Configurator */}
                        {isSelect && (
                          <div {...stylex.props(styles.optionsGrid)}>
                            <span style={{ fontSize: tokens.fontSizeSm, fontWeight: 500, color: tokens.colorFg }}>
                              Select Allowed Options (Enum):
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
                                aria-label="New option"
                                placeholder="Add option item..."
                                value={newOptionInputs[idx] || ''}
                                onChange={(val) => setNewOptionInputs((prev) => ({ ...prev, [idx]: val }))}
                                onKeyDown={(e: React.KeyboardEvent) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddOption(idx);
                                  }
                                }}
                              />
                              <Button size="sm" variant="secondary" onPress={() => handleAddOption(idx)}>
                                Add
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* 3. Number Min/Max Constraints */}
                        {isNumber && (
                          <div style={{ display: 'flex', gap: tokens.spacing3, maxWidth: '400px' }}>
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
        </CardBody>
      </Card>

      {/* Access Rules (CEL) */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.sectionHeader)}>
            <h2 {...stylex.props(styles.sectionTitle)}>
              <LockKeyIcon size={18} />
              <span>API Access Rules (CEL Expressions)</span>
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeXs, marginBottom: tokens.spacing4 }}>
            Leave blank for public access. Set to <code>@request.auth.id != ""</code> for authenticated users only.
            CEL rules can inspect relational fields like <code>author_id == @request.auth.id</code>.
          </p>

          <div {...stylex.props(styles.rulesGrid)}>
            <TextField
              label="List Rule (GET /api/moul/:name/records)"
              placeholder="e.g. status = 'published' || @request.auth.id != ''"
              value={rules.listRule || ''}
              onChange={(val) => setRules({ ...rules, listRule: val })}
            />
            <TextField
              label="View Rule (GET /api/moul/:name/records/:id)"
              placeholder="e.g. id = @request.auth.id"
              value={rules.viewRule || ''}
              onChange={(val) => setRules({ ...rules, viewRule: val })}
            />
            <TextField
              label="Create Rule (POST /api/moul/:name/records)"
              placeholder="e.g. @request.auth.id != ''"
              value={rules.createRule || ''}
              onChange={(val) => setRules({ ...rules, createRule: val })}
            />
            <TextField
              label="Update Rule (PATCH /api/moul/:name/records/:id)"
              placeholder="e.g. user_id = @request.auth.id"
              value={rules.updateRule || ''}
              onChange={(val) => setRules({ ...rules, updateRule: val })}
            />
            <TextField
              label="Delete Rule (DELETE /api/moul/:name/records/:id)"
              placeholder="e.g. user_id = @request.auth.id"
              value={rules.deleteRule || ''}
              onChange={(val) => setRules({ ...rules, deleteRule: val })}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
