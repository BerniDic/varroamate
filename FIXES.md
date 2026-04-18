# VarroaMate — Fix Log

Last updated: 2026-04-16

## Workflow Rule
**NEVER use uploaded files as base for fixes.**
Always apply fixes directly to repo files via `python3` or `perl` on `~/varroamate-site/...`
Uploads are for reference/inspection only.

---

## `app/index.html` (AU VarroaMate app)
- Sign-out → `window.location.href='/'` (landing page, not s-welcome)
- Boot: checks `?redirect=planner` after sign-in → redirects to `/planner/`
- Amitraz mechanism: does NOT penetrate capped cells; mites carry residues in on their bodies; 6–10 week strips required to cover brood cycle
- Apivar/Apitraz `withBrood` fields updated with correct mechanism
- Home button: `href="/"` ✓ (correct for AU app)

## `planner/index.html` (AU Smart Planner)
- `_requireHive()` guard on `promptNewPlan()`, `suggestPlan()`, `getAIAdvice()`
- Window delete button fix: `mousedown` checks `windowDeleteRects` before starting drag
- Unauthenticated redirect: `/app/?redirect=planner`
- Bayvarol: `supersOff:false`, registry note "Supers on permitted"

## `hygiene/index.html` (AU Hive Hygiene)
- Bare-handed text: removed incorrect Varroa claim → "especially for AFB spores and EFB"
- Nitrile glove note: bees rarely sting nitrile (smooth surface, no alarm pheromones); stings occur if bee directly crushed
- Small Hive Beetle emoji: `filter:grayscale(1) brightness(0.2)` in render function

## `index.html` (AU Landing Page)
- Replaced old AU mite tracker with animated hive-chooser landing page
- All hive card URLs correct: `/app/`, `/planner/`, `/productivity/`, `/hygiene/`

---

## `uk/app/index.html` (UK VarroaMate app)
- Sign-out → `window.location.href='/uk/'`
- Home button: `href="/uk/"` ✓
- DAFM link: `https://www.gov.ie/en/department-of-agriculture-food-and-the-marine/publications/beekeeping-honey/`
- AHBIC treatment table link replaced with NBU equivalent
- Oxuvar spray description fixed (was incorrectly showing Aluen CAP polymer text)
- Amitraz mechanism: same fix as AU app
- Apivar/Apitraz `withBrood` fields updated
- Boot: checks `?redirect=planner` → redirects to `/uk/planner/`

## `uk/planner/index.html` (UK Smart Planner)
- `_requireHive()` guard on `promptNewPlan()`, `suggestPlan()`, `getAIAdvice()`
- Window delete button fix: same as AU
- `ACTION_ZONE_BY_MONTH` / `LOSS_THRESHOLD_BY_MONTH` read from `VM_CONFIG` (uk.js)
- `REGIONAL_CALENDAR` uses NH months (OAV: Dec–Feb, Spring: Mar–May, Autumn: Sep–Nov)
- Unauthenticated redirect: `/uk/app/?redirect=planner`

## `uk/hygiene/index.html` (UK Hive Hygiene)
- Home button (top-left logo `class="top-logo"`): `href="/uk/"` (different pattern from other apps)
- Sign-out: `window.location.href='/uk/'`
- DAFM link corrected
- AU reference sources replaced: NBU BeeBase, NBU Managing Varroa, DAFM
- Bare-handed text: same fix as AU
- Nitrile glove note: same as AU
- Small Hive Beetle emoji: same fix as AU

## `uk/index.html` (UK/IE Landing Page)
- Oak trees (replaces gum trees), sheep flock at ~77-80% left (replaces kangaroo)
- GBP pricing: Free £0, Free+AI £2.49/mo, Hobbyist £3.99/mo, Beekeeper £7.99/mo
- All app links → `/uk/app/`, `/uk/planner/`, `/uk/productivity/`, `/uk/hygiene/`
- DYK banner: green rotating tips, no AU/BeeMAX references
- RSS filter buttons use category `uk` (not `australia`)
- DAFM link correct

## `config/uk.js` (UK VM_CONFIG)
- No changes — source of truth for UK thresholds, seasons, treatments
- `chartActionZone`: action 6/300 (~2%), critical 12/300 (~4%) per NBU
- `chartSeasonThreshold`: NH seasonal thresholds

## Supabase edge function `rss-feed`
- UK feeds added: NBU, BBKA, BeeCraft, Beelistener, Urban Bees (category: `uk`)
- AU feeds retained: AHBIC, AgVic, NSW DPI (category: `australia`)
- User-Agent updated: `varroamate.com` (was `varroamate.com.au`)

## `planner/index.html` + `uk/planner/index.html` (AU+UK Smart Planner)
- Nectar flow windows: `× delete button` suppressed for `_itinLeg:true` windows
  - Condition `&& !win._itinLeg` added to delete rect draw block
  - Flow windows remain draggable but cannot be deleted

- Chat assistant: input and send button were missing from vmsp-chat-input-row — restored directly in repo
- Chat panel: overflow:hidden restored (was briefly set to visible during height debugging)

## 2026-04-18 Session

### `app/index.html` + `uk/app/index.html`
- Backup (v4): includes productivity data — harvests, inspections, queens, colony_losses
- Restore: hiveIdMap tracks old→new hive IDs; restores all productivity tables
- Harvest restore: correct field name `kg` (not `weight_kg`), includes system/label/supers
- CSV export: fetches all data fresh from Supabase (not in-memory cache); includes all productivity data
- CSV harvest: correct `kg` field with fallback chain; includes system/label/supers in notes
- Efficacy badge: 28-day post-treatment window; `noPost` pill when no count within window; `white-space:nowrap` fix
- Efficacy badge tooltip: updated to "4 weeks"
- Treatment efficacy: `getHiveEfficacy` uses exact dates, 90-day pre window, 28-day post window

### `planner/index.html` + `uk/planner/index.html`
- Efficacy tab: added to both AU and UK planners
- Efficacy tab: recalculates from live HISTORY after `loadVMData` completes
- Efficacy tab: 28-day post-treatment window (matching app)
- Efficacy tab: `noPost` records shown in table
- Efficacy tab: mobile layout — stacked charts, overflow:hidden, table horizontal scroll
- Efficacy tab: per-product line chart for "Efficacy by Month"
- Efficacy tab: AI advice removes `_requireHive` gate
- Efficacy tab: AI advice prompt emphasises MoA rotation and resistance prevention
- Efficacy tab: season filter dropdowns wrap on mobile
- MoA rotation score: includes last 12 months of treatment history
- AI advice: full treatment history + MoA violation check injected into prompt
- AU `_effGetSeason`: fixed Dec to show Summer (was Winter)
- UK `_effGetSeason`: Northern Hemisphere seasons
- Touch delete: `windowDeleteRects` checked in `touchstart` for mobile window deletion
