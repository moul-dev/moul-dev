---
name: moul-ui
description: >-
  Expert guidance, component catalog, API reference, and recipes for Moul UI (@moul-dev/ui)
  — an accessible, zero-runtime React component library built with React Aria Components,
  semantic HTML table primitives, and StyleX. Use when creating buttons, inputs, forms, dialogs,
  modals, sidebars, cards, tables, pagination, empty states, logs, charts, badges, toasts, or configuring design tokens and themes.
---

# Moul UI (`@moul-dev/ui`) — AI Agent Guidelines & Component Reference

`@moul-dev/ui` is an accessible, zero-runtime React component library built with **React Aria Components**, **semantic HTML table primitives**, and **StyleX**.

---

## 1. Quick Start & Setup

### Installation

```bash
bun add @moul-dev/ui
# or
npm install @moul-dev/ui
# or
pnpm add @moul-dev/ui
```

### Import Stylesheet

The compiled StyleX atomic CSS stylesheet **must** be imported at the root of your application (e.g., `main.tsx`, `index.tsx`, `App.tsx`, or global layout):

```tsx
import '@moul-dev/ui/style.css';
```

### Theme Provider

Wrap your application (or subtree) in `ThemeProvider`:

```tsx
import { ThemeProvider } from '@moul-dev/ui';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider colorScheme="light dark">
      {children}
    </ThemeProvider>
  );
}
```

---

## 2. Core Agent Rules & Conventions

When generating code with `@moul-dev/ui`, always adhere to the following rules:

### Rule 1: Always Import from `@moul-dev/ui`
All components, hooks, queues, and tokens are exported directly from `@moul-dev/ui`:
```tsx
import { Button, TextField, Modal, Card, Table, AreaChart, toastQueue } from '@moul-dev/ui';
```

### Rule 2: Use React Aria Event Handlers (`onPress` vs `onClick`)
Buttons and trigger components use `onPress` from React Aria to handle touch, mouse, and keyboard activations uniformly:
```tsx
// ✅ Correct
<Button variant="primary" onPress={() => handleSubmit()}>Save Changes</Button>

// ❌ Avoid for React Aria Button
<Button onClick={() => handleSubmit()}>Save Changes</Button>
```

### Rule 3: Use Standard React Aria & Component State Props
- **Selection (Single Items)**: `isSelected`, `defaultSelected`, `onChange` (for `Checkbox`, `Switch`, `ToggleButton`).
- **Collections (React Aria)**: `selectedKey`, `defaultSelectedKey`, `selectedKeys`, `defaultSelectedKeys`, `onSelectionChange` (for `Select`, `ComboBox`, `Tabs`, `TagGroup`, `ToggleButtonGroup`, `Sidebar`).
- **Table Selection**: Table primitives are zero-runtime semantic HTML elements styled with StyleX. Use `<TableRow selected={row.getIsSelected()} interactive>` and render `<Checkbox isSelected={...} onChange={...} />` in `<TableHead>` / `<TableCell>`.
- **Dialogs & Overlays**: `isOpen`, `defaultOpen`, `onOpenChange` (for `Modal`, `Drawer`, `Popover`, `Tooltip`).
- **Validation & States**: `isInvalid`, `isDisabled`, `isRequired`, `isReadOnly`, `isPending`.

### Rule 4: Always Provide Accessible Labels
Icon-only buttons or interactive elements without visible text **must** include an `aria-label`:
```tsx
// ✅ Correct
<Button variant="ghost" aria-label="Close dialog" onPress={onClose}>
  <CloseIcon />
</Button>
```

