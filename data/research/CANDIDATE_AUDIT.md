# Candidate Audit & Provenance Report: Faridabad E-Waste Research Candidates

**Document Version:** 1.0  
**Audit Date:** 2026-10-10  
**Auditor:** Member 3 (Data, QA & Demo Lead)  
**Target File:** [`data/research/ecoconnect_faridabad_official_research_candidates.csv`](ecoconnect_faridabad_official_research_candidates.csv)  
**Companion File:** [`data/research/README_ecoconnect_faridabad_data.md`](README_ecoconnect_faridabad_data.md)  
**Quarantine Status:** **ISOLATED / NOT FOR PRODUCTION USE**

---

## 1. Executive Summary

This audit assesses the 10 preliminary e-waste candidate records transcribed from an indexed extract of the Haryana State Pollution Control Board (HSPCB) official document: *"List of E-waste Recyclers / Dismantler"*.

> [!CAUTION]
> **Production Boundary Notice:** All 10 records are classified as **unverified research candidates**. They are strictly quarantined in `data/research/` and must **not** be seeded into `data/providers/faridabad.json`, loaded into DynamoDB, or presented in search/browse results. None of these facilities are currently verified as public household drop-off centers.

---

## 2. Source Provenance & Extraction Context

1. **Origin Document:** HSPCB Public Portal Document  
   - **URL:** `https://hspcb.gov.in/uploads/pages/ewaster_66ac829eb3965.pdf`  
   - **Title:** List of E-waste Recyclers / Dismantler (Haryana)  
   - **Extraction Date:** 2026-10-09  
   - **Document Type:** State regulatory registration list for dismantlers and recyclers.
2. **Regulatory Context:**  
   - The extract reflects historical registrations maintained by the state board. Under the **E-Waste (Management) Rules, 2022**, all e-waste dismantlers and recyclers must register and maintain valid authorization on the centralized Central Pollution Control Board (CPCB) EPR Portal (`https://www.eprewaste.cpcb.gov.in/`).
   - The accessible PDF extract did not establish active, current registration dates for 2026.

---

## 3. Candidate Record Inventory

The 10 transcribed candidate facilities are located across industrial zones in Faridabad:

| Provider ID | Entity Name | Listed Facility Type | Listed Address | Stated Status in Source |
|---|---|---|---|---|
| `FBD-EW-HSPCB-HIST-016` | Endeavor Re-processor and Recyclers India | Dismantler | Plot no. 323, Sec-24, Industrial Area, Faridabad | Row 16 indexed extract |
| `FBD-EW-HSPCB-HIST-017` | A to Z E-waste Solutions | Dismantler | Plot no. 66, Pargiti Vihar, Industrial Area, Sector-59, Ballabgarh, Faridabad | Row 17 indexed extract |
| `FBD-EW-HSPCB-HIST-018` | E-waste Solutions | Dismantler | Industrial Shed, 1A, Industrial Estate, Sector-6, Faridabad | Row 18 indexed extract |
| `FBD-EW-HSPCB-HIST-019` | V S Enterprises | Dismantler | Plot no. 9, Pragati Vihar, Sector-59, Faridabad | Row 19 indexed extract |
| `FBD-EW-HSPCB-HIST-020` | AMN E-Waste Management Pvt Ltd. | Dismantler | Plot No. 171, Sector-59, Industrial Area, Faridabad | Row 20 indexed extract |
| `FBD-EW-HSPCB-HIST-021` | Naturevolt Recyclers India Pvt Ltd | Recycler | Plot No. 323, Part-IV, Sector-24, Faridabad | Row 21 indexed extract |
| `FBD-EW-HSPCB-HIST-022` | AV Green Solutions Pvt Ltd. | Dismantler | Plot No. 274, Sector-24, Industrial Area, Faridabad | Row 22 indexed extract |
| `FBD-EW-HSPCB-HIST-023` | Re Chakra Waste Management LLP. | Recycler | Plot No. 18, Sector-6, Faridabad | Row 23 indexed extract |
| `FBD-EW-HSPCB-HIST-024` | CLG Projects LLP | Dismantler | Plot No. 75-76, Sector-59, Pragati Vihar, Ballabgarh, Faridabad | Row 24 indexed extract |
| `FBD-EW-HSPCB-HIST-025` | SSL E Waste Management LLP | Dismantler | Plot No. 410, Sector-68, IMT, Faridabad | Row 25 indexed extract |

---

## 4. Missing Information Audit

EcoConnect requires complete, validated metadata before a provider can be published (per `PROJECT_SPEC.md` §2.6 and `DATA_GUIDELINES.md` §5). The audit identified the following data gaps across **100% (10/10)** of the candidate records:

