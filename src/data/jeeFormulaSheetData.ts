export interface JeeFormulaItem {
  name: string;
  formula: string;
  conditionOrMeaning: string;
  siUnit?: string;
}

export interface JeeSpecialCase {
  title: string;
  condition: string;
  resultFormula: string;
  notes: string;
}

export interface JeeConstantOrUnit {
  quantityOrConstant: string;
  symbol: string;
  valueOrFormula: string;
  siUnit: string;
}

export interface JeeChapterSheet {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  basicDefinitions: { term: string; definition: string; symbol: string; siUnit: string }[];
  coreFormulas: { sectionTitle: string; items: JeeFormulaItem[] }[];
  specialCases: JeeSpecialCase[];
  keyRelationsAndGraphs: { title: string; relation: string; examSignificance: string }[];
  unitsAndConstants: JeeConstantOrUnit[];
  jeeQuickRevision: {
    shortcuts: string[];
    trapsAndPitfalls: string[];
  };
}

export const JEE_CHAPTER_SHEETS: JeeChapterSheet[] = [
  // 1. UNITS AND DIMENSIONS & ERRORS
  {
    id: 'units-and-dimensions',
    name: 'Units and Dimensions',
    aliases: ['units', 'dimensions', 'errors', 'units and dimensions', 'units, dimensions & errors', 'units-dimensions'],
    category: 'General Physics & Instruments',
    basicDefinitions: [
      { term: 'Base Quantities', definition: '7 independent physical dimensions (M, L, T, I, Θ, N, J)', symbol: '[M], [L], [T]', siUnit: 'kg, m, s, A, K, mol, cd' },
      { term: 'Dimensional Homogeneity', definition: 'Every additive term on LHS and RHS must possess identical dimensions', symbol: '[LHS] = [RHS]', siUnit: 'Dimensionless criterion' },
      { term: 'Fractional & Percentage Error', definition: 'Ratio of absolute error Δx to measured value x', symbol: 'Δx / x', siUnit: 'Dimensionless (% for ×100)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Dimensional Analysis & Standard Dimensions',
        items: [
          { name: 'Universal Gravitational Constant G', formula: '[G] = [M⁻¹ L³ T⁻²]', conditionOrMeaning: 'From F = G·m₁·m₂ / r²', siUnit: 'N·m²/kg²' },
          { name: 'Planck Constant h', formula: '[h] = [M L² T⁻¹]', conditionOrMeaning: 'From E = h·ν (Same dimension as Angular Momentum)', siUnit: 'J·s' },
          { name: 'Permittivity of Free Space ε₀', formula: '[ε₀] = [M⁻¹ L⁻³ T⁴ I²]', conditionOrMeaning: 'From Coulomb Law F = q₁q₂ / (4πε₀r²)', siUnit: 'F/m or C²/(N·m²)' },
          { name: 'Permeability of Free Space μ₀', formula: '[μ₀] = [M L T⁻² I⁻²]', conditionOrMeaning: 'From c = 1 / √(μ₀ε₀)', siUnit: 'T·m/A or H/m' },
          { name: 'Coefficient of Viscosity η', formula: '[η] = [M L⁻¹ T⁻¹]', conditionOrMeaning: 'From Stokes Law F = 6πηrv', siUnit: 'Pa·s or N·s/m²' },
          { name: 'Stefan-Boltzmann Constant σ', formula: '[σ] = [M L⁰ T⁻³ K⁻⁴]', conditionOrMeaning: 'From E = σ·T⁴', siUnit: 'W/(m²·K⁴)' },
          { name: 'Specific Heat Capacity s', formula: '[s] = [M⁰ L² T⁻² K⁻¹]', conditionOrMeaning: 'From Q = m·s·ΔT', siUnit: 'J/(kg·K)' },
        ],
      },
      {
        sectionTitle: 'Error Propagation & Combination',
        items: [
          { name: 'Sum / Difference: Z = A ± B', formula: 'ΔZ = ΔA + ΔB', conditionOrMeaning: 'Absolute errors always add', siUnit: 'Same as A and B' },
          { name: 'Product / Quotient: Z = A · B or A / B', formula: 'ΔZ / Z = (ΔA / A) + (ΔB / B)', conditionOrMeaning: 'Relative errors add directly', siUnit: 'Dimensionless' },
          { name: 'Power Law: Z = (Aᵃ · Bᵇ) / Cᶜ', formula: 'ΔZ / Z = a·(ΔA / A) + b·(ΔB / B) + c·(ΔC / C)', conditionOrMeaning: 'Powers act as error weighting coefficients', siUnit: 'Fractional error' },
        ],
      },
    ],
    specialCases: [
      { title: 'Equal Dimension Equivalencies', condition: 'Frequent JEE MCQs', resultFormula: 'Work = Torque = Energy = [M L² T⁻²]', notes: 'Angular momentum = Planck constant = [M L² T⁻¹]' },
      { title: 'Pure Numbers & Exponents', condition: 'Trigonometric, logarithmic, and exponential arguments', resultFormula: '[sin(kx - ωt)] = [1], [kx] = [1], [ωt] = [1]', notes: 'Argument must be strictly dimensionless: [k] = [L⁻¹], [ω] = [T⁻¹]' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Speed of Light in Vacuum', relation: 'c = 1 / √(μ₀ε₀) ⟹ [1 / √(μ₀ε₀)] = [L T⁻¹]', examSignificance: 'High frequency JEE Main unit dimension match question' },
      { title: 'LC Resonant Time Constant', relation: '[√(L·C)] = [T], [R·C] = [T], [L / R] = [T]', examSignificance: 'All represent time dimension [T]' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Planck Constant', symbol: 'h', valueOrFormula: '6.626 × 10⁻³⁴', siUnit: 'J·s' },
      { quantityOrConstant: 'Permittivity of Free Space', symbol: 'ε₀', valueOrFormula: '8.854 × 10⁻¹²', siUnit: 'F/m' },
      { quantityOrConstant: 'Permeability of Free Space', symbol: 'μ₀', valueOrFormula: '4π × 10⁻⁷ ≈ 1.257 × 10⁻⁶', siUnit: 'T·m/A' },
      { quantityOrConstant: 'Boltzmann Constant', symbol: 'k_B', valueOrFormula: '1.381 × 10⁻²³', siUnit: 'J/K' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'For Z = Aᵃ Bᵇ / Cᶜ, % Error in Z = a(%ΔA) + b(%ΔB) + c(%ΔC). Signs never cancel.',
        'Dimension of E/B = velocity [L T⁻¹]; Dimension of B²/2μ₀ = Energy density [M L⁻¹ T⁻²].',
      ],
      trapsAndPitfalls: [
        'Do not subtract errors in division (Z = A / B). Errors always compound positively.',
        'Significant figures: in multiplication/division, answer retains least number of significant figures.',
      ],
    },
  },

  // 2. KINEMATICS (1D, 2D & PROJECTILE MOTION)
  {
    id: 'kinematics',
    name: 'Kinematics',
    aliases: ['kinematics', 'motion in a straight line', 'motion in a plane', 'projectile motion', 'kinematics 1d', 'kinematics 2d', 'kinematics 2d & 3d'],
    category: 'Mechanics',
    basicDefinitions: [
      { term: 'Instantaneous Velocity', definition: 'Time derivative of position vector r(t)', symbol: 'v = dr / dt', siUnit: 'm/s' },
      { term: 'Instantaneous Acceleration', definition: 'Time derivative of velocity vector v(t)', symbol: 'a = dv / dt = d²r / dt²', siUnit: 'm/s²' },
      { term: 'Relative Velocity', definition: 'Velocity of object A observed from frame of object B', symbol: 'v_AB = v_A - v_B', siUnit: 'm/s' },
    ],
    coreFormulas: [
      {
        sectionTitle: '1D Motion with Constant Acceleration',
        items: [
          { name: 'First Equation of Motion', formula: 'v = u + a·t', conditionOrMeaning: 'Valid strictly when a = constant', siUnit: 'm/s' },
          { name: 'Second Equation of Motion', formula: 's = u·t + (1/2)·a·t²', conditionOrMeaning: 'Displacement under uniform acceleration', siUnit: 'm' },
          { name: 'Third Equation of Motion', formula: 'v² = u² + 2·a·s', conditionOrMeaning: 'Independent of elapsed time t', siUnit: 'm²/s²' },
          { name: 'Distance in n-th Second', formula: 's_nth = u + (a / 2)·(2n - 1)', conditionOrMeaning: 'Distance traversed between t = (n-1) and t = n', siUnit: 'm' },
          { name: 'Variable Acceleration (Calculus)', formula: 'v = ∫ a dt,  s = ∫ v dt,  a = v·(dv / ds)', conditionOrMeaning: 'Used when acceleration varies with time or position', siUnit: 'm/s²' },
        ],
      },
      {
        sectionTitle: '2D Projectile Motion (Flat Ground)',
        items: [
          { name: 'Time of Flight', formula: 'T = (2·u·sin θ) / g = 2·u_y / g', conditionOrMeaning: 'Level projection ground-to-ground', siUnit: 's' },
          { name: 'Maximum Height', formula: 'H_max = (u²·sin² θ) / (2·g) = u_y² / (2·g)', conditionOrMeaning: 'Vertical velocity v_y = 0 at peak', siUnit: 'm' },
          { name: 'Horizontal Range', formula: 'R = (u²·sin 2θ) / g = (2·u_x·u_y) / g', conditionOrMeaning: 'Maximum at launch angle θ = 45°', siUnit: 'm' },
          { name: 'Trajectory Equation', formula: 'y = x·tan θ - (g·x²) / (2·u²·cos² θ) = x·tan θ · (1 - x / R)', conditionOrMeaning: 'Cartesian path parabola', siUnit: 'm' },
          { name: 'Radius of Curvature at Peak', formula: 'ρ = u_x² / g = (u²·cos² θ) / g', conditionOrMeaning: 'a_n = g, v = u_x at highest point', siUnit: 'm' },
        ],
      },
      {
        sectionTitle: 'Projectile on an Inclined Plane (Angle of incline β, launch angle α to incline)',
        items: [
          { name: 'Time of Flight on Incline', formula: 'T = (2·u·sin α) / (g·cos β)', conditionOrMeaning: 'Launch up an incline of angle β', siUnit: 's' },
          { name: 'Range on Inclined Plane (Up)', formula: 'R_up = u² / [g·cos² β] · [sin(2α + β) - sin β]', conditionOrMeaning: 'Maximum range occurs at α = 45° - β/2', siUnit: 'm' },
          { name: 'Maximum Range Up Incline', formula: 'R_max,up = u² / [g·(1 + sin β)]', conditionOrMeaning: 'Optimal launch angle α = (π/4) - (β/2)', siUnit: 'm' },
        ],
      },
    ],
    specialCases: [
      { title: 'Complementary Launch Angles', condition: 'Angles θ and (90° - θ) at equal speed u', resultFormula: 'R₁ = R₂,  H₁·H₂ = R² / 16,  T₁·T₂ = 2R / g', notes: 'Same horizontal range, different flight times & heights' },
      { title: 'Horizontal Projectile from Height h', condition: 'Launched horizontally with speed u from top of tower', resultFormula: 't = √(2h / g),  R = u·√(2h / g),  v = √(u² + 2gh)', notes: 'Vertical initial velocity u_y = 0' },
      { title: 'Relation between H_max and Range', condition: 'Any projection angle θ', resultFormula: 'R / H_max = 4 / tan θ  ⟹  tan θ = 4·H_max / R', notes: 'When R = H_max, launch angle θ = arctan(4) ≈ 76°' },
    ],
    keyRelationsAndGraphs: [
      { title: 'v-t Graph Slope and Area', relation: 'Slope = dv/dt = a,  Area under curve = ∫ v dt = Displacement (Δs)', examSignificance: 'Direct evaluation for non-uniform acceleration' },
      { title: 'a-s Graph Area', relation: 'Area under a-s curve = ∫ a ds = (v₂² - v₁²) / 2', examSignificance: 'Work-Energy equivalent in kinematics' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Standard Gravity', symbol: 'g', valueOrFormula: '9.8 or 10', siUnit: 'm/s²' },
      { quantityOrConstant: 'Velocity', symbol: 'v', valueOrFormula: 'dx / dt', siUnit: 'm/s' },
      { quantityOrConstant: 'Acceleration', symbol: 'a', valueOrFormula: 'dv / dt', siUnit: 'm/s²' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Galileo odd numbers ratio: For u = 0, distances in successive equal time intervals are 1 : 3 : 5 : 7 : ...',
        'Minimum distance of approach between two moving particles: d_min = |r₁₂ × v₁₂| / |v₁₂|.',
        'Rain-Man problem: v_rain,man = v_rain - v_man. Angle of umbrella tan θ = v_man / v_rain.',
      ],
      trapsAndPitfalls: [
        'Average speed is Total Distance / Total Time, NOT the magnitude of average velocity.',
        'When acceleration is not constant, DO NOT use v = u + at. Use calculus a = v(dv/ds) or a = dv/dt.',
      ],
    },
  },

  // 3. LAWS OF MOTION & FRICTION
  {
    id: 'laws-of-motion',
    name: 'Laws of Motion',
    aliases: ['laws of motion', 'newton laws', 'friction', 'laws of motion & friction', 'nlms'],
    category: 'Mechanics',
    basicDefinitions: [
      { term: 'Newton Second Law', definition: 'Net external force equals rate of change of linear momentum', symbol: 'F_net = dp / dt = m·a (for constant mass)', siUnit: 'N (kg·m/s²)' },
      { term: 'Impulse', definition: 'Time integral of force, equal to change in momentum', symbol: 'J = ∫ F dt = Δp', siUnit: 'N·s or kg·m/s' },
      { term: 'Static vs Kinetic Friction', definition: 'f_s ≤ μ_s·N (self-adjusting up to limiting), f_k = μ_k·N (constant)', symbol: 'f_s,max = μ_s·N', siUnit: 'N' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Equilibrium & Dynamics of Connected Bodies',
        items: [
          { name: 'Apparent Weight in an Elevator', formula: 'N = m·(g ± a)', conditionOrMeaning: '+a for accelerating upward, -a for accelerating downward', siUnit: 'N' },
          { name: 'Atwood Machine Acceleration', formula: 'a = (m₂ - m₁)·g / (m₁ + m₂)', conditionOrMeaning: 'Ideal massless pulley and inextensible string', siUnit: 'm/s²' },
          { name: 'Atwood Machine String Tension', formula: 'T = (2·m₁·m₂·g) / (m₁ + m₂)', conditionOrMeaning: 'Tension uniform throughout string', siUnit: 'N' },
          { name: 'Pulley with Mass on Table & Hanging Mass', formula: 'a = (m₂·g - μ·m₁·g) / (m₁ + m₂),  T = [m₁·m₂·g·(1 + μ)] / (m₁ + m₂)', conditionOrMeaning: 'm₁ on horizontal table with friction μ, m₂ hanging', siUnit: 'm/s² / N' },
        ],
      },
      {
        sectionTitle: 'Friction on Inclined Plane & Banking of Roads',
        items: [
          { name: 'Angle of Repose / Angle of Friction', formula: 'tan θ_repose = μ_s  ⟹  θ_repose = arctan(μ_s)', conditionOrMeaning: 'Maximum incline angle where block remains at rest', siUnit: 'Degrees / Rad' },
          { name: 'Acceleration down Rough Incline', formula: 'a_down = g·(sin θ - μ_k·cos θ)', conditionOrMeaning: 'Motion down inclined plane (θ > θ_repose)', siUnit: 'm/s²' },
          { name: 'Retardation up Rough Incline', formula: 'a_up = g·(sin θ + μ_k·cos θ)', conditionOrMeaning: 'Block projected up inclined plane', siUnit: 'm/s²' },
          { name: 'Optimum Road Banking Speed (No friction needed)', formula: 'v_opt = √(R·g·tan θ)', conditionOrMeaning: 'Normal force provides exact centripetal force', siUnit: 'm/s' },
          { name: 'Maximum Safe Speed on Banked Curve', formula: 'v_max = √[ R·g · (tan θ + μ) / (1 - μ·tan θ) ]', conditionOrMeaning: 'Friction prevents car from skidding upward', siUnit: 'm/s' },
          { name: 'Minimum Safe Speed on Banked Curve', formula: 'v_min = √[ R·g · (tan θ - μ) / (1 + μ·tan θ) ]', conditionOrMeaning: 'Friction prevents car from slipping downward', siUnit: 'm/s' },
        ],
      },
      {
        sectionTitle: 'Circular Motion Dynamics',
        items: [
          { name: 'Centripetal Acceleration', formula: 'a_c = v² / R = ω²·R', conditionOrMeaning: 'Always directed toward center of curvature', siUnit: 'm/s²' },
          { name: 'Tangential Acceleration', formula: 'a_t = dv / dt = α·R', conditionOrMeaning: 'Causes change in speed |v|', siUnit: 'm/s²' },
          { name: 'Total Net Acceleration', formula: 'a_net = √(a_c² + a_t²)', conditionOrMeaning: 'Since a_c and a_t are mutually perpendicular', siUnit: 'm/s²' },
          { name: 'Conical Pendulum Angular Velocity', formula: 'ω = √(g / h) = √[ g / (L·cos θ) ],  T_period = 2π·√[(L·cos θ) / g]', conditionOrMeaning: 'String length L, semi-vertical angle θ, height h = L cos θ', siUnit: 'rad/s / s' },
        ],
      },
    ],
    specialCases: [
      { title: 'Block on Moving Wedge', condition: 'Wedge accelerated horizontally at acceleration a to keep block stationary', resultFormula: 'a = g·tan θ (smooth wedge)', notes: 'Pseudo-force m·a cos θ balances gravity component m·g sin θ' },
      { title: 'Ratio of time taken on rough vs smooth incline', condition: 'Incline angle θ, length s, friction μ', resultFormula: 't_rough / t_smooth = n = 1 / √(1 - μ·cot θ) ⟹ μ = tan θ · (1 - 1/n²)', notes: 'Classic JEE Main recurring problem' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Static to Kinetic Friction Transition', relation: 'f rises linearly with applied force F until f = μ_s·N, then drops slightly to constant f_k = μ_k·N', examSignificance: 'f vs F applied force graph' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Force', symbol: 'F', valueOrFormula: 'm·a', siUnit: 'N' },
      { quantityOrConstant: 'Coefficient of Friction', symbol: 'μ', valueOrFormula: 'f / N', siUnit: 'Dimensionless' },
      { quantityOrConstant: 'Impulse', symbol: 'J', valueOrFormula: '∫ F dt', siUnit: 'N·s' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Constraint relation: String length constant ⟹ ∑ (T_i · a_i) = 0 or ∑ (T_i · x_i) = 0 (Virtual work on massless strings).',
        'Two block system (m₁ atop m₂): maximum force on lower block without slipping F_max = μ·(m₁ + m₂)·g.',
      ],
      trapsAndPitfalls: [
        'Pseudo-force must ONLY be applied when writing equations in a non-inertial (accelerating) reference frame.',
        'Normal reaction is NOT always m·g (e.g. on incline N = m·g cos θ; in lift N = m(g ± a)).',
      ],
    },
  },

  // 4. WORK, ENERGY AND POWER
  {
    id: 'work-energy-power',
    name: 'Work, Energy and Power',
    aliases: ['work, energy and power', 'work energy power', 'wep', 'work and energy', 'work energy'],
    category: 'Mechanics',
    basicDefinitions: [
      { term: 'Work Done by Force', definition: 'Line integral of force vector along displacement path', symbol: 'W = ∫ F · dr = F·s·cos θ (for constant F)', siUnit: 'J (N·m)' },
      { term: 'Work-Energy Theorem', definition: 'Work done by ALL forces (conservative + non-conservative + pseudo) equals change in kinetic energy', symbol: 'W_all = ΔK = K_f - K_i', siUnit: 'J' },
      { term: 'Potential Energy Function', definition: 'Negative line integral of conservative force', symbol: 'F_c = - dU / dr = - ∇U', siUnit: 'J' },
      { term: 'Instantaneous Power', definition: 'Rate of doing work / rate of energy transfer', symbol: 'P = dW / dt = F · v', siUnit: 'W (J/s)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Conservative Forces & Potential Energy',
        items: [
          { name: 'Gravitational Potential Energy (Near Earth)', formula: 'U_g = m·g·h', conditionOrMeaning: 'Zero reference datum at ground', siUnit: 'J' },
          { name: 'Elastic Spring Potential Energy', formula: 'U_s = (1/2)·k·x²', conditionOrMeaning: 'x is elongation or compression from natural length', siUnit: 'J' },
          { name: 'Work Done by Ideal Spring', formula: 'W_spring = (1/2)·k·(x_i² - x_f²)', conditionOrMeaning: 'Independent of path taken', siUnit: 'J' },
          { name: 'Conservation of Mechanical Energy', formula: 'K_i + U_i = K_f + U_f', conditionOrMeaning: 'Valid when only conservative forces perform work (W_nc = 0)', siUnit: 'J' },
          { name: 'Work by Non-Conservative Forces', formula: 'W_nc = ΔE_mech = ΔK + ΔU', conditionOrMeaning: 'Equals dissipation into heat/friction', siUnit: 'J' },
        ],
      },
      {
        sectionTitle: 'Vertical Circular Motion (String of length L with bob of mass m)',
        items: [
          { name: 'Minimum Speed at Bottom for Full Loop', formula: 'v_bottom,min = √(5·g·L)', conditionOrMeaning: 'Tension at top T_top ≥ 0', siUnit: 'm/s' },
          { name: 'Minimum Speed at Top for Full Loop', formula: 'v_top,min = √(g·L)', conditionOrMeaning: 'Critical point where T_top = 0', siUnit: 'm/s' },
          { name: 'Minimum Speed at Horizontal Level', formula: 'v_mid,min = √(3·g·L)', conditionOrMeaning: 'String horizontal (θ = 90° from bottom)', siUnit: 'm/s' },
          { name: 'Tension Difference (Bottom - Top)', formula: 'T_bottom - T_top = 6·m·g', conditionOrMeaning: 'True for any complete circular trajectory loop', siUnit: 'N' },
          { name: 'Condition for Oscillation (no looping)', formula: 'v_bottom ≤ √(2·g·L)', conditionOrMeaning: 'Bob oscillates below horizontal without string slacking', siUnit: 'm/s' },
          { name: 'Condition for String Slacking (leaves circle)', formula: '√(2·g·L) < v_bottom < √(5·g·L)', conditionOrMeaning: 'String slacks between 90° and 180°; performs projectile motion', siUnit: 'm/s' },
        ],
      },
      {
        sectionTitle: 'Power & Engine Motion',
        items: [
          { name: 'Constant Power Acceleration from Rest', formula: 'v(t) = √[(2·P·t) / m],  s(t) = √[(8·P) / (9·m)] · t^(3/2)', conditionOrMeaning: 'Velocity v ∝ √t,  Displacement s ∝ t^(3/2)', siUnit: 'm/s / m' },
          { name: 'Force under Constant Power', formula: 'F(t) = P / v = √[(m·P) / (2·t)]', conditionOrMeaning: 'Force decreases as speed increases', siUnit: 'N' },
        ],
      },
    ],
    specialCases: [
      { title: 'Vertical Circular Motion on a Light Rigid Rod', condition: 'Mass attached to rigid rod of length L (cannot slack)', resultFormula: 'v_top,min = 0,  v_bottom,min = √(4·g·L) = 2·√(g·L)', notes: 'Rod supports compressive forces, so T can be negative' },
      { title: 'Equilibrium from U(x) Potential Curve', condition: 'dU/dx = 0 at equilibrium', resultFormula: 'd²U/dx² > 0 ⟹ Stable;  d²U/dx² < 0 ⟹ Unstable;  d²U/dx² = 0 ⟹ Neutral', notes: 'Frequency of small oscillations ω = √[ (d²U/dx²) / m ]' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Area under F-x Curve', relation: 'Area = ∫ F dx = Work Done = ΔK', examSignificance: 'Calculates kinetic energy change directly' },
      { title: 'Slope of U-x Curve', relation: 'F = - dU/dx (Negative slope equals Force)', examSignificance: 'Force is zero at maxima and minima of potential energy' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Work / Energy', symbol: 'W, E', valueOrFormula: 'F · s', siUnit: 'J (Joule)' },
      { quantityOrConstant: 'Power', symbol: 'P', valueOrFormula: 'dW / dt', siUnit: 'W (Watt = J/s)' },
      { quantityOrConstant: 'Spring Constant', symbol: 'k', valueOrFormula: 'F / x', siUnit: 'N/m' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Spring cut in ratio m : n ⟹ spring constants become k₁ = k·(m+n)/m,  k₂ = k·(m+n)/n (k · L = constant).',
        'When a block of mass m is gently released on a vertical spring, max elongation x_max = 2·m·g / k (Equilibrium is m·g/k).',
      ],
      trapsAndPitfalls: [
        'Work done by static friction on a system can be positive, negative, or zero; total work done by internal static friction is ALWAYS ZERO.',
        'Work-Energy theorem is valid in non-inertial frames ONLY if work done by pseudo-force is included.',
      ],
    },
  },

  // 5. CENTRE OF MASS AND COLLISIONS
  {
    id: 'centre-of-mass-and-collisions',
    name: 'Centre of Mass and Collisions',
    aliases: ['centre of mass', 'center of mass', 'collisions', 'centre of mass and collisions', 'com', 'momentum and collisions'],
    category: 'Mechanics',
    basicDefinitions: [
      { term: 'Centre of Mass (Discrete)', definition: 'Mass-weighted mean position vector of system particles', symbol: 'r_cm = (∑ m_i · r_i) / (∑ m_i)', siUnit: 'm' },
      { term: 'Centre of Mass (Continuous)', definition: 'Integral of position weighted by differential mass element', symbol: 'r_cm = (1 / M) · ∫ r dm', siUnit: 'm' },
      { term: 'Coefficient of Restitution', definition: 'Ratio of relative velocity of separation to relative velocity of approach along common normal', symbol: 'e = (v₂ - v₁) / (u₁ - u₂)', siUnit: 'Dimensionless (0 ≤ e ≤ 1)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Standard Centre of Mass Coordinates',
        items: [
          { name: 'Semicircular Wire of Radius R', formula: 'y_cm = (2·R) / π ≈ 0.637·R', conditionOrMeaning: 'From center along axis of symmetry', siUnit: 'm' },
          { name: 'Semicircular Uniform Disc of Radius R', formula: 'y_cm = (4·R) / (3·π) ≈ 0.424·R', conditionOrMeaning: 'From center along symmetry axis', siUnit: 'm' },
          { name: 'Hollow Hemispherical Shell of Radius R', formula: 'y_cm = R / 2', conditionOrMeaning: 'From flat circular base center', siUnit: 'm' },
          { name: 'Solid Uniform Hemisphere of Radius R', formula: 'y_cm = (3·R) / 8 = 0.375·R', conditionOrMeaning: 'From flat circular base center', siUnit: 'm' },
          { name: 'Hollow Cone of Height h', formula: 'y_cm = h / 3', conditionOrMeaning: 'From circular base along central axis', siUnit: 'm' },
          { name: 'Solid Uniform Cone of Height h', formula: 'y_cm = h / 4', conditionOrMeaning: 'From circular base along central axis', siUnit: 'm' },
        ],
      },
      {
        sectionTitle: '1D Head-on Collisions',
        items: [
          { name: 'Final Velocity of Body 1', formula: 'v₁ = [ (m₁ - e·m₂) / (m₁ + m₂) ]·u₁ + [ (1 + e)·m₂ / (m₁ + m₂) ]·u₂', conditionOrMeaning: 'Direct general formulation for any e', siUnit: 'm/s' },
          { name: 'Final Velocity of Body 2', formula: 'v₂ = [ (m₂ - e·m₁) / (m₁ + m₂) ]·u₂ + [ (1 + e)·m₁ / (m₁ + m₂) ]·u₁', conditionOrMeaning: 'Direct general formulation for any e', siUnit: 'm/s' },
          { name: 'Loss in Kinetic Energy (1D Collision)', formula: 'ΔK_loss = (1/2) · [ (m₁·m₂) / (m₁ + m₂) ] · (1 - e²) · (u₁ - u₂)² = (1/2)·μ·(1 - e²)·u_rel²', conditionOrMeaning: 'μ = (m₁·m₂)/(m₁+m₂) is reduced mass; ΔK = 0 when e = 1', siUnit: 'J' },
        ],
      },
      {
        sectionTitle: 'Variable Mass & Rocket Propulsion',
        items: [
          { name: 'Rocket Thrust Force', formula: 'F_thrust = v_rel · (dm / dt)', conditionOrMeaning: 'v_rel is exhaust speed relative to rocket', siUnit: 'N' },
          { name: 'Rocket Velocity at Time t', formula: 'v(t) = v₀ + v_rel · ln(m₀ / m) - g·t', conditionOrMeaning: 'Tsiolkovsky Rocket Equation in gravity field', siUnit: 'm/s' },
        ],
      },
    ],
    specialCases: [
      { title: 'Elastic Collision with Equal Masses (m₁ = m₂, e = 1)', condition: '1D elastic impact of identical masses', resultFormula: 'v₁ = u₂,  v₂ = u₁', notes: 'Velocities are completely exchanged' },
      { title: 'Collision with Massive Immovable Target (m₂ ≫ m₁)', condition: 'Small mass hits wall/floor of mass m₂ at u₂ = 0', resultFormula: 'v₁ = - e·u₁', notes: 'Rebounds with speed e·u₁' },
      { title: 'Rebounding from Floor (Coefficient of restitution e, dropped from height h₀)', condition: 'Successive vertical bounces', resultFormula: 'h_n = e^(2n) · h₀,  t_total = √[(2h₀)/g] · [ (1 + e) / (1 - e) ],  d_total = h₀ · [ (1 + e²) / (1 - e²) ]', notes: 'Infinite geometric series with finite sum' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Internal Forces on COM', relation: '∑ F_int = 0  ⟹  a_cm = F_ext / M_total', examSignificance: 'If F_ext = 0, COM velocity v_cm remains constant even if fragments explode' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Momentum', symbol: 'p', valueOrFormula: 'm·v', siUnit: 'kg·m/s' },
      { quantityOrConstant: 'Reduced Mass', symbol: 'μ', valueOrFormula: '(m₁·m₂) / (m₁ + m₂)', siUnit: 'kg' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Removal of part (Cavity problem): r_rem = (M_orig · r_orig - M_cut · r_cut) / (M_orig - M_cut).',
        'In perfectly inelastic collision (e = 0), bodies stick together: v_common = (m₁u₁ + m₂u₂) / (m₁ + m₂).',
      ],
      trapsAndPitfalls: [
        'Momentum is conserved along the line of impact; velocity components perpendicular to line of impact remain unchanged during smooth collision.',
        'Explosion of projectile at peak: COM continues its original parabolic path until first piece hits ground.',
      ],
    },
  },

  // 6. ROTATIONAL MOTION
  {
    id: 'rotational-motion',
    name: 'Rotational Motion',
    aliases: ['rotational motion', 'rotation', 'rigid body dynamics', 'rotational dynamics', 'moment of inertia', 'rolling motion'],
    category: 'Mechanics',
    basicDefinitions: [
      { term: 'Moment of Inertia', definition: 'Rotational analog of mass; measure of rotational inertia', symbol: 'I = ∑ m_i · r_i² = ∫ r² dm', siUnit: 'kg·m²' },
      { term: 'Torque', definition: 'Rotational turning effect of force about an axis', symbol: 'τ = r × F = I·α', siUnit: 'N·m' },
      { term: 'Angular Momentum', definition: 'Moment of linear momentum about a point or axis', symbol: 'L = r × p = I·ω', siUnit: 'kg·m²/s or J·s' },
      { term: 'Rotational Kinetic Energy', definition: 'Kinetic energy associated with pure rotation', symbol: 'K_rot = (1/2)·I·ω²', siUnit: 'J' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Theorems of Moment of Inertia',
        items: [
          { name: 'Parallel Axis Theorem', formula: 'I = I_cm + M·d²', conditionOrMeaning: 'd is perpendicular distance from COM axis to parallel target axis (Valid for all 3D bodies)', siUnit: 'kg·m²' },
          { name: 'Perpendicular Axis Theorem', formula: 'I_z = I_x + I_y', conditionOrMeaning: 'STRICTLY VALID ONLY FOR 2D PLANAR LAMINAS in xy-plane', siUnit: 'kg·m²' },
          { name: 'Radius of Gyration k', formula: 'I = M·k²  ⟹  k = √(I / M)', conditionOrMeaning: 'Effective distance where entire mass can be concentrated', siUnit: 'm' },
        ],
      },
      {
        sectionTitle: 'Standard Moments of Inertia',
        items: [
          { name: 'Thin Ring / Cylindrical Shell', formula: 'I_cm,axis = M·R²,  I_diameter = (1/2)·M·R²', conditionOrMeaning: 'Mass M, radius R', siUnit: 'kg·m²' },
          { name: 'Uniform Disc / Solid Cylinder', formula: 'I_cm,axis = (1/2)·M·R²,  I_diameter = (1/4)·M·R²', conditionOrMeaning: 'Mass M, radius R', siUnit: 'kg·m²' },
          { name: 'Solid Uniform Sphere', formula: 'I_cm = (2/5)·M·R²,  I_tangent = (7/5)·M·R²', conditionOrMeaning: 'About diameter and tangent respectively', siUnit: 'kg·m²' },
          { name: 'Hollow Spherical Shell', formula: 'I_cm = (2/3)·M·R²,  I_tangent = (5/3)·M·R²', conditionOrMeaning: 'Thin uniform wall', siUnit: 'kg·m²' },
          { name: 'Uniform Thin Rod of Length L', formula: 'I_cm = (1/12)·M·L²,  I_end = (1/3)·M·L²', conditionOrMeaning: 'Axis perpendicular to rod length', siUnit: 'kg·m²' },
          { name: 'Rectangular Plate (Sides a and b)', formula: 'I_cm = (1/12)·M·(a² + b²)', conditionOrMeaning: 'Axis perpendicular to plate through center', siUnit: 'kg·m²' },
        ],
      },
      {
        sectionTitle: 'Pure Rolling Motion without Slipping',
        items: [
          { name: 'Kinematic Rolling Condition', formula: 'v_cm = ω·R,  a_cm = α·R', conditionOrMeaning: 'Contact point has zero instantaneous velocity: v_contact = 0', siUnit: 'm/s / m/s²' },
          { name: 'Total Kinetic Energy in Rolling', formula: 'K_total = K_trans + K_rot = (1/2)·M·v_cm² · [ 1 + (k² / R²) ]', conditionOrMeaning: 'k is radius of gyration of rolling body', siUnit: 'J' },
          { name: 'Acceleration down Rough Incline (Angle θ)', formula: 'a_rolling = (g·sin θ) / [ 1 + (I_cm / (M·R²)) ] = (g·sin θ) / [ 1 + (k² / R²) ]', conditionOrMeaning: 'Independent of mass and radius; depends purely on geometric shape factor (k²/R²)', siUnit: 'm/s²' },
          { name: 'Minimum Friction for Pure Rolling on Incline', formula: 'μ_min = (tan θ) / [ 1 + (M·R² / I_cm) ] = (tan θ) / [ 1 + (R² / k²) ]', conditionOrMeaning: 'Static friction preventing slipping', siUnit: 'Dimensionless' },
        ],
      },
      {
        sectionTitle: 'Angular Momentum & Toppling',
        items: [
          { name: 'Conservation of Angular Momentum', formula: 'I₁·ω₁ = I₂·ω₂', conditionOrMeaning: 'Valid when net external torque τ_ext = 0', siUnit: 'kg·m²/s' },
          { name: 'Condition for Toppling before Sliding (Block base a, height b)', formula: 'F_push · b = N · (a / 2)  ⟹  μ > a / b', conditionOrMeaning: 'Block topples if μ > a/b; slides if μ < a/b', siUnit: 'Dimensionless' },
        ],
      },
    ],
    specialCases: [
      { title: 'Ranking of acceleration down incline', condition: 'Rolling race from rest down same inclined plane', resultFormula: 'a_solid sphere > a_solid cylinder/disc > a_hollow sphere > a_ring', notes: 'Smallest (k²/R²) accelerates fastest: Sphere(2/5=0.4) > Disc(0.5) > Hollow Sphere(0.67) > Ring(1.0)' },
      { title: 'Combined Translation + Rotation Angular Momentum', condition: 'About arbitrary origin O', resultFormula: 'L_O = r_cm × (M·v_cm) + I_cm·ω', notes: 'Vector sum of orbital and spin angular momentum' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Velocity of points on a pure rolling wheel', relation: 'v_top = 2·v_cm,  v_center = v_cm,  v_bottom = 0,  v(θ) = 2·v_cm·sin(θ/2)', examSignificance: 'Cycloid trajectory path of rolling rim point' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Moment of Inertia', symbol: 'I', valueOrFormula: '∑ m·r²', siUnit: 'kg·m²' },
      { quantityOrConstant: 'Torque', symbol: 'τ', valueOrFormula: 'r × F', siUnit: 'N·m' },
      { quantityOrConstant: 'Angular Momentum', symbol: 'L', valueOrFormula: 'I·ω', siUnit: 'J·s' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Instantaneous Axis of Rotation (IAOR): In pure rolling on flat surface, IAOR is at contact point P. K_total = (1/2)·I_P·ω².',
        'Fraction of rotational KE in pure rolling: K_rot / K_total = (k²/R²) / [1 + (k²/R²)].',
      ],
      trapsAndPitfalls: [
        'Perpendicular axis theorem does NOT apply to solid spheres, cylinders, or 3D cubes.',
        'In pure rolling on a level horizontal surface at constant velocity, static friction is ZERO.',
      ],
    },
  },

  // 7. GRAVITATION
  {
    id: 'gravitation',
    name: 'Gravitation',
    aliases: ['gravitation', 'gravitational potential', 'orbital motion', 'kepler laws', 'planetary motion'],
    category: 'Mechanics',
    basicDefinitions: [
      { term: 'Newton Law of Gravitation', definition: 'Universal attractive force between two point masses', symbol: 'F = G·(m₁·m₂) / r²', siUnit: 'N' },
      { term: 'Gravitational Field Strength', definition: 'Gravitational force per unit test mass', symbol: 'g = F / m = - GM / r² · r̂ = - dV / dr', siUnit: 'N/kg or m/s²' },
      { term: 'Gravitational Potential', definition: 'Work done per unit mass in bringing it from infinity to distance r', symbol: 'V(r) = - G·M / r', siUnit: 'J/kg' },
      { term: 'Gravitational Potential Energy', definition: 'Potential energy of mass m at distance r from M', symbol: 'U(r) = - G·M·m / r', siUnit: 'J' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Variation of Acceleration due to Gravity (g = GM/R²)',
        items: [
          { name: 'Height h above Earth surface (Exact)', formula: 'g_h = g₀ · [ R / (R + h) ]²', conditionOrMeaning: 'Valid for any arbitrary altitude h', siUnit: 'm/s²' },
          { name: 'Height h above Earth surface (Approximation for h ≪ R)', formula: 'g_h ≈ g₀ · (1 - 2h / R)', conditionOrMeaning: 'Valid strictly when h < 300 km (h ≪ R)', siUnit: 'm/s²' },
          { name: 'Depth d below Earth surface', formula: 'g_d = g₀ · (1 - d / R)', conditionOrMeaning: 'Linear decrease to zero at Earth center', siUnit: 'm/s²' },
          { name: 'Latitude λ due to Earth Rotation (Angular speed ω)', formula: 'g_λ = g₀ - ω²·R·cos² λ', conditionOrMeaning: 'Maximum at poles (λ = 90°, g = g₀), minimum at equator (λ = 0°)', siUnit: 'm/s²' },
        ],
      },
      {
        sectionTitle: 'Solid Sphere Gravitational Field & Potential',
        items: [
          { name: 'Inside Uniform Solid Sphere (r < R)', formula: 'g_in = (G·M·r) / R³,  V_in = - (G·M / (2R³)) · (3R² - r²)', conditionOrMeaning: 'Field is linear with r; V_center = - 1.5 · (GM / R)', siUnit: 'm/s² / J/kg' },
          { name: 'Outside Solid Sphere (r ≥ R)', formula: 'g_out = G·M / r²,  V_out = - G·M / r', conditionOrMeaning: 'Behaves as point mass located at center', siUnit: 'm/s² / J/kg' },
        ],
      },
      {
        sectionTitle: 'Escape Velocity & Satellite Orbital Dynamics',
        items: [
          { name: 'Escape Velocity from Earth Surface', formula: 'v_esc = √(2·G·M / R) = √(2·g·R) ≈ 11.2 km/s', conditionOrMeaning: 'Parabolic escape trajectory (Total energy E = 0)', siUnit: 'm/s' },
          { name: 'Satellite Orbital Velocity (Radius r = R + h)', formula: 'v_orb = √(G·M / r) = √(g·R² / r)', conditionOrMeaning: 'Circular orbit speed; Near Earth: v_orb ≈ 7.92 km/s', siUnit: 'm/s' },
          { name: 'Relation between v_esc and v_orb', formula: 'v_esc = √2 · v_orb ≈ 1.414 · v_orb', conditionOrMeaning: 'Same radius orbital point', siUnit: 'Dimensionless ratio' },
          { name: 'Orbital Period & Kepler Third Law', formula: 'T = (2π·r^(3/2)) / √(G·M)  ⟹  T² = (4π² / GM) · r³', conditionOrMeaning: 'T² ∝ r³ (Semi-major axis a for ellipse)', siUnit: 's' },
          { name: 'Total Energy of Satellite in Orbit', formula: 'E_total = - G·M·m / (2r) = - K = (1/2)·U', conditionOrMeaning: 'Bound orbit has negative total mechanical energy', siUnit: 'J' },
          { name: 'Binding Energy of Satellite', formula: 'B.E. = - E_total = + G·M·m / (2r)', conditionOrMeaning: 'Energy required to eject satellite to infinity', siUnit: 'J' },
        ],
      },
    ],
    specialCases: [
      { title: 'Geostationary Satellite Parameters', condition: 'Period T = 24 hours, parked above equator, West to East', resultFormula: 'r ≈ 42,400 km,  h = r - R ≈ 36,000 km,  v_orb ≈ 3.1 km/s', notes: 'Fixed apparent position in sky' },
      { title: 'Kepler Second Law (Areal Velocity)', condition: 'Central force conservation of angular momentum', resultFormula: 'dA / dt = L / (2m) = constant', notes: 'Planets sweep equal areas in equal intervals of time; fastest at perihelion' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Virial Theorem in Gravitation', relation: 'K = - E_total = - (1/2)·U  ⟹  U = 2·E_total = - 2·K', examSignificance: 'Master energy relationship for circular orbits' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Universal Gravitational Constant', symbol: 'G', valueOrFormula: '6.674 × 10⁻¹¹', siUnit: 'N·m²/kg²' },
      { quantityOrConstant: 'Mass of Earth', symbol: 'M_E', valueOrFormula: '5.972 × 10²⁴', siUnit: 'kg' },
      { quantityOrConstant: 'Radius of Earth', symbol: 'R_E', valueOrFormula: '6.371 × 10⁶ (6400 km)', siUnit: 'm' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Weightlessness condition at equator: If Earth rotates such that g_equator = 0 ⟹ ω = √(g / R) (17 times present speed, day length ≈ 84 min).',
        'Time period of satellite skimming Earth surface: T = 2π·√(R / g) = 2π·√[ 3π / (G·ρ) ] ≈ 84.6 minutes.',
      ],
      trapsAndPitfalls: [
        'Do not use g_h = g(1 - 2h/R) when h is large (e.g. h = R). Always use exact g_h = g·R²/(R+h)² = g/4.',
        'Gravitational potential inside a thin spherical shell is CONSTANT and equal to value at surface: V = -GM/R.',
      ],
    },
  },

  // 8. PROPERTIES OF MATTER (SOLIDS & FLUIDS)
  {
    id: 'properties-of-matter',
    name: 'Properties of Matter',
    aliases: ['properties of matter', 'elasticity', 'fluids', 'fluid mechanics', 'viscosity', 'surface tension', 'solids and fluids'],
    category: 'Mechanics & Fluids',
    basicDefinitions: [
      { term: 'Stress and Strain', definition: 'Restoring force per unit area / fractional deformation', symbol: 'σ = F / A,  ε = ΔL / L', siUnit: 'N/m² (Pa) / Dimensionless' },
      { term: 'Young Modulus', definition: 'Ratio of longitudinal stress to longitudinal strain', symbol: 'Y = (F / A) / (ΔL / L) = (F·L) / (A·ΔL)', siUnit: 'N/m² (Pa)' },
      { term: 'Surface Tension', definition: 'Surface energy per unit area / force per unit line element', symbol: 'S = F / L = U / ΔA', siUnit: 'N/m or J/m²' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Elasticity & Energy Density',
        items: [
          { name: 'Hooke Law', formula: 'Stress = Modulus × Strain  ⟹  σ = Y·ε', conditionOrMeaning: 'Within proportional elastic limit', siUnit: 'Pa' },
          { name: 'Elastic Potential Energy Stored in Stretched Wire', formula: 'U = (1/2) · Force · Elongation = (1/2) · (Y·A / L) · (ΔL)²', conditionOrMeaning: 'Behaves like spring with effective k = Y·A / L', siUnit: 'J' },
          { name: 'Elastic Energy Density (Energy per unit volume)', formula: 'u = U / Volume = (1/2) · Stress · Strain = (1/2) · Y · (Strain)²', conditionOrMeaning: 'Area under stress-strain curve', siUnit: 'J/m³' },
          { name: 'Bulk Modulus & Compressibility', formula: 'B = - ΔP / (ΔV / V) = - V·(dP / dV),  K = 1 / B', conditionOrMeaning: 'Negative sign accounts for volume decrease under pressure', siUnit: 'Pa / Pa⁻¹' },
        ],
      },
      {
        sectionTitle: 'Fluid Statics & Dynamics',
        items: [
          { name: 'Hydrostatic Gauge Pressure at Depth h', formula: 'P = P₀ + ρ·g·h', conditionOrMeaning: 'P₀ is atmospheric pressure at free liquid surface', siUnit: 'Pa' },
          { name: 'Equation of Continuity', formula: 'A₁·v₁ = A₂·v₂  ⟹  A·v = constant (Volume flow rate Q)', conditionOrMeaning: 'Incompressible non-viscous fluid flow', siUnit: 'm³/s' },
          { name: 'Bernoulli Theorem', formula: 'P + (1/2)·ρ·v² + ρ·g·h = constant', conditionOrMeaning: 'Conservation of energy along a streamline (Ideal steady flow)', siUnit: 'Pa (J/m³)' },
          { name: 'Torricelli Efflux Speed from Orifice at Depth h', formula: 'v_efflux = √(2·g·h)', conditionOrMeaning: 'Open tank with orifice area a ≪ tank area A', siUnit: 'm/s' },
          { name: 'Venturi Meter Flow Speed', formula: 'v₁ = √[ (2·ΔP) / (ρ · ((A₁/A₂)² - 1)) ] = √[ (2·g·h·ρ_m) / (ρ · ((A₁/A₂)² - 1)) ]', conditionOrMeaning: 'Measures flow speed by cross-sectional pressure drop', siUnit: 'm/s' },
        ],
      },
      {
        sectionTitle: 'Viscosity & Surface Tension',
        items: [
          { name: 'Newton Law of Viscosity', formula: 'F_viscous = - η·A·(dv / dy)', conditionOrMeaning: 'η is dynamic viscosity, dv/dy is velocity gradient', siUnit: 'N' },
          { name: 'Stokes Law for Sphere in Viscous Medium', formula: 'F_drag = 6·π·η·r·v', conditionOrMeaning: 'Laminar flow around small sphere of radius r', siUnit: 'N' },
          { name: 'Terminal Velocity of Falling Sphere', formula: 'v_term = (2 / 9) · [ r²·g·(ρ_sphere - σ_fluid) ] / η', conditionOrMeaning: 'Equilibrium of gravity, buoyancy, and viscous drag', siUnit: 'm/s' },
          { name: 'Excess Pressure Inside Liquid Drop', formula: 'ΔP_drop = 2·S / R', conditionOrMeaning: 'One liquid-gas boundary surface', siUnit: 'Pa' },
          { name: 'Excess Pressure Inside Soap Bubble', formula: 'ΔP_bubble = 4·S / R', conditionOrMeaning: 'Two boundary surfaces (inner and outer films)', siUnit: 'Pa' },
          { name: 'Capillary Ascent (Jurin Law)', formula: 'h = (2·S·cos θ) / (ρ·g·r)', conditionOrMeaning: 'Tube radius r, contact angle θ, liquid density ρ', siUnit: 'm' },
        ],
      },
    ],
    specialCases: [
      { title: 'Coalescence of N identical droplets into one big drop', condition: 'Total volume conserved', resultFormula: 'R_big = N^(1/3) · r,  ΔU_released = 4π·S·r² · (N - N^(2/3))', notes: 'Surface energy decreases; heat is liberated, temperature rises' },
      { title: 'Accelerated Liquid Container', condition: 'Tank accelerated horizontally at a', resultFormula: 'tan θ_surface = a / g', notes: 'Free liquid surface aligns perpendicular to effective gravity vector g_eff' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Poiseuille Law for Viscous Tube Flow', relation: 'Q = (π · ΔP · r⁴) / (8 · η · L) ⟹ Flow resistance R_f = 8ηL / (πr⁴)', examSignificance: 'Extremely strong r⁴ radius sensitivity in laminar pipe flow' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Atmospheric Pressure', symbol: 'P_atm', valueOrFormula: '1.013 × 10⁵ (1 atm)', siUnit: 'Pa (N/m²)' },
      { quantityOrConstant: 'Density of Pure Water', symbol: 'ρ_w', valueOrFormula: '1000', siUnit: 'kg/m³' },
      { quantityOrConstant: 'Coefficient of Viscosity', symbol: 'η', valueOrFormula: '1 poise = 0.1 Pa·s', siUnit: 'Pa·s (N·s/m²)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Range of efflux jet from orifice at depth h in tank of water height H: R = 2·√[ h·(H - h) ]. Maximum range R_max = H when h = H/2.',
        'Time to empty a tank through bottom orifice: t = (A / a) · √[(2H) / g].',
      ],
      trapsAndPitfalls: [
        'Soap bubble has TWO free surfaces (ΔP = 4S/R), while a water drop or air bubble inside water has only ONE (ΔP = 2S/R).',
        'When temperature increases, surface tension and viscosity of liquids decrease, but viscosity of gases increases.',
      ],
    },
  },

  // 9. THERMODYNAMICS
  {
    id: 'thermodynamics',
    name: 'Thermodynamics',
    aliases: ['thermodynamics', 'first law of thermodynamics', 'heat engines', 'carnot cycle', 'entropy', 'pv cycles'],
    category: 'Thermal Physics',
    basicDefinitions: [
      { term: 'First Law of Thermodynamics', definition: 'Conservation of energy for closed thermodynamic systems', symbol: 'ΔQ = ΔU + W  ⟹  ΔU = ΔQ - W', siUnit: 'J' },
      { term: 'Work Done by Gas', definition: 'Integral of pressure over volume change along process path', symbol: 'W = ∫ P dV', siUnit: 'J' },
      { term: 'Internal Energy of Ideal Gas', definition: 'Thermal energy depending solely on temperature for ideal gas', symbol: 'U = n·C_v·T = (f / 2)·n·R·T', siUnit: 'J' },
      { term: 'Mayer Relation', definition: 'Difference between molar heat capacities of ideal gas', symbol: 'C_p - C_v = R,  γ = C_p / C_v = 1 + 2/f', siUnit: 'J/(mol·K)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Thermodynamic Processes for Ideal Gas',
        items: [
          { name: 'Isobaric Process (P = const)', formula: 'W = P·ΔV = n·R·ΔT,  ΔQ = n·C_p·ΔT,  ΔU = n·C_v·ΔT', conditionOrMeaning: 'Fraction of heat converted to work: W / ΔQ = R / C_p = 1 - 1/γ', siUnit: 'J' },
          { name: 'Isochoric Process (V = const)', formula: 'W = 0,  ΔQ = ΔU = n·C_v·ΔT', conditionOrMeaning: 'All heat supplied goes entirely into internal energy', siUnit: 'J' },
          { name: 'Isothermal Process (T = const)', formula: 'ΔU = 0,  W = ΔQ = n·R·T · ln(V₂ / V₁) = n·R·T · ln(P₁ / P₂)', conditionOrMeaning: 'Slow process in diathermic container; P·V = constant', siUnit: 'J' },
          { name: 'Adiabatic Process (ΔQ = 0)', formula: 'P·V^γ = const,  T·V^(γ-1) = const,  T^γ·P^(1-γ) = const', conditionOrMeaning: 'Fast process in thermally insulated vessel', siUnit: 'J / Pa·m³' },
          { name: 'Work in Adiabatic Process', formula: 'W_ad = (P₁V₁ - P₂V₂) / (γ - 1) = (n·R·(T₁ - T₂)) / (γ - 1) = - ΔU', conditionOrMeaning: 'Gas cools during expansion (T₂ < T₁)', siUnit: 'J' },
          { name: 'Polytropic Process (P·V^x = const)', formula: 'C = C_v + R / (1 - x),  W = (P₁V₁ - P₂V₂) / (x - 1)', conditionOrMeaning: 'General process with constant polytropic index x ≠ 1', siUnit: 'J/(mol·K) / J' },
        ],
      },
      {
        sectionTitle: 'Heat Engines & Refrigerator Cycles',
        items: [
          { name: 'Thermal Efficiency of Heat Engine', formula: 'η = W_net / Q_in = (Q_in - Q_out) / Q_in = 1 - Q_out / Q_in', conditionOrMeaning: 'General cycle efficiency', siUnit: 'Dimensionless (0 to 1)' },
          { name: 'Carnot Engine Maximum Efficiency', formula: 'η_Carnot = 1 - T_cold / T_hot', conditionOrMeaning: 'Temperatures MUST be in absolute Kelvin', siUnit: 'Dimensionless' },
          { name: 'Coefficient of Performance (Refrigerator)', formula: 'β = Q_cold / W = Q_cold / (Q_hot - Q_cold) = T_cold / (T_hot - T_cold)', conditionOrMeaning: 'Ideal Carnot refrigerator', siUnit: 'Dimensionless' },
          { name: 'Relation between η and β', formula: 'β = (1 - η) / η  ⟹  η = 1 / (1 + β)', conditionOrMeaning: 'Coupled engine-refrigerator equivalence', siUnit: 'Dimensionless' },
        ],
      },
    ],
    specialCases: [
      { title: 'Slopes of PV curves at common intersection point', condition: 'Same (P, V) point for ideal gas', resultFormula: '(dP/dV)_adiabatic = γ · (dP/dV)_isothermal', notes: 'Adiabatic curve is γ-times steeper than isothermal curve' },
      { title: 'Molar Heat Capacities by Degrees of Freedom f', condition: 'Monatomic (f=3), Diatomic (f=5), Non-linear Triatomic (f=6)', resultFormula: 'Mono: C_v = 1.5R, γ = 5/3 ≈ 1.67;  Dia: C_v = 2.5R, γ = 7/5 = 1.4;  Poly: C_v = 3R, γ = 4/3 ≈ 1.33', notes: 'At high temperatures, vibrational modes add 2 to f' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Work Done in Cyclic PV Process', relation: 'W_net = Area enclosed by cycle on P-V diagram (Clockwise = +W, Counter-clockwise = -W)', examSignificance: 'Primary tool for cyclic efficiency calculations' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Universal Gas Constant', symbol: 'R', valueOrFormula: '8.314 J/(mol·K) ≈ 2 cal/(mol·K) ≈ 0.0821 L·atm/(mol·K)', siUnit: 'J/(mol·K)' },
      { quantityOrConstant: 'Boltzmann Constant', symbol: 'k_B', valueOrFormula: 'R / N_A = 1.38 × 10⁻²³', siUnit: 'J/K' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Mixture of gases: n_mix = n₁ + n₂,  C_v,mix = (n₁·C_v₁ + n₂·C_v₂) / (n₁ + n₂),  γ_mix = C_p,mix / C_v,mix.',
        'In any free adiabatic expansion into vacuum: W = 0, Q = 0 ⟹ ΔU = 0, T = constant (No temperature change for ideal gas).',
      ],
      trapsAndPitfalls: [
        'Always convert temperatures to KELVIN (K = °C + 273.15) in Carnot efficiency and adiabatic formulas.',
        'Internal energy U is a STATE function (depends only on T), while Q and W are PATH functions.',
      ],
    },
  },

  // 10. KINETIC THEORY OF GASES
  {
    id: 'kinetic-theory',
    name: 'Kinetic Theory',
    aliases: ['kinetic theory', 'ktg', 'kinetic theory of gases', 'maxwell speed distribution'],
    category: 'Thermal Physics',
    basicDefinitions: [
      { term: 'Ideal Gas Law', definition: 'Equation of state relating macroscopic gas variables', symbol: 'P·V = n·R·T = N·k_B·T', siUnit: 'Pa·m³ = J' },
      { term: 'Kinetic Pressure Equation', definition: 'Pressure exerted by molecular momentum transfer collisions on walls', symbol: 'P = (1/3)·ρ·v_rms² = (1/3)·(M_total / V)·v_rms²', siUnit: 'Pa' },
      { term: 'Equipartition of Energy', definition: 'Average kinetic energy per degree of freedom per molecule', symbol: 'E_dof = (1/2)·k_B·T', siUnit: 'J' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Molecular Speeds & Kinetic Energy',
        items: [
          { name: 'Root Mean Square Speed (v_rms)', formula: 'v_rms = √[ (3·R·T) / M_mol ] = √[ (3·k_B·T) / m_molecule ] = √[ (3·P) / ρ ]', conditionOrMeaning: 'M_mol in kg/mol (e.g. O₂ = 0.032 kg/mol)', siUnit: 'm/s' },
          { name: 'Average Speed (v_avg)', formula: 'v_avg = √[ (8·R·T) / (π·M_mol) ] = √[ (8·k_B·T) / (π·m) ] ≈ 0.921 · v_rms', conditionOrMeaning: 'Arithmetic mean of molecular speeds', siUnit: 'm/s' },
          { name: 'Most Probable Speed (v_mp)', formula: 'v_mp = √[ (2·R·T) / M_mol ] = √[ (2·k_B·T) / m ] ≈ 0.816 · v_rms', conditionOrMeaning: 'Speed at peak of Maxwell-Boltzmann distribution', siUnit: 'm/s' },
          { name: 'Ratio of Characteristic Speeds', formula: 'v_mp : v_avg : v_rms = √2 : √(8/π) : √3 ≈ 1 : 1.128 : 1.224', conditionOrMeaning: 'Fixed ratio independent of gas species or temperature', siUnit: 'Ratio' },
          { name: 'Translational KE per Molecule', formula: 'K_trans = (3/2)·k_B·T', conditionOrMeaning: 'Independent of gas molecular atomicity (always 3 translational DOFs)', siUnit: 'J' },
          { name: 'Total Internal Energy of 1 Mole', formula: 'U_m = (f / 2)·R·T', conditionOrMeaning: 'f is degrees of freedom', siUnit: 'J/mol' },
        ],
      },
      {
        sectionTitle: 'Mean Free Path & Real Gas Corrections',
        items: [
          { name: 'Mean Free Path λ', formula: 'λ = 1 / [ √2 · π · d² · n_v ] = (k_B·T) / [ √2 · π · d² · P ]', conditionOrMeaning: 'Molecular diameter d, number density n_v = N/V', siUnit: 'm' },
          { name: 'Van der Waals Equation of Real Gas', formula: '[ P + (a·n² / V²) ] · (V - n·b) = n·R·T', conditionOrMeaning: 'a corrects for intermolecular attraction; b corrects for molecular volume', siUnit: 'Pa·m³' },
          { name: 'Critical Temperature T_c', formula: 'T_c = (8·a) / (27·R·b)', conditionOrMeaning: 'Above T_c, gas cannot be liquefied at any pressure', siUnit: 'K' },
        ],
      },
    ],
    specialCases: [
      { title: 'Graham Law of Effusion / Diffusion', condition: 'Gas escaping through pinhole at same temperature and pressure', resultFormula: 'Rate ∝ 1 / √(M_mol) ⟹ Rate₁ / Rate₂ = √(M₂ / M₁)', notes: 'Lighter gases effuse faster' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Maxwell-Boltzmann Distribution vs Temperature', relation: 'As T increases, peak shifts right (higher speed) and flattens (lower peak probability density)', examSignificance: 'High frequency JEE graph comprehension' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Avogadro Number', symbol: 'N_A', valueOrFormula: '6.022 × 10²³', siUnit: 'mol⁻¹' },
      { quantityOrConstant: 'Boltzmann Constant', symbol: 'k_B', valueOrFormula: '1.3806 × 10⁻²³', siUnit: 'J/K' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Mean free path: λ ∝ T / P at constant volume ⟹ if V is constant, λ is CONSTANT independent of T and P.',
        'Pressure of gas mixture: P_total = ∑ P_i = (R·T / V) · ∑ n_i (Dalton Law of Partial Pressures).',
      ],
      trapsAndPitfalls: [
        'When computing v_rms, ensure molar mass M is in kg/mol (e.g. He = 4 × 10⁻³ kg/mol, not 4 g/mol).',
        'Average translational kinetic energy per molecule depends ONLY on T, NOT on molar mass or mass of molecule.',
      ],
    },
  },

  // 11. SIMPLE HARMONIC MOTION (SHM)
  {
    id: 'shm',
    name: 'SHM',
    aliases: ['shm', 'simple harmonic motion', 'oscillations', 'spring pendulum', 'simple pendulum'],
    category: 'Oscillations & Waves',
    basicDefinitions: [
      { term: 'Differential Equation of SHM', definition: 'Linear restoring force directly proportional to displacement', symbol: 'd²x / dt² + ω²·x = 0  ⟹  a = - ω²·x', siUnit: 'm/s²' },
      { term: 'Kinematics Equations of SHM', definition: 'Displacement, velocity, and acceleration with phase angle φ', symbol: 'x(t) = A·sin(ωt + φ),  v(t) = A·ω·cos(ωt + φ),  a(t) = - A·ω²·sin(ωt + φ)', siUnit: 'm, m/s, m/s²' },
      { term: 'Velocity as Function of Position', definition: 'Elliptic phase space relation between velocity and position', symbol: 'v(x) = ± ω·√(A² - x²)', siUnit: 'm/s' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Standard Oscillators Time Periods',
        items: [
          { name: 'Linear Spring-Mass System', formula: 'T = 2π · √(m / k),  ω = √(k / m)', conditionOrMeaning: 'Mass m, spring constant k (Same horizontally or vertically)', siUnit: 's / rad/s' },
          { name: 'Simple Pendulum (Small amplitude θ < 5°)', formula: 'T = 2π · √(L / g),  ω = √(g / L)', conditionOrMeaning: 'String length L, point mass bob; Independent of mass m', siUnit: 's / rad/s' },
          { name: 'Physical (Compound) Pendulum', formula: 'T = 2π · √[ I_pivot / (m·g·d) ] = 2π · √[ (k_cm² + d²) / (g·d) ]', conditionOrMeaning: 'Moment of inertia I_pivot about suspension, distance d from COM', siUnit: 's' },
          { name: 'Torsional Pendulum', formula: 'T = 2π · √(I / C)', conditionOrMeaning: 'Torsional constant C (τ = - C·θ)', siUnit: 's' },
          { name: 'Springs in Series Combination', formula: '1 / k_eq = 1 / k₁ + 1 / k₂  ⟹  k_eq = (k₁·k₂) / (k₁ + k₂)', conditionOrMeaning: 'Same restoring force in both springs; displacements add', siUnit: 'N/m' },
          { name: 'Springs in Parallel Combination', formula: 'k_eq = k₁ + k₂', conditionOrMeaning: 'Same displacement across both springs; forces add', siUnit: 'N/m' },
        ],
      },
      {
        sectionTitle: 'Energy in SHM',
        items: [
          { name: 'Kinetic Energy at Position x', formula: 'K(x) = (1/2)·m·v² = (1/2)·m·ω²·(A² - x²) = (1/2)·k·(A² - x²)', conditionOrMeaning: 'Maximum at mean position (x = 0): K_max = (1/2)·k·A²', siUnit: 'J' },
          { name: 'Potential Energy at Position x', formula: 'U(x) = U₀ + (1/2)·k·x² = U₀ + (1/2)·m·ω²·x²', conditionOrMeaning: 'Minimum at mean position: U_min = U₀ (usually 0)', siUnit: 'J' },
          { name: 'Total Mechanical Energy in SHM', formula: 'E_total = K(x) + U(x) = (1/2)·m·ω²·A² = (1/2)·k·A² = constant', conditionOrMeaning: 'Independent of time and position', siUnit: 'J' },
          { name: 'Time-Averaged Kinetic & Potential Energy', formula: '⟨K⟩_time = ⟨U⟩_time = (1/4)·k·A² = (1/2)·E_total', conditionOrMeaning: 'Averaged over one full cycle of period T', siUnit: 'J' },
          { name: 'Position-Averaged Kinetic Energy', formula: '⟨K⟩_space = (1/3)·k·A² = (2/3)·E_total,  ⟨U⟩_space = (1/6)·k·A²', conditionOrMeaning: 'Averaged over space range [-A, +A]', siUnit: 'J' },
        ],
      },
      {
        sectionTitle: 'Superposition of SHMs',
        items: [
          { name: 'Two Parallel SHMs of Same Frequency: x₁ = A₁·sin(ωt), x₂ = A₂·sin(ωt + δ)', formula: 'A_res = √[ A₁² + A₂² + 2·A₁·A₂·cos δ ],  tan θ = (A₂·sin δ) / (A₁ + A₂·cos δ)', conditionOrMeaning: 'Vector-like phasor addition', siUnit: 'm' },
          { name: 'Perpendicular SHMs (Lissajous figures): x = A·sin(ωt), y = B·sin(ωt + δ)', formula: '(x / A)² + (y / B)² - [ (2·x·y) / (A·B) ] · cos δ = sin² δ', conditionOrMeaning: 'Straight line if δ = 0 or π; Ellipse/Circle if δ = π/2', siUnit: 'm²' },
        ],
      },
    ],
    specialCases: [
      { title: 'Position where Kinetic Energy equals Potential Energy', condition: 'K(x) = U(x) (with U₀ = 0)', resultFormula: 'x = ± A / √2 ≈ ± 0.707·A', notes: 'v = v_max / √2 at this point' },
      { title: 'Time to travel from x = 0 to x = A/2 vs A/2 to A', condition: 'Starting from mean position', resultFormula: 't(0 ⟶ A/2) = T / 12,  t(A/2 ⟶ A) = T / 6', notes: 'Spends twice as much time in outer half due to lower speed' },
      { title: 'Simple pendulum in accelerating frame', condition: 'Effective gravity g_eff', resultFormula: 'T = 2π·√(L / |g - a|)', notes: 'In elevator: T = 2π√[L / (g ± a)]; In horizontally accelerating car: T = 2π√[L / √(g² + a²)]' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Energy vs Position Parabolic Graph', relation: 'U(x) is upward parabola with vertex at x=0; K(x) is inverted parabola; Sum E = constant horizontal line', examSignificance: 'Core JEE graphical identification question' },
      { title: 'Frequency of Energy Oscillations', relation: 'Frequency of K and U oscillation = 2 · (Frequency of SHM displacement ν)', examSignificance: 'Energy oscillates with twice the frequency of displacement' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Angular Frequency', symbol: 'ω', valueOrFormula: '2π·f = 2π / T', siUnit: 'rad/s' },
      { quantityOrConstant: 'Spring Constant', symbol: 'k', valueOrFormula: 'm·ω²', siUnit: 'N/m' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Two masses connected by spring of constant k: T = 2π·√(μ / k), where reduced mass μ = (m₁·m₂) / (m₁ + m₂).',
        'Liquid column of total length L in U-tube: T = 2π·√(L / (2g)) = 2π·√(h / g), where h is resting liquid height in each arm.',
      ],
      trapsAndPitfalls: [
        'Phase difference between x(t) and v(t) is π/2 (90°); phase difference between x(t) and a(t) is π (180°).',
        'In a simple pendulum of very large length (L ≈ R_Earth), T = 2π·√[ (R·L) / (g·(R + L)) ]. As L ⟶ ∞, T_max = 2π√(R/g) ≈ 84.6 min.',
      ],
    },
  },

  // 12. WAVES & SOUND
  {
    id: 'waves',
    name: 'Waves',
    aliases: ['waves', 'sound waves', 'wave motion', 'doppler effect', 'standing waves', 'organ pipes'],
    category: 'Oscillations & Waves',
    basicDefinitions: [
      { term: '1D Travelling Wave Equation', definition: 'Wave function propagating along ±x direction with speed v', symbol: 'y(x, t) = A·sin(k·x ∓ ω·t + φ)', siUnit: 'm' },
      { term: 'Wave Parameters', definition: 'Wavenumber k and angular frequency ω', symbol: 'k = 2π / λ,  ω = 2π·f = 2π / T,  v = ω / k = f·λ', siUnit: 'rad/m, rad/s, m/s' },
      { term: 'Wave Intensity', definition: 'Average power transmitted per unit area perpendicular to propagation', symbol: 'I = P_avg / A = (1/2)·ρ·v·ω²·A² = (ΔP_max)² / (2·ρ·v)', siUnit: 'W/m²' },
      { term: 'Sound Decibel Level', definition: 'Logarithmic sound intensity scale relative to hearing threshold I₀ = 10⁻¹² W/m²', symbol: 'β = 10 · log₁₀(I / I₀)', siUnit: 'dB (Decibels)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Wave Speeds in Different Media',
        items: [
          { name: 'Transverse Wave on Stretched String', formula: 'v = √(T / μ)', conditionOrMeaning: 'T is string tension, μ = m / L is linear mass density', siUnit: 'm/s' },
          { name: 'Sound Speed in Fluid / Gas (Newton-Laplace)', formula: 'v = √(B / ρ) = √[ (γ·P) / ρ ] = √[ (γ·R·T) / M_mol ]', conditionOrMeaning: 'Adiabatic bulk modulus B = γ·P for acoustic compressions', siUnit: 'm/s' },
          { name: 'Sound Speed in Solid Rod', formula: 'v = √(Y / ρ)', conditionOrMeaning: 'Y is Young modulus, ρ is solid density', siUnit: 'm/s' },
        ],
      },
      {
        sectionTitle: 'Standing Waves in Strings and Organ Pipes',
        items: [
          { name: 'String Fixed at Both Ends (Length L)', formula: 'λ_n = 2L / n,  f_n = n · (v / (2L)) = n · f₁  (n = 1, 2, 3, ...)', conditionOrMeaning: 'Contains all harmonics (even and odd harmonics present)', siUnit: 'm / Hz' },
          { name: 'Open Organ Pipe (Open at both ends, Length L)', formula: 'λ_n = 2L / n,  f_n = n · (v / (2L)) = n · f₁  (n = 1, 2, 3, ...)', conditionOrMeaning: 'Pressure nodes at both open ends; all harmonics present', siUnit: 'm / Hz' },
          { name: 'Closed Organ Pipe (One end closed, Length L)', formula: 'λ_n = 4L / (2n - 1),  f_n = (2n - 1) · (v / (4L))  (n = 1, 2, 3, ...)', conditionOrMeaning: 'STRICTLY ODD HARMONICS ONLY: f₁ : f₂ : f₃ = 1 : 3 : 5 : ...', siUnit: 'm / Hz' },
          { name: 'End Correction (Rayleigh correction)', formula: 'L_eff = L + 0.6·r (closed pipe),  L_eff = L + 1.2·r (open pipe)', conditionOrMeaning: 'r is internal tube radius', siUnit: 'm' },
          { name: 'Resonance Column Apparatus', formula: 'v = 2·f · (l₂ - l₁)', conditionOrMeaning: 'l₁ and l₂ are successive resonating water levels (eliminates end correction)', siUnit: 'm/s' },
        ],
      },
      {
        sectionTitle: 'Interference, Beats & Doppler Effect',
        items: [
          { name: 'Beat Frequency', formula: 'f_beat = |f₁ - f₂|', conditionOrMeaning: 'Superposition of two sound waves of slightly different frequencies', siUnit: 'Hz' },
          { name: 'General Doppler Effect Formula', formula: 'f_observed = f_source · [ (v ± v_observer) / (v ∓ v_source) ]', conditionOrMeaning: 'v is sound speed in medium; Upper sign for moving TOWARD, Lower sign for moving AWAY', siUnit: 'Hz' },
          { name: 'Doppler Shift with Moving Medium (Wind speed w in direction of sound)', formula: 'f_obs = f_src · [ (v + w - v_obs) / (v + w - v_src) ]', conditionOrMeaning: 'Wind speed algebraically adds to sound propagation speed', siUnit: 'Hz' },
          { name: 'Doppler Echo from Moving Reflector (Speed u toward source)', formula: 'f_echo = f_source · [ (v + u) / (v - u) ]', conditionOrMeaning: 'Double Doppler shift (reflector acts as moving receiver then moving emitter)', siUnit: 'Hz' },
        ],
      },
    ],
    specialCases: [
      { title: 'Doppler Shift for Non-Collinear Motion', condition: 'Source and observer moving at arbitrary angles', resultFormula: 'f_obs = f_src · [ (v - v_obs·cos θ_obs) / (v - v_src·cos θ_src) ]', notes: 'Only velocity components along line joining source and observer contribute' },
      { title: 'Intensity Increase with Decibels', condition: 'Δβ = 10 dB increase', resultFormula: 'I₂ / I₁ = 10^(Δβ / 10)', notes: 'A +10 dB rise means 10× intensity; +20 dB means 100× intensity; +3 dB means 2× intensity' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Standing Wave Pressure vs Displacement Nodes', relation: 'Displacement Node = Pressure Antinode; Displacement Antinode = Pressure Node', examSignificance: 'Closed end is displacement node (0 motion) but maximum pressure variation' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Speed of Sound in Air at 0°C', symbol: 'v_air', valueOrFormula: '331 + 0.6·T(°C)', siUnit: 'm/s' },
      { quantityOrConstant: 'Standard Hearing Threshold', symbol: 'I₀', valueOrFormula: '10⁻¹²', siUnit: 'W/m²' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'When temperature changes: Sound speed v ∝ √T(Kelvin). f_organ pipe ∝ √T.',
        'Wavelength in standing wave: Distance between two consecutive nodes = λ / 2; Distance between node and adjacent antinode = λ / 4.',
      ],
      trapsAndPitfalls: [
        'Doppler effect does NOT occur when source and observer move along circular arcs with fixed separation.',
        'When sound wave enters from air into water: frequency f remains CONSTANT, but speed v and wavelength λ INCREASE (v_water ≈ 1480 m/s > v_air).',
      ],
    },
  },

  // 13. ELECTROSTATICS & GAUSS'S LAW
  {
    id: 'electrostatics',
    name: 'Electrostatics',
    aliases: ['electrostatics', 'coulomb law', 'gauss law', 'electric field', 'electric potential', 'electric dipole', 'electrostatics & gauss law'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Coulomb Law', definition: 'Electrostatic force between two point charges in vacuum', symbol: 'F = (1 / (4πε₀)) · (q₁·q₂) / r² = k_e · (q₁·q₂) / r²', siUnit: 'N' },
      { term: 'Electric Field Vector', definition: 'Electrostatic force per unit positive test charge', symbol: 'E = F / q = - ∇V = - (∂V/∂x · î + ∂V/∂y · ĵ + ∂V/∂z · k̂)', siUnit: 'N/C or V/m' },
      { term: 'Electric Potential', definition: 'Work done per unit charge in bringing charge from infinity to point r', symbol: 'V(r) = - ∫ E · dr = (1 / (4πε₀)) · (q / r)', siUnit: 'V (J/C)' },
      { term: 'Gauss Law', definition: 'Total electric flux through any closed Gaussian surface equals enclosed charge divided by ε₀', symbol: 'Φ_E = ∮ E · dA = Q_enclosed / ε₀', siUnit: 'N·m²/C or V·m' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Standard Electric Fields from Charge Distributions',
        items: [
          { name: 'Infinitely Long Charged Wire (Linear charge density λ)', formula: 'E = λ / (2·π·ε₀·r) = (2·k_e·λ) / r', conditionOrMeaning: 'Directed radially outward for λ > 0', siUnit: 'V/m' },
          { name: 'Infinite Non-Conducting Sheet (Surface charge density σ)', formula: 'E = σ / (2·ε₀)', conditionOrMeaning: 'Uniform field independent of distance r from sheet', siUnit: 'V/m' },
          { name: 'Conducting Surface with Charge Density σ', formula: 'E = σ / ε₀', conditionOrMeaning: 'Electric field immediately outside any charged conductor surface', siUnit: 'V/m' },
          { name: 'Uniformly Charged Ring (Radius R, Total charge Q) on Axis', formula: 'E(x) = (k_e · Q · x) / (R² + x²)^(3/2)', conditionOrMeaning: 'E = 0 at center (x=0); Maximum at x = ± R / √2: E_max = 2k_e Q / (3√3 R²)', siUnit: 'V/m' },
          { name: 'Uniformly Charged Spherical Shell (Radius R, Charge Q)', formula: 'E_in = 0 (r < R),  E_out = (k_e · Q) / r² (r ≥ R)', conditionOrMeaning: 'Inside field is identically zero everywhere', siUnit: 'V/m' },
          { name: 'Uniformly Charged Solid Insulating Sphere (Radius R, Charge Q)', formula: 'E_in = (k_e · Q · r) / R³ = (ρ·r) / (3·ε₀) (r ≤ R),  E_out = (k_e · Q) / r² (r > R)', conditionOrMeaning: 'Linear increase inside, inverse square outside', siUnit: 'V/m' },
        ],
      },
      {
        sectionTitle: 'Electric Dipole Formulations (p = q · 2a)',
        items: [
          { name: 'Dipole Field on Axial Line (End-on position, r ≫ a)', formula: 'E_axial = (2 · k_e · p) / r³', conditionOrMeaning: 'Field is in same direction as dipole moment vector p', siUnit: 'V/m' },
          { name: 'Dipole Field on Equatorial Line (Broadside position, r ≫ a)', formula: 'E_equatorial = - (k_e · p) / r³', conditionOrMeaning: 'Field is antiparallel to dipole moment vector p; E_axial = 2 · E_equat', siUnit: 'V/m' },
          { name: 'Dipole Field at General Point (r, θ)', formula: 'E(r, θ) = (k_e · p / r³) · √(1 + 3·cos² θ),  tan α = (1/2)·tan θ', conditionOrMeaning: 'α is angle of E with position vector r', siUnit: 'V/m' },
          { name: 'Torque and Potential Energy of Dipole in External Field E', formula: 'τ = p × E = p·E·sin θ,  U = - p · E = - p·E·cos θ', conditionOrMeaning: 'Stable equilibrium at θ = 0° (U = -pE); Unstable at θ = 180° (U = +pE)', siUnit: 'N·m / J' },
          { name: 'Work Done in Rotating Dipole from θ₁ to θ₂', formula: 'W_ext = p·E · (cos θ₁ - cos θ₂)', conditionOrMeaning: 'W(0° ⟶ 180°) = 2·p·E', siUnit: 'J' },
        ],
      },
      {
        sectionTitle: 'Electrostatic Energy & Conductors',
        items: [
          { name: 'Electrostatic Potential Energy of System of Charges', formula: 'U = (1/2) · ∑ q_i · V_i', conditionOrMeaning: 'For pair: U = (k_e · q₁ · q₂) / r₁₂', siUnit: 'J' },
          { name: 'Electrostatic Energy Density of Electric Field', formula: 'u_E = (1/2) · ε₀ · E²', conditionOrMeaning: 'Energy stored per unit volume of electric field in vacuum', siUnit: 'J/m³' },
          { name: 'Self-Energy of Uniform Solid Spherical Charge Q', formula: 'U_solid = (3/5) · (k_e · Q² / R)', conditionOrMeaning: 'For hollow spherical shell: U_shell = (1/2) · (k_e · Q² / R)', siUnit: 'J' },
          { name: 'Electrostatic Pressure on Charged Conductor Surface', formula: 'P_elec = σ² / (2·ε₀) = (1/2)·ε₀·E²', conditionOrMeaning: 'Always directed outwardly normal to conductor surface', siUnit: 'N/m² (Pa)' },
        ],
      },
    ],
    specialCases: [
      { title: 'Concentric Spherical Shells Charge Earthing', condition: 'Outer or inner shell earthed (connected to ground)', resultFormula: 'V_earthed = 0', notes: 'Set potential equation of that earthed shell to zero to solve for induced ground charge' },
      { title: 'Charge Redistribution between Connected Conducting Spheres', condition: 'Spheres of radii R₁ and R₂ connected by thin wire', resultFormula: 'V₁ = V₂ ⟹ q₁ / q₂ = R₁ / R₂,  σ₁ / σ₂ = R₂ / R₁', notes: 'Surface charge density is inversely proportional to radius of curvature (higher at sharp points)' },
    ],
    keyRelationsAndGraphs: [
      { title: 'V vs r and E vs r for Solid Charged Sphere', relation: 'V is parabolic inside with peak V_center = 1.5 V_surface, hyperbolic 1/r outside; E is linear inside, 1/r² outside', examSignificance: 'Classic JEE multi-choice curve graph' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Coulomb Constant', symbol: 'k_e = 1/(4πε₀)', valueOrFormula: '8.988 × 10⁹ ≈ 9 × 10⁹', siUnit: 'N·m²/C²' },
      { quantityOrConstant: 'Permittivity of Free Space', symbol: 'ε₀', valueOrFormula: '8.854 × 10⁻¹²', siUnit: 'C²/(N·m²) or F/m' },
      { quantityOrConstant: 'Elementary Charge', symbol: 'e', valueOrFormula: '1.602 × 10⁻¹⁹', siUnit: 'C' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Earnshaw Theorem: A collection of stationary point charges cannot be maintained in stable equilibrium by electrostatic forces alone.',
        'Flux through one face of cube with charge q at center: Φ = q / (6·ε₀). If q is at corner: Φ_total through cube = q / (8·ε₀).',
      ],
      trapsAndPitfalls: [
        'Electric field inside a cavity in a conductor is ALWAYS ZERO as long as no charge is placed inside the cavity (Electrostatic Shielding).',
        'Electric potential is continuous across a surface charge layer, but the normal derivative (electric field) is DISCONTINUOUS: E₂ - E₁ = σ/ε₀.',
      ],
    },
  },

  // 14. CAPACITORS
  {
    id: 'capacitors',
    name: 'Capacitors',
    aliases: ['capacitors', 'capacitance', 'dielectrics', 'rc circuits', 'capacitors and dielectrics'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Capacitance', definition: 'Ratio of stored charge to potential difference across conductor plates', symbol: 'C = Q / V', siUnit: 'F (Farad = C/V)' },
      { term: 'Dielectric Constant (Relative Permittivity)', definition: 'Ratio of capacitance with dielectric medium to vacuum capacitance', symbol: 'K = ε_r = C / C₀', siUnit: 'Dimensionless (K ≥ 1)' },
      { term: 'Energy Stored in Capacitor', definition: 'Electrostatic potential energy of charged electric field', symbol: 'U = (1/2)·C·V² = Q² / (2C) = (1/2)·Q·V', siUnit: 'J' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Standard Capacitor Geometries',
        items: [
          { name: 'Parallel Plate Capacitor (Area A, separation d)', formula: 'C₀ = (ε₀ · A) / d', conditionOrMeaning: 'With full dielectric of constant K: C = (K·ε₀·A) / d', siUnit: 'F' },
          { name: 'Parallel Plate with Dielectric Slab of Thickness t < d', formula: 'C = (ε₀ · A) / [ d - t + (t / K) ]', conditionOrMeaning: 'If conducting slab (K = ∞): C = (ε₀·A) / (d - t)', siUnit: 'F' },
          { name: 'Spherical Capacitor (Concentric spheres of radii a and b > a)', formula: 'C = 4·π·ε₀ · [ (a · b) / (b - a) ]', conditionOrMeaning: 'For isolated sphere (b ⟶ ∞): C = 4·π·ε₀·a (Earth C ≈ 711 μF)', siUnit: 'F' },
          { name: 'Cylindrical Capacitor (Coaxial cylinders of radii a and b > a, length L)', formula: 'C = (2·π·ε₀ · L) / ln(b / a)', conditionOrMeaning: 'Valid when length L ≫ b', siUnit: 'F' },
        ],
      },
      {
        sectionTitle: 'Combinations & Dielectric Effects',
        items: [
          { name: 'Capacitors in Series Combination', formula: '1 / C_eq = 1 / C₁ + 1 / C₂ + ... ⟹ Q is identical on each capacitor; V_total = V₁ + V₂', conditionOrMeaning: 'Charge conservation in isolated floating junction node', siUnit: 'F' },
          { name: 'Capacitors in Parallel Combination', formula: 'C_eq = C₁ + C₂ + ... ⟹ V is identical across each; Q_total = Q₁ + Q₂', conditionOrMeaning: 'Direct addition of capacitances', siUnit: 'F' },
          { name: 'Force between Plates of Parallel Capacitor', formula: 'F_plates = Q² / (2·ε₀·A) = (1/2)·Q·E = (1/2)·C·V² / d', conditionOrMeaning: 'Attractive force between opposite polarity plates', siUnit: 'N' },
          { name: 'Common Potential upon Connecting Two Charged Capacitors', formula: 'V_common = (C₁·V₁ + C₂·V₂) / (C₁ + C₂)', conditionOrMeaning: 'Conservation of total charge Q_total = Q₁ + Q₂', siUnit: 'V' },
          { name: 'Heat Loss during Charge Sharing', formula: 'ΔH = (1/2) · [ (C₁·C₂) / (C₁ + C₂) ] · (V₁ - V₂)² = (1/2) · C_eff · (ΔV)²', conditionOrMeaning: 'Energy dissipated in connecting wire resistance and sparks', siUnit: 'J' },
        ],
      },
      {
        sectionTitle: 'RC Circuit Transient Dynamics',
        items: [
          { name: 'Charging of Capacitor through Resistor R', formula: 'q(t) = Q_max · (1 - e^(-t / RC)) = C·E · (1 - e^(-t / τ)),  i(t) = (E / R) · e^(-t / τ)', conditionOrMeaning: 'Capacitive time constant τ = R·C; At t = τ, q ≈ 0.632 · Q_max', siUnit: 'C / A' },
          { name: 'Discharging of Capacitor through Resistor R', formula: 'q(t) = Q₀ · e^(-t / RC) = Q₀ · e^(-t / τ),  i(t) = - (Q₀ / RC) · e^(-t / τ)', conditionOrMeaning: 'At t = τ, q drops to 0.368 · Q₀', siUnit: 'C / A' },
          { name: 'Energy Balance during Battery Charging', formula: 'W_battery = Q · E = C·E²,  U_stored = (1/2)·C·E²,  Heat_lost = (1/2)·C·E²', conditionOrMeaning: 'Exactly 50% of battery energy is dissipated as heat, regardless of R', siUnit: 'J' },
        ],
      },
    ],
    specialCases: [
      { title: 'Dielectric Insertion: Battery Connected (V = const) vs Battery Disconnected (Q = const)', condition: 'Dielectric slab K inserted into capacitor', resultFormula: 'Battery CONNECTED: V remains V₀, C = K·C₀, Q = K·Q₀, E = E₀, U = K·U₀;  Battery DISCONNECTED: Q remains Q₀, C = K·C₀, V = V₀/K, E = E₀/K, U = U₀/K', notes: 'Critical distinction tested heavily in JEE Main' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Charging q-t and i-t Curves', relation: 'q(t) rises asymptotically to C·E with initial slope E/R; i(t) decays exponentially from E/R to 0', examSignificance: 'Time constant τ = RC equals sub-tangent of curve' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Capacitance', symbol: 'C', valueOrFormula: 'Q / V', siUnit: 'F (Farad) [μF = 10⁻⁶ F, pF = 10⁻¹² F]' },
      { quantityOrConstant: 'Time Constant', symbol: 'τ', valueOrFormula: 'R · C', siUnit: 's (Seconds)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Infinite ladder network of capacitors: C_eq = C₁ + (C₂ · C_eq) / (C₂ + C_eq) ⟹ solve quadratic equation for C_eq.',
        'At t = 0⁺ (just after switch closing): uncharged capacitor acts as SHORT CIRCUIT (zero resistance wire). At t ⟶ ∞ (steady state): fully charged capacitor acts as OPEN CIRCUIT (infinite resistance break).',
      ],
      trapsAndPitfalls: [
        'Work done by battery is W = Q·V = C·V², while energy stored in capacitor is ONLY (1/2)·C·V². The other (1/2)·C·V² is always lost as heat in the circuit.',
        'When a dielectric slab is partially inserted, an electrostatic fringe force pulls the slab INTO the capacitor: F = (ε₀·b·V² / 2d) · (K - 1).',
      ],
    },
  },

  // 15. CURRENT ELECTRICITY
  {
    id: 'current-electricity',
    name: 'Current Electricity',
    aliases: ['current electricity', 'ohms law', 'kirchhoff laws', 'potentiometer', 'meter bridge', 'wheatstone bridge'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Electric Current', definition: 'Rate of flow of electric charge through cross-sectional area', symbol: 'i = dq / dt = n·e·A·v_d', siUnit: 'A (Ampere = C/s)' },
      { term: 'Drift Velocity', definition: 'Average drift speed of conduction electrons under applied electric field E', symbol: 'v_d = (e·E·τ) / m = (e·V·τ) / (m·L)', siUnit: 'm/s (typically ~10⁻⁴ m/s)' },
      { term: 'Current Density', definition: 'Current per unit normal cross-sectional area', symbol: 'J = i / A = σ·E = E / ρ = n·e·v_d', siUnit: 'A/m²' },
      { term: 'Resistivity and Resistance', definition: 'Intrinsic material resistivity ρ and geometric resistance R', symbol: 'R = ρ · (L / A) = (m / (n·e²·τ)) · (L / A)', siUnit: 'Ω (Ohm), ρ in Ω·m' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Microscopic & Macroscopic Laws',
        items: [
          { name: 'Ohm Law (Microscopic Form)', formula: 'J = σ · E = (1 / ρ) · E', conditionOrMeaning: 'Valid for isotropic ohmic conductors', siUnit: 'A/m²' },
          { name: 'Temperature Dependence of Resistance', formula: 'R(T) = R₀ · [ 1 + α·(T - T₀) ],  ρ(T) = ρ₀ · [ 1 + α·(T - T₀) ]', conditionOrMeaning: 'α is temperature coefficient of resistance (positive for metals, negative for semiconductors)', siUnit: 'Ω / K⁻¹' },
          { name: 'Joule Heating & Electric Power', formula: 'P = i²·R = V·i = V² / R,  H = ∫ i²·R dt', conditionOrMeaning: 'Rate of electrical energy dissipated as thermal heat', siUnit: 'W (Watt) / J' },
          { name: 'Maximum Power Transfer Theorem', formula: 'P_max = E² / (4·r)  when  R_load = r_internal', conditionOrMeaning: 'Load resistance matched to internal source resistance', siUnit: 'W' },
        ],
      },
      {
        sectionTitle: 'Network Laws & Grouping of Cells',
        items: [
          { name: 'Kirchhoff Current Law (KCL - Junction Rule)', formula: '∑ i_in = ∑ i_out  ⟹  ∑ i_junction = 0', conditionOrMeaning: 'Based on CONSERVATION OF ELECTRIC CHARGE', siUnit: 'A' },
          { name: 'Kirchhoff Voltage Law (KVL - Loop Rule)', formula: '∑ ΔV_closed loop = 0  ⟹  ∑ E - ∑ (i·R) = 0', conditionOrMeaning: 'Based on CONSERVATION OF ENERGY', siUnit: 'V' },
          { name: 'Series Grouping of n Cells (EMF E, internal r)', formula: 'E_eq = n·E,  r_eq = n·r,  i = (n·E) / (R + n·r)', conditionOrMeaning: 'Useful when external load R ≫ n·r', siUnit: 'V / Ω / A' },
          { name: 'Parallel Grouping of m Cells (EMF E, internal r)', formula: 'E_eq = E,  r_eq = r / m,  i = E / [ R + (r / m) ]', conditionOrMeaning: 'Useful when external load R ≪ r', siUnit: 'V / Ω / A' },
          { name: 'Mixed Grouping of N = n × m Cells (n series in each of m rows)', formula: 'i_max = (n·E) / (2R) = (m·E) / (2r)  when  R = (n·r) / m', conditionOrMeaning: 'Maximum current condition', siUnit: 'A' },
          { name: 'Two Dissimilar Cells in Parallel', formula: 'E_eq = [ (E₁/r₁) + (E₂/r₂) ] / [ (1/r₁) + (1/r₂) ],  r_eq = (r₁·r₂) / (r₁ + r₂)', conditionOrMeaning: 'Millman theorem for parallel EMF sources', siUnit: 'V / Ω' },
        ],
      },
      {
        sectionTitle: 'Measuring Instruments',
        items: [
          { name: 'Balanced Wheatstone Bridge', formula: 'P / Q = R / S  ⟹  i_galvanometer = 0', conditionOrMeaning: 'Zero current through central galvanometer branch', siUnit: 'Dimensionless ratio' },
          { name: 'Meter Bridge (Unknown Resistance S)', formula: 'S = R · [ (100 - l) / l ]', conditionOrMeaning: 'l is balancing length in cm from zero end', siUnit: 'Ω' },
          { name: 'Potentiometer Principle', formula: 'V = k · l = (V_wire / L) · l,  k = [ (E_drive · R_wire) / (R_drive + R_wire) ] / L', conditionOrMeaning: 'Potential gradient k in V/m along uniform wire', siUnit: 'V' },
          { name: 'Comparison of EMFs using Potentiometer', formula: 'E₁ / E₂ = l₁ / l₂', conditionOrMeaning: 'Independent of internal resistances', siUnit: 'Dimensionless ratio' },
          { name: 'Internal Resistance of Cell via Potentiometer', formula: 'r = R · [ (l₁ - l₂) / l₂ ]', conditionOrMeaning: 'l₁ is open circuit balance length, l₂ is shunted with R balance length', siUnit: 'Ω' },
          { name: 'Galvanometer Conversion to Ammeter (Shunt S in parallel)', formula: 'S = (i_g · R_g) / (i - i_g)', conditionOrMeaning: 'S is small parallel resistance; R_ammeter = (R_g · S) / (R_g + S) ≈ S', siUnit: 'Ω' },
          { name: 'Galvanometer Conversion to Voltmeter (Multiplier R_s in series)', formula: 'R_s = (V / i_g) - R_g', conditionOrMeaning: 'R_s is large series resistance; R_voltmeter = R_g + R_s ≈ R_s', siUnit: 'Ω' },
        ],
      },
    ],
    specialCases: [
      { title: 'Stretching of a Wire (Volume V = A·L is constant)', condition: 'Wire stretched to n-times its initial length (L_new = n·L)', resultFormula: 'A_new = A / n  ⟹  R_new = n² · R_initial', notes: 'Resistance scales with square of length elongation factor' },
      { title: 'Cube of 12 equal resistors R', condition: 'Equivalent resistance across various terminals', resultFormula: 'Body diagonal: R_eq = (5/6)·R;  Face diagonal: R_eq = (3/4)·R;  Single edge: R_eq = (7/12)·R', notes: 'Standard recurring symmetry problem in JEE Advanced' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Terminal Potential Difference vs Load Current', relation: 'Discharging: V = E - i·r (Negative slope -r, y-intercept E); Charging: V = E + i·r', examSignificance: 'V vs i straight line graph gives EMF and internal resistance' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Resistivity of Copper', symbol: 'ρ_Cu', valueOrFormula: '1.7 × 10⁻⁸', siUnit: 'Ω·m' },
      { quantityOrConstant: 'Conductivity', symbol: 'σ = 1/ρ', valueOrFormula: 'n·e²·τ / m', siUnit: 'S/m (Siemens/m = Ω⁻¹·m⁻¹)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Color code of resistors: "BBROY of Great Britain has Very Good Wife" (0 to 9) + Gold (±5%), Silver (±10%).',
        'Delta to Star conversion: R_A = (R_AB · R_CA) / (R_AB + R_BC + R_CA).',
      ],
      trapsAndPitfalls: [
        'An ideal voltmeter has INFINITE resistance (acts as open branch); an ideal ammeter has ZERO resistance (acts as short).',
        'Potentiometer draws NO current from test cell at balance point, measuring exact open-circuit EMF (unlike standard voltmeter).',
      ],
    },
  },

  // 16. MAGNETIC EFFECTS OF CURRENT
  {
    id: 'magnetic-effects-of-current',
    name: 'Magnetic Effects of Current',
    aliases: ['magnetic effects of current', 'biot savart', 'ampere law', 'lorentz force', 'magnetic field', 'cyclotron'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Biot-Savart Law', definition: 'Magnetic field produced by differential current element i·dl', symbol: 'dB = (μ₀ / (4π)) · [ (i · dl × r̂) / r² ]', siUnit: 'T (Tesla = N/(A·m))' },
      { term: 'Ampere Circuital Law', definition: 'Line integral of magnetic field along closed loop equals μ₀ times enclosed current', symbol: '∮ B · dl = μ₀ · i_enclosed', siUnit: 'T·m' },
      { term: 'Lorentz Magnetic Force', definition: 'Force experienced by moving charged particle in magnetic field', symbol: 'F_m = q · (v × B)  ⟹  F_Lorentz = q · (E + v × B)', siUnit: 'N' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Standard Magnetic Fields from Current Distributions',
        items: [
          { name: 'Straight Wire of Finite Length (Subtending angles θ₁ and θ₂)', formula: 'B = (μ₀ · i) / (4·π·d) · (sin θ₁ + sin θ₂)', conditionOrMeaning: 'd is perpendicular distance to wire', siUnit: 'T' },
          { name: 'Infinitely Long Straight Wire', formula: 'B = (μ₀ · i) / (2·π·d)', conditionOrMeaning: 'Concentric circular magnetic field lines', siUnit: 'T' },
          { name: 'Center of Circular Coil of N turns (Radius R)', formula: 'B_center = (μ₀ · N · i) / (2·R)', conditionOrMeaning: 'For circular arc subtending angle θ (rad): B = (μ₀·i·θ) / (4πR)', siUnit: 'T' },
          { name: 'Axis of Circular Current Loop (Distance x from center)', formula: 'B_axis = (μ₀ · N · i · R²) / [ 2 · (R² + x²)^(3/2) ]', conditionOrMeaning: 'When x ≫ R: B_axis ≈ (μ₀ · 2M) / (4π·x³), where magnetic moment M = N·i·A', siUnit: 'T' },
          { name: 'Inside Long Ideal Solenoid (n turns per unit length)', formula: 'B_solenoid = μ₀ · n · i = μ₀ · (N / L) · i', conditionOrMeaning: 'At extreme ends of semi-infinite solenoid: B_end = (1/2) · μ₀·n·i', siUnit: 'T' },
          { name: 'Inside Toroid (Mean radius R, N total turns)', formula: 'B_toroid = (μ₀ · N · i) / (2·π·R) = μ₀ · n · i', conditionOrMeaning: 'Zero field in external region and central hole', siUnit: 'T' },
          { name: 'Long Solid Cylindrical Conductor (Radius R, Total current i)', formula: 'B_in = (μ₀ · i · r) / (2·π·R²) (r ≤ R),  B_out = (μ₀ · i) / (2·π·r) (r > R)', conditionOrMeaning: 'Field increases linearly inside, decays as 1/r outside', siUnit: 'T' },
        ],
      },
      {
        sectionTitle: 'Charged Particle Motion in Magnetic Field',
        items: [
          { name: 'Radius of Circular Trajectory (v ⊥ B)', formula: 'r = (m · v) / (q · B) = p / (q · B) = √(2·m·K) / (q · B) = √(2·m·q·V) / (q · B)', conditionOrMeaning: 'Centripetal force qvB = mv²/r; Magnetic force does ZERO WORK', siUnit: 'm' },
          { name: 'Cyclotron Frequency & Time Period', formula: 'T = (2·π·m) / (q · B),  f_c = (q · B) / (2·π·m),  ω = (q · B) / m', conditionOrMeaning: 'INDEPENDENT of particle speed v and orbital radius r', siUnit: 's / Hz / rad/s' },
          { name: 'Helical Motion Pitch (Velocity v at angle θ to B)', formula: 'r = (m·v·sin θ) / (q·B),  Pitch p = v_parallel · T = (2·π·m·v·cos θ) / (q·B)', conditionOrMeaning: 'v_parallel = v cos θ (constant), v_perp = v sin θ (circular)', siUnit: 'm' },
          { name: 'Velocity Selector Condition', formula: 'v_select = E / B', conditionOrMeaning: 'Mutual balance: q·E = q·v·B (E ⊥ B ⊥ v)', siUnit: 'm/s' },
        ],
      },
      {
        sectionTitle: 'Magnetic Forces on Wires & Magnetic Moments',
        items: [
          { name: 'Magnetic Force on Current-Carrying Wire', formula: 'F = i · (L × B) = i · L · B · sin θ', conditionOrMeaning: 'L is straight vector displacement from start to end of wire', siUnit: 'N' },
          { name: 'Force between Two Parallel Straight Currents (Separation d)', formula: 'F / L = (μ₀ · i₁ · i₂) / (2·π·d)', conditionOrMeaning: 'ATTRACTIVE if currents are parallel; REPULSIVE if antiparallel', siUnit: 'N/m' },
          { name: 'Magnetic Dipole Moment of Current Loop', formula: 'M = N · i · A · n̂', conditionOrMeaning: 'Area vector A directed by right-hand thumb rule', siUnit: 'A·m² or J/T' },
          { name: 'Torque on Magnetic Dipole in Uniform B', formula: 'τ = M × B = M · B · sin θ,  U = - M · B = - M · B · cos θ', conditionOrMeaning: 'U_min = - MB (stable at θ=0°); U_max = + MB (unstable at θ=180°)', siUnit: 'N·m / J' },
          { name: 'Gyromagnetic Ratio of Orbiting Electron', formula: 'M / L = e / (2·m_e)  ⟹  M = (e / (2m_e)) · L', conditionOrMeaning: 'Bohr Magneton μ_B = (e·h) / (4π·m_e) ≈ 9.27 × 10⁻²⁴ A·m²', siUnit: 'C/kg / A·m²' },
        ],
      },
    ],
    specialCases: [
      { title: 'Closed Current Loop in Uniform Magnetic Field', condition: 'Any arbitrary shaped planar or non-planar closed loop in uniform B', resultFormula: 'F_net = ∮ i · (dl × B) = 0', notes: 'Net translational force is ALWAYS ZERO; net torque τ = M × B can be non-zero' },
      { title: 'Helmholtz Coils Configuration', condition: 'Two identical coaxial coils of radius R separated by distance R carrying same current', resultFormula: 'B_midpoint = (8 / (5√5)) · (μ₀·N·i / R) ≈ 0.716 · (μ₀·N·i / R)', notes: 'Produces extremely uniform magnetic field in central zone (d²B/dx² = 0)' },
    ],
    keyRelationsAndGraphs: [
      { title: 'B vs r for Solid Cylinder of Radius R', relation: 'B increases linearly from 0 at r=0 to B_max = μ₀i/(2πR) at surface r=R, then decays as 1/r for r > R', examSignificance: 'Core graph representation in JEE Main' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Permeability of Free Space', symbol: 'μ₀', valueOrFormula: '4π × 10⁻⁷ ≈ 1.2566 × 10⁻⁶', siUnit: 'T·m/A or N/A²' },
      { quantityOrConstant: 'Tesla to Gauss Conversion', symbol: '1 T', valueOrFormula: '10⁴ Gauss (G)', siUnit: '1 T = 10,000 G' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Magnetic force on ANY closed current loop in a UNIFORM magnetic field is identically ZERO (F_net = 0).',
        'Kinetic energy of charged particle in purely magnetic field is CONSTANT (Magnetic force does no work since F ⊥ v).',
      ],
      trapsAndPitfalls: [
        'Do not confuse Biot-Savart law (inverse square 1/r²) with infinite straight wire field (inverse linear 1/r).',
        'Parallel currents attract, while parallel moving like charges repel electrostatically (magnetic attraction < electrostatic repulsion when v < c).',
      ],
    },
  },

  // 17. MAGNETISM AND MATTER
  {
    id: 'magnetism-and-matter',
    name: 'Magnetism',
    aliases: ['magnetism', 'magnetism and matter', 'magnetic properties', 'earth magnetism', 'hysteresis'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Gauss Law for Magnetism', definition: 'Net magnetic flux through any closed Gaussian surface is zero (No magnetic monopoles exist)', symbol: '∮ B · dA = 0', siUnit: 'T·m² (Wb = Weber)' },
      { term: 'Magnetic Intensity (H)', definition: 'Applied external magnetizing field vector', symbol: 'H = B / μ₀ - M  ⟹  B = μ₀·(H + M)', siUnit: 'A/m' },
      { term: 'Magnetic Susceptibility (χ_m)', definition: 'Ratio of induced magnetization M to applied magnetic intensity H', symbol: 'χ_m = M / H,  μ_r = 1 + χ_m', siUnit: 'Dimensionless' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Bar Magnet & Earth Magnetism',
        items: [
          { name: 'Magnetic Field on Axial Line of Short Bar Magnet', formula: 'B_axial = (μ₀ / (4π)) · (2M / r³)', conditionOrMeaning: 'Along magnetic dipole axis (End-on)', siUnit: 'T' },
          { name: 'Magnetic Field on Equatorial Line of Short Bar Magnet', formula: 'B_equatorial = (μ₀ / (4π)) · (M / r³)', conditionOrMeaning: 'Opposite to dipole moment M (Broadside-on)', siUnit: 'T' },
          { name: 'Time Period of Vibration Magnetometer', formula: 'T = 2π · √[ I / (M · B_H) ]', conditionOrMeaning: 'I is moment of inertia, B_H is Earth horizontal magnetic component', siUnit: 's' },
          { name: 'Earth Magnetic Field Components', formula: 'B_H = B_e · cos θ_dip,  B_V = B_e · sin θ_dip,  tan θ_dip = B_V / B_H', conditionOrMeaning: 'θ_dip = 0° at magnetic equator, θ_dip = 90° at magnetic poles', siUnit: 'T' },
          { name: 'Apparent Dip in Two Perpendicular Vertical Planes', formula: 'cot² θ_true = cot² θ₁ + cot² θ₂', conditionOrMeaning: 'θ₁ and θ₂ are dip angles measured in mutually orthogonal vertical planes', siUnit: 'Dimensionless relation' },
        ],
      },
      {
        sectionTitle: 'Magnetic Materials & Curie Law',
        items: [
          { name: 'Diamagnetic Materials', formula: 'χ_m < 0 (small negative ~ -10⁻⁵),  μ_r < 1', conditionOrMeaning: 'Repelled by magnets; Independent of temperature T (e.g. Bi, Cu, H₂O)', siUnit: 'Dimensionless' },
          { name: 'Paramagnetic Materials (Curie Law)', formula: 'χ_m = C / T  (χ_m > 0, small positive),  μ_r > 1', conditionOrMeaning: 'Weakly attracted; Susceptibility inversely proportional to absolute T (e.g. Al, O₂, Na)', siUnit: 'Dimensionless / K' },
          { name: 'Ferromagnetic Materials (Curie-Weiss Law above T_C)', formula: 'χ_m = C / (T - T_C)  (for T > T_C)', conditionOrMeaning: 'T_C is Curie temperature (Fe = 1043 K). Becomes paramagnetic above T_C', siUnit: 'K' },
          { name: 'Hysteresis Energy Loss per Cycle', formula: 'W_loss = Area of B-H Hysteresis Loop × Volume × Frequency', conditionOrMeaning: 'Electromagnets require narrow loop (soft iron); permanent magnets require wide loop (steel)', siUnit: 'J/m³' },
        ],
      },
    ],
    specialCases: [
      { title: 'Cutting a Bar Magnet', condition: 'Original magnet of length L, pole strength m, dipole moment M = m·L', resultFormula: 'Cut transverse to length: m remains m, L becomes L/2 ⟹ M_new = M/2;  Cut longitudinal along axis: m becomes m/2, L remains L ⟹ M_new = M/2', notes: 'Moment of inertia also scales accordingly' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Tangent Galvanometer Law', relation: 'B = B_H · tan θ  ⟹  i = (2·R·B_H / (μ₀·N)) · tan θ = K · tan θ', examSignificance: 'Reduction factor K in Amperes' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Bohr Magneton', symbol: 'μ_B', valueOrFormula: '9.274 × 10⁻²⁴', siUnit: 'A·m² or J/T' },
      { quantityOrConstant: 'Magnetic Flux', symbol: 'Φ_B', valueOrFormula: 'B · A · cos θ', siUnit: 'Wb (Weber = T·m²)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Neutral points: Magnet with N-pole pointing North ⟹ neutral points on equatorial line (B_equat = B_H); N-pole pointing South ⟹ neutral points on axial line (B_axial = B_H).',
      ],
      trapsAndPitfalls: [
        'Permeability μ = B / H, Susceptibility χ = M / H. Relative permeability μ_r = 1 + χ.',
      ],
    },
  },

  // 18. ELECTROMAGNETIC INDUCTION (EMI)
  {
    id: 'electromagnetic-induction',
    name: 'Electromagnetic Induction',
    aliases: ['electromagnetic induction', 'emi', 'faraday law', 'lenz law', 'motional emf', 'inductance', 'self induction', 'mutual induction'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Faraday Law of Induction', definition: 'Induced EMF equals negative time rate of change of magnetic flux', symbol: 'E = - dΦ_B / dt = - d(N·B·A·cos θ) / dt', siUnit: 'V (Volt)' },
      { term: 'Lenz Law', definition: 'Direction of induced EMF/current always opposes the change in flux producing it', symbol: 'Polarity criterion', siUnit: 'Conservation of Energy' },
      { term: 'Self & Mutual Inductance', definition: 'Flux linkage per unit current in coil', symbol: 'Φ = L·i,  E_self = - L·(di/dt);  Φ₂ = M·i₁,  E_mutual = - M·(di₁/dt)', siUnit: 'H (Henry = V·s/A = Wb/A)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Motional EMF & Induced Electric Fields',
        items: [
          { name: 'Translational Motional EMF in Straight Conductor', formula: 'E = (v × B) · L = B · L · v · sin θ', conditionOrMeaning: 'Conductor length L moving at velocity v in magnetic field B', siUnit: 'V' },
          { name: 'Rotational Motional EMF in Rotating Rod (Length L, Angular speed ω)', formula: 'E_rot = (1/2) · B · ω · L²', conditionOrMeaning: 'Rotating about one end in uniform transverse field B', siUnit: 'V' },
          { name: 'Induced Non-Conservative Electric Field (Cylindrical Symmetry)', formula: '∮ E_ind · dl = - dΦ_B / dt  ⟹  E_ind(r) = (r / 2) · (dB / dt) (r ≤ R),  E_ind(r) = (R² / (2r)) · (dB / dt) (r > R)', conditionOrMeaning: 'Non-electrostatic concentric circular electric field lines; line integral round closed path ≠ 0', siUnit: 'V/m' },
        ],
      },
      {
        sectionTitle: 'Self & Mutual Inductances',
        items: [
          { name: 'Self-Inductance of Long Solenoid (Length l, Area A, N turns)', formula: 'L = μ₀ · n² · A · l = (μ₀ · N² · A) / l', conditionOrMeaning: 'With ferromagnetic core of relative permeability μ_r: L = μ_r · L₀', siUnit: 'H' },
          { name: 'Mutual Inductance of Two Coaxial Solenoids', formula: 'M = μ₀ · n₁ · n₂ · π · r₁² · l', conditionOrMeaning: 'r₁ is radius of inner solenoid', siUnit: 'H' },
          { name: 'Coupling Coefficient k', formula: 'M = k · √(L₁ · L₂)', conditionOrMeaning: '0 ≤ k ≤ 1 (k = 1 for perfectly coupled coils)', siUnit: 'Dimensionless' },
          { name: 'Magnetic Energy Stored in Inductor', formula: 'U_B = (1/2) · L · i²', conditionOrMeaning: 'Stored in magnetic field of inductor', siUnit: 'J' },
          { name: 'Magnetic Energy Density of Magnetic Field', formula: 'u_B = B² / (2·μ₀)', conditionOrMeaning: 'Energy per unit volume of magnetic field in vacuum', siUnit: 'J/m³' },
        ],
      },
      {
        sectionTitle: 'LR Circuit Dynamics',
        items: [
          { name: 'Current Growth in LR Circuit', formula: 'i(t) = i_max · (1 - e^(-t / τ_L)) = (E / R) · (1 - e^(-t·R / L))', conditionOrMeaning: 'Inductive time constant τ_L = L / R; At t = τ_L, i ≈ 0.632 · i_max', siUnit: 'A' },
          { name: 'Current Decay in LR Circuit', formula: 'i(t) = i₀ · e^(-t / τ_L) = i₀ · e^(-t·R / L)', conditionOrMeaning: 'At t = τ_L, i drops to 0.368 · i₀', siUnit: 'A' },
          { name: 'Total Induced Charge Flow', formula: 'q = ΔΦ_B / R_circuit = (Φ_initial - Φ_final) / R', conditionOrMeaning: 'INDEPENDENT of time rate or speed at which flux changes', siUnit: 'C' },
        ],
      },
    ],
    specialCases: [
      { title: 'Conductor Rod sliding on smooth rails in transverse B with resistor R', condition: 'Terminal velocity falling under gravity / pulling force F', resultFormula: 'v_term = (m·g·R) / (B²·L²),  i_ind = (B·L·v_term) / R,  P_mech = F·v = i²·R = P_joule', notes: 'Complete mechanical to electrical energy conversion' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Growth of Current in Inductor', relation: 'At t = 0⁺: Inductor acts as OPEN CIRCUIT (i = 0); At t ⟶ ∞: Inductor acts as SHORT CIRCUIT zero resistance wire', examSignificance: 'Cornerstone rule for switching circuits' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Inductance', symbol: 'L, M', valueOrFormula: 'Φ / i', siUnit: 'H (Henry = V·s/A = Ω·s)' },
      { quantityOrConstant: 'Inductive Time Constant', symbol: 'τ_L', valueOrFormula: 'L / R', siUnit: 's (Seconds)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Total charge flown through circuit during any flux change: Δq = ΔΦ / R_total.',
        'Eddy current power dissipation P ∝ f² · B² · t² (t is lamination thickness; laminations drastically reduce eddy currents).',
      ],
      trapsAndPitfalls: [
        'Induced electric field E_ind is NON-CONSERVATIVE: ∮ E_ind · dl ≠ 0. You cannot define electrostatic potential V for induced electric fields.',
      ],
    },
  },

  // 19. ALTERNATING CURRENT (AC)
  {
    id: 'alternating-current',
    name: 'Alternating Current',
    aliases: ['alternating current', 'ac', 'lcr circuit', 'resonance', 'power factor', 'transformer', 'phasor'],
    category: 'Electrodynamics',
    basicDefinitions: [
      { term: 'Sinusoidal AC Waveform', definition: 'Harmonic instantaneous voltage and current with peak values', symbol: 'v(t) = V₀·sin(ωt),  i(t) = I₀·sin(ωt ± φ)', siUnit: 'V, A' },
      { term: 'Root Mean Square (RMS) Value', definition: 'Effective DC heating equivalent over full cycle', symbol: 'V_rms = V₀ / √2 ≈ 0.707·V₀,  I_rms = I₀ / √2 ≈ 0.707·I₀', siUnit: 'V, A' },
      { term: 'Mean / Average Value over Half Cycle', definition: 'Average value over positive half cycle [0, T/2]', symbol: 'V_avg = (2·V₀) / π ≈ 0.637·V₀,  I_avg = (2·I₀) / π', siUnit: 'V, A (Full cycle avg = 0)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Reactance & Impedance in AC Circuits',
        items: [
          { name: 'Inductive Reactance (X_L)', formula: 'X_L = ω · L = 2·π·f · L', conditionOrMeaning: 'Voltage leads current by 90° (φ = +π/2 in pure inductor)', siUnit: 'Ω' },
          { name: 'Capacitive Reactance (X_C)', formula: 'X_C = 1 / (ω · C) = 1 / (2·π·f · C)', conditionOrMeaning: 'Current leads voltage by 90° (φ = -π/2 in pure capacitor)', siUnit: 'Ω' },
          { name: 'Series LCR Circuit Impedance (Z)', formula: 'Z = √[ R² + (X_L - X_C)² ] = √[ R² + (ωL - 1/(ωC))² ]', conditionOrMeaning: 'Phase angle tan φ = (X_L - X_C) / R', siUnit: 'Ω' },
          { name: 'Series LCR Resonant Frequency', formula: 'ω₀ = 1 / √(L · C)  ⟹  f₀ = 1 / (2π · √(L·C))', conditionOrMeaning: 'At resonance: X_L = X_C, Z_min = R, I_max = V_rms / R, φ = 0 (in phase)', siUnit: 'rad/s / Hz' },
          { name: 'Quality Factor (Q-Factor) of Series Resonant Circuit', formula: 'Q = ω₀ · L / R = 1 / (ω₀ · C · R) = (1 / R) · √(L / C) = f₀ / Δf', conditionOrMeaning: 'Δf is bandwidth between half-power points; measures sharpness of resonance', siUnit: 'Dimensionless' },
        ],
      },
      {
        sectionTitle: 'AC Power & Transformers',
        items: [
          { name: 'Real / Average Power Consumed in AC Circuit', formula: 'P_avg = V_rms · I_rms · cos φ = (V₀ · I₀ / 2) · cos φ = I_rms² · R', conditionOrMeaning: 'cos φ = R / Z is POWER FACTOR of circuit (0 ≤ cos φ ≤ 1)', siUnit: 'W (Watt)' },
          { name: 'Wattless / Reactive Current', formula: 'I_wattless = I_rms · sin φ', conditionOrMeaning: 'Component of current that consumes zero net power over cycle', siUnit: 'A' },
          { name: 'Ideal Transformer Voltage & Current Relations', formula: 'V_s / V_p = N_s / N_p = I_p / I_s = k', conditionOrMeaning: 'k is transformation turn ratio; Power P_in = P_out for ideal 100% efficient transformer', siUnit: 'Ratio' },
          { name: 'Transformer Efficiency', formula: 'η = P_output / P_input = (V_s · I_s · cos φ_s) / (V_p · I_p · cos φ_p)', conditionOrMeaning: 'Losses include copper I²R, eddy currents, hysteresis, and flux leakage', siUnit: 'Dimensionless (%)' },
        ],
      },
    ],
    specialCases: [
      { title: 'Choke Coil (Low Power Dissipation Inductor)', condition: 'High inductance L, very low resistance R', resultFormula: 'Z ≈ ωL,  cos φ = R / √(R² + ω²L²) ≈ 0 ⟹ P_avg ≈ 0', notes: 'Controls AC current with negligible power waste compared to series rheostat' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Resonance Curve (Current vs Frequency)', relation: 'Peak at f = f₀ with height I_max = V/R; Narrow high peak for low R (high Q); Broad flat peak for high R (low Q)', examSignificance: 'Tuning circuits & selectivity in radios' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Impedance / Reactance', symbol: 'Z, X_L, X_C', valueOrFormula: 'V_rms / I_rms', siUnit: 'Ω (Ohm)' },
      { quantityOrConstant: 'Power Factor', symbol: 'cos φ', valueOrFormula: 'R / Z', siUnit: 'Dimensionless' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Bandwidth of series LCR circuit: Δω = ω₂ - ω₁ = R / L. Quality factor Q = ω₀ / Δω = (1/R)·√(L/C).',
        'At parallel resonance (L in parallel with C): Z_max = L / (C·R) (Dynamic resistance), I_min = V / Z_max.',
      ],
      trapsAndPitfalls: [
        'AC meters (voltmeters and ammeters) measure RMS values, NOT peak or average values.',
        'Voltage across individual L and C components at resonance can be much HIGHER than source voltage (V_L = V_C = Q · V_source).',
      ],
    },
  },

  // 20. RAY OPTICS AND OPTICAL INSTRUMENTS
  {
    id: 'ray-optics',
    name: 'Ray Optics',
    aliases: ['ray optics', 'geometric optics', 'reflection', 'refraction', 'snell law', 'lens maker formula', 'prism', 'microscope', 'telescope'],
    category: 'Optics',
    basicDefinitions: [
      { term: 'Snell Law of Refraction', definition: 'Ratio of sines of incidence and refraction angles equals relative refractive index', symbol: 'n₁ · sin i = n₂ · sin r  ⟹  (sin i) / (sin r) = n₂ / n₁ = v₁ / v₂ = λ₁ / λ₂', siUnit: 'Dimensionless' },
      { term: 'Critical Angle & Total Internal Reflection (TIR)', definition: 'Angle of incidence in denser medium for which refraction angle is 90°', symbol: 'sin θ_c = n_rarer / n_denser = 1 / n', siUnit: 'Degrees / Rad' },
      { term: 'Apparent Depth', definition: 'Apparent shift of submerged object viewed normally from rarer medium', symbol: 'd_app = d_real / n,  Shift Δx = d_real · (1 - 1/n)', siUnit: 'm' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Mirrors & Spherical Surfaces',
        items: [
          { name: 'Spherical Mirror Formula', formula: '1 / v + 1 / u = 1 / f = 2 / R', conditionOrMeaning: 'Cartesian sign convention: pole as origin, incident light as +x direction', siUnit: 'm' },
          { name: 'Transverse (Linear) Magnification of Mirror', formula: 'm = h_image / h_obj = - v / u = f / (f - u) = (f - v) / f', conditionOrMeaning: 'm < 0 inverted real image; m > 0 erect virtual image', siUnit: 'Dimensionless' },
          { name: 'Longitudinal Magnification of Mirror (Small object dl)', formula: 'm_L = dl_image / dl_obj = - v² / u² = - m²', conditionOrMeaning: 'Always negative (longitudinally inverted)', siUnit: 'Dimensionless' },
          { name: 'Refraction at Single Spherical Interface', formula: 'n₂ / v - n₁ / u = (n₂ - n₁) / R', conditionOrMeaning: 'Light travelling from medium of index n₁ to n₂ across radius R surface', siUnit: 'm⁻¹' },
        ],
      },
      {
        sectionTitle: 'Thin Lenses & Lens Maker Formula',
        items: [
          { name: 'Lens Maker Formula', formula: '1 / f = (n_rel - 1) · [ 1 / R₁ - 1 / R₂ ] = (n_lens / n_medium - 1) · [ 1 / R₁ - 1 / R₂ ]', conditionOrMeaning: 'R₁ and R₂ are radii of curvature with appropriate signs', siUnit: 'm⁻¹' },
          { name: 'Thin Lens Equation', formula: '1 / v - 1 / u = 1 / f', conditionOrMeaning: 'Valid for thin coaxial lenses', siUnit: 'm⁻¹' },
          { name: 'Linear Magnification of Lens', formula: 'm = h_image / h_obj = + v / u = f / (f + u) = (f - v) / f', conditionOrMeaning: 'Positive for erect/virtual, Negative for inverted/real', siUnit: 'Dimensionless' },
          { name: 'Power of Lens & Combination in Contact', formula: 'P = 1 / f(m) (Diopters),  P_eq = P₁ + P₂ + ...,  1 / f_eq = 1 / f₁ + 1 / f₂', conditionOrMeaning: 'For two thin lenses separated by distance d: P_eq = P₁ + P₂ - d · P₁ · P₂', siUnit: 'D (Diopter = m⁻¹)' },
          { name: 'Silvering of Lens (Behaves as Equivalent Mirror)', formula: '1 / f_eq = 2 / f_lens + 1 / f_mirror ⟹ P_eq = 2·P_lens + P_mirror', conditionOrMeaning: 'Acts as concave mirror if f_eq is negative', siUnit: 'm⁻¹' },
          { name: 'Displacement Method (Object and Screen fixed at separation D > 4f)', formula: 'f = (D² - d²) / (4D),  h_obj = √(h₁ · h₂),  m₁ · m₂ = 1', conditionOrMeaning: 'd is distance between two sharp image lens positions', siUnit: 'm' },
        ],
      },
      {
        sectionTitle: 'Prisms & Optical Instruments',
        items: [
          { name: 'Prism Deviation & Refraction', formula: 'r₁ + r₂ = A,  δ = i + e - A', conditionOrMeaning: 'A is prism refracting apex angle, i is incidence, e is emergence angle', siUnit: 'Degrees / Rad' },
          { name: 'Minimum Deviation Condition (δ = δ_m)', formula: 'i = e,  r₁ = r₂ = A / 2 ⟹ n = [ sin((A + δ_m) / 2) ] / [ sin(A / 2) ]', conditionOrMeaning: 'Ray passes symmetrically through prism parallel to base', siUnit: 'Dimensionless' },
          { name: 'Thin Prism Deviation (A < 10°)', formula: 'δ ≈ (n - 1) · A,  Dispersive Power ω = (δ_v - δ_r) / δ_y = (n_v - n_r) / (n_y - 1)', conditionOrMeaning: 'Angular dispersion θ_disp = δ_v - δ_r = (n_v - n_r) · A', siUnit: 'Dimensionless' },
          { name: 'Compound Microscope Magnification', formula: 'M_normal = (v_o / |u_o|) · (D / f_e) ≈ (L / f_o) · (D / f_e) (Relaxed eye at ∞);  M_near = (v_o / |u_o|) · (1 + D / f_e) (At near point D)', conditionOrMeaning: 'D = 25 cm least distance of distinct vision; L is tube length', siUnit: 'Dimensionless' },
          { name: 'Astronomical Refracting Telescope', formula: 'M_normal = f_o / f_e,  L_tube = f_o + f_e (At infinity);  M_near = (f_o / f_e) · (1 + f_e / D),  L_tube = f_o + u_e', conditionOrMeaning: 'Objective focal length f_o ≫ eyepiece focal length f_e', siUnit: 'Dimensionless' },
        ],
      },
    ],
    specialCases: [
      { title: 'Cutting a Lens into Halves', condition: 'Original focal length f, power P, intensity I', resultFormula: 'Cut transverse along vertical diameter: each half has focal length f_new = 2·f, P_new = P/2;  Cut longitudinal along principal optical axis: each half retains SAME focal length f_new = f, but intensity drops to I/2', notes: 'Very frequent JEE Main conceptual problem' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Prism δ vs i Curve', relation: 'U-shaped asymmetric curve with unique minimum at δ = δ_m where i = e', examSignificance: 'Determination of refractive index of prism material' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Standard Least Distance of Distinct Vision', symbol: 'D', valueOrFormula: '0.25 m (25 cm)', siUnit: 'm' },
      { quantityOrConstant: 'Power of Lens', symbol: 'P', valueOrFormula: '1 / f(in meters)', siUnit: 'D (Diopter = m⁻¹)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Achromatic combination of two thin prisms in contact: Dispersive power relation ω₁/f₁ + ω₂/f₂ = 0 ⟹ deviation without dispersion: (n_v₁ - n_r₁)·A₁ = (n_v₂ - n_r₂)·A₂.',
        'Number of images formed by two plane mirrors inclined at angle θ: n = (360°/θ) - 1 (if 360/θ is even); n = 360°/θ (if odd and object off bisector).',
      ],
      trapsAndPitfalls: [
        'When lens is immersed in liquid of refractive index n_liq: 1/f_liq = (n_glass/n_liq - 1) / (n_glass - 1) · (1/f_air). If n_liq > n_glass, lens FLIPS character (convex becomes diverging concave!).',
      ],
    },
  },

  // 21. WAVE OPTICS
  {
    id: 'wave-optics',
    name: 'Wave Optics',
    aliases: ['wave optics', 'interference', 'diffraction', 'polarization', 'young double slit', 'ydse', 'brewster law', 'malus law'],
    category: 'Optics',
    basicDefinitions: [
      { term: 'Huygens Principle', definition: 'Every point on a wavefront acts as a secondary spherical wavelet source', symbol: 'Wavefront envelope', siUnit: 'Geometrical wave construction' },
      { term: 'Coherent Sources', definition: 'Sources maintaining a constant zero or fixed phase difference over time', symbol: 'Δφ = constant', siUnit: 'Criterion for stationary interference' },
      { term: 'Path Difference & Phase Difference', definition: 'Relation between optical path difference Δx and wave phase shift Δφ', symbol: 'Δφ = (2π / λ) · Δx', siUnit: 'rad / m' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Interference & Young Double Slit Experiment (YDSE)',
        items: [
          { name: 'Resultant Intensity of Two Superposing Coherent Waves', formula: 'I_res = I₁ + I₂ + 2·√(I₁·I₂)·cos Δφ', conditionOrMeaning: 'If equal amplitude (I₁ = I₂ = I₀): I_res = 4·I₀·cos²(Δφ / 2)', siUnit: 'W/m²' },
          { name: 'Constructive Interference (Bright Maxima)', formula: 'Δx = n · λ,  Δφ = 2n·π,  I_max = (√I₁ + √I₂)²  (n = 0, 1, 2, ...)', conditionOrMeaning: 'Central bright fringe corresponds to n = 0', siUnit: 'm / W/m²' },
          { name: 'Destructive Interference (Dark Minima)', formula: 'Δx = (2n - 1) · (λ / 2),  Δφ = (2n - 1)·π,  I_min = (√I₁ - √I₂)²  (n = 1, 2, ...)', conditionOrMeaning: 'Zero intensity (complete darkness) when I₁ = I₂', siUnit: 'm / W/m²' },
          { name: 'YDSE Fringe Width (β)', formula: 'β = (λ · D) / d', conditionOrMeaning: 'Slit separation d, screen distance D ≫ d, wavelength λ', siUnit: 'm' },
          { name: 'Position of n-th Bright Fringe from Center', formula: 'y_n = (n · λ · D) / d = n · β', conditionOrMeaning: 'Central maximum at y = 0', siUnit: 'm' },
          { name: 'Position of n-th Dark Fringe from Center', formula: 'y_n\' = (2n - 1) · (λ · D) / (2d) = (n - 1/2) · β', conditionOrMeaning: 'First dark fringe at y₁\' = β / 2', siUnit: 'm' },
          { name: 'Fringe Shift due to Thin Transparent Sheet (Thickness t, index μ)', formula: 'Shift Δy = (D / d) · (μ - 1) · t = (β / λ) · (μ - 1) · t', conditionOrMeaning: 'Number of fringes shifted: N = (μ - 1)·t / λ', siUnit: 'm' },
        ],
      },
      {
        sectionTitle: 'Diffraction & Polarization',
        items: [
          { name: 'Single Slit Fraunhofer Diffraction Minima', formula: 'a · sin θ = n · λ  (n = ±1, ±2, ±3, ...)', conditionOrMeaning: 'Slit width a; n ≠ 0 (n=0 is central maximum)', siUnit: 'Rad' },
          { name: 'Linear Width of Central Diffraction Maximum', formula: 'β_central = (2 · λ · D) / a = 2 · β_secondary', conditionOrMeaning: 'Central diffraction peak is TWICE as wide as secondary fringes', siUnit: 'm' },
          { name: 'Angular Width of Central Maximum', formula: '2 · θ₀ = (2 · λ) / a', conditionOrMeaning: 'In radians', siUnit: 'rad' },
          { name: 'Rayleigh Criterion for Limit of Resolution (Circular Aperture Diameter D)', formula: 'θ_min = (1.22 · λ) / D,  Resolving Power = 1 / θ_min = D / (1.22·λ)', conditionOrMeaning: 'Telescope angular resolution limit', siUnit: 'rad / rad⁻¹' },
          { name: 'Malus Law of Polarization', formula: 'I = I₀ · cos² θ', conditionOrMeaning: 'θ is angle between polarizer and analyzer transmission axes', siUnit: 'W/m²' },
          { name: 'Brewster Polarization Law', formula: 'tan θ_p = n₂ / n₁ = μ  ⟹  θ_p + r = 90°', conditionOrMeaning: 'Reflected light is 100% linearly polarized perpendicular to plane of incidence', siUnit: 'Degrees / Rad' },
        ],
      },
    ],
    specialCases: [
      { title: 'YDSE Immersed in Liquid of Refractive Index n', condition: 'Apparatus submersed in water/oil', resultFormula: 'λ_liquid = λ_air / n ⟹ β_liquid = β_air / n', notes: 'Fringe width decreases by factor n; fringes become more closely spaced' },
      { title: 'Unpolarized Light Passing Through Ideal Polarizer', condition: 'Incident unpolarized intensity I_unpol', resultFormula: 'I_transmitted = (1/2) · I_unpol', notes: 'Always exactly half of unpolarized intensity is transmitted' },
    ],
    keyRelationsAndGraphs: [
      { title: 'YDSE vs Single Slit Diffraction Intensity Distribution', relation: 'YDSE: all bright fringes have EQUAL width and intensity 4I₀; Single Slit: intense central peak (I₀), rapid drop in secondary peaks (I₁ ≈ I₀/22, I₂ ≈ I₀/61)', examSignificance: 'Graph comparison identification' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Visible Light Wavelength Range', symbol: 'λ_vis', valueOrFormula: '400 nm (violet) to 700 nm (red)', siUnit: 'nm (10⁻⁹ m)' },
      { quantityOrConstant: 'Fringe Visibility', symbol: 'V', valueOrFormula: '(I_max - I_min) / (I_max + I_min)', siUnit: 'Dimensionless (0 to 1)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Missing wavelengths in YDSE at position y: λ = (y · d) / [ (n - 1/2) · D ].',
        'Three polarizers: P₁ and P₃ crossed (90°). Middle polarizer P₂ at angle θ to P₁. Transmitted intensity: I = (I₀ / 8) · sin²(2θ). Maxima at θ = 45°: I_max = I₀ / 8.',
      ],
      trapsAndPitfalls: [
        'Single slit diffraction MINIMA condition is a·sin θ = n·λ, which LOOKS like double-slit maxima formula! Do not confuse them.',
      ],
    },
  },

  // 22. DUAL NATURE OF MATTER & RADIATION
  {
    id: 'dual-nature-of-matter',
    name: 'Dual Nature of Matter',
    aliases: ['dual nature of matter', 'photoelectric effect', 'de broglie wavelength', 'matter waves', 'einstein photoelectric equation', 'work function', 'photons'],
    category: 'Modern Physics',
    basicDefinitions: [
      { term: 'Photon Energy & Momentum', definition: 'Quantum particle of electromagnetic radiation', symbol: 'E = h·ν = (h·c) / λ,  p = E / c = h / λ', siUnit: 'J / eV, kg·m/s' },
      { term: 'Work Function (Φ₀ / W₀)', definition: 'Minimum energy required to liberate conduction electron from metal surface', symbol: 'Φ₀ = h·ν₀ = (h·c) / λ₀', siUnit: 'eV (1 eV = 1.602 × 10⁻¹⁹ J)' },
      { term: 'Stopping Potential (V₀)', definition: 'Negative retarding collector potential required to reduce photocurrent to zero', symbol: 'e · V₀ = K_max', siUnit: 'V' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Einstein Photoelectric Equation',
        items: [
          { name: 'Photoelectric Energy Balance', formula: 'h·ν = Φ₀ + K_max = h·ν₀ + (1/2)·m_e·v_max² = h·ν₀ + e·V₀', conditionOrMeaning: 'h·c / λ = h·c / λ₀ + e·V₀; Photoelectric emission occurs only if ν ≥ ν₀ or λ ≤ λ₀', siUnit: 'J / eV' },
          { name: 'Stopping Potential vs Frequency', formula: 'V₀ = (h / e) · ν - (Φ₀ / e)', conditionOrMeaning: 'Linear graph of V₀ vs ν: Slope = h / e (universal constant), x-intercept = ν₀ (threshold frequency)', siUnit: 'V' },
          { name: 'Photon Radiation Force & Pressure (Total beam power P)', formula: 'F_absorbed = P / c,  P_rad,abs = I / c (100% absorption);  F_reflected = (2·P) / c,  P_rad,ref = (2·I) / c (100% reflection)', conditionOrMeaning: 'I is radiation intensity in W/m²', siUnit: 'N / N/m²' },
        ],
      },
      {
        sectionTitle: 'de Broglie Matter Wave Formulations',
        items: [
          { name: 'de Broglie Wavelength of Particle', formula: 'λ = h / p = h / (m · v) = h / √(2 · m · K)', conditionOrMeaning: 'K is kinetic energy of particle', siUnit: 'm' },
          { name: 'Electron Accelerated through Potential Difference V', formula: 'λ_e = h / √(2·m_e·e·V) = √(150 / V) Å ≈ (12.27 / √V) Å', conditionOrMeaning: 'V in Volts, λ_e in Angstroms (1 Å = 10⁻¹⁰ m)', siUnit: 'Å (10⁻¹⁰ m)' },
          { name: 'Proton Accelerated through Potential V', formula: 'λ_p = (0.286 / √V) Å', conditionOrMeaning: 'm_p ≈ 1836 · m_e', siUnit: 'Å' },
          { name: 'Alpha Particle Accelerated through Potential V', formula: 'λ_α = (0.101 / √V) Å', conditionOrMeaning: 'm_α = 4·m_p, q_α = 2·e', siUnit: 'Å' },
          { name: 'Thermal Neutron at Absolute Temperature T', formula: 'λ_neutron = h / √(3·m_n·k_B·T) ≈ (25.17 / √T) Å', conditionOrMeaning: 'Average thermal kinetic energy K = (3/2)·k_B·T', siUnit: 'Å' },
        ],
      },
    ],
    specialCases: [
      { title: 'Davisson-Germer Experiment (Electron Diffraction)', condition: 'Scattering of 54 V electron beam on Nickel crystal (d = 0.91 Å) at θ = 50°', resultFormula: 'Bragg Law: 2·d·sin φ = n·λ ⟹ λ_exp = 1.65 Å; de Broglie: λ_th = 12.27 / √54 = 1.67 Å', notes: 'First experimental confirmation of wave nature of matter' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Photoelectric Current vs Anode Potential', relation: 'Saturation current proportional to LIGHT INTENSITY; Stopping potential V₀ independent of intensity, dependent ONLY on frequency ν', examSignificance: 'Definitive disproof of classical wave theory' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Planck Constant × Speed of Light', symbol: 'h · c', valueOrFormula: '12400 eV·Å ≈ 1240 eV·nm', siUnit: 'eV·nm' },
      { quantityOrConstant: 'Electron Mass', symbol: 'm_e', valueOrFormula: '9.109 × 10⁻³¹', siUnit: 'kg' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Quick photon wavelength formula: E(in eV) = 12400 / λ(in Å) = 1240 / λ(in nm).',
        'Number of photons emitted per second by light source of power P: n = P / E = (P · λ) / (h · c).',
      ],
      trapsAndPitfalls: [
        'Photocurrent is directly proportional to INTENSITY of incident light (at fixed frequency above threshold).',
        'Stopping potential and maximum kinetic energy are INDEPENDENT of intensity of light.',
      ],
    },
  },

  // 23. ATOMS (BOHR MODEL & X-RAYS)
  {
    id: 'atoms',
    name: 'Atoms',
    aliases: ['atoms', 'bohr model', 'hydrogen spectrum', 'rydberg formula', 'x-rays', 'moseley law', 'rutherford scattering'],
    category: 'Modern Physics',
    basicDefinitions: [
      { term: 'Bohr Angular Momentum Quantization', definition: 'Orbital angular momentum of electron is integer multiple of reduced Planck constant', symbol: 'L = m_e · v · r = (n · h) / (2π)  (n = 1, 2, 3, ...)', siUnit: 'J·s' },
      { term: 'Bohr Frequency Condition', definition: 'Photon energy emitted/absorbed equals energy difference between stationary quantum states', symbol: 'h·ν = E_initial - E_final', siUnit: 'eV / J' },
      { term: 'Rydberg Formula for Hydrogen-like Atoms (Atomic number Z)', definition: 'Wavenumber of emitted spectral lines', symbol: '1 / λ = R_H · Z² · [ 1 / n₁² - 1 / n₂² ]', siUnit: 'm⁻¹' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Bohr Formulae for Hydrogen-like Ions (H, He⁺, Li²⁺, Be³⁺)',
        items: [
          { name: 'Radius of n-th Bohr Orbit', formula: 'r_n = (ε₀ · n² · h²) / (π · m_e · Z · e²) = r₀ · (n² / Z) ≈ 0.529 · (n² / Z) Å', conditionOrMeaning: 'r₀ = 0.529 Å is first Bohr radius of Hydrogen (n=1, Z=1); r_n ∝ n² / Z', siUnit: 'Å' },
          { name: 'Velocity of Electron in n-th Orbit', formula: 'v_n = (Z · e²) / (2 · ε₀ · n · h) = v₀ · (Z / n) ≈ (c / 137) · (Z / n) ≈ (2.18 × 10⁶) · (Z / n) m/s', conditionOrMeaning: 'v_n ∝ Z / n; Fine structure constant α = e²/(2ε₀hc) ≈ 1/137', siUnit: 'm/s' },
          { name: 'Time Period & Orbital Frequency', formula: 'T_n = (2π·r_n) / v_n ∝ n³ / Z²,  f_n = 1 / T_n ∝ Z² / n³', conditionOrMeaning: 'Orbital current i_n = e · f_n ∝ Z² / n³', siUnit: 's / Hz' },
          { name: 'Total Energy of Electron in n-th Orbit', formula: 'E_n = - (13.6 · Z² / n²) eV = - (R_H · h · c · Z²) / n²', conditionOrMeaning: 'E_n = - K_n = (1/2) · U_n ⟹ U_n = 2 · E_n = - 2 · K_n (Virial Theorem)', siUnit: 'eV' },
          { name: 'Ionization Energy & Binding Energy', formula: 'I.E. = E_∞ - E_n = + (13.6 · Z² / n²) eV', conditionOrMeaning: 'Energy needed to eject electron from state n to infinity', siUnit: 'eV' },
        ],
      },
      {
        sectionTitle: 'Hydrogen Spectral Series',
        items: [
          { name: 'Lyman Series (n₁ = 1, n₂ = 2, 3, 4, ...)', formula: '1 / λ = R_H · [ 1 / 1² - 1 / n₂² ]', conditionOrMeaning: 'ULTRAVIOLET (UV) Region; Shortest wavelength λ_series limit = 1 / R_H ≈ 912 Å', siUnit: 'm⁻¹' },
          { name: 'Balmer Series (n₁ = 2, n₂ = 3, 4, 5, ...)', formula: '1 / λ = R_H · [ 1 / 2² - 1 / n₂² ]', conditionOrMeaning: 'VISIBLE Region (H_α line at n₂ = 3 has λ ≈ 6563 Å red)', siUnit: 'm⁻¹' },
          { name: 'Paschen Series (n₁ = 3, n₂ = 4, 5, ...)', formula: '1 / λ = R_H · [ 1 / 3² - 1 / n₂² ]', conditionOrMeaning: 'Near Infrared (IR) Region', siUnit: 'm⁻¹' },
          { name: 'Brackett Series (n₁ = 4) & Pfund Series (n₁ = 5)', formula: 'Brackett: n₁ = 4;  Pfund: n₁ = 5', conditionOrMeaning: 'Far Infrared (IR) Region', siUnit: 'm⁻¹' },
          { name: 'Total Number of Spectral Lines upon De-excitation from Level n', formula: 'N_lines = n · (n - 1) / 2 = Δn · (Δn + 1) / 2 (from level n₂ to n₁)', conditionOrMeaning: 'All possible radiative quantum transition cascades', siUnit: 'Integer count' },
        ],
      },
      {
        sectionTitle: 'X-Rays & Moseley Law',
        items: [
          { name: 'Cutoff / Duane-Hunt Minimum Wavelength of Continuous X-Rays', formula: 'λ_min = (h · c) / (e · V_acc) = 12400 / V_acc (in Volts) Å', conditionOrMeaning: 'Independent of target anode material; depends ONLY on accelerating voltage V_acc', siUnit: 'Å' },
          { name: 'Moseley Law for Characteristic X-Rays', formula: '√ν = a · (Z - b)', conditionOrMeaning: 'For K_α line: b = 1 (screening constant); √ν = a · (Z - 1) ⟹ 1/λ = R_H · (3/4) · (Z - 1)²', siUnit: 'Hz^(1/2)' },
        ],
      },
    ],
    specialCases: [
      { title: 'Finite Nuclear Mass Correction (Reduced Mass μ)', condition: 'Nucleus of finite mass M (not infinite)', resultFormula: 'μ = (m_e · M) / (m_e + M) ⟹ R_actual = R_∞ · (μ / m_e)', notes: 'Positronium atom (M = m_e): μ = m_e/2 ⟹ all energy levels halved (E₁ = -6.8 eV)' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Moseley Graph (√ν vs Z)', relation: 'Straight line with positive slope and positive x-intercept equal to screening constant b', examSignificance: 'Proved atomic number Z (not atomic weight) is fundamental basis of Periodic Table' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Rydberg Constant', symbol: 'R_H', valueOrFormula: '1.09737 × 10⁷ m⁻¹ ≈ 1.097 × 10⁷', siUnit: 'm⁻¹' },
      { quantityOrConstant: 'Rydberg Energy (R_H · h · c)', symbol: 'R_E', valueOrFormula: '13.6', siUnit: 'eV' },
      { quantityOrConstant: 'First Bohr Radius', symbol: 'r₀', valueOrFormula: '0.529', siUnit: 'Å (10⁻¹⁰ m)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Magnetic field at nucleus due to orbital electron: B_n ∝ Z³ / n⁵.',
        'Wavelength ratio of first line of Lyman to series limit: λ_first / λ_limit = (4/3) / 1 = 4 / 3.',
      ],
      trapsAndPitfalls: [
        'Balmer series is the ONLY series in Hydrogen spectrum lying in the VISIBLE spectrum range.',
        'Continuous X-ray cutoff λ_min depends ONLY on target tube voltage V, whereas Characteristic X-ray peaks depend solely on target atomic number Z.',
      ],
    },
  },

  // 24. NUCLEI & RADIOACTIVITY
  {
    id: 'nuclei',
    name: 'Nuclei',
    aliases: ['nuclei', 'nuclear physics', 'radioactivity', 'mass defect', 'binding energy', 'half life', 'nuclear fission', 'nuclear fusion'],
    category: 'Modern Physics',
    basicDefinitions: [
      { term: 'Nuclear Radius', definition: 'Empirical nuclear size scaling with atomic mass number A', symbol: 'R = R₀ · A^(1/3)  (R₀ ≈ 1.2 × 10⁻¹⁵ m = 1.2 fm)', siUnit: 'fm (Femtometer = 10⁻¹⁵ m)' },
      { term: 'Mass Defect (Δm)', definition: 'Difference between total constituent nucleon mass and actual bound nuclear mass', symbol: 'Δm = [ Z·m_p + (A - Z)·m_n ] - M_nucleus', siUnit: 'a.m.u. (u) or kg' },
      { term: 'Nuclear Binding Energy', definition: 'Energy equivalent of mass defect via Einstein E = mc²', symbol: 'B.E. = Δm(in u) × 931.5 MeV', siUnit: 'MeV (1 u = 931.5 MeV/c²)' },
      { term: 'Radioactive Decay Law', definition: 'Decay rate directly proportional to number of active undecayed nuclei N(t)', symbol: '- dN / dt = A(t) = λ · N(t)', siUnit: 'Bq (Becquerel = 1 decay/s)' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Radioactive Decay Kinetics',
        items: [
          { name: 'Exponential Decay Formula', formula: 'N(t) = N₀ · e^(-λ·t) = N₀ · (1 / 2)^(t / T_half)', conditionOrMeaning: 'N₀ is initial radioactive nuclei population, λ is decay constant', siUnit: 'Count' },
          { name: 'Half-Life (T_half)', formula: 'T_half = ln 2 / λ = (0.693) / λ', conditionOrMeaning: 'Time required for half of radioactive sample to disintegrate', siUnit: 's' },
          { name: 'Mean / Average Life (τ_mean)', formula: 'τ_mean = 1 / λ = T_half / ln 2 ≈ 1.44 · T_half', conditionOrMeaning: 'Average survival duration of radioactive nucleus', siUnit: 's' },
          { name: 'Activity of Radioactive Sample (A)', formula: 'A(t) = λ · N(t) = A₀ · e^(-λ·t) = A₀ · (1 / 2)^(t / T_half)', conditionOrMeaning: '1 Curie (Ci) = 3.7 × 10¹⁰ Bq; 1 Rutherford (Rd) = 10⁶ Bq', siUnit: 'Bq' },
          { name: 'Parallel Radioactive Decay (Nuclide decaying into two channels with λ₁ and λ₂)', formula: 'λ_eff = λ₁ + λ₂ ⟹ 1 / T_eff = 1 / T₁ + 1 / T₂ ⟹ T_eff = (T₁ · T₂) / (T₁ + T₂)', conditionOrMeaning: 'Branching ratios: Fraction into channel 1 = λ₁ / (λ₁ + λ₂)', siUnit: 's' },
        ],
      },
      {
        sectionTitle: 'Nuclear Reactions & Q-Value',
        items: [
          { name: 'Q-Value of Nuclear Reaction (A + a ⟶ B + b)', formula: 'Q = [ (m_A + m_a) - (m_B + m_b) ] · c² = (Δm_reactants - Δm_products) × 931.5 MeV', conditionOrMeaning: 'Q > 0: Exothermic (energy released); Q < 0: Endothermic (energy absorbed)', siUnit: 'MeV' },
          { name: 'Q-Value in Terms of Binding Energies', formula: 'Q = B.E._products - B.E._reactants', conditionOrMeaning: 'Valid because higher binding energy means more tightly bound/stable state', siUnit: 'MeV' },
          { name: 'Alpha Decay Kinetic Energy Distribution', formula: 'K_α = Q · [ (A - 4) / A ]', conditionOrMeaning: 'A is mass number of parent nucleus (Conservation of momentum)', siUnit: 'MeV' },
        ],
      },
    ],
    specialCases: [
      { title: 'Constant Nuclear Density', condition: 'All atomic nuclei regardless of element', resultFormula: 'ρ_nuclear = M / V = (A · m_nucleon) / ((4/3)·π·R₀³·A) ≈ 2.3 × 10¹⁷ kg/m³ = constant', notes: 'Nuclear matter density is completely independent of mass number A' },
      { title: 'Beta-minus vs Beta-plus Decay', condition: 'Weak interaction nucleon conversion', resultFormula: 'β⁻: n ⟶ p + e⁻ + ν̄_e (Antineutrino);  β⁺: p ⟶ n + e⁺ + ν_e (Neutrino)', notes: 'Continuous beta spectrum due to sharing of energy with neutrino' },
    ],
    keyRelationsAndGraphs: [
      { title: 'Binding Energy per Nucleon (B.E./A) Curve', relation: 'Peaks at Iron-56 (⁵⁶Fe ≈ 8.8 MeV/nucleon); drops to ~7.6 MeV for Uranium (Fission yields energy) and ~1.1 MeV for Deuterium (Fusion yields energy)', examSignificance: 'Fundamental basis for nuclear fission and fusion energetics' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Atomic Mass Unit', symbol: '1 u (a.m.u.)', valueOrFormula: '1.66054 × 10⁻²⁷ kg = 931.5 MeV/c²', siUnit: 'kg / MeV' },
      { quantityOrConstant: 'Mass of Proton / Neutron', symbol: 'm_p, m_n', valueOrFormula: 'm_p = 1.007276 u,  m_n = 1.008665 u', siUnit: 'u' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Fraction remaining after n half-lives: N / N₀ = (1/2)^n = (1/2)^(t / T_half). Fraction decayed = 1 - (1/2)^n.',
        'Successive decay equilibrium (A ⟶ B ⟶ C stable): N_A · λ_A = N_B · λ_B (Secular radioactive equilibrium).',
      ],
      trapsAndPitfalls: [
        'Nuclear density is CONSTANT for all nuclei (~10¹⁷ kg/m³), but nuclear radius scales as A^(1/3).',
        'In beta decay, emitted electron does NOT come from atomic shells; it is created inside the nucleus during neutron conversion.',
      ],
    },
  },

  // 25. SEMICONDUCTOR ELECTRONICS
  {
    id: 'semiconductor-electronics',
    name: 'Semiconductor Electronics',
    aliases: ['semiconductor electronics', 'semiconductors', 'pn junction', 'diodes', 'zeners', 'logic gates', 'transistors'],
    category: 'Modern Physics',
    basicDefinitions: [
      { term: 'Intrinsic Semiconductor Mass Action Law', definition: 'Product of electron and hole concentrations at thermal equilibrium', symbol: 'n_e · n_h = n_i²', siUnit: 'm⁻⁶' },
      { term: 'Electrical Conductivity of Semiconductor', definition: 'Total conductivity from both electron and hole conduction bands', symbol: 'σ = e · (n_e · μ_e + n_h · μ_h)', siUnit: 'S/m' },
      { term: 'Depletion Layer', definition: 'Barrier region of uncompensated immobile donor/acceptor ions at p-n metallurgical junction', symbol: 'V_barrier ≈ 0.7 V (Si), 0.3 V (Ge)', siUnit: 'V' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Semiconductor Doping & Diodes',
        items: [
          { name: 'n-Type Extrinsic Semiconductor', formula: 'n_e ≈ N_D ≫ n_h,  n_h = n_i² / N_D', conditionOrMeaning: 'Doped with pentavalent donors (P, As, Sb); majority electrons', siUnit: 'm⁻³' },
          { name: 'p-Type Extrinsic Semiconductor', formula: 'n_h ≈ N_A ≫ n_e,  n_e = n_i² / N_A', conditionOrMeaning: 'Doped with trivalent acceptors (B, Al, In); majority holes', siUnit: 'm⁻³' },
          { name: 'Half-Wave Rectifier Efficiency & Ripple', formula: 'η_max = 40.6%,  f_ripple = f_input,  V_dc = V₀ / π', conditionOrMeaning: 'One diode circuit; PIV = V₀', siUnit: 'Dimensionless / Hz / V' },
          { name: 'Full-Wave Center-Tap / Bridge Rectifier', formula: 'η_max = 81.2%,  f_ripple = 2 · f_input,  V_dc = (2·V₀) / π', conditionOrMeaning: 'Bridge: PIV = V₀; Center-Tap: PIV = 2·V₀', siUnit: 'Dimensionless / Hz / V' },
          { name: 'Zener Diode Voltage Regulator', formula: 'V_out = V_Z = constant,  i_in = i_Z + i_L = (V_in - V_Z) / R_series', conditionOrMeaning: 'Operates in reverse breakdown avalanche/Zener regime', siUnit: 'V / A' },
        ],
      },
      {
        sectionTitle: 'Logic Gates & Boolean Algebra',
        items: [
          { name: 'De Morgan First Law', formula: '(A + B)̄ = Ā · B̄', conditionOrMeaning: 'NOR gate equivalent to bubbled AND gate', siUnit: 'Boolean Logic' },
          { name: 'De Morgan Second Law', formula: '(A · B)̄ = Ā + B̄', conditionOrMeaning: 'NAND gate equivalent to bubbled OR gate', siUnit: 'Boolean Logic' },
          { name: 'Universal Logic Gates', formula: 'NAND and NOR gates can implement ANY Boolean function', conditionOrMeaning: 'NAND: Y = (A·B)̄;  NOR: Y = (A+B)̄;  XOR: Y = A·B̄ + Ā·B;  XNOR: Y = A·B + Ā·B̄', siUnit: 'Logic outputs' },
        ],
      },
    ],
    specialCases: [
      { title: 'Temperature Coefficient of Semiconductor Resistance', condition: 'Intrinsic semiconductor heated (T increases)', resultFormula: 'n_i increases exponentially ⟹ Resistance R drops rapidly (Negative Temperature Coefficient: α < 0)', notes: 'Metals have α > 0 (resistance rises with T)' },
    ],
    keyRelationsAndGraphs: [
      { title: 'p-n Junction Diode I-V Characteristic', relation: 'Forward bias: exponential current rise above knee voltage (0.7 V for Si); Reverse bias: tiny reverse saturation current I₀ until sharp Zener breakdown voltage V_Z', examSignificance: 'Standard JEE IV diagram questions' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Silicon Bandgap Energy', symbol: 'E_g(Si)', valueOrFormula: '1.1', siUnit: 'eV' },
      { quantityOrConstant: 'Germanium Bandgap Energy', symbol: 'E_g(Ge)', valueOrFormula: '0.7', siUnit: 'eV' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'Zener diode maintain constant voltage V_Z across load R_L as long as i_Z > i_Z,min.',
        'Number of 2-input NAND gates needed: NOT = 1, AND = 2, OR = 3, NOR = 4, XOR = 4, XNOR = 5.',
      ],
      trapsAndPitfalls: [
        'Both n-type and p-type semiconductors are ELECTRICALLY NEUTRAL (total positive charge = total negative charge).',
        'In forward bias, depletion layer width DECREASES; in reverse bias, depletion layer width INCREASES.',
      ],
    },
  },

  // 26. EXPERIMENTAL PHYSICS & MEASURING INSTRUMENTS
  {
    id: 'experimental-physics',
    name: 'Experimental Physics',
    aliases: ['experimental physics', 'vernier caliper', 'screw gauge', 'resonance tube', 'meter bridge experiment', 'focal length measurement', 'error analysis'],
    category: 'General Physics & Instruments',
    basicDefinitions: [
      { term: 'Least Count (LC)', definition: 'Smallest value that can be measured directly by an instrument', symbol: 'LC = Value of 1 Main Scale Div / Number of Vernier Divs', siUnit: 'mm / cm' },
      { term: 'Zero Error (ZE)', definition: 'Reading shown by instrument when measuring jaws/studs are in direct contact', symbol: 'Corrected Reading = Observed Reading - (± Zero Error)', siUnit: 'mm / cm' },
    ],
    coreFormulas: [
      {
        sectionTitle: 'Vernier Calipers & Screw Gauge',
        items: [
          { name: 'Vernier Caliper Least Count', formula: 'LC = 1 MSD - 1 VSD = 1 MSD · [ 1 - (n / m) ]', conditionOrMeaning: 'If n VSD = m MSD (Standard: 10 VSD = 9 MSD with 1 MSD = 1 mm ⟹ LC = 0.1 mm = 0.01 cm)', siUnit: 'mm' },
          { name: 'Total Reading on Vernier Caliper', formula: 'Reading = MSR + (VSR × LC) - (Zero Error)', conditionOrMeaning: 'MSR is Main Scale Reading, VSR is coinciding vernier division', siUnit: 'mm' },
          { name: 'Screw Gauge / Micrometer Pitch', formula: 'Pitch = (Distance moved on linear main scale) / (Number of complete rotations)', conditionOrMeaning: 'Standard pitch = 1 mm or 0.5 mm', siUnit: 'mm' },
          { name: 'Screw Gauge Least Count', formula: 'LC = Pitch / (Total number of circular scale divisions)', conditionOrMeaning: 'Standard: Pitch = 1 mm, 100 circular divs ⟹ LC = 1 mm / 100 = 0.01 mm = 0.001 cm', siUnit: 'mm' },
          { name: 'Total Reading on Screw Gauge', formula: 'Reading = MSR + (CSR × LC) - (Zero Error)', conditionOrMeaning: 'CSR is Circular Scale Reading coinciding with reference line', siUnit: 'mm' },
        ],
      },
      {
        sectionTitle: 'Laboratory Experiments Calculations',
        items: [
          { name: 'Resonance Tube (End Correction e and Speed of Sound v)', formula: 'v = 2 · f · (l₂ - l₁),  End correction e = (l₂ - 3·l₁) / 2 = 0.6 · r', conditionOrMeaning: 'l₁ and l₂ are first and second resonance water column lengths', siUnit: 'm/s / m' },
          { name: 'Simple Pendulum g Determination', formula: 'g = (4 · π² · L) / T²,  (Δg / g) = (ΔL / L) + 2 · (ΔT / T) = (ΔL / L) + 2 · (Δt / t)', conditionOrMeaning: 't is time for n oscillations (T = t / n, ΔT = Δt / n)', siUnit: 'm/s²' },
          { name: 'Searle Apparatus Young Modulus Y', formula: 'Y = (M · g · L) / (π · r² · l)', conditionOrMeaning: 'L is wire length, r is radius (via screw gauge), l is elongation (via spherometer/micrometer)', siUnit: 'N/m²' },
          { name: 'Meter Bridge Resistance by Null Method', formula: 'X = R · [ (100 - l) / l ]', conditionOrMeaning: 'l is balance point from zero end; percentage error ΔX/X minimized when l ≈ 50 cm', siUnit: 'Ω' },
          { name: 'Focal Length of Convex Lens (u-v Method)', formula: 'f = (u · v) / (u + v),  1 / f = 1 / v - 1 / u', conditionOrMeaning: 'Graph of 1/v vs 1/u is straight line with slope -1 and intercepts 1/f', siUnit: 'm' },
        ],
      },
    ],
    specialCases: [
      { title: 'Zero Error Correction Rule', condition: 'Positive Zero Error (zero of vernier/circular scale ahead of main zero) vs Negative Zero Error (behind)', resultFormula: 'Positive Zero Error: SUBTRACT from observed reading;  Negative Zero Error: ADD to observed reading', notes: 'Corrected = Observed - (± ZE)' },
    ],
    keyRelationsAndGraphs: [
      { title: 'u-v Hyperbolic Curve for Convex Lens', relation: 'Symmetric hyperbola with minimum separation between object and real image D_min = 4·f when u = -2f, v = +2f', examSignificance: 'Direct experimental graphical analysis' },
    ],
    unitsAndConstants: [
      { quantityOrConstant: 'Standard Spherometer Least Count', symbol: 'LC_sphero', valueOrFormula: 'Pitch / N_circular_divs', siUnit: 'mm' },
      { quantityOrConstant: 'Radius of Curvature via Spherometer', symbol: 'R', valueOrFormula: 'l² / (6h) + h / 2', siUnit: 'mm (l is mean leg distance, h is sagitta height)' },
    ],
    jeeQuickRevision: {
      shortcuts: [
        'To minimize percentage measurement error in meter bridge, balance point should lie in the middle third (between 40 cm and 60 cm).',
        'In traveling microscope: LC = 1 MSD / n (typically 0.001 cm). Used for refractive index of glass slab μ = Real thickness / Apparent thickness.',
      ],
      trapsAndPitfalls: [
        'Always check for zero error BEFORE recording experimental readings.',
        'Backlash error in screw gauge: always rotate circular cap in ONE direction only while taking final reading.',
      ],
    },
  },
];

