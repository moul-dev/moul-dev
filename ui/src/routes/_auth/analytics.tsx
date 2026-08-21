import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Globe, ListBullets, ArrowsClockwise } from '@phosphor-icons/react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
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
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacing6,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
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
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Inspect client visits, Geo-IP locations, and HTTP telemetry logs.
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => (activeTab === 'requests' ? refetchReq() : refetchVisits())}
        >
          <ArrowsClockwise size={14} />
          <span>Refresh</span>
        </Button>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as 'requests' | 'visits')}>
        <TabList aria-label="Analytics Tabs">
          <Tab id="requests">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListBullets size={16} />
              <span>HTTP Request Logs ({requests.length})</span>
            </span>
          </Tab>
          <Tab id="visits">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} />
              <span>Visitor Sessions ({visits.length})</span>
            </span>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel id="requests">
            {reqLoading ? (
              <div {...stylex.props(styles.emptyState)}>Loading request logs...</div>
            ) : requests.length === 0 ? (
              <div {...stylex.props(styles.emptyState)}>No HTTP requests recorded yet.</div>
            ) : (
              <Table aria-label="HTTP Request Logs">
                <TableHeader>
                  <Column isRowHeader>Status</Column>
                  <Column>Method</Column>
                  <Column>Path</Column>
                  <Column>IP Address</Column>
                  <Column>Duration</Column>
                  <Column>Timestamp</Column>
                </TableHeader>
                <TableBody>
                  {requests.map((r: any, idx: number) => {
                    const status = r.status || r.statusCode || 200;
                    const isErr = status >= 400;
                    return (
                      <Row key={r.id || idx} id={String(r.id || idx)}>
                        <Cell>
                          <Badge variant={isErr ? 'error' : 'success'}>{String(status)}</Badge>
                        </Cell>
                        <Cell>
                          <Badge variant="neutral">{r.method || 'GET'}</Badge>
                        </Cell>
                        <Cell>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{r.path || r.url || '/'}</span>
                        </Cell>
                        <Cell>
                          <span style={{ color: '#94a3b8' }}>{r.ip || '127.0.0.1'}</span>
                        </Cell>
                        <Cell>
                          <span style={{ color: '#94a3b8' }}>{r.duration ? `${r.duration}ms` : '<1ms'}</span>
                        </Cell>
                        <Cell>
                          <span style={{ color: '#64748b' }}>
                            {r.created_at ? new Date(r.created_at).toLocaleTimeString() : '-'}
                          </span>
                        </Cell>
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabPanel>

          <TabPanel id="visits">
            {visitsLoading ? (
              <div {...stylex.props(styles.emptyState)}>Loading visit sessions...</div>
            ) : visits.length === 0 ? (
              <div {...stylex.props(styles.emptyState)}>No visits recorded yet.</div>
            ) : (
              <Table aria-label="Visitor Sessions">
                <TableHeader>
                  <Column isRowHeader>Session ID</Column>
                  <Column>IP & Location</Column>
                  <Column>Landing Page</Column>
                  <Column>Referrer</Column>
                  <Column>First Seen</Column>
                </TableHeader>
                <TableBody>
                  {visits.map((v: any) => (
                    <Row key={v.id} id={v.id}>
                      <Cell>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{v.id}</span>
                      </Cell>
                      <Cell>
                        {v.ip} {v.country ? `(${v.country})` : ''}
                      </Cell>
                      <Cell>{v.landing_page || '/'}</Cell>
                      <Cell>
                        <span style={{ color: '#94a3b8' }}>{v.referrer || 'Direct'}</span>
                      </Cell>
                      <Cell>
                        <span style={{ color: '#64748b' }}>
                          {v.created_at ? new Date(v.created_at).toLocaleString() : '-'}
                        </span>
                      </Cell>
                    </Row>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

