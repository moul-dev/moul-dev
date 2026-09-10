import React, { useState } from 'react';
import { createFileRoute, useNavigate, Link as RouterLink } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  TextField,
  Button,
  Alert,
  Badge,
  Link,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { LogoIcon } from '../components/layout/Logo';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: tokens.colorBgSubtle,
    padding: tokens.spacing4,
    position: 'relative',
  },
  themeToggleWrapper: {
    position: 'absolute',
    top: tokens.spacing4,
    right: tokens.spacing4,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '460px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacing1,
    width: '100%',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorFg,
    marginBottom: tokens.spacing2,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  keyStatusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing2} ${tokens.spacing3}`,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    border: `1px solid ${tokens.colorBorderSubtle}`,
    width: '100%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    width: '100%',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.8125rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
    width: '100%',
  },
});

export const Route = createFileRoute('/setup')({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { adminKey, verifyAndSetAdminKey, clearAdminKey, adminLogin, needsSetup } = useAuth();
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Context 1: Master Admin Key Verification
  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = masterKeyInput.trim();
    if (!trimmed) {
      setError('Master Admin Key is required');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyAndSetAdminKey(trimmed);
      if (!res.needsSetup) {
        navigate({ to: '/login' });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Master Admin Key (Unauthorized)');
    } finally {
      setLoading(false);
    }
  };

  // Context 2: Root User Setup Submission
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await api.setupRootUser({ username: username.trim(), email: email.trim(), password });
      // Auto-authenticate with the created credentials
      try {
        await adminLogin(username.trim(), password);
        navigate({ to: '/overview' });
      } catch {
        navigate({ to: '/login' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup root user');
    } finally {
      setLoading(false);
    }
  };

  const handleClearKey = () => {
    clearAdminKey();
    setMasterKeyInput('');
    setError(null);
  };

  const hasVerifiedKey = Boolean(adminKey);

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.themeToggleWrapper)}>
        <ThemeToggle />
      </div>
      <div {...stylex.props(styles.cardWrapper)}>
        <Card variant="default">
          <CardHeader>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.icon)}>
                <LogoIcon size={44} />
              </div>
              <h1 {...stylex.props(styles.title)}>
                {hasVerifiedKey ? 'Welcome to moul' : 'Connect to moul'}
              </h1>
              <p {...stylex.props(styles.subtitle)}>
                {hasVerifiedKey
                  ? 'Set up your root administrator account.'
                  : 'Enter your Master Admin Key to continue.'}
              </p>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              {error && <Alert variant="error" description={error} />}

              {!hasVerifiedKey ? (
                /* ── Context 1: Master Admin Key Entry ── */
                <form onSubmit={handleVerifyKey} {...stylex.props(styles.form)}>
                  <TextField
                    label="Master Admin Key"
                    type="password"
                    placeholder="Enter MOUL_ADMIN_KEY"
                    value={masterKeyInput}
                    onChange={setMasterKeyInput}
                    isRequired
                    description="Configured via MOUL_ADMIN_KEY"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isDisabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Continue'}
                  </Button>
                </form>
              ) : !needsSetup ? (
                /* ── If setup is already complete, redirect to login ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <div {...stylex.props(styles.keyStatusRow)}>
                    <Badge variant="success" dot>Admin key verified</Badge>
                    <Button variant="ghost" onPress={handleClearKey}>
                      Change Key
                    </Button>
                  </div>
                  <Alert
                    variant="info"
                    description="Root administrator already created. Please sign in with your credentials."
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={() => navigate({ to: '/login' })}
                  >
                    Go to Sign In
                  </Button>
                </div>
              ) : (
                /* ── Context 2: Root User Account Creation ── */
                <form onSubmit={handleSetupSubmit} {...stylex.props(styles.form)}>
                  <div {...stylex.props(styles.keyStatusRow)}>
                    <Badge variant="success" dot>Admin key verified</Badge>
                    <Button variant="ghost" onPress={handleClearKey}>
                      Change Key
                    </Button>
                  </div>

                  <TextField
                    label="Username"
                    placeholder="admin"
                    value={username}
                    onChange={setUsername}
                    isRequired
                  />

                  <TextField
                    label="Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={setEmail}
                    isRequired
                  />

                  <TextField
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    isRequired
                    description="Minimum 8 characters"
                  />

                  <TextField
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={setPasswordConfirm}
                    isRequired
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isDisabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              )}
            </div>
          </CardBody>

          {hasVerifiedKey && (
            <CardFooter>
              <div {...stylex.props(styles.footer)}>
                Already set up?{' '}
                <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                  <Link variant="primary">Sign In</Link>
                </RouterLink>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
