import React, { useState, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Button,
  Badge,
} from '@moul-dev/ui';
import {
  Terminal,
  ShieldCheck,
  Globe,
  Lightning,
  Trash,
  Play,
  Broadcast,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react';
import {
  moulDevtoolsClient,
  emitAppAction,
  emitSystemPing,
  AuthStatePayload,
  ApiRequestPayload,
  AppActionPayload,
  SystemPingPayload,
} from './events';
import { colors, spacing, radii, fonts } from '../theme/tokens.stylex';

type EventItem =
  | { type: 'auth:state-change'; data: AuthStatePayload; timestamp: number; id: string }
  | { type: 'api:request'; data: ApiRequestPayload; timestamp: number; id: string }
  | { type: 'app:action'; data: AppActionPayload; timestamp: number; id: string }
  | { type: 'system:ping'; data: SystemPingPayload; timestamp: number; id: string };

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '380px',
    backgroundColor: '#0c0e14',
    color: '#e2e8f0',
    fontFamily: fonts.sans,
    fontSize: '13px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: '#131722',
    borderBottom: '1px solid #1e293b',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    padding: `${spacing.xs} ${spacing.md}`,
    backgroundColor: '#0f131c',
    borderBottom: '1px solid #1e293b',
    fontSize: '12px',
    color: '#94a3b8',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statValue: {
    fontWeight: 600,
    color: '#38bdf8',
    fontFamily: fonts.mono,
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    flex: 1,
    overflow: 'hidden',
  },
  eventListContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #1e293b',
    overflow: 'hidden',
    backgroundColor: '#0c0e14',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: spacing.xs,
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#10141f',
  },
  filterButton: {
    padding: '3px 8px',
    fontSize: '11px',
    borderRadius: radii.sm,
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    color: '#94a3b8',
    transition: 'all 0.15s ease',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    padding: spacing.xl,
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
  },
  eventRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderBottom: '1px solid #182030',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
  },
  eventRowSelected: {
    backgroundColor: '#1e293b',
    borderLeft: '3px solid #38bdf8',
  },
  eventHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  eventTitle: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  eventTimestamp: {
    fontSize: '11px',
    color: '#64748b',
    fontFamily: fonts.mono,
  },
  eventDetail: {
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: fonts.mono,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  detailPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.md,
    overflowY: 'auto',
    backgroundColor: '#0a0d14',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottom: '1px solid #1e293b',
  },
  detailTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jsonViewer: {
    fontFamily: fonts.mono,
    fontSize: '12px',
    lineHeight: '1.5',
    backgroundColor: '#07090e',
    border: '1px solid #1e293b',
    borderRadius: radii.md,
    padding: spacing.md,
    color: '#38bdf8',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
});

