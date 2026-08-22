import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Flag, Plus, Trash } from '@phosphor-icons/react';
import {
  Card,
  CardBody,
  Badge,
  Button,
  Switch,
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  TextField,
  Checkbox,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
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
    letterSpacing: '-0.025em',
  },
  flagList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  flagCardInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  flagInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
  },
  flagKey: {
    fontSize: '1rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: 'var(--font-mono, monospace)',
  },
  flagDesc: {
    fontSize: '0.8125rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  flagActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
  },
  emptyState: {
    padding: tokens.spacing8,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    textAlign: 'center',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
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
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Toggle features dynamically, configure gradual rollouts, and evaluate targeting rules.
          </span>
        </div>
        <Button variant="primary" onPress={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          <span>New Feature Flag</span>
        </Button>
      </div>

      <div {...stylex.props(styles.flagList)}>
        {isLoading ? (
          <div style={{ color: tokens.colorFgSubtle }}>Loading feature flags...</div>
        ) : !flags || flags.length === 0 ? (
          <div {...stylex.props(styles.emptyState)}>
            No feature flags configured. Click "New Feature Flag" to create one.
          </div>
        ) : (
          flags.map((flag: any) => (
            <Card key={flag.key} variant="default">
              <CardBody>
                <div {...stylex.props(styles.flagCardInner)}>
                  <div {...stylex.props(styles.flagInfo)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Flag size={18} color={tokens.colorPrimary500} />
                      <span {...stylex.props(styles.flagKey)}>{flag.key}</span>
                      <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    {flag.description && <span {...stylex.props(styles.flagDesc)}>{flag.description}</span>}
                  </div>

                  <div {...stylex.props(styles.flagActions)}>
                    <Switch
                      isSelected={Boolean(flag.enabled)}
                      onChange={() => handleToggle(flag)}
                      aria-label={`Toggle flag ${flag.key}`}
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Switch>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete flag ${flag.key}`}
                      onPress={() => {
                        if (confirm(`Delete flag "${flag.key}"?`)) {
                          deleteMutation.mutate(flag.key);
                        }
                      }}
                    >
                      <Trash size={16} color={tokens.colorError500} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Create Flag Drawer */}
      <DrawerOverlay isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} isDismissable>
        <Drawer placement="right" size="md">
          <DrawerDialog>
            <form
              onSubmit={handleCreate}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
            >
              <DrawerHeader>
                <DrawerTitle>Create Feature Flag</DrawerTitle>
                <DrawerCloseButton />
              </DrawerHeader>
              <DrawerBody>
                <div {...stylex.props(styles.drawerForm)}>
                  <TextField
                    label="Flag Key"
                    placeholder="e.g. enable_beta_dashboard"
                    value={newKey}
                    onChange={setNewKey}
                    isRequired
                    description="Unique snake_case identifier"
                  />
                  <TextField
                    label="Description"
                    placeholder="What does this feature flag toggle?"
                    value={newDesc}
                    onChange={setNewDesc}
                  />
                  <Checkbox
                    isSelected={newEnabled}
                    onChange={setNewEnabled}
                  >
                    Enable by default
                  </Checkbox>
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button type="button" variant="ghost" onPress={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isDisabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Flag'}
                </Button>
              </DrawerFooter>
            </form>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>
    </div>
  );
}

