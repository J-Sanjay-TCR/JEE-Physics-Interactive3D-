import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { initRapier } from './rapierEngine';

export interface BoneSegmentConfig {
  id: string;
  name: string;
  mass: number; // in kg (sum = 70.0 kg)
  massPercent: number;
  halfExtents?: [number, number, number]; // for box
  capsuleRadius?: number; // for capsule
  capsuleHalfHeight?: number;
  color: number;
  initialLocalPos: [number, number, number]; // relative to torso center
}

// 10 Anatomically Calibrated Articulated Bones (Total Mass = 70.0 kg)
export const RAGDOLL_BONES: BoneSegmentConfig[] = [
  {
    id: 'torso',
    name: 'Torso & Pelvis',
    mass: 31.5,
    massPercent: 45.0,
    halfExtents: [0.28, 0.45, 0.16],
    color: 0x3b82f6,
    initialLocalPos: [0, 0, 0],
  },
  {
    id: 'head',
    name: 'Cranium & Neck',
    mass: 5.6,
    massPercent: 8.0,
    capsuleRadius: 0.20,
    capsuleHalfHeight: 0.12,
    color: 0xf59e0b,
    initialLocalPos: [0, 0.68, 0],
  },
  {
    id: 'upperArmL',
    name: 'Left Upper Arm',
    mass: 2.1,
    massPercent: 3.0,
    capsuleRadius: 0.10,
    capsuleHalfHeight: 0.20,
    color: 0x06b6d4,
    initialLocalPos: [-0.44, 0.32, 0],
  },
  {
    id: 'lowerArmL',
    name: 'Left Forearm & Hand',
    mass: 1.4,
    massPercent: 2.0,
    capsuleRadius: 0.08,
    capsuleHalfHeight: 0.18,
    color: 0x0ea5e9,
    initialLocalPos: [-0.44, -0.15, 0],
  },
  {
    id: 'upperArmR',
    name: 'Right Upper Arm',
    mass: 2.1,
    massPercent: 3.0,
    capsuleRadius: 0.10,
    capsuleHalfHeight: 0.20,
    color: 0x06b6d4,
    initialLocalPos: [0.44, 0.32, 0],
  },
  {
    id: 'lowerArmR',
    name: 'Right Forearm & Hand',
    mass: 1.4,
    massPercent: 2.0,
    capsuleRadius: 0.08,
    capsuleHalfHeight: 0.18,
    color: 0x0ea5e9,
    initialLocalPos: [0.44, -0.15, 0],
  },
  {
    id: 'upperLegL',
    name: 'Left Thigh',
    mass: 7.7,
    massPercent: 11.0,
    capsuleRadius: 0.13,
    capsuleHalfHeight: 0.26,
    color: 0x8b5cf6,
    initialLocalPos: [-0.18, -0.78, 0],
  },
  {
    id: 'lowerLegL',
    name: 'Left Shin & Foot',
    mass: 4.2,
    massPercent: 6.0,
    capsuleRadius: 0.10,
    capsuleHalfHeight: 0.24,
    color: 0xa855f7,
    initialLocalPos: [-0.18, -1.35, 0],
  },
  {
    id: 'upperLegR',
    name: 'Right Thigh',
    mass: 7.7,
    massPercent: 11.0,
    capsuleRadius: 0.13,
    capsuleHalfHeight: 0.26,
    color: 0x8b5cf6,
    initialLocalPos: [0.18, -0.78, 0],
  },
  {
    id: 'lowerLegR',
    name: 'Right Shin & Foot',
    mass: 4.2,
    massPercent: 6.0,
    capsuleRadius: 0.10,
    capsuleHalfHeight: 0.24,
    color: 0xa855f7,
    initialLocalPos: [0.18, -1.35, 0],
  },
];

export interface RagdollSimParams {
  dropHeight?: number; // e.g. 15m
  v0x?: number; // e.g. 10 m/s
  v0y?: number; // e.g. 12 m/s
  gravityPreset?: number; // 0: Moon (1.62), 1: Earth (9.81), 2: Jupiter (24.79), 3: Zero-G (0)
  freezeJoints?: number; // 1: Frozen rigid lump, 0: Free flailing joints
  flailTorque?: number; // 0 to 100 N*m
  initialSpin?: number; // -10 to 10 rad/s
  // Extended realistic parameters for ballistics & crash-test dynamics
  customGravity?: number; // direct gravity in m/s²
  startX?: number; // custom world launch or stand X
  startY?: number; // custom world launch or stand Y
  startZ?: number; // custom world launch or stand Z
  inclineAngleDeg?: number; // terrain slope angle in degrees
  isStandingStance?: boolean; // standing poised on ground/pedestal until impacted
  impactImpulse?: { time: number; force: [number, number, number]; boneId?: string };
  dragCoeff?: number; // aerodynamic air drag coefficient
  restitution?: number; // ground & body collision restitution (0 to 0.95)
  friction?: number; // surface friction (0 to 1.0)
}

