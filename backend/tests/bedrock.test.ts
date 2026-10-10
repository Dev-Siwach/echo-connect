import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import {
  classifyWithBedrock,
  setBedrockClient,
} from '../src/lib/classify/bedrock.js';
import { classifyQuery } from '../src/lib/classify/index.js';

describe('Bedrock Converse AI Integration & Fallback Switching', () => {
  beforeEach(() => {
    delete process.env.CLASSIFIER_MODE;
  });

  it('successfully interprets query when Bedrock returns valid toolUse payload', async () => {
    const mockClient = {
      send: vi.fn().mockResolvedValue({
        output: {
          message: {
            content: [
              {
                toolUse: {
                  name: 'record_interpretation',
                  input: {
                    items: [
                      {
                        label: 'old smartphone',
                        itemType: 'phone_tablet',
                        condition: 'repairable',
                        quantity: 1,
                      },
                      // Duplicate to test deduplication
                      {
                        label: 'smartphone',
                        itemType: 'phone_tablet',
                        condition: 'repairable',
                        quantity: 2,
                      },
                    ],
                    unsupportedItems: [],
                    locationHint: 'Sector 15',
                    clarifyingQuestion: null,
                  },
                },
              },
            ],
          },
        },
      }),
    } as unknown as BedrockRuntimeClient;

    setBedrockClient(mockClient);

    const result = await classifyWithBedrock('old smartphone screen broken');
    expect(result.items).toHaveLength(1); // Deduplicated
    expect(result.items[0].itemType).toBe('phone_tablet');
    expect(result.items[0].condition).toBe('repairable');
    expect(result.locationHint).toBe('Sector 15');

    // Test through classifyQuery dispatcher
    process.env.CLASSIFIER_MODE = 'bedrock';
    const dispatched = await classifyQuery('old smartphone screen broken');
    expect(dispatched.classifier).toBe('bedrock');
    expect(dispatched.interpretation.items).toHaveLength(1);
  });

  it('switches to fallback classifier when Bedrock returns invalid enum schema', async () => {
    const mockClient = {
      send: vi.fn().mockResolvedValue({
        output: {
          message: {
            content: [
              {
                toolUse: {
                  name: 'record_interpretation',
                  input: {
                    items: [
                      {
                        label: 'spaceship',
                        itemType: 'invalid_item_enum_value', // INVALID ENUM
                        condition: 'working',
                        quantity: 1,
                      },
                    ],
                    unsupportedItems: [],
                    locationHint: null,
                    clarifyingQuestion: null,
                  },
                },
              },
            ],
          },
        },
      }),
    } as unknown as BedrockRuntimeClient;

    setBedrockClient(mockClient);

    // Direct call should throw Zod validation error
    await expect(classifyWithBedrock('purana phone')).rejects.toThrow();

    // Dispatcher should catch the error and seamlessly switch to fallback
    process.env.CLASSIFIER_MODE = 'bedrock';
    const dispatched = await classifyQuery('purana phone');
    expect(dispatched.classifier).toBe('fallback');
    expect(dispatched.interpretation.items[0].itemType).toBe('phone_tablet');
  });

  it('switches to fallback classifier when Bedrock call times out or throws', async () => {
    const mockClient = {
      send: vi.fn().mockRejectedValue(new Error('Bedrock connection timeout')),
    } as unknown as BedrockRuntimeClient;

    setBedrockClient(mockClient);

    // Direct call should throw
    await expect(classifyWithBedrock('box of AA batteries')).rejects.toThrow('Bedrock connection timeout');

    // Dispatcher should catch the timeout and seamlessly switch to fallback
    process.env.CLASSIFIER_MODE = 'bedrock';
    const dispatched = await classifyQuery('box of AA batteries');
    expect(dispatched.classifier).toBe('fallback');
    expect(dispatched.interpretation.items.some((i) => i.itemType === 'battery_household')).toBe(true);
  });

  it('skips Bedrock entirely when CLASSIFIER_MODE is explicitly set to "fallback"', async () => {
    const sendSpy = vi.fn();
    const mockClient = { send: sendSpy } as unknown as BedrockRuntimeClient;
    setBedrockClient(mockClient);

    process.env.CLASSIFIER_MODE = 'fallback';
    const dispatched = await classifyQuery('purana mixer kharab ho gaya');

    expect(dispatched.classifier).toBe('fallback');
    expect(dispatched.interpretation.items[0].itemType).toBe('small_appliance');
    expect(sendSpy).not.toHaveBeenCalled();
  });
});
