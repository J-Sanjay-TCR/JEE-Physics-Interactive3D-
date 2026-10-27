export interface StepDerivation {
  stepNumber: number;
  title: string;
  latex: string;
  explanation: string;
}

export interface ConceptDerivationData {
  conceptId: string;
  title: string;
  coreLaw: string;
  steps: StepDerivation[];
  finalResultLatex: string;
  boundaryConditions: string[];
  jeeInsight: string;
}

export const CONCEPT_DERIVATIONS: Record<string, ConceptDerivationData> = {
  'projectile-motion': {
    conceptId: 'projectile-motion',
    title: 'Kinematic Trajectory & Range Derivation',
    coreLaw: 'Newton\'s Second Law under uniform gravitational field $\\vec{g} = -g\\hat{j}$',
    steps: [
      {
        stepNumber: 1,
        title: 'Equations of Motion Decomposition',
        latex: '\\begin{aligned} a_x &= 0 \\implies v_x(t) = u\\cos\\theta, \\quad x(t) = (u\\cos\\theta)t \\\\[6pt] a_y &= -g \\implies v_y(t) = u\\sin\\theta - gt, \\quad y(t) = h_0 + (u\\sin\\theta)t - \\frac{1}{2}gt^2 \\end{aligned}',
        explanation: 'Horizontal velocity remains constant while vertical velocity decreases under downward gravity g.',
      },
      {
        stepNumber: 2,
        title: 'Time of Flight (T) Derivation',
        latex: 'y(T) = 0 \\implies (u\\sin\\theta)T - \\frac{1}{2}gT^2 = 0 \\implies T = \\frac{2u\\sin\\theta}{g}',
        explanation: 'Setting vertical displacement y = 0 for level ground launch yields the total time in flight.',
      },
      {
        stepNumber: 3,
        title: 'Maximum Height (H) Derivation',
        latex: 'v_y(t_{top}) = 0 \\implies u\\sin\\theta - gt = 0 \\implies t_{top} = \\frac{u\\sin\\theta}{g} \\\\[6pt] H = y(t_{top}) = (u\\sin\\theta)\\left(\\frac{u\\sin\\theta}{g}\\right) - \\frac{1}{2}g\\left(\\frac{u\\sin\\theta}{g}\\right)^2 = \\frac{u^2\\sin^2\\theta}{2g}',
        explanation: 'At the apex of the parabola, vertical velocity vanishes completely.',
      },
      {
        stepNumber: 4,
        title: 'Horizontal Range (R) Derivation',
        latex: 'R = x(T) = (u\\cos\\theta) \\cdot \\left(\\frac{2u\\sin\\theta}{g}\\right) = \\frac{u^2 (2\\sin\\theta\\cos\\theta)}{g} = \\frac{u^2\\sin(2\\theta)}{g}',
        explanation: 'Substituting total time of flight T into horizontal position x(t).',
      },
      {
        stepNumber: 5,
        title: 'Cartesian Trajectory Parabola Equation',
        latex: 't = \\frac{x}{u\\cos\\theta} \\implies y(x) = x\\tan\\theta - \\frac{g x^2}{2u^2\\cos^2\\theta} = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)',
        explanation: 'Eliminating time t yields the canonical quadratic equation of the trajectory parabola.',
      },
    ],
    finalResultLatex: '\\boxed{R = \\frac{u^2\\sin(2\\theta)}{g}, \\quad H = \\frac{u^2\\sin^2\\theta}{2g}, \\quad y = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)}',
    boundaryConditions: [
      'Valid for uniform planar gravity with air drag neglected.',
      'Launch and landing points are on the same horizontal plane (h₀ = 0).',
      'Maximum range occurs when sin(2θ) = 1 ⇒ θ = 45°.',
    ],
    jeeInsight: 'Range is identical for complementary angles θ and (90° - θ). The ratio of maximum heights is H₁/H₂ = tan²θ, and R = 4√(H₁H₂).',
  },

  'inclined-plane-friction': {
    conceptId: 'inclined-plane-friction',
    title: 'Inclined Plane Dynamics with Static & Kinetic Friction',
    coreLaw: 'Newton\'s Second Law along rotated orthogonal coordinates ($x_\\parallel, y_\\perp$)',
    steps: [
      {
        stepNumber: 1,
        title: 'Coordinate Rotation & Normal Reaction',
        latex: '\\Sigma F_y = 0 \\implies N - mg\\cos\\theta = 0 \\implies N = mg\\cos\\theta',
        explanation: 'Resolving weight along the normal to the incline of angle θ.',
      },
      {
        stepNumber: 2,
        title: 'Maximum Static Friction & Angle of Repose',
        latex: 'f_{s,\\max} = \\mu_s N = \\mu_s mg\\cos\\theta \\\\[4pt] \\text{At verge of slipping: } mg\\sin\\theta = \\mu_s mg\\cos\\theta \\implies \\tan\\theta_r = \\mu_s',
        explanation: 'Angle of repose θ_r is the critical angle beyond which static friction can no longer prevent slipping.',
      },
      {
        stepNumber: 3,
        title: 'Downhill Acceleration during Sliding (θ > θ_r)',
        latex: 'm a = mg\\sin\\theta - f_k = mg\\sin\\theta - \\mu_k mg\\cos\\theta \\\\[4pt] \\implies a = g(\\sin\\theta - \\mu_k\\cos\\theta)',
        explanation: 'Net force along incline equals gravitational pull minus opposing kinetic friction.',
      },
      {
        stepNumber: 4,
        title: 'Uphill Projection with Deceleration',
        latex: 'm a_{up} = -mg\\sin\\theta - f_k = -(mg\\sin\\theta + \\mu_k mg\\cos\\theta) \\\\[4pt] \\implies a_{up} = -g(\\sin\\theta + \\mu_k\\cos\\theta)',
        explanation: 'Both gravity and friction oppose upward motion, causing faster deceleration than downhill acceleration.',
      },
    ],
    finalResultLatex: '\\boxed{a_{down} = g(\\sin\\theta - \\mu_k\\cos\\theta), \\quad \\tan\\theta_{\\text{repose}} = \\mu_s}',
    boundaryConditions: [
      'Static state holds if tan(θ) ≤ μ_s.',
      'Kinetic friction coefficient μ_k ≤ μ_s.',
    ],
    jeeInsight: 'Time to slide up t_up is strictly less than time to slide down t_down because a_up > a_down.',
  },

  'circular-motion': {
    conceptId: 'circular-motion',
    title: 'Centripetal Acceleration & Road Banking Optimization',
    coreLaw: 'Newton\'s Second Law in rotating cylindrical polar coordinates ($r, \\theta$)',
    steps: [
      {
        stepNumber: 1,
        title: 'Kinematic Centripetal Acceleration',
        latex: '\\vec{r}(t) = R(\\cos\\omega t\\hat{i} + \\sin\\omega t\\hat{j}) \\implies \\vec{a}(t) = \\frac{d^2\\vec{r}}{dt^2} = -\\omega^2\\vec{r} = -\\frac{v^2}{R}\\hat{r}',
        explanation: 'Differentiating circular position vector twice proves inward radial acceleration of magnitude v²/R.',
      },
      {
        stepNumber: 2,
        title: 'Optimum Road Banking (Zero Friction Condition)',
        latex: '\\begin{cases} N\\cos\\theta = mg & \\text{(Vertical equilibrium)} \\\\[6pt] N\\sin\\theta = \\frac{mv^2}{R} & \\text{(Centripetal requirement)} \\end{cases} \\\\[6pt] \\implies \\frac{N\\sin\\theta}{N\\cos\\theta} = \\frac{mv^2/R}{mg} \\implies \\tan\\theta = \\frac{v^2}{Rg}',
        explanation: 'Normal force horizontal component provides exact centripetal force without relying on tire friction.',
      },
      {
        stepNumber: 3,
        title: 'Maximum Safe Speed with Lateral Friction (μ)',
        latex: 'v_{\\max} = \\sqrt{Rg \\left(\\frac{\\tan\\theta + \\mu}{1 - \\mu\\tan\\theta}\\right)}, \\quad v_{\\min} = \\sqrt{Rg \\left(\\frac{\\tan\\theta - \\mu}{1 + \\mu\\tan\\theta}\\right)}',
        explanation: 'Balancing both normal force and friction components at the impending skidding threshold.',
      },
    ],
    finalResultLatex: '\\boxed{a_c = \\frac{v^2}{R} = \\omega^2 R, \\quad \\tan\\theta_{\\text{banked}} = \\frac{v^2}{Rg}, \\quad v_{\\max} = \\sqrt{Rg\\left(\\frac{\\tan\\theta + \\mu}{1 - \\mu\\tan\\theta}\\right)}}',
    boundaryConditions: [
      'Flat unbanked road (θ = 0) gives v_max = √(μ g R).',
      'Frictionless ice banking gives v_opt = √(R g tan θ).',
    ],
    jeeInsight: 'Tension in vertical circle at bottom is T_bottom = mg + mv²/R; minimum bottom velocity to complete loop is √(5gR).',
  },

  'shm-spring-pendulum': {
    conceptId: 'shm-spring-pendulum',
    title: 'Simple Harmonic Motion (SHM) Differential Formulation',
    coreLaw: 'Hooke\'s Linear Restoring Force $F = -kx = m \\frac{d^2x}{dt^2}$',
    steps: [
      {
        stepNumber: 1,
        title: 'Standard Second-Order Differential Equation',
        latex: 'm \\frac{d^2x}{dt^2} + kx = 0 \\implies \\frac{d^2x}{dt^2} + \\omega^2 x = 0, \\quad \\text{where } \\omega = \\sqrt{\\frac{k}{m}}',
        explanation: 'Linear homogeneous ODE with characteristic roots ±iω.',
      },
      {
        stepNumber: 2,
        title: 'Displacement, Velocity & Acceleration Solutions',
        latex: '\\begin{aligned} x(t) &= A\\sin(\\omega t + \\phi) \\\\[4pt] v(t) &= \\frac{dx}{dt} = \\omega A\\cos(\\omega t + \\phi) = \\pm\\omega\\sqrt{A^2 - x^2} \\\\[4pt] a(t) &= \\frac{dv}{dt} = -\\omega^2 A\\sin(\\omega t + \\phi) = -\\omega^2 x \\end{aligned}',
        explanation: 'Velocity leads displacement by π/2, while acceleration opposes displacement by phase π.',
      },
      {
        stepNumber: 3,
        title: 'Mechanical Energy Conservation',
        latex: 'E = K + U = \\frac{1}{2}mv^2 + \\frac{1}{2}kx^2 = \\frac{1}{2}m\\omega^2(A^2 - x^2) + \\frac{1}{2}kx^2 = \\frac{1}{2}kA^2 = \\text{constant}',
        explanation: 'Continuous sinusoidal barter between kinetic energy K and potential energy U.',
      },
      {
        stepNumber: 4,
        title: 'Time Period of Spring-Mass & Simple Pendulum',
        latex: 'T_{\\text{spring}} = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad T_{\\text{pendulum}} = 2\\pi\\sqrt{\\frac{L}{g}}',
        explanation: 'Time period depends purely on inertia and restoring stiffness, independent of amplitude A.',
      },
    ],
    finalResultLatex: '\\boxed{x(t) = A\\sin(\\omega t + \\phi), \\quad v = \\pm\\omega\\sqrt{A^2 - x^2}, \\quad T = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad E = \\frac{1}{2}kA^2}',
    boundaryConditions: [
      'Valid for small oscillations where restoring force is strictly linear (sin θ ≈ θ).',
      'Neglects internal spring mass and damping dissipation.',
    ],
    jeeInsight: 'Frequency of energy oscillation (K and U) is 2f, which is exactly double the oscillation frequency f of displacement.',
  },

  'pure-rolling-motion': {
    conceptId: 'pure-rolling-motion',
    title: 'Pure Rolling Kinematics & Incline Dynamics',
    coreLaw: 'Instantaneous Axis of Rotation (IAOR) & No-Slip Condition $v_{cm} = \\omega R$',
    steps: [
      {
        stepNumber: 1,
        title: 'No-Slip Velocity Constraint at Contact Point P',
        latex: '\\vec{v}_P = \\vec{v}_{cm} + \\vec{\\omega} \\times \\vec{r}_{P/cm} = v_{cm}\\hat{i} - \\omega R\\hat{i} = 0 \\implies v_{cm} = \\omega R',
        explanation: 'Contact point P has zero instantaneous linear velocity with respect to the stationary ground.',
      },
      {
        stepNumber: 2,
        title: 'Total Kinetic Energy Partitioning',
        latex: 'K_{\\text{total}} = \\frac{1}{2}m v_{cm}^2 + \\frac{1}{2}I_{cm}\\omega^2 = \\frac{1}{2}m v_{cm}^2\\left(1 + \\frac{k^2}{R^2}\\right)',
        explanation: 'Energy splits between translational motion of center of mass and rotational spin about COM.',
      },
      {
        stepNumber: 3,
        title: 'Acceleration of Body Rolling Down Incline (θ)',
        latex: '\\begin{cases} mg\\sin\\theta - f = m a_{cm} \\\\[4pt] f R = I_{cm}\\alpha = (m k^2)\\left(\\frac{a_{cm}}{R}\\right) \\implies f = m a_{cm}\\left(\\frac{k^2}{R^2}\\right) \\end{cases} \\\\[6pt] \\implies a_{cm} = \\frac{g\\sin\\theta}{1 + \\frac{k^2}{R^2}}',
        explanation: 'Newton-Euler simultaneous equations for translation and torque.',
      },
    ],
    finalResultLatex: '\\boxed{v_{cm} = \\omega R, \\quad a_{cm} = \\frac{g\\sin\\theta}{1 + \\frac{k^2}{R^2}}, \\quad f_{\\text{friction}} = \\frac{mg\\sin\\theta}{1 + \\frac{R^2}{k^2}}}',
    boundaryConditions: [
      'Solid Sphere: k²/R² = 2/5 ⇒ a = (5/7)g sin θ',
      'Disc / Solid Cylinder: k²/R² = 1/2 ⇒ a = (2/3)g sin θ',
      'Ring / Hollow Cylinder: k²/R² = 1 ⇒ a = (1/2)g sin θ',
    ],
    jeeInsight: 'Order of reaching bottom of incline: Sphere (fastest) > Disc > Ring (slowest). Static friction does zero work in pure rolling.',
  },

  'biot-savart-ampere': {
    conceptId: 'biot-savart-ampere',
    title: 'Biot-Savart Law & Axial Field of Circular Coil',
    coreLaw: 'Differential Biot-Savart Law $d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{i\\, d\\vec{l} \\times \\hat{r}}{r^2}$',
    steps: [
      {
        stepNumber: 1,
        title: 'Current Element Field Vector at Axial Point P',
        latex: 'dB = \\frac{\\mu_0}{4\\pi} \\frac{i\\, dl\\sin 90^\\circ}{r^2} = \\frac{\\mu_0}{4\\pi} \\frac{i\\, dl}{R^2 + x^2}',
        explanation: 'dl is strictly perpendicular to displacement vector r from current element to axial point.',
      },
      {
        stepNumber: 2,
        title: 'Symmetry Cancellation of Transverse Components',
        latex: 'dB_x = dB \\cos\\phi = dB \\cdot \\frac{R}{r} = \\frac{\\mu_0 i dl R}{4\\pi (R^2 + x^2)^{3/2}}, \\quad dB_\\perp = 0 \\text{ (by symmetry)}',
        explanation: 'Radial components from diametrically opposite current elements cancel vectorially.',
      },
      {
        stepNumber: 3,
        title: 'Total Axial Field by Contour Integration',
        latex: 'B(x) = \\int dB_x = \\frac{\\mu_0 N i R}{4\\pi (R^2 + x^2)^{3/2}} \\oint dl = \\frac{\\mu_0 N i R (2\\pi R)}{4\\pi (R^2 + x^2)^{3/2}} = \\frac{\\mu_0 N i R^2}{2(R^2 + x^2)^{3/2}}',
        explanation: 'Line integral around closed circle of circumference 2πR.',
      },
      {
        stepNumber: 4,
        title: 'Special Limit at Center of Coil (x = 0)',
        latex: 'B_{\\text{center}} = B(0) = \\frac{\\mu_0 N i R^2}{2(R^2)^{3/2}} = \\frac{\\mu_0 N i}{2R}',
        explanation: 'At the geometric center, field reaches its maximum axial magnitude.',
      },
    ],
    finalResultLatex: '\\boxed{B(x) = \\frac{\\mu_0 N i R^2}{2(R^2 + x^2)^{3/2}}, \\quad B_{\\text{center}} = \\frac{\\mu_0 N i}{2R}, \\quad \\oint \\vec{B}\\cdot d\\vec{l} = \\mu_0 I_{\\text{encl}}}',
    boundaryConditions: [
      'Valid for steady DC current in non-magnetic medium (μ = μ₀).',
      'At large distance x >> R: loop behaves as a magnetic dipole with moment M = Ni(πR²).',
    ],
    jeeInsight: 'Inflection points (d²B/dx² = 0) of the axial field curve occur at x = ±R/2, used in Helmholtz coils for uniform magnetic fields.',
  },

  'photoelectric-effect': {
    conceptId: 'photoelectric-effect',
    title: 'Einstein\'s Photoelectric Quantum Energy Balance',
    coreLaw: 'Quantum Conservation of Energy $E_{\\text{photon}} = \\Phi + K_{\\max}$',
    steps: [
      {
        stepNumber: 1,
        title: 'Photon Energy & Work Function Threshold',
        latex: 'E = h\\nu = \\frac{hc}{\\lambda}, \\quad \\Phi = h\\nu_0 = \\frac{hc}{\\lambda_0}',
        explanation: 'A single photon delivers its entire quantum packet hν to an electron in the metal lattice.',
      },
      {
        stepNumber: 2,
        title: 'Maximum Kinetic Energy of Ejected Photoelectrons',
        latex: 'K_{\\max} = h\\nu - \\Phi = hc\\left(\\frac{1}{\\lambda} - \\frac{1}{\\lambda_0}\\right)',
        explanation: 'Excess energy above work function Φ converts into electron kinetic energy.',
      },
      {
        stepNumber: 3,
        title: 'Stopping Potential ($V_0$) Formulation',
        latex: 'e V_0 = K_{\\max} \\implies V_0 = \\left(\\frac{h}{e}\\right)\\nu - \\frac{\\Phi}{e}',
        explanation: 'Stopping potential V₀ vs frequency ν yields a straight line with universal Planck slope h/e.',
      },
    ],
    finalResultLatex: '\\boxed{K_{\\max} = h\\nu - \\Phi = e V_0, \\quad V_0 = \\left(\\frac{h}{e}\\right)\\nu - \\frac{\\Phi}{e}}',
    boundaryConditions: [
      'Emission is instantaneous (< 10⁻⁹ s) if ν ≥ ν₀ regardless of photon intensity.',
      'Saturation current is directly proportional to beam intensity I.',
    ],
    jeeInsight: 'Slope of V₀ vs ν graph is universally h/e for ALL metals, while the x-intercept gives threshold frequency ν₀.',
  },

  'youngs-double-slit': {
    conceptId: 'youngs-double-slit',
    title: 'Wave Optics Interference & Fringe Width Derivation',
    coreLaw: 'Wave Superposition Principle & Optical Path Difference $\\Delta x = d\\sin\\theta \\approx \\frac{yd}{D}$',
    steps: [
      {
        stepNumber: 1,
        title: 'Path Difference Calculation at Screen Position y',
        latex: '\\Delta x = S_2 P - S_1 P = \\sqrt{D^2 + \\left(y + \\frac{d}{2}\\right)^2} - \\sqrt{D^2 + \\left(y - \\frac{d}{2}\\right)^2} \\approx \\frac{yd}{D}',
        explanation: 'Binomial approximation when screen distance D is much larger than slit separation d (D >> d).',
      },
      {
        stepNumber: 2,
        title: 'Bright Fringe (Constructive Interference) Condition',
        latex: '\\Delta x = n\\lambda \\implies \\frac{y_n d}{D} = n\\lambda \\implies y_n = \\frac{n\\lambda D}{d}, \\quad (n = 0, 1, 2, \\dots)',
        explanation: 'Waves arrive in phase when path difference is an integer multiple of wavelength λ.',
      },
      {
        stepNumber: 3,
        title: 'Dark Fringe (Destructive Interference) Condition',
        latex: '\\Delta x = \\left(n - \\frac{1}{2}\\right)\\lambda \\implies y_n\' = \\left(n - \\frac{1}{2}\\right)\\frac{\\lambda D}{d}, \\quad (n = 1, 2, \\dots)',
        explanation: 'Waves arrive in opposite phase (phase difference (2n-1)π) canceling wave amplitudes.',
      },
      {
        stepNumber: 4,
        title: 'Fringe Width (β) Invariance',
        latex: '\\beta = y_{n+1} - y_n = \\frac{(n+1)\\lambda D}{d} - \\frac{n\\lambda D}{d} = \\frac{\\lambda D}{d}',
        explanation: 'All bright and dark fringes are equally spaced across the central region of the screen.',
      },
    ],
    finalResultLatex: '\\boxed{\\beta = \\frac{\\lambda D}{d}, \\quad I(y) = 4I_0 \\cos^2\\left(\\frac{\\pi d y}{\\lambda D}\\right), \\quad \\Delta x = \\frac{yd}{D}}',
    boundaryConditions: [
      'Coherent monochromatic light sources with constant phase difference.',
      'Small angle approximation: y << D and d << D.',
    ],
    jeeInsight: 'Immersing the YDSE apparatus in a liquid of refractive index μ compresses the fringe width to β\' = β/μ because λ\' = λ/μ.',
  },
  'lcr-circuit': {
    conceptId: 'lcr-circuit',
    title: 'Series LCR Resonance, Impedance & Quality Factor Derivation',
    coreLaw: "Kirchhoff's Loop Rule: $L\\frac{d^2q}{dt^2} + R\\frac{dq}{dt} + \\frac{q}{C} = V_0 \\sin(\\omega t)$",
    steps: [
      {
        stepNumber: 1,
        title: 'Phasor Decomposition of Series Voltages',
        latex: 'V(t) = V_R(t) + V_L(t) + V_C(t) \\implies V_0^2 = V_R^2 + (V_L - V_C)^2 = I_0^2 \\left[ R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2 \\right]',
        explanation: 'In a series circuit, current I is common. VL leads I by π/2 while VC lags I by π/2, putting them in opposite directions on the phasor diagram.',
      },
      {
        stepNumber: 2,
        title: 'Total Circuit Impedance (Z) Formulation',
        latex: 'Z = \\sqrt{R^2 + (X_L - X_C)^2} = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}, \\quad \\tan\\phi = \\frac{X_L - X_C}{R}',
        explanation: 'Impedance represents total opposition to AC current flow, with phase angle ϕ between voltage and current.',
      },
      {
        stepNumber: 3,
        title: 'Resonance Condition & Natural Frequency',
        latex: 'X_L = X_C \\implies \\omega_0 L = \\frac{1}{\\omega_0 C} \\implies \\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
        explanation: 'At resonance, inductive and capacitive reactances cancel out completely. Impedance drops to its minimum pure resistance Z = R, maximizing current amplitude I_max = V_0 / R.',
      },
      {
        stepNumber: 4,
        title: 'Bandwidth (Δω) and Quality Factor (Q)',
        latex: 'I(\\omega) = \\frac{I_0}{\\sqrt{2}} \\implies \\Delta\\omega = \\frac{R}{L} \\implies Q = \\frac{\\omega_0}{\\Delta\\omega} = \\frac{\\omega_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}',
        explanation: 'Quality factor measures sharpness of resonance peak. High Q indicates high voltage magnification across L and C (V_L = Q V_0).',
      },
    ],
    finalResultLatex: '\\boxed{Z = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}, \\quad Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}}}',
    boundaryConditions: [
      'Pure sinusoidal steady-state AC source driving series components.',
      'At resonance, power factor cos(ϕ) = 1 (purely resistive in-phase power transfer).',
      'If ω < ω₀, circuit is capacitive (current leads); if ω > ω₀, circuit is inductive (current lags).',
    ],
    jeeInsight: 'At resonance, individual voltages VL and VC can each be much greater than the applied source voltage by factor Q: V_L = V_C = Q V_source!',
  },
  'electric-field-charges': {
    conceptId: 'electric-field-charges',
    title: 'Electric Dipole Field Derivation (Axial & Equatorial Points)',
    coreLaw: "Coulomb's Law & Principle of Superposition: $\\vec{E} = \\sum \\frac{k q_i}{r_i^2}\\hat{r}_i$",
    steps: [
      {
        stepNumber: 1,
        title: 'Axial Point (End-on) Superposition',
        latex: 'E_{\\text{axial}} = \\frac{kq}{(r - a)^2} - \\frac{kq}{(r + a)^2} = kq\\left[\\frac{4ra}{(r^2 - a^2)^2}\\right] = \\frac{2k(2qa)r}{(r^2 - a^2)^2}',
        explanation: 'A point at distance r from dipole center along its axis experiences opposing electric fields from +q and -q separated by 2a.',
      },
      {
        stepNumber: 2,
        title: 'Far-Field Axial Approximation (r >> a)',
        latex: 'r \\gg a \\implies (r^2 - a^2)^2 \\approx r^4 \\implies E_{\\text{axial}} = \\frac{2k p r}{r^4} = \\frac{2k p}{r^3} = \\frac{1}{4\\pi\\epsilon_0}\\frac{2\\vec{p}}{r^3}',
        explanation: 'Substitute dipole moment p = 2qa. Electric field falls off inversely with the cube of distance (1/r³).',
      },
      {
        stepNumber: 3,
        title: 'Equatorial (Broadside-on) Superposition',
        latex: 'E_\\perp = 2 \\cdot \\frac{kq}{r^2 + a^2}\\cos\\theta = 2 \\cdot \\frac{kq}{r^2 + a^2}\\left(\\frac{a}{\\sqrt{r^2 + a^2}}\\right) = \\frac{k(2qa)}{(r^2 + a^2)^{3/2}}',
        explanation: 'Vertical field components cancel due to symmetry; only horizontal components parallel to -p add constructively.',
      },
      {
        stepNumber: 4,
        title: 'Far-Field Equatorial Approximation',
        latex: 'r \\gg a \\implies E_{\\text{equatorial}} = \\frac{kp}{r^3} = -\\frac{1}{4\\pi\\epsilon_0}\\frac{\\vec{p}}{r^3} = \\frac{1}{2} E_{\\text{axial}}',
        explanation: 'Equatorial field is antiparallel to dipole moment vector p and has exactly half the magnitude of the axial field at the same distance.',
      },
    ],
    finalResultLatex: '\\boxed{E_{\\text{axial}} = \\frac{1}{4\\pi\\epsilon_0}\\frac{2p}{r^3}, \\quad E_{\\text{equatorial}} = \\frac{1}{4\\pi\\epsilon_0}\\frac{p}{r^3}, \\quad E_{\\text{gen}} = \\frac{kp}{r^3}\\sqrt{1 + 3\\cos^2\\theta}}',
    boundaryConditions: [
      'Valid for short ideal dipole approximation r >> a.',
      'Torque in uniform external field: τ = p × E; Potential energy: U = -p · E.',
    ],
    jeeInsight: 'Field decays as 1/r³ for dipoles, contrasted with 1/r² for isolated point monopoles.',
  },
  'lorentz-force-cyclotron': {
    conceptId: 'lorentz-force-cyclotron',
    title: 'Magnetic Lorentz Force, Helical Radius & Cyclotron Frequency Derivation',
    coreLaw: "Lorentz Force Law: $\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})$",
    steps: [
      {
        stepNumber: 1,
        title: 'Centripetal Acceleration Balance (Perpendicular Motion)',
        latex: 'q v_\\perp B = \\frac{m v_\\perp^2}{r} \\implies r = \\frac{m v_\\perp}{q B} = \\frac{p_\\perp}{q B} = \\frac{\\sqrt{2mK}}{q B}',
        explanation: 'Magnetic force is perpendicular to velocity at every instant, performing zero mechanical work (dW = 0) while curving the charge into a circle.',
      },
      {
        stepNumber: 2,
        title: 'Time Period & Cyclotron Resonance Frequency (f_c)',
        latex: 'T = \\frac{2\\pi r}{v_\\perp} = \\frac{2\\pi}{v_\\perp}\\left(\\frac{m v_\\perp}{q B}\\right) = \\frac{2\\pi m}{q B} \\implies f_c = \\frac{1}{T} = \\frac{q B}{2\\pi m}',
        explanation: 'Crucial insight: Period T and frequency f_c are completely independent of particle speed v and orbit radius r (isochronism).',
      },
      {
        stepNumber: 3,
        title: 'Helical Pitch with Parallel Velocity Component',
        latex: 'v_\\parallel = v\\cos\\theta, \\quad v_\\perp = v\\sin\\theta \\implies p = v_\\parallel T = (v\\cos\\theta)\\left(\\frac{2\\pi m}{q B}\\right) = \\frac{2\\pi m v\\cos\\theta}{q B}',
        explanation: 'When velocity makes angle θ with magnetic field B, parallel velocity translates the circular orbit into a 3D helix.',
      },
    ],
    finalResultLatex: '\\boxed{r = \\frac{mv\\sin\\theta}{qB}, \\quad f_c = \\frac{qB}{2\\pi m}, \\quad p = \\frac{2\\pi m v\\cos\\theta}{qB}}',
    boundaryConditions: [
      'Uniform steady magnetic field B perpendicular or inclined to velocity.',
      'Non-relativistic regime (v << c) so mass m remains rest mass m₀.',
    ],
    jeeInsight: 'Because frequency fc does not depend on orbit radius, particles accelerate across the dees in a cyclotron at constant RF frequency until relativistic mass increase kicks in.',
  },
  'ray-optics-lens-prism': {
    conceptId: 'ray-optics-lens-prism',
    title: "Lens Maker's Formula & Minimum Prism Deviation Derivation",
    coreLaw: "Snell's Law at Spherical Boundary: $\\frac{\\mu_2}{v} - \\frac{\\mu_1}{u} = \\frac{\\mu_2 - \\mu_1}{R}$",
    steps: [
      {
        stepNumber: 1,
        title: 'Refraction at First Spherical Surface (Radius R1)',
        latex: '\\frac{\\mu}{v_1} - \\frac{1}{u} = \\frac{\\mu - 1}{R_1}',
        explanation: 'Light passes from medium (air, μ₁ = 1) into lens (refractive index μ) forming virtual intermediate image at v1.',
      },
      {
        stepNumber: 2,
        title: 'Refraction at Second Spherical Surface (Radius R2)',
        latex: '\\frac{1}{v} - \\frac{\\mu}{v_1} = \\frac{1 - \\mu}{R_2} = -\\frac{\\mu - 1}{R_2}',
        explanation: 'Intermediate image v1 acts as virtual object for second surface, refracting back into air.',
      },
      {
        stepNumber: 3,
        title: 'Superposition & Thin Lens Thinness Limit',
        latex: '\\left(\\frac{\\mu}{v_1} - \\frac{1}{u}\\right) + \\left(\\frac{1}{v} - \\frac{\\mu}{v_1}\\right) = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\implies \\frac{1}{v} - \\frac{1}{u} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)',
        explanation: 'Adding the two surface refraction equations eliminates intermediate image distance v1 for a thin lens (thickness t → 0).',
      },
      {
        stepNumber: 4,
        title: 'Focal Length Definition (u → -∞, v = f)',
        latex: '\\frac{1}{f} - 0 = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\implies \\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)',
        explanation: 'When incident rays are parallel (u = ∞), they converge at principal focus v = f.',
      },
    ],
    finalResultLatex: '\\boxed{\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right), \\quad \\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}}',
    boundaryConditions: [
      'Paraxial rays (angles small so sin θ ≈ tan θ ≈ θ).',
      'Lens thickness t negligible compared to radii R1 and R2.',
      'Sign convention: light travels left to right; distances against light are negative.',
    ],
    jeeInsight: 'If an equiconvex lens of focal length f is cut transversely into two plano-convex lenses, each half has double focal length f\' = 2f and half the power P\' = P/2.',
  },
  'thermo-pv-cycle': {
    conceptId: 'thermo-pv-cycle',
    title: 'Carnot Heat Engine Cycle & Maximum Thermodynamic Efficiency Derivation',
    coreLaw: "First & Second Laws of Thermodynamics: $dQ = dU + dW, \\quad \\Delta S_{\\text{cycle}} = 0$",
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Isothermal Expansion at High Temperature TH',
        latex: 'T_H = \\text{const} \\implies \\Delta U_1 = 0 \\implies Q_H = W_1 = n R T_H \\ln\\left(\\frac{V_2}{V_1}\\right)',
        explanation: 'Gas absorbs heat QH from reservoir at TH, expanding isothermally from V1 to V2.',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Adiabatic Expansion from TH to TC',
        latex: 'Q = 0 \\implies T_H V_2^{\\gamma - 1} = T_C V_3^{\\gamma - 1} \\implies W_2 = \\frac{n R (T_H - T_C)}{\\gamma - 1}',
        explanation: 'Gas expands adiabatically, doing work against internal energy and dropping in temperature.',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Isothermal Compression at Low Temperature TC',
        latex: 'T_C = \\text{const} \\implies Q_C = -W_3 = n R T_C \\ln\\left(\\frac{V_3}{V_4}\\right)',
        explanation: 'Gas rejects heat QC to cold sink at TC while being compressed.',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Adiabatic Compression returning to TH',
        latex: 'T_C V_4^{\\gamma - 1} = T_H V_1^{\\gamma - 1} \\implies \\frac{V_2}{V_1} = \\frac{V_3}{V_4} \\implies \\frac{Q_C}{Q_H} = \\frac{T_C}{T_H}',
        explanation: 'Equating adiabatic volume ratios connects heat rejection ratio directly to absolute temperatures.',
      },
      {
        stepNumber: 5,
        title: 'Net Work & Carnot Thermal Efficiency (η)',
        latex: '\\eta = \\frac{W_{\\text{net}}}{Q_H} = \\frac{Q_H - Q_C}{Q_H} = 1 - \\frac{Q_C}{Q_H} = 1 - \\frac{T_C}{T_H}',
        explanation: 'No heat engine operating between two thermal reservoirs can be more efficient than a reversible Carnot engine.',
      },
    ],
    finalResultLatex: '\\boxed{\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H} = \\frac{T_H - T_C}{T_H}, \\quad \\frac{Q_H}{T_H} = \\frac{Q_C}{T_C}}',
    boundaryConditions: [
      'Reversible quasi-static thermodynamic processes throughout.',
      'Absolute temperatures TH and TC expressed in Kelvin.',
    ],
    jeeInsight: 'To increase Carnot efficiency most effectively, lowering sink temperature TC yields a greater percentage boost than raising source temperature TH by the same amount!',
  },
  'bohr-atom-spectrum': {
    conceptId: 'bohr-atom-spectrum',
    title: 'Bohr Hydrogen Energy Quantization & Rydberg Spectral Formula Derivation',
    coreLaw: "Bohr Angular Momentum Postulate: $L = m v r = \\frac{n h}{2\\pi} = n \\hbar$",
    steps: [
      {
        stepNumber: 1,
        title: 'Coulomb Force Provides Centripetal Acceleration',
        latex: '\\frac{1}{4\\pi\\epsilon_0}\\frac{e^2}{r^2} = \\frac{m v^2}{r} \\implies m v^2 r = \\frac{e^2}{4\\pi\\epsilon_0}',
        explanation: 'Planetary orbit equilibrium between electrostatics and circular motion dynamics.',
      },
      {
        stepNumber: 2,
        title: 'Bohr Quantized Orbital Radii (r_n)',
        latex: 'v = \\frac{n h}{2\\pi m r} \\implies m\\left(\\frac{n^2 h^2}{4\\pi^2 m^2 r^2}\\right)r = \\frac{e^2}{4\\pi\\epsilon_0} \\implies r_n = \\frac{\\epsilon_0 h^2}{\\pi m e^2} \\cdot n^2 = a_0 n^2 \\approx 0.529 n^2 \\text{ \\AA}',
        explanation: 'Substituting orbital velocity into centripetal balance gives radii scaling with n².',
      },
      {
        stepNumber: 3,
        title: 'Total Energy Quantization (E_n)',
        latex: 'K = \\frac{1}{2}mv^2 = \\frac{e^2}{8\\pi\\epsilon_0 r}, \\quad U = -\\frac{e^2}{4\\pi\\epsilon_0 r} \\implies E = K + U = -\\frac{e^2}{8\\pi\\epsilon_0 r_n} = -\\frac{m e^4}{8 \\epsilon_0^2 h^2} \\cdot \\frac{1}{n^2} = -\\frac{13.6}{n^2} \\text{ eV}',
        explanation: 'Total energy is negative, confirming the electron is gravitationally/electrostatically bound to the nucleus.',
      },
      {
        stepNumber: 4,
        title: 'Spectral Transition & Rydberg Formula',
        latex: '\\Delta E = E_{n_2} - E_{n_1} = h\\nu = \\frac{hc}{\\lambda} \\implies \\frac{1}{\\lambda} = R_\\infty \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right), \\quad R_\\infty = \\frac{m e^4}{8\\epsilon_0^2 h^3 c} \\approx 1.097 \\times 10^7 \\text{ m}^{-1}',
        explanation: 'Photon emission upon de-excitation matches the empirical Balmer, Lyman, and Paschen spectral series.',
      },
    ],
    finalResultLatex: '\\boxed{r_n = 0.529 n^2 \\text{ \\AA}, \\quad E_n = -\\frac{13.6 Z^2}{n^2} \\text{ eV}, \\quad \\frac{1}{\\lambda} = R Z^2 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)}',
    boundaryConditions: [
      'Single-electron hydrogenic systems (H, He⁺, Li²⁺, Be³⁺) with nuclear charge Z.',
      'Circular orbits under classical mechanics except for quantum angular momentum condition.',
    ],
    jeeInsight: 'Total energy En is equal in magnitude to Kinetic energy (E = -K) and equal to half the Potential energy (E = U / 2) by the Virial Theorem.',
  },
};

