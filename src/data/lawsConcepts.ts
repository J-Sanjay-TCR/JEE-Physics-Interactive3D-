import { PhysicsConcept } from '../types';

export const LAWS_CONCEPTS: PhysicsConcept[] = [
  // 1. BIOT-SAVART & AMPERE'S CIRCUITAL LAW
  {
    id: 'biot-savart-ampere',
    chapterId: 'magnetism',
    category: 'electromagnetism',
    topic: "Biot-Savart Law & Ampere's Law",
    title: "Biot-Savart Law & Ampere's Circuital Law",
    subtitle: 'Magnetic field of current loops, straight conductors, and solenoids in 3D',
    badge: 'Core JEE Law',
    description:
      'Explore the fundamental laws governing magnetic fields produced by electric currents. Discover the Biot-Savart differential formulation dB = (μ₀/4π) (i dl × r̂)/r² and Ampere circuital circulation ∮ B·dl = μ₀ I_enclosed, analyzing field lines, axial magnetic fields of circular loops, and solenoid uniform internal fields.',
    assumptions: [
      'Steady, non-time-varying direct current (dc) flow',
      'Vacuum/air medium with permeability μ₀ = 4π × 10⁻⁷ T·m/A',
      'Infinitesimal current elements obeying superposition principle',
      'For solenoid, length is significantly larger than diameter (negligible fringe field at center)',
    ],
    simulationType: 'biot-savart-ampere',
    parameters: [
      { id: 'current', label: 'Electric Current (i)', symbol: 'i', unit: 'A', min: 1, max: 50, step: 1, defaultVal: 10, description: 'Current flowing through the loop / conductor' },
      { id: 'loopRadius', label: 'Loop Radius (R)', symbol: 'R', unit: 'cm', min: 2, max: 20, step: 0.5, defaultVal: 8, description: 'Radius of circular loop' },
      { id: 'axialDist', label: 'Axial Distance (x)', symbol: 'x', unit: 'cm', min: 0, max: 30, step: 0.5, defaultVal: 6, description: 'Distance along central axis from loop plane' },
      { id: 'numTurns', label: 'Number of Turns (N)', symbol: 'N', unit: 'turns', min: 1, max: 100, step: 1, defaultVal: 10, description: 'Number of tightly wound coil turns' },
      { id: 'geometry', label: 'Conductor Geometry', symbol: 'Geo', unit: '0:Loop, 1:Wire, 2:Solenoid', min: 0, max: 2, step: 1, defaultVal: 0, description: '0 for Circular Loop, 1 for Straight Wire, 2 for Solenoid' },
    ],
    formulas: [
      { name: 'Biot-Savart Law (Differential Form)', latex: 'd\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{i\\, d\\vec{l} \\times \\hat{r}}{r^2}', explanation: 'Fundamental equation for magnetic field from a current element dl at distance r.' },
      { name: 'Axial Field of Circular Coil', latex: 'B(x) = \\frac{\\mu_0 N i R^2}{2(R^2 + x^2)^{3/2}}', explanation: 'Magnetic field at distance x along the axis of an N-turn circular loop of radius R.' },
      { name: 'Field at Center of Circular Coil (x = 0)', latex: 'B_{center} = \\frac{\\mu_0 N i}{2R}', explanation: 'Maximum magnetic field along the loop axis.' },
      { name: "Ampere's Circuital Law", latex: '\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enclosed}}', explanation: 'Line integral of magnetic field around any closed loop equals μ₀ times net enclosed current.' },
      { name: 'Field of Long Straight Wire (at distance d)', latex: 'B = \\frac{\\mu_0 i}{2\\pi d}', explanation: 'Derived directly from Ampere circuital law around circular loop of radius d.' },
      { name: 'Magnetic Field inside Long Solenoid', latex: 'B = \\mu_0 n i = \\mu_0 \\left(\\frac{N}{L}\\right) i', explanation: 'Uniform axial magnetic field inside a solenoid with turn density n = N/L.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Ratio of axial magnetic field B(x) to center field B(0): B(x)/B(0) = [1 + (x/R)²]^(-3/2). When x = R, B(x) = B(0) / 2^(3/2) ≈ 0.353 B(0).',
        'Direction of B vector is found via Right-Hand Thumb Rule: Curl fingers along current flow, thumb points in direction of B along axis.',
        'At large distances (x >> R), circular loop acts as a Magnetic Dipole with dipole moment M = N i A = N i (π R²), giving B_axial ≈ (μ₀/4π) (2M / x³).',
      ],
      keyShortcuts: [
        'Points of Inflection of B vs x curve (Helmholtz Coil condition): d²B/dx² = 0 occurs at x = ± R/2.',
        'For an arc of angle θ radians at center: B_arc = (θ / 2π) × (μ₀ i / 2R).',
      ],
      trapAlerts: [
        'Do not forget factor of N when coil has multiple turns.',
        'Units trap: Always convert radius R and distance x from cm to meters (m) before plugging into μ₀ = 4π × 10⁻⁷.',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Vector form integration of Biot-Savart Law for 3D curved wires, polygons, and truncated conical spirals.',
        'Displacement current modification by Maxwell: ∮ B·dl = μ₀ (I_c + ε₀ dΦ_E/dt) to maintain charge continuity in capacitor plates.',
        'Magnetic vector potential A where B = ∇ × A and gauge invariance.',
      ],
      multiConceptLinks: [
        'Coupling of magnetic dipole moment with external torque (τ = M × B) and magnetic potential energy (U = -M·B) in rotational SHM.',
        'Faraday induction in a rotating loop inside Biot-Savart nonuniform magnetic fields.',
      ],
      calculusFormulations: [
        '\\vec{B}(\\vec{r}) = \\frac{\\mu_0 i}{4\\pi} \\int \\frac{d\\vec{l} \\times (\\vec{r} - \\vec{r}\')}{|\\vec{r} - \\vec{r}\'|^3}',
        '\\vec{\\nabla} \\cdot \\vec{B} = 0 \\quad (\\text{No magnetic monopoles}), \\quad \\vec{\\nabla} \\times \\vec{B} = \\mu_0 \\vec{J}',
      ],
      advancedPitfalls: [
        'When calculating B inside a thick cylindrical wire of radius R carrying uniform current I, B(r) = (μ₀ I r) / (2π R²) for r ≤ R (linear growth), and B(r) = (μ₀ I) / (2π r) for r > R (hyperbolic decay).',
      ],
    },
    computeLiveQuantities: (params) => {
      const i = params.current;
      const R = params.loopRadius * 0.01;
      const x = params.axialDist * 0.01;
      const N = params.numTurns;
      const mu0 = 4 * Math.PI * 1e-7;

      const B_center = (mu0 * N * i) / (2 * R);
      const B_axial = (mu0 * N * i * R * R) / (2 * Math.pow(R * R + x * x, 1.5));
      const M = N * i * (Math.PI * R * R);

      return [
        { label: 'Axial Field B(x)', symbol: 'B_x', unit: 'mT', value: B_axial * 1e3, formatted: `${(B_axial * 1e3).toFixed(3)} mT`, color: 'text-amber-400' },
        { label: 'Center Field B(0)', symbol: 'B_0', unit: 'mT', value: B_center * 1e3, formatted: `${(B_center * 1e3).toFixed(3)} mT`, color: 'text-emerald-400' },
        { label: 'Field Ratio B(x)/B(0)', symbol: 'Ratio', unit: '%', value: (B_axial / B_center) * 100, formatted: `${((B_axial / B_center) * 100).toFixed(1)} %`, color: 'text-cyan-400' },
        { label: 'Magnetic Dipole Moment', symbol: 'M', unit: 'A·m²', value: M, formatted: `${M.toFixed(4)} A·m²`, color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'b-vs-x',
        title: 'Magnetic Field B(x) vs Axial Distance x',
        xLabel: 'Axial Distance x',
        yLabel: 'Magnetic Field B(x)',
        xUnit: 'cm',
        yUnit: 'mT',
        color: '#F59E0B',
        type: 'distribution',
        calc: (params) => {
          const i = params.current;
          const R = params.loopRadius * 0.01;
          const N = params.numTurns;
          const mu0 = 4 * Math.PI * 1e-7;
          const points = [];
          for (let x_cm = -30; x_cm <= 30; x_cm += 1) {
            const x_m = x_cm * 0.01;
            const B = (mu0 * N * i * R * R) / (2 * Math.pow(R * R + x_m * x_m, 1.5));
            points.push({ x: x_cm, y: parseFloat((B * 1e3).toFixed(4)) });
          }
          return points;
        },
      },
      {
        id: 'b-vs-i',
        title: 'Center Field B(0) vs Current i',
        xLabel: 'Current i',
        yLabel: 'Center Field B(0)',
        xUnit: 'A',
        yUnit: 'mT',
        color: '#10B981',
        type: 'parametric',
        calc: (params) => {
          const R = params.loopRadius * 0.01;
          const N = params.numTurns;
          const mu0 = 4 * Math.PI * 1e-7;
          const points = [];
          for (let cur = 1; cur <= 50; cur += 2) {
            const B0 = (mu0 * N * cur) / (2 * R);
            points.push({ x: cur, y: parseFloat((B0 * 1e3).toFixed(3)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'bs-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A circular coil of radius R carries an electric current i. At what distance along the axis of the coil from its center is the magnetic field equal to 1/8th of its value at the center?',
        options: ['x = R / 2', 'x = R \\sqrt{3}', 'x = 2 R', 'x = 3 R'],
        correctAnswer: 1,
        explanation:
          'B(x)/B(0) = [R² / (R² + x²)]^(3/2) = 1/8 = (1/2)³. Taking power 2/3 on both sides: R² / (R² + x²) = 1/4 ⇒ 4 R² = R² + x² ⇒ x² = 3 R² ⇒ x = R \\sqrt{3}.',
        formulaUsed: 'B(x)/B(0) = \\left(1 + \\frac{x^2}{R^2}\\right)^{-3/2}',
      },
      {
        id: 'bs-q2',
        type: 'numerical',
        difficulty: 'JEE Advanced',
        question:
          'Two identical circular coils of radius R = 10 cm and N = 100 turns each are placed coaxially separated by a distance equal to their radius R (Helmholtz arrangement). If a current i = 2 A passes through both in the same direction, calculate the uniform magnetic field at the midpoint on the axis (in mT, take μ₀ = 4π × 10⁻⁷).',
        numericalAnswer: 1.80,
        tolerance: 0.1,
        explanation:
          'At the midpoint x = R/2 = 0.05 m from each coil: B_mid = 2 × [μ₀ N i R² / (2 (R² + (R/2)²)^(3/2))] = μ₀ N i R² / (5/4 R²)^(3/2) = (8 / 5^(3/2)) × (μ₀ N i / R) ≈ 0.7155 × (4π × 10⁻⁷ × 100 × 2 / 0.1) ≈ 0.7155 × 2.513 mT ≈ 1.80 mT.',
        formulaUsed: 'B_{Helmholtz} = \\frac{8 \\mu_0 N i}{5\\sqrt{5} R}',
      },
    ],
  },

  // 2. GAUSS'S LAW & ELECTRIC FLUX
  {
    id: 'gauss-law-flux',
    chapterId: 'electrostatics',
    category: 'electromagnetism',
    topic: "Gauss's Law & Electric Flux",
    title: "Gauss's Law & Electrostatic Flux",
    subtitle: 'Spherical, cylindrical, and planar Gaussian surfaces & charge distributions',
    badge: "Maxwell's 1st Law",
    description:
      "Visualize Gauss's Law in 3D: the total electric flux passing through any closed surface is proportional to the net charge enclosed: Φ_E = ∮ E·dA = Q_enclosed / ε₀. Examine electric fields inside and outside uniformly charged conducting shells, non-conducting solid spheres, infinite line charges, and charged infinite sheets.",
    assumptions: [
      'Static charge distribution in electrostatics',
      'Vacuum permittivity ε₀ = 8.854 × 10⁻¹² C²/(N·m²)',
      'Gaussian surfaces chosen along high-symmetry surfaces where E is either parallel or normal to dA',
      'For conductor in electrostatic equilibrium, electric field inside the material is strictly zero',
    ],
    simulationType: 'gauss-law-flux',
    parameters: [
      { id: 'chargeQ', label: 'Enclosed Charge (Q)', symbol: 'Q', unit: 'nC', min: -50, max: 50, step: 2, defaultVal: 20, description: 'Net total charge of the central distribution' },
      { id: 'sphereRadius', label: 'Charged Body Radius (R)', symbol: 'R', unit: 'cm', min: 2, max: 15, step: 0.5, defaultVal: 5, description: 'Radius of physical charged sphere' },
      { id: 'gaussianRadius', label: 'Gaussian Surface Radius (r)', symbol: 'r', unit: 'cm', min: 1, max: 25, step: 0.5, defaultVal: 8, description: 'Radius of the mathematical Gaussian surface' },
      { id: 'chargeType', label: 'Geometry Type', symbol: 'Type', unit: '0:Shell, 1:Solid, 2:Line', min: 0, max: 2, step: 1, defaultVal: 0, description: '0 for Conducting Shell, 1 for Uniform Solid Sphere, 2 for Infinite Line' },
    ],
    formulas: [
      { name: "Gauss's Law (Integral Form)", latex: '\\Phi_E = \\oint_S \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enclosed}}}{\\varepsilon_0}', explanation: 'Net electric flux through closed surface S equals enclosed charge divided by ε₀.' },
      { name: 'Field Outside Spherical Distribution (r ≥ R)', latex: 'E(r) = \\frac{Q}{4\\pi \\varepsilon_0 r^2} = \\frac{k Q}{r^2}', explanation: 'Acts identically to a point charge located at the center for all r ≥ R.' },
      { name: 'Field Inside Conducting Shell (r < R)', latex: 'E(r) = 0', explanation: 'No charge enclosed inside the cavity, so electric field is strictly zero everywhere inside.' },
      { name: 'Field Inside Uniform Solid Sphere (r < R)', latex: 'E(r) = \\frac{Q r}{4\\pi \\varepsilon_0 R^3} = \\frac{\\rho r}{3\\varepsilon_0}', explanation: 'Electric field increases linearly from 0 at center to maximum at the surface r = R.' },
      { name: 'Field of Infinite Line Charge (Linear density λ)', latex: 'E(r) = \\frac{\\lambda}{2\\pi \\varepsilon_0 r} = \\frac{2 k \\lambda}{r}', explanation: 'Derived using a coaxial cylindrical Gaussian surface of radius r and length L.' },
      { name: 'Field of Infinite Non-conducting Sheet', latex: 'E = \\frac{\\sigma}{2\\varepsilon_0}', explanation: 'Uniform, distance-independent electric field on both sides of a sheet with surface density σ.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Electric field discontinuity at surface of conductor: ΔE = σ/ε₀.',
        'Graph of E vs r for solid non-conducting sphere: Straight line from origin to surface (E ∝ r), then hyperbolic drop (E ∝ 1/r²).',
        'Flux through a single face of a cube with point charge q at its center: Φ_face = q / (6 ε₀). If charge is at a corner: Φ_face = q / (24 ε₀) for the 3 non-adjacent faces.',
      ],
      keyShortcuts: [
        'If a charge q is placed at center of an open hemisphere: Net flux through curved surface = q / (2 ε₀).',
        'Self-electrostatic energy of uniformly charged solid sphere = (3/5) kQ²/R; for thin spherical shell = (1/2) kQ²/R.',
      ],
      trapAlerts: [
        'Watch out for whether the sphere is conducting (E_inside = 0) or non-conducting uniformly charged (E_inside ∝ r).',
        'Flux is independent of the size and shape of the Gaussian surface as long as Q_enclosed remains identical.',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        "Differential Gauss's Law: ∇·E = ρ/ε₀ (Maxwell's first equation) and Poisson's equation ∇²V = -ρ/ε₀.",
        'Cavity problems: For a solid sphere with uniform charge density ρ containing a spherical cavity, the electric field inside the cavity is strictly UNIFORM: E_cavity = (ρ / 3ε₀) d_vector, where d is displacement vector from sphere center to cavity center.',
        'Method of electrical images for point charge near grounded conducting plane and grounded conducting sphere.',
      ],
      multiConceptLinks: [
        'Electrostatic pressure on charged surface: P = σ² / (2ε₀) = (1/2) ε₀ E² (energy density of electric field).',
        'Charged soap bubble equilibrium under surface tension and electrostatic pressure.',
      ],
      calculusFormulations: [
        '\\vec{\\nabla} \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}',
        'Q_{\\text{encl}} = \\int_0^r \\rho(r\') 4\\pi r\'^2 dr\' \\implies E(r) = \\frac{1}{\\varepsilon_0 r^2} \\int_0^r \\rho(r\') r\'^2 dr\'',
      ],
      advancedPitfalls: [
        'Non-uniform charge density problems where ρ(r) = kr or ρ(r) = ρ₀(1 - r/R). Do not use formula Q/4πε₀r² inside without integrating ρ(r)dV!',
      ],
    },
    computeLiveQuantities: (params) => {
      const Q_nC = params.chargeQ;
      const Q = Q_nC * 1e-9;
      const R = params.sphereRadius * 0.01;
      const r = params.gaussianRadius * 0.01;
      const eps0 = 8.854e-12;
      const k = 1 / (4 * Math.PI * eps0);

      let E = 0;
      let Q_enc = 0;

      if (params.chargeType === 0) {
        // Conducting Shell
        if (r >= R) {
          E = (k * Math.abs(Q)) / (r * r);
          Q_enc = Q;
        } else {
          E = 0;
          Q_enc = 0;
        }
      } else if (params.chargeType === 1) {
        // Solid Non-conducting Sphere
        if (r >= R) {
          E = (k * Math.abs(Q)) / (r * r);
          Q_enc = Q;
        } else {
          Q_enc = Q * Math.pow(r / R, 3);
          E = (k * Math.abs(Q) * r) / Math.pow(R, 3);
        }
      } else {
        // Infinite Line (assume lambda = Q/0.1)
        const lambda = Q / 0.1;
        E = Math.abs(lambda) / (2 * Math.PI * eps0 * r);
        Q_enc = lambda * (2 * r);
      }

      const flux = Q_enc / eps0;

      return [
        { label: 'Electric Field E(r)', symbol: 'E', unit: 'N/C', value: E, formatted: `${E.toExponential(2)} N/C`, color: 'text-cyan-400' },
        { label: 'Enclosed Charge', symbol: 'Q_enc', unit: 'nC', value: Q_enc * 1e9, formatted: `${(Q_enc * 1e9).toFixed(2)} nC`, color: 'text-amber-400' },
        { label: 'Total Electric Flux Φ', symbol: 'Φ_E', unit: 'N·m²/C', value: flux, formatted: `${flux.toExponential(2)} N·m²/C`, color: 'text-emerald-400' },
        { label: 'Surface Charge Density σ', symbol: 'σ', unit: 'μC/m²', value: (Q / (4 * Math.PI * R * R)) * 1e6, formatted: `${((Q / (4 * Math.PI * R * R)) * 1e6).toFixed(2)} μC/m²`, color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'e-vs-r',
        title: 'Electric Field E vs Distance r',
        xLabel: 'Distance r',
        yLabel: 'Electric Field E(r)',
        xUnit: 'cm',
        yUnit: 'kV/m',
        color: '#06B6D4',
        type: 'distribution',
        calc: (params) => {
          const Q = params.chargeQ * 1e-9;
          const R = params.sphereRadius * 0.01;
          const eps0 = 8.854e-12;
          const k = 1 / (4 * Math.PI * eps0);
          const points = [];

          for (let r_cm = 0.5; r_cm <= 25; r_cm += 0.5) {
            const r = r_cm * 0.01;
            let E = 0;
            if (params.chargeType === 0) {
              E = r >= R ? (k * Math.abs(Q)) / (r * r) : 0;
            } else if (params.chargeType === 1) {
              E = r >= R ? (k * Math.abs(Q)) / (r * r) : (k * Math.abs(Q) * r) / Math.pow(R, 3);
            } else {
              const lambda = Q / 0.1;
              E = Math.abs(lambda) / (2 * Math.PI * eps0 * r);
            }
            points.push({ x: r_cm, y: parseFloat((E * 1e-3).toFixed(2)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'gl-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A point charge q is placed at a corner of a cube of edge length a. What is the total electric flux emerging through the entire surface of the cube?',
        options: ['q / ε₀', 'q / (6 ε₀)', 'q / (8 ε₀)', 'q / (24 ε₀)'],
        correctAnswer: 2,
        explanation:
          'By placing 8 identical cubes around the corner where charge q is situated, the charge is symmetrically enclosed at the center of a larger cube of side 2a. The total flux through the large cube is q/ε₀. Therefore, the flux through each of the 8 small cubes is q / (8 ε₀).',
        formulaUsed: '\\Phi = \\frac{q}{8\\varepsilon_0}',
      },
    ],
  },

  // 3. BERNOULLI'S PRINCIPLE & FLUID DYNAMICS
  {
    id: 'bernoulli-fluid-flow',
    chapterId: 'fluid-mechanics',
    category: 'mechanics',
    topic: "Fluid Dynamics & Bernoulli's Law",
    title: "Bernoulli's Principle & Torricelli's Efflux Law",
    subtitle: 'Venturimeter, pressure-velocity barter, viscous drag & terminal velocity',
    badge: 'JEE Core Fluid Law',
    description:
      "Explore conservation of energy in flowing fluids through Bernoulli's equation: P + 1/2 ρ v² + ρ g h = constant. Investigate velocity and pressure changes across pipe constrictions (Venturimeter), Torricelli tank drainage efflux v = √(2gh), aerodynamic dynamic lift, and Stokes viscous terminal velocity v_t = 2r²(ρ - σ)g / 9η.",
    assumptions: [
      'Ideal fluid: Incompressible (constant density ρ) and non-viscous (zero internal friction)',
      'Streamline, steady, and irrotational flow (no turbulence or eddies)',
      'Gravitational acceleration g = 9.8 m/s²',
      'Atmospheric pressure P₀ = 1.013 × 10⁵ Pa acting on exposed surfaces',
    ],
    simulationType: 'bernoulli-fluid-flow',
    parameters: [
      { id: 'tankHeight', label: 'Liquid Height in Tank (H)', symbol: 'H', unit: 'm', min: 1, max: 10, step: 0.2, defaultVal: 5, description: 'Total depth of liquid in reservoir' },
      { id: 'orificeHeight', label: 'Hole Height from Base (h)', symbol: 'h', unit: 'm', min: 0.2, max: 9, step: 0.2, defaultVal: 2, description: 'Height of orifice above ground' },
      { id: 'fluidDensity', label: 'Fluid Density (ρ)', symbol: 'ρ', unit: 'kg/m³', min: 700, max: 13600, step: 100, defaultVal: 1000, description: 'Water=1000, Oil=800, Mercury=13600' },
      { id: 'viscosity', label: 'Viscosity (η)', symbol: 'η', unit: 'mPa·s', min: 0.1, max: 50, step: 0.5, defaultVal: 1.0, description: 'Dynamic viscosity for Stokes drag' },
    ],
    formulas: [
      { name: "Bernoulli's Equation", latex: 'P + \\frac{1}{2} \\rho v^2 + \\rho g y = \\text{constant}', explanation: 'Conservation of mechanical energy per unit volume along any streamline in steady ideal fluid flow.' },
      { name: 'Equation of Continuity', latex: 'A_1 v_1 = A_2 v_2 = Q \\quad (\\text{Volume Flow Rate})', explanation: 'Mass conservation for incompressible fluid: fluid speeds up in narrower cross-sections.' },
      { name: "Torricelli's Efflux Velocity Law", latex: 'v_{\\text{efflux}} = \\sqrt{2 g (H - h)}', explanation: 'Speed of liquid emerging from an orifice at depth (H - h) below the free surface.' },
      { name: 'Horizontal Range of Jet on Ground', latex: 'R = 2 \\sqrt{h (H - h)}', explanation: 'Distance reached by water jet. Range is MAXIMUM R_max = H when hole is at midpoint h = H/2.' },
      { name: 'Stokes Drag & Terminal Velocity', latex: 'v_t = \\frac{2 r^2 (\\rho - \\sigma) g}{9 \\eta}', explanation: 'Constant terminal speed attained by spherical droplet of radius r falling through viscous fluid of density σ.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Maximum range theorem: A hole drilled at height h = H/2 from base produces the maximum horizontal range R_max = H.',
        'Two holes drilled at heights h₁ and h₂ where h₁ + h₂ = H yield the EXACT SAME horizontal range R = 2√(h₁(H - h₁)).',
        'Time taken to completely empty a tank of cross-section A through orifice of area a at base: t = (A/a) √(2H/g).',
      ],
      keyShortcuts: [
        'Venturi-meter flow rate: Q = A₁ A₂ √[ 2gh (ρ_m - ρ) / (ρ (A₁² - A₂²)) ].',
        'Excess pressure: Spherical liquid drop ΔP = 2T/R; Soap bubble in air (2 surfaces) ΔP = 4T/R.',
      ],
      trapAlerts: [
        'If the tank top is CLOSED and pressurized to pressure P > P₀, efflux velocity becomes v = √[ 2(P - P₀)/ρ + 2g(H - h) ].',
        'Remember that where velocity v is higher, static pressure P is LOWER (Venturi effect), NOT higher!',
      ],
    },
    jeeAdvanced: {
      weightage: 'Critical',
      deepConcepts: [
        'Unsteady Bernoulli equation with acceleration term: ∫ (∂v/∂t) ds + P/ρ + v²/2 + gz = C(t).',
        'Hydraulic jump, Reynolds number transition to turbulent flow (Re = ρ v D / η), and boundary layer friction drag.',
        'U-tube manometer accelerated horizontally with acceleration a_x: Free surfaces tilt at angle tan θ = a_x / g.',
      ],
      multiConceptLinks: [
        'Variable mass rocket propulsion using fluid efflux recoil force F_thrust = ρ a v² = 2 ρ a g h.',
        'Rotational liquid parabolic meniscus: In a rotating cylinder at angular speed ω, surface shape is z(r) = z₀ + (ω² r²) / (2g).',
      ],
      calculusFormulations: [
        '-\\frac{dh}{dt} A(h) = a \\sqrt{2gh} \\implies T_{\\text{empty}} = \\int_0^H \\frac{A(h)}{a \\sqrt{2gh}} dh',
      ],
      advancedPitfalls: [
        'When container is falling freely under gravity (g_eff = 0), water will NOT flow out of a hole in the bottom or side (efflux velocity becomes 0)!',
      ],
    },
    computeLiveQuantities: (params) => {
      const H = params.tankHeight;
      const h = params.orificeHeight;
      const g = 9.8;
      const depth = Math.max(0, H - h);
      const v_efflux = Math.sqrt(2 * g * depth);
      const range = 2 * Math.sqrt(h * depth);
      const timeOfFlight = Math.sqrt((2 * h) / g);

      return [
        { label: 'Efflux Velocity v', symbol: 'v_eff', unit: 'm/s', value: v_efflux, formatted: `${v_efflux.toFixed(2)} m/s`, color: 'text-cyan-400' },
        { label: 'Horizontal Range R', symbol: 'R', unit: 'm', value: range, formatted: `${range.toFixed(2)} m`, color: 'text-emerald-400' },
        { label: 'Time of Jet Flight', symbol: 't_flight', unit: 's', value: timeOfFlight, formatted: `${timeOfFlight.toFixed(2)} s`, color: 'text-amber-400' },
        { label: 'Dynamic Pressure (1/2 ρ v²)', symbol: 'q_dyn', unit: 'kPa', value: (0.5 * params.fluidDensity * v_efflux * v_efflux) / 1000, formatted: `${((0.5 * params.fluidDensity * v_efflux * v_efflux) / 1000).toFixed(1)} kPa`, color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'range-vs-h',
        title: 'Jet Range R vs Orifice Height h (Max at h = H/2)',
        xLabel: 'Hole Height h',
        yLabel: 'Horizontal Range R',
        xUnit: 'm',
        yUnit: 'm',
        color: '#10B981',
        type: 'distribution',
        calc: (params) => {
          const H = params.tankHeight;
          const points = [];
          for (let h_val = 0.1; h_val <= H; h_val += 0.2) {
            const R = 2 * Math.sqrt(h_val * Math.max(0, H - h_val));
            points.push({ x: parseFloat(h_val.toFixed(2)), y: parseFloat(R.toFixed(2)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'bf-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A cylindrical vessel of height 50 cm is filled to the brim with water. A small hole is drilled at a height h above the base. For what value of h will the horizontal distance reached by the liquid jet on the ground be maximum?',
        options: ['h = 10 cm', 'h = 25 cm', 'h = 35 cm', 'h = 50 cm'],
        correctAnswer: 1,
        explanation:
          'Range R = 2 \\sqrt{h(H - h)}. Differentiating R with respect to h and setting to zero yields h = H/2. Since H = 50 cm, maximum range occurs at h = 50/2 = 25 cm, and maximum range is R_max = H = 50 cm.',
        formulaUsed: 'h_{\\text{max range}} = \\frac{H}{2}',
      },
    ],
  },

  // 4. POLARIZATION & WAVE OPTICS (MALUS'S LAW & BREWSTER'S ANGLE)
  {
    id: 'wave-optics-polarization',
    chapterId: 'wave-optics',
    category: 'optics',
    topic: "Polarization & Wave Laws",
    title: "Polarization, Malus's Law & Brewster's Law",
    subtitle: 'Transverse wave nature of light, polarizers, analyzers, and Brewster polarizing angle',
    badge: 'Wave Proof of Light',
    description:
      "Witness the proof that light is a transverse wave through polarization. Manipulate unpolarized light entering a polarizer-analyzer system following Malus's Law I = I₀ cos² θ. Discover polarization by reflection at Brewster's angle tan(θ_p) = μ where reflected and refracted rays are perpendicular, and explore single-slit Fraunhofer diffraction.",
    assumptions: [
      'Monochromatic transverse electromagnetic wave propagation',
      'Ideal linear polarizers with 100% transmission along transmission axis and 0% across extinction axis',
      'Non-magnetic dielectric media with refractive index μ',
    ],
    simulationType: 'wave-optics-polarization',
    parameters: [
      { id: 'initialIntensity', label: 'Initial Unpolarized Intensity (I₀)', symbol: 'I₀', unit: 'W/m²', min: 10, max: 200, step: 10, defaultVal: 100, description: 'Intensity of incident unpolarized light beam' },
      { id: 'analyzerAngle', label: 'Analyzer Angle (θ)', symbol: 'θ', unit: 'deg', min: 0, max: 180, step: 5, defaultVal: 45, description: 'Angle between transmission axes of Polarizer and Analyzer' },
      { id: 'mediumIndex', label: 'Dielectric Medium Index (μ)', symbol: 'μ', unit: '', min: 1.2, max: 2.4, step: 0.05, defaultVal: 1.5, description: 'Refractive index of reflecting surface for Brewster experiment' },
      { id: 'numPolarizers', label: 'Polarizer Count', symbol: 'N', unit: 'filters', min: 2, max: 5, step: 1, defaultVal: 2, description: '2 for P+A, 3 for rotated sheet inserted between crossed pair' },
    ],
    formulas: [
      { name: "Malus's Law", latex: 'I = I_1 \\cos^2 \\theta = \\frac{1}{2} I_0 \\cos^2 \\theta', explanation: 'Intensity transmitted through an analyzer oriented at angle θ to polarized incident beam of intensity I₁ = I₀/2.' },
      { name: "Brewster's Law", latex: '\\tan \\theta_p = \\mu \\implies \\theta_p = \\arctan(\\mu)', explanation: 'Angle of incidence at which reflected light is 100% linearly polarized perpendicular to plane of incidence.' },
      { name: 'Brewster Condition for Reflected & Refracted Rays', latex: '\\theta_p + r = 90^\\circ', explanation: 'Reflected and refracted rays are exactly mutually perpendicular at Brewster angle of incidence.' },
      { name: 'Three Polarizer Transmission (Crossed + Middle at 45°)', latex: 'I_{\\text{out}} = \\frac{I_0}{2} \\cos^2(45^\\circ) \\cos^2(45^\\circ) = \\frac{I_0}{8}', explanation: 'Inserting a 45° filter between two crossed (90°) polarizers permits 12.5% of initial intensity to emerge.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Unpolarized light passed through ideal polarizer always emerges with intensity I₁ = I₀/2, regardless of polarizer orientation.',
        'Crossed polarizers (θ = 90°) block 100% light (I = 0). If a third polarizer at angle α to first is placed between them, emerging intensity is I = (I₀/2) sin²(2α) / 4.',
        'At Brewster angle, the reflected beam is completely polarized with electric vector parallel to the surface and perpendicular to plane of incidence.',
      ],
      keyShortcuts: [
        'For air-glass interface (μ = 1.5): θ_p = arctan(1.5) ≈ 56.3°.',
        'For air-water interface (μ = 4/3): θ_p = arctan(4/3) ≈ 53.1°.',
      ],
      trapAlerts: [
        'Do not confuse unpolarized light (emerges with I₀/2) with already linearly polarized light (emerges with I₁ cos²θ).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        "Fresnel's equations for s-polarized and p-polarized reflection and transmission coefficients.",
        'Optically active media (specific rotation [α] = θ / (L·c)) and Laurent half-shade polarimeter.',
        'Quarter-wave plate (phase retardance Δϕ = π/2) converting linear polarization to circular polarization.',
      ],
      multiConceptLinks: [
        'Wave-particle duality: Photon polarization state representation in quantum basis |H⟩ and |V⟩.',
      ],
      calculusFormulations: [
        'I_N = \\frac{I_0}{2} \\left[\\cos\\left(\\frac{\\pi/2}{N-1}\\right)\\right]^{2(N-1)} \\xrightarrow{N\\to\\infty} \\frac{I_0}{2}',
      ],
      advancedPitfalls: [
        'Brewster angle for light travelling from denser medium (μ₁) to rarer medium (μ₂) is θ_p = arctan(μ₂/μ₁). Notice that Brewster angle is ALWAYS smaller than critical angle for total internal reflection: tan θ_p < sin θ_c.',
      ],
    },
    computeLiveQuantities: (params) => {
      const I0 = params.initialIntensity;
      const theta_deg = params.analyzerAngle;
      const theta_rad = (theta_deg * Math.PI) / 180;
      const mu = params.mediumIndex;

      const I_pol = I0 / 2;
      const I_out = I_pol * Math.pow(Math.cos(theta_rad), 2);
      const brewsterAngle_deg = (Math.atan(mu) * 180) / Math.PI;

      return [
        { label: 'Transmitted Intensity I', symbol: 'I', unit: 'W/m²', value: I_out, formatted: `${I_out.toFixed(2)} W/m²`, color: 'text-amber-400' },
        { label: 'Transmission Efficiency', symbol: 'Eff', unit: '%', value: (I_out / I0) * 100, formatted: `${((I_out / I0) * 100).toFixed(1)} %`, color: 'text-emerald-400' },
        { label: "Brewster's Polarizing Angle", symbol: 'θ_p', unit: 'deg', value: brewsterAngle_deg, formatted: `${brewsterAngle_deg.toFixed(2)}°`, color: 'text-cyan-400' },
        { label: 'Refraction Angle at θ_p', symbol: 'r_p', unit: 'deg', value: 90 - brewsterAngle_deg, formatted: `${(90 - brewsterAngle_deg).toFixed(2)}°`, color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'intensity-vs-angle',
        title: "Malus's Law: Transmitted Intensity vs Analyzer Angle θ",
        xLabel: 'Analyzer Angle θ',
        yLabel: 'Intensity I',
        xUnit: 'deg',
        yUnit: 'W/m²',
        color: '#F59E0B',
        type: 'distribution',
        calc: (params) => {
          const I0 = params.initialIntensity;
          const I_pol = I0 / 2;
          const points = [];
          for (let deg = 0; deg <= 180; deg += 5) {
            const rad = (deg * Math.PI) / 180;
            const I = I_pol * Math.pow(Math.cos(rad), 2);
            points.push({ x: deg, y: parseFloat(I.toFixed(2)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'pol-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'Unpolarized light of intensity I₀ is incident on two crossed polarizers P₁ and P₂ (axes at 90°). A third polarizer P₃ is inserted between them with its transmission axis making an angle of 45° with P₁. What is the final transmitted intensity?',
        options: ['0', 'I₀ / 4', 'I₀ / 8', 'I₀ / 16'],
        correctAnswer: 2,
        explanation:
          'After P₁: I₁ = I₀/2. After P₃ (at 45° to P₁): I₂ = I₁ cos²(45°) = (I₀/2) × (1/2) = I₀/4. P₂ makes an angle of 45° with P₃: I₃ = I₂ cos²(45°) = (I₀/4) × (1/2) = I₀/8.',
        formulaUsed: 'I_{\\text{final}} = \\frac{I_0}{8}',
      },
    ],
  },

  // 5. STANDING WAVES & ORGAN PIPES
  {
    id: 'standing-waves-acoustics',
    chapterId: 'waves',
    category: 'waves-oscillations',
    topic: 'Standing Waves & Acoustic Resonance',
    title: 'Standing Waves on Strings & Organ Pipes',
    subtitle: 'Nodes, antinodes, harmonics, open vs. closed pipes, and end corrections',
    badge: 'JEE Wave Acoustics',
    description:
      'Master the physics of standing waves formed by the superposition of two identical waves traveling in opposite directions: y(x,t) = 2A sin(kx) cos(ωt). Explore resonant harmonic frequencies in open organ pipes f_n = n v / 2L and closed organ pipes f_n = (2n - 1) v / 4L, acoustic velocity v = √(γRT/M), and acoustic beats.',
    assumptions: [
      'Lossless medium with uniform linear mass density μ or air at temperature T',
      'Perfect reflections at boundaries: Displacement node at fixed end / closed pipe, Displacement antinode at free end / open pipe',
      'End correction e ≈ 0.6 R per open end',
    ],
    simulationType: 'standing-waves-acoustics',
    parameters: [
      { id: 'tubeLength', label: 'Pipe / String Length (L)', symbol: 'L', unit: 'm', min: 0.5, max: 4.0, step: 0.1, defaultVal: 1.5, description: 'Physical length of resonator' },
      { id: 'harmonicMode', label: 'Harmonic Mode (n)', symbol: 'n', unit: 'mode', min: 1, max: 6, step: 1, defaultVal: 2, description: '1 for Fundamental, 2 for 2nd Harmonic, etc.' },
      { id: 'soundSpeed', label: 'Wave Speed (v)', symbol: 'v', unit: 'm/s', min: 200, max: 600, step: 10, defaultVal: 340, description: 'Speed of sound in air or wave speed on stretched wire v=√(T/μ)' },
      { id: 'pipeType', label: 'Resonator Boundary Type', symbol: 'Type', unit: '0:Open, 1:Closed, 2:String', min: 0, max: 2, step: 1, defaultVal: 0, description: '0 for Open Pipe, 1 for Closed Pipe, 2 for String Fixed at Both Ends' },
    ],
    formulas: [
      { name: 'Standing Wave Wavefunction', latex: 'y(x,t) = 2A \\sin(kx) \\cos(\\omega t)', explanation: 'Superposition of incident wave A sin(kx - ωt) and reflected wave A sin(kx + ωt).' },
      { name: 'Open Organ Pipe Harmonics (Both ends open)', latex: 'f_n = n \\frac{v}{2(L + 2e)}, \\quad n = 1, 2, 3, \\dots', explanation: 'All harmonics (even and odd) are present. Fundamental frequency f₁ = v / 2L.' },
      { name: 'Closed Organ Pipe Harmonics (One end closed)', latex: 'f_n = (2n - 1) \\frac{v}{4(L + e)}, \\quad n = 1, 2, 3, \\dots', explanation: 'ONLY ODD harmonics (1st, 3rd, 5th...) are present. Fundamental frequency f₁ = v / 4L.' },
      { name: 'Speed of Sound in Ideal Gas (Laplace Formula)', latex: 'v = \\sqrt{\\frac{\\gamma R T}{M}} = \\sqrt{\\frac{\\gamma P}{\\rho}}', explanation: 'Acoustic wave velocity under adiabatic compression (Laplace correction γ = Cp/Cv).' },
      { name: 'Beats Frequency', latex: 'f_{\\text{beat}} = |f_1 - f_2|', explanation: 'Number of intensity maxima heard per second when two waves of slightly different frequencies interfere.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'An open organ pipe of length L has the SAME fundamental frequency as a closed organ pipe of length L/2.',
        'When a closed organ pipe is dipped in water up to half its length, its fundamental frequency doubles.',
        'Ratio of harmonics in Open Pipe: 1 : 2 : 3 : 4 : 5 ... (rich timbre). Ratio in Closed Pipe: 1 : 3 : 5 : 7 ...',
      ],
      keyShortcuts: [
        'Distance between two consecutive nodes or two consecutive antinodes is λ/2.',
        'Distance between an adjacent node and antinode is λ/4.',
      ],
      trapAlerts: [
        'End correction: Open pipe has TWO open ends (L_eff = L + 1.2 R), while closed pipe has ONE open end (L_eff = L + 0.6 R).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Pressure waves vs. Displacement waves: Pressure variation ΔP(x,t) is 90° (π/2) out of phase with displacement wave y(x,t). Displacement Node = Pressure Antinode!',
        'Energy density in standing waves: Total energy stored per wavelength is E = 2 (1/2 μ ω² A² λ) = μ ω² A² λ, with continuous barter between kinetic and elastic potential energy.',
      ],
      multiConceptLinks: [
        "Sonometer wire resonance with AC tuning fork and electromagnet.",
        "Resonance tube apparatus for precise determination of speed of sound in JEE experimental lab.",
      ],
      calculusFormulations: [
        '\\Delta P(x,t) = -B \\frac{\\partial y}{\\partial x} = -B k (2A) \\cos(kx) \\cos(\\omega t) = \\Delta P_0 \\cos(kx) \\cos(\\omega t)',
      ],
      advancedPitfalls: [
        'In closed pipe, the closed boundary is a DISPLACEMENT NODE (particles cannot move) but a PRESSURE ANTINODE (maximum pressure fluctuation).',
      ],
    },
    computeLiveQuantities: (params) => {
      const L = params.tubeLength;
      const v = params.soundSpeed;
      const n = params.harmonicMode;
      const type = params.pipeType;

      let freq = 0;
      let wavelength = 0;
      let nodeCount = 0;
      let antinodeCount = 0;

      if (type === 0 || type === 2) {
        // Open Pipe or String
        freq = (n * v) / (2 * L);
        wavelength = (2 * L) / n;
        nodeCount = type === 2 ? n + 1 : n;
        antinodeCount = type === 2 ? n : n + 1;
      } else {
        // Closed Pipe
        const harmonicNumber = 2 * n - 1;
        freq = (harmonicNumber * v) / (4 * L);
        wavelength = (4 * L) / harmonicNumber;
        nodeCount = n;
        antinodeCount = n;
      }

      return [
        { label: 'Resonant Frequency f', symbol: 'f_n', unit: 'Hz', value: freq, formatted: `${freq.toFixed(1)} Hz`, color: 'text-amber-400' },
        { label: 'Wavelength λ', symbol: 'λ', unit: 'm', value: wavelength, formatted: `${wavelength.toFixed(3)} m`, color: 'text-cyan-400' },
        { label: 'Nodes Count', symbol: 'N', unit: 'nodes', value: nodeCount, formatted: `${nodeCount}`, color: 'text-emerald-400' },
        { label: 'Antinodes Count', symbol: 'A', unit: 'antinodes', value: antinodeCount, formatted: `${antinodeCount}`, color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'wave-envelope',
        title: 'Standing Wave Amplitude Envelope |y(x)| along Pipe',
        xLabel: 'Position x',
        yLabel: 'Envelope Amplitude',
        xUnit: 'm',
        yUnit: 'arb',
        color: '#8B5CF6',
        type: 'distribution',
        calc: (params) => {
          const L = params.tubeLength;
          const n = params.harmonicMode;
          const type = params.pipeType;
          const points = [];

          const k = type === 1 ? ((2 * n - 1) * Math.PI) / (2 * L) : (n * Math.PI) / L;

          for (let x = 0; x <= L; x += L / 100) {
            const amp = Math.abs(Math.sin(k * x));
            points.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(amp.toFixed(3)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'sw-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'An open pipe of length 85 cm and a closed pipe of length L_c have their 3rd overtone frequencies equal. If the speed of sound is 340 m/s, what is the length of the closed pipe?',
        options: ['L_c = 74.375 cm', 'L_c = 85 cm', 'L_c = 42.5 cm', 'L_c = 99.2 cm'],
        correctAnswer: 0,
        explanation:
          '3rd overtone of open pipe = 4th harmonic = 4 × (v / 2 L_o) = 2 v / L_o. 3rd overtone of closed pipe = 7th harmonic = 7 × (v / 4 L_c). Equating both: 2 v / L_o = 7 v / (4 L_c) ⇒ L_c = (7/8) L_o = (7/8) × 85 cm = 74.375 cm.',
        formulaUsed: 'f_{\\text{3rd overtone, open}} = \\frac{4v}{2L_o}, \\quad f_{\\text{3rd overtone, closed}} = \\frac{7v}{4L_c}',
      },
    ],
  },

  // 6. RADIOACTIVE DECAY LAW & NUCLEAR PHYSICS
  {
    id: 'radioactivity-nuclear-decay',
    chapterId: 'nuclear-physics',
    category: 'modern',
    topic: 'Radioactive Decay Law & Nuclear Physics',
    title: 'Radioactive Decay Law & Nuclear Binding Energy',
    subtitle: 'Exponential decay, half-life, mean life, alpha/beta/gamma emissions, and Q-values',
    badge: 'Nuclear Physics Core',
    description:
      'Simulate nuclear transformations and Rutherford-Soddy law of radioactive decay N(t) = N₀ e^(-λt). Observe statistical decay of atomic nuclei, exponential decay curves, half-life T_1/2 = ln 2 / λ, activity A(t) = λ N(t), alpha/beta deflection in magnetic fields, and mass defect conversion E = Δm c².',
    assumptions: [
      'Spontaneous, purely statistical quantum tunneling / decay process',
      'Decay constant λ is independent of physical conditions (temperature, pressure, chemical bonds)',
      '1 atomic mass unit (1 u) = 931.5 MeV/c²',
    ],
    simulationType: 'radioactivity-nuclear-decay',
    parameters: [
      { id: 'initialNuclei', label: 'Initial Nuclei (N₀)', symbol: 'N₀', unit: 'nuclei', min: 100, max: 2000, step: 100, defaultVal: 1000, description: 'Initial population of parent undecayed nuclei' },
      { id: 'halfLife', label: 'Half-life (T_1/2)', symbol: 'T_½', unit: 's', min: 1, max: 20, step: 1, defaultVal: 5, description: 'Time required for half of radioactive nuclei to decay' },
      { id: 'decayType', label: 'Decay Particle Emission', symbol: 'Mode', unit: '0:Alpha, 1:Beta-, 2:Gamma', min: 0, max: 2, step: 1, defaultVal: 0, description: '0 for Alpha (He-4), 1 for Beta (Electron), 2 for Gamma (Photon)' },
      { id: 'magField', label: 'Deflecting Magnetic Field (B)', symbol: 'B', unit: 'Tesla', min: 0, max: 5, step: 0.5, defaultVal: 2, description: 'Field to observe trajectory deflection of charged nuclear rays' },
    ],
    formulas: [
      { name: 'Rutherford-Soddy Decay Law', latex: 'N(t) = N_0 e^{-\\lambda t} = N_0 \\left(\\frac{1}{2}\\right)^{t / T_{1/2}}', explanation: 'Exponential reduction of parent nuclei with time.' },
      { name: 'Half-Life & Decay Constant Relation', latex: 'T_{1/2} = \\frac{\\ln 2}{\\lambda} = \\frac{0.693}{\\lambda}', explanation: 'Time for population to reduce to 50% of initial value.' },
      { name: 'Mean Life (Average Lifetime τ)', latex: '\\tau = \\frac{1}{\\lambda} = \\frac{T_{1/2}}{\\ln 2} \\approx 1.443 T_{1/2}', explanation: 'Average life of all radioactive nuclei.' },
      { name: 'Radioactive Activity', latex: 'A(t) = -\\frac{dN}{dt} = \\lambda N(t) = A_0 e^{-\\lambda t}', explanation: 'Rate of disintegrations per second measured in Becquerels (1 Bq = 1 dps) or Curies (1 Ci = 3.7 × 10¹⁰ Bq).' },
      { name: 'Mass Defect & Nuclear Binding Energy', latex: 'E_b = \\Delta m \\cdot c^2 = \\left[ Z m_p + (A - Z) m_n - M_{\\text{nucleus}} \\right] \\times 931.5 \\text{ MeV}', explanation: 'Energy released in assembling nucleons into a stable nucleus.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Fraction undecayed after n half-lives: N/N₀ = (1/2)^n = (1/2)^(t / T_1/2).',
        'Fraction decayed after n half-lives: (N₀ - N)/N₀ = 1 - (1/2)^n.',
        'In successive radioactive decay (A → B → C), secular equilibrium occurs when A_A = A_B ⇒ λ_A N_A = λ_B N_B.',
      ],
      keyShortcuts: [
        'After 1 mean life (t = τ = 1/λ): Undecayed fraction is N/N₀ = 1/e ≈ 36.8%, decayed fraction is 63.2%.',
        'Alpha emission: A decreases by 4, Z decreases by 2. Beta minus emission: A unchanged, Z increases by 1.',
      ],
      trapAlerts: [
        'Units of activity: Remember that 1 Curie = 3.7 × 10¹⁰ disintegrations/second.',
        'Do not confuse atomic mass with nuclear mass (subtract electron masses for exact Q-value calculations in beta decay!).',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Simultaneous parallel decay: If a nucleus decays via two modes with constants λ₁ and λ₂, effective decay constant is λ_eff = λ₁ + λ₂, and effective half-life is 1/T_eff = 1/T₁ + 1/T₂.',
        'Radioactive series differential equations: dN_B/dt = λ_A N_A - λ_B N_B (Bateman equations).',
        'Conservation of linear momentum and kinetic energy distribution in alpha decay: K_alpha = [ (A - 4) / A ] × Q_value.',
      ],
      multiConceptLinks: [
        'Lorentz force separation of alpha (+2e, heavy), beta (-e, light), and gamma (neutral) rays in crossed E and B fields.',
      ],
      calculusFormulations: [
        'N_B(t) = \\frac{\\lambda_A N_0}{\\lambda_B - \\lambda_A} \\left( e^{-\\lambda_A t} - e^{-\\lambda_B t} \\right)',
      ],
      advancedPitfalls: [
        'In beta-plus decay, 2 electron masses are lost in the neutral atomic mass difference: Q = [ M(Z,A) - M(Z-1,A) - 2 m_e ] c².',
      ],
    },
    computeLiveQuantities: (params, t) => {
      const N0 = params.initialNuclei;
      const T_half = params.halfLife;
      const lambda = Math.LN2 / T_half;
      const current_N = N0 * Math.exp(-lambda * t);
      const decayed_N = N0 - current_N;
      const activity = lambda * current_N;

      return [
        { label: 'Remaining Nuclei N(t)', symbol: 'N(t)', unit: 'nuclei', value: Math.round(current_N), formatted: `${Math.round(current_N)} / ${N0}`, color: 'text-amber-400' },
        { label: 'Decayed Daughter Nuclei', symbol: 'N_decayed', unit: 'nuclei', value: Math.round(decayed_N), formatted: `${Math.round(decayed_N)}`, color: 'text-emerald-400' },
        { label: 'Live Activity A(t)', symbol: 'A(t)', unit: 'dps', value: activity, formatted: `${activity.toFixed(1)} Bq`, color: 'text-cyan-400' },
        { label: 'Mean Lifetime τ', symbol: 'τ', unit: 's', value: 1 / lambda, formatted: `${(1 / lambda).toFixed(2)} s`, color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'decay-curve',
        title: 'Radioactive Decay Curve N(t) vs Time t',
        xLabel: 'Time t',
        yLabel: 'Undecayed Nuclei N(t)',
        xUnit: 's',
        yUnit: 'nuclei',
        color: '#EC4899',
        type: 'time-series',
        calc: (params) => {
          const N0 = params.initialNuclei;
          const T_half = params.halfLife;
          const lambda = Math.LN2 / T_half;
          const points = [];
          for (let time = 0; time <= 40; time += 1) {
            const N = N0 * Math.exp(-lambda * time);
            points.push({ x: time, y: parseFloat(N.toFixed(1)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'rad-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A radioactive sample has a half-life of 20 minutes. What percentage of the initial sample will remain undecayed after 1 hour?',
        options: ['50 %', '25 %', '12.5 %', '6.25 %'],
        correctAnswer: 2,
        explanation:
          'Total time t = 60 minutes. Number of half-lives n = t / T_1/2 = 60 / 20 = 3. Remaining fraction N/N₀ = (1/2)³ = 1/8 = 0.125 = 12.5 %.',
        formulaUsed: '\\frac{N}{N_0} = \\left(\\frac{1}{2}\\right)^n',
      },
    ],
  },

  // 7. HEAT TRANSFER & RADIATION LAWS
  {
    id: 'heat-transfer-radiation',
    chapterId: 'heat-transfer',
    category: 'thermal',
    topic: 'Heat Transfer & Radiation Laws',
    title: "Radiation Laws: Stefan-Boltzmann & Wien's Displacement",
    subtitle: "Blackbody radiation, Stefan's Law, Wien's displacement, and Newton's Law of Cooling",
    badge: 'Thermal Radiation',
    description:
      "Explore thermal energy transfer via electromagnetic radiation. Study Stefan-Boltzmann Law P = e σ A (T⁴ - T₀⁴), blackbody spectral distribution curves, Wien's Displacement Law λ_max T = b, and the linear approximation in Newton's Law of Cooling for small temperature differences.",
    assumptions: [
      'Stefan-Boltzmann constant σ = 5.670 × 10⁻⁸ W/(m²·K⁴)',
      "Wien's displacement constant b = 2.898 × 10⁻³ m·K",
      'Blackbody emissivity e = 1.0 (for real surfaces 0 < e < 1)',
      'Temperatures must be expressed strictly in Kelvin (K = °C + 273.15)',
    ],
    simulationType: 'heat-transfer-radiation',
    parameters: [
      { id: 'bodyTemp', label: 'Body Temperature (T)', symbol: 'T', unit: 'K', min: 300, max: 6000, step: 50, defaultVal: 1500, description: 'Absolute surface temperature of radiator' },
      { id: 'ambientTemp', label: 'Surrounding Temp (T₀)', symbol: 'T₀', unit: 'K', min: 200, max: 400, step: 5, defaultVal: 300, description: 'Ambient environment temperature' },
      { id: 'emissivity', label: 'Surface Emissivity (e)', symbol: 'e', unit: '', min: 0.1, max: 1.0, step: 0.05, defaultVal: 0.8, description: '1.0 for Ideal Blackbody, <1 for real materials' },
      { id: 'surfaceArea', label: 'Surface Area (A)', symbol: 'A', unit: 'm²', min: 0.01, max: 2.0, step: 0.05, defaultVal: 0.5, description: 'Radiating surface area' },
    ],
    formulas: [
      { name: 'Stefan-Boltzmann Law (Net Radiation Power)', latex: 'P_{\\text{net}} = e \\sigma A \\left( T^4 - T_0^4 \\right)', explanation: 'Net rate of thermal radiation energy emitted by a body at temperature T in surroundings at T₀.' },
      { name: "Wien's Displacement Law", latex: '\\lambda_{\\max} T = b = 2.898 \\times 10^{-3} \\text{ m}\\cdot\\text{K}', explanation: 'Wavelength corresponding to peak spectral emission is inversely proportional to absolute temperature.' },
      { name: "Newton's Law of Cooling", latex: '-\\frac{dT}{dt} = K (T - T_0) \\implies T(t) = T_0 + (T_i - T_0) e^{-K t}', explanation: 'Linearized approximation valid for small temperature excess (T - T₀ << T₀).' },
      { name: "Fourier's Law of Thermal Conduction", latex: '\\frac{dQ}{dt} = \\frac{k A (T_1 - T_2)}{L}', explanation: 'Rate of heat conduction through a slab of thermal conductivity k, area A, and thickness L.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'If absolute temperature of a blackbody is doubled (T → 2T), radiated power increases by a factor of 2⁴ = 16 times!',
        'As temperature increases, peak emission wavelength λ_max shifts toward SHORTER wavelengths (higher frequencies, violet/UV).',
        "For Newton's cooling average approximation: (T₁ - T₂)/t = K [ (T₁ + T₂)/2 - T₀ ].",
      ],
      keyShortcuts: [
        'Solar surface temperature estimation via Wien Law: λ_max ≈ 500 nm (green light) ⇒ T_sun ≈ 2.898 × 10⁻³ / 500 × 10⁻⁹ ≈ 5800 K.',
        'Thermal resistance in series: R_eq = L₁/(k₁A) + L₂/(k₂A).',
      ],
      trapAlerts: [
        'Temperature in Stefan-Boltzmann Law MUST be in Kelvin (K). Converting (100°C)⁴ is NOT equal to (373 K)⁴!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        "Planck's Radiation Law: u(λ,T) = (8π h c / λ⁵) / [ e^(hc/λkT) - 1 ] and derivation of Stefan's Law by integrating over all wavelengths.",
        'Radiation cooling rate differential equation: dT/dt = - (e σ A / m s) (T⁴ - T₀⁴).',
        'Kirchhoff’s Law of Thermal Radiation: At thermal equilibrium, ratio of emissive power to absorptive power is equal for all bodies (e_λ / a_λ = E_blackbody). Good absorbers are good emitters!',
      ],
      multiConceptLinks: [
        'Thermodynamic equilibrium with radiation pressure P_rad = I / c (absorbing) or 2I / c (reflecting).',
      ],
      calculusFormulations: [
        '\\int_0^\\infty E_\\lambda d\\lambda = \\sigma T^4',
      ],
      advancedPitfalls: [
        'Do not apply Newton’s Law of cooling when temperature difference (T - T₀) is large (> 30°C). You must use the fourth-power Stefan differential equation!',
      ],
    },
    computeLiveQuantities: (params) => {
      const T = params.bodyTemp;
      const T0 = params.ambientTemp;
      const e = params.emissivity;
      const A = params.surfaceArea;
      const sigma = 5.670e-8;
      const b = 2.898e-3;

      const P_net = e * sigma * A * (Math.pow(T, 4) - Math.pow(T0, 4));
      const lambda_max_nm = (b / T) * 1e9;

      return [
        { label: 'Net Radiated Power P', symbol: 'P_net', unit: 'W', value: P_net, formatted: `${P_net.toFixed(1)} W`, color: 'text-amber-400' },
        { label: 'Peak Wavelength λ_max', symbol: 'λ_max', unit: 'nm', value: lambda_max_nm, formatted: `${lambda_max_nm.toFixed(1)} nm`, color: 'text-cyan-400' },
        { label: 'Emitted Power Emitted', symbol: 'P_emit', unit: 'kW', value: (e * sigma * A * Math.pow(T, 4)) / 1000, formatted: `${((e * sigma * A * Math.pow(T, 4)) / 1000).toFixed(2)} kW`, color: 'text-emerald-400' },
        { label: 'Spectral Color', symbol: 'Hue', unit: '', value: 0, formatted: T > 4000 ? 'White/Blue Hot' : T > 1200 ? 'Orange/Yellow Hot' : 'Dull Red / IR', color: 'text-purple-400' },
      ];
    },
    graphConfigs: [
      {
        id: 'planck-spectrum',
        title: 'Blackbody Emission Spectrum vs Wavelength λ',
        xLabel: 'Wavelength λ',
        yLabel: 'Spectral Radiance E(λ)',
        xUnit: 'nm',
        yUnit: 'arb',
        color: '#EF4444',
        type: 'distribution',
        calc: (params) => {
          const T = params.bodyTemp;
          const b = 2.898e-3;
          const lambda_peak = (b / T) * 1e9; // in nm
          const points = [];

          for (let lambda = 100; lambda <= 3000; lambda += 50) {
            const x = lambda / lambda_peak;
            // Planck shape function approximation: x^-5 / (exp(5/x) - 1) normalized
            const y = Math.pow(x, -5) / (Math.exp(4.965 / x) - 1);
            points.push({ x: lambda, y: parseFloat((y * 100).toFixed(2)) });
          }
          return points;
        },
      },
    ],
    questions: [
      {
        id: 'ht-q1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question:
          'A spherical blackbody of radius 12 cm radiates 450 W power at 500 K. If the radius were halved and the temperature doubled to 1000 K, what power would be radiated?',
        options: ['450 W', '900 W', '1800 W', '3600 W'],
        correctAnswer: 2,
        explanation:
          'Radiated power P ∝ A T⁴ ∝ R² T⁴. When radius is halved (R → R/2), area becomes A/4. When temperature is doubled (T → 2T), T⁴ becomes 16 T⁴. Therefore, new power P\' = P × (1/4) × 16 = 4 P = 4 × 450 W = 1800 W.',
        formulaUsed: 'P \\propto R^2 T^4',
      },
    ],
  },
];
