# Role Brief: Member 2, Frontend & UX Lead

> **For the AI agent working with Member 2.** Read [`AGENTS.md`](../../AGENTS.md) first, then this
> file, then the spec sections each task points to.

## 1. Your mission

Build the EcoConnect web app that judges will see and use: fast, mobile-first, honest and
clear. You build the whole UI against **contract fixtures** first, then switch to the live
API. You also own deployment on AWS Amplify Hosting.

## 2. Ownership

| You OWN (create and edit) | You READ but don't edit | You NEVER touch |
|---|---|---|
| `web/**` (except `web/src/shared/**`) | `shared/**` (Member 1 owns contracts and fixtures; Member 3 owns localities and content) | `backend/**`, `scripts/**`, `data/**` |
| `amplify.yml` (repo root) | `docs/**` | `web/src/shared/**` (generated. Run `node scripts/sync-shared.mjs`) |

If a type or field is wrong or missing, **don't patch around it in `web/`**. Write a change
request for Member 1, then re-sync once it's merged. UI copy for the About page can come
from Member 3. Ask for it.

## 3. Spec sections you need

`PROJECT_SPEC.md` §1.2–1.5, §2.5 (labels), §2.6 (verification badges), §2.7 (API), §2.10,
§2.12 (plain-text rendering), Part 3 FR-01–FR-19 and NFR-04/05, and Part 4 phases 4 and 5.
Also `DECISIONS.md` ADR-005, 006, 011, 012.

## 4. Dependencies and deliverables

| Direction | What | From/To | When (IST) |
|---|---|---|---|
| ⬅ Needs | `shared/` contracts and fixtures merged (D1) | Member 1 | Oct 9, 16:00 |
| ⬅ Needs | Live API URL (D3) | Member 1 | Oct 10, 11:00 |
| ➡ Gives | Amplify app created and **its domain sent to Member 1** for CORS | Member 1 | **Oct 10, 13:00** |
| ➡ Gives | Feature-complete UI on the Amplify URL for QA | Member 3 | Oct 10, 21:00 |
| ⬅ Needs | About-page copy, rehearsal queries, QA bug list | Member 3 | Oct 10 – Oct 11 |

**Before D1 lands**, scaffold the app and build layout and components with hard-coded
props. Don't invent your own data types; wait for the contracts.

## 5. Work plan

### Step 1: Scaffold (`feat/web-scaffold`), start immediately, ~1 h

Next.js App Router, TypeScript strict, Tailwind, ESLint, `lucide-react`, `output: 'export'`,
`images: { unoptimized: true }`. Base layout (header, footer with a data disclaimer link),
design tokens (a calm green and neutral palette, AA contrast), and primitives: `Button`,
`Chip`, `Card`, `Badge`, `Skeleton`.

Done-gate: `npm run lint && npx tsc --noEmit && npm run build` produces `out/`.

### Step 2: API client with mock mode (`feat/web-api-client`), right after D1

`web/src/lib/api.ts` provides `search(req)`, `getProviders(params)` and `health()`, returns
the types from `web/src/shared/contracts.ts`, and validates responses with the zod schemas.
On a validation failure it shows the error state, never a blank screen.

Mock mode: if `NEXT_PUBLIC_USE_MOCKS=true`, return fixtures from `web/src/shared/fixtures/`.
Choose the fixture with a query keyword such as `?mock=unsupported`, so every state can be
demonstrated. Add a ~600 ms artificial delay so the loading states are visible.

