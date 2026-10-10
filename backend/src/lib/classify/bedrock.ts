/**
 * Bedrock Converse classifier stub
 * Full implementation with Converse API forced tool use scheduled in Step 5 (feat/bedrock)
 * Source of truth: docs/roles/MEMBER_1_BACKEND.md Step 4 & 5
 */

import type { Interpretation } from '../../shared/contracts.js';

export async function classifyWithBedrock(
  _query: string
): Promise<Interpretation> {
  throw new Error(
    'Bedrock classifier not configured yet. Set CLASSIFIER_MODE=fallback or implement Step 5.'
  );
}