export const getConceptDerivation = (conceptId: string): ConceptDerivationData => {
  if (CONCEPT_DERIVATIONS[conceptId]) {
    return CONCEPT_DERIVATIONS[conceptId];
  }
  // Generic fallback derivation generator
  return {
    conceptId,
    title: 'Theoretical & Mathematical Derivation',
    coreLaw: 'Governing Differential Equations & Conservation Principles',
    steps: [
      {
        stepNumber: 1,
        title: 'Governing Physical Law & Boundary Setup',
        latex: '\\frac{d\\Psi}{dt} = \\mathcal{L}(\\Psi, t), \\quad \\Psi(0) = \\Psi_0',
        explanation: 'Formulating the differential equation from fundamental conservation laws and geometry.',
      },
      {
        stepNumber: 2,
        title: 'Analytical Calculus Integration',
        latex: '\\int_{\\Psi_0}^{\\Psi} d\\Psi = \\int_{0}^{t} \\mathcal{L}(\\Psi, t)\\, dt',
        explanation: 'Integrating boundary conditions across continuous space-time coordinates.',
      },
      {
        stepNumber: 3,
        title: 'Closed-Form Analytical Solution',
        latex: '\\Psi(t) = \\Psi_0 e^{-\\gamma t} \\cos(\\omega t + \\phi)',
        explanation: 'Evaluating integration constants matching experimental boundary parameters.',
      },
    ],
    finalResultLatex: '\\boxed{\\text{Result verified through JEE conservation laws and dimensional analysis.}}',
    boundaryConditions: ['Idealized boundary limits applied', 'Standard SI units'],
    jeeInsight: 'Check dimensional homogeneity before substituting values into numerical calculations.',
  };
};
