import { PhysicsConcept } from '../types';

export interface ConceptSearchMetadata {
  acronyms: string[];
  keywords: string[];
  experiments: string[];
  greekSymbols: string[];
  formulaSnippets: string[];
  standardTerms: string[];
  classGrade?: 'Class 11' | 'Class 12';
}

/**
 * High-Precision Physics & JEE Acronym and Synonym Registry
 * Maps concept IDs to official JEE acronyms, experimental apparatus,
 * and key physics variables.
 */
export const CONCEPT_METADATA_REGISTRY: Record<string, ConceptSearchMetadata> = {
  'youngs-double-slit': {
    acronyms: ['YDSE', 'DSE', 'DS', 'YDS'],
    experiments: ["Young's Double Slit Experiment", "Biprism", "Interference of Light", "Fringe Shift"],
    keywords: ['fringe width', 'central maxima', 'dark fringe', 'bright fringe', 'path difference', 'phase difference', 'slit separation', 'coherence', 'monochromatic'],
    greekSymbols: ['\\lambda', '\\beta', '\\theta', '\\Delta x', '\\phi'],
    formulaSnippets: ['\\beta = \\frac{\\lambda D}{d}', '\\Delta x = d \\sin\\theta', 'I = 4I_0 \\cos^2(\\phi/2)'],
    standardTerms: ['wave optics', 'interference', 'diffraction', 'slit', 'screen'],
    classGrade: 'Class 12',
  },
  'shm-spring-pendulum': {
    acronyms: ['SHM', 'SHO', 'SPM', 'HM'],
    experiments: ['Simple Harmonic Motion', 'Spring-Mass Oscillator', 'Simple Pendulum', 'Torsional Pendulum'],
    keywords: ['oscillator', 'restoring force', 'spring constant', 'time period', 'frequency', 'amplitude', 'damping', 'resonance', 'potential energy', 'kinetic energy'],
    greekSymbols: ['\\omega', '\\phi', '\\theta', '\\pi'],
    formulaSnippets: ['T = 2\\pi\\sqrt{\\frac{m}{k}}', 'T = 2\\pi\\sqrt{\\frac{L}{g}}', 'x(t) = A\\cos(\\omega t + \\phi)', 'v = \\omega\\sqrt{A^2 - x^2}'],
    standardTerms: ['oscillation', 'vibration', 'hooke law', 'restoring'],
    classGrade: 'Class 11',
  },
  'lcr-circuit': {
    acronyms: ['LCR', 'RLC', 'AC', 'Q-Factor'],
    experiments: ['Series LCR Circuit', 'AC Resonance', 'Phasor Diagram', 'Choke Coil'],
    keywords: ['resonance', 'impedance', 'inductive reactance', 'capacitive reactance', 'phase angle', 'power factor', 'quality factor', 'bandwidth', 'alternating current'],
    greekSymbols: ['\\omega', '\\phi', '\\omega_0', '\\Delta\\omega'],
    formulaSnippets: ['Z = \\sqrt{R^2 + (X_L - X_C)^2}', '\\omega_0 = \\frac{1}{\\sqrt{LC}}', 'Q = \\frac{\\omega_0 L}{R}', '\\tan\\phi = \\frac{X_L - X_C}{R}'],
    standardTerms: ['inductance', 'capacitance', 'resistance', 'phasor', 'current', 'voltage'],
    classGrade: 'Class 12',
  },
  'projectile-motion': {
    acronyms: ['PM', 'PT', '2DK'],
    experiments: ['Projectile Launcher', 'Parabolic Trajectory', 'Ballistic Motion', 'Oblique Projectile'],
    keywords: ['parabola', 'horizontal range', 'time of flight', 'maximum height', 'launch angle', 'initial velocity', 'trajectory equation', 'gravity', 'air resistance'],
    greekSymbols: ['\\theta', 'g', '\\alpha', '\\beta'],
    formulaSnippets: ['R = \\frac{u^2 \\sin(2\\theta)}{g}', 'H_{\\max} = \\frac{u^2 \\sin^2\\theta}{2g}', 'T = \\frac{2u \\sin\\theta}{g}', 'y = x\\tan\\theta - \\frac{gx^2}{2u^2\\cos^2\\theta}'],
    standardTerms: ['kinematics', '2d motion', 'gravity', 'velocity vector'],
    classGrade: 'Class 11',
  },
  'inclined-plane-friction': {
    acronyms: ['IPF', 'FBD', 'NLM'],
    experiments: ['Inclined Plane Experiment', 'Limiting Friction Block', 'Angle of Repose'],
    keywords: ['coefficient of friction', 'static friction', 'kinetic friction', 'normal reaction', 'angle of repose', 'angle of friction', 'limiting equilibrium', 'impending motion'],
    greekSymbols: ['\\mu_s', '\\mu_k', '\\theta', '\\alpha'],
    formulaSnippets: ['f_s \\le \\mu_s N', 'f_k = \\mu_k N', 'a = g(\\sin\\theta - \\mu_k \\cos\\theta)', '\\tan\\theta_r = \\mu_s'],
    standardTerms: ['friction', 'inclined plane', 'normal force', 'newton laws'],
    classGrade: 'Class 11',
  },
  'electric-field-charges': {
    acronyms: ['EFL', 'ED', 'EFP', 'CL'],
    experiments: ['Coulomb Law Apparatus', 'Electric Dipole', 'Equipotential Surface Mapping', 'Millikan'],
    keywords: ['electric field', 'coulomb force', 'dipole moment', 'equipotential', 'point charge', 'permittivity', 'electrostatic potential', 'superposition'],
    greekSymbols: ['\\varepsilon_0', '\\tau', '\\vec{p}', '\\vec{E}', '\\vec{F}'],
    formulaSnippets: ['F = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^2}', 'E = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q}{r^2}', '\\vec{\\tau} = \\vec{p} \\times \\vec{E}', 'U = -\\vec{p} \\cdot \\vec{E}'],
    standardTerms: ['electrostatics', 'charges', 'dipole', 'potential'],
    classGrade: 'Class 12',
  },
  'vernier-caliper': {
    acronyms: ['VC', 'LC', 'MSD', 'VSD'],
    experiments: ['Vernier Caliper Measurement', 'Zero Error Determination', 'Cylinder Diameter'],
    keywords: ['least count', 'main scale division', 'vernier scale division', 'positive zero error', 'negative zero error', 'internal jaws', 'external jaws', 'depth gauge'],
    greekSymbols: ['\\Delta x'],
    formulaSnippets: ['LC = 1\\text{ MSD} - 1\\text{ VSD}', '\\text{Total} = \\text{MSR} + (\\text{VSR} \\times \\text{LC}) - \\text{Zero Error}'],
    standardTerms: ['experimental physics', 'precision', 'measurement', 'least count'],
    classGrade: 'Class 11',
  },
  'screw-gauge': {
    acronyms: ['SG', 'MSG', 'PSR', 'HSR', 'CSR'],
    experiments: ['Micrometer Screw Gauge', 'Wire Diameter Measurement', 'Zero Error Pitch'],
    keywords: ['pitch', 'least count', 'circular scale', 'head scale', 'thimble', 'ratchet', 'backlash error', 'zero error'],
    greekSymbols: ['\\Delta d'],
    formulaSnippets: ['LC = \\frac{\\text{Pitch}}{\\text{Total Circular Divisions}}', '\\text{Reading} = \\text{PSR} + (\\text{CSR} \\times \\text{LC}) - \\text{ZE}'],
    standardTerms: ['precision instruments', 'micrometer', 'errors'],
    classGrade: 'Class 11',
  },
  'bohr-atom-spectrum': {
    acronyms: ['BAM', 'HYD', 'H-Alpha', 'Lyman', 'Balmer'],
    experiments: ['Bohr Hydrogen Atom', 'Hydrogen Emission Spectrum', 'Franck-Hertz Experiment'],
    keywords: ['energy levels', 'quantum number', 'rydberg constant', 'spectral series', 'lyman', 'balmer', 'paschen', 'brackett', 'pfund', 'ionization energy', 'orbital radius'],
    greekSymbols: ['\\lambda', '\\nu', '\\hbar'],
    formulaSnippets: ['E_n = -\\frac{13.6}{n^2}\\text{ eV}', 'r_n = 0.529 \\frac{n^2}{Z}\\text{ \\AA}', '\\frac{1}{\\lambda} = R Z^2\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)'],
    standardTerms: ['atomic structure', 'modern physics', 'photons', 'transitions'],
    classGrade: 'Class 12',
  },
  'vector-operations': {
    acronyms: ['VEC', 'DOT', 'CROSS', '3D'],
    experiments: ['3D Vector Resolution', 'Dot Product Projection', 'Cross Product Torque'],
    keywords: ['scalar product', 'cross product', 'resultant', 'parallelogram law', 'unit vector', 'orthogonality', 'angle between vectors', 'direction cosines'],
    greekSymbols: ['\\theta', '\\hat{i}', '\\hat{j}', '\\hat{k}'],
    formulaSnippets: ['\\vec{A} \\cdot \\vec{B} = |A||B|\\cos\\theta', '|\\vec{A} \\times \\vec{B}| = |A||B|\\sin\\theta', 'R = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}'],
    standardTerms: ['mathematical physics', 'vectors', 'algebra'],
    classGrade: 'Class 11',
  },
  'gravitational-orbit': {
    acronyms: ['GRAV', 'KPL', 'ESC', 'ORB'],
    experiments: ['Kepler Planetary Orbit Simulator', 'Satellite Orbit Mechanics', 'Escape Velocity'],
    keywords: ['gravitational law', 'kepler laws', 'ellipse', 'escape velocity', 'orbital velocity', 'geostationary satellite', 'areal velocity', 'gravitational potential', 'binding energy'],
    greekSymbols: ['G', 'M', '\\theta'],
    formulaSnippets: ['v_e = \\sqrt{\\frac{2GM}{R}}', 'v_o = \\sqrt{\\frac{GM}{R}}', 'T^2 \\propto r^3', 'U = -\\frac{GMm}{r}'],
    standardTerms: ['gravitation', 'planetary', 'satellites', 'astrophysics'],
    classGrade: 'Class 11',
  },
  'lorentz-force-cyclotron': {
    acronyms: ['LF', 'CR', 'CYC', 'MFC'],
    experiments: ['Lorentz Force Deflection', 'Cyclotron Accelerator', 'Helical Particle Trajectory'],
    keywords: ['magnetic force', 'cyclotron frequency', 'pitch of helix', 'radius of curvature', 'right hand rule', 'velocity selector', 'magnetic field'],
    greekSymbols: ['\\vec{B}', '\\vec{v}', '\\vec{E}', '\\omega_c', '\\theta'],
    formulaSnippets: ['\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})', 'r = \\frac{mv}{qB}', 'f_c = \\frac{qB}{2\\pi m}', 'p = v_\\parallel T = \\frac{2\\pi m v \\cos\\theta}{qB}'],
    standardTerms: ['electromagnetism', 'magnetic force', 'charged particle', 'helix'],
    classGrade: 'Class 12',
  },
  'ray-optics-lens-prism': {
    acronyms: ['TIR', 'LENS', 'PRISM', 'SNELL'],
    experiments: ['Thin Lens Ray Diagram', 'Prism Minimum Deviation', 'Total Internal Reflection Optical Fiber'],
    keywords: ['refractive index', 'snell law', 'critical angle', 'lens maker formula', 'minimum deviation', 'focal length', 'dispersion', 'chromatic aberration'],
    greekSymbols: ['\\mu', '\\theta_c', '\\delta_m', 'A'],
    formulaSnippets: ['\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)', '\\sin\\theta_c = \\frac{1}{\\mu}', '\\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin(A/2)}', '\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}'],
    standardTerms: ['geometric optics', 'refraction', 'lenses', 'prism'],
    classGrade: 'Class 12',
  },
  'circular-motion': {
    acronyms: ['CM', 'CF', 'CPF', 'BANK'],
    experiments: ['Banking of Curved Tracks', 'Conical Pendulum', 'Centripetal Force Apparatus'],
    keywords: ['centripetal acceleration', 'banking angle', 'maximum safe speed', 'friction on curves', 'centrifugal force', 'conical pendulum', 'vertical circular motion'],
    greekSymbols: ['\\theta', '\\omega', '\\mu_s'],
    formulaSnippets: ['a_c = \\frac{v^2}{R} = \\omega^2 R', 'v_{\\max} = \\sqrt{R g \\frac{\\tan\\theta + \\mu}{1 - \\mu \\tan\\theta}}', '\\tan\\theta = \\frac{v^2}{Rg}', 'T = mg\\cos\\theta + \\frac{mv^2}{R}'],
    standardTerms: ['circular dynamics', 'centripetal', 'banking', 'rotation'],
    classGrade: 'Class 11',
  },
  'pure-rolling-motion': {
    acronyms: ['PRM', 'ROLL', 'MOI', 'ROG'],
    experiments: ['Pure Rolling Down Incline', 'Cylinder & Sphere Race', 'Instantaneous Axis of Rotation'],
    keywords: ['pure rolling', 'moment of inertia', 'radius of gyration', 'rotational kinetic energy', 'slipping', 'friction direction', 'instantaneous center'],
    greekSymbols: ['\\omega', '\\alpha', '\\tau', 'I', 'k'],
    formulaSnippets: ['v_{cm} = R\\omega', 'a = \\frac{g\\sin\\theta}{1 + \\frac{k^2}{R^2}}', 'K = \\frac{1}{2}M v_{cm}^2\\left(1 + \\frac{k^2}{R^2}\\right)'],
    standardTerms: ['rigid body dynamics', 'rotation', 'rolling', 'inertia'],
    classGrade: 'Class 11',
  },
  'electromagnetic-induction': {
    acronyms: ['EMI', 'EMF', 'LENZ', 'FARADAY'],
    experiments: ["Faraday's Induction Coil", "Lenz's Law Deflection", "Motional EMF Rod in B-field"],
    keywords: ['magnetic flux', 'induced emf', 'lenz law', 'motional emf', 'self induction', 'mutual induction', 'eddy currents', 'induced current'],
    greekSymbols: ['\\Phi_B', '\\mathcal{E}', 'e', '\\vec{B}'],
    formulaSnippets: ['\\mathcal{E} = -\\frac{d\\Phi_B}{dt}', '\\mathcal{E} = B v L', '\\Phi_B = \\vec{B} \\cdot \\vec{A} = BA\\cos\\theta', 'L = \\frac{N\\Phi}{I}'],
    standardTerms: ['electromagnetism', 'flux', 'induction', 'solenoid'],
    classGrade: 'Class 12',
  },
  'photoelectric-effect': {
    acronyms: ['PEE', 'PE', 'WF', 'PHO'],
    experiments: ["Hertz-Hallwachs Setup", "Photoelectric Tube", "Stopping Potential Measurement"],
    keywords: ['photoelectric effect', 'work function', 'stopping potential', 'threshold frequency', 'einstein photoelectric equation', 'photon energy', 'cut-off wavelength'],
    greekSymbols: ['\\nu_0', '\\phi_0', '\\lambda_0', 'e V_s'],
    formulaSnippets: ['K_{\\max} = h\\nu - \\phi_0', 'e V_s = h\\nu - \\phi_0', '\\phi_0 = h\\nu_0 = \\frac{hc}{\\lambda_0}'],
    standardTerms: ['modern physics', 'photons', 'quantum', 'dual nature'],
    classGrade: 'Class 12',
  },
  'thermo-pv-cycle': {
    acronyms: ['PV', 'KTG', 'CARNOT', 'HE'],
    experiments: ['Carnot Heat Engine Simulator', 'PV Indicator Diagram', 'Otto / Diesel Cycle'],
    keywords: ['carnot cycle', 'indicator diagram', 'adiabatic process', 'isothermal process', 'heat engine efficiency', 'refrigerator cop', 'entropy', 'first law of thermodynamics'],
    greekSymbols: ['\\eta', '\\gamma', '\\Delta U', 'Q', 'W'],
    formulaSnippets: ['\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W}{Q_H}', 'PV^\\gamma = \\text{const}', '\\Delta Q = \\Delta U + \\Delta W', 'W = nRT \\ln\\left(\\frac{V_2}{V_1}\\right)'],
    standardTerms: ['thermodynamics', 'heat engine', 'entropy', 'ideal gas'],
    classGrade: 'Class 11',
  },
  'doppler-effect': {
    acronyms: ['DOP', 'DF', 'RED', 'BLUE'],
    experiments: ['Doppler Frequency Shift Simulator', 'Acoustic Siren', 'Radar Speed Gun'],
    keywords: ['doppler effect', 'apparent frequency', 'source moving', 'observer moving', 'redshift', 'blueshift', 'acoustic beat', 'shockwave', 'mach cone'],
    greekSymbols: ['f', 'f\'', 'v_s', 'v_o'],
    formulaSnippets: ['f\' = f \\left(\\frac{v \\pm v_o}{v \\mp v_s}\\right)', '\\frac{\\Delta f}{f} = \\frac{v_r}{c}'],
    standardTerms: ['sound waves', 'acoustics', 'frequency shift'],
    classGrade: 'Class 11',
  },
  'biot-savart-ampere': {
    acronyms: ['BSL', 'ACL', 'BIO', 'AMP'],
    experiments: ["Biot-Savart Wire Loop", "Ampere Circuital Ring", "Solenoid & Toroid Core"],
    keywords: ['biot savart law', 'ampere law', 'magnetic field of wire', 'magnetic field of circular coil', 'solenoid', 'toroid', 'permeability of free space'],
    greekSymbols: ['\\mu_0', 'I', 'd\\vec{l}', '\\vec{B}'],
    formulaSnippets: ['d\\vec{B} = \\frac{\\mu_0}{4\\pi}\\frac{I d\\vec{l} \\times \\hat{r}}{r^2}', 'B = \\frac{\\mu_0 I}{2\\pi R}', 'B_{axis} = \\frac{\\mu_0 I R^2}{2(R^2 + x^2)^{3/2}}', '\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enc}'],
    standardTerms: ['magnetostatics', 'magnetic field', 'currents', 'coils'],
    classGrade: 'Class 12',
  },
  'gauss-law-flux': {
    acronyms: ['GL', 'GAUSS', 'FLUX', 'SURF'],
    experiments: ["Gaussian Pillbox", "Spherical Shell Flux", "Infinite Line of Charge"],
    keywords: ['gauss law', 'electric flux', 'gaussian surface', 'enclosed charge', 'spherical shell', 'line charge density', 'surface charge density'],
    greekSymbols: ['\\Phi_E', '\\varepsilon_0', '\\sigma', '\\lambda', '\\rho'],
    formulaSnippets: ['\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\varepsilon_0}', 'E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r}', 'E = \\frac{\\sigma}{2\\varepsilon_0}'],
    standardTerms: ['electrostatics', 'flux', 'symmetry', 'charge density'],
    classGrade: 'Class 12',
  },
  'bernoulli-fluid-flow': {
    acronyms: ['BERN', 'FLUID', 'TORR', 'VENT'],
    experiments: ["Torricelli Tank Efflux", "Venturi Meter Flow", "Aerodynamic Lift Airfoil"],
    keywords: ['bernoulli principle', 'torricelli law of efflux', 'venturi meter', 'continuity equation', 'dynamic pressure', 'streamline flow', 'gauge pressure'],
    greekSymbols: ['\\rho', 'v', 'P', 'h'],
    formulaSnippets: ['P + \\frac{1}{2}\\rho v^2 + \\rho g h = \\text{const}', 'A_1 v_1 = A_2 v_2', 'v = \\sqrt{2gh}', 'P_1 - P_2 = \\frac{1}{2}\\rho (v_2^2 - v_1^2)'],
    standardTerms: ['fluid mechanics', 'hydrodynamics', 'pressure', 'flow'],
    classGrade: 'Class 11',
  },
  'wave-optics-polarization': {
    acronyms: ['POL', 'MALUS', 'BREW', 'QWP'],
    experiments: ["Malus's Law Polarimeter", "Brewster's Angle Reflector", "Quarter Wave Plate"],
    keywords: ['polarization', 'malus law', 'brewster angle', 'polaroid sheets', 'unpolarized light', 'birefringence', 'dichroism', 'optical rotation'],
    greekSymbols: ['\\theta_p', '\\theta_B', 'I_0', 'I'],
    formulaSnippets: ['I = I_0 \\cos^2\\theta', '\\tan\\theta_B = \\mu', 'I_{transmitted} = \\frac{1}{2}I_0'],
    standardTerms: ['wave optics', 'polarizer', 'analyzer', 'electromagnetic wave'],
    classGrade: 'Class 12',
  },
  'standing-waves-acoustics': {
    acronyms: ['SW', 'ORGAN', 'NODE', 'HARM'],
    experiments: ['Resonance Tube Organ Pipe', "Melde's String Apparatus", 'Chladni Plate'],
    keywords: ['standing wave', 'nodes', 'antinodes', 'organ pipe', 'open pipe', 'closed pipe', 'fundamental frequency', 'overtones', 'harmonics', 'end correction'],
    greekSymbols: ['\\lambda', 'f_n', 'v'],
    formulaSnippets: ['f_n = n \\frac{v}{2L}', 'f_n = (2n-1) \\frac{v}{4L}', '\\lambda = \\frac{2L}{n}', 'v = \\sqrt{\\frac{T}{\\mu}}'],
    standardTerms: ['acoustics', 'waves', 'resonance', 'harmonics'],
    classGrade: 'Class 11',
  },
  'radioactivity-nuclear-decay': {
    acronyms: ['RD', 'NUC', 'HL', 'BPE'],
    experiments: ['Radioactive Decay Chain', 'Half-Life Decay Curve', 'Nuclear Binding Energy Mass Defect'],
    keywords: ['radioactive decay law', 'half life', 'mean life', 'decay constant', 'activity', 'becquerel', 'mass defect', 'binding energy per nucleon', 'alpha decay', 'beta decay', 'gamma'],
    greekSymbols: ['\\lambda', 'N_0', 'T_{1/2}', '\\tau', '\\Delta m'],
    formulaSnippets: ['N(t) = N_0 e^{-\\lambda t}', 'T_{1/2} = \\frac{\\ln 2}{\\lambda} \\approx \\frac{0.693}{\\lambda}', 'A = \\lambda N', 'E_b = \\Delta m \\cdot c^2 = \\Delta m \\times 931.5\\text{ MeV}'],
    standardTerms: ['nuclear physics', 'modern physics', 'isotopes', 'decay'],
    classGrade: 'Class 12',
  },
  'heat-transfer-radiation': {
    acronyms: ['RAD', 'SB', 'WIEN', 'HEAT'],
    experiments: ['Blackbody Radiation Spectrum', "Stefan's Radiation Cube", "Wien's Displacement Curve"],
    keywords: ['stefan boltzmann law', 'wien displacement law', 'blackbody', 'emissivity', 'radiation heat transfer', 'peak wavelength', 'newton law of cooling'],
    greekSymbols: ['\\sigma', '\\lambda_{\\max}', 'e', 'T'],
    formulaSnippets: ['E = \\sigma e A T^4', '\\lambda_{\\max} T = b \\approx 2.898 \\times 10^{-3}\\text{ m\\cdot K}', '\\frac{dQ}{dt} = -k(T - T_0)'],
    standardTerms: ['thermal physics', 'radiation', 'heat transfer', 'blackbody'],
    classGrade: 'Class 11',
  },
  'work-energy-collisions': {
    acronyms: ['WPE', 'WET', 'COR', 'COLL'],
    experiments: ['1D Elastic Collision Track', 'Ballistic Pendulum', 'Coefficient of Restitution Bounce'],
    keywords: ['work energy theorem', 'coefficient of restitution', 'elastic collision', 'inelastic collision', 'conservation of momentum', 'impulse', 'conservative force'],
    greekSymbols: ['e', '\\Delta K', 'W_{net}'],
    formulaSnippets: ['W_{net} = \\Delta K = K_f - K_i', 'e = \\frac{v_2 - v_1}{u_1 - u_2}', 'm_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2', 'v_1 = \\frac{m_1 - m_2}{m_1 + m_2}u_1 + \\frac{2m_2}{m_1 + m_2}u_2'],
    standardTerms: ['mechanics', 'energy conservation', 'momentum', 'collisions'],
    classGrade: 'Class 11',
  },
  'newton-laws-pulley': {
    acronyms: ['NLM', 'ATWOOD', 'FBD', 'PULL'],
    experiments: ['Atwood Pulley Machine', 'Accelerating Frame Elevator', 'Block & Tackle System'],
    keywords: ['newton laws of motion', 'pseudo force', 'inertial frame', 'non inertial frame', 'tension in string', 'atwood machine', 'free body diagram', 'normal contact'],
    greekSymbols: ['a', 'T', 'g', 'm_1', 'm_2'],
    formulaSnippets: ['F_{net} = ma', 'a = \\frac{m_1 - m_2}{m_1 + m_2}g', 'T = \\frac{2m_1 m_2}{m_1 + m_2}g', 'F_{pseudo} = -m\\vec{A}'],
    standardTerms: ['mechanics', 'forces', 'pulleys', 'accelerated frames'],
    classGrade: 'Class 11',
  },
  'relative-motion-kinematics': {
    acronyms: ['RM', 'REL', 'RIV', 'RAIN'],
    experiments: ['River-Boat Shortest Path Crossing', 'Rain-Man Umbrella Angle', 'Relative Pursuit Interception'],
    keywords: ['relative velocity', 'shortest time crossing', 'shortest path crossing', 'river drift', 'rain man angle', 'apparent velocity of rain', 'relative acceleration'],
    greekSymbols: ['\\vec{v}_{AB}', '\\theta', 'd', 'w'],
    formulaSnippets: ['\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B', 't_{\\min} = \\frac{d}{v_{br}}', '\\sin\\theta = \\frac{v_r}{v_{br}}', '\\tan\\theta = \\frac{v_m}{v_r}'],
    standardTerms: ['kinematics', 'vectors', 'relative motion', 'drift'],
    classGrade: 'Class 11',
  },
  'elasticity-viscosity-stokes': {
    acronyms: ['YM', 'STOKES', 'VISC', 'ELAS'],
    experiments: ["Young's Modulus Wire Extension", "Stokes' Terminal Velocity Dropper", "Poiseuille Viscometer"],
    keywords: ['young modulus', 'stress and strain', 'hooke law', 'terminal velocity', 'stokes law', 'viscous drag force', 'reynolds number', 'shear modulus', 'bulk modulus'],
    greekSymbols: ['\\eta', '\\sigma', '\\varepsilon', 'Y', 'v_t'],
    formulaSnippets: ['Y = \\frac{\\text{Stress}}{\\text{Strain}} = \\frac{F/A}{\\Delta L/L}', 'F_v = 6\\pi\\eta r v', 'v_t = \\frac{2r^2(\\rho - \\sigma)g}{9\\eta}', 'U = \\frac{1}{2} \\times \\text{Stress} \\times \\text{Strain} \\times \\text{Volume}'],
    standardTerms: ['properties of matter', 'elasticity', 'viscosity', 'fluids'],
    classGrade: 'Class 11',
  },
  'center-of-mass-ragdoll': {
    acronyms: ['COM', 'CM', 'RAG', 'SYS'],
    experiments: ['Articulated Ragdoll Collision', 'Center of Mass Parabolic Flight', 'Exploding Projectile Simulation'],
    keywords: ['center of mass', 'discrete particle system', 'continuous mass distribution', 'motion of center of mass', 'internal forces', 'external forces', 'momentum conservation'],
    greekSymbols: ['\\vec{r}_{cm}', '\\vec{v}_{cm}', '\\vec{a}_{cm}', 'M'],
    formulaSnippets: ['\\vec{r}_{cm} = \\frac{\\sum m_i \\vec{r}_i}{\\sum m_i}', '\\vec{v}_{cm} = \\frac{\\sum m_i \\vec{v}_i}{M}', '\\vec{F}_{ext} = M \\vec{a}_{cm}'],
    standardTerms: ['system of particles', 'center of mass', 'mechanics'],
    classGrade: 'Class 11',
  },
};

