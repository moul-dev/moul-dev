import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Play, Stop, Trash } from '@phosphor-icons/react';
import {
  Select,
  SelectItem,
  Badge,
  Button,
  Card,
  CardBody,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api, getAuthToken } from '../../api/client';

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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
  },
  logContainer: {
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    borderRadius: tokens.radiusLg,
    padding: tokens.spacing3,
    minHeight: '480px',
    maxHeight: '680px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    fontFamily: 'var(--font-mono, monospace)',
  },
  logItem: {
    backgroundColor: tokens.colorBgElevated,
    padding: tokens.spacing2,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    fontSize: '0.8125rem',
  },
  logTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logTime: {
    color: tokens.colorFgSubtle,
    fontSize: '0.75rem',
  },
  logPayload: {
    color: tokens.colorFg,
    backgroundColor: tokens.colorBgSubtle,
    padding: tokens.spacing1,
    borderRadius: tokens.radiusSm,
    overflowX: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacing8,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
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

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Realtime SSE Event Stream</h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Live record mutations streamed over Server-Sent Events (SSE).
          </span>
        </div>
        <Badge variant={isConnected ? 'success' : 'error'}>
          {isConnected ? 'Stream Connected' : 'Disconnected'}
        </Badge>
      </div>

      <Card variant="glass">
        <CardBody>
          <div {...stylex.props(styles.toolbar)}>
            <div {...stylex.props(styles.controls)}>
              <div style={{ width: '280px' }}>
                <Select
                  placeholder="Select Collection"
                  selectedKey={selectedMoul}
                  onSelectionChange={(key) => setSelectedMoul(String(key))}
                >
                  <SelectItem id="*">All Collections (Global Stream)</SelectItem>
                  {mouls?.map((m: any) => (
                    <SelectItem key={m.name} id={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                size="sm"
                variant={isConnected ? 'danger' : 'primary'}
                onPress={() => setIsConnected(!isConnected)}
              >
                {isConnected ? <Stop size={14} /> : <Play size={14} />}
                <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onPress={() => setEvents([])}
              aria-label="Clear Log"
            >
              <Trash size={14} />
              <span>Clear Log</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      <div {...stylex.props(styles.logContainer)}>
        {events.length === 0 ? (
          <div {...stylex.props(styles.emptyState)}>
            Listening for realtime record events... (Mutations in any collection will appear here)
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} {...stylex.props(styles.logItem)}>
              <div {...stylex.props(styles.logTop)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={ev.action === 'create' ? 'success' : ev.action === 'delete' ? 'error' : 'primary'}>
                    {ev.action}
                  </Badge>
                  <span style={{ fontWeight: 600, color: tokens.colorPrimary400 }}>{ev.moul}</span>
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

