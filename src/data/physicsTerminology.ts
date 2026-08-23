export interface PhysicsTermDefinition {
  id: string;
  term: string;
  category: 'mechanics' | 'electromagnetism' | 'thermal' | 'optics' | 'modern' | 'waves';
  definition: string;
  formula?: string;
  unit?: string;
  jeeKey: string;
}

export const PHYSICS_TERMINOLOGY: Record<string, PhysicsTermDefinition> = {
  'moment of inertia': {
    id: 'moment-of-inertia',
    term: 'Moment of Inertia (I)',
    category: 'mechanics',
    definition: 'Quantitative measure of rotational inertia; the opposition that a body exhibits to having its rotational speed altered about an axis.',
    formula: 'I = \\int r^2 dm = \\sum m_i r_i^2',
    unit: '\\text{kg}\\cdot\\text{m}^2',
    jeeKey: 'Apply Parallel ($I = I_{\\text{cm}} + Md^2$) or Perpendicular ($I_z = I_x + I_y$) axis theorems depending on geometry.',
  },
  'rotational inertia': {
    id: 'rotational-inertia',
    term: 'Rotational Inertia',
    category: 'mechanics',
    definition: 'Resistance of an object to changes in its rotational state about a fixed reference axis.',
    formula: 'I = M k^2',
    unit: '\\text{kg}\\cdot\\text{m}^2',
    jeeKey: '$k$ is the radius of gyration; for a solid sphere $k = \\sqrt{2/5}R$.',
  },
  'angular momentum': {
    id: 'angular-momentum',
    term: 'Angular Momentum (L)',
    category: 'mechanics',
    definition: 'Rotational analog of linear momentum; conserved whenever the net external torque about the reference axis is zero.',
    formula: '\\vec{L} = \\vec{r} \\times \\vec{p} = I \\vec{\\omega}',
    unit: '\\text{kg}\\cdot\\text{m}^2/\\text{s} \\text{ or } \\text{J}\\cdot\\text{s}',
    jeeKey: 'Always specify the reference point about which torque and angular momentum are evaluated.',
  },
  'torque': {
    id: 'torque',
    term: 'Torque (\\tau)',
    category: 'mechanics',
    definition: 'Rotational force that causes or tends to cause rotational acceleration about a point or axis.',
    formula: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I \\vec{\\alpha}',
    unit: '\\text{N}\\cdot\\text{m}',
    jeeKey: 'Couple of forces produces pure rotation without translating the center of mass.',
  },
  'centripetal acceleration': {
    id: 'centripetal-acceleration',
    term: 'Centripetal Acceleration (a_c)',
    category: 'mechanics',
    definition: 'Radial inward acceleration that forces a moving body along a curved circular path of radius r.',
    formula: 'a_c = \\frac{v^2}{r} = \\omega^2 r',
    unit: '\\text{m/s}^2',
    jeeKey: 'Always directed towards instantaneous center of curvature; does zero work because force is perpendicular to velocity.',
  },
  'terminal velocity': {
    id: 'terminal-velocity',
    term: 'Terminal Velocity (v_t)',
    category: 'mechanics',
    definition: 'Steady speed achieved by an object falling through a fluid when viscous drag plus buoyancy balances gravity.',
    formula: 'v_t = \\frac{2 r^2 (\\rho - \\sigma) g}{9 \\eta}',
    unit: '\\text{m/s}',
    jeeKey: 'Proportional to $r^2$ for spherical drops falling in air (Stokes Law regime).',
  },
  'viscosity': {
    id: 'viscosity',
    term: 'Coefficient of Viscosity (\\eta)',
    category: 'mechanics',
    definition: 'Measure of a fluid’s internal frictional resistance to gradual deformation by shear stress.',
    formula: 'F = -\\eta A \\frac{dv}{dz}',
    unit: '\\text{Pa}\\cdot\\text{s} \\text{ (or Poise)}',
    jeeKey: 'Liquid viscosity decreases with temperature, while gas viscosity increases with temperature.',
  },
  'escape velocity': {
    id: 'escape-velocity',
    term: 'Escape Velocity (v_e)',
    category: 'mechanics',
    definition: 'Minimum initial speed required for an unpropelled body to escape gravitational field of a celestial mass.',
    formula: 'v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR}',
    unit: '\\text{m/s}',
    jeeKey: 'Independent of the mass or angle of projection (excluding atmospheric drag).',
  },
  'gravitational potential': {
    id: 'gravitational-potential',
    term: 'Gravitational Potential (V)',
    category: 'mechanics',
    definition: 'Work done by an external agent in bringing a unit mass from infinity to a point in the field.',
    formula: 'V = -\\frac{GM}{r}',
    unit: '\\text{J/kg}',
    jeeKey: 'Always negative or zero; gravitational field is negative gradient $\\vec{g} = -\\nabla V$.',
  },
  'simple harmonic motion': {
    id: 'simple-harmonic-motion',
    term: 'Simple Harmonic Motion (SHM)',
    category: 'waves',
    definition: 'Periodic oscillatory motion where restoring force is directly proportional to displacement and directed toward equilibrium.',
    formula: 'a = -\\omega^2 x, \\quad x(t) = A\\sin(\\omega t + \\phi)',
    unit: 'x \\text{ in meters, } \\omega \\text{ in rad/s}',
    jeeKey: 'Total energy $E = \\frac{1}{2} m \\omega^2 A^2$ is strictly constant in conservative SHM.',
  },
  'resonance': {
    id: 'resonance',
    term: 'Resonance',
    category: 'waves',
    definition: 'Condition occurring when driving frequency of external periodic force matches natural frequency of the oscillating system.',
    formula: '\\omega_{\\text{drive}} = \\omega_0 = \\sqrt{\\frac{k}{m}}',
    unit: '\\text{Hz or rad/s}',
    jeeKey: 'Amplitude spikes to maximum; in pure undamped systems amplitude theoretically diverges to infinity.',
  },
  'adiabatic process': {
    id: 'adiabatic-process',
    term: 'Adiabatic Process',
    category: 'thermal',
    definition: 'Thermodynamic process taking place with zero heat exchange with surroundings ($dQ = 0$).',
    formula: 'P V^\\gamma = \\text{const}, \\quad W = \\frac{P_1 V_1 - P_2 V_2}{\\gamma - 1}',
    unit: '\\text{Joule (work)}',
    jeeKey: 'Slope on P-V diagram is $\\gamma$ times steeper than isothermal slope ($\\gamma = C_p/C_v$).',
  },
  'isothermal process': {
    id: 'isothermal-process',
    term: 'Isothermal Process',
    category: 'thermal',
    definition: 'Thermodynamic state change occurring at constant temperature ($dT = 0, dU = 0$).',
    formula: 'P V = \\text{const}, \\quad W = nRT \\ln\\left(\\frac{V_2}{V_1}\\right)',
    unit: '\\text{Joule (work)}',
    jeeKey: 'All heat supplied is converted directly into work done ($dQ = dW$) since $\\Delta U = 0$.',
  },
  'carnot engine': {
    id: 'carnot-engine',
    term: 'Carnot Engine Efficiency (\\eta)',
    category: 'thermal',
    definition: 'Theoretical thermodynamic cycle that achieves maximum possible conversion efficiency between two heat reservoirs.',
    formula: '\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W}{Q_H}',
    unit: '\\text{dimensionless (percentage)}',
    jeeKey: 'Temperatures $T_C$ and $T_H$ MUST be in Kelvin (absolute scale).',
  },
  'gauss law': {
    id: 'gauss-law',
    term: "Gauss's Law",
    category: 'electromagnetism',
    definition: 'Total electric flux through any closed Gaussian surface equals net enclosed charge divided by permittivity of free space.',
    formula: '\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{\\text{enc}}}{\\epsilon_0}',
    unit: '\\text{N}\\cdot\\text{m}^2/\\text{C}',
    jeeKey: 'Choose symmetric Gaussian surfaces (spherical, cylindrical, planar) to extract $E$ outside integral.',
  },
  'electric potential': {
    id: 'electric-potential',
    term: 'Electric Potential (V)',
    category: 'electromagnetism',
    definition: 'Electric potential energy per unit positive test charge brought from infinity to that point.',
    formula: 'V = \\frac{1}{4\\pi\\epsilon_0} \\frac{q}{r}, \\quad \\vec{E} = -\\nabla V',
    unit: '\\text{Volt (V)} = \\text{J/C}',
    jeeKey: 'Electric field lines point in the direction of steepest decrease of electric potential.',
  },
  'drift velocity': {
    id: 'drift-velocity',
    term: 'Drift Velocity (v_d)',
    category: 'electromagnetism',
    definition: 'Average velocity attained by charged carriers in a conductor due to an applied electric field.',
    formula: 'v_d = \\frac{e E \\tau}{m} = \\frac{I}{n e A}',
    unit: '\\text{m/s}',
    jeeKey: 'Despite low drift speed (~$10^{-4}$ m/s), electromagnetic signal propagates at speed of light in conductor.',
  },
  'lorentz force': {
    id: 'lorentz-force',
    term: 'Lorentz Force (\\vec{F})',
    category: 'electromagnetism',
    definition: 'Combined electromagnetic force exerted on a charged particle moving through electric and magnetic fields.',
    formula: '\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})',
    unit: '\\text{Newton (N)}',
    jeeKey: 'Magnetic force $q(\\vec{v}\\times\\vec{B})$ does zero work because it is always normal to instantaneous velocity.',
  },
  'biot savart law': {
    id: 'biot-savart-law',
    term: 'Biot-Savart Law',
    category: 'electromagnetism',
    definition: 'Calculates magnetic field vector $d\\vec{B}$ generated by an infinitesimal steady electric current element $I d\\vec{l}$.',
    formula: 'd\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I (d\\vec{l} \\times \\hat{r})}{r^2}',
    unit: '\\text{Tesla (T)}',
    jeeKey: 'At the center of a circular current coil, $B = \\frac{\\mu_0 I}{2R}$.',
  },
  'faradays law': {
    id: 'faradays-law',
    term: "Faraday's Law of Induction",
    category: 'electromagnetism',
    definition: 'Induced electromotive force in a closed loop is equal to negative time rate of change of magnetic flux.',
    formula: '\\mathcal{E} = -\\frac{d\\Phi_B}{dt} = -\\frac{d}{dt}\\int \\vec{B} \\cdot d\\vec{A}',
    unit: '\\text{Volt (V)}',
    jeeKey: 'The negative sign embodies Lenz’s law (induced current opposes the flux change).',
  },
  'lenz law': {
    id: 'lenz-law',
    term: "Lenz's Law",
    category: 'electromagnetism',
    definition: 'Direction of induced EMF/current always opposes the physical change in magnetic flux that produced it.',
    formula: '\\mathcal{E} = -N \\frac{\\Delta \\Phi}{\\Delta t}',
    unit: '\\text{Volt (V)}',
    jeeKey: 'Direct consequence of the Conservation of Energy.',
  },
  'self inductance': {
    id: 'self-inductance',
    term: 'Self-Inductance (L)',
    category: 'electromagnetism',
    definition: 'Property of a circuit whereby a change in current produces an induced EMF opposing the change.',
    formula: '\\mathcal{E}_L = -L \\frac{dI}{dt}, \\quad U_B = \\frac{1}{2} L I^2',
    unit: '\\text{Henry (H)}',
    jeeKey: 'Inductor behaves as an open circuit immediately after closing switch ($t=0^+$) and short circuit at steady state ($t \\to \\infty$).',
  },
  'total internal reflection': {
    id: 'total-internal-reflection',
    term: 'Total Internal Reflection (TIR)',
    category: 'optics',
    definition: 'Complete reflection of a ray of light within a denser medium when angle of incidence exceeds critical angle.',
    formula: '\\sin(\\theta_c) = \\frac{n_{\\text{rarer}}}{n_{\\text{denser}}}',
    unit: '\\text{degrees / radians}',
    jeeKey: 'Light must travel from optically denser to rarer medium with $\\theta_i > \\theta_c$.',
  },
  'diffraction': {
    id: 'diffraction',
    term: 'Diffraction',
    category: 'optics',
    definition: 'Bending and spreading of wave fronts around obstacles or edges of an aperture comparable to wavelength $\\lambda$.',
    formula: 'a \\sin(\\theta) = n \\lambda \\quad \\text{(Minima)}',
    unit: '\\text{Angular spread (radians)}',
    jeeKey: 'Width of central diffraction maximum $\\beta_0 = \\frac{2\\lambda D}{a}$ is twice as wide as secondary maxima.',
  },
  'photoelectric effect': {
    id: 'photoelectric-effect',
    term: 'Photoelectric Effect',
    category: 'modern',
    definition: 'Instantaneous emission of electrons from a metallic surface when irradiated with photons of threshold frequency $\\nu_0$.',
    formula: 'h\\nu = \\Phi + K_{\\text{max}} = \\Phi + e V_s',
    unit: '\\text{eV or Joule}',
    jeeKey: 'Stopping potential $V_s$ depends only on incident light frequency $\\nu$, not on intensity.',
  },
  'work function': {
    id: 'work-function',
    term: 'Work Function (\\Phi)',
    category: 'modern',
    definition: 'Minimum energy required to liberate an electron from the surface of a metal into vacuum.',
    formula: '\\Phi = h \\nu_0 = \\frac{h c}{\\lambda_0}',
    unit: '\\text{eV} \\text{ (1 eV} = 1.6 \\times 10^{-19} \\text{ J)}',
    jeeKey: 'Intrinsic material property; Cesium has lowest work function (~2.14 eV).',
  },
  'de broglie wavelength': {
    id: 'de-broglie-wavelength',
    term: 'de Broglie Wavelength (\\lambda)',
    category: 'modern',
    definition: 'Wavelength associated with a moving matter particle possessing linear momentum $p$.',
    formula: '\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2 m K}} = \\frac{12.27}{\\sqrt{V}} \\text{ Å (for } e^-)',
    unit: '\\text{meters or Ångströms (Å)}',
    jeeKey: 'For thermal neutrons at temperature $T$, $\\lambda = \\frac{h}{\\sqrt{3 m k_B T}}$.',
  },
};

/**
 * Helper to look up terminology definitions
 */
export function getPhysicsTerm(nameOrQuery: string): PhysicsTermDefinition | undefined {
  const normalized = nameOrQuery.toLowerCase().trim().replace(/['’]/g, '');
  if (PHYSICS_TERMINOLOGY[normalized]) {
    return PHYSICS_TERMINOLOGY[normalized];
  }
  for (const [key, term] of Object.entries(PHYSICS_TERMINOLOGY)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return term;
    }
  }
  return undefined;
}
