/**
 * Lambda handler for GET /health
 * Source of truth: docs/PROJECT_SPEC.md §2.7
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'node:crypto';
import { HealthResponseSchema, type HealthResponse } from '../shared/contracts.js';
import { logRequest } from '../lib/log.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const startTime = Date.now();
  const requestId =
    event.requestContext?.requestId || crypto.randomUUID();

  const responseData: HealthResponse = {
    ok: true,
    version: process.env.COMMIT_SHA || '2026-10-10',
  };

  HealthResponseSchema.parse(responseData);

  logRequest({
    level: 'info',
    msg: 'health_check',
    requestId,
    totalMs: Date.now() - startTime,
  });

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify(responseData),
  };
}
