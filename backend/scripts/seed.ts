#!/usr/bin/env node

/**
 * Seed and validation script
 * Validates provider records, localities, and prep checklists.
 * In dry-run mode, validates data without calling AWS.
 * In seed mode, inserts records into the DynamoDB table.
 * Source of truth: docs/roles/MEMBER_1_BACKEND.md Step 3
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  ProviderRecordSchema,
  LocalitySchema,
  ContentSchema,
  type ProviderRecord,
  type Locality,
} from '../src/shared/contracts.js';
import { ITEM_TYPES, UNSUPPORTED_REASONS } from '../src/shared/taxonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ValidationIssue {
  index: number;
  providerId?: string;
  name?: string;
  errors: string[];
}

export interface ValidationResult {
  success: boolean;
  totalRecords: number;
  validRecords: ProviderRecord[];
  issues: ValidationIssue[];
  duplicates: string[];
  localitiesCount: number;
  sampleCount: number;
}

/**
 * Validates localities, static content, and provider records
 */
export function validateSeedData(
  providerFilePath: string,
  localitiesFilePath?: string,
  contentFilePath?: string
): ValidationResult {
  const defaultLocalitiesPath = path.resolve(__dirname, '../src/shared/localities.faridabad.json');
  const defaultContentPath = path.resolve(__dirname, '../src/shared/content.json');

  const locPath = localitiesFilePath || defaultLocalitiesPath;
  const cntPath = contentFilePath || defaultContentPath;

  // 1. Validate localities
  if (!fs.existsSync(locPath)) {
    throw new Error(`Localities file not found: ${locPath}`);
  }
  const rawLocalities = JSON.parse(fs.readFileSync(locPath, 'utf8'));
  const localities = z.array(LocalitySchema).parse(rawLocalities);
  const validLocalityIds = new Set(localities.map((l: Locality) => l.id));

  // 2. Validate content
  if (!fs.existsSync(cntPath)) {
    throw new Error(`Content file not found: ${cntPath}`);
  }
  const rawContent = JSON.parse(fs.readFileSync(cntPath, 'utf8'));
  const content = ContentSchema.parse(rawContent);

  for (const itemType of ITEM_TYPES) {
    if (!content.checklists[itemType] || content.checklists[itemType].length === 0) {
      throw new Error(`Missing prep checklist for item type "${itemType}" in ${cntPath}`);
    }
  }
  for (const reason of UNSUPPORTED_REASONS) {
    if (!content.unsupportedMessages[reason]) {
      throw new Error(`Missing unsupported message for reason "${reason}" in ${cntPath}`);
    }
  }

  // 3. Validate provider records
  if (!fs.existsSync(providerFilePath)) {
    throw new Error(`Provider data file not found: ${providerFilePath}`);
  }

  const rawProviders = JSON.parse(fs.readFileSync(providerFilePath, 'utf8'));
  if (!Array.isArray(rawProviders)) {
    throw new Error(`Provider file must contain a JSON array of records: ${providerFilePath}`);
  }

  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  const duplicates = new Set<string>();
  const validRecords: ProviderRecord[] = [];
  let sampleCount = 0;

  for (let i = 0; i < rawProviders.length; i++) {
    const raw = rawProviders[i];
    const errors: string[] = [];

    // Check duplicate ID
    if (raw && typeof raw === 'object' && 'providerId' in raw && typeof raw.providerId === 'string') {
      if (seenIds.has(raw.providerId)) {
        duplicates.add(raw.providerId);
        errors.push(`Duplicate providerId: "${raw.providerId}"`);
      } else {
        seenIds.add(raw.providerId);
      }
    }

    // Check Zod schema
    const parsed = ProviderRecordSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`Field "${issue.path.join('.')}": ${issue.message}`);
      }
    }

    // Check locality exists in localities file
    if (raw && typeof raw === 'object' && 'localityId' in raw && typeof raw.localityId === 'string') {
      if (!validLocalityIds.has(raw.localityId)) {
        errors.push(
          `Locality "${raw.localityId}" does not exist in localities file (${locPath})`
        );
      }
    }

    if (errors.length > 0) {
      issues.push({
        index: i,
        providerId: raw?.providerId,
        name: raw?.name,
        errors,
      });
    } else if (parsed.success) {
      validRecords.push(parsed.data);
      if (parsed.data.isSample) {
        sampleCount++;
      }
    }
  }

  return {
    success: issues.length === 0,
    totalRecords: rawProviders.length,
    validRecords,
    issues,
    duplicates: Array.from(duplicates),
    localitiesCount: localities.length,
    sampleCount,
  };
}

