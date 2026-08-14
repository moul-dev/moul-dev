import React, { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import { ShieldCheck, Key, LockSimple, User } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../theme/tokens.stylex';
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
  footer: {
    textAlign: 'center',
    fontSize: '0.8125rem',
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  link: {
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: 500,
  },
});

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { adminLogin, adminKey: savedAdminKey, needsSetup } = useAuth();
  const [adminKey, setAdminKey] = useState(savedAdminKey || '');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminKey.trim()) {
      setError('Master Admin Key is required');
      return;
    }
    if (!identity.trim() || !password) {
      setError('Username/Email and Password are required');
      return;
    }

    setLoading(true);
    try {
      await adminLogin(adminKey.trim(), identity.trim(), password);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.icon)}>
            <ShieldCheck size={28} />
          </div>
          <h1 {...stylex.props(styles.title)}>mould console</h1>
          <p {...stylex.props(styles.subtitle)}>Sign in with your administrator credentials</p>
        </div>

        {error && <div {...stylex.props(styles.error)}>{error}</div>}

        <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
          <Input
            label="Master Admin Key"
            type="password"
            placeholder="Enter MOUL_ADMIN_KEY"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            required
            helperText="Server administrative key configured via MOUL_ADMIN_KEY"
          />

          <Input
            label="Root Username or Email"
            placeholder="admin@example.com"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </Button>
        </form>

        {needsSetup && (
          <div {...stylex.props(styles.footer)}>
            First time running mould?{' '}
            <Link to="/setup" {...stylex.props(styles.link)}>
              Initialize Root Administrator
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
