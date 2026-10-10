import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateSeedData } from '../scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_PATH = path.resolve(__dirname, '../src/shared/fixtures/sample-providers.json');

describe('Seed and Data Validation Engine', () => {
  it('validates sample-providers.json with zero errors', () => {
    const res = validateSeedData(SAMPLE_PATH);
    expect(res.success).toBe(true);
    expect(res.totalRecords).toBe(2);
    expect(res.validRecords).toHaveLength(2);
    expect(res.issues).toHaveLength(0);
    expect(res.duplicates).toHaveLength(0);
    expect(res.sampleCount).toBe(2);
    expect(res.localitiesCount).toBeGreaterThan(0);
  });

  it('detects and reports schema validation errors in invalid records', () => {
    const invalidRecords = [
      {
        city: 'faridabad',
        providerId: 'fbd-9999',
        name: 'Invalid Phone Shop',
        description: 'Test shop',
        routes: ['repair'],
        acceptedItemTypes: ['phone_tablet'],
        serviceModes: ['drop_off'],
        cost: 'free',
        address: 'Sector 15',
        localityId: 'sector-15',
        phone: '12345', // Invalid phone regex (must be +91 followed by 10 digits)
        verification: {
          level: 'called',
          verifiedAt: '2026-10-09',
          verifiedBy: 'M1',
          method: 'Test',
        },
        isSample: true,
        active: true,
        updatedAt: '2026-10-09T00:00:00Z',
      },
    ];

    const tempPath = path.resolve(__dirname, 'temp-invalid-phone.json');
    fs.writeFileSync(tempPath, JSON.stringify(invalidRecords), 'utf8');

    try {
      const res = validateSeedData(tempPath);
      expect(res.success).toBe(false);
      expect(res.issues).toHaveLength(1);
      expect(res.issues[0].errors.some((e) => e.includes('phone'))).toBe(true);
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  });

  it('detects duplicate providerId entries', () => {
    const duplicateRecords = [
      {
        city: 'faridabad',
        providerId: 'fbd-0001',
        name: 'First Shop',
        description: 'Test shop',
        routes: ['repair'],
        acceptedItemTypes: ['phone_tablet'],
        serviceModes: ['drop_off'],
        cost: 'free',
        address: 'Sector 15',
        localityId: 'sector-15',
        verification: {
          level: 'called',
          verifiedAt: '2026-10-09',
          verifiedBy: 'M1',
          method: 'Test',
        },
        isSample: true,
        active: true,
        updatedAt: '2026-10-09T00:00:00Z',
      },
      {
        city: 'faridabad',
        providerId: 'fbd-0001', // DUPLICATE ID
        name: 'Second Shop',
        description: 'Test shop 2',
        routes: ['repair'],
        acceptedItemTypes: ['phone_tablet'],
        serviceModes: ['drop_off'],
        cost: 'free',
        address: 'Sector 15',
        localityId: 'sector-15',
        verification: {
          level: 'called',
          verifiedAt: '2026-10-09',
          verifiedBy: 'M1',
          method: 'Test',
        },
        isSample: true,
        active: true,
        updatedAt: '2026-10-09T00:00:00Z',
      },
    ];

    const tempPath = path.resolve(__dirname, 'temp-duplicate.json');
    fs.writeFileSync(tempPath, JSON.stringify(duplicateRecords), 'utf8');

    try {
      const res = validateSeedData(tempPath);
      expect(res.success).toBe(false);
      expect(res.duplicates).toContain('fbd-0001');
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  });

  it('detects and flags localityId that does not exist in localities file', () => {
    const unlistedLocalityRecords = [
      {
        city: 'faridabad',
        providerId: 'fbd-0099',
        name: 'Non Existent Locality Shop',
        description: 'Test shop',
        routes: ['repair'],
        acceptedItemTypes: ['phone_tablet'],
        serviceModes: ['drop_off'],
        cost: 'free',
        address: 'Unknown Place',
        localityId: 'non-existent-sector', // NOT IN LOCALITIES
        lat: null,
        lng: null,
        verification: {
          level: 'called',
          verifiedAt: '2026-10-09',
          verifiedBy: 'M1',
          method: 'Test',
        },
        isSample: true,
        active: true,
        updatedAt: '2026-10-09T00:00:00Z',
      },
    ];

    const tempPath = path.resolve(__dirname, 'temp-unlisted-loc.json');
    fs.writeFileSync(tempPath, JSON.stringify(unlistedLocalityRecords), 'utf8');

    try {
      const res = validateSeedData(tempPath);
      expect(res.success).toBe(false);
      expect(res.issues[0].errors.some((e) => e.includes('does not exist in localities file'))).toBe(true);
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  });

  it('throws when the provider file does not exist', () => {
    expect(() => validateSeedData('/non/existent/path/file.json')).toThrow();
  });
});
