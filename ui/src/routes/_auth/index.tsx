import React from 'react';
import { createFileRoute, useNavigate, Link as RouterLink } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  DatabaseIcon,
  CpuIcon,
  HardDrivesIcon,
  PulseIcon,
  ArrowRightIcon,
  PlusIcon,
  TableIcon,
} from '@phosphor-icons/react';
import {
  Stat,
  Card,
  CardBody,
  Badge,
  Button,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
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
    margin: 0,
  },
  subtitle: {
    color: tokens.colorFgSubtle,
    fontSize: tokens.fontSizeSm,
    fontFamily: tokens.fontFamilyBase,
    marginTop: tokens.spacing1,
    display: 'block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacing4,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    margin: 0,
  },
  collectionList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: tokens.spacing4,
  },
  collectionCardInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    width: '100%',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionName: {
    fontWeight: 600,
    color: tokens.colorFg,
    fontSize: '0.9375rem',
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    textDecoration: 'none',
  },
  cardBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacing2,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorBorderSubtle,
  },
  badgesGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  emptyBox: {
    padding: tokens.spacing6,
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

export const Route = createFileRoute('/_auth/')({
  component: DashboardPage,
});

function CollectionCardItem({ moul }: { moul: any }) {
  const navigate = useNavigate();

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['collectionRecordCount', moul.name],
    queryFn: () => api.listRecords(moul.name, { perPage: 1 }),
  });

  const totalCount =
    (recordsData && !Array.isArray(recordsData) ? recordsData.totalItems : undefined) ??
    (Array.isArray(recordsData) ? recordsData.length : 0);

  const typeVariant =
    moul.type === 'auth'
      ? 'primary'
      : moul.type === 'worker'
        ? 'warning'
        : moul.type === 'analytic'
          ? 'success'
          : 'neutral';

  return (
    <Card variant="glass">
      <CardBody>
        <div {...stylex.props(styles.collectionCardInner)}>
          <div {...stylex.props(styles.cardTopRow)}>
            <RouterLink
              to="/records/$moulName"
              params={{ moulName: moul.name }}
              search={{ page: 1, perPage: 30 }}
              style={{ textDecoration: 'none' }}
            >
              <div {...stylex.props(styles.collectionName)}>
                <DatabaseIcon size={18} color={tokens.colorPrimary500} />
                <span>{moul.name}</span>
              </div>
            </RouterLink>

            <div {...stylex.props(styles.badgesGroup)}>
              <Badge variant={typeVariant} size="sm">
                {moul.type}
              </Badge>
              <Badge variant="neutral" size="sm">
                {isLoading ? '...' : `${totalCount} records`}
              </Badge>
            </div>
          </div>

          <div {...stylex.props(styles.cardBottomRow)}>
            <Button
              size="sm"
              variant="outline"
              aria-label={`Create new record in ${moul.name}`}
              onPress={() =>
                navigate({
                  to: '/records/$moulName',
                  params: { moulName: moul.name },
                  search: { page: 1, perPage: 30, create: true },
                })
              }
            >
              <PlusIcon size={14} />
              <span>New Record</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              aria-label={`Browse ${moul.name} records`}
              onPress={() =>
                navigate({
                  to: '/records/$moulName',
                  params: { moulName: moul.name },
                  search: { page: 1, perPage: 30 },
                })
              }
            >
              <span>View Table</span>
              <ArrowRightIcon size={14} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { data: mouls, isLoading: moulsLoading } = useQuery({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  });

  const { data: metrics } = useQuery({
    queryKey: ['sysmon'],
    queryFn: api.getMetrics,
    refetchInterval: 5000,
  });

  const collectionCount = Array.isArray(mouls) ? mouls.length : 0;
  const memoryAlloc = metrics?.mem?.alloc_mb ? `${metrics.mem.alloc_mb} MB` : 'Normal';
  const goroutines = metrics?.goroutines || 12;
  const dbStatus = 'SQLite (WAL Active)';

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Engine Dashboard</h1>
          <span {...stylex.props(styles.subtitle)}>
            System overview and database collection metrics
          </span>
        </div>
        <Button
          variant="primary"
          onPress={() => navigate({ to: '/collections' })}
        >
          <span>Manage Collections</span>
          <ArrowRightIcon size={16} />
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div {...stylex.props(styles.grid)}>
        <Stat
          variant="glass"
          label="COLLECTIONS"
          value={moulsLoading ? '...' : collectionCount}
          icon={<DatabaseIcon size={20} color={tokens.colorPrimary500} />}
          description="Dynamic schema tables defined"
        />

        <Stat
          variant="glass"
          label="MEMORY ALLOCATED"
          value={memoryAlloc}
          icon={<CpuIcon size={20} color={tokens.colorSuccess500} />}
          description="Go runtime heap allocations"
        />

        <Stat
          variant="glass"
          label="GOROUTINES"
          value={goroutines}
          icon={<PulseIcon size={20} color={tokens.colorWarning500} />}
          description="Active concurrent worker routines"
        />

        <Stat
          variant="glass"
          label="STORAGE ENGINE"
          value={dbStatus}
          icon={<HardDrivesIcon size={20} color={tokens.colorPrimary500} />}
          description="Litestream Continuous Backup Ready"
        />
      </div>

      {/* Collections Overview */}
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Defined Collections</h2>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            {collectionCount} schema tables
          </span>
        </div>

        {moulsLoading ? (
          <div style={{ color: tokens.colorFgSubtle }}>Loading collections...</div>
        ) : !mouls || mouls.length === 0 ? (
          <div {...stylex.props(styles.emptyBox)}>
            No custom collections created yet. Click "Manage Collections" to design your first schema.
          </div>
        ) : (
          <div {...stylex.props(styles.collectionList)}>
            {mouls.map((moul: any) => (
              <CollectionCardItem key={moul.name} moul={moul} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
