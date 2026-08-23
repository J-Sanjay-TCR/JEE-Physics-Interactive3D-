import { PhysicsConcept, Chapter, CategoryId } from '../types';

export const CATEGORIES: { id: CategoryId; name: string; icon: string; count: number }[] = [
  { id: 'mechanics', name: 'Mechanics & Fluids', icon: 'Atom', count: 6 },
  { id: 'thermal', name: 'Thermal Physics & Radiation', icon: 'Flame', count: 2 },
  { id: 'electromagnetism', name: 'Electrodynamics & Magnetism', icon: 'Zap', count: 6 },
  { id: 'waves-oscillations', name: 'Oscillations & Waves', icon: 'Activity', count: 3 },
  { id: 'optics', name: 'Optics & Wave Phenomena', icon: 'Eye', count: 3 },
  { id: 'modern', name: 'Modern & Nuclear Physics', icon: 'Sun', count: 3 },
  { id: 'experimental', name: 'Experimental Physics & Instruments', icon: 'Ruler', count: 2 },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'units-dimensions',
    name: 'Units, Dimensions & Errors',
    category: 'experimental',
    iconName: 'Ruler',
    description: 'Least count, Vernier calipers, Screw gauge & error propagation.',
    conceptIds: ['vernier-caliper', 'screw-gauge'],
  },
  {
    id: 'vectors-math',
    name: 'Vectors & Mathematical Physics',
    category: 'mechanics',
    iconName: 'Compass',
    description: 'Resolution of vectors, Dot product, Cross product & 3D projections.',
    conceptIds: ['vector-operations'],
  },
  {
    id: 'kinematics',
    name: 'Kinematics 2D & 3D',
    category: 'mechanics',
    iconName: 'MoveUpRight',
    description: 'Projectile motion, trajectories, velocity vectors & acceleration.',
    conceptIds: ['projectile-motion'],
  },
  {
    id: 'laws-of-motion',
    name: 'Laws of Motion & Friction',
    category: 'mechanics',
    iconName: 'ShieldAlert',
    description: 'Free Body Diagrams, Limiting friction, Inclined planes & Banking of Roads.',
    conceptIds: ['inclined-plane-friction', 'circular-motion'],
  },
  {
    id: 'rotational-motion',
    name: 'Rotational Motion & Rolling',
    category: 'mechanics',
    iconName: 'RotateCw',
    description: 'Moment of inertia, Torque, Angular momentum & Pure rolling.',
    conceptIds: ['pure-rolling-motion'],
  },
  {
    id: 'gravitation',
    name: 'Gravitation & Keplerian Orbits',
    category: 'mechanics',
    iconName: 'Globe',
    description: 'Kepler laws, Orbital velocity, Escape velocity & elliptical orbits.',
    conceptIds: ['gravitational-orbit'],
  },
  {
    id: 'fluid-mechanics',
    name: 'Fluid Mechanics & Bernoulli Law',
    category: 'mechanics',
    iconName: 'Waves',
    description: "Bernoulli's Principle, Torricelli's Law, Continuity Equation & Viscous Drag.",
    conceptIds: ['bernoulli-fluid-flow'],
  },
  {
    id: 'thermodynamics',
    name: 'Thermodynamics & PV Cycles',
    category: 'thermal',
    iconName: 'Flame',
    description: 'First Law, Carnot heat engine, Isothermal & Adiabatic indicator diagrams.',
    conceptIds: ['thermo-pv-cycle'],
  },
  {
    id: 'heat-transfer',
    name: 'Heat Transfer & Thermal Radiation',
    category: 'thermal',
    iconName: 'Sun',
    description: "Stefan-Boltzmann Law, Wien's displacement & Newton's Law of Cooling.",
    conceptIds: ['heat-transfer-radiation'],
  },
  {
    id: 'oscillations',
    name: 'Simple Harmonic Motion',
    category: 'waves-oscillations',
    iconName: 'Activity',
    description: 'SHM equations, phase difference, energy barter & simple pendulum.',
    conceptIds: ['shm-spring-pendulum'],
  },
  {
    id: 'waves',
    name: 'Waves, Doppler Effect & Acoustics',
    category: 'waves-oscillations',
    iconName: 'Volume2',
    description: 'Sound waves, Doppler shifts, Standing waves & Resonant organ pipes.',
    conceptIds: ['doppler-effect', 'standing-waves-acoustics'],
  },
  {
    id: 'electrostatics',
    name: "Electrostatics & Gauss's Law",
    category: 'electromagnetism',
    iconName: 'Sparkles',
    description: "Coulomb law, Gauss's flux theorem, Dipoles & Equipotential surfaces.",
    conceptIds: ['electric-field-charges', 'gauss-law-flux'],
  },
  {
    id: 'magnetism',
    name: 'Magnetic Effects of Current & Biot-Savart',
    category: 'electromagnetism',
    iconName: 'Compass',
    description: "Biot-Savart Law, Ampere's Law, Lorentz force & Cyclotron trajectories.",
    conceptIds: ['biot-savart-ampere', 'lorentz-force-cyclotron'],
  },
  {
    id: 'emi-ac',
    name: 'EMI & Alternating Current',
    category: 'electromagnetism',
    iconName: 'Zap',
    description: 'Faraday-Lenz induction, LCR resonance, Phasor diagrams & power factor.',
    conceptIds: ['electromagnetic-induction', 'lcr-circuit'],
  },
  {
    id: 'ray-optics',
    name: 'Ray Optics & Optical Systems',
    category: 'optics',
    iconName: 'Layers',
    description: 'Snell law, Lens formula, Prism deviation & Ray tracing.',
    conceptIds: ['ray-optics-lens-prism'],
  },
  {
    id: 'wave-optics',
    name: 'Wave Optics, Interference & Polarization',
    category: 'optics',
    iconName: 'Eye',
    description: "Young double slit, Malus's law of polarization & Brewster angle.",
    conceptIds: ['youngs-double-slit', 'wave-optics-polarization'],
  },
  {
    id: 'modern-physics',
    name: 'Dual Nature & Atomic Structure',
    category: 'modern',
    iconName: 'Atom',
    description: 'Photoelectric equation, Bohr hydrogen spectrum & photon transitions.',
    conceptIds: ['photoelectric-effect', 'bohr-atom-spectrum'],
  },
  {
    id: 'nuclear-physics',
    name: 'Nuclear Physics & Radioactivity',
    category: 'modern',
    iconName: 'Radio',
    description: 'Radioactive decay law, Half-life, Alpha/Beta/Gamma deflection & Binding energy.',
    conceptIds: ['radioactivity-nuclear-decay'],
  },
];

