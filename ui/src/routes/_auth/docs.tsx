import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { Button, Card } from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    height: 'calc(100vh - 120px)',
    maxWidth: 'var(--content-max-width, 1200px)',
    width: '100%',
    marginInlineStart: 0,
    marginInlineEnd: 'auto',
    boxSizing: 'border-box',
    transition: 'max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
  iframeWrapper: {
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
          <h1 {...stylex.props(styles.title)}>API Reference</h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Explore and test endpoints generated from your schema.
          </span>
        </div>
        <Button
          variant="outline"
          onPress={() => window.open('/docs', '_blank')}
        >
          <span>Open in new tab</span>
          <ArrowSquareOutIcon size={16} />
        </Button>
      </div>

      <div {...stylex.props(styles.iframeWrapper)}>
        <Card variant="glass">
          <iframe src="/docs" title="Moul API Docs" {...stylex.props(styles.iframe)} />
        </Card>
      </div>
    </div>
  );
}

