# VarroaMate Development Handover
## Session date: 29 April 2026
## Use this document to start a new Claude chat with full context

---

## PROJECT OVERVIEW

VarroaMate is an Australian beekeeping SaaS platform at varroamate.com — 4 standalone HTML apps sharing a Supabase backend.

**Apps:**
- `/app/` — VarroaMate main (mite tracking, treatments, AI guidance, chart)
- `/planner/` — Smart Planner (seasonal treatment planning)
- `/productivity/` — Productivity (inspections, harvests, queens, voice entry)
- `/hygiene/` — Hive Hygiene (hygiene plan + AI analysis)
- `index.html` — Homepage (RSS news feed)

**Infrastructure:**
- GitHub Pages: `https://github.com/BerniDic/varroamate.git`
- Local repo: `~/varroamate-site/`
- Cloudflare DNS proxy
- Supabase project: `yadptqjsjqxqjxouqkll`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZHB0cWpzanF4cWp4b3Vxa2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Nzg4MjEsImV4cCI6MjA4ODA1NDgyMX0.qieg16GzLciOSYYcEk6Qn-wG3bElT4tCLI8tR1WTKJA`
- Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZHB0cWpzanF4cWp4b3Vxa2xsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ3ODgyMSwiZXhwIjoyMDg4MDU0ODIxfQ.l6qToicMkH7oVkasu08Q-wthXrStH-89TmCCXtEKMbU`
- AI model: Claude Opus 4.6 (main app), Claude Haiku (voice)
- Resend API key: `re_ZFADqL9V_EXyTcexk3Tx14gBBZ4AWxY5Z` (varroamate.com domain verified)

---

## RECENT WORK — 26–29 APRIL 2026

Major work over the last four days. Listed roughly in order shipped.

### Pagden + Walk-Away topology rewrite (commits 0e4527c → cfc49f5 + 10267ec)

The VMSP Split Brood Break tab had inverted topology for both methods. Pagden's recipe text and SVG had the queen on the moved hive (wrong); walk-away put the drone frame in the queenless half (logically impossible — no laying queen). Both methods were also framed primarily as varroa interventions when they're really colony management methods with varroa as a secondary opportunity.

Four-stage rewrite:
- **Stages 1–3 (Pagden)**: opening warning about virgin-queen mating uncertainty, reframed purpose (primary = swarm control, not varroa), corrected recipe text + SVG diagram, 8 biology-driven action cards using fixed days for known biology and range labels (`~7–9`, `1–4 weeks`, `~Week 3+`, `flexible`, `anytime`) for inspection-driven events. iCal export blocked for Pagden because virgin queen mating timing is weather-dependent.
- **Polish**: drone-trap quick card reworded for queenright side, `dpActionCard()` updated to suppress the literal `DAY` suffix on non-numeric pill labels, broken NBU link replaced with Barkston Ash Beekeepers' Pagden guide (also added to AU resources — method is not region-specific).
- **Stage 4 (walk-away)**: same pattern. Description reframed as primarily colony-increase (not varroa control). Forager-return trade-off explained (when one half moves, foragers return to original stand, weakening the moved half; beekeepers compensate via even nurse-bee/brood distribution). Trade-offs vs Pagden documented (easier/faster but weaker queenless half, less effective for active swarm control). SVG corrected (drone frame moved to queenright). 8 corrected action cards. iCal export blocked here too.

Branch `fix/pagden-topology` used for Pagden Stages 1–3 then merged; walk-away Stage 4 went direct to main.

### Treatment dose tracking — compliance feature (commits 449624c, 2d65553, 92754ec)

Beekeepers are required to keep treatment records for compliance (UK VMR 2013 = 5 years; AU AHBIC = state-dependent, 2–6 years). Previously VarroaMate captured product + date + free-text notes only. Missing: dose/amount, which is part of the legal record.

**Schema**: two new nullable columns on `treatments` table.
- `dose_amount NUMERIC` (e.g. 2, 1.5, 5)
- `dose_unit TEXT` with CHECK constraint allowing: `strips, sachets, tablets, trays, caps, frames, mL, g, cycles, other` (NULL allowed for legacy rows + treatments without a meaningful dose)

Migration applied to Supabase first, then the app code follow-up. Existing rows unaffected.

