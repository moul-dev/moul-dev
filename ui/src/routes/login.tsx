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
  Link,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
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
              <h1 {...stylex.props(styles.title)}>moul console</h1>
              <p {...stylex.props(styles.subtitle)}>Sign in with your administrator credentials</p>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              {error && <Alert variant="error" description={error} />}

              <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
                <TextField
                  label="Master Admin Key"
                  type="password"
                  placeholder="Enter MOUL_ADMIN_KEY"
                  value={adminKey}
                  onChange={setAdminKey}
                  isRequired
                  description="Server administrative key configured via MOUL_ADMIN_KEY"
                />

                <TextField
                  label="Root Username or Email"
                  placeholder="admin@example.com"
                  value={identity}
                  onChange={setIdentity}
                  isRequired
                />

                <TextField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  isRequired
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isDisabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
                </Button>
              </form>
            </div>
          </CardBody>

          {needsSetup && (
            <CardFooter>
              <div {...stylex.props(styles.footer)}>
                First time running moul?{' '}
                <RouterLink to="/setup" style={{ textDecoration: 'none' }}>
                  <Link variant="primary">Initialize Root Administrator</Link>
                </RouterLink>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