/**
 * Fast Jump Acronym Pills to display when user focuses the search bar
 */
export interface PopularSearchChip {
  label: string;
  acronym: string;
  conceptId: string;
  categoryTag: string;
  color: 'cyan' | 'emerald' | 'amber' | 'purple' | 'teal';
}

export const POPULAR_SEARCH_CHIPS: PopularSearchChip[] = [
  { label: 'YDSE (Double Slit)', acronym: 'YDSE', conceptId: 'youngs-double-slit', categoryTag: 'Optics', color: 'cyan' },
  { label: 'SHM Oscillator', acronym: 'SHM', conceptId: 'shm-spring-pendulum', categoryTag: 'Oscillations', color: 'emerald' },
  { label: 'LCR AC Circuit', acronym: 'LCR', conceptId: 'lcr-circuit', categoryTag: 'AC Circuits', color: 'purple' },
  { label: 'Carnot PV Cycle', acronym: 'PV', conceptId: 'thermo-pv-cycle', categoryTag: 'Thermo', color: 'amber' },
  { label: 'Bohr Atom Series', acronym: 'BAM', conceptId: 'bohr-atom-spectrum', categoryTag: 'Modern', color: 'cyan' },
  { label: 'Bernoulli Efflux', acronym: 'BERN', conceptId: 'bernoulli-fluid-flow', categoryTag: 'Fluids', color: 'teal' },
  { label: 'Lorentz Force', acronym: 'LF', conceptId: 'lorentz-force-cyclotron', categoryTag: 'Magnetism', color: 'purple' },
  { label: 'Doppler Shift', acronym: 'DOP', conceptId: 'doppler-effect', categoryTag: 'Waves', color: 'emerald' },
  { label: 'Atwood Pulley', acronym: 'NLM', conceptId: 'newton-laws-pulley', categoryTag: 'Mechanics', color: 'amber' },
  { label: 'Stokes Drag', acronym: 'YM', conceptId: 'elasticity-viscosity-stokes', categoryTag: 'Matter', color: 'teal' },
];

