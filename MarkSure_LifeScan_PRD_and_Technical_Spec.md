# MARKSURE LIFESCAN — FINALIZED PROJECT SPECIFICATION
### Hackathon Build Version (2-Week Solo, AI-Assisted Development)

**Tagline:** Scan. Verify. Stay Safe.

---

## 1. PROJECT OVERVIEW

MarkSure LifeScan is a product verification and safety intelligence platform that helps consumers check whether a **medicine, cosmetic, or packaged food product** is genuine, expired, recalled, or potentially unsafe.

Users can verify a product by **searching its name** or **scanning its barcode/QR code**. The system checks its own database first, then — for products it doesn't recognize — automatically queries **real, free, open public APIs** to fetch product data. Every product, regardless of data source, is run through MarkSure's own **rule-based Trust Score Engine**, which is the core intellectual contribution of the project.

This version finalizes scope to be realistically buildable solo, in two weeks, using AI-assisted ("vibe coding") development — while integrating genuine live external data sources instead of treating them as a "future" feature.

---

## 2. PROBLEM STATEMENT

- Consumers face risks from counterfeit, expired, or repackaged medicines, cosmetics, and food products.
- There is no simple, unified tool for an everyday consumer to check a product's safety status.
- Existing official databases (government regulators, manufacturers) are fragmented, not consumer-facing, and inaccessible via open APIs.
- There is no easy way for consumers to report suspicious products and have that feed into a visible trust signal.

---

## 3. SOLUTION

MarkSure LifeScan provides:

1. A **search/scan interface** (product name or barcode/QR).
2. A **lookup pipeline**: MarkSure DB → external open APIs (if not found internally).
3. A **Trust Score Engine (0–100)** that produces a clear verdict: **Safe / Warning / Dangerous / Unknown**.
4. A **community reporting system** that feeds directly into the trust score.
5. An **admin dashboard** for managing products, reviewing reports, and setting official verification/recall status.
6. A **safety alerts feed**, combining admin-issued alerts with real recall data pulled from OpenFDA.

---

## 4. USER ROLES (FINAL — 2 ROLES FOR MVP)

### 4.1 Guest / Registered User (merged for MVP)
- Search products by name
- Scan barcode/QR (camera-based, in-browser)
- View verdict, trust score, and breakdown
- Submit a report (with optional image, optional anonymous)
- View safety alerts feed

> **Note:** Auth (Supabase Auth) can be added quickly if time permits in week 2, to unlock "save history" / "bookmarks" — but the entire core flow works without login. This avoids auth becoming a blocker for the demo.

### 4.2 Admin
- Log in to `/admin`
- Add/edit products manually (seed data + new entries)
- View and resolve user reports
- Manually set: verification status, "official source verified" flag, "manufacturer verified" flag, recalled flag
- View/manage safety alerts (manual entries + auto-pulled OpenFDA recalls)

### 4.3 Future Roles (NOT built — documented only)
- **Government/Authority** — would set `verified_by_authority = true` automatically via integration; for now, Admin sets this manually.
- **Manufacturer** — would self-submit products via a portal; for now, Admin adds manufacturer-submitted products manually, with `manufacturer_verified` flag.

---

## 5. PRODUCT VERIFICATION INPUT METHODS (FINAL SCOPE)

| Method | Status | Notes |
|---|---|---|
| Product name search | ✅ Build | Text search against MarkSure DB |
| Barcode scan | ✅ Build | `html5-qrcode` library, in-browser camera |
| QR code scan | ✅ Build | Same library handles both formats |
| Image upload (product identification) | ✅ Build | Upload photo → OCR.space → text extraction → fuzzy match to product DB (see §6.7) |
| Camera snap (real-time detection) | ✅ Build | Same pipeline as image upload, capture via `getUserMedia` instead of file picker — shares backend logic |
| Batch number verification | ✅ Build | User enters batch number → checked against `batch_number` on record for that product (see §6.8) |
| Image upload (for reports) | ✅ Build | Separate flow — store via Supabase Storage, no analysis, attached to report |

---

## 6. EXTERNAL API INTEGRATIONS (REAL, ACCESSIBLE, NO KEY REQUIRED)