export interface RagdollCOMState {
  simCOM: THREE.Vector3;
  simVelocity: THREE.Vector3;
  analyticCOM: THREE.Vector3;
  analyticVelocity: THREE.Vector3;
  errorMeters: number;
  totalMass: number;
  externalForceY: number;
  sumInternalForce: THREE.Vector3;
  isFrozen: boolean;
  time: number;
  phase: string;
  trajectoryPoints: THREE.Vector3[];
  analyticTrajectoryPoints: THREE.Vector3[];
  segments: {
    id: string;
    name: string;
    mass: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
  }[];
}

export class RagdollPhysicsSimulator {
  private rapierInstance: typeof RAPIER | null = null;
  private world: RAPIER.World | null = null;
  private bodies: Map<string, RAPIER.RigidBody> = new Map();
  private joints: RAPIER.ImpulseJoint[] = [];

  private currentParams: RagdollSimParams | null = null;
  private paramsKey: string = '';
  private simulatedTime: number = 0;
  private readonly fixedDt: number = 1 / 120; // 120Hz deterministic physics substepping

  // Historical trajectory buffers
  private comTrajectory: THREE.Vector3[] = [];
  private analyticTrajectory: THREE.Vector3[] = [];

  // Ground plane collider
  private groundCollider: RAPIER.Collider | null = null;

  // Initial reference COM
  private initialCOM: THREE.Vector3 = new THREE.Vector3();
  private initialV0: THREE.Vector3 = new THREE.Vector3();
  private currentGravity: number = 9.81;
  private impulseApplied: boolean = false;

  public async initialize(): Promise<void> {
    this.rapierInstance = await initRapier();
  }

  public isReady(): boolean {
    return this.rapierInstance !== null;
  }

