# Demo and Submission Guide

## 1. Three-minute video script

| Time | On screen | Narration (draft) |
|---|---|---|
| **0:00–0:25** Hook and problem | A drawer of old chargers and batteries, a bag of clothes, a dead laptop (real footage or simple slides) | "Most of us have a drawer like this. We want to do the right thing, but where does a dead laptop or a box of batteries actually go in Faridabad? Who accepts it, and can we trust them?" |
| **0:25–0:40** Solution | EcoConnect home page | "EcoConnect is a local environmental action assistant. Tell it what you have, and it finds the right next step." |
| **0:40–1:40** Live demo | Type the worked example (spec §1.5) on a phone-sized screen → "We understood" chips → results per item → trust badges → tap Directions or WhatsApp → open a checklist → edit a chip → browse "Batteries" | "It understood three different items in one sentence, including Hinglish. For each one it recommends the highest-value route first: repair before recycling. Every service is real and verified by our team, and you can see how and when." |
| **1:40–2:20** AWS architecture | Architecture diagram (spec §2.1), then a CloudWatch log line from the request just made | "The site runs on Amplify. API Gateway and Lambda handle the search. Bedrock interprets the request into a fixed taxonomy, but it never invents providers. Those come only from our curated DynamoDB table. If Bedrock is unavailable, a fallback classifier keeps the app working." |
| **2:20–2:50** Impact and next steps | Coverage stats (number of verified services and item types). Roadmap slide | "Today it covers N verified services across 10 item types in Faridabad. Next: more of Delhi-NCR, community-submitted listings with verification, and photo-based item recognition." |
| **2:50–3:00** Close | Logo, URL, repo | "EcoConnect: turn what you have into the right next step." |

> Don't show impact numbers unless they have cited sources (ADR-012). Coverage numbers (services, item types) are fine because they're facts about our dataset.

## 2. Demo queries (rehearse these)

1. *"I'm moving out of Sector 15 next week. I have an old laptop that doesn't turn on, two chargers, and three bags of clothes in good condition."* (the main demo)
2. *"purana mixer kharab ho gaya hai"* (Hinglish)
3. *"box of AA batteries and a dead power bank"* (batteries and safety checklist)
4. *"old fridge"* (honest unsupported message)

Run all of them on the deployed URL **before recording** and confirm each one returns real data.

## 3. Pre-recording checklist

- [ ] `SHOW_SAMPLE_DATA=false`. Real data is seeded
- [ ] Lambda warmed (hit `/health` and run query 1 once)
- [ ] Browser zoom and window sized like a phone (or record on a real phone). Notifications off
- [ ] CloudWatch log group open in a tab
- [ ] Architecture diagram exported as an image
- [ ] Record a **backup take** in case the live site misbehaves at judging time

## 4. Manual test checklist (Phase 6)

**Search and AI**
- [ ] Demo query 1 shows 3 item groups with correct conditions
- [ ] Hinglish query works
- [ ] Unsupported query shows a reason message, not an error
- [ ] Vague query ("stuff") shows a clarifying question and example chips
- [ ] Editing a chip re-runs results (`meta.classifier = manual`)
- [ ] With `CLASSIFIER_MODE=fallback`: queries 1 and 3 still work, and the basic-mode note shows

**Results and trust**
- [ ] Every card has a trust badge with a date
- [ ] Unverified listings are collapsed
- [ ] Call, WhatsApp, Directions and Website work on a real phone. Missing fields hide their buttons
- [ ] Choosing a locality sorts by distance. "Use my location" works when granted and falls back when denied
- [ ] An item with no providers shows the honest empty state and the suggest link

**Quality**
- [ ] 375 px layout has no horizontal scroll. Tap targets are large enough
- [ ] Keyboard navigation reaches every control. Focus is visible
- [ ] Loading skeleton appears. API errors show a friendly retry state
- [ ] No console errors. No CORS errors
- [ ] `/browse/[itemType]` works for all 10 types
- [ ] `/about` explains verification levels and the AWS architecture

## 5. Submission checklist

> Confirm the exact required fields on the official WeMakeDevs page. This list is a best guess.

- [ ] Public GitHub repo with honest commit history from the event window
- [ ] README: pitch, screenshot, architecture diagram, AWS services used and **why each one**, how to run and deploy, data verification approach, team
- [ ] Live URL (Amplify)
- [ ] Demo video (≤ 3 min) uploaded, with a link that works without sign-in
- [ ] Track selected: **Waste and Energy**
- [ ] AWS services listed: Amplify, API Gateway, Lambda, Bedrock, DynamoDB, CloudWatch
- [ ] Any extra fields (blog post, social post, team details)
- [ ] Submitted before the deadline, with a buffer of at least 2 hours

## 6. Backup plan if something breaks during judging

1. Bedrock fails → set `CLASSIFIER_MODE=fallback` (env var, redeploy) or use the `/browse` path.
2. API fails → play the backup recording and explain the architecture with the diagram.
3. Amplify fails → run `npm run dev` locally against the API and screen-share.
