import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  Plus,
  Database,
  Trash,
  Sliders,
  Table,
  Lock,
} from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../../theme/tokens.stylex';
import { api } from '../../../api/client';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    maxWidth: '1200px',
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
    letterSpacing: '-0.025em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldsPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
    fontSize: '0.75rem',
    color: colors.textSecondary,
    fontFamily: fonts.mono,
  },
  fieldPill: {
    backgroundColor: colors.bgCard,
    paddingBlock: '2px',
    paddingInline: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderMuted,
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.borderMuted,
  },
  actionGroup: {
    display: 'flex',
    gap: spacing.xs,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
});

export const Route = createFileRoute('/_auth/collections/')({
  component: CollectionsPage,
});

function CollectionsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMoulName, setNewMoulName] = useState('');
  const [newMoulType, setNewMoulType] = useState('base');
  const [error, setError] = useState<string | null>(null);

  const { data: mouls, isLoading } = useQuery({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createMoul(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mouls'] });
      setIsCreateOpen(false);
      setNewMoulName('');
      setNewMoulType('base');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create collection');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.deleteMoul(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mouls'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      name: newMoulName.trim().toLowerCase(),
      type: newMoulType,
      fields: [],
      rules: {
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
      },
    });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Collections Schema</h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Design dynamic tables, configure field validations, and enforce access rules.
          </span>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} weight="bold" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Collection
        </Button>
      </div>

      {isLoading ? (
        <div style={{ color: '#64748b' }}>Loading collections...</div>
      ) : !mouls || mouls.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            backgroundColor: '#111827',
            borderRadius: '0.5rem',
            border: '1px solid #334155',
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          No collections created yet. Click "New Collection" to get started.
        </div>
      ) : (
        <div {...stylex.props(styles.grid)}>
          {mouls.map((moul: any) => (
            <div key={moul.name} {...stylex.props(styles.card)}>
              <div {...stylex.props(styles.cardTop)}>
                <div {...stylex.props(styles.cardTitle)}>
                  <Database size={20} color="#0ea5e9" />
                  <span>{moul.name}</span>
                </div>
                <Badge
                  variant={
                    moul.type === 'auth'
                      ? 'info'
                      : moul.type === 'worker'
                      ? 'warning'
                      : moul.type === 'analytic'
                      ? 'success'
                      : 'primary'
                  }
                >
                  {moul.type}
                </Badge>
              </div>

              <div {...stylex.props(styles.fieldsPreview)}>
                <span style={{ color: '#64748b' }}>Fields:</span>
                <span {...stylex.props(styles.fieldPill)}>id</span>
                <span {...stylex.props(styles.fieldPill)}>created_at</span>
                <span {...stylex.props(styles.fieldPill)}>updated_at</span>
                {moul.fields?.map((f: any) => (
                  <span key={f.name} {...stylex.props(styles.fieldPill)}>
                    {f.name} ({f.type})
                  </span>
                ))}
              </div>

              <div {...stylex.props(styles.cardActions)}>
                <div {...stylex.props(styles.actionGroup)}>
                  <Link
                    to="/records/$moulName"
                    params={{ moulName: moul.name }}
                    search={{ page: 1, perPage: 30 }}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button size="sm" variant="secondary" icon={<Table size={14} />}>
                      Records
                    </Button>
                  </Link>
                  <Link
                    to="/collections/$moulName"
                    params={{ moulName: moul.name }}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button size="sm" variant="ghost" icon={<Sliders size={14} />}>
                      Schema
                    </Button>
                  </Link>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash size={14} color="#ef4444" />}
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete collection "${moul.name}"?`)) {
                      deleteMutation.mutate(moul.name);
                    }
                  }}
                  title="Delete Collection"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Collection"
      >
        <form onSubmit={handleCreate} {...stylex.props(styles.form)}>
          {error && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#7f1d1d33',
                color: '#fca5a5',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <Input
            label="Collection Name"
            placeholder="e.g. posts, products, comments"
            value={newMoulName}
            onChange={(e) => setNewMoulName(e.target.value)}
            required
            helperText="Lower-case alphanumeric table identifier"
          />

          <Select
            label="Collection Type"
            value={newMoulType}
            onChange={(e) => setNewMoulType(e.target.value)}
            options={[
              { value: 'base', label: 'Base (General data CRUD)' },
              { value: 'auth', label: 'Auth (Users, password, passkey, OAuth2)' },
              { value: 'worker', label: 'Worker (Background job queue)' },
              { value: 'analytic', label: 'Analytic (Time-series & visitor tracking)' },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
