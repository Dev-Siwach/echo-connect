/**
 * Structured JSON Logger
 * Logs exactly one JSON line per request with CloudWatch-friendly format
 * Source of truth: docs/PROJECT_SPEC.md §2.12, §2.13
 */

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  msg: string;
  requestId?: string;
  classifier?: string;
  bedrockMs?: number | null;
  totalMs: number;
  itemTypes?: string[];
  providerCount?: number;
  fallbackReason?: string | null;
  queryPreview?: string;
  [key: string]: unknown;
}

/**
 * Truncates user query to at most 100 characters for privacy-safe logging
 */
export function truncateQuery(query?: string | null): string | undefined {
  if (!query) return undefined;
  return query.slice(0, 100);
}

/**
 * Outputs a single JSON log line to stdout
 */
export function logRequest(entry: LogEntry): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...entry,
  });
  console.log(line);
}
