#!/usr/bin/env node

/**
 * sync-shared.mjs
 * Copies shared/ into backend/src/shared/ and web/src/shared/,
 * adding a generated header to TypeScript files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const SOURCE_DIR = path.resolve(REPO_ROOT, 'shared');
const TARGET_DIRS = [
  path.resolve(REPO_ROOT, 'backend', 'src', 'shared'),
  path.resolve(REPO_ROOT, 'web', 'src', 'shared'),
];

const TS_HEADER = `// GENERATED — DO NOT EDIT
// This file is generated from shared/ by scripts/sync-shared.mjs.
// Any direct changes will be overwritten.

`;

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(srcPath, 'utf8');
        const generatedContent = TS_HEADER + content;
        fs.writeFileSync(destPath, generatedContent, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

console.log(`[sync-shared] Syncing from ${SOURCE_DIR}...`);

for (const targetDir of TARGET_DIRS) {
  copyRecursive(SOURCE_DIR, targetDir);
  console.log(`[sync-shared] Synced to ${targetDir}`);
}

console.log('[sync-shared] Completed successfully.');
