---
name: moul-ui
description: >-
  Expert guidance, component catalog, API reference, and recipes for Moul UI (@moul-dev/ui)
  — an accessible, zero-runtime React component library built with React Aria Components
  and StyleX. Use when creating buttons, inputs, forms, dialogs, modals, sidebars, cards,
  tables, charts, badges, toasts, or configuring design tokens and themes.
---

# Moul UI (`@moul-dev/ui`) — AI Agent Guidelines & Component Reference

`@moul-dev/ui` is an accessible, zero-runtime React component library built with **React Aria Components** and **StyleX**.

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
import { Button, TextField, Modal, Card, AreaChart, toastQueue } from '@moul-dev/ui';
```

### Rule 2: Use React Aria Event Handlers (`onPress` vs `onClick`)
Buttons and trigger components use `onPress` from React Aria to handle touch, mouse, and keyboard activations uniformly:
```tsx
// ✅ Correct
<Button variant="primary" onPress={() => handleSubmit()}>Save Changes</Button>

// ❌ Avoid for React Aria Button
<Button onClick={() => handleSubmit()}>Save Changes</Button>
```

### Rule 3: Use Standard React Aria State Props
- **Selection**: `isSelected`, `defaultSelected`, `onChange` (for single items like `Checkbox`, `Switch`, `ToggleButton`).
- **Collections**: `selectedKey`, `defaultSelectedKey`, `selectedKeys`, `defaultSelectedKeys`, `onSelectionChange` (for `Select`, `ComboBox`, `Tabs`, `Table`, `TagGroup`, `ToggleButtonGroup`, `Sidebar`).
- **Dialogs & Overlays**: `isOpen`, `defaultOpen`, `onOpenChange` (for `Modal`, `Popover`, `Tooltip`).
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
Components such as `Modal`, `Drawer`, `AlertDialog`, `Card`, `Tabs`, `Table`, `Select`, and `Sidebar` use declarative compound subcomponents:
- `Card`: `<Card>`, `<CardHeader>`, `<CardBody>`, `<CardFooter>`
- `Modal`: `<ModalOverlay>`, `<Modal>`, `<ModalDialog>`, `<ModalHeader>`, `<ModalBody>`, `<ModalFooter>`
- `Drawer`: `<DrawerOverlay>`, `<Drawer>`, `<DrawerDialog>`, `<DrawerHeader>`, `<DrawerTitle>`, `<DrawerCloseButton>`, `<DrawerBody>`, `<DrawerFooter>`
- `AlertDialog`: `<AlertDialog>`, `<AlertDialogHeader>`, `<AlertDialogBody>`, `<AlertDialogFooter>`
- `Popover`: `<PopoverTrigger>`, `<Popover>`, `<PopoverDialog>`
- `Tooltip`: `<TooltipTrigger>`, `<Tooltip>`
- `Tabs`: `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanels>`, `<TabPanel>`
- `Table`: `<Table>`, `<TableHeader>`, `<Column>`, `<TableBody>`, `<Row>`, `<Cell>`
- `Sidebar`: `<Sidebar>`, `<SidebarAside>`, `<SidebarHeader>`, `<SidebarGroup>`, `<SidebarItem>`, `<SidebarFooter>`, `<SidebarDivider>`, `<SidebarMain>`
- `InputOTP`: `<InputOTP>`, `<InputOTPGroup>`, `<InputOTPSlot>`, `<InputOTPSeparator>`

---

## 3. Component Catalog & Code Recipes

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

#### `InputOTP` & `Slider`
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, REGEXP_ONLY_DIGITS, Slider } from '@moul-dev/ui';

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
<Badge variant="success" size="md">Operational</Badge>
<Badge variant="danger" size="sm">Degraded</Badge>

// Avatar Sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
<Avatar
  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  alt="Sofia Davis"
  initials="SD"
  size="md"
  status="online"
/>

<Spinner size="md" />
<Skeleton className="w-full h-12 rounded-lg" />
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

#### `Table`
```tsx
import { Table, TableHeader, Column, TableBody, Row, Cell } from '@moul-dev/ui';

<Table aria-label="Transactions table" selectionMode="multiple">
  <TableHeader>
    <Column isRowHeader>Transaction ID</Column>
    <Column>Amount</Column>
    <Column>Status</Column>
    <Column>Date</Column>
  </TableHeader>
  <TableBody>
    <Row id="tx-101">
      <Cell>TX-98402</Cell>
      <Cell>$1,240.00</Cell>
      <Cell>Completed</Cell>
      <Cell>2026-08-16</Cell>
    </Row>
    <Row id="tx-102">
      <Cell>TX-98403</Cell>
      <Cell>$89.50</Cell>
      <Cell>Pending</Cell>
      <Cell>2026-08-17</Cell>
    </Row>
  </TableBody>
</Table>
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

Moul UI tokens are driven by StyleX and OKLCH color spaces. Design tokens are imported from `@moul-dev/ui/tokens.stylex`:

```tsx
import { tokens } from '@moul-dev/ui/tokens.stylex';

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

Because `tokens` contains the actual values (using `light-dark(...)` and OKLCH color spaces), tokens can also be passed directly to SVG icons, Recharts palettes, and inline styles:

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
| Missing `@moul-dev/ui/style.css` stylesheet | Import `@moul-dev/ui/style.css` in root file |
| Using string classes for dynamic theme colors | Set `--brand-hue` or use `<ThemeProvider>` |
| Passing native `open` prop to Modal | Use `isOpen` and `onOpenChange` on `ModalOverlay` |
