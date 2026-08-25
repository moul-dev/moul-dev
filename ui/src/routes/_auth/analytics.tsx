import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { GlobeIcon, ListBulletsIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';
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
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

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
    letterSpacing: '-0.025em',
  },
});

export const Route = createFileRoute('/_auth/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'visits'>('requests');

  const { data: requestsData, isLoading: reqLoading, refetch: refetchReq } = useQuery({
    queryKey: ['requests'],
    queryFn: () => api.listRequests({ perPage: 50 }),
    refetchInterval: 10000,
  });

  const { data: visitsData, isLoading: visitsLoading, refetch: refetchVisits } = useQuery({
    queryKey: ['visits'],
    queryFn: () => api.listVisits({ perPage: 50 }),
    refetchInterval: 10000,
  });

  const requests = Array.isArray(requestsData) ? requestsData : requestsData?.items || [];
  const visits = Array.isArray(visitsData) ? visitsData : visitsData?.items || [];

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Analytics & Request Logs</h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Inspect client visits, Geo-IP locations, and HTTP telemetry logs.
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => (activeTab === 'requests' ? refetchReq() : refetchVisits())}
        >
          <ArrowsClockwiseIcon size={14} />
          <span>Refresh</span>
        </Button>
      </div>

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
                    const status = r.status || r.statusCode || 200;
                    const isErr = status >= 400;
                    return (
                      <TableRow key={r.id || idx}>
                        <TableCell>
                          <Badge variant={isErr ? 'error' : 'success'}>{String(status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral">{r.method || 'GET'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{r.path || r.url || '/'}</span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: tokens.colorFgSubtle }}>{r.ip || '127.0.0.1'}</span>
                        </TableCell>
                        <TableCell align="numeric" tabular>
                          <span style={{ color: tokens.colorFgSubtle }}>{r.duration ? `${r.duration}ms` : '<1ms'}</span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: tokens.colorFgSubtle }}>
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
                        <span style={{ fontFamily: 'var(--font-mono)', color: tokens.colorPrimary400 }}>{v.id}</span>
                      </TableCell>
                      <TableCell>
                        {v.ip} {v.country ? `(${v.country})` : ''}
                      </TableCell>
                      <TableCell>{v.landing_page || '/'}</TableCell>
                      <TableCell>
                        <span style={{ color: tokens.colorFgSubtle }}>{v.referrer || 'Direct'}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: tokens.colorFgSubtle }}>
                          {v.created_at ? new Date(v.created_at).toLocaleString() : '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}


