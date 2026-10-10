# EcoConnect Faridabad: verification research report

Reviewed 2026-10-10 for Member 3 (Data, QA & Demo Lead). This is a research and review artifact. It is **not an authorization to publish any provider**, and the production dataset and the input CSV were not changed (SHA-256 of the CSV is identical before and after).

## Result

| Overall status | Candidates |
|---|---|
| verified | 0 |
| partially_verified | 3 (HIST-018 E-waste Solutions, HIST-021 Naturevolt, HIST-023 Re Chakra) |
| unverified | 7 (HIST-016, 017, 019, 020, 022, 024, 025) |
| conflicting | 0 |

Across 90 checks (10 candidates x 9 checks): 0 verified, 18 partially verified, 72 unverified. All 10 candidates need human follow-up; the queue holds 94 items (90 candidate-level questions plus 4 program-level actions).

## What was established

- **Entity match.** Nine of ten names and addresses match verbatim an independent compilation, the CPCB list of authorised dismantlers/recyclers "as on 08-06-2023" (Haryana serials 11-14 and 36-40). HIST-017 (A to Z E-waste Solutions) is not in that list and no other source mentions it.
- **Registration.** Three candidates have more than the 2023 listing: Naturevolt and Re Chakra appear in a 2025 HSPCB filing before the NGT and are described as HSPCB-registered/authorised by brand partners; E-waste Solutions has a brand partner's registration claim. None has a current CTO or EPR record I could read, so no candidate is verified as currently authorized.
- **Contact.** Naturevolt's own website lists an email and toll-free number. Re Chakra's email and site are cited by Eureka Forbes, but its site returned only a title.
- **Pickup/collection.** Indirect only: Naturevolt's site lists "Schedule Pickup" and Miele describes doorstep collection for its customers; a directory lists pickup for E-waste Solutions.

## What remains unverified

- **Household intake and accepted items:** no direct evidence for any candidate. Several sources describe brand take-back programmes or business customers, so these entities may not suit a consumer directory.
- **Operating hours and listing/reuse permission:** nothing located for any candidate.
- **Current address:** only partly corroborated for HIST-018 and HIST-023.

## Source limitations

- The CPCB EPR portal and hspcb.gov.in (including the original HSPCB PDF) disallow automated access. I did not work around that, so the authoritative current-registration check is outstanding for every candidate.
- The 2025 HSPCB annexure was readable only as search-extract fragments (the file is too large to fetch and a direct download was blocked).
- The CPCB list is over three years old and is a mirror on ndmc.gov.in; its title reads "Rules, 2026", an apparent typo.

## Data-quality flags (original data untouched)

- HIST-016 and HIST-021 share plot 323, Sector-24.
- HIST-017 "Pargiti Vihar" may be a variant of "Pragati Vihar" (unconfirmed).
- HIST-016, 019 and 020 carry "(Not available on website)" in the CPCB list; the meaning is undefined there.
- Look-alike names deliberately not matched: Endeavor Recyclers India Pvt Ltd (Rohtak) and "E waste Solutions, Khasra No." (2025 fragment).
- CSV row numbers (16-25) could not be checked against the PDF; accepted_item_types, service_modes and last_verified_at are blank in every row.

## Strongest sources consulted

1. CPCB list of authorised dismantlers/recyclers, as on 08-06-2023 (mirror): https://www.ndmc.gov.in/pdf/cpcb_approved_list_of_e-waste_recyclers_dismantler.pdf
2. HSPCB reply in NGT OA No. 88 of 2025, Annexure R-6/1 (fragments): https://www.greentribunal.gov.in/sites/default/files/news_updates/Reply%20of%20HSPCB%20in%20OA%20No.%2088%20of%202025%20(Devidas%20Khatri%20Vs.%20UOI%20%26%20Ors.).pdf
3. Naturevolt company website: https://www.naturevoltrecyclers.com
4. Corroborating third-party documents (lower weight): Eureka Forbes, Miele India and Hisense e-waste pages; an IndiaMART directory listing; a machinery supplier's client list.

Not inspectable: https://www.eprewaste.cpcb.gov.in/ and https://hspcb.gov.in/ (automated access disallowed).

## Next actions

1. A person checks the CPCB EPR portal and opens the original HSPCB PDF, recording registration numbers, validity and dates.
2. Email HSPCB Faridabad Regional Office (hspcbrofr@gmail.com, per the README) for the latest list, its date and reuse terms.
3. Contact Naturevolt and Re Chakra using their evidence-supported channels; find a supported channel first for the other eight.
4. Map fields to the approved schema only after reading AGENTS.md and docs/DATA_GUIDELINES.md.

Keep active=false, review_status=pending and research-only quarantine for all ten records until then.