export const CONCEPTS: PhysicsConcept[] = [
  // 1. PROJECTILE MOTION
  {
    id: 'projectile-motion',
    chapterId: 'kinematics',
    category: 'mechanics',
    topic: '2D / 3D Kinematics',
    title: 'Projectile Motion & Trajectory Parabola',
    subtitle: 'Real-time 3D parabolic trajectory, velocity decomposition & range optimization',
    badge: 'Core JEE High-Yield',
    simulationType: 'projectile-motion',
    description:
      'Projectile motion is two-dimensional motion under constant gravitational acceleration g. The horizontal motion has zero acceleration while the vertical motion experiences constant downward acceleration.',
    assumptions: [
      'Constant gravitational acceleration (g = 9.8 or 10 m/s² downwards)',
      'Air resistance is neglected unless drag parameter is enabled',
      'Curvature and rotation of Earth are neglected',
      'Launch point is located at ground level or specified initial height h',
    ],
    cameraPreset: { position: [15, 12, 25], target: [10, 4, 0] },
    parameters: [
      { id: 'u', label: 'Initial Velocity (u)', symbol: 'u', unit: 'm/s', min: 5, max: 40, step: 1, defaultVal: 20, description: 'Magnitude of the initial launch speed' },
      { id: 'theta', label: 'Launch Angle (θ)', symbol: 'θ', unit: '°', min: 5, max: 85, step: 1, defaultVal: 45, description: 'Elevation angle with respect to horizontal' },
      { id: 'g', label: 'Gravity (g)', symbol: 'g', unit: 'm/s²', min: 1.6, max: 25, step: 0.1, defaultVal: 9.8, description: 'Planetary gravity (9.8: Earth, 1.6: Moon, 24.8: Jupiter)' },
      { id: 'h0', label: 'Initial Height (h₀)', symbol: 'h_0', unit: 'm', min: 0, max: 20, step: 1, defaultVal: 0, description: 'Elevation of the launch platform' },
      { id: 'planeAngle', label: 'Inclined Plane Angle (α)', symbol: 'α', unit: '°', min: -45, max: 45, step: 1, defaultVal: 0, description: 'Angle of the inclined terrain (positive = uphill launch, negative = downhill launch)' },
    ],
    formulas: [
      { name: 'Time of Flight (T)', latex: 'T = \\frac{u\\sin\\theta + \\sqrt{(u\\sin\\theta)^2 + 2gh_0}}{g}', explanation: 'Total time the projectile spends in the air before hitting the ground.' },
      { name: 'Maximum Height (H_max)', latex: 'H = h_0 + \\frac{u^2\\sin^2\\theta}{2g}', explanation: 'Peak vertical displacement where vertical velocity v_y = 0.' },
      { name: 'Horizontal Range (R)', latex: 'R = u\\cos\\theta \\times T', explanation: 'Total horizontal distance traversed by the projectile.' },
      { name: 'Trajectory Equation', latex: 'y = h_0 + x\\tan\\theta - \\frac{gx^2}{2u^2\\cos^2\\theta}', explanation: 'Parabolic equation relating vertical position y to horizontal position x.' },
      { name: 'Instantaneous Velocity', latex: '\\vec{v}(t) = (u\\cos\\theta)\\hat{i} + (u\\sin\\theta - gt)\\hat{j}', explanation: 'Vector sum of constant horizontal velocity and decreasing vertical velocity.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Complementary launch angles (θ and 90° - θ) give the SAME horizontal range on level ground.',
        'Ratio of max heights for complementary angles: H₁ / H₂ = tan²θ, and R = 4√(H₁ H₂).',
        'Velocity at top is purely horizontal: v_top = u cos θ, kinetic energy at top = (1/2)m u² cos²θ.',
      ],
      keyShortcuts: [
        'Range R = 4 H cot θ.',
        'Angle of velocity with horizontal at time t: tan α = (u sin θ - gt) / (u cos θ).',
        'Average velocity from launch to landing on horizontal plane: v_avg = u cos θ (magnitude).',
      ],
      trapAlerts: [
        'Do NOT use R = u²sin(2θ)/g when launch height h₀ > 0. You must use R = u cosθ * T.',
        'Acceleration at the highest point is NOT zero! It remains g downward throughout the flight.',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Projectile on an inclined plane with inclination α: Range along incline R_incline = [2u² sin(θ - α) cos θ] / [g cos² α]. Maximum range occurs when θ = π/4 + α/2.',
        'Radius of curvature at any point: ρ = v³ / (g v_x) = v² / (g cos α) where α is the angle made by velocity with horizontal.',
        'Minimum velocity to hit a target (x, y): u_min = √[g(y + √(x² + y²))].',
      ],
      multiConceptLinks: [
        'Work-Energy Theorem: Conservation of mechanical energy E = (1/2)mv² + mgy = (1/2)mu² + mgh₀.',
        'Centre of Mass explosion in mid-air: The COM continues along the original parabolic path.',
      ],
      calculusFormulations: [
        'Linear Air Drag: m dv_y/dt = -mg - kv_y => v_y(t) = (u_y + mg/k)e^{-kt/m} - mg/k.',
      ],
      advancedPitfalls: [
        'Radius of curvature at highest point is minimum and equals ρ_min = (u cos θ)² / g.',
      ],
    },
    questions: [
      {
        id: 'q-proj-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'Two projectiles are fired from ground with equal speed u at complementary angles θ₁ = 30° and θ₂ = 60°. If their maximum heights are H₁ and H₂ and ranges are R₁ and R₂, what is the value of R₁/R₂ and H₁/H₂?',
        options: [
          'R₁/R₂ = 1 and H₁/H₂ = 1/3',
          'R₁/R₂ = 1 and H₁/H₂ = 3',
          'R₁/R₂ = 1/√3 and H₁/H₂ = 1/3',
          'R₁/R₂ = √3 and H₁/H₂ = 3',
        ],
        correctAnswer: 0,
        explanation: 'For complementary angles on flat ground, ranges are identical (R₁ = R₂). Heights scale as H = u²sin²θ/(2g), so H₁/H₂ = sin²(30°)/sin²(60°) = (1/4)/(3/4) = 1/3.',
        formulaUsed: 'R = \\frac{u^2\\sin 2\\theta}{g},\\; H = \\frac{u^2\\sin^2\\theta}{2g}',
      },
      {
        id: 'q-proj-2',
        type: 'integer',
        difficulty: 'JEE Advanced',
        question: 'A projectile is launched from ground at an angle θ = 45° with speed u = 20 m/s (take g = 10 m/s²). Calculate the radius of curvature (in meters) of its trajectory at the highest point.',
        numericalAnswer: 20,
        tolerance: 0.1,
        explanation: 'At the highest point, velocity is purely horizontal: v = u cos 45° = 20 * (1/√2) = 10√2 m/s. The normal acceleration is purely g = 10 m/s². The radius of curvature ρ = v²/a_n = (10√2)² / 10 = 200 / 10 = 20 m.',
        formulaUsed: '\\rho = \\frac{v^2}{a_n} = \\frac{(u\\cos\\theta)^2}{g}',
      },
    ],
    graphConfigs: [
      {
        id: 'y-vs-x',
        title: 'Trajectory Profile (y vs x)',
        xLabel: 'Horizontal Position (x)',
        yLabel: 'Vertical Height (y)',
        xUnit: 'm',
        yUnit: 'm',
        color: '#06b6d4',
        type: 'parametric',
        calc: (p) => {
          const rad = (p.theta * Math.PI) / 180;
          const u_x = p.u * Math.cos(rad);
          const u_y = p.u * Math.sin(rad);
          const h0 = p.h0 || 0;
          const T = (u_y + Math.sqrt(u_y * u_y + 2 * p.g * h0)) / p.g;
          const pts = [];
          const N = 40;
          for (let i = 0; i <= N; i++) {
            const t = (i / N) * T;
            const x = u_x * t;
            const y = Math.max(0, h0 + u_y * t - 0.5 * p.g * t * t);
            pts.push({ x, y });
          }
          return pts;
        },
      },
      {
        id: 'vy-vs-t',
        title: 'Vertical Velocity vs Time (v_y vs t)',
        xLabel: 'Time (t)',
        yLabel: 'v_y',
        xUnit: 's',
        yUnit: 'm/s',
        color: '#3b82f6',
        type: 'time-series',
        calc: (p) => {
          const rad = (p.theta * Math.PI) / 180;
          const u_y = p.u * Math.sin(rad);
          const h0 = p.h0 || 0;
          const T = (u_y + Math.sqrt(u_y * u_y + 2 * p.g * h0)) / p.g;
          const pts = [];
          for (let i = 0; i <= 30; i++) {
            const t = (i / 30) * T;
            const vy = u_y - p.g * t;
            pts.push({ x: t, y: vy });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const rad = (p.theta * Math.PI) / 180;
      const ux = p.u * Math.cos(rad);
      const uy = p.u * Math.sin(rad);
      const h0 = p.h0 || 0;
      const T = (uy + Math.sqrt(uy * uy + 2 * p.g * h0)) / p.g;
      const H = h0 + (uy * uy) / (2 * p.g);
      const R = ux * T;
      const tClamped = Math.min(simTime, T);
      const curX = ux * tClamped;
      const curY = Math.max(0, h0 + uy * tClamped - 0.5 * p.g * tClamped * tClamped);
      const curVy = uy - p.g * tClamped;
      const curSpeed = Math.sqrt(ux * ux + curVy * curVy);

      return [
        { label: 'Time of Flight', symbol: 'T', unit: 's', value: T, formatted: `${T.toFixed(2)} s`, color: '#38bdf8' },
        { label: 'Max Height', symbol: 'H_{max}', unit: 'm', value: H, formatted: `${H.toFixed(2)} m`, color: '#4ade80' },
        { label: 'Horizontal Range', symbol: 'R', unit: 'm', value: R, formatted: `${R.toFixed(2)} m`, color: '#f43f5e' },
        { label: 'Current Speed', symbol: '|\\vec{v}|', unit: 'm/s', value: curSpeed, formatted: `${curSpeed.toFixed(2)} m/s`, color: '#fbbf24' },
        { label: 'Current Position (x, y)', symbol: '(x, y)', unit: 'm', value: curX, formatted: `(${curX.toFixed(1)}, ${curY.toFixed(1)}) m`, color: '#a855f7' },
      ];
    },
  },

  // 2. INCLINED PLANE & FRICTION
  {
    id: 'inclined-plane-friction',
    chapterId: 'laws-of-motion',
    category: 'mechanics',
    topic: 'Laws of Motion & Friction',
    title: 'Inclined Plane Dynamics & Limiting Friction',
    subtitle: 'Free Body Diagrams, Normal Reaction, Static vs Kinetic friction and Angle of Repose',
    badge: 'Essential Mechanics',
    simulationType: 'inclined-plane-friction',
    description:
      'A block of mass m rests or slides on an incline with angle θ. Gravity decomposes into mg sin θ along the incline and mg cos θ perpendicular to the plane. Static friction prevents motion until mg sin θ > μ_s mg cos θ.',
    assumptions: [
      'Uniform gravitational field g acting vertically downward',
      'Rigid planar surface with Coulomb friction model (f_s <= μ_s N, f_k = μ_k N)',
      'No toppling (assumed block dimensions satisfy equilibrium conditions)',
    ],
    cameraPreset: { position: [10, 8, 14], target: [0, 2, 0] },
    parameters: [
      { id: 'm', label: 'Mass (m)', symbol: 'm', unit: 'kg', min: 1, max: 20, step: 0.5, defaultVal: 5, description: 'Mass of the sliding block' },
      { id: 'theta', label: 'Incline Angle (θ)', symbol: 'θ', unit: '°', min: 0, max: 70, step: 1, defaultVal: 30, description: 'Angle of the inclined plane with horizontal' },
      { id: 'mu_s', label: 'Static Friction (μₛ)', symbol: 'μ_s', unit: '', min: 0, max: 1.2, step: 0.05, defaultVal: 0.5, description: 'Coefficient of static friction' },
      { id: 'mu_k', label: 'Kinetic Friction (μₖ)', symbol: 'μ_k', unit: '', min: 0, max: 1.0, step: 0.05, defaultVal: 0.35, description: 'Coefficient of kinetic friction (μ_k <= μ_s)' },
      { id: 'F_ext', label: 'Applied Force (F)', symbol: 'F', unit: 'N', min: -50, max: 100, step: 2, defaultVal: 0, description: 'External force applied parallel to the incline (upwards +ve)' },
    ],
    formulas: [
      { name: 'Normal Reaction', latex: 'N = mg\\cos\\theta', explanation: 'Contact normal force perpendicular to the inclined surface.' },
      { name: 'Limiting Static Friction', latex: 'f_{s,\\max} = \\mu_s N = \\mu_s mg\\cos\\theta', explanation: 'Maximum frictional resistance before sliding begins.' },
      { name: 'Angle of Repose (\\theta_r)', latex: '\\theta_r = \\tan^{-1}(\\mu_s)', explanation: 'Minimum angle of incline at which the block starts sliding under its own weight.' },
      { name: 'Downhill Acceleration', latex: 'a = g(\\sin\\theta - \\mu_k\\cos\\theta) - \\frac{F}{m}', explanation: 'Net downward acceleration once motion commences.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'When θ < tan⁻¹(μ_s), static friction exactly balances mg sin θ: f = mg sin θ (NOT μ_s N!).',
        'Time taken to slide down smooth incline: t_smooth = √(2L / g sin θ). With friction: t_rough = n * t_smooth => μ = (1 - 1/n²) tan θ.',
      ],
      keyShortcuts: [
        'Condition for block at rest: |mg sin θ - F_ext| <= μ_s mg cos θ.',
        'Work done by friction over displacement L: W_f = -μ_k mg cos θ * L.',
      ],
      trapAlerts: [
        'Friction is a self-adjusting force! It is only equal to μ_s N at the verge of slipping (limiting state).',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Block on an accelerating wedge: To prevent slipping of block on wedge accelerating with a: g(sinθ - μ cosθ)/(cosθ + μ sinθ) <= a <= g(sinθ + μ cosθ)/(cosθ - μ sinθ).',
        'Minimum force at an angle α to move a block on flat ground: F_min = (μ mg) / √(1 + μ²) at angle α = tan⁻¹(μ).',
      ],
      multiConceptLinks: [
        'Combined Translation + Rotation: Minimum distance for toppling before sliding: b/h > tan θ.',
      ],
      calculusFormulations: [
        'Variable Incline Shape: Curve of constant sliding speed or Brachistochrone under gravity.',
      ],
      advancedPitfalls: [
        'Remember that kinetic friction direction is always OPPOSITE to the relative velocity vector, not applied force.',
      ],
    },
    questions: [
      {
        id: 'q-fric-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A block of mass 2 kg rests on an incline of θ = 30° with μ_s = 0.8 and μ_k = 0.6 (g = 10 m/s²). The frictional force acting on the block is:',
        options: ['10 N up the incline', '13.85 N up the incline', '10.39 N down the incline', '0 N'],
        correctAnswer: 0,
        explanation: 'Here tan(30°) = 0.577, which is LESS than μ_s = 0.8. Thus the block does NOT slide! Since it is in static equilibrium, friction self-adjusts to balance mg sin 30°: f = mg sin 30° = 2 * 10 * 0.5 = 10 N upwards.',
        formulaUsed: 'f = mg\\sin\\theta \\quad (\\text{when } \\theta < \\tan^{-1}\\mu_s)',
      },
    ],
    graphConfigs: [
      {
        id: 'friction-vs-angle',
        title: 'Frictional Force vs Incline Angle',
        xLabel: 'Angle (θ)',
        yLabel: 'Friction (f)',
        xUnit: '°',
        yUnit: 'N',
        color: '#f97316',
        type: 'distribution',
        calc: (p) => {
          const pts = [];
          const g = 9.8;
          const thetaRepose = Math.atan(p.mu_s) * (180 / Math.PI);
          for (let deg = 0; deg <= 75; deg += 2) {
            const rad = (deg * Math.PI) / 180;
            let f = 0;
            if (deg <= thetaRepose) {
              f = p.m * g * Math.sin(rad);
            } else {
              f = p.mu_k * p.m * g * Math.cos(rad);
            }
            pts.push({ x: deg, y: f });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const g = 9.8;
      const rad = (p.theta * Math.PI) / 180;
      const N = p.m * g * Math.cos(rad);
      const mg_parallel = p.m * g * Math.sin(rad);
      const netDriving = mg_parallel - p.F_ext;
      const f_max = p.mu_s * N;
      const thetaRepose = Math.atan(p.mu_s) * (180 / Math.PI);

      let state = 'At Rest (Static)';
      let f = 0;
      let a = 0;

      if (Math.abs(netDriving) <= f_max) {
        state = 'Static Equilibrium (No slip)';
        f = Math.abs(netDriving);
        a = 0;
      } else {
        state = netDriving > 0 ? 'Accelerating Downward' : 'Accelerating Upward';
        const f_k = p.mu_k * N;
        f = f_k;
        const sign = netDriving > 0 ? 1 : -1;
        a = (Math.abs(netDriving) - f_k) / p.m;
        if (sign < 0) a = -a;
      }

      return [
        { label: 'Motion State', symbol: 'State', unit: '', value: a, formatted: state, color: a === 0 ? '#4ade80' : '#f43f5e' },
        { label: 'Normal Force', symbol: 'N', unit: 'N', value: N, formatted: `${N.toFixed(2)} N`, color: '#38bdf8' },
        { label: 'Active Friction', symbol: 'f', unit: 'N', value: f, formatted: `${f.toFixed(2)} N`, color: '#f97316' },
        { label: 'Acceleration', symbol: 'a', unit: 'm/s²', value: a, formatted: `${a.toFixed(2)} m/s²`, color: '#eab308' },
        { label: 'Angle of Repose', symbol: '\\theta_r', unit: '°', value: thetaRepose, formatted: `${thetaRepose.toFixed(1)}°`, color: '#a855f7' },
      ];
    },
  },

  // 3. SHM (SPRING-MASS & PENDULUM)
  {
    id: 'shm-spring-pendulum',
    chapterId: 'oscillations',
    category: 'waves-oscillations',
    topic: 'Simple Harmonic Motion',
    title: 'SHM Oscillator & Energy Conservation',
    subtitle: 'Kinetic & Potential energy barter, Phase circle, Velocity & Acceleration vectors',
    badge: 'Core JEE Syllabus',
    simulationType: 'shm-spring-pendulum',
    description:
      'Simple Harmonic Motion occurs when the restoring force is directly proportional to displacement: F = -kx. The motion is sinusoidal with continuous interchange between kinetic energy and potential energy, while total mechanical energy remains conserved.',
    assumptions: [
      'Hooke law holds perfectly (linear elastic regime)',
      'Massless ideal spring without internal damping',
      'Small amplitude approximation for pendulum: sin θ ≈ θ',
    ],
    cameraPreset: { position: [0, 6, 12], target: [0, 0, 0] },
    parameters: [
      { id: 'm', label: 'Mass (m)', symbol: 'm', unit: 'kg', min: 0.5, max: 10, step: 0.5, defaultVal: 2, description: 'Oscillating mass' },
      { id: 'k', label: 'Spring Constant (k)', symbol: 'k', unit: 'N/m', min: 10, max: 200, step: 5, defaultVal: 50, description: 'Stiffness of the spring' },
      { id: 'A', label: 'Amplitude (A)', symbol: 'A', unit: 'm', min: 0.5, max: 4, step: 0.1, defaultVal: 2, description: 'Maximum displacement from mean position' },
      { id: 'phi', label: 'Initial Phase (ϕ)', symbol: 'ϕ', unit: '°', min: 0, max: 360, step: 15, defaultVal: 0, description: 'Starting phase angle' },
    ],
    formulas: [
      { name: 'Angular Frequency (\\omega)', latex: '\\omega = \\sqrt{\\frac{k}{m}}', explanation: 'Fundamental frequency of natural oscillation.' },
      { name: 'Displacement Equation', latex: 'x(t) = A\\cos(\\omega t + \\phi)', explanation: 'Instantaneous position measured from equilibrium.' },
      { name: 'Velocity in SHM', latex: 'v(x) = \\pm\\omega\\sqrt{A^2 - x^2}', explanation: 'Velocity as a function of position (maximum at mean position x = 0).' },
      { name: 'Total Mechanical Energy', latex: 'E = \\frac{1}{2}kA^2 = \\frac{1}{2}mv^2 + \\frac{1}{2}kx^2', explanation: 'Constant total energy conserved at all points of oscillation.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Position where Kinetic Energy = Potential Energy: (1/2)kx² = (1/2)k(A² - x²) => x = ± A / √2.',
        'Average Kinetic Energy over one full cycle: <K> = (1/4) k A² = E / 2.',
        'Frequency of Kinetic Energy oscillation is DOUBLE the frequency of displacement oscillation (2ω).',
      ],
      keyShortcuts: [
        'Time taken to go from 0 to A/2 is T/12, and from A/2 to A is T/6.',
        'Velocity leads displacement by π/2; acceleration leads velocity by π/2 and displacement by π.',
      ],
      trapAlerts: [
        'Acceleration is maximum at extreme positions (|a_max| = ω²A) where velocity is ZERO.',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Combination of Springs: Series 1/k_eq = 1/k₁ + 1/k₂; Parallel k_eq = k₁ + k₂.',
        'Damped Harmonic Motion: m d²x/dt² + b dx/dt + kx = 0 => x(t) = A e^{-bt/2m} cos(ω\'t + φ).',
        'Physical Pendulum: T = 2π √(I / mgd) where I is moment of inertia about pivot point and d is distance to COM.',
      ],
      multiConceptLinks: [
        'Superposition of perpendicular SHMs: Lissajous figures.',
      ],
      calculusFormulations: [
        'Phase space trajectory is an ellipse: (x/A)² + (v/ωA)² = 1.',
      ],
      advancedPitfalls: [
        'For a cut spring of fraction f of original length L, the new spring constant becomes k / f.',
      ],
    },
    questions: [
      {
        id: 'q-shm-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A particle executes SHM with amplitude A. At what displacement from the mean position is the kinetic energy equal to 3 times its potential energy?',
        options: ['x = A / 2', 'x = A / √2', 'x = A / 3', 'x = A √3 / 2'],
        correctAnswer: 0,
        explanation: 'Given K = 3 U. Total energy E = K + U = 4U. Thus (1/2)kA² = 4 * (1/2)kx² => x² = A²/4 => x = A/2.',
        formulaUsed: 'K = \\frac{1}{2}k(A^2 - x^2),\\; U = \\frac{1}{2}kx^2',
      },
    ],
    graphConfigs: [
      {
        id: 'energy-vs-x',
        title: 'Energy vs Displacement (E-x Curve)',
        xLabel: 'Displacement (x)',
        yLabel: 'Energy (E)',
        xUnit: 'm',
        yUnit: 'J',
        color: '#10b981',
        type: 'distribution',
        calc: (p) => {
          const pts = [];
          const N = 40;
          for (let i = -N; i <= N; i++) {
            const x = (i / N) * p.A;
            const U = 0.5 * p.k * x * x;
            pts.push({ x, y: U });
          }
          return pts;
        },
      },
      {
        id: 'x-vs-t',
        title: 'Displacement vs Time (x-t Waveform)',
        xLabel: 'Time (t)',
        yLabel: 'Position (x)',
        xUnit: 's',
        yUnit: 'm',
        color: '#06b6d4',
        type: 'time-series',
        calc: (p) => {
          const omega = Math.sqrt(p.k / p.m);
          const T = (2 * Math.PI) / omega;
          const phiRad = (p.phi * Math.PI) / 180;
          const pts = [];
          for (let i = 0; i <= 50; i++) {
            const t = (i / 50) * (2 * T);
            const x = p.A * Math.cos(omega * t + phiRad);
            pts.push({ x: t, y: x });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const omega = Math.sqrt(p.k / p.m);
      const T = (2 * Math.PI) / omega;
      const f = 1 / T;
      const phiRad = (p.phi * Math.PI) / 180;
      const phase = omega * simTime + phiRad;
      const x = p.A * Math.cos(phase);
      const v = -p.A * omega * Math.sin(phase);
      const a = -omega * omega * x;
      const K = 0.5 * p.m * v * v;
      const U = 0.5 * p.k * x * x;
      const E_total = 0.5 * p.k * p.A * p.A;

      return [
        { label: 'Time Period', symbol: 'T', unit: 's', value: T, formatted: `${T.toFixed(2)} s`, color: '#38bdf8' },
        { label: 'Angular Frequency', symbol: '\\omega', unit: 'rad/s', value: omega, formatted: `${omega.toFixed(2)} rad/s`, color: '#a855f7' },
        { label: 'Displacement', symbol: 'x(t)', unit: 'm', value: x, formatted: `${x.toFixed(2)} m`, color: '#4ade80' },
        { label: 'Velocity', symbol: 'v(t)', unit: 'm/s', value: v, formatted: `${v.toFixed(2)} m/s`, color: '#f59e0b' },
        { label: 'Kinetic Energy', symbol: 'K', unit: 'J', value: K, formatted: `${K.toFixed(2)} J`, color: '#06b6d4' },
        { label: 'Potential Energy', symbol: 'U', unit: 'J', value: U, formatted: `${U.toFixed(2)} J`, color: '#f43f5e' },
      ];
    },
  },

  // 4. ELECTRIC FIELD & POINT CHARGES
  {
    id: 'electric-field-charges',
    chapterId: 'electrostatics',
    category: 'electromagnetism',
    topic: 'Coulomb Law & Electric Fields',
    title: '3D Electric Field Lines, Dipoles & Equipotentials',
    subtitle: 'Dynamic 3D vector field, superposition principle, dipole torque & potential landscape',
    badge: 'Electrostatics Pillar',
    simulationType: 'electric-field-charges',
    description:
      'The electric field is the force experienced per unit positive test charge: E = kq/r². By the principle of superposition, the net electric field of multiple charges is the vector sum of individual electric fields: E_net = Σ E_i.',
    assumptions: [
      'Point charges in free space / vacuum (ε = ε₀ = 8.854 × 10⁻¹² F/m)',
      'Electrostatic conditions (charges are stationary or held in place)',
      'Coulomb constant k = 1 / (4πε₀) ≈ 9 × 10⁹ N·m²/C²',
    ],
    cameraPreset: { position: [0, 12, 18], target: [0, 0, 0] },
    parameters: [
      { id: 'q1', label: 'Charge 1 (q₁)', symbol: 'q_1', unit: 'μC', min: -10, max: 10, step: 1, defaultVal: 4, description: 'Magnitude and sign of first charge at (-d, 0)' },
      { id: 'q2', label: 'Charge 2 (q₂)', symbol: 'q_2', unit: 'μC', min: -10, max: 10, step: 1, defaultVal: -4, description: 'Magnitude and sign of second charge at (+d, 0)' },
      { id: 'sep', label: 'Separation (2d)', symbol: '2d', unit: 'm', min: 1, max: 8, step: 0.5, defaultVal: 4, description: 'Distance between the two point charges' },
      { id: 'probeX', label: 'Probe Test Point X', symbol: 'x_p', unit: 'm', min: -6, max: 6, step: 0.2, defaultVal: 0, description: 'X-coordinate of the test charge probe' },
      { id: 'probeY', label: 'Probe Test Point Y', symbol: 'y_p', unit: 'm', min: -6, max: 6, step: 0.2, defaultVal: 3, description: 'Y-coordinate of the test charge probe' },
    ],
    formulas: [
      { name: 'Coulomb Law', latex: '\\vec{F}_{12} = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^2}\\hat{r}_{12}', explanation: 'Mutual electrostatic force between two point charges.' },
      { name: 'Electric Field Superposition', latex: '\\vec{E}_{\\text{net}} = \\sum_{i} \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_i}{r_i^2}\\hat{r}_i', explanation: 'Vector sum of fields from all charges at probe point.' },
      { name: 'Electric Dipole Moment', latex: '\\vec{p} = q(2\\vec{d})', explanation: 'Vector directed from negative charge to positive charge.' },
      { name: 'Electric Potential', latex: 'V = \\sum_{i} \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_i}{r_i}', explanation: 'Scalar electric potential at probe location.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Electric field on axial line of short dipole: E_axial = 2kp / r³ (parallel to p).',
        'Electric field on equatorial line of short dipole: E_equatorial = kp / r³ (anti-parallel to p).',
        'Ratio E_axial / E_equatorial = 2 at equal distances r >> d.',
      ],
      keyShortcuts: [
        'Torque on dipole in uniform field: τ = p × E = p E sin θ.',
        'Potential energy of dipole: U = -p · E = -p E cos θ.',
        'Work done in rotating dipole from θ₁ to θ₂: W = p E (cos θ₁ - cos θ₂).',
      ],
      trapAlerts: [
        'Electric field inside a uniformly charged conductor in electrostatic equilibrium is STRICTLY ZERO.',
        'Equipotential surfaces are always PERPENDICULAR to electric field lines.',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Gauss Law: ∮ E · dA = q_enclosed / ε₀. Applicable for high-symmetry systems (sphere, cylinder, infinite sheet).',
        'Electric Field at general point (r, θ) of a short dipole: E = (kp / r³) √(1 + 3 cos² θ) with angle α = tan⁻¹((1/2) tan θ).',
        'Method of electrical images for grounded conducting planes.',
      ],
      multiConceptLinks: [
        'Capacitors with dielectric insertion: U = Q² / (2C) vs U = (1/2)CV² depending on battery connected vs disconnected.',
      ],
      calculusFormulations: [
        'Electric Field from Potential Gradient: E = -∇V = -(∂V/∂x i + ∂V/∂y j + ∂V/∂z k).',
      ],
      advancedPitfalls: [
        'Electric field of an infinite line of charge is E = 2kλ / r (scales as 1/r, NOT 1/r²!).',
      ],
    },
    questions: [
      {
        id: 'q-elec-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'An electric dipole of moment p is placed in a uniform electric field E. The work done in rotating the dipole from stable equilibrium (θ = 0°) to unstable equilibrium (θ = 180°) is:',
        options: ['2 p E', 'p E', '0', '-2 p E'],
        correctAnswer: 0,
        explanation: 'Work done W = U_final - U_initial = -pE cos(180°) - (-pE cos(0°)) = pE - (-pE) = 2 p E.',
        formulaUsed: 'W = pE(1 - \\cos\\theta)',
      },
    ],
    graphConfigs: [
      {
        id: 'v-vs-r',
        title: 'Electric Potential vs Distance along X-axis',
        xLabel: 'Position x',
        yLabel: 'Potential V',
        xUnit: 'm',
        yUnit: 'kV',
        color: '#8b5cf6',
        type: 'distribution',
        calc: (p) => {
          const k = 8.99; // in kV*m/uC
          const d = p.sep / 2;
          const pts = [];
          for (let x = -8; x <= 8; x += 0.2) {
            const r1 = Math.abs(x - (-d));
            const r2 = Math.abs(x - d);
            if (r1 > 0.3 && r2 > 0.3) {
              const V = (k * p.q1) / r1 + (k * p.q2) / r2;
              pts.push({ x, y: Math.max(-50, Math.min(50, V)) });
            }
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const k = 8.99e9;
      const d = p.sep / 2;
      const q1_C = p.q1 * 1e-6;
      const q2_C = p.q2 * 1e-6;

      const r1x = p.probeX - (-d);
      const r1y = p.probeY;
      const r1_sq = r1x * r1x + r1y * r1y;
      const r1 = Math.sqrt(r1_sq);

      const r2x = p.probeX - d;
      const r2y = p.probeY;
      const r2_sq = r2x * r2x + r2y * r2y;
      const r2 = Math.sqrt(r2_sq);

      const E1 = (k * q1_C) / r1_sq;
      const E1x = E1 * (r1x / r1);
      const E1y = E1 * (r1y / r1);

      const E2 = (k * q2_C) / r2_sq;
      const E2x = E2 * (r2x / r2);
      const E2y = E2 * (r2y / r2);

      const E_net_x = E1x + E2x;
      const E_net_y = E1y + E2y;
      const E_mag = Math.sqrt(E_net_x * E_net_x + E_net_y * E_net_y);
      const V_net = (k * q1_C) / r1 + (k * q2_C) / r2;
      const dipoleP = p.q1 === -p.q2 && p.q1 > 0 ? p.q1 * 1e-6 * p.sep : Math.abs(q1_C - q2_C) * d;

      return [
        { label: '|Net Electric Field|', symbol: '|\\vec{E}|', unit: 'N/C', value: E_mag, formatted: `${E_mag.toExponential(2)} N/C`, color: '#a855f7' },
        { label: 'Scalar Potential', symbol: 'V', unit: 'V', value: V_net, formatted: `${V_net.toExponential(2)} V`, color: '#38bdf8' },
        { label: 'E_x Component', symbol: 'E_x', unit: 'N/C', value: E_net_x, formatted: `${E_net_x.toExponential(2)} N/C`, color: '#4ade80' },
        { label: 'E_y Component', symbol: 'E_y', unit: 'N/C', value: E_net_y, formatted: `${E_net_y.toExponential(2)} N/C`, color: '#fbbf24' },
      ];
    },
  },

  // 5. SERIES LCR RESONANCE & AC PHASORS
  {
    id: 'lcr-circuit',
    chapterId: 'emi-ac',
    category: 'electromagnetism',
    topic: 'Alternating Current & Phasor Diagrams',
    title: 'Series LCR Circuit & Resonance Phasors',
    subtitle: '3D rotating Phasor wheel, impedance triangle, resonance peak & quality factor',
    badge: 'JEE Main Favourite',
    simulationType: 'lcr-circuit',
    description:
      'In a series LCR circuit driven by AC voltage V = V₀ sin(ωt), current lags or leads depending on inductive reactance X_L = ωL vs capacitive reactance X_C = 1/(ωC). At resonance (X_L = X_C), impedance is minimum (Z = R) and current is maximum.',
    assumptions: [
      'Sinusoidal AC steady state (transients have decayed)',
      'Ideal pure inductor L and capacitor C (no stray resistances)',
      'Linear circuit elements obeying Ohm law in phasor domain',
    ],
    cameraPreset: { position: [0, 8, 14], target: [0, 0, 0] },
    parameters: [
      { id: 'R', label: 'Resistance (R)', symbol: 'R', unit: 'Ω', min: 10, max: 200, step: 5, defaultVal: 50, description: 'Ohmic resistance in the circuit' },
      { id: 'L', label: 'Inductance (L)', symbol: 'L', unit: 'mH', min: 10, max: 500, step: 10, defaultVal: 100, description: 'Inductor self-inductance' },
      { id: 'C', label: 'Capacitance (C)', symbol: 'C', unit: 'μF', min: 5, max: 100, step: 5, defaultVal: 20, description: 'Capacitor capacitance' },
      { id: 'f', label: 'Source Frequency (f)', symbol: 'f', unit: 'Hz', min: 20, max: 300, step: 5, defaultVal: 112, description: 'AC driving frequency' },
      { id: 'V0', label: 'Peak Voltage (V₀)', symbol: 'V_0', unit: 'V', min: 50, max: 300, step: 10, defaultVal: 220, description: 'Peak AC voltage amplitude' },
    ],
    formulas: [
      { name: 'Inductive Reactance (X_L)', latex: 'X_L = \\omega L = 2\\pi f L', explanation: 'Opposition of inductor; voltage leads current by 90°.' },
      { name: 'Capacitive Reactance (X_C)', latex: 'X_C = \\frac{1}{\\omega C} = \\frac{1}{2\\pi f C}', explanation: 'Opposition of capacitor; current leads voltage by 90°.' },
      { name: 'Net Impedance (Z)', latex: 'Z = \\sqrt{R^2 + (X_L - X_C)^2}', explanation: 'Total opposition to AC current in the circuit.' },
      { name: 'Resonant Frequency (f_0)', latex: 'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}', explanation: 'Frequency at which X_L = X_C and power factor = 1.' },
      { name: 'Phase Angle (\\phi)', latex: '\\tan\\phi = \\frac{X_L - X_C}{R}', explanation: 'Phase lead/lag angle of applied voltage over current.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'At resonance: Z = R (minimum), I_0 = V_0 / R (maximum), phase difference φ = 0, power factor cos φ = 1.',
        'Average Power Dissipation: P_avg = V_rms I_rms cos φ = (V_rms² / Z) cos φ.',
        'Current in pure inductor/capacitor dissipates ZERO average power (Wattless current).',
      ],
      keyShortcuts: [
        'Quality Factor: Q = (1/R) √(L/C) = ω₀ L / R = f₀ / Bandwidth (Δf).',
        'At half-power frequencies (f₁ and f₂): Current drops to I_max / √2 and Z = R√2.',
      ],
      trapAlerts: [
        'Voltages across L and C can individually exceed the source voltage V₀ at resonance! (Magnification factor Q).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Parallel LCR Antiresonance: At resonance frequency, total admittance is minimum and impedance is maximum (Rejection filter).',
        'Phasor diagram with non-ideal inductor having internal coil resistance r.',
      ],
      multiConceptLinks: [
        'Electromagnetic Oscillations in LC Tank: Analogy to mechanical SHM (L <-> m, 1/C <-> k, I <-> v, q <-> x).',
      ],
      calculusFormulations: [
        'Differential equation: L d²q/dt² + R dq/dt + q/C = V₀ sin(ωt).',
      ],
      advancedPitfalls: [
        'Power factor is cos φ = R / Z. Never use sin φ!',
      ],
    },
    questions: [
      {
        id: 'q-lcr-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'In a series LCR circuit, R = 100 Ω, X_L = 300 Ω, and X_C = 200 Ω. The phase difference between the source voltage and current is:',
        options: ['45° with voltage leading current', '45° with current leading voltage', '60° with voltage leading', '0° (in phase)'],
        correctAnswer: 0,
        explanation: 'tan φ = (X_L - X_C) / R = (300 - 200) / 100 = 100 / 100 = 1 => φ = 45°. Since X_L > X_C, the circuit is inductive, so voltage leads current by 45°.',
        formulaUsed: '\\tan\\phi = \\frac{X_L - X_C}{R}',
      },
    ],
    graphConfigs: [
      {
        id: 'i-vs-f',
        title: 'Current Amplitude vs Frequency (Resonance Curve)',
        xLabel: 'Frequency f',
        yLabel: 'Current I₀',
        xUnit: 'Hz',
        yUnit: 'A',
        color: '#3b82f6',
        type: 'distribution',
        calc: (p) => {
          const L_H = p.L * 1e-3;
          const C_F = p.C * 1e-6;
          const pts = [];
          for (let f = 20; f <= 300; f += 4) {
            const omega = 2 * Math.PI * f;
            const XL = omega * L_H;
            const XC = 1 / (omega * C_F);
            const Z = Math.sqrt(p.R * p.R + (XL - XC) * (XL - XC));
            const I0 = p.V0 / Z;
            pts.push({ x: f, y: I0 });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const omega = 2 * Math.PI * p.f;
      const L_H = p.L * 1e-3;
      const C_F = p.C * 1e-6;
      const XL = omega * L_H;
      const XC = 1 / (omega * C_F);
      const Z = Math.sqrt(p.R * p.R + (XL - XC) * (XL - XC));
      const I0 = p.V0 / Z;
      const Irms = I0 / Math.SQRT2;
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L_H * C_F));
      const phiRad = Math.atan((XL - XC) / p.R);
      const phiDeg = phiRad * (180 / Math.PI);
      const cosPhi = p.R / Z;
      const P_avg = (p.V0 / Math.SQRT2) * Irms * cosPhi;
      const Q = (1 / p.R) * Math.sqrt(L_H / C_F);

      return [
        { label: 'Resonant Frequency', symbol: 'f_0', unit: 'Hz', value: f0, formatted: `${f0.toFixed(1)} Hz`, color: '#4ade80' },
        { label: 'Net Impedance', symbol: 'Z', unit: 'Ω', value: Z, formatted: `${Z.toFixed(1)} Ω`, color: '#38bdf8' },
        { label: 'Peak Current', symbol: 'I_0', unit: 'A', value: I0, formatted: `${I0.toFixed(2)} A`, color: '#f59e0b' },
        { label: 'Phase Difference', symbol: '\\phi', unit: '°', value: phiDeg, formatted: `${phiDeg.toFixed(1)}° (${XL > XC ? 'V leads' : 'I leads'})`, color: '#a855f7' },
        { label: 'Quality Factor', symbol: 'Q', unit: '', value: Q, formatted: `${Q.toFixed(2)}`, color: '#ec4899' },
        { label: 'Average Power', symbol: 'P_{avg}', unit: 'W', value: P_avg, formatted: `${P_avg.toFixed(1)} W`, color: '#06b6d4' },
      ];
    },
  },

  // 6. YOUNG'S DOUBLE SLIT EXPERIMENT (YDSE)
  {
    id: 'youngs-double-slit',
    chapterId: 'wave-optics',
    category: 'optics',
    topic: 'Wave Optics & Interference',
    title: 'Young Double-Slit Experiment (YDSE)',
    subtitle: 'Huygens wavelets, coherent secondary sources, path difference Δx = d sin θ & fringe width β = λD/d',
    badge: 'Wave Optics Essential',
    simulationType: 'youngs-double-slit',
    description:
      'In YDSE, monochromatic light from primary slit S₀ illuminates two coherent secondary slits S₁ and S₂ separated by distance d. Expanding spherical wavelets from S₁ and S₂ interfere in space to produce an alternating bright and dark fringe pattern on a screen at distance D. Constructive interference (bright fringes) occurs where path difference Δx = nλ, and destructive interference (dark fringes) occurs where Δx = (2n - 1)λ/2.',
    assumptions: [
      'Monochromatic coherent light source with wavelength λ (spatial & temporal coherence)',
      'Slit separation d is much smaller than screen distance D (d << D)',
      'Small angle approximation: sin θ ≈ tan θ ≈ y / D',
      'Slits S₁ and S₂ act as synchronized secondary coherent Huygens wave emitters',
    ],
    cameraPreset: { position: [0, 9, 17], target: [0, 0, 0] },
    parameters: [
      { id: 'wavelength', label: 'Wavelength (λ)', symbol: 'λ', unit: 'nm', min: 400, max: 700, step: 10, defaultVal: 550, description: 'Wavelength of monochromatic light source (400nm Violet to 700nm Red)' },
      { id: 'd', label: 'Slit Separation (d)', symbol: 'd', unit: 'mm', min: 0.1, max: 1.5, step: 0.05, defaultVal: 0.4, description: 'Distance between coherent slits S₁ and S₂' },
      { id: 'D', label: 'Screen Distance (D)', symbol: 'D', unit: 'm', min: 0.5, max: 2.5, step: 0.1, defaultVal: 1.5, description: 'Distance from the double-slit barrier to observation screen' },
      { id: 'probeY', label: 'Screen Test Point (y_P)', symbol: 'y_P', unit: 'mm', min: -8, max: 8, step: 0.1, defaultVal: 2.06, description: 'Vertical position of observation point P on the screen' },
      { id: 'I0', label: 'Single Slit Intensity (I₀)', symbol: 'I_0', unit: 'W/m²', min: 10, max: 100, step: 5, defaultVal: 50, description: 'Intensity contribution from each individual slit' },
    ],
    formulas: [
      { name: 'Fringe Width (β)', latex: '\\beta = \\frac{\\lambda D}{d}', explanation: 'Equidistant separation between consecutive bright fringes or dark fringes.' },
      { name: 'Optical Path Difference (Δx)', latex: '\\Delta x = S_2 P - S_1 P = d\\sin\\theta \\approx \\frac{y\\cdot d}{D}', explanation: 'Geometric path length difference from slits S₁ and S₂ to point P on screen.' },
      { name: 'Phase Difference (Δϕ)', latex: '\\Delta\\phi = \\frac{2\\pi}{\\lambda}\\Delta x = \\frac{2\\pi d y}{\\lambda D}', explanation: 'Phase shift between interfering secondary waves at point P.' },
      { name: 'Resultant Irradiance Profile', latex: 'I(y) = 4I_0\\cos^2\\left(\\frac{\\Delta\\phi}{2}\\right) = 4I_0\\cos^2\\left(\\frac{\\pi d y}{\\lambda D}\\right)', explanation: 'Physical interference intensity distribution across the screen.' },
      { name: 'Constructive Interference (Maxima)', latex: 'y_n = n\\frac{\\lambda D}{d} = n\\beta \\quad (n = 0, \\pm 1, \\pm 2, \\dots)', explanation: 'Positions of bright fringes with maximum intensity I_max = 4I₀.' },
      { name: 'Destructive Interference (Minima)', latex: 'y_n = \\left(n - \\frac{1}{2}\\right)\\frac{\\lambda D}{d} = \\left(n - \\frac{1}{2}\\right)\\beta', explanation: 'Positions of dark fringes with zero intensity (complete cancellation).' },
      { name: 'Angular Fringe Width (θ_f)', latex: '\\theta_f = \\frac{\\beta}{D} = \\frac{\\lambda}{d}', explanation: 'Angular separation between adjacent fringes (independent of screen distance D).' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'When the entire YDSE apparatus is submerged in a medium of refractive index μ (e.g. water μ = 4/3), fringe width shrinks to β\' = β / μ.',
        'If a thin transparent glass sheet of thickness t and refractive index μ is inserted in the path of slit S₁, the whole fringe pattern shifts upward by Δy = (μ - 1)t D / d.',
        'Number of fringes shifted across the field of view: N = (μ - 1)t / λ.',
        'Intensity ratio between Maxima and Minima for unequal slits: I_max / I_min = (√I₁ + √I₂)² / (√I₁ - √I₂)²',
      ],
      keyShortcuts: [
        'Path difference Δx = nλ for Bright Maxima; Δx = (2n-1)λ/2 for Dark Minima.',
        'Angular fringe width θ_f = λ / d is independent of screen distance D.',
        'Distance of n-th bright fringe from center: y_n = nβ. Distance of n-th dark fringe: y_n = (2n - 1)β / 2.',
        'Total number of bright fringes visible on a screen of width W: N = 2(d / λ) + 1.',
      ],
      trapAlerts: [
        'If white light is used in YDSE: Central fringe is WHITE, while adjacent fringes are colored with VIOLET closest to center and RED furthest.',
        'Path difference formula Δx = yd/D is an approximation valid only when d << D and y << D (small angle θ).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Huygens-Fresnel Principle: Every point on a primary wavefront behaves as a secondary source of spherical wavelets whose mutual envelope forms the next wavefront.',
        'YDSE with unequal slit intensities: I_max = (a₁ + a₂)², I_min = (a₁ - a₂)², Fringe Visibility V = (I_max - I_min) / (I_max + I_min) = 2√(I₁ I₂) / (I₁ + I₂).',
        'Spatial coherence condition: For distinct interference, the width of the primary source slit S₀ must satisfy s / L < λ / d.',
        'Exact path difference without small-angle approximation: Δx = √(D² + (y + d/2)²) - √(D² + (y - d/2)²).',
      ],
      multiConceptLinks: [
        'Electromagnetic wave energy conservation: Redistribution of wave energy from minima (zero) to maxima (4I₀) preserving average spatial intensity 2I₀.',
        'Combined Interference and Single-Slit Diffraction Envelope: I(θ) = 4I₀ cos²(π d sinθ / λ) · sinc²(π w sinθ / λ), leading to missing spectral orders when d/w = integer.',
      ],
      calculusFormulations: [
        'Phase difference integral: Δϕ = (2π / λ) ∮ dl along optical ray paths.',
        'Superposition of wave electric fields: E(t) = E₁ sin(ωt - k r₁) + E₂ sin(ωt - k r₂).',
      ],
      advancedPitfalls: [
        'If one slit is covered with an opaque block, interference disappears and single-slit diffraction pattern is observed.',
        'If one slit is covered with a polaroid sheet rotated by 90° relative to the other, the waves are orthogonally polarized and CANNOT interfere (uniform intensity 2I₀).',
      ],
    },
    questions: [
      {
        id: 'q-ydse-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'In a Young\'s double slit experiment, monochromatic light of wavelength λ = 600 nm is used with slit separation d = 0.5 mm and screen distance D = 1.0 m. What is the distance between the central bright fringe and the 3rd dark fringe?',
        options: ['3.0 mm', '2.5 mm', '3.6 mm', '1.5 mm'],
        correctAnswer: 0,
        explanation: 'Fringe width β = λD / d = (600 × 10⁻⁹ × 1.0) / (0.5 × 10⁻³) = 1.2 × 10⁻³ m = 1.2 mm. Position of n-th dark fringe is y_n = (2n - 1)β / 2. For the 3rd dark fringe (n=3): y_3 = (2(3) - 1)(1.2 mm) / 2 = 5(1.2) / 2 = 3.0 mm.',
        formulaUsed: 'y_n = \\left(n - \\frac{1}{2}\\right)\\frac{\\lambda D}{d}',
      },
      {
        id: 'q-ydse-2',
        type: 'integer',
        difficulty: 'JEE Advanced',
        question: 'In YDSE with λ = 500 nm, d = 1 mm, and D = 1 m, a mica sheet of thickness t = 2.5 μm and refractive index μ = 1.6 is placed in front of one slit. By how many fringe widths (β) does the central fringe shift?',
        numericalAnswer: 3,
        tolerance: 0.1,
        explanation: 'Fringe shift in units of fringe width is N = (μ - 1)t / λ. Here (μ - 1) = (1.6 - 1) = 0.6, t = 2.5 × 10⁻⁶ m, λ = 500 × 10⁻⁹ m. Thus N = (0.6 × 2.5 × 10⁻⁶) / (500 × 10⁻⁹) = 1.5 × 10⁻⁶ / 0.5 × 10⁻⁶ = 3 fringes.',
        formulaUsed: 'N = \\frac{(\\mu - 1)t}{\\lambda}',
      },
    ],
    graphConfigs: [
      {
        id: 'intensity-profile',
        title: 'Screen Irradiance Distribution I(y)',
        xLabel: 'Screen Position y',
        yLabel: 'Intensity I(y)',
        xUnit: 'mm',
        yUnit: 'W/m²',
        color: '#22c55e',
        type: 'distribution',
        calc: (p) => {
          const lam_m = (p.wavelength || 550) * 1e-9;
          const d_m = (p.d || 0.4) * 1e-3;
          const D_m = p.D || 1.5;
          const beta_mm = ((lam_m * D_m) / d_m) * 1000;
          const pts = [];
          for (let y = -4 * beta_mm; y <= 4 * beta_mm; y += beta_mm / 20) {
            const y_m = y * 1e-3;
            const phase = (Math.PI * d_m * y_m) / (lam_m * D_m);
            const I = 4 * (p.I0 || 50) * Math.pow(Math.cos(phase), 2);
            pts.push({ x: y, y: I });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const lam_m = (p.wavelength || 550) * 1e-9;
      const d_m = (p.d || 0.4) * 1e-3;
      const D_m = p.D || 1.5;
      const probeY_mm = p.probeY ?? 2.06;
      const probeY_m = probeY_mm * 1e-3;

      const beta_m = (lam_m * D_m) / d_m;
      const beta_mm = beta_m * 1000;
      const I_max = 4 * (p.I0 || 50);
      const angularFringeWidth_rad = lam_m / d_m;
      const angularFringeWidth_mrad = angularFringeWidth_rad * 1000;

      // Optical Path difference at probe point P
      const pathDiff_m = (probeY_m * d_m) / D_m;
      const pathDiff_nm = pathDiff_m * 1e9;
      const pathDiff_inLambda = pathDiff_m / lam_m;

      // Phase difference at probe point P
      const phaseDiff_rad = (2 * Math.PI * pathDiff_m) / lam_m;
      const phaseDiff_deg = ((phaseDiff_rad % (2 * Math.PI)) * (180 / Math.PI) + 360) % 360;

      // Intensity at probe point P
      const intensity_P = 4 * (p.I0 || 50) * Math.pow(Math.cos(phaseDiff_rad / 2), 2);

      // State determination
      const roundedN = Math.round(pathDiff_inLambda);
      const isNearBright = Math.abs(pathDiff_inLambda - roundedN) < 0.08;
      const isNearDark = Math.abs(Math.abs(pathDiff_inLambda) - (Math.floor(Math.abs(pathDiff_inLambda)) + 0.5)) < 0.08;

      let stateText = 'Intermediate';
      if (isNearBright) stateText = `Bright Maxima (n = ${roundedN})`;
      else if (isNearDark) stateText = `Dark Minima`;

      return [
        { label: 'Fringe Width (β)', symbol: '\\beta', unit: 'mm', value: beta_mm, formatted: `${beta_mm.toFixed(3)} mm`, color: '#4ade80' },
        { label: 'Max Intensity (I_max)', symbol: 'I_{\\max}', unit: 'W/m²', value: I_max, formatted: `${I_max.toFixed(0)} W/m²`, color: '#f59e0b' },
        { label: 'Path Difference at P', symbol: '\\Delta x', unit: 'nm', value: pathDiff_nm, formatted: `${pathDiff_nm.toFixed(1)} nm (${pathDiff_inLambda.toFixed(2)}λ)`, color: '#38bdf8' },
        { label: 'Phase Shift at P', symbol: '\\Delta\\phi', unit: '°', value: phaseDiff_deg, formatted: `${phaseDiff_deg.toFixed(1)}°`, color: '#a855f7' },
        { label: 'Intensity at Point P', symbol: 'I(y_P)', unit: 'W/m²', value: intensity_P, formatted: `${intensity_P.toFixed(1)} W/m² (${stateText})`, color: '#ec4899' },
        { label: 'Angular Fringe Width', symbol: '\\theta_f', unit: 'mrad', value: angularFringeWidth_mrad, formatted: `${angularFringeWidth_mrad.toFixed(2)} mrad`, color: '#06b6d4' },
      ];
    },
  },

  // 7. EXPERIMENTAL PHYSICS: VERNIER CALIPER
  {
    id: 'vernier-caliper',
    chapterId: 'units-dimensions',
    category: 'experimental',
    topic: 'Vernier Caliper & Least Count',
    title: 'Interactive 3D Vernier Caliper & Zero Errors',
    subtitle: 'Main Scale Division (MSD), Vernier Scale Division (VSD), Least Count & Zero Error corrections',
    badge: 'JEE Experimental Practical',
    simulationType: 'vernier-caliper',
    description:
      'A Vernier Caliper measures internal, external dimensions and depth with precision. Least count is LC = 1 MSD - 1 VSD. True measurement = Main Scale Reading (MSR) + (Vernier Coincidence × LC) - (Zero Error).',
    assumptions: [
      'Standard metric scale where 1 Main Scale Division = 1 mm',
      'n divisions of vernier scale coincide with (n-1) divisions of main scale (default n=10 => LC = 0.1 mm)',
      'Zero error is properly subtracted with sign.',
    ],
    cameraPreset: { position: [0, 4, 12], target: [0, 0, 0] },
    parameters: [
      { id: 'objectSize', label: 'Cylinder Diameter (D)', symbol: 'D', unit: 'mm', min: 2.0, max: 45.0, step: 0.1, defaultVal: 18.4, description: 'Diameter of object placed inside jaws' },
      { id: 'zeroError', label: 'Zero Error (e)', symbol: 'e', unit: 'mm', min: -0.5, max: 0.5, step: 0.1, defaultVal: 0.0, description: '+ve error (vernier 0 to right) or -ve error (to left)' },
      { id: 'vsdCount', label: 'Vernier Divisions (n)', symbol: 'n', unit: 'div', min: 10, max: 50, step: 10, defaultVal: 10, description: 'Number of divisions on Vernier scale matching (n-1) mm' },
      { id: 'uncertainty', label: 'Measurement Uncertainty (±ΔD)', symbol: 'ΔD', unit: 'mm', min: 0.01, max: 0.50, step: 0.01, defaultVal: 0.05, description: 'Experimental error margin and instrumental tolerance (±ΔD)' },
      { id: 'sampleTrials', label: 'Experimental Sample Scatter', symbol: 'N_{pts}', unit: 'pts', min: 1, max: 10, step: 1, defaultVal: 6, description: 'Number of repeated measurement trial points plotted in 3D' },
    ],
    formulas: [
      { name: 'Least Count (LC)', latex: '\\text{LC} = 1\\text{ MSD} - 1\\text{ VSD} = \\frac{1\\text{ MSD}}{n}', explanation: 'Smallest measurable length difference between scales.' },
      { name: 'Observed Reading', latex: '\\text{Observed} = \\text{MSR} + (\\text{VSR} \\times \\text{LC})', explanation: 'Main scale mark before zero + Vernier coincidence * LC.' },
      { name: 'True Measurement', latex: '\\text{True Value} = \\text{Observed Reading} - (\\text{Zero Error})', explanation: 'Correction applied for zero misalignment.' },
      { name: 'Reported Measurement & Error Band', latex: 'D = D_{\\text{true}} \\pm \\Delta D \\implies [D - \\Delta D, D + \\Delta D]', explanation: 'Experimental confidence window with absolute tolerance margin.' },
      { name: 'Percentage Relative Error', latex: '\\% \\text{ Error} = \\left( \\frac{\\Delta D}{D_{\\text{true}}} \\right) \\times 100\\%', explanation: 'Relative precision indicator based on uncertainty.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Positive Zero Error: Vernier 0 is to the RIGHT of Main 0 => Subtract positive error (+e).',
        'Negative Zero Error: Vernier 0 is to the LEFT of Main 0 => Zero error = -(Total VSD - coincidence) * LC. Subtracting negative error ADDS it.',
        'Fractional Least Count: If N VSD = (N-1) MSD, LC = 1 MSD / N.',
      ],
      keyShortcuts: [
        'Percentage Error in volume of cylinder V = π r² L: ΔV/V = 2(Δr/r) + (ΔL/L).',
      ],
      trapAlerts: [
        'Always check if the zero of the Vernier scale is to the left or right of the main scale zero before reading!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Non-standard Vernier: If 20 VSD = 19 MSD where 1 MSD = 0.5 mm, LC = 0.5 mm / 20 = 0.025 mm.',
        'Retrograde Vernier: Where n VSD = (n + 1) MSD.',
      ],
      multiConceptLinks: [
        'Error Propagation in density measurements: ρ = m / (π (d/2)² h) => Δρ/ρ = Δm/m + 2(Δd/d) + Δh/h.',
      ],
      calculusFormulations: [
        'Significant Figures rules in multiplication and addition of experimental measurements.',
      ],
      advancedPitfalls: [
        'In calculating negative zero error, do NOT multiply directly by vernier index without subtracting from total divisions!',
      ],
    },
    questions: [
      {
        id: 'q-vern-1',
        type: 'numerical',
        difficulty: 'JEE Main',
        question: 'A vernier caliper has 1 MSD = 1 mm. 10 divisions on vernier scale coincide with 9 divisions of main scale. While measuring a sphere, main scale shows 3.1 cm and 6th vernier division coincides. If zero error is +0.02 cm, the true diameter in cm is:',
        numericalAnswer: 3.14,
        tolerance: 0.01,
        explanation: 'LC = 1 mm / 10 = 0.1 mm = 0.01 cm. Observed reading = MSR + (VSR * LC) = 3.1 cm + (6 * 0.01 cm) = 3.16 cm. True reading = Observed - Zero Error = 3.16 - (+0.02) = 3.14 cm.',
        formulaUsed: '\\text{True} = \\text{MSR} + (\\text{VSR} \\times \\text{LC}) - \\text{Error}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const msUnit = 1.0; // 1 mm
      const lc = msUnit / p.vsdCount;
      const apparentPos = p.objectSize + p.zeroError;
      const msr = Math.floor(apparentPos / msUnit) * msUnit;
      const remainder = apparentPos - msr;
      const vsr = Math.round(remainder / lc);
      const measuredObs = msr + vsr * lc;
      const corrected = measuredObs - p.zeroError;
      const deltaX = p.uncertainty ?? 0.05;
      const relErrorPct = (deltaX / Math.max(0.1, corrected)) * 100;

      return [
        { label: 'Least Count', symbol: 'LC', unit: 'mm', value: lc, formatted: `${lc.toFixed(3)} mm`, color: '#38bdf8' },
        { label: 'Main Scale Reading', symbol: 'MSR', unit: 'mm', value: msr, formatted: `${msr.toFixed(1)} mm`, color: '#4ade80' },
        { label: 'Vernier Coincidence', symbol: 'VSR', unit: 'div', value: vsr, formatted: `${vsr}`, color: '#f59e0b' },
        { label: 'Corrected Diameter', symbol: 'D_{true}', unit: 'mm', value: corrected, formatted: `${corrected.toFixed(2)} mm`, color: '#a855f7' },
        { label: 'Error Margin (±ΔD)', symbol: '±ΔD', unit: 'mm', value: deltaX, formatted: `±${deltaX.toFixed(2)} mm`, color: '#ec4899' },
        { label: 'Confidence Interval', symbol: '[D_{min}, D_{max}]', unit: 'mm', value: deltaX, formatted: `[${(corrected - deltaX).toFixed(2)}, ${(corrected + deltaX).toFixed(2)}] mm`, color: '#06b6d4' },
        { label: 'Relative Uncertainty', symbol: 'ΔD/D', unit: '%', value: relErrorPct, formatted: `±${relErrorPct.toFixed(2)}%`, color: '#eab308' },
      ];
    },
  },

  // 8. BOHR ATOM & HYDROGEN SPECTRUM
  {
    id: 'bohr-atom-spectrum',
    chapterId: 'modern-physics',
    category: 'modern',
    topic: 'Bohr Hydrogen Atom & Spectral Lines',
    title: 'Bohr Hydrogen Energy Levels & Spectral Transitions',
    subtitle: 'Quantized orbits r_n = n²r₁, energy levels E_n = -13.6/n² eV & Lyman, Balmer, Paschen photons',
    badge: 'Modern Physics High Yield',
    simulationType: 'bohr-atom-spectrum',
    description:
      'Bohr model postulates quantized orbital angular momentum L = n(h/2π). Electrons occupy stable orbits without radiating. Photon of energy hν = E_i - E_f is emitted when an electron jumps from a higher orbit n_i to a lower orbit n_f.',
    assumptions: [
      'Single electron hydrogen-like system (Z = atomic number)',
      'Circular orbits with infinite nucleus mass approximation',
      'Quantized angular momentum L = n ħ',
    ],
    cameraPreset: { position: [0, 8, 14], target: [0, 0, 0] },
    parameters: [
      { id: 'Z', label: 'Atomic Number (Z)', symbol: 'Z', unit: '', min: 1, max: 4, step: 1, defaultVal: 1, description: '1 for H, 2 for He+, 3 for Li++, 4 for Be+++' },
      { id: 'n_initial', label: 'Initial Orbit (nᵢ)', symbol: 'n_i', unit: '', min: 2, max: 6, step: 1, defaultVal: 3, description: 'Higher initial principal quantum state' },
      { id: 'n_final', label: 'Final Orbit (n_f)', symbol: 'n_f', unit: '', min: 1, max: 5, step: 1, defaultVal: 2, description: 'Lower destination principal quantum state (n_f < n_i)' },
    ],
    formulas: [
      { name: 'Quantized Orbit Radius (r_n)', latex: 'r_n = \\frac{n^2}{Z} a_0 = \\frac{n^2}{Z} (0.529\\text{ \\AA})', explanation: 'Bohr radius scaling with principal quantum number n and atomic number Z.' },
      { name: 'Energy Level (E_n)', latex: 'E_n = -13.6\\frac{Z^2}{n^2}\\text{ eV}', explanation: 'Total bound energy of electron in n-th state.' },
      { name: 'Rydberg Equation (\\lambda)', latex: '\\frac{1}{\\lambda} = R Z^2 \\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)', explanation: 'Wavelength of the emitted spectral photon (R ≈ 1.097 × 10⁷ m⁻¹).' },
      { name: 'Photon Energy', latex: '\\Delta E = h\\nu = \\frac{hc}{\\lambda} = E_i - E_f', explanation: 'Energy carried away by emitted photon (hc ≈ 1240 eV·nm).' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Lyman series (n_f = 1): UV region.',
        'Balmer series (n_f = 2): Visible spectrum (H-alpha = 656.3 nm Red from n=3->2, H-beta = 486.1 nm Cyan from n=4->2).',
        'Paschen series (n_f = 3): Infrared region.',
        'Maximum number of emitted spectral lines from n-th state: N = n(n - 1) / 2.',
      ],
      keyShortcuts: [
        'Shortest wavelength (Series Limit): Put n_i = ∞ => 1/λ_min = R Z² / n_f².',
        'Longest wavelength: Put n_i = n_f + 1.',
        'Ratio of kinetic energy to potential energy: K = -E_n and U = 2E_n.',
      ],
      trapAlerts: [
        'Ionization Energy of ground state is +13.6 Z² eV (positive work needed to free electron to infinity).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Reduced Mass Correction: If nucleus mass M is finite, replace electron mass m with μ = (m M) / (m + M) => Rydberg constant R\' = R (μ / m). Important in Positronium and Muonic hydrogen.',
        'De Broglie wave quantization in orbit: n λ_dB = 2π r_n.',
        'Recoil of hydrogen atom upon photon emission: Momentum conservation p_recoil = h/λ => Recoil kinetic energy E_recoil = p² / (2M).',
      ],
      multiConceptLinks: [
        'Photoelectric effect threshold using photons emitted from Bohr atom transitions.',
      ],
      calculusFormulations: [
        'Orbital magnetic dipole moment: μ_L = -(e / 2m) L = -n μ_B (Bohr magneton μ_B = eħ / 2m).',
      ],
      advancedPitfalls: [
        'Total angular momentum of orbital motion is strictly quantized in integer multiples of h/(2π).',
      ],
    },
    questions: [
      {
        id: 'q-bohr-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'The wavelength of the first line of the Balmer series in Hydrogen (n=3 to n=2) is λ₀ = 656.3 nm. What is the wavelength of the first line of Lyman series (n=2 to n=1)?',
        options: ['(5/27) λ₀ ≈ 121.5 nm', '(27/5) λ₀', '(3/4) λ₀', '(4/3) λ₀'],
        correctAnswer: 0,
        explanation: 'For Balmer 1st line: 1/λ₀ = R(1/4 - 1/9) = 5R/36 => R = 36 / (5 λ₀). For Lyman 1st line: 1/λ_L = R(1/1 - 1/4) = 3R/4 = 3/4 * (36 / 5 λ₀) = 27 / (5 λ₀) => λ_L = (5/27) λ₀ ≈ 121.5 nm.',
        formulaUsed: '\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)',
      },
    ],
    graphConfigs: [
      {
        id: 'energy-levels',
        title: 'Energy Levels E_n (eV)',
        xLabel: 'Quantum Number n',
        yLabel: 'Energy E_n',
        xUnit: '',
        yUnit: 'eV',
        color: '#f43f5e',
        type: 'distribution',
        calc: (p) => {
          const pts = [];
          for (let n = 1; n <= 6; n++) {
            const E = (-13.6 * p.Z * p.Z) / (n * n);
            pts.push({ x: n, y: E });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const nf = Math.min(p.n_initial - 1, p.n_final);
      const ni = Math.max(nf + 1, p.n_initial);
      const E_i = (-13.6 * p.Z * p.Z) / (ni * ni);
      const E_f = (-13.6 * p.Z * p.Z) / (nf * nf);
      const deltaE = E_i - E_f;
      const lam_nm = 1240 / deltaE;
      const r_i_pm = (0.529 * ni * ni * 100) / p.Z;
      const r_f_pm = (0.529 * nf * nf * 100) / p.Z;

      let seriesName = 'Lyman (UV)';
      if (nf === 2) seriesName = 'Balmer (Visible)';
      else if (nf === 3) seriesName = 'Paschen (Infrared)';
      else if (nf === 4) seriesName = 'Brackett (IR)';
      else if (nf >= 5) seriesName = 'Pfund (Far IR)';

      return [
        { label: 'Transition Series', symbol: 'Series', unit: '', value: nf, formatted: `${seriesName} (n=${ni} → n=${nf})`, color: '#4ade80' },
        { label: 'Photon Energy (ΔE)', symbol: 'h\\nu', unit: 'eV', value: deltaE, formatted: `${deltaE.toFixed(2)} eV`, color: '#f59e0b' },
        { label: 'Photon Wavelength', symbol: '\\lambda', unit: 'nm', value: lam_nm, formatted: `${lam_nm.toFixed(1)} nm`, color: '#38bdf8' },
        { label: 'Orbit Radius Change', symbol: 'r_i \\to r_f', unit: 'pm', value: r_f_pm, formatted: `${r_i_pm.toFixed(1)} → ${r_f_pm.toFixed(1)} pm`, color: '#a855f7' },
      ];
    },
  },
];
