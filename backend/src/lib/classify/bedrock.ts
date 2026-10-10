/**
 * Amazon Bedrock Converse API request interpreter
 * Calls Converse API with forced tool use, 6-second timeout, and Zod validation.
 * Source of truth: docs/PROJECT_SPEC.md §2.8, ADR-004
 */

import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { InterpretationSchema, type Interpretation } from '../../shared/contracts.js';
import { SYSTEM_PROMPT, RECORD_INTERPRETATION_TOOL } from './prompt.js';

const BEDROCK_TIMEOUT_MS = 6000; // 6 seconds timeout as specified in §2.8

let bedrockClient: BedrockRuntimeClient | null = null;

export function getBedrockClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    const region = process.env.AWS_REGION || 'ap-south-1';
    bedrockClient = new BedrockRuntimeClient({ region });
  }
  return bedrockClient;
}

export function setBedrockClient(client: BedrockRuntimeClient | null): void {
  bedrockClient = client;
}

/**
 * Sanitizes and cleans Bedrock output:
 * - Drops duplicate item entries
 * - Clamps quantities to 1..99
 */
function sanitizeInterpretation(raw: Interpretation): Interpretation {
  const seen = new Set<string>();
  const sanitizedItems = [];

  for (const item of raw.items) {
    const key = `${item.itemType}::${item.condition}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    let qty = item.quantity;
    if (typeof qty === 'number') {
      qty = Math.max(1, Math.min(99, Math.round(qty)));
    }

    sanitizedItems.push({
      ...item,
      quantity: qty,
    });
  }

  return {
    ...raw,
    items: sanitizedItems.slice(0, 10),
  };
}

/**
 * Interprets a user query using Amazon Bedrock Converse API with forced tool use
 */
export async function classifyWithBedrock(
  query: string,
  modelId: string = process.env.BEDROCK_MODEL_ID || 'amazon.nova-micro-v1:0'
): Promise<Interpretation> {
  const client = getBedrockClient();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BEDROCK_TIMEOUT_MS);

  const input: ConverseCommandInput = {
    modelId,
    system: [{ text: SYSTEM_PROMPT }],
    messages: [
      {
        role: 'user',
        content: [{ text: query }],
      },
    ],
    toolConfig: {
      tools: [RECORD_INTERPRETATION_TOOL],
      toolChoice: {
        tool: {
          name: 'record_interpretation',
        },
      },
    },
    inferenceConfig: {
      temperature: 0,
      maxTokens: 600,
    },
  };

  try {
    const command = new ConverseCommand(input);
    const response = await client.send(command, {
      abortSignal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Look for toolUse block in content
    const contentBlocks = response.output?.message?.content || [];
    let toolUseInput: unknown = null;

    for (const block of contentBlocks) {
      if ('toolUse' in block && block.toolUse?.name === 'record_interpretation') {
        toolUseInput = block.toolUse.input;
        break;
      }
    }

    if (!toolUseInput) {
      throw new Error(
        'Bedrock Converse response did not include a valid "record_interpretation" tool call.'
      );
    }

    // Validate with Zod
    const validated = InterpretationSchema.parse(toolUseInput);
    return sanitizeInterpretation(validated);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Bedrock Converse call timed out after ${BEDROCK_TIMEOUT_MS}ms.`);
    }
    throw err;
  }
}
