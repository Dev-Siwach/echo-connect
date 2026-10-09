# Role Brief: Member 3, Data, QA & Demo Lead

> **For the AI agent working with Member 3.** Read [`AGENTS.md`](../../AGENTS.md) first, then this
> file, then [`DATA_GUIDELINES.md`](../DATA_GUIDELINES.md) and
> [`DEMO_AND_SUBMISSION.md`](../DEMO_AND_SUBMISSION.md).

## 1. Your mission

Make EcoConnect **true and convincing**. You own the real-world data (verified Faridabad
providers, localities, checklists), AI evaluation queries, end-to-end QA, the README, the
three-minute demo video and the final submission. Most teams lose points here, so this role
matters as much as the coding roles.

## 2. Hard rule for the AI agent

> [!CAUTION]
> **The AI must never produce provider facts.** No business names, addresses, phone numbers,
> coordinates, hours, prices or "verified" claims unless Member 3 has collected them from a
> real source and pasted them in. The AI may **format, validate, deduplicate and check**
> human-collected data, but it may not fill in gaps. A missing field stays `null`. If you're
> unsure, ask the human.

The same applies to impact numbers. Use none without a cited source (ADR-012).

## 3. Ownership

| You OWN (create and edit) | You READ but don't edit | You NEVER touch |
|---|---|---|
| `data/**` | `shared/contracts.ts`, `shared/taxonomy.ts` (schemas, from Member 1) | `backend/**` code, `scripts/**` |
| `shared/localities.faridabad.json` | `shared/fixtures/**` | `web/**` |
| `shared/content.json` (checklists and messages) | | Generated `*/src/shared/**` |
| `backend/tests/golden-queries.json` (data only) | | |
| `README.md`, `docs/**` (except `docs/roles/`), demo assets | | |

You maintain `docs/TASKS.md` and `docs/DECISIONS.md`, though others may add rows.

## 4. Dependencies and deliverables

| Direction | What | From/To | When (IST) |
|---|---|---|---|
| ⬅ Needs | Zod schemas + `seed --dry-run` (D2) | Member 1 | Oct 9, 20:00 |
| ➡ Gives | `golden-queries.json` (12+ cases) | Member 1 | **Oct 10, 12:00** |
| ➡ Gives | `localities.faridabad.json` (15–30 real entries) | Members 1 & 2 | Oct 10, 12:00 |
| ➡ Gives | `content.json` (all checklists and messages, peer-reviewed) | Members 1 & 2 | Oct 10, 16:00 |
| ➡ Gives | `data/providers/faridabad.json`, **≥ 10 verified records (minimum), target 25**, passing `--dry-run` | Member 1 (to seed) | **Oct 10, 20:00** |
| ➡ Gives | About-page copy (how it works, how we verify) | Member 2 | Oct 10, 18:00 |
| ➡ Gives | QA bug list (prioritized) | Members 1 & 2 | Oct 10, 22:00 and Oct 11, 10:00 |
| ➡ Gives | Final video + submission | Judges | Oct 11, ≥ 2 h before deadline |

**You don't need code to start.** Begin data collection now in a shared spreadsheet with the
same columns as the record template. You'll convert it to JSON once D2 lands.

## 5. Work plan

### Step 0: Admin (first 30 min)
- Confirm the exact deadline time, time zone and required submission fields on the official page. Write them at the top of `docs/TASKS.md`.
- Create the shared spreadsheet with the columns from `DATA_GUIDELINES.md` §5.

### Step 1: Lead list (Oct 9 afternoon)
Collect 30+ candidates covering all 10 item types, using the source types in
`DATA_GUIDELINES.md` §3. Prioritize:
1. Authorized e-waste collection or take-back points (needed for phones, laptops, chargers, appliances and batteries)
2. Clothes, books and household-goods donation points
3. Phone, laptop and appliance repair shops in 2–3 well-known markets or sectors
4. Furniture donation or resale

### Step 2: Verify (Oct 9 evening → Oct 10)
Phone or check official sources using the script in `DATA_GUIDELINES.md` §4. Record the
level, date, your initials, the method and the source URL. Get consent to list. Take coordinates only from
the actual map pin.

### Step 3: Convert and validate (`data/faridabad-v1`, then later `data/faridabad-v2`)
Export the spreadsheet to CSV, then ask your AI to convert it to `data/providers/faridabad.json`
(the agent may write a small converter under `data/tools/`). Run:

```bash
cd backend && npm ci
npm run seed -- --file ../data/providers/faridabad.json --dry-run
```

Fix every error. Open a PR. Deliver an early batch (about 10 records) instead of everything at
the end, so Member 1 can seed and Member 2 sees real cards sooner.

