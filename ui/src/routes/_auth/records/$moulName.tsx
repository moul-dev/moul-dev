import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { z } from 'zod';
import {
  Plus,
  Trash,
  PencilSimple,
  Database,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Badge,
  Button,
  Card,
  CardBody,
  SearchField,
  TextField,
  Checkbox,
  ModalOverlay,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  toastQueue,
} from '@moul-dev/ui';
import { colors, spacing, radii, fonts } from '../../../theme/tokens.stylex';
import { api } from '../../../api/client';

const recordsSearchSchema = z.object({
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(30),
  sort: z.string().optional(),
  filter: z.string().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute('/_auth/records/$moulName')({
  validateSearch: (search) => recordsSearchSchema.parse(search),
  component: RecordsPage,
});

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
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  searchBox: {
    width: '360px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    maxHeight: '65vh',
    overflowY: 'auto',
    paddingInline: spacing.xxs,
  },
  emptyState: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textSecondary,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    fontFamily: fonts.sans,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacing.sm,
    fontSize: '0.875rem',
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

function RecordsPage() {
  const { moulName } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [activeRecord, setActiveRecord] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchVal, setSearchVal] = useState(search.search || '');

  // 1. Fetch collection schema to get field definitions
  const { data: moul } = useQuery({
    queryKey: ['moul', moulName],
    queryFn: () => api.getMoul(moulName),
  });

  // 2. Fetch records list
  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['records', moulName, search.page, search.perPage, search.sort, search.filter, search.search],
    queryFn: () =>
      api.listRecords(moulName, {
        page: search.page,
        perPage: search.perPage,
        sort: search.sort,
        filter: search.filter,
        search: search.search,
      }),
  });

  const records = useMemo(() => {
    if (Array.isArray(recordsData)) return recordsData;
    if (recordsData && Array.isArray(recordsData.items)) return recordsData.items;
    return [];
  }, [recordsData]);

  const totalPages = (recordsData && !Array.isArray(recordsData) && typeof (recordsData as any).totalPages === 'number')
    ? (recordsData as any).totalPages
    : 1;
  const currentPage = search.page || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRecord(moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsModalOpen(false);
      toastQueue.add({
        title: 'Record Created',
        description: 'New record created successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Creation Failed',
        description: err.message || 'Failed to create record.',
        variant: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateRecord(moulName, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsModalOpen(false);
      toastQueue.add({
        title: 'Record Updated',
        description: 'Record updated successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Update Failed',
        description: err.message || 'Failed to update record.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRecord(moulName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      toastQueue.add({
        title: 'Record Deleted',
        description: 'Record was deleted.',
        variant: 'info',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete record.',
        variant: 'error',
      });
    },
  });

  const handleOpenCreate = () => {
    setFormData({});
    setIsCreating(true);
    setActiveRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: any) => {
    setFormData({ ...rec });
    setIsCreating(false);
    setActiveRecord(rec);
    setIsModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      createMutation.mutate(formData);
    } else if (activeRecord) {
      updateMutation.mutate({ id: activeRecord.id, data: formData });
    }
  };

  const handleSearchSubmit = (query: string) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        page: 1,
        search: query.trim() || undefined,
      }),
    });
  };

  // Schema field keys
  const schemaFields = moul?.fields || [];

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <Database size={24} color="#0ea5e9" />
            <span>{moulName} Records</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Explore records data grid, execute search filters, and manage collection entries.
          </span>
        </div>
        <Button variant="primary" onPress={handleOpenCreate}>
          <Plus size={16} />
          <span>New Record</span>
        </Button>
      </div>

      {/* Toolbar */}
      <Card variant="default">
        <CardBody>
          <div {...stylex.props(styles.toolbar)}>
            <div {...stylex.props(styles.searchBox)}>
              <SearchField
                placeholder="Search records..."
                value={searchVal}
                onChange={setSearchVal}
                onSubmit={handleSearchSubmit}
              />
            </div>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Showing {records.length} record{records.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Moul UI Table */}
      {isLoading ? (
        <div {...stylex.props(styles.emptyState)}>Loading records...</div>
      ) : records.length === 0 ? (
        <div {...stylex.props(styles.emptyState)}>
          No records found. Click "New Record" to insert a record.
        </div>
      ) : (
        <Table aria-label={`${moulName} records table`}>
          <TableHeader>
            <Column isRowHeader>ID</Column>
            {moul?.type === 'auth' && (
              <>
                <Column>Username</Column>
                <Column>Email</Column>
              </>
            )}
            {schemaFields.map((f: any) => (
              <Column key={f.name}>{f.name}</Column>
            ))}
            <Column>Created At</Column>
            <Column>Actions</Column>
          </TableHeader>
          <TableBody>
            {records.map((rec: any) => (
              <Row key={rec.id} id={rec.id}>
                <Cell>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                    {String(rec.id)}
                  </span>
                </Cell>
                {moul?.type === 'auth' && (
                  <>
                    <Cell>{rec.username || '-'}</Cell>
                    <Cell>{rec.email || '-'}</Cell>
                  </>
                )}
                {schemaFields.map((f: any) => {
                  const val = rec[f.name];
                  return (
                    <Cell key={f.name}>
                      {val === null || val === undefined ? (
                        <span style={{ color: '#64748b' }}>-</span>
                      ) : typeof val === 'boolean' ? (
                        <Badge variant={val ? 'success' : 'error'}>{val ? 'true' : 'false'}</Badge>
                      ) : typeof val === 'object' ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {JSON.stringify(val)}
                        </span>
                      ) : (
                        String(val)
                      )}
                    </Cell>
                  );
                })}
                <Cell>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {rec.created_at ? new Date(String(rec.created_at)).toLocaleString() : '-'}
                  </span>
                </Cell>
                <Cell>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Edit record ${rec.id}`}
                      onPress={() => handleOpenEdit(rec)}
                    >
                      <PencilSimple size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete record ${rec.id}`}
                      onPress={() => {
                        if (confirm(`Delete record ${rec.id}?`)) {
                          deleteMutation.mutate(rec.id);
                        }
                      }}
                    >
                      <Trash size={14} color="#ef4444" />
                    </Button>
                  </div>
                </Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination Controls */}
      <div {...stylex.props(styles.pagination)}>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div {...stylex.props(styles.paginationButtons)}>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={currentPage <= 1}
            onPress={() =>
              navigate({
                search: (prev: any) => ({
                  ...prev,
                  page: Math.max(1, currentPage - 1),
                }),
              })
            }
          >
            <CaretLeft size={14} />
            <span>Previous</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={currentPage >= totalPages}
            onPress={() =>
              navigate({
                search: (prev: any) => ({
                  ...prev,
                  page: currentPage + 1,
                }),
              })
            }
          >
            <span>Next</span>
            <CaretRight size={14} />
          </Button>
        </div>
      </div>

      {/* Record Edit/Create Modal */}
      <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
        <Modal size="lg">
          <ModalDialog>
            <ModalHeader>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                {isCreating ? `Create ${moulName} Record` : `Edit Record #${activeRecord?.id}`}
              </h2>
            </ModalHeader>
            <form onSubmit={handleSaveRecord}>
              <ModalBody>
                <div {...stylex.props(styles.modalForm)}>
                  {moul?.type === 'auth' && (
                    <>
                      <TextField
                        label="Username"
                        value={formData.username || ''}
                        onChange={(val) => setFormData({ ...formData, username: val })}
                        isRequired={isCreating}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(val) => setFormData({ ...formData, email: val })}
                        isRequired={isCreating}
                      />
                      {isCreating && (
                        <>
                          <TextField
                            label="Password"
                            type="password"
                            value={formData.password || ''}
                            onChange={(val) => setFormData({ ...formData, password: val })}
                            isRequired
                          />
                          <TextField
                            label="Confirm Password"
                            type="password"
                            value={formData.passwordConfirm || ''}
                            onChange={(val) => setFormData({ ...formData, passwordConfirm: val })}
                            isRequired
                          />
                        </>
                      )}
                    </>
                  )}

                  {schemaFields.map((f: any) => (
                    <div key={f.name}>
                      {f.type === 'bool' ? (
                        <Checkbox
                          isSelected={Boolean(formData[f.name])}
                          onChange={(checked) => setFormData({ ...formData, [f.name]: checked })}
                        >
                          {f.name}
                        </Checkbox>
                      ) : (
                        <TextField
                          label={f.name}
                          type={f.type === 'number' ? 'number' : 'text'}
                          value={String(formData[f.name] ?? '')}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              [f.name]: f.type === 'number' ? Number(val) : val,
                            })
                          }
                          isRequired={Boolean(f.required)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button type="button" variant="ghost" onPress={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Record'}
                </Button>
              </ModalFooter>
            </form>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}