This is the core upgrade from the original "Future Data Sources" section — these are **live integrations**, not placeholders.

### 6.1 Open Food Facts API (Food category)
- **Endpoint:** `GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- **Auth:** None required for read access. Send a custom `User-Agent` header (e.g. `MarkSureLifeScan/1.0 (youremail@example.com)`).
- **Used for:** When a scanned/searched food barcode is not in MarkSure's DB, MarkSure queries Open Food Facts to retrieve `product_name`, `brands`, `image_url`, `countries`, `categories`, ingredients.
- **Result handling:** Returned data populates a "basic info found, not yet MarkSure-verified" card. Status = `UNKNOWN`. Trust score calculated normally (Unknown product = -40 baseline, per §8).

### 6.2 Open Beauty Facts API (Cosmetics category)
- **Endpoint:** `GET https://world.openbeautyfacts.org/api/v0/product/{barcode}.json`
- **Auth:** None required — same open data model and User-Agent convention as Open Food Facts (sister project, same maintainers).
- **Used for:** When a scanned/searched cosmetics barcode is not in MarkSure's DB, MarkSure queries Open Beauty Facts for `product_name`, `brands`, `image_url`, ingredients, allergens, countries.
- **Result handling:** Identical pattern to §6.1 — "basic info found, not yet MarkSure-verified" card, status = `UNKNOWN`, normal trust score logic.

### 6.3 openFDA Drug NDC Directory API (Medicine category — identity lookup)
- **Endpoint:** `GET https://api.fda.gov/drug/ndc.json?search=brand_name:"{name}"&limit=5`
- **Auth:** None required for public access.
- **Used for:** When a searched/scanned medicine is not in MarkSure's DB, MarkSure queries the NDC Directory to retrieve manufacturer name, dosage form, active ingredients, and product type for the matched brand name.
- **Result handling:** Same "Unknown — basic info found" pattern as §6.1/§6.2, status = `UNKNOWN`, normal trust score logic. Note: this is *identity* data (what the drug is), not a counterfeit/authenticity check — framed as such in the UI.

### 6.4 OpenFDA Drug Enforcement API (Medicine category — Alerts feed)
- **Endpoint:** `GET https://api.fda.gov/drug/enforcement.json?search=...&limit=...`
- **Auth:** None required for public access (optional key available for higher rate limits — not needed at hackathon scale).
- **Used for:** Populating the **Safety Alerts** feed with real, recent U.S. drug recall records (brand name, reason for recall, classification, date).
- **Important framing (for README and demo):** OpenFDA explicitly states its data should not be used to issue live public alerts or track a recall's full lifecycle. MarkSure therefore labels this section **"Recent FDA Recall Reports (Informational)"**, not "Live Alert System."
- **Caching:** Pull and cache results (e.g., via a script run at build time or a scheduled Supabase Edge Function) rather than calling live during the demo — avoids rate-limit/downtime risk.

### 6.5 UPC Item Lookup API (Final fallback for any category)
- **Endpoint:** Free-tier UPC/barcode lookup service (e.g., UPCitemdb trial endpoint).
- **Used for:** If a scanned barcode is found in **none** of: MarkSure's DB, Open Food Facts (food), Open Beauty Facts (cosmetics), or openFDA NDC (medicine) — this is the last fallback to retrieve a generic product name/brand/image so the result page is never a dead blank screen.
- **Result handling:** Same as above — "Unknown — basic info only" card, status `UNKNOWN`, normal trust score logic applies.
- **Note:** Free tiers are rate-limited (often ~100 requests/day) — fine for a hackathon demo, document this limit in the README.

### 6.6 Lookup Pipeline (combined logic)

```
POST /api/lookup-product  { barcode OR name, category? }

1. Search MarkSure `products` table
   → FOUND: return MarkSure record (status, trust score, full details)

2. NOT FOUND + category = food + barcode present:
   → Call Open Food Facts
   → FOUND: return external data, status = UNKNOWN, trust score = 0 (Not Found baseline)

2b. NOT FOUND + category = cosmetic + barcode present:
   → Call Open Beauty Facts
   → FOUND: return external data, status = UNKNOWN, trust score = 0

2c. NOT FOUND + category = medicine + name present:
   → Call openFDA NDC Directory
   → FOUND: return external data (manufacturer, ingredients, dosage form), status = UNKNOWN, trust score = 0

3. NOT FOUND anywhere above + barcode present:
   → Call UPC Item Lookup (final fallback)
   → FOUND: return generic data, status = UNKNOWN
   → NOT FOUND: return status = UNKNOWN, "No data found", CTA to report/add
```

