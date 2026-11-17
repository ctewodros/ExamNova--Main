import { CognitiveLevel } from '../types/examnova';

export interface BloomsLevelMeta {
  id: string;
  code: string;
  shortLabel: string;
  name: string;
  description: string;
  actionVerbs: string[];
  detectKeywords: string[];
  activeClass: string;
  badgeClass: string;
  accentDotClass: string;
}

export const BLOOMS_LEVEL_META: Record<string, BloomsLevelMeta> = {
  'cog-rem': {
    id: 'cog-rem',
    code: 'C1',
    shortLabel: 'Remember',
    name: 'Remembering',
    description: 'Recall definitions, formulas, and standard facts.',
    actionVerbs: ['Recall', 'Define', 'State', 'Identify', 'List', 'Recognize'],
    detectKeywords: [
      'define',
      'recall',
      'state',
      'identify',
      'list',
      'name',
      'which of the following is',
      'what is the formula',
      'recognize',
    ],
    activeClass: 'border-slate-700 bg-slate-900 text-white',
    badgeClass: 'border-slate-300 bg-slate-100 text-slate-800',
    accentDotClass: 'bg-slate-600',
  },
  'cog-und': {
    id: 'cog-und',
    code: 'C2',
    shortLabel: 'Understand',
    name: 'Understanding',
    description: 'Interpret concepts, classify expressions, and translate representations.',
    actionVerbs: ['Explain', 'Interpret', 'Classify', 'Summarize', 'Translate', 'Simplify'],
    detectKeywords: [
      'explain',
      'interpret',
      'classify',
      'summarize',
      'translate',
      'simplify',
      'describe',
      'represent',
      'equivalent to',
    ],
    activeClass: 'border-sky-600 bg-sky-50 text-sky-900',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-800',
    accentDotClass: 'bg-sky-600',
  },
  'cog-app': {
    id: 'cog-app',
    code: 'C3',
    shortLabel: 'Apply',
    name: 'Applying',
    description: 'Execute mathematical procedures and solve structured problems.',
    actionVerbs: ['Solve', 'Compute', 'Calculate', 'Determine', 'Find', 'Demonstrate'],
    detectKeywords: [
      'solve',
      'compute',
      'calculate',
      'determine',
      'find the',
      'evaluate',
      'demonstrate',
      'apply',
      'use',
    ],
    activeClass: 'border-blue-600 bg-blue-50 text-blue-900',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-800',
    accentDotClass: 'bg-blue-600',
  },
  'cog-ana': {
    id: 'cog-ana',
    code: 'C4',
    shortLabel: 'Analyze',
    name: 'Analyzing',
    description: 'Deconstruct multi-step systems, compare relationships, and infer constraints.',
    actionVerbs: ['Analyze', 'Compare', 'Differentiate', 'Deconstruct', 'Infer', 'Examine'],
    detectKeywords: [
      'analyze',
      'compare',
      'contrast',
      'differentiate',
      'deconstruct',
      'infer',
      'examine',
      'relationship',
      'bound',
      'convergence',
      'variance',
    ],
    activeClass: 'border-amber-600 bg-amber-50 text-amber-900',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
    accentDotClass: 'bg-amber-600',
  },
  'cog-eva': {
    id: 'cog-eva',
    code: 'C5',
    shortLabel: 'Evaluate',
    name: 'Evaluating',
    description: 'Critique proofs, verify edge cases, and justify optimal solutions.',
    actionVerbs: ['Justify', 'Critique', 'Verify', 'Prove', 'Assess', 'Defend'],
    detectKeywords: [
      'justify',
      'critique',
      'verify',
      'prove',
      'assess',
      'defend',
      'valid',
      'must be true',
      'optimal',
    ],
    activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-900',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    accentDotClass: 'bg-emerald-600',
  },
  'cog-cre': {
    id: 'cog-cre',
    code: 'C6',
    shortLabel: 'Create',
    name: 'Creating',
    description: 'Formulate original models, construct equations, and synthesize new derivations.',
    actionVerbs: ['Formulate', 'Construct', 'Design', 'Derive', 'Synthesize', 'Propose'],
    detectKeywords: [
      'formulate',
      'construct',
      'design',
      'derive',
      'synthesize',
      'propose',
      'create',
      'model',
    ],
    activeClass: 'border-violet-600 bg-violet-50 text-violet-900',
    badgeClass: 'border-violet-200 bg-violet-50 text-violet-800',
    accentDotClass: 'bg-violet-600',
  },
};

