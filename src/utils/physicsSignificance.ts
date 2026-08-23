import { PhysicsParameter } from '../types';

export interface PhysicsSignificanceResult {
  significance: string;
  proportionality: string;
  jeeInsight: string;
  boundaryStatus: {
    label: string;
    type: 'optimal' | 'critical' | 'limit' | 'info';
    color: string;
  } | null;
  percentage: number;
}

/**
 * Computes context-aware physical significance, mathematical laws, boundary limits,
 * and JEE tips dynamically as the user adjusts simulation parameters.
 */
export function getParamPhysicalSignificance(
  param: PhysicsParameter,
  val: number,
  allValues: Record<string, number> = {},
  simulationType?: string
): PhysicsSignificanceResult {
  const min = param.min;
  const max = param.max;
  const range = max - min || 1;
  const percentage = Math.round(((val - min) / range) * 100);

  const id = param.id.toLowerCase();
  const label = param.label.toLowerCase();

  // 1. Angle Parameters (e.g. Projectile Launch Angle, Incline Angle, Banking, Polarizer, Ray Angle)
  if (id.includes('angle') || id === 'theta' || label.includes('angle')) {
    if (id.includes('incline') || id.includes('plane') || simulationType === 'inclined-plane-friction') {
      const mu_s = allValues['staticFriction'] || allValues['mu_s'] || 0.4;
      const angleOfRepose = Math.round(Math.atan(mu_s) * (180 / Math.PI) * 10) / 10;
      const isSliding = val > angleOfRepose;

      if (Math.abs(val - angleOfRepose) < 1.5) {
        return {
          significance: `At $\\theta \\approx ${angleOfRepose}^\\circ = \\arctan(\\mu_s)$, the block reaches the Critical Angle of Repose. Limiting static friction exactly equals the downward driving gravity component $mg\\sin\\theta$.`,
          proportionality: `f_s^{\\max} = \\mu_s N = \\mu_s mg\\cos\\theta = mg\\sin\\theta`,
          jeeInsight: 'Classic JEE Trap: If static friction coefficient $\\mu_s > \\tan\\theta$, acceleration is strictly ZERO regardless of mass.',
          boundaryStatus: { label: '⚖️ Limiting Equilibrium (Angle of Repose)', type: 'critical', color: '#f59e0b' },
          percentage,
        };
      } else if (isSliding) {
        return {
          significance: `$\\theta > \\arctan(\\mu_s)$: Gravity component $mg\\sin\\theta$ exceeds maximum static friction. The body accelerates downwards with $a = g(\\sin\\theta - \\mu_k\\cos\\theta)$.`,
          proportionality: `a = g(\\sin\\theta - \\mu_k\\cos\\theta) > 0`,
          jeeInsight: 'Notice that normal force $N = mg\\cos\\theta$ decreases as angle steepens, reducing kinetic friction force.',
          boundaryStatus: { label: '⚡ Dynamic Sliding State', type: 'info', color: '#38bdf8' },
          percentage,
        };
      } else {
        return {
          significance: `$\\theta < \\arctan(\\mu_s)$: Self-adjusting static friction $f_s = mg\\sin\\theta$ keeps the body in static equilibrium.`,
          proportionality: `f_s = mg\\sin\\theta \\le \\mu_s mg\\cos\\theta`,
          jeeInsight: 'Remember: Static friction is a self-adjusting reaction force; it only matches $mg\\sin\\theta$, not the maximum $\\mu_s N$.',
          boundaryStatus: { label: '🛡️ Stationary (Static Friction)', type: 'optimal', color: '#10b981' },
          percentage,
        };
      }
    }

    if (id.includes('project') || simulationType === 'projectile-motion' || id === 'launchangle' || id === 'angle') {
      if (Math.abs(val - 45) < 0.5) {
        return {
          significance: 'Optimal $45^\\circ$ launch angle on flat terrain ($h_0=0$). Maximizes horizontal range $R_{\\max} = \\frac{v_0^2}{g}$ by balancing vertical flight time with horizontal velocity.',
          proportionality: 'R = \\frac{v_0^2\\sin(2\\theta)}{g} \\implies R_{\\max} \\text{ at } 2\\theta = 90^\\circ',
          jeeInsight: 'Complementary angles $(\\theta$ and $90^\\circ - \\theta)$ yield identical horizontal ranges with different apex heights and flight times.',
          boundaryStatus: { label: '🎯 Maximum Range Geometry (45°)', type: 'optimal', color: '#10b981' },
          percentage,
        };
      } else if (val < 45) {
        return {
          significance: `Low-angle trajectory (${val}°): High horizontal velocity component $v_x = v_0\\cos\\theta$, but short time of flight $T = \\frac{2v_0\\sin\\theta}{g}$. Flatter parabolic arc.`,
          proportionality: 'T \\propto \\sin\\theta, \\quad H_{\\max} \\propto \\sin^2\\theta',
          jeeInsight: 'Flatter trajectories minimize wind exposure time and achieve faster target transit times.',
          boundaryStatus: { label: '🏹 Direct Low-Arc Path', type: 'info', color: '#38bdf8' },
          percentage,
        };
      } else if (val === 90) {
        return {
          significance: 'Pure 1D vertical motion ($90^\\circ$): Zero horizontal displacement ($R=0$). Maximizes peak apex height $H = \\frac{v_0^2}{2g}$ and total flight time $T = \\frac{2v_0}{g}$.',
          proportionality: 'H_{\\max} = \\frac{v_0^2}{2g}, \\quad R = 0',
          jeeInsight: 'At apex, instantaneous velocity is strictly zero; acceleration remains uniformly $-g \\hat{j}$.',
          boundaryStatus: { label: '📍 Pure Vertical Flight (90°)', type: 'limit', color: '#ec4899' },
          percentage,
        };
      } else {
        return {
          significance: `High-arc loft trajectory (${val}°): Maximizes vertical airtime $T = \\frac{2v_0\\sin\\theta}{g}$ and apex height $H = \\frac{v_0^2\\sin^2\\theta}{2g}$. Horizontal velocity $v_x$ is smaller.`,
          proportionality: 'H \\propto \\sin^2\\theta, \\quad T \\propto \\sin\\theta',
          jeeInsight: 'Same range as $(90^\\circ - ' + val + '^\\circ = ' + (90 - val) + '^\\circ)$, but with greater peak potential energy at apex.',
          boundaryStatus: { label: '📈 High Apex Loft', type: 'info', color: '#a855f7' },
          percentage,
        };
      }
    }

    if (id.includes('polar') || id.includes('analyzer') || simulationType?.includes('polarization')) {
      const angleRad = (val * Math.PI) / 180;
      const intensityFraction = Math.round(Math.pow(Math.cos(angleRad), 2) * 100);
      return {
        significance: `Malus's Law: Transmitted intensity is $I = I_0\\cos^2\\theta$. At $\\theta = ${val}^\\circ$, exactly ${intensityFraction}% of polarized intensity passes through the analyzer.`,
        proportionality: 'I(\\theta) = I_0\\cos^2\\theta',
        jeeInsight: 'At $\\theta=90^\\circ$ (crossed polaroids), $I=0$. Inserting a 3rd polaroid at $45^\\circ$ in between paradoxically restores transmitted light ($I_0/8$)!',
        boundaryStatus: val === 90 ? { label: '🚫 Crossed Polaroids (Zero Transmission)', type: 'limit', color: '#ef4444' } : null,
        percentage,
      };
    }
  }

  // 2. Velocity / Speed Parameters (v0, speed, angularVelocity, sourceSpeed)
  if (id.includes('vel') || id.includes('speed') || id === 'v0' || id === 'v' || label.includes('velocity') || label.includes('speed')) {
    return {
      significance: `Kinetic Energy scales quadratically: $KE = \\frac{1}{2}mv^2$. Doubling velocity from ${val} to ${(val * 2).toFixed(1)} ${param.unit} quadruples the energy ($4\\times$) and quadruples maximum projectile height/stopping distance.`,
      proportionality: 'KE \\propto v^2, \\quad R \\propto v_0^2, \\quad H_{\\max} \\propto v_0^2',
      jeeInsight: 'In braking/stopping problems: Stopping distance $s = \\frac{v^2}{2\\mu g}$ depends on $v^2$, NOT mass $m$.',
      boundaryStatus: val >= max * 0.9 ? { label: '⚡ High Kinetic Energy Limit', type: 'critical', color: '#f59e0b' } : null,
      percentage,
    };
  }

  // 3. Spring Constant (k) & Oscillation Parameters
  if (id.includes('spring') || id === 'k' || label.includes('spring constant')) {
    return {
      significance: `Spring Stiffness $k = ${val}$ N/m: Higher $k$ increases restoring force $F = -kx$ and raises natural angular frequency $\\omega = \\sqrt{k/m}$. Reduces period $T = 2\\pi\\sqrt{m/k}$.`,
      proportionality: '\\omega = \\sqrt{\\frac{k}{m}}, \\quad T = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad U_s = \\frac{1}{2}kx^2',
      jeeInsight: 'Cutting a spring of constant $k$ into two equal halves doubles each half spring constant to $2k$.',
      boundaryStatus: val <= min * 1.5 ? { label: '🌱 Soft Spring (Slow Oscillation)', type: 'info', color: '#38bdf8' } : { label: '💪 Stiff Spring (Rapid SHM)', type: 'optimal', color: '#10b981' },
      percentage,
    };
  }

  // 4. Damping Coefficient (b / gamma)
  if (id.includes('damp') || id === 'b' || label.includes('damping')) {
    if (val === 0) {
      return {
        significance: 'Undamped Ideal SHM ($b=0$): Total mechanical energy $E = KE + PE$ is strictly conserved with constant amplitude $A_0$ indefinitely.',
        proportionality: 'x(t) = A_0 \\cos(\\omega t + \\phi), \\quad \\frac{dE}{dt} = 0',
        jeeInsight: 'Real systems always have non-zero friction or air resistance dissipating energy into heat at rate $P_{loss} = bv^2$.',
        boundaryStatus: { label: '💎 Conservative SHM (Zero Loss)', type: 'optimal', color: '#10b981' },
        percentage,
      };
    } else {
      return {
        significance: `Damped Oscillation: Energy is dissipated as heat. Oscillation amplitude decays exponentially with envelope $A(t) = A_0 e^{-\\gamma t}$ where $\\gamma = \\frac{b}{2m}$.`,
        proportionality: 'A(t) = A_0 e^{-\\frac{b}{2m}t}, \\quad Q = \\frac{m\\omega_0}{b}',
        jeeInsight: 'Quality factor $Q = \\frac{\\omega_0 m}{b}$ measures resonance sharpness; higher damping broadens the resonance curve.',
        boundaryStatus: { label: '📉 Exponential Amplitude Decay', type: 'info', color: '#f59e0b' },
        percentage,
      };
    }
  }

  // 5. Mass (m)
  if (id.includes('mass') || id === 'm' || label.includes('mass')) {
    return {
      significance: `Inertial Mass $m = ${val}$ kg: Quantifies resistance to acceleration ($F=ma$) and determines momentum $p=mv$ and gravitational pull $F_g = mg$. In a vacuum, free-fall acceleration $g$ is mass-independent!`,
      proportionality: 'a = \\frac{F_{net}}{m}, \\quad p = mv, \\quad T_{shm} \\propto \\sqrt{m}',
      jeeInsight: 'Galilean Equivalence: Gravitational mass equals inertial mass, so all objects fall with identical acceleration in vacuum.',
      boundaryStatus: null,
      percentage,
    };
  }

  // 6. Height (h / h0)
  if (id.includes('height') || id === 'h' || id === 'h0' || label.includes('height')) {
    return {
      significance: `Initial Elevation $h = ${val}$ m: Adds potential energy $U = mgh$. Impact speed on ground increases to $v_{final} = \\sqrt{v_0^2 + 2gh}$.`,
      proportionality: 'v_{impact} = \\sqrt{v_0^2 + 2gh}, \\quad U = mgh',
      jeeInsight: 'When launched from height $h_0 > 0$, the optimal launch angle for maximum range is slightly LESS than $45^\\circ$ ($<45^\\circ$).',
      boundaryStatus: val === 0 ? { label: '🟩 Ground Level Launch (h₀=0)', type: 'info', color: '#10b981' } : { label: '🏰 Elevated Platform Launch', type: 'optimal', color: '#38bdf8' },
      percentage,
    };
  }

  // 7. Wavelength (lambda) & Slit Separation (d) - Wave Optics
  if (id.includes('wave') || id.includes('lambda') || id === 'wavelength' || label.includes('wavelength')) {
    return {
      significance: `Light Wavelength $\\lambda = ${val}$ nm: Directly sets fringe width $\\beta = \\frac{\\lambda D}{d}$ and diffraction spreading $\\theta \\approx \\frac{\\lambda}{a}$. Red light has larger fringes than blue/violet light.`,
      proportionality: '\\beta = \\frac{\\lambda D}{d}, \\quad \\theta_{diffraction} \\propto \\lambda',
      jeeInsight: 'If the entire apparatus is immersed in water ($n=1.33$), wavelength shortens to $\\lambda\' = \\lambda/n$, shrinking fringe width $\\beta\' = \\beta/n$.',
      boundaryStatus: { label: `🌈 Spectral Band (${val > 620 ? 'Red' : val > 570 ? 'Yellow' : val > 490 ? 'Green' : 'Blue/Violet'})`, type: 'info', color: val > 620 ? '#ef4444' : val > 490 ? '#10b981' : '#38bdf8' },
      percentage,
    };
  }

  if (id.includes('slit') || id === 'd' || label.includes('slit distance') || label.includes('separation')) {
    return {
      significance: `Slit Spacing $d = ${val}$ mm: Inversely proportional to fringe width $\\beta = \\frac{\\lambda D}{d}$. Decreasing $d$ spreads fringes wider apart; increasing $d$ packs fringes closer together.`,
      proportionality: '\\beta \\propto \\frac{1}{d}, \\quad \\Delta x_{dark} = (2n-1)\\frac{\\lambda D}{2d}',
      jeeInsight: 'For clean interference, $d$ must be comparable to or slightly larger than $\\lambda$; if $d \\gg \\lambda$, fringes become imperceptibly dense.',
      boundaryStatus: val <= min * 1.5 ? { label: '🔍 Wide Interference Fringes', type: 'optimal', color: '#10b981' } : null,
      percentage,
    };
  }

  // 8. Magnetic Field (B) & Lorentz Force
  if (id.includes('magnetic') || id === 'b_field' || id === 'b' || label.includes('magnetic field')) {
    return {
      significance: `Magnetic Field $B = ${val}$ T: Exerts magnetic Lorentz force $\\vec{F} = q(\\vec{v} \\times \\vec{B})$. Higher $B$ curves charged particle orbits more tightly ($r = \\frac{mv}{qB}$) and raises cyclotron frequency.`,
      proportionality: 'r = \\frac{mv}{qB}, \\quad \\omega_c = \\frac{qB}{m}, \\quad F = qvB\\sin\\theta',
      jeeInsight: 'Magnetic force does ZERO work ($W=0$) because $\\vec{F} \\perp \\vec{v}$. It changes direction of velocity, never kinetic energy or speed!',
      boundaryStatus: { label: '🌀 Lorentz Magnetic Deflection', type: 'info', color: '#06b6d4' },
      percentage,
    };
  }

  // 9. Electric Charge (q / q1 / q2) & Field
  if (id.includes('charge') || id === 'q' || id === 'q1' || id === 'q2' || label.includes('charge')) {
    return {
      significance: `Electric Charge $q = ${val}$ $\\mu$C: Coulomb Force follows inverse-square law $F = \\frac{1}{4\\pi\\epsilon_0}\\frac{|q_1 q_2|}{r^2}$. Doubling charge doubles force and electric field magnitude $E = \\frac{kq}{r^2}$.`,
      proportionality: 'F_e \\propto q_1 q_2, \\quad E = \\frac{q}{4\\pi\\epsilon_0 r^2}, \\quad U = \\frac{q_1 q_2}{4\\pi\\epsilon_0 r}',
      jeeInsight: 'Electric field lines originate from positive charges and terminate on negative charges; field line density indicates field strength.',
      boundaryStatus: val === 0 ? { label: '⚪ Neutral (Zero Field)', type: 'limit', color: '#71717a' } : null,
      percentage,
    };
  }

  // 10. Resistance (R), Inductance (L), Capacitance (C) in LCR
  if (id === 'r' || id.includes('resistance') || label.includes('resistance')) {
    return {
      significance: `Ohmic Resistance $R = ${val}$ $\\Omega$: Dissipates energy as Joule heat ($P = I_{rms}^2 R$) and dampens circuit resonance. Higher $R$ lowers Quality factor $Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}}$.`,
      proportionality: 'Z = \\sqrt{R^2 + (X_L - X_C)^2}, \\quad Q = \\frac{\\omega_0 L}{R}',
      jeeInsight: 'At resonance, impedance $Z = R$ (minimum), so current $I_{rms} = V_{rms}/R$ reaches its absolute maximum peak.',
      boundaryStatus: val <= min * 1.5 ? { label: '⚡ Sharp Resonance Peak (High Q)', type: 'optimal', color: '#10b981' } : null,
      percentage,
    };
  }

  if (id === 'l' || id.includes('induct') || label.includes('inductance')) {
    return {
      significance: `Inductance $L = ${val}$ mH: Stores magnetic energy $U_B = \\frac{1}{2}LI^2$. Inductive reactance $X_L = 2\\pi f L$ opposes AC current changes and leads voltage by $90^\\circ$.`,
      proportionality: 'X_L = \\omega L = 2\\pi f L, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
      jeeInsight: 'An inductor behaves like an open circuit at $t=0^+$ (switch close) and a short circuit (zero resistance wire) at steady state $t \\to \\infty$ in DC.',
      boundaryStatus: null,
      percentage,
    };
  }

  if (id === 'c' || id.includes('capacit') || label.includes('capacitance')) {
    return {
      significance: `Capacitance $C = ${val}$ $\\mu$F: Stores electrostatic energy $U_E = \\frac{1}{2}CV^2$. Capacitive reactance $X_C = \\frac{1}{2\\pi f C}$ opposes AC and current leads voltage by $90^\\circ$.`,
      proportionality: 'X_C = \\frac{1}{\\omega C}, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}, \\quad C = \\frac{K\\epsilon_0 A}{d}',
      jeeInsight: 'A capacitor behaves like a short circuit at $t=0^+$ (uncharged) and an open circuit (infinite resistance) at DC steady state $t \\to \\infty$.',
      boundaryStatus: null,
      percentage,
    };
  }

  // 11. Refractive Index (mu / n) & Ray Optics
  if (id.includes('index') || id.includes('mu') || id === 'n' || label.includes('refractive index')) {
    const critAngle = val > 1 ? Math.round(Math.asin(1 / val) * (180 / Math.PI) * 10) / 10 : 90;
    return {
      significance: `Refractive Index $\\mu = ${val}$: Speed of light in medium slows to $v = c/\\mu$. Critical angle for Total Internal Reflection (TIR) is $\\theta_c = \\arcsin(1/\\mu) = ${critAngle}^\\circ$.`,
      proportionality: 'n_1\\sin i = n_2\\sin r, \\quad \\sin\\theta_c = \\frac{1}{\\mu}, \\quad v = \\frac{c}{\\mu}',
      jeeInsight: 'Higher refractive index increases chromatic dispersion and shifts apparent depth shallower: $d_{apparent} = d_{real}/\\mu$.',
      boundaryStatus: { label: `💎 Critical Angle θ_c = ${critAngle}°`, type: 'optimal', color: '#10b981' },
      percentage,
    };
  }

  // 12. Friction Coefficients (mu_s, mu_k)
  if (id.includes('frict') || id === 'mu_s' || id === 'mu_k' || label.includes('friction')) {
    return {
      significance: `Friction Coefficient $\\mu = ${val}$: Sets maximum grip force $f_s^{\\max} = \\mu_s N$. Kinetic friction force during sliding is $f_k = \\mu_k N$ (dissipating mechanical energy into thermal heat).`,
      proportionality: 'f_s \\le \\mu_s N, \\quad f_k = \\mu_k N, \\quad W_{friction} = -f_k \\cdot d',
      jeeInsight: 'Always verify $\\mu_s \\ge \\mu_k$. Static friction is always greater than or equal to kinetic friction for any physical surface pair.',
      boundaryStatus: val === 0 ? { label: '🧊 Frictionless Surface (Ideal)', type: 'limit', color: '#38bdf8' } : null,
      percentage,
    };
  }

  // 13. General Fallback with parameter context
  return {
    significance: param.description
      ? `${param.label} set to ${val} ${param.unit}: ${param.description}. Direct parametric scaling factor.`
      : `${param.label} adjusted to ${val} ${param.unit}. Modifies governing state equations and trajectory boundaries.`,
    proportionality: `\\text{Value} = ${val}\\text{ }${param.unit} \\quad (${percentage}\\% \\text{ of range})`,
    jeeInsight: 'Observe the real-time 3D simulation stage and graph curves to track how this parameter influences physical equilibrium.',
    boundaryStatus: percentage === 0 ? { label: 'Min Limit', type: 'limit', color: '#71717a' } : percentage === 100 ? { label: 'Max Limit', type: 'limit', color: '#71717a' } : null,
    percentage,
  };
}