**Modal**: new Dose section above Notes — numeric input + unit dropdown + help text noting the record-keeping rationale (region-specific: AU mentions AHBIC; UK mentions VMD with 5-year retention).

**Validation**: soft warnings, not hard rejects. The record always saves so partial data is captured; warning toasts nudge the user to return and complete the entry. Cases:
- both filled → success toast `Treatment saved! 💊`
- both empty → ⚠️ warning, dose record is a legal requirement
- amount only → ⚠️ please add unit
- unit only → ⚠️ please add amount
- non-numeric amount → hard reject

Toast duration doubled globally from 2.5s to 5s (warning text was too long to read).

**Whitelist for non-dosed treatments**: heat treatment, drone comb removal, brood interruption skip the warning entirely — these are physical/biological methods with no meaningful dose.

**CSV export**: extended with regulatory header (3 quoted lines + blank, then the existing column header row). AU header: `Compliance: AHBIC Honey Bee Industry Biosecurity Code of Practice` (no retention number — varies by state). UK header: `Compliance: UK Veterinary Medicines Regulations 2013 (Schedule 3) — 5-year mandatory retention for food-producing animals (incl. honey bees)`. Treatment row product cell appends dose with pipe separator: `Apivar (Amitraz strips) | 2 strips`.

**Auto-populate of dose unit from selected treatment**: intentionally NOT included. The TREATMENTS metadata objects differ between AU and UK in keys and structure (UK has `formicpro` instead of AU's `formic`, plus `varroxal`/`oxybee`/`danys`/`maqs`/`oxalic-vap`; AU has `aluen-cap` which UK doesn't) and the per-region structure complications need a dedicated patch. Users currently pick the unit manually from the dropdown — small extra click. Parked.

### Brood interruption protocol corrected (commit 07bb0ef)

Previously the entry described a 25-day broodless-window protocol conflated with drone-trap timing. User flagged the actual 14-day caging protocol:
- Day 0: cage queen
- Day 9: last worker egg laid pre-caging is now capped
- Day 14: release queen (begins laying again)
- Day 20–23: phoretic window. Original capped brood emerged (12 days from capping); new post-release eggs not yet capped (~9 days from laying). Therefore: no capped brood = all mites phoretic = OA window.
- Day 23+: new brood gets capped, window closes.

Updated `brood-int` metadata to reflect this. Added clarifying note that this is different from drone comb removal (which uses drone foundation as a passive trap over 19–23 days, unchanged).

### Weather tab improvements (commit fb5a89b + part of f5ea00a)

Font bumps in the header section, expandable details, best-window box (apiary name 16→18, address 13→15, summaries 14→16, body 13→15, 'tap to read' affordance 11→13). Day cards left at current sizes — separate cleanup if needed.

Optimal/Marginal/Avoid wording corrected (commit f5ea00a) to distinguish manufacturer label limits (temperature) from beekeeper judgement (rain and wind for working the hive). Manufacturers don't specify wind speeds.

### Mystery hive (commit f0084c1)

Pivoting away from the Beekeeper Academy concept toward something new (plants & flowering, not yet started). Landing page hive 4 became a teaser: big amber `?` glyph (Georgia serif, bold, 34px) on the front face. Label `?`, sub `coming soon — something new`. Toast on click: `🌸 Something new is brewing… 🐝`. Same on UK landing.

### Pagden canvas redesign (commit 8d9ec52)

The timeline canvas at the top of the Pagden view had been parked as separate work — broken topology (mislabeled rows, walk-away cell logic applied to Pagden), warm-tan `emerged` colour blending with several other warm tones for CVD users, OA window timing not matching the corrected biology.

Redesigned to 5 rows in this order: `👑 Queenright` | `🎯 Drone frame` | `🚫 Queenless` | `👸 Queen cell` | `💨 OA window`. Foragers row removed. Drone frame placed adjacent to Queenright (since drone trapping happens in queenright half); OA window adjacent to Queen cell (both queenless-side events).

Cell logic simplified to make the broodless window unambiguous: Queenless row shows egg colour days 0–2, capped days 3–20, **empty grey gap days 21–27** (the only sustained empty stretch in the canvas), capped from day 28 (new queen laying). OA window cells (yellow) sit visibly inside this gap on days 21–26 with a one-day buffer to day 27 before brood resumes. Queenright simplified to uniform capped throughout.