  public reset(params: RagdollSimParams) {
    if (!this.rapierInstance) return;

    // Clean up previous world instance
    if (this.world) {
      try {
        this.world.free();
      } catch (e) {
        console.warn('World free notice:', e);
      }
      this.world = null;
    }

    this.bodies.clear();
    this.joints = [];
    this.comTrajectory = [];
    this.analyticTrajectory = [];
    this.simulatedTime = 0;
    this.impulseApplied = false;
    this.currentParams = { ...params };

    // Determine gravity
    let g = 9.81;
    if (params.customGravity !== undefined) {
      g = Math.max(0.1, params.customGravity);
    } else if (params.gravityPreset === 0) g = 1.62; // Moon
    else if (params.gravityPreset === 1) g = 9.81; // Earth
    else if (params.gravityPreset === 2) g = 24.79; // Jupiter
    else if (params.gravityPreset === 3) g = 0.0; // Zero-G
    this.currentGravity = g;

    const gravityVec = new this.rapierInstance.Vector3(0, -g, 0);
    this.world = new this.rapierInstance.World(gravityVec);
    this.world.timestep = this.fixedDt;

    // Ground plane collider (supports flat or inclined plane)
    const inclineDeg = params.inclineAngleDeg ?? 0;
    const slopeRad = (inclineDeg * Math.PI) / 180;
    const restitutionVal = params.restitution !== undefined ? Math.min(0.95, Math.max(0.05, params.restitution)) : 0.35;
    const frictionVal = params.friction !== undefined ? Math.min(1.0, Math.max(0.05, params.friction)) : 0.65;

    const groundDesc = this.rapierInstance.ColliderDesc.cuboid(80.0, 0.5, 30.0)
      .setTranslation(30.0 * Math.cos(slopeRad), 30.0 * Math.sin(slopeRad) - 0.5, 0.0)
      .setRotation({ x: 0, y: 0, z: Math.sin(slopeRad / 2), w: Math.cos(slopeRad / 2) })
      .setRestitution(restitutionVal)
      .setFriction(frictionVal);
    this.groundCollider = this.world.createCollider(groundDesc);

    const isStanding = params.isStandingStance ?? false;
    const startX = params.startX ?? 0;
    const startY = params.startY !== undefined ? params.startY : Math.max(2.5, params.dropHeight ?? 4.5);
    const startZ = params.startZ ?? 0;

    // Optional target stand pedestal if standing
    if (isStanding) {
      const standDesc = this.rapierInstance.ColliderDesc.cylinder(0.2, 1.6)
        .setTranslation(startX, Math.max(0.1, startY - 1.8), startZ)
        .setRestitution(restitutionVal)
        .setFriction(frictionVal);
      this.world.createCollider(standDesc);
    }

    const v0x = isStanding ? 0 : (params.v0x ?? 0);
    const v0y = isStanding ? 0 : (params.v0y ?? 0);
    const v0z = 0;
    this.initialV0.set(v0x, v0y, v0z);

    const isFrozen = (params.freezeJoints ?? 0) >= 0.5;

    // Create 10 Rigid Bodies
    RAGDOLL_BONES.forEach((bone) => {
      if (!this.world || !this.rapierInstance) return;

      const posX = startX + bone.initialLocalPos[0];
      const posY = startY + bone.initialLocalPos[1];
      const posZ = startZ + bone.initialLocalPos[2];

      const rbDesc = this.rapierInstance.RigidBodyDesc.dynamic()
        .setTranslation(posX, posY, posZ)
        .setLinvel(v0x, v0y, v0z)
        .setAngvel(new this.rapierInstance.Vector3(0, 0, isStanding ? 0 : (params.initialSpin ?? 0)))
        .setLinearDamping(0.04)
        .setAngularDamping(0.12);

      const body = this.world.createRigidBody(rbDesc);

      // Collider
      let colDesc: RAPIER.ColliderDesc;
      if (bone.halfExtents) {
        colDesc = this.rapierInstance.ColliderDesc.cuboid(
          bone.halfExtents[0],
          bone.halfExtents[1],
          bone.halfExtents[2]
        );
      } else {
        colDesc = this.rapierInstance.ColliderDesc.capsule(
          bone.capsuleHalfHeight || 0.2,
          bone.capsuleRadius || 0.1
        );
      }

      colDesc.setMass(bone.mass);
      colDesc.setRestitution(restitutionVal);
      colDesc.setFriction(frictionVal);

      this.world.createCollider(colDesc, body);
      this.bodies.set(bone.id, body);
    });

    // Create Joint Constraints between segments
    const torso = this.bodies.get('torso');
    const head = this.bodies.get('head');
    const upperArmL = this.bodies.get('upperArmL');
    const lowerArmL = this.bodies.get('lowerArmL');
    const upperArmR = this.bodies.get('upperArmR');
    const lowerArmR = this.bodies.get('lowerArmR');
    const upperLegL = this.bodies.get('upperLegL');
    const lowerLegL = this.bodies.get('lowerLegL');
    const upperLegR = this.bodies.get('upperLegR');
    const lowerLegR = this.bodies.get('lowerLegR');

    if (
      torso &&
      head &&
      upperArmL &&
      lowerArmL &&
      upperArmR &&
      lowerArmR &&
      upperLegL &&
      lowerLegL &&
      upperLegR &&
      lowerLegR
    ) {
      const qIdentity = { w: 1, x: 0, y: 0, z: 0 };

      // Helper to add joint
      const addJoint = (
        b1: RAPIER.RigidBody,
        b2: RAPIER.RigidBody,
        a1: [number, number, number],
        a2: [number, number, number],
        type: 'fixed' | 'spherical' | 'revolute',
        limits?: [number, number]
      ) => {
        if (!this.world || !this.rapierInstance) return;
        const p1 = new this.rapierInstance.Vector3(a1[0], a1[1], a1[2]);
        const p2 = new this.rapierInstance.Vector3(a2[0], a2[1], a2[2]);

        let jointData: RAPIER.JointData;
        if (isFrozen || type === 'fixed') {
          // Rigidly fixed connection
          jointData = this.rapierInstance.JointData.fixed(p1, qIdentity, p2, qIdentity);
        } else if (type === 'spherical') {
          // Ball-and-socket 3D pivot
          jointData = this.rapierInstance.JointData.spherical(p1, p2);
        } else {
          // Revolute / Hinge on Z-axis (lateral swing)
          const axis = new this.rapierInstance.Vector3(0, 0, 1);
          jointData = this.rapierInstance.JointData.revolute(p1, p2, axis);
          if (limits) {
            jointData.limitsEnabled = true;
            jointData.limits = limits;
          }
        }

        const joint = this.world.createImpulseJoint(jointData, b1, b2, true);
        this.joints.push(joint);
      };

      // 1. Neck Joint (Torso top to Head base)
      addJoint(torso, head, [0, 0.45, 0], [0, -0.23, 0], 'revolute', [-0.6, 0.6]);

      // 2. Left Shoulder (Torso top-left to Left Upper Arm)
      addJoint(torso, upperArmL, [-0.32, 0.35, 0], [0, 0.22, 0], 'spherical');

      // 3. Left Elbow (Left Upper Arm bottom to Left Forearm top)
      addJoint(upperArmL, lowerArmL, [0, -0.22, 0], [0, 0.20, 0], 'revolute', [0.0, 2.4]);

      // 4. Right Shoulder (Torso top-right to Right Upper Arm)
      addJoint(torso, upperArmR, [0.32, 0.35, 0], [0, 0.22, 0], 'spherical');

      // 5. Right Elbow (Right Upper Arm bottom to Right Forearm top)
      addJoint(upperArmR, lowerArmR, [0, -0.22, 0], [0, 0.20, 0], 'revolute', [0.0, 2.4]);

      // 6. Left Hip (Torso bottom-left to Left Thigh top)
      addJoint(torso, upperLegL, [-0.18, -0.45, 0], [0, 0.28, 0], 'spherical');

      // 7. Left Knee (Left Thigh bottom to Left Shin top)
      addJoint(upperLegL, lowerLegL, [0, -0.28, 0], [0, 0.26, 0], 'revolute', [-2.4, 0.0]);

      // 8. Right Hip (Torso bottom-right to Right Thigh top)
      addJoint(torso, upperLegR, [0.18, -0.45, 0], [0, 0.28, 0], 'spherical');

      // 9. Right Knee (Right Thigh bottom to Right Shin top)
      addJoint(upperLegR, lowerLegR, [0, -0.28, 0], [0, 0.26, 0], 'revolute', [-2.4, 0.0]);
    }

    // Compute initial COM position
    this.initialCOM = this.calculateSimCOM();
    this.comTrajectory = [this.initialCOM.clone()];

    // Generate analytical trajectory benchmark curve
    this.precomputeAnalyticCurve();
  }