### 6.7 OCR.space API (Image Upload + Camera Snap Detection)
- **Endpoint:** `POST https://api.ocr.space/parse/image`
- **Auth:** Free API key (sign up at ocr.space — no card required, ~25,000 requests/month on free tier)
- **Used for:** When a user uploads a photo or takes a camera snap of a product, the image is sent to OCR.space as base64 or file upload. The returned raw text is then fuzzy-matched (e.g. using a simple string-similarity library) against `name`/`manufacturer` fields in the MarkSure DB, and against Open Food Facts results if no local match.
- **Result handling:** Returns a ranked list of "Did you mean..." suggestions. If the user confirms a match, proceeds through the normal lookup pipeline (§6.4) for that product. If no good match, falls back to "We couldn't confidently identify this product — try scanning the barcode instead, or search manually."
- **Camera snap implementation note:** Camera snap uses the browser's `getUserMedia` API to capture a frame as an image, then sends it through the exact same `/api/identify-image` endpoint as a regular upload — no separate backend logic needed, only a different frontend capture method.

### 6.8 Batch Number Verification (Internal Logic — No External API)
- **No public API exists** for validating batch numbers against manufacturer records — this is true for every country/manufacturer, so it isn't a gap specific to this project.
- **What MarkSure builds instead:** When a user looks up a product (by search/scan/image) and the product has a `batch_number` on record, the UI offers an optional "Verify Batch Number" field. The user enters the batch number printed on their product's packaging.
  - **Match** → no change to score (expected behavior, reinforces existing trust score)
  - **Mismatch** → trust score -25 ("Invalid batch number" — already defined in §8), status may shift toward `SUSPECTED COUNTERFEIT` if combined with other negative signals, and the result page explains: "The batch number on your product does not match our records for this product. This may indicate counterfeit packaging or repackaging."
  - **Product has no `batch_number` on record** → field is hidden/disabled, with a note "Batch verification not available for this product yet."
- This gives the feature real substance (a genuine record-matching check) without overstating it as "verified against manufacturer systems."

### 6.9 Data Sources — Final Status Table

| Source | Original Spec Status | Finalized Status |
|---|---|---|
| International product databases | Future | ✅ Open Food Facts (food) + Open Beauty Facts (cosmetics) — LIVE |
| Government regulatory systems | Future | 🟡 openFDA NDC (medicine identity) + openFDA Enforcement (recall *alerts feed*) — LIVE, not per-product authenticity verification (no public API offers this anywhere) |
| Manufacturer product registries | Future | 🔵 Schema-ready (`manufacturer_verified` flag), Admin-set manually for now |
| Community reports | MVP | ✅ Built — MarkSure's own reporting system, fully live |

---

## 7. PRODUCT VERIFICATION ENGINE

### 7.1 Status Categories (unchanged from original spec — these remain correct)

| Status | Meaning |
|---|---|
| ✅ VERIFIED SAFE | Exists in DB, admin-approved, no negative reports |
| ⚠ UNDER REVIEW | Some reports exist, not confirmed fake |
| ❌ SUSPECTED COUNTERFEIT | Multiple reports / invalid batch / flagged |
| 🚫 RECALLED PRODUCT | Officially flagged by admin (optionally cross-referenced with OpenFDA recall data for medicines) |
| ❓ UNKNOWN PRODUCT | Not found in MarkSure DB (may have external data from §6) |

### 7.2 Recall Cross-Check (Medicine only — enhancement enabled by §6.4)
When Admin marks a medicine product as `RECALLED`, the system can optionally display the matching OpenFDA enforcement record (reason for recall, date, classification) if a brand-name match exists in the cached OpenFDA dataset — giving the recall flag real, citable backing.

---

## 8. TRUST SCORE SYSTEM (0–100) — FINAL, UNCHANGED LOGIC

