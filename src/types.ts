export type ChapterId =
  | 'units-dimensions'
  | 'vectors-math'
  | 'kinematics'
  | 'laws-of-motion'
  | 'work-energy-power'
  | 'com-momentum'
  | 'rotational-motion'
  | 'gravitation'
  | 'properties-matter'
  | 'fluid-mechanics'
  | 'thermal-physics'
  | 'thermodynamics'
  | 'heat-transfer'
  | 'oscillations'
  | 'waves'
  | 'electrostatics'
  | 'capacitance'
  | 'current-electricity'
  | 'magnetism'
  | 'emi-ac'
  | 'em-waves'
  | 'ray-optics'
  | 'wave-optics'
  | 'modern-physics'
  | 'nuclear-physics'
  | 'semiconductors';

export type CategoryId =
  | 'mechanics'
  | 'thermal'
  | 'waves-oscillations'
  | 'electromagnetism'
  | 'optics'
  | 'modern'
  | 'experimental';

export interface PhysicsParameter {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
  description?: string;
}

export interface PhysicsFormula {
  name: string;
  latex: string;
  explanation: string;
  keyVariables?: string[];
}

export interface RealtimeQuantity {
  label: string;
  symbol: string;
  unit: string;
  value: number;
  formatted?: string;
  color?: string;
}

export interface Question {
  id: string;
  type: 'mcq' | 'integer' | 'numerical' | 'multicorrect' | 'assertion';
  difficulty: 'Easy' | 'JEE Main' | 'JEE Advanced';
  question: string;
  options?: string[];
  correctAnswer?: number | number[]; // index or array of indices
  numericalAnswer?: number;
  tolerance?: number;
  explanation: string;
  formulaUsed?: string;
  isDynamic?: boolean;
}

export interface GraphConfig {
  id: string;
  title: string;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  color: string;
  type: 'time-series' | 'parametric' | 'distribution';
  calc: (params: Record<string, number>, t: number) => { x: number; y: number }[];
}

export interface JeeMainInsight {
  weightage: 'High' | 'Medium' | 'Essential';
  commonPatterns: string[];
  keyShortcuts: string[];
  trapAlerts: string[];
}

export interface JeeAdvancedInsight {
  weightage: 'High' | 'Critical' | 'Medium';
  deepConcepts: string[];
  multiConceptLinks: string[];
  calculusFormulations: string[];
  advancedPitfalls: string[];
}

export type SimulationType =
  | 'projectile-motion'
  | 'inclined-plane-friction'
  | 'circular-motion'
  | 'shm-spring-pendulum'
  | 'pure-rolling-motion'
  | 'gravitational-orbit'
  | 'vector-operations'
  | 'electric-field-charges'
  | 'lcr-circuit'
  | 'lorentz-force-cyclotron'
  | 'electromagnetic-induction'
  | 'ray-optics-lens-prism'
  | 'youngs-double-slit'
  | 'photoelectric-effect'
  | 'bohr-atom-spectrum'
  | 'vernier-caliper'
  | 'screw-gauge'
  | 'thermo-pv-cycle'
  | 'doppler-effect'
  | 'biot-savart-ampere'
  | 'gauss-law-flux'
  | 'bernoulli-fluid-flow'
  | 'wave-optics-polarization'
  | 'standing-waves-acoustics'
  | 'radioactivity-nuclear-decay'
  | 'heat-transfer-radiation';

export interface SpecialCase {
  id: string;
  title: string;
  categoryTag?: 'JEE Main' | 'JEE Advanced' | 'Special Case' | 'Edge Case' | 'Extreme Limit' | 'Boundary Condition';
  conditionLatex: string;
  description: string;
  formulaLatex: string;
  physicalSignificance?: string;
  jeeTrapAlert?: string;
  parameterPreset?: Record<string, number>;
}

export interface CoachingSubtopic {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  derivationHighlight?: string;
  shortcuts?: string[];
  cases: SpecialCase[];
}

export interface CoachingInstituteModule {
  chapterCode?: string;
  synopsis: string;
  subtopics: CoachingSubtopic[];
  comparisonTables?: {
    title: string;
    headers: string[];
    rows: string[][];
  }[];
  standardApproximations?: {
    condition: string;
    exactFormula: string;
    approxFormula: string;
    validityRange: string;
  }[];
  frequentlyTestedTricks?: string[];
}

export interface PhysicsConcept {
  id: string;
  chapterId: ChapterId;
  category: CategoryId;
  topic: string;
  title: string;
  subtitle: string;
  badge?: string;
  description: string;
  assumptions: string[];
  simulationType: SimulationType;
  parameters: PhysicsParameter[];
  formulas: PhysicsFormula[];
  jeeMain: JeeMainInsight;
  jeeAdvanced: JeeAdvancedInsight;
  specialCases?: SpecialCase[];
  coachingModule?: CoachingInstituteModule;
  questions: Question[];
  graphConfigs: GraphConfig[];
  cameraPreset?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  computeLiveQuantities: (params: Record<string, number>, simTime: number) => RealtimeQuantity[];
}

export interface Chapter {
  id: ChapterId;
  name: string;
  category: CategoryId;
  iconName: string;
  description: string;
  conceptIds: string[];
}
