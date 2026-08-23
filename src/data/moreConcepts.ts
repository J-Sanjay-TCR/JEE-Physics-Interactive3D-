import { PhysicsConcept } from '../types';

export const MORE_CONCEPTS: PhysicsConcept[] = [
  // 13. MICROMETER SCREW GAUGE (EXPERIMENTAL PHYSICS)
  {
    id: 'screw-gauge',
    chapterId: 'units-dimensions',
    category: 'experimental',
    topic: 'Precision Measurement & Errors',
    title: 'Micrometer Screw Gauge & Zero Error',
    subtitle: 'Pitch p, Circular Scale Divisions (CSD), Least Count LC = Pitch/N, Backlash & Zero Correction',
    badge: 'Experimental Physics',
    simulationType: 'screw-gauge',
    description:
      'A micrometer screw gauge uses the principle of a screw and nut to measure thickness/diameter with high precision (0.01 mm). The linear displacement of the spindle corresponds directly to circular rotations of the thimble head.',
    assumptions: [
      'Uniform pitch of 0.5 mm or 1.0 mm along the main ratchet screw',
      'Circular scale divided into 50 or 100 equal graduations',
      'Zero error is properly recorded before placing the specimen',
    ],
    cameraPreset: { position: [0, 5, 18], target: [0, 0, 0] },
    parameters: [
      { id: 'objectThickness', label: 'Object Thickness (mm)', symbol: 'd_{real}', unit: 'mm', min: 0.1, max: 10.0, step: 0.05, defaultVal: 2.45, description: 'True diameter/thickness of wire or sheet' },
      { id: 'pitch', label: 'Screw Pitch (mm)', symbol: 'P', unit: 'mm', min: 0.5, max: 1.0, step: 0.5, defaultVal: 0.5, description: 'Distance advanced by spindle in 1 complete rotation' },
      { id: 'totalDivisions', label: 'Circular Divisions', symbol: 'N', unit: 'div', min: 50, max: 100, step: 50, defaultVal: 50, description: 'Number of divisions on circular thimble' },
      { id: 'zeroError', label: 'Zero Error (div)', symbol: 'e_{zero}', unit: 'div', min: -5, max: 5, step: 1, defaultVal: 2, description: '+ve if 0 mark is below baseline, -ve if above' },
      { id: 'uncertainty', label: 'Measurement Uncertainty (±Δd)', symbol: 'Δd', unit: 'mm', min: 0.002, max: 0.100, step: 0.002, defaultVal: 0.010, description: 'Instrumental precision tolerance and thread backlash error margin (±Δd)' },
      { id: 'sampleTrials', label: 'Experimental Sample Scatter', symbol: 'N_{pts}', unit: 'pts', min: 1, max: 10, step: 1, defaultVal: 6, description: 'Number of repeated micro-measurement trials plotted in 3D' },
    ],
    formulas: [
      { name: 'Least Count (LC)', latex: 'LC = \\frac{\\text{Pitch (P)}}{\\text{Total Circular Scale Divisions (N)}} = \\frac{0.5\\text{ mm}}{50} = 0.01\\text{ mm}', explanation: 'Smallest measurable length increment.' },
      { name: 'Main Scale Reading (MSR)', latex: 'MSR = n \\times \\text{Pitch}', explanation: 'Visible linear millimeter marks uncovered by thimble sleeve.' },
      { name: 'Circular Scale Reading (CSR)', latex: 'CSR = CSD \\times LC', explanation: 'Division on circular scale coinciding with main reference baseline.' },
      { name: 'True Measured Thickness', latex: '\\text{True Reading} = (MSR + CSR) - (\\text{Zero Error})', explanation: 'Corrected measurement accounting for positive or negative zero offset.' },
      { name: 'Error Margin & Confidence Band', latex: 'd = d_{\\text{true}} \\pm \\Delta d \\implies [d - \\Delta d, d + \\Delta d]', explanation: 'Experimental uncertainty interval around measured wire thickness.' },
      { name: 'Angular Uncertainty of Thimble', latex: '\\Delta \\theta = \\left( \\frac{\\Delta d}{\\text{Pitch}} \\right) \\times 360^\\circ', explanation: 'Angular rotational uncertainty corresponding to linear error margin.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Positive Zero Error: When anvils touch, if 0 of circular scale lies BELOW reference line, error is positive and MUST BE SUBTRACTED.',
        'Negative Zero Error: If 0 of circular scale lies ABOVE reference line, error is negative (e = -(N - CSD) × LC) and MUST BE ADDED.',
        'Backlash Error: Caused by wear and tear of screw threads. Avoided by turning ratchet in only one direction while taking measurement.',
      ],
      keyShortcuts: [
        'Direct True Reading: True = MSR + (Coinciding Div - Zero Error Div) × LC.',
        'Percentage Error: Δd / d × 100 = (LC / d) × 100%.',
      ],
      trapAlerts: [
        'Watch out for half-millimeter marks on main scale! If pitch is 0.5 mm, an uncovered graduation represents 0.5 mm, not 1.0 mm!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Combined Error Propagation: Density ρ = 4m / (π d² L) => Δρ/ρ = Δm/m + 2(Δd/d) + ΔL/L. Note the factor of 2 on diameter d!',
        'Measurement of thin wire cross-section and Young Modulus using Searle apparatus.',
      ],
      multiConceptLinks: [
        'Error analysis in resistance determination of wire: R = ρ L / (π r²).',
      ],
      calculusFormulations: [
        'Logarithmic differentiation for maximal relative error bounds: d(ln f) = Σ |(∂ ln f / ∂ x_i)| dx_i.',
      ],
      advancedPitfalls: [
        'Always use the ratchet to tighten the spindle onto the specimen; over-tightening the thimble damages the screw pitch.',
      ],
    },
    questions: [
      {
        id: 'q-screw-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A screw gauge with pitch 0.5 mm and 50 circular divisions has a positive zero error of +3 divisions. While measuring wire diameter, MSR is 2.5 mm and circular scale reads 38. The true diameter is:',
        options: ['2.85 mm', '2.88 mm', '2.82 mm', '2.535 mm'],
        correctAnswer: 0,
        explanation: 'Least Count LC = 0.5 mm / 50 = 0.01 mm. Observed Reading = MSR + CSR = 2.5 mm + 38 × 0.01 mm = 2.88 mm. Zero Error = +3 × 0.01 = +0.03 mm. True Reading = 2.88 - 0.03 = 2.85 mm.',
        formulaUsed: '\\text{True Reading} = \\text{Observed} - \\text{Zero Error}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const lc = p.pitch / p.totalDivisions;
      const zeroErrorMM = p.zeroError * lc;
      const observed = p.objectThickness + zeroErrorMM;
      const msr = Math.floor(observed / p.pitch) * p.pitch;
      const rem = observed - msr;
      const csd = Math.round(rem / lc);
      const trueReading = (msr + csd * lc) - zeroErrorMM;
      const deltaD = p.uncertainty ?? 0.010;
      const relErrorPct = (deltaD / Math.max(0.01, trueReading)) * 100;
      const angularUncertaintyDeg = (deltaD / p.pitch) * 360;

      return [
        { label: 'Least Count (LC)', symbol: 'LC', unit: 'mm', value: lc, formatted: `${lc.toFixed(3)} mm`, color: '#38bdf8' },
        { label: 'Main Scale (MSR)', symbol: 'MSR', unit: 'mm', value: msr, formatted: `${msr.toFixed(2)} mm`, color: '#4ade80' },
        { label: 'Circular Coincidence', symbol: 'CSD', unit: 'div', value: csd, formatted: `${csd} div`, color: '#f59e0b' },
        { label: 'Zero Error', symbol: 'e_{zero}', unit: 'mm', value: zeroErrorMM, formatted: `${zeroErrorMM >= 0 ? '+' : ''}${zeroErrorMM.toFixed(3)} mm`, color: '#a855f7' },
        { label: 'True Thickness', symbol: 'd_{true}', unit: 'mm', value: trueReading, formatted: `${trueReading.toFixed(3)} mm`, color: '#10b981' },
        { label: 'Error Margin (±Δd)', symbol: '±Δd', unit: 'mm', value: deltaD, formatted: `±${deltaD.toFixed(3)} mm`, color: '#ec4899' },
        { label: 'Confidence Interval', symbol: '[d_{min}, d_{max}]', unit: 'mm', value: deltaD, formatted: `[${(trueReading - deltaD).toFixed(3)}, ${(trueReading + deltaD).toFixed(3)}] mm`, color: '#06b6d4' },
        { label: 'Angular Uncertainty', symbol: '±Δθ', unit: '°', value: angularUncertaintyDeg, formatted: `±${angularUncertaintyDeg.toFixed(1)}°`, color: '#eab308' },
        { label: 'Relative Precision', symbol: 'Δd/d', unit: '%', value: relErrorPct, formatted: `±${relErrorPct.toFixed(2)}%`, color: '#6366f1' },
      ];
    },
  },

  // 14. CIRCULAR MOTION & BANKING OF ROADS
  {
    id: 'circular-motion',
    chapterId: 'laws-of-motion',
    category: 'mechanics',
    topic: 'Dynamics of Circular Motion',
    title: 'Banking of Roads & Centripetal Dynamics',
    subtitle: 'Optimum banking angle tanθ = v²/Rg, maximum safe speed v_max = √[Rg(tanθ + μ)/(1 - μ tanθ)] & friction limits',
    badge: 'Mechanics Core',
    simulationType: 'circular-motion',
    description:
      'When a vehicle negotiates a curved horizontal or banked road of radius R, centripetal force is provided by the horizontal component of normal reaction and lateral friction. Optimum banking eliminates tire wear at design speed.',
    assumptions: [
      'Uniform circular motion on a circular arc of radius R',
      'Vehicle modeled as a point particle on inclined track',
      'Coulomb friction model with static coefficient μ_s',
    ],
    cameraPreset: { position: [14, 12, 20], target: [0, 2, 0] },
    parameters: [
      { id: 'radius', label: 'Curve Radius (R)', symbol: 'R', unit: 'm', min: 10, max: 100, step: 5, defaultVal: 35, description: 'Curvature radius of circular road' },
      { id: 'velocity', label: 'Vehicle Speed (v)', symbol: 'v', unit: 'm/s', min: 5, max: 40, step: 1, defaultVal: 18, description: 'Speed of vehicle negotiating the turn' },
      { id: 'theta', label: 'Banking Angle (θ)', symbol: '\\theta', unit: '°', min: 0, max: 45, step: 5, defaultVal: 20, description: 'Inclination angle of road surface' },
      { id: 'mu', label: 'Friction Coeff (μ)', symbol: '\\mu', unit: '', min: 0.0, max: 0.8, step: 0.05, defaultVal: 0.35, description: 'Coefficient of static friction between tire and tarmac' },
    ],
    formulas: [
      { name: 'Optimum Speed (Zero Friction)', latex: 'v_0 = \\sqrt{R g \\tan\\theta}', explanation: 'Speed where vehicle negotiates turn with zero lateral friction requirement.' },
      { name: 'Maximum Safe Speed (v_max)', latex: 'v_{max} = \\sqrt{R g \\left( \\frac{\\tan\\theta + \\mu}{1 - \\mu \\tan\\theta} \\right)}', explanation: 'Upper speed limit before vehicle slips outwards up the banked incline.' },
      { name: 'Minimum Safe Speed (v_min)', latex: 'v_{min} = \\sqrt{R g \\left( \\frac{\\tan\\theta - \\mu}{1 + \\mu \\tan\\theta} \\right)} \\quad (\\text{for } \\tan\\theta > \\mu)', explanation: 'Lower speed threshold below which vehicle slides downwards.' },
      { name: 'Centripetal Acceleration', latex: 'a_c = \\frac{v^2}{R} = \\omega^2 R', explanation: 'Inward radial acceleration directed toward center of curvature.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Unbanked flat road (θ = 0°): Safe speed v_max = √(μ g R).',
        'Conical Pendulum: Tension T = mg / cosθ, Time period T_p = 2π √(L cosθ / g).',
        'Bending of a cyclist on unbanked curve: tanθ = v² / (Rg) with the vertical.',
      ],
      keyShortcuts: [
        'Critical speed in Vertical Circle: Top v_top = √(gR), Bottom v_bottom = √(5gR), Midpoint v_mid = √(3gR).',
        'Tension difference in vertical circle: T_bottom - T_top = 6 mg (always constant!).',
      ],
      trapAlerts: [
        'Centrifugal force is a PSEUDO force that exists ONLY in rotating non-inertial frame of reference! In ground inertial frame, centripetal force is provided by real physical forces.',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Toppling vs Sliding condition for vehicle of width 2a and height of COM h: Vehicle topples before sliding if h/a < 1/μ.',
        'Non-uniform vertical circular motion: Total acceleration a_net = √(a_c² + a_t²).',
      ],
      multiConceptLinks: [
        'Loop-the-loop track combined with spring launcher and energy conservation.',
      ],
      calculusFormulations: [
        'Tangential and radial vectors in polar coordinates: v = ṙ r̂ + r θ̇ θ̂, a = (r̈ - r θ̇²) r̂ + (r θ̈ + 2 ṙ θ̇) θ̂.',
      ],
      advancedPitfalls: [
        'For string in vertical circle, string goes slack when Tension T = 0. For rod/pipe with mass at end, motion is completed as long as speed at top v_top ≥ 0.',
      ],
    },
    questions: [
      {
        id: 'q-circ-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A car is traveling along a circular banked road of radius 50 m with banking angle 45°. If g = 10 m/s² and friction is negligible, the optimum speed of the car is:',
        options: ['22.36 m/s', '50 m/s', '15.8 m/s', '31.6 m/s'],
        correctAnswer: 0,
        explanation: 'Optimum speed v_0 = √(R g tanθ) = √(50 × 10 × tan45°) = √500 ≈ 22.36 m/s (approx 80.5 km/h).',
        formulaUsed: 'v_0 = \\sqrt{R g \\tan\\theta}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const g = 9.8;
      const thetaRad = (p.theta * Math.PI) / 180;
      const tanT = Math.tan(thetaRad);
      const v0 = Math.sqrt(p.radius * g * tanT);
      const vMax = Math.sqrt(p.radius * g * ((tanT + p.mu) / Math.max(0.01, 1 - p.mu * tanT)));
      const vMin = tanT > p.mu ? Math.sqrt(p.radius * g * ((tanT - p.mu) / (1 + p.mu * tanT))) : 0;
      const ac = (p.velocity * p.velocity) / p.radius;

      return [
        { label: 'Optimum Speed (v₀)', symbol: 'v_0', unit: 'm/s', value: v0, formatted: `${v0.toFixed(1)} m/s`, color: '#38bdf8' },
        { label: 'Max Safe Speed (v_max)', symbol: 'v_{max}', unit: 'm/s', value: vMax, formatted: `${vMax.toFixed(1)} m/s`, color: '#ef4444' },
        { label: 'Min Safe Speed (v_min)', symbol: 'v_{min}', unit: 'm/s', value: vMin, formatted: `${vMin.toFixed(1)} m/s`, color: '#4ade80' },
        { label: 'Centripetal Acc (a_c)', symbol: 'a_c', unit: 'm/s²', value: ac, formatted: `${ac.toFixed(1)} m/s²`, color: '#f59e0b' },
      ];
    },
  },

  // 15. PURE ROLLING MOTION ON INCLINE
  {
    id: 'pure-rolling-motion',
    chapterId: 'rotational-motion',
    category: 'mechanics',
    topic: 'Rigid Body Dynamics & Pure Rolling',
    title: 'Pure Rolling Motion & Conservation of Energy',
    subtitle: 'Condition v_cm = ωR, acceleration a = (g sinθ) / (1 + I/mR²), friction f_s = [I/(I + mR²)] mg sinθ & race of bodies',
    badge: 'Rotational Motion Elite',
    simulationType: 'pure-rolling-motion',
    description:
      'Pure rolling is combined translational and rotational motion without slipping. The point of contact with ground has instantaneous velocity ZERO (v_contact = v_cm - ωR = 0), and static friction does ZERO work.',
    assumptions: [
      'Rigid symmetrical body (solid sphere, hollow sphere, disc, or ring) rolling down inclined plane',
      'No slipping / skidding at the instantaneous contact point',
      'Sufficient static friction coefficient μ_s to sustain pure rolling',
    ],
    cameraPreset: { position: [0, 8, 20], target: [0, 3, 0] },
    parameters: [
      { id: 'theta', label: 'Incline Angle (θ)', symbol: '\\theta', unit: '°', min: 10, max: 60, step: 5, defaultVal: 30, description: 'Ramp inclination angle' },
      { id: 'shapeFactor', label: 'Shape Factor (k²/R²)', symbol: 'k^2/R^2', unit: '', min: 0.4, max: 1.0, step: 0.1, defaultVal: 0.5, description: '0.4 = Solid Sphere, 0.5 = Solid Disc, 0.67 = Hollow Sphere, 1.0 = Ring' },
      { id: 'R', label: 'Radius (R)', symbol: 'R', unit: 'm', min: 0.5, max: 2.5, step: 0.1, defaultVal: 1.2, description: 'Radius of rolling cylinder / sphere' },
      { id: 'mass', label: 'Mass (m)', symbol: 'm', unit: 'kg', min: 1, max: 10, step: 1, defaultVal: 2, description: 'Mass of the rolling body' },
    ],
    formulas: [
      { name: 'Acceleration on Incline', latex: 'a = \\frac{g \\sin\\theta}{1 + \\frac{I_{cm}}{mR^2}} = \\frac{g \\sin\\theta}{1 + \\beta}', explanation: 'Linear acceleration of center of mass down the ramp.' },
      { name: 'Minimum Friction Required', latex: '\\mu_{min} = \\frac{\\beta}{1 + \\beta} \\tan\\theta', explanation: 'Static friction threshold to prevent slipping down incline.' },
      { name: 'Total Kinetic Energy', latex: 'K_{total} = K_{trans} + K_{rot} = \\frac{1}{2}m v_{cm}^2 + \\frac{1}{2}I \\omega^2 = \\frac{1}{2}m v_{cm}^2 (1 + \\beta)', explanation: 'Energy distributed between linear motion and spin.' },
      { name: 'Speed at Bottom of Ramp (Height h)', latex: 'v_{bottom} = \\sqrt{\\frac{2gh}{1 + \\beta}}', explanation: 'Velocity attained after descending vertical height h.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Race of bodies rolling down incline: Body with smallest β = k²/R² reaches bottom FIRST with highest velocity: v_SolidSphere > v_Disc > v_HollowSphere > v_Ring.',
        'Work done by friction during pure rolling is ZERO because the point of contact is at rest relative to the surface.',
        'Instantaneous Axis of Rotation (IAOR) passes through the instantaneous point of contact with ground.',
      ],
      keyShortcuts: [
        'Fraction of translational KE: K_trans / K_total = 1 / (1 + β).',
        'Fraction of rotational KE: K_rot / K_total = β / (1 + β).',
      ],
      trapAlerts: [
        'Direction of friction on rolling body: On incline descending under gravity, static friction acts UP THE INCLINE to provide restoring counter-torque!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Rolling with slipping (Kinetic friction phase): When μ < μ_min, body accelerates under kinetic friction f_k = μ_k N until v = ωR is established at time t = v_0 / [μ g (1 + 1/β)].',
        'Billiard ball hit by cue stick at height h above center: Condition for immediate pure rolling without initial slipping is h = 2/5 R (for solid sphere).',
      ],
      multiConceptLinks: [
        'Angular momentum conservation about contact point IAOR: L_contact = I_IAOR ω.',
      ],
      calculusFormulations: [
        'Torque equation about COM: τ_cm = I_cm α = f_s R, and Force equation: m g sinθ - f_s = m a.',
      ],
      advancedPitfalls: [
        'Never take torque about a point accelerating non-inertially unless you include pseudo-force torque about that point!',
      ],
    },
    questions: [
      {
        id: 'q-roll-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A solid sphere (I = 2/5 mR²) and a uniform solid cylinder (I = 1/2 mR²) of equal mass and radius roll down the same inclined plane without slipping. The ratio of their accelerations a_sphere / a_cylinder is:',
        options: ['15 / 14', '14 / 15', '7 / 5', '5 / 7'],
        correctAnswer: 0,
        explanation: 'a = (g sinθ) / (1 + β). For solid sphere: a_s = (g sinθ) / (1 + 2/5) = 5/7 g sinθ. For cylinder: a_c = (g sinθ) / (1 + 1/2) = 2/3 g sinθ. Ratio a_s / a_c = (5/7) / (2/3) = 15/14 ≈ 1.07.',
        formulaUsed: 'a = \\frac{g\\sin\\theta}{1 + \\beta}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const g = 9.8;
      const thetaRad = (p.theta * Math.PI) / 180;
      const beta = p.shapeFactor;
      const a = (g * Math.sin(thetaRad)) / (1 + beta);
      const muMin = (beta / (1 + beta)) * Math.tan(thetaRad);
      const kTransFraction = 1 / (1 + beta);
      const kRotFraction = beta / (1 + beta);

      return [
        { label: 'Linear Acceleration (a)', symbol: 'a', unit: 'm/s²', value: a, formatted: `${a.toFixed(2)} m/s²`, color: '#38bdf8' },
        { label: 'Min Friction Req (μ_min)', symbol: '\\mu_{min}', unit: '', value: muMin, formatted: `${muMin.toFixed(3)}`, color: '#ef4444' },
        { label: 'Translational KE %', symbol: 'K_{trans}/K', unit: '%', value: kTransFraction * 100, formatted: `${(kTransFraction * 100).toFixed(1)}%`, color: '#4ade80' },
        { label: 'Rotational KE %', symbol: 'K_{rot}/K', unit: '%', value: kRotFraction * 100, formatted: `${(kRotFraction * 100).toFixed(1)}%`, color: '#f59e0b' },
      ];
    },
  },

  // 16. ELECTROMAGNETIC INDUCTION & FARADAY-LENZ LAW
  {
    id: 'electromagnetic-induction',
    chapterId: 'emi-ac',
    category: 'electromagnetism',
    topic: 'Electromagnetic Induction & Flux Linkage',
    title: 'Faraday-Lenz Law & Motional EMF',
    subtitle: 'Magnetic flux Φ = B·A cosθ, induced EMF ε = -dΦ/dt, Lenz direction opposition & Motional EMF ε = Bvl',
    badge: 'Electrodynamics Core',
    simulationType: 'electromagnetic-induction',
    description:
      'A change in magnetic flux linked with a closed conducting circuit induces an electromotive force (EMF) ε = -N(dΦ/dt). By Lenz law, the induced current flows in a direction that opposes the magnetic flux change that produced it.',
    assumptions: [
      'Conducting cylindrical solenoid coil of N turns and cross-sectional area A',
      'Bar magnet oscillating along symmetry axis of coil',
      'Ohmic circuit with total loop resistance R',
    ],
    cameraPreset: { position: [0, 8, 16], target: [0, 0, 0] },
    parameters: [
      { id: 'magnetSpeed', label: 'Magnet Speed (v)', symbol: 'v', unit: 'm/s', min: 1, max: 10, step: 1, defaultVal: 4, description: 'Oscillation frequency / speed of magnet' },
      { id: 'magnetDistance', label: 'Stroke Length', symbol: 'x_{max}', unit: 'cm', min: 2, max: 10, step: 1, defaultVal: 6, description: 'Distance magnet penetrates through coil' },
      { id: 'turns', label: 'Coil Turns (N)', symbol: 'N', unit: 'turns', min: 50, max: 500, step: 50, defaultVal: 200, description: 'Number of turns in solenoid coil' },
      { id: 'resistance', label: 'Loop Resistance (R)', symbol: 'R', unit: 'Ω', min: 1, max: 20, step: 1, defaultVal: 5, description: 'Internal and external electrical resistance' },
    ],
    formulas: [
      { name: 'Faraday Law of Induction', latex: '\\varepsilon = -N \\frac{d\\Phi_B}{dt} = -N \\frac{d}{dt}(\\vec{B}\\cdot\\vec{A})', explanation: 'Induced EMF is proportional to time rate of change of magnetic flux linkage.' },
      { name: 'Motional EMF (Conducting Rod)', latex: '\\varepsilon = \\vec{v} \\times \\vec{B} \\cdot \\vec{l} = B v l', explanation: 'EMF generated across length l of conductor slicing through field B.' },
      { name: 'Induced Electric Field (Non-Conservative)', latex: '\\oint \\vec{E}_{ind} \\cdot d\\vec{l} = -\\frac{d\\Phi_B}{dt}', explanation: 'Induced electric field is non-conservative with closed electric field loops.' },
      { name: 'Self & Mutual Inductance', latex: 'L = \\frac{N\\Phi}{I} = \\mu_0 n^2 A l,\\quad M = \\mu_0 n_1 n_2 A l', explanation: 'Flux linked per unit driving current.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Total charge flown through circuit during flux change: Δq = |ΔΦ_total| / R = N |ΔΦ| / R (INDEPENDENT of time taken!).',
        'Self-inductance energy storage in magnetic field: U_B = (1/2) L I² with energy density u_B = B² / (2 μ_0).',
        'LR transient circuit current during growth: I(t) = I_0 (1 - e^(-t/τ)) where time constant τ = L/R.',
      ],
      keyShortcuts: [
        'Rotating conducting rod in uniform B field about one end: ε = (1/2) B ω l².',
        'Rotating disc of radius R in uniform B: ε = (1/2) B ω R² between center and rim.',
      ],
      trapAlerts: [
        'Lenz law enforces conservation of energy! If the induced current did not oppose the flux change, it would create self-amplifying energy out of nothing!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Terminal velocity of falling conducting loop under gravity in magnetic field: v_term = (m g R) / (B² l²).',
        'Eddy currents and magnetic damping / electromagnetic braking in solid conductors.',
      ],
      multiConceptLinks: [
        'Coupled inductors with dot convention and mutual inductance coefficient k = M / √(L₁ L₂).',
      ],
      calculusFormulations: [
        'Maxwell-Faraday differential equation: ∇ × E = -∂B/∂t.',
      ],
      advancedPitfalls: [
        'Potential difference between two points in an induced electric field is PATH DEPENDENT because ∮ E · dl ≠ 0!',
      ],
    },
    questions: [
      {
        id: 'q-emi-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A coil of resistance 10 Ω and 100 turns has a magnetic flux through it changing from 0.05 Wb to 0.01 Wb in 0.2 seconds. The total charge flown through the coil is:',
        options: ['0.4 C', '0.04 C', '4.0 C', '0.2 C'],
        correctAnswer: 0,
        explanation: 'Total charge Δq = N |ΔΦ| / R = 100 × |0.01 - 0.05| / 10 = 100 × 0.04 / 10 = 0.4 Coulombs.',
        formulaUsed: '\\Delta q = \\frac{N |\\Delta \\Phi|}{R}',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p, simTime) => {
      const omega = p.magnetSpeed * 0.8;
      const x = Math.sin(simTime * omega) * (p.magnetDistance / 100);
      const v = Math.cos(simTime * omega) * omega * (p.magnetDistance / 100);
      const B_est = 0.5 / (1 + (x * x) * 1000);
      const dPhiDt = B_est * v * 0.005;
      const emf = Math.abs(p.turns * dPhiDt);
      const current = (emf / p.resistance) * 1000; // mA

      return [
        { label: 'Instantaneous EMF', symbol: '\\varepsilon(t)', unit: 'V', value: emf, formatted: `${emf.toFixed(2)} V`, color: '#38bdf8' },
        { label: 'Induced Current', symbol: 'I(t)', unit: 'mA', value: current, formatted: `${current.toFixed(1)} mA`, color: '#22c55e' },
        { label: 'Magnet Velocity', symbol: 'v(t)', unit: 'm/s', value: v, formatted: `${v.toFixed(2)} m/s`, color: '#f59e0b' },
        { label: 'Opposition State', symbol: 'Lenz', unit: '', value: 1, formatted: v >= 0 ? 'Repelling (N pole)' : 'Attracting (S pole)', color: '#a855f7' },
      ];
    },
  },

  // 17. PHOTOELECTRIC EFFECT & EINSTEIN'S EQUATION
  {
    id: 'photoelectric-effect',
    chapterId: 'modern-physics',
    category: 'modern',
    topic: 'Dual Nature of Radiation & Matter',
    title: 'Photoelectric Effect & Stopping Potential',
    subtitle: 'Einstein equation hν = Φ + K_max, stopping potential eV₀ = hν - Φ, threshold frequency ν₀ & de Broglie wavelength λ = h/p',
    badge: 'Modern Physics Core',
    simulationType: 'photoelectric-effect',
    description:
      'When light of frequency ν greater than threshold frequency ν₀ illuminates a photosensitive metal plate, photoelectrons are ejected instantaneously. The maximum kinetic energy depends strictly on light frequency, not on intensity.',
    assumptions: [
      'Monochromatic photon beam with energy E = hν',
      'One-to-one photon-electron quantum interaction',
      'Clean metallic cathode surface with uniform work function Φ₀',
    ],
    cameraPreset: { position: [0, 8, 16], target: [0, 0, 0] },
    parameters: [
      { id: 'frequency', label: 'Frequency (×10¹⁴ Hz)', symbol: '\\nu', unit: '×10¹⁴ Hz', min: 4.0, max: 15.0, step: 0.5, defaultVal: 8.0, description: 'Frequency of incident UV / visible photons' },
      { id: 'workFunction', label: 'Work Function (Φ)', symbol: '\\Phi_0', unit: 'eV', min: 1.8, max: 5.0, step: 0.1, defaultVal: 2.3, description: 'Minimum energy required to liberate an electron from metal' },
      { id: 'intensity', label: 'Light Intensity (I)', symbol: 'I', unit: 'W/m²', min: 1, max: 10, step: 1, defaultVal: 5, description: 'Number of incident photons per unit area per second' },
      { id: 'retardingV', label: 'Retarding Voltage (V)', symbol: 'V', unit: 'V', min: -5, max: 5, step: 0.2, defaultVal: 0, description: 'Opposing potential between cathode and anode' },
    ],
    formulas: [
      { name: 'Einstein Photoelectric Equation', latex: 'h\\nu = \\Phi_0 + K_{max} = h\\nu_0 + e V_0', explanation: 'Energy conservation in single photon-electron collision.' },
      { name: 'Stopping Potential (V₀)', latex: 'V_0 = \\left(\\frac{h}{e}\\right)\\nu - \\frac{\\Phi_0}{e}', explanation: 'Reverse voltage that completely reduces photocurrent to zero.' },
      { name: 'Threshold Wavelength (λ₀)', latex: '\\lambda_0 = \\frac{hc}{\\Phi_0} = \\frac{12400\\text{ eV}\\cdot\\text{Å}}{\\Phi_0}', explanation: 'Maximum wavelength of light that can cause photoelectric emission.' },
      { name: 'de Broglie Wavelength of Electron', latex: '\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2m K}} = \\frac{12.27}{\\sqrt{V}}\\text{ Å}', explanation: 'Matter wavelength of electron accelerated through potential V.' },
    ],
    jeeMain: {
      weightage: 'Essential',
      commonPatterns: [
        'Slope of V₀ vs ν graph is ALWAYS h/e = constant (universal for ALL metals!).',
        'Intercept on frequency axis gives threshold frequency ν₀, intercept on voltage axis gives -Φ/e.',
        'Photocurrent is directly proportional to LIGHT INTENSITY (number of photons), independent of frequency.',
        'Stopping potential is INDEPENDENT of light intensity, depends ONLY on frequency ν.',
      ],
      keyShortcuts: [
        'Photon energy shortcut: E(eV) = 12400 / λ(Å) = 1240 / λ(nm).',
        'de Broglie wavelength for thermal neutron at temperature T: λ = h / √(3mkT).',
      ],
      trapAlerts: [
        'Photoelectric emission is instantaneous (< 10⁻⁹ s) even with extremely low light intensity, completely proving the failure of classical wave theory!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Radiation pressure on perfectly reflecting surface: P = 2I/c, on perfectly absorbing surface: P = I/c.',
        'Photon flux and quantum efficiency η = (number of photoelectrons emitted) / (number of incident photons).',
      ],
      multiConceptLinks: [
        'Photoelectric effect coupled with magnetic deflection of emitted electrons in uniform B field: r_max = √(2m K_max) / (eB).',
      ],
      calculusFormulations: [
        'Relativistic de Broglie wavelength: λ = hc / √(E² - m₀² c⁴).',
      ],
      advancedPitfalls: [
        'If incident frequency ν < ν₀, NO electrons are emitted no matter how intense the light beam is!',
      ],
    },
    questions: [
      {
        id: 'q-photo-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'Light of frequency 1.5 times the threshold frequency is incident on a photosensitive material. If the frequency is halved and intensity is doubled, the photocurrent becomes:',
        options: ['Zero', 'Doubled', 'Halved', 'Four times'],
        correctAnswer: 0,
        explanation: 'Initial frequency ν = 1.5 ν₀. New frequency ν_new = 1.5 ν₀ / 2 = 0.75 ν₀. Since ν_new < ν₀ (below threshold frequency), NO photoelectric emission occurs, and photocurrent is strictly ZERO.',
        formulaUsed: '\\nu < \\nu_0 \\implies I_{photo} = 0',
      },
    ],
    graphConfigs: [
      {
        id: 'i-vs-v',
        title: 'Photocurrent vs Collector Potential (I vs V)',
        xLabel: 'Collector Potential (V)',
        yLabel: 'Photocurrent (I)',
        xUnit: 'V',
        yUnit: 'μA',
        color: '#06b6d4',
        type: 'distribution',
        calc: (p) => {
          const h_eVs = 4.1357e-15;
          const nu_Hz = (p.frequency || 8.0) * 1e14;
          const photonE = h_eVs * nu_Hz;
          const phi = p.workFunction || 2.3;
          const Kmax = Math.max(0, photonE - phi);
          const V0 = Kmax;
          const I_sat = (p.intensity || 5) * 2.4;
          const pts = [];
          for (let v = -4.0; v <= 4.0; v += 0.2) {
            let i_val = 0;
            if (Kmax > 0) {
              if (v <= -V0) {
                i_val = 0;
              } else if (v >= 0) {
                i_val = I_sat;
              } else {
                i_val = I_sat * Math.pow((Kmax + v) / Kmax, 1.25);
              }
            }
            pts.push({ x: parseFloat(v.toFixed(2)), y: parseFloat(i_val.toFixed(2)) });
          }
          return pts;
        },
      },
      {
        id: 'v0-vs-nu',
        title: 'Stopping Potential vs Frequency (V₀ vs ν)',
        xLabel: 'Frequency (ν)',
        yLabel: 'Stopping Potential (V₀)',
        xUnit: '×10¹⁴ Hz',
        yUnit: 'V',
        color: '#f59e0b',
        type: 'distribution',
        calc: (p) => {
          const phi = p.workFunction || 2.3;
          const nu0 = phi / 4.1357e-15 / 1e14;
          const pts = [];
          for (let nu = 4.0; nu <= 15.0; nu += 0.5) {
            const v0 = Math.max(0, 0.41357 * nu - phi);
            pts.push({ x: parseFloat(nu.toFixed(1)), y: parseFloat(v0.toFixed(2)) });
          }
          return pts;
        },
      },
    ],
    computeLiveQuantities: (p) => {
      const h_eVs = 4.1357e-15;
      const nu_Hz = p.frequency * 1e14;
      const photonE_eV = h_eVs * nu_Hz;
      const nu0_Hz = (p.workFunction / h_eVs);
      const nu0_scaled = nu0_Hz / 1e14;
      const Kmax_eV = Math.max(0, photonE_eV - p.workFunction);
      const V0 = Kmax_eV;
      const lambda0_nm = 1240 / p.workFunction;
      const appliedV = p.retardingV || 0;
      const I_sat = p.intensity * 2.4;
      let activeCurrent = 0;
      if (Kmax_eV > 0) {
        if (appliedV >= 0) activeCurrent = I_sat;
        else if (appliedV > -V0) activeCurrent = I_sat * Math.pow((Kmax_eV + appliedV) / Kmax_eV, 1.25);
        else activeCurrent = 0;
      }
      const deBroglie_A = Kmax_eV > 0 ? 12.27 / Math.sqrt(Kmax_eV) : 0;

      return [
        { label: 'Photon Energy (hν)', symbol: 'E_{photon}', unit: 'eV', value: photonE_eV, formatted: `${photonE_eV.toFixed(2)} eV`, color: '#38bdf8' },
        { label: 'Max Kinetic Energy', symbol: 'K_{max}', unit: 'eV', value: Kmax_eV, formatted: `${Kmax_eV.toFixed(2)} eV`, color: '#4ade80' },
        { label: 'Stopping Potential (V₀)', symbol: 'V_0', unit: 'V', value: V0, formatted: `${V0.toFixed(2)} V`, color: '#ef4444' },
        { label: 'Active Photocurrent (I)', symbol: 'I_{photo}', unit: 'μA', value: activeCurrent, formatted: `${activeCurrent.toFixed(1)} μA`, color: '#10b981' },
        { label: 'Threshold Frequency', symbol: '\\nu_0', unit: '×10¹⁴ Hz', value: nu0_scaled, formatted: `${nu0_scaled.toFixed(2)} ×10¹⁴ Hz`, color: '#f59e0b' },
        { label: 'Electron Matter Wavelength', symbol: '\\lambda_{dB}', unit: 'Å', value: deBroglie_A, formatted: deBroglie_A > 0 ? `${deBroglie_A.toFixed(2)} Å` : 'N/A', color: '#a855f7' },
      ];
    },
  },

  // 18. THERMODYNAMICS & PV CYCLES (CARNOT ENGINE)
  {
    id: 'thermo-pv-cycle',
    chapterId: 'thermodynamics',
    category: 'thermal',
    topic: 'Laws of Thermodynamics & Carnot Cycles',
    title: 'Carnot Heat Engine & PV Indicator Diagrams',
    subtitle: 'First Law ΔQ = ΔU + W, Carnot efficiency η = 1 - T_C/T_H = W/Q_H, Isothermal & Adiabatic work done',
    badge: 'Thermodynamics Core',
    simulationType: 'thermo-pv-cycle',
    description:
      'The Carnot cycle is an ideal reversible thermodynamic cycle operating between two temperatures T_H and T_C comprising two isothermal and two adiabatic processes. It sets the theoretical maximum efficiency for any heat engine.',
    assumptions: [
      'Ideal gas working substance obeying equation of state PV = nRT',
      'Frictionless movable piston with perfectly conducting base and insulated walls',
      'All 4 strokes (isothermal & adiabatic expansion/compression) are quasi-static and reversible',
    ],
    cameraPreset: { position: [0, 8, 16], target: [0, 0, 0] },
    parameters: [
      { id: 'T_hot', label: 'Source Temp (T_H)', symbol: 'T_H', unit: 'K', min: 400, max: 1000, step: 25, defaultVal: 600, description: 'Absolute temperature of hot reservoir' },
      { id: 'T_cold', label: 'Sink Temp (T_C)', symbol: 'T_C', unit: 'K', min: 200, max: 400, step: 10, defaultVal: 300, description: 'Absolute temperature of cold sink' },
      { id: 'compressionRatio', label: 'Compression Ratio', symbol: 'r', unit: '', min: 1.5, max: 4.0, step: 0.25, defaultVal: 2.5, description: 'Volume expansion ratio V₂/V₁' },
      { id: 'gamma', label: 'Adiabatic Index (γ)', symbol: '\\gamma', unit: '', min: 1.3, max: 1.67, step: 0.05, defaultVal: 1.4, description: 'Cp/Cv: 1.67 for monoatomic, 1.4 for diatomic' },
    ],
    formulas: [
      { name: 'First Law of Thermodynamics', latex: '\\Delta Q = \\Delta U + W = n C_v \\Delta T + \\int P dV', explanation: 'Conservation of energy in thermodynamic processes.' },
      { name: 'Carnot Engine Efficiency', latex: '\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W_{net}}{Q_H} = \\frac{Q_H - Q_C}{Q_H}', explanation: 'Maximum possible efficiency of heat engine operating between T_H and T_C.' },
      { name: 'Isothermal Work Done', latex: 'W_{iso} = n R T \\ln\\left(\\frac{V_2}{V_1}\\right) = n R T \\ln\\left(\\frac{P_1}{P_2}\\right)', explanation: 'Work done at constant temperature (ΔU = 0, Q = W).' },
      { name: 'Adiabatic Process Equations', latex: 'P V^\\gamma = \\text{const},\\quad T V^{\\gamma - 1} = \\text{const},\\quad W_{adia} = \\frac{P_1 V_1 - P_2 V_2}{\\gamma - 1} = \\frac{n R (T_1 - T_2)}{\\gamma - 1}', explanation: 'Work done with zero heat exchange (ΔQ = 0, W = -ΔU).' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Area enclosed by closed PV loop gives net work done per cycle: W_net = ∮ P dV (clockwise = positive engine work, counter-clockwise = refrigerator work).',
        'Molar specific heat capacities: Monoatomic (Cv = 3/2 R, Cp = 5/2 R, γ = 5/3), Diatomic (Cv = 5/2 R, Cp = 7/2 R, γ = 7/5).',
        'Coefficient of Performance of Refrigerator: β = Q_C / W = T_C / (T_H - T_C) = (1 - η) / η.',
      ],
      keyShortcuts: [
        'Slope of Adiabatic curve is γ times steeper than Isothermal curve: (dP/dV)_adia = γ (dP/dV)_iso.',
        'Molar heat capacity in polytropic process PV^x = C: C = Cv + R / (1 - x).',
      ],
      trapAlerts: [
        'Internal energy U of an ideal gas depends ONLY on absolute temperature T: ΔU = n Cv ΔT for ANY process, not just isochoric!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Free expansion of gas into vacuum: Irreversible adiabatic process where W = 0, Q = 0, ΔU = 0, and ΔT = 0, but entropy ΔS > 0.',
        'Entropy change in reversible process: ΔS = ∫ dQ_rev / T. In Carnot cycle, ∮ dQ/T = 0 (Clausius theorem).',
      ],
      multiConceptLinks: [
        'Kinetic theory link: RMS speed v_rms = √(3RT/M), Mean speed v_avg = √(8RT/πM), Most probable speed v_mp = √(2RT/M).',
      ],
      calculusFormulations: [
        'Second law entropy formulation: dS ≥ dQ / T for any isolated natural system.',
      ],
      advancedPitfalls: [
        'Never use temperatures in Celsius (°C) when computing Carnot efficiency or gas laws; always convert to Kelvin (K = °C + 273.15)!',
      ],
    },
    questions: [
      {
        id: 'q-thermo-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A Carnot engine operates between source temperature 500 K and sink temperature 300 K. If it absorbs 1000 J of heat from the source per cycle, the work done per cycle is:',
        options: ['400 J', '600 J', '200 J', '500 J'],
        correctAnswer: 0,
        explanation: 'Efficiency η = 1 - T_C / T_H = 1 - 300/500 = 1 - 0.6 = 0.40 (40%). Work done W = η × Q_H = 0.40 × 1000 J = 400 J.',
        formulaUsed: 'W = \\left(1 - \\frac{T_C}{T_H}\\right) Q_H',
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const eta = 1 - (p.T_cold / p.T_hot);
      const etaPercent = eta * 100;
      const COP = p.T_cold / (p.T_hot - p.T_cold);
      const QH = 1000; // J assumed
      const Wnet = QH * eta;
      const QC = QH - Wnet;

      return [
        { label: 'Carnot Efficiency (η)', symbol: '\\eta', unit: '%', value: etaPercent, formatted: `${etaPercent.toFixed(1)}%`, color: '#38bdf8' },
        { label: 'Work Done / 1kJ Heat', symbol: 'W_{net}', unit: 'J', value: Wnet, formatted: `${Wnet.toFixed(1)} J`, color: '#4ade80' },
        { label: 'Heat Rejected to Sink', symbol: 'Q_C', unit: 'J', value: QC, formatted: `${QC.toFixed(1)} J`, color: '#ef4444' },
        { label: 'Refrigerator COP', symbol: '\\beta', unit: '', value: COP, formatted: `${COP.toFixed(2)}`, color: '#f59e0b' },
      ];
    },
  },

  // 19. DOPPLER EFFECT (SOUND WAVES & ACOUSTICS)
  {
    id: 'doppler-effect',
    chapterId: 'waves',
    category: 'waves-oscillations',
    topic: 'Acoustics & Sound Wave Phenomena',
    title: 'Doppler Effect in Sound Waves',
    subtitle: 'Apparent frequency f\' = f [(v ± v_O) / (v ∓ v_S)], compressed wavefronts, sonic booms & echo radar beats',
    badge: 'Acoustics Master',
    simulationType: 'doppler-effect',
    description:
      'The Doppler effect is the perceived shift in frequency of a wave when the source and observer are in relative motion. When approaching, compressed wavefronts cause an apparent increase in frequency; when receding, rarefied wavefronts decrease perceived pitch.',
    assumptions: [
      'Sound propagates in isotropic medium at speed v = 340 m/s',
      'Source and observer moving along straight line connection (or at angle θ)',
      'Sub-sonic speeds (v_source < v_sound)',
    ],
    cameraPreset: { position: [0, 10, 20], target: [0, 0, 0] },
    parameters: [
      { id: 'sourceSpeed', label: 'Source Speed (v_S)', symbol: 'v_S', unit: 'm/s', min: -50, max: 50, step: 5, defaultVal: 20, description: '+ve toward observer, -ve away' },
      { id: 'soundSpeed', label: 'Speed of Sound (v)', symbol: 'v', unit: 'm/s', min: 300, max: 360, step: 5, defaultVal: 340, description: 'Speed of sound in air at ambient temperature' },
      { id: 'frequency', label: 'Source Frequency (f₀)', symbol: 'f_0', unit: 'Hz', min: 200, max: 1000, step: 50, defaultVal: 440, description: 'Original natural acoustic frequency emitted' },
      { id: 'obsSpeed', label: 'Observer Speed (v_O)', symbol: 'v_O', unit: 'm/s', min: -30, max: 30, step: 5, defaultVal: 0, description: '+ve toward source, -ve away' },
    ],
    formulas: [
      { name: 'General Doppler Formula', latex: "f' = f_0 \\left( \\frac{v \\pm v_O}{v \\mp v_S} \\right)", explanation: 'Upper signs for approach (frequency increases), lower signs for recession (frequency decreases).' },
      { name: 'Source Moving Towards Stationary Observer', latex: "f' = f_0 \\left( \\frac{v}{v - v_S} \\right), \\quad \\lambda' = \\lambda_0 \\left( \\frac{v - v_S}{v} \\right)", explanation: 'Wavelength physically compresses in front of moving source.' },
      { name: 'Observer Moving Towards Stationary Source', latex: "f' = f_0 \\left( \\frac{v + v_O}{v} \\right), \\quad \\lambda' = \\lambda_0", explanation: 'Wavelength unchanged in medium, but relative speed of wave encounter increases.' },
      { name: 'Echo / Reflection from Moving Wall', latex: "f'' = f_0 \\left( \\frac{v + v_{wall}}{v - v_{wall}} \\right)", explanation: 'Double Doppler shift upon reflection from moving boundary.' },
    ],
    jeeMain: {
      weightage: 'High',
      commonPatterns: [
        'Beat frequency from reflected sound: f_beat = |f\'\' - f₀|.',
        'Oblique Doppler shift: When source moves at angle θ to line of sight: f\' = f₀ [v / (v - v_S cosθ)].',
        'Wind blowing with speed w in direction of sound: Replace v with (v + w) in all terms.',
      ],
      keyShortcuts: [
        'Fractional frequency change for small velocities (v_S << v): Δf / f₀ ≈ ±(v_rel / v).',
        'Apparent pitch change when train crosses listener: f_approach / f_recede = (v + v_S) / (v - v_S).',
      ],
      trapAlerts: [
        'Doppler effect for sound is ASYMMETRIC (requires a physical medium). Moving source does NOT yield identical frequency to moving observer even with same relative velocity!',
      ],
    },
    jeeAdvanced: {
      weightage: 'High',
      deepConcepts: [
        'Mach Cone & Shock Waves: When source speed v_S > v_sound, Mach angle sinα = v/v_S = 1/Mach_Number.',
        'Standing Waves in Organ Pipes: Closed pipe f_n = (2n - 1) v / 4L (odd harmonics only), Open pipe f_n = n v / 2L (all harmonics).',
      ],
      multiConceptLinks: [
        'Resonance tube experiment: v = 2f (l₂ - l₁) and end correction e = (l₂ - 3l₁) / 2 = 0.6 r.',
      ],
      calculusFormulations: [
        'Apparent frequency vs time profile for source passing at perpendicular distance d: f\'(t) = f₀ [v / (v - v_S (v_S t) / √(d² + v_S² t²))].',
      ],
      advancedPitfalls: [
        'End correction e = 0.6 r must be added for each open end (1e for closed pipe, 2e for open pipe)!',
      ],
    },
    questions: [
      {
        id: 'q-dop-1',
        type: 'mcq',
        difficulty: 'JEE Main',
        question: 'A train moving at 34 m/s blows a whistle of frequency 500 Hz towards a stationary observer. If the speed of sound is 340 m/s, the apparent frequency heard is:',
        options: ['555.6 Hz', '450 Hz', '500 Hz', '534 Hz'],
        correctAnswer: 0,
        explanation: "f' = f₀ [v / (v - v_S)] = 500 × [340 / (340 - 34)] = 500 × (340 / 306) = 500 × 1.1111 = 555.56 Hz.",
        formulaUsed: "f' = f_0 \\left(\\frac{v}{v - v_S}\\right)",
      },
    ],
    graphConfigs: [],
    computeLiveQuantities: (p) => {
      const v = p.soundSpeed;
      const vs = p.sourceSpeed;
      const vo = p.obsSpeed;
      const f0 = p.frequency;

      const f_app = f0 * ((v + vo) / Math.max(10, v - vs));
      const lambda_front = ((v - vs) / v) * (v / f0);
      const deltaF = f_app - f0;

      return [
        { label: 'Apparent Frequency (f\')', symbol: "f'", unit: 'Hz', value: f_app, formatted: `${f_app.toFixed(1)} Hz`, color: '#38bdf8' },
        { label: 'Frequency Shift (Δf)', symbol: '\\Delta f', unit: 'Hz', value: deltaF, formatted: `${deltaF >= 0 ? '+' : ''}${deltaF.toFixed(1)} Hz`, color: deltaF >= 0 ? '#4ade80' : '#ef4444' },
        { label: 'Shifted Wavelength (λ\')', symbol: "\\lambda'", unit: 'm', value: lambda_front, formatted: `${lambda_front.toFixed(2)} m`, color: '#f59e0b' },
        { label: 'Mach Number', symbol: 'M', unit: '', value: Math.abs(vs) / v, formatted: `${(Math.abs(vs) / v).toFixed(2)}`, color: '#a855f7' },
      ];
    },
  },
];
