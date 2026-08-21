import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { Button, Card } from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
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
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    letterSpacing: '-0.025em',
  },
  iframeCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
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
        <Button
          variant="outline"
          onPress={() => window.open('/docs', '_blank')}
        >
          <span>Open Fullscreen</span>
          <ArrowSquareOut size={16} />
        </Button>
      </div>

      <Card variant="default" style={styles.iframeCard}>
        <iframe src="/docs" title="Moul API Docs" {...stylex.props(styles.iframe)} />
      </Card>
    </div>
  );
}

