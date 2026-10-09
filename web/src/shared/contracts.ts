// GENERATED — DO NOT EDIT
// This file is generated from shared/ by scripts/sync-shared.mjs.
// Any direct changes will be overwritten.

import { z } from 'zod';
import {
  ITEM_TYPES,
  CONDITIONS,
  ROUTES,
  UNSUPPORTED_REASONS,
  SERVICE_MODES,
  COST_OPTIONS,
  VERIFICATION_LEVELS,
  CLASSIFIER_MODES,
} from './taxonomy.js';

export const PhoneRegex = /^\+91\d{10}$/;
export const ProviderIdRegex = /^fbd-\d{4}$/;

/**
 * Verification metadata
 */
export const VerificationSchema = z.object({
  level: z.enum(VERIFICATION_LEVELS),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  verifiedBy: z.string().min(1),
  method: z.string().min(1),
  sourceUrl: z.string().url().optional(),
});
export type Verification = z.infer<typeof VerificationSchema>;

/**
 * Provider record stored in DynamoDB
 */
export const ProviderRecordSchema = z.object({
  city: z.string().min(1),
  providerId: z.string().regex(ProviderIdRegex, 'ID must be fbd-XXXX'),
  name: z.string().min(1),
  description: z.string().min(1),
  routes: z.array(z.enum(ROUTES)).min(1),
  acceptedItemTypes: z.array(z.enum(ITEM_TYPES)).min(1),
  acceptanceNotes: z.string().optional(),
  serviceModes: z.array(z.enum(SERVICE_MODES)).min(1),
  cost: z.enum(COST_OPTIONS),
  address: z.string().min(1),
  localityId: z.string().min(1),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  phone: z.string().regex(PhoneRegex, 'Must be +91 followed by 10 digits').optional(),
  whatsapp: z.string().regex(PhoneRegex, 'Must be +91 followed by 10 digits').optional(),
  website: z.string().url().optional(),
  mapsUrl: z.string().url().optional(),
  hours: z.string().optional(),
  verification: VerificationSchema,
  isSample: z.boolean(),
  active: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type ProviderRecord = z.infer<typeof ProviderRecordSchema>;

/**
 * Provider card returned by API (record + optional distance)
 */
export const ProviderCardSchema = ProviderRecordSchema.extend({
  distanceKm: z.number().nonnegative().optional(),
});
export type ProviderCard = z.infer<typeof ProviderCardSchema>;

/**
 * Locality item
 */
export const LocalitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});
export type Locality = z.infer<typeof LocalitySchema>;

/**
 * Content checklists and static messages
 */
export const ContentSchema = z.object({
  checklists: z.record(z.enum(ITEM_TYPES), z.array(z.string())),
  unsupportedMessages: z.record(z.enum(UNSUPPORTED_REASONS), z.string()),
  emptyStateMessage: z.string().min(1),
});
export type Content = z.infer<typeof ContentSchema>;

/**
 * Interpreted item from Bedrock / Fallback
 */
export const InterpretedItemSchema = z.object({
  label: z.string().min(1).max(60),
  itemType: z.enum(ITEM_TYPES),
  condition: z.enum(CONDITIONS),
  quantity: z.number().int().positive().nullable(),
});
export type InterpretedItem = z.infer<typeof InterpretedItemSchema>;

export const UnsupportedItemSchema = z.object({
  label: z.string().min(1).max(60),
  reason: z.enum(UNSUPPORTED_REASONS),
});
export type UnsupportedItem = z.infer<typeof UnsupportedItemSchema>;

export const InterpretationSchema = z.object({
  items: z.array(InterpretedItemSchema).max(10),
  unsupportedItems: z.array(UnsupportedItemSchema),
  locationHint: z.string().max(100).nullable(),
  clarifyingQuestion: z.string().max(200).nullable(),
});
export type Interpretation = z.infer<typeof InterpretationSchema>;

/**
 * Request payload for POST /search
 * Must supply EITHER query (3-500 chars) OR items (at least 1 item)
 */
export const SearchRequestSchema = z
  .object({
    query: z.string().min(3).max(500).optional(),
    items: z.array(InterpretedItemSchema).min(1).optional(),
    localityId: z.string().min(1).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .refine((data) => (data.query !== undefined) !== (data.items !== undefined), {
    message: 'Must provide either query or items, but not both',
  });
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export const SearchResultRouteSchema = z.object({
  route: z.enum(ROUTES),
  label: z.string().min(1),
  providers: z.array(ProviderCardSchema),
  unverifiedProviders: z.array(ProviderCardSchema),
});
export type SearchResultRoute = z.infer<typeof SearchResultRouteSchema>;

export const SearchResultItemSchema = z.object({
  itemType: z.enum(ITEM_TYPES),
  label: z.string().min(1),
  condition: z.enum(CONDITIONS),
  checklist: z.array(z.string()),
  routes: z.array(SearchResultRouteSchema),
});
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

export const SearchMetaSchema = z.object({
  classifier: z.enum(CLASSIFIER_MODES),
  city: z.string().min(1),
  latencyMs: z.number().nonnegative(),
  origin: z.string().optional(),
});
export type SearchMeta = z.infer<typeof SearchMetaSchema>;

export const SearchResponseSchema = z.object({
  requestId: z.string().uuid(),
  interpretation: InterpretationSchema,
  results: z.array(SearchResultItemSchema),
  meta: SearchMetaSchema,
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

/**
 * Response payload for GET /providers
 */
export const ProvidersResponseSchema = z.object({
  providers: z.array(ProviderCardSchema),
  unverifiedProviders: z.array(ProviderCardSchema),
});
export type ProvidersResponse = z.infer<typeof ProvidersResponseSchema>;

/**
 * Response payload for GET /health
 */
export const HealthResponseSchema = z.object({
  ok: z.boolean(),
  version: z.string().min(1),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Error envelope
 */
export const ErrorCodeSchema = z.enum(['INVALID_INPUT', 'NOT_FOUND', 'INTERNAL']);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string().min(1),
  }),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
