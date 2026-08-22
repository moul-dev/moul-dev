import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { QueueIcon, ClockIcon, CheckCircleIcon } from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
    maxWidth: '1000px',
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
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  workerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  workerItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  workerName: {
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.875rem',
  },
  badgeContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
});

export const Route = createFileRoute('/_auth/workers')({
  component: WorkersPage,
});

function WorkersPage() {
  const { data: mouls } = useQuery({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  });

  const workerMouls = (mouls || []).filter((m: any) => m.type === 'worker');

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Background Worker Engine</h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Inspect worker queues, registered job handlers, and scheduled tasks.
          </span>
        </div>
        <Badge variant="success">
          <span {...stylex.props(styles.badgeContent)}>
            <CheckCircleIcon size={14} weight="fill" />
            <span>Engine Running</span>
          </span>
        </Badge>
      </div>

      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <QueueIcon size={20} color={tokens.colorPrimary500} />
            <span>Worker Collections</span>
          </div>
        </CardHeader>
        <CardBody>
          {workerMouls.length === 0 ? (
            <div style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm, padding: tokens.spacing4, textAlign: 'center' }}>
              No worker collections created. Create a collection with type "worker" (e.g. <code>background_tasks</code>) to enqueue asynchronous jobs.
            </div>
          ) : (
            <div {...stylex.props(styles.workerList)}>
              {workerMouls.map((m: any) => (
                <div key={m.name} {...stylex.props(styles.workerItem)}>
                  <span {...stylex.props(styles.workerName)}>{m.name}</span>
                  <Badge variant="warning">Async Queue</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <ClockIcon size={20} color={tokens.colorWarning500} />
            <span>Built-in Registered Workers</span>
          </div>
        </CardHeader>
        <CardBody>
          <div {...stylex.props(styles.workerList)}>
            <div {...stylex.props(styles.workerItem)}>
              <div>
                <span {...stylex.props(styles.workerName)}>SendEmail</span>
                <div style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, marginTop: '2px' }}>
                  Asynchronous transactional email dispatcher
                </div>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
            <div {...stylex.props(styles.workerItem)}>
              <div>
                <span {...stylex.props(styles.workerName)}>DeliverWebhook</span>
                <div style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, marginTop: '2px' }}>
                  HTTP webhook payload delivery with exponential backoff
                </div>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