This remains the centerpiece of the demo because it is pure deterministic logic — easy to build, easy to explain, and visually compelling when it updates live.

**Score increases:**
| Factor | Points |
|---|---|
| Verified by admin | +40 |
| Exists in MarkSure database | +25 |
| Valid QR/barcode format | +10 |
| No reports filed | +15 |

**Score decreases:**
| Factor | Points |
|---|---|
| User report filed | -10 per report |
| Invalid/malformed batch number | -25 |
| Not found in system (Unknown) | -40 baseline |

**Final verdict bands:**
| Score | Verdict |
|---|---|
| 80–100 | ✅ Safe |
| 40–79 | ⚠ Warning |
| 0–39 | ❌ Dangerous |
| No data | ❓ Unknown |

> Recalculation runs as a function triggered whenever: a new report is submitted, admin updates verification status, or admin marks recalled. This is what creates the "live demo moment" — submit a report, watch the score and verdict update in real time.

---

## 9. DATABASE SCHEMA (Supabase / Postgres)

### `products`
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| category | enum | medicine / cosmetic / food |
| manufacturer | text | |
| manufacturer_verified | boolean | default false — admin-set |
| country_of_origin | text | |
| batch_number | text | nullable |
| expiry_date | date | nullable |
| barcode | text | indexed |
| qr_code | text | nullable |
| image_url | text | official product image |
| status | enum | verified_safe / under_review / suspected_counterfeit / recalled / unknown |
| verified_by_authority | boolean | default false — admin-set manually |
| trust_score | integer | 0–100, computed |
| source | enum | `marksure` / `open_food_facts` / `upc_lookup` — tracks where data originated |
| created_at / updated_at | timestamp | |

### `reports`
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK, nullable) | nullable if reporting an unknown/unlisted product |
| description | text | |
| image_url | text | nullable, Supabase Storage |
| anonymous | boolean | |
| status | enum | pending / reviewed |
| created_at | timestamp | |

### `alerts`
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK, nullable) | |
| title | text | |
| message | text | |
| type | enum | recall / counterfeit_warning / general |
| source | enum | `admin` / `openfda` | tracks origin |
| external_ref | text | nullable — OpenFDA record ID if applicable |
| created_at | timestamp | |

### `trust_score_history` (optional, nice-to-have for "breakdown" UI)
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK) | |
| score | integer | |
| reason | text | e.g. "Report filed (-10)" |
| created_at | timestamp | |

---

## 10. SYSTEM ARCHITECTURE

### Frontend — Next.js (App Router) + Tailwind CSS
- `/` — Search + scan landing page
- `/scan` — Camera-based barcode/QR scanner (`html5-qrcode`)
- `/product/[id]` — Result page (verdict panel, trust score bar, breakdown, authenticity guide, expiry indicators, related reports)
- `/report` — Submission form (product selector or free-text + image upload)
- `/alerts` — Safety alerts feed (admin alerts + cached OpenFDA recalls)
- `/admin` — Admin dashboard (product management, report review, alert management) — protected route via Supabase Auth

### Backend — Next.js API Routes
- `POST /api/lookup-product` — implements the pipeline in §6.6
- `POST /api/identify-image` — accepts image (upload or camera snap) → OCR.space → fuzzy match → returns suggestions
- `POST /api/verify-batch` — checks submitted batch number against product record, returns match/mismatch + triggers score recalc on mismatch
- `GET /api/search-product?q=` — name search against MarkSure DB
- `POST /api/submit-report` — creates report, triggers trust score recalculation
- `POST /api/admin/products` — add/edit product (admin only)
- `PATCH /api/admin/products/[id]` — update status/flags (admin only)
- `GET /api/alerts` — combined admin + cached OpenFDA alerts
- `GET /api/trust-score/[productId]` — returns current score + breakdown

### Database & Storage — Supabase
- Postgres for all tables above
- Supabase Storage for product images and report images
- Supabase Auth for Admin login (single admin account is sufficient for MVP)

### Deployment
- Vercel (frontend + API routes)
- Supabase (hosted database, storage, auth)

---

## 11. RESULT PAGE — UI BEHAVIOR (FINAL)

