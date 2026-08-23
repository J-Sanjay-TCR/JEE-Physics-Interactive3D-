export interface JeeChapterSyllabusItem {
  id: string;
  unit_name: 'Mechanics' | 'Thermal Physics' | 'Electricity & Magnetism' | 'Optics' | 'Modern Physics';
  chapter_name: string;
  conceptId: string;
  core_explanation: string;
  important_cases: string[];
  '3d_model_spec': {
    visual_description: string;
    interactive_variables: string[];
    expected_behavior: string;
  };
}

export const JEE_SYLLABUS_DIRECTORY: JeeChapterSyllabusItem[] = [
  {
    id: 'syl-kinematics',
    unit_name: 'Mechanics',
    chapter_name: 'Kinematics',
    conceptId: 'projectile-motion',
    core_explanation:
      'Kinematics analyzes the geometry of motion of particles and bodies without regard to the forces causing it. It establishes foundational relationships between position, displacement, velocity, and acceleration vectors in 1D, 2D (projectile), and relative frames.',
    important_cases: [
      'Projectile motion on an inclined plane (maximum range up and down the incline)',
      'Shortest distance and minimum time of approach between two moving bodies in 2D',
      'Relative river-swimmer and rain-umbrella vector resolution problems',
      'Variable acceleration kinematics requiring calculus constraints and trajectory equations',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D projectile trajectory launcher with a customizable inclined launch surface, real-time velocity vector arrows (vx, vy, vz), and particle trace ribbons showing the parabolic flight path with apex and landing markers.',
      interactive_variables: [
        'Initial Velocity (v0)',
        'Launch Angle (theta)',
        'Incline Slope Angle (alpha)',
        'Air Drag Coefficient (k)',
      ],
      expected_behavior:
        'Adjusting the sliders dynamically updates the 3D parabolic trajectory, alters flight time, range, and maximum height, and adjusts the tangent velocity and normal acceleration vectors at every path coordinate.',
    },
  },
  {
    id: 'syl-laws-of-motion',
    unit_name: 'Mechanics',
    chapter_name: 'Laws of Motion',
    conceptId: 'inclined-plane-friction',
    core_explanation:
      'Newton\'s laws of motion establish the relationship between the forces acting on a body and its resulting acceleration, governed by reference frames and equilibrium conditions. It forms the backbone of free-body diagrams, constraint relations, and static/kinetic friction models.',
    important_cases: [
      'Block on a movable wedge on a smooth horizontal floor with normal force constraints',
      'Two-block friction systems on horizontal and inclined surfaces (slipping vs. stick conditions)',
      'Pulley-block systems with massive cords, movable pulleys, and wedge constraints',
      'Banking of circular road tracks with static friction limits for maximum and minimum safe speeds',
    ],
    '3d_model_spec': {
      visual_description:
        'A triangular wedge resting on a frictionless floor with a block on its incline, connected via a string over a pulley, showing real-time 3D contact normal, friction, tension, and gravity force vectors.',
      interactive_variables: [
        'Wedge Mass (M)',
        'Block Mass (m)',
        'Incline Angle (theta)',
        'Static & Kinetic Friction Coefficients (mu_s, mu_k)',
        'External Force (F_ext)',
      ],
      expected_behavior:
        'Simulates whether the block stays stuck or slips relative to the wedge, moves the wedge dynamically, and updates all vector arrows and normal reactions in real-time.',
    },
  },
  {
    id: 'syl-work-energy-power',
    unit_name: 'Mechanics',
    chapter_name: 'Work-Energy-Power',
    conceptId: 'shm-spring-pendulum',
    core_explanation:
      'Work-Energy Theorem dictates that the total work done by all conservative, non-conservative, and external forces equals the change in kinetic energy. It introduces conservative force potential energy wells and equilibrium stability criteria.',
    important_cases: [
      'Vertical circular motion with minimum velocity thresholds for completing full loops and string slack conditions',
      'Non-linear spring compression with friction and air-resistance dissipation',
      'Equilibrium classification (stable, unstable, neutral) from potential energy U(x) minima and maxima',
      '1D and 2D elastic and inelastic collisions with coefficient of restitution (e)',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D vertical loop track with a roller coaster bob attached to a string or rail, accompanied by an interactive dynamic potential well curve U(x) and synchronized kinetic/potential energy bar charts.',
      interactive_variables: [
        'Bob Mass (m)',
        'String Length / Loop Radius (R)',
        'Bottom Initial Velocity (v0)',
        'Coefficient of Restitution (e)',
      ],
      expected_behavior:
        'Shows whether the bob completes the circle, slacks and enters parabolic flight, or oscillates, with real-time tension vectors and energy conservation bar transitions.',
    },
  },
  {
    id: 'syl-rotation',
    unit_name: 'Mechanics',
    chapter_name: 'Rotation',
    conceptId: 'pure-rolling-motion',
    core_explanation:
      'Rotational dynamics extends translational mechanics to rigid bodies through moment of inertia, torque, and angular momentum conservation. It describes both fixed-axis rotation and combined translational-rotational motion (pure rolling).',
    important_cases: [
      'Pure rolling on a rough inclined plane and transition from slipping to pure rolling',
      'Instantaneous Axis of Rotation (IAOR) analysis for rolling and hinged rod systems',
      'Angular momentum conservation during collision of point masses with rigid rods or discs',
      'Toppling vs. sliding criteria of rectangular blocks and cylinders on inclined planes',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D cylinder/disc rolling down an inclined plane onto a flat track with an Instantaneous Axis of Rotation (IAOR) marker, contact friction vector, and separate linear/rotational velocity vectors.',
      interactive_variables: [
        'Shape Factor / Body Geometry (Hoop, Solid Cylinder, Solid Sphere, Hollow Sphere)',
        'Incline Angle (theta)',
        'Static Friction Coefficient (mu_s)',
        'Radius (R)',
        'Mass (M)',
      ],
      expected_behavior:
        'Simulates pure rolling when static friction is sufficient; shows slipping and skid marks when theta exceeds the critical angle, updating rotational speed omega and translational speed v_cm.',
    },
  },
  {
    id: 'syl-gravitation',
    unit_name: 'Mechanics',
    chapter_name: 'Gravitation',
    conceptId: 'gravitational-orbit',
    core_explanation:
      'Newton\'s universal law of gravitation governs inverse-square mutual attraction and orbital Keplerian mechanics. It models gravitational potential, escape velocity, and energy trajectories of celestial bodies and satellites.',
    important_cases: [
      'Satellite orbital transfer between elliptical and circular orbits (Hohmann transfer)',
      'Variation of acceleration due to gravity with altitude, depth, and Earth\'s planetary rotation',
      'Gravitational field and potential inside and outside uniform solid spheres and spherical shells',
      'Motion of a particle released inside a diametrical tunnel drilled through the Earth',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D celestial planet with an orbiting satellite, displaying orbital paths, ellipse focal points, gravitational field lines, and velocity vectors at perigee and apogee.',
      interactive_variables: [
        'Central Planet Mass (M)',
        'Orbital Altitude (h)',
        'Initial Insertion Velocity (v)',
        'Eccentricity (e)',
      ],
      expected_behavior:
        'Visualizes transitions between circular, elliptical, parabolic (escape), and hyperbolic trajectories, demonstrating Kepler\'s second law (equal area sweep in equal time).',
    },
  },
  {
    id: 'syl-properties-of-matter',
    unit_name: 'Mechanics',
    chapter_name: 'Properties of Matter',
    conceptId: 'bernoulli-fluid-flow',
    core_explanation:
      'Explores the mechanical behavior of bulk matter through elasticity, fluid statics, fluid dynamics, and surface phenomena. It incorporates Young\'s modulus, hydrostatic pressure, Pascal\'s principle, Bernoulli\'s energy theorem, and viscous drag.',
    important_cases: [
      'Searle\'s apparatus Young\'s modulus wire elongation and stress-strain curves',
      'Torricelli\'s law of efflux through orifices with falling liquid surface speed',
      'Capillary tube ascent/descent with meniscus contact angle and excess pressure inside bubbles',
      'Terminal velocity of a spherical body falling through a viscous fluid under Stokes\' law',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D fluid container with an efflux orifice at adjustable height, showing the draining streamline flow, parabolic liquid jet, and a capillary tube apparatus alongside.',
      interactive_variables: [
        'Fluid Density (rho)',
        'Orifice Height (h)',
        'Liquid Column Height (H)',
        'Fluid Viscosity (eta)',
        'Surface Tension (T)',
      ],
      expected_behavior:
        'Updates efflux jet velocity, trajectory range, fluid drainage rate, and capillary meniscus height in real-time.',
    },
  },
  {
    id: 'syl-laws-of-thermodynamics',
    unit_name: 'Thermal Physics',
    chapter_name: 'Laws of Thermodynamics',
    conceptId: 'thermo-pv-cycle',
    core_explanation:
      'Thermodynamics formulates heat, work, and internal energy exchanges in closed and open systems through the First and Second Laws. It governs state functions, reversible/irreversible pathways, and heat engine efficiency limits.',
    important_cases: [
      'Cyclic processes on P-V, T-S, and P-T indicator diagrams with net work and efficiency',
      'Adiabatic expansion/compression relations (PV^gamma = const) vs. isothermal processes',
      'Carnot, Otto, and Stirling engine cycles with maximum theoretical efficiency',
      'Mixing of non-ideal gases and calculation of molar heat capacities for polytropic processes (PV^n = const)',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D transparent piston-cylinder chamber enclosing animated gas particles, synchronized with an interactive 3D/2D P-V-T thermodynamic surface and state-point indicator.',
      interactive_variables: [
        'Gas Moles (n)',
        'Degrees of Freedom / Atomicity (gamma)',
        'Process Type (Isothermal, Adiabatic, Isobaric, Isochoric)',
        'Compression Ratio (V1/V2)',
        'Heat Input (Q)',
      ],
      expected_behavior:
        'Piston compresses or expands, changing gas particle temperature-dependent velocities, updating pressure gauge readouts, and tracing closed cycles on the P-V plot.',
    },
  },
  {
    id: 'syl-kinetic-theory',
    unit_name: 'Thermal Physics',
    chapter_name: 'Kinetic Theory',
    conceptId: 'thermo-pv-cycle',
    core_explanation:
      'Kinetic Theory of Gases explains macroscopic thermodynamic variables from microscopic molecular collisions and statistical mechanics. It derives gas pressure, root-mean-square velocity, mean free path, and equipartition of energy.',
    important_cases: [
      'Maxwell-Boltzmann molecular speed distribution curves across varying temperatures',
      'Degrees of freedom and molar specific heats (Cv, Cp) of monoatomic, diatomic, and polyatomic gases with vibrational modes',
      'Mean free path dependence on molecular diameter, gas density, and pressure',
      'Real gas van der Waals equation corrections for molecular volume and intermolecular attraction',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D bounded bounding box with colliding rigid sphere molecules color-coded by kinetic energy, paired with a real-time Maxwell-Boltzmann speed histogram.',
      interactive_variables: [
        'Gas Temperature (T)',
        'Molar Mass (M)',
        'Molecule Count (N)',
        'Molecular Diameter (sigma)',
      ],
      expected_behavior:
        'Increasing temperature broadens and shifts the Maxwellian speed curve to higher velocities, increases collision frequency with container walls, and dynamically elevates pressure.',
    },
  },
  {
    id: 'syl-heat-transfer',
    unit_name: 'Thermal Physics',
    chapter_name: 'Heat Transfer',
    conceptId: 'heat-transfer-radiation',
    core_explanation:
      'Analyzes the three fundamental mechanisms of thermal energy propagation: conduction (Fourier\'s law), convection, and radiation (Stefan-Boltzmann and Wien\'s laws). It models thermal resistance networks and blackbody emission spectra.',
    important_cases: [
      'Thermal resistance combinations (series and parallel composite slabs) and junction temperature determination',
      'Newton\'s law of cooling for small temperature differentials with convection losses',
      'Stefan-Boltzmann radiation law and Wien\'s displacement law (lambda_max * T = b) for blackbody emission',
      'Growth of ice on the surface of ponds in sub-zero ambient conditions',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D composite metallic slab connecting two thermal reservoirs (Hot and Cold) with a heat flux vector field and color gradient temperature contours.',
      interactive_variables: [
        'Hot Source Temperature (T_hot)',
        'Cold Sink Temperature (T_cold)',
        'Layer Thicknesses (L1, L2)',
        'Thermal Conductivities (k1, k2)',
        'Emissivity (e)',
      ],
      expected_behavior:
        'Computes junction equilibrium temperatures, updates heat flux arrows, and illustrates steady-state thermal gradients across composite materials.',
    },
  },
  {
    id: 'syl-electrostatics',
    unit_name: 'Electricity & Magnetism',
    chapter_name: 'Electrostatics',
    conceptId: 'electric-field-charges',
    core_explanation:
      'Electrostatics deals with static charge distributions, Coulomb interactions, electric fields, and potentials governed by Gauss\'s law. It establishes capacitor energy storage, dielectric boundary polarizations, and conductor shielding.',
    important_cases: [
      'Electric field and potential of continuous charge distributions (charged rings, infinite planes, nested spherical shells)',
      'Capacitor with partially inserted dielectric slabs and electrostatic force on dielectric boundary',
      'Conductor surface charge redistribution, electrostatic shielding, and image charge setups',
      'Dipole in uniform and non-uniform electric fields (torque, potential energy, and force)',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D interactive charge canvas with point charges and dielectric capacitor plates, rendering 3D electric field lines, equipotential surfaces, and dielectric polarization vectors.',
      interactive_variables: [
        'Charge Magnitudes (q1, q2)',
        'Plate Separation (d)',
        'Dielectric Constant (kappa)',
        'Dielectric Insertion Fraction (x/L)',
      ],
      expected_behavior:
        'Field lines bend and terminate dynamically upon moving charges; inserting dielectrics boosts capacitance, scales stored energy, and illustrates bound surface charges.',
    },
  },
  {
    id: 'syl-current-electricity',
    unit_name: 'Electricity & Magnetism',
    chapter_name: 'Current Electricity',
    conceptId: 'lcr-circuit',
    core_explanation:
      'Covers steady-state and transient charge flow in conductors, defined by Ohm\'s law, microscopic drift velocity, and Kirchhoff\'s loop/junction laws. It explores measuring instruments, RC circuits, and symmetry-based resistor networks.',
    important_cases: [
      'Meter Bridge and Potentiometer wire experiments for finding unknown EMF and internal resistance',
      'RC transient charging and discharging circuits with time constant tau = RC',
      'Cube resistor networks and infinite ladder networks using nodal symmetry',
      'Temperature dependence of resistance, color coding, and maximum power transfer theorem',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D breadboard circuit bench displaying a Potentiometer / Wheatstone Bridge with a sliding jockey, animated charge flow particles, and live digital multimeter displays.',
      interactive_variables: [
        'Potentiometer Wire Resistance (R_wire)',
        'Auxiliary Battery EMF (E1, E2)',
        'Jockey Tap Position (L_balance)',
        'Capacitance (C)',
        'Load Resistance (R_L)',
      ],
      expected_behavior:
        'Sliding the jockey changes the galvanometer deflection needle from negative to null balance (zero current) and calculates internal resistance and unknown EMF.',
    },
  },
  {
    id: 'syl-magnetics',
    unit_name: 'Electricity & Magnetism',
    chapter_name: 'Magnetics',
    conceptId: 'lorentz-force-cyclotron',
    core_explanation:
      'Describes magnetic fields created by moving charges and currents via the Biot-Savart and Ampère circuital laws, and the Lorentz force acting on charges and current-carrying wires. It includes magnetic dipoles and planetary magnetism.',
    important_cases: [
      'Helical motion of a charged particle entering a uniform magnetic field at an arbitrary angle',
      'Magnetic field along the axis and center of circular loops, Helmholtz coils, and finite solenoids',
      'Force between parallel current-carrying conductors and torque on arbitrary planar current loops',
      'Moving Coil Galvanometer (MCG) conversion into Ammeter and Voltmeter using shunt/series resistors',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D velocity selector chamber and magnetic spectrometer showing helical electron/proton trajectories in customizable combined E and B fields.',
      interactive_variables: [
        'Magnetic Field Strength (B)',
        'Electric Field Strength (E)',
        'Particle Charge & Mass (q, m)',
        'Particle Injection Velocity (v0)',
        'Pitch Angle (theta)',
      ],
      expected_behavior:
        'Particle executes circular, helical, or straight drift trajectories; altering B compresses cyclotron radius (r = mv/qB) and pitch length.',
    },
  },
  {
    id: 'syl-emi',
    unit_name: 'Electricity & Magnetism',
    chapter_name: 'Electromagnetic Induction (EMI)',
    conceptId: 'electromagnetic-induction',
    core_explanation:
      'Faraday\'s Law of induction and Lenz\'s Law define induced electromotive force (EMF) arising from time-varying magnetic flux or motional conductor dynamics. It integrates self/mutual inductance and LR transient circuit mechanics.',
    important_cases: [
      'Motional EMF on rotating rods and sliding rails across uniform and spatially varying magnetic fields',
      'LR circuit growth and decay of current with inductive time constant tau = L/R',
      'Self-inductance of solenoids and mutual inductance of concentric coaxial loops',
      'Eddy current damping and electromagnetic braking mechanisms',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D conducting U-rail track with a sliding metal bar in a perpendicular magnetic field, connected to an inductor-resistor load, showing induced current loop vectors and opposing magnetic drag forces.',
      interactive_variables: [
        'Magnetic Field (B)',
        'Rail Width (L)',
        'Bar Velocity (v)',
        'Inductance (L_ind)',
        'Circuit Resistance (R)',
      ],
      expected_behavior:
        'Moving the bar induces an EMF (e = BvL), generating circulating current that lights up a bulb and exerts an opposing Lorentz magnetic braking force (F = B^2 L^2 v / R).',
    },
  },
  {
    id: 'syl-ac',
    unit_name: 'Electricity & Magnetism',
    chapter_name: 'Alternating Current (AC)',
    conceptId: 'lcr-circuit',
    core_explanation:
      'Analyzes sinusoidally varying voltages and currents across reactive components (resistors, inductors, capacitors) using phasor diagrams and complex impedance. It governs resonance, power factor, and transformer coupling.',
    important_cases: [
      'Series and parallel LCR circuit resonance (resonance frequency, quality factor Q, and bandwidth)',
      'Phasor analysis for phase difference phi between AC voltage and current',
      'Average and apparent power consumption with power factor (cos phi) and wattless current',
      'Step-up and step-down transformer voltage/current ratios with iron core eddy losses',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D rotating phasor diagram with rotating vectors (V_R, V_L, V_C, I) alongside a dual-channel oscilloscope displaying time-domain waveforms.',
      interactive_variables: [
        'AC Source Frequency (f)',
        'Peak Voltage (V0)',
        'Resistance (R)',
        'Inductance (L)',
        'Capacitance (C)',
      ],
      expected_behavior:
        'Sweeping the frequency through resonance aligns current and voltage in-phase, minimizes total impedance to Z = R, and maximizes current amplitude.',
    },
  },
  {
    id: 'syl-ray-optics',
    unit_name: 'Optics',
    chapter_name: 'Ray Optics',
    conceptId: 'ray-optics-lens-prism',
    core_explanation:
      'Ray optics approximates light propagation as rectilinear rays obeying laws of reflection, Snell\'s law of refraction, and dispersion. It establishes image formation through spherical mirrors, thin lenses, optical prisms, and optical instruments.',
    important_cases: [
      'Total Internal Reflection (TIR) and critical angle conditions in prisms and optical fibers',
      'Lens maker\'s formula and combination of thin lenses with silvered surfaces',
      'Refraction at spherical single surfaces (n2/v - n1/u = (n2 - n1)/R)',
      'Astronomical telescope and compound microscope magnifying power in normal adjustment and near-point modes',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D optical bench with customizable biconvex/biconcave lenses, a triangular dispersion prism, optical ray traces, focal planes, and real/virtual image projections.',
      interactive_variables: [
        'Object Distance (u)',
        'Focal Length (f)',
        'Refractive Index (n)',
        'Prism Apex Angle (A)',
        'Object Height (h)',
      ],
      expected_behavior:
        'Moving the object smoothly transitions image position, real-versus-virtual nature, magnification, and demonstrates minimum deviation angle through the prism.',
    },
  },
  {
    id: 'syl-wave-optics',
    unit_name: 'Optics',
    chapter_name: 'Wave Optics',
    conceptId: 'youngs-double-slit',
    core_explanation:
      'Wave optics treats light as an electromagnetic wave, explaining phenomena inexplicable by geometric optics: interference, diffraction, and polarization. It leverages Huygens\' principle, coherent superposition, and Malus\'s law.',
    important_cases: [
      'Young\'s Double Slit Experiment (YDSE) with central fringe shift due to mica sheet insertion',
      'Single slit Fraunhofer diffraction intensity profile and angular width of central maximum',
      'Brewster\'s angle (tan i_p = mu) and polarization by reflection and polaroids (Malus\'s Law: I = I0 cos^2 theta)',
      'Resolving power and Rayleigh criterion of microscopes and telescopes',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D dual-slit aperture illuminating a screen, showing volumetric coherent wavefronts, path difference rays, and an interactive 3D intensity fringe pattern plot.',
      interactive_variables: [
        'Light Wavelength (lambda)',
        'Slit Separation (d)',
        'Screen Distance (D)',
        'Mica Sheet Thickness & Refractive Index (t, mu)',
        'Polarizer Angle (theta)',
      ],
      expected_behavior:
        'Changing wavelength scales fringe width beta = lambda*D/d, inserting a transparent sheet shifts the central maxima, and rotating the analyzer dims transmission following cos^2(theta).',
    },
  },
  {
    id: 'syl-dual-nature',
    unit_name: 'Modern Physics',
    chapter_name: 'Dual Nature of Matter',
    conceptId: 'photoelectric-effect',
    core_explanation:
      'Establishes wave-particle duality through the photoelectric effect (Einstein\'s photon theory) and matter waves (de Broglie hypothesis). It connects stopping potential, photon threshold frequency, and Davisson-Germer electron diffraction.',
    important_cases: [
      'Einstein\'s photoelectric equation (h*nu = Phi + K_max = Phi + e*V_stop) with V_stop vs. frequency graphs',
      'Variation of photoelectric current with collector plate voltage and incident light intensity',
      'de Broglie wavelength of charged particles accelerated through potential V (lambda = h / sqrt(2mqV))',
      'Radiation pressure on fully absorbing and fully reflecting surfaces under normal and oblique incidence',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D photocell vacuum tube with illuminated cathode emitting electron particles towards an anode, with an ammeter, stopping voltage supply, and dynamic V-I curve.',
      interactive_variables: [
        'Light Frequency (nu)',
        'Light Intensity (I)',
        'Cathode Work Function (Phi)',
        'Collector Potential (V_ext)',
      ],
      expected_behavior:
        'No electron emission occurs below threshold frequency regardless of intensity; increasing frequency boosts electron speeds and stopping voltage, while intensity increases saturation current.',
    },
  },
  {
    id: 'syl-atoms',
    unit_name: 'Modern Physics',
    chapter_name: 'Atoms',
    conceptId: 'bohr-atom-spectrum',
    core_explanation:
      'Bohr\'s quantization model and Rutherford scattering explain atomic stability, quantized electron energy levels, and discrete spectral emissions in hydrogen-like ions. It defines orbital radii, electron velocities, and Rydberg photon transitions.',
    important_cases: [
      'Hydrogen emission spectrum series (Lyman, Balmer, Paschen, Brackett, Pfund) and wavelength limits',
      'Quantized electron orbits: radius r_n proportional to n^2/Z, velocity v_n proportional to Z/n, energy E_n = -13.6 Z^2/n^2 eV',
      'Rutherford alpha particle scattering distance of closest approach and impact parameter',
      'X-ray production: continuous Bremstrahlung cutoff wavelength (lambda_min = hc/eV) and characteristic Moseley\'s law',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D atomic orbital model with concentric Bohr quantum shells (n=1 to 6), showing orbital electron wave orbits and emitted photon packets during quantum de-excitation.',
      interactive_variables: [
        'Atomic Number (Z)',
        'Initial Principal Quantum Number (n_initial)',
        'Final Principal Quantum Number (n_final)',
      ],
      expected_behavior:
        'Transitioning the electron between orbits triggers a photon animation with exact wavelength, updating the spectral series bar on a synchronized optical emission spectrum spectrometer.',
    },
  },
  {
    id: 'syl-nuclei',
    unit_name: 'Modern Physics',
    chapter_name: 'Nuclei',
    conceptId: 'radioactivity-nuclear-decay',
    core_explanation:
      'Nuclear physics governs nuclear binding energy, mass defect (E = delta_m * c^2), strong nuclear forces, and spontaneous radioactive decays (alpha, beta, gamma). It models decay kinetics, half-life, and fission/fusion energy yields.',
    important_cases: [
      'Radioactive decay law (N = N0 e^(-lambda*t)) and simultaneous multi-mode/parallel radioactive decays',
      'Binding energy per nucleon curve (BE/A vs. mass number A) explaining stability, fission of heavy nuclei, and fusion of light nuclei',
      'Q-value calculations for alpha decay, beta-plus/beta-minus decay, and nuclear reactions',
      'Nuclear radius R = R0 * A^(1/3) and independence of nuclear density with mass number',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D decay chamber with an active radioactive sample grid undergoing alpha/beta emissions, paired with an interactive real-time exponential decay activity graph (N vs. t).',
      interactive_variables: [
        'Initial Nuclei Count (N0)',
        'Half-Life (T_1/2)',
        'Decay Mode (Alpha, Beta-minus, Positron, Gamma)',
        'Elapsed Time (t)',
      ],
      expected_behavior:
        'Particles probabilistically transmute, emitting radiation trajectories into a detector, while the activity curve and remaining parent nuclei count update smoothly over half-life intervals.',
    },
  },
  {
    id: 'syl-semiconductors',
    unit_name: 'Modern Physics',
    chapter_name: 'Semiconductors',
    conceptId: 'wave-optics-polarization',
    core_explanation:
      'Explores solid-state physics and electronic conduction via energy band theory (valence, conduction bands, bandgap). It models intrinsic/extrinsic p-type and n-type semiconductors, p-n junction diodes, Zener voltage regulators, and logic gates.',
    important_cases: [
      'p-n junction diode forward and reverse bias characteristics, barrier potential, and depletion layer width',
      'Zener diode as a reverse breakdown voltage regulator in circuit power supplies',
      'Half-wave and full-wave bridge rectifiers with smoothing capacitor filters and ripple factor',
      'Combinational digital logic gate circuits (AND, OR, NOT, NAND, NOR, XOR) and Boolean truth tables',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D crystalline lattice showing holes and free electrons migrating across a p-n junction depletion region, with dynamic energy band diagrams (E_c, E_v, E_F).',
      interactive_variables: [
        'Applied Bias Voltage (V)',
        'Doping Concentration (N_A, N_D)',
        'Temperature (T)',
        'Diode Type (Standard Si/Ge, Zener, LED)',
      ],
      expected_behavior:
        'Forward bias narrows the depletion barrier and initiates exponential carrier injection; reverse bias widens the barrier until Zener/avalanche breakdown is reached.',
    },
  },
  {
    id: 'syl-mechanical-waves',
    unit_name: 'Modern Physics',
    chapter_name: 'Mechanical Waves',
    conceptId: 'standing-waves-acoustics',
    core_explanation:
      'Examines energy propagation through elastic media as transverse and longitudinal waves, governed by the linear wave equation, superposition principle, and boundary reflection. It models standing waves, resonance, beats, and the Doppler effect.',
    important_cases: [
      'Standing waves in stretched strings (fixed/free ends) and organ pipes (open/closed resonant columns)',
      'Doppler effect for sound with relative motion of source, observer, and medium wind vector',
      'Beats frequency (f_beat = |f1 - f2|) produced by superposition of two harmonic acoustic sources',
      'Resonance tube experiment for measuring speed of sound with end correction (e = 0.6 r)',
    ],
    '3d_model_spec': {
      visual_description:
        'A 3D resonant acoustic organ pipe / vibrating string showing displacement nodes and antinodes, oscillating pressure density air particles, and sound wavefront ripples.',
      interactive_variables: [
        'Pipe Boundary Mode (Open-Open, Open-Closed, Stretched String)',
        'Harmonic Number (n = 1st fundamental, 3rd, 5th)',
        'Source Velocity (v_source)',
        'Observer Velocity (v_observer)',
        'Medium Temperature (Speed of Sound v)',
      ],
      expected_behavior:
        'Displays node/antinode standing wave envelopes, generates audible beat waveforms upon tuning frequencies, and compresses/stretches Doppler wavefront spheres in the direction of source motion.',
    },
  },
];
