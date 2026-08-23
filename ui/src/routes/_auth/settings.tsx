import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  EnvelopeSimpleIcon,
  ShieldCheckIcon,
  HardDrivesIcon,
  FloppyDiskIcon,
  LockKeyIcon,
} from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
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
  passwordForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacing3,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: tokens.spacing2,
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

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

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; password: string; passwordConfirm: string }) =>
      api.updateRootPassword(data),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirm('');
      toastQueue.add({
        title: 'Password Updated',
        description: 'Password updated successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Password Update Failed',
        description: err.message || 'Failed to update root password.',
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

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toastQueue.add({
        title: 'Validation Error',
        description: 'Current password is required.',
        variant: 'error',
      });
      return;
    }
    if (!newPassword) {
      toastQueue.add({
        title: 'Validation Error',
        description: 'New password is required.',
        variant: 'error',
      });
      return;
    }
    if (newPassword !== passwordConfirm) {
      toastQueue.add({
        title: 'Validation Error',
        description: 'New password and confirmation do not match.',
        variant: 'error',
      });
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword,
      password: newPassword,
      passwordConfirm,
    });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Engine Settings</h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Configure root credentials, transactional email (SMTP), automatic HTTPS certificates (CertMagic), and backups.
          </span>
        </div>
        <Button
          variant="primary"
          onPress={handleSave}
          isDisabled={updateMutation.isPending}
        >
          <FloppyDiskIcon size={16} />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* Root User Password & Security */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <LockKeyIcon size={20} color={tokens.colorPrimary500} />
            <span>Root User Password & Security</span>
          </div>
        </CardHeader>
        <CardBody>
          <div {...stylex.props(styles.passwordForm)}>
            <div>
              <TextField
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={setCurrentPassword}
                isRequired
              />
            </div>
            <div {...stylex.props(styles.twoColGrid)}>
              <TextField
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={setNewPassword}
                description="Minimum 8 characters (1 uppercase, 1 lowercase, 1 digit)"
                isRequired
              />
              <TextField
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                isRequired
              />
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <div {...stylex.props(styles.cardFooter)}>
            <Button
              variant="primary"
              onPress={handleUpdatePassword}
              isDisabled={updatePasswordMutation.isPending || !currentPassword || !newPassword || !passwordConfirm}
            >
              <LockKeyIcon size={16} />
              <span>{updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* SMTP Email Settings */}
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <EnvelopeSimpleIcon size={20} color={tokens.colorPrimary500} />
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
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <ShieldCheckIcon size={20} color={tokens.colorSuccess500} />
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
      <Card variant="glass">
        <CardHeader>
          <div {...stylex.props(styles.cardTitle)}>
            <HardDrivesIcon size={20} color={tokens.colorWarning500} />
            <span>Continuous S3 Backup (Litestream)</span>
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm, margin: 0 }}>
            Litestream real-time SQLite replication streams database WAL frames continuously to S3. Restore is available via <code>mould restore</code>.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}


