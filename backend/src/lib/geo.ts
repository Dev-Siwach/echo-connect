/**
 * Geographic calculation and locality matching
 * Source of truth: docs/PROJECT_SPEC.md §2.9, §2.10
 */

import type { Locality } from '../shared/contracts.js';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula.
 * Result rounded to 1 decimal place.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Normalizes a location name or hint for matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy matches a location hint string against known localities
 */
export function fuzzyMatchLocality(
  locationHint: string,
  localities: readonly Locality[]
): Locality | null {
  if (!locationHint || localities.length === 0) {
    return null;
  }

  const normalizedHint = normalizeText(locationHint);
  if (!normalizedHint) {
    return null;
  }

  // 1. Direct match on id
  const directId = localities.find(
    (loc) => normalizeText(loc.id) === normalizedHint
  );
  if (directId) return directId;

  // 2. Direct match on name
  const directName = localities.find(
    (loc) => normalizeText(loc.name) === normalizedHint
  );
  if (directName) return directName;

  // 3. Substring match (either hint contains locality name or vice versa)
  for (const loc of localities) {
    const normName = normalizeText(loc.name);
    const normId = normalizeText(loc.id);
    if (
      normalizedHint.includes(normName) ||
      normName.includes(normalizedHint) ||
      normalizedHint.includes(normId)
    ) {
      return loc;
    }
  }

  return null;
}

export interface OriginCoords {
  lat: number;
  lng: number;
}

export interface ResolvedOrigin {
  coords: OriginCoords | null;
  origin: 'gps' | 'locality' | 'default';
  matchedLocalityId?: string;
}

/**
 * Resolves origin coordinates following the precedence:
 * GPS (lat/lng) -> explicit localityId -> fuzzyMatch(locationHint) -> null
 */
export function resolveOrigin(
  params: {
    lat?: number | null;
    lng?: number | null;
    localityId?: string | null;
    locationHint?: string | null;
  },
  localities: readonly Locality[]
): ResolvedOrigin {
  // 1. Explicit GPS coordinates
  if (
    typeof params.lat === 'number' &&
    typeof params.lng === 'number' &&
    !Number.isNaN(params.lat) &&
    !Number.isNaN(params.lng)
  ) {
    return {
      coords: { lat: params.lat, lng: params.lng },
      origin: 'gps',
    };
  }

  // 2. Explicit localityId
  if (params.localityId) {
    const loc = localities.find((l) => l.id === params.localityId);
    if (loc && loc.lat !== null && loc.lng !== null) {
      return {
        coords: { lat: loc.lat, lng: loc.lng },
        origin: 'locality',
        matchedLocalityId: loc.id,
      };
    }
  }

  // 3. Location hint fuzzy matching
  if (params.locationHint) {
    const matched = fuzzyMatchLocality(params.locationHint, localities);
    if (matched && matched.lat !== null && matched.lng !== null) {
      return {
        coords: { lat: matched.lat, lng: matched.lng },
        origin: 'locality',
        matchedLocalityId: matched.id,
      };
    }
  }

  // 4. Default / unknown origin
  return {
    coords: null,
    origin: 'default',
  };
}
