/**
 * Locality dataset loader and cache
 * Source of truth: docs/roles/MEMBER_1_BACKEND.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { LocalitySchema, type Locality } from '../shared/contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_LOCALITIES_PATH = path.resolve(__dirname, '../shared/localities.faridabad.json');

let cachedLocalities: Locality[] | null = null;

export function loadLocalities(customPath?: string): Locality[] {
  const filePath = customPath || DEFAULT_LOCALITIES_PATH;
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return z.array(LocalitySchema).parse(parsed);
}

export function getLocalities(): Locality[] {
  if (!cachedLocalities) {
    cachedLocalities = loadLocalities();
  }
  return cachedLocalities;
}

export function setCachedLocalities(localities: Locality[] | null): void {
  cachedLocalities = localities;
}
