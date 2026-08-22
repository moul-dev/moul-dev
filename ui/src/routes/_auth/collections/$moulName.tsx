import React, { useState, useEffect } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  Plus,
  Trash,
  FloppyDisk,
  Database,
  LockKey,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  TextField,
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
    maxWidth: '1000px',
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
    gap: tokens.spacing1,
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr auto',
    gap: tokens.spacing3,
    alignItems: 'center',
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
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

  const { data: moul, isLoading } = useQuery({
    queryKey: ['moul', moulName],
    queryFn: () => api.getMoul(moulName),
  });

  const [fields, setFields] = useState<any[]>([]);
  const [rules, setRules] = useState<any>({
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
        description: 'Collection schema saved successfully.',
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
    setFields([
      ...fields,
      {
        name: `field_${fields.length + 1}`,
        type: 'text',
        required: false,
      },
    ]);
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx: number, key: string, val: any) => {
    const next = [...fields];
    next[idx] = { ...next[idx], [key]: val };
    setFields(next);
  };

  const handleSave = () => {
    updateMutation.mutate({
      fields,
      rules,
    });
  };

  if (isLoading) {
    return <div style={{ color: tokens.colorFgSubtle }}>Loading collection schema...</div>;
  }

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <Database size={24} color={tokens.colorPrimary500} />
            <span>{moulName}</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Configure fields schema, validation constraints, and CEL security rules.
          </span>
        </div>
        <Button
          variant="primary"
          onPress={handleSave}
          isDisabled={updateMutation.isPending}
        >
          <FloppyDisk size={16} />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Schema'}</span>
        </Button>
      </div>

      {/* Fields Designer */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.sectionHeader)}>
            <h2 {...stylex.props(styles.sectionTitle)}>Fields Definition</h2>
            <Button size="sm" variant="secondary" onPress={handleAddField}>
              <Plus size={14} />
              <span>Add Field</span>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {fields.length === 0 ? (
            <div style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm, textAlign: 'center', padding: tokens.spacing4 }}>
              No custom fields defined. Click "Add Field" to add columns.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {fields.map((field, idx) => (
                <div key={idx} {...stylex.props(styles.fieldRow)}>
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
                    <SelectItem id="text">Text</SelectItem>
                    <SelectItem id="number">Number</SelectItem>
                    <SelectItem id="bool">Boolean</SelectItem>
                    <SelectItem id="email">Email</SelectItem>
                    <SelectItem id="url">URL</SelectItem>
                    <SelectItem id="file">File Attachment</SelectItem>
                    <SelectItem id="json">JSON Object</SelectItem>
                    <SelectItem id="editor">Rich Text / Editor</SelectItem>
                    <SelectItem id="select">Single Select</SelectItem>
                    <SelectItem id="relation">Relation (Foreign Key)</SelectItem>
                  </Select>
                  <Checkbox
                    isSelected={Boolean(field.required)}
                    onChange={(checked) => handleFieldChange(idx, 'required', checked)}
                  >
                    Required
                  </Checkbox>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Remove field ${field.name || idx}`}
                    onPress={() => handleRemoveField(idx)}
                  >
                    <Trash size={16} color={tokens.colorError500} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Access Rules (CEL) */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.sectionHeader)}>
            <h2 {...stylex.props(styles.sectionTitle)}>
              <LockKey size={18} />
              <span>API Access Rules (CEL Expressions)</span>
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeXs, marginBottom: tokens.spacing4 }}>
            Leave blank for public access. Set to <code>@request.auth.id != ""</code> for authenticated users only.
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

