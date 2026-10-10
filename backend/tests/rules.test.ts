import { describe, it, expect } from 'vitest';
import { ROUTE_RULES, getRoutesForItem } from '../src/lib/rules.js';
import {
  ITEM_TYPES,
  CONDITIONS,
  type ItemType,
  type Condition,
  type Route,
} from '../src/shared/taxonomy.js';

describe('Route Rules (Deterministic waste hierarchy engine)', () => {
  // Expected table from spec §2.5
  const expectedTable: Record<ItemType, Record<Condition, Route[]>> = {
    phone_tablet: {
      working: ['resell_reuse', 'donate', 'ewaste_collection'],
      repairable: ['repair', 'resell_reuse', 'ewaste_collection'],
      broken: ['repair', 'ewaste_collection'],
      unknown: ['repair', 'resell_reuse', 'ewaste_collection'],
    },
    computer_display: {
      working: ['resell_reuse', 'donate', 'ewaste_collection'],
      repairable: ['repair', 'resell_reuse', 'ewaste_collection'],
      broken: ['repair', 'ewaste_collection'],
      unknown: ['repair', 'resell_reuse', 'ewaste_collection'],
    },
    small_appliance: {
      working: ['donate', 'resell_reuse', 'ewaste_collection'],
      repairable: ['repair', 'ewaste_collection'],
      broken: ['repair', 'ewaste_collection'],
      unknown: ['repair', 'ewaste_collection'],
    },
    charger_cable: {
      working: ['donate', 'ewaste_collection'],
      repairable: ['ewaste_collection'],
      broken: ['ewaste_collection'],
      unknown: ['ewaste_collection'],
    },
    battery_household: {
      working: ['ewaste_collection'],
      repairable: ['ewaste_collection'],
      broken: ['ewaste_collection'],
      unknown: ['ewaste_collection'],
    },
    battery_lithium: {
      working: ['ewaste_collection'],
      repairable: ['ewaste_collection'],
      broken: ['ewaste_collection'],
      unknown: ['ewaste_collection'],
    },
    clothing_textiles: {
      working: ['donate', 'resell_reuse'],
      repairable: ['repair', 'donate', 'recycle'],
      broken: ['recycle'],
      unknown: ['donate', 'recycle'],
    },
    books_stationery: {
      working: ['donate', 'resell_reuse'],
      repairable: ['donate', 'recycle'],
      broken: ['recycle'],
      unknown: ['donate', 'recycle'],
    },
    furniture: {
      working: ['donate', 'resell_reuse'],
      repairable: ['repair', 'donate'],
      broken: ['recycle'],
      unknown: ['donate', 'repair'],
    },
    household_goods: {
      working: ['donate', 'resell_reuse'],
      repairable: ['repair', 'donate'],
      broken: ['recycle'],
      unknown: ['donate', 'recycle'],
    },
  };

  // Test every single cell of the 10x4 matrix (40 cells)
  for (const itemType of ITEM_TYPES) {
    describe(`Item type: ${itemType}`, () => {
      for (const condition of CONDITIONS) {
        it(`cell [${itemType}, ${condition}] matches spec §2.5 exactly`, () => {
          const expected = expectedTable[itemType][condition];
          const actual = getRoutesForItem(itemType, condition);
          expect(actual).toEqual(expected);
          expect(ROUTE_RULES[itemType][condition]).toEqual(expected);
        });
      }
    });
  }

  it('throws an error for unrecognized item type or condition', () => {
    // @ts-expect-error invalid item type test
    expect(() => getRoutesForItem('invalid_item', 'broken')).toThrow();
    // @ts-expect-error invalid condition test
    expect(() => getRoutesForItem('phone_tablet', 'super_broken')).toThrow();
  });
});
