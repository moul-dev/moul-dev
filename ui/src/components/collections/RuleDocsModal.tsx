import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ModalOverlay,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import {
  BookOpenIcon,
  CopyIcon,
  CheckIcon,
  LockKeyIcon,
  CodeIcon,
  SparkleIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';

const styles = stylex.create({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    fontSize: tokens.fontSizeLg,
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    margin: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing5,
    maxHeight: '68vh',
    overflowY: 'auto',
    paddingRight: tokens.spacing1,
  },
  introText: {
    fontSize: tokens.fontSizeSm,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: 1.5,
    margin: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
  sectionHeading: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    margin: 0,
  },
  tableWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    borderRadius: tokens.radiusMd,
    overflow: 'hidden',
    backgroundColor: tokens.colorBgElevated,
  },
  docTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: tokens.fontSizeXs,
    fontFamily: tokens.fontFamilyBase,
  },
  docTh: {
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgSubtle,
    color: tokens.colorFgSubtle,
    fontWeight: 600,
    textAlign: 'left',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorBorder,
  },
  docTd: {
    padding: tokens.spacing2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorBorderSubtle,
    color: tokens.colorFg,
    verticalAlign: 'middle',
  },
  codeTag: {
    fontFamily: 'var(--font-mono, monospace)',
    backgroundColor: tokens.colorBgSubtle,
    paddingBlock: '2px',
    paddingInline: tokens.spacing2,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    color: tokens.colorPrimary500,
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: tokens.spacing2,
  },
  presetCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing3,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    backgroundColor: tokens.colorBgElevated,
    gap: tokens.spacing3,
  },
  presetInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
  },
  presetTitle: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  presetDesc: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: 1.4,
  },
  presetCodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    marginTop: tokens.spacing1,
  },
  presetCode: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: tokens.fontSizeXs,
    color: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgSubtle,
    paddingBlock: '2px',
    paddingInline: tokens.spacing2,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    wordBreak: 'break-all',
  },
  presetActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    flexShrink: 0,
  },
});

interface RuleDocsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPreset?: (presetRule: string) => void;
}

const PRESETS = [
  {
    title: 'Public Access',
    desc: 'Anyone can query or execute without logging in. Leave rule empty.',
    code: '',
    badge: 'Public',
    badgeVariant: 'neutral' as const,
  },
  {
    title: 'Signed-In Users Only',
    desc: 'Requires a valid login token from any registered user.',
    code: '@request.auth.id != ""',
    badge: 'Authenticated',
    badgeVariant: 'primary' as const,
  },
  {
    title: 'Author / Owner Only',
    desc: 'Only the user who owns the record can view, edit, or delete it.',
    code: 'user_id = @request.auth.id',
    badge: 'Ownership',
    badgeVariant: 'success' as const,
  },
  {
    title: 'User Profile Self-Access',
    desc: 'For users collections, allows users to view or update only their own profile.',
    code: 'id = @request.auth.id',
    badge: 'Self Profile',
    badgeVariant: 'success' as const,
  },
  {
    title: 'Administrators Only',
    desc: 'Restricts access exclusively to users with role="admin".',
    code: '@request.auth.role = "admin"',
    badge: 'Admins Only',
    badgeVariant: 'warning' as const,
  },
  {
    title: 'Published or Creator',
    desc: 'Visitors can view published items, while creators can view/edit their own drafts.',
    code: 'status = "published" || author_id = @request.auth.id',
    badge: 'Visibility',
    badgeVariant: 'primary' as const,
  },
  {
    title: 'Cross-Table Role Lookup',
    desc: 'Checks whether the requesting user has permission in another table.',
    code: '@collection.user_roles.user_id = @request.auth.id && @collection.user_roles.role = "admin"',
    badge: 'Relational Join',
    badgeVariant: 'warning' as const,
  },
];

