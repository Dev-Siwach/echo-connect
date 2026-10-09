# Role Brief: Member 1, Cloud & Backend Lead

> **For the AI agent working with Member 1.** Read [`AGENTS.md`](../../AGENTS.md) first, then this
> file, then the spec sections each task points to. This brief tells you what you own, what
> you deliver to the other two members, and in what order.

## 1. Your mission

Build and deploy the EcoConnect API on AWS: SAM stack, DynamoDB, three Lambda routes, the
Bedrock interpreter with a fallback classifier, and the matching engine. You also publish
the **shared contracts** that the frontend builds against. **You are the first critical
dependency of the team. Contracts go out first.**

## 2. Ownership

| You OWN (create and edit) | You READ but don't edit | You NEVER touch |
|---|---|---|
| `backend/**` (except `backend/tests/golden-queries.json`) | `shared/localities.faridabad.json`, `shared/content.json`, `data/providers/*.json` (Member 3) | `web/**`, `amplify.yml` (Member 2) |
| `shared/contracts.ts`, `shared/taxonomy.ts`, `shared/fixtures/**` | `backend/tests/golden-queries.json` (Member 3) | `README.md`, `docs/**` except ticking your rows in `docs/TASKS.md` |
| `scripts/sync-shared.mjs` | | Generated `web/src/shared/**` (only via the sync script) |
| Root `package.json` / `.nvmrc` if needed | | |

**Contract changes** (`shared/contracts.ts`, `shared/taxonomy.ts`) need Member 2's agreement
before merging. If you need a data or content change, write a change request for Member 3.

## 3. Spec sections you need

`PROJECT_SPEC.md` §1.3, §2.1–2.9, §2.11–2.15, Part 3 (FR-02–FR-05, FR-09–FR-12, FR-15, FR-16,
NFR-01/02/06/07/08), and Part 4 phases 1, 2, 3 and 5. Also `DECISIONS.md` ADR-002–009, 013, 014, 015.

## 4. Deliverables to teammates (your "API")

| # | Deliverable | To | Due (IST) | Definition |
|---|---|---|---|---|
| D1 | `shared/` contracts + taxonomy + fixtures + sync script, merged to `main` | Member 2 | **Oct 9, 16:00** | Member 2 can `import` types and mock every UI state from `shared/fixtures/` |
| D2 | Zod schemas for provider records, localities and `content.json`, plus `seed --dry-run` | Member 3 | Oct 9, 20:00 | Member 3 can validate their files locally without AWS access |
| D3 | Deployed API URL (fallback classifier OK) | Member 2 | **Oct 10, 11:00** | `smoke.sh` passes; `/search`, `/providers`, `/health` return contract-valid JSON |
| D4 | Bedrock live + golden eval run | All | Oct 10, 16:00 | `meta.classifier: "bedrock"`, eval ≥ 10/12 |
| D5 | Real data seeded + CORS includes Amplify domain | All | Oct 10, 21:00 | Production API returns real providers to the Amplify site |

## 5. Work plan

Work on short branches off `main`. Suggested names are given for each step. Open a PR when
the step's done-gate passes. Member 2 or 3 reviews it (a quick look is fine).

### Step 1: Contracts and fixtures (`feat/contracts`) → D1, ~1.5 h, top priority

Build:
- `shared/taxonomy.ts`: item types, categories, conditions, routes (with hierarchy order),
  unsupported reasons, human labels (spec §2.5).
- `shared/contracts.ts`: zod schemas plus inferred types for `ProviderRecord`, `ProviderCard`,
  `Locality`, `Content` (shape in `DATA_GUIDELINES.md` §7), `Interpretation`, `SearchRequest`
  (`query` XOR `items`), `SearchResponse`, `ProvidersResponse`, `HealthResponse`, `ErrorResponse`
  (spec §2.6–2.7). Include length caps for AI free-text fields (spec §2.8).
- `shared/fixtures/`: example JSON responses covering every UI state:
  `search.multi-item.json`, `search.unsupported-only.json`, `search.clarifying.json`,
  `search.fallback.json`, `search.no-providers.json`, `providers.batteries.json`.
  **All providers in fixtures must be obviously fictional** ("Example Repair Shop",
  `+910000000000`, `isSample: true`).
- Placeholder `shared/localities.faridabad.json` and `shared/content.json` with **only**
  `"PLACEHOLDER"`/`"TODO"` values that pass the schema. Member 3 replaces them.
- `scripts/sync-shared.mjs`: copies `shared/` into `backend/src/shared/` and
  `web/src/shared/`, adding a `// GENERATED — DO NOT EDIT` header to `.ts` files.
- Backend scaffold: `backend/package.json`, strict `tsconfig.json`, vitest.
- Test: `backend/tests/contracts.test.ts` parses every fixture with its schema.

Done-gate: `node scripts/sync-shared.mjs && cd backend && npm test && npx tsc --noEmit`.
Commit: `feat(contracts): shared taxonomy, zod contracts and UI fixtures`.
Then **tell Member 2 it's merged.**

