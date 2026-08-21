import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import { ShieldPlus } from '@phosphor-icons/react';
import {
  Card,
  CardHeader,
  CardBody,
  TextField,
  Button,
  Alert,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api, setStoredAdminKey } from '../api/client';
import { useAuth } from '../context/AuthContext';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: tokens.colorBgSubtle,
    padding: tokens.spacing4,
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
    width: '48px',
    height: '48px',
    borderRadius: tokens.radiusLg,
    backgroundColor: tokens.colorAlertBgAccent,
    color: tokens.colorPrimary500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing1,
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    width: '100%',
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
      <div {...stylex.props(styles.cardWrapper)}>
        <Card variant="default">
          <CardHeader>
            <div {...stylex.props(styles.header)}>
              <div {...stylex.props(styles.icon)}>
                <ShieldPlus size={28} />
              </div>
              <h1 {...stylex.props(styles.title)}>Welcome to mould</h1>
              <p {...stylex.props(styles.subtitle)}>
                Create the primary root administrator account to initialize your database engine.
              </p>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              {error && <Alert variant="error" description={error} />}

              <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
                <TextField
                  label="Master Admin Key (MOUL_ADMIN_KEY)"
                  type="password"
                  placeholder="Enter server admin key"
                  value={adminKey}
                  onChange={setAdminKey}
                  isRequired
                  description="Required to authorize root administrator creation"
                />

                <TextField
                  label="Root Username"
                  placeholder="admin"
                  value={username}
                  onChange={setUsername}
                  isRequired
                />

                <TextField
                  label="Root Email"
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
                  {loading ? 'Creating Administrator...' : 'Initialize Administrator'}
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

