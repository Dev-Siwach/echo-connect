/**
 * Deterministic fallback keyword classifier (English + Hindi/Hinglish)
 * Used on Bedrock error, timeout, or invalid output, or when CLASSIFIER_MODE=fallback.
 * Source of truth: docs/PROJECT_SPEC.md §2.8, §2.9
 */

import type { Interpretation, InterpretedItem, UnsupportedItem } from '../../shared/contracts.js';
import type { ItemType, Condition, UnsupportedReason } from '../../shared/taxonomy.js';

interface KeywordRule {
  itemType: ItemType;
  keywords: string[];
}

const ITEM_KEYWORD_RULES: KeywordRule[] = [
  {
    itemType: 'computer_display',
    keywords: [
      'laptop',
      'computer',
      'desktop',
      'monitor',
      'screen',
      'display',
      'keyboard',
      'mouse',
      'cpu',
    ],
  },
  {
    itemType: 'phone_tablet',
    keywords: [
      'phone',
      'smartphone',
      'tablet',
      'ipad',
      'mobile',
      'iphone',
      'android',
      'purana phone',
      'purane phone',
    ],
  },
  {
    itemType: 'battery_lithium',
    keywords: [
      'power bank',
      'powerbank',
      'lithium battery',
      'lithium batteries',
      'phone battery',
      'laptop battery',
    ],
  },
  {
    itemType: 'battery_household',
    keywords: [
      'aa batteries',
      'aaa batteries',
      'aa battery',
      'aaa battery',
      'button cell',
      'button cells',
      '9v battery',
      'batteries',
      'battery',
    ],
  },
  {
    itemType: 'charger_cable',
    keywords: [
      'charger',
      'chargers',
      'cable',
      'cables',
      'adapter',
      'adapters',
      'earphone',
      'earphones',
      'headphone',
      'headphones',
      'speaker',
      'wires',
      'wire',
    ],
  },
  {
    itemType: 'small_appliance',
    keywords: [
      'mixer',
      'grinder',
      'kettle',
      'iron',
      'fan',
      'router',
      'wifi router',
      'toaster',
      'hair dryer',
      'hairdryer',
      'juicer',
    ],
  },
  {
    itemType: 'clothing_textiles',
    keywords: [
      'clothes',
      'clothing',
      'kapde',
      'kapda',
      'shirt',
      'jeans',
      'jacket',
      'jackets',
      'shoes',
      'shoe',
      'bag',
      'bags',
      'bedsheet',
      'bedsheets',
      'blanket',
      'blankets',
    ],
  },
  {
    itemType: 'books_stationery',
    keywords: [
      'book',
      'books',
      'kitab',
      'kitabein',
      'textbook',
      'textbooks',
      'notebook',
      'notebooks',
      'stationery',
      'stationery items',
    ],
  },
  {
    itemType: 'furniture',
    keywords: [
      'table',
      'study table',
      'chair',
      'chairs',
      'desk',
      'shelf',
      'shelves',
      'bed',
      'sofa',
      'almari',
      'cupboard',
    ],
  },
  {
    itemType: 'household_goods',
    keywords: [
      'utensil',
      'utensils',
      'bartan',
      'kitchenware',
      'cookware',
      'toy',
      'toys',
      'crockery',
      'decor',
    ],
  },
];

const UNSUPPORTED_RULES: { reason: UnsupportedReason; keywords: string[] }[] = [
  {
    reason: 'large_appliance',
    keywords: ['fridge', 'refrigerator', 'washing machine', 'ac', 'air conditioner'],
  },
  {
    reason: 'hazardous',
    keywords: [
      'paint',
      'chemical',
      'chemicals',
      'medicine',
      'medicines',
      'car battery',
      'vehicle battery',
      'lead acid',
      'lead-acid',
    ],
  },
  {
    reason: 'out_of_scope',
    keywords: [
      'food waste',
      'construction debris',
      'debris',
      'garbage',
      'trash',
      'vehicle',
      'car',
      'bike',
      'motorcycle',
    ],
  },
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  ek: 1,
  two: 2,
  do: 2,
  three: 3,
  teen: 3,
  four: 4,
  char: 4,
  chaar: 4,
  five: 5,
  paanch: 5,
};

