import type { UserInfo } from '../../state/auth';

export interface NavLink {
  to: string;
  label: string;
  icon: string;
  /** Shown on the mobile "More" drawer cards. */
  description?: string;
}

export const platformNavLinks: NavLink[] = [
  { to: '/overview', label: 'Overview', icon: 'squares-four' },
  { to: '/collections', label: 'Collections', icon: 'database' },
  { to: '/realtime', label: 'Realtime Hub', icon: 'broadcast' },
  { to: '/analytics', label: 'Analytics', icon: 'chart-line-up' },
];

export const systemNavLinks: NavLink[] = [
  { to: '/workers', label: 'Worker Queue', icon: 'queue', description: 'Background tasks & jobs' },
  { to: '/flags', label: 'Feature Flags', icon: 'flag', description: 'Toggles & rollouts' },
  { to: '/settings', label: 'Settings', icon: 'gear', description: 'System config & keys' },
  { to: '/docs', label: 'API Reference', icon: 'book-open', description: 'OpenAPI & endpoints' },
];

export const allNavLinks = [...platformNavLinks, ...systemNavLinks];

export interface Identity {
  displayName: string;
  displayUsername: string;
  displayEmail: string;
  hasCustomName: boolean;
  /** `@user • email` or `email (@user)`, as shown under the name in account menus. */
  subtitle: string;
}

export function identityOf(user: UserInfo | null | undefined): Identity {
  const hasCustomName = Boolean(
    user?.name &&
      user.name.trim() !== '' &&
      user.name.trim().toLowerCase() !== user.username?.trim().toLowerCase(),
  );
  const displayUsername = user?.username || 'admin';
  const displayName = hasCustomName ? user!.name!.trim() : displayUsername;
  const displayEmail = user?.email || '';
  const subtitle = hasCustomName
    ? `@${displayUsername}${displayEmail ? ` • ${displayEmail}` : ''}`
    : displayEmail
      ? `${displayEmail} (@${displayUsername})`
      : `@${displayUsername}`;
  return { displayName, displayUsername, displayEmail, hasCustomName, subtitle };
}
