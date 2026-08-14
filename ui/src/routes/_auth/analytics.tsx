import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { ChartLineUp, Globe, ListBullets, ArrowsClockwise } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { api } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

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
    letterSpacing: '-0.025em',
  },
  tabs: {
    display: 'flex',
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  tab: {
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.textSecondary,
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: radii.md,
    cursor: 'pointer',
    fontFamily: fonts.sans,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    transition: 'all 0.15s ease',
  },
  tabActive: {
    backgroundColor: colors.bgSurface,
    color: colors.primary,
    fontWeight: 600,
  },
  tableCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    fontFamily: fonts.sans,
  },
  th: {
    paddingBlock: spacing.md,
    paddingInline: spacing.md,
    backgroundColor: colors.bgCard,
    color: colors.textSecondary,
    fontWeight: 600,
    textAlign: 'left',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  td: {
    paddingBlock: spacing.md,
    paddingInline: spacing.md,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderMuted,
    color: colors.textPrimary,
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
          icon={<ArrowsClockwise size={14} />}
          onClick={() => (activeTab === 'requests' ? refetchReq() : refetchVisits())}
        >
          Refresh
        </Button>
      </div>

      <div {...stylex.props(styles.tabs)}>
        <button
          type="button"
          {...stylex.props(styles.tab, activeTab === 'requests' && styles.tabActive)}
          onClick={() => setActiveTab('requests')}
        >
          <ListBullets size={16} />
          HTTP Request Logs ({requests.length})
        </button>
        <button
          type="button"
          {...stylex.props(styles.tab, activeTab === 'visits' && styles.tabActive)}
          onClick={() => setActiveTab('visits')}
        >
          <Globe size={16} />
          Visitor Sessions ({visits.length})
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div {...stylex.props(styles.tableCard)}>
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Status</th>
                <th {...stylex.props(styles.th)}>Method</th>
                <th {...stylex.props(styles.th)}>Path</th>
                <th {...stylex.props(styles.th)}>IP Address</th>
                <th {...stylex.props(styles.th)}>Duration</th>
                <th {...stylex.props(styles.th)}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {reqLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Loading request logs...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No HTTP requests recorded yet.
                  </td>
                </tr>
              ) : (
                requests.map((r: any, idx: number) => {
                  const status = r.status || r.statusCode || 200;
                  const isErr = status >= 400;
                  return (
                    <tr key={r.id || idx}>
                      <td {...stylex.props(styles.td)}>
                        <Badge variant={isErr ? 'danger' : 'success'}>{String(status)}</Badge>
                      </td>
                      <td {...stylex.props(styles.td)}>
                        <Badge variant="neutral">{r.method || 'GET'}</Badge>
                      </td>
                      <td {...stylex.props(styles.td)} style={{ fontFamily: 'var(--font-mono)' }}>
                        {r.path || r.url || '/'}
                      </td>
                      <td {...stylex.props(styles.td)} style={{ color: '#94a3b8' }}>
                        {r.ip || '127.0.0.1'}
                      </td>
                      <td {...stylex.props(styles.td)} style={{ color: '#94a3b8' }}>
                        {r.duration ? `${r.duration}ms` : '<1ms'}
                      </td>
                      <td {...stylex.props(styles.td)} style={{ color: '#64748b' }}>
                        {r.created_at ? new Date(r.created_at).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div {...stylex.props(styles.tableCard)}>
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Session ID</th>
                <th {...stylex.props(styles.th)}>IP & Location</th>
                <th {...stylex.props(styles.th)}>Landing Page</th>
                <th {...stylex.props(styles.th)}>Referrer</th>
                <th {...stylex.props(styles.th)}>First Seen</th>
              </tr>
            </thead>
            <tbody>
              {visitsLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Loading visit sessions...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No visits recorded yet.
                  </td>
                </tr>
              ) : (
                visits.map((v: any) => (
                  <tr key={v.id}>
                    <td {...stylex.props(styles.td)} style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                      {v.id}
                    </td>
                    <td {...stylex.props(styles.td)}>
                      {v.ip} {v.country ? `(${v.country})` : ''}
                    </td>
                    <td {...stylex.props(styles.td)}>{v.landing_page || '/'}</td>
                    <td {...stylex.props(styles.td)} style={{ color: '#94a3b8' }}>
                      {v.referrer || 'Direct'}
                    </td>
                    <td {...stylex.props(styles.td)} style={{ color: '#64748b' }}>
                      {v.created_at ? new Date(v.created_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
