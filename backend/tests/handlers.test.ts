import { describe, it, expect, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler as searchHandler } from '../src/handlers/search.js';
import { handler as providersHandler } from '../src/handlers/providers.js';
import { handler as healthHandler } from '../src/handlers/health.js';
import { setCachedCityProviders } from '../src/lib/db.js';
import type { ProviderRecord } from '../src/shared/contracts.js';

function mockEvent(overrides: Partial<APIGatewayProxyEventV2>): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: '/',
    rawQueryString: '',
    headers: { 'content-type': 'application/json' },
    requestContext: {
      accountId: '123456789012',
      apiId: 'mockApi',
      domainName: 'localhost',
      domainPrefix: 'mock',
      http: {
        method: 'GET',
        path: '/',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test',
      },
      requestId: 'test-req-1234',
      routeKey: '$default',
      stage: '$default',
      time: '10/Oct/2026:00:00:00 +0000',
      timeEpoch: 1728518400000,
    },
    isBase64Encoded: false,
    ...overrides,
  };
}

describe('Lambda Handlers Suite', () => {
  const sampleProvider: ProviderRecord = {
    city: 'faridabad',
    providerId: 'fbd-0001',
    name: 'Sample Electronics Care',
    description: 'Sample repair store',
    routes: ['repair'],
    acceptedItemTypes: ['phone_tablet', 'computer_display'],
    serviceModes: ['drop_off'],
    cost: 'varies',
    address: 'Sector 15 Market',
    localityId: 'sector-15',
    lat: 28.4089,
    lng: 77.3178,
    verification: {
      level: 'called',
      verifiedAt: '2026-10-09',
      verifiedBy: 'M1',
      method: 'Phone confirmed',
    },
    isSample: true,
    active: true,
    updatedAt: '2026-10-09T00:00:00Z',
  };

  beforeEach(() => {
    process.env.SHOW_SAMPLE_DATA = 'true';
    process.env.DEFAULT_CITY = 'faridabad';
    process.env.CLASSIFIER_MODE = 'fallback';
    setCachedCityProviders('faridabad', [sampleProvider]);
  });

  describe('Health Handler (GET /health)', () => {
    it('returns 200 and { ok: true, version: string }', async () => {
      const res = await healthHandler(mockEvent({ rawPath: '/health' }));
      expect(typeof res).not.toBe('string');
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.ok).toBe(true);
      expect(body.version).toBeDefined();
    });
  });

  describe('Providers Handler (GET /providers)', () => {
    it('returns 200 with matching providers for valid queryParams', async () => {
      const event = mockEvent({
        rawPath: '/providers',
        queryStringParameters: {
          itemType: 'phone_tablet',
          route: 'repair',
        },
      });

      const res = await providersHandler(event);
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.providers).toBeDefined();
      expect(body.providers.length).toBeGreaterThan(0);
      expect(body.providers[0].name).toBe('Sample Electronics Care');
    });

    it('returns 400 INVALID_INPUT when itemType is missing', async () => {
      const event = mockEvent({
        rawPath: '/providers',
        queryStringParameters: {},
      });

      const res = await providersHandler(event);
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('Search Handler (POST /search)', () => {
    it('returns 200 with structured interpretation and results for natural language query', async () => {
      const event = mockEvent({
        rawPath: '/search',
        body: JSON.stringify({ query: 'purana phone repair karwana hai' }),
      });

      const res = await searchHandler(event);
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.interpretation).toBeDefined();
      expect(body.interpretation.items[0].itemType).toBe('phone_tablet');
      expect(body.results).toBeDefined();
      expect(body.meta.classifier).toBe('fallback');
    });

    it('returns 200 for structured items path (skipping AI classification)', async () => {
      const event = mockEvent({
        rawPath: '/search',
        body: JSON.stringify({
          items: [
            {
              label: 'laptop',
              itemType: 'computer_display',
              condition: 'broken',
              quantity: 1,
            },
          ],
        }),
      });

      const res = await searchHandler(event);
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.meta.classifier).toBe('manual');
      expect(body.results[0].itemType).toBe('computer_display');
    });

    it('returns 400 when body is missing or invalid JSON', async () => {
      const res = await searchHandler(mockEvent({ body: undefined }));
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error.code).toBe('INVALID_INPUT');
    });

    it('returns 400 when both query and items are supplied (violating XOR)', async () => {
      const event = mockEvent({
        body: JSON.stringify({
          query: 'laptop',
          items: [
            {
              label: 'laptop',
              itemType: 'computer_display',
              condition: 'broken',
              quantity: 1,
            },
          ],
        }),
      });

      const res = await searchHandler(event);
      const response = res as { statusCode: number; body: string };
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error.code).toBe('INVALID_INPUT');
    });
  });
});
