import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  fuzzyMatchLocality,
  resolveOrigin,
} from '../src/lib/geo.js';
import type { Locality } from '../src/shared/contracts.js';

describe('Geo calculations and locality resolution', () => {
  describe('calculateDistanceKm (Haversine formula)', () => {
    it('returns 0 for identical coordinates', () => {
      expect(calculateDistanceKm(28.4089, 77.3178, 28.4089, 77.3178)).toBe(0);
    });

    it('calculates expected distance between Sector 15 and NIT Faridabad', () => {
      // Sector 15 Faridabad (~28.4089, 77.3178)
      // NIT Faridabad (~28.3980, 77.2980)
      // Distance is ~2.3 km
      const distance = calculateDistanceKm(28.4089, 77.3178, 28.398, 77.298);
      expect(distance).toBeGreaterThan(1.8);
      expect(distance).toBeLessThan(2.8);
      // Ensure rounded to 1 decimal place
      expect(Number.isInteger(distance * 10)).toBe(true);
    });

    it('calculates distance across longer spans (e.g. Faridabad to Delhi Connaught Place)', () => {
      // Sector 15 Faridabad (28.4089, 77.3178) to Connaught Place (28.6315, 77.2167) ~26 km
      const distance = calculateDistanceKm(28.4089, 77.3178, 28.6315, 77.2167);
      expect(distance).toBeGreaterThan(24);
      expect(distance).toBeLessThan(30);
    });
  });

  describe('fuzzyMatchLocality', () => {
    const mockLocalities: Locality[] = [
      { id: 'sector-15', name: 'Sector 15', lat: 28.4089, lng: 77.3178 },
      { id: 'sector-21c', name: 'Sector 21C', lat: 28.421, lng: 77.301 },
      { id: 'nit-1', name: 'NIT 1', lat: 28.395, lng: 77.305 },
      { id: 'old-faridabad', name: 'Old Faridabad', lat: 28.415, lng: 77.325 },
    ];

    it('matches exact id and exact name', () => {
      expect(fuzzyMatchLocality('sector-15', mockLocalities)?.id).toBe('sector-15');
      expect(fuzzyMatchLocality('Sector 15', mockLocalities)?.id).toBe('sector-15');
    });

    it('matches case-insensitively with varying punctuation or whitespace', () => {
      expect(fuzzyMatchLocality('sector 15', mockLocalities)?.id).toBe('sector-15');
      expect(fuzzyMatchLocality('SECTOR 21C', mockLocalities)?.id).toBe('sector-21c');
      expect(fuzzyMatchLocality('Sector-21C', mockLocalities)?.id).toBe('sector-21c');
    });

    it('matches substring hints', () => {
      expect(fuzzyMatchLocality('I am near NIT 1', mockLocalities)?.id).toBe('nit-1');
      expect(fuzzyMatchLocality('Old Faridabad market', mockLocalities)?.id).toBe('old-faridabad');
    });

    it('returns null for empty or non-matching hints', () => {
      expect(fuzzyMatchLocality('', mockLocalities)).toBeNull();
      expect(fuzzyMatchLocality('Mumbai Bandra', mockLocalities)).toBeNull();
    });
  });

  describe('resolveOrigin precedence', () => {
    const mockLocalities: Locality[] = [
      { id: 'sector-15', name: 'Sector 15', lat: 28.4089, lng: 77.3178 },
      { id: 'sector-no-coords', name: 'Unknown Coords', lat: null, lng: null },
    ];

    it('prefers GPS coordinates when available', () => {
      const res = resolveOrigin(
        {
          lat: 28.5,
          lng: 77.2,
          localityId: 'sector-15',
          locationHint: 'Sector 15',
        },
        mockLocalities
      );
      expect(res.origin).toBe('gps');
      expect(res.coords).toEqual({ lat: 28.5, lng: 77.2 });
    });

    it('falls back to explicit localityId coordinates when GPS is absent', () => {
      const res = resolveOrigin(
        {
          localityId: 'sector-15',
          locationHint: 'Some random place',
        },
        mockLocalities
      );
      expect(res.origin).toBe('locality');
      expect(res.coords).toEqual({ lat: 28.4089, lng: 77.3178 });
      expect(res.matchedLocalityId).toBe('sector-15');
    });

    it('falls back to locationHint fuzzy match when localityId is absent', () => {
      const res = resolveOrigin(
        {
          locationHint: 'Sector 15 near market',
        },
        mockLocalities
      );
      expect(res.origin).toBe('locality');
      expect(res.coords).toEqual({ lat: 28.4089, lng: 77.3178 });
    });

    it('returns origin: default when no match or coordinates are found', () => {
      const res = resolveOrigin(
        {
          localityId: 'sector-no-coords',
        },
        mockLocalities
      );
      expect(res.origin).toBe('default');
      expect(res.coords).toBeNull();
    });
  });
});
