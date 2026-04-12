/**
 * VarroaMate Region Config — United Kingdom & Ireland (uk)
 * ─────────────────────────────────────────────────────────
 * Covers: England, Scotland, Wales, Northern Ireland, Republic of Ireland
 * Regulatory body: VMD (Veterinary Medicines Directorate) for GB
 *                  HPRA for Republic of Ireland
 * Industry body:   BBKA (British Beekeeping Association)
 *                  FIBKA (Federation of Irish Beekeepers' Associations)
 * Bee health:      National Bee Unit (NBU) / BeeBase
 *
 * Key differences from AU:
 * - Northern hemisphere seasons (critical window: Aug–Sep)
 * - DWV IS confirmed and is the primary virus concern
 * - MAQS is the registered name (not Formic PRO)
 * - Aluen CAP not registered; Bayvarol not currently listed by NBU
 * - Additional products: VarroMed, Oxuvar, Oxybee, Varroxal, Thymovar, Api-Bioxal
 * - NBU / BeeBase replaces AHBIC / BeeMAX
 * - No state selector — regions not operationally relevant for treatment
 * - Mild winters mean colonies are often NOT fully broodless (OA timing differs)
 *
 * Deploy: load BEFORE the app script
 *   <script src="/config/uk.js"></script>
 */

