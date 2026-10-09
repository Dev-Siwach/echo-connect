import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  SearchResponseSchema,
  ProvidersResponseSchema,
  LocalitySchema,
  ContentSchema,
  SearchRequestSchema,
} from '../src/shared/contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHARED_DIR = path.resolve(__dirname, '../src/shared');
const FIXTURES_DIR = path.resolve(SHARED_DIR, 'fixtures');

function readJsonFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

describe('Shared Contracts & Fixtures', () => {
  describe('Fixtures validation', () => {
    it('validates search.multi-item.json against SearchResponseSchema', () => {
      const data = readJsonFile(path.join(FIXTURES_DIR, 'search.multi-item.json'));
      const parsed = SearchResponseSchema.parse(data);
      expect(parsed.results.length).toBeGreaterThanOrEqual(2);
      expect(parsed.meta.classifier).toBe('bedrock');

      // Verify all sample providers have isSample: true
      for (const res of parsed.results) {
        for (const route of res.routes) {
          for (const p of [...route.providers, ...route.unverifiedProviders]) {
            expect(p.isSample).toBe(true);
            expect(p.phone).toBe('+910000000000');
          }
        }
      }
    });

    it('validates search.unsupported-only.json against SearchResponseSchema', () => {
      const data = readJsonFile(path.join(FIXTURES_DIR, 'search.unsupported-only.json'));
      const parsed = SearchResponseSchema.parse(data);
      expect(parsed.interpretation.items).toHaveLength(0);
      expect(parsed.interpretation.unsupportedItems.length).toBeGreaterThan(0);
      expect(parsed.results).toHaveLength(0);
    });

    it('validates search.clarifying.json against SearchResponseSchema', () => {
      const data = readJsonFile(path.join(FIXTURES_DIR, 'search.clarifying.json'));
      const parsed = SearchResponseSchema.parse(data);
      expect(parsed.interpretation.clarifyingQuestion).toBeTruthy();
      expect(parsed.results).toHaveLength(0);
    });

    it('validates search.fallback.json against SearchResponseSchema', () => {
      const data = readJsonFile(path.join(FIXTURES_DIR, 'search.fallback.json'));
      const parsed = SearchResponseSchema.parse(data);
      expect(parsed.meta.classifier).toBe('fallback');
      expect(parsed.results.length).toBeGreaterThan(0);
    });

    it('validates search.no-providers.json against SearchResponseSchema', () => {
      const data = readJsonFile(path.join(FIXTURES_DIR, 'search.no-providers.json'));
      const parsed = SearchResponseSchema.parse(data);
      expect(parsed.results.length).toBeGreaterThan(0);
      for (const res of parsed.results) {
        for (const r of res.routes) {
          expect(r.providers).toHaveLength(0);
          expect(r.unverifiedProviders).toHaveLength(0);
        }
      }
    });

    it('validates providers.batteries.json against ProvidersResponseSchema', () => {
      const data = readJsonFile(path.join(FIXTURES_DIR, 'providers.batteries.json'));
      const parsed = ProvidersResponseSchema.parse(data);
      expect(parsed.providers.length).toBeGreaterThan(0);
      for (const p of [...parsed.providers, ...parsed.unverifiedProviders]) {
        expect(p.isSample).toBe(true);
      }
    });
  });

  describe('Placeholders validation', () => {
    it('validates shared/localities.faridabad.json against LocalitySchema array', () => {
      const data = readJsonFile(path.join(SHARED_DIR, 'localities.faridabad.json'));
      const parsed = z.array(LocalitySchema).parse(data);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('validates shared/content.json against ContentSchema', () => {
      const data = readJsonFile(path.join(SHARED_DIR, 'content.json'));
      const parsed = ContentSchema.parse(data);
      expect(Object.keys(parsed.checklists).length).toBe(10);
      expect(Object.keys(parsed.unsupportedMessages).length).toBe(4);
      expect(parsed.emptyStateMessage).toBeTruthy();
    });
  });

  describe('SearchRequestSchema XOR constraint', () => {
    it('accepts query only', () => {
      const req = { query: 'old laptop and charger' };
      expect(SearchRequestSchema.safeParse(req).success).toBe(true);
    });

    it('accepts items only', () => {
      const req = {
        items: [
          {
            label: 'laptop',
            itemType: 'computer_display',
            condition: 'broken',
            quantity: 1,
          },
        ],
      };
      expect(SearchRequestSchema.safeParse(req).success).toBe(true);
    });

    it('rejects both query and items', () => {
      const req = {
        query: 'old laptop',
        items: [
          {
            label: 'laptop',
            itemType: 'computer_display',
            condition: 'broken',
            quantity: 1,
          },
        ],
      };
      expect(SearchRequestSchema.safeParse(req).success).toBe(false);
    });

    it('rejects neither query nor items', () => {
      const req = { localityId: 'sector-15' };
      expect(SearchRequestSchema.safeParse(req).success).toBe(false);
    });
  });
});