export const DEFAULT_BLOOM_VERBS_BY_ID: Record<string, string[]> = {
  'cog-rem': ['Recall', 'Identify'],
  'cog-und': ['Interpret', 'Simplify'],
  'cog-app': ['Solve', 'Compute'],
  'cog-ana': ['Analyze', 'Infer'],
  'cog-eva': ['Verify', 'Justify'],
  'cog-cre': ['Formulate', 'Derive'],
};

export function getBloomsMeta(level: CognitiveLevel | string | undefined): BloomsLevelMeta {
  if (!level) return BLOOMS_LEVEL_META['cog-app'];
  if (typeof level === 'string') {
    return BLOOMS_LEVEL_META[level] ?? BLOOMS_LEVEL_META['cog-app'];
  }
  const known = BLOOMS_LEVEL_META[level.id];
  if (known) return known;
  return {
    id: level.id,
    code: level.code,
    shortLabel: level.name,
    name: level.name,
    description: level.description,
    actionVerbs: ['Identify', 'Explain', 'Apply', 'Analyze'],
    detectKeywords: [],
    activeClass: 'border-blue-600 bg-blue-50 text-blue-900',
    badgeClass: 'border-slate-200 bg-slate-50 text-slate-800',
    accentDotClass: 'bg-slate-600',
  };
}

export function detectBloomsFromStem(
  stem: string,
  availableLevels: CognitiveLevel[]
): { cognitiveLevelId: string; matchedVerbs: string[] } | null {
  const clean = stem.replace(/\$[^$]*\$/g, ' ').toLowerCase().trim();
  if (!clean) return null;

  // Scan from highest cognitive order to lowest so higher-order prompts win over generic words
  const ordered = [...availableLevels].sort((a, b) => b.order - a.order);

  let bestMatch: { cognitiveLevelId: string; matchedVerbs: string[]; score: number } | null = null;

  for (const lvl of ordered) {
    const meta = getBloomsMeta(lvl);
    const matchedVerbs: string[] = [];
    for (const verb of meta.actionVerbs) {
      const re = new RegExp(`\\b${verb.toLowerCase()}\\b`, 'i');
      if (re.test(clean)) {
        matchedVerbs.push(verb);
      }
    }
    let keywordHits = matchedVerbs.length * 2;
    for (const kw of meta.detectKeywords) {
      if (clean.includes(kw)) {
        keywordHits += 1;
        const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1);
        if (meta.actionVerbs.includes(capitalized) && !matchedVerbs.includes(capitalized)) {
          matchedVerbs.push(capitalized);
        }
      }
    }
    if (keywordHits > 0) {
      if (!bestMatch || keywordHits > bestMatch.score) {
        bestMatch = {
          cognitiveLevelId: lvl.id,
          matchedVerbs: matchedVerbs.slice(0, 3),
          score: keywordHits,
        };
      }
    }
  }

  return bestMatch
    ? {
        cognitiveLevelId: bestMatch.cognitiveLevelId,
        matchedVerbs:
          bestMatch.matchedVerbs.length > 0
            ? bestMatch.matchedVerbs
            : (DEFAULT_BLOOM_VERBS_BY_ID[bestMatch.cognitiveLevelId] ?? []).slice(0, 1),
      }
    : null;
}
