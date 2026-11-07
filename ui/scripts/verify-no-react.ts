#!/usr/bin/env bun
// Fails the console build when React, StyleX or a React-ecosystem package
// reappears in ui/package.json. Mirrors the guard in moul-dev/ui.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BANNED_EXACT = new Set([
  'react',
  'react-dom',
  'react-aria',
  'react-aria-components',
  'react-stately',
  '@lit/react',
  '@phosphor-icons/react',
  '@vitejs/plugin-react',
]);

const BANNED_PATTERNS = [
  /^react(-.*)?$/,
  /^@types\/react(-.*)?$/,
  /^@stylexjs\//,
  /^@tanstack\/react-/,
  /^@tanstack\/.*devtools/,
  /(-|\/)react$/,
];

const isBanned = (name: string) => BANNED_EXACT.has(name) || BANNED_PATTERNS.some((p) => p.test(name));

const manifest = JSON.parse(readFileSync(join(import.meta.dir, '..', 'package.json'), 'utf-8'));
const violations: string[] = [];
for (const block of ['dependencies', 'devDependencies', 'peerDependencies']) {
  for (const name of Object.keys(manifest[block] ?? {})) {
    if (isBanned(name)) violations.push(`  [${block}] ${name}`);
  }
}

if (violations.length > 0) {
  console.error('verify-no-react: ui/package.json lists disallowed packages:');
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('verify-no-react: no React, StyleX or React-ecosystem packages in ui/package.json');
