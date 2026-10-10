/**
 * Classification dispatcher
 * Routes request to Bedrock or Fallback classifier based on environment and availability
 * Source of truth: docs/PROJECT_SPEC.md §2.8
 */

import type { Interpretation } from '../../shared/contracts.js';
import type { ClassifierMode } from '../../shared/taxonomy.js';
import { classifyWithFallback } from './fallback.js';

import { classifyWithBedrock } from './bedrock.js';

export interface ClassificationResult {
  interpretation: Interpretation;
  classifier: ClassifierMode;
  latencyMs: number;
}

/**
 * Interprets a plain text query into structured taxonomy items
 */
export async function classifyQuery(query: string): Promise<ClassificationResult> {
  const startTime = Date.now();
  const mode = process.env.CLASSIFIER_MODE || 'bedrock';

  if (mode === 'bedrock') {
    try {
      const interpretation = await classifyWithBedrock(query);
      return {
        interpretation,
        classifier: 'bedrock',
        latencyMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const msg = (err as Error)?.message || String(err);
      console.warn(`[classify] Bedrock unavailable (${msg}), switching to fallback classifier.`);
    }
  }

  const interpretation = classifyWithFallback(query);
  return {
    interpretation,
    classifier: 'fallback',
    latencyMs: Date.now() - startTime,
  };
}

