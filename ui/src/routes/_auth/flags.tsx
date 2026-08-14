import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Flag, Plus, Trash, Play, CheckCircle } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { api } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
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
    letterSpacing: '-0.025em',
  },
  flagList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  flagCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  flagKey: {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
  },
  flagDesc: {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  flagActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  evalSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderMuted,
  },
});

export const Route = createFileRoute('/_auth/flags')({
  component: FeatureFlagsPage,
});

function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEnabled, setNewEnabled] = useState(true);

  const { data: flags, isLoading } = useQuery({
    queryKey: ['flags'],
    queryFn: api.listFeatureFlags,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      setIsCreateOpen(false);
      setNewKey('');
      setNewDesc('');
      setNewEnabled(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => api.updateFeatureFlag(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => api.deleteFeatureFlag(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
    },
  });

  const handleToggle = (flag: any) => {
    updateMutation.mutate({
      key: flag.key,
      data: {
        enabled: !flag.enabled,
      },
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      key: newKey.trim(),
      description: newDesc.trim(),
      enabled: newEnabled,
      value_type: 'boolean',
      variations: [
        { value: true, name: 'On' },
        { value: false, name: 'Off' },
      ],
      rules: [],
    });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Feature Flags</h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Toggle features dynamically, configure gradual rollouts, and evaluate targeting rules.
          </span>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
          New Feature Flag
        </Button>
      </div>

      <div {...stylex.props(styles.flagList)}>
        {isLoading ? (
          <div style={{ color: '#64748b' }}>Loading feature flags...</div>
        ) : !flags || flags.length === 0 ? (
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
            No feature flags configured. Click "New Feature Flag" to create one.
          </div>
        ) : (
          flags.map((flag: any) => (
            <div key={flag.key} {...stylex.props(styles.flagCard)}>
              <div {...stylex.props(styles.flagInfo)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flag size={18} color="#0ea5e9" />
                  <span {...stylex.props(styles.flagKey)}>{flag.key}</span>
                  <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {flag.description && <span {...stylex.props(styles.flagDesc)}>{flag.description}</span>}
              </div>

              <div {...stylex.props(styles.flagActions)}>
                <Button
                  size="sm"
                  variant={flag.enabled ? 'secondary' : 'primary'}
                  onClick={() => handleToggle(flag)}
                >
                  {flag.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash size={14} color="#ef4444" />}
                  onClick={() => {
                    if (confirm(`Delete flag "${flag.key}"?`)) {
                      deleteMutation.mutate(flag.key);
                    }
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Flag Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Feature Flag">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Flag Key"
            placeholder="e.g. enable_beta_dashboard"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            required
            helperText="Unique snake_case identifier"
          />
          <Input
            label="Description"
            placeholder="What does this feature flag toggle?"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={newEnabled}
              onChange={(e) => setNewEnabled(e.target.checked)}
            />
            Enable by default
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Flag'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
