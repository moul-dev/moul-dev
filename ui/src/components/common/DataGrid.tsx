import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
  OnChangeFn,
} from '@tanstack/react-table';
import {
  CaretUp,
  CaretDown,
  CaretUpDown,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { Button } from './Button';

const styles = stylex.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontFamily: fonts.sans,
  },
  th: {
    paddingBlock: spacing.md,
    paddingInline: spacing.md,
    backgroundColor: colors.bgCard,
    color: colors.textSecondary,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  thSortable: {
    cursor: 'pointer',
  },
  thContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderMuted,
    transition: 'background-color 0.1s ease',
  },
  trHover: {
    backgroundColor: {
      ':hover': colors.bgCardHover,
    },
    cursor: 'pointer',
  },
  td: {
    paddingBlock: spacing.md,
    paddingInline: spacing.md,
    color: colors.textPrimary,
    verticalAlign: 'middle',
    maxWidth: '320px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  empty: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textMuted,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacing.md,
    paddingInline: spacing.lg,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  pageInfo: {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
}

export function DataGrid<TData>({
  data,
  columns,
  pageCount = -1,
  pagination,
  onPaginationChange,
  sorting = [],
  onSortingChange,
  isLoading,
  onRowClick,
  emptyMessage = 'No records found',
}: DataGridProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.tableWrapper)}>
        <table {...stylex.props(styles.table)}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      {...stylex.props(styles.th, canSort && styles.thSortable)}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div {...stylex.props(styles.thContent)}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span>
                            {isSorted === 'asc' ? (
                              <CaretUp size={14} weight="bold" />
                            ) : isSorted === 'desc' ? (
                              <CaretDown size={14} weight="bold" />
                            ) : (
                              <CaretUpDown size={14} color="#64748b" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} {...stylex.props(styles.empty)}>
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} {...stylex.props(styles.empty)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  {...stylex.props(styles.tr, onRowClick && styles.trHover)}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} {...stylex.props(styles.td)}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div {...stylex.props(styles.footer)}>
          <div {...stylex.props(styles.pageInfo)}>
            Page {pagination.pageIndex + 1} {pageCount > 0 ? `of ${pageCount}` : ''}
          </div>
          <div {...stylex.props(styles.controls)}>
            <Button
              size="sm"
              variant="secondary"
              icon={<CaretLeft size={16} />}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <CaretRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
