import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  Plus,
  Database,
  Trash,
  Sliders,
  Table as TableIcon,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  ModalOverlay,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextField,
  Select,
  SelectItem,
  Alert,
} from '@moul-dev/ui';
import { colors, spacing, radii, fonts } from '../../../theme/tokens.stylex';
import { api } from '../../../api/client';

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
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    width: '100%',
  },
  actionGroup: {
    display: 'flex',
    gap: spacing.xs,
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  emptyState: {
    padding: spacing.xxl,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
});

export const Route = createFileRoute('/_auth/collections/')({
  component: CollectionsPage,
});

function CollectionsPage() {
  const navigate = useNavigate();
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
          onPress={() => setIsCreateOpen(true)}
        >
          <Plus size={16} weight="bold" />
          <span>New Collection</span>
        </Button>
      </div>

      {isLoading ? (
        <div style={{ color: '#64748b' }}>Loading collections...</div>
      ) : !mouls || mouls.length === 0 ? (
        <div {...stylex.props(styles.emptyState)}>
          No collections created yet. Click "New Collection" to get started.
        </div>
      ) : (
        <div {...stylex.props(styles.grid)}>
          {mouls.map((moul: any) => (
            <Card key={moul.name} variant="default">
              <CardHeader>
                <div {...stylex.props(styles.cardTop)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <Database size={20} color="#0ea5e9" />
                    <span>{moul.name}</span>
                  </div>
                  <Badge
                    variant={
                      moul.type === 'auth'
                        ? 'primary'
                        : moul.type === 'worker'
                        ? 'warning'
                        : moul.type === 'analytic'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {moul.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardBody>
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
              </CardBody>

              <CardFooter>
                <div {...stylex.props(styles.cardActions)}>
                  <div {...stylex.props(styles.actionGroup)}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() =>
                        navigate({
                          to: '/records/$moulName',
                          params: { moulName: moul.name },
                          search: { page: 1, perPage: 30 },
                        })
                      }
                    >
                      <TableIcon size={14} />
                      <span>Records</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        navigate({
                          to: '/collections/$moulName',
                          params: { moulName: moul.name },
                        })
                      }
                    >
                      <Sliders size={14} />
                      <span>Schema</span>
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete collection ${moul.name}`}
                    onPress={() => {
                      if (confirm(`Are you sure you want to delete collection "${moul.name}"?`)) {
                        deleteMutation.mutate(moul.name);
                      }
                    }}
                  >
                    <Trash size={14} color="#ef4444" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <ModalOverlay isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} isDismissable>
        <Modal size="md">
          <ModalDialog>
            <ModalHeader>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Create New Collection</h2>
            </ModalHeader>
            <form onSubmit={handleCreate}>
              <ModalBody>
                <div {...stylex.props(styles.modalForm)}>
                  {error && <Alert variant="error" description={error} />}

                  <TextField
                    label="Collection Name"
                    placeholder="e.g. posts, products, comments"
                    value={newMoulName}
                    onChange={setNewMoulName}
                    isRequired
                    description="Lower-case alphanumeric table identifier"
                  />

                  <Select
                    label="Collection Type"
                    placeholder="Select Type"
                    selectedKey={newMoulType}
                    onSelectionChange={(key) => setNewMoulType(String(key))}
                  >
                    <SelectItem id="base">Base (General data CRUD)</SelectItem>
                    <SelectItem id="auth">Auth (Users, password, passkey, OAuth2)</SelectItem>
                    <SelectItem id="worker">Worker (Background job queue)</SelectItem>
                    <SelectItem id="analytic">Analytic (Time-series & visitor tracking)</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button type="button" variant="ghost" onPress={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isDisabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Collection'}
                </Button>
              </ModalFooter>
            </form>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}