1. **Product Identity** — Name, category, manufacturer, manufacturer_verified badge if applicable
2. **Verdict Panel** — Safe/Warning/Dangerous/Unknown + animated trust score bar
3. **Source Indicator** — Small label: "Verified in MarkSure database" / "Data from Open Food Facts — not yet MarkSure-verified" / "Basic info only — help us verify this product"
4. **Trust Score Breakdown** — List of contributing factors with point values (pulls from `trust_score_history` if implemented, or computed live)
5. **Authenticity Guide** — Static content per category (how genuine vs fake packaging typically looks) — written/curated content, not dynamic
6. **Expiry Indicators** — Static educational content per category
7. **Community Reports** — Count + list of recent (non-sensitive) report descriptions for this product
8. **Report CTA** — "See something wrong? Report this product"

---

## 12. MVP SCOPE — FINAL

### MUST BUILD
- Product search (name)
- Barcode/QR scan (camera-based)
- Image upload + camera snap product identification (OCR.space + fuzzy match)
- Batch number verification (DB record matching)
- Lookup pipeline with Open Food Facts + UPC fallback integration
- MarkSure product database (seeded with 15–25 realistic entries across all statuses/categories, including batch numbers for at least half)
- Trust Score Engine (live recalculation)
- Result page (full UI per §11)
- Report submission (with image upload)
- Admin dashboard (add/edit products, review reports, set flags)
- Safety alerts feed (admin alerts + cached OpenFDA medicine recalls)

### SHOULD HAVE (if time allows)
- Supabase Auth for Admin login
- `trust_score_history` table + breakdown UI
- Recall cross-check display (§7.2)

### STRETCH
- Registered user accounts with saved search history / bookmarks
- Multi-language OCR support

### EXPLICITLY NOT BUILT (documented as Future Vision in README)
- Government regulatory live integration (no public API exists; `verified_by_authority` flag is admin-set, ready for future automation)
- Manufacturer self-service onboarding portal (`manufacturer_verified` flag is admin-set, ready for future automation)
- AI-based image comparison ("official vs uploaded image, highlight differences") — distinct from OCR identification; remains a multi-week ML task

---

## 13. BUILD TIMELINE (2 WEEKS, SOLO, AI-ASSISTED)

| Days | Focus |
|---|---|
| 1–2 | Next.js + Supabase setup, schema creation, seed data (15–25 products, with batch numbers), basic name search working end-to-end |
| 3–4 | Barcode/QR scanner integration, `/api/lookup-product` pipeline with Open Food Facts + UPC fallback |
| 5–6 | Result page UI (verdict panel, trust score bar, source indicator, breakdown) + batch number verification field/logic |
| 7–8 | Image upload + camera snap → OCR.space integration + fuzzy match suggestions |
| 9–10 | Report submission flow + live trust score recalculation logic |
| 11–12 | Admin dashboard (auth, product CRUD, report review, flag management) |
| 13 | Safety alerts feed + OpenFDA cached recall data integration, authenticity guide/expiry content |
| 14 | Polish UI, responsive check, README, deployment, full end-to-end test, record backup demo video |

---

## 14. FINAL PITCH SUMMARY

> "MarkSure LifeScan lets anyone check a product's safety by name or barcode scan. We check our own verified database first, and for unrecognized products, we pull real data live from Open Food Facts — and surface real FDA recall reports in our alerts feed. Every product, no matter the source, runs through our own trust-score engine, which updates live as the community submits reports. The system is built to plug into government and manufacturer data sources in the future — the schema and admin flags are already in place for that — but today, it works end-to-end with real open data and our own verification logic."

---

## 15. ENVIRONMENT VARIABLES / CONFIG NOTES

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        (server-side only, for admin actions)
OFF_USER_AGENT="MarkSureLifeScan/1.0 (youremail@example.com)"
UPC_LOOKUP_API_KEY=               (if using a tier requiring a key; many free tiers don't)
OCRSPACE_API_KEY=                 (free signup, used for image upload / camera snap identification)
```

No keys are required for Open Food Facts or OpenFDA at hackathon scale — Supabase credentials, an OCR.space free key, and (possibly) a free UPC lookup key are needed.