`DP_COL.remove` colour changed from teal `rgba(64,184,184,0.78)` to orange `rgba(232,140,40,0.88)` for CVD-friendly contrast. Affects walk-away drone-frame, Pagden drone-frame, and the standalone Drone Comb Removal day plan timeline (all four use 'remove' with the same semantics). Creates natural yellow (OA) → orange (REMOVE) → red (LATE) progression mapping to urgency.

### Smaller fixes (commit f5ea00a)

- Drone Comb Removal `removal` field now includes both options: (1) Freeze 48h, (2) Heat in Varroa Controller at 42°C for 2 hours — with note that heat affects drone viability and fertility. AU and UK identical.
- Walk-away `🚫 Swarm prevention` quick card description: `by separating queen from brood` (Pagden's mechanism) → `by reducing colony size` (walk-away's actual mechanism).

---

## ARCHITECTURE — MULTI-REGION CONFIG

The app uses a region config system. Each region has a JS config file loaded before the app script.

**Config files in `~/varroamate-site/config/`:**
- `au.js` — Australian config (live at varroamate.com/config/au.js)
- `uk.js` — UK/Ireland config (live at varroamate.com/config/uk.js)

**Region routing:**
- `varroamate.com/app/` → loads `au.js`
- `uk.varroamate.com` → Cloudflare redirects to `varroamate.com/uk/app/` → loads `uk.js`
- UK files live in `~/varroamate-site/uk/` (mirrors main structure)

**Key VM_CONFIG fields:** region, hemisphere, seasons, monthSeason, thresholds, chartActionZone, chartSeasonThreshold, treatments.products, agencies, ai (chatSystem, treatmentRules, diseaseRules, etc.), ui (features, aboutText)

**Feature flags in ui.features:**
- `beemaxExport: false` — hides BeeMAX export for UK
- `stateSelector: false` — hides AU state selector for UK
- `resistanceMap: false` — hides AU resistance map for UK

---

## SUPABASE

**Tables:** apiaries, hives, mite_counts, treatments, inspections, harvests, queens, notes, colony_losses, app_ratings, feedback, profiles, subscriptions, plan_limits, checkouts, app_cache, academy_progress

**Edge Functions:** anthropic-proxy, create-checkout, create-portal-session, stripe-webhook, rss-feed, rss-journals, rss-reports, feedback-notify

**feedback-notify:** Sends email via Resend to berndichtl@gmail.com (via bernhard@varroamate.com forward) on every feedback INSERT. Trigger: `feedback_email_trigger` on public.feedback table using net.http_post with 30s timeout.

**Subscription tiers:** free / hobbyist (15 hives) / beekeeper (100 hives)
**Stripe prices (AU AUD):**
- free_ai: monthly `price_1THbQDBTHUgFRMZplmHLuXKM`, annual `price_1THdiDBTHUgFRMZp6qJ81WLY`
- hobbyist: monthly `price_1THdjfBTHUgFRMZpx6hJVDAh`, annual `price_1THdk8BTHUgFRMZpWAFaCdA7`
- beekeeper: monthly `price_1THdkdBTHUgFRMZpNEntFpEp`, annual `price_1THdkzBTHUgFRMZpKp2bbiSI`

---

## DAY PLAN SAVES (added 25 April 2026)

**Table:** `day_plan_saves` — separate from `treatment_plans` (which is for the Smart Planner timeline editor). Do not conflate the two.

Schema:
- `id` (uuid pk), `user_id` (fk to auth.users), `treatment` (drone/brood-break/split/duplex), `scope_key` (mirrors `_dpScope`: `'all'` | `'apiary:<uuid>'` | `'hive:<id>'`), `scope_name` (denormalised display name), `start_date` (date), `created_at`, `updated_at`
- Unique constraint: `(user_id, treatment, scope_key)` — one saved plan per (user, treatment, scope); upsert overwrites
- RLS: 4 policies (select/insert/update/delete) all gated on `auth.uid() = user_id`
- Heat treatment intentionally excluded — Save button hidden when `_activeDayPlan === 'heat'`