Errors: handle the `{ error: { code, message } }` shape and 429 (show "Too many requests,
try again shortly").

### Step 3: P0 pages (`feat/web-search`, `feat/web-browse`), ~4 h

| Page | Must have (FR) |
|---|---|
| `/` | Search box with 3–500 char validation (FR-01), locality picker from `shared/localities.faridabad.json` (FR-08), category chips linking to `/browse/[itemType]` (FR-09) |
| `/search?q=&loc=` | Client-side fetch. `useSearchParams` sits inside `<Suspense>` (needed for static export). Includes "We understood" chips, `UnsupportedNotice`, one `ItemResultSection` per item, `RouteGroup` in hierarchy order, `ProviderCard`, and collapsed "Unconfirmed listings" (FR-02, 03, 06, 11) |
| `/browse`, `/browse/[itemType]` | `generateStaticParams` from the taxonomy, using `GET /providers`. Works with no AI (FR-09) |

`ProviderCard` (FR-06, FR-07) shows the name, `TrustBadge` (level text plus date, per spec §2.6),
accepted items and notes, cost, mode, distance and locality, and these actions:
- Call: `tel:+91…`
- WhatsApp: `https://wa.me/<digits only>`
- Directions: `mapsUrl`, or `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`
- Website: opens in a new tab with `rel="noopener noreferrer"`

Hide any action whose field is missing.

Design every state, each reachable via fixtures: loading skeleton, full results, partial
results, no providers (empty-state message from `content.json`), unsupported only,
clarifying question with example chips, API error with retry, `classifier: "fallback"` note
("Running in basic mode"), and `SampleDataBanner` when any `isSample` provider is present.

### Step 4: P1 features (`feat/web-p1`), ~3 h

- FR-12 editable chips: change the type or condition, then call `POST /search` with `items`, which skips Bedrock. Show the manual-mode result.
- FR-13 checklists, collapsible per item.
- FR-14 "Use my location": browser geolocation, falling back silently to the picker if denied.
- FR-15 clarifying question UI.
- FR-17 `/about`: how it works, verification levels, AWS architecture diagram (Mermaid exported as an image or SVG, or a static figure), and a Suggest-a-service link.
- FR-18 example query chips on `/`.

### Step 5: Amplify deploy (`chore/amplify`) → domain to Member 1 by Oct 10, 13:00

Create the Amplify app early, even while it still uses mocks, so the domain exists for CORS. Add
`amplify.yml` (monorepo, `appRoot: web`, `npm ci`, `npm run build`, artifacts `out`). Set the
env vars `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_USE_MOCKS=false` in the Amplify console.
Static-export routing: make sure `/search` and `/browse/<type>` load on hard refresh. Add an
Amplify rewrite rule if needed.

### Step 6: Live integration (Sync 2 → Sync 3)

Switch to the live API. Fix any contract drift by asking Member 1, not by patching. Test on a
**real phone** over the Amplify URL: tap targets ≥ 44 px, no horizontal scroll at 375 px,
keyboard and focus states, no console or CORS errors.

### Step 7: Polish (until the freeze, Oct 11, 12:00)

Work through Member 3's QA list in priority order. Keep it to small visual polish only, with
no new features after the freeze.

## 6. UX rules (judges notice these)

- One obvious action per screen. The search box is the hero.
- Show trust everywhere: the badge sits next to the name, never hidden in details.
- Render AI-derived text (labels, location hint, clarifying question) as **plain text**. Never use `dangerouslySetInnerHTML`.
- Don't show impact numbers (ADR-012). You may show coverage facts from the data, such as "N verified services".
- Use no stock photos and no clutter. Lucide icons plus whitespace.
- Use semantic HTML (`<main>`, `<section>`, headings in order), label every input, and keep focus rings visible.

## 7. Prompts to paste into your AI agent

**Start of every session**
```text
I am Member 2 (Frontend & UX Lead). Read AGENTS.md, docs/roles/MEMBER_2_FRONTEND.md and the
spec sections for Step <N>. Only edit files Member 2 owns (web/**, amplify.yml). Never edit
web/src/shared — it is generated. Propose a short plan (pages/components + responsibilities)
and wait for my OK.
```

**Step 2–3**
```text
Do Steps 2 and 3 of docs/roles/MEMBER_2_FRONTEND.md. Use only types from
web/src/shared/contracts.ts and data from web/src/shared/fixtures/ in mock mode. Make every
listed UI state reachable via a ?mock= parameter. Mobile-first at 375px. Run lint, tsc and
build at the end and paste the output.
```

**Visual review**
```text
Review the /search page at 375px and 1280px against section 6 of MEMBER_2_FRONTEND.md and
PROJECT_SPEC NFR-04/05. List concrete problems (contrast, spacing, tap targets, focus,
heading order) and fix them one at a time.
```

## 8. Handoff and integration checklist

- [ ] Scaffold builds before D1 arrives
- [ ] Every UI state demonstrable in mock mode
- [ ] Amplify domain sent to Member 1 (by Oct 10, 13:00)
- [ ] Live API working from `localhost` and from Amplify with no CORS errors (Sync 2)
- [ ] Real providers visible on Amplify (Sync 3)
- [ ] Real-phone test passed
- [ ] Your rows in `docs/TASKS.md` ticked

## 9. Watch out for

- `next export` as a command no longer exists. `output: 'export'` plus `next build` writes `out/`.
- No server actions, API routes, `cookies()` or dynamic SSR. They break static export.
- `NEXT_PUBLIC_*` vars are baked in at build time. Redeploy Amplify after changing them.
- No AWS credentials or SDK in `web/`. The browser talks only to API Gateway.
- Make sure the deployed build has `NEXT_PUBLIC_USE_MOCKS=false` before recording the demo.
