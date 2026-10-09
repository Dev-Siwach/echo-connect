# Architecture Decision Records (ADRs)

This file records the important decisions and the reasons behind them. Add a new entry
whenever a decision is made or reversed. Don't delete old entries. Mark them
`Superseded by ADR-XXX` instead.

**Template**

```markdown
## ADR-XXX: Title
- **Status:** Proposed | Accepted | Superseded by ADR-YYY
- **Date:** YYYY-MM-DD
- **Context:** What problem or constraint forced a decision?
- **Decision:** What we chose.
- **Alternatives considered:** What we rejected and why.
- **Consequences:** Trade-offs we accept.
```

---

## ADR-001: Scope is two categories in one city
- **Status:** Accepted · **Date:** 2026-10-09
- **Context:** About two days of build time. Data trust is the product's core value.
- **Decision:** Two categories (Electronics & batteries, and Reuse & donation) and Faridabad only. Expand into Delhi-NCR only with verified records.
- **Alternatives considered:** A nationwide directory (impossible to verify), adding large appliances and hazardous waste (needs pickup logistics and regulatory nuance).
- **Consequences:** A smaller but honest dataset. The pitch is depth over breadth.

## ADR-002: The LLM interprets and never invents providers or trust
- **Status:** Accepted · **Date:** 2026-10-09
- **Context:** LLMs hallucinate addresses and phone numbers. Wrong directions destroy user trust.
- **Decision:** Bedrock only converts free text into an `Interpretation`. Providers come only from DynamoDB. Trust is shown only from human-collected `verification` metadata.
- **Alternatives considered:** RAG over provider documents, where the LLM writes recommendations. That is more "AI" but adds hallucination risk and makes the output hard to test.
- **Consequences:** Results are explainable and testable. The AI's role is narrow but clearly valuable for multi-item, Hinglish and messy input.

## ADR-003: Controlled taxonomy plus deterministic route rules
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** 10 item types, 4 conditions and 5 routes ordered by the waste hierarchy. A fixed `(itemType, condition) → routes[]` table lives in `rules.ts`.
- **Alternatives considered:** Letting the LLM choose routes.
- **Consequences:** Every cell is unit-tested, and the team can review the rules. New item types need a code change, which is acceptable.

## ADR-004: Bedrock Converse API with forced tool use for structured output
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** A single tool, `record_interpretation`, whose JSON schema has enums. `toolChoice` forces it (falling back to `any` if the model doesn't support forcing). Output is always validated with zod. Temperature 0.
- **Alternatives considered:** "Respond in JSON" prompting (more parse failures). Bedrock Agents (unnecessary complexity).
- **Consequences:** Reliable structure, and the model is swappable through `BEDROCK_MODEL_ID`.

## ADR-005: Fallback classifier and a non-AI browse path
- **Status:** Accepted · **Date:** 2026-10-09
- **Context:** A live demo can't depend on a single external call.
- **Decision:** A keyword classifier (EN + Hinglish) is used on Bedrock error, timeout or invalid output, or when `CLASSIFIER_MODE=fallback`. A `/browse` path skips AI entirely.
- **Consequences:** Slight duplication of the taxonomy knowledge, in exchange for a demo that can't fully fail.

## ADR-006: Next.js static export on Amplify Hosting
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** `output: 'export'`. All data is fetched client-side from API Gateway.
- **Alternatives considered:** SSR on Amplify (more config and failure modes). S3 + CloudFront (more setup, and Amplify gives CI/CD from GitHub).
- **Consequences:** No server components fetching data, no Next.js API routes, and `useSearchParams` needs a Suspense boundary.

## ADR-007: AWS SAM for backend infrastructure as code
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** One `backend/template.yaml` covering the HTTP API, Lambdas (esbuild), DynamoDB and IAM.
- **Alternatives considered:** CDK (more code and more for the AI agent to get wrong), Amplify Gen 2 backend (uses AppSync rather than API Gateway, which doesn't fit our stated architecture), console click-ops (not reproducible).
- **Consequences:** Needs the SAM CLI. Deploys with one command.

## ADR-008: One DynamoDB table partitioned by city, filtered in memory
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** PK `city`, SK `providerId`. Query the whole city partition (tens of records), cache it in Lambda memory for about five minutes, filter and rank in code.
- **Alternatives considered:** GSIs per item type or route (premature), OpenSearch or geo indexes (overkill).
- **Consequences:** Revisit once a city has thousands of records.

## ADR-009: Shared code via a copy script, not a workspace package
- **Status:** Accepted · **Date:** 2026-10-09
- **Context:** Web and backend need the same taxonomy and contracts. npm workspaces and monorepo builds on Amplify add configuration risk under time pressure.
- **Decision:** `/shared` is the source of truth. `scripts/sync-shared.mjs` copies it into `web/src/shared` and `backend/src/shared` with a "GENERATED" header.
- **Consequences:** You must re-run the sync after editing `/shared`. AGENTS.md enforces this.

## ADR-010: No accounts and no stored personal data
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** No auth. Raw queries are not persisted, and logs keep a truncated preview for 14 days.
- **Consequences:** No history or favorites, which is fine for the MVP and simplifies privacy.

## ADR-011: Single-turn assistant, not a chatbot
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** One request returns a structured result. At most one clarifying question. Corrections happen through editable chips.
- **Consequences:** A simpler UI and backend, and a faster demo.

## ADR-012: Impact numbers only with cited sources
- **Status:** Accepted · **Date:** 2026-10-09
- **Context:** An earlier review suggested figures like "~16 kg diverted / ~32 kg CO₂e avoided". Those were illustrative and **not sourced**.
- **Decision:** Any impact estimate (FR-21, P2) must use cited weight and emission factors, be labelled "estimate", and list its sources on the About page. Otherwise we don't show it.
- **Consequences:** Less flashy, but credible.

## ADR-013: Bedrock model and region
- **Status:** Proposed. **Fill in during Phase 0.**
- **Decision:** Region `____`, model or inference profile ID `____`, confirmed working on `____` by `____`.

## ADR-014: Human-written content in `shared/content.json`, not in backend code
- **Status:** Accepted · **Date:** 2026-10-09
- **Context:** With a 3-person split, the Data lead writes checklist and message text while the Backend lead owns `backend/`. A shared `.ts` file would mean two owners and merge conflicts.
- **Decision:** Checklists, unsupported-item messages and the empty-state message live in `shared/content.json`, validated by a zod schema in `shared/contracts.ts`. `backend/src/lib/checklists.ts` only loads it.
- **Consequences:** Clean file ownership. Content changes don't need code review from the backend owner, only a schema check.

## ADR-015: Three-person split with file ownership and contract fixtures
- **Status:** Accepted · **Date:** 2026-10-09
- **Decision:** Backend (Member 1), Frontend (Member 2) and Data/QA/Demo (Member 3), each owning distinct folders (see `docs/TEAM_WORKFLOW.md`). Member 1 publishes example responses in `shared/fixtures/` so the frontend can be built before the API exists. A backend test validates the fixtures against the zod schemas, so mocks can't drift from the real contract.
- **Consequences:** Contracts must be merged first (target Oct 9, 16:00 IST). Any contract change needs both Member 1 and Member 2 to agree.
