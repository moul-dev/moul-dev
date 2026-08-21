import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { EnvelopeSimple, ShieldCheck, HardDrives, FloppyDisk } from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  TextField,
  Button,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
    maxWidth: '900px',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacing3,
  },
});

export const Route = createFileRoute('/_auth/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  });

  const [smtp, setSmtp] = useState<any>({
    host: '',
    port: 587,
    username: '',
    password: '',
    fromAddress: '',
  });

  const [tlsConfig, setTlsConfig] = useState<any>({
    domains: '',
    email: '',
  });

  useEffect(() => {
    if (settingsData) {
      if (settingsData.smtp) setSmtp(settingsData.smtp);
      if (settingsData.tls) setTlsConfig(settingsData.tls);
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toastQueue.add({
        title: 'Settings Saved',
        description: 'Engine settings updated successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Save Failed',
        description: err.message || 'Failed to save engine settings.',
        variant: 'error',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      smtp,
      tls: tlsConfig,
    });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Engine Settings</h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Configure transactional email (SMTP), automatic HTTPS certificates (CertMagic), and backups.
          </span>
        </div>
        <Button
          variant="primary"
          onPress={handleSave}
          isDisabled={updateMutation.isPending}
        >
          <FloppyDisk size={16} />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* SMTP Email Settings */}
      <Card variant="default">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <EnvelopeSimple size={20} color="#0ea5e9" />
            <span>SMTP Transactional Mailer</span>
          </div>
        </CardHeader>
        <CardBody>
          <div {...stylex.props(styles.formGrid)}>
            <TextField
              label="SMTP Host"
              placeholder="smtp.example.com"
              value={smtp.host || ''}
              onChange={(val) => setSmtp({ ...smtp, host: val })}
            />
            <TextField
              label="SMTP Port"
              type="number"
              placeholder="587"
              value={String(smtp.port || '')}
              onChange={(val) => setSmtp({ ...smtp, port: Number(val) })}
            />
            <TextField
              label="SMTP Username"
              placeholder="user@example.com"
              value={smtp.username || ''}
              onChange={(val) => setSmtp({ ...smtp, username: val })}
            />
            <TextField
              label="SMTP Password"
              type="password"
              placeholder="••••••••"
              value={smtp.password || ''}
              onChange={(val) => setSmtp({ ...smtp, password: val })}
            />
            <TextField
              label="Sender Address (From)"
              placeholder="no-reply@moul.dev"
              value={smtp.fromAddress || ''}
              onChange={(val) => setSmtp({ ...smtp, fromAddress: val })}
            />
          </div>
        </CardBody>
      </Card>

      {/* TLS & HTTPS Settings */}
      <Card variant="default">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <ShieldCheck size={20} color="#10b981" />
            <span>Automatic TLS / Let's Encrypt (CertMagic)</span>
          </div>
        </CardHeader>
        <CardBody>
          <div {...stylex.props(styles.formGrid)}>
            <TextField
              label="Domains (comma-separated)"
              placeholder="api.example.com, app.example.com"
              value={tlsConfig.domains || ''}
              onChange={(val) => setTlsConfig({ ...tlsConfig, domains: val })}
              description="mould will automatically obtain & renew SSL certificates"
            />
            <TextField
              label="ACME Account Email"
              type="email"
              placeholder="admin@example.com"
              value={tlsConfig.email || ''}
              onChange={(val) => setTlsConfig({ ...tlsConfig, email: val })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Continuous S3 Backup */}
      <Card variant="default">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <HardDrives size={20} color="#f59e0b" />
            <span>Continuous S3 Backup (Litestream)</span>
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Litestream real-time SQLite replication streams database WAL frames continuously to S3. Restore is available via <code>mould restore</code>.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

