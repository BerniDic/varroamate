# VarroaMate Development Handover
## Session date: 25 April 2026
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
- `2026-04-25-varroamate-dev-session.txt` (VMSP mobile font, dayplan card layout, VMHH AI markdown fix, Day Plan Save feature)
- Current session transcript will be in journal after this chat ends

---

## HOW TO START A NEW SESSION

Paste this into a new Claude chat:

> I'm continuing development of VarroaMate, an Australian beekeeping SaaS platform.
> Please read this handover document carefully — it contains full context of where we are.
> [paste this document]
> 
> Today I want to work on: [YOUR TASK]
