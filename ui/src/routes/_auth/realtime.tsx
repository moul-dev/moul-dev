import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Broadcast, Play, Stop, Trash, CheckCircle } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { api, getAuthToken } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';

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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSurface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  logContainer: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: '480px',
    maxHeight: '680px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    fontFamily: fonts.mono,
  },
  logItem: {
    backgroundColor: colors.bgCard,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderMuted,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xxs,
    fontSize: '0.8125rem',
  },
  logTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logTime: {
    color: colors.textMuted,
    fontSize: '0.75rem',
  },
  logPayload: {
    color: colors.textPrimary,
    backgroundColor: colors.bgApp,
    padding: spacing.xs,
    borderRadius: radii.sm,
    overflowX: 'auto',
  },
});

interface SSEEvent {
  id: string;
  action: string;
  moul: string;
  record: any;
  timestamp: string;
}

export const Route = createFileRoute('/_auth/realtime')({
  component: RealtimePage,
});

function RealtimePage() {
  const [selectedMoul, setSelectedMoul] = useState<string>('*');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [events, setEvents] = useState<SSEEvent[]>([]);

  const { data: mouls } = useQuery({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  });

  useEffect(() => {
    if (!isConnected) return;

    const token = getAuthToken();
    const url =
      selectedMoul === '*'
        ? `/api/moul/subscribe${token ? `?token=${encodeURIComponent(token)}` : ''}`
        : `/api/moul/${selectedMoul}/subscribe${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        const item: SSEEvent = {
          id: `${Date.now()}-${Math.random()}`,
          action: payload.action || 'event',
          moul: payload.moul || selectedMoul,
          record: payload.record || payload,
          timestamp: new Date().toLocaleTimeString(),
        };
        setEvents((prev) => [item, ...prev].slice(0, 100));
      } catch {
        // raw message
      }
    };

    return () => {
      es.close();
    };
  }, [selectedMoul, isConnected]);

  const moulOptions = [
    { value: '*', label: 'All Collections (Global Stream)' },
    ...(mouls?.map((m: any) => ({ value: m.name, label: m.name })) || []),
  ];

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Realtime SSE Event Stream</h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Live record mutations streamed over Server-Sent Events (SSE).
          </span>
        </div>
        <Badge variant={isConnected ? 'success' : 'danger'}>
          {isConnected ? 'Stream Connected' : 'Disconnected'}
        </Badge>
      </div>

      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.controls)}>
          <div style={{ width: '280px' }}>
            <Select
              value={selectedMoul}
              onChange={(e) => setSelectedMoul(e.target.value)}
              options={moulOptions}
            />
          </div>
          <Button
            size="sm"
            variant={isConnected ? 'danger' : 'primary'}
            icon={isConnected ? <Stop size={14} /> : <Play size={14} />}
            onClick={() => setIsConnected(!isConnected)}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          icon={<Trash size={14} />}
          onClick={() => setEvents([])}
        >
          Clear Log
        </Button>
      </div>

      <div {...stylex.props(styles.logContainer)}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Listening for realtime record events... (Mutations in any collection will appear here)
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} {...stylex.props(styles.logItem)}>
              <div {...stylex.props(styles.logTop)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={ev.action === 'create' ? 'success' : ev.action === 'delete' ? 'danger' : 'primary'}>
                    {ev.action}
                  </Badge>
                  <span style={{ fontWeight: 600, color: '#38bdf8' }}>{ev.moul}</span>
                </div>
                <span {...stylex.props(styles.logTime)}>{ev.timestamp}</span>
              </div>
              <pre {...stylex.props(styles.logPayload)}>{JSON.stringify(ev.record, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
