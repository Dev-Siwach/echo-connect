/**
 * Classification dispatcher
 * Routes request to Bedrock or Fallback classifier based on environment and availability
 * Source of truth: docs/PROJECT_SPEC.md §2.8
 */

import type { Interpretation } from '../../shared/contracts.js';
import type { ClassifierMode } from '../../shared/taxonomy.js';
import { classifyWithFallback } from './fallback.js';

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
  const mode = process.env.CLASSIFIER_MODE || 'fallback';

  if (mode === 'fallback') {
    const interpretation = classifyWithFallback(query);
    const latencyMs = Date.now() - startTime;
    return {
      interpretation,
      classifier: 'fallback',
      latencyMs,
    };
  }

  // Bedrock execution will be plugged in Step 5 (feat/bedrock).
  // For Step 4, if mode is bedrock but unconfigured, gracefully fallback.
  try {
    // Dynamic import to allow modular step-by-step builds
    const { classifyWithBedrock } = await import('./bedrock.js').catch(() => ({
      classifyWithBedrock: null,
    }));

    if (classifyWithBedrock) {
      const interpretation = await classifyWithBedrock(query);
      return {
        interpretation,
        classifier: 'bedrock',
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (err) {
    console.warn('[classify] Bedrock error, falling back to keyword classifier:', err);
  }

  const interpretation = classifyWithFallback(query);
  return {
    interpretation,
    classifier: 'fallback',
    latencyMs: Date.now() - startTime,
  };
}
