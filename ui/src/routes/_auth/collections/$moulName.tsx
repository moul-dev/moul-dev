import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  FloppyDiskIcon,
  DatabaseIcon,
  LinkIcon,
  ShareNetworkIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../../api/client';
import { FieldsBuilder, MoulField } from '../../../components/collections/FieldsBuilder';
import { RulesEditor, MoulRules } from '../../../components/collections/RulesEditor';

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

  const [fields, setFields] = useState<MoulField[]>([]);
  const [rules, setRules] = useState<MoulRules>({
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
  });

  useEffect(() => {
    if (moul) {
      setFields(moul.fields || []);
      setRules(moul.rules || {});
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
                      <strong style={{ color: tokens.colorPrimary400 }}>{f.relationConfig?.targetMoul}</strong>
                      {f.relationConfig?.targetMoul === moulName && (
                        <Badge size="sm" variant="neutral">self</Badge>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Badge size="sm" variant="primary">{f.relationConfig?.cardinality || '1:N'}</Badge>
                      <Badge size="sm" variant="neutral">{f.relationConfig?.onDelete || 'SET_NULL'}</Badge>
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
        <CardBody>
          <FieldsBuilder
            fields={fields}
            onChange={setFields}
            currentMoulName={moulName}
            allMouls={allMouls}
          />
        </CardBody>
      </Card>

      {/* Access Rules (CEL) */}
      <Card variant="glass">
        <CardBody>
          <RulesEditor
            rules={rules}
            onChange={setRules}
            collectionFields={fields}
            allCollections={allMouls}
            isAuthCollection={moul?.type === 'auth'}
          />
        </CardBody>
      </Card>
    </div>
  );
}
