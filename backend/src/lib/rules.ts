/**
 * Deterministic route rules based on waste hierarchy
 * Source of truth: docs/PROJECT_SPEC.md §2.5
 */

import type { ItemType, Condition, Route } from '../shared/taxonomy.js';

export const ROUTE_RULES: Record<ItemType, Record<Condition, readonly Route[]>> = {
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

/**
 * Get ordered routes for an item and condition
 */
export function getRoutesForItem(itemType: ItemType, condition: Condition): readonly Route[] {
  const routes = ROUTE_RULES[itemType]?.[condition];
  if (!routes) {
    throw new Error(`Invalid itemType (${itemType}) or condition (${condition})`);
  }
  return routes;
}