export function RuleDocsModal({ isOpen, onOpenChange, onApplyPreset }: RuleDocsModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toastQueue.add({
      title: 'Rule Copied',
      description: `Rule for "${label}" copied to clipboard.`,
      variant: 'success',
    });
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
      <Modal size="lg">
        <ModalDialog>
          <ModalHeader>
            <div {...stylex.props(styles.header)}>
              <h2 {...stylex.props(styles.headerTitle)}>
                <BookOpenIcon size={20} color={tokens.colorPrimary500} />
                <span>API Access Rules Reference</span>
              </h2>
            </div>
          </ModalHeader>

          <ModalBody>
            <div {...stylex.props(styles.content)}>
              <p {...stylex.props(styles.introText)}>
                Access rules determine who can read, create, update, and delete records through the API.
                Leave any rule <strong>empty</strong> for open public access, or use the expressions below to restrict access.
              </p>

              {/* 1. Common Presets */}
              <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionHeading)}>
                  <SparkleIcon size={16} color={tokens.colorPrimary500} />
                  <span>Popular Setups</span>
                </h3>
                <div {...stylex.props(styles.presetGrid)}>
                  {PRESETS.map((preset, i) => (
                    <div key={i} {...stylex.props(styles.presetCard)}>
                      <div {...stylex.props(styles.presetInfo)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                          <span {...stylex.props(styles.presetTitle)}>{preset.title}</span>
                          <Badge variant={preset.badgeVariant}>
                            {preset.badge}
                          </Badge>
                        </div>
                        <span {...stylex.props(styles.presetDesc)}>{preset.desc}</span>
                        <div {...stylex.props(styles.presetCodeRow)}>
                          <code {...stylex.props(styles.presetCode)}>
                            {preset.code ? preset.code : '<Empty — Public Access>'}
                          </code>
                        </div>
                      </div>

                      <div {...stylex.props(styles.presetActions)}>
                        <Button
                          variant="outline"
                          aria-label={`Copy rule: ${preset.title}`}
                          onPress={() => handleCopy(preset.code, preset.title)}
                        >
                          {copiedCode === preset.code ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                          <span>{copiedCode === preset.code ? 'Copied' : 'Copy'}</span>
                        </Button>
                        {onApplyPreset && (
                          <Button
                            variant="secondary"
                            onPress={() => {
                              onApplyPreset(preset.code);
                              onOpenChange(false);
                            }}
                          >
                            <ArrowRightIcon size={16} />
                            <span>Apply</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. User & Request Variables */}
              <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionHeading)}>
                  <LockKeyIcon size={16} color={tokens.colorPrimary500} />
                  <span>User & Request Variables</span>
                </h3>
                <div {...stylex.props(styles.tableWrapper)}>
                  <table {...stylex.props(styles.docTable)}>
                    <thead>
                      <tr>
                        <th {...stylex.props(styles.docTh)}>Variable</th>
                        <th {...stylex.props(styles.docTh)}>Description</th>
                        <th {...stylex.props(styles.docTh)}>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@request.auth.id</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>ID of current logged-in user</td>
                        <td {...stylex.props(styles.docTd)}>
                          <code>@request.auth.id != ""</code>
                        </td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@request.auth.email</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Email of logged-in user</td>
                        <td {...stylex.props(styles.docTd)}>
                          <code>@request.auth.email ~ "@company.com"</code>
                        </td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@request.auth.role</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Role field of the logged-in user</td>
                        <td {...stylex.props(styles.docTd)}>
                          <code>@request.auth.role = "admin"</code>
                        </td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@request.body.&lt;field&gt;</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Incoming request body value during create or update</td>
                        <td {...stylex.props(styles.docTd)}>
                          <code>@request.body.status = "draft"</code>
                        </td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@request.headers.&lt;name&gt;</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>HTTP request header</td>
                        <td {...stylex.props(styles.docTd)}>
                          <code>@request.headers.x_api_version = "v1"</code>
                        </td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@request.query.&lt;name&gt;</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>URL query parameter</td>
                        <td {...stylex.props(styles.docTd)}>
                          <code>@request.query.preview = "true"</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Operators & Functions */}
              <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionHeading)}>
                  <CodeIcon size={16} color={tokens.colorPrimary500} />
                  <span>Operators & Functions</span>
                </h3>
                <div {...stylex.props(styles.tableWrapper)}>
                  <table {...stylex.props(styles.docTable)}>
                    <thead>
                      <tr>
                        <th {...stylex.props(styles.docTh)}>Syntax</th>
                        <th {...stylex.props(styles.docTh)}>Description</th>
                        <th {...stylex.props(styles.docTh)}>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>=, !=, &gt;, &lt;, &gt;=, &lt;=</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Standard equality and comparison</td>
                        <td {...stylex.props(styles.docTd)}><code>price &gt;= 10</code></td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>~, !~</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Text contains or does not contain</td>
                        <td {...stylex.props(styles.docTd)}><code>title ~ "announcement"</code></td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>&&, ||, !</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>AND, OR, NOT logical operators</td>
                        <td {...stylex.props(styles.docTd)}><code>status = "active" && !archived</code></td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>?=</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Array contains element</td>
                        <td {...stylex.props(styles.docTd)}><code>tags ?= "featured"</code></td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>@collection.&lt;table&gt;.&lt;field&gt;</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Look up relation in another table</td>
                        <td {...stylex.props(styles.docTd)}><code>@collection.members.user_id = @request.auth.id</code></td>
                      </tr>
                      <tr>
                        <td {...stylex.props(styles.docTd)}>
                          <code {...stylex.props(styles.codeTag)}>geoDistance(lon1, lat1, lon2, lat2)</code>
                        </td>
                        <td {...stylex.props(styles.docTd)}>Calculates geographical distance (km)</td>
                        <td {...stylex.props(styles.docTd)}><code>geoDistance(lon, lat, 104.9, 11.5) &lt; 50</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="primary" onPress={() => onOpenChange(false)}>
              Close Reference
            </Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    </ModalOverlay>
  );
}
