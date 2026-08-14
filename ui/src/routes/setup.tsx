import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import { ShieldPlus } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../theme/tokens.stylex';
import { api, setStoredAdminKey } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: colors.bgApp,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: spacing.xs,
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: radii.lg,
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  error: {
    padding: spacing.md,
    backgroundColor: colors.dangerBg,
    color: colors.dangerText,
    borderRadius: radii.md,
    fontSize: '0.875rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.danger,
    fontFamily: fonts.sans,
  },
});

export const Route = createFileRoute('/setup')({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { adminKey: savedAdminKey, saveAdminKey } = useAuth();
  const [adminKey, setAdminKey] = useState(savedAdminKey || '');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminKey.trim()) {
      setError('Master Admin Key is required to authorize root user setup');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      // Save admin key so X-Admin-Key is attached
      saveAdminKey(adminKey.trim());
      setStoredAdminKey(adminKey.trim());

      await api.setupRootUser({ username, email, password });
      navigate({ to: '/login' });
    } catch (err: any) {
      setError(err.message || 'Failed to setup root user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.icon)}>
            <ShieldPlus size={28} />
          </div>
          <h1 {...stylex.props(styles.title)}>Welcome to mould</h1>
          <p {...stylex.props(styles.subtitle)}>
            Create the primary root administrator account to initialize your database engine.
          </p>
        </div>

        {error && <div {...stylex.props(styles.error)}>{error}</div>}

        <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
          <Input
            label="Master Admin Key (MOUL_ADMIN_KEY)"
            type="password"
            placeholder="Enter server admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            required
            helperText="Required to authorize root administrator creation"
          />
          <Input
            label="Root Username"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Root Email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Minimum 8 characters"
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Creating Administrator...' : 'Initialize Administrator'}
          </Button>
        </form>
      </div>
    </div>
  );
}
