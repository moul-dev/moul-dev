import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Queue, Clock, CheckCircle } from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '@moul-dev/ui';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
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
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    letterSpacing: '-0.025em',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workerItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderMuted,
  },
  workerName: {
    fontWeight: 600,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: '0.875rem',
  },
  badgeContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
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
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Inspect worker queues, registered job handlers, and scheduled tasks.
          </span>
        </div>
        <Badge variant="success">
          <span {...stylex.props(styles.badgeContent)}>
            <CheckCircle size={14} weight="fill" />
            <span>Engine Running</span>
          </span>
        </Badge>
      </div>

      <Card variant="default">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <Queue size={20} color="#0ea5e9" />
            <span>Worker Collections</span>
          </div>
        </CardHeader>
        <CardBody>
          {workerMouls.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
              No worker collections created. Create a collection with type "worker" (e.g. <code>background_tasks</code>) to enqueue asynchronous jobs.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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

      <Card variant="default">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <Clock size={20} color="#f59e0b" />
            <span>Built-in Registered Workers</span>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div {...stylex.props(styles.workerItem)}>
              <div>
                <span {...stylex.props(styles.workerName)}>SendEmail</span>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  Asynchronous transactional email dispatcher
                </div>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
            <div {...stylex.props(styles.workerItem)}>
              <div>
                <span {...stylex.props(styles.workerName)}>DeliverWebhook</span>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
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

