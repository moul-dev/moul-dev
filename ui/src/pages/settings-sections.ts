// The settings drawers that edit plain `/api/settings` keys, described as data: each field is
// one key, rendered by the settings page's form. Switches store 'true' / 'false' strings, as the
// API does.

export type SettingsDrawer =
  | 's3'
  | 'litestream'
  | 'rootips'
  | 'email'
  | 'oauth-global'
  | 'oauth-github'
  | 'oauth-google'
  | 'oauth-apple';

export interface SettingField {
  key: string;
  label: string;
  kind: 'switch' | 'text' | 'email' | 'password' | 'textarea' | 'select';
  placeholder?: string;
  description?: string;
  /** Required always (`true`) or while the switch with this key is on. */
  required?: true | string;
  options?: { key: string; label: string }[];
  /** Value when the setting has never been saved. */
  fallback?: string;
}

export interface SettingsSection {
  title: string;
  fields: SettingField[];
}

export const SETTINGS_SECTIONS: Record<SettingsDrawer, SettingsSection> = {
  s3: {
    title: 'Configure S3 Object Storage',
    fields: [
      { key: 'file_s3_enabled', label: 'Enable S3 Object Storage', kind: 'switch' },
      { key: 'file_s3_bucket', label: 'S3 Bucket Name', kind: 'text', placeholder: 'e.g. my-app-bucket', required: 'file_s3_enabled' },
      {
        key: 'file_s3_endpoint',
        label: 'S3 Endpoint URL',
        kind: 'text',
        placeholder: 'e.g. s3.amazonaws.com or https://<id>.r2.cloudflarestorage.com',
        description: 'Leave empty for standard AWS S3',
      },
      { key: 'file_s3_region', label: 'S3 Region', kind: 'text', placeholder: 'e.g. us-east-1' },
      { key: 'file_s3_access_key', label: 'S3 Access Key', kind: 'text', placeholder: 'e.g. AKIA...' },
      { key: 'file_s3_secret_key', label: 'S3 Secret Key', kind: 'password', placeholder: '••••••••' },
      { key: 'file_s3_force_path_style', label: 'Force Path Style (Required for MinIO / Local emulators)', kind: 'switch' },
    ],
  },
  litestream: {
    title: 'Configure Litestream Backups',
    fields: [
      { key: 'litestream_enabled', label: 'Enable Litestream SQLite Continuous Replication', kind: 'switch' },
      {
        key: 'litestream_s3_bucket',
        label: 'Backup S3 Bucket',
        kind: 'text',
        placeholder: 'e.g. my-sqlite-backups',
        required: 'litestream_enabled',
      },
      {
        key: 'litestream_replica_path',
        label: 'Replica Destination Path',
        kind: 'text',
        placeholder: 'e.g. s3://my-sqlite-backups/prod-replica',
      },
      {
        key: 'litestream_s3_endpoint',
        label: 'S3 Endpoint',
        kind: 'text',
        placeholder: 'e.g. s3.amazonaws.com',
        description: 'Leave empty for AWS S3 standard',
      },
      { key: 'litestream_s3_region', label: 'S3 Region', kind: 'text', placeholder: 'e.g. us-east-1' },
      { key: 'litestream_access_key_id', label: 'Access Key ID', kind: 'text', placeholder: 'e.g. AKIA...' },
      { key: 'litestream_secret_access_key', label: 'Secret Access Key', kind: 'password', placeholder: '••••••••' },
      { key: 'litestream_s3_force_path_style', label: 'Force Path Style (MinIO)', kind: 'switch' },
    ],
  },
  rootips: {
    title: 'Configure Root User IP Whitelist',
    fields: [
      { key: 'root_user_ip_enabled', label: 'Enforce IP Restrictions on Root Logins', kind: 'switch' },
      {
        key: 'root_user_allowed_ips',
        label: 'Allowed IP Addresses & Subnets',
        kind: 'textarea',
        placeholder: 'e.g. 127.0.0.1, 192.168.1.0/24, 10.0.0.0/8',
        description: 'Comma-separated list of valid IPv4, IPv6, and CIDR subnet notations.',
      },
    ],
  },
  email: {
    title: 'Configure Transactional Email',
    fields: [
      { key: 'email_enabled', label: 'Enable Transactional Email Delivery', kind: 'switch' },
      {
        key: 'email_provider',
        label: 'Email Delivery Provider',
        kind: 'select',
        fallback: 'console',
        options: [
          { key: 'console', label: 'Console (Local Dev / Stdout)' },
          { key: 'ses', label: 'Amazon SES' },
          { key: 'resend', label: 'Resend' },
          { key: 'mailgun', label: 'Mailgun' },
          { key: 'sendgrid', label: 'SendGrid' },
          { key: 'cloudflare', label: 'Cloudflare Email Workers' },
        ],
      },
      { key: 'email_from_address', label: 'From Address', kind: 'email', placeholder: 'noreply@example.com', required: 'email_enabled' },
      { key: 'email_from_name', label: 'From Sender Name', kind: 'text', placeholder: 'e.g. Moul Engine' },
      { key: 'email_api_key', label: 'API Key / AWS Access Key ID', kind: 'text', placeholder: 'API key or access key' },
      { key: 'email_api_secret', label: 'API Secret / AWS Secret Key', kind: 'password', placeholder: '••••••••' },
      { key: 'email_domain', label: 'Domain / Account ID', kind: 'text', placeholder: 'Domain for Mailgun or Account ID for Cloudflare' },
      { key: 'email_region', label: 'Region', kind: 'text', placeholder: 'e.g. us-east-1 or eu' },
      {
        key: 'email_endpoint',
        label: 'Custom Endpoint / Cloudflare Worker URL',
        kind: 'text',
        placeholder: 'Optional custom endpoint or Cloudflare worker URL',
      },
    ],
  },
  'oauth-global': {
    title: 'Configure OAuth Callback URL',
    fields: [
      {
        key: 'oauth_redirect_url',
        label: 'Global OAuth Redirect URL',
        kind: 'text',
        placeholder: 'e.g. http://localhost:8090/api/oauth2/callback',
        description: 'The shared redirect callback URL configured across external OAuth applications.',
        required: true,
      },
    ],
  },
  'oauth-github': {
    title: 'Configure GitHub OAuth2',
    fields: [
      { key: 'oauth_github_enabled', label: 'Enable GitHub OAuth2 Login', kind: 'switch' },
      {
        key: 'oauth_github_client_id',
        label: 'GitHub Client ID',
        kind: 'text',
        placeholder: 'GitHub OAuth App Client ID',
        required: 'oauth_github_enabled',
      },
      {
        key: 'oauth_github_client_secret',
        label: 'GitHub Client Secret',
        kind: 'password',
        placeholder: '••••••••',
        required: 'oauth_github_enabled',
      },
    ],
  },
  'oauth-google': {
    title: 'Configure Google OAuth2',
    fields: [
      { key: 'oauth_google_enabled', label: 'Enable Google OAuth2 Login', kind: 'switch' },
      {
        key: 'oauth_google_client_id',
        label: 'Google Client ID',
        kind: 'text',
        placeholder: 'Google Cloud Client ID',
        required: 'oauth_google_enabled',
      },
      {
        key: 'oauth_google_client_secret',
        label: 'Google Client Secret',
        kind: 'password',
        placeholder: '••••••••',
        required: 'oauth_google_enabled',
      },
    ],
  },
  'oauth-apple': {
    title: 'Configure Apple Sign-In',
    fields: [
      { key: 'oauth_apple_enabled', label: 'Enable Apple Sign-In', kind: 'switch' },
      {
        key: 'oauth_apple_client_id',
        label: 'Apple Service / Client ID',
        kind: 'text',
        placeholder: 'e.g. com.example.app.service',
        required: 'oauth_apple_enabled',
      },
      { key: 'oauth_apple_client_secret', label: 'Apple Client Secret (or Pre-signed JWT)', kind: 'password', placeholder: '••••••••' },
      { key: 'oauth_apple_team_id', label: 'Apple Team ID', kind: 'text', placeholder: 'e.g. DEF456GHIJ' },
      { key: 'oauth_apple_key_id', label: 'Apple Key ID', kind: 'text', placeholder: 'e.g. ABC123DEFG' },
      {
        key: 'oauth_apple_private_key',
        label: 'Apple Private Key (.p8)',
        kind: 'textarea',
        placeholder: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
      },
    ],
  },
};

export function isRequired(field: SettingField, values: Record<string, string>): boolean {
  return field.required === true || (typeof field.required === 'string' && values[field.required] === 'true');
}

/** The first required field left empty, if any. */
export function firstMissing(section: SettingsSection, values: Record<string, string>): SettingField | undefined {
  return section.fields.find((f) => isRequired(f, values) && !String(values[f.key] ?? '').trim());
}

/** The drawer's starting values: saved settings, else each field's fallback ('false' for switches). */
export function initialValues(section: SettingsSection, saved: Record<string, string> | undefined): Record<string, string> {
  return Object.fromEntries(
    section.fields.map((f) => [f.key, saved?.[f.key] || f.fallback || (f.kind === 'switch' ? 'false' : '')]),
  );
}