function extractQuantity(text: string, keyword: string): number | null {
  // Look for number before keyword (e.g., "3 bags of clothes", "2 purane phone")
  const words = text.split(/\s+/);
  const kwParts = keyword.split(/\s+/);
  const kwIndex = words.findIndex((w) => w.includes(kwParts[0]));

  if (kwIndex > 0) {
    // Check up to 3 words before the keyword
    for (let i = kwIndex - 1; i >= Math.max(0, kwIndex - 3); i--) {
      const candidate = words[i].replace(/[^0-9a-zA-Z]/g, '');
      if (/^\d+$/.test(candidate)) {
        const num = parseInt(candidate, 10);
        if (num > 0 && num < 100) return num;
      }
      if (NUMBER_WORDS[candidate.toLowerCase()]) {
        return NUMBER_WORDS[candidate.toLowerCase()];
      }
    }
  }

  return null;
}

function extractCondition(text: string, keyword: string): Condition {
  const words = text.split(/\s+/);
  const kwParts = keyword.split(/\s+/);
  const kwIndex = words.findIndex((w) => w.includes(kwParts[0]));

  let context = text;
  if (kwIndex !== -1) {
    const start = Math.max(0, kwIndex - 4);
    const end = Math.min(words.length, kwIndex + kwParts.length + 5);
    context = words.slice(start, end).join(' ');
  }

  // Global multi-item condition indicators
  if (
    text.includes('sab chal rah') ||
    text.includes('all working') ||
    text.includes('all work') ||
    text.includes('both working')
  ) {
    return 'working';
  }

  const lower = context.toLowerCase();

  if (
    lower.includes('broken') ||
    lower.includes('dead') ||
    lower.includes('kharab') ||
    lower.includes('toota') ||
    lower.includes("doesn't work") ||
    lower.includes('not working')
  ) {
    return 'broken';
  }

  if (
    lower.includes('cracked') ||
    lower.includes('slow') ||
    lower.includes('minor damage') ||
    lower.includes('repairable') ||
    lower.includes('repair')
  ) {
    return 'repairable';
  }

  if (
    lower.includes('working') ||
    lower.includes('chal raha') ||
    lower.includes('chal rahe') ||
    lower.includes('in good condition') ||
    lower.includes('good condition')
  ) {
    return 'working';
  }

  return 'unknown';
}

function extractLocationHint(query: string): string | null {
  // Look for sector or area pattern like "Sector 15", "Sector 21", "NIT 1"
  const sectorMatch = query.match(/sector[\s-]?\d+[a-zA-Z]?/i);
  if (sectorMatch) {
    return sectorMatch[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const nitMatch = query.match(/nit[\s-]?\d+/i);
  if (nitMatch) {
    return nitMatch[0].toUpperCase();
  }

  return null;
}

/**
 * Classifies a user query using keyword matching
 */
export function classifyWithFallback(query: string): Interpretation {
  const normalized = query.toLowerCase().trim();
  const matchedItems: InterpretedItem[] = [];
  const unsupportedItems: UnsupportedItem[] = [];

  // 1. Check for prompt injection attempts or system instructions
  if (
    normalized.includes('ignore previous') ||
    normalized.includes('system prompt') ||
    normalized.includes('print your')
  ) {
    return {
      items: [],
      unsupportedItems: [],
      locationHint: null,
      clarifyingQuestion: 'Please describe the items you want to repair, donate, or recycle.',
    };
  }

  // 2. Check unsupported rules first
  for (const rule of UNSUPPORTED_RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        unsupportedItems.push({
          label: kw,
          reason: rule.reason,
        });
        break; // One match per category
      }
    }
  }

  // 3. Match items
  for (const rule of ITEM_KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      const kwRegex = new RegExp(`(?:^|\\W)${kw}(?:$|\\W)`, 'i');
      if (kwRegex.test(normalized)) {
        const qty = extractQuantity(normalized, kw);
        const cond = extractCondition(normalized, kw);

        matchedItems.push({
          label: kw,
          itemType: rule.itemType,
          condition: cond,
          quantity: qty,
        });
        break; // Match rule once
      }
    }
  }

  const locationHint = extractLocationHint(query);

  // 4. If no items were identified and no unsupported items
  let clarifyingQuestion: string | null = null;
  if (matchedItems.length === 0 && unsupportedItems.length === 0) {
    clarifyingQuestion =
      'Could you specify what kind of electronics or household items you have and their condition?';
  }

  return {
    items: matchedItems.slice(0, 10),
    unsupportedItems,
    locationHint,
    clarifyingQuestion,
  };
}