export interface SearchMatchResult {
  concept: PhysicsConcept;
  score: number;
  matchReasons: string[];
  matchedAcronym?: string;
  matchedFormula?: string;
  primaryFormulaLatex: string;
  classGrade?: 'Class 11' | 'Class 12';
}

/**
 * Normalizes input text for resilient physics matching:
 * - strips punctuation, extra whitespace
 * - lowercases
 * - handles common physics symbol transliterations (e.g. lambda, omega, theta)
 */
export function normalizeSearchTerm(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s\d=^_\+\-\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent Multi-Vector Search Algorithm
 * Analyzes:
 * 1. Exact & Substring Acronyms (e.g. YDSE, SHM, LCR, EMF, NLM, TIR, COM)
 * 2. Experiment & Apparatus names
 * 3. Physics Formulas & LaTeX tokens (e.g. beta = lambda*D/d, T = 2pi sqrt(m/k))
 * 4. Greek Variable transliterations (e.g. "lambda", "omega", "theta", "mu", "epsilon")
 * 5. Syllabus Chapters & Keywords
 */
export function searchPhysicsConcepts(
  query: string,
  allConcepts: PhysicsConcept[],
  categoryFilter?: 'all' | 'experiments' | 'formulas' | 'acronyms' | 'class11' | 'class12'
): SearchMatchResult[] {
  const cleanQ = normalizeSearchTerm(query);
  if (!cleanQ) return [];

  const rawUpperQ = query.trim().toUpperCase();
  const tokens = cleanQ.split(' ').filter(Boolean);

  const scoredResults: SearchMatchResult[] = [];

  for (const concept of allConcepts) {
    const meta = CONCEPT_METADATA_REGISTRY[concept.id];
    let score = 0;
    const matchReasons: string[] = [];
    let matchedAcronym: string | undefined = undefined;
    let matchedFormula: string | undefined = undefined;

    // Apply category filters early
    if (categoryFilter === 'class11' && meta?.classGrade !== 'Class 11') continue;
    if (categoryFilter === 'class12' && meta?.classGrade !== 'Class 12') continue;

    // 1. Direct Acronym Match (Highest Priority)
    if (meta?.acronyms) {
      for (const acr of meta.acronyms) {
        if (acr.toUpperCase() === rawUpperQ) {
          score += 150;
          matchReasons.push(`⚡ Exact Acronym: ${acr}`);
          matchedAcronym = acr;
          break;
        } else if (rawUpperQ.length >= 2 && acr.toUpperCase().includes(rawUpperQ)) {
          score += 90;
          matchReasons.push(`⚡ Acronym: ${acr}`);
          matchedAcronym = acr;
        }
      }
    }

    // 2. Concept Title Matching
    const cleanTitle = normalizeSearchTerm(concept.title);
    if (cleanTitle === cleanQ) {
      score += 120;
      matchReasons.push(`🎯 Exact Title`);
    } else if (cleanTitle.includes(cleanQ)) {
      score += 85;
      matchReasons.push(`🎯 Title Match`);
    } else {
      // Check individual token hits in title
      const tokenHits = tokens.filter((t) => cleanTitle.includes(t));
      if (tokenHits.length > 0) {
        score += tokenHits.length * 25;
      }
    }

    // 3. Apparatus & Experiment Name Matches
    if (meta?.experiments) {
      for (const exp of meta.experiments) {
        const cleanExp = normalizeSearchTerm(exp);
        if (cleanExp.includes(cleanQ)) {
          score += 80;
          matchReasons.push(`🔬 Apparatus: ${exp}`);
          break;
        }
      }
    }

    // 4. Formula LaTeX & Names Matches
    for (const f of concept.formulas) {
      const cleanFTitle = normalizeSearchTerm(f.name);
      const cleanLatex = f.latex.toLowerCase();

      if (cleanFTitle.includes(cleanQ)) {
        score += 70;
        matchReasons.push(`📐 Formula: ${f.name}`);
        if (!matchedFormula) matchedFormula = f.latex;
      } else if (cleanLatex.includes(cleanQ)) {
        score += 65;
        matchReasons.push(`📐 Equation: $${f.latex}$`);
        if (!matchedFormula) matchedFormula = f.latex;
      }
    }

    // 5. Greek & Physical Symbols Match
    if (meta?.greekSymbols) {
      for (const sym of meta.greekSymbols) {
        const cleanSym = sym.replace(/[\\]/g, '').toLowerCase();
        if (cleanQ.includes(cleanSym)) {
          score += 45;
          matchReasons.push(`Ψ Symbol: ${sym}`);
          break;
        }
      }
    }

    // 6. Keywords, Topic, and Chapter Code Matching
    const cleanTopic = normalizeSearchTerm(concept.topic);
    if (cleanTopic.includes(cleanQ)) {
      score += 40;
      matchReasons.push(`📚 Chapter: ${concept.topic}`);
    }

    if (meta?.keywords) {
      for (const kw of meta.keywords) {
        if (kw.toLowerCase().includes(cleanQ)) {
          score += 35;
          matchReasons.push(`🔑 Key Concept: ${kw}`);
          break;
        }
      }
    }

    // 7. Coaching module traps and shortcuts
    if (concept.coachingModule) {
      for (const sub of concept.coachingModule.subtopics) {
        for (const sc of sub.shortcuts || []) {
          if (sc.toLowerCase().includes(cleanQ)) {
            score += 25;
            matchReasons.push(`⚡ JEE Shortcut Match`);
            break;
          }
        }
      }
    }

    // Filter by specific types if active
    if (categoryFilter === 'acronyms' && !matchedAcronym) continue;
    if (categoryFilter === 'formulas' && !matchedFormula && !matchReasons.some((r) => r.startsWith('📐'))) continue;
    if (categoryFilter === 'experiments' && !matchReasons.some((r) => r.startsWith('🔬') || r.startsWith('⚡'))) continue;

    if (score > 0) {
      const primaryFormula = matchedFormula || concept.formulas[0]?.latex || 'E = mc^2';
      scoredResults.push({
        concept,
        score,
        matchReasons: Array.from(new Set(matchReasons)),
        matchedAcronym,
        matchedFormula,
        primaryFormulaLatex: primaryFormula,
        classGrade: meta?.classGrade || 'Class 11',
      });
    }
  }

  // Sort descending by relevance score
  return scoredResults.sort((a, b) => b.score - a.score);
}