/**
 * Inserts valid records into DynamoDB in batches of 25
 */
export async function seedDynamoDB(
  records: ProviderRecord[],
  tableName: string,
  region: string = process.env.AWS_REGION || 'ap-south-1'
): Promise<number> {
  const client = new DynamoDBClient({ region });
  const docClient = DynamoDBDocumentClient.from(client);

  const BATCH_SIZE = 25;
  let seededCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    let putRequests = chunk.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }));

    let requestItems: Record<string, typeof putRequests> = {
      [tableName]: putRequests,
    };

    while (requestItems[tableName] && requestItems[tableName].length > 0) {
      const command = new BatchWriteCommand({
        RequestItems: requestItems,
      });

      const response = await docClient.send(command);
      const unprocessed = response.UnprocessedItems?.[tableName] || [];

      seededCount += requestItems[tableName].length - unprocessed.length;

      if (unprocessed.length > 0) {
        requestItems = { [tableName]: unprocessed as typeof putRequests };
        // Small backoff before retrying unprocessed items
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        break;
      }
    }
  }

  return seededCount;
}

/**
 * CLI Entrypoint
 */
async function main() {
  const args = process.argv.slice(2);
  let filePath: string | null = null;
  let tableName: string | null = null;
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length) {
      filePath = args[i + 1];
      i++;
    } else if (args[i] === '--table' && i + 1 < args.length) {
      tableName = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      isDryRun = true;
    }
  }

  if (!filePath) {
    console.error('Error: --file <path> is required.');
    console.error('Usage: npm run seed -- --file <path> [--table <tableName>] [--dry-run]');
    process.exit(1);
  }

  const resolvedFilePath = path.resolve(process.cwd(), filePath);
  console.log(`[seed] Validating data from: ${resolvedFilePath}`);

  let result: ValidationResult;
  try {
    result = validateSeedData(resolvedFilePath);
  } catch (err: unknown) {
    console.error(`[seed] Fatal error during validation: ${(err as Error).message}`);
    process.exit(1);
  }

  if (!result.success) {
    console.error('\n❌ VALIDATION FAILED! The seed run has been aborted.\n');
    console.error(`Found ${result.issues.length} invalid record(s) out of ${result.totalRecords} total:`);

    for (const issue of result.issues) {
      const header = `Record #${issue.index + 1} (ID: ${issue.providerId || 'UNKNOWN'}, Name: "${issue.name || 'UNKNOWN'}"):`;
      console.error(`\n  ${header}`);
      for (const err of issue.errors) {
        console.error(`    • ${err}`);
      }
    }

    if (result.duplicates.length > 0) {
      console.error(`\nDuplicate providerId(s) detected: ${result.duplicates.join(', ')}`);
    }

    console.error('\nPlease fix all validation issues before seeding.');
    process.exit(1);
  }

  console.log('\n✅ VALIDATION PASSED!');
  console.log(`  • Localities checked: ${result.localitiesCount}`);
  console.log(`  • Content checklists & messages: OK`);
  console.log(`  • Valid provider records: ${result.validRecords.length}`);
  console.log(`  • Sample records (isSample: true): ${result.sampleCount}`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Validation successful. No changes made to DynamoDB.');
    process.exit(0);
  }

  if (!tableName) {
    console.error('\nError: --table <tableName> is required when not in --dry-run mode.');
    process.exit(1);
  }

  console.log(`\n[seed] Inserting ${result.validRecords.length} records into DynamoDB table: "${tableName}"...`);
  try {
    const count = await seedDynamoDB(result.validRecords, tableName);
    console.log(`✅ Successfully seeded ${count} records to DynamoDB table "${tableName}".`);
    process.exit(0);
  } catch (err: unknown) {
    console.error(`❌ DynamoDB batch write failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

// Run CLI when executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  main();
}
