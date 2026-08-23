import { SimulationType } from '../types';

export interface VectorLegendItem {
  id: string;
  name: string;
  symbol: string;
  color: string; // CSS color or hex
  bgBadge: string;
  description: string;
  formula?: string;
  getLiveValue?: (params: Record<string, number>, simTime: number) => string;
}

export const VECTOR_LEGENDS: Record<SimulationType, VectorLegendItem[]> = {
  'projectile-motion': [
    {
      id: 'vel-arrow',
      name: 'Velocity Vector',
      symbol: 'v',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Instantaneous net velocity vector tangent to projectile trajectory.',
      formula: 'v = √(vx² + vy²)',
      getLiveValue: (p, t) => {
        const rad = ((p.theta || 45) * Math.PI) / 180;
        const ux = (p.u || 20) * Math.cos(rad);
        const uy = (p.u || 20) * Math.sin(rad);
        const g = p.g || 9.8;
        const T = (uy + Math.sqrt(uy * uy + 2 * g * (p.h0 || 0))) / g;
        const curT = Math.min(t % (T + 1.0), T);
        const vy = uy - g * curT;
        const v = Math.sqrt(ux * ux + vy * vy);
        return `${v.toFixed(2)} m/s`;
      },
    },
    {
      id: 'acc-arrow',
      name: 'Gravitational Accel (g)',
      symbol: 'g',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Constant downward acceleration due to gravity.',
      formula: 'a = -g ĵ',
      getLiveValue: (p) => `${(p.g || 9.8).toFixed(1)} m/s²`,
    },
    {
      id: 'vx-arrow',
      name: 'Horizontal Component',
      symbol: 'vx',
      color: '#06b6d4',
      bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Constant horizontal velocity component along X-axis.',
      formula: 'vx = u cos θ',
      getLiveValue: (p) => {
        const rad = ((p.theta || 45) * Math.PI) / 180;
        return `${((p.u || 20) * Math.cos(rad)).toFixed(2)} m/s`;
      },
    },
    {
      id: 'vy-arrow',
      name: 'Vertical Component',
      symbol: 'vy',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Time-dependent vertical velocity component.',
      formula: 'vy = u sin θ - gt',
      getLiveValue: (p, t) => {
        const rad = ((p.theta || 45) * Math.PI) / 180;
        const uy = (p.u || 20) * Math.sin(rad);
        const g = p.g || 9.8;
        const T = (uy + Math.sqrt(uy * uy + 2 * g * (p.h0 || 0))) / g;
        const curT = Math.min(t % (T + 1.0), T);
        const vy = uy - g * curT;
        return `${vy.toFixed(2)} m/s`;
      },
    },
  ],

  'inclined-plane-friction': [
    {
      id: 'mg-arrow',
      name: 'Gravitational Force (Weight)',
      symbol: 'mg',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Downward weight acting through center of mass.',
      formula: 'W = m · g',
      getLiveValue: (p) => `${((p.mass || 2) * (p.g || 9.8)).toFixed(1)} N`,
    },
    {
      id: 'normal-arrow',
      name: 'Normal Contact Force',
      symbol: 'N',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Perpendicular contact reaction from the inclined surface.',
      formula: 'N = m · g · cos θ',
      getLiveValue: (p) => {
        const rad = ((p.angle || 30) * Math.PI) / 180;
        return `${((p.mass || 2) * (p.g || 9.8) * Math.cos(rad)).toFixed(1)} N`;
      },
    },
    {
      id: 'friction-arrow',
      name: 'Frictional Force',
      symbol: 'f',
      color: '#f97316',
      bgBadge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      description: 'Opposing friction acting parallel to inclined surface.',
      formula: 'f_max = μ · N',
      getLiveValue: (p) => {
        const rad = ((p.angle || 30) * Math.PI) / 180;
        const N = (p.mass || 2) * (p.g || 9.8) * Math.cos(rad);
        return `${((p.mu || 0.3) * N).toFixed(1)} N`;
      },
    },
    {
      id: 'applied-arrow',
      name: 'Driving Parallel Force',
      symbol: 'F_∥',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Gravitational component pulling block down the incline.',
      formula: 'F_∥ = m · g · sin θ',
      getLiveValue: (p) => {
        const rad = ((p.angle || 30) * Math.PI) / 180;
        return `${((p.mass || 2) * (p.g || 9.8) * Math.sin(rad)).toFixed(1)} N`;
      },
    },
  ],

  'circular-motion': [
    {
      id: 'circ-v-arrow',
      name: 'Tangential Velocity',
      symbol: 'v',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Instantaneous linear velocity directed tangent to the circular path.',
      formula: 'v = ω · r',
      getLiveValue: (p) => `${((p.radius || 5) * (p.omega || 2)).toFixed(2)} m/s`,
    },
    {
      id: 'circ-fc-arrow',
      name: 'Centripetal Force',
      symbol: 'F_c',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Radially inward net force required to maintain circular trajectory.',
      formula: 'F_c = m · v² / r',
      getLiveValue: (p) => {
        const m = p.mass || 1;
        const r = p.radius || 5;
        const v = r * (p.omega || 2);
        return `${((m * v * v) / r).toFixed(1)} N`;
      },
    },
    {
      id: 'circ-n-arrow',
      name: 'Normal / Tension Force',
      symbol: 'N',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Contact or string tension providing inward radial support.',
      formula: 'N = m(g cos θ + v²/r)',
      getLiveValue: (p) => `${((p.mass || 1) * ((p.radius || 5) * Math.pow(p.omega || 2, 2) + 9.8)).toFixed(1)} N`,
    },
    {
      id: 'circ-mg-arrow',
      name: 'Gravitational Force',
      symbol: 'mg',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Downward gravitational pull on orbiting mass.',
      formula: 'W = m · g',
      getLiveValue: (p) => `${((p.mass || 1) * 9.8).toFixed(1)} N`,
    },
  ],

  'shm-spring-pendulum': [
    {
      id: 'shm-v-arrow',
      name: 'Oscillation Velocity',
      symbol: 'v',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Instantaneous velocity in harmonic motion (maximum at mean position).',
      formula: 'v(t) = ω · A · cos(ωt)',
      getLiveValue: (p, t) => {
        const k = p.k || 20;
        const m = p.mass || 1;
        const A = p.amplitude || 4;
        const omega = Math.sqrt(k / m);
        const v = -omega * A * Math.sin(omega * t);
        return `${Math.abs(v).toFixed(2)} m/s`;
      },
    },
    {
      id: 'shm-f-arrow',
      name: 'Restoring Force',
      symbol: 'F_s',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Hookes law restoring force directed towards equilibrium.',
      formula: 'F = -k · x',
      getLiveValue: (p, t) => {
        const k = p.k || 20;
        const m = p.mass || 1;
        const A = p.amplitude || 4;
        const omega = Math.sqrt(k / m);
        const x = A * Math.cos(omega * t);
        return `${Math.abs(k * x).toFixed(1)} N`;
      },
    },
  ],

  'pure-rolling-motion': [
    {
      id: 'roll-v-arrow',
      name: 'Center of Mass Velocity',
      symbol: 'v_{cm}',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Translational velocity of Center of Mass (v = R · ω for pure rolling without slip).',
      formula: 'v_{cm} = R \\cdot \\omega',
      getLiveValue: (p, t) => {
        const rad = ((p.theta || 30) * Math.PI) / 180;
        const beta = p.shapeFactor || 0.5;
        const a = (9.8 * Math.sin(rad)) / (1 + beta);
        const tRamp = Math.sqrt((2 * 11) / a);
        const curT = t % (tRamp + 3.6);
        const v = curT <= tRamp ? a * curT : a * tRamp;
        return `${v.toFixed(2)} m/s`;
      },
    },
    {
      id: 'roll-fric-arrow',
      name: 'Static Friction (No Slip)',
      symbol: 'f_s',
      color: '#f97316',
      bgBadge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      description: 'Static friction at instantaneous contact point enabling pure rolling (IAOR where v_contact = 0).',
      formula: 'f_s = \\frac{\\beta}{1 + \\beta} mg \\sin\\theta',
      getLiveValue: (p) => {
        const rad = ((p.theta || 30) * Math.PI) / 180;
        const beta = p.shapeFactor || 0.5;
        const m = p.mass || 2;
        const fs = (beta / (1 + beta)) * m * 9.8 * Math.sin(rad);
        return `${fs.toFixed(1)} N`;
      },
    },
    {
      id: 'roll-n-arrow',
      name: 'Normal Contact Reaction',
      symbol: 'N',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Perpendicular contact normal force exerted by the inclined plane.',
      formula: 'N = mg \\cos\\theta',
      getLiveValue: (p) => {
        const rad = ((p.theta || 30) * Math.PI) / 180;
        const m = p.mass || 2;
        return `${(m * 9.8 * Math.cos(rad)).toFixed(1)} N`;
      },
    },
    {
      id: 'roll-mg-arrow',
      name: 'Gravitational Force (Weight)',
      symbol: 'mg',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Downward gravitational weight acting through Center of Mass.',
      formula: 'W = m \\cdot g',
      getLiveValue: (p) => `${((p.mass || 2) * 9.8).toFixed(1)} N`,
    },
  ],

  'gravitational-orbit': [
    {
      id: 'orbit-v-arrow',
      name: 'Orbital Velocity',
      symbol: 'v_orb',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Tangential orbital velocity maintaining Keplerian orbit.',
      formula: 'v = √(GM / r)',
      getLiveValue: (p) => `${(p.v0 || 7.8).toFixed(2)} km/s`,
    },
    {
      id: 'orbit-fg-arrow',
      name: 'Gravitational Attraction',
      symbol: 'F_g',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Central gravitational force directed toward parent planet.',
      formula: 'F_g = G·M·m / r²',
      getLiveValue: (p) => {
        const r = (p.altitude || 1000) + 6400;
        return `${((398600 / (r * r)) * (p.mass || 500) * 1e-3).toFixed(2)} kN`;
      },
    },
  ],

  'vector-operations': [
    {
      id: 'vec-A',
      name: 'Vector A',
      symbol: 'A',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'First input vector defined in 3D Cartesian coordinates.',
      formula: 'A = Ax î + Ay ĵ + Az k̂',
      getLiveValue: (p) => `${Math.sqrt((p.ax || 4) ** 2 + (p.ay || 3) ** 2 + (p.az || 0) ** 2).toFixed(2)} units`,
    },
    {
      id: 'vec-B',
      name: 'Vector B',
      symbol: 'B',
      color: '#4ade80',
      bgBadge: 'bg-green-500/15 text-green-400 border-green-500/30',
      description: 'Second input vector defined in 3D Cartesian coordinates.',
      formula: 'B = Bx î + By ĵ + Bz k̂',
      getLiveValue: (p) => `${Math.sqrt((p.bx || 3) ** 2 + (p.by || 5) ** 2 + (p.bz || 0) ** 2).toFixed(2)} units`,
    },
    {
      id: 'vec-R',
      name: 'Resultant Vector (Sum)',
      symbol: 'R',
      color: '#a855f7',
      bgBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Vector addition Resultant (Parallelogram / Triangle Law).',
      formula: 'R = A + B',
      getLiveValue: (p) => {
        const rx = (p.ax || 4) + (p.bx || 3);
        const ry = (p.ay || 3) + (p.by || 5);
        const rz = (p.az || 0) + (p.bz || 0);
        return `${Math.sqrt(rx * rx + ry * ry + rz * rz).toFixed(2)} units`;
      },
    },
    {
      id: 'vec-Cross',
      name: 'Cross Product (Vector Product)',
      symbol: 'A × B',
      color: '#f43f5e',
      bgBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Perpendicular cross product vector following Right-Hand Rule.',
      formula: '|A × B| = |A||B| sin θ',
      getLiveValue: (p) => {
        const ax = p.ax || 4, ay = p.ay || 3, az = p.az || 0;
        const bx = p.bx || 3, by = p.by || 5, bz = p.bz || 0;
        const cx = ay * bz - az * by;
        const cy = az * bx - ax * bz;
        const cz = ax * by - ay * bx;
        return `${Math.sqrt(cx * cx + cy * cy + cz * cz).toFixed(2)} units`;
      },
    },
  ],

  'electric-field-charges': [
    {
      id: 'probe-e-arrow',
      name: 'Electric Field Probe',
      symbol: 'E',
      color: '#a855f7',
      bgBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Electric field vector measured at movable probe location.',
      formula: 'E = k Σ (q_i / r_i²) r̂_i',
      getLiveValue: (p) => `${((p.q1 || 5) * 1.8).toFixed(1)} N/C`,
    },
    {
      id: 'field-lines',
      name: 'Electric Field Lines',
      symbol: 'E_lines',
      color: '#818cf8',
      bgBadge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      description: 'Continuous lines of force emerging from +q and terminating on -q.',
      formula: 'dE = (1 / 4πε₀) (dq / r²)',
    },
  ],

  'lcr-circuit': [
    {
      id: 'phasor-i',
      name: 'Current Phasor (Reference)',
      symbol: 'I',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Reference AC current phasor rotating at angular frequency ω.',
      formula: 'I(t) = I₀ sin(ωt)',
      getLiveValue: (p) => `${((p.v0 || 220) / (p.r || 50)).toFixed(2)} A`,
    },
    {
      id: 'phasor-vr',
      name: 'Resistor Voltage (In-Phase)',
      symbol: 'V_R',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Voltage drop across Resistor (zero phase difference with current).',
      formula: 'V_R = I · R',
    },
    {
      id: 'phasor-vl',
      name: 'Inductor Voltage (+90° Lead)',
      symbol: 'V_L',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Inductive voltage drop leading circuit current by 90 degrees.',
      formula: 'V_L = I · ωL',
    },
    {
      id: 'phasor-vc',
      name: 'Capacitor Voltage (-90° Lag)',
      symbol: 'V_C',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Capacitive voltage drop lagging circuit current by 90 degrees.',
      formula: 'V_C = I / (ωC)',
    },
    {
      id: 'phasor-vnet',
      name: 'Net Applied Voltage Phasor',
      symbol: 'V_net',
      color: '#a855f7',
      bgBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Vector sum phasor of all three component voltages.',
      formula: 'V = √(VR² + (VL - VC)²)',
      getLiveValue: (p) => `${(p.v0 || 220).toFixed(0)} V`,
    },
  ],

  'lorentz-force-cyclotron': [
    {
      id: 'cyc-v-arrow',
      name: 'Charged Particle Velocity',
      symbol: 'v',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Instantaneous particle speed tangent to circular/helical orbit.',
      formula: 'v = q · B · r / m',
      getLiveValue: (p) => `${(p.velocity || 5).toFixed(1)} × 10⁶ m/s`,
    },
    {
      id: 'cyc-f-arrow',
      name: 'Magnetic Lorentz Force',
      symbol: 'F_B',
      color: '#f43f5e',
      bgBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Centripetal magnetic deflection force perpendicular to both v and B.',
      formula: 'F_B = q(v × B)',
      getLiveValue: (p) => `${((p.charge || 1) * (p.velocity || 5) * (p.bField || 2)).toFixed(1)} pN`,
    },
  ],

  'electromagnetic-induction': [
    {
      id: 'emi-b-arrow',
      name: 'Magnetic Field Vector',
      symbol: 'B',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'External uniform magnetic field piercing conducting loop.',
      formula: 'Φ = B · A · cos θ',
      getLiveValue: (p) => `${(p.bMax || 2.0).toFixed(2)} T`,
    },
    {
      id: 'emi-induced-i-arrow',
      name: 'Induced Current (Lenz Law)',
      symbol: 'I_ind',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Induced current circulation opposing rate of flux change.',
      formula: 'ε = -dΦ/dt',
    },
  ],

  'ray-optics-lens-prism': [
    {
      id: 'opt-object-arrow',
      name: 'Object Arrow',
      symbol: 'h_o',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Upright object placed on principal axis at distance u.',
      formula: 'u = object distance',
      getLiveValue: (p) => `${(p.objectHeight || 3).toFixed(1)} cm`,
    },
    {
      id: 'opt-image-arrow',
      name: 'Formed Image Arrow',
      symbol: 'h_i',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Real or virtual image formed at distance v with magnification m.',
      formula: 'm = h_i / h_o = v / u',
      getLiveValue: (p) => {
        const u = -(p.objectDistance || 25);
        const f = p.focalLength || 15;
        const v = (u * f) / (u + f);
        const m = -v / u;
        return `${Math.abs(m * (p.objectHeight || 3)).toFixed(1)} cm`;
      },
    },
  ],

  'biot-savart-ampere': [
    {
      id: 'bs-current-arrow',
      name: 'Circulating Electric Current',
      symbol: 'I',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Direction of electric current flow through conductor loop/wire.',
      formula: 'I = q / t',
      getLiveValue: (p) => `${(p.current || 10).toFixed(1)} A`,
    },
    {
      id: 'bs-bfield-arrow',
      name: 'Magnetic Field Vector',
      symbol: 'B',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Resultant magnetic field computed via Biot-Savart integration.',
      formula: 'B_axial = (μ₀ N I R²) / 2(R² + x²)^(3/2)',
      getLiveValue: (p) => {
        const i = p.current || 10;
        const R = (p.loopRadius || 8) * 0.01;
        const x = (p.axialDist || 6) * 0.01;
        const N = p.numTurns || 10;
        const mu0 = 4 * Math.PI * 1e-7;
        const B = ((mu0 * N * i * R * R) / (2 * Math.pow(R * R + x * x, 1.5))) * 1e3;
        return `${B.toFixed(2)} mT`;
      },
    },
  ],

  'gauss-law-flux': [
    {
      id: 'gl-efield-arrow',
      name: 'Electric Field Vectors',
      symbol: 'E',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Radial electric field vectors piercing the closed Gaussian surface.',
      formula: 'E = (1 / 4πε₀) (Q_encl / r²)',
      getLiveValue: (p) => {
        const q = p.chargeQ || 20;
        const r = (p.gaussianRadius || 8) * 0.01;
        const E = (8.99e9 * q * 1e-9) / (r * r);
        return `${E.toFixed(0)} N/C`;
      },
    },
    {
      id: 'gl-area-arrow',
      name: 'Gaussian Surface Normal',
      symbol: 'dA',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Outward pointing unit normal area vectors over surface S.',
      formula: 'Φ = ∮ E · dA = Q_encl / ε₀',
    },
  ],

  'bernoulli-fluid-flow': [
    {
      id: 'bf-velocity-arrow',
      name: 'Efflux Velocity Vector',
      symbol: 'v_eff',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Torricelli drainage jet efflux speed discharging from orifice.',
      formula: 'v = √(2g · [H - h])',
      getLiveValue: (p) => {
        const H = p.tankHeight || 5;
        const h = p.orificeHeight || 2;
        const v = Math.sqrt(2 * 9.8 * Math.max(0, H - h));
        return `${v.toFixed(2)} m/s`;
      },
    },
    {
      id: 'bf-range-target',
      name: 'Maximum Range Target',
      symbol: 'R_max',
      color: '#22c55e',
      bgBadge: 'bg-green-500/15 text-green-400 border-green-500/30',
      description: 'Horizontal landing spot of fluid parabolic jet stream.',
      formula: 'R = 2√(h · [H - h])',
      getLiveValue: (p) => {
        const H = p.tankHeight || 5;
        const h = p.orificeHeight || 2;
        const R = 2 * Math.sqrt(h * Math.max(0, H - h));
        return `${R.toFixed(2)} m`;
      },
    },
  ],

  'wave-optics-polarization': [
    {
      id: 'pol-e-field',
      name: 'E-Field Oscillation Vector',
      symbol: 'E',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Transverse electric field vibration plane of light wave.',
      formula: 'I = I₀ · cos² θ',
      getLiveValue: (p) => {
        const theta = ((p.analyzerAngle || 45) * Math.PI) / 180;
        const transmitted = 0.5 * Math.pow(Math.cos(theta), 2);
        return `${(transmitted * 100).toFixed(1)}% Intensity`;
      },
    },
  ],

  'standing-waves-acoustics': [
    {
      id: 'sw-displacement',
      name: 'Standing Wave Envelope',
      symbol: 'y(x,t)',
      color: '#a855f7',
      bgBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Stationary wave pattern showing resonant Nodes (zero amplitude) and Antinodes.',
      formula: 'y = 2A sin(kx) cos(ωt)',
      getLiveValue: (p) => {
        const L = p.tubeLength || 1.5;
        const v = p.soundSpeed || 340;
        const n = p.harmonicMode || 2;
        const f = (n * v) / (2 * L);
        return `${f.toFixed(1)} Hz (Harmonic #${n})`;
      },
    },
  ],

  'radioactivity-nuclear-decay': [
    {
      id: 'rad-parent',
      name: 'Parent Nuclei (Active)',
      symbol: 'N(t)',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Undecayed radioactive parent atoms emitting alpha/beta radiation.',
      formula: 'N(t) = N₀ e^(-λt)',
      getLiveValue: (p, t) => {
        const N0 = p.initialNuclei || 1000;
        const tHalf = p.halfLife || 5;
        const N = N0 * Math.pow(0.5, t / tHalf);
        return `${Math.round(N)} nuclei`;
      },
    },
    {
      id: 'rad-daughter',
      name: 'Daughter Product (Stable)',
      symbol: "N'(t)",
      color: '#06b6d4',
      bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Stable daughter nuclei formed following radioactive decay.',
      formula: "N' = N₀(1 - e^(-λt))",
      getLiveValue: (p, t) => {
        const N0 = p.initialNuclei || 1000;
        const tHalf = p.halfLife || 5;
        const N = N0 * (1 - Math.pow(0.5, t / tHalf));
        return `${Math.round(N)} nuclei`;
      },
    },
  ],

  'heat-transfer-radiation': [
    {
      id: 'ht-radiator',
      name: 'Blackbody Radiator Surface',
      symbol: 'T',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Thermal core emitting full electromagnetic spectrum governed by Stefan-Boltzmann.',
      formula: 'P = e · σ · A · (T⁴ - T₀⁴)',
      getLiveValue: (p) => `${p.bodyTemp || 1500} K`,
    },
    {
      id: 'ht-waves',
      name: 'Emitted Thermal Waves',
      symbol: 'λ_max',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Expanding radiation wavefronts with peak wavelength from Wiens law.',
      formula: 'λ_max · T = 2.898 × 10⁻³ m·K',
      getLiveValue: (p) => {
        const T = p.bodyTemp || 1500;
        const lambda = (2.898e-3 / T) * 1e9;
        return `${lambda.toFixed(0)} nm`;
      },
    },
  ],

  'youngs-double-slit': [
    {
      id: 'ydse-wavefront',
      name: 'Secondary Huygens Wavelets',
      symbol: 'ψ(r,t)',
      color: '#22c55e',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Synchronously expanding coherent cylindrical wavelets emanating from slits S₁ and S₂.',
      formula: 'ψ(r,t) = (A/√r) cos(kr - ωt)',
      getLiveValue: (p) => `λ = ${p.wavelength || 550} nm`,
    },
    {
      id: 'ydse-antinodal',
      name: 'Constructive Maxima Lines',
      symbol: 'Δx = nλ',
      color: '#06b6d4',
      bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Hyperbolic antinodal loci where wave crests meet crests (in-phase, 4I₀ peak intensity).',
      formula: 'y_n = n(λD/d)',
      getLiveValue: (p) => {
        const lam_m = (p.wavelength || 550) * 1e-9;
        const d_m = (p.d || 0.4) * 1e-3;
        const D_m = p.D || 1.5;
        const beta = ((lam_m * D_m) / d_m) * 1000;
        return `Fringe Width β = ${beta.toFixed(3)} mm`;
      },
    },
    {
      id: 'ydse-nodal',
      name: 'Destructive Minima Lines',
      symbol: 'Δx = (n-½)λ',
      color: '#ef4444',
      bgBadge: 'bg-red-500/15 text-red-400 border-red-500/30',
      description: 'Nodal loci where wave crest meets trough in spatial opposition (complete wave cancellation, zero intensity).',
      formula: 'y_n = (n - ½)(λD/d)',
    },
    {
      id: 'ydse-rays',
      name: 'Optical Rays to Point P',
      symbol: 'r₁, r₂',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Geometric light ray trajectories from secondary slits S₁ and S₂ to screen test point P.',
      formula: 'r₂ - r₁ = d · sin θ',
      getLiveValue: (p) => `y_P = ${(p.probeY ?? 2.06).toFixed(2)} mm`,
    },
    {
      id: 'ydse-pathdiff',
      name: 'Optical Path Difference',
      symbol: 'Δx',
      color: '#a855f7',
      bgBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Extra distance traversed by light from S₂ relative to S₁ before meeting at point P on the screen.',
      formula: 'Δx = (y_P · d) / D',
      getLiveValue: (p) => {
        const lam_m = (p.wavelength || 550) * 1e-9;
        const d_m = (p.d || 0.4) * 1e-3;
        const D_m = p.D || 1.5;
        const y_m = (p.probeY ?? 2.06) * 1e-3;
        const deltaX_nm = ((y_m * d_m) / D_m) * 1e9;
        const inLambda = deltaX_nm / ((p.wavelength || 550));
        return `Δx = ${deltaX_nm.toFixed(1)} nm (${inLambda.toFixed(2)}λ)`;
      },
    },
  ],

  'photoelectric-effect': [
    {
      id: 'pe-photon',
      name: 'Incident Photon Energy',
      symbol: 'h\\nu',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Monochromatic photon energy quantum striking cathode plate.',
      formula: 'E = h\\nu',
      getLiveValue: (p) => {
        const freq = p.frequency || 8.0;
        const E = 4.1357e-15 * (freq * 1e14);
        return `${E.toFixed(2)} eV`;
      },
    },
    {
      id: 'pe-electron',
      name: 'Max Kinetic Energy (K_max)',
      symbol: 'K_{\\max}',
      color: '#06b6d4',
      bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Maximum kinetic energy of liberated photoelectrons.',
      formula: 'K_{\\max} = h\\nu - \\Phi_0',
      getLiveValue: (p) => {
        const freq = p.frequency || 8.0;
        const E = 4.1357e-15 * (freq * 1e14);
        const phi = p.workFunction || 2.3;
        const Kmax = Math.max(0, E - phi);
        return `${Kmax.toFixed(2)} eV`;
      },
    },
    {
      id: 'pe-stopping',
      name: 'Stopping Potential (V₀)',
      symbol: 'V_0',
      color: '#ef4444',
      bgBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Minimum reverse retarding potential required to reduce photocurrent to zero.',
      formula: 'V_0 = K_{\\max} / e',
      getLiveValue: (p) => {
        const freq = p.frequency || 8.0;
        const E = 4.1357e-15 * (freq * 1e14);
        const phi = p.workFunction || 2.3;
        const Kmax = Math.max(0, E - phi);
        return `${Kmax.toFixed(2)} V`;
      },
    },
    {
      id: 'pe-current',
      name: 'Active Photocurrent (I)',
      symbol: 'I_{photo}',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Measured circuit current collected at the anode.',
      formula: 'I \\propto \\text{Intensity} \\text{ (for } V > -V_0\\text{)}',
      getLiveValue: (p) => {
        const freq = p.frequency || 8.0;
        const E = 4.1357e-15 * (freq * 1e14);
        const phi = p.workFunction || 2.3;
        const Kmax = Math.max(0, E - phi);
        const retV = p.retardingV || 0;
        const I_sat = (p.intensity || 5) * 2.4;
        if (Kmax <= 0) return '0.00 μA (Below ν₀)';
        if (retV <= -Kmax) return '0.00 μA (Cutoff)';
        if (retV >= 0) return `${I_sat.toFixed(1)} μA (Saturation)`;
        const fraction = Math.max(0, (Kmax + retV) / Kmax);
        return `${(I_sat * fraction).toFixed(1)} μA`;
      },
    },
  ],

  'bohr-atom-spectrum': [
    {
      id: 'bohr-orbit',
      name: 'Quantized Electron Orbit',
      symbol: 'r_n',
      color: '#06b6d4',
      bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Stable Bohr circular orbit satisfying angular momentum quantization L = n(h/2π).',
      formula: 'r_n = 0.529 · n² / Z Å',
      getLiveValue: (p) => `${(0.529 * Math.pow(p.nPrincipal || 2, 2)).toFixed(2)} Å`,
    },
    {
      id: 'bohr-photon',
      name: 'Emitted Spectral Line',
      symbol: 'ΔE',
      color: '#ec4899',
      bgBadge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      description: 'Photon emitted during transition between quantum energy levels.',
      formula: 'ΔE = 13.6(1/n₁² - 1/n₂²) eV',
    },
  ],

  'vernier-caliper': [
    {
      id: 'vc-msd',
      name: 'Main Scale Division (MSD)',
      symbol: 'MSD',
      color: '#3b82f6',
      bgBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      description: 'Fixed linear datum scale mark before vernier zero.',
      formula: 'Total = MSR + (VSR × LC)',
      getLiveValue: (p) => `${(p.objectSize || 18.4).toFixed(1)} mm`,
    },
    {
      id: 'vc-vsd',
      name: 'Vernier Coincidence Line',
      symbol: 'VSR',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Vernier scale division exactly collinear with a main scale mark.',
      formula: 'Least Count = 1 MSD - 1 VSD',
    },
    {
      id: 'vc-error-band',
      name: 'Uncertainty Tolerance Envelope (±ΔD)',
      symbol: '±ΔD',
      color: '#ec4899',
      bgBadge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      description: '3D translucent confidence volume & limit brackets [D - ΔD, D + ΔD].',
      formula: 'D = D_{meas} \\pm \\Delta D',
      getLiveValue: (p) => `±${(p.uncertainty || 0.05).toFixed(2)} mm`,
    },
    {
      id: 'vc-samples',
      name: 'Experimental Trial Scatter',
      symbol: 'N_{pts}',
      color: '#06b6d4',
      bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      description: 'Repeated micro-measurement sample readings scattered within error margin.',
      formula: '\\sigma = \\Delta D / \\sqrt{3}',
    },
  ],

  'screw-gauge': [
    {
      id: 'sg-psr',
      name: 'Pitch Scale Reading (PSR)',
      symbol: 'PSR',
      color: '#3b82f6',
      bgBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      description: 'Main linear axis sleeve graduation mark.',
      formula: 'Total = PSR + (CSR × LC)',
      getLiveValue: (p) => `${(p.objectThickness || 2.45).toFixed(2)} mm`,
    },
    {
      id: 'sg-csr',
      name: 'Circular Scale Reading (CSR)',
      symbol: 'CSR',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Thimble circular scale mark aligned with reference datum baseline.',
      formula: 'Least Count = Pitch / Total Divisions',
    },
    {
      id: 'sg-error-band',
      name: 'Uncertainty Tolerance Envelope (±Δd)',
      symbol: '±Δd',
      color: '#ec4899',
      bgBadge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      description: '3D translucent tolerance zone & confidence brackets [d - Δd, d + Δd].',
      formula: 'd = d_{meas} \\pm \\Delta d',
      getLiveValue: (p) => `±${(p.uncertainty || 0.010).toFixed(3)} mm`,
    },
    {
      id: 'sg-angular-error',
      name: 'Thimble Angular Uncertainty',
      symbol: 'Δθ',
      color: '#eab308',
      bgBadge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      description: 'Rotational arc uncertainty on circular scale corresponding to linear error.',
      formula: '\\Delta \\theta = (\\Delta d / P) \\times 360^\\circ',
      getLiveValue: (p) => `±${(((p.uncertainty || 0.010) / (p.pitch || 0.5)) * 360).toFixed(1)}°`,
    },
  ],

  'thermo-pv-cycle': [
    {
      id: 'pv-state',
      name: 'State Point Indicator',
      symbol: '(P, V, T)',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Current thermodynamic state on the PV indicator diagram.',
      formula: 'P · V = n · R · T',
      getLiveValue: (p) => `P = ${(p.p1 || 2).toFixed(1)} atm`,
    },
    {
      id: 'pv-work',
      name: 'Cyclic Work Output',
      symbol: 'W_net',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Net mechanical work enclosed by closed PV loop cycle.',
      formula: 'W = ∮ P dV',
    },
  ],

  'doppler-effect': [
    {
      id: 'dop-source',
      name: 'Source Velocity Vector',
      symbol: 'v_s',
      color: '#f59e0b',
      bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Speed of moving sound source along axis of propagation.',
      formula: "f' = f · [v ± v_o] / [v ∓ v_s]",
      getLiveValue: (p) => `${(p.vSource || 30).toFixed(1)} m/s`,
    },
    {
      id: 'dop-observer',
      name: 'Observer Velocity Vector',
      symbol: 'v_o',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Speed of observer moving toward or away from source.',
      getLiveValue: (p) => `${(p.vObserver || 0).toFixed(1)} m/s`,
    },
    {
      id: 'dop-waves',
      name: 'Acoustic Wavefronts',
      symbol: 'λ_app',
      color: '#38bdf8',
      bgBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Compressed (higher frequency) in front, rarefied (lower frequency) behind.',
      formula: 'λ_ahead = (v - v_s) / f',
    },
  ],
};
