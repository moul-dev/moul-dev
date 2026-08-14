import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { Gear, EnvelopeSimple, ShieldCheck, HardDrives, FloppyDisk } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';
import { api } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
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
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderMuted,
    paddingBottom: spacing.sm,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: spacing.md,
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

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

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
      setSavedMsg('Settings updated successfully!');
      setTimeout(() => setSavedMsg(null), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
          icon={<FloppyDisk size={16} />}
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {savedMsg && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#064e3b33',
            color: '#6ee7b7',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            border: '1px solid #10b981',
          }}
        >
          {savedMsg}
        </div>
      )}

      {/* SMTP Email Settings */}
      <div {...stylex.props(styles.card)}>
        <h2 {...stylex.props(styles.cardTitle)}>
          <EnvelopeSimple size={20} color="#0ea5e9" />
          <span>SMTP Transactional Mailer</span>
        </h2>
        <div {...stylex.props(styles.formGrid)}>
          <Input
            label="SMTP Host"
            placeholder="smtp.example.com"
            value={smtp.host || ''}
            onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
          />
          <Input
            label="SMTP Port"
            type="number"
            placeholder="587"
            value={smtp.port || ''}
            onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
          />
          <Input
            label="SMTP Username"
            placeholder="user@example.com"
            value={smtp.username || ''}
            onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
          />
          <Input
            label="SMTP Password"
            type="password"
            placeholder="••••••••"
            value={smtp.password || ''}
            onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
          />
          <Input
            label="Sender Address (From)"
            placeholder="no-reply@moul.dev"
            value={smtp.fromAddress || ''}
            onChange={(e) => setSmtp({ ...smtp, fromAddress: e.target.value })}
          />
        </div>
      </div>

      {/* TLS & HTTPS Settings */}
      <div {...stylex.props(styles.card)}>
        <h2 {...stylex.props(styles.cardTitle)}>
          <ShieldCheck size={20} color="#10b981" />
          <span>Automatic TLS / Let's Encrypt (CertMagic)</span>
        </h2>
        <div {...stylex.props(styles.formGrid)}>
          <Input
            label="Domains (comma-separated)"
            placeholder="api.example.com, app.example.com"
            value={tlsConfig.domains || ''}
            onChange={(e) => setTlsConfig({ ...tlsConfig, domains: e.target.value })}
            helperText="mould will automatically obtain & renew SSL certificates"
          />
          <Input
            label="ACME Account Email"
            type="email"
            placeholder="admin@example.com"
            value={tlsConfig.email || ''}
            onChange={(e) => setTlsConfig({ ...tlsConfig, email: e.target.value })}
          />
        </div>
      </div>

      {/* Continuous S3 Backup */}
      <div {...stylex.props(styles.card)}>
        <h2 {...stylex.props(styles.cardTitle)}>
          <HardDrives size={20} color="#f59e0b" />
          <span>Continuous S3 Backup (Litestream)</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Litestream real-time SQLite replication streams database WAL frames continuously to S3. Restore is available via <code>mould restore</code>.
        </p>
      </div>
    </div>
  );
}
