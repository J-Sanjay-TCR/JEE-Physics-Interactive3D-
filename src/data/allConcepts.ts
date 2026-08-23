import { CONCEPTS, CHAPTERS, CATEGORIES } from './physicsData';
import { EXTRA_CONCEPTS } from './extraConcepts';
import { MORE_CONCEPTS } from './moreConcepts';
import { LAWS_CONCEPTS } from './lawsConcepts';
import { COACHING_MODULES } from './coachingModules';
import { PhysicsConcept, CoachingInstituteModule } from '../types';

const RAW_CONCEPTS: PhysicsConcept[] = [
  ...CONCEPTS,
  ...EXTRA_CONCEPTS,
  ...MORE_CONCEPTS,
  ...LAWS_CONCEPTS,
];

export const ALL_CONCEPTS: PhysicsConcept[] = RAW_CONCEPTS.map((c) => {
  const customModule = COACHING_MODULES[c.id];
  if (customModule) {
    const specialCases = (customModule.subtopics || []).flatMap((st) => st.cases || []);
    return {
      ...c,
      coachingModule: customModule,
      specialCases: specialCases.length > 0 ? specialCases : (c.specialCases || []),
    };
  }

  // Generate standard comprehensive coaching module for all concepts
  const defaultParams: Record<string, number> = {};
  (c.parameters || []).forEach((p) => {
    defaultParams[p.id] = p.defaultVal;
  });

  const minParams: Record<string, number> = {};
  const maxParams: Record<string, number> = {};
  (c.parameters || []).forEach((p) => {
    minParams[p.id] = p.min;
    maxParams[p.id] = p.max;
  });

  const assumptions = c.assumptions || [];
  const formulas = c.formulas || [];
  const parameters = c.parameters || [];
  const mainShortcuts = c.jeeMain?.keyShortcuts || [];
  const mainTraps = c.jeeMain?.trapAlerts || [];
  const advDeep = c.jeeAdvanced?.deepConcepts || [];
  const advLinks = c.jeeAdvanced?.multiConceptLinks || [];
  const advCalculus = c.jeeAdvanced?.calculusFormulations || [];

  const generatedModule: CoachingInstituteModule = {
    chapterCode: `JEE-${(c.chapterId || '').toUpperCase()}`,
    synopsis: c.description || '',
    subtopics: [
      {
        id: `${c.id}-sub-main`,
        title: `1. Core Principles: ${c.title}`,
        summary: `Coaching module analysis for ${c.title} (${c.subtitle || ''}). Focuses on analytical problem solving for JEE Main & Advanced.`,
        keyPoints: [
          ...assumptions.map((a) => `Assumption: ${a}`),
          ...formulas.map((f) => `${f.name}: $${f.latex}$ — ${f.explanation}`),
        ],
        shortcuts: mainShortcuts,
        cases: [
          {
            id: `${c.id}-case-std`,
            title: `Standard Benchmark Case: ${c.title}`,
            categoryTag: 'Special Case',
            conditionLatex: formulas[0]?.latex || '\\text{Standard Conditions}',
            description: `Primary theoretical state under canonical assumptions: ${assumptions[0] || 'Standard laboratory setup'}.`,
            formulaLatex: formulas[0]?.latex || 'E = mc^2',
            physicalSignificance: formulas[0]?.explanation || 'Governing physical relationship in JEE syllabus.',
            parameterPreset: { ...defaultParams },
          },
          ...mainTraps.map((trap, idx) => ({
            id: `${c.id}-trap-case-${idx}`,
            title: `JEE Exam Trap & Boundary Condition #${idx + 1}`,
            categoryTag: 'JEE Main' as const,
            conditionLatex: `\\text{Trap Alert: } ${trap.slice(0, 35)}...`,
            description: trap,
            formulaLatex: formulas[Math.min(idx, formulas.length - 1)]?.latex || formulas[0]?.latex || '',
            physicalSignificance: `High-frequency negative marking area in JEE Main/Advanced.`,
            jeeTrapAlert: trap,
            parameterPreset: idx % 2 === 0 ? { ...minParams } : { ...maxParams },
          })),
        ],
      },
      {
        id: `${c.id}-sub-adv`,
        title: `2. JEE Advanced Analytical & Multi-Concept Linkages`,
        summary: `Rigorous calculus formulations, non-ideal boundary limits, and multi-concept combinations.`,
        keyPoints: [
          ...advDeep,
          ...advLinks.map((l) => `Cross-link: ${l}`),
        ],
        cases: advCalculus.map((calc, idx) => ({
          id: `${c.id}-calc-case-${idx}`,
          title: `Calculus / Differential Formulation #${idx + 1}`,
          categoryTag: 'JEE Advanced' as const,
          conditionLatex: calc,
          description: `Differential equation formulation commonly tested in JEE Advanced matrix-match and paragraph questions.`,
          formulaLatex: calc,
          physicalSignificance: `Continuous calculus integration model.`,
          parameterPreset: { ...defaultParams },
        })),
      },
    ],
    frequentlyTestedTricks: [
      ...mainShortcuts,
      ...advLinks,
    ],
    comparisonTables: [
      {
        title: `${c.title} — Governing Variables & Parameters Matrix`,
        headers: ['Physical Parameter', 'Symbol & Unit', 'Parametric Range', 'Significance in Equations'],
        rows: parameters.map((p) => [
          p.label,
          `$${p.symbol}$ (${p.unit || 'unitless'})`,
          `$[${p.min}, ${p.max}]$ (Base: $${p.defaultVal}$)`,
          p.description || `Key parameter governing ${c.title} dynamics`,
        ]),
      },
    ],
    standardApproximations: assumptions.map((assump) => ({
      condition: assump,
      exactFormula: formulas[0]?.latex || '\\text{Rigorous Formulation}',
      approxFormula: formulas[1]?.latex || formulas[0]?.latex || '\\text{Canonical JEE Model}',
      validityRange: 'Standard idealized benchmark in JEE Main / Advanced',
    })),
  };

  return {
    ...c,
    coachingModule: generatedModule,
    specialCases: (generatedModule.subtopics || []).flatMap((st) => st.cases || []),
  };
});

export const getConceptById = (id: string): PhysicsConcept => {
  const found = ALL_CONCEPTS.find((c) => c.id === id);
  return found || ALL_CONCEPTS[0];
};

export const getConceptsByChapter = (chapterId: string): PhysicsConcept[] => {
  return ALL_CONCEPTS.filter((c) => c.chapterId === chapterId);
};

export const getConceptsByCategory = (categoryId: string): PhysicsConcept[] => {
  return ALL_CONCEPTS.filter((c) => c.category === categoryId);
};

export { CHAPTERS, CATEGORIES };

