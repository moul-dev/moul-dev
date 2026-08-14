import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import { BookOpen, ArrowSquareOut } from '@phosphor-icons/react';
import { colors, spacing, radii, fonts } from '../../theme/tokens.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    height: 'calc(100vh - 120px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    letterSpacing: '-0.025em',
  },
  iframeCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

export const Route = createFileRoute('/_auth/docs')({
  component: DocsPage,
});

function DocsPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>Interactive API Reference</h1>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Live OpenAPI / Scalar reference reflecting all active collections and endpoints.
          </span>
        </div>
        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          <span>Open Fullscreen</span>
          <ArrowSquareOut size={16} />
        </a>
      </div>

      <div {...stylex.props(styles.iframeCard)}>
        <iframe src="/docs" title="Moul API Docs" {...stylex.props(styles.iframe)} />
      </div>
    </div>
  );
}
