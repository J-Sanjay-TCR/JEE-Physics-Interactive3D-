import { CoachingInstituteModule, SpecialCase } from '../types';

export const COACHING_MODULES: Record<string, CoachingInstituteModule> = {
  'projectile-motion': {
    chapterCode: 'PHY-11-KIN-02',
    synopsis:
      'Two-dimensional motion under constant gravitational acceleration $g$. Orthogonal decomposition along Cartesian axes yields independent 1D kinematic equations: uniform velocity along $x$ ($a_x = 0$) and uniformly accelerated motion along $y$ ($a_y = -g$). The trajectory is a parabolic curve.',
    subtopics: [
      {
        id: 'kin-sub-01',
        title: '1. Ground-to-Ground Oblique Projection',
        summary:
          'Symmetric flight starting and terminating at the same vertical datum level $y = 0$. Parabola apex is at $t = T/2$ where vertical velocity $v_y = 0$.',
        keyPoints: [
          'Time of flight: $T = \\frac{2u\\sin\\theta}{g} = \\frac{2u_y}{g}$',
          'Maximum height attained: $H = \\frac{u^2\\sin^2\\theta}{2g} = \\frac{u_y^2}{2g}$',
          'Horizontal Range: $R = \\frac{u^2\\sin 2\\theta}{g} = \\frac{2u_x u_y}{g}$',
          'Trajectory equation: $y = x\\tan\\theta - \\frac{g x^2}{2u^2\\cos^2\\theta} = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)$',
        ],
        derivationHighlight:
          'Eliminating $t = \\frac{x}{u\\cos\\theta}$ from $y = u\\sin\\theta\\cdot t - \\frac{1}{2}gt^2$ yields $y = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)$.',
        shortcuts: [
          'Relation between $H$ and $R$: $R = 4H\\cot\\theta$ or $\\tan\\theta = \\frac{4H}{R}$',
          'At apex, kinetic energy is minimum: $K_{\\text{apex}} = K_0\\cos^2\\theta$',
          'Radius of curvature at apex: $\\rho_{\\text{top}} = \\frac{u^2\\cos^2\\theta}{g}$',
        ],
        cases: [
          {
            id: 'proj-case-45deg',
            title: 'Maximum Range Angle (θ = 45°)',
            categoryTag: 'Special Case',
            conditionLatex: '\\theta = 45^\\circ',
            description:
              'At $\\theta = 45^\\circ$, $\\sin 2\\theta = 1$, giving the global maximum horizontal range on flat ground. Maximum height is exactly one-quarter of the maximum range.',
            formulaLatex: 'R_{\\max} = \\frac{u^2}{g}, \\quad H = \\frac{R_{\\max}}{4} = \\frac{u^2}{4g}',
            physicalSignificance:
              'Equal partitioning between horizontal momentum $u_x = u/\\sqrt{2}$ and vertical impulse $u_y = u/\\sqrt{2}$.',
            jeeTrapAlert:
              'Only valid for flat ground projection. On an inclined plane or when projecting from an elevated tower, $\\theta_{\\text{opt}} \\ne 45^\\circ$.',
            parameterPreset: { v0: 30, angle: 45, g: 9.8, h0: 0 },
          },
          {
            id: 'proj-case-comp-angles',
            title: 'Complementary Angles of Projection (θ and 90° - θ)',
            categoryTag: 'JEE Main',
            conditionLatex: '\\theta_1 + \\theta_2 = 90^\\circ',
            description:
              'Two complementary launch angles with the same initial speed $u$ achieve the identical horizontal range $R_1 = R_2$, but with different maximum heights $H_1, H_2$ and times of flight $T_1, T_2$.',
            formulaLatex: 'R = 4\\sqrt{H_1 H_2}, \\quad T_1 T_2 = \\frac{2R}{g}, \\quad H_1 + H_2 = \\frac{u^2}{2g}',
            physicalSignificance:
              'Demonstrates symmetry in $\\sin 2\\theta = \\sin(180^\\circ - 2\\theta) = \\sin(2(90^\\circ - \\theta))$.',
            jeeTrapAlert:
              'The product of times of flight $T_1 T_2 = 2R/g$ is directly proportional to range $R$ and independent of launch angle.',
            parameterPreset: { v0: 32, angle: 60, g: 9.8, h0: 0 },
          },
          {
            id: 'proj-case-tower-elevation',
            title: 'Horizontal Projection from an Elevated Tower of Height h',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\theta = 0^\\circ, \\quad y(0) = h',
            description:
              'Initial vertical velocity $u_y = 0$. Pure horizontal launch converts gravitational potential energy into vertical downward kinetic velocity $v_y = \\sqrt{2gh}$.',
            formulaLatex: 'T = \\sqrt{\\frac{2h}{g}}, \\quad R = u\\sqrt{\\frac{2h}{g}}, \\quad v_{\\text{strike}} = \\sqrt{u^2 + 2gh}',
            physicalSignificance:
              'Impact angle with ground: $\\tan\\beta = \\frac{v_y}{v_x} = \\frac{\\sqrt{2gh}}{u}$.',
            jeeTrapAlert:
              'Time of flight is purely governed by vertical height $h$ and is strictly independent of horizontal launch speed $u$.',
            parameterPreset: { v0: 25, angle: 0, g: 9.8, h0: 20 },
          },
          {
            id: 'proj-case-max-range-tower',
            title: 'Optimal Launch Angle from an Elevated Cliff/Tower',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\tan\\theta_{\\text{opt}} = \\frac{u}{\\sqrt{u^2 + 2gh}}',
            description:
              'When launching from height $h$, maximum range occurs at an angle strictly less than $45^\\circ$ because extra vertical drop time provides longer horizontal travel.',
            formulaLatex: 'R_{\\max} = \\frac{u}{g}\\sqrt{u^2 + 2gh}, \\quad \\theta_{\\text{opt}} = \\frac{1}{2}\\cos^{-1}\\left(\\frac{gh}{u^2 + gh}\\right)',
            physicalSignificance:
              'Derived by maximizing $R(\\theta) = u\\cos\\theta\\left(\\frac{u\\sin\\theta + \\sqrt{u^2\\sin^2\\theta + 2gh}}{g}\\right)$.',
            parameterPreset: { v0: 25, angle: 35, g: 9.8, h0: 15 },
          },
        ],
      },
      {
        id: 'kin-sub-02',
        title: '2. Projectile on an Inclined Plane',
        summary:
          'Rotating coordinate axes along the incline ($x\'$-axis) and perpendicular to incline ($y\'$-axis) with effective accelerations $a_x = -g\\sin\\alpha$ and $a_y = -g\\cos\\alpha$.',
        keyPoints: [
          'Up the incline time of flight: $T_{\\text{up}} = \\frac{2u\\sin(\\theta - \\alpha)}{g\\cos\\alpha}$',
          'Range up the incline: $R_{\\text{up}} = \\frac{u^2}{g\\cos^2\\alpha}\\left[\\sin(2\\theta - \\alpha) - \\sin\\alpha\\right]$',
          'Maximum range up incline: $R_{\\text{max, up}} = \\frac{u^2}{g(1 + \\sin\\alpha)}$ at angle $\\theta = 45^\\circ + \\frac{\\alpha}{2}$',
          'Maximum range down incline: $R_{\\text{max, down}} = \\frac{u^2}{g(1 - \\sin\\alpha)}$ at angle $\\theta = 45^\\circ - \\frac{\\alpha}{2}$',
        ],
        shortcuts: [
          'Condition to strike the incline perpendicularly: $\\tan(\\theta - \\alpha) = \\frac{1}{2\\tan\\alpha}$ or $\\cot\\alpha = 2\\tan(\\theta - \\alpha)$.',
        ],
        cases: [
          {
            id: 'proj-case-perp-strike',
            title: 'Perpendicular Collision with Incline',
            categoryTag: 'JEE Advanced',
            conditionLatex: 'v_x\' = 0 \\implies u\\cos(\\theta - \\alpha) - g\\sin\\alpha\\cdot T = 0',
            description:
              'The projectile strikes the inclined plane at an exact $90^\\circ$ normal angle when its parallel velocity component diminishes to zero precisely at contact.',
            formulaLatex: '\\tan(\\theta - \\alpha) = \\frac{\\cot\\alpha}{2}',
            physicalSignificance:
              'Rebound angle is along the normal with coefficient of restitution $e$.',
            jeeTrapAlert:
              'Do not confuse the launch angle $\\theta$ with the angle relative to the incline $(\\theta - \\alpha)$.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Horizontal Ground vs Inclined Plane Projectile Dynamics',
        headers: ['Physical Parameter', 'Flat Ground ($\\alpha = 0$)', 'Up the Incline ($\\alpha$)', 'Down the Incline ($\\alpha$)'],
        rows: [
          ['Time of Flight $T$', '$\\frac{2u\\sin\\theta}{g}$', '$\\frac{2u\\sin(\\theta - \\alpha)}{g\\cos\\alpha}$', '$\\frac{2u\\sin(\\theta + \\alpha)}{g\\cos\\alpha}$'],
          ['Optimal Launch Angle $\\theta_{\\max}$', '$\\theta = 45^\\circ$', '$\\theta = 45^\\circ + \\frac{\\alpha}{2}$', '$\\theta = 45^\\circ - \\frac{\\alpha}{2}$'],
          ['Maximum Range Formula $R_{\\max}$', '$\\frac{u^2}{g}$', '$\\frac{u^2}{g(1 + \\sin\\alpha)}$', '$\\frac{u^2}{g(1 - \\sin\\alpha)}$'],
          ['Effective Normal Accel $a_y\'$', '$-g$', '$-g\\cos\\alpha$', '$-g\\cos\\alpha$'],
          ['Effective Parallel Accel $a_x\'$', '$0$', '$-g\\sin\\alpha$', '$+g\\sin\\alpha$'],
        ],
      },
    ],
    standardApproximations: [
      {
        condition: 'Small Height Deviation (y << R_E)',
        exactFormula: 'g(y) = g_0 (1 + y/R_E)^{-2}',
        approxFormula: 'g = \\text{constant} = 9.8\\text{ m/s}^2',
        validityRange: 'Height h < 5 km (< 0.1% error)',
      },
      {
        condition: 'Neglecting Air Resistance (Drag Force F_D << mg)',
        exactFormula: 'm\\frac{d\\mathbf{v}}{dt} = m\\mathbf{g} - \\frac{1}{2}C_D\\rho A v \\mathbf{v}',
        approxFormula: 'm\\frac{d\\mathbf{v}}{dt} = m\\mathbf{g}',
        validityRange: 'Heavy dense projectiles with low velocities v < 40 m/s',
      },
    ],
    frequentlyTestedTricks: [
      'Velocity vector is perpendicular to initial velocity at time: t = u / (g sin θ).',
      'Change in momentum between launch and landing: Δp = m(2u sin θ) downward = mg T.',
      'Average velocity between launch and landing: v_avg = u cos θ (strictly horizontal).',
      'Minimum velocity required to clear two vertical walls of height h separated by distance d: u_min = √(g(d + √(d² + 4h²))).',
    ],
  },

  'inclined-plane-friction': {
    chapterCode: 'PHY-11-NLM-03',
    synopsis:
      'Analysis of contact forces, normal reaction $N = mg\\cos\\theta$, static friction $f_s \\le \\mu_s N$, and kinetic friction $f_k = \\mu_k N$. Covers limiting equilibrium, angle of repose, block-on-block relative slipping, and minimum force for equilibrium.',
    subtopics: [
      {
        id: 'fric-sub-01',
        title: '1. Limiting Equilibrium & Angle of Repose',
        summary:
          'When inclination angle $\\theta$ is varied, the threshold angle $\\theta = \\phi = \\tan^{-1}\\mu_s$ defines the transition between rest and sliding.',
        keyPoints: [
          'Normal reaction: $N = mg\\cos\\theta$',
          'Gravitational downhill component: $F_{\\parallel} = mg\\sin\\theta$',
          'Limiting static friction: $f_{s,\\max} = \\mu_s mg\\cos\\theta$',
          'Angle of friction & repose: $\\tan\\lambda = \\mu_s \\implies \\theta_r = \\lambda = \\tan^{-1}\\mu_s$',
        ],
        cases: [
          {
            id: 'fric-case-repose',
            title: 'Angle of Repose Threshold (θ = tan⁻¹ μ_s)',
            categoryTag: 'Boundary Condition',
            conditionLatex: '\\tan\\theta = \\mu_s',
            description:
              'At this critical angle, static friction reaches its absolute ceiling $f_s = \\mu_s N = mg\\sin\\theta$. Net force is exactly zero.',
            formulaLatex: 'a = 0, \\quad f_s = \\mu_s mg\\cos\\theta = mg\\sin\\theta',
            physicalSignificance:
              'If $\\theta < \\tan^{-1}\\mu_s$, block remains stationary ($f_s = mg\\sin\\theta$). If $\\theta > \\tan^{-1}\\mu_s$, block accelerates down.',
            parameterPreset: { m: 5, theta: 26.56, mu_s: 0.5, mu_k: 0.4, F_ext: 0 },
          },
          {
            id: 'fric-case-acc-down',
            title: 'Accelerated Motion Down the Incline (θ > tan⁻¹ μ_s)',
            categoryTag: 'JEE Main',
            conditionLatex: '\\tan\\theta > \\mu_s',
            description:
              'Static friction breaks down and kinetic friction opposes motion up the incline.',
            formulaLatex: 'a_{\\text{down}} = g(\\sin\\theta - \\mu_k\\cos\\theta)',
            physicalSignificance:
              'Velocity at bottom of incline of length L: $v = \\sqrt{2gL(\\sin\\theta - \\mu_k\\cos\\theta)}$.',
            parameterPreset: { m: 5, theta: 45, mu_s: 0.4, mu_k: 0.3, F_ext: 0 },
          },
          {
            id: 'fric-case-up-retard',
            title: 'Deceleration When Projected Upward along Incline',
            categoryTag: 'JEE Main',
            conditionLatex: 'v > 0 \\text{ (upward)}',
            description:
              'Both gravity and kinetic friction act downward along the incline, producing maximum deceleration.',
            formulaLatex: 'a_{\\text{up}} = g(\\sin\\theta + \\mu_k\\cos\\theta), \\quad t_{\\text{up}} < t_{\\text{down}}',
            physicalSignificance:
              'Time to ascend is strictly shorter than time to descend due to non-conservative energy dissipation by friction.',
            jeeTrapAlert:
              'Ratio of times: $\\frac{t_{\\text{down}}}{t_{\\text{up}}} = \\sqrt{\\frac{\\sin\\theta + \\mu_k\\cos\\theta}{\\sin\\theta - \\mu_k\\cos\\theta}} > 1$.',
          },
          {
            id: 'fric-case-min-force',
            title: 'Minimum External Force to Prevent/Cause Slipping',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\theta_{\\text{force}} = \\lambda = \\tan^{-1}\\mu_s',
            description:
              'The minimum force needed to pull a block on a rough horizontal surface acts at an angle $\\theta = \\lambda$ above horizontal.',
            formulaLatex: 'F_{\\min} = \\frac{\\mu_s mg}{\\sqrt{1 + \\mu_s^2}} = mg\\sin\\lambda',
            physicalSignificance:
              'Normal force is partially relieved by the vertical component $F\\sin\\theta$, optimizing friction reduction against horizontal pulling power.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Smooth Plane vs Rough Incline Dynamics Matrix',
        headers: ['Physical Parameter', 'Smooth Incline ($\\mu = 0$)', 'Rough Incline ($\\mu > 0$) Downward', 'Rough Incline ($\\mu > 0$) Upward'],
        rows: [
          ['Acceleration $a$', '$g\\sin\\theta$', '$g(\\sin\\theta - \\mu_k\\cos\\theta)$', '$g(\\sin\\theta + \\mu_k\\cos\\theta)$'],
          ['Velocity at Base $v$', '$\\sqrt{2gL\\sin\\theta}$', '$\\sqrt{2gL(\\sin\\theta - \\mu_k\\cos\\theta)}$', 'Zero ($v=0$ at turning point)'],
          ['Time of Motion $t$', '$\\sqrt{\\frac{2L}{g\\sin\\theta}}$', '$\\sqrt{\\frac{2L}{g(\\sin\\theta - \\mu_k\\cos\\theta)}}$', '$\\sqrt{\\frac{2L}{g(\\sin\\theta + \\mu_k\\cos\\theta)}}$'],
          ['Mechanical Energy Status', 'Conserved ($\\Delta E = 0$)', 'Dissipated ($W_f = -\\mu_k N L$)', 'Dissipated ($W_f = -\\mu_k N L$)'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'If time taken to slide down a rough incline is n times that for a smooth incline of same length, then: μ = tan θ (1 - 1/n²).',
      'Maximum angle for which a ladder of length L leaning against a smooth vertical wall doesn\'t slip on rough floor: tan θ = 1 / (2μ).',
      'Work done against friction along any path connecting (x1, y1) to (x2, y2) on a rough hill: W_f = μ mg (x2 - x1) [proportional only to horizontal displacement!].',
    ],
  },

  'youngs-double-slit': {
    chapterCode: 'PHY-12-WAV-01',
    synopsis:
      'Young’s Double Slit Experiment (YDSE) is the foundation of wave optics. Two coherent secondary wavelets from slits $S_1$ and $S_2$ separated by distance $d$ interfere on a screen at distance $D$, establishing path difference $\\Delta x = d\\sin\\theta \\approx \\frac{yd}{D}$ and equidistant fringe spacing $\\beta = \\frac{\\lambda D}{d}$.',
    subtopics: [
      {
        id: 'ydse-sub-01',
        title: '1. Interference Pattern & Intensity Distribution',
        summary:
          'Constructive interference occurs at path differences $\\Delta x = n\\lambda$, while destructive cancellation occurs at $\\Delta x = (n - 1/2)\\lambda$. Resultant intensity varies as $I(y) = 4I_0\\cos^2\\left(\\frac{\\pi d y}{\\lambda D}\\right)$.',
        keyPoints: [
          'Fringe width: $\\beta = \\frac{\\lambda D}{d}$',
          'Angular fringe width: $\\theta_f = \\frac{\\beta}{D} = \\frac{\\lambda}{d}$ (strictly independent of $D$)',
          'Position of $n$-th bright fringe: $y_n = n\\frac{\\lambda D}{d} = n\\beta$',
          'Position of $n$-th dark fringe: $y_n = \\left(n - \\frac{1}{2}\\right)\\frac{\\lambda D}{d} = \\left(n - \\frac{1}{2}\\right)\\beta$',
        ],
        cases: [
          {
            id: 'ydse-case-medium',
            title: 'Apparatus Submerged in Medium (Refractive Index μ)',
            categoryTag: 'JEE Main',
            conditionLatex: '\\lambda\' = \\frac{\\lambda}{\\mu}',
            description:
              'When the entire YDSE apparatus is immersed in liquid of refractive index $\\mu$ (e.g. water $\\mu = 4/3$), the optical wavelength decreases to $\\lambda / \\mu$, causing the fringe width to compress.',
            formulaLatex: '\\beta\' = \\frac{\\beta}{\\mu} = \\frac{\\lambda D}{\\mu d}, \\quad \\theta_f\' = \\frac{\\theta_f}{\\mu}',
            physicalSignificance:
              'Fringes move closer together on the screen. The number of fringes per unit length increases by factor $\\mu$.',
            jeeTrapAlert:
              'Frequency $\\nu$ of light remains constant across all media; only speed $v = c/\\mu$ and wavelength $\\lambda\' = \\lambda/\\mu$ change.',
            parameterPreset: { wavelength: 450, d: 0.4, D: 1.5, probeY: 1.69, I0: 50 },
          },
          {
            id: 'ydse-case-mica-sheet',
            title: 'Insertion of Thin Transparent Sheet of Thickness t and Index μ',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\Delta x_{\\text{opt}} = (\\mu - 1)t',
            description:
              'Introducing a thin mica/glass slab in the path of one slit introduces an extra optical path $(\\mu - 1)t$, shifting the entire fringe pattern upward toward the covered slit.',
            formulaLatex: '\\Delta y = \\frac{(\\mu - 1)t D}{d} = N\\beta, \\quad N = \\frac{(\\mu - 1)t}{\\lambda}',
            physicalSignificance:
              'Central zero-order bright fringe shifts from $y=0$ to $y = \\Delta y$. Fringe width $\\beta$ itself remains completely unchanged.',
            jeeTrapAlert:
              'If two sheets of thicknesses $t_1, t_2$ and indices $\\mu_1, \\mu_2$ are placed in front of both slits, net shift is $\\Delta y = [(\\mu_1 - 1)t_1 - (\\mu_2 - 1)t_2]\\frac{D}{d}$.',
          },
          {
            id: 'ydse-case-white-light',
            title: 'YDSE with Polychromatic White Light Source',
            categoryTag: 'Special Case',
            conditionLatex: '\\lambda \\in [380\\text{ nm}, 750\\text{ nm}]',
            description:
              'Central fringe is completely WHITE because all wavelengths have zero path difference ($\\Delta x = 0$). Fringes closest to center are violet/blue (smaller $\\beta$), and furthest are red.',
            formulaLatex: '\\beta_{\\text{violet}} < \\beta_{\\text{green}} < \\beta_{\\text{red}}',
            physicalSignificance:
              'After a few overlapping colored fringes, the pattern blurs into uniform illumination due to loss of temporal coherence.',
          },
          {
            id: 'ydse-case-unequal-slits',
            title: 'Unequal Slit Widths / Intensities (I₁ ≠ I₂)',
            categoryTag: 'JEE Advanced',
            conditionLatex: 'I_1 \\ne I_2, \\quad \\frac{I_1}{I_2} = \\left(\\frac{w_1}{w_2}\\right)',
            description:
              'When slit amplitudes $a_1 \\ne a_2$, destructive interference is no longer completely dark ($I_{\\min} > 0$), reducing fringe visibility/contrast $V$.',
            formulaLatex: 'I_{\\max} = (\\sqrt{I_1} + \\sqrt{I_2})^2, \\quad I_{\\min} = (\\sqrt{I_1} - \\sqrt{I_2})^2, \\quad V = \\frac{2\\sqrt{I_1 I_2}}{I_1 + I_2}',
            physicalSignificance:
              'Energy is still conserved: $I_{\\text{avg}} = I_1 + I_2$.',
          },
          {
            id: 'ydse-case-polarizer',
            title: 'Crossed Polaroids Placed Over Slits S₁ and S₂',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\hat{E}_1 \\perp \\hat{E}_2 \\implies \\theta = 90^\\circ',
            description:
              'If light from $S_1$ and $S_2$ is polarized in mutually perpendicular planes, the electric field vectors cannot interfere ($E_1 \\cdot E_2 = 0$).',
            formulaLatex: 'I(y) = I_1 + I_2 = 2I_0 \\quad (\\text{Uniform Irradiance, No Fringes})',
            physicalSignificance:
              'Interference requires coherent light vibrating in the same polarization plane.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Interference (YDSE) vs Single Slit Diffraction vs Thin Film Reflection',
        headers: ['Characteristic', 'Double Slit Interference (YDSE)', 'Single Slit Diffraction (Fraunhofer)', 'Thin Film Interference'],
        rows: [
          ['Fringe Width $\\beta$', 'All fringes equal: $\\beta = \\frac{\\lambda D}{d}$', 'Central peak is $2\\times$ wider: $\\frac{2\\lambda D}{w}$', 'Varies with film thickness $t$ and angle $r$'],
          ['Minima Intensity $I_{\\min}$', 'Strictly zero (if $I_1 = I_2$)', 'Zero at minima; secondary peaks decay rapidly', 'Zero at destructive condition ($2\\mu t\\cos r = n\\lambda$)'],
          ['Peak Intensity $I_{\\max}$', 'All bright fringes equal: $4I_0$', 'Central peak is $I_0$; $1^{\\text{st}}$ secondary is $0.045 I_0$', 'Modulated by Fresnel reflection coefficients'],
          ['Phase Mechanism', 'Path difference $\\Delta x = d\\sin\\theta$', 'Continuous wave phase integration over slit width $w$', 'Optical path $2\\mu t\\cos r \\pm \\frac{\\lambda}{2}$ (Stokes shift)'],
        ],
      },
    ],
    standardApproximations: [
      {
        condition: 'Fraunhofer / Far-field Condition (d << D)',
        exactFormula: '\\Delta x = \\sqrt{D^2 + (y + d/2)^2} - \\sqrt{D^2 + (y - d/2)^2}',
        approxFormula: '\\Delta x = d\\sin\\theta \\approx \\frac{yd}{D}',
        validityRange: 'Screen distance D > 100 d and y < 0.1 D',
      },
    ],
    frequentlyTestedTricks: [
      'Condition for missing orders in double slit diffraction: If slit separation d is an integer multiple of slit width w (d = m w), the m-th interference maximum coincides with the single-slit minimum and vanishes.',
      'Total number of bright fringes visible on screen of infinite width: N_max = 2 [d / λ] + 1.',
      'If source slit S₀ is shifted downward by distance s, the central bright fringe shifts upward on screen by: y_0 = (D / d) · s · (d / s_0) = (D / s_0) · s.',
    ],
  },

  'lcr-circuit': {
    chapterCode: 'PHY-12-EMI-04',
    synopsis:
      'Analysis of Series and Parallel LCR alternating current circuits. Vector phasor diagrams illustrate phase relationships: resistor current $I$ and voltage $V_R$ are in phase, inductor voltage $V_L$ leads by $90^\\circ$, and capacitor voltage $V_C$ lags by $90^\\circ$.',
    subtopics: [
      {
        id: 'lcr-sub-01',
        title: '1. Series LCR Circuit & Resonance',
        summary:
          'Net impedance $Z = \\sqrt{R^2 + (X_L - X_C)^2}$ where $X_L = \\omega L$ and $X_C = \\frac{1}{\\omega C}$. At resonance $X_L = X_C$, impedance is purely resistive ($Z = R$) and current is maximum.',
        keyPoints: [
          'Resonant angular frequency: $\\omega_0 = \\frac{1}{\\sqrt{LC}}$, $f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$',
          'Current amplitude: $I_0 = \\frac{V_0}{Z} = \\frac{V_0}{\\sqrt{R^2 + (\\omega L - 1/(\\omega C))^2}}$',
          'Phase angle: $\\tan\\phi = \\frac{X_L - X_C}{R}$',
          'Power factor: $\\cos\\phi = \\frac{R}{Z}$',
          'Average power dissipated: $P_{\\text{avg}} = V_{\\text{rms}} I_{\\text{rms}} \\cos\\phi = I_{\\text{rms}}^2 R$',
        ],
        cases: [
          {
            id: 'lcr-case-resonance',
            title: 'Series Resonance Condition (X_L = X_C)',
            categoryTag: 'Special Case',
            conditionLatex: '\\omega = \\omega_0 = \\frac{1}{\\sqrt{LC}}',
            description:
              'Inductive reactance precisely cancels capacitive reactance ($X_L = X_C$). Impedance is at its absolute minimum ($Z = R$), current is at its global maximum ($I_0 = V_0/R$), and voltage and current are in phase ($\\phi = 0, \\cos\\phi = 1$).',
            formulaLatex: 'Z = R, \\quad I_{\\max} = \\frac{V_0}{R}, \\quad \\phi = 0, \\quad \\cos\\phi = 1',
            physicalSignificance:
              'Voltages across inductor and capacitor are equal and $180^\\circ$ out of phase ($V_L + V_C = 0$). Voltage across $L$ or $C$ can far exceed the source voltage: $V_L = Q V_0$.',
            jeeTrapAlert:
              'At resonance, total voltage across the $LC$ combination is exactly zero ($V_{LC} = 0$), even though individual voltages $V_L$ and $V_C$ can be dangerously high.',
            parameterPreset: { R: 25, L: 0.15, C: 47, V0: 100, f: 60 },
          },
          {
            id: 'lcr-case-inductive',
            title: 'Inductive Domain (ω > ω₀, X_L > X_C)',
            categoryTag: 'JEE Main',
            conditionLatex: '\\omega > \\frac{1}{\\sqrt{LC}} \\implies X_L > X_C',
            description:
              'Circuit acts predominantly as an inductive load. Voltage leads current by positive phase angle $\\phi = \\tan^{-1}\\left(\\frac{X_L - X_C}{R}\\right) > 0$.',
            formulaLatex: 'V(t) = V_0\\sin(\\omega t), \\quad I(t) = I_0\\sin(\\omega t - \\phi)',
            parameterPreset: { R: 50, L: 0.35, C: 20, V0: 100, f: 120 },
          },
          {
            id: 'lcr-case-capacitive',
            title: 'Capacitive Domain (ω < ω₀, X_C > X_L)',
            categoryTag: 'JEE Main',
            conditionLatex: '\\omega < \\frac{1}{\\sqrt{LC}} \\implies X_C > X_L',
            description:
              'Circuit acts predominantly as a capacitive load. Current leads voltage by phase angle $\\phi < 0$.',
            formulaLatex: 'I(t) = I_0\\sin(\\omega t + |\\phi|)',
            parameterPreset: { R: 50, L: 0.05, C: 100, V0: 100, f: 30 },
          },
          {
            id: 'lcr-case-quality-factor',
            title: 'Quality Factor Q and Sharpness of Resonance',
            categoryTag: 'JEE Advanced',
            conditionLatex: 'Q = \\frac{\\omega_0 L}{R} = \\frac{1}{\\omega_0 C R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}',
            description:
              'The Quality factor $Q$ measures the sharpness of the resonance peak and the voltage magnification factor across reactive elements relative to the supply.',
            formulaLatex: 'Q = \\frac{\\omega_0}{\\Delta\\omega} = \\frac{f_0}{\\text{Bandwidth}}, \\quad V_L(\\omega_0) = Q V_0',
            physicalSignificance:
              'Lower resistance $R$ yields higher $Q$, tighter bandwidth $\\Delta\\omega = R/L$, and sharper tuning selectivity for radio receivers.',
          },
          {
            id: 'lcr-case-wattless-current',
            title: 'Wattless Current (Pure Reactive Circuits R = 0)',
            categoryTag: 'JEE Advanced',
            conditionLatex: 'R = 0 \\implies \\phi = \\pm 90^\\circ, \\quad \\cos\\phi = 0',
            description:
              'In a pure inductor or capacitor circuit, phase angle is $90^\\circ$, power factor is zero, and average power dissipated is zero ($P_{\\text{avg}} = 0$). Current flowing without consuming power is called wattless current.',
            formulaLatex: 'I_{\\text{wattless}} = I_{\\text{rms}}\\sin\\phi, \\quad P_{\\text{avg}} = 0',
            jeeTrapAlert:
              'Even though average energy consumed is zero, instantaneous power oscillates between source and magnetic/electric fields.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Series LCR vs Parallel LCR Resonance Comparison Matrix',
        headers: ['Circuit Parameter', 'Series LCR Resonance (Acceptor)', 'Parallel LCR Resonance (Rejector)'],
        rows: [
          ['Resonance Frequency $\\omega_0$', '$\\omega_0 = \\frac{1}{\\sqrt{LC}}$', '$\\omega_0 = \\sqrt{\\frac{1}{LC} - \\frac{R^2}{L^2}} \\approx \\frac{1}{\\sqrt{LC}}$'],
          ['Impedance $Z$ at $\\omega_0$', 'Minimum: $Z = R$', 'Maximum: $Z_{\\text{dyn}} = \\frac{L}{C R}$'],
          ['Current Amplitude $I_0$', 'Global Maximum: $I_0 = \\frac{V_0}{R}$', 'Global Minimum: $I_0 = \\frac{V_0 C R}{L}$'],
          ['Phase Angle $\\phi$', '$\\phi = 0^\\circ$ (Purely resistive, $\\cos\\phi = 1$)', '$\\phi = 0^\\circ$ (Purely resistive, $\\cos\\phi = 1$)'],
          ['Magnification Factor', 'Voltage Magnification: $V_L = V_C = Q V_0$', 'Current Magnification: $I_L = I_C = Q I_{\\text{source}}$'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'Choke coil design: High inductance L and negligible resistance R gives high impedance with zero power loss.',
      'Two frequencies ω₁ and ω₂ having same current amplitude satisfy: ω₀ = √(ω₁ ω₂).',
      'Bandwidth: Δω = ω₂ - ω₁ = R / L.',
      'At half-power frequencies (where I = I_max / √2), power is halved and phase angle is |ϕ| = 45° (cos ϕ = 1/√2).',
    ],
  },

  'photoelectric-effect': {
    chapterCode: 'PHY-12-MOD-01',
    synopsis:
      'Einstein’s quantum explanation of photoelectric emission based on light quanta (photons) of energy $E = h\\nu$. Photon energy is transferred to an electron to overcome work function $\\Phi_0 = h\\nu_0$, with the remainder appearing as maximum kinetic energy $K_{\\max} = e V_s = h\\nu - \\Phi_0$.',
    subtopics: [
      {
        id: 'pe-sub-01',
        title: '1. Photoelectric Equation & Stopping Potential',
        summary:
          'Instantaneous emission ($< 10^{-9}$ s) occurs if incident frequency $\\nu \\ge \\nu_0$. Stopping potential $V_s$ is linearly proportional to frequency $\\nu$ with universal slope $h/e$.',
        keyPoints: [
          'Einstein Photoelectric Equation: $K_{\\max} = e V_s = h\\nu - \\Phi_0 = h(\\nu - \\nu_0) = hc\\left(\\frac{1}{\\lambda} - \\frac{1}{\\lambda_0}\\right)$',
          'Threshold frequency: $\\nu_0 = \\frac{\\Phi_0}{h}$ and threshold wavelength $\\lambda_0 = \\frac{hc}{\\Phi_0}$',
          'Slope of $V_s$ vs $\\nu$ graph: $m = \\frac{h}{e} \\approx 4.14 \\times 10^{-15}\\text{ V}\\cdot\\text{s}$ (universal constant for all metals)',
          'Photoelectric saturation current: $i_{\\text{sat}} \\propto \\text{Light Intensity } I$',
        ],
        cases: [
          {
            id: 'pe-case-threshold',
            title: 'Sub-Threshold Condition (ν < ν₀ or λ > λ₀)',
            categoryTag: 'Extreme Limit',
            conditionLatex: '\\nu < \\nu_0 \\implies h\\nu < \\Phi_0',
            description:
              'No photoelectrons are emitted regardless of light intensity, exposure time, or illumination power. Classical wave theory failure.',
            formulaLatex: 'K_{\\max} = 0, \\quad i_{\\text{photo}} = 0',
            physicalSignificance:
              'Demonstrates particle nature of light: emission is a one-to-one photon-electron collision.',
            parameterPreset: { wavelength: 650, intensity: 80, workFunction: 3.2, stoppingVoltage: 0 },
          },
          {
            id: 'pe-case-stopping-potential',
            title: 'Stopping Potential Cutoff (V_ext = -V_s)',
            categoryTag: 'Special Case',
            conditionLatex: 'e V_s = K_{\\max} = \\frac{hc}{\\lambda} - \\Phi_0',
            description:
              'Applying a retarding collector potential equal to $-V_s$ halts even the most energetic electrons emitted directly from the Fermi level, dropping anode photocurrent to zero.',
            formulaLatex: 'V_s = \\frac{h}{e}\\nu - \\frac{\\Phi_0}{e} = \\frac{1240\\text{ eV}\\cdot\\text{nm}}{e\\lambda} - \\frac{\\Phi_0}{e}',
            physicalSignificance:
              'Stopping potential depends solely on incident photon frequency and cathode material; it is strictly independent of light intensity.',
            parameterPreset: { wavelength: 280, intensity: 50, workFunction: 2.3, stoppingVoltage: -2.13 },
          },
          {
            id: 'pe-case-intensity-doubling',
            title: 'Effect of Doubling Light Intensity at Constant Frequency',
            categoryTag: 'JEE Main',
            conditionLatex: 'I\' = 2I, \\quad \\nu = \\text{const}',
            description:
              'Doubling intensity doubles photon arrival rate per second, thus exactly doubling saturation photocurrent $i_{\\text{sat}}$, while stopping potential $V_s$ and $K_{\\max}$ remain completely unaffected.',
            formulaLatex: 'i_{\\text{sat}}\' = 2 i_{\\text{sat}}, \\quad V_s\' = V_s, \\quad K_{\\max}\' = K_{\\max}',
            jeeTrapAlert:
              'Do not confuse photon energy ($E = h\\nu$) with beam intensity ($I = n h\\nu$).',
          },
          {
            id: 'pe-case-de-broglie',
            title: 'De Broglie Wavelength of Emitted Photoelectrons',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\lambda_{\\text{electron}} = \\frac{h}{p} = \\frac{h}{\\sqrt{2m_e K_{\\max}}}',
            description:
              'Wave-particle duality connects the kinetic energy of emitted photoelectrons to their matter wavelength.',
            formulaLatex: '\\lambda_e = \\frac{h}{\\sqrt{2m_e e V_s}} = \\frac{1.227}{\\sqrt{V_s}}\\text{ nm} = \\frac{h}{\\sqrt{2m_e(h\\nu - \\Phi_0)}}',
            physicalSignificance:
              'Enables electron microscopy and matter wave diffraction analysis.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Classical Wave Theory vs Einstein Quantum Theory of Light',
        headers: ['Observation / Phenomenon', 'Classical Wave Prediction (Maxwell)', 'Quantum Photon Law (Einstein)'],
        rows: [
          ['Kinetic Energy $K_{\\max}$', 'Proportional to wave intensity $I$', 'Independent of $I$; linearly dependent on frequency $\\nu$'],
          ['Cut-off Threshold $\\nu_0$', 'No threshold; any light emits after accumulation time', 'Strict cutoff $\\nu \\ge \\nu_0 = \\frac{\\Phi_0}{h}$ is mandatory'],
          ['Emission Time Lag', 'Measurable time delay (hours/days for low $I$)', 'Instantaneous emission ($< 10^{-9}\\text{ s}$)'],
          ['Saturation Current $i_{\\text{sat}}$', 'Proportional to wave amplitude squared ($E_0^2$)', 'Directly proportional to incident photon flux'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'Radiation pressure on perfectly reflecting surface: P = 2I / c; on perfectly absorbing surface: P = I / c.',
      'Number of photons emitted per second by a source of power P: N = P / (hν) = (P λ) / (hc) = 5 × 10²⁴ · P(W) · λ(m).',
      'If source distance from cathode is doubled (r → 2r), intensity drops to I/4, saturation current drops to i/4, but stopping potential remains unchanged.',
      'Graph of V_s vs 1/λ has slope hc/e and negative y-intercept -Φ₀/e.',
    ],
  },

  'pure-rolling-motion': {
    chapterCode: 'PHY-11-ROT-04',
    synopsis:
      'Rigid body plane motion combining translation of Center of Mass ($v_{\\text{cm}}, a_{\\text{cm}}$) with rotation about Center of Mass ($\\omega, \\alpha$). Pure rolling requires zero relative slip velocity at the instantaneous point of contact with ground ($v_{\\text{contact}} = v_{\\text{cm}} - \\omega R = 0$).',
    subtopics: [
      {
        id: 'roll-sub-01',
        title: '1. Pure Rolling on Horizontal & Inclined Planes',
        summary:
          'Kinematics condition $v_{\\text{cm}} = \\omega R$ and $a_{\\text{cm}} = \\alpha R$. Point of contact $P$ is the Instantaneous Center of Zero Velocity (ICR).',
        keyPoints: [
          'Velocity of any perimeter point at angle $\\theta$ from bottom: $v = 2 v_{\\text{cm}} \\sin(\\theta/2)$',
          'Velocity of topmost point: $v_{\\text{top}} = 2 v_{\\text{cm}}$ (maximum speed)',
          'Velocity of point of contact: $v_{\\text{bottom}} = 0$ (instantaneous rest)',
          'Total kinetic energy: $K = K_{\\text{trans}} + K_{\\text{rot}} = \\frac{1}{2}M v_{\\text{cm}}^2\\left(1 + \\frac{k^2}{R^2}\\right)$ where $k$ is radius of gyration',
          'Acceleration down rough incline of angle $\\theta$: $a = \\frac{g\\sin\\theta}{1 + k^2/R^2}$',
          'Friction required for pure rolling down incline: $f_s = \\frac{M g\\sin\\theta}{1 + R^2/k^2} \\le \\mu_s M g\\cos\\theta$',
        ],
        cases: [
          {
            id: 'roll-case-race-incline',
            title: 'Rolling Race Down an Incline (Ring vs Cylinder vs Sphere)',
            categoryTag: 'Special Case',
            conditionLatex: 'a = \\frac{g\\sin\\theta}{1 + I_{\\text{cm}}/(MR^2)}',
            description:
              'Bodies with smaller radius of gyration ratio $k^2/R^2$ have smaller rotational inertia penalties, achieving greater linear acceleration and reaching the bottom first.',
            formulaLatex: 'a_{\\text{solid sphere}} (0.71 g\\sin\\theta) > a_{\\text{disc}} (0.67 g\\sin\\theta) > a_{\\text{hollow sphere}} (0.60 g\\sin\\theta) > a_{\\text{ring}} (0.50 g\\sin\\theta)',
            physicalSignificance:
              'Mass $M$ and radius $R$ cancel out completely! Acceleration depends solely on body geometric mass distribution factor $k^2/R^2$.',
            parameterPreset: { bodyType: 0, theta: 25, mu: 0.4, v0: 0, R: 1.0 },
          },
          {
            id: 'roll-case-min-friction',
            title: 'Minimum Friction Coefficient for Pure Rolling Down Incline',
            categoryTag: 'JEE Main',
            conditionLatex: '\\mu_{\\min} = \\frac{\\tan\\theta}{1 + R^2/k^2}',
            description:
              'If surface friction $\\mu_s < \\mu_{\\min}$, static friction cannot provide the required torque $\\tau = f R$, causing the body to slip while rolling down.',
            formulaLatex: '\\mu_{\\min,\\text{ring}} = \\frac{\\tan\\theta}{2}, \\quad \\mu_{\\min,\\text{disc}} = \\frac{\\tan\\theta}{3}, \\quad \\mu_{\\min,\\text{sphere}} = \\frac{2\\tan\\theta}{7}',
            jeeTrapAlert:
              'In pure rolling, static friction does NO work ($W_f = 0$) because displacement of instantaneous contact point is zero. Total mechanical energy is conserved!',
          },
          {
            id: 'roll-case-forward-force',
            title: 'Direction of Friction under Horizontal Force F applied at height h',
            categoryTag: 'JEE Advanced',
            conditionLatex: 'f = F\\left(\\frac{h R - k^2}{R^2 + k^2}\\right)',
            description:
              'Depending on the height $h$ above center of mass where pulling force $F$ is applied: if $h > k^2/R$, friction acts FORWARD; if $h = k^2/R$, friction is ZERO; if $h < k^2/R$, friction acts BACKWARD.',
            formulaLatex: 'h = \\frac{k^2}{R} \\implies f = 0 \\quad (\\text{Sweet Spot / Center of Percussion})',
            physicalSignificance:
              'For a billiard ball / solid sphere ($k^2 = 2/5 R^2$), force applied at $h = 2/5 R = 0.4 R$ above center causes rolling with zero friction.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Rolling Body Dynamics Matrix down Incline of Angle $\\theta$',
        headers: ['Body Geometry', '$\\frac{k^2}{R^2}$ Ratio', 'Linear Acceleration $a$', 'Static Friction $f_s$', 'Velocity at Base $v$', 'Fraction of $K_{\\text{rot}}$'],
        rows: [
          ['Solid Sphere', '$\\frac{2}{5} = 0.40$', '$\\frac{5}{7}g\\sin\\theta \\approx 0.71 g\\sin\\theta$', '$\\frac{2}{7}Mg\\sin\\theta$', '$\\sqrt{\\frac{10}{7}gh}$', '$\\frac{2}{7} \\approx 28.6\\%$'],
          ['Solid Cylinder / Disc', '$\\frac{1}{2} = 0.50$', '$\\frac{2}{3}g\\sin\\theta \\approx 0.67 g\\sin\\theta$', '$\\frac{1}{3}Mg\\sin\\theta$', '$\\sqrt{\\frac{4}{3}gh}$', '$\\frac{1}{3} \\approx 33.3\\%$'],
          ['Hollow Sphere', '$\\frac{2}{3} \\approx 0.67$', '$\\frac{3}{5}g\\sin\\theta = 0.60 g\\sin\\theta$', '$\\frac{2}{5}Mg\\sin\\theta$', '$\\sqrt{\\frac{6}{5}gh}$', '$\\frac{2}{5} = 40.0\\%$'],
          ['Ring / Thin Hoop', '$1.00$', '$\\frac{1}{2}g\\sin\\theta = 0.50 g\\sin\\theta$', '$\\frac{1}{2}Mg\\sin\\theta$', '$\\sqrt{gh}$', '$\\frac{1}{2} = 50.0\\%$'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'Conservation of Angular Momentum about Point of Contact on Ground: Since friction passes through contact point P, torque τ_P = 0. Angular momentum L_P = M v_cm R + I_cm ω is strictly conserved even during rough collision or slipping transition!',
      'Time to achieve pure rolling after horizontal projection with pure translation v_0 on rough floor: t = v_0 / (μ g (1 + R²/k²)).',
      'Final pure rolling velocity: v_f = v_0 / (1 + k²/R²). For solid sphere: v_f = 5/7 v_0.',
    ],
  },

  'circular-motion': {
    chapterCode: 'PHY-11-CIR-03',
    synopsis:
      'Two-dimensional planar curvilinear motion with radial (centripetal) acceleration $a_r = \\frac{v^2}{R} = \\omega^2 R$ toward the center and tangential acceleration $a_t = \\frac{dv}{dt} = \\alpha R$. Covers horizontal circular motion, conical pendulums, banked turns, and critical conditions for vertical circular loops.',
    subtopics: [
      {
        id: 'cir-sub-01',
        title: '1. Vertical Circular Motion (String vs Light Rod)',
        summary:
          'Non-uniform circular motion under gravity. Tension varies continuously: $T(\\theta) = \\frac{m v^2}{R} + m g\\cos\\theta$.',
        keyPoints: [
          'Critical speed at bottom to complete loop (string): $u_{\\min} = \\sqrt{5gR}$',
          'Critical speed at top (string): $v_{\\text{top}} = \\sqrt{gR}$ (Tension $T_{\\text{top}} = 0$)',
          'Tension difference between bottom and top is invariant: $T_{\\text{bottom}} - T_{\\text{top}} = 6mg$',
          'For a light rigid rod, speed at top can reach zero: $u_{\\min,\\text{rod}} = \\sqrt{4gR} = 2\\sqrt{gR}$',
        ],
        cases: [
          {
            id: 'cir-case-complete-loop',
            title: 'Critical Loop Completion (u = √(5gR))',
            categoryTag: 'Special Case',
            conditionLatex: 'u = \\sqrt{5gR}',
            description:
              'At lowest point $u = \\sqrt{5gR}$, speed at highest point drops to $v = \\sqrt{gR}$, exactly balancing gravity with centripetal force ($T_{\\text{top}} = 0$). String remains taut throughout.',
            formulaLatex: 'T_{\\text{bottom}} = 6mg, \\quad T_{\\text{top}} = 0, \\quad v_{\\text{top}} = \\sqrt{gR}',
            parameterPreset: { v: 12.12, r: 3.0, m: 1.0, type: 0 },
          },
          {
            id: 'cir-case-slacking-oscillate',
            title: 'Oscillation Regime (u ≤ √(2gR))',
            categoryTag: 'JEE Main',
            conditionLatex: 'u \\le \\sqrt{2gR}',
            description:
              'The particle never rises above the horizontal diameter ($\\\\theta \\le 90^\\circ$). Velocity drops to zero before tension vanishes, causing pure oscillation.',
            formulaLatex: '\\cos\\theta_{\\max} = 1 - \\frac{u^2}{2gR}',
            parameterPreset: { v: 5.0, r: 3.0, m: 1.0, type: 0 },
          },
          {
            id: 'cir-case-slacking-projectile',
            title: 'String Slacking & Projectile Transition (√(2gR) < u < √(5gR))',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\sqrt{2gR} < u < \\sqrt{5gR}',
            description:
              'String slacks ($T = 0$) at an angle $\\cos\\alpha = \\frac{u^2 - 2gR}{3gR}$ in the upper hemisphere. The particle then leaves circular path and executes parabolic projectile motion.',
            formulaLatex: 'T = 0 \\implies v_{\\text{slack}} = \\sqrt{gR\\cos\\alpha}, \\quad \\cos\\alpha = \\frac{u^2 - 2gR}{3gR}',
            physicalSignificance:
              'The parabolic trajectory passes through the lowest point if $u = \\sqrt{\\frac{7}{2}gR}$.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Vertical Circular Motion: Inextensible String vs Light Rigid Rod',
        headers: ['Boundary Condition', 'Mass on Inextensible String', 'Mass on Light Rigid Rod'],
        rows: [
          ['Minimum Velocity at Bottom', '$u_{\\min} = \\sqrt{5gR}$', '$u_{\\min} = \\sqrt{4gR} = 2\\sqrt{gR}$'],
          ['Minimum Velocity at Top', '$v_{\\text{top}} = \\sqrt{gR}$', '$v_{\\text{top}} = 0$'],
          ['Force Condition at Top', '$T_{\\text{top}} \\ge 0$ (Tension cannot push)', 'Normal/Stress can be compressive ($N \\le 0$)'],
          ['Tension Difference $T_{\\text{bottom}} - T_{\\text{top}}$', 'Invariant: $6mg$', 'Invariant: $6mg$'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'Optimum banking angle without friction: tan θ = v² / (R g).',
      'Maximum safe speed with friction on banked road: v_max = √[R g (tan θ + μ) / (1 - μ tan θ)].',
      'Death well / Rotor: Minimum angular speed to prevent falling down vertical wall: ω_min = √(g / (μ R)).',
    ],
  },

  'bohr-atom-spectrum': {
    chapterCode: 'PHY-12-MOD-02',
    synopsis:
      'Bohr model for hydrogenic single-electron ions ($Z$). Quantization of orbital angular momentum $L = m v r = \\frac{n h}{2\\pi}$ yields quantized orbit radii $r_n = 0.529\\frac{n^2}{Z}$ Å and energy levels $E_n = -13.6\\frac{Z^2}{n^2}$ eV.',
    subtopics: [
      {
        id: 'bohr-sub-01',
        title: '1. Hydrogenic Energy Levels & Spectral Series',
        summary:
          'Photon emitted during transition $n_2 \\to n_1$ has wavenumber $\\bar{\\nu} = \\frac{1}{\\lambda} = R Z^2\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$ with Rydberg constant $R = 1.097 \\times 10^7\\text{ m}^{-1}$.',
        keyPoints: [
          'Radius of $n$-th orbit: $r_n = \\frac{\\epsilon_0 h^2 n^2}{\\pi m e^2 Z} = r_0\\frac{n^2}{Z} = 0.529\\frac{n^2}{Z}\\text{ \\AA}$',
          'Orbital speed: $v_n = \\frac{e^2}{2\\epsilon_0 h}\\frac{Z}{n} = c\\alpha\\frac{Z}{n} = \\frac{c}{137}\\frac{Z}{n} = 2.18 \\times 10^6\\frac{Z}{n}\\text{ m/s}$',
          'Kinetic energy: $K_n = +13.6\\frac{Z^2}{n^2}\\text{ eV}$, Potential energy: $U_n = -27.2\\frac{Z^2}{n^2}\\text{ eV}$',
          'Total Energy: $E_n = K_n + U_n = -K_n = \\frac{U_n}{2} = -13.6\\frac{Z^2}{n^2}\\text{ eV}$',
        ],
        cases: [
          {
            id: 'bohr-case-lyman',
            title: 'Lyman Series (Ultraviolet Transitions n₁ = 1)',
            categoryTag: 'JEE Main',
            conditionLatex: 'n_1 = 1, \\quad n_2 = 2, 3, 4, \\dots, \\infty',
            description:
              'All transitions falling to the ground state $n=1$ emit high-energy photons in the Ultraviolet region. Lyman-α ($n=2 \\to 1$) is $121.6$ nm.',
            formulaLatex: '\\frac{1}{\\lambda} = R Z^2\\left(1 - \\frac{1}{n_2^2}\\right), \\quad \\lambda_{\\max} = \\frac{4}{3R} \\approx 121.6\\text{ nm}, \\quad \\lambda_{\\min} = \\frac{1}{R} \\approx 91.2\\text{ nm}',
            parameterPreset: { nLevel: 1, zNumber: 1 },
          },
          {
            id: 'bohr-case-balmer',
            title: 'Balmer Series (Visible Spectrum n₁ = 2)',
            categoryTag: 'Special Case',
            conditionLatex: 'n_1 = 2, \\quad n_2 = 3, 4, 5, \\dots, \\infty',
            description:
              'Transitions to $n=2$ produce visible spectral lines: $H_\\alpha$ ($3\\to 2$, red, 656.3 nm), $H_\\beta$ ($4\\to 2$, cyan, 486.1 nm), $H_\\gamma$ ($5\\to 2$, blue, 434 nm), $H_\\delta$ ($6\\to 2$, violet, 410.2 nm).',
            formulaLatex: '\\frac{1}{\\lambda} = R Z^2\\left(\\frac{1}{4} - \\frac{1}{n_2^2}\\right), \\quad \\lambda(H_\\alpha) = \\frac{36}{5R} = 656.3\\text{ nm}',
            parameterPreset: { nLevel: 2, zNumber: 1 },
          },
          {
            id: 'bohr-case-reduced-mass',
            title: 'Finite Nuclear Mass Correction (Positronium / Muonic Atom)',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\mu = \\frac{m_e M_{\\text{nucleus}}}{m_e + M_{\\text{nucleus}}}',
            description:
              'Accounting for motion of nucleus about common center of mass replaces electron mass $m_e$ with reduced mass $\\mu$. In Positronium ($e^+ e^-$), $\\mu = m_e / 2$, halving all Rydberg energies ($E_1 = -6.8$ eV).',
            formulaLatex: 'R\' = R_\\infty\\left(\\frac{\\mu}{m_e}\\right) = \\frac{R_\\infty}{1 + m_e/M}, \\quad E_n\' = \\frac{\\mu}{m_e} E_n',
            physicalSignificance:
              'In Muonic hydrogen (where muon mass $m_\\mu \\approx 207 m_e$), orbital radius is 207 times smaller, placing muon deep inside nuclear field.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Hydrogen Spectral Series Summary Matrix ($Z = 1$)',
        headers: ['Series Name', 'Lower State $n_1$', 'Upper State $n_2$', 'Spectral Region', 'Wavelength Range $\\lambda$'],
        rows: [
          ['Lyman Series', '$n_1 = 1$', '$n_2 = 2, 3, 4, \\dots, \\infty$', 'Ultraviolet (UV)', '$91.2\\text{ nm} - 121.6\\text{ nm}$'],
          ['Balmer Series', '$n_1 = 2$', '$n_2 = 3, 4, 5, \\dots, \\infty$', 'Visible Light (Vis)', '$364.6\\text{ nm} - 656.3\\text{ nm}$'],
          ['Paschen Series', '$n_1 = 3$', '$n_2 = 4, 5, 6, \\dots, \\infty$', 'Near Infrared (NIR)', '$820.4\\text{ nm} - 1875\\text{ nm}$'],
          ['Brackett Series', '$n_1 = 4$', '$n_2 = 5, 6, 7, \\dots, \\infty$', 'Mid Infrared (MIR)', '$1458\\text{ nm} - 4051\\text{ nm}$'],
          ['Pfund Series', '$n_1 = 5$', '$n_2 = 6, 7, 8, \\dots, \\infty$', 'Far Infrared (FIR)', '$2279\\text{ nm} - 7458\\text{ nm}$'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'Total number of spectral lines emitted when electron de-excites from state n to ground state: N = n(n - 1) / 2.',
      'Recoil speed of hydrogen atom upon photon emission: v_recoil = (hν) / (M c) = ΔE / (M c).',
      'Magnetic dipole moment of electron in n-th Bohr orbit: M = I A = n · (e ħ / (2 m_e)) = n · μ_B (Bohr Magneton).',
    ],
  },

  'ray-optics-lens-prism': {
    chapterCode: 'PHY-12-OPT-02',
    synopsis:
      'Refraction through spherical interfaces and prisms. Governed by Snell’s law $n_1\\sin i = n_2\\sin r$, Lens Maker formula $\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)$, and thin lens equation $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$.',
    subtopics: [
      {
        id: 'opt-sub-01',
        title: '1. Lens Combinations & Silvering',
        summary:
          'When one face of a thin lens is silvered, it behaves as a concave mirror of equivalent focal length $\\frac{1}{F_{\\text{eq}}} = \\frac{2}{f_L} + \\frac{1}{f_M}$.',
        keyPoints: [
          'Thin lens formula: $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$',
          'Transverse magnification: $m = \\frac{v}{u} = \\frac{f}{f + u}$',
          'Power of lens: $P = \\frac{1}{f(\\text{meters})}$ (Diopters)',
          'Two lenses in contact: $\\frac{1}{F} = \\frac{1}{f_1} + \\frac{1}{f_2}$ and $P = P_1 + P_2$',
          'Two lenses separated by distance $d$: $\\frac{1}{F} = \\frac{1}{f_1} + \\frac{1}{f_2} - \\frac{d}{f_1 f_2}$',
        ],
        cases: [
          {
            id: 'opt-case-liquid-immersion',
            title: 'Lens Submerged in Liquid of Index μ_L',
            categoryTag: 'Special Case',
            conditionLatex: 'f_{\\text{liquid}} = f_{\\text{air}}\\frac{(\\mu_g - 1)}{\\left(\\frac{\\mu_g}{\\mu_L} - 1\\right)}',
            description:
              'If lens is placed in water ($\\mu_L = 4/3$ for glass $\\mu_g = 1.5$), focal length quadruples ($f_w = 4 f_a$). If $\\mu_L > \\mu_g$, lens switches nature (converging becomes diverging).',
            formulaLatex: '\\mu_L > \\mu_g \\implies f < 0 \\quad (\\text{Convex lens behaves as Concave lens!})',
            physicalSignificance:
              'Air bubble inside water acts as a diverging (concave) lens.',
            parameterPreset: { focalLength: 30, objectDist: -45, lensRadius: 20 },
          },
          {
            id: 'opt-case-prism-min-dev',
            title: 'Prism Minimum Deviation Condition (i = e, r₁ = r₂ = A/2)',
            categoryTag: 'JEE Main',
            conditionLatex: 'i = e, \\quad r_1 = r_2 = \\frac{A}{2}',
            description:
              'Ray passes symmetrically through prism parallel to base. Refractive index is uniquely given by the angle of minimum deviation $\\delta_m$.',
            formulaLatex: '\\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}',
            jeeTrapAlert:
              'For a thin prism with small angle $A < 10^\\circ$: $\\delta = (\\mu - 1)A$.',
          },
          {
            id: 'opt-case-silvered-equiconvex',
            title: 'Equiconvex Lens with One Face Silvered',
            categoryTag: 'JEE Advanced',
            conditionLatex: '\\frac{1}{F} = \\frac{2(\\mu - 1)(2/R)}{1} + \\frac{2}{R} = \\frac{2(2\\mu - 1)}{R}',
            description:
              'A glass equiconvex lens ($\\\\mu = 1.5, R$) with one face silvered forms an equivalent concave mirror with focal length $F = \\frac{R}{2(2\\mu - 1)} = \\frac{R}{4}$.',
            formulaLatex: 'F_{\\text{eq}} = -\\frac{R}{2(2\\mu - 1)}',
            physicalSignificance:
              'Light refracts entering, reflects at back, and refracts exiting, doubling lens optical power.',
          },
        ],
      },
    ],
    comparisonTables: [
      {
        title: 'Real Image vs Virtual Image by Converging Optical Elements',
        headers: ['Optical Property', 'Real Image ($v > 0$ for lens)', 'Virtual Image ($v < 0$ for lens)'],
        rows: [
          ['Screen Projection', 'Can be focused and projected directly onto a screen', 'Cannot be captured on screen (extrapolated rays)'],
          ['Ray Concurrence', 'Actual geometric intersection of refracted rays', 'Intersection of backward-extended virtual rays'],
          ['Orientation / Sign of $m$', 'Inverted relative to object ($m < 0$)', 'Erect relative to object ($m > 0$)'],
          ['Convex Lens Object Position', '$u < -f$ (Placed beyond focal point)', '$-f < u < 0$ (Between focus and optical center)'],
        ],
      },
    ],
    frequentlyTestedTricks: [
      'Displacement Method for Convex Lens: If a sharp image is formed on screen for two lens positions separated by distance d, then focal length is: f = (D² - d²) / (4D), and object size O = √(I₁ I₂).',
      'Apparent depth for multi-layer immiscible liquids: d_app = Σ (t_i / μ_i).',
      'Normal shift produced by a glass slab of thickness t: Δs = t (1 - 1/μ).',
    ],
  },
};

export const getCoachingModule = (conceptId: string): CoachingInstituteModule | undefined => {
  return COACHING_MODULES[conceptId];
};