window.VM_CONFIG = {

  // ── Identity ──────────────────────────────────────────────────────────────
  region:     'UK-IE',
  locale:     'en-GB',
  hemisphere: 'northern',
  currency:   'GBP',
  dateFormat: 'en-GB',


  // ── Seasons ───────────────────────────────────────────────────────────────
  // Northern hemisphere — month is 0-indexed (JS Date.getMonth())
  seasons: {
    spring: { months: [2, 3, 4],      label: 'Spring', icon: '🌱', risk: 'high',     color: '#5A9E60', cssVar: '--spring' },
    summer: { months: [5, 6, 7],      label: 'Summer', icon: '☀️',  risk: 'med',      color: '#E8A020', cssVar: '--summer' },
    autumn: { months: [8, 9, 10],     label: 'Autumn', icon: '🍂', risk: 'critical', color: '#C05A20', cssVar: '--autumn' },
    winter: { months: [11, 0, 1],     label: 'Winter', icon: '❄️',  risk: 'low',      color: '#4A7898', cssVar: '--winter' },
  },

  // month → season key
  monthSeason: {
    0:'winter', 1:'winter', 2:'spring', 3:'spring', 4:'spring',
    5:'summer', 6:'summer', 7:'summer', 8:'autumn', 9:'autumn',
    10:'autumn', 11:'winter',
  },

  // Seasonal guidance
  seasonalGuidance: {
    spring: {
      msg: 'Colony building rapidly. Mite populations will accelerate as brood expands. Begin monitoring from March.',
      actions: [
        'Start monthly alcohol wash monitoring — March onwards',
        'Watch for swarm preparations — inspect every 7–10 days',
        'Avoid frame exchange between hives',
        'Check for DWV symptoms — deformed wings, crawling bees',
        'Consider drone comb removal through spring',
      ],
    },
    summer: {
      msg: 'Peak colony strength. Mite populations building fast. Critical to treat after honey harvest — before August is ideal.',
      actions: [
        'Alcohol wash monthly throughout summer',
        'Plan treatment timing around honey harvest',
        'Deploy summer treatment (Apivar, MAQS, thymol) after supers removed',
        'Watch for DWV symptoms as mite loads rise',
        'Remove drone comb where practical',
      ],
    },
    autumn: {
      msg: 'Most critical window. Treat before mid-September to protect winter bees. UK winters are mild — colonies may not be fully broodless until November or later.',
      actions: [
        'Complete main varroa treatment by mid-September',
        'Alcohol wash to confirm treatment efficacy 4 weeks after treatment',
        'Plan oxalic acid winter treatment for broodless period (Dec–Jan)',
        'Check stores — feed if needed before cluster forms',
        'Reduce entrances as robbing risk increases',
      ],
      criticalDeadlineMonth: 8,   // September (0-indexed)
      criticalDeadlineLabel: 'mid-September',
    },
    winter: {
      msg: 'Low activity. UK colonies often retain some brood through winter — check before applying OA. Best OA window is December–January when most likely broodless.',
      actions: [
        'Apply oxalic acid treatment when colony is broodless (typically Dec–Jan)',
        'Heft hive every 2–3 weeks to check stores',
        'Avoid unnecessary inspections — breaking the cluster wastes energy',
        'Prepare equipment and order supplies for spring',
        'Register on BeeBase if not already done',
      ],
    },
  },

  // Active monitoring season
  monitoringSeason: {
    activeMonths:   [2, 3, 4, 5, 6, 7, 8, 9, 10],  // Mar–Oct: monthly washes
    reducedMonths:  [11, 0, 1],                       // Nov–Feb: reduced/OA treatment window
    activeLabel:    'March–October',
    reducedLabel:   'November–February',
    activeInterval:   4,   // weeks
    reducedInterval:  8,   // weeks (or OA when broodless)
  },


  // ── Mite Thresholds ───────────────────────────────────────────────────────
  // NBU/COLOSS guidance: action at ~2%, critical at ~4% (per 100 bees)
  // VarroaMate uses per 300 — equivalent thresholds: action=6, critical=12
  thresholds: {
    sampleSize:   300,
    action:       6,      // ~2% infestation rate
    critical:     12,     // ~4% infestation rate
    label:        '6/300 bees (~2%)',
    criticalLabel:'12/300 bees (~4%)',
    per:          300,
  },

  // Chart action zones — northern hemisphere month mapping
  chartActionZone: {
    0: { lo:2, hi:3 },   // Jan — winter
    1: { lo:2, hi:3 },   // Feb — winter
    2: { lo:3, hi:5 },   // Mar — spring
    3: { lo:3, hi:5 },   // Apr — spring
    4: { lo:3, hi:5 },   // May — spring
    5: { lo:5, hi:8 },   // Jun — summer
    6: { lo:5, hi:8 },   // Jul — summer
    7: { lo:5, hi:8 },   // Aug — summer (treat now)
    8: { lo:4, hi:6 },   // Sep — autumn critical
    9: { lo:4, hi:6 },   // Oct — autumn
    10:{ lo:3, hi:5 },   // Nov — late autumn
    11:{ lo:2, hi:3 },   // Dec — winter
  },

  chartSeasonThreshold: {
    0: 6,  1: 6,          // winter — low threshold
    2: 10, 3: 10, 4: 10, // spring — building
    5: 15, 6: 15, 7: 15, // summer — high tolerance
    8: 10, 9: 10, 10:8,  // autumn — tightening
    11:6,                 // winter
  },


  // ── Approved Treatments ───────────────────────────────────────────────────
  // Source: NBU Bee Medicines fact sheet (June 2025), VMD database
  // Regulator: VMD (Veterinary Medicines Directorate)
  treatments: {
    products: {
      'oxalic-vap':     { name:'OA Vaporisation (Api-Bioxal)',  abbrev:'OAV',  moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'Above 3°C', regBody:'VMD', regNote:'VMD registered (Api-Bioxal). One vaporisation per season on label. Best broodless. PPE required. No honey WHP.' },
      'oxalic-dribble': { name:'OA Dribble (Api-Bioxal/Oxuvar)',abbrev:'OAD',  moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'Above 3°C', regBody:'VMD', regNote:'VMD registered. Single treatment per season. Broodless period essential. Api-Bioxal or Oxuvar.' },
      'oxalic-spray':   { name:'OA Spray (Oxuvar)',             abbrev:'OAS',  moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'Above 8°C', regBody:'VMD', regNote:'VMD registered (Oxuvar). Spray application. Can be used with or without brood.' },
      'maqs':           { name:'MAQS (Formic Acid)',            abbrev:'MAQS', moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:false, tempRange:'10–25°C',  regBody:'VMD', regNote:'VMD registered. Supers CAN remain on. Max temp 25°C — queen loss risk above this. 7-day treatment.' },
      'formicpro':      { name:'Formicpro (Formic Acid)',       abbrev:'FPro', moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:true,  tempRange:'10–25°C',  regBody:'VMD', regNote:'VMD registered. Remove supers. 20-day treatment. Same active as MAQS.' },
      'varromed':       { name:'VarroMed (Formic + OA)',        abbrev:'VMed', moa:'Organic Acid',  moaShort:'OA',  synthetic:false, supersOff:true,  tempRange:'Above 8°C', regBody:'VMD', regNote:'VMD registered. Formic acid + oxalic acid combined. Remove supers. Can be used with brood present.' },
      'thymovar':       { name:'Thymovar (Thymol strips)',      abbrev:'TMV',  moa:'Essential Oil', moaShort:'EO',  synthetic:false, supersOff:true,  tempRange:'15–30°C',  regBody:'VMD', regNote:'VMD registered. Remove supers. 2 × 3–4 week treatments. Temperature critical.' },
      'apiguard':       { name:'Apiguard (Thymol gel)',         abbrev:'APG',  moa:'Essential Oil', moaShort:'EO',  synthetic:false, supersOff:true,  tempRange:'>15°C',    regBody:'VMD', regNote:'VMD registered. Remove supers. 2 × 14-day treatments. Requires >15°C.' },
      'apilife':        { name:'ApiLife Var (Thymol blend)',    abbrev:'ALV',  moa:'Essential Oil', moaShort:'EO',  synthetic:false, supersOff:true,  tempRange:'15–30°C',  regBody:'VMD', regNote:'VMD registered. Remove supers. 3 × 10-day applications.' },
      'apivar':         { name:'Apivar (Amitraz strips)',        abbrev:'APV',  moa:'Amitraz',       moaShort:'AMZ', synthetic:true,  supersOff:true,  tempRange:'>10°C',    regBody:'VMD', regNote:'VMD registered. Remove supers. 6–10 weeks. Rotate MoA. Resistance documented.' },
      'apitraz':        { name:'Apitraz (Amitraz strips)',       abbrev:'APT',  moa:'Amitraz',       moaShort:'AMZ', synthetic:true,  supersOff:true,  tempRange:'>10°C',    regBody:'VMD', regNote:'VMD registered. Remove supers. Same MoA as Apivar — do not use in same season.' },
      'apistan':        { name:'Apistan (Tau-fluvalinate)',      abbrev:'API',  moa:'Pyrethroid',    moaShort:'PYR', synthetic:true,  supersOff:true,  tempRange:'Wide',     regBody:'VMD', regNote:'VMD registered. Remove supers. ⚠️ Widespread pyrethroid resistance in UK — confirm efficacy with post-treatment wash.' },
      'drone-comb':     { name:'Drone Comb Removal',            abbrev:'DCR',  moa:'Mechanical',    moaShort:'MCH', synthetic:false, supersOff:false, tempRange:'Any',      regBody:null,  regNote:'No VMD registration required — mechanical method. Use during drone-rearing season (spring/summer).' },
      'brood-int':      { name:'Brood Interruption',            abbrev:'BRI',  moa:'Mechanical',    moaShort:'MCH', synthetic:false, supersOff:false, tempRange:'Any',      regBody:null,  regNote:'No VMD registration required. Creates broodless period for OA treatment. Best in summer.' },
    },

    // Ordered approved list for AI prompts
    approvedList: [
      'OA Vaporisation (Api-Bioxal)', 'OA Dribble (Api-Bioxal/Oxuvar)', 'OA Spray (Oxuvar)',
      'MAQS', 'Formicpro', 'VarroMed',
      'Thymovar', 'Apiguard', 'ApiLife Var',
      'Apivar', 'Apitraz', 'Apistan',
      'Drone Comb Removal', 'Brood Interruption',
    ],

    // Not approved in UK
    notApproved: [
      'Aluen CAP', 'Bayvarol', 'sugar dusting', 'powdered sugar',
      'lactic acid spray', 'thymol crystals', 'hop beta acids',
      'oxalic acid crystals without VMD registration',
    ],

    // Super rules
    supersOff: ['formicpro', 'varromed', 'thymovar', 'apiguard', 'apilife', 'apivar', 'apitraz', 'apistan'],
    supersOn:  ['oxalic-vap', 'oxalic-dribble', 'oxalic-spray', 'maqs', 'drone-comb', 'brood-int'],

    // Product name rules — UK uses MAQS not Formic PRO
    productNameRules: {
      'formic': { use: 'MAQS or Formicpro', neverUse: ['Formic PRO'] },
    },

    organicOnly: ['oxalic-vap', 'oxalic-dribble', 'oxalic-spray', 'maqs', 'formicpro', 'varromed', 'thymovar', 'apiguard', 'apilife'],
  },


  // ── Diseases ──────────────────────────────────────────────────────────────
  diseases: {
    // All diseases present in UK
    present: ['AFB', 'EFB', 'Chalkbrood', 'Sacbrood', 'Nosema ceranae', 'Nosema apis', 'DWV', 'Small hive beetle (not established)', 'Varroa', 'Asian hornet (emerging threat)'],

    notifiable: ['AFB', 'EFB', 'Tropilaelaps', 'Small hive beetle', 'Asian hornet'],

    // Nothing in the notPresent list — DWV IS present in UK
    notPresent: [],

    aiRules: {
      dwv: 'DWV (Deformed Wing Virus) IS confirmed and widespread in UK colonies — it is the primary virus of concern transmitted by Varroa. Always reference DWV when discussing Varroa damage and wing deformities.',
      notPresent: 'Asian hornets (Vespa velutina) are an emerging threat in the UK — if asked, note that sightings should be reported to the NBU immediately via the Asian Hornet Watch app.',
      notifiable: 'AFB, EFB, Tropilaelaps, Small hive beetle, and Asian hornet are notifiable pests/diseases in the UK. If suspected, the beekeeper must report to their local bee inspector or the NBU immediately.',
    },
  },


  // ── Regulatory / Agencies ─────────────────────────────────────────────────
  agencies: {
    regulator:      'VMD',
    regulatorFull:  'Veterinary Medicines Directorate',
    regulatorUrl:   'https://www.vmd.defra.gov.uk',
    industry:       'BBKA',
    industryFull:   'British Beekeeping Association',
    industryUrl:    'https://www.bbka.org.uk',
    trackingSystem: 'BeeBase',
    trackingLabel:  'BeeBase',
    reportingLabel: 'your local NBU bee inspector (UK) / DAFM inspector (Republic of Ireland)',
    reportingNote:  'Report notifiable diseases and Asian hornet sightings to your local NBU bee inspector.',
    nbuUrl:         'https://www.nationalbeeunit.com',
    beebaseUrl:     'https://www.nationalbeeunit.com/register',
    irishAgency:    'DAFM (Republic of Ireland)',
    irishUrl:       'https://www.gov.ie/en/organisation/department-of-agriculture-food-and-the-marine/',

    // No state-level breakdown — UK regions not operationally distinct for treatment
    states: {},
  },


  // ── AI System Prompt Fragments ────────────────────────────────────────────
  ai: {
    identity: 'You are VarroaMate, a friendly expert assistant for beekeepers in the United Kingdom and the Republic of Ireland managing Varroa mite.',

    treatmentRules: `APPROVED TREATMENTS ONLY: Only recommend or discuss treatments registered by the VMD for use in the UK — no others: OA Vaporisation (Api-Bioxal), OA Dribble (Api-Bioxal/Oxuvar), OA Spray (Oxuvar), MAQS, Formicpro, VarroMed, Thymovar, Apiguard, ApiLife Var, Apivar, Apitraz, Apistan, Drone Comb Removal, Brood Interruption.
Do NOT suggest Aluen CAP, Bayvarol, sugar dusting, lactic acid spray, thymol crystals, or any unregistered method.
Beekeepers are legally required to keep a veterinary medicine administration record for all treatments for at least 5 years.`,

    productNameRules: `In the UK, the formic acid treatment is called MAQS or Formicpro — never use the name "Formic PRO" as this is the Australian registered name. MAQS allows supers to remain on; Formicpro requires supers to be removed.`,

    diseaseRules: `DWV (Deformed Wing Virus) IS confirmed and widespread in UK colonies — it is the primary virus of concern. Always reference DWV when discussing Varroa damage. Only reference diseases relevant to the UK: AFB, EFB, Chalkbrood, Sacbrood, Nosema ceranae, Nosema apis, DWV, Varroa. Asian hornets (Vespa velutina) are an emerging threat — sightings must be reported immediately to the NBU.`,

    countingRules: `Mite counting methods accepted in the UK include alcohol wash (most accurate), drone brood uncapping, and natural mite drop monitoring. The NBU recommends alcohol wash as the most accurate method for determining infestation levels.`,

    hemisphereLabel: 'Northern Hemisphere',

    washFrequencyRules: `Recommend monthly alcohol wash monitoring during the active season (March–October). During winter (November–February), colonies may retain some brood — check before applying oxalic acid. The best OA window is typically December–January when colonies are most likely to be broodless.`,

    euthanasiaGuidance: `COLONY EUTHANASIA: When a colony is at critical mite load (≥12/300) AND is already in severe decline AND the season makes recovery unlikely (particularly September–October heading into winter), include colony euthanasia as a recommended option alongside treatment. The recommended method is soapy water poured directly into the hive. This is consistent with NBU biosecurity guidance. Frame sensitively — but be clear that leaving a collapsing colony is a biosecurity risk to neighbouring hives.`,

    regulatoryContext: `Refer to the VMD for product registration. Direct beekeepers to the NBU and BeeBase (nationalbeeunit.com) for bee health support and to register their apiary. Local NBU bee inspectors provide free advice and inspections.`,

    // Critical UK-specific timing rule
    oaTiming: `OXALIC ACID TIMING: UK winters are mild and colonies often retain some brood through winter. OA vaporisation and dribble are only effective against phoretic mites (on adult bees) — they cannot reach mites in sealed brood. Before recommending OA treatment, advise the beekeeper to check for the presence of brood. The most likely broodless window in the UK is December to January. If brood is present, OA treatment will not achieve full efficacy.`,

    chatSystem: `You are VarroaMate, a friendly expert assistant for beekeepers in the United Kingdom and the Republic of Ireland managing Varroa mite. Help with varroa treatments, mite counting, resistance management, treatment rotation, and organic vs chemical approaches. IMPORTANT: always distinguish between UK and Ireland in regulatory guidance — UK beekeepers report to the NBU (nationalbeeunit.com) and register on BeeBase, regulated by the VMD. Republic of Ireland beekeepers report to DAFM and the HPRA, with FIBKA as the main industry association. Never say 'UK' when you mean to include Ireland. Keep answers concise and practical. In the UK, formic acid treatments are called MAQS (supers on) or Formicpro (supers off) — never use the name "Formic PRO". DWV (Deformed Wing Virus) is widespread in UK colonies and is the primary virus concern. APPROVED TREATMENTS ONLY — VMD registered products: OA Vaporisation (Api-Bioxal), OA Dribble (Api-Bioxal/Oxuvar), OA Spray (Oxuvar), MAQS, Formicpro, VarroMed, Thymovar, Apiguard, ApiLife Var, Apivar, Apitraz, Apistan, Drone Comb Removal, Brood Interruption. IMPORTANT: Aluen CAP and Bayvarol are NOT registered in the UK — do not recommend them. Beekeepers must keep a veterinary medicine administration record for 5 years. UK winters are mild — colonies may not be fully broodless until December or January, which affects OA treatment timing.`,
  },


  // ── UI Strings ────────────────────────────────────────────────────────────
  ui: {
    alcoholWashLabel:   'Alcohol wash (~300 bees)',
    alcoholWashUnit:    'mites / ~300 bees (alcohol wash)',
    thresholdLabel:     '6/300 bees (~2%)',
    criticalLabel:      '12/300 bees (~4%)',
    seasonalWindowNote: 'Active monitoring season: March–October (monthly). Winter: check for broodless period before OA treatment.',
    calendarReminderNote: 'Alcohol wash ~300 bees (½ cup) per hive. Record each result in VarroaMate.\nGeneral guidance: monthly during active season (Mar–Oct). In winter (Nov–Feb), monitor for broodless period and apply OA treatment when broodless (typically Dec–Jan).',
    exportLabel:        'BeeBase Export',
    countMethod:        'Alcohol wash',
    countMethodNote:    'Recommended by the NBU as the most accurate monitoring method.',
    countMethodUrl:     'https://www.nationalbeeunit.com/diseases-and-pests/varroa/how-do-i-manage-varroa',

    aboutText: 'VarroaMate helps beekeepers in the United Kingdom and the Republic of Ireland monitor Varroa mite levels, plan treatments, and maintain healthy colonies — aligned with NBU (UK) and DAFM (Ireland) guidance.',

    countMethodExplainer: 'Alcohol wash is recommended by the National Bee Unit (NBU) as the most accurate method for determining Varroa infestation levels.',

    features: {
      beemaxExport:   false,  // BeeMAX is AU only — BeeBase export TBD
      stateSelector:  false,  // No state-level regulatory split in UK
      resistanceMap:  false,  // AU-specific resistance map not applicable
    },
  },


  // ── Helper Functions ──────────────────────────────────────────────────────
  getSeason(m) {
    return this.monthSeason[m];
  },

  getSeasonConfig(m) {
    return this.seasons[this.getSeason(m)];
  },

  getSeasonalWindow(m) {
    const key = this.getSeason(m);
    const base = this.seasons[key];
    const guidance = this.seasonalGuidance[key];
    return { ...base, ...guidance, key };
  },

  getActionZone(m) {
    return this.chartActionZone[m] || { lo: this.thresholds.action, hi: 8 };
  },

  getStateConfig(state) {
    return null; // No state breakdown for UK
  },

  isVarroaPresent(state) {
    return true; // Varroa is endemic throughout UK and Ireland
  },

  buildAIRules() {
    return [
      this.ai.treatmentRules,
      this.ai.productNameRules,
      this.ai.diseaseRules,
      this.ai.countingRules,
      this.ai.washFrequencyRules,
      this.ai.euthanasiaGuidance,
      this.ai.oaTiming,
      this.ai.regulatoryContext,
    ].join('\n\n');
  },

}; // end VM_CONFIG
