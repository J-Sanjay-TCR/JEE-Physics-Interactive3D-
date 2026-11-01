export interface ComparePreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  presetA: Record<string, number>;
  presetB: Record<string, number>;
}

export const COMPARISON_PRESETS: Record<string, ComparePreset[]> = {
  'projectile-motion': [
    {
      id: 'complementary-angles',
      name: 'Complementary Angles (30° vs 60°)',
      description: 'Theorem: Equal range for complementary launch angles [R(θ) = R(90°-θ)], but 3× apex height difference!',
      badge: 'Classic JEE Theorem',
      presetA: { u: 20, theta: 30, g: 9.8, h0: 0, planeAngle: 0 },
      presetB: { u: 20, theta: 60, g: 9.8, h0: 0, planeAngle: 0 },
    },
    {
      id: 'earth-vs-moon',
      name: 'Earth (9.8 m/s²) vs Moon (1.62 m/s²)',
      description: 'Lunar low gravity yields 6× greater range and flight time with identical launch velocity.',
      badge: 'Gravitational Scaling',
      presetA: { u: 20, theta: 45, g: 9.8, h0: 0, planeAngle: 0 },
      presetB: { u: 20, theta: 45, g: 1.62, h0: 0, planeAngle: 0 },
    },
    {
      id: 'velocity-scaling',
      name: 'Velocity Doubling (15 m/s vs 30 m/s)',
      description: 'Doubling launch speed quadruples range (R ∝ u²) and maximum height (H ∝ u²).',
      badge: 'Quadratic Velocity',
      presetA: { u: 15, theta: 45, g: 9.8, h0: 0, planeAngle: 0 },
      presetB: { u: 30, theta: 45, g: 9.8, h0: 0, planeAngle: 0 },
    },
    {
      id: 'flat-vs-incline',
      name: 'Flat Ground (0°) vs Incline (20°)',
      description: 'Demonstrates projectile landing and modified range formula on an uphill slope.',
      badge: 'Inclined Plane',
      presetA: { u: 20, theta: 50, g: 9.8, h0: 0, planeAngle: 0 },
      presetB: { u: 20, theta: 50, g: 9.8, h0: 0, planeAngle: 20 },
    },
  ],
  'lcr-circuit': [
    {
      id: 'resonance-vs-detuned',
      name: 'Resonant Frequency vs 2× Detuned',
      description: 'Demonstrates sharp current amplification at resonance vs attenuated out-of-phase impedance.',
      badge: 'Resonance Peak',
      presetA: { R: 10, L: 0.1, C: 10, f: 159, V0: 100 },
      presetB: { R: 10, L: 0.1, C: 10, f: 318, V0: 100 },
    },
    {
      id: 'quality-factor',
      name: 'High Q (R = 5Ω) vs Low Q (R = 50Ω)',
      description: 'Low resistance yields sharp high-Q sharpness vs heavily damped broad resonance curve.',
      badge: 'Q-Factor',
      presetA: { R: 5, L: 0.2, C: 10, f: 112, V0: 100 },
      presetB: { R: 50, L: 0.2, C: 10, f: 112, V0: 100 },
    },
  ],
  'youngs-double-slit': [
    {
      id: 'red-vs-violet',
      name: 'Red Light (700 nm) vs Violet Light (400 nm)',
      description: 'Fringe width β = λD/d: Longer red wavelength creates widely spaced fringes.',
      badge: 'Color Dispersion',
      presetA: { wavelength: 700, d: 0.25, D: 1.0 },
      presetB: { wavelength: 400, d: 0.25, D: 1.0 },
    },
    {
      id: 'slit-separation',
      name: 'Slit Separation d = 0.2 mm vs 0.6 mm',
      description: 'Increasing slit distance packs interference fringes closer together (β ∝ 1/d).',
      badge: 'Fringe Spacing',
      presetA: { wavelength: 550, d: 0.2, D: 1.0 },
      presetB: { wavelength: 550, d: 0.6, D: 1.0 },
    },
  ],
  'shm-spring-pendulum': [
    {
      id: 'length-quadruple',
      name: 'Length L = 1.0 m vs L = 4.0 m',
      description: 'Quadrupling string length doubles the time period of oscillation (T = 2π√(L/g)).',
      badge: 'Period Scaling',
      presetA: { length: 1.0, angle: 25, g: 9.8, damping: 0.02 },
      presetB: { length: 4.0, angle: 25, g: 9.8, damping: 0.02 },
    },
    {
      id: 'small-vs-large-angle',
      name: 'Small Angle (10°) vs Large Angle (65°)',
      description: 'Exposes non-linear anharmonic deviation from ideal SHM for large angular amplitudes.',
      badge: 'Anharmonicity',
      presetA: { length: 2.0, angle: 10, g: 9.8, damping: 0 },
      presetB: { length: 2.0, angle: 65, g: 9.8, damping: 0 },
    },
  ],
  'simple-pendulum': [
    {
      id: 'length-quadruple',
      name: 'Length L = 1.0 m vs L = 4.0 m',
      description: 'Quadrupling string length doubles the time period of oscillation (T = 2π√(L/g)).',
      badge: 'Period Scaling',
      presetA: { length: 1.0, angle: 25, g: 9.8, damping: 0.02 },
      presetB: { length: 4.0, angle: 25, g: 9.8, damping: 0.02 },
    },
    {
      id: 'small-vs-large-angle',
      name: 'Small Angle (10°) vs Large Angle (65°)',
      description: 'Exposes non-linear anharmonic deviation from ideal SHM for large angular amplitudes.',
      badge: 'Anharmonicity',
      presetA: { length: 2.0, angle: 10, g: 9.8, damping: 0 },
      presetB: { length: 2.0, angle: 65, g: 9.8, damping: 0 },
    },
  ],
};

export function getComparisonPresets(simulationType: string): ComparePreset[] {
  return COMPARISON_PRESETS[simulationType] || [];
}
