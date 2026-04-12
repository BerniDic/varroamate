/**
 * VarroaMate Region Config — Australia (au)
 * ─────────────────────────────────────────
 * This is the source-of-truth config for the AU region and the
 * reference template for all future region configs.
 *
 * Usage: load BEFORE the app script.
 *   <script src="/config/au.js"></script>
 *   <script src="/app/varroamate.js"></script>
 *
 * In app code replace every hardcoded region value with VM_CONFIG.*
 * See MIGRATION.md for the full find-and-replace reference.
 */

window.VM_CONFIG = {

  // ── Identity ──────────────────────────────────────────────────────────────
  region:   'AU',
  locale:   'en-AU',
  hemisphere: 'southern',   // 'southern' | 'northern'
  currency: 'AUD',
  dateFormat: 'en-AU',      // used in toLocaleDateString() calls


  // ── Seasons ───────────────────────────────────────────────────────────────
  // month is 0-indexed (JS Date.getMonth())
  // Replace getSeason(m) inline logic and all seasonal month maps
  seasons: {
    spring: { months: [7, 8, 9],        label: 'Spring', icon: '🌱', risk: 'high',     color: '#5A9E60', cssVar: '--spring' },
    summer: { months: [10, 11, 0, 1],   label: 'Summer', icon: '☀️',  risk: 'med',      color: '#E8A020', cssVar: '--summer' },
    autumn: { months: [2, 3, 4],        label: 'Autumn', icon: '🍂', risk: 'critical', color: '#C05A20', cssVar: '--autumn' },
    winter: { months: [5, 6],           label: 'Winter', icon: '❄️',  risk: 'low',      color: '#4A7898', cssVar: '--winter' },
  },

  // Convenience: month → season key  (replaces inline {8:'Spring',...} maps)
  // Built automatically below — do not edit manually
  // Access as: VM_CONFIG.monthSeason[new Date().getMonth()]
  monthSeason: {
    0:'summer', 1:'summer', 2:'autumn', 3:'autumn', 4:'autumn',
    5:'winter', 6:'winter', 7:'spring', 8:'spring', 9:'spring',
    10:'summer', 11:'summer',
  },

  // Seasonal guidance messages (used in getSeasonalWindow equivalents)
  seasonalGuidance: {
    spring: {
      msg: 'Spring brood disease window. Swarm season — inspect every 1–2 weeks. Avoid unnecessary frame exchange.',
      actions: [
        'Inspect brood carefully — record any abnormal cells',
        'Check for queen cells every visit',
        'Avoid frame exchange between hives',
        'Flame sterilise tools between apiaries',
        'Quarantine any new colonies',
      ],
    },
    summer: {
      msg: 'Peak colony strength but mite populations building. Nectar dearth later in summer increases robbing and drifting.',
      actions: [
        'Alcohol wash every 4 weeks — record all counts in VarroaMate',
        'Watch for DWV symptoms (deformed wings, crawling bees)',
        'Inspect for small hive beetle — deploy traps in warm months',
        'Reduce entrances if robbing observed',
        'Avoid open feeding or exposed honey frames',
      ],
    },
    autumn: {
      msg: 'Most critical window of the year. Treat Varroa now to protect winter bees. Colony contraction increases robbing risk.',
      actions: [
        'Monitor mites — alcohol wash every 4 weeks',
        'Treat for Varroa if ≥3/300 bees — complete before end of April',
        'Reduce hive entrances to limit robbing',
        'Remove deadouts within 24 hours',
        'Leave adequate honey stores for winter',
      ],
      criticalDeadlineMonth: 3,   // April (0-indexed) — "treat before end of April"
      criticalDeadlineLabel: 'end of April',
    },
    winter: {
      msg: 'Minimal colony activity. Focus on stores, equipment, and spring preparation.',
      actions: [
        'Check stores — feed if light',
        'Prepare equipment for spring',
        'Plan Varroa monitoring schedule',
        'Order supplies before spring rush',
      ],
    },
  },

  // Active monitoring season (alcohol wash frequency guidance)
  // Replaces hardcoded "September–April" / "May–August" references
  monitoringSeason: {
    activeMonths: [8, 9, 10, 11, 0, 1, 2, 3],   // Sep–Apr: 4-weekly washes
    reducedMonths: [4, 5, 6, 7],                  // May–Aug: 6–8 weekly
    activeLabel:   'September–April',
    reducedLabel:  'May–August',
    activeInterval:   4,   // weeks
    reducedInterval:  7,   // weeks
  },


  // ── Mite Thresholds ───────────────────────────────────────────────────────
  // Replaces all T_CRIT / T_ACT / hardcoded 3/300 / 9/300 references
  thresholds: {
    sampleSize:   300,    // bees per alcohol wash
    action:       3,      // mites/300 — treatment decision required
    critical:     9,      // mites/300 — treat immediately
    label:        '3/300 bees',
    criticalLabel:'9/300 bees',
    per:          300,
  },

  // Seasonal action zones for chart rendering
  // Replaces hardcoded actionZone and seasonThreshold objects
  // month (0-indexed) → { lo, hi } action band; scale → chart Y-axis max
  chartActionZone: {
    0: { lo:5, hi:7 },   // Jan — summer
    1: { lo:5, hi:7 },   // Feb — summer
    2: { lo:3, hi:4 },   // Mar — autumn
    3: { lo:3, hi:4 },   // Apr — autumn
    4: { lo:3, hi:4 },   // May — autumn
    5: { lo:2, hi:3 },   // Jun — winter
    6: { lo:2, hi:3 },   // Jul — winter
    7: { lo:2, hi:3 },   // Aug — winter (late)
    8: { lo:3, hi:5 },   // Sep — spring
    9: { lo:3, hi:5 },   // Oct — spring
    10:{ lo:3, hi:5 },   // Nov — spring (late)
    11:{ lo:5, hi:7 },   // Dec — summer
  },
  chartSeasonThreshold: {
    0: 15, 1: 15,         // summer — high tolerance (large colony)
    2: 8,  3: 8,  4: 8,  // autumn — tightening
    5: 5,  6: 5,  7: 5,  // winter — low
    8: 10, 9: 10, 10:10, // spring — building
    11:15,                // summer
  },


  // ── Approved Treatments ───────────────────────────────────────────────────
  // Replaces all hardcoded product lists in AI prompts and guidance
  // Keys match the 'product' field in the treatments table
  treatments: {
    // Product registry
    products: {
      'oxalic':       { name:'OA Vaporisation',   abbrev:'OAV',  moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'3–25°C',   regBody:'APVMA', regNote:'APVMA registered. Supers ON permitted. WHP: nil. 3 × weekly applications. Most effective in broodless period.' },
      'oxalic-dribble':{ name:'OA Dribble',        abbrev:'OAD',  moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'>5°C',     regBody:'APVMA', regNote:'APVMA registered. Single application only. Broodless period essential. WHP: nil.' },
      'formic':       { name:'Formic PRO',          abbrev:'FPro', moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'10–29°C',  regBody:'APVMA', regNote:'APVMA registered. Supers ON permitted. WHP: nil. 1 strip × 7 days. Penetrates capped brood.' },
      'aluen-cap':    { name:'Aluen CAP',           abbrev:'ACAP', moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'5–40°C',   regBody:'APVMA', regNote:'APVMA registered. Supers ON permitted. WHP: nil. Up to 42 days. Effective with brood.' },
      'apilife':      { name:'ApiLife Var',         abbrev:'ALV',  moa:'Essential Oil', moaShort:'EO',  synthetic:false, supersOff:true,  tempRange:'15–30°C',  regBody:'APVMA', regNote:'APVMA registered. Remove supers. WHP: nil. 3 × 10-day applications.' },
      'apiguard':     { name:'Apiguard',            abbrev:'APG',  moa:'Essential Oil', moaShort:'EO',  synthetic:false, supersOff:true,  tempRange:'>15°C',    regBody:'APVMA', regNote:'APVMA registered. Remove supers. WHP: nil. 2 × 14-day applications.' },
      'apivar':       { name:'Apivar',              abbrev:'APV',  moa:'Amitraz',       moaShort:'AMZ', synthetic:true,  supersOff:true,  tempRange:'>10°C',    regBody:'APVMA', regNote:'APVMA registered. Remove supers. WHP: nil. 2 strips × 56 days. Rotate MoA.' },
      'apitraz':      { name:'Apitraz',             abbrev:'APT',  moa:'Amitraz',       moaShort:'AMZ', synthetic:true,  supersOff:true,  tempRange:'>10°C',    regBody:'APVMA', regNote:'APVMA registered. Remove supers. WHP: nil. 42-day treatment. Same MoA as Apivar — do not use in same season.' },
      'bayvarol':     { name:'Bayvarol',            abbrev:'BAY',  moa:'Pyrethroid',    moaShort:'PYR', synthetic:true,  supersOff:true,  tempRange:'Wide',     regBody:'APVMA', regNote:'APVMA registered. Remove supers. WHP: nil. ⚠️ Pyrethroid resistance confirmed in northern NSW and SE QLD.' },
      'apistan':      { name:'Apistan',             abbrev:'API',  moa:'Pyrethroid',    moaShort:'PYR', synthetic:true,  supersOff:true,  tempRange:'Wide',     regBody:'APVMA', regNote:'APVMA registered. Remove supers. WHP: nil. ⚠️ Widespread pyrethroid resistance — confirm efficacy with post-treatment wash.' },
      'drone-comb':   { name:'Drone Comb Removal',  abbrev:'DCR',  moa:'Mechanical',    moaShort:'MCH', synthetic:false, supersOff:false, tempRange:'Any',      regBody:null,    regNote:'No registration required — mechanical method. Permitted under all state Varroa regulations.' },
      'brood-int':    { name:'Brood Interruption',  abbrev:'BRI',  moa:'Mechanical',    moaShort:'MCH', synthetic:false, supersOff:false, tempRange:'Any',      regBody:null,    regNote:'No registration required. Combine with OA vaporisation during broodless period. Best timing: Jan–Feb.' },
      'heat':         { name:'Heat Treatment (Varroa Controller)', abbrev:'HT', moa:'Heat', moaShort:'HT', synthetic:false, supersOff:false, tempRange:'>18°C ambient', regBody:null, regNote:'No registration required. No WHP. Supers may remain on hive.' },
      'duplex':       { name:'Duplex-Framebox Plan', abbrev:'DFB', moa:'Heat',          moaShort:'HT',  synthetic:false, supersOff:false, tempRange:'>18°C ambient', regBody:null, regNote:'Queen caging + heat treatment combination. OA dribble on Day 24 must comply with APVMA label.' },
    },

    // Ordered list for AI prompts — the canonical "approved list"
    approvedList: [
      'OA Vaporisation', 'OA Dribble', 'Formic PRO', 'Aluen CAP',
      'ApiLife Var', 'Apiguard', 'Apivar', 'Apitraz', 'Bayvarol', 'Apistan',
      'Drone Comb Removal', 'Brood Interruption (queen caging)',
      'Heat Treatment (Varroa Controller)', 'Duplex-Framebox Plan',
    ],

    // Products explicitly NOT approved — used in AI negative rules
    notApproved: [
      'sugar dusting', 'powdered sugar', 'icing sugar', 'sugar rolls',
      'lactic acid spray', 'thymol crystals', 'hop beta acids',
      'formic acid pads', 'oxalic acid syrup', 'MAQS',
    ],

    // Products where honey supers MUST be removed
    supersOff: ['apivar', 'apitraz', 'apistan', 'apilife', 'apiguard'],
    // Products where supers MAY remain on
    supersOn:  ['oxalic', 'oxalic-dribble', 'formic', 'aluen-cap', 'bayvarol', 'drone-comb', 'brood-int', 'heat', 'duplex'],

    // Product name aliases — for AI prompt rules
    productNameRules: {
      'formic': { use: 'Formic PRO', neverUse: ['MAQS', 'formic acid strips'] },
    },

    // Organic-only approved subset (Philosophy: Organic-Only Strategy)
    organicOnly: ['oxalic', 'oxalic-dribble', 'formic', 'aluen-cap', 'apilife', 'apiguard'],
  },


  // ── Diseases ──────────────────────────────────────────────────────────────
  diseases: {
    // Confirmed present in this region — AI may reference these
    present: ['AFB', 'EFB', 'Chalkbrood', 'Sacbrood', 'Nosema', 'Small Hive Beetle', 'Braula fly', 'Varroa'],

    // Notifiable diseases — trigger mandatory reporting guidance
    notifiable: ['AFB', 'EFB'],

    // Diseases NOT confirmed in this region — AI must never mention as threats
    notPresent: ['DWV', 'Tropilaelaps', 'Asian hornet'],

    // AI rule text — injected directly into system prompts
    aiRules: {
      dwv: 'CRITICAL — DWV (deformed wing virus) has NOT been confirmed in Australia as of 2026. NEVER mention DWV, deformed wing virus, or wing deformities as a symptom, risk, or diagnosis. It is not present in Australia. If asked directly, explain it has not been detected here. Describe brood abnormalities as consistent with high Varroa load or other established diseases.',
      notPresent: 'NEVER mention Tropilaelaps, Asian hornets, or DWV as active Australian threats.',
      notifiable: 'AFB and EFB are notifiable diseases in all Australian states. If either is suspected, instruct the beekeeper to report to their state agriculture authority immediately before destroying or moving any equipment.',
    },
  },


  // ── Regulatory / Agencies ─────────────────────────────────────────────────
  // Replaces all hardcoded APVMA / AHBIC / BeeMAX / state authority references
  agencies: {
    regulator:      'APVMA',
    regulatorFull:  'Australian Pesticides and Veterinary Medicines Authority',
    regulatorUrl:   'https://www.apvma.gov.au',
    industry:       'AHBIC',
    industryFull:   'Australian Honey Bee Industry Council',
    trackingSystem: 'BeeMAX',
    trackingLabel:  'BeeMAX Export',
    reportingLabel: 'your state agriculture authority',
    reportingNote:  'Report positive Varroa detections to your state agriculture authority.',

    // State-level data (AU-specific — omitted in other regions)
    states: {
      VIC: {
        name: 'Victoria',
        authority: 'Agriculture Victoria',
        authorityUrl: 'https://agriculture.vic.gov.au/biosecurity/pest-insects-and-mites/priority-pest-insects-and-mites/varroa-mite-of-honey-bees',
        reportingSystem: 'BeeMAX',
        summary: 'Varroa established across Victoria. The statewide control area order was lifted in 2025. All chemical treatments are now available for use when thresholds are met. Varroa Development Officers (VDOs) are available for support.',
        treatmentNote: 'All AHBIC-listed products available. Report positive detections via BeeMAX.',
        varroaPresent: true,
      },
      NSW: {
        name: 'New South Wales',
        authority: 'NSW DPIRD',
        authorityUrl: 'https://www.dpi.nsw.gov.au/biosecurity/bees',
        reportingSystem: 'Bee 123 form',
        summary: 'Varroa established across NSW. ⚠️ APRIL 2026: Pyrethroid resistance (L925I) AND amitraz resistance now both confirmed in northern NSW populations. Monitor Bayvarol, Apistan, Apivar and Apitraz efficacy closely with post-treatment alcohol wash.',
        treatmentNote: 'All AHBIC-listed products available under current APVMA permits. Use only when treatment thresholds are met.',
        varroaPresent: true,
        resistanceWarning: 'IMPORTANT (April 2026): Pyrethroid resistance (L925I) AND amitraz resistance are now both confirmed in northern NSW populations. If recommending Bayvarol, Apistan, Apivar, or Apitraz in NSW, include a strong caution: these treatments may be ineffective in affected areas. Recommend a post-treatment alcohol wash at day 14–21 to confirm efficacy.',
      },
      QLD: {
        name: 'Queensland',
        authority: 'Biosecurity Queensland',
        reportingSystem: 'Bee 123 form',
        summary: 'Varroa detected in Queensland and spreading. All acaricides available for rotational use when mite loading thresholds are met. Beekeepers must register as a biosecurity entity.',
        treatmentNote: 'All AHBIC-listed products available. Treatment only when thresholds are met. Report via Bee 123 form.',
        varroaPresent: true,
        resistanceWarning: 'Pyrethroid and amitraz resistance confirmed in south-east QLD populations. Monitor treatment efficacy closely.',
      },
      ACT: {
        name: 'Australian Capital Territory',
        authority: 'ACT Environment, Planning and Sustainable Development',
        reportingSystem: 'NSW DPIRD (ACT follows NSW conditions)',
        summary: 'Varroa present in ACT, consistent with NSW spread. All products on the AHBIC treatment table are available.',
        treatmentNote: 'ACT follows NSW permit conditions. All AHBIC-listed products available.',
        varroaPresent: true,
        resistanceWarning: 'Monitor efficacy — pyrethroid AND amitraz resistance confirmed in northern NSW (April 2026).',
      },
      SA: {
        name: 'South Australia',
        authority: 'PIRSA Biosecurity SA',
        reportingSystem: 'PIRSA',
        summary: 'Varroa not yet detected in SA as of early 2026. All hive movements from eastern states require inspection.',
        treatmentNote: 'No Varroa treatment required. Focus on surveillance and biosecurity.',
        varroaPresent: false,
      },
      WA: {
        name: 'Western Australia',
        authority: 'DPIRD WA',
        reportingSystem: 'DPIRD WA',
        summary: 'Varroa not detected in WA. Strict movement controls on bees and equipment from eastern states.',
        treatmentNote: 'No Varroa treatment required. Focus on surveillance and biosecurity.',
        varroaPresent: false,
      },
      TAS: {
        name: 'Tasmania',
        authority: 'DPIPWE',
        reportingSystem: 'DPIPWE',
        summary: 'Varroa not detected in Tasmania. Island biosecurity provides additional protection.',
        treatmentNote: 'No Varroa treatment required. Focus on surveillance and biosecurity.',
        varroaPresent: false,
      },
      NT: {
        name: 'Northern Territory',
        authority: 'NT DEPWS',
        reportingSystem: 'NT DEPWS',
        summary: 'Varroa status: monitoring. Follow NT biosecurity guidance.',
        treatmentNote: 'Check current NT biosecurity status before treating.',
        varroaPresent: false,
      },
    },
  },


  // ── AI System Prompt Fragments ────────────────────────────────────────────
  // These are injected into AI prompts at runtime — never hardcode in the prompt
  ai: {
    // Identity line — first line of every system prompt
    identity: 'You are VarroaMate, a friendly expert assistant for Australian beekeepers managing Varroa mite.',

    // Treatment rules — injected into every guidance/chat prompt
    treatmentRules: `APPROVED TREATMENTS ONLY: Only recommend or discuss treatments from this list — no others: OA Vaporisation, OA Dribble, Formic PRO, Aluen CAP, ApiLife Var, Apiguard, Apivar, Apitraz, Bayvarol, Apistan, Drone Comb Removal, Brood Interruption (queen caging), Heat Treatment (Varroa Controller), Duplex-Framebox Plan.
Do NOT suggest sugar dusting, powdered sugar, icing sugar, lactic acid spray, thymol crystals, hop beta acids, or any other unlisted method. If asked directly about an unlisted method, say only that it is not supported in VarroaMate and offer to help with the approved list.`,

    // Product name enforcement
    productNameRules: `Always use "Formic PRO" — never use the outdated name "MAQS". Formic PRO is the current registered product name for formic acid strips in Australia.`,

    // Disease rules
    diseaseRules: `CRITICAL: DWV (deformed wing virus) has NOT been confirmed in Australia — never mention it as a symptom or concern. Only reference diseases established in Australia: AFB, EFB, Chalkbrood, Sacbrood, Nosema, Small Hive Beetle, Braula fly, Varroa. NEVER mention Tropilaelaps, Asian hornets, or DWV as active Australian threats.`,

    // Counting method
    countingRules: `MITE COUNTING: All mite counting in VarroaMate uses alcohol wash exclusively — do not suggest sugar rolls, sugar dusting, sticky boards, or CO2 wash as counting methods.`,

    // Seasonal context suffix — appended to prompts that include season data
    hemisphereLabel: 'Southern Hemisphere',

    // Alcohol wash frequency rule
    washFrequencyRules: `Do NOT recommend 4-weekly alcohol washes during winter (May–August in Australia). In winter, colonies are broodless or have minimal brood — wash frequency should reduce to every 6–8 weeks. Only recommend 4-weekly washes during the active season (September–April).`,

    // Colony euthanasia guidance (AU-specific framing)
    euthanasiaGuidance: `COLONY EUTHANASIA: When a colony is at critical mite load (≥9/300) AND is already in severe decline AND the season makes recovery unlikely (particularly March–April heading into winter), include colony euthanasia as a recommended option alongside treatment. The recommended method is soapy water poured directly into the hive. This is consistent with NSW DPIRD and Agriculture Victoria biosecurity guidance. Frame sensitively — but be clear that leaving a collapsing colony to die naturally is worse for the apiary than euthanasia. When describing colony decline symptoms, refer to disrupted brood pattern, spotty brood, high mite load effects — do NOT mention deformed wing virus or DWV symptoms.`,

    // Regulatory context
    regulatoryContext: `Refer to the APVMA for product registration and permit conditions. Direct beekeepers to their state agriculture authority for biosecurity reporting. In Victoria, biosecurity reporting is via BeeMAX.`,

    // Chat assistant system prompt (full — used in the AI chat panel)
    chatSystem: `You are VarroaMate, a friendly expert assistant for Australian beekeepers managing Varroa mite. Help with varroa treatments, mite counting, resistance management, treatment rotation, organic vs chemical approaches, Victorian biosecurity reporting via BeeMAX. Keep answers concise and practical. Always use "Formic PRO" — never use the outdated name "MAQS". CRITICAL: DWV (deformed wing virus) has NOT been confirmed in Australia — never mention it as a symptom or concern. Only reference diseases established in Australia: AFB, EFB, Chalkbrood, Sacbrood, Nosema, Small Hive Beetle, Braula fly, Varroa. APPROVED TREATMENTS ONLY: Only recommend or discuss treatments from this list — no others: OA Vaporisation, OA Dribble, Formic PRO, Aluen CAP, ApiLife Var, Apiguard, Apivar, Apitraz, Bayvarol, Apistan, Drone Comb Removal, Brood Interruption (queen caging), Heat Treatment (Varroa Controller), Duplex-Framebox Plan. Do NOT suggest sugar dusting, powdered sugar, icing sugar, lactic acid spray, thymol crystals, hop beta acids, or any other unlisted method. MITE COUNTING: All mite counting in VarroaMate uses alcohol wash exclusively — do not suggest sugar rolls, sugar dusting, sticky boards, or CO2 wash as counting methods.`,
  },


  // ── UI Strings ────────────────────────────────────────────────────────────
  // Human-readable labels that appear in the UI
  // For full translation support these move to strings/en-AU.js
  // For now they live here as a single source of truth
  ui: {
    alcoholWashLabel:   'Alcohol wash (~300 bees)',
    alcoholWashUnit:    'mites / ~300 bees (alcohol wash)',
    thresholdLabel:     '3/300 bees',
    criticalLabel:      '9/300 bees',
    seasonalWindowNote: 'Active monitoring season: September–April (4-weekly). Winter: every 6–8 weeks.',
    calendarReminderNote: 'Alcohol wash ~300 bees (½ cup) per hive. Record each result in VarroaMate.\nGeneral guidance: count every 4 weeks during the active season (Aug–Apr); reduce to every 6–8 weeks in winter (May–Jul). Increase to fortnightly if counts are rising or after treatment.',
    exportLabel:        'BeeMAX Export',
    countMethod:        'Alcohol wash',
    countMethodNote:    'The only method accepted for biosecurity reporting in most states.',
    countMethodUrl:     'https://agriculture.vic.gov.au/biosecurity/animal-diseases/honey-bee-pests-and-diseases/alcohol-wash-test-to-detect-honey-bee-parasites',
  },


  // ── Helper Functions ──────────────────────────────────────────────────────
  // Convenience methods — available as VM_CONFIG.getSeason(m) etc.

  /**
   * Returns season key for a given month (0-indexed).
   * Replaces all inline getSeason(m) / month-map lookups.
   * @param {number} m — JS month (0=Jan … 11=Dec)
   * @returns {'spring'|'summer'|'autumn'|'winter'}
   */
  getSeason(m) {
    return this.monthSeason[m];
  },

  /**
   * Returns the full season config object for a given month.
   * @param {number} m
   * @returns {object} season config
   */
  getSeasonConfig(m) {
    return this.seasons[this.getSeason(m)];
  },

  /**
   * Returns the seasonal guidance for a given month.
   * Replaces getSeasonalWindow().
   * @param {number} m
   * @returns {object} { label, icon, risk, color, msg, actions, ... }
   */
  getSeasonalWindow(m) {
    const key = this.getSeason(m);
    const base = this.seasons[key];
    const guidance = this.seasonalGuidance[key];
    return { ...base, ...guidance, key };
  },

  /**
   * Returns chart action zone { lo, hi } for a given month.
   * @param {number} m
   * @returns {{ lo: number, hi: number }}
   */
  getActionZone(m) {
    return this.chartActionZone[m] || { lo: this.thresholds.action, hi: 6 };
  },

  /**
   * Returns the state config object for an AU state abbreviation.
   * @param {string} state — e.g. 'VIC', 'NSW'
   * @returns {object|null}
   */
  getStateConfig(state) {
    return this.agencies.states[state] || null;
  },

  /**
   * Returns true if Varroa is currently present in a given AU state.
   * @param {string} state
   * @returns {boolean}
   */
  isVarroaPresent(state) {
    const s = this.getStateConfig(state);
    return s ? s.varroaPresent : true; // default true if unknown
  },

  /**
   * Builds the complete AI system prompt fragment for guidance panels.
   * Combines all rule blocks into a single injectable string.
   * @returns {string}
   */
  buildAIRules() {
    return [
      this.ai.treatmentRules,
      this.ai.productNameRules,
      this.ai.diseaseRules,
      this.ai.countingRules,
      this.ai.washFrequencyRules,
      this.ai.euthanasiaGuidance,
      this.ai.regulatoryContext,
    ].join('\n\n');
  },

}; // end VM_CONFIG
