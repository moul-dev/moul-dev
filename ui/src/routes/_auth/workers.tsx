import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  QueueIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowsCounterClockwiseIcon,
  ProhibitIcon,
  EyeIcon,
  ArrowsClockwiseIcon,
  CopyIcon,
  CheckIcon,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
  TableEmpty,
  EmptyState,
  Select,
  SelectItem,
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
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
    margin: 0,
  },
  subtitle: {
    color: tokens.colorFgSubtle,
    fontSize: tokens.fontSizeSm,
    fontFamily: tokens.fontFamilyBase,
    marginTop: tokens.spacing1,
    display: 'block',
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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing3,
    marginBottom: tokens.spacing3,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    flexWrap: 'wrap',
  },
  badgeContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing1,
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
  codeBlock: {
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    borderRadius: tokens.radiusMd,
    padding: tokens.spacing3,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.8125rem',
    color: tokens.colorFg,
    overflowX: 'auto',
    maxHeight: '320px',
    position: 'relative',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    paddingBottom: tokens.spacing3,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorBorderSubtle,
  },
  detailLabel: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: tokens.colorFgSubtle,
  },
  detailValue: {
    fontSize: tokens.fontSizeSm,
    color: tokens.colorFg,
  },
});

export const Route = createFileRoute('/_auth/workers')({
  component: WorkersPage,
});

type JobStateFilter = 'all' | 'available' | 'executing' | 'completed' | 'retryable' | 'discarded';