### Rule 5: Use Compound Component Patterns
Components use declarative compound subcomponents:
- `Table`: `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableFooter>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableCaption>`, `<TableEmpty>`, `<TableSkeleton>`
- `Card`: `<Card>`, `<CardHeader>`, `<CardBody>`, `<CardFooter>`
- `Modal`: `<ModalOverlay>`, `<Modal>`, `<ModalDialog>`, `<ModalHeader>`, `<ModalBody>`, `<ModalFooter>`
- `Drawer`: `<DrawerOverlay>`, `<Drawer>`, `<DrawerDialog>`, `<DrawerHeader>`, `<DrawerTitle>`, `<DrawerCloseButton>`, `<DrawerBody>`, `<DrawerFooter>`
- `AlertDialog`: `<AlertDialog>`, `<AlertDialogHeader>`, `<AlertDialogBody>`, `<AlertDialogFooter>`
- `Popover`: `<PopoverTrigger>`, `<Popover>`, `<PopoverDialog>`
- `Tooltip`: `<TooltipTrigger>`, `<Tooltip>`
- `Tabs`: `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanels>`, `<TabPanel>`
- `EmptyState`: `<EmptyState>`, `<EmptyStateIcon>`, `<EmptyStateTitle>`, `<EmptyStateDescription>`, `<EmptyStateActions>`
- `Pagination`: `<Pagination>`, `<PaginationContent>`, `<PaginationItem>`, `<PaginationLink>`, `<PaginationPrevious>`, `<PaginationNext>`, `<PaginationFirst>`, `<PaginationLast>`, `<PaginationEllipsis>`, `<PaginationSummary>`, `<PaginationPageSize>`
- `Sidebar`: `<Sidebar>`, `<SidebarAside>`, `<SidebarHeader>`, `<SidebarGroup>`, `<SidebarItem>`, `<SidebarFooter>`, `<SidebarDivider>`, `<SidebarMain>`
- `InputOTP`: `<InputOTP>`, `<InputOTPGroup>`, `<InputOTPSlot>`, `<InputOTPSeparator>`

---

## 3. Component Catalog & Code Recipes

### Data Tables (`Table` Suite)

The `Table` component is a collection of composable, zero-runtime semantic HTML table primitives styled with **StyleX**. Built to pair seamlessly with headless data engines like **TanStack Table**, **TanStack Virtual**, **TanStack Query**, **TanStack Store**, and **TanStack Pacer**, it provides accessible table markup, customizable visual variants (`dense`, `striped`, `hoverable`, `stickyHeader`), column pinning, sort indicators, numeric alignment, and built-in loading and empty states.

#### Table Primitives Import
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableEmpty,
  TableSkeleton,
} from '@moul-dev/ui';
```

#### 1. Basic Semantic Usage (Static / Declarative)
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  Badge,
} from '@moul-dev/ui';

export function BasicTableExample() {
  return (
    <Table aria-label="Cluster Services Table" dense striped hoverable stickyHeader>
      <TableCaption>Active production services across clusters</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Service Name</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="numeric">Throughput</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-semibold">Auth Gateway</TableCell>
          <TableCell>us-east-1</TableCell>
          <TableCell><Badge variant="success" size="sm" dot>Operational</Badge></TableCell>
          <TableCell align="numeric">1.2M req/s</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">PostgreSQL Primary</TableCell>
          <TableCell>us-west-2</TableCell>
          <TableCell><Badge variant="success" size="sm" dot>Operational</Badge></TableCell>
          <TableCell align="numeric">450k req/s</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-semibold">Edge CDN Gateway</TableCell>
          <TableCell>global</TableCell>
          <TableCell><Badge variant="warning" size="sm" dot>Degraded</Badge></TableCell>
          <TableCell align="numeric">3.8M req/s</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Cluster Summary</TableCell>
          <TableCell align="numeric">3 Nodes Active</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
```

