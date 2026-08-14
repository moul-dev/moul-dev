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
  EnvelopeSimple,
  WebhooksLogo,
} from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../../theme/tokens.stylex';
import { api } from '../../../api/client';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
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
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  section: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderMuted,
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr auto',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderMuted,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: spacing.md,
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setSuccessMsg('Collection schema saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
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
    return <div style={{ color: '#64748b' }}>Loading collection schema...</div>;
  }

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <Database size={24} color="#0ea5e9" />
            <span>{moulName}</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Configure fields schema, validation constraints, and CEL security rules.
          </span>
        </div>
        <Button
          variant="primary"
          icon={<FloppyDisk size={16} />}
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Schema'}
        </Button>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#064e3b33',
            color: '#6ee7b7',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            border: '1px solid #10b981',
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Fields Designer */}
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Fields Definition</h2>
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={handleAddField}>
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
            No custom fields defined. Click "Add Field" to add columns.
          </div>
        ) : (
          fields.map((field, idx) => (
            <div key={idx} {...stylex.props(styles.fieldRow)}>
              <Input
                placeholder="Field name"
                value={field.name}
                onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
              />
              <Select
                value={field.type}
                onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                options={[
                  { value: 'text', label: 'Text' },
                  { value: 'number', label: 'Number' },
                  { value: 'bool', label: 'Boolean' },
                  { value: 'email', label: 'Email' },
                  { value: 'url', label: 'URL' },
                  { value: 'file', label: 'File Attachment' },
                  { value: 'json', label: 'JSON Object' },
                  { value: 'editor', label: 'Rich Text / Editor' },
                  { value: 'select', label: 'Single Select' },
                  { value: 'relation', label: 'Relation (Foreign Key)' },
                ]}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                />
                Required
              </label>
              <Button
                size="sm"
                variant="ghost"
                icon={<Trash size={16} color="#ef4444" />}
                onClick={() => handleRemoveField(idx)}
              />
            </div>
          ))
        )}
      </div>

      {/* Access Rules (CEL) */}
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <h2 {...stylex.props(styles.sectionTitle)}>
            <LockKey size={18} />
            <span>API Access Rules (CEL Expressions)</span>
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.8125rem', margin: 0 }}>
          Leave blank for public access. Set to <code>@request.auth.id != ""</code> for authenticated users only.
        </p>

        <div {...stylex.props(styles.rulesGrid)}>
          <Input
            label="List Rule (GET /api/moul/:name/records)"
            placeholder="e.g. status = 'published' || @request.auth.id != ''"
            value={rules.listRule || ''}
            onChange={(e) => setRules({ ...rules, listRule: e.target.value })}
          />
          <Input
            label="View Rule (GET /api/moul/:name/records/:id)"
            placeholder="e.g. id = @request.auth.id"
            value={rules.viewRule || ''}
            onChange={(e) => setRules({ ...rules, viewRule: e.target.value })}
          />
          <Input
            label="Create Rule (POST /api/moul/:name/records)"
            placeholder="e.g. @request.auth.id != ''"
            value={rules.createRule || ''}
            onChange={(e) => setRules({ ...rules, createRule: e.target.value })}
          />
          <Input
            label="Update Rule (PATCH /api/moul/:name/records/:id)"
            placeholder="e.g. user_id = @request.auth.id"
            value={rules.updateRule || ''}
            onChange={(e) => setRules({ ...rules, updateRule: e.target.value })}
          />
          <Input
            label="Delete Rule (DELETE /api/moul/:name/records/:id)"
            placeholder="e.g. user_id = @request.auth.id"
            value={rules.deleteRule || ''}
            onChange={(e) => setRules({ ...rules, deleteRule: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
