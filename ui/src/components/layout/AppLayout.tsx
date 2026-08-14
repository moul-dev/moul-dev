import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { colors, spacing } from '../../theme/tokens.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: colors.bgApp,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.xl,
    backgroundColor: colors.bgApp,
  },
});

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <div {...stylex.props(styles.main)}>
        <Header />
        <main {...stylex.props(styles.content)}>{children}</main>
      </div>
    </div>
  );
};