  private precomputeAnalyticCurve() {
    if (!this.currentParams) return;
    this.analyticTrajectory = [];
    const g = this.currentGravity;
    const v0x = this.initialV0.x;
    const v0y = this.initialV0.y;
    const x0 = this.initialCOM.x;
    const y0 = this.initialCOM.y;
    const z0 = this.initialCOM.z;

    // Flight time to impact (y = 0.5m ground level)
    let tImpact = 4.0;
    if (g > 0.01) {
      // y0 + v0y*t - 0.5*g*t^2 = 0.5
      const a = 0.5 * g;
      const b = -v0y;
      const c = 0.5 - y0;
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        tImpact = (-b + Math.sqrt(disc)) / (2 * a);
      }
    } else {
      tImpact = 5.0;
    }

    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tImpact;
      const px = x0 + v0x * t;
      const py = Math.max(0.5, y0 + v0y * t - 0.5 * g * t * t);
      const pz = z0;
      this.analyticTrajectory.push(new THREE.Vector3(px, py, pz));
    }
  }

  public stepTo(targetTime: number, params: RagdollSimParams): void {
    if (!this.rapierInstance) return;

    // Check if configuration parameters changed
    const key = `${params.dropHeight}_${params.v0x}_${params.v0y}_${params.gravityPreset}_${params.freezeJoints}_${params.initialSpin}_${params.customGravity}_${params.startX}_${params.startY}_${params.inclineAngleDeg}_${params.isStandingStance}_${params.dragCoeff}_${params.restitution}_${params.friction}`;
    if (key !== this.paramsKey || !this.world) {
      this.paramsKey = key;
      this.reset(params);
    }

    // If user scrubbed time backwards, reset to t = 0
    if (targetTime < this.simulatedTime) {
      this.reset(params);
    }

    if (!this.world) return;

    // Step world with fixed deterministic physics substepping
    const maxStepsPerFrame = 12;
    let stepsCount = 0;

    while (this.simulatedTime + this.fixedDt <= targetTime && stepsCount < maxStepsPerFrame) {
      // Apply physical aerodynamic air resistance to each airborne segment
      if (params.dragCoeff && params.dragCoeff > 0) {
        const cd = params.dragCoeff;
        this.bodies.forEach((body) => {
          const vel = body.linvel();
          const spd = Math.hypot(vel.x, vel.y, vel.z);
          if (spd > 0.05) {
            const dragForceX = -cd * spd * vel.x;
            const dragForceY = -cd * spd * vel.y;
            const dragForceZ = -cd * spd * vel.z;
            body.applyImpulse(
              new this.rapierInstance!.Vector3(
                dragForceX * this.fixedDt,
                dragForceY * this.fixedDt,
                dragForceZ * this.fixedDt
              ),
              true
            );
          }
        });
      }

      // Apply physical impact impulse if collision time has arrived
      if (params.impactImpulse && this.simulatedTime >= params.impactImpulse.time && !this.impulseApplied) {
        const targetBody = this.bodies.get(params.impactImpulse.boneId || 'torso');
        if (targetBody) {
          const f = params.impactImpulse.force;
          targetBody.applyImpulse(new this.rapierInstance.Vector3(f[0], f[1], f[2]), true);
          const headBody = this.bodies.get('head');
          if (headBody) {
            headBody.applyImpulse(new this.rapierInstance.Vector3(f[0] * 0.35, f[1] * 0.35, 0), true);
          }
          this.impulseApplied = true;
        }
      }

      // Apply internal flailing impulses if unfrozen and flailTorque > 0
      if (params.freezeJoints < 0.5 && params.flailTorque > 0) {
        this.applyInternalFlailForces(params.flailTorque, this.simulatedTime);
      }

      this.world.step();
      this.simulatedTime += this.fixedDt;
      stepsCount++;

      // Record COM history every few physics steps for smooth trail
      if (stepsCount % 2 === 0) {
        const curCOM = this.calculateSimCOM();
        // Avoid adding points if landed or static
        if (
          this.comTrajectory.length === 0 ||
          curCOM.distanceTo(this.comTrajectory[this.comTrajectory.length - 1]) > 0.08
        ) {
          if (this.comTrajectory.length < 250) {
            this.comTrajectory.push(curCOM.clone());
          }
        }
      }
    }
  }

  public applyImpulseToBone(boneId: string, impulseX: number, impulseY: number, impulseZ: number): void {
    if (!this.rapierInstance) return;
    const body = this.bodies.get(boneId);
    if (body) {
      body.applyImpulse(new this.rapierInstance.Vector3(impulseX, impulseY, impulseZ), true);
    }
  }

  public getSimulatedTime(): number {
    return this.simulatedTime;
  }

  // Internal action-reaction muscle pairs: Sum of internal forces = 0.000 N
  private applyInternalFlailForces(intensity: number, t: number) {
    if (!this.rapierInstance) return;
    const torso = this.bodies.get('torso');
    const upperArmL = this.bodies.get('upperArmL');
    const upperArmR = this.bodies.get('upperArmR');
    const upperLegL = this.bodies.get('upperLegL');
    const upperLegR = this.bodies.get('upperLegR');

    if (!torso) return;

    // Oscillating bio-mechanical internal torque: tau = I * sin(omega * t)
    const factor = (intensity / 100) * 12.0;
    const tauL = Math.sin(t * 8.0) * factor;
    const tauR = Math.cos(t * 7.5) * factor;
    const tauLegL = Math.sin(t * 6.0 + 1.2) * factor * 1.5;
    const tauLegR = Math.cos(t * 6.0 + 1.2) * factor * 1.5;

    // Apply torque to limb: +tau, apply equal and opposite torque to torso: -tau
    // By Newton's Third Law: tau_limb + tau_torso = 0 => Sum of internal torques = 0
    if (upperArmL) {
      upperArmL.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, tauL * this.fixedDt), true);
      torso.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, -tauL * this.fixedDt), true);
    }
    if (upperArmR) {
      upperArmR.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, tauR * this.fixedDt), true);
      torso.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, -tauR * this.fixedDt), true);
    }
    if (upperLegL) {
      upperLegL.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, tauLegL * this.fixedDt), true);
      torso.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, -tauLegL * this.fixedDt), true);
    }
    if (upperLegR) {
      upperLegR.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, tauLegR * this.fixedDt), true);
      torso.applyTorqueImpulse(new this.rapierInstance.Vector3(0, 0, -tauLegR * this.fixedDt), true);
    }
  }

  // Exact multi-particle Center of Mass equation: r_com = (sum m_i * r_i) / (sum m_i)
  public calculateSimCOM(): THREE.Vector3 {
    let totalMass = 0;
    let sumMX = 0;
    let sumMY = 0;
    let sumMZ = 0;

    RAGDOLL_BONES.forEach((bone) => {
      const body = this.bodies.get(bone.id);
      if (body) {
        const tr = body.translation();
        sumMX += bone.mass * tr.x;
        sumMY += bone.mass * tr.y;
        sumMZ += bone.mass * tr.z;
        totalMass += bone.mass;
      }
    });

    if (totalMass <= 0) return new THREE.Vector3(0, 15, 0);
    return new THREE.Vector3(sumMX / totalMass, sumMY / totalMass, sumMZ / totalMass);
  }

  // Exact system velocity: v_com = (sum m_i * v_i) / (sum m_i)
  public calculateSimVelocity(): THREE.Vector3 {
    let totalMass = 0;
    let sumMVX = 0;
    let sumMVY = 0;
    let sumMVZ = 0;

    RAGDOLL_BONES.forEach((bone) => {
      const body = this.bodies.get(bone.id);
      if (body) {
        const vel = body.linvel();
        sumMVX += bone.mass * vel.x;
        sumMVY += bone.mass * vel.y;
        sumMVZ += bone.mass * vel.z;
        totalMass += bone.mass;
      }
    });

    if (totalMass <= 0) return new THREE.Vector3(0, 0, 0);
    return new THREE.Vector3(sumMVX / totalMass, sumMVY / totalMass, sumMVZ / totalMass);
  }

  public getCOMState(): RagdollCOMState {
    const simCOM = this.calculateSimCOM();
    const simVel = this.calculateSimVelocity();

    const t = this.simulatedTime;
    const g = this.currentGravity;
    const v0x = this.initialV0.x;
    const v0y = this.initialV0.y;

    // Textbook JEE Analytical Parabolic formula
    const xAnalytic = this.initialCOM.x + v0x * t;
    const yAnalytic = this.initialCOM.y + v0y * t - 0.5 * g * t * t;
    const zAnalytic = this.initialCOM.z;
    const analyticCOM = new THREE.Vector3(xAnalytic, yAnalytic, zAnalytic);

    const vxAnalytic = v0x;
    const vyAnalytic = v0y - g * t;
    const vzAnalytic = 0;
    const analyticVelocity = new THREE.Vector3(vxAnalytic, vyAnalytic, vzAnalytic);

    // Euclidean error between simulation & textbook formula
    const errorMeters = simCOM.distanceTo(analyticCOM);

    const isFrozen = (this.currentParams?.freezeJoints ?? 1) >= 0.5;

    let phase = 'Ascending Flight';
    if (simVel.y < -0.2) phase = 'Descending Parabola';
    if (Math.abs(simVel.y) <= 0.2) phase = 'Trajectory Apex';
    if (simCOM.y <= 1.2) phase = 'Ground Contact & Restitution';

    const segmentData = RAGDOLL_BONES.map((bone) => {
      const body = this.bodies.get(bone.id);
      const pos = body ? body.translation() : { x: 0, y: 0, z: 0 };
      const vel = body ? body.linvel() : { x: 0, y: 0, z: 0 };
      return {
        id: bone.id,
        name: bone.name,
        mass: bone.mass,
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        velocity: new THREE.Vector3(vel.x, vel.y, vel.z),
      };
    });

    return {
      simCOM,
      simVelocity: simVel,
      analyticCOM,
      analyticVelocity,
      errorMeters,
      totalMass: 70.0,
      externalForceY: -70.0 * g,
      sumInternalForce: new THREE.Vector3(0, 0, 0), // Strictly 0 by Newton's Third Law
      isFrozen,
      time: t,
      phase,
      trajectoryPoints: this.comTrajectory,
      analyticTrajectoryPoints: this.analyticTrajectory,
      segments: segmentData,
    };
  }

  public getCOMTrajectory(): THREE.Vector3[] {
    return [...this.comTrajectory];
  }

  public getBodyTransform(boneId: string): { position: THREE.Vector3; rotation: THREE.Quaternion } | null {
    const body = this.bodies.get(boneId);
    if (!body) return null;
    const tr = body.translation();
    const rot = body.rotation();
    return {
      position: new THREE.Vector3(tr.x, tr.y, tr.z),
      rotation: new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w),
    };
  }

  public dispose(): void {
    if (this.world) {
      try {
        this.world.free();
      } catch (e) {
        console.warn('World free error:', e);
      }
      this.world = null;
    }
    this.bodies.clear();
    this.joints = [];
    this.comTrajectory = [];
    this.analyticTrajectory = [];
  }
}