export function MoulDevtoolsPanel() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'auth' | 'api' | 'action' | 'system'>('all');

  useEffect(() => {
    // Listen to all events from the event bus
    const unsubAll = moulDevtoolsClient.onAllPluginEvents((evt) => {
      const newEvent: EventItem = {
        type: evt.type.replace('mould-inspector:', '') as any,
        data: evt.payload as any,
        timestamp: (evt.payload as any)?.timestamp || Date.now(),
        id: (evt.payload as any)?.id || Math.random().toString(36).substring(2, 9),
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
      setSelectedId((prev) => prev ?? newEvent.id);
    });

    return () => {
      unsubAll();
    };
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'auth') return e.type === 'auth:state-change';
    if (filter === 'api') return e.type === 'api:request';
    if (filter === 'action') return e.type === 'app:action';
    if (filter === 'system') return e.type === 'system:ping';
    return true;
  });

  const selectedEvent = events.find((e) => e.id === selectedId) || filteredEvents[0] || null;

  // Compute summary stats
  const totalEvents = events.length;
  const apiEvents = events.filter((e) => e.type === 'api:request');
  const avgLatency = apiEvents.length
    ? Math.round(
        apiEvents.reduce((acc, curr) => acc + (curr.data as ApiRequestPayload).durationMs, 0) /
          apiEvents.length
      )
    : 0;
  const latestAuth = events.find((e) => e.type === 'auth:state-change')?.data as
    | AuthStatePayload
    | undefined;

  const handleEmitTestAction = () => {
    emitAppAction({
      action: 'devtools:test-trigger',
      category: 'custom',
      details: {
        message: 'Simulated runtime action from DevTools UI',
        activeFilter: filter,
        recordedCount: totalEvents,
      },
    });
  };

  const handleEmitPing = () => {
    emitSystemPing(`Ping at ${new Date().toLocaleTimeString()}`);
  };

  const handleClear = () => {
    setEvents([]);
    setSelectedId(null);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'auth:state-change':
        return <ShieldCheck size={14} color="#10b981" weight="bold" />;
      case 'api:request':
        return <Globe size={14} color="#38bdf8" weight="bold" />;
      case 'app:action':
        return <Lightning size={14} color="#f59e0b" weight="bold" />;
      case 'system:ping':
        return <Broadcast size={14} color="#a855f7" weight="bold" />;
      default:
        return <Terminal size={14} color="#94a3b8" weight="bold" />;
    }
  };

  const renderSummaryText = (item: EventItem): string => {
    switch (item.type) {
      case 'auth:state-change':
        return item.data.isAuthenticated
          ? `Authenticated (${item.data.user?.username || 'admin'})`
          : 'Guest / Logged Out';
      case 'api:request':
        return `${item.data.method} ${item.data.url} (${item.data.status}) - ${item.data.durationMs}ms`;
      case 'app:action':
        return `${item.data.action} [${item.data.category}]`;
      case 'system:ping':
        return item.data.message;
      default:
        return 'Unknown Event';
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      {/* Top Header */}
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerLeft)}>
          <div {...stylex.props(styles.title)}>
            <Terminal size={16} color="#38bdf8" weight="bold" />
            <span>Mould Inspector</span>
          </div>
          <Badge variant="success">
            Live Event Bus Active
          </Badge>
        </div>

        <div {...stylex.props(styles.headerActions)}>
          <Button
            variant="secondary"
            size="sm"
            onPress={handleEmitTestAction}
            aria-label="Emit test action"
          >
            <Play size={12} weight="bold" />
            <span>Emit Action</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onPress={handleEmitPing}
            aria-label="Send ping event"
          >
            <Broadcast size={12} weight="bold" />
            <span>Ping</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onPress={handleClear}
            aria-label="Clear event log"
          >
            <Trash size={12} weight="bold" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Metrics & Status Strip */}
      <div {...stylex.props(styles.statsBar)}>
        <div {...stylex.props(styles.statItem)}>
          <span>Events:</span>
          <span {...stylex.props(styles.statValue)}>{totalEvents}</span>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <span>API Calls:</span>
          <span {...stylex.props(styles.statValue)}>{apiEvents.length}</span>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <span>Avg Latency:</span>
          <span {...stylex.props(styles.statValue)}>{avgLatency}ms</span>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <span>Auth:</span>
          <span {...stylex.props(styles.statValue)}>
            {latestAuth ? (latestAuth.isAuthenticated ? 'Logged In' : 'Logged Out') : 'Active'}
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div {...stylex.props(styles.mainContent)}>
        {/* Left Column: Event Stream & Filter */}
        <div {...stylex.props(styles.eventListContainer)}>
          <div {...stylex.props(styles.filterBar)}>
            {(['all', 'auth', 'api', 'action', 'system'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                {...stylex.props(
                  styles.filterButton,
                  filter === tab && styles.filterButtonActive
                )}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div {...stylex.props(styles.list)}>
            {filteredEvents.length === 0 ? (
              <div {...stylex.props(styles.emptyState)}>
                No {filter !== 'all' ? filter : ''} events recorded yet.
                <br />
                Interact with the console or press &quot;Emit Action&quot; above.
              </div>
            ) : (
              filteredEvents.map((item) => {
                const isSelected = selectedEvent?.id === item.id;
                const timeStr = new Date(item.timestamp).toLocaleTimeString();

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    {...stylex.props(
                      styles.eventRow,
                      isSelected && styles.eventRowSelected
                    )}
                  >
                    <div {...stylex.props(styles.eventHeaderRow)}>
                      <div {...stylex.props(styles.eventTitle)}>
                        {renderIcon(item.type)}
                        <span>{item.type}</span>
                      </div>
                      <span {...stylex.props(styles.eventTimestamp)}>{timeStr}</span>
                    </div>
                    <div {...stylex.props(styles.eventDetail)}>
                      {renderSummaryText(item)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Inspector */}
        <div {...stylex.props(styles.detailPanel)}>
          {selectedEvent ? (
            <>
              <div {...stylex.props(styles.detailHeader)}>
                <div {...stylex.props(styles.detailTitle)}>
                  {renderIcon(selectedEvent.type)}
                  <span>{selectedEvent.type}</span>
                  <Badge variant="primary">
                    {new Date(selectedEvent.timestamp).toISOString()}
                  </Badge>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                  Event Payload (JSON):
                </span>
              </div>

              <pre {...stylex.props(styles.jsonViewer)}>
                {JSON.stringify(selectedEvent.data, null, 2)}
              </pre>
            </>
          ) : (
            <div {...stylex.props(styles.emptyState)}>
              Select an event from the left list to inspect runtime payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
