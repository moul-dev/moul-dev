import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  GlobeIcon,
  ListBulletsIcon,
  ArrowsClockwiseIcon,
  ChartLineUpIcon,
  ClockIcon,
  WarningCircleIcon,
  UsersIcon,
  CompassIcon,
} from '@phosphor-icons/react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
  TableEmpty,
  EmptyState,
  Badge,
  Button,
  Stat,
  ChartContainer,
  AreaChart,
  TopList,
  Card,
  CardHeader,
  CardBody,
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: tokens.spacing4,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: tokens.spacing4,
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
});

export const Route = createFileRoute('/_auth/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'visits'>('requests');

  const {
    data: requestsData,
    isLoading: reqLoading,
    refetch: refetchReq,
  } = useQuery({
    queryKey: ['requests'],
    queryFn: () => api.listRequests({ perPage: 100 }),
    refetchInterval: 10000,
  });

  const {
    data: visitsData,
    isLoading: visitsLoading,
    refetch: refetchVisits,
  } = useQuery({
    queryKey: ['visits'],
    queryFn: () => api.listVisits({ perPage: 100 }),
    refetchInterval: 10000,
  });

  const requests: any[] = Array.isArray(requestsData) ? requestsData : requestsData?.items || [];
  const visits: any[] = Array.isArray(visitsData) ? visitsData : visitsData?.items || [];

  // Telemetry Aggregations
  const stats = useMemo(() => {
    const totalReqs = requests.length;
    let totalDuration = 0;
    let errCount = 0;

    requests.forEach((r: any) => {
      totalDuration += Number(r.duration || 0);
      const status = Number(r.status || r.statusCode || 200);
      if (status >= 400) {
        errCount++;
      }
    });

    const avgDuration = totalReqs > 0 ? Math.round(totalDuration / totalReqs) : 0;
    const errorRate = totalReqs > 0 ? ((errCount / totalReqs) * 100).toFixed(1) : '0.0';

    return {
      totalReqs,
      avgDuration,
      errCount,
      errorRate,
      totalVisits: visits.length,
    };
  }, [requests, visits]);

  // Requests over time data for AreaChart
  const timeSeriesData = useMemo(() => {
    if (requests.length === 0) {
      // Dummy baseline points for empty state visualization
      return [
        { time: '00:00', success: 0, error: 0 },
        { time: '04:00', success: 0, error: 0 },
        { time: '08:00', success: 0, error: 0 },
        { time: '12:00', success: 0, error: 0 },
        { time: '16:00', success: 0, error: 0 },
        { time: '20:00', success: 0, error: 0 },
      ];
    }

    // Sort requests by created_at ascending
    const sorted = [...requests].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    // Group into 10 minute intervals or chronological buckets
    const bucketMap = new Map<string, { time: string; success: number; error: number }>();

    sorted.forEach((r) => {
      const date = r.created_at ? new Date(r.created_at) : new Date();
      // Format as HH:MM
      const timeKey = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const current = bucketMap.get(timeKey) || { time: timeKey, success: 0, error: 0 };
      const status = Number(r.status || r.statusCode || 200);
      if (status >= 400) {
        current.error += 1;
      } else {
        current.success += 1;
      }
      bucketMap.set(timeKey, current);
    });

    const data = Array.from(bucketMap.values());
    return data.length > 0 ? data : [{ time: 'Now', success: 0, error: 0 }];
  }, [requests]);

  // Top Paths aggregation for TopList
  const topPaths = useMemo(() => {
    const counts = new Map<string, number>();
    requests.forEach((r: any) => {
      const p = r.path || r.url || '/';
      counts.set(p, (counts.get(p) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([path, count]) => ({ label: path, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [requests]);

  // Top Referrers / Sources for TopList
  const topReferrers = useMemo(() => {
    const counts = new Map<string, number>();
    visits.forEach((v: any) => {
      const ref = v.referrer || 'Direct / Bookmark';
      counts.set(ref, (counts.get(ref) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([referrer, count]) => ({ label: referrer, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [visits]);

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Analytics & Request Logs</h1>
          <span {...stylex.props(styles.subtitle)}>
            Real-time traffic telemetry, endpoint throughput, and visitor tracking.
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            refetchReq();
            refetchVisits();
          }}
        >
          <ArrowsClockwiseIcon size={14} />
          <span>Refresh All</span>
        </Button>
      </div>

      {/* STAT SUMMARY CARDS */}
      <div {...stylex.props(styles.statsGrid)}>
        <Stat
          variant="glass"
          label="TOTAL REQUESTS"
          value={reqLoading ? '...' : stats.totalReqs}
          icon={<ChartLineUpIcon size={20} color={tokens.colorPrimary500} />}
          description="Recent HTTP requests recorded"
        />
        <Stat
          variant="glass"
          label="AVG DURATION"
          value={reqLoading ? '...' : `${stats.avgDuration} ms`}
          icon={<ClockIcon size={20} color={tokens.colorWarning500} />}
          description="Mean server response latency"
        />
        <Stat
          variant="glass"
          label="ERROR RATE"
          value={reqLoading ? '...' : `${stats.errorRate}%`}
          icon={<WarningCircleIcon size={20} color={Number(stats.errorRate) > 5 ? tokens.colorError500 : tokens.colorSuccess500} />}
          description={`${stats.errCount} client/server errors`}
        />
        <Stat
          variant="glass"
          label="VISITOR SESSIONS"
          value={visitsLoading ? '...' : stats.totalVisits}
          icon={<UsersIcon size={20} color={tokens.colorPrimary500} />}
          description="Unique tracked client visits"
        />
      </div>

      {/* CHARTS OVERVIEW GRID */}
      <div {...stylex.props(styles.chartsGrid)}>
        <ChartContainer
          title="Requests Over Time"
          description="Throughput breakdown by successful requests vs errors"
          variant="glass"
          legend={[
            { name: 'Success (2xx/3xx)', color: '#10b981' },
            { name: 'Errors (4xx/5xx)', color: '#ef4444' },
          ]}
        >
          <AreaChart
            data={timeSeriesData}
            indexKey="time"
            categories={['success', 'error']}
            colors={['#10b981', '#ef4444']}
            valueFormatter={(val) => `${val} reqs`}
            height={220}
          />
        </ChartContainer>

        <Card variant="glass">
          <CardHeader>
            <div {...stylex.props(styles.cardTitle)}>
              <CompassIcon size={18} color={tokens.colorPrimary500} />
              <span>Top Requested Endpoints</span>
            </div>
          </CardHeader>
          <CardBody>
            {topPaths.length === 0 ? (
              <div style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm, textAlign: 'center', padding: tokens.spacing4 }}>
                No endpoint data recorded yet.
              </div>
            ) : (
              <TopList
                data={topPaths}
                valueFormatter={(val) => `${val} hits`}
                multiColor
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* DETAILED LOG TABLES */}
      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as 'requests' | 'visits')}>
        <TabList aria-label="Analytics Tabs">
          <Tab id="requests">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListBulletsIcon size={16} />
              <span>HTTP Request Logs ({requests.length})</span>
            </span>
          </Tab>
          <Tab id="visits">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <GlobeIcon size={16} />
              <span>Visitor Sessions ({visits.length})</span>
            </span>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel id="requests">
            <Table aria-label="HTTP Request Logs" dense stickyHeader hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead align="numeric">Duration</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reqLoading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : requests.length === 0 ? (
                  <TableEmpty colSpan={6}>
                    <EmptyState
                      variant="default"
                      title="No HTTP requests recorded"
                      description="Traffic and API request logs will appear here in real-time."
                    />
                  </TableEmpty>
                ) : (
                  requests.map((r: any, idx: number) => {
                    const status = Number(r.status || r.statusCode || 200);
                    const isErr = status >= 400;
                    return (
                      <TableRow key={r.id || idx}>
                        <TableCell>
                          <Badge variant={isErr ? 'error' : 'success'} size="sm">
                            {String(status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" size="sm">
                            {r.method || 'GET'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{r.path || r.url || '/'}</span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: tokens.colorFgSubtle, fontFamily: 'var(--font-mono)' }}>
                            {r.ip || '127.0.0.1'}
                          </span>
                        </TableCell>
                        <TableCell align="numeric" tabular>
                          <span style={{ color: tokens.colorFgSubtle }}>
                            {r.duration ? `${r.duration}ms` : '<1ms'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: tokens.colorFgSubtle, fontSize: '0.8125rem' }}>
                            {r.created_at ? new Date(r.created_at).toLocaleTimeString() : '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TabPanel>

          <TabPanel id="visits">
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing4 }}>
              {topReferrers.length > 0 && (
                <Card variant="glass">
                  <CardHeader>
                    <div {...stylex.props(styles.cardTitle)}>
                      <GlobeIcon size={18} color={tokens.colorPrimary500} />
                      <span>Top Referrers & Traffic Sources</span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <TopList
                      data={topReferrers}
                      valueFormatter={(val) => `${val} visits`}
                      multiColor
                    />
                  </CardBody>
                </Card>
              )}

              <Table aria-label="Visitor Sessions" dense stickyHeader hoverable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>IP & Location</TableHead>
                    <TableHead>Landing Page</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>First Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitsLoading ? (
                    <TableSkeleton rows={5} columns={5} />
                  ) : visits.length === 0 ? (
                    <TableEmpty colSpan={5}>
                      <EmptyState
                        variant="default"
                        title="No visits recorded"
                        description="Visitor telemetry and session tracking will show up here."
                      />
                    </TableEmpty>
                  ) : (
                    visits.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <span style={{ fontFamily: 'var(--font-mono)', color: tokens.colorPrimary400 }}>
                            {v.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          {v.ip} {v.country ? `(${v.country})` : ''}
                        </TableCell>
                        <TableCell>{v.landing_page || '/'}</TableCell>
                        <TableCell>
                          <span style={{ color: tokens.colorFgSubtle }}>{v.referrer || 'Direct'}</span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: tokens.colorFgSubtle, fontSize: '0.8125rem' }}>
                            {v.created_at ? new Date(v.created_at).toLocaleString() : '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
