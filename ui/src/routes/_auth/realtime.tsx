import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { PlayIcon, StopIcon, TrashIcon, BroadcastIcon } from '@phosphor-icons/react';
import {
  Select,
  SelectItem,
  Badge,
  Button,
  Card,
  CardBody,
  Logs,
  type LogItem,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api, getAuthToken } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    maxWidth: 'var(--content-max-width, 1200px)',
    width: '100%',
    marginInlineStart: 0,
    marginInlineEnd: 'auto',
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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing3,
    width: '100%',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
    flexWrap: 'wrap',
  },
  badgeContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
});

export const Route = createFileRoute('/_auth/realtime')({
  component: RealtimePage,
});

function getLogLevelForAction(action: string): 'info' | 'warn' | 'debug' {
  switch (action) {
    case 'delete':
      return 'warn';
    case 'create':
      return 'info';
    default:
      return 'debug';
  }
}

function RealtimePage() {
  const [selectedMoul, setSelectedMoul] = useState<string>('*');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [events, setEvents] = useState<LogItem[]>([]);

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
        const action = payload.action || 'mutation';
        const moul = payload.moul || selectedMoul;
        const record = payload.record || payload;
        const recordId = record?.id ? String(record.id) : '';

        const item: LogItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toLocaleTimeString(),
          level: getLogLevelForAction(action),
          message: `[${moul}] ${action.toUpperCase()} record: ${recordId || 'new'}`,
          attributes: {
            collection: moul,
            action,
            recordId: recordId || undefined,
          },
          raw: JSON.stringify(record, null, 2),
        };

        setEvents((prev) => [item, ...prev].slice(0, 200));
      } catch {
        const rawItem: LogItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: String(e.data),
          raw: String(e.data),
        };
        setEvents((prev) => [rawItem, ...prev].slice(0, 200));
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
          <h1 {...stylex.props(styles.title)}>Realtime Hub</h1>
          <span {...stylex.props(styles.subtitle)}>
            Live record events and mutation stream.
          </span>
        </div>
        <Badge variant={isConnected ? 'success' : 'error'}>
          <span {...stylex.props(styles.badgeContent)}>
            <BroadcastIcon size={14} weight="bold" />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </span>
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
                  <SelectItem id="*">All collections</SelectItem>
                  {mouls?.map((m: any) => (
                    <SelectItem key={m.name} id={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                variant={isConnected ? 'danger' : 'primary'}
                onPress={() => setIsConnected(!isConnected)}
              >
                {isConnected ? <StopIcon size={14} /> : <PlayIcon size={14} />}
                <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              onPress={() => setEvents([])}
              aria-label="Clear Stream Logs"
            >
              <TrashIcon size={14} />
              <span>Clear ({events.length})</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Logs Component Stream Viewer */}
      <Logs
        data={events}
        title="Event Stream"
        showToolbar={true}
        showLineNumbers={true}
        showTimestamps={true}
        showLevels={true}
        showAttributes={true}
        inspectorMode="drawer"
        drawerPlacement="right"
        drawerSize="md"
        follow={true}
        onClear={() => setEvents([])}
        maxHeight="640px"
        searchPlaceholder="Filter events or record ID..."
      />
    </div>
  );
}
