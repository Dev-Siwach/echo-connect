/**
 * Lambda handler for POST /search
 * Source of truth: docs/PROJECT_SPEC.md §2.7
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'node:crypto';
import {
  SearchRequestSchema,
  SearchResponseSchema,
  type SearchResponse,
  type ErrorResponse,
} from '../shared/contracts.js';
import { classifyQuery } from '../lib/classify/index.js';
import { getCityProviders } from '../lib/db.js';
import { matchSearchResults } from '../lib/match.js';
import { getLocalities } from '../lib/localities.js';
import { logRequest, truncateQuery } from '../lib/log.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const startTime = Date.now();
  const rawReqId = event.requestContext?.requestId;
  const requestId =
    rawReqId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawReqId)
      ? rawReqId
      : crypto.randomUUID();
  const city = process.env.DEFAULT_CITY || 'faridabad';

  // 1. Parse and validate JSON body
  if (!event.body) {
    const errorBody: ErrorResponse = {
      error: {
        code: 'INVALID_INPUT',
        message: 'Request body is required.',
      },
    };
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify(errorBody),
    };
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(event.body);
  } catch {
    const errorBody: ErrorResponse = {
      error: {
        code: 'INVALID_INPUT',
        message: 'Request body must be valid JSON.',
      },
    };
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify(errorBody),
    };
  }

  const parseResult = SearchRequestSchema.safeParse(rawJson);
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

  const searchRequest = parseResult.data;

  try {
    let interpretation;
    let classifier: 'bedrock' | 'fallback' | 'manual';
    let bedrockMs: number | null = null;

    if (searchRequest.items) {
      // Non-AI path: manual items passed directly
      interpretation = {
        items: searchRequest.items,
        unsupportedItems: [],
        locationHint: null,
        clarifyingQuestion: null,
      };
      classifier = 'manual';
    } else if (searchRequest.query) {
      // Natural language path: classify query
      const classified = await classifyQuery(searchRequest.query);
      interpretation = classified.interpretation;
      classifier = classified.classifier;
      bedrockMs = classifier === 'bedrock' ? classified.latencyMs : null;
    } else {
      throw new Error('Neither query nor items supplied');
    }

    // 2. Fetch city providers from DB (in-memory cached)
    const allProviders = await getCityProviders(city);

    // 3. Match and rank providers
    const localities = getLocalities();
    const matchResult = matchSearchResults(interpretation, allProviders, {
      userLat: searchRequest.lat,
      userLng: searchRequest.lng,
      localityId: searchRequest.localityId,
      locationHint: interpretation.locationHint,
      localities,
    });

    const totalMs = Date.now() - startTime;

    const responseData: SearchResponse = {
      requestId,
      interpretation,
      results: matchResult.results,
      meta: {
        classifier,
        city,
        latencyMs: totalMs,
        origin: matchResult.originType,
      },
    };

    // Ensure valid contract structure
    SearchResponseSchema.parse(responseData);

    // Log structured CloudWatch line
    const itemTypes = matchResult.results.map((r) => r.itemType);
    const providerCount = matchResult.results.reduce(
      (sum, r) =>
        sum +
        r.routes.reduce(
          (rSum, route) =>
            rSum + route.providers.length + route.unverifiedProviders.length,
          0
        ),
      0
    );

    logRequest({
      level: 'info',
      msg: 'search',
      requestId,
      classifier,
      bedrockMs,
      totalMs,
      itemTypes,
      providerCount,
      fallbackReason: null,
      queryPreview: truncateQuery(searchRequest.query),
    });

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(responseData),
    };
  } catch (err: unknown) {
    const totalMs = Date.now() - startTime;
    console.error('[search handler error]:', err);

    logRequest({
      level: 'error',
      msg: 'search_error',
      requestId,
      totalMs,
      queryPreview: truncateQuery(searchRequest.query),
    });

    const errorBody: ErrorResponse = {
      error: {
        code: 'INTERNAL',
        message: 'An internal error occurred while processing the search.',
      },
    };

    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(errorBody),
    };
  }
}