**JS surface (in `planner/index.html` and `uk/planner/index.html`):**
- `_DP_DATE_ID_MAP` — maps treatment id → date input element id
- `_dpReadCurrentDayPlanState()` — returns `{treatment, scope_key, scope_name, start_date}` or `null`
- `dpSaveDayPlan()` — checks for existing row, prompts overwrite confirm via `window.confirm()`, upserts
- `_dpRefreshSavedList()` — fetches user's saved plans, populates both `dpSavedSelect` and `dpSavedSelect2`
- `dpLoadSavedPlan(planId)` — restores scope, treatment, start date; triggers renderer via `input` event
- `_dpToggleSaveButtonForHeat()` — hides Save button when Heat is active

Hooks: `_dpRefreshSavedList()` called after `loadVMData()` in `onAuthStateChange`; `_dpToggleSaveButtonForHeat()` called at end of `selectDayPlan(id)`.

UI: 💾 Save plan button + 📁 Saved plans dropdown injected into both toolbars (top + inline). Helper line under Save button explains overwrite behaviour.

---

## TREATMENT CATEGORIES — 3-CATEGORY MODEL (refactored 25 April 2026)

VarroaMate uses a 3-category classification for treatments, replacing the earlier 2-category "Chemical vs Mechanical" split:

| Category | Treatments | `moa` value | `moaShort` |
|---|---|---|---|
| Chemical | OA (vap/dribble/spray), Apivar, Apitraz, Apistan, Bayvarol, Formic Pro, MAQS, Aluen CAP, Apiguard, ApiLife Var, Thymovar, VarroMed, Oxuvar, Api-Bioxal, Varroxal, Oxybee, Dany's BienenWohl | (existing labels: 'Organic', 'Synthetic', 'Thymol', 'Amitraz', 'Pyrethroid', 'Essential') | varies |
| Biological | Drone Comb Removal, Brood Interruption (queen caging) | `'Biological'` | `'BIO'` |
| Physical | Heat Treatment (Varroa Controller), Duplex-Framebox Plan | `'Heat'` | `'HT'` |

**JS identifiers (planner/index.html, uk/planner/index.html):**
- `BIO_IDS = new Set(['drone-comb','brood-int'])`
- `PHYS_IDS = new Set(['heat','duplex'])`
- `isBio(id)`, `isPhys(id)` — category predicates
- `bioOnly` flag in scoring result — `true` when plan contains only biological treatments
- `hasBio` / `hasPhys` / `hasChem` — used in `fullSpectrum` check (3+ MoA classes earns bonus)
- `BAND_LABELS = ['Chemical','Biological','Physical']` — chart Y-axis labels
- `moaClassesUsed` Set uses lowercase identifiers `'biological'`, `'heat_phys'`, `'organic'`, `'amitraz'`, etc.

**Scoring rule:** `Biological-only` plans (drone+brood-int alone, no chemicals/physical) hard-capped at 42% colony score. Physical-only is NOT capped because heat/duplex are far more effective than biological methods alone.

**Philosophy preferences (display names changed, ids preserved):**
- `'Mechanical + Heat Strategy Only'` → `'Biological + Physical Strategy Only'` (id: `'mechanical'` — unchanged for Supabase compatibility)
- `'Organic + Mechanical + Heat Strategy'` → `'Organic + Biological + Physical Strategy'` (id: `'mech-organic'` — unchanged)
- `'Organic + Heat Treatment'` — unchanged (specific product reference)
- `'Integrated Chemical & Non-Chemical'`, `'Organic-First with Emergency Synthetic'`, `'Organic-Only Strategy'` — unchanged

**Data migration ran 25 April 2026** — Supabase `profiles.treatment_pref` updated for 10 legacy users with old display names ('Mechanical + Organic Strategy', 'Mechanical Strategy Only'). Values mapped to current display names in lockstep with the code rename.

**Known structural fragility:** `profiles.treatment_pref` stores the literal display name string, not the id. This means future renames require a corresponding SQL migration. A future refactor should switch to storing the philosophy `id` and looking up the display name fresh from PREFS at render time.

**Apiary lookup bug fix (25 April 2026):** `dpSetScope()` in planner/index.html line 5953 originally used `x.id===key.slice(7)` for apiary lookup, which failed when APIARIES[i].id is integer and key.slice(7) is string. Now uses `String(x.id)===String(key.slice(7))` matching the hive lookup pattern on line 5954. One stale `day_plan_saves` row backfilled (apiary:9 → "Heatherlie Yard 1").

