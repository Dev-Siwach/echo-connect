import { describe, it, expect } from 'vitest';
import {
  mergeByTypeAndCondition,
  compareProviders,
  matchSearchResults,
  matchBrowseProviders,
} from '../src/lib/match.js';
import type {
  ProviderRecord,
  ProviderCard,
  InterpretedItem,
  Interpretation,
} from '../src/shared/contracts.js';

describe('Matching and Ranking Engine', () => {
  const baseProvider: ProviderRecord = {
    city: 'faridabad',
    providerId: 'fbd-0001',
    name: 'Alpha Repair',
    description: 'Alpha shop',
    routes: ['repair'],
    acceptedItemTypes: ['phone_tablet'],
    serviceModes: ['drop_off'],
    cost: 'varies',
    address: 'Sector 15',
    localityId: 'sector-15',
    lat: 28.4089,
    lng: 77.3178,
    verification: {
      level: 'called',
      verifiedAt: '2026-10-09',
      verifiedBy: 'M1',
      method: 'Phone confirmed',
    },
    isSample: false,
    active: true,
    updatedAt: '2026-10-09T00:00:00Z',
  };

  describe('mergeByTypeAndCondition', () => {
    it('merges items with same itemType and same condition, summing quantities', () => {
      const items: InterpretedItem[] = [
        { label: 'old phone', itemType: 'phone_tablet', condition: 'broken', quantity: 1 },
        { label: 'smashed tablet', itemType: 'phone_tablet', condition: 'broken', quantity: 2 },
      ];
      const merged = mergeByTypeAndCondition(items);
      expect(merged).toHaveLength(1);
      expect(merged[0].itemType).toBe('phone_tablet');
      expect(merged[0].condition).toBe('broken');
      expect(merged[0].quantity).toBe(3);
      expect(merged[0].label).toContain('old phone');
      expect(merged[0].label).toContain('smashed tablet');
    });

    it('keeps items with different conditions separate', () => {
      const items: InterpretedItem[] = [
        { label: 'working phone', itemType: 'phone_tablet', condition: 'working', quantity: 1 },
        { label: 'broken phone', itemType: 'phone_tablet', condition: 'broken', quantity: 1 },
      ];
      const merged = mergeByTypeAndCondition(items);
      expect(merged).toHaveLength(2);
    });
  });

  describe('Ranking order and sorting (compareProviders)', () => {
    it('sorts by verification rank descending (called > official_list > website_only > unverified)', () => {
      const pCalled: ProviderCard = {
        ...baseProvider,
        name: 'Zeta Called',
        verification: { ...baseProvider.verification, level: 'called' },
      };
      const pOfficial: ProviderCard = {
        ...baseProvider,
        name: 'Beta Official',
        verification: { ...baseProvider.verification, level: 'official_list' },
      };
      const pWebsite: ProviderCard = {
        ...baseProvider,
        name: 'Gamma Website',
        verification: { ...baseProvider.verification, level: 'website_only' },
      };
      const pUnverified: ProviderCard = {
        ...baseProvider,
        name: 'Alpha Unverified',
        verification: { ...baseProvider.verification, level: 'unverified' },
      };

      const sorted = [pUnverified, pWebsite, pCalled, pOfficial].sort(compareProviders);
      expect(sorted.map((p) => p.name)).toEqual([
        'Zeta Called',
        'Beta Official',
        'Gamma Website',
        'Alpha Unverified',
      ]);
    });

    it('sorts by distance ascending when verification ranks are equal', () => {
      const pNear: ProviderCard = {
        ...baseProvider,
        name: 'Shop Near',
        distanceKm: 1.5,
      };
      const pFar: ProviderCard = {
        ...baseProvider,
        name: 'Shop Far',
        distanceKm: 5.2,
      };
      const pNoDistance: ProviderCard = {
        ...baseProvider,
        name: 'Shop Unknown Distance',
        distanceKm: undefined,
      };

      const sorted = [pFar, pNoDistance, pNear].sort(compareProviders);
      expect(sorted.map((p) => p.name)).toEqual([
        'Shop Near',
        'Shop Far',
        'Shop Unknown Distance',
      ]);
    });

    it('sorts alphabetically by name when rank and distance are tied', () => {
      const pA: ProviderCard = { ...baseProvider, name: 'AAA Repair', distanceKm: 2.0 };
      const pB: ProviderCard = { ...baseProvider, name: 'BBB Repair', distanceKm: 2.0 };
      const pC: ProviderCard = { ...baseProvider, name: 'CCC Repair', distanceKm: 2.0 };

      const sorted = [pC, pA, pB].sort(compareProviders);
      expect(sorted.map((p) => p.name)).toEqual(['AAA Repair', 'BBB Repair', 'CCC Repair']);
    });
  });

  describe('matchSearchResults', () => {
    const interpretation: Interpretation = {
      items: [
        { label: 'laptop', itemType: 'computer_display', condition: 'broken', quantity: 1 },
      ],
      unsupportedItems: [],
      locationHint: null,
      clarifyingQuestion: null,
    };

    it('separates verified and unverified providers, capping each at 3', () => {
      const providers: ProviderRecord[] = [
        { ...baseProvider, providerId: 'fbd-0001', name: 'V1', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'called' } },
        { ...baseProvider, providerId: 'fbd-0002', name: 'V2', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'official_list' } },
        { ...baseProvider, providerId: 'fbd-0003', name: 'V3', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'website_only' } },
        { ...baseProvider, providerId: 'fbd-0004', name: 'V4', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'called' } },
        { ...baseProvider, providerId: 'fbd-0005', name: 'U1', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'unverified' } },
        { ...baseProvider, providerId: 'fbd-0006', name: 'U2', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'unverified' } },
        { ...baseProvider, providerId: 'fbd-0007', name: 'U3', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'unverified' } },
        { ...baseProvider, providerId: 'fbd-0008', name: 'U4', routes: ['repair'], acceptedItemTypes: ['computer_display'], verification: { ...baseProvider.verification, level: 'unverified' } },
      ];

      const res = matchSearchResults(interpretation, providers);
      const repairRoute = res.results[0].routes.find((r) => r.route === 'repair');
      expect(repairRoute).toBeDefined();
      expect(repairRoute!.providers).toHaveLength(3);
      expect(repairRoute!.unverifiedProviders).toHaveLength(3);
    });

    it('filters out sample records when showSampleData is false', () => {
      const providers: ProviderRecord[] = [
        { ...baseProvider, providerId: 'fbd-0001', name: 'Real Shop', routes: ['repair'], acceptedItemTypes: ['computer_display'], isSample: false },
        { ...baseProvider, providerId: 'fbd-0002', name: 'Sample Shop', routes: ['repair'], acceptedItemTypes: ['computer_display'], isSample: true },
      ];

      const withoutSample = matchSearchResults(interpretation, providers, { showSampleData: false });
      const route1 = withoutSample.results[0].routes.find((r) => r.route === 'repair')!;
      expect(route1.providers).toHaveLength(1);
      expect(route1.providers[0].name).toBe('Real Shop');

      const withSample = matchSearchResults(interpretation, providers, { showSampleData: true });
      const route2 = withSample.results[0].routes.find((r) => r.route === 'repair')!;
      expect(route2.providers).toHaveLength(2);
    });

    it('filters out inactive providers', () => {
      const providers: ProviderRecord[] = [
        { ...baseProvider, providerId: 'fbd-0001', name: 'Closed Shop', routes: ['repair'], acceptedItemTypes: ['computer_display'], active: false },
      ];

      const res = matchSearchResults(interpretation, providers, { showSampleData: true });
      const route = res.results[0].routes.find((r) => r.route === 'repair')!;
      expect(route.providers).toHaveLength(0);
      expect(route.unverifiedProviders).toHaveLength(0);
    });

    it('returns empty provider lists for routes with no matches', () => {
      const providers: ProviderRecord[] = []; // No providers at all
      const res = matchSearchResults(interpretation, providers);
      expect(res.results).toHaveLength(1);
      expect(res.results[0].routes.length).toBeGreaterThan(0);
      for (const r of res.results[0].routes) {
        expect(r.providers).toHaveLength(0);
        expect(r.unverifiedProviders).toHaveLength(0);
      }
    });

    it('attaches checklist for the item type', () => {
      const res = matchSearchResults(interpretation, []);
      expect(res.results[0].checklist).toBeDefined();
      expect(res.results[0].checklist.length).toBeGreaterThan(0);
    });
  });

  describe('matchBrowseProviders (GET /providers path)', () => {
    it('filters by itemType and route, returning separate verified/unverified lists', () => {
      const providers: ProviderRecord[] = [
        { ...baseProvider, providerId: 'fbd-0001', name: 'P1', routes: ['repair'], acceptedItemTypes: ['phone_tablet'] },
        { ...baseProvider, providerId: 'fbd-0002', name: 'P2', routes: ['donate'], acceptedItemTypes: ['phone_tablet'] },
        { ...baseProvider, providerId: 'fbd-0003', name: 'P3', routes: ['repair'], acceptedItemTypes: ['clothing_textiles'] },
      ];

      const res = matchBrowseProviders(providers, {
        itemType: 'phone_tablet',
        route: 'repair',
      });

      expect(res.providers).toHaveLength(1);
      expect(res.providers[0].name).toBe('P1');
    });
  });
});
