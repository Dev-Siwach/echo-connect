/**
 * DynamoDB client and in-memory partition cache
 * Source of truth: docs/DECISIONS.md ADR-008, docs/PROJECT_SPEC.md §2.6
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { ProviderRecord } from '../shared/contracts.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface CacheEntry {
  providers: ProviderRecord[];
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

let documentClient: DynamoDBDocumentClient | null = null;

export function getDocumentClient(): DynamoDBDocumentClient {
  if (!documentClient) {
    const region = process.env.AWS_REGION || 'ap-south-1';
    const client = new DynamoDBClient({ region });
    documentClient = DynamoDBDocumentClient.from(client);
  }
  return documentClient;
}

/**
 * Retrieves all active providers for a city partition, using 5-minute memory cache
 */
export async function getCityProviders(
  city: string = process.env.DEFAULT_CITY || 'faridabad',
  tableName: string = process.env.TABLE_NAME || 'Providers'
): Promise<ProviderRecord[]> {
  const now = Date.now();
  const cached = memoryCache.get(city);

  if (cached && cached.expiresAt > now) {
    return cached.providers;
  }

  const client = getDocumentClient();
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'city = :city',
    ExpressionAttributeValues: {
      ':city': city,
    },
  });

  const response = await client.send(command);
  const items = (response.Items || []) as ProviderRecord[];

  memoryCache.set(city, {
    providers: items,
    expiresAt: now + CACHE_TTL_MS,
  });

  return items;
}

/**
 * Clears cached city partitions (useful for tests and manual cache invalidation)
 */
export function clearProviderCache(): void {
  memoryCache.clear();
}

/**
 * For testing: sets cached providers directly without hitting AWS
 */
export function setCachedCityProviders(city: string, providers: ProviderRecord[]): void {
  memoryCache.set(city, {
    providers,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
