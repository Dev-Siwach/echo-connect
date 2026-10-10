/**
 * Content loader and checklists provider
 * Validates against ContentSchema and verifies complete taxonomy coverage
 * Source of truth: docs/DECISIONS.md ADR-014, docs/roles/MEMBER_1_BACKEND.md Step 2
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentSchema, type Content } from '../shared/contracts.js';
import {
  ITEM_TYPES,
  UNSUPPORTED_REASONS,
  type ItemType,
  type UnsupportedReason,
} from '../shared/taxonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CONTENT_PATH = path.resolve(__dirname, '../shared/content.json');

let cachedContent: Content | null = null;

/**
 * Loads, validates and asserts completeness of content.json
 */
export function loadContent(customPath?: string): Content {
  const filePath = customPath || DEFAULT_CONTENT_PATH;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Content file not found at: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in content file at ${filePath}: ${err}`);
  }

  const content = ContentSchema.parse(json);

  // Assert every single item type has a checklist entry
  for (const itemType of ITEM_TYPES) {
    if (!content.checklists[itemType]) {
      throw new Error(`Missing prep checklist for item type: "${itemType}" in ${filePath}`);
    }
  }

  // Assert every single unsupported reason has a message
  for (const reason of UNSUPPORTED_REASONS) {
    if (!content.unsupportedMessages[reason]) {
      throw new Error(
        `Missing unsupported message for reason: "${reason}" in ${filePath}`
      );
    }
  }

  return content;
}

/**
 * Returns cached content, loading it if necessary
 */
export function getContent(): Content {
  if (!cachedContent) {
    cachedContent = loadContent();
  }
  return cachedContent;
}

/**
 * For testing: resets or overrides the cached content
 */
export function setCachedContent(content: Content | null): void {
  cachedContent = content;
}

/**
 * Retrieves preparation checklist for an item type
 */
export function getChecklist(itemType: ItemType): string[] {
  const content = getContent();
  const list = content.checklists[itemType];
  if (!list) {
    throw new Error(`No checklist configured for item type: ${itemType}`);
  }
  return list;
}

/**
 * Retrieves message for an unsupported reason
 */
export function getUnsupportedMessage(reason: UnsupportedReason): string {
  const content = getContent();
  const msg = content.unsupportedMessages[reason];
  if (!msg) {
    throw new Error(`No message configured for unsupported reason: ${reason}`);
  }
  return msg;
}

/**
 * Retrieves empty state message
 */
export function getEmptyStateMessage(): string {
  return getContent().emptyStateMessage;
}