| Field Required by Production Schema | Status in Research CSV | Missing Count | Remediation Required |
|---|---|---|---|
| `acceptedItemTypes` | Empty | 10 / 10 | Must confirm whether facility accepts specific MVP item types (`phone_tablet`, `computer_display`, `small_appliance`, `battery_household`, `battery_lithium`). |
| `serviceModes` | Empty | 10 / 10 | Must confirm if facility offers citizen drop-off, pickup, or is purely an industrial B2B processor. |
| `phone` / `whatsapp` | Not present in table | 10 / 10 | Must obtain verified public business contact with consent. Personal numbers prohibited without explicit permission. |
| `lat` / `lng` | Not present in table | 10 / 10 | Must obtain exact Google Maps pin coordinates. Never estimate or extrapolate. |
| `localityId` | Not present in table | 10 / 10 | Must map to an approved locality in `shared/localities.faridabad.json`. |
| `cost` | Not present in table | 10 / 10 | Must determine whether disposal is free, pays user, or charges fees. |
| `hours` | Not present in table | 10 / 10 | Must obtain working days and operating hours. |
| `verification.verifiedBy` | Not present in table | 10 / 10 | Must record initials of verifying team member. |
| `verification.verifiedAt` | Empty | 10 / 10 | Must record date of completed direct verification. |
| `listing_permission` | `pending_clarification` | 10 / 10 | Must obtain explicit consent to list business on EcoConnect. |

---

## 5. Operational Limitations & Risks

### A. Industrial Processing vs. Household Drop-Off
- **Finding:** 7 candidates are registered as "Dismantlers" and 3 as "Recyclers". All 10 are situated in heavy industrial zones (Sector 24, Sector 59, Sector 6, Sector 68 IMT).
- **Risk:** Industrial dismantlers and recyclers are primarily designed for wholesale scrap handling, bulk corporate decommissioning, or EPR consignment processing. Most do not maintain reception desks or safe drop-off facilities for residents bringing an old phone, kettle, or laptop.
- **Rule:** A candidate cannot be assigned route `ewaste_collection` unless direct confirmation establishes they welcome individual residential drop-offs.

### B. Co-Location and Plot Sharing
- **Sector 24 Plot 323:**
  - Row 16: `Endeavor Re-processor and Recyclers India` — Plot 323, Sec-24
  - Row 21: `Naturevolt Recyclers India Pvt Ltd` — Plot 323, Part-IV, Sector-24
  - *Risk:* Multiple entities registered at the same base industrial plot. Potential corporate restructuring, sublease, or name change.
- **Sector 59 Spelling Inconsistencies:**
  - Row 17 transcribes source typo: `"Pargiti Vihar"` (should be `"Pragati Vihar"`).

### C. Legal & Licensing Uncertainties
- `source_license: not_checked`: The HSPCB PDF is a public regulatory document, but reuse terms for republication in an application database require clarification.
- `registration_status: unknown_needs_current_verification`: Historical listing does not guarantee active license under E-Waste Rules 2022. Operating without current authorization violates CPCB compliance.

---

## 6. Safety Posture in Research Data

The research CSV incorporates strong safeguards:
- `active: False` for all 10 records.
- `isSample: False` for all 10 records (preventing confusion with test mocks).
- `review_status: pending` for all 10 records.
- `notes`: *"Do not publish as currently authorized until current CPCB registration/status and service details are verified."*

---

## 7. Actionable Verification Protocol (Before Any Promotion)

Before any candidate can be promoted to `data/providers/faridabad.json`, Member 3 must execute the following 5-point verification:

1. **CPCB EPR Portal Verification:**
   - Search the registered company name on `https://www.eprewaste.cpcb.gov.in/`.
   - Confirm current registration status, valid authorization certificate, and expiry date.
2. **HSPCB Regional Office Consultation:**
   - Contact HSPCB Faridabad Regional Office (`0129-2225315` / `hspcbrofr@gmail.com`) to confirm validity and public reuse guidance.
3. **Telephone Verification Script:**
   - Call the facility using the 6-question script from [`docs/DATA_GUIDELINES.md`](../docs/DATA_GUIDELINES.md) §4.
   - Confirm: (a) household drop-off acceptance, (b) specific accepted item types, (c) cost structure, (d) operational hours.
4. **Consent to List:**
   - Obtain explicit permission: *"May we list your business with these details on our website?"*
   - If declined, mark `active: false` and do not publish.
5. **Geocoding & Schema Formatting:**
   - Capture exact Google Maps pin coordinates (`lat`, `lng`).
   - Format into valid JSON matching `Provider` schema and validate via `npm run seed -- --dry-run`.
