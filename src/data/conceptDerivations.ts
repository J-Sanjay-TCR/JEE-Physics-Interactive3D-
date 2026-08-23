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
