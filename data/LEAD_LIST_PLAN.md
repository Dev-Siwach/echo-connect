# Faridabad Provider Data Collection Playbook & Lead Plan

**Role:** Member 3 (Data, QA & Demo Lead)  
**Governing Documents:** [`AGENTS.md`](../AGENTS.md), [`docs/roles/MEMBER_3_DATA_QA_DEMO.md`](../docs/roles/MEMBER_3_DATA_QA_DEMO.md), [`docs/DATA_GUIDELINES.md`](../docs/DATA_GUIDELINES.md)

---

## 1. Collection Objectives & Targets

To provide an authentic, trustworthy dataset for EcoConnect:
- **Lead Target:** Collect **30+ candidate facilities** in Faridabad across all 10 item types.
- **Verification Milestones:**
  - **Oct 10, 20:00 IST (Sync 3):** Deliver `data/providers/faridabad.json` with **≥ 10 verified records** (passing `npm run seed -- --dry-run`).
  - **Final Target:** **15–25 verified providers** covering all 10 item types across both categories (Electronics/Batteries & Reuse/Donation).
  - **Sample Data Rule:** Zero `isSample: true` records in the final production dataset.

---

## 2. Item Types & Route Coverage Matrix

Every candidate record must map into these controlled taxonomies:

### Controlled Item Types (10 MVP Types)
1. `phone_tablet`: Smartphones, feature phones, tablets
2. `computer_display`: Laptops, desktops, monitors, TVs, keyboards, mice
3. `charger_cable`: Chargers, adapters, cables, earphones, small accessories
4. `small_appliance`: Mixers, kettles, irons, table fans, routers, hair dryers
5. `battery_household`: AA/AAA, button cells, 9V alkaline/zinc batteries
6. `battery_lithium`: Power banks, phone batteries, laptop batteries
7. `clothing_textiles`: Wearable clothes, shoes, bags, bedsheets, blankets
8. `books_stationery`: Books, school/college textbooks, notebooks, stationery
9. `furniture`: Usable tables, chairs, shelves, beds
10. `household_goods`: Kitchenware, utensils, home decor, toys

### Supported Routes (Ordered by Waste Hierarchy)
- `repair`: Repair and maintenance shops
- `resell_reuse`: Refurbishers, buy-back stores, second-hand / thrift
- `donate`: NGOs, donation drop points, community collection drives
- `ewaste_collection`: **Authorized** e-waste collection centres, brand EPR bins, recyclers
- `recycle`: Material recovery (textiles, paper recyclers)

---

## 3. Recommended Official Sources to Search (No Hallucinations)

Member 3 will research real facilities using these primary sources:

### A. Authorized E-Waste & Battery Collection (Priority 1)
- **HSPCB (Haryana State Pollution Control Board):**
  - Official public directory of authorized e-waste dismantlers, recyclers, and collection centres registered in Faridabad district.
- **CPCB (Central Pollution Control Board) EPR Portals:**
  - Producer Responsibility Organisations (PROs) operating in NCR:
    - *Karo Sambhav* collection points directory
    - *Hulladek Recycling* collection partners
    - *Saahas Zero Waste* e-waste drop programmes
- **Brand Take-Back Bins & Retail Drop Points:**
  - Major electronics retail chains with public recycling drop bins:
    - Croma (e.g., Crown Interiorz Mall, Mathura Road, Faridabad)
    - Reliance Digital (e.g., SRS Mall, Sector 12 / Crown Plaza, Faridabad)
  - Authorized brand service centers (Samsung, Apple, Xiaomi, Lenovo) with official e-waste take-back kiosks.

### B. Reuse & Donation Organisations (Priority 2)
- **Established NGOs with verified Faridabad drop points / collection drives:**
  - *Goonj* ("Dropping Centres" list for Delhi-NCR/Faridabad)
  - *Clothes Box Foundation* (NCR drop-off & pickup drives)
  - *Robin Hood Army* (Faridabad chapter donation drives)
  - Local registered orphanages, elder-care homes, or community schools accepting books, stationery, and usable household items.

### C. Commercial Repair Shops (Priority 3)
- Focus research on key local commercial markets in Faridabad:
  - **NIT Faridabad** (NIT 1, NIT 2, NIT 5 Market) — major commercial electronics and appliance repair hub.
  - **Sector 15 Market** & **Sector 16 Market** — prominent neighbourhood retail and repair markets.
  - **Old Faridabad Market** — established local repair and trade market.

---

## 4. Verification Workflow & Script

For every candidate lead, record:
1. **Verification Level:**
   - `called`: Confirmed via direct phone call or visit.
   - `official_list`: Verified against government or manufacturer public registry.
   - `website_only`: Stated on official company website.
   - `unverified`: Found on Google Maps/directory without direct confirmation.
2. **Phone Verification Script:**
   > *"Hello, I'm calling from EcoConnect, a student hackathon project that helps people in Faridabad find places to repair, donate or recycle old items. Could I confirm a few details?*
   > 1. *Do you accept [item types]? Any items you do not accept?*
   > 2. *Is it free, do you pay for items, or is there a charge?*
   > 3. *Do people drop off, or do you offer pickup? Any minimum quantity?*
   > 4. *What are your days and working hours?*
   > 5. *Is this the right address and phone/WhatsApp number for the public?*
   > 6. *May we list your business with these details on our website?"*
   > *(If consent is declined, mark `active: false` and do NOT list).*
3. **Exact Coordinates:**
   - Search the confirmed address on Google Maps, right-click the exact building pin, and copy `lat` and `lng`.
   - Never estimate or extrapolate coordinates. If unknown, set `null`.
4. **Phone Numbers:**
   - Must use E.164 format: `+91XXXXXXXXXX` (no spaces or dashes).

---

## 5. Data Entry Template

A blank spreadsheet template is ready at [`data/leads_template.csv`](leads_template.csv).

Columns:
`providerId,name,description,routes,acceptedItemTypes,acceptanceNotes,serviceModes,cost,address,localityId,lat,lng,phone,whatsapp,website,mapsUrl,hours,verification_level,verification_verifiedAt,verification_verifiedBy,verification_method,verification_sourceUrl,isSample,active`

When Member 3 has collected candidate rows, paste or save them into this CSV or share them in chat. The AI agent will format, validate against the zod schema, and verify zero data hallucinations.
