import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  Database,
} from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../../theme/tokens.stylex';
import { api } from '../../../api/client';
import { DataGrid } from '../../../components/common/DataGrid';
import { Button } from '../../../components/common/Button';
import { Drawer } from '../../../components/common/Drawer';
import { Input } from '../../../components/common/Input';
import { Badge } from '../../../components/common/Badge';

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
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
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
  const [searchInput, setSearchInput] = useState(search.search || '');

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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRecord(moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateRecord(moulName, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRecord(moulName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev: any) => ({
        ...prev,
        page: 1,
        search: searchInput.trim() || undefined,
      }),
    });
  };

  // Build Dynamic Columns
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
            {String(info.getValue())}
          </span>
        ),
      },
    ];

    if (moul?.type === 'auth') {
      cols.push(
        {
          accessorKey: 'username',
          header: 'Username',
        },
        {
          accessorKey: 'email',
          header: 'Email',
        }
      );
    }

    if (moul?.fields) {
      moul.fields.forEach((f: any) => {
        cols.push({
          accessorKey: f.name,
          header: f.name,
          cell: (info) => {
            const val = info.getValue();
            if (val === null || val === undefined) return <span style={{ color: '#64748b' }}>-</span>;
            if (typeof val === 'boolean') return <Badge variant={val ? 'success' : 'danger'}>{val ? 'true' : 'false'}</Badge>;
            if (typeof val === 'object') return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{JSON.stringify(val)}</span>;
            return String(val);
          },
        });
      });
    }

    cols.push(
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: (info) => (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {info.getValue() ? new Date(String(info.getValue())).toLocaleString() : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Button
              size="sm"
              variant="ghost"
              icon={<PencilSimple size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row.original);
              }}
              title="Edit Record"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash size={14} color="#ef4444" />}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete record ${row.original.id}?`)) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
              title="Delete Record"
            />
          </div>
        ),
      }
    );

    return cols;
  }, [moul]);

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
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
          New Record
        </Button>
      </div>

      {/* Toolbar */}
      <div {...stylex.props(styles.toolbar)}>
        <form onSubmit={handleSearchSubmit} {...stylex.props(styles.searchBox)}>
          <Input
            placeholder="Search records or filter expression..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary" icon={<MagnifyingGlass size={16} />}>
            Search
          </Button>
        </form>
      </div>

      {/* TanStack Table DataGrid */}
      <DataGrid
        data={records}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row) => handleOpenEdit(row)}
        pagination={{
          pageIndex: (search.page || 1) - 1,
          pageSize: search.perPage || 30,
        }}
        onPaginationChange={(updater: any) => {
          const next = typeof updater === 'function' ? updater({ pageIndex: (search.page || 1) - 1, pageSize: search.perPage || 30 }) : updater;
          navigate({
            search: (prev: any) => ({
              ...prev,
              page: next.pageIndex + 1,
              perPage: next.pageSize,
            }),
          });
        }}
      />

      {/* Record Edit/Create Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isCreating ? `Create ${moulName} Record` : `Edit Record #${activeRecord?.id}`}
      >
        <form onSubmit={handleSaveRecord} {...stylex.props(styles.drawerForm)}>
          {moul?.type === 'auth' && (
            <>
              <Input
                label="Username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required={isCreating}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required={isCreating}
              />
              {isCreating && (
                <>
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.passwordConfirm || ''}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    required
                  />
                </>
              )}
            </>
          )}

          {moul?.fields?.map((f: any) => (
            <div key={f.name}>
              {f.type === 'bool' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData[f.name])}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.checked })}
                  />
                  {f.name}
                </label>
              ) : (
                <Input
                  label={f.name}
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={formData[f.name] ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                    })
                  }
                  required={Boolean(f.required)}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
