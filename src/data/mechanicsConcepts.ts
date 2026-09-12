import { PhysicsConcept } from '../types';

export const MECHANICS_CONCEPTS: PhysicsConcept[] = [
  // 1. WORK, ENERGY, POWER & COLLISIONS
  {
    id: 'work-energy-collisions',
    chapterId: 'work-energy-power',
    category: 'mechanics',
    topic: 'Work, Energy & Collisions',
    title: '1D/2D Collisions, Restitution & Work-Energy Theorem',
    subtitle: 'Momentum conservation, Coefficient of restitution e, Kinetic energy loss & Spring buffer dynamics',
    badge: 'Core Mechanics',
    simulationType: 'work-energy-collisions',
    description:
      'In any isolated system of colliding bodies, net linear momentum is strictly conserved along the line of impact. The coefficient of restitution e = (v2 - v1)/(u1 - u2) governs energy conservation: e = 1 for perfectly elastic collisions (ΔK = 0), 0 < e < 1 for inelastic collisions, and e = 0 for perfectly plastic collisions where bodies stick together with maximum kinetic energy dissipation.',
    assumptions: [
      'Isolated two-body system with zero external friction along horizontal track',
      'Contact forces during collision act strictly along line of centers (normal impact)',
      'Internal structural deformation modeled with restitution coefficient e and spring buffer stiffness k',
    ],
    cameraPreset: { position: [0, 8, 16], target: [0, 0, 0] },
    parameters: [
      { id: 'm1', label: 'Glider 1 Mass (m₁)', symbol: 'm_1', unit: 'kg', min: 1, max: 10, step: 0.5, defaultVal: 2, description: 'Mass of the primary impact glider' },
      { id: 'm2', label: 'Glider 2 Mass (m₂)', symbol: 'm_2', unit: 'kg', min: 1, max: 10, step: 0.5, defaultVal: 3, description: 'Mass of the target glider' },
      { id: 'u1', label: 'Initial Velocity 1 (u₁)', symbol: 'u_1', unit: 'm/s', min: 1, max: 15, step: 0.5, defaultVal: 6, description: 'Speed of Glider 1 approaching Glider 2' },
      { id: 'u2', label: 'Initial Velocity 2 (u₂)', symbol: 'u_2', unit: 'm/s', min: -10, max: 5, step: 0.5, defaultVal: -2, description: 'Speed of Glider 2 (+ve in same direction, -ve opposite)' },
      { id: 'e', label: 'Restitution Coefficient (e)', symbol: 'e', unit: '', min: 0, max: 1, step: 0.05, defaultVal: 0.8, description: '1.0: Elastic, 0.0: Perfectly Inelastic, 0<e<1: Inelastic' },
      { id: 'kBuffer', label: 'Spring Buffer Stiffness (k)', symbol: 'k', unit: 'N/m', min: 100, max: 2000, step: 50, defaultVal: 600, description: 'Stiffness of elastic bumper spring absorbing collision energy' },
    ],
    formulas: [
      { name: 'Conservation of Linear Momentum', latex: 'm_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2', explanation: 'Holds unconditionally for all collision types in the absence of net external impulses.' },
      { name: "Newton's Restitution Law", latex: 'e = \\frac{v_2 - v_1}{u_1 - u_2} = \\frac{\\text{Velocity of Separation}}{\\text{Velocity of Approach}}', explanation: 'Empirical kinematic ratio connecting relative speeds before and after impact.' },
      { name: 'Post-Collision Velocities', latex: 'v_1 = \\frac{(m_1 - e m_2)u_1 + (1+e)m_2 u_2}{m_1 + m_2}, \\quad v_2 = \\frac{(m_2 - e m_1)u_2 + (1+e)m_1 u_1}{m_1 + m_2}', explanation: 'General closed-form solutions for arbitrary restitution e.' },
      { name: 'Kinetic Energy Loss', latex: '\\Delta K = \\frac{1}{2} \\frac{m_1 m_2}{m_1 + m_2} (1 - e^2)(u_1 - u_2)^2 = \\frac{1}{2}\\mu (1 - e^2) u_{rel}^2', explanation: 'Mechanical energy converted to internal heat and acoustic deformation energy.' },
      { name: 'Maximum Spring Buffer Compression', latex: 'x_{max} = \\sqrt{\\frac{\\mu u_{rel}^2}{k}} = \\sqrt{\\frac{m_1 m_2 (u_1 - u_2)^2}{k (m_1 + m_2)}}', explanation: 'Occurs at the instant both bodies share common center-of-mass velocity v_cm.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Equal masses in elastic collision (m1 = m2, e = 1): Gliders completely exchange their velocities (v1 = u2, v2 = u1).',
        'Target initially at rest (u2 = 0): If m1 << m2 (light bullet hitting heavy wall), v1 ≈ -u1 (rebounds) and v2 ≈ 0.',
        'Target initially at rest (u2 = 0): If m1 >> m2 (heavy truck hitting light ping-pong ball), v1 ≈ u1 and v2 ≈ 2 u1.',
        'Fractional kinetic energy transferred in elastic collision: ΔK_loss/K1 = 4 m1 m2 / (m1 + m2)², reaching 100% when m1 = m2.',
      ],
      keyShortcuts: [
        'Center-of-mass frame shortcut: Velocity of Glider 1 in COM frame is u1* = u1 - v_cm. After impact, v1* = -e · u1*.',
        'Reduced mass μ = m1·m2/(m1 + m2) simplifies total internal kinetic energy: K_int = (1/2) μ (u1 - u2)²',
      ],
      trapAlerts: [
        'Never equate initial kinetic energy to final kinetic energy unless the problem explicitly specifies e = 1 (elastic collision).',
        'Restitution formula applies ONLY along the normal line of contact (common normal), NOT along the tangential line.',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Variable Mass & Impulse Integration: ∫ N(t) dt = J = m1(u1 - v1) = m2(v2 - u2). During contact, normal force peaks at maximum deformation.',
        'Oblique 2D Collision: Resolving velocities into common normal n̂ and common tangent t̂. Tangential components remain unchanged if friction is zero.',
        'Collision with Restrained Rigid Bodies: Linear momentum may NOT be conserved if hinge reaction exerts external impulse, but Angular Momentum about the hinge axis is conserved.',
      ],
      multiConceptLinks: [
        'Vertical Circular Loop + Collision: Mass dropped from height colliding with pendulum bob at bottom.',
        'Spring-Block Oscillation: Two blocks colliding and compressing a spring on a frictionless floor execute SHM with reduced mass μ.',
      ],
      calculusFormulations: [
        'Deformation phase impulse J_d and restitution phase impulse J_r: e = J_r / J_d.',
        'Energy balance with spring buffer: (1/2) m1 u1² + (1/2) m2 u2² = (1/2)(m1 + m2) v_{cm}² + (1/2) k x(t)² + K_{rel}(t).',
      ],
      advancedPitfalls: [
        'Assuming kinetic energy is minimum after collision: Minimum kinetic energy occurs AT THE INSTANT OF MAXIMUM COMPRESSION during the collision, not at t = ∞.',
      ],
    },
    questions: [
      {
        id: 'q-we-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A body of mass m moving with velocity u collides head-on elastically (e = 1) with another stationary body of mass 2m. What fraction of the initial kinetic energy is retained by the incident body of mass m?',
        options: ['1/9', '8/9', '1/3', '4/9'],
        correctAnswer: 0,
        explanation:
          'Using v1 = [(m - 2m)/(m + 2m)] u = (-m/3m) u = -u/3. The final kinetic energy is K1_final = (1/2) m (-u/3)² = (1/9) · (1/2 m u²). Thus exactly 1/9 of initial kinetic energy is retained.',
        formulaUsed: 'v_1 = \\frac{m_1 - m_2}{m_1 + m_2} u_1',
      },
      {
        id: 'q-we-2',
        type: 'numerical',
        difficulty: 'JEE Advanced',
        question:
          'Two blocks of masses m1 = 2 kg and m2 = 3 kg move towards each other at speeds u1 = 5 m/s and u2 = -5 m/s. An ideal spring of stiffness k = 600 N/m is attached between them. What is the maximum compression of the spring (in cm) during the collision?',
        numericalAnswer: 20,
        tolerance: 0.5,
        explanation:
          'Relative velocity u_rel = 5 - (-5) = 10 m/s. Reduced mass μ = (2 × 3)/(2 + 3) = 1.2 kg. At maximum compression, all relative kinetic energy is converted into elastic spring energy: (1/2) k x_max² = (1/2) μ u_rel² => 600 x_max² = 1.2 × (10)² = 120 => x_max² = 120/600 = 0.20 => x_max = √0.04 = 0.20 m = 20 cm.',
        formulaUsed: 'x_{max} = \\sqrt{\\frac{\\mu u_{rel}^2}{k}}',
      },
    ],
    graphConfigs: [
      {
        id: 'energy-vs-e',
        title: 'Kinetic Energy Loss vs Restitution (e)',
        xLabel: 'Restitution Coefficient (e)',
        yLabel: 'Energy Loss ΔK',
        xUnit: '',
        yUnit: 'Joules',
        color: '#f43f5e',
        type: 'parametric',
        calc: (p) => {
          const m1 = p.m1 || 2;
          const m2 = p.m2 || 3;
          const u1 = p.u1 || 6;
          const u2 = p.u2 || -2;
          const mu = (m1 * m2) / (m1 + m2);
          const urel = Math.abs(u1 - u2);
          const pts = [];
          for (let eVal = 0; eVal <= 1.0; eVal += 0.05) {
            const loss = 0.5 * mu * (1 - eVal * eVal) * (urel * urel);
            pts.push({ x: eVal, y: loss });
          }
          return pts;
        },
      },
      {
        id: 'v1-v2-restitution',
        title: 'Final Velocities vs Restitution (e)',
        xLabel: 'Restitution (e)',
        yLabel: 'Final Speed v₂',
        xUnit: '',
        yUnit: 'm/s',
        color: '#38bdf8',
        type: 'parametric',
        calc: (p) => {
          const m1 = p.m1 || 2;
          const m2 = p.m2 || 3;
          const u1 = p.u1 || 6;
          const u2 = p.u2 || -2;
          const pts = [];
          for (let eVal = 0; eVal <= 1.0; eVal += 0.05) {
            const v2 = ((m2 - eVal * m1) * u2 + (1 + eVal) * m1 * u1) / (m1 + m2);
            pts.push({ x: eVal, y: v2 });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const m1 = p.m1 || 2;
      const m2 = p.m2 || 3;
      const u1 = p.u1 || 6;
      const u2 = p.u2 || -2;
      const e = p.e !== undefined ? p.e : 0.8;
      const k = p.kBuffer || 600;

      const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
      const v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);
      const vcm = (m1 * u1 + m2 * u2) / (m1 + m2);
      const mu = (m1 * m2) / (m1 + m2);
      const urel = Math.abs(u1 - u2);
      const deltaK = 0.5 * mu * (1 - e * e) * (urel * urel);
      const xmax = Math.sqrt((mu * urel * urel) / k);
      const kInit = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
      const kFinal = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;

      return [
        { label: 'Glider 1 Final Speed', symbol: 'v_1', unit: 'm/s', value: v1, formatted: `${v1.toFixed(2)} m/s`, color: '#38bdf8' },
        { label: 'Glider 2 Final Speed', symbol: 'v_2', unit: 'm/s', value: v2, formatted: `${v2.toFixed(2)} m/s`, color: '#f59e0b' },
        { label: 'Center of Mass Velocity', symbol: 'v_{cm}', unit: 'm/s', value: vcm, formatted: `${vcm.toFixed(2)} m/s`, color: '#a855f7' },
        { label: 'Kinetic Energy Loss', symbol: 'ΔK', unit: 'J', value: deltaK, formatted: `${deltaK.toFixed(1)} J`, color: '#ef4444' },
        { label: 'Total Initial Energy', symbol: 'K_{init}', unit: 'J', value: kInit, formatted: `${kInit.toFixed(1)} J`, color: '#10b981' },
        { label: 'Max Spring Compression', symbol: 'x_{max}', unit: 'cm', value: xmax * 100, formatted: `${(xmax * 100).toFixed(1)} cm`, color: '#eab308' },
      ];
    },
  },

  // 2. NEWTON'S LAWS & PSEUDO-FORCES (ATWOOD MACHINE & ELEVATOR)
  {
    id: 'newton-laws-pulley',
    chapterId: 'laws-of-motion',
    category: 'mechanics',
    topic: "Newton's Laws & Pseudo-Forces",
    title: 'Atwood Pulley Machine & Accelerating Elevator Frame',
    subtitle: "Inertial vs Non-inertial frames, Pseudo-force -m·a_frame, Cable tension & Apparent weight",
    badge: 'Core Mechanics',
    simulationType: 'newton-laws-pulley',
    description:
      'In an accelerating reference frame (such as an elevator with vertical acceleration a_frame), Newton’s second law holds only when an inertial pseudo-force F_pseudo = -m·a_frame is applied opposite to the frame acceleration. For an Atwood machine suspended from the ceiling of the accelerating elevator, the effective gravitational field becomes g_eff = g + a_frame (upward acceleration increases effective weight; free-fall a_frame = -g produces zero tension and weightlessness).',
    assumptions: [
      'Ideal massless, frictionless pulley with inextensible cord of constant length',
      'One-dimensional vertical motion along elevator axis with uniform cabin acceleration a_frame',
      'Air resistance is negligible',
    ],
    cameraPreset: { position: [0, 5, 14], target: [0, 0, 0] },
    parameters: [
      { id: 'm1', label: 'Left Mass (m₁)', symbol: 'm_1', unit: 'kg', min: 1, max: 15, step: 0.5, defaultVal: 3, description: 'Hanging mass on left side of pulley' },
      { id: 'm2', label: 'Right Mass (m₂)', symbol: 'm_2', unit: 'kg', min: 1, max: 15, step: 0.5, defaultVal: 5, description: 'Hanging mass on right side of pulley' },
      { id: 'aFrame', label: 'Elevator Accel (a_frame)', symbol: 'a_f', unit: 'm/s²', min: -9.8, max: 15, step: 0.5, defaultVal: 2.5, description: '+ve upward, -ve downward (-9.8 for free fall)' },
      { id: 'ropeLength', label: 'Cord Length (L)', symbol: 'L', unit: 'm', min: 4, max: 12, step: 0.5, defaultVal: 8, description: 'Total length of inextensible cable' },
      { id: 'pulleyRadius', label: 'Pulley Radius (R)', symbol: 'R', unit: 'cm', min: 5, max: 30, step: 1, defaultVal: 15, description: 'Radius of overhead grooved pulley wheel' },
    ],
    formulas: [
      { name: 'Effective Gravitational Acceleration', latex: 'g_{eff} = g + a_{frame}', explanation: 'Accounts for the fictitious inertial frame pseudo-force: upward elevator increases effective g.' },
      { name: 'Relative Mass Acceleration', latex: 'a_{rel} = \\frac{|m_2 - m_1|}{m_1 + m_2} g_{eff} = \\frac{m_2 - m_1}{m_1 + m_2}(g + a_{frame})', explanation: 'Acceleration of hanging masses relative to elevator cabin observer.' },
      { name: 'Cable Tension (T)', latex: 'T = \\frac{2 m_1 m_2}{m_1 + m_2} g_{eff} = \\frac{2 m_1 m_2}{m_1 + m_2}(g + a_{frame})', explanation: 'Tension transmitted through inextensible cord under effective gravity.' },
      { name: 'Apparent Weight of Elevator Floor Observer', latex: 'W_{app} = m(g + a_{frame})', explanation: 'Normal contact force recorded by weighing scale on cabin floor.' },
      { name: 'Support Clamp Reaction Force', latex: 'F_{clamp} = 2 T + m_{pulley}(g + a_{frame})', explanation: 'Total downward pull exerted on the ceiling suspension anchor.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Free-fall elevator (a_frame = -g): Effective gravity g_eff = 0, cable tension T = 0, and masses do not accelerate relative to each other (weightlessness).',
        'Equal masses (m1 = m2 = m): Relative acceleration a_rel = 0, tension T = m(g + a_frame), system remains balanced.',
        'If one mass is released or string breaks: Tension drops to zero instantaneously, and both masses fall under gravity.',
      ],
      keyShortcuts: [
        'Replace real gravity g with g_eff = g + a_frame in all standard Atwood formulas without recalculating full Free Body Diagrams.',
        'Acceleration of center of mass: a_cm = [(m2 - m1)/(m1 + m2)]² · g_eff downward.',
      ],
      trapAlerts: [
        'In an upward accelerating lift, students often subtract a_frame instead of adding it. Always remember F_pseudo = -m a_frame points DOWNWARD when elevator accelerates UPWARD.',
        'Do not forget factor of 2 in tension formula: T = 2 m1 m2 g_eff / (m1 + m2), NOT m1 m2 g_eff / (m1 + m2).',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Massive Pulley (Moment of Inertia I = (1/2) M R²): Tensions on the two sides are unequal (T2 - T1 = I α / R). Relative acceleration becomes a_rel = (m2 - m1) g_eff / (m1 + m2 + I/R²).',
        'Movable Pulley Systems: Degree of freedom constraints Σ T_i · x_i = 0 => virtual work method for complex rope loops.',
        'Non-inertial Frame Equilibrium: Condition for a pendulum suspended from the elevator ceiling to hang at an angle θ when elevator has both horizontal and vertical accelerations: tan θ = a_x / (g + a_y).',
      ],
      multiConceptLinks: [
        'SHM in Accelerating Elevator: Time period of simple pendulum T = 2π√(L / g_eff). In free fall, T -> ∞.',
        'Buoyancy in Accelerating Frame: Floating block experiences buoyant force F_b = V_sub ρ_f (g + a_frame). Fraction submerged remains invariant!',
      ],
      calculusFormulations: [
        'Cord with distributed mass density λ: T(y) = T_0 + λ y (g + a_frame - a_rel).',
        'Time-varying frame acceleration a(t): v_{rel}(t) = ∫ a_{rel}(t) dt.',
      ],
      advancedPitfalls: [
        'Assuming scale reading is m g: In an accelerating cabin, spring scales measure tension T, while platform scales measure normal reaction N = m g_eff.',
      ],
    },
    questions: [
      {
        id: 'q-nl-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'An Atwood machine with masses m1 = 2 kg and m2 = 3 kg is inside an elevator accelerating upwards with a = 2.2 m/s² (take g = 9.8 m/s²). What is the tension in the cable?',
        options: ['28.8 N', '24.0 N', '19.2 N', '32.4 N'],
        correctAnswer: 0,
        explanation:
          'Effective gravity g_eff = g + a = 9.8 + 2.2 = 12.0 m/s². Tension T = 2 m1 m2 g_eff / (m1 + m2) = 2 × 2 × 3 × 12.0 / (2 + 3) = 144 / 5 = 28.8 N.',
        formulaUsed: 'T = \\frac{2 m_1 m_2}{m_1 + m_2}(g + a)',
      },
      {
        id: 'q-nl-2',
        type: 'numerical',
        difficulty: 'JEE Advanced',
        question:
          'In an Atwood machine, m1 = 4 kg and m2 = 6 kg. If the elevator cable snaps and the elevator falls freely under gravity (a_frame = -g), what is the relative acceleration between m1 and m2 in m/s²?',
        numericalAnswer: 0,
        tolerance: 0.01,
        explanation:
          'Under free fall, g_eff = g + (-g) = 0. Relative acceleration a_rel = [(m2 - m1)/(m1 + m2)] × g_eff = (2/10) × 0 = 0 m/s². The masses maintain their instantaneous relative positions or velocities.',
        formulaUsed: 'a_{rel} = \\frac{m_2 - m_1}{m_1 + m_2} g_{eff}',
      },
    ],
    graphConfigs: [
      {
        id: 'tension-vs-aframe',
        title: 'Cable Tension vs Elevator Acceleration (a_frame)',
        xLabel: 'Elevator Acceleration (a_frame)',
        yLabel: 'Cable Tension (T)',
        xUnit: 'm/s²',
        yUnit: 'N',
        color: '#06b6d4',
        type: 'parametric',
        calc: (p) => {
          const m1 = p.m1 || 3;
          const m2 = p.m2 || 5;
          const pts = [];
          for (let af = -9.8; af <= 15; af += 0.5) {
            const geff = Math.max(0, 9.8 + af);
            const T = (2 * m1 * m2 * geff) / (m1 + m2);
            pts.push({ x: af, y: T });
          }
          return pts;
        },
      },
      {
        id: 'arel-vs-m2',
        title: 'Relative Acceleration vs Mass Ratio (m₂ / m₁)',
        xLabel: 'Mass Ratio (m₂ / m₁)',
        yLabel: 'Relative Acceleration (a_rel)',
        xUnit: '',
        yUnit: 'm/s²',
        color: '#10b981',
        type: 'parametric',
        calc: (p) => {
          const m1 = p.m1 || 3;
          const geff = 9.8 + (p.aFrame || 2.5);
          const pts = [];
          for (let ratio = 1.0; ratio <= 6.0; ratio += 0.2) {
            const arel = ((ratio - 1) / (ratio + 1)) * geff;
            pts.push({ x: ratio, y: arel });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const m1 = p.m1 || 3;
      const m2 = p.m2 || 5;
      const af = p.aFrame !== undefined ? p.aFrame : 2.5;
      const geff = Math.max(0, 9.8 + af);
      const arel = (Math.abs(m2 - m1) * geff) / (m1 + m2);
      const T = (2 * m1 * m2 * geff) / (m1 + m2);
      const wApp = m2 * geff;
      const fPseudo = m2 * Math.abs(af);
      const acm = Math.pow((m2 - m1) / (m1 + m2), 2) * geff;

      return [
        { label: 'Effective Gravity', symbol: 'g_{eff}', unit: 'm/s²', value: geff, formatted: `${geff.toFixed(2)} m/s²`, color: '#38bdf8' },
        { label: 'Relative Accel', symbol: 'a_{rel}', unit: 'm/s²', value: arel, formatted: `${arel.toFixed(2)} m/s²`, color: '#10b981' },
        { label: 'Cable Tension', symbol: 'T', unit: 'N', value: T, formatted: `${T.toFixed(1)} N`, color: '#06b6d4' },
        { label: 'Apparent Weight m₂', symbol: 'W_{app}', unit: 'N', value: wApp, formatted: `${wApp.toFixed(1)} N`, color: '#eab308' },
        { label: 'Pseudo Force on m₂', symbol: 'F_{pseudo}', unit: 'N', value: fPseudo, formatted: `${fPseudo.toFixed(1)} N`, color: '#f43f5e' },
        { label: 'COM Acceleration', symbol: 'a_{cm}', unit: 'm/s²', value: acm, formatted: `${acm.toFixed(2)} m/s²`, color: '#a855f7' },
      ];
    },
  },

  // 3. RELATIVE MOTION, RIVER-BOAT & RAIN-MAN DYNAMICS
  {
    id: 'relative-motion-kinematics',
    chapterId: 'kinematics',
    category: 'mechanics',
    topic: 'Relative Motion & Kinematics Pursuit',
    title: 'River-Boat Crossing, Drift & Rain-Man Relative Kinematics',
    subtitle: 'Shortest path vs Shortest time crossing, Drift minimization & Umbrella tilt angle in 3D',
    badge: 'Core Mechanics',
    simulationType: 'relative-motion-kinematics',
    description:
      'Relative motion relates the kinematic state of an object observed from a moving reference frame to that from the laboratory frame: v_{A/B} = v_A - v_B. For a boat navigating across a flowing river, the resultant ground velocity is v_{ground} = v_{b/r} + v_{river}. Shortest crossing time occurs when the boat heads perpendicular to the banks (θ = 90°), resulting in downstream drift. Shortest path (zero drift) is achieved when sin θ = v_river / v_boat (possible only if v_boat > v_river). For a walking pedestrian, the relative velocity of falling raindrops dictates the required umbrella orientation angle.',
    assumptions: [
      'Uniform steady river current with parallel straight banks of width W',
      'Engine imparts constant boat speed v_b relative to the flowing water',
      'Raindrops fall with terminal velocity v_ry in still air and horizontal wind drift v_rx',
    ],
    cameraPreset: { position: [0, 18, 24], target: [0, 0, 0] },
    parameters: [
      { id: 'vBoat', label: 'Boat Speed in Water (v_b)', symbol: 'v_b', unit: 'm/s', min: 2, max: 20, step: 0.5, defaultVal: 10, description: 'Speed of boat engine relative to water' },
      { id: 'vRiver', label: 'River Flow Speed (v_r)', symbol: 'v_r', unit: 'm/s', min: 1, max: 15, step: 0.5, defaultVal: 4, description: 'Uniform downstream river flow velocity' },
      { id: 'theta', label: 'Boat Steering Angle (θ)', symbol: 'θ', unit: 'deg', min: 30, max: 150, step: 1, defaultVal: 115, description: 'Heading angle measured from downstream bank (90° = direct across)' },
      { id: 'width', label: 'River Width (W)', symbol: 'W', unit: 'm', min: 50, max: 300, step: 10, defaultVal: 120, description: 'Perpendicular distance between parallel river banks' },
      { id: 'vMan', label: 'Man Walking Speed (v_m)', symbol: 'v_m', unit: 'm/s', min: 0, max: 10, step: 0.5, defaultVal: 3, description: 'Speed of pedestrian walking along the bank' },
      { id: 'vRainX', label: 'Rain Wind Velocity (v_rx)', symbol: 'v_{rx}', unit: 'm/s', min: -10, max: 10, step: 0.5, defaultVal: 2, description: 'Horizontal wind drift velocity of falling rain' },
      { id: 'vRainY', label: 'Rain Vertical Speed (|v_ry|)', symbol: '|v_{ry}|', unit: 'm/s', min: 4, max: 20, step: 0.5, defaultVal: 8, description: 'Downward vertical terminal velocity of raindrops' },
    ],
    formulas: [
      { name: 'Resultant Boat Velocity wrt Ground', latex: '\\vec{v}_{ground} = (v_r + v_b\\cos\\theta)\\hat{i} + (v_b\\sin\\theta)\\hat{j}', explanation: 'Vector addition of water flow and engine speed.' },
      { name: 'River Crossing Time', latex: 't = \\frac{W}{v_b \\sin\\theta}', explanation: 'Independent of river flow velocity v_r; minimized when θ = 90° (t_{min} = W / v_b).' },
      { name: 'Downstream Drift (x)', latex: 'x = (v_r + v_b \\cos\\theta) t = (v_r + v_b \\cos\\theta) \\frac{W}{v_b \\sin\\theta}', explanation: 'Net displacement along the river bank during crossing.' },
      { name: 'Condition for Zero Drift (Shortest Path)', latex: '\\sin\\alpha = \\frac{v_r}{v_b} \\implies \\cos\\theta = -\\frac{v_r}{v_b} \\quad (v_b > v_r)', explanation: 'Boat must head upstream at angle α from the normal (θ = 90° + α).' },
      { name: 'Rain-Man Relative Velocity & Umbrella Angle', latex: '\\tan\\phi = \\frac{v_{rx} - v_m}{|v_{ry}|}', explanation: 'Optimal tilt angle of umbrella measured from vertical to block rain.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Shortest Time: Heading angle is always θ = 90° regardless of river speed, yielding minimum time t_min = W / v_b and drift x = v_r · (W / v_b).',
        'Shortest Path: If v_b > v_r, drift x = 0 with time t = W / √(v_b² - v_r²). If v_b < v_r, zero drift is impossible, and minimum drift is x_min = W · √((v_r/v_b)² - 1).',
        'Rain-Man Problem: When walking, rain appears to slant more towards the pedestrian. If rain falls vertically, tan φ = v_man / v_rain.',
      ],
      keyShortcuts: [
        'Minimum drift when v_b < v_r occurs when cos α = v_b / v_r, where α is the angle from downstream.',
        'Relative approach of two particles A and B: v_{app} = - d/dt |r_A - r_B|.',
      ],
      trapAlerts: [
        'Do NOT mix up heading angle θ (with respect to downstream bank) and upstream angle α (with respect to perpendicular line across river).',
        'In the rain-man problem, remember the umbrella must be pointed OPPOSITE to relative rain velocity vector.',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Four-Dog Pursuit Problem: N particles at vertices of regular N-gon moving with constant speed v toward adjacent particle collide at center in time t = d / [v(1 - cos(2π/N))].',
        'Aircraft Wind Navigation: Airplane navigating wind triangle with crosswinds and head/tail winds to reach a target coordinate.',
        'Variable Current Velocity Profile: River velocity profile v_r(y) = v_0 · 4y(W - y)/W²; crossing path requires integration x = ∫ (v_r(y) / v_y) dy.',
      ],
      multiConceptLinks: [
        'Projectile in Moving Frame: Projectile fired from a flatcar moving with acceleration a; trajectory in ground frame vs flatcar frame.',
        'Doppler Effect + Relative Motion: Acoustic frequency received depends strictly on velocities along line of sight connecting source and observer.',
      ],
      calculusFormulations: [
        'Trajectory equation: dy/dx = v_y / v_x = (v_b sin θ) / (v_r(y) + v_b cos θ).',
        'Shortest distance of approach between 2 non-intersecting trajectories: d_{min} = |r_{rel} × v_{rel}| / |v_{rel}|.',
      ],
      advancedPitfalls: [
        'Confusing velocity of boat in still water (v_{b/r}) with velocity observed from ground (v_{ground}). The engine only provides v_{b/r}.',
      ],
    },
    questions: [
      {
        id: 'q-rm-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A boat can travel at 5 m/s in still water. It wants to cross a 200 m wide river flowing at 3 m/s along the shortest path (zero drift). At what angle upstream from the bank normal must it steer, and what is the crossing time?',
        options: ['37°, 50 s', '53°, 40 s', '37°, 40 s', '30°, 50 s'],
        correctAnswer: 0,
        explanation:
          'For zero drift, sin α = v_river / v_boat = 3 / 5 = 0.6 => α = 37° upstream from normal. The effective crossing speed across the river is v_net = √(5² - 3²) = 4 m/s. Time t = 200 / 4 = 50 seconds.',
        formulaUsed: '\\sin\\alpha = \\frac{v_r}{v_b}, \\quad t = \\frac{W}{\\sqrt{v_b^2 - v_r^2}}',
      },
      {
        id: 'q-rm-2',
        type: 'numerical',
        difficulty: 'JEE Advanced',
        question:
          'Rain is falling vertically at 8 m/s. A person walks horizontally at 6 m/s. At what angle with the vertical (in degrees) should the person hold the umbrella to best protect against the rain?',
        numericalAnswer: 36.87,
        tolerance: 0.5,
        explanation:
          'Relative velocity of rain wrt person: v_rel = v_rain - v_man = (-8 ĵ) - (6 î) = -6 î - 8 ĵ. The tangent of angle with vertical is tan φ = |v_man| / |v_rain| = 6 / 8 = 0.75 => φ = arctan(0.75) ≈ 36.87°.',
        formulaUsed: '\\tan\\phi = \\frac{v_m}{v_{ry}}',
      },
    ],
    graphConfigs: [
      {
        id: 'drift-vs-theta',
        title: 'Downstream Drift (x) vs Steering Angle (θ)',
        xLabel: 'Steering Angle (θ)',
        yLabel: 'Drift Distance (x)',
        xUnit: 'deg',
        yUnit: 'm',
        color: '#06b6d4',
        type: 'parametric',
        calc: (p) => {
          const vb = p.vBoat || 10;
          const vr = p.vRiver || 4;
          const W = p.width || 120;
          const pts = [];
          for (let ang = 35; ang <= 145; ang += 2) {
            const rad = (ang * Math.PI) / 180;
            const t = W / (vb * Math.sin(rad));
            const drift = (vr + vb * Math.cos(rad)) * t;
            pts.push({ x: ang, y: drift });
          }
          return pts;
        },
      },
      {
        id: 'time-vs-theta',
        title: 'Crossing Time vs Steering Angle (θ)',
        xLabel: 'Steering Angle (θ)',
        yLabel: 'Time (t)',
        xUnit: 'deg',
        yUnit: 's',
        color: '#38bdf8',
        type: 'parametric',
        calc: (p) => {
          const vb = p.vBoat || 10;
          const W = p.width || 120;
          const pts = [];
          for (let ang = 30; ang <= 150; ang += 2) {
            const rad = (ang * Math.PI) / 180;
            const t = W / (vb * Math.sin(rad));
            pts.push({ x: ang, y: t });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const vb = p.vBoat || 10;
      const vr = p.vRiver || 4;
      const thetaDeg = p.theta !== undefined ? p.theta : 115;
      const thetaRad = (thetaDeg * Math.PI) / 180;
      const W = p.width || 120;
      const vm = p.vMan || 3;
      const vrx = p.vRainX || 2;
      const vry = p.vRainY || 8;

      const vxGround = vr + vb * Math.cos(thetaRad);
      const vyGround = vb * Math.sin(thetaRad);
      const vGround = Math.sqrt(vxGround * vxGround + vyGround * vyGround);
      const tCross = W / Math.max(0.1, vyGround);
      const drift = vxGround * tCross;

      const vrelRainX = vrx - vm;
      const vrelRain = Math.sqrt(vrelRainX * vrelRainX + vry * vry);
      const umbrellaAngleDeg = (Math.atan2(Math.abs(vrelRainX), vry) * 180) / Math.PI;

      return [
        { label: 'Ground Speed', symbol: 'v_{ground}', unit: 'm/s', value: vGround, formatted: `${vGround.toFixed(2)} m/s`, color: '#10b981' },
        { label: 'Crossing Time', symbol: 't_{cross}', unit: 's', value: tCross, formatted: `${tCross.toFixed(1)} s`, color: '#38bdf8' },
        { label: 'River Drift', symbol: 'x_{drift}', unit: 'm', value: drift, formatted: `${drift.toFixed(1)} m`, color: '#eab308' },
        { label: 'Rain-Man Rel Speed', symbol: 'v_{r/m}', unit: 'm/s', value: vrelRain, formatted: `${vrelRain.toFixed(2)} m/s`, color: '#a855f7' },
        { label: 'Umbrella Tilt Angle', symbol: 'φ', unit: 'deg', value: umbrellaAngleDeg, formatted: `${umbrellaAngleDeg.toFixed(1)}°`, color: '#f43f5e' },
      ];
    },
  },

  // 4. PROPERTIES OF MATTER: ELASTICITY & VISCOUS STOKES TERMINAL VELOCITY
  {
    id: 'elasticity-viscosity-stokes',
    chapterId: 'properties-matter',
    category: 'mechanics',
    topic: 'Elasticity, Viscosity & Terminal Velocity',
    title: "Young's Modulus Stress-Strain & Stokes' Viscous Drag",
    subtitle: 'Hookean wire tensile elongation, Searle apparatus, Stokes laminar drag & Terminal velocity',
    badge: 'Core Mechanics',
    simulationType: 'elasticity-viscosity-stokes',
    description:
      "Explores elastic and viscous properties of bulk matter. In solids, Hooke’s law states tensile stress σ = F/A is proportional to tensile strain ε = ΔL/L within the proportional limit, defined by Young’s Modulus Y = σ/ε. In fluids, a spherical body of radius r moving at speed v experiences Stokes' viscous drag F_v = 6πηrv. A sphere falling through a viscous fluid reaches a constant terminal velocity v_t when downward gravity is balanced by the sum of upward buoyancy and Stokes viscous drag.",
    assumptions: [
      'Homogeneous isotropic wire obeying Hooke’s law within proportional elastic limit',
      'Laminar, non-turbulent fluid flow around falling sphere (low Reynolds number Re < 1)',
      'Infinite column boundaries (wall and end corrections neglected for base model)',
    ],
    cameraPreset: { position: [0, 8, 18], target: [0, 0, 0] },
    parameters: [
      { id: 'hangingMass', label: 'Searle Wire Load (M)', symbol: 'M', unit: 'kg', min: 1, max: 25, step: 1, defaultVal: 10, description: 'Hanging weight stretching the experimental wire' },
      { id: 'wireLength', label: 'Wire Initial Length (L)', symbol: 'L', unit: 'm', min: 1, max: 5, step: 0.2, defaultVal: 2.5, description: 'Natural un-stretched length of metallic wire' },
      { id: 'wireRadius', label: 'Wire Radius (r_w)', symbol: 'r_w', unit: 'mm', min: 0.2, max: 1.5, step: 0.05, defaultVal: 0.5, description: 'Cross-sectional radius of wire measured with screw gauge' },
      { id: 'youngModulus', label: "Young's Modulus (Y)", symbol: 'Y', unit: 'GPa', min: 50, max: 220, step: 10, defaultVal: 200, description: '200 GPa for Steel, 110 GPa for Copper, 70 GPa for Aluminum' },
      { id: 'sphereRadius', label: 'Falling Sphere Radius (r)', symbol: 'r', unit: 'cm', min: 0.5, max: 4.0, step: 0.25, defaultVal: 1.5, description: 'Radius of spherical bob dropped into fluid' },
      { id: 'sphereDensity', label: 'Sphere Density (ρ_s)', symbol: 'ρ_s', unit: 'kg/m³', min: 1500, max: 12000, step: 200, defaultVal: 7800, description: 'Steel=7800, Brass=8500, Lead=11300' },
      { id: 'fluidDensity', label: 'Fluid Density (ρ_f)', symbol: 'ρ_f', unit: 'kg/m³', min: 800, max: 1500, step: 50, defaultVal: 1260, description: 'Glycerin=1260, Castor Oil=960, Water=1000' },
      { id: 'viscosity', label: 'Dynamic Viscosity (η)', symbol: 'η', unit: 'Pa·s', min: 0.1, max: 5.0, step: 0.1, defaultVal: 1.5, description: 'Dynamic viscosity coefficient of fluid column' },
    ],
    formulas: [
      { name: 'Tensile Stress & Strain', latex: '\\sigma = \\frac{M g}{\\pi r_w^2}, \\quad \\epsilon = \\frac{\\Delta L}{L}', explanation: 'Restoring force per unit area and fractional elongation.' },
      { name: "Young's Modulus Wire Elongation", latex: '\\Delta L = \\frac{M g L}{\\pi r_w^2 Y}', explanation: 'Linear elastic deformation under axial hanging load.' },
      { name: 'Elastic Strain Energy Density', latex: 'u = \\frac{1}{2} \\sigma \\epsilon = \\frac{1}{2} Y \\epsilon^2, \\quad U_{total} = \\frac{1}{2} F \\Delta L', explanation: 'Mechanical potential energy stored in the strained crystal lattice.' },
      { name: "Stokes' Viscous Drag Force", latex: 'F_v = 6\\pi \\eta r v', explanation: 'Viscous resistive force on spherical particle moving at speed v.' },
      { name: 'Terminal Velocity Formula', latex: 'v_t = \\frac{2}{9} \\frac{r^2 (\\rho_s - \\rho_f) g}{\\eta}', explanation: 'Steady-state speed when weight = Buoyancy + Stokes drag.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Terminal velocity scaling: v_t ∝ r² (doubling sphere radius quadruples its terminal velocity!).',
        'If fluid is denser than sphere (ρ_s < ρ_f, e.g. air bubble in water), terminal velocity is negative (bubble rises upwards with terminal speed).',
        'Breaking stress is an INTENSIVE material property independent of wire length or radius, while breaking force F = (Breaking Stress) · A is proportional to r².',
      ],
      keyShortcuts: [
        'Thermal stress in clamped wire: σ = Y α ΔT, with thermal force F = Y A α ΔT.',
        'Work done in stretching wire = (1/2) Load × Extension = (1/2) M g ΔL. The remaining (1/2) M g ΔL is dissipated as lattice heat!',
      ],
      trapAlerts: [
        'In Searle apparatus questions, check whether the load dropped was M or 2M, and remember diameter vs radius for wire cross section A = π r² = π d² / 4.',
        'Reynolds number Re = 2 r ρ_f v / η must be < 1 for Stokes’ law to be valid. At high speeds, drag transitions from linear (v) to quadratic (v²).',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Poiseuille’s Equation for Laminar Capillary Flow: Volume flow rate Q = π ΔP r⁴ / (8 η L). Note the extreme r⁴ dependence.',
        'Transient Velocity Differential Equation: m dv/dt = m g (1 - ρ_f/ρ_s) - 6πηrv => v(t) = v_t [1 - e^{-t/τ}], where relaxation time τ = m / (6πηr) = 2 ρ_s r² / (9 η).',
        'Excess Pressure inside Curved Surfaces: Soap bubble (2 surfaces): ΔP = 4T/R. Liquid droplet / air bubble inside fluid (1 surface): ΔP = 2T/R.',
      ],
      multiConceptLinks: [
        'Millikan Oil Drop Experiment: Balancing electrostatic force q E against Stokes drag and gravity to quantize elementary charge e.',
        'Torsional Pendulum: Restoring torque τ = -C θ, where torsional rigidity C = π G r⁴ / (2 L).',
      ],
      calculusFormulations: [
        'Non-uniform wire under self-weight: Elongation ΔL = ρ g L² / (2 Y). Note factor of 1/2 compared to hanging end load!',
        'Capillary rise with non-zero contact angle: h = 2 T cos θ / (r ρ g).',
      ],
      advancedPitfalls: [
        'Forgetting buoyant force when computing terminal velocity: Gravity net effective weight is m g (1 - ρ_f/ρ_s), never just m g.',
      ],
    },
    questions: [
      {
        id: 'q-em-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A spherical steel ball of radius r falls through a viscous liquid column with terminal velocity v_t = 0.4 m/s. What will be the terminal velocity of a steel ball of radius 2r in the same liquid?',
        options: ['0.8 m/s', '1.6 m/s', '3.2 m/s', '0.4 m/s'],
        correctAnswer: 1,
        explanation:
          'Terminal velocity follows v_t ∝ r². Since radius is doubled (2r), terminal velocity scales by (2)² = 4 times: v_new = 4 × 0.4 = 1.6 m/s.',
        formulaUsed: 'v_t = \\frac{2}{9}\\frac{r^2(\\rho_s - \\rho_f)g}{\\eta}',
      },
      {
        id: 'q-em-2',
        type: 'numerical',
        difficulty: 'JEE Advanced',
        question:
          'A steel wire of length L = 2 m and radius r = 1 mm (Y = 2.0 × 10¹¹ N/m²) is stretched by hanging a load of 10 kg. What is the elastic energy stored in the wire in milliJoules (mJ)? (Take g = 9.8 m/s²)',
        numericalAnswer: 15.3,
        tolerance: 0.5,
        explanation:
          'Area A = π (0.001)² = 3.1416 × 10⁻⁶ m². Load F = 10 × 9.8 = 98 N. Extension ΔL = F L / (A Y) = (98 × 2) / (3.1416 × 10⁻⁶ × 2 × 10¹¹) = 196 / 6.283 × 10⁵ = 3.12 × 10⁻⁴ m. Stored energy U = (1/2) F ΔL = 0.5 × 98 × 3.12 × 10⁻⁴ = 1.528 × 10⁻² J ≈ 15.3 mJ.',
        formulaUsed: 'U = \\frac{1}{2} F \\Delta L = \\frac{1}{2} \\frac{F^2 L}{A Y}',
      },
    ],
    graphConfigs: [
      {
        id: 'vt-vs-radius',
        title: 'Terminal Velocity vs Sphere Radius (r)',
        xLabel: 'Sphere Radius (r)',
        yLabel: 'Terminal Velocity (v_t)',
        xUnit: 'cm',
        yUnit: 'm/s',
        color: '#f59e0b',
        type: 'parametric',
        calc: (p) => {
          const rhos = p.sphereDensity || 7800;
          const rhof = p.fluidDensity || 1260;
          const eta = p.viscosity || 1.5;
          const pts = [];
          for (let r = 0.5; r <= 4.0; r += 0.2) {
            const rM = r * 0.01;
            const vt = (2 / 9) * ((rM * rM * (rhos - rhof) * 9.8) / eta);
            pts.push({ x: r, y: vt });
          }
          return pts;
        },
      },
      {
        id: 'stress-vs-strain',
        title: 'Stress vs Strain (Hooke Linear Regime)',
        xLabel: 'Tensile Strain (ε)',
        yLabel: 'Tensile Stress (σ)',
        xUnit: '×10⁻⁴',
        yUnit: 'MPa',
        color: '#10b981',
        type: 'parametric',
        calc: (p) => {
          const Y = (p.youngModulus || 200) * 1e9;
          const pts = [];
          for (let strain = 0; strain <= 10; strain += 0.5) {
            const eps = strain * 1e-4;
            const stress = (Y * eps) / 1e6; // MPa
            pts.push({ x: strain, y: stress });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const M = p.hangingMass || 10;
      const L = p.wireLength || 2.5;
      const rw = (p.wireRadius || 0.5) * 0.001;
      const Y = (p.youngModulus || 200) * 1e9;
      const A = Math.PI * rw * rw;
      const F = M * 9.8;
      const stress = F / A;
      const strain = stress / Y;
      const deltaL = strain * L;
      const storedEnergy = 0.5 * F * deltaL;

      const r = (p.sphereRadius || 1.5) * 0.01;
      const rhos = p.sphereDensity || 7800;
      const rhof = p.fluidDensity || 1260;
      const eta = p.viscosity || 1.5;
      const vol = (4 / 3) * Math.PI * r * r * r;
      const massSphere = vol * rhos;
      const weightSphere = massSphere * 9.8;
      const buoyantForce = vol * rhof * 9.8;
      const vt = (2 / 9) * ((r * r * (rhos - rhof) * 9.8) / eta);
      const tau = (2 * rhos * r * r) / (9 * eta);
      const curV = vt * (1 - Math.exp(-Math.min(simTime, 10) / Math.max(0.01, tau)));
      const stokesDrag = 6 * Math.PI * eta * r * curV;

      return [
        { label: 'Wire Elongation', symbol: 'ΔL', unit: 'mm', value: deltaL * 1000, formatted: `${(deltaL * 1000).toFixed(3)} mm`, color: '#38bdf8' },
        { label: 'Tensile Stress', symbol: 'σ', unit: 'MPa', value: stress / 1e6, formatted: `${(stress / 1e6).toFixed(1)} MPa`, color: '#10b981' },
        { label: 'Elastic Energy', symbol: 'U', unit: 'mJ', value: storedEnergy * 1000, formatted: `${(storedEnergy * 1000).toFixed(1)} mJ`, color: '#eab308' },
        { label: 'Terminal Velocity', symbol: 'v_t', unit: 'm/s', value: vt, formatted: `${vt.toFixed(3)} m/s`, color: '#f59e0b' },
        { label: 'Instantaneous Speed', symbol: 'v(t)', unit: 'm/s', value: curV, formatted: `${curV.toFixed(3)} m/s`, color: '#a855f7' },
        { label: 'Stokes Drag Force', symbol: 'F_v', unit: 'N', value: stokesDrag, formatted: `${stokesDrag.toFixed(3)} N`, color: '#ef4444' },
      ];
    },
  },
  // 6. CENTER OF MASS & ARTICULATED RAGDOLL SYSTEM OF PARTICLES
  {
    id: 'center-of-mass-ragdoll',
    chapterId: 'com-momentum',
    category: 'mechanics',
    topic: 'Center of Mass & System of Particles',
    title: 'Center of Mass Trajectory & Articulated Ragdoll Dynamics',
    subtitle: 'System of Particles, Internal Action-Reaction Cancellation & Invariance of COM Parabolic Motion',
    badge: 'WASM Physics Engine',
    simulationType: 'center-of-mass-ragdoll',
    description:
      'A 10-segment articulated humanoid ragdoll (total mass M = 70.0 kg) launched under deterministic physics simulation. Regardless of how wildly the limbs flail, rotate, or how fierce the internal joint torques are, the Center of Mass follows an unperturbed parabolic trajectory governed solely by external gravity F_ext = M·g. Directly demonstrates the fundamental JEE theorem: internal forces cannot accelerate the Center of Mass of a system.',
    assumptions: [
      '10 calibrated anatomical rigid segments (torso, cranium, upper/lower arms, thighs, shins) totaling exactly 70.0 kg',
      'Articulated spherical and revolute impulse joints with realistic biomechanical angular limits and damping',
      'All internal muscular torques obey Newton’s Third Law strictly (action = -reaction): Σ F_int ≡ 0 and Σ τ_int ≡ 0',
      'Deterministic 120Hz fixed-timestep WASM physics integration (Rapier) decoupled from display frame rate',
    ],
    cameraPreset: { position: [16, 12, 22], target: [12, 6, 0] },
    parameters: [
      { id: 'dropHeight', label: 'Launch Height (h₀)', symbol: 'h_0', unit: 'm', min: 5, max: 25, step: 1, defaultVal: 15, description: 'Initial vertical drop height of the center of mass' },
      { id: 'v0x', label: 'Horizontal Velocity (v₀ₓ)', symbol: 'v_{0x}', unit: 'm/s', min: 0, max: 20, step: 1, defaultVal: 10, description: 'Initial horizontal launch velocity of the entire system' },
      { id: 'v0y', label: 'Vertical Velocity (v₀ᵧ)', symbol: 'v_{0y}', unit: 'm/s', min: -5, max: 20, step: 1, defaultVal: 8, description: 'Initial upward (+ve) or downward (-ve) launch velocity' },
      { id: 'gravityPreset', label: 'Gravity Environment', symbol: 'g', unit: 'm/s²', min: 0, max: 3, step: 1, defaultVal: 1, description: '0: Moon (1.62), 1: Earth (9.81), 2: Jupiter (24.79), 3: Zero-G (0)' },
      { id: 'freezeJoints', label: 'Joint Rigidity Mode', symbol: 'Mode', unit: '', min: 0, max: 1, step: 1, defaultVal: 0, description: '0: Articulated Flailing Limbs, 1: Frozen Monolithic Rigid Body' },
      { id: 'flailTorque', label: 'Internal Flail Torque (τ_int)', symbol: '\\tau_{int}', unit: 'N·m', min: 0, max: 100, step: 5, defaultVal: 40, description: 'Internal action-reaction torque amplitude applied between limbs' },
      { id: 'initialSpin', label: 'Initial Tumble Spin (ω₀)', symbol: '\\omega_0', unit: 'rad/s', min: -8, max: 8, step: 1, defaultVal: 3, description: 'Initial angular tumble rate on launch' },
    ],
    formulas: [
      { name: 'Definition of Center of Mass', latex: '\\vec{r}_{cm} = \\frac{\\sum_{i=1}^{n} m_i \\vec{r}_i}{\\sum_{i=1}^{n} m_i} = \\frac{1}{M_{total}} \\sum_{i=1}^{n} m_i \\vec{r}_i', explanation: 'Mass-weighted average position of all 10 articulated segments in 3D Cartesian coordinates.' },
      { name: "Newton's Second Law for a System of Particles", latex: '\\sum \\vec{F}_{ext} = M_{total} \\vec{a}_{cm} \\quad \\iff \\quad \\sum \\vec{F}_{int} \\equiv \\mathbf{0}', explanation: 'Internal forces cancel pairwise in equal and opposite pairs by Newton’s 3rd Law, having zero influence on COM motion.' },
      { name: 'Total System Momentum', latex: '\\vec{P}_{system} = M_{total} \\vec{v}_{cm} = \\sum_{i=1}^{n} m_i \\vec{v}_i', explanation: 'Total linear momentum of the system is identical to that of a single point mass M concentrated at the Center of Mass.' },
      { name: 'Analytical Parabolic Trajectory of COM', latex: 'x_{cm}(t) = x_0 + v_{0x} t, \\quad y_{cm}(t) = y_0 + v_{0y} t - \\frac{1}{2} g t^2', explanation: 'Exact analytical projectile motion followed identically whether the body is rigid or freely flailing.' },
      { name: 'Internal Force Cancellation Law', latex: '\\vec{F}_{i \\to j} = -\\vec{F}_{j \\to i} \\implies \\sum_{i=1}^{n} \\sum_{j \\ne i} \\vec{F}_{ij} = \\mathbf{0}', explanation: 'Internal actions and reactions can alter relative limb positions and rotations, but never net external impulse.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Internal Explosions / Fragmentations mid-flight: If a projectile explodes into fragments at the apex, the Center of Mass continues along the original parabolic path until fragments strike the ground.',
        'Man walking on a friction-less boat: Δx_boat = - (m_man · Δx_man) / (m_man + m_boat) because Center of Mass remains stationary in the absence of horizontal external force.',
        'Free flailing ragdoll / acrobat: Internal muscle contraction changes the moment of inertia and angular velocity (conservation of angular momentum), but does NOT shift the COM trajectory.',
      ],
      keyShortcuts: [
        'Shift in Center of Mass: Δr_cm = (Σ m_i Δr_i) / M_total. If Σ F_ext = 0, then Δr_cm = 0.',
        'Relative limb displacement shortcut: x_1 m_1 + x_2 m_2 = 0 in the Center of Mass frame.',
      ],
      trapAlerts: [
        'Trap: Students frequently assume that when limbs swing vigorously, the Center of Mass trajectory oscillates. FALSE! The COM path is perfectly smooth.',
        'Trap: Forgetting that internal forces can do non-zero WORK (altering total mechanical kinetic energy) even though they exert ZERO net force (preserving linear momentum).',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Decoupling Motion into COM Translation + Rotation about COM: Total kinetic energy K = (1/2) M v_cm² + (1/2) I_cm ω². Internal forces alter (1/2) I_cm ω² but leave (1/2) M v_cm² invariant.',
        'Variable Moment of Inertia Tensor: When limbs bend and extend, I_ij(t) varies dynamically, producing precession and tumbling via Euler’s equations of rigid/jointed motion: dL/dt = τ_ext.',
        'Ground Impact Boundary Singularity: When any limb touches the floor, ground normal reaction N and friction f are EXTERNAL forces, terminating the pure free-flight parabolic regime.',
      ],
      multiConceptLinks: [
        'Rotational Dynamics: Parallel axis theorem I = I_cm + M d² connects moment of inertia of individual limbs to the central torso.',
        'Impulse-Momentum: During instantaneous ground contact, impulsive normal forces abruptly redirect COM velocity: ∫ N dt = ΔP_y.',
      ],
      calculusFormulations: [
        '\\vec{r}_{cm} = \\frac{\\int \\vec{r} \\, dm}{\\int dm} = \\frac{1}{M} \\int \\rho(\\vec{r}) \\vec{r} \\, dV',
        '\\frac{d\\vec{P}}{dt} = \\frac{d}{dt}(M \\vec{v}_{cm}) = M \\vec{a}_{cm} = \\vec{F}_{ext}',
      ],
      advancedPitfalls: [
        'Assuming center of mass must lie within the physical boundary of matter (e.g., for an L-shaped articulated limb or hollow ring, COM lies in empty space).',
        'Confusing zero net external force with conservation of kinetic energy: internal forces do work W_int = ΔK_rel.',
        'Neglecting the ground contact boundary condition: once a single joint touches the surface, normal force N is external and changes the COM trajectory immediately.',
      ],
    },
    questions: [
      {
        id: 'q-ragdoll-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'An acrobat (or articulated ragdoll) of mass 70 kg is in mid-air free projectile flight under uniform gravity. While airborne, the acrobat vigorously flails and contracts arms and legs using internal muscle torque. Which of the following statements is strictly correct regarding the motion of the Center of Mass (COM)?',
        options: [
          'The COM path deviates from the parabola due to angular reaction from limb momentum.',
          'The COM continues precisely along the parabolic trajectory as if all mass were concentrated at that point.',
          'The horizontal velocity of COM fluctuates sinusoidally due to action-reaction pairs.',
          'The vertical acceleration of COM exceeds g during rapid limb retraction.',
        ],
        correctAnswer: 1,
        explanation:
          'By Newton’s Third Law, all internal joint and muscular forces form action-reaction pairs that cancel out vectorially: Σ F_int ≡ 0. The only external force acting on the acrobat during airborne flight is gravity: Σ F_ext = M_total · g (downwards). Therefore, a_cm = g (downwards), and the Center of Mass follows an unperturbed textbook parabolic trajectory regardless of internal flailing.',
        formulaUsed: '\\vec{F}_{ext} = M \\frac{d^2 \\vec{r}_{cm}}{dt^2}',
      },
      {
        id: 'q-ragdoll-2',
        type: 'numerical',
        difficulty: 'JEE Advanced',
        question:
          'A projectile of mass M is launched with velocity 20 m/s at an angle of 45° to the horizontal. At the highest point of its trajectory, it explodes internally into two equal fragments of mass M/2. One fragment falls vertically down with zero initial horizontal speed. If g = 10 m/s², find the horizontal distance (in meters) from the launch point where the second fragment lands on the ground.',
        numericalAnswer: 60,
        tolerance: 0.5,
        explanation:
          'Since explosion is caused entirely by internal forces, the Center of Mass continues its normal projectile flight and lands at the original range: R_cm = u² sin(2θ)/g = (20² × sin 90°)/10 = 40 m. The first fragment has zero horizontal velocity at apex (x = R/2 = 20 m) and falls straight down to land at x1 = 20 m. For the COM to land at x_cm = 40 m: x_cm = (m1 x1 + m2 x2)/(m1 + m2) => 40 = (0.5 × 20 + 0.5 × x2)/1.0 => 40 = 10 + 0.5 x2 => 0.5 x2 = 30 => x2 = 60 m.',
        formulaUsed: 'x_{cm} = \\frac{m_1 x_1 + m_2 x_2}{m_1 + m_2}',
      },
    ],
    graphConfigs: [
      {
        id: 'com-altitude-graph',
        title: 'Center of Mass Altitude: y_cm(t)',
        xLabel: 'Time (s)',
        yLabel: 'Altitude (m)',
        xUnit: 's',
        yUnit: 'm',
        color: '#10b981',
        type: 'time-series',
        calc: (p) => {
          const g = p.gravityPreset === 0 ? 1.62 : p.gravityPreset === 1 ? 9.81 : p.gravityPreset === 2 ? 24.79 : 0.001;
          const h0 = p.dropHeight || 15;
          const v0y = p.v0y || 8;
          const pts = [];
          for (let t = 0; t <= 4.0; t += 0.05) {
            const y = Math.max(0, h0 + v0y * t - 0.5 * g * t * t);
            pts.push({ x: parseFloat(t.toFixed(2)), y: parseFloat(y.toFixed(2)) });
          }
          return pts;
        },
      },
      {
        id: 'forces-balance-graph',
        title: 'Force Balance: Σ F_ext vs Σ F_int',
        xLabel: 'Time (s)',
        yLabel: 'Force (N)',
        xUnit: 's',
        yUnit: 'N',
        color: '#38bdf8',
        type: 'time-series',
        calc: (p) => {
          const g = p.gravityPreset === 0 ? 1.62 : p.gravityPreset === 1 ? 9.81 : p.gravityPreset === 2 ? 24.79 : 0;
          const F_ext = -70.0 * g;
          const pts = [];
          for (let t = 0; t <= 4.0; t += 0.2) {
            pts.push({ x: parseFloat(t.toFixed(1)), y: parseFloat(F_ext.toFixed(1)) });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const g = p.gravityPreset === 0 ? 1.62 : p.gravityPreset === 1 ? 9.81 : p.gravityPreset === 2 ? 24.79 : 0;
      const h0 = p.dropHeight || 15;
      const v0x = p.v0x || 10;
      const v0y = p.v0y || 8;
      const t = Math.max(0, simTime);

      const xAnalytic = v0x * t;
      const yAnalytic = Math.max(0.5, h0 + v0y * t - 0.5 * g * t * t);
      const vxAnalytic = v0x;
      const vyAnalytic = v0y - g * t;
      const speedAnalytic = Math.sqrt(vxAnalytic * vxAnalytic + vyAnalytic * vyAnalytic);
      const Fext = 70.0 * g;
      const modeName = p.freezeJoints >= 0.5 ? 'Rigid Monolith' : 'Articulated Flailing';

      return [
        { label: 'System Total Mass (M)', symbol: 'M_{tot}', unit: 'kg', value: 70.0, formatted: '70.0 kg (10 Segments)', color: '#38bdf8' },
        { label: 'Rigidity Mode', symbol: 'Mode', unit: '', value: p.freezeJoints, formatted: modeName, color: p.freezeJoints >= 0.5 ? '#eab308' : '#10b981' },
        { label: 'Theoretical COM Height', symbol: 'y_{cm}^{theo}', unit: 'm', value: yAnalytic, formatted: `${yAnalytic.toFixed(2)} m`, color: '#34d399' },
        { label: 'Theoretical Horizontal Range', symbol: 'x_{cm}^{theo}', unit: 'm', value: xAnalytic, formatted: `${xAnalytic.toFixed(2)} m`, color: '#60a5fa' },
        { label: 'COM Instantaneous Velocity', symbol: 'v_{cm}', unit: 'm/s', value: speedAnalytic, formatted: `${speedAnalytic.toFixed(2)} m/s`, color: '#f59e0b' },
        { label: 'Net External Force (Gravity)', symbol: '\\Sigma F_{ext}', unit: 'N', value: Fext, formatted: `${Fext.toFixed(1)} N (Down)`, color: '#f43f5e' },
        { label: 'Net Internal Force Sum', symbol: '\\Sigma F_{int}', unit: 'N', value: 0.0, formatted: '0.000 N (Zero Cancellation)', color: '#a855f7' },
      ];
    },
  },
];

