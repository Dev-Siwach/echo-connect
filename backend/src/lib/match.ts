/**
 * Matching and ranking engine
 * Pure logic without AWS SDK imports
 * Source of truth: docs/PROJECT_SPEC.md §2.9
 */

import type {
  ProviderRecord,
  ProviderCard,
  InterpretedItem,
  Interpretation,
  SearchResultItem,
  SearchResultRoute,
  Locality,
} from '../shared/contracts.js';
import {
  ITEM_TYPE_METADATA,
  ROUTE_METADATA,
  VERIFICATION_METADATA,
  type ItemType,
  type Route,
} from '../shared/taxonomy.js';
import { getRoutesForItem } from './rules.js';
import { calculateDistanceKm, resolveOrigin, type OriginCoords } from './geo.js';
import { getChecklist } from './checklists.js';

export interface MatchOptions {
  userLat?: number | null;
  userLng?: number | null;
  localityId?: string | null;
  locationHint?: string | null;
  localities?: readonly Locality[];
  showSampleData?: boolean;
  dropEmptyRoutes?: boolean;
}

/**
 * Merges interpretation items with identical itemType and condition
 */
export function mergeByTypeAndCondition(
  items: readonly InterpretedItem[]
): InterpretedItem[] {
  const mergedMap = new Map<string, InterpretedItem>();

  for (const item of items) {
    const key = `${item.itemType}::${item.condition}`;
    const existing = mergedMap.get(key);

    if (!existing) {
      mergedMap.set(key, { ...item });
    } else {
      let mergedQuantity: number | null = null;
      if (typeof existing.quantity === 'number' && typeof item.quantity === 'number') {
        mergedQuantity = existing.quantity + item.quantity;
      } else if (typeof existing.quantity === 'number') {
        mergedQuantity = existing.quantity;
      } else if (typeof item.quantity === 'number') {
        mergedQuantity = item.quantity;
      }

      const labels = [existing.label];
      if (!existing.label.toLowerCase().includes(item.label.toLowerCase())) {
        labels.push(item.label);
      }

      mergedMap.set(key, {
        itemType: item.itemType,
        condition: item.condition,
        label: labels.join(', ').slice(0, 60),
        quantity: mergedQuantity,
      });
    }
  }

  return Array.from(mergedMap.values());
}

/**
 * Sort comparator for ProviderCard:
 * 1. verificationRank desc
 * 2. distanceKm asc (nulls/undefined last)
 * 3. name asc
 */
export function compareProviders(a: ProviderCard, b: ProviderCard): number {
  const rankA = VERIFICATION_METADATA[a.verification.level]?.rank ?? 0;
  const rankB = VERIFICATION_METADATA[b.verification.level]?.rank ?? 0;

  if (rankB !== rankA) {
    return rankB - rankA;
  }

  const distA = a.distanceKm;
  const distB = b.distanceKm;

  if (distA !== undefined && distB !== undefined) {
    if (distA !== distB) {
      return distA - distB;
    }
  } else if (distA !== undefined && distB === undefined) {
    return -1;
  } else if (distA === undefined && distB !== undefined) {
    return 1;
  }

  return a.name.localeCompare(b.name);
}

/**
 * Prepares and annotates a provider record with optional distance
 */
function createProviderCard(
  provider: ProviderRecord,
  origin: OriginCoords | null
): ProviderCard {
  let distanceKm: number | undefined;

  if (origin && provider.lat !== null && provider.lng !== null) {
    distanceKm = calculateDistanceKm(
      origin.lat,
      origin.lng,
      provider.lat,
      provider.lng
    );
  }

  return {
    ...provider,
    distanceKm,
  };
}

/**
 * Filters and matches providers for a full search query
 */
export function matchSearchResults(
  interpretation: Interpretation,
  allProviders: readonly ProviderRecord[],
  options: MatchOptions = {}
): {
  results: SearchResultItem[];
  originCoords: OriginCoords | null;
  originType: 'gps' | 'locality' | 'default';
} {
  const showSample =
    options.showSampleData ?? (process.env.SHOW_SAMPLE_DATA === 'true');

  // Filter providers: active and sample visibility
  const eligibleProviders = allProviders.filter(
    (p) => p.active && (showSample || !p.isSample)
  );

  // Resolve user origin
  const resolved = resolveOrigin(
    {
      lat: options.userLat,
      lng: options.userLng,
      localityId: options.localityId,
      locationHint: options.locationHint ?? interpretation.locationHint,
    },
    options.localities ?? []
  );

  const mergedItems = mergeByTypeAndCondition(interpretation.items);
  const results: SearchResultItem[] = [];

  for (const item of mergedItems) {
    const routes = getRoutesForItem(item.itemType, item.condition);
    const matchedRoutes: SearchResultRoute[] = [];

    for (const route of routes) {
      // Find matching providers
      const matchingCards: ProviderCard[] = eligibleProviders
        .filter(
          (p) =>
            p.routes.includes(route) &&
            p.acceptedItemTypes.includes(item.itemType)
        )
        .map((p) => createProviderCard(p, resolved.coords))
        .sort(compareProviders);

      const verified = matchingCards
        .filter((p) => (VERIFICATION_METADATA[p.verification.level]?.rank ?? 0) >= 1)
        .slice(0, 3);

      const unverified = matchingCards
        .filter((p) => (VERIFICATION_METADATA[p.verification.level]?.rank ?? 0) === 0)
        .slice(0, 3);

      if (
        options.dropEmptyRoutes &&
        verified.length === 0 &&
        unverified.length === 0
      ) {
        continue;
      }

      matchedRoutes.push({
        route,
        label: ROUTE_METADATA[route]?.label ?? route,
        providers: verified,
        unverifiedProviders: unverified,
      });
    }

    results.push({
      itemType: item.itemType,
      label: ITEM_TYPE_METADATA[item.itemType]?.label ?? item.label,
      condition: item.condition,
      checklist: getChecklist(item.itemType),
      routes: matchedRoutes,
    });
  }

  return {
    results,
    originCoords: resolved.coords,
    originType: resolved.origin,
  };
}

/**
 * Matches providers for the browse path (GET /providers)
 */
export function matchBrowseProviders(
  allProviders: readonly ProviderRecord[],
  params: {
    itemType: ItemType;
    route?: Route;
    localityId?: string | null;
    lat?: number | null;
    lng?: number | null;
    localities?: readonly Locality[];
    showSampleData?: boolean;
  }
): {
  providers: ProviderCard[];
  unverifiedProviders: ProviderCard[];
} {
  const showSample =
    params.showSampleData ?? (process.env.SHOW_SAMPLE_DATA === 'true');

  const eligibleProviders = allProviders.filter(
    (p) => p.active && (showSample || !p.isSample)
  );

  const resolved = resolveOrigin(
    {
      lat: params.lat,
      lng: params.lng,
      localityId: params.localityId,
    },
    params.localities ?? []
  );

  const matches = eligibleProviders
    .filter(
      (p) =>
        p.acceptedItemTypes.includes(params.itemType) &&
        (params.route === undefined || p.routes.includes(params.route))
    )
    .map((p) => createProviderCard(p, resolved.coords))
    .sort(compareProviders);

  const verified = matches.filter(
    (p) => (VERIFICATION_METADATA[p.verification.level]?.rank ?? 0) >= 1
  );
  const unverified = matches.filter(
    (p) => (VERIFICATION_METADATA[p.verification.level]?.rank ?? 0) === 0
  );

  return {
    providers: verified,
    unverifiedProviders: unverified,
  };
}
