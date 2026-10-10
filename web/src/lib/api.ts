import {
  SearchRequest,
  SearchResponse,
  SearchResponseSchema,
  ProvidersResponse,
  ProvidersResponseSchema,
  HealthResponse,
  HealthResponseSchema,
  ErrorResponseSchema,
} from '@/shared/contracts';

// Contract fixtures for mock mode
import searchMultiItemFixture from '@/shared/fixtures/search.multi-item.json';
import searchClarifyingFixture from '@/shared/fixtures/search.clarifying.json';
import searchUnsupportedOnlyFixture from '@/shared/fixtures/search.unsupported-only.json';
import searchNoProvidersFixture from '@/shared/fixtures/search.no-providers.json';
import searchFallbackFixture from '@/shared/fixtures/search.fallback.json';
import providersBatteriesFixture from '@/shared/fixtures/providers.batteries.json';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Default to mocks if explicitly set or if no live backend configured
export const isMockMode = (): boolean => {
  if (typeof process.env.NEXT_PUBLIC_USE_MOCKS !== 'undefined') {
    return process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
  }
  return true; // default safe fallback during development
};

export class ApiClientError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = 'INTERNAL', status?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes POST /search to interpret query and return matching providers.
 * Validates output with SearchResponseSchema.
 */
export async function search(
  req: SearchRequest,
  mockParam?: string | null
): Promise<SearchResponse> {
  if (isMockMode() || mockParam) {
    await delay(600); // 600ms artificial delay to show loading states

    const mockKey = (mockParam || '').toLowerCase();
    const queryLower = (req.query || '').toLowerCase();

    if (mockKey === 'error' || queryLower.includes('error')) {
      throw new ApiClientError('Simulated server error occurred', 'INTERNAL', 500);
    }
    if (mockKey === 'rate-limit' || mockKey === '429' || queryLower.includes('rate-limit')) {
      throw new ApiClientError('Too many requests, try again shortly', 'RATE_LIMITED', 429);
    }
    if (mockKey === 'unsupported' || queryLower.includes('fridge') || queryLower.includes('car battery')) {
      return SearchResponseSchema.parse(searchUnsupportedOnlyFixture);
    }
    if (mockKey === 'clarifying' || queryLower.includes('stuff') || queryLower.includes('things')) {
      return SearchResponseSchema.parse(searchClarifyingFixture);
    }
    if (mockKey === 'no-providers' || mockKey === 'empty' || queryLower.includes('toaster')) {
      return SearchResponseSchema.parse(searchNoProvidersFixture);
    }
    if (mockKey === 'fallback' || queryLower.includes('purana')) {
      return SearchResponseSchema.parse(searchFallbackFixture);
    }

    return SearchResponseSchema.parse(searchMultiItemFixture);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (res.status === 429) {
      throw new ApiClientError('Too many requests, try again shortly', 'RATE_LIMITED', 429);
    }

    const data = await res.json();

    if (!res.ok) {
      const parsedError = ErrorResponseSchema.safeParse(data);
      if (parsedError.success) {
        throw new ApiClientError(
          parsedError.data.error.message,
          parsedError.data.error.code,
          res.status
        );
      }
      throw new ApiClientError(
        data?.message || `Request failed with status ${res.status}`,
        'INTERNAL',
        res.status
      );
    }

    const validated = SearchResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error('[API validation error]', validated.error);
      throw new ApiClientError(
        'Invalid response format received from service',
        'VALIDATION_FAILED'
      );
    }

    return validated.data;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(
      err instanceof Error ? err.message : 'Unable to connect to search service',
      'NETWORK_ERROR'
    );
  }
}

export interface GetProvidersParams {
  itemType: string;
  route?: string;
  localityId?: string;
}

/**
 * Executes GET /providers (browse path).
 * Validates output with ProvidersResponseSchema.
 */
export async function getProviders(
  params: GetProvidersParams,
  mockParam?: string | null
): Promise<ProvidersResponse> {
  if (isMockMode() || mockParam) {
    await delay(600);

    const mockKey = (mockParam || '').toLowerCase();
    if (mockKey === 'error') {
      throw new ApiClientError('Simulated server error occurred', 'INTERNAL', 500);
    }
    if (mockKey === 'rate-limit' || mockKey === '429') {
      throw new ApiClientError('Too many requests, try again shortly', 'RATE_LIMITED', 429);
    }

    return ProvidersResponseSchema.parse(providersBatteriesFixture);
  }

  try {
    const searchParams = new URLSearchParams();
    searchParams.set('itemType', params.itemType);
    if (params.route) searchParams.set('route', params.route);
    if (params.localityId) searchParams.set('localityId', params.localityId);

    const res = await fetch(`${API_BASE_URL}/providers?${searchParams.toString()}`);

    if (res.status === 429) {
      throw new ApiClientError('Too many requests, try again shortly', 'RATE_LIMITED', 429);
    }

    const data = await res.json();

    if (!res.ok) {
      const parsedError = ErrorResponseSchema.safeParse(data);
      if (parsedError.success) {
        throw new ApiClientError(
          parsedError.data.error.message,
          parsedError.data.error.code,
          res.status
        );
      }
      throw new ApiClientError(
        data?.message || `Request failed with status ${res.status}`,
        'INTERNAL',
        res.status
      );
    }

    const validated = ProvidersResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error('[API validation error]', validated.error);
      throw new ApiClientError(
        'Invalid response format received from service',
        'VALIDATION_FAILED'
      );
    }

    return validated.data;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(
      err instanceof Error ? err.message : 'Unable to connect to providers directory',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Executes GET /health.
 * Validates output with HealthResponseSchema.
 */
export async function health(): Promise<HealthResponse> {
  if (isMockMode()) {
    await delay(200);
    return HealthResponseSchema.parse({
      ok: true,
      version: 'mock-0.1.0',
    });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();

    const validated = HealthResponseSchema.safeParse(data);
    if (!validated.success) {
      throw new ApiClientError('Invalid health status received', 'VALIDATION_FAILED');
    }

    return validated.data;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(
      err instanceof Error ? err.message : 'Health check failed',
      'NETWORK_ERROR'
    );
  }
}
