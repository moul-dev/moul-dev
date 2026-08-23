import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import {
  CloudIcon,
  FloppyDiskIcon,
  GaugeIcon,
  GlobeHemisphereWestIcon,
  EnvelopeSimpleIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  TrashIcon,
  PlusIcon,
  ShieldWarningIcon,
  GithubLogoIcon,
  GoogleLogoIcon,
  AppleLogoIcon,
  GearIcon,
  LinkSimpleIcon,
} from '@phosphor-icons/react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Badge,
  Button,
  Switch,
  TextField,
  TextArea,
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
  ModalOverlay,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EmptyState,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../api/client';

export const Route = createFileRoute('/_auth/settings')({
  component: SettingsPage,
});

interface RateLimitRule {
  label: string;
  max_requests: number;
  interval: number;
  targeted_users: 'all' | 'authenticated' | 'guest' | string;
}

type DrawerMode =
  | null
  | 's3'
  | 'litestream'
  | 'ratelimit-add'
  | 'ratelimit-edit'
  | 'rootips'
  | 'email'
  | 'oauth-global'
  | 'oauth-github'
  | 'oauth-google'
  | 'oauth-apple'
  | 'password';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing6,
    maxWidth: '1100px',
    width: '100%',
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
  tabPanels: {
    marginTop: tokens.spacing4,
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
  cardHeaderWithAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridTwoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacing4,
  },
  gridThreeCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacing4,
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
  },
  infoLabel: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  infoValue: {
    fontSize: tokens.fontSizeSm,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    wordBreak: 'break-all',
  },
  infoCode: {
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeSm,
    color: tokens.colorFg,
    backgroundColor: tokens.colorBgSubtle,
    padding: `${tokens.spacing1} ${tokens.spacing2}`,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    display: 'inline-block',
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    paddingInline: tokens.spacing1,
  },
  tableActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
    marginTop: tokens.spacing2,
  },
  providerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing3,
  },
  providerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  providerName: {
    fontWeight: 600,
    fontSize: tokens.fontSizeMd,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  cardSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
  },
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<string>('s3');
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);

  // Queries
  const { data: settingsData } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  });

  // Local form states for Drawers
  const [s3Form, setS3Form] = useState({
    file_s3_enabled: 'false',
    file_s3_bucket: '',
    file_s3_endpoint: '',
    file_s3_region: '',
    file_s3_access_key: '',
    file_s3_secret_key: '',
    file_s3_force_path_style: 'false',
  });

  const [litestreamForm, setLitestreamForm] = useState({
    litestream_enabled: 'false',
    litestream_s3_bucket: '',
    litestream_s3_endpoint: '',
    litestream_s3_region: '',
    litestream_access_key_id: '',
    litestream_secret_access_key: '',
    litestream_s3_force_path_style: 'false',
    litestream_replica_path: '',
  });

  const [rateLimitForm, setRateLimitForm] = useState<RateLimitRule>({
    label: '',
    max_requests: 10,
    interval: 3,
    targeted_users: 'all',
  });
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<RateLimitRule | null>(null);
  const [ruleToDeleteIndex, setRuleToDeleteIndex] = useState<number | null>(null);

  const [rootIPsForm, setRootIPsForm] = useState({
    root_user_ip_enabled: 'false',
    root_user_allowed_ips: '',
  });

  const [emailForm, setEmailForm] = useState({
    email_enabled: 'false',
    email_provider: 'console',
    email_from_address: '',
    email_from_name: '',
    email_api_key: '',
    email_api_secret: '',
    email_domain: '',
    email_region: 'us-east-1',
    email_endpoint: '',
  });

  const [oauthGlobalForm, setOAuthGlobalForm] = useState({
    oauth_redirect_url: '',
  });

  const [oauthGitHubForm, setOAuthGitHubForm] = useState({
    oauth_github_enabled: 'false',
    oauth_github_client_id: '',
    oauth_github_client_secret: '',
  });

  const [oauthGoogleForm, setOAuthGoogleForm] = useState({
    oauth_google_enabled: 'false',
    oauth_google_client_id: '',
    oauth_google_client_secret: '',
  });

  const [oauthAppleForm, setOAuthAppleForm] = useState({
    oauth_apple_enabled: 'false',
    oauth_apple_client_id: '',
    oauth_apple_client_secret: '',
    oauth_apple_team_id: '',
    oauth_apple_key_id: '',
    oauth_apple_private_key: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: '',
  });

  // Parse Rate Limiting Rules
  const rateLimitRules: RateLimitRule[] = useMemo(() => {
    if (!settingsData?.rate_limiting_rules) return [];
    try {
      const parsed = JSON.parse(settingsData.rate_limiting_rules);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [settingsData?.rate_limiting_rules]);

  // Sync settingsData to Drawer form states when opening
  const openDrawer = (mode: DrawerMode, extraIndex?: number) => {
    if (!settingsData) return;

    if (mode === 's3') {
      setS3Form({
        file_s3_enabled: settingsData.file_s3_enabled || 'false',
        file_s3_bucket: settingsData.file_s3_bucket || '',
        file_s3_endpoint: settingsData.file_s3_endpoint || '',
        file_s3_region: settingsData.file_s3_region || '',
        file_s3_access_key: settingsData.file_s3_access_key || '',
        file_s3_secret_key: settingsData.file_s3_secret_key || '',
        file_s3_force_path_style: settingsData.file_s3_force_path_style || 'false',
      });
    } else if (mode === 'litestream') {
      setLitestreamForm({
        litestream_enabled: settingsData.litestream_enabled || 'false',
        litestream_s3_bucket: settingsData.litestream_s3_bucket || '',
        litestream_s3_endpoint: settingsData.litestream_s3_endpoint || '',
        litestream_s3_region: settingsData.litestream_s3_region || '',
        litestream_access_key_id: settingsData.litestream_access_key_id || '',
        litestream_secret_access_key: settingsData.litestream_secret_access_key || '',
        litestream_s3_force_path_style: settingsData.litestream_s3_force_path_style || 'false',
        litestream_replica_path: settingsData.litestream_replica_path || '',
      });
    } else if (mode === 'ratelimit-add') {
      setRateLimitForm({
        label: '',
        max_requests: 10,
        interval: 3,
        targeted_users: 'all',
      });
      setEditingRuleIndex(null);
    } else if (mode === 'ratelimit-edit' && extraIndex !== undefined) {
      const rule = rateLimitRules[extraIndex];
      if (rule) {
        setRateLimitForm({ ...rule });
        setEditingRuleIndex(extraIndex);
      }
    } else if (mode === 'rootips') {
      setRootIPsForm({
        root_user_ip_enabled: settingsData.root_user_ip_enabled || 'false',
        root_user_allowed_ips: settingsData.root_user_allowed_ips || '',
      });
    } else if (mode === 'email') {
      setEmailForm({
        email_enabled: settingsData.email_enabled || 'false',
        email_provider: settingsData.email_provider || 'console',
        email_from_address: settingsData.email_from_address || '',
        email_from_name: settingsData.email_from_name || '',
        email_api_key: settingsData.email_api_key || '',
        email_api_secret: settingsData.email_api_secret || '',
        email_domain: settingsData.email_domain || '',
        email_region: settingsData.email_region || 'us-east-1',
        email_endpoint: settingsData.email_endpoint || '',
      });
    } else if (mode === 'oauth-global') {
      setOAuthGlobalForm({
        oauth_redirect_url: settingsData.oauth_redirect_url || '',
      });
    } else if (mode === 'oauth-github') {
      setOAuthGitHubForm({
        oauth_github_enabled: settingsData.oauth_github_enabled || 'false',
        oauth_github_client_id: settingsData.oauth_github_client_id || '',
        oauth_github_client_secret: settingsData.oauth_github_client_secret || '',
      });
    } else if (mode === 'oauth-google') {
      setOAuthGoogleForm({
        oauth_google_enabled: settingsData.oauth_google_enabled || 'false',
        oauth_google_client_id: settingsData.oauth_google_client_id || '',
        oauth_google_client_secret: settingsData.oauth_google_client_secret || '',
      });
    } else if (mode === 'oauth-apple') {
      setOAuthAppleForm({
        oauth_apple_enabled: settingsData.oauth_apple_enabled || 'false',
        oauth_apple_client_id: settingsData.oauth_apple_client_id || '',
        oauth_apple_client_secret: settingsData.oauth_apple_client_secret || '',
        oauth_apple_team_id: settingsData.oauth_apple_team_id || '',
        oauth_apple_key_id: settingsData.oauth_apple_key_id || '',
        oauth_apple_private_key: settingsData.oauth_apple_private_key || '',
      });
    } else if (mode === 'password') {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        passwordConfirm: '',
      });
    }

    setDrawerMode(mode);
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingRuleIndex(null);
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      closeDrawer();
      toastQueue.add({
        title: 'Settings Saved',
        description: 'Engine configuration updated successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Save Failed',
        description: err.message || 'Failed to update settings.',
        variant: 'error',
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; password: string; passwordConfirm: string }) =>
      api.updateRootPassword(data),
    onSuccess: () => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        passwordConfirm: '',
      });
      closeDrawer();
      toastQueue.add({
        title: 'Password Updated',
        description: 'Root administrator password updated successfully.',
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

  // Drawer Save Handlers
  const handleSaveDrawer = () => {
    if (!drawerMode) return;

    if (drawerMode === 's3') {
      updateMutation.mutate(s3Form);
    } else if (drawerMode === 'litestream') {
      updateMutation.mutate(litestreamForm);
    } else if (drawerMode === 'ratelimit-add' || drawerMode === 'ratelimit-edit') {
      if (!rateLimitForm.label.trim()) {
        toastQueue.add({
          title: 'Validation Error',
          description: 'Rule label / route pattern is required.',
          variant: 'error',
        });
        return;
      }
      const updatedRules = [...rateLimitRules];
      const newRule: RateLimitRule = {
        label: rateLimitForm.label.trim(),
        max_requests: Number(rateLimitForm.max_requests) || 10,
        interval: Number(rateLimitForm.interval) || 3,
        targeted_users: rateLimitForm.targeted_users || 'all',
      };

      if (editingRuleIndex !== null && editingRuleIndex >= 0) {
        updatedRules[editingRuleIndex] = newRule;
      } else {
        updatedRules.push(newRule);
      }

      updateMutation.mutate({
        rate_limiting_rules: JSON.stringify(updatedRules),
      });
    } else if (drawerMode === 'rootips') {
      updateMutation.mutate(rootIPsForm);
    } else if (drawerMode === 'email') {
      updateMutation.mutate(emailForm);
    } else if (drawerMode === 'oauth-global') {
      updateMutation.mutate(oauthGlobalForm);
    } else if (drawerMode === 'oauth-github') {
      updateMutation.mutate(oauthGitHubForm);
    } else if (drawerMode === 'oauth-google') {
      updateMutation.mutate(oauthGoogleForm);
    } else if (drawerMode === 'oauth-apple') {
      updateMutation.mutate(oauthAppleForm);
    } else if (drawerMode === 'password') {
      if (!passwordForm.currentPassword) {
        toastQueue.add({
          title: 'Validation Error',
          description: 'Current password is required.',
          variant: 'error',
        });
        return;
      }
      if (!passwordForm.newPassword) {
        toastQueue.add({
          title: 'Validation Error',
          description: 'New password is required.',
          variant: 'error',
        });
        return;
      }
      if (passwordForm.newPassword !== passwordForm.passwordConfirm) {
        toastQueue.add({
          title: 'Validation Error',
          description: 'New password and confirmation do not match.',
          variant: 'error',
        });
        return;
      }
      updatePasswordMutation.mutate({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        passwordConfirm: passwordForm.passwordConfirm,
      });
    }
  };

  const handleToggleRateLimiting = (enabled: boolean) => {
    updateMutation.mutate({
      rate_limiting_enabled: enabled ? 'true' : 'false',
    });
  };

  const handleDeleteRule = (index: number) => {
    const rule = rateLimitRules[index];
    setRuleToDelete(rule);
    setRuleToDeleteIndex(index);
  };

  const confirmDeleteRule = () => {
    if (ruleToDeleteIndex === null) return;
    const updated = rateLimitRules.filter((_, idx) => idx !== ruleToDeleteIndex);
    updateMutation.mutate({
      rate_limiting_rules: JSON.stringify(updated),
    });
    setRuleToDelete(null);
    setRuleToDeleteIndex(null);
  };

  // Helper values
  const s3Enabled = settingsData?.file_s3_enabled === 'true';
  const litestreamEnabled = settingsData?.litestream_enabled === 'true';
  const rateLimitingEnabled = settingsData?.rate_limiting_enabled === 'true';
  const rootIPEnabled = settingsData?.root_user_ip_enabled === 'true';
  const emailEnabled = settingsData?.email_enabled === 'true';
  const githubEnabled = settingsData?.oauth_github_enabled === 'true';
  const googleEnabled = settingsData?.oauth_google_enabled === 'true';
  const appleEnabled = settingsData?.oauth_apple_enabled === 'true';

  const allowedIPsList = useMemo(() => {
    if (!settingsData?.root_user_allowed_ips) return [];
    return settingsData.root_user_allowed_ips
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
  }, [settingsData?.root_user_allowed_ips]);

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Engine Settings</h1>
          <span {...stylex.props(styles.subtitle)}>
            Manage object storage, litestream backups, rate limiting, security IP whitelist, transactional email, OAuth2 providers, and root credentials.
          </span>
        </div>
      </div>

      <Tabs selectedKey={selectedTab} onSelectionChange={(k) => setSelectedTab(k as string)}>
        <TabList aria-label="Engine Settings Navigation">
          <Tab id="s3">S3 Storage</Tab>
          <Tab id="litestream">Litestream Backups</Tab>
          <Tab id="ratelimit">Rate Limiting</Tab>
          <Tab id="rootips">Root User IPs</Tab>
          <Tab id="email">Email Delivery</Tab>
          <Tab id="oauth">OAuth2 Providers</Tab>
          <Tab id="password">Root Password</Tab>
        </TabList>

        <TabPanels {...stylex.props(styles.tabPanels)}>
          {/* TAB 1: S3 STORAGE */}
          <TabPanel id="s3">
            <Card elevation="sm">
              <CardHeader>
                <div {...stylex.props(styles.cardHeaderWithAction)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <CloudIcon size={20} color={tokens.colorPrimary500} />
                    <span>S3 Object Storage</span>
                  </div>
                  <Button variant="outline" size="sm" onPress={() => openDrawer('s3')}>
                    <PencilSimpleIcon size={14} />
                    <span>Configure S3</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {!s3Enabled ? (
                  <EmptyState
                    icon={<CloudIcon size={36} color={tokens.colorPrimary500} />}
                    title="S3 Object Storage is Disabled"
                    description="Files and media uploads are currently saved to local disk storage. Configure an S3-compatible bucket (AWS, Cloudflare R2, MinIO, Wasabi) for scalable distributed object storage."
                    action={
                      <Button variant="primary" onPress={() => openDrawer('s3')}>
                        <GearIcon size={16} />
                        <span>Enable & Configure S3</span>
                      </Button>
                    }
                    variant="dashed"
                  />
                ) : (
                  <div {...stylex.props(styles.cardSection)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                      <Badge variant="success" size="md">
                        S3 Storage Active
                      </Badge>
                      {settingsData?.file_s3_force_path_style === 'true' && (
                        <Badge variant="neutral" size="sm">
                          Path-Style Enabled
                        </Badge>
                      )}
                    </div>
                    <div {...stylex.props(styles.gridTwoCol)}>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>S3 Bucket</span>
                        <span {...stylex.props(styles.infoCode)}>{settingsData?.file_s3_bucket || '—'}</span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>S3 Endpoint</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.file_s3_endpoint || '(AWS S3 standard endpoint)'}
                        </span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Region</span>
                        <span {...stylex.props(styles.infoValue)}>{settingsData?.file_s3_region || 'us-east-1'}</span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Access Key ID</span>
                        <span {...stylex.props(styles.infoCode)}>
                          {settingsData?.file_s3_access_key
                            ? `${settingsData.file_s3_access_key.slice(0, 4)}••••••••`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 2: LITESTREAM BACKUPS */}
          <TabPanel id="litestream">
            <Card elevation="sm">
              <CardHeader>
                <div {...stylex.props(styles.cardHeaderWithAction)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <FloppyDiskIcon size={20} color={tokens.colorSuccess500} />
                    <span>Litestream Real-Time Backups</span>
                  </div>
                  <Button variant="outline" size="sm" onPress={() => openDrawer('litestream')}>
                    <PencilSimpleIcon size={14} />
                    <span>Configure Litestream</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {!litestreamEnabled ? (
                  <EmptyState
                    icon={<FloppyDiskIcon size={36} color={tokens.colorSuccess500} />}
                    title="Litestream Replication is Disabled"
                    description="Stream SQLite WAL frames continuously to S3 for point-in-time recovery, real-time disaster recovery, and automated failover."
                    action={
                      <Button variant="primary" onPress={() => openDrawer('litestream')}>
                        <GearIcon size={16} />
                        <span>Enable & Configure Litestream</span>
                      </Button>
                    }
                    variant="dashed"
                  />
                ) : (
                  <div {...stylex.props(styles.cardSection)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                      <Badge variant="success" size="md">
                        Continuous Replication Active
                      </Badge>
                      {settingsData?.litestream_s3_force_path_style === 'true' && (
                        <Badge variant="neutral" size="sm">
                          Path-Style Enabled
                        </Badge>
                      )}
                    </div>
                    <div {...stylex.props(styles.gridTwoCol)}>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Backup Bucket</span>
                        <span {...stylex.props(styles.infoCode)}>{settingsData?.litestream_s3_bucket || '—'}</span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Replica Path</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.litestream_replica_path || '(Default root replication)'}
                        </span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Endpoint</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.litestream_s3_endpoint || '(AWS S3 standard endpoint)'}
                        </span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Region</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.litestream_s3_region || 'us-east-1'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 3: RATE LIMITING */}
          <TabPanel id="ratelimit">
            <Card elevation="sm">
              <CardHeader>
                <div {...stylex.props(styles.cardHeaderWithAction)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <GaugeIcon size={20} color={tokens.colorWarning500} />
                    <span>Sliding Window Rate Limiting</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing3 }}>
                    <Switch
                      isSelected={rateLimitingEnabled}
                      onChange={handleToggleRateLimiting}
                    >
                      {rateLimitingEnabled ? 'Rate Limiter Enabled' : 'Rate Limiter Disabled'}
                    </Switch>
                    <Button variant="primary" size="sm" onPress={() => openDrawer('ratelimit-add')}>
                      <PlusIcon size={14} />
                      <span>Add Rule</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {rateLimitRules.length === 0 ? (
                  <EmptyState
                    icon={<ShieldWarningIcon size={36} color={tokens.colorWarning500} />}
                    title="No Rate Limiting Rules Configured"
                    description="Protect your API endpoints and auth routes against brute-force attacks and abuse by configuring sliding window rate limits."
                    action={
                      <Button variant="primary" onPress={() => openDrawer('ratelimit-add')}>
                        <PlusIcon size={16} />
                        <span>Add Rate Limit Rule</span>
                      </Button>
                    }
                    variant="dashed"
                  />
                ) : (
                  <Table aria-label="Rate Limiting Rules Table">
                    <TableHeader>
                      <Column isRowHeader>Rule Pattern / Label</Column>
                      <Column>Max Requests</Column>
                      <Column>Interval Window</Column>
                      <Column>Target Audience</Column>
                      <Column>Actions</Column>
                    </TableHeader>
                    <TableBody>
                      {rateLimitRules.map((rule, idx) => (
                        <Row key={idx} id={`rule-${idx}`}>
                          <Cell>
                            <span {...stylex.props(styles.infoCode)}>{rule.label}</span>
                          </Cell>
                          <Cell>
                            <Badge variant="neutral" size="sm">
                              {rule.max_requests} reqs
                            </Badge>
                          </Cell>
                          <Cell>{rule.interval} seconds</Cell>
                          <Cell>
                            <Badge
                              variant={
                                rule.targeted_users === 'authenticated'
                                  ? 'primary'
                                  : rule.targeted_users === 'guest'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {rule.targeted_users}
                            </Badge>
                          </Cell>
                          <Cell>
                            <div {...stylex.props(styles.tableActions)}>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`Edit ${rule.label}`}
                                onPress={() => openDrawer('ratelimit-edit', idx)}
                              >
                                <PencilSimpleIcon size={16} />
                              </Button>
                              <Button
                                variant="danger-soft"
                                size="sm"
                                aria-label={`Delete ${rule.label}`}
                                onPress={() => handleDeleteRule(idx)}
                              >
                                <TrashIcon size={16} />
                              </Button>
                            </div>
                          </Cell>
                        </Row>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 4: ROOT USER IPS */}
          <TabPanel id="rootips">
            <Card elevation="sm">
              <CardHeader>
                <div {...stylex.props(styles.cardHeaderWithAction)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <GlobeHemisphereWestIcon size={20} color={tokens.colorPrimary500} />
                    <span>Root User IP Restriction</span>
                  </div>
                  <Button variant="outline" size="sm" onPress={() => openDrawer('rootips')}>
                    <PencilSimpleIcon size={14} />
                    <span>Configure IP Whitelist</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {!rootIPEnabled || allowedIPsList.length === 0 ? (
                  <EmptyState
                    icon={<GlobeHemisphereWestIcon size={36} color={tokens.colorWarning500} />}
                    title="Root User IP Whitelist is Inactive"
                    description="Root administrator accounts can currently authenticate from any network IP address. Restrict root logins to specific trusted corporate IPs or VPN CIDR ranges to prevent unauthorized access."
                    action={
                      <Button variant="primary" onPress={() => openDrawer('rootips')}>
                        <GearIcon size={16} />
                        <span>Configure Allowed IPs</span>
                      </Button>
                    }
                    variant="dashed"
                  />
                ) : (
                  <div {...stylex.props(styles.cardSection)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                      <Badge variant="success" size="md">
                        IP Whitelist Enforcement Active
                      </Badge>
                    </div>
                    <div>
                      <span {...stylex.props(styles.infoLabel)}>Allowed IP Addresses & CIDR Ranges</span>
                      <div {...stylex.props(styles.tagList)}>
                        {allowedIPsList.map((ip, i) => (
                          <Badge key={i} variant="primary" size="md">
                            {ip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 5: EMAIL DELIVERY */}
          <TabPanel id="email">
            <Card elevation="sm">
              <CardHeader>
                <div {...stylex.props(styles.cardHeaderWithAction)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <EnvelopeSimpleIcon size={20} color={tokens.colorPrimary500} />
                    <span>Transactional Email Delivery</span>
                  </div>
                  <Button variant="outline" size="sm" onPress={() => openDrawer('email')}>
                    <PencilSimpleIcon size={14} />
                    <span>Configure Email</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {!emailEnabled ? (
                  <EmptyState
                    icon={<EnvelopeSimpleIcon size={36} color={tokens.colorPrimary500} />}
                    title="Transactional Email Delivery is Disabled"
                    description="Enable transactional email delivery to send password reset links, OTP verification codes, and user invites via AWS SES, Resend, Mailgun, SendGrid, Cloudflare, or local stdout console."
                    action={
                      <Button variant="primary" onPress={() => openDrawer('email')}>
                        <GearIcon size={16} />
                        <span>Enable & Configure Email</span>
                      </Button>
                    }
                    variant="dashed"
                  />
                ) : (
                  <div {...stylex.props(styles.cardSection)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                      <Badge variant="success" size="md">
                        Email Service Active
                      </Badge>
                      <Badge variant="primary" size="sm">
                        Provider: {settingsData?.email_provider?.toUpperCase() || 'CONSOLE'}
                      </Badge>
                    </div>
                    <div {...stylex.props(styles.gridTwoCol)}>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>From Address</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.email_from_address || '—'}
                        </span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>From Name</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.email_from_name || '—'}
                        </span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Domain / Account ID</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.email_domain || '(Default)'}
                        </span>
                      </div>
                      <div {...stylex.props(styles.infoItem)}>
                        <span {...stylex.props(styles.infoLabel)}>Region</span>
                        <span {...stylex.props(styles.infoValue)}>
                          {settingsData?.email_region || 'us-east-1'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 6: OAUTH2 PROVIDERS */}
          <TabPanel id="oauth">
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing4 }}>
              {/* Global Redirect URI Card */}
              <Card elevation="sm">
                <CardHeader>
                  <div {...stylex.props(styles.cardHeaderWithAction)}>
                    <div {...stylex.props(styles.cardTitle)}>
                      <LinkSimpleIcon size={18} color={tokens.colorPrimary500} />
                      <span>Global OAuth Callback Redirect URL</span>
                    </div>
                    <Button variant="outline" size="sm" onPress={() => openDrawer('oauth-global')}>
                      <PencilSimpleIcon size={14} />
                      <span>Edit Redirect URL</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div {...stylex.props(styles.infoItem)}>
                    <span {...stylex.props(styles.infoLabel)}>Authorized Callback URI</span>
                    <span {...stylex.props(styles.infoCode)}>
                      {settingsData?.oauth_redirect_url || 'http://localhost:8090/api/oauth2/callback'}
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Provider Cards */}
              <div {...stylex.props(styles.gridThreeCol)}>
                {/* GitHub */}
                <Card elevation="sm">
                  <CardBody>
                    <div {...stylex.props(styles.providerHeader)}>
                      <div {...stylex.props(styles.providerInfo)}>
                        <GithubLogoIcon size={24} />
                        <span {...stylex.props(styles.providerName)}>GitHub</span>
                      </div>
                      <Badge variant={githubEnabled ? 'success' : 'neutral'} size="sm">
                        {githubEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div {...stylex.props(styles.infoItem)}>
                      <span {...stylex.props(styles.infoLabel)}>Client ID</span>
                      <span {...stylex.props(styles.infoValue)}>
                        {settingsData?.oauth_github_client_id || 'Not configured'}
                      </span>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button variant="outline" size="sm" onPress={() => openDrawer('oauth-github')}>
                      <GearIcon size={14} />
                      <span>Configure GitHub</span>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Google */}
                <Card elevation="sm">
                  <CardBody>
                    <div {...stylex.props(styles.providerHeader)}>
                      <div {...stylex.props(styles.providerInfo)}>
                        <GoogleLogoIcon size={24} color="#EA4335" />
                        <span {...stylex.props(styles.providerName)}>Google</span>
                      </div>
                      <Badge variant={googleEnabled ? 'success' : 'neutral'} size="sm">
                        {googleEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div {...stylex.props(styles.infoItem)}>
                      <span {...stylex.props(styles.infoLabel)}>Client ID</span>
                      <span {...stylex.props(styles.infoValue)}>
                        {settingsData?.oauth_google_client_id || 'Not configured'}
                      </span>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button variant="outline" size="sm" onPress={() => openDrawer('oauth-google')}>
                      <GearIcon size={14} />
                      <span>Configure Google</span>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Apple */}
                <Card elevation="sm">
                  <CardBody>
                    <div {...stylex.props(styles.providerHeader)}>
                      <div {...stylex.props(styles.providerInfo)}>
                        <AppleLogoIcon size={24} />
                        <span {...stylex.props(styles.providerName)}>Apple</span>
                      </div>
                      <Badge variant={appleEnabled ? 'success' : 'neutral'} size="sm">
                        {appleEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div {...stylex.props(styles.infoItem)}>
                      <span {...stylex.props(styles.infoLabel)}>Service / Client ID</span>
                      <span {...stylex.props(styles.infoValue)}>
                        {settingsData?.oauth_apple_client_id || 'Not configured'}
                      </span>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button variant="outline" size="sm" onPress={() => openDrawer('oauth-apple')}>
                      <GearIcon size={14} />
                      <span>Configure Apple</span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabPanel>

          {/* TAB 7: ROOT PASSWORD */}
          <TabPanel id="password">
            <Card elevation="sm">
              <CardHeader>
                <div {...stylex.props(styles.cardHeaderWithAction)}>
                  <div {...stylex.props(styles.cardTitle)}>
                    <LockKeyIcon size={20} color={tokens.colorPrimary500} />
                    <span>Root Administrator Credentials</span>
                  </div>
                  <Button variant="primary" size="sm" onPress={() => openDrawer('password')}>
                    <LockKeyIcon size={14} />
                    <span>Change Root Password</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div {...stylex.props(styles.cardSection)}>
                  <p style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm, margin: 0 }}>
                    The root account maintains ultimate administrative privileges over schema collections, engine configurations, access controls, and backups. It is strongly recommended to use a high-entropy password and configure IP restrictions.
                  </p>
                  <div {...stylex.props(styles.gridTwoCol)}>
                    <div {...stylex.props(styles.infoItem)}>
                      <span {...stylex.props(styles.infoLabel)}>Password Requirements</span>
                      <span {...stylex.props(styles.infoValue)}>
                        Minimum 8 characters with uppercase, lowercase, and numeric characters.
                      </span>
                    </div>
                    <div {...stylex.props(styles.infoItem)}>
                      <span {...stylex.props(styles.infoLabel)}>Access Privileges</span>
                      <span {...stylex.props(styles.infoValue)}>
                        Full System Administration (CLI, TUI, and Web Admin Console)
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* DRAWER MODAL FOR CREATING / EDITING SETTINGS */}
      <DrawerOverlay isOpen={drawerMode !== null} onOpenChange={(open) => !open && closeDrawer()} isDismissable>
        <Drawer placement="right" size="md">
          <DrawerDialog>
            <DrawerHeader>
              <DrawerTitle>
                {drawerMode === 's3' && 'Configure S3 Object Storage'}
                {drawerMode === 'litestream' && 'Configure Litestream Backups'}
                {drawerMode === 'ratelimit-add' && 'Add Rate Limit Rule'}
                {drawerMode === 'ratelimit-edit' && 'Edit Rate Limit Rule'}
                {drawerMode === 'rootips' && 'Configure Root User IP Whitelist'}
                {drawerMode === 'email' && 'Configure Transactional Email'}
                {drawerMode === 'oauth-global' && 'Configure OAuth Callback URL'}
                {drawerMode === 'oauth-github' && 'Configure GitHub OAuth2'}
                {drawerMode === 'oauth-google' && 'Configure Google OAuth2'}
                {drawerMode === 'oauth-apple' && 'Configure Apple Sign-In'}
                {drawerMode === 'password' && 'Change Root Password'}
              </DrawerTitle>
              <DrawerCloseButton />
            </DrawerHeader>
            <DrawerBody>
              {/* S3 FORM */}
              {drawerMode === 's3' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={s3Form.file_s3_enabled === 'true'}
                    onChange={(checked) => setS3Form({ ...s3Form, file_s3_enabled: checked ? 'true' : 'false' })}
                  >
                    Enable S3 Object Storage
                  </Switch>
                  <TextField
                    label="S3 Bucket Name"
                    placeholder="e.g. my-app-bucket"
                    value={s3Form.file_s3_bucket}
                    onChange={(val) => setS3Form({ ...s3Form, file_s3_bucket: val })}
                    isRequired={s3Form.file_s3_enabled === 'true'}
                  />
                  <TextField
                    label="S3 Endpoint URL"
                    placeholder="e.g. s3.amazonaws.com or https://<id>.r2.cloudflarestorage.com"
                    value={s3Form.file_s3_endpoint}
                    onChange={(val) => setS3Form({ ...s3Form, file_s3_endpoint: val })}
                    description="Leave empty for standard AWS S3"
                  />
                  <TextField
                    label="S3 Region"
                    placeholder="e.g. us-east-1"
                    value={s3Form.file_s3_region}
                    onChange={(val) => setS3Form({ ...s3Form, file_s3_region: val })}
                  />
                  <TextField
                    label="S3 Access Key"
                    placeholder="e.g. AKIA..."
                    value={s3Form.file_s3_access_key}
                    onChange={(val) => setS3Form({ ...s3Form, file_s3_access_key: val })}
                  />
                  <TextField
                    label="S3 Secret Key"
                    type="password"
                    placeholder="••••••••"
                    value={s3Form.file_s3_secret_key}
                    onChange={(val) => setS3Form({ ...s3Form, file_s3_secret_key: val })}
                  />
                  <Switch
                    isSelected={s3Form.file_s3_force_path_style === 'true'}
                    onChange={(checked) =>
                      setS3Form({ ...s3Form, file_s3_force_path_style: checked ? 'true' : 'false' })
                    }
                  >
                    Force Path Style (Required for MinIO / Local emulators)
                  </Switch>
                </div>
              )}

              {/* LITESTREAM FORM */}
              {drawerMode === 'litestream' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={litestreamForm.litestream_enabled === 'true'}
                    onChange={(checked) =>
                      setLitestreamForm({ ...litestreamForm, litestream_enabled: checked ? 'true' : 'false' })
                    }
                  >
                    Enable Litestream SQLite Continuous Replication
                  </Switch>
                  <TextField
                    label="Backup S3 Bucket"
                    placeholder="e.g. my-sqlite-backups"
                    value={litestreamForm.litestream_s3_bucket}
                    onChange={(val) => setLitestreamForm({ ...litestreamForm, litestream_s3_bucket: val })}
                    isRequired={litestreamForm.litestream_enabled === 'true'}
                  />
                  <TextField
                    label="Replica Destination Path"
                    placeholder="e.g. s3://my-sqlite-backups/prod-replica"
                    value={litestreamForm.litestream_replica_path}
                    onChange={(val) => setLitestreamForm({ ...litestreamForm, litestream_replica_path: val })}
                  />
                  <TextField
                    label="S3 Endpoint"
                    placeholder="e.g. s3.amazonaws.com"
                    value={litestreamForm.litestream_s3_endpoint}
                    onChange={(val) => setLitestreamForm({ ...litestreamForm, litestream_s3_endpoint: val })}
                    description="Leave empty for AWS S3 standard"
                  />
                  <TextField
                    label="S3 Region"
                    placeholder="e.g. us-east-1"
                    value={litestreamForm.litestream_s3_region}
                    onChange={(val) => setLitestreamForm({ ...litestreamForm, litestream_s3_region: val })}
                  />
                  <TextField
                    label="Access Key ID"
                    placeholder="e.g. AKIA..."
                    value={litestreamForm.litestream_access_key_id}
                    onChange={(val) => setLitestreamForm({ ...litestreamForm, litestream_access_key_id: val })}
                  />
                  <TextField
                    label="Secret Access Key"
                    type="password"
                    placeholder="••••••••"
                    value={litestreamForm.litestream_secret_access_key}
                    onChange={(val) => setLitestreamForm({ ...litestreamForm, litestream_secret_access_key: val })}
                  />
                  <Switch
                    isSelected={litestreamForm.litestream_s3_force_path_style === 'true'}
                    onChange={(checked) =>
                      setLitestreamForm({
                        ...litestreamForm,
                        litestream_s3_force_path_style: checked ? 'true' : 'false',
                      })
                    }
                  >
                    Force Path Style (MinIO)
                  </Switch>
                </div>
              )}

              {/* RATE LIMIT FORM */}
              {(drawerMode === 'ratelimit-add' || drawerMode === 'ratelimit-edit') && (
                <div {...stylex.props(styles.drawerForm)}>
                  <TextField
                    label="Rule Pattern / Label"
                    placeholder="e.g. *:auth, /api/batch, users:list"
                    value={rateLimitForm.label}
                    onChange={(val) => setRateLimitForm({ ...rateLimitForm, label: val })}
                    description="Use *:auth for all authentication actions or specify exact API paths."
                    isRequired
                  />
                  <TextField
                    label="Max Requests (per IP)"
                    type="number"
                    placeholder="10"
                    value={String(rateLimitForm.max_requests)}
                    onChange={(val) => setRateLimitForm({ ...rateLimitForm, max_requests: Number(val) })}
                    isRequired
                  />
                  <TextField
                    label="Interval Window (seconds)"
                    type="number"
                    placeholder="3"
                    value={String(rateLimitForm.interval)}
                    onChange={(val) => setRateLimitForm({ ...rateLimitForm, interval: Number(val) })}
                    isRequired
                  />
                  <Select
                    label="Target Audience"
                    selectedKey={rateLimitForm.targeted_users}
                    onSelectionChange={(key) =>
                      setRateLimitForm({ ...rateLimitForm, targeted_users: String(key) })
                    }
                  >
                    <SelectItem id="all" textValue="All Users (all)">
                      All Users (all)
                    </SelectItem>
                    <SelectItem id="authenticated" textValue="Authenticated Only (authenticated)">
                      Authenticated Only (authenticated)
                    </SelectItem>
                    <SelectItem id="guest" textValue="Guests Only (guest)">
                      Guests Only (guest)
                    </SelectItem>
                  </Select>
                </div>
              )}

              {/* ROOT USER IPS FORM */}
              {drawerMode === 'rootips' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={rootIPsForm.root_user_ip_enabled === 'true'}
                    onChange={(checked) =>
                      setRootIPsForm({ ...rootIPsForm, root_user_ip_enabled: checked ? 'true' : 'false' })
                    }
                  >
                    Enforce IP Restrictions on Root Logins
                  </Switch>
                  <TextArea
                    label="Allowed IP Addresses & Subnets"
                    placeholder="e.g. 127.0.0.1, 192.168.1.0/24, 10.0.0.0/8"
                    value={rootIPsForm.root_user_allowed_ips}
                    onChange={(val) => setRootIPsForm({ ...rootIPsForm, root_user_allowed_ips: val })}
                    description="Comma-separated list of valid IPv4, IPv6, and CIDR subnet notations."
                    rows={4}
                  />
                </div>
              )}

              {/* EMAIL FORM */}
              {drawerMode === 'email' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={emailForm.email_enabled === 'true'}
                    onChange={(checked) =>
                      setEmailForm({ ...emailForm, email_enabled: checked ? 'true' : 'false' })
                    }
                  >
                    Enable Transactional Email Delivery
                  </Switch>
                  <Select
                    label="Email Delivery Provider"
                    selectedKey={emailForm.email_provider}
                    onSelectionChange={(key) => setEmailForm({ ...emailForm, email_provider: String(key) })}
                  >
                    <SelectItem id="console" textValue="Console (Local Dev / Stdout)">
                      Console (Local Dev / Stdout)
                    </SelectItem>
                    <SelectItem id="ses" textValue="Amazon SES">
                      Amazon SES
                    </SelectItem>
                    <SelectItem id="resend" textValue="Resend">
                      Resend
                    </SelectItem>
                    <SelectItem id="mailgun" textValue="Mailgun">
                      Mailgun
                    </SelectItem>
                    <SelectItem id="sendgrid" textValue="SendGrid">
                      SendGrid
                    </SelectItem>
                    <SelectItem id="cloudflare" textValue="Cloudflare Email Workers">
                      Cloudflare Email Workers
                    </SelectItem>
                  </Select>
                  <TextField
                    label="From Address"
                    type="email"
                    placeholder="noreply@example.com"
                    value={emailForm.email_from_address}
                    onChange={(val) => setEmailForm({ ...emailForm, email_from_address: val })}
                    isRequired={emailForm.email_enabled === 'true'}
                  />
                  <TextField
                    label="From Sender Name"
                    placeholder="e.g. Moul Engine"
                    value={emailForm.email_from_name}
                    onChange={(val) => setEmailForm({ ...emailForm, email_from_name: val })}
                  />
                  <TextField
                    label="API Key / AWS Access Key ID"
                    placeholder="API key or access key"
                    value={emailForm.email_api_key}
                    onChange={(val) => setEmailForm({ ...emailForm, email_api_key: val })}
                  />
                  <TextField
                    label="API Secret / AWS Secret Key"
                    type="password"
                    placeholder="••••••••"
                    value={emailForm.email_api_secret}
                    onChange={(val) => setEmailForm({ ...emailForm, email_api_secret: val })}
                  />
                  <TextField
                    label="Domain / Account ID"
                    placeholder="Domain for Mailgun or Account ID for Cloudflare"
                    value={emailForm.email_domain}
                    onChange={(val) => setEmailForm({ ...emailForm, email_domain: val })}
                  />
                  <TextField
                    label="Region"
                    placeholder="e.g. us-east-1 or eu"
                    value={emailForm.email_region}
                    onChange={(val) => setEmailForm({ ...emailForm, email_region: val })}
                  />
                  <TextField
                    label="Custom Endpoint / Cloudflare Worker URL"
                    placeholder="Optional custom endpoint or Cloudflare worker URL"
                    value={emailForm.email_endpoint}
                    onChange={(val) => setEmailForm({ ...emailForm, email_endpoint: val })}
                  />
                </div>
              )}

              {/* OAUTH GLOBAL FORM */}
              {drawerMode === 'oauth-global' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <TextField
                    label="Global OAuth Redirect URL"
                    placeholder="e.g. http://localhost:8090/api/oauth2/callback"
                    value={oauthGlobalForm.oauth_redirect_url}
                    onChange={(val) => setOAuthGlobalForm({ ...oauthGlobalForm, oauth_redirect_url: val })}
                    description="The shared redirect callback URL configured across external OAuth applications."
                    isRequired
                  />
                </div>
              )}

              {/* OAUTH GITHUB FORM */}
              {drawerMode === 'oauth-github' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={oauthGitHubForm.oauth_github_enabled === 'true'}
                    onChange={(checked) =>
                      setOAuthGitHubForm({
                        ...oauthGitHubForm,
                        oauth_github_enabled: checked ? 'true' : 'false',
                      })
                    }
                  >
                    Enable GitHub OAuth2 Login
                  </Switch>
                  <TextField
                    label="GitHub Client ID"
                    placeholder="GitHub OAuth App Client ID"
                    value={oauthGitHubForm.oauth_github_client_id}
                    onChange={(val) => setOAuthGitHubForm({ ...oauthGitHubForm, oauth_github_client_id: val })}
                    isRequired={oauthGitHubForm.oauth_github_enabled === 'true'}
                  />
                  <TextField
                    label="GitHub Client Secret"
                    type="password"
                    placeholder="••••••••"
                    value={oauthGitHubForm.oauth_github_client_secret}
                    onChange={(val) =>
                      setOAuthGitHubForm({ ...oauthGitHubForm, oauth_github_client_secret: val })
                    }
                    isRequired={oauthGitHubForm.oauth_github_enabled === 'true'}
                  />
                </div>
              )}

              {/* OAUTH GOOGLE FORM */}
              {drawerMode === 'oauth-google' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={oauthGoogleForm.oauth_google_enabled === 'true'}
                    onChange={(checked) =>
                      setOAuthGoogleForm({
                        ...oauthGoogleForm,
                        oauth_google_enabled: checked ? 'true' : 'false',
                      })
                    }
                  >
                    Enable Google OAuth2 Login
                  </Switch>
                  <TextField
                    label="Google Client ID"
                    placeholder="Google Cloud Client ID"
                    value={oauthGoogleForm.oauth_google_client_id}
                    onChange={(val) => setOAuthGoogleForm({ ...oauthGoogleForm, oauth_google_client_id: val })}
                    isRequired={oauthGoogleForm.oauth_google_enabled === 'true'}
                  />
                  <TextField
                    label="Google Client Secret"
                    type="password"
                    placeholder="••••••••"
                    value={oauthGoogleForm.oauth_google_client_secret}
                    onChange={(val) =>
                      setOAuthGoogleForm({ ...oauthGoogleForm, oauth_google_client_secret: val })
                    }
                    isRequired={oauthGoogleForm.oauth_google_enabled === 'true'}
                  />
                </div>
              )}

              {/* OAUTH APPLE FORM */}
              {drawerMode === 'oauth-apple' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <Switch
                    isSelected={oauthAppleForm.oauth_apple_enabled === 'true'}
                    onChange={(checked) =>
                      setOAuthAppleForm({
                        ...oauthAppleForm,
                        oauth_apple_enabled: checked ? 'true' : 'false',
                      })
                    }
                  >
                    Enable Apple Sign-In
                  </Switch>
                  <TextField
                    label="Apple Service / Client ID"
                    placeholder="e.g. com.example.app.service"
                    value={oauthAppleForm.oauth_apple_client_id}
                    onChange={(val) => setOAuthAppleForm({ ...oauthAppleForm, oauth_apple_client_id: val })}
                    isRequired={oauthAppleForm.oauth_apple_enabled === 'true'}
                  />
                  <TextField
                    label="Apple Client Secret (or Pre-signed JWT)"
                    type="password"
                    placeholder="••••••••"
                    value={oauthAppleForm.oauth_apple_client_secret}
                    onChange={(val) =>
                      setOAuthAppleForm({ ...oauthAppleForm, oauth_apple_client_secret: val })
                    }
                  />
                  <TextField
                    label="Apple Team ID"
                    placeholder="e.g. DEF456GHIJ"
                    value={oauthAppleForm.oauth_apple_team_id}
                    onChange={(val) => setOAuthAppleForm({ ...oauthAppleForm, oauth_apple_team_id: val })}
                  />
                  <TextField
                    label="Apple Key ID"
                    placeholder="e.g. ABC123DEFG"
                    value={oauthAppleForm.oauth_apple_key_id}
                    onChange={(val) => setOAuthAppleForm({ ...oauthAppleForm, oauth_apple_key_id: val })}
                  />
                  <TextArea
                    label="Apple Private Key (.p8)"
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    value={oauthAppleForm.oauth_apple_private_key}
                    onChange={(val) => setOAuthAppleForm({ ...oauthAppleForm, oauth_apple_private_key: val })}
                    rows={4}
                  />
                </div>
              )}

              {/* ROOT PASSWORD FORM */}
              {drawerMode === 'password' && (
                <div {...stylex.props(styles.drawerForm)}>
                  <TextField
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(val) => setPasswordForm({ ...passwordForm, currentPassword: val })}
                    isRequired
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(val) => setPasswordForm({ ...passwordForm, newPassword: val })}
                    description="Minimum 8 characters (1 uppercase, 1 lowercase, 1 digit)"
                    isRequired
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.passwordConfirm}
                    onChange={(val) => setPasswordForm({ ...passwordForm, passwordConfirm: val })}
                    isRequired
                  />
                </div>
              )}
            </DrawerBody>
            <DrawerFooter>
              <Button variant="ghost" onPress={closeDrawer}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveDrawer}
                isDisabled={updateMutation.isPending || updatePasswordMutation.isPending}
              >
                {updateMutation.isPending || updatePasswordMutation.isPending
                  ? 'Saving...'
                  : drawerMode === 'password'
                  ? 'Update Password'
                  : 'Save Settings'}
              </Button>
            </DrawerFooter>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>

      {/* CONFIRM DELETE RULE MODAL */}
      <ModalOverlay
        isOpen={ruleToDelete !== null}
        onOpenChange={(open: boolean) => !open && setRuleToDelete(null)}
        isDismissable
      >
        <Modal size="sm">
          <ModalDialog>
            <ModalHeader>
              <h3 style={{ margin: 0, fontSize: tokens.fontSizeLg, fontWeight: 600, color: tokens.colorFg }}>
                Delete Rate Limit Rule
              </h3>
            </ModalHeader>
            <ModalBody>
              <p style={{ margin: 0, color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
                Are you sure you want to delete the rate limit rule for <strong>&ldquo;{ruleToDelete?.label}&rdquo;</strong>? This change will take effect immediately.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onPress={() => setRuleToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onPress={confirmDeleteRule}>
                Delete Rule
              </Button>
            </ModalFooter>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}



