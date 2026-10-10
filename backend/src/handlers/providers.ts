/**
 * Lambda handler for GET /providers
 * Browse path without AI
 * Source of truth: docs/PROJECT_SPEC.md §2.7
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  ProvidersResponseSchema,
  type ProvidersResponse,
  type ErrorResponse,
} from '../shared/contracts.js';
import {
  ITEM_TYPES,
  ROUTES,
  type ItemType,
  type Route,
} from '../shared/taxonomy.js';
import { getCityProviders } from '../lib/db.js';
import { matchBrowseProviders } from '../lib/match.js';
import { getLocalities } from '../lib/localities.js';
import { logRequest } from '../lib/log.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const BrowseParamsSchema = z.object({
  itemType: z.enum(ITEM_TYPES),
  route: z.enum(ROUTES).optional(),
  localityId: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const startTime = Date.now();
  const requestId =
    event.requestContext?.requestId || crypto.randomUUID();
  const city = process.env.DEFAULT_CITY || 'faridabad';

  const queryParams = event.queryStringParameters || {};
  const parseResult = BrowseParamsSchema.safeParse(queryParams);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    const errorBody: ErrorResponse = {
      error: {
        code: 'INVALID_INPUT',
        message: errorMsg,
      },
    };
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify(errorBody),
    };
  }

  const { itemType, route, localityId, lat, lng } = parseResult.data;

  try {
    const allProviders = await getCityProviders(city);
    const localities = getLocalities();

    const result = matchBrowseProviders(allProviders, {
      itemType: itemType as ItemType,
      route: route as Route | undefined,
      localityId,
      lat,
      lng,
      localities,
    });

    const responseData: ProvidersResponse = {
      providers: result.providers,
      unverifiedProviders: result.unverifiedProviders,
    };

    // Ensure valid contract structure
    ProvidersResponseSchema.parse(responseData);

    const totalMs = Date.now() - startTime;
    logRequest({
      level: 'info',
      msg: 'browse_providers',
      requestId,
      totalMs,
      itemTypes: [itemType],
      providerCount: result.providers.length + result.unverifiedProviders.length,
    });

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(responseData),
    };
  } catch (err: unknown) {
    const totalMs = Date.now() - startTime;
    console.error('[providers handler error]:', err);

    logRequest({
      level: 'error',
      msg: 'browse_providers_error',
      requestId,
      totalMs,
    });

    const errorBody: ErrorResponse = {
      error: {
        code: 'INTERNAL',
        message: 'An internal error occurred while fetching providers.',
      },
    };

    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(errorBody),
    };
  }
}
