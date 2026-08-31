import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  PlusIcon,
  DatabaseIcon,
  TrashIcon,
  SlidersIcon,
  TableIcon,
  LinkIcon,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  TextField,
  Select,
  SelectItem,
  Alert,
  ModalOverlay,
  Modal,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
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
    gap: tokens.spacing4,
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
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    letterSpacing: '-0.025em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: tokens.spacing4,
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
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  fieldsPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacing1,
    fontSize: '0.75rem',
    color: tokens.colorFgSubtle,
    fontFamily: 'var(--font-mono, monospace)',
  },
  fieldPill: {
    backgroundColor: tokens.colorBgElevated,
    paddingBlock: '2px',
    paddingInline: tokens.spacing1,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  relationPill: {
    backgroundColor: tokens.colorBgElevated,
    paddingBlock: '2px',
    paddingInline: tokens.spacing1,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorPrimary500,
    color: tokens.colorPrimary500,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionGroup: {
    display: 'flex',
    gap: tokens.spacing1,
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  drawerTabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    paddingBlock: tokens.spacing3,
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
});

export const Route = createFileRoute('/_auth/collections/')({
  component: CollectionsPage,
});

function CollectionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState<'general' | 'rules'>('general');
  const [collectionToDelete, setCollectionToDelete] = useState<any | null>(null);

  // Form State
  const [newMoulName, setNewMoulName] = useState('');
  const [newMoulType, setNewMoulType] = useState('base');
  const [newMoulFields, setNewMoulFields] = useState<MoulField[]>([]);
  const [newMoulRules, setNewMoulRules] = useState<MoulRules>({
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
  });
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
      resetCreateForm();
      toastQueue.add({
        title: 'Collection Created',
        description: 'Collection created successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create collection');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.deleteMoul(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mouls'] });
      setCollectionToDelete(null);
      toastQueue.add({
        title: 'Collection Deleted',
        description: 'Collection was deleted successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      setCollectionToDelete(null);
      toastQueue.add({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete collection.',
        variant: 'error',
      });
    },
  });

  const resetCreateForm = () => {
    setNewMoulName('');
    setNewMoulType('base');
    setNewMoulFields([]);
    setNewMoulRules({
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    setCreateTab('general');
    setError(null);
  };

  const handleTypeChange = (selectedType: string) => {
    setNewMoulType(selectedType);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = newMoulName.trim().toLowerCase();
    if (!trimmedName) {
      setError('Collection name is required.');
      setCreateTab('general');
      return;
    }

    // Clean up fields
    const cleanedFields = newMoulFields.map((f) => {
      const cleanField = { ...f, name: f.name.trim() };
      if (cleanField.type === 'relation') {
        if (!cleanField.relationConfig) {
          cleanField.relationConfig = {
            targetMoul: trimmedName,
            cardinality: '1:N',
            onDelete: 'SET_NULL',
          };
        }
      }
      return cleanField;
    });

    createMutation.mutate({
      name: trimmedName,
      type: newMoulType,
      fields: cleanedFields,
      rules: newMoulRules,
    });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Collections Schema</h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Design dynamic tables, configure field validations, and enforce access rules.
          </span>
        </div>
        <Button
          variant="primary"
          onPress={() => {
            resetCreateForm();
            setIsCreateOpen(true);
          }}
        >
          <PlusIcon size={16} weight="bold" />
          <span>New Collection</span>
        </Button>
      </div>

      {isLoading ? (
        <div style={{ color: tokens.colorFgSubtle }}>Loading collections...</div>
      ) : !mouls || mouls.length === 0 ? (
        <div {...stylex.props(styles.emptyState)}>
          No collections created yet. Click &quot;New Collection&quot; to get started.
        </div>
      ) : (
        <div {...stylex.props(styles.grid)}>
          {mouls.map((moul: any) => (
            <Card key={moul.name} variant="glass">
              <CardHeader>
                <div {...stylex.props(styles.cardTop)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <DatabaseIcon size={20} color={tokens.colorPrimary500} />
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
                  <span style={{ color: tokens.colorFgSubtle }}>Fields:</span>
                  <span {...stylex.props(styles.fieldPill)}>id</span>
                  <span {...stylex.props(styles.fieldPill)}>created_at</span>
                  <span {...stylex.props(styles.fieldPill)}>updated_at</span>
                  {moul.fields?.map((f: any) => {
                    if (f.type === 'relation' && f.relationConfig) {
                      return (
                        <span
                          key={f.name}
                          {...stylex.props(styles.relationPill)}
                          title={`Relation ${f.name} ➔ ${f.relationConfig.targetMoul} (${f.relationConfig.cardinality || '1:N'})`}
                        >
                          <LinkIcon size={12} />
                          <span>
                            {f.name} ➔ {f.relationConfig.targetMoul}
                          </span>
                        </span>
                      );
                    }
                    return (
                      <span key={f.name} {...stylex.props(styles.fieldPill)}>
                        {f.name} ({f.type})
                      </span>
                    );
                  })}
                </div>
              </CardBody>

              <CardFooter>
                <div {...stylex.props(styles.cardActions)}>
                  <div {...stylex.props(styles.actionGroup)}>
                    <Button
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
                      variant="ghost"
                      onPress={() =>
                        navigate({
                          to: '/collections/$moulName',
                          params: { moulName: moul.name },
                        })
                      }
                    >
                      <SlidersIcon size={14} />
                      <span>Schema</span>
                    </Button>
                  </div>

                  <Button
                    isIcon
                    variant="ghost"
                    aria-label={`Delete collection ${moul.name}`}
                    onPress={() => setCollectionToDelete(moul)}
                  >
                    <TrashIcon size={14} color={tokens.colorError500} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Collection Drawer with 2 Tabs */}
      <DrawerOverlay isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} isDismissable>
        <Drawer placement="right" size="lg">
          <DrawerDialog>
            <form
              onSubmit={handleCreate}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
            >
              <DrawerHeader>
                <DrawerTitle>Create Collection</DrawerTitle>
                <DrawerCloseButton />
              </DrawerHeader>

              <DrawerBody>
                <div {...stylex.props(styles.drawerForm)}>
                  {error && <Alert variant="error" description={error} />}

                  <Tabs
                    selectedKey={createTab}
                    onSelectionChange={(key) => setCreateTab(key as 'general' | 'rules')}
                    variant="tertiary"
                  >
                    <TabList aria-label="Collection Settings Tabs">
                      <Tab id="general">General & Fields</Tab>
                      <Tab id="rules">Access Rules</Tab>
                    </TabList>

                    <TabPanels>
                      {/* TAB 1: General & Fields */}
                      <TabPanel id="general">
                        <div {...stylex.props(styles.drawerTabContent)}>
                          <TextField
                            label="Collection Name"
                            placeholder="e.g. posts, products, customers"
                            value={newMoulName}
                            onChange={setNewMoulName}
                            isRequired
                            description="Unique table identifier used in API routes and database queries."
                          />

                          <Select
                            label="Collection Type"
                            placeholder="Select Type"
                            selectedKey={newMoulType}
                            onSelectionChange={(key) => handleTypeChange(String(key))}
                          >
                            <SelectItem id="base">Base — Standard data collection</SelectItem>
                            <SelectItem id="auth">Auth — Users with authentication</SelectItem>
                            <SelectItem id="worker">Worker — Background tasks & queue</SelectItem>
                            <SelectItem id="analytic">Analytic — Event logging & tracking</SelectItem>
                          </Select>

                          {/* Fields Builder */}
                          <FieldsBuilder
                            fields={newMoulFields}
                            onChange={setNewMoulFields}
                            currentMoulName={newMoulName}
                            allMouls={mouls}
                          />
                        </div>
                      </TabPanel>

                      {/* TAB 2: Access Rules */}
                      <TabPanel id="rules">
                        <div {...stylex.props(styles.drawerTabContent)}>
                          <RulesEditor
                            rules={newMoulRules}
                            onChange={setNewMoulRules}
                            collectionFields={newMoulFields}
                            allCollections={mouls}
                            isAuthCollection={newMoulType === 'auth'}
                          />
                        </div>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button type="button" variant="outline" onPress={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isDisabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating Collection...' : 'Create Collection'}
                </Button>
              </DrawerFooter>
            </form>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>

      {/* Confirm Delete Collection Alert Dialog */}
      <ModalOverlay
        isOpen={collectionToDelete !== null}
        onOpenChange={(open: boolean) => !open && setCollectionToDelete(null)}
        isDismissable
      >
        <Modal size="sm">
          <AlertDialog>
            <AlertDialogHeader>
              <h3 style={{ margin: 0, fontSize: tokens.fontSizeLg, fontWeight: 600, color: tokens.colorFg }}>
                Delete Collection
              </h3>
            </AlertDialogHeader>
            <AlertDialogBody>
              <p style={{ margin: 0, color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
                Are you sure you want to delete collection <strong>&ldquo;{collectionToDelete?.name}&rdquo;</strong>?
                <br />
                <br />
                This will permanently delete the collection, all of its records, schema fields, and access rules. This action cannot be undone.
              </p>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="outline" onPress={() => setCollectionToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isPending={deleteMutation.isPending}
                onPress={() => {
                  if (collectionToDelete) {
                    deleteMutation.mutate(collectionToDelete.name);
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