---

## DEPLOY WORKFLOW

```bash
# Edit file locally
cp ~/Downloads/index.html ~/varroamate-site/app/index.html
cd ~/varroamate-site
git add .
git commit -m "description"
git push origin main
# Live in ~60 seconds
```

**For UK files:** edit `~/varroamate-site/uk/app/index.html` — same workflow.
**For config:** edit `~/varroamate-site/config/au.js` or `uk.js` — all apps pick it up instantly.

---

## TRADEMARK

- Application: 2630556 (VarroaMate™), Filed 4 March 2026, Accepted 19 March 2026
- Classes: 9 (software) + 42 (SaaS)
- **PENDING:** Class 42 description needs amendment via S65A (wrong description from TM Headstart picklist)
- **PENDING:** Madrid Protocol MM2 via IP Australia — designate UK + EUIPO + Switzerland (after Class 42 amendment)

---

## FEEDBACK SYSTEM

- `feedback` table in Supabase (RLS: users can insert own + anonymous)
- `feedback-notify` Edge Function → Resend → `bernhard@varroamate.com` → Gmail
- Button IDs: `#btn-submit-feedback` (Submit Feedback), `submitContact()` (Contact form)
- App ratings: `app_ratings` table, upsert on `user_id` (one row per user)

---

## UK/IRELAND APP STATUS

**Live at:** `uk.varroamate.com` → `varroamate.com/uk/app/`

