import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  DatabaseIcon,
  CaretLeftIcon,
  CaretRightIcon,
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
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../../api/client';

const recordsSearchSchema = z.object({
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(30),
  sort: z.string().optional(),
  filter: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute('/_auth/records/$moulName')({
  validateSearch: (search) => recordsSearchSchema.parse(search),
  component: RecordsPage,
});

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
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
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
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    paddingInline: tokens.spacing1,
  },
  emptyState: {
    padding: tokens.spacing8,
    textAlign: 'center',
    color: tokens.colorFgSubtle,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    fontFamily: tokens.fontFamilyBase,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: tokens.spacing2,
    fontSize: '0.875rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
});

function RecordsPage() {
  const { moulName } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [activeRecord, setActiveRecord] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchVal, setSearchVal] = useState(search.search || '');

  React.useEffect(() => {
    setSearchVal(search.search || '');
  }, [search.search]);

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

  const totalItems =
    recordsData && !Array.isArray(recordsData) && typeof recordsData.totalItems === 'number'
      ? recordsData.totalItems
      : records.length;

  const totalPages =
    recordsData && !Array.isArray(recordsData) && typeof (recordsData as any).totalPages === 'number'
      ? Math.max(1, (recordsData as any).totalPages)
      : 1;
  const currentPage = search.page || 1;

  // Schema field keys with filtering and inference
  const displayFields = useMemo(() => {
    const isAuth = moul?.type === 'auth';
    const isWorker = moul?.type === 'worker';

    if (moul?.fields && moul.fields.length > 0) {
      return moul.fields.filter((f: any) => {
        if (isAuth && (f.name === 'username' || f.name === 'email')) return false;
        if (isWorker && (f.name === 'worker' || f.name === 'state' || f.name === 'queue' || f.name === 'attempt')) return false;
        return true;
      });
    }

    if (records.length > 0) {
      const ignoredKeys = new Set([
        'id',
        'created_at',
        'updated_at',
        'username',
        'email',
        'passwordHash',
        'otpCode',
        'otpExpiresAt',
        'passkeys',
        'resetToken',
        'resetTokenExpiresAt',
        'oauthProviders',
        'worker',
        'state',
        'queue',
        'attempt',
        'max_attempts',
        'priority',
        'inserted_at',
        'scheduled_at',
        'attempted_at',
        'attempted_by',
        'errors',
        'tags',
        'meta',
        'args',
      ]);

      const inferredKeys = new Set<string>();
      for (const rec of records) {
        Object.keys(rec).forEach((k) => {
          if (!ignoredKeys.has(k)) {
            inferredKeys.add(k);
          }
        });
      }

      return Array.from(inferredKeys).map((name) => ({ name, type: 'text' }));
    }

    return [];
  }, [moul, records]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRecord(moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
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
      setIsDrawerOpen(false);
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
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (rec: any) => {
    setFormData({ ...rec });
    setIsCreating(false);
    setActiveRecord(rec);
    setIsDrawerOpen(true);
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

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <DatabaseIcon size={24} color={tokens.colorPrimary500} />
            <span>{moulName} Records</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Explore records data grid, execute search filters, and manage collection entries.
          </span>
        </div>
        <Button variant="primary" onPress={handleOpenCreate}>
          <PlusIcon size={16} />
          <span>New Record</span>
        </Button>
      </div>

      {/* Toolbar */}
      <Card variant="glass">
        <CardBody>
          <div {...stylex.props(styles.toolbar)}>
            <div {...stylex.props(styles.searchBox)}>
              <SearchField
                aria-label="Search records"
                placeholder="Search records..."
                value={searchVal}
                onChange={setSearchVal}
                onSubmit={handleSearchSubmit}
              />
            </div>
            <span style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFgSubtle }}>
              Showing {records.length} of {totalItems} record{totalItems !== 1 ? 's' : ''}
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
            {moul?.type === 'worker' && (
              <>
                <Column>Worker</Column>
                <Column>State</Column>
                <Column>Queue</Column>
                <Column>Attempt</Column>
              </>
            )}
            {displayFields.map((f: any) => (
              <Column key={f.name}>{f.name}</Column>
            ))}
            <Column>Created At</Column>
            <Column>Actions</Column>
          </TableHeader>
          <TableBody>
            {records.map((rec: any) => (
              <Row key={rec.id} id={rec.id}>
                <Cell>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: tokens.fontSizeXs, color: tokens.colorPrimary400 }}>
                    {String(rec.id)}
                  </span>
                </Cell>
                {moul?.type === 'auth' && (
                  <>
                    <Cell>{rec.username || '-'}</Cell>
                    <Cell>{rec.email || '-'}</Cell>
                  </>
                )}
                {moul?.type === 'worker' && (
                  <>
                    <Cell>{rec.worker || '-'}</Cell>
                    <Cell>
                      <Badge
                        variant={
                          rec.state === 'completed'
                            ? 'success'
                            : rec.state === 'failed'
                            ? 'error'
                            : rec.state === 'processing'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {rec.state || 'available'}
                      </Badge>
                    </Cell>
                    <Cell>{rec.queue || 'default'}</Cell>
                    <Cell>{rec.attempt ?? 0}</Cell>
                  </>
                )}
                {displayFields.map((f: any) => {
                  const val = rec[f.name];
                  return (
                    <Cell key={f.name}>
                      {val === null || val === undefined ? (
                        <span style={{ color: tokens.colorFgSubtle }}>-</span>
                      ) : typeof val === 'boolean' ? (
                        <Badge variant={val ? 'success' : 'error'}>{val ? 'true' : 'false'}</Badge>
                      ) : typeof val === 'object' ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: tokens.fontSizeXs }}>
                          {JSON.stringify(val)}
                        </span>
                      ) : (
                        String(val)
                      )}
                    </Cell>
                  );
                })}
                <Cell>
                  <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle }}>
                    {rec.created_at || rec.inserted_at ? new Date(String(rec.created_at || rec.inserted_at)).toLocaleString() : '-'}
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
                      <PencilSimpleIcon size={14} />
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
                      <TrashIcon size={14} color={tokens.colorError500} />
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
            <CaretLeftIcon size={14} />
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
            <CaretRightIcon size={14} />
          </Button>
        </div>
      </div>

      {/* Record Edit/Create Drawer */}
      <DrawerOverlay isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} isDismissable>
        <Drawer placement="right" size="lg">
          <DrawerDialog>
            <form
              onSubmit={handleSaveRecord}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
            >
              <DrawerHeader>
                <DrawerTitle>
                  {isCreating ? `Create ${moulName} Record` : `Edit Record #${activeRecord?.id}`}
                </DrawerTitle>
                <DrawerCloseButton />
              </DrawerHeader>
              <DrawerBody>
                <div {...stylex.props(styles.drawerForm)}>
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

                  {displayFields.map((f: any) => (
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
              </DrawerBody>
              <DrawerFooter>
                <Button type="button" variant="ghost" onPress={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Record'}
                </Button>
              </DrawerFooter>
            </form>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>
    </div>
  );
}