### Step 2: Pure engine (`feat/engine`), ~1.5 h

`lib/rules.ts` (table in spec §2.5, one test per cell), `lib/geo.ts`, `lib/match.ts`
(pseudo-code in spec §2.9), `lib/checklists.ts` (loads `shared/content.json`, validates
with zod, and fails loudly if an item type is missing). There are no AWS imports in `lib/`
except `db.ts` and `classify/bedrock.ts`.

Done-gate: tests cover ranking order, distance sort, unverified separation, sample filtering
and empty results.

### Step 3: Seed and validation (`feat/seed`) → D2, ~45 min

`backend/scripts/seed.ts`: `--file`, `--table`, `--dry-run`. It validates every record and
prints a per-record error report. It aborts the whole run if any record is invalid and checks
for duplicate `providerId`s. It also validates `shared/localities.faridabad.json` and
`shared/content.json`. Ship `data/providers/sample.json` with two obviously fictional
`isSample: true` records, for local development only. Don't put them in `faridabad.json`.

### Step 4: AWS stack with fallback classifier (`feat/api`) → D3, ~3 h

Prerequisite (Phase 0): Bedrock model access enabled, ADR-013 filled in, budget alert set.
Build `template.yaml` (spec §2.11), `lib/db.ts`, `lib/log.ts`, `lib/classify/fallback.ts` (with
EN plus Hinglish keywords, tested against golden queries 1, 3, 5 and 10), `classify/index.ts`, the
three handlers and `scripts/smoke.sh`. CORS allows `http://localhost:3000` now, and the Amplify domain
comes later as a parameter.

Done-gate: `sam build && sam deploy`, seed the sample file, run `smoke.sh` against the URL,
and see one JSON log line per request in CloudWatch. **Send the API URL to Member 2.**

### Step 5: Bedrock (`feat/bedrock`) → D4, ~2 h

Follow spec §2.8 exactly: `prompt.ts`, `bedrock.ts` (Converse with forced tool use, temperature 0,
6 s timeout, zod validation), fallback switching and `meta.classifier`. Use mocked unit tests
for the valid, invalid-enum and timeout cases. Add an `eval:golden` script that reads Member 3's
`backend/tests/golden-queries.json` and prints a pass/fail table.

Done-gate: eval ≥ 10/12, and the deployed `/search` returns `classifier: "bedrock"`. Setting
`CLASSIFIER_MODE=fallback` still works.

### Step 6: Production wiring → D5

When Member 3's `data/providers/faridabad.json` passes `--dry-run`, seed it. Set
`SHOW_SAMPLE_DATA=false`. Add the Amplify domain (from Member 2) to CORS and redeploy.
Re-run `smoke.sh` and the eval.

### Step 7: Hardening (until the feature freeze, Oct 11, 12:00)

Check p95 latency in CloudWatch (NFR-01/02), log truncation (NFR-06), IAM scoping and
throttling (NFR-07). Fix bugs reported by Member 3's QA. **No new features after the freeze.**

## 6. Prompts to paste into your AI agent

**Start of every session**
```text
I am Member 1 (Cloud & Backend Lead). Read AGENTS.md, docs/roles/MEMBER_1_BACKEND.md and the
spec sections for Step <N>. Only edit files Member 1 owns. Propose a short plan (files +
responsibilities) and wait for my OK before writing code.
```

**Step 1**
```text
Do Step 1 of docs/roles/MEMBER_1_BACKEND.md (contracts, fixtures, sync script, backend
scaffold, contract tests). Fixtures must cover every UI state listed and use only obviously
fictional providers with isSample: true. Finish by running the done-gate and pasting output.
```

**Steps 2 to 6:** use the matching Phase prompts in `PROJECT_SPEC.md` Part 4. Add:
*"Follow the step in MEMBER_1_BACKEND.md where it differs from the spec."*

## 7. Handoff and integration checklist

- [ ] D1 merged and Member 2 notified (Sync 1)
- [ ] D2: Member 3 has run `--dry-run` successfully on their own machine
- [ ] D3: API URL shared, and Member 2 has hit it from `localhost` with no CORS error (Sync 2)
- [ ] D4: golden eval result posted in team chat
- [ ] D5: real data seeded, and the Amplify site shows real providers (Sync 3)
- [ ] Your rows in `docs/TASKS.md` ticked

## 8. Watch out for

- Don't let the agent invent providers for fixtures or tests. Use fictional placeholders only.
- Don't edit `web/` "just to fix a type". Fix the contract in `shared/` and re-sync instead.
- Bedrock model IDs and regional availability change. Use what the console shows (ADR-013).
- Lambda bundling: make sure esbuild includes the JSON from `src/shared/`, either by importing it or bundling it.
- Keep AWS credentials out of the repo. Each member uses their own IAM user or profile, never root keys.
