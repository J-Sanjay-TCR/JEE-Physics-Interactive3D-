import { PhysicsConcept } from '../types';

export const EXTRA_CONCEPTS: PhysicsConcept[] = [
  // 9. VECTORS & 3D MATHEMATICAL PHYSICS
  {
    id: 'vector-operations',
    chapterId: 'vectors-math',
    category: 'mechanics',
    topic: 'Vectors & 3D Algebra',
    title: '3D Vector Addition, Dot & Cross Product',
    subtitle: 'Resultant vector R = A + B, scalar projection A·B and vector area A × B with right-hand rule',
    badge: 'Mathematical Physics',
    simulationType: 'vector-operations',
    description:
      'Vectors have both magnitude and direction in 3D space. The dot product A·B = |A||B|cosθ is a scalar measuring directional alignment, while the cross product A×B = |A||B|sinθ n̂ is a vector perpendicular to both vectors.',
    assumptions: [
      'Cartesian orthogonal coordinate system (î, ĵ, k̂)',
      'Free vectors with origin at (0, 0, 0)',
    ],
    cameraPreset: { position: [10, 10, 14], target: [0, 0, 0] },
    parameters: [
      { id: 'Ax', label: 'Vector A (x)', symbol: 'A_x', unit: '', min: -8, max: 8, step: 1, defaultVal: 5, description: 'X-component of vector A' },
      { id: 'Ay', label: 'Vector A (y)', symbol: 'A_y', unit: '', min: -8, max: 8, step: 1, defaultVal: 3, description: 'Y-component of vector A' },
      { id: 'Az', label: 'Vector A (z)', symbol: 'A_z', unit: '', min: -8, max: 8, step: 1, defaultVal: 2, description: 'Z-component of vector A' },
      { id: 'Bx', label: 'Vector B (x)', symbol: 'B_x', unit: '', min: -8, max: 8, step: 1, defaultVal: 2, description: 'X-component of vector B' },
      { id: 'By', label: 'Vector B (y)', symbol: 'B_y', unit: '', min: -8, max: 8, step: 1, defaultVal: 6, description: 'Y-component of vector B' },
      { id: 'Bz', label: 'Vector B (z)', symbol: 'B_z', unit: '', min: -8, max: 8, step: 1, defaultVal: -1, description: 'Z-component of vector B' },
    ],
    formulas: [
      { name: 'Resultant Vector (R = A + B)', latex: '\\vec{R} = (A_x + B_x)\\hat{i} + (A_y + B_y)\\hat{j} + (A_z + B_z)\\hat{k}', explanation: 'Parallelogram law of vector addition.' },
      { name: 'Dot Product (Scalar)', latex: '\\vec{A}\\cdot\\vec{B} = A_x B_x + A_y B_y + A_z B_z = |\\vec{A}||\\vec{B}|\\cos\\theta', explanation: 'Measure of projection / work done.' },
      { name: 'Cross Product (Vector)', latex: '\\vec{A}\\times\\vec{B} = (A_y B_z - A_z B_y)\\hat{i} - (A_x B_z - A_z B_x)\\hat{j} + (A_x B_y - A_y B_x)\\hat{k}', explanation: 'Normal vector to plane of A and B with magnitude equal to parallelogram area.' },
      { name: 'Angle between Vectors (\\theta)', latex: '\\cos\\theta = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}', explanation: 'Direct angle between vector lines.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Condition for two vectors to be perpendicular (orthogonal): A · B = 0.',
        'Condition for two vectors to be parallel: A × B = 0 or A_x/B_x = A_y/B_y = A_z/B_z.',
        'Projection of A on B: (A · B) / |B|.',
      ],
      keyShortcuts: [
        'Unit vector perpendicular to both A and B: n̂ = ±(A × B) / |A × B|.',
        'Area of triangle formed by vectors A and B: Area = (1/2) |A × B|.',
      ],
      trapAlerts: [
        'Cross product is anti-commutative: A × B = -(B × A).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Scalar Triple Product: [A B C] = A · (B × C) gives the volume of a parallelepiped. If [A B C] = 0, vectors are coplanar.',
        'Vector Triple Product: A × (B × C) = (A · C)B - (A · B)C (BAC-CAB rule).',
      ],
      multiConceptLinks: [
        'Torque: τ = r × F, Angular momentum: L = r × p, Magnetic force: F = q(v × B).',
      ],
      calculusFormulations: [
        'Derivative of cross product: d/dt (A × B) = (dA/dt × B) + (A × dB/dt).',
      ],
      advancedPitfalls: [
        'A × (B × C) ≠ (A × B) × C in general.',
      ],
    },
    questions: [
      {
        id: 'q-vec-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'If |A + B| = |A - B|, what is the angle between vectors A and B?',
        options: ['90°', '0°', '180°', '45°'],
        correctAnswer: 0,
        explanation: '|A + B|² = |A - B|² => A² + B² + 2A·B = A² + B² - 2A·B => 4A·B = 0 => A · B = 0 => θ = 90°.',
        formulaUsed: '|\\vec{A} \\pm \\vec{B}|^2 = A^2 + B^2 \\pm 2\\vec{A}\\cdot\\vec{B}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const magA = Math.sqrt(p.Ax * p.Ax + p.Ay * p.Ay + p.Az * p.Az);
      const magB = Math.sqrt(p.Bx * p.Bx + p.By * p.By + p.Bz * p.Bz);
      const Rx = p.Ax + p.Bx;
      const Ry = p.Ay + p.By;
      const Rz = p.Az + p.Bz;
      const magR = Math.sqrt(Rx * Rx + Ry * Ry + Rz * Rz);
      const dot = p.Ax * p.Bx + p.Ay * p.By + p.Az * p.Bz;
      const cosTheta = Math.max(-1, Math.min(1, dot / (magA * magB || 1)));
      const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;

      const Cx = p.Ay * p.Bz - p.Az * p.By;
      const Cy = -(p.Ax * p.Bz - p.Az * p.Bx);
      const Cz = p.Ax * p.By - p.Ay * p.Bx;
      const magCross = Math.sqrt(Cx * Cx + Cy * Cy + Cz * Cz);

      return [
        { label: '|Vector A|', symbol: '|\\vec{A}|', unit: '', value: magA, formatted: `${magA.toFixed(2)}`, color: '#38bdf8' },
        { label: '|Vector B|', symbol: '|\\vec{B}|', unit: '', value: magB, formatted: `${magB.toFixed(2)}`, color: '#4ade80' },
        { label: 'Angle (θ)', symbol: '\\theta', unit: '°', value: thetaDeg, formatted: `${thetaDeg.toFixed(1)}°`, color: '#f59e0b' },
        { label: 'Dot Product', symbol: '\\vec{A}\\cdot\\vec{B}', unit: '', value: dot, formatted: `${dot.toFixed(2)}`, color: '#a855f7' },
        { label: 'Cross Product Mag', symbol: '|\\vec{A}\\times\\vec{B}|', unit: '', value: magCross, formatted: `${magCross.toFixed(2)}`, color: '#f43f5e' },
      ];
    },
  },

  // 10. GRAVITATIONAL ORBITS & KEPLER'S LAWS
  {
    id: 'gravitational-orbit',
    chapterId: 'gravitation',
    category: 'mechanics',
    topic: 'Gravitation & Planetary Orbits',
    title: 'Kepler Orbits & Gravitational Mechanics',
    subtitle: 'Elliptical orbits, orbital velocity v = √(GM/r), escape velocity & equal area sweeps',
    badge: 'Gravitation Master',
    simulationType: 'gravitational-orbit',
    description:
      'Planets and satellites move in elliptical orbits with the central mass at one focus (Kepler 1st Law). The radius vector sweeps out equal areas in equal intervals of time (Kepler 2nd Law, expressing conservation of angular momentum).',
    assumptions: [
      'Two-body system with central star mass M >> satellite mass m',
      'Newton inverse-square law of universal gravitation F = GMm/r²',
      'No perturbation from other planetary bodies',
    ],
    cameraPreset: { position: [0, 16, 22], target: [0, 0, 0] },
    parameters: [
      { id: 'semiMajor', label: 'Semi-Major Axis (a)', symbol: 'a', unit: 'AU', min: 2, max: 12, step: 0.5, defaultVal: 6, description: 'Size parameter of the elliptical orbit' },
      { id: 'eccentricity', label: 'Eccentricity (e)', symbol: 'e', unit: '', min: 0.0, max: 0.75, step: 0.05, defaultVal: 0.4, description: '0 = circular orbit, >0 = elliptical orbit' },
      { id: 'centralMass', label: 'Central Star Mass (M)', symbol: 'M', unit: 'M_⊙', min: 0.5, max: 5, step: 0.5, defaultVal: 1.0, description: 'Mass of the central gravitational attractor' },
    ],
    formulas: [
      { name: 'Kepler Third Law', latex: 'T^2 = \\frac{4\\pi^2}{GM} a^3', explanation: 'Square of orbital period is proportional to cube of semi-major axis.' },
      { name: 'Orbital Speed at Distance r', latex: 'v(r) = \\sqrt{GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)}', explanation: 'Vis-Viva equation relating instantaneous orbital speed to distance r.' },
      { name: 'Perihelion & Aphelion Distances', latex: 'r_p = a(1 - e),\\quad r_a = a(1 + e)', explanation: 'Closest and farthest distances from the central mass focus.' },
      { name: 'Escape Velocity', latex: 'v_{esc} = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2} v_{circ}', explanation: 'Minimum speed needed to escape gravitational well to infinity.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Speed ratio at perihelion vs aphelion: v_p / v_a = r_a / r_p = (1 + e) / (1 - e) due to conservation of angular momentum L = m r v.',
        'Total Mechanical Energy of elliptical orbit: E = -GMm / (2a) (independent of eccentricity e!).',
        'Geostationary Satellite: Period T = 24 hours, parked at altitude h ≈ 36,000 km in equatorial plane rotating West to East.',
      ],
      keyShortcuts: [
        'Variation of g with height h: g_h = g (1 - 2h/R) for h << R, and g_h = g / (1 + h/R)² for all h.',
        'Variation of g with depth d: g_d = g (1 - d/R).',
      ],
      trapAlerts: [
        'In orbit, astronauts feel weightless because the normal reaction from spaceship is ZERO (they are in continuous free-fall), NOT because gravity is zero!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Orbital transfer (Hohmann Transfer): Energy required to shift from circular orbit r₁ to r₂: ΔE = GMm/2 * (1/r₁ - 1/r₂).',
        'Gravitational potential inside a solid uniform sphere: V(r) = -(GM / 2R³) (3R² - r²). At center r = 0, V_center = -(3/2) GM/R.',
      ],
      multiConceptLinks: [
        'Tunnel through Earth: Particle oscillates in SHM with period T = 2π √(R/g) ≈ 84.6 minutes.',
      ],
      calculusFormulations: [
        'Areal velocity: dA/dt = L / (2m) = constant.',
      ],
      advancedPitfalls: [
        'Escape velocity from Earth surface is v_e = √(2gR) ≈ 11.2 km/s. It is independent of the projection angle θ (as long as it does not hit Earth)!',
      ],
    },
    questions: [
      {
        id: 'q-grav-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A planet moves in an elliptical orbit around the Sun with eccentricity e = 0.5. The ratio of its maximum orbital speed to minimum orbital speed is:',
        options: ['3 : 1', '1 : 3', '2 : 1', '1.5 : 1'],
        correctAnswer: 0,
        explanation: 'By conservation of angular momentum: L = m r_p v_max = m r_a v_min => v_max / v_min = r_a / r_p = a(1 + e) / a(1 - e) = (1 + 0.5)/(1 - 0.5) = 1.5 / 0.5 = 3 : 1.',
        formulaUsed: '\\frac{v_p}{v_a} = \\frac{1 + e}{1 - e}',
      },
    ],
    graphConfigs: [
      {
        id: 'speed-vs-angle',
        title: 'Orbital Speed vs True Anomaly (θ)',
        xLabel: 'Angle θ',
        yLabel: 'Speed v',
        xUnit: '°',
        yUnit: 'km/s',
        color: '#f59e0b',
        type: 'distribution',
        calc: (p) => {
          const pts = [];
          const GM = 4 * Math.PI * Math.PI * p.centralMass; // normalized
          for (let deg = 0; deg <= 360; deg += 10) {
            const rad = (deg * Math.PI) / 180;
            const r = (p.semiMajor * (1 - p.eccentricity * p.eccentricity)) / (1 + p.eccentricity * Math.cos(rad));
            const v = Math.sqrt(Math.max(0, GM * (2 / r - 1 / p.semiMajor))) * 5;
            pts.push({ x: deg, y: v });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p, simTime) => {
      const a = p.semiMajor;
      const e = p.eccentricity;
      const rp = a * (1 - e);
      const ra = a * (1 + e);
      const T = Math.sqrt(Math.pow(a, 3) / p.centralMass);

      // Mean anomaly to approximate position
      const M = (2 * Math.PI * (simTime % T)) / T;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(M));
      const v_norm = Math.sqrt(p.centralMass * (2 / r - 1 / a)) * 12;

      return [
        { label: 'Orbital Period (T)', symbol: 'T', unit: 'yr', value: T, formatted: `${T.toFixed(2)} yr`, color: '#38bdf8' },
        { label: 'Perihelion Distance', symbol: 'r_p', unit: 'AU', value: rp, formatted: `${rp.toFixed(2)} AU`, color: '#4ade80' },
        { label: 'Aphelion Distance', symbol: 'r_a', unit: 'AU', value: ra, formatted: `${ra.toFixed(2)} AU`, color: '#f59e0b' },
        { label: 'Instantaneous Speed', symbol: 'v(t)', unit: 'km/s', value: v_norm, formatted: `${v_norm.toFixed(1)} km/s`, color: '#a855f7' },
      ];
    },
  },

  // 11. LORENTZ FORCE & CYCLOTRON HELIX
  {
    id: 'lorentz-force-cyclotron',
    chapterId: 'magnetism',
    category: 'electromagnetism',
    topic: 'Magnetic Force & Cyclotron Motion',
    title: 'Lorentz Force & 3D Helical Trajectories',
    subtitle: 'Charged particle in magnetic B and electric E fields: F = q(E + v × B), radius r = mv/qB and pitch p = v_∥ T',
    badge: 'Magnetism Core',
    simulationType: 'lorentz-force-cyclotron',
    description:
      'A charged particle q moving with velocity v in a magnetic field B experiences a perpendicular deflecting force F = q(v × B). The perpendicular velocity component v_⊥ causes circular motion with radius r = mv_⊥ / (qB), while parallel velocity v_∥ creates a helical spiral.',
    assumptions: [
      'Uniform magnetic field B directed along the Z-axis (or specified direction)',
      'Uniform electric field E parallel or perpendicular to B',
      'Non-relativistic speeds (v << c)',
    ],
    cameraPreset: { position: [12, 10, 16], target: [0, 0, 0] },
    parameters: [
      { id: 'v_perp', label: 'Perpendicular Speed (v_⊥)', symbol: 'v_\\perp', unit: 'm/s', min: 2, max: 20, step: 1, defaultVal: 8, description: 'Speed perpendicular to magnetic field B' },
      { id: 'v_para', label: 'Parallel Speed (v_∥)', symbol: 'v_\\parallel', unit: 'm/s', min: 0, max: 15, step: 1, defaultVal: 4, description: 'Speed parallel to magnetic field B' },
      { id: 'B', label: 'Magnetic Field (B)', symbol: 'B', unit: 'T', min: 0.5, max: 5.0, step: 0.5, defaultVal: 1.5, description: 'Magnetic field intensity along Z axis' },
      { id: 'q', label: 'Charge (q)', symbol: 'q', unit: 'μC', min: -5, max: 5, step: 1, defaultVal: 2, description: 'Electric charge of the particle' },
      { id: 'm', label: 'Particle Mass (m)', symbol: 'm', unit: 'u', min: 1, max: 10, step: 1, defaultVal: 2, description: 'Mass of the charged particle' },
    ],
    formulas: [
      { name: 'Lorentz Force', latex: '\\vec{F} = q(\\vec{E} + \\vec{v}\\times\\vec{B})', explanation: 'Complete electromagnetic force acting on moving charge.' },
      { name: 'Cyclotron Radius (r)', latex: 'r = \\frac{m v_\\perp}{|q| B}', explanation: 'Radius of gyration in plane perpendicular to B.' },
      { name: 'Cyclotron Period & Frequency', latex: 'T = \\frac{2\\pi m}{|q| B},\\quad f = \\frac{|q| B}{2\\pi m}', explanation: 'Time period of circular revolution (independent of speed!).' },
      { name: 'Helical Pitch (p)', latex: 'p = v_\\parallel T = \\frac{2\\pi m v_\\parallel}{|q| B}', explanation: 'Axial distance traveled per complete revolution.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Magnetic force does ZERO work on a charged particle because F is always perpendicular to v (dW = F · v dt = 0). Speed and kinetic energy remain strictly constant!',
        'Cyclotron frequency f = qB / (2πm) is INDEPENDENT of particle velocity and radius of orbit.',
        'Velocity Selector: When qE = qvB => v = E / B, particles undeflected pass through straight.',
      ],
      keyShortcuts: [
        'Radius in terms of Momentum p, Kinetic Energy K, and Accelerating Potential V: r = p/(qB) = √(2mK)/(qB) = √(2mqV)/(qB).',
      ],
      trapAlerts: [
        'If velocity is PARALLEL to B (θ = 0° or 180°), magnetic force is ZERO and the path is a STRAIGHT LINE.',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Crossed Electric and Magnetic Fields (E ⊥ B): Cycloid / Trochoid motion with drift velocity v_d = (E × B) / B².',
        'Magnetic Mirror effect in non-uniform magnetic field: Conservation of magnetic moment μ = (1/2)m v_⊥² / B.',
      ],
      multiConceptLinks: [
        'Mass Spectrometer and Bainbridge velocity filter: Resolving isotopic masses.',
      ],
      calculusFormulations: [
        'Equations of motion in component form: m dv_x/dt = q B v_y, m dv_y/dt = -q B v_x.',
      ],
      advancedPitfalls: [
        'In cyclotron, maximum kinetic energy of accelerated ions: K_max = (q² B² R_max²) / (2m).',
      ],
    },
    questions: [
      {
        id: 'q-mag-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A proton (q, m) and an alpha particle (2q, 4m) enter a uniform magnetic field with the same kinetic energy perpendicular to B. The ratio of their orbital radii r_p / r_α is:',
        options: ['1 : 1', '1 : 2', '2 : 1', '1 : 4'],
        correctAnswer: 0,
        explanation: 'Radius r = √(2mK) / (qB). Since K and B are identical: r_p / r_α = [√(m) / q] / [√(4m) / 2q] = [√m / q] / [2√m / 2q] = 1 : 1.',
        formulaUsed: 'r = \\frac{\\sqrt{2mK}}{qB}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const qAbs = Math.abs(p.q) || 1;
      const r = (p.m * p.v_perp) / (qAbs * p.B);
      const T = (2 * Math.PI * p.m) / (qAbs * p.B);
      const freq = 1 / T;
      const pitch = p.v_para * T;
      const K = 0.5 * p.m * (p.v_perp * p.v_perp + p.v_para * p.v_para);

      return [
        { label: 'Cyclotron Radius (r)', symbol: 'r', unit: 'm', value: r, formatted: `${r.toFixed(2)} m`, color: '#4ade80' },
        { label: 'Time Period (T)', symbol: 'T', unit: 's', value: T, formatted: `${T.toFixed(2)} s`, color: '#38bdf8' },
        { label: 'Helical Pitch (p)', symbol: 'p', unit: 'm', value: pitch, formatted: `${pitch.toFixed(2)} m`, color: '#f59e0b' },
        { label: 'Cyclotron Frequency', symbol: 'f_c', unit: 'Hz', value: freq, formatted: `${freq.toFixed(2)} Hz`, color: '#a855f7' },
        { label: 'Kinetic Energy (K)', symbol: 'K', unit: 'J', value: K, formatted: `${K.toFixed(1)} J (Const)`, color: '#ec4899' },
      ];
    },
  },

  // 12. RAY OPTICS: LENS FORMULA & PRISM DEVIATION
  {
    id: 'ray-optics-lens-prism',
    chapterId: 'ray-optics',
    category: 'optics',
    topic: 'Thin Lenses & Refraction in Prism',
    title: 'Thin Lens Ray Tracing & Prism Refraction',
    subtitle: 'Principal rays, object/image conjugates 1/v - 1/u = 1/f, magnification & minimum deviation δ_m',
    badge: 'Ray Optics Master',
    simulationType: 'ray-optics-lens-prism',
    description:
      'Geometric ray optics tracks rays through lenses obeying Snell law. For thin lenses, rays parallel to principal axis refract through focal point F, and rays through optical center pass undeviated. Prism refracts light with total deviation δ = (i + e) - A.',
    assumptions: [
      'Paraxial ray approximation (small angles with principal axis)',
      'Thin lens approximation (lens thickness negligible compared to radii)',
      'Cartesian sign convention (incident light travels left to right)',
    ],
    cameraPreset: { position: [0, 6, 14], target: [0, 0, 0] },
    parameters: [
      { id: 'focalLength', label: 'Focal Length (f)', symbol: 'f', unit: 'cm', min: -30, max: 30, step: 2, defaultVal: 15, description: '+ve for convex lens, -ve for concave lens' },
      { id: 'objectDistance', label: 'Object Distance (u)', symbol: 'u', unit: 'cm', min: -50, max: -5, step: 1, defaultVal: -25, description: 'Position of object relative to lens (always negative in standard setup)' },
      { id: 'objectHeight', label: 'Object Height (h₀)', symbol: 'h_0', unit: 'cm', min: 1, max: 10, step: 0.5, defaultVal: 4, description: 'Height of the illuminated object arrow' },
      { id: 'prismAngle', label: 'Prism Angle (A)', symbol: 'A', unit: '°', min: 30, max: 75, step: 5, defaultVal: 60, description: 'Refracting angle of triangular prism' },
      { id: 'prismMu', label: 'Refractive Index (μ)', symbol: 'μ', unit: '', min: 1.2, max: 2.0, step: 0.05, defaultVal: 1.5, description: 'Refractive index of prism glass' },
    ],
    formulas: [
      { name: 'Lens Formula', latex: '\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}', explanation: 'Relates object distance u, image distance v, and focal length f.' },
      { name: 'Linear Magnification', latex: 'm = \\frac{h_i}{h_0} = \\frac{v}{u} = \\frac{f}{f + u}', explanation: 'Ratio of image height to object height (negative indicates inverted image).' },
      { name: 'Lens Maker Formula', latex: '\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)', explanation: 'Calculates focal length from surface curvature radii.' },
      { name: 'Prism Refraction & Minimum Deviation', latex: '\\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}', explanation: 'Condition at symmetric minimum deviation where angle of incidence i = emergence e.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Real object in front of convex lens: If |u| > 2f => Real, inverted, diminished between f and 2f. If |u| = 2f => Real, inverted, same size at 2f. If |u| < f => Virtual, erect, magnified behind object.',
        'Concave lens ALWAYS forms a virtual, erect, and diminished image for any real object position.',
        'Power of lens combination in contact: P = P₁ + P₂ => 1/f = 1/f₁ + 1/f₂.',
      ],
      keyShortcuts: [
        'Displacement Method: f = (D² - d²) / (4D) where D is distance between object and screen, and d is lens shift between two clear image positions.',
        'Small angle prism deviation: δ = (μ - 1) A.',
      ],
      trapAlerts: [
        'Remember Cartesian sign convention: u is negative for real objects, f is positive for convex lens and negative for concave lens.',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Silvering of lens: A silvered lens behaves as a concave mirror of equivalent power P_eq = 2 P_lens + P_mirror.',
        'Variable Refractive Index media: Optical path ∫ μ(y) dy and Fermat Principle of least time.',
        'Total Internal Reflection in prism: Condition for no emergence from second face: A > 2 θ_c where θ_c = sin⁻¹(1/μ).',
      ],
      multiConceptLinks: [
        'Combinations of lenses and mirrors with liquid layer trapped between them.',
      ],
      calculusFormulations: [
        'Rate of image velocity: v_image = (v²/u²) v_object along the principal axis.',
      ],
      advancedPitfalls: [
        'Longitudinal magnification for small objects: m_L = dv/du = -(v/u)² = -m².',
      ],
    },
    questions: [
      {
        id: 'q-opt-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'An object is placed at a distance of 20 cm from a convex lens of focal length 15 cm. The position, nature, and magnification of the image are:',
        options: [
          'v = +60 cm, Real & Inverted, m = -3',
          'v = -60 cm, Virtual & Erect, m = +3',
          'v = +30 cm, Real & Inverted, m = -1.5',
          'v = +12 cm, Real & Diminished, m = -0.6',
        ],
        correctAnswer: 0,
        explanation: 'Given u = -20 cm, f = +15 cm. 1/v - 1/u = 1/f => 1/v = 1/15 + 1/(-20) = (4 - 3)/60 = 1/60 => v = +60 cm. Magnification m = v / u = 60 / (-20) = -3 (Real, inverted, 3 times enlarged).',
        formulaUsed: '\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f},\\; m = \\frac{v}{u}',
      },
    ],
    graphConfigs: [
      {
        id: 'v-vs-u',
        title: 'Image Distance v vs Object Distance u',
        xLabel: 'Object Distance |u|',
        yLabel: 'Image Distance v',
        xUnit: 'cm',
        yUnit: 'cm',
        color: '#06b6d4',
        type: 'distribution',
        calc: (p) => {
          const f = p.focalLength;
          const pts = [];
          for (let u = -45; u <= -16; u += 1) {
            const v = (u * f) / (u + f);
            pts.push({ x: Math.abs(u), y: v });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const u = p.objectDistance;
      const f = p.focalLength;
      const v = (u * f) / (u + f);
      const m = v / u;
      const hi = m * p.objectHeight;
      const nature = v > 0 ? 'Real & Inverted' : 'Virtual & Erect';

      // Prism min deviation
      const Arad = (p.prismAngle * Math.PI) / 180;
      const sinHalf = Math.sin(Arad / 2);
      const sinDevHalf = Math.min(0.999, p.prismMu * sinHalf);
      const deltaM_rad = 2 * Math.asin(sinDevHalf) - Arad;
      const deltaM_deg = Math.max(0, (deltaM_rad * 180) / Math.PI);

      return [
        { label: 'Image Distance (v)', symbol: 'v', unit: 'cm', value: v, formatted: `${v.toFixed(1)} cm`, color: '#4ade80' },
        { label: 'Magnification (m)', symbol: 'm', unit: '', value: m, formatted: `${m.toFixed(2)}`, color: '#38bdf8' },
        { label: 'Image Nature', symbol: 'Nature', unit: '', value: m, formatted: nature, color: v > 0 ? '#10b981' : '#f59e0b' },
        { label: 'Image Height (hᵢ)', symbol: 'h_i', unit: 'cm', value: hi, formatted: `${Math.abs(hi).toFixed(1)} cm`, color: '#a855f7' },
        { label: 'Prism Min Deviation', symbol: '\\delta_m', unit: '°', value: deltaM_deg, formatted: `${deltaM_deg.toFixed(1)}°`, color: '#ec4899' },
      ];
    },
  },
];
