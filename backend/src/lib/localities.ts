/**
 * Locality dataset loader and cache
 * Source of truth: docs/roles/MEMBER_1_BACKEND.md
 */

import fs from 'node:fs';
import defaultLocalitiesJson from '../shared/localities.faridabad.json' with { type: 'json' };
import { z } from 'zod';
import { LocalitySchema, type Locality } from '../shared/contracts.js';

let cachedLocalities: Locality[] | null = null;

export function loadLocalities(customPath?: string): Locality[] {
  let parsed: unknown;
  if (customPath) {
    if (!fs.existsSync(customPath)) {
      return [];
    }
    const raw = fs.readFileSync(customPath, 'utf8');
    parsed = JSON.parse(raw);
  } else {
    parsed = defaultLocalitiesJson;
  }
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
