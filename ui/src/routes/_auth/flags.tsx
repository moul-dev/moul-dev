import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  FlagIcon,
  PlusIcon,
  TrashIcon,
  FlaskIcon,
  PencilSimpleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
} from '@phosphor-icons/react';
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
  TextArea,
  Checkbox,
  Select,
  SelectItem,
  ModalOverlay,
  Modal,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  toastQueue,
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
    margin: 0,
  },
  subtitle: {
    color: tokens.colorFgSubtle,
    fontSize: tokens.fontSizeSm,
    fontFamily: tokens.fontFamilyBase,
    marginTop: tokens.spacing1,
    display: 'block',
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
    flexWrap: 'wrap',
    gap: tokens.spacing3,
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
    gap: tokens.spacing2,
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
  presetGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  resultCard: {
    padding: tokens.spacing4,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    marginTop: tokens.spacing2,
  },
});

export const Route = createFileRoute('/_auth/flags')({
  component: FeatureFlagsPage,
});

function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<any | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEnabled, setNewEnabled] = useState(true);

  // Evaluation Playground State
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [evalFlagKey, setEvalFlagKey] = useState('');
  const [evalContextJson, setEvalContextJson] = useState('{\n  "user_id": "usr_123",\n  "role": "beta"\n}');
  const [evalJsonError, setEvalJsonError] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<any | null>(null);

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
      toastQueue.add({
        title: 'Flag Created',
        description: 'Feature flag was created successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Create Failed',
        description: err.message || 'Failed to create feature flag.',
        variant: 'error',
      });
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
      setFlagToDelete(null);
      toastQueue.add({
        title: 'Flag Deleted',
        description: 'Feature flag was deleted successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      setFlagToDelete(null);
      toastQueue.add({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete feature flag.',
        variant: 'error',
      });
    },
  });

  const evalMutation = useMutation({
    mutationFn: async () => {
      setEvalJsonError(null);
      let parsedContext: any = {};
      if (evalContextJson.trim()) {
        try {
          parsedContext = JSON.parse(evalContextJson);
        } catch (e: any) {
          setEvalJsonError(`Invalid JSON format: ${e.message}`);
          throw new Error('Invalid JSON context');
        }
      }
      return api.evalFeatureFlag(evalFlagKey, parsedContext);
    },
    onSuccess: (data) => {
      setEvalResult(data);
    },
    onError: (err: any) => {
      if (err.message !== 'Invalid JSON context') {
        toastQueue.add({
          title: 'Evaluation Failed',
          description: err.message || 'Failed to evaluate feature flag.',
          variant: 'error',
        });
      }
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

  const openEvalDrawer = (flagKey?: string) => {
    const key = flagKey || (flags && flags.length > 0 ? flags[0].key : '');
    setEvalFlagKey(key);
    setEvalResult(null);
    setEvalJsonError(null);
    setIsEvalOpen(true);
  };

  const applyPreset = (preset: 'user' | 'beta' | 'staff' | 'rollout') => {
    switch (preset) {
      case 'user':
        setEvalContextJson('{\n  "user_id": "usr_standard_123"\n}');
        break;
      case 'beta':
        setEvalContextJson('{\n  "user_id": "usr_beta_456",\n  "role": "beta_tester"\n}');
        break;
      case 'staff':
        setEvalContextJson('{\n  "user_id": "usr_staff_789",\n  "groups": ["internal_staff"]\n}');
        break;
      case 'rollout':
        setEvalContextJson('{\n  "target_id": "user_bucket_42",\n  "percentage": 50\n}');
        break;
    }
    setEvalJsonError(null);
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Feature Flags</h1>
          <span {...stylex.props(styles.subtitle)}>
            Toggle features dynamically, configure gradual rollouts, and evaluate targeting rules.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
          <Button variant="secondary" onPress={() => openEvalDrawer()}>
            <FlaskIcon size={16} />
            <span>Eval Playground</span>
          </Button>
          <Button variant="primary" onPress={() => setIsCreateOpen(true)}>
            <PlusIcon size={16} />
            <span>New Feature Flag</span>
          </Button>
        </div>
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
            <Card key={flag.key} variant="glass">
              <CardBody>
                <div {...stylex.props(styles.flagCardInner)}>
                  <div {...stylex.props(styles.flagInfo)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FlagIcon size={18} color={tokens.colorPrimary500} />
                      <span {...stylex.props(styles.flagKey)}>{flag.key}</span>
                      <Badge variant={flag.enabled ? 'success' : 'neutral'} size="sm">
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    {flag.description && <span {...stylex.props(styles.flagDesc)}>{flag.description}</span>}
                  </div>

                  <div {...stylex.props(styles.flagActions)}>
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label={`Test evaluate flag ${flag.key}`}
                      onPress={() => openEvalDrawer(flag.key)}
                    >
                      <FlaskIcon size={14} />
                      <span>Evaluate</span>
                    </Button>

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
                      onPress={() => setFlagToDelete(flag)}
                    >
                      <TrashIcon size={16} color={tokens.colorError500} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* EVALUATION PLAYGROUND DRAWER */}
      <DrawerOverlay isOpen={isEvalOpen} onOpenChange={setIsEvalOpen} isDismissable>
        <Drawer placement="right" size="md">
          <DrawerDialog>
            <DrawerHeader>
              <DrawerTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                  <FlaskIcon size={20} color={tokens.colorPrimary500} />
                  <span>Feature Flag Eval Playground</span>
                </div>
              </DrawerTitle>
              <DrawerCloseButton />
            </DrawerHeader>
            <DrawerBody>
              <div {...stylex.props(styles.drawerForm)}>
                {flags && flags.length > 0 && (
                  <Select
                    label="Select Target Flag"
                    selectedKey={evalFlagKey}
                    onSelectionChange={(key) => {
                      setEvalFlagKey(String(key));
                      setEvalResult(null);
                    }}
                  >
                    {flags.map((f: any) => (
                      <SelectItem key={f.key} id={f.key} textValue={f.key}>
                        {f.key} ({f.enabled ? 'ON' : 'OFF'})
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <div>
                  <label style={{ fontSize: tokens.fontSizeXs, fontWeight: 600, color: tokens.colorFgSubtle, textTransform: 'uppercase', marginBottom: tokens.spacing1, display: 'block' }}>
                    Quick Context Presets
                  </label>
                  <div {...stylex.props(styles.presetGroup)}>
                    <Button size="sm" variant="outline" onPress={() => applyPreset('user')}>
                      Standard User
                    </Button>
                    <Button size="sm" variant="outline" onPress={() => applyPreset('beta')}>
                      Beta Tester
                    </Button>
                    <Button size="sm" variant="outline" onPress={() => applyPreset('staff')}>
                      Internal Staff
                    </Button>
                    <Button size="sm" variant="outline" onPress={() => applyPreset('rollout')}>
                      Rollout Target
                    </Button>
                  </div>
                </div>

                <TextArea
                  label="Evaluation Context (JSON)"
                  placeholder='{\n  "user_id": "usr_123",\n  "role": "beta"\n}'
                  value={evalContextJson}
                  onChange={setEvalContextJson}
                  rows={6}
                  description="Attributes passed to targeting gates & percentage rollouts"
                />

                {evalJsonError && (
                  <div style={{ color: tokens.colorError500, fontSize: tokens.fontSizeSm }}>
                    {evalJsonError}
                  </div>
                )}

                {/* Evaluation Result Display */}
                {evalResult && (
                  <div {...stylex.props(styles.resultCard)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: tokens.fontSizeXs, fontWeight: 600, textTransform: 'uppercase', color: tokens.colorFgSubtle }}>
                        Evaluation Outcome
                      </span>
                      <Badge
                        variant={evalResult.value ? 'success' : 'error'}
                        size="md"
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing1, fontWeight: 700 }}>
                          {evalResult.value ? <CheckCircleIcon size={15} weight="bold" /> : <XCircleIcon size={15} weight="bold" />}
                          <span>{String(evalResult.value).toUpperCase()}</span>
                        </span>
                      </Badge>
                    </div>

                    <div style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFg }}>
                      Reason Code:{' '}
                      <code style={{ padding: '2px 6px', backgroundColor: tokens.colorBgSubtle, borderRadius: tokens.radiusSm }}>
                        {evalResult.reason || 'evaluated'}
                      </code>
                    </div>

                    {evalResult.variation !== undefined && (
                      <div style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFgSubtle }}>
                        Variation: <strong>{String(evalResult.variation)}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="ghost" onPress={() => setIsEvalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                isPending={evalMutation.isPending}
                onPress={() => evalMutation.mutate()}
                isDisabled={!evalFlagKey}
              >
                <PlayIcon size={14} weight="fill" />
                <span>Run Evaluation</span>
              </Button>
            </DrawerFooter>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>

      {/* CREATE FLAG DRAWER */}
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

      {/* CONFIRM DELETE ALERT DIALOG */}
      <ModalOverlay
        isOpen={flagToDelete !== null}
        onOpenChange={(open: boolean) => !open && setFlagToDelete(null)}
        isDismissable
      >
        <Modal size="sm">
          <AlertDialog>
            <AlertDialogHeader>
              <h3 style={{ margin: 0, fontSize: tokens.fontSizeLg, fontWeight: 600, color: tokens.colorFg }}>
                Delete Feature Flag
              </h3>
            </AlertDialogHeader>
            <AlertDialogBody>
              <p style={{ margin: 0, color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
                Are you sure you want to delete feature flag <strong>&ldquo;{flagToDelete?.key}&rdquo;</strong>?
                <br />
                <br />
                This action cannot be undone and will remove all targeting rules associated with this flag.
              </p>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="outline" onPress={() => setFlagToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isPending={deleteMutation.isPending}
                onPress={() => {
                  if (flagToDelete) {
                    deleteMutation.mutate(flagToDelete.key);
                  }
                }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