function getStatusBadgeVariant(state: string) {
  switch (state) {
    case 'completed':
      return 'success';
    case 'executing':
      return 'primary';
    case 'retryable':
      return 'warning';
    case 'discarded':
      return 'error';
    case 'available':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function WorkersPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStateFilter>('all');
  const [copied, setCopied] = useState(false);

  const { data: mouls } = useQuery({
    queryKey: ['mouls'],
    queryFn: api.listMouls,
  });

  const workerMouls = (mouls || []).filter((m: any) => m.type === 'worker');
  const defaultMoul = workerMouls.length > 0 ? workerMouls[0].name : 'background_tasks';
  const [selectedCollection, setSelectedCollection] = useState<string>(defaultMoul);

  // Sync selected collection if workerMouls loads after mount
  React.useEffect(() => {
    if (workerMouls.length > 0 && !workerMouls.some((m: any) => m.name === selectedCollection)) {
      setSelectedCollection(workerMouls[0].name);
    }
  }, [workerMouls, selectedCollection]);

  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['workerJobs', selectedCollection],
    queryFn: () =>
      api.listRecords(selectedCollection, {
        perPage: 100,
        sort: '-created_at',
      }),
    enabled: Boolean(selectedCollection),
    refetchInterval: 5000,
  });

  const rawJobs: any[] = Array.isArray(jobsData) ? jobsData : jobsData?.items || [];
  const jobs =
    statusFilter === 'all'
      ? rawJobs
      : rawJobs.filter((j: any) => String(j.state).toLowerCase() === statusFilter);

  // Mutations
  const retryMutation = useMutation({
    mutationFn: (job: any) =>
      api.updateRecord(selectedCollection, job.id, {
        state: 'available',
        scheduled_at: new Date().toISOString(),
      }),
    onSuccess: (_, job) => {
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
      toastQueue.add({
        title: 'Job Retried',
        description: `Job ${job.id} marked as available for immediate processing.`,
        variant: 'success',
      });
      if (selectedJob?.id === job.id) {
        setSelectedJob({ ...selectedJob, state: 'available' });
      }
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Retry Failed',
        description: err.message || 'Failed to retry job.',
        variant: 'error',
      });
    },
  });

  const discardMutation = useMutation({
    mutationFn: (job: any) =>
      api.updateRecord(selectedCollection, job.id, {
        state: 'discarded',
      }),
    onSuccess: (_, job) => {
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
      toastQueue.add({
        title: 'Job Discarded',
        description: `Job ${job.id} has been marked as discarded.`,
        variant: 'info',
      });
      if (selectedJob?.id === job.id) {
        setSelectedJob({ ...selectedJob, state: 'discarded' });
      }
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Discard Failed',
        description: err.message || 'Failed to discard job.',
        variant: 'error',
      });
    },
  });

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Background Worker Engine</h1>
          <span {...stylex.props(styles.subtitle)}>
            Inspect active asynchronous jobs, retry failed tasks, and monitor queues.
          </span>
        </div>
        <Badge variant="success">
          <span {...stylex.props(styles.badgeContent)}>
            <CheckCircleIcon size={14} weight="fill" />
            <span>Engine Running</span>
          </span>
        </Badge>
      </div>

      {/* JOBS MONITOR CARD */}
      <Card variant="glass">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div {...stylex.props(styles.cardTitle)}>
              <QueueIcon size={20} color={tokens.colorPrimary500} />
              <span>Jobs Queue Monitor ({jobs.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
              {workerMouls.length > 1 && (
                <div style={{ width: '200px' }}>
                  <Select
                    placeholder="Worker Collection"
                    selectedKey={selectedCollection}
                    onSelectionChange={(key) => setSelectedCollection(String(key))}
                  >
                    {workerMouls.map((m: any) => (
                      <SelectItem key={m.name} id={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}
              <Button size="sm" variant="secondary" onPress={() => refetchJobs()}>
                <ArrowsClockwiseIcon size={14} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Status Filters */}
          <div {...stylex.props(styles.toolbar)}>
            <div {...stylex.props(styles.filterGroup)}>
              {(['all', 'available', 'executing', 'completed', 'retryable', 'discarded'] as JobStateFilter[]).map(
                (filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={statusFilter === filter ? 'primary' : 'outline'}
                    onPress={() => setStatusFilter(filter)}
                  >
                    {filter === 'all'
                      ? `All (${rawJobs.length})`
                      : `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${rawJobs.filter((j: any) => String(j.state).toLowerCase() === filter).length})`}
                  </Button>
                )
              )}
            </div>
          </div>

          <Table aria-label="Worker Jobs Table" dense stickyHeader hoverable>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="numeric">Attempts</TableHead>
                <TableHead>Scheduled / Created</TableHead>
                <TableHead align="right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : jobs.length === 0 ? (
                <TableEmpty colSpan={7}>
                  <EmptyState
                    variant="default"
                    title="No jobs matching filter"
                    description={`No background tasks currently in "${statusFilter}" state for ${selectedCollection}.`}
                  />
                </TableEmpty>
              ) : (
                jobs.map((job: any) => {
                  const stateStr = String(job.state || 'available').toLowerCase();
                  const canRetry = stateStr === 'retryable' || stateStr === 'discarded' || stateStr === 'completed';
                  const canDiscard = stateStr === 'available' || stateStr === 'retryable' || stateStr === 'executing';
                  const attempt = job.attempt ?? 0;
                  const maxAttempts = job.max_attempts ?? 3;

                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <span style={{ fontFamily: 'var(--font-mono)', color: tokens.colorPrimary400, fontSize: '0.8125rem' }}>
                          {job.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontWeight: 600 }}>{job.worker || 'anonymous'}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: tokens.colorFgSubtle, fontFamily: 'var(--font-mono)' }}>
                          {job.queue || 'default'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(stateStr)} size="sm">
                          {stateStr}
                        </Badge>
                      </TableCell>
                      <TableCell align="numeric" tabular>
                        <span style={{ color: attempt >= maxAttempts ? tokens.colorError500 : tokens.colorFgSubtle }}>
                          {attempt}/{maxAttempts}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: tokens.colorFgSubtle, fontSize: '0.8125rem' }}>
                          {job.scheduled_at
                            ? new Date(job.scheduled_at).toLocaleTimeString()
                            : job.created_at
                              ? new Date(job.created_at).toLocaleTimeString()
                              : '-'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing1 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Inspect job ${job.id}`}
                            onPress={() => {
                              setSelectedJob(job);
                              setIsInspectorOpen(true);
                            }}
                          >
                            <EyeIcon size={15} />
                          </Button>
                          {canRetry && (
                            <Button
                              size="sm"
                              variant="secondary"
                              aria-label={`Retry job ${job.id}`}
                              isPending={retryMutation.isPending && retryMutation.variables?.id === job.id}
                              onPress={() => retryMutation.mutate(job)}
                            >
                              <ArrowsCounterClockwiseIcon size={14} />
                              <span>Retry</span>
                            </Button>
                          )}
                          {canDiscard && (
                            <Button
                              size="sm"
                              variant="danger-soft"
                              aria-label={`Discard job ${job.id}`}
                              isPending={discardMutation.isPending && discardMutation.variables?.id === job.id}
                              onPress={() => discardMutation.mutate(job)}
                            >
                              <ProhibitIcon size={14} />
                              <span>Discard</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* BUILT-IN WORKERS INFO */}
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

      {/* JOB PAYLOAD INSPECTOR DRAWER */}
      <DrawerOverlay isOpen={isInspectorOpen} onOpenChange={setIsInspectorOpen} isDismissable>
        <Drawer placement="right" size="md">
          <DrawerDialog>
            <DrawerHeader>
              <DrawerTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                  <span>Job Inspector</span>
                  {selectedJob && (
                    <Badge variant={getStatusBadgeVariant(String(selectedJob.state || '').toLowerCase())} size="sm">
                      {selectedJob.state}
                    </Badge>
                  )}
                </div>
              </DrawerTitle>
              <DrawerCloseButton />
            </DrawerHeader>
            <DrawerBody>
              {selectedJob && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing4 }}>
                  <div {...stylex.props(styles.detailRow)}>
                    <span {...stylex.props(styles.detailLabel)}>Job ID</span>
                    <span {...stylex.props(styles.detailValue)} style={{ fontFamily: 'var(--font-mono)' }}>
                      {selectedJob.id}
                    </span>
                  </div>

                  <div {...stylex.props(styles.detailRow)}>
                    <span {...stylex.props(styles.detailLabel)}>Worker Handler</span>
                    <span {...stylex.props(styles.detailValue)} style={{ fontWeight: 600 }}>
                      {selectedJob.worker}
                    </span>
                  </div>

                  <div {...stylex.props(styles.detailRow)}>
                    <span {...stylex.props(styles.detailLabel)}>Queue & Execution Attempts</span>
                    <span {...stylex.props(styles.detailValue)}>
                      Queue: <code>{selectedJob.queue || 'default'}</code> • Attempts:{' '}
                      <strong>
                        {selectedJob.attempt ?? 0} / {selectedJob.max_attempts ?? 3}
                      </strong>
                    </span>
                  </div>

                  {selectedJob.last_error && (
                    <div {...stylex.props(styles.detailRow)}>
                      <span {...stylex.props(styles.detailLabel)} style={{ color: tokens.colorError500 }}>
                        Last Error Trace
                      </span>
                      <pre
                        style={{
                          margin: 0,
                          padding: tokens.spacing2,
                          backgroundColor: tokens.colorBgSubtle,
                          color: tokens.colorError500,
                          fontSize: '0.8125rem',
                          borderRadius: tokens.radiusSm,
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {selectedJob.last_error}
                      </pre>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span {...stylex.props(styles.detailLabel)}>Job Payload JSON</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => handleCopyPayload(selectedJob.payload || selectedJob)}
                      >
                        {copied ? <CheckIcon size={14} color={tokens.colorSuccess500} /> : <CopyIcon size={14} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </Button>
                    </div>
                    <pre {...stylex.props(styles.codeBlock)}>
                      {JSON.stringify(
                        selectedJob.payload
                          ? typeof selectedJob.payload === 'string'
                            ? JSON.parse(selectedJob.payload)
                            : selectedJob.payload
                          : selectedJob,
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  <div {...stylex.props(styles.detailRow)}>
                    <span {...stylex.props(styles.detailLabel)}>Timestamps</span>
                    <span {...stylex.props(styles.detailValue)} style={{ fontSize: '0.8125rem', color: tokens.colorFgSubtle }}>
                      Created: {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleString() : 'N/A'}
                      <br />
                      Updated: {selectedJob.updated_at ? new Date(selectedJob.updated_at).toLocaleString() : 'N/A'}
                      <br />
                      Scheduled: {selectedJob.scheduled_at ? new Date(selectedJob.scheduled_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </DrawerBody>
            <DrawerFooter>
              <Button variant="outline" onPress={() => setIsInspectorOpen(false)}>
                Close
              </Button>
              {selectedJob && (
                <>
                  <Button
                    variant="danger-soft"
                    isDisabled={selectedJob.state === 'discarded'}
                    onPress={() => discardMutation.mutate(selectedJob)}
                  >
                    <ProhibitIcon size={14} />
                    <span>Discard Job</span>
                  </Button>
                  <Button
                    variant="primary"
                    onPress={() => retryMutation.mutate(selectedJob)}
                  >
                    <ArrowsCounterClockwiseIcon size={14} />
                    <span>Retry Job</span>
                  </Button>
                </>
              )}
            </DrawerFooter>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>
    </div>
  );
}
