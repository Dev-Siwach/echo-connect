# Task Tracker

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked.
Phases and prompts are in [`PROJECT_SPEC.md` Part 4](PROJECT_SPEC.md#part-4--ai-build-plan-vibe-coding).
Engineering workflow and collaboration rules are in [`TEAM_WORKFLOW.md`](TEAM_WORKFLOW.md).

**Deadline:** Oct 11, 2026, ____ IST (confirm on official WeMakeDevs page)  
**Feature freeze:** Oct 11, 12:00 IST

---

## Team Roster & Roles

| Member | Title | Primary Domain | Core Focus |
|---|---|---|---|
| **Member 1** | Cloud & Backend Lead | `backend/`, `template.yaml`, `scripts/` | SAM, Lambdas, DynamoDB, Bedrock Converse, Seeding |
| **Member 2** | Frontend & UX Lead | `web/` | Next.js, Tailwind, Mobile UX (375px), Amplify, Mocking |
| **Member 3** | Data, QA & Submission Lead | `data/`, `shared/localities`, `docs/` | Real Provider Verification, Golden Tests, 3-Min Video, Submission |

---

## Integration Rhythm (Sync Points)

| Milestone | Target | Description | Status |
|---|---|---|---|
| **Sync 1: Contracts & Scaffold** | Oct 9, 18:00 IST | `shared/` contracts locked. Repo scaffolds created. Branches set up. | `[ ]` |
| **Sync 2: First Handshake** | Oct 10, 13:00 IST | Frontend hits deployed API Gateway live endpoint. CloudWatch logs checked. | `[ ]` |
| **Sync 3: Data Ingestion** | Oct 10, 20:00 IST | Member 3 delivers 15+ verified providers. Seeded into DynamoDB. | `[ ]` |
| **Sync 4: Feature Freeze** | Oct 11, 12:00 IST | Zero new code. All PRs merged into `main`. Mobile checklist verified. | `[ ]` |
| **Sync 5: Final Submission** | Oct 11, 15:00 IST | 3-minute video recorded, uploaded, and submitted ahead of deadline. | `[ ]` |

---

## Phase 0: Setup (Joint / Human)
| Status | Task | Primary Owner |
|---|---|---|
| [ ] | Confirm submission deadline and required fields on WeMakeDevs | Member 3 |
| [ ] | Choose AWS Region. Enable Bedrock model access. Fill in ADR-013 | Member 1 |
| [ ] | Set up AWS Budgets alert (\$10/mo) | Member 1 |
| [ ] | Verify Node LTS, AWS CLI v2, SAM CLI | Member 1 & 2 |
| [ ] | Confirm repo name and git repository permissions | All |

---

## Track: Data & Verification (Member 3 Lead)
*Runs in parallel with coding from Day 1.*

| Status | Task | Owner |
|---|---|---|
| [ ] | Lead list: 30+ candidate facilities in Faridabad (e-waste, NGOs, repair) | Member 3 |
| [ ] | Coordinate check for `shared/localities.faridabad.json` (real lat/lng) | Member 3 |
| [ ] | Phone-verify first 10 providers (phone script in `DATA_GUIDELINES.md`) | Member 3 |
| [ ] | Expand to 15–25 verified providers across both categories | Member 3 |
| [ ] | Draft and human-review prep checklists for all 10 item types | Member 3 |
| [ ] | Human-review messages for unsupported items (large appliances, hazmat) | Member 3 |
| [ ] | Final data quality checklist (`DATA_GUIDELINES.md` §10) | Member 3 |

---

## Phase 1: Shared Contracts & Core Logic Engine
| Status | Task | Owner |
|---|---|---|
| [x] | Define `shared/taxonomy.ts` & `shared/contracts.ts` (zod schemas) | Member 1 & 2 (Joint) |
| [x] | Create `scripts/sync-shared.mjs` code-sync script | Member 1 |
| [x] | Implement `rules.ts`, `geo.ts`, `match.ts`, `checklists.ts` + vitest tests | Member 1 |
| [ ] | Scaffold `web/` mock fixtures using the shared contracts | Member 2 |

---

## Phase 2: Backend on AWS with Fallback Classifier
| Status | Task | Owner |
|---|---|---|
| [x] | `backend/template.yaml` (Table, HTTP API, Lambdas, CloudWatch, IAM) | Member 1 |
| [x] | `lib/db.ts` (cached DynamoDB queries) & `lib/log.ts` (structured JSON logging) | Member 1 |
| [x] | `lib/classify/fallback.ts` (EN + Hinglish keyword classifier) + unit tests | Member 1 |
| [x] | Handlers: `/search`, `/providers`, `/health` with zod validation | Member 1 |
| [x] | `seed.ts` script + initial sample records validation | Member 1 |
| [ ] | Deploy stack via `sam deploy` & run `./scripts/smoke.sh` | Member 1 |

---

## Phase 3: Bedrock Converse AI Integration
| Status | Task | Owner |
|---|---|---|
| [x] | `lib/classify/prompt.ts` & `lib/classify/bedrock.ts` (Converse + forced tool) | Member 1 |
| [x] | Automatic fallback switching on error/timeout (`meta.classifier`) | Member 1 |
| [ ] | Create test cases in `backend/tests/golden-queries.json` | Member 3 |
| [x] | Run `npm run eval:golden` and achieve ≥ 10/12 passes | Member 1 & 3 |

---

## Phase 4: Frontend & User Experience
| Status | Task | Owner |
|---|---|---|
| [ ] | Scaffold Next.js App Router (TypeScript strict, Tailwind CSS, static export) | Member 2 |
| [ ] | Build `/` Home: hero, search bar, example query chips, locality picker | Member 2 |
| [ ] | Build `/search`: "We Understood" chips, route hierarchy tabs, provider cards | Member 2 |
| [ ] | Action buttons on `ProviderCard`: Call (`tel:`), WhatsApp, Maps directions | Member 2 |
| [ ] | Build `/browse` & `/browse/[itemType]` (non-AI instant route) | Member 2 |
| [ ] | Build `/about`: trust standards, methodology, AWS architecture | Member 2 |
| [ ] | P1 items: editable chips (re-run search), geolocation button, checklists | Member 2 |
| [ ] | Mobile responsiveness & accessibility test (375px viewport) | Member 2 |

---

## Phase 5: Integration & Amplify Deployment
| Status | Task | Owner |
|---|---|---|
| [ ] | Create `amplify.yml` and connect repo to AWS Amplify Hosting | Member 2 |
| [ ] | Update API Gateway CORS allowed origins with Amplify production domain | Member 1 |
| [ ] | Ingest Member 3's real dataset (`npm run seed -- --file ...`) | Member 1 |
| [ ] | End-to-end integration test on a real phone via public URL | Member 2 & 3 |

---

## Phase 6: Polish, Hardening & QA (Feature Freeze)
| Status | Task | Owner |
|---|---|---|
| [ ] | Execute manual test checklist in `DEMO_AND_SUBMISSION.md` | Member 3 & 2 |
| [ ] | Verify all P0 and P1 acceptance criteria pass | Member 1 & 2 |
| [ ] | Finalize `README.md` with clean architecture diagrams & pitch | Member 3 |
| [ ] | Ensure `SHOW_SAMPLE_DATA=false` and zero fake records present | Member 1 & 3 |

---

## Phase 7: Demo Video & Hackathon Submission
| Status | Task | Owner |
|---|---|---|
| [ ] | Rehearse demo query flows from `DEMO_AND_SUBMISSION.md` | Member 3 |
| [ ] | Record 3-minute demo video (capture phone view + CloudWatch logs) | Member 3 |
| [ ] | Edit video and verify audio clarity and ≤ 3:00 runtime | Member 3 |
| [ ] | Complete submission form on WeMakeDevs before deadline | Member 3 & All |

---

## Parked for Later (Stretch / Post-Hackathon)
- Photo upload / Multimodal Bedrock classification (FR-20)
- Quantified carbon/waste diversion metric with cited research factors (FR-21)
- CloudWatch real-time metrics dashboard (FR-22)
- Expansion into Gurgaon / South Delhi (FR-23)