### Step 4: Localities and content (`data/localities`, `data/content`)
- `shared/localities.faridabad.json`: 15–30 sectors and areas with real map-pin coordinates.
- `shared/content.json`: 2–5 checklist lines for each of the 10 item types, plus 4 unsupported-item messages and the empty-state message (`DATA_GUIDELINES.md` §7). The AI may **draft** general prep advice (such as "back up your photos"), but a human must review every line. No legal claims and no numbers.
- Also review the route-rules table in spec §2.5 and send any changes to Member 1.

### Step 5: Golden queries (`data/golden-queries`) → Member 1
Write `backend/tests/golden-queries.json`. Start with the 12 in spec §2.8 and add 5+ realistic
ones (Hinglish, typos, mixed items, a location mention, an off-topic request). Format:

```json
[{ "id": "g01", "query": "…", "expect": { "itemTypes": ["computer_display", "clothing_textiles"], "conditions": { "computer_display": "unknown" }, "unsupported": [], "clarifying": false, "locationHint": null } }]
```

Agree the exact format with Member 1 before writing many entries.

### Step 6: QA (from Sync 2 onward)
Run the manual checklist in `DEMO_AND_SUBMISSION.md` §4 on a real phone and a laptop. Log bugs
as a prioritized list with steps, expected result, actual result and a screenshot (GitHub Issues or a
shared doc). Re-test fixes. At Sync 4, confirm `SHOW_SAMPLE_DATA=false` and that no sample cards appear.

### Step 7: README, video and submission (Oct 11)
- README: pitch, screenshot, architecture diagram, AWS services with **why** each is used, how to run it, data verification approach, coverage stats (which are facts), and the team.
- Video: follow the script in `DEMO_AND_SUBMISSION.md` §1. Rehearse with the four demo queries on the **live** site. Show one CloudWatch log line. Record a backup take. Keep it ≤ 3:00.
- Submit with at least a 2-hour buffer. Double-check that every link works in a private browser window.

## 6. Prompts to paste into your AI agent

**Start of every session**
```text
I am Member 3 (Data, QA & Demo Lead). Read AGENTS.md, docs/roles/MEMBER_3_DATA_QA_DEMO.md and
docs/DATA_GUIDELINES.md. Only edit files Member 3 owns. You must NEVER invent provider names,
addresses, phone numbers, coordinates, hours, prices or verification claims — only format and
validate what I give you. Missing values stay null.
```

**Convert data**
```text
Here is a CSV of providers I collected and verified: <paste or file path>. Convert it into
data/providers/faridabad.json following the record template in DATA_GUIDELINES.md §5 and the
enums in shared/taxonomy.ts. Do not add, guess or "improve" any facts. List every row you
could not map cleanly (unknown item type, bad phone format, missing verification) instead of
fixing it yourself. Then run the --dry-run validation and paste the output.
```

**Data audit**
```text
Audit data/providers/faridabad.json against DATA_GUIDELINES.md §10. Report: coverage per item
type and route, verification level counts, duplicates, phone format issues, missing
coordinates, any isSample records. Do not modify the file — just report.
```

**Draft checklists**
```text
Draft shared/content.json per DATA_GUIDELINES.md §7: 2–5 short, practical, general prep lines
per item type and the unsupported/empty-state messages. No numbers, no legal claims, no
provider names. Mark the file for my human review; I will edit before committing.
```

**README / video**
```text
Draft README.md for a judge reading it in 60 seconds, using PROJECT_SPEC.md §1 and §2.1 and
the actual coverage stats I give you: <stats>. Then tighten the video narration in
DEMO_AND_SUBMISSION.md §1 to fit 3:00 at a natural speaking pace.
```

## 7. Handoff and integration checklist

- [ ] Deadline and submission fields confirmed and written in `TASKS.md`
- [ ] Golden queries delivered (Oct 10, 12:00)
- [ ] Localities delivered (Oct 10, 12:00)
- [ ] `content.json` delivered and peer-reviewed (Oct 10, 16:00)
- [ ] First 10 verified providers pass `--dry-run` and are merged (Oct 10, 20:00, Sync 3)
- [ ] QA rounds 1 and 2 done; P0 bugs closed
- [ ] Data quality checklist (`DATA_GUIDELINES.md` §10) complete
- [ ] Video recorded (plus a backup) and submission sent with buffer

## 8. Watch out for

- If you're short on verified providers, **narrow the demo** to the localities or item types you have verified. Never pad with unverified or invented entries.
- Keep a record of the consent you got from each provider in the spreadsheet notes.
- Don't paste personal phone numbers of individuals without consent.
- The video must show the **deployed** app with real data, not mocks or sample records.