**Completed:**
- Northern hemisphere seasons, chart bands, action zone, colony loss threshold
- Full VMD treatment list with info cards (MAQS, Formicpro, VarroMed, Thymovar, Api-Bioxal, Varroxal, Oxuvar, Oxybee, Dany's BienenWohl, Apivar, Apitraz, Apistan)
- VMR Veterinary Medicine Administration Record export (all apiaries/hives, printable, NBU/DAFM compliant)
- Treatment library updated for UK (products, timing, resistance, references)
- Temperature chart with UK threshold lines (MAQS 25°C limit, no Aluen CAP, no Bayvarol)
- State selector removed
- Welcome text, resources, sign-in subtitle all UK/IE
- Regulatory text: VMD/NBU/DAFM/HPRA throughout
- GBP pricing display (£2.99/£4.99/£9.99)
- DWV correctly referenced as primary virus concern
- AI date/season awareness (passes today's date explicitly)
- AI approved treatment list corrected for UK VMD products
- AI chat refers to Smart Planner for detailed planning
- BeeMAX references removed from count cards and field screen
- Amitraz resistance paragraph updated to UK context
- uk.js: properly distinguishes UK (VMD/NBU) from Ireland (HPRA/DAFM/FIBKA)

**Still to do:**
- `uk/hygiene/` — AI chat wired up (25 Apr); other parity items still pending
- `uk/planner/`, `uk/productivity/` — same fixes as main app
- Legal documents: Privacy Policy and T&Cs need UK GDPR addendum
- Cookie consent banner for UK/EU (Google Analytics)
- Stripe GBP/EUR pricing (create new Stripe price objects)
- Data Processing Agreements with Supabase, Anthropic, Stripe, Resend
- Resend domain: switch FROM address to `feedback@varroamate.com` once fully verified

---

## KNOWN ISSUES / PENDING FIXES

### Parked from this session

1. **Auto-populate dose unit from selected treatment**: TREATMENTS metadata objects differ between AU and UK in keys, structure, whitespace formatting (UK has `formicpro`, `varroxal`, `oxybee`, `danys`, `maqs`, `oxalic-vap`; AU has `aluen-cap` which UK doesn't; UK uses ` ` after `:`, AU doesn't). Need per-region TREATMENT_UNITS dictionaries. Users currently pick the unit manually — small UX cost, defer until other treatment-metadata cleanup.

2. **Walk-away timeline canvas**: Pagden canvas was redesigned (commit 8d9ec52). Walk-away canvas left as-is. Has same false-precision issue (hardcoded milestone column positions implying fixed days for biology that's actually weather-dependent). Worth a dedicated session to bring it in line with Pagden.

3. **Long sessions slowing down**: this session got long because of the volume of biology and design work. For the next 2–3 sessions a fresh chat per major topic is probably better than one long session.

### Older items still pending

1. **AU app `au.js` tag** — was lost during migration, manually restored. Monitor that `<script src="/config/au.js">` stays in `app/index.html`.

2. **UK fix_uk_ai_issues.py** — ran successfully but 2 skips:
   - "pass today date to AI context" (hd object) — not critical, date now in system prompt
   - "BeeMAX Hive Strength field screen" — check if `(for BeeMAX)` still appears:
     ```bash
     grep -n "for BeeMAX" ~/varroamate-site/uk/app/index.html
     ```

3. **UK treatment info cards** — Aluen CAP and Bayvarol entries still exist in TREATMENTS object with ⚠️ "not registered" notes. This is correct — they show a warning if selected.

4. **DACH expansion** — `de.js` config not yet started. Architecture ready.

5. **UK Hygiene AI** — HANDOVER previously noted `uk/hygiene/` as "still to do" but the AI chat is in fact wired up (different system prompt referencing NBU/DAFM, VMD-registered treatments). On 25 April, `renderAIMarkdown` was hardened in both AU + UK hygiene to handle `###` headers and `*` bullets, and system prompts updated to instruct plain-prose responses. UK renderer was previously simpler than AU's — both now match.

---

## RSS FEEDS

**Edge Functions:**
- `rss-feed` — AU beekeeping news
- `rss-journals` — 12 scientific feeds (AHBIC, Apidologie, COLOSS, JAR, blogs)
- `rss-reports` — USDA NASS + J. Apicultural Research + Bee World

**Homepage tabs:** News / Journals & Blogs / Reports

---

## LEGAL (PRIORITY FOR UK/IE/EU LAUNCH)

**Immediate:**
- Privacy Policy: add UK GDPR / EU GDPR section (lawful basis, data subject rights, international transfers, processor list)
- Terms & Conditions: add 14-day cooling-off right for UK/EU, update governing law clause
- Cookie consent banner for UK/EU (Google Analytics fires without consent)

**Medium term:**
- Sign DPAs: Supabase, Anthropic, Stripe, Resend all offer standard DPAs
- CCPA addendum for US users

---

## USEFUL COMMANDS

```bash
# Check AU app has au.js tag
grep "config/au.js" ~/varroamate-site/app/index.html

# Check UK app season logic
grep "getSeason\|monthSeason\|_seasonKey" ~/varroamate-site/uk/app/index.html | head -5

# Deploy Supabase Edge Function
cd ~ && supabase functions deploy FUNCTION_NAME --project-ref yadptqjsjqxqjxouqkll

# Set Supabase secret
supabase secrets set KEY=value --project-ref yadptqjsjqxqjxouqkll

# Check feedback table
curl -s -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "apikey: ANON_KEY" \
  "https://yadptqjsjqxqjxouqkll.supabase.co/rest/v1/feedback?limit=5&order=id.desc"


# Inspect day_plan_saves table
curl -s -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "apikey: ANON_KEY" \
  "https://yadptqjsjqxqjxouqkll.supabase.co/rest/v1/day_plan_saves?limit=10&order=updated_at.desc"
```

---

## TRANSCRIPT HISTORY

Previous session transcripts in `/mnt/transcripts/`:
- `2026-04-12-02-27-35-varroamate-dev-session.txt`
- `2026-04-12-10-45-55-varroamate-dev-session-2.txt`
- `2026-04-25-varroamate-dev-session.txt` (VMSP mobile font, dayplan card layout, VMHH AI markdown fix, Day Plan Save feature, 3-category treatment refactor Mechanical→Biological+Physical, apiary lookup bug fix)
- `2026-04-27` and `2026-04-28` sessions (Pagden Stages 1–3, walk-away Stage 4, dose tracking schema + UI, CSV regulatory header)
- `2026-04-29` session (weather font bumps, region-specific dose wording, brood-int 14-day protocol, mystery hive, Pagden canvas redesign + CVD contrast fix, drone-comb heat alternative)
- Current session transcript will be in journal after this chat ends

---

## HOW TO START A NEW SESSION

Paste this into a new Claude chat:

> I'm continuing development of VarroaMate, an Australian beekeeping SaaS platform.
> Please read this handover document carefully — it contains full context of where we are.
> [paste this document]
> 
> Today I want to work on: [YOUR TASK]
