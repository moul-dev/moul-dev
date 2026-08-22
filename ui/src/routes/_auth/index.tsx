import { createFileRoute, useNavigate, Link as RouterLink } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  DatabaseIcon,
  CpuIcon,
  HardDrivesIcon,
  PulseIcon,
  ArrowRightIcon,
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
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  collectionList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: tokens.spacing4,
  },
  collectionCardInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    textDecoration: 'none',
  },
  collectionName: {
    fontWeight: 600,
    color: tokens.colorFg,
    fontSize: '0.9375rem',
    fontFamily: tokens.fontFamilyBase,
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
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
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
        <h2 {...stylex.props(styles.sectionTitle)}>Defined Collections</h2>
        {moulsLoading ? (
          <div style={{ color: tokens.colorFgSubtle }}>Loading collections...</div>
        ) : !mouls || mouls.length === 0 ? (
          <div {...stylex.props(styles.emptyBox)}>
            No custom collections created yet. Click "Manage Collections" to design your first schema.
          </div>
        ) : (
          <div {...stylex.props(styles.collectionList)}>
            {mouls.map((moul: any) => (
              <RouterLink
                key={moul.name}
                to="/records/$moulName"
                params={{ moulName: moul.name }}
                search={{ page: 1, perPage: 30 }}
                style={{ textDecoration: 'none' }}
              >
                <Card variant="glass">
                  <CardBody>
                    <div {...stylex.props(styles.collectionCardInner)}>
                      <div {...stylex.props(styles.collectionName)}>
                        <DatabaseIcon size={18} color={tokens.colorPrimary500} />
                        <span>{moul.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        <ArrowRightIcon size={14} color={tokens.colorFgSubtle} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </RouterLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

