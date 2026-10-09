# Data Guidelines: Curating and Verifying Providers

EcoConnect's value comes from **trustworthy data**. The AI only understands requests.
The data is what actually helps people. This document explains how humans collect,
verify and maintain provider records.

> [!IMPORTANT]
> AI tools must never generate provider records. They may help format data that a human
> has collected and checked, but every name, number and address must come from a real source
> that a person has looked at.

## 1. Principles

1. **Accuracy over quantity.** Ten records we have confirmed beat a hundred we scraped.
2. **Show how we know.** Every record says how it was verified and when.
3. **Prefer formal routes for electronics.** For e-waste and batteries, the `ewaste_collection` route lists **authorized** collectors, recyclers or official take-back points. Informal scrap dealers must not be listed under `ewaste_collection`.
4. **Business information only.** Store a person's private number only if they explicitly agree to be listed (for example, an independent repair technician).
5. **Write descriptions in our own words.** Don't copy text from other websites.

## 2. Verification levels

| Level | Use when | Minimum evidence to record in `method` |
|---|---|---|
| `called` | You phoned or visited, and they confirmed they accept the specific item types and route | Date, who answered (role, not name), what they confirmed, any conditions |
| `official_list` | The provider appears on an official list (for example, a pollution control board's list of authorized e-waste dismantlers or recyclers, or a manufacturer's official take-back page) | URL of the list, and the date you checked it |
| `website_only` | Their own website or official social page says they accept the item, but you haven't confirmed it | URL and date |
| `unverified` | Found in a directory or map listing with no confirmation | Where you found it |

If a provider is `official_list` and you also called them, use `called` and put both sources in `method` and `sourceUrl`.

## 3. Where to look (source types)

Search these, then verify. This is a list of places to look, not a list of providers.

- **Official lists** of authorized e-waste collection centres, dismantlers and recyclers published by the central or state pollution control boards. Filter for Faridabad and nearby areas.
- **Manufacturer and brand take-back programs** (phone, laptop and battery brands often run EPR collection points).
- **Retailer collection points** (electronics stores with take-back bins).
- **NGOs and donation organisations** with drop-off points or drives in Faridabad (clothes, books, furniture, household goods).
- **Repair shops** for phones, laptops, appliances and tailoring in specific sectors and markets. Note the locality.
- **Second-hand, thrift and refurbishing** businesses.
- **Resident welfare associations (RWAs) and community groups** that run regular collection drives.
- Google Maps listings are fine for **finding** leads, but they only count as `unverified` until you confirm.

## 4. Phone verification script (2–3 minutes)

> "Hello, I'm calling from EcoConnect, a student hackathon project that helps people in
> Faridabad find places to repair, donate or recycle old items. Could I confirm a few details?"

1. Do you accept **[item types]**? Any you **don't** accept? (Write these in `acceptanceNotes`.)
2. Is it **free**, do you **pay** for items, or is there a **charge**?
3. Do people **drop off**, or do you offer **pickup**? Any minimum quantity?
4. What are your **days and hours**?
5. Is this the right **address** and **phone or WhatsApp** for the public?
6. **"May we list your business with these details on our website?"** If they say no, don't list them.

Record the answers immediately in the template below.

## 5. Record template

Add records to `data/providers/faridabad.json` (a JSON array). Field definitions are in
`docs/PROJECT_SPEC.md` §2.6. The seed script rejects invalid records.

```json
{
  "city": "faridabad",
  "providerId": "fbd-0001",
  "name": "",
  "description": "",
  "routes": [],
  "acceptedItemTypes": [],
  "acceptanceNotes": "",
  "serviceModes": [],
  "cost": "unknown",
  "address": "",
  "localityId": "",
  "lat": null,
  "lng": null,
  "phone": null,
  "whatsapp": null,
  "website": null,
  "mapsUrl": null,
  "hours": null,
  "verification": {
    "level": "unverified",
    "verifiedAt": "2026-10-09",
    "verifiedBy": "",
    "method": "",
    "sourceUrl": null
  },
  "isSample": false,
  "active": true,
  "updatedAt": "2026-10-09T00:00:00Z"
}
```

**Field rules**

- `providerId`: `fbd-` plus a 4-digit number, never reused.
- `routes` and `acceptedItemTypes`: use only the enum values from the spec (§2.5).
- `lat`/`lng`: right-click the exact place in Google Maps and copy the coordinates. **Never estimate.** If you're unsure, leave them `null`. The provider then won't get a distance, but it will still appear.
- Phone numbers: E.164 format (`+91` followed by 10 digits), no spaces.
- `mapsUrl`: the share link of the actual place.
- Set `active: false` instead of deleting a record that closed or declined.

**Optional spreadsheet workflow.** Collect data in a shared sheet with the same columns,
then export to CSV. You can ask the AI agent to write a small script that converts the
CSV to JSON and validates it with the zod schema. The script must not add any information.

## 6. Localities

`shared/localities.faridabad.json` lists about 15–30 sectors and areas users can pick from:

```json
[{ "id": "sector-15", "name": "Sector 15", "lat": null, "lng": null }]
```

Take coordinates from a map pin at the sector centre. Keep names in the form residents use.

## 7. Prep checklists and messages

Static content lives in `shared/content.json` (owned by the Data lead; the backend only loads
and validates it, see ADR-014). A team member writes it and another reviews it. Format:

```json
{
  "checklists": { "phone_tablet": ["Back up your photos and contacts", "…"] },
  "unsupportedMessages": { "large_appliance": "…", "hazardous": "…", "out_of_scope": "…", "unclear": "…" },
  "emptyStateMessage": "We haven't verified a service for this in Faridabad yet."
}
```

Every one of the 10 item types and 4 unsupported reasons must have an entry.

- 2–5 short, practical lines per item type (for example, for phones: back up, sign out of accounts, factory reset, remove the SIM and memory card).
- Safety lines for batteries: tape the terminals of loose batteries. Swollen, leaking or hot lithium batteries need careful handling. Don't put batteries in household bins.
- No legal claims and no numbers without a source.
- Messages for unsupported items (large appliances, hazardous waste): a short, honest note that v1 doesn't cover this, plus general safe-handling advice.

## 8. Sample-data policy

- Local development may use `isSample: true` records with **obviously fictional** names and `+910000000000`.
- The deployed demo runs with `SHOW_SAMPLE_DATA=false`, and the seed file for production contains **no** sample records.
- Never present sample records as real in the video.

## 9. Maintenance and corrections

- The "Suggest or report a service" link on the About page collects corrections.
- On every correction: verify it, update the record, bump `verification.verifiedAt` and `updatedAt`, and re-seed.
- Records older than 90 days should be re-verified. This is a post-hackathon practice.

## 10. Data quality checklist (before final seed)

- [ ] Every record passes `npm run seed` validation
- [ ] At least one `called` or `official_list` record in each category
- [ ] Each of the 10 item types has at least one verified provider (target)
- [ ] Spot-check five random records by calling or reopening the source URL
- [ ] No `isSample: true` in the production file
- [ ] No personal numbers without consent
