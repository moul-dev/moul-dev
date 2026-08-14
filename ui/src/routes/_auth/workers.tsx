import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Queue, Clock, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { api } from '../../api/client';
import { Badge } from '../../components/common/Badge';

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
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
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
        <Badge variant="success" icon={<CheckCircle size={14} weight="fill" />}>
          Engine Running
        </Badge>
      </div>

      <div {...stylex.props(styles.card)}>
        <h2 {...stylex.props(styles.cardTitle)}>
          <Queue size={20} color="#0ea5e9" />
          <span>Worker Collections</span>
        </h2>
        {workerMouls.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
            No worker collections created. Create a collection with type "worker" (e.g. <code>background_tasks</code>) to enqueue asynchronous jobs.
          </div>
        ) : (
          workerMouls.map((m: any) => (
            <div key={m.name} {...stylex.props(styles.workerItem)}>
              <span {...stylex.props(styles.workerName)}>{m.name}</span>
              <Badge variant="warning">Async Queue</Badge>
            </div>
          ))
        )}
      </div>

      <div {...stylex.props(styles.card)}>
        <h2 {...stylex.props(styles.cardTitle)}>
          <Clock size={20} color="#f59e0b" />
          <span>Built-in Registered Workers</span>
        </h2>
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
      </div>
    </div>
  );
}