#### 2. TanStack Table Integration (`@tanstack/react-table`)
Connect `@moul-dev/ui` table primitives with `@tanstack/react-table` for multi-column sorting, row selection, column pinning, and pagination:

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  Badge,
} from '@moul-dev/ui';
import {
  useTable,
  createColumnHelper,
  createCoreRowModel,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';

interface ServiceRecord {
  id: string;
  name: string;
  region: string;
  status: 'Operational' | 'Degraded' | 'Offline';
  throughput: string;
}

const columnHelper = createColumnHelper<ServiceRecord>();

export function TanStackTableExample({ data }: { data: ServiceRecord[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all rows on page"
            isSelected={table.getIsAllPageRowsSelected()}
            isIndeterminate={table.getIsSomePageRowsSelected()}
            onChange={(val) => table.toggleAllPageRowsSelected(val)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.name}`}
            isSelected={row.getIsSelected()}
            onChange={(val) => row.toggleSelected(val)}
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Service Name',
        cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('region', {
        header: 'Region',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const val = info.getValue();
          return (
            <Badge
              variant={val === 'Operational' ? 'success' : val === 'Degraded' ? 'warning' : 'danger'}
              size="sm"
              dot
            >
              {val}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('throughput', {
        header: 'Throughput',
        cell: (info) => info.getValue(),
        meta: { align: 'numeric' as const },
      }),
    ],
    []
  );

  const table = useTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: createCoreRowModel(),
    getSortedRowModel: createSortedRowModel(),
    getFilteredRowModel: createFilteredRowModel(),
    getPaginationRowModel: createPaginatedRowModel(),
  });

  return (
    <Table stickyHeader dense hoverable>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                sortDirection={header.column.getIsSorted()}
                onSort={
                  header.column.getCanSort()
                    ? header.column.getToggleSortingHandler()
                    : undefined
                }
                pinned={header.column.getIsPinned()}
                pinOffset={header.column.getStart()}
                align={(header.column.columnDef.meta as any)?.align}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} selected={row.getIsSelected()} interactive>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                pinned={cell.column.getIsPinned()}
                pinOffset={cell.column.getStart()}
                align={(cell.column.columnDef.meta as any)?.align}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### 3. Large Dataset Virtualization (`@tanstack/react-virtual`)
Render 10,000+ rows smoothly with windowing:

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@moul-dev/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualTableExample({ data }: { data: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1].end || 0)
      : 0;

  return (
    <div ref={parentRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <Table stickyHeader dense wrapInContainer={false}>
        <TableHeader>
          <TableRow>
            <TableHead>Hostname</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead align="numeric">CPU</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} colSpan={4} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <TableRow key={item.id}>
                <TableCell>{item.hostname}</TableCell>
                <TableCell>{item.ip}</TableCell>
                <TableCell align="numeric">{item.cpu}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} colSpan={4} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### 4. Loading Skeleton & Empty States (`TableSkeleton`, `TableEmpty`, `EmptyState`)
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSkeleton, TableEmpty, EmptyState } from '@moul-dev/ui';

// Loading State (5 skeleton rows, 4 columns each)
<TableBody>
  <TableSkeleton rows={5} columns={4} />
</TableBody>

// Empty State Row
<TableBody>
  <TableEmpty colSpan={4}>
    <EmptyState
      title="No cluster nodes found"
      description="Try clearing active search filters or check cluster status."
    />
  </TableEmpty>
</TableBody>
```

#### 5. Props Reference for Table Suite
| Component | Prop | Type | Default | Description |
|:---|:---|:---|:---|:---|
| `Table` | `dense` | `boolean` | `false` | Enables compact padding for high-density tables |
| `Table` | `striped` | `boolean` | `false` | Alternating zebra background colors on even rows |
| `Table` | `hoverable` | `boolean` | `true` | Enables subtle row hover highlighting |
| `Table` | `stickyHeader` | `boolean` | `false` | Keeps `<thead>` pinned to the top on vertical scroll |
| `Table` | `layout` | `'auto' \| 'fixed'` | `'auto'` | Controls CSS `table-layout` algorithm |
| `Table` | `wrapInContainer` | `boolean` | `true` | Wraps table in a responsive horizontal scroll container |
| `Table` | `containerStyle` | `StyleXStyles` | - | StyleX styles applied to scroll wrapper |
| `Table` | `containerClassName` | `string` | - | CSS class applied to scroll wrapper |
| `TableHeader` | `sticky` | `boolean` | - | Overrides sticky header setting for thead |
| `TableRow` | `selected` | `boolean` | `false` | Primary selection background + `aria-selected="true"` |
| `TableRow` | `hoverable` | `boolean` | - | Overrides hoverable setting for this row |
| `TableRow` | `interactive` | `boolean` | `false` | Adds `cursor: pointer` for clickable rows |
| `TableHead` | `align` | `'left' \| 'center' \| 'right' \| 'numeric'` | `'left'` | Alignment (`numeric` right-aligns + tabular figures) |
| `TableHead` | `sortDirection` | `'asc' \| 'desc' \| 'ascending' \| 'descending' \| false \| null` | - | Directional chevron sort indicator |
| `TableHead` | `onSort` | `() => void` | - | Fired when header clicked or Space/Enter pressed |
| `TableHead` | `showSortIndicator` | `boolean` | `true` | Whether to render directional chevron |
| `TableHead` / `TableCell` | `pinned` | `'left' \| 'right' \| 'start' \| 'end'` | - | Sticky horizontal column pinning |
| `TableHead` / `TableCell` | `pinOffset` | `number \| string` | - | Pin offset (e.g. `0`, `'44px'`) |
| `TableCell` | `align` | `'left' \| 'center' \| 'right' \| 'numeric'` | `'left'` | Cell text alignment |
| `TableCell` | `tabular` | `boolean` | `false` | Enables `tabular-nums` for monospace numbers |
| `TableEmpty` | `colSpan` | `number` | `1` | Number of columns empty cell spans |
| `TableSkeleton` | `rows` | `number` | `5` | Number of skeleton pulse rows to render |
| `TableSkeleton` | `columns` | `number` | `4` | Number of skeleton columns per row |

---

### EmptyState & Pagination

#### `EmptyState`
```tsx
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, Button } from '@moul-dev/ui';

// Direct Props (Variants: 'default' | 'card' | 'dashed')
<EmptyState
  variant="default"
  title="No results found"
  description="We couldn't find anything matching your search criteria."
  action={<Button variant="outline" size="sm">Reset filters</Button>}
/>

// Composable Subcomponents
<EmptyState variant="dashed">
  <EmptyStateIcon>📁</EmptyStateIcon>
  <EmptyStateTitle>No files uploaded</EmptyStateTitle>
  <EmptyStateDescription>Upload PNG, JPG, or PDF files up to 25 MB.</EmptyStateDescription>
  <EmptyStateActions>
    <Button variant="primary" size="sm">Upload file</Button>
  </EmptyStateActions>
</EmptyState>
```

#### `Pagination`
```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationSummary,
  PaginationPageSize,
} from '@moul-dev/ui';
import { useState } from 'react';

// Basic Controlled
export function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <Pagination
      page={page}
      totalPages={25}
      total={250}
      pageSize={pageSize}
      onChange={setPage}
      onPageSizeChange={setPageSize}
      showSummary
      showPageSize
    />
  );
}
```

---

### Buttons & Actions

#### `Button`
```tsx
import { Button } from '@moul-dev/ui';

// Variants: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger' | 'danger-soft'
// Sizes: 'sm' | 'md' | 'lg'
<Button variant="primary" size="md" onPress={() => alert('Clicked')}>
  Save Project
</Button>

<Button variant="danger" isPending>
  Deleting...
</Button>
```

#### `ButtonGroup`
```tsx
import { Button, ButtonGroup } from '@moul-dev/ui';

<ButtonGroup orientation="horizontal" isAttached>
  <Button variant="outline">Day</Button>
  <Button variant="outline">Week</Button>
  <Button variant="outline">Month</Button>
</ButtonGroup>
```

#### `ToggleButton` & `ToggleButtonGroup`
```tsx
import { ToggleButton, ToggleButtonGroup } from '@moul-dev/ui';

<ToggleButton isSelected={isPinned} onChange={setIsPinned} variant="outline">
  Pin to Dashboard
</ToggleButton>

<ToggleButtonGroup selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}>
  <ToggleButton id="bold">Bold</ToggleButton>
  <ToggleButton id="italic">Italic</ToggleButton>
  <ToggleButton id="underline">Underline</ToggleButton>
</ToggleButtonGroup>
```

#### `Link` & `Kbd`
```tsx
import { Link, Kbd } from '@moul-dev/ui';

// Link Variants: 'primary' | 'secondary' | 'subtle' | Underline: 'always' | 'hover' | 'none'
<Link href="/docs" variant="primary" underline="hover">
  Read Documentation &rarr;
</Link>

<p>Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open command palette</p>
```

---

### Forms & Inputs

#### `TextField` & `TextArea`
```tsx
import { TextField, TextArea } from '@moul-dev/ui';

<TextField
  label="Email Address"
  type="email"
  placeholder="alex@example.com"
  description="We will send your verification code here."
  isRequired
/>

<TextArea
  label="Project Notes"
  placeholder="Add notes or requirements..."
  rows={4}
/>
```

#### `NumberField` & `SearchField`
```tsx
import { NumberField, SearchField } from '@moul-dev/ui';

<NumberField
  label="Quantity"
  minValue={1}
  maxValue={100}
  defaultValue={1}
  step={1}
/>

<SearchField
  label="Search assets"
  placeholder="Search by name, ID or tag..."
  onSubmit={(query) => console.log('Searching:', query)}
/>
```

#### `Select` & `ComboBox`
```tsx
import { Select, SelectItem, SelectSection, ComboBox, ComboBoxItem } from '@moul-dev/ui';

// Select
<Select
  label="Assignee"
  placeholder="Choose team member"
  selectedKey={assignee}
  onSelectionChange={(key) => setAssignee(key as string)}
>
  <SelectItem id="user-1" textValue="Alex Rivera">Alex Rivera</SelectItem>
  <SelectItem id="user-2" textValue="Jordan Lee">Jordan Lee</SelectItem>
  <SelectItem id="user-3" textValue="Sam Taylor">Sam Taylor</SelectItem>
</Select>

// ComboBox (Autocomplete Searchable)
<ComboBox
  label="Country"
  placeholder="Type to search..."
  onSelectionChange={(key) => setCountry(key as string)}
>
  <ComboBoxItem id="us">United States</ComboBoxItem>
  <ComboBoxItem id="ca">Canada</ComboBoxItem>
  <ComboBoxItem id="uk">United Kingdom</ComboBoxItem>
  <ComboBoxItem id="jp">Japan</ComboBoxItem>
</ComboBox>
```

#### `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`
```tsx
import { Checkbox, CheckboxGroup, RadioGroup, Radio, Switch } from '@moul-dev/ui';

<Checkbox isSelected={agree} onChange={setAgree}>
  I accept the terms and conditions
</Checkbox>

<CheckboxGroup label="Notifications" value={notifications} onChange={setNotifications}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
  <Checkbox value="push">Push</Checkbox>
</CheckboxGroup>

<RadioGroup label="Plan tier" defaultValue="pro" orientation="horizontal">
  <Radio value="free">Free ($0)</Radio>
  <Radio value="pro">Pro ($29/mo)</Radio>
  <Radio value="enterprise">Enterprise</Radio>
</RadioGroup>

<Switch isSelected={isLive} onChange={setIsLive}>
  Enable real-time synchronization
</Switch>
```

#### `InputOTP`, `Slider`, `ProgressBar`
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, REGEXP_ONLY_DIGITS, Slider, ProgressBar } from '@moul-dev/ui';

<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={setOtp}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>

<Slider label="Volume" defaultValue={60} minValue={0} maxValue={100} />
<ProgressBar label="Uploading assets" value={45} minValue={0} maxValue={100} />
```

#### `DatePicker` & `Calendar`
```tsx
import { DatePicker, Calendar } from '@moul-dev/ui';

<DatePicker label="Event date" isRequired />
<Calendar aria-label="Appointment date" />
```

---

### Command Palette

#### `CommandPalette`
```tsx
import {
  CommandPalette,
  CommandPaletteInput,
  CommandPaletteList,
  CommandPaletteGroup,
  CommandPaletteItem,
  CommandPaletteSeparator,
  CommandPaletteEmpty,
  Kbd
} from '@moul-dev/ui';

<CommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
  <CommandPaletteInput placeholder="Type a command or search..." />
  <CommandPaletteList>
    <CommandPaletteEmpty>No matching actions found.</CommandPaletteEmpty>
    <CommandPaletteGroup heading="Suggestions">
      <CommandPaletteItem onSelect={() => navigate('/projects/new')}>
        <span>Create new project</span>
        <Kbd>⌘N</Kbd>
      </CommandPaletteItem>
      <CommandPaletteItem onSelect={() => navigate('/settings')}>
        <span>Account settings</span>
        <Kbd>⌘S</Kbd>
      </CommandPaletteItem>
    </CommandPaletteGroup>
  </CommandPaletteList>
</CommandPalette>
```

---

### Overlays & Dialogs

#### `Drawer`
```tsx
import {
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Button
} from '@moul-dev/ui';

// Placements: 'right' | 'left' | 'top' | 'bottom'
// Sizes: 'sm' | 'md' | 'lg' | 'full'
<DrawerOverlay isOpen={isOpen} onOpenChange={setIsOpen} isDismissable>
  <Drawer placement="right" size="md">
    <DrawerDialog>
      <DrawerHeader>
        <DrawerTitle>Create API Key</DrawerTitle>
        <DrawerCloseButton />
      </DrawerHeader>
      <DrawerBody>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          API keys allow external systems to securely interact with your data.
        </p>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="outline" onPress={() => setIsOpen(false)}>Cancel</Button>
        <Button variant="primary" onPress={() => { handleCreate(); setIsOpen(false); }}>Generate</Button>
      </DrawerFooter>
    </DrawerDialog>
  </Drawer>
</DrawerOverlay>
```

#### `Modal`
```tsx
import {
  Modal,
  ModalOverlay,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@moul-dev/ui';

<ModalOverlay isOpen={isOpen} onOpenChange={setIsOpen} isDismissable>
  <Modal size="md">
    <ModalDialog>
      <ModalHeader>
        <h2 className="text-lg font-semibold">Create API Key</h2>
      </ModalHeader>
      <ModalBody>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          API keys allow external systems to securely interact with your data.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onPress={() => setIsOpen(false)}>Cancel</Button>
        <Button variant="primary" onPress={() => { handleCreate(); setIsOpen(false); }}>Generate</Button>
      </ModalFooter>
    </ModalDialog>
  </Modal>
</ModalOverlay>
```

#### `AlertDialog`
```tsx
import { AlertDialog } from '@moul-dev/ui';

// Variants: 'destructive' | 'confirmation' | 'info'
<AlertDialog
  isOpen={showDeleteAlert}
  onOpenChange={setShowDeleteAlert}
  variant="destructive"
  title="Revoke Certificate?"
  actionLabel="Revoke Immediately"
  cancelLabel="Keep Active"
  onAction={() => handleRevoke()}
>
  This action cannot be undone. All active connections using this certificate will be terminated immediately.
</AlertDialog>
```

#### `Popover` & `Tooltip`
```tsx
import { Popover, PopoverTrigger, PopoverDialog, Tooltip, TooltipTrigger, Button } from '@moul-dev/ui';

// Tooltip
<TooltipTrigger delay={200}>
  <Button variant="ghost" aria-label="Settings">⚙️</Button>
  <Tooltip>Account & workspace settings</Tooltip>
</TooltipTrigger>

// Popover
<PopoverTrigger>
  <Button variant="outline">Filter Data</Button>
  <Popover placement="bottom start">
    <PopoverDialog>
      <div className="p-3 w-64 space-y-2">
        <h4 className="text-sm font-semibold">Filter Options</h4>
        {/* controls */}
      </div>
    </PopoverDialog>
  </Popover>
</PopoverTrigger>
```

---

### Feedback & Status

#### `Alert`
```tsx
import { Alert, Button } from '@moul-dev/ui';

// Variants: 'info' | 'accent' | 'success' | 'warning' | 'error' | 'loading'
<Alert
  variant="success"
  title="Deployment Successful"
  description="Your production deployment is live and serving traffic."
/>

<Alert
  variant="accent"
  title="Update available"
  description="A new version is ready to install."
  action={<Button variant="primary" size="sm">Refresh</Button>}
/>
```

#### `Badge`, `Avatar`, `Spinner`, `Skeleton`
```tsx
import { Badge, Avatar, Spinner, Skeleton } from '@moul-dev/ui';

// Badge Variants: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline'
<Badge variant="success" size="md" dot>Operational</Badge>
<Badge variant="danger" size="sm" dot>Degraded</Badge>

// Avatar Sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
<Avatar
  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  alt="Sofia Davis"
  initials="SD"
  size="md"
  status="online"
/>

<Spinner size="md" />
<Skeleton variant="text" count={3} />
```

#### `Toast`
```tsx
import { ToastContainer, toastQueue } from '@moul-dev/ui';

// Place <ToastContainer /> once at root (e.g. App.tsx)
<ToastContainer />

// Trigger toast from any handler
toastQueue.add({
  title: 'Changes saved',
  description: 'Your project settings have been updated.',
  variant: 'success', // 'default' | 'success' | 'warning' | 'danger' | 'info'
  timeout: 5000,
});
```

---

### Layout & Navigation

#### `Card`
```tsx
import { Card, CardHeader, CardBody, CardFooter, Button } from '@moul-dev/ui';

// Variants: 'elevated' | 'outlined' | 'flat' | 'interactive'
<Card variant="outlined">
  <CardHeader>
    <h3 className="font-semibold text-base">Database Cluster</h3>
    <p className="text-xs text-neutral-500">PostgreSQL 16 High Availability</p>
  </CardHeader>
  <CardBody>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      Running 3 replicas across us-east-1 with automatic failover.
    </p>
  </CardBody>
  <CardFooter className="flex justify-between items-center">
    <span className="text-xs text-emerald-600 font-medium">Healthy</span>
    <Button variant="outline" size="sm">Manage</Button>
  </CardFooter>
</Card>
```

#### `Tabs`
```tsx
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@moul-dev/ui';

<Tabs defaultSelectedKey="overview">
  <TabList aria-label="Project tabs">
    <Tab id="overview">Overview</Tab>
    <Tab id="metrics">Metrics</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel id="overview">Overview content...</TabPanel>
    <TabPanel id="metrics">Metrics charts and tables...</TabPanel>
    <TabPanel id="settings">Settings configuration...</TabPanel>
  </TabPanels>
</Tabs>
```

#### `TagGroup` & `Tag`
```tsx
import { TagGroup, Tag } from '@moul-dev/ui';

<TagGroup
  label="Categories"
  selectionMode="multiple"
  selectedKeys={selectedTags}
  onSelectionChange={setSelectedTags}
>
  <Tag id="react" variant="primary">React</Tag>
  <Tag id="stylex" variant="success">StyleX</Tag>
  <Tag id="a11y" variant="outline">Accessibility</Tag>
</TagGroup>
```

#### `Sidebar` (App Navigation Block)
```tsx
import {
  Sidebar,
  SidebarAside,
  SidebarMain,
  SidebarHeader,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarDivider,
  Avatar
} from '@moul-dev/ui';

<Sidebar selectedKey={currentNav} onSelectionChange={setCurrentNav} variant="solid">
  <SidebarAside showCollapseToggle>
    <SidebarHeader>
      <span className="font-bold text-lg">Moul Console</span>
    </SidebarHeader>
    <SidebarGroup title="Platform" collapsible>
      <SidebarItem id="dashboard" icon={<DashboardIcon />}>Dashboard</SidebarItem>
      <SidebarItem id="analytics" icon={<ChartIcon />}>Analytics</SidebarItem>
      <SidebarItem id="deployments" icon={<RocketIcon />}>Deployments</SidebarItem>
    </SidebarGroup>
    <SidebarDivider />
    <SidebarGroup title="System" collapsible>
      <SidebarItem id="settings" icon={<SettingsIcon />}>Settings</SidebarItem>
      <SidebarItem id="security" icon={<ShieldIcon />}>Security</SidebarItem>
    </SidebarGroup>
    <SidebarFooter showBorder>
      <div className="flex items-center gap-2">
        <Avatar initials="AD" />
        <span className="text-sm font-medium">Alex Dev</span>
      </div>
    </SidebarFooter>
  </SidebarAside>
  <SidebarMain>
    {/* Page Content */}
  </SidebarMain>
</Sidebar>
```

#### `Logs` Stream Viewer Block
```tsx
import { Logs, LogsStream, LogsToolbar, LogsDrawerInspector } from '@moul-dev/ui';

<Logs
  data={logEntries}
  filterLevel={filterLevel}
  onFilterLevelChange={setFilterLevel}
  searchQuery={query}
  onSearchChange={setQuery}
/>
```

---

### Charts & Analytics

#### `AreaChart` & `LineChart`
```tsx
import { ChartContainer, AreaChart, LineChart } from '@moul-dev/ui';

const chartData = [
  { date: 'Jan', revenue: 4200, expenses: 2400 },
  { date: 'Feb', revenue: 5800, expenses: 2800 },
  { date: 'Mar', revenue: 7200, expenses: 3100 },
  { date: 'Apr', revenue: 9100, expenses: 3400 },
];

<ChartContainer title="Financial Performance" description="Monthly revenue vs operating costs">
  <AreaChart
    data={chartData}
    index="date"
    categories={['revenue', 'expenses']}
    valueFormatter={(v) => `$${v.toLocaleString()}`}
    height={280}
  />
</ChartContainer>
```

#### `BarChart` & `DoughnutChart`
```tsx
import { BarChart, DoughnutChart } from '@moul-dev/ui';

const deviceData = [
  { device: 'Desktop', share: 58 },
  { device: 'Mobile', share: 34 },
  { device: 'Tablet', share: 8 },
];

<DoughnutChart
  data={deviceData}
  index="device"
  category="share"
  variant="donut"
  valueFormatter={(v) => `${v}%`}
/>
```

#### `Stat`, `TopList`, `PercentageBar`, `PercentageCircle`
```tsx
import { Stat, TopList, PercentageBar, PercentageCircle } from '@moul-dev/ui';

<Stat
  label="Monthly Active Users"
  value="128,420"
  change="+18.4%"
  changeType="positive"
  description="vs previous month"
/>

<TopList
  items={[
    { name: 'API Server', value: '99.98%', change: '+0.02%' },
    { name: 'Auth Gateway', value: '99.95%', change: '-0.01%' },
    { name: 'Edge Worker', value: '100.0%', change: '0.00%' },
  ]}
/>

<PercentageBar value={74} max={100} label="Storage Used (74 GB / 100 GB)" />
<PercentageCircle value={82} max={100} label="Health Score" />
```

---

## 4. Theming & Design Tokens

Moul UI tokens are driven by StyleX and OKLCH color spaces. Design tokens can be imported from `@moul-dev/ui/tokens.stylex` or directly from `@moul-dev/ui`:

```tsx
import * as stylex from '@stylexjs/stylex';
import { tokens } from '@moul-dev/ui';

const styles = stylex.create({
  card: {
    backgroundColor: tokens.colorBgSubtle,
    color: tokens.colorFg,
    borderColor: tokens.colorBorderSubtle,
    borderRadius: tokens.radiusMd,
    padding: tokens.spacing4,
    fontFamily: tokens.fontFamilyBase,
  },
});
```

Because `tokens` contains CSS variable bindings using `light-dark(...)` and OKLCH color spaces, tokens can also be passed directly to SVG icons, Recharts palettes, and inline styles:

```tsx
<Database size={20} color={tokens.colorPrimary500} />
<Trash size={16} color={tokens.colorError500} />
<span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
  Updated 2 minutes ago
</span>
```

### Available Tokens
- **Palette**: `colorNeutral50`–`colorNeutral900`, `colorPrimary50`–`colorPrimary900`, `colorError300`–`colorError700`, `colorWarning300`–`colorWarning700`, `colorSuccess300`–`colorSuccess700`
- **Semantic Aliases**: `colorBg`, `colorBgSubtle`, `colorBgElevated`, `colorFg`, `colorFgSubtle`, `colorFgOnPrimary`, `colorBorder`, `colorBorderSubtle`, `colorBorderFocus`, `colorBgGlass`, `colorBorderGlass`, `colorShadow`, `colorOverlay`
- **Status & Alerts**: `colorAlertBgInfo`, `colorAlertBorderInfo`, `colorAlertHoverInfo`, `colorAlertActiveInfo`, `colorAlertBgAccent`, `colorAlertBorderAccent`, `colorAlertHoverAccent`, `colorAlertActiveAccent`, `colorAlertBgSuccess`, `colorAlertBorderSuccess`, `colorAlertHoverSuccess`, `colorAlertActiveSuccess`, `colorAlertBgWarning`, `colorAlertBorderWarning`, `colorAlertHoverWarning`, `colorAlertActiveWarning`, `colorAlertBgError`, `colorAlertBorderError`, `colorAlertHoverError`, `colorAlertActiveError`
- **Typography & Font**: `fontSizeXs`–`fontSize4xl`, `lineHeightXs`–`lineHeight4xl`, `fontWeightNormal`–`fontWeightBold`, `fontFamilyBase`
- **Spacing & Radius**: `spacing1`–`spacing8`, `radiusNone`–`radiusFull`
- **Shadows & Z-Index**: `shadowSm`, `shadowMd`, `shadowLg`, `zIndexBase`, `zIndexDropdown`, `zIndexModal`, `zIndexTooltip`, `zIndexToast`
- **Charts**: `colorChart1`–`colorChart8`

You can customize the look and feel dynamically using CSS custom properties:

```css
:root {
  /* Brand Color Hue (0 to 360) - e.g., 250 for Indigo, 205 for Cyan/Slate, 145 for Emerald */
  --brand-hue: 250;

  /* Brand Chroma Multiplier (0.0 to 2.0) */
  --brand-chroma-multiplier: 1.0;

  /* UI Density Factor (0.8 = Compact, 1.0 = Default, 1.25 = Spacious) */
  --brand-density-factor: 1.0;

  /* Corner Radius Multiplier (0 = Sharp, 0.5 = Subtle, 1.0 = Default, 1.5 = Curved, 2.0 = Round) */
  --brand-radius-factor: 1.0;

  /* Typography Font Scale */
  --brand-font-scale: 1.0;
}
```

---

## 5. Anti-Patterns & Pitfalls to Avoid

| ❌ Anti-Pattern | ✅ Correct Approach |
|:---|:---|
| `<Button onClick={handleClick}>` | `<Button onPress={handleClick}>` (Uses React Aria `onPress` for touch + keyboard support) |
| `<Button><Icon /></Button>` without label | `<Button aria-label="Action description"><Icon /></Button>` |
| Re-inventing custom `<button>` or `<input>` primitives | Use `<Button>`, `<TextField>`, `<Select>`, `<Checkbox>` from `@moul-dev/ui` |
| Using old Column / Row React Aria table primitives | Use semantic `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableBody>`, `<TableFooter>` |
| Creating custom sort buttons or manual chevron icons in table headers | Pass `sortDirection` and `onSort` directly to `<TableHead sortDirection={...} onSort={...}>` |
| Hacking custom table loading states with divs | Use `<TableSkeleton rows={5} columns={4} />` inside `<TableBody>` |
| Hacking empty table states with broken layout divs | Use `<TableEmpty colSpan={...}><EmptyState ... /></TableEmpty>` inside `<TableBody>` |
| Wrapping `<Table>` in redundant overflow wrapper divs | `<Table>` wraps in horizontal scroll container automatically by default (`wrapInContainer={true}`) |
| Missing `@moul-dev/ui/style.css` stylesheet | Import `@moul-dev/ui/style.css` in root file |
| Using string classes for dynamic theme colors | Set `--brand-hue` or use `<ThemeProvider>` |
| Passing native `open` prop to Modal | Use `isOpen` and `onOpenChange` on `ModalOverlay` |
