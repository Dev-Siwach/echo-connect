import { describe, it, expect, beforeEach } from 'vitest';
import {
  getChecklist,
  getUnsupportedMessage,
  getEmptyStateMessage,
  loadContent,
  setCachedContent,
} from '../src/lib/checklists.js';
import { ITEM_TYPES, UNSUPPORTED_REASONS } from '../src/shared/taxonomy.js';
import type { Content } from '../src/shared/contracts.js';

describe('Checklists & Content Loader', () => {
  beforeEach(() => {
    // Reset cache before each test
    setCachedContent(null);
  });

  it('loads default shared/content.json successfully', () => {
    const content = loadContent();
    expect(content).toBeDefined();
    expect(content.emptyStateMessage.length).toBeGreaterThan(0);
  });

  it('provides non-empty checklists for all 10 item types', () => {
    for (const itemType of ITEM_TYPES) {
      const list = getChecklist(itemType);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('provides messages for all 4 unsupported reasons', () => {
    for (const reason of UNSUPPORTED_REASONS) {
      const msg = getUnsupportedMessage(reason);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it('provides the empty state message', () => {
    const msg = getEmptyStateMessage();
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('fails loudly when an item type is missing from the checklists', () => {
    const incompleteContent = {
      checklists: {
        phone_tablet: ['Check 1'],
        // other 9 item types missing
      },
      unsupportedMessages: {
        large_appliance: 'Msg',
        hazardous: 'Msg',
        out_of_scope: 'Msg',
        unclear: 'Msg',
      },
      emptyStateMessage: 'Empty',
    } as unknown as Content;

    setCachedContent(incompleteContent);
    expect(() => getChecklist('computer_display')).toThrow(
      'No checklist configured for item type: computer_display'
    );
  });
});
