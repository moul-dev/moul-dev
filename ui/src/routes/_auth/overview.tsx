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
} from '@phosphor-icons/react';
import {
  Stat,
  Card,
  CardBody,
  Badge,
  Button,
  EmptyState,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
    maxWidth: 'var(--content-max-width, 1200px)',
    width: '100%',
    marginInline: 'auto',
    boxSizing: 'border-box',
    transition: 'max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
});

export const Route = createFileRoute('/_auth/overview')({
  component: OverviewPage,
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
                <span style={{ textTransform: 'capitalize' }}>{moul.name}</span>
              </div>
            </RouterLink>

            <div {...stylex.props(styles.badgesGroup)}>
              <Badge variant={typeVariant}>
                {moul.type}
              </Badge>
              <Badge variant="neutral">
                {isLoading ? '...' : `${totalCount} records`}
              </Badge>
            </div>
          </div>

          <div {...stylex.props(styles.cardBottomRow)}>
            <Button
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

function OverviewPage() {
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
          <h1 {...stylex.props(styles.title)}>Overview</h1>
          <span {...stylex.props(styles.subtitle)}>
            System status and collections at a glance.
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
          label="Collections"
          value={moulsLoading ? '...' : collectionCount}
          icon={<DatabaseIcon size={20} color={tokens.colorPrimary500} />}
          description="Active schema tables"
        />

        <Stat
          variant="glass"
          label="Memory"
          value={memoryAlloc}
          icon={<CpuIcon size={20} color={tokens.colorSuccess500} />}
          description="Go runtime heap"
        />

        <Stat
          variant="glass"
          label="Goroutines"
          value={goroutines}
          icon={<PulseIcon size={20} color={tokens.colorWarning500} />}
          description="Active concurrent routines"
        />

        <Stat
          variant="glass"
          label="Storage Engine"
          value={dbStatus}
          icon={<HardDrivesIcon size={20} color={tokens.colorPrimary500} />}
          description="SQLite with WAL mode"
        />
      </div>

      {/* Collections Overview */}
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Collections</h2>
          {collectionCount > 2 && (
            <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
              {collectionCount} collections
            </span>
          )}
        </div>

        {moulsLoading ? (
          <div style={{ color: tokens.colorFgSubtle }}>Loading collections...</div>
        ) : !mouls || mouls.length === 0 ? (
          <EmptyState
            variant="dashed"
            icon={<DatabaseIcon size={32} color={tokens.colorPrimary500} />}
            title="No collections yet"
            description="Create your first collection to define your schema and store data."
            action={
              <Button
                variant="primary"
                onPress={() => navigate({ to: '/collections' })}
              >
                <PlusIcon size={14} />
                <span>Create Collection</span>
              </Button>
            }
          />
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
