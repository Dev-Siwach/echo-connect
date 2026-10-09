/**
 * EcoConnect Taxonomy (controlled vocabulary v1)
 * Source of truth: docs/PROJECT_SPEC.md §2.5
 */

export const ITEM_TYPES = [
  'phone_tablet',
  'computer_display',
  'charger_cable',
  'small_appliance',
  'battery_household',
  'battery_lithium',
  'clothing_textiles',
  'books_stationery',
  'furniture',
  'household_goods',
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const CATEGORIES = ['electronics', 'reuse'] as const;
export type Category = (typeof CATEGORIES)[number];

export const ITEM_TYPE_METADATA: Record<
  ItemType,
  { category: Category; label: string; includes: string }
> = {
  phone_tablet: {
    category: 'electronics',
    label: 'Phones & tablets',
    includes: 'smartphones, feature phones, tablets',
  },
  computer_display: {
    category: 'electronics',
    label: 'Laptops, computers & displays',
    includes: 'laptops, desktops, monitors, TVs, keyboards, mice',
  },
  charger_cable: {
    category: 'electronics',
    label: 'Chargers, cables & accessories',
    includes: 'chargers, adapters, cables, earphones, small speakers',
  },
  small_appliance: {
    category: 'electronics',
    label: 'Small appliances',
    includes: 'mixer, kettle, iron, fan, router, hair dryer',
  },
  battery_household: {
    category: 'electronics',
    label: 'Household batteries',
    includes: 'AA/AAA, button cells, 9V',
  },
  battery_lithium: {
    category: 'electronics',
    label: 'Lithium batteries & power banks',
    includes: 'power banks, phone or laptop batteries',
  },
  clothing_textiles: {
    category: 'reuse',
    label: 'Clothes & textiles',
    includes: 'clothes, shoes, bags, bedsheets, blankets',
  },
  books_stationery: {
    category: 'reuse',
    label: 'Books & stationery',
    includes: 'books, textbooks, notebooks, stationery',
  },
  furniture: {
    category: 'reuse',
    label: 'Furniture',
    includes: 'tables, chairs, shelves, beds (usable)',
  },
  household_goods: {
    category: 'reuse',
    label: 'Household goods',
    includes: 'kitchenware, utensils, decor, toys',
  },
};

export const CONDITIONS = ['working', 'repairable', 'broken', 'unknown'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CONDITION_LABELS: Record<Condition, string> = {
  working: 'Working',
  repairable: 'Repairable / partly works',
  broken: 'Broken / dead',
  unknown: 'Condition unknown',
};

/**
 * Waste hierarchy order:
 * 1. repair -> 2. resell_reuse -> 3. donate -> 4. ewaste_collection -> 5. recycle
 */
export const ROUTES = [
  'repair',
  'resell_reuse',
  'donate',
  'ewaste_collection',
  'recycle',
] as const;

export type Route = (typeof ROUTES)[number];

export const ROUTE_METADATA: Record<
  Route,
  { order: number; label: string; meaning: string }
> = {
  repair: {
    order: 1,
    label: 'Repair',
    meaning: 'Fix it and keep using it',
  },
  resell_reuse: {
    order: 2,
    label: 'Resell / reuse',
    meaning: 'Refurbisher, buy-back, thrift or second-hand',
  },
  donate: {
    order: 3,
    label: 'Donate',
    meaning: 'NGO, donation drive, community collection',
  },
  ewaste_collection: {
    order: 4,
    label: 'E-waste collection',
    meaning: 'Authorized e-waste or battery collection point or recycler',
  },
  recycle: {
    order: 5,
    label: 'Recycle',
    meaning: 'Textile or paper recyclers, other material recovery',
  },
};

export const UNSUPPORTED_REASONS = [
  'large_appliance',
  'hazardous',
  'out_of_scope',
  'unclear',
] as const;

export type UnsupportedReason = (typeof UNSUPPORTED_REASONS)[number];

export const UNSUPPORTED_REASON_LABELS: Record<UnsupportedReason, string> = {
  large_appliance: 'Large appliances (fridge, AC, washing machine)',
  hazardous: 'Hazardous materials (paint, chemicals, medicines, lead-acid batteries)',
  out_of_scope: 'Out of scope (food waste, debris, mixed garbage, vehicles)',
  unclear: 'Item description was unclear',
};

export const SERVICE_MODES = ['drop_off', 'pickup', 'online_booking'] as const;
export type ServiceMode = (typeof SERVICE_MODES)[number];

export const COST_OPTIONS = ['free', 'paid', 'pays_you', 'varies', 'unknown'] as const;
export type CostOption = (typeof COST_OPTIONS)[number];

export const VERIFICATION_LEVELS = [
  'called',
  'official_list',
  'website_only',
  'unverified',
] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const VERIFICATION_METADATA: Record<
  VerificationLevel,
  { rank: number; badgePrefix: string; defaultVisible: boolean }
> = {
  called: {
    rank: 3,
    badgePrefix: 'Confirmed by phone',
    defaultVisible: true,
  },
  official_list: {
    rank: 2,
    badgePrefix: 'On official authorized list',
    defaultVisible: true,
  },
  website_only: {
    rank: 1,
    badgePrefix: 'Listed on their website',
    defaultVisible: true,
  },
  unverified: {
    rank: 0,
    badgePrefix: 'Not yet verified',
    defaultVisible: false,
  },
};

export const CLASSIFIER_MODES = ['bedrock', 'fallback', 'manual'] as const;
export type ClassifierMode = (typeof CLASSIFIER_MODES)[number];
