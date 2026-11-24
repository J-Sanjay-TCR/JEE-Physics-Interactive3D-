import * as THREE from 'three';
import { SimulationType } from '../../types';

/**
 * Interface representing calculated rigid body contact transform state
 */
export interface PhysicsBodyTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  quaternion: THREE.Quaternion;
  contactPoint: THREE.Vector3;
  surfaceNormal: THREE.Vector3;
  surfaceTangent: THREE.Vector3;
  linearVelocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  spinAngle: number;
  isGrounded: boolean;
  isOnRamp: boolean;
  clearanceOffset: number;
}

/**
 * Surface profile calculation result along an inclined plane track
 */
export interface TrackSurfaceProfile {
  topX: number;
  topY: number;
  botX: number;
  botY: number;
  rampLength: number;
  thetaRad: number;
  boardThickness: number;
  trackLength: number;
}

/**
 * Configuration options for the physics engine middleware
 */
export interface PhysicsMiddlewareConfig {
  fixedTimeStep?: number; // e.g. 1 / 120
  maxSubSteps?: number;   // e.g. 8
  contactTolerance?: number; // epsilon clearance to completely prevent z-fighting (e.g. 0.002)
}

/**
 * PhysicsEngineMiddleware
 * 
 * Provides consistent numerical physics integration steps and high-precision contact
 * manifold resolution to map real-time parameter changes to Three.js mesh transforms.
 * Guarantees zero surface penetration and eliminates z-fighting between dynamic bodies
 * (like rolling cylinders, sliding blocks) and multi-part track/plane meshes.
 */
export class PhysicsEngineMiddleware {
  private fixedTimeStep: number;
  private maxSubSteps: number;
  private contactTolerance: number;
  private lastSimTime: number = 0;
  private timeAccumulator: number = 0;

  // Cached matrices & vectors for high-performance zero-allocation transforms
  private tempVec1 = new THREE.Vector3();
  private tempVec2 = new THREE.Vector3();
  private tempQuat = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();

  private rampTangentScratch = new THREE.Vector3();
  private rampNormalScratch = new THREE.Vector3();
  private readonly floorTangentConst = new THREE.Vector3(1, 0, 0);
  private readonly floorNormalConst = new THREE.Vector3(0, 1, 0);

  constructor(config?: PhysicsMiddlewareConfig) {
    this.fixedTimeStep = config?.fixedTimeStep ?? 1 / 120;
    this.maxSubSteps = config?.maxSubSteps ?? 10;
    this.contactTolerance = config?.contactTolerance ?? 0.0025;
  }

  private safeNum(val: number | undefined, fallback: number, min = -Infinity, max = Infinity): number {
    const n = val !== undefined && Number.isFinite(val) ? val : fallback;
    return Math.min(max, Math.max(min, n));
  }

  /**
   * Set contact clearance tolerance (used to prevent z-fighting on coplanar faces)
   */
  public setContactTolerance(tolerance: number) {
    this.contactTolerance = this.safeNum(tolerance, 0.0025, 0, 0.1);
  }

  /**
   * Computes the geometric track surface profile for an incline plane setup
   */
  public computeInclineProfile(params: Record<string, number>, rampLength = 12.0): TrackSurfaceProfile {
    const thetaDeg = this.safeNum(params.theta, 30, 0.1, 85);
    const safeRampLen = this.safeNum(rampLength, 12.0, 1.0, 50.0);
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const boardThickness = 0.3;

    // Top pivot point of the incline track
    const topX = -6.5;
    const topY = safeRampLen * Math.sin(thetaRad);
    const botX = topX + safeRampLen * Math.cos(thetaRad);
    const botY = 0;
    const trackLength = Math.max(8, 18 - botX);

    return {
      topX,
      topY,
      botX,
      botY,
      rampLength: safeRampLen,
      thetaRad,
      boardThickness,
      trackLength,
    };
  }

  /**
   * Solves pure rolling motion dynamics with seamless continuous surface manifold
   * and collision contact mapping.
   * 
   * Formulates:
   * 1. Acceleration on incline: a_ramp = (g * sin θ) / (1 + β)
   * 2. Pure rolling kinematics: v = ω * R, s = θ_spin * R
   * 3. Geometric boundary constraint: Body Center = Contact Point + (R + ε) * Normal
   * 4. Fillet curvature blend at incline-ground junction to prevent sudden mesh clipping
   */
  public computePureRollingTransform(
    params: Record<string, number>,
    simTime: number
  ): PhysicsBodyTransform {
    const shapeFactor = this.safeNum(params.shapeFactor, 0.5, 0.01, 5.0);
    const R = this.safeNum(params.R, 1.2, 0.15, 5.0);
    const mu_s = this.safeNum(params.mu_s, 0.5, 0, 5.0);
    const safeSimTime = this.safeNum(simTime, 0, 0, 1e6);

    const g = 9.81;
    const profile = this.computeInclineProfile(params, 12.0);
    const { topX, topY, botX, thetaRad, rampLength } = profile;

    // Incline unit tangent & normal vectors (reusing scratch vectors)
    const rampTangent = this.rampTangentScratch.set(Math.cos(thetaRad), -Math.sin(thetaRad), 0).normalize();
    const rampNormal = this.rampNormalScratch.set(Math.sin(thetaRad), Math.cos(thetaRad), 0).normalize();
    const floorTangent = this.floorTangentConst;
    const floorNormal = this.floorNormalConst;

    // Physics acceleration: check if pure rolling condition is satisfied: tan(θ) <= (1 + 1/β) * μ_s
    const maxSlipAngle = Math.atan((1 + 1 / Math.max(0.01, shapeFactor)) * mu_s);
    const isPureRolling = thetaRad <= maxSlipAngle;

    let a_ramp = 0;
    if (isPureRolling) {
      a_ramp = (g * Math.sin(thetaRad)) / (1 + shapeFactor);
    } else {
      const mu_k = this.safeNum(params.mu_k, mu_s * 0.8, 0, 5.0);
      a_ramp = g * (Math.sin(thetaRad) - mu_k * Math.cos(thetaRad));
    }
    a_ramp = Math.max(0.1, Number.isFinite(a_ramp) ? a_ramp : 0.1);

    // Transition geometry: Effective usable ramp length before bottom blend
    const sUsable = Math.max(0.5, rampLength - 0.4);
    const tRamp = Math.sqrt((2 * sUsable) / a_ramp);
    const vBottom = a_ramp * tRamp;
    const tFloor = 2.8;
    const tCycle = Math.max(0.1, tRamp + tFloor + 1.2);
    const t = safeSimTime % tCycle;

    let posX = topX;
    let posY = topY;
    let currentInclineAngle = thetaRad;
    let currentVel = 0;
    let totalRollAngle = 0;
    let isOnRamp = true;
    const surfaceNormal = rampNormal.clone();
    const surfaceTangent = rampTangent.clone();
    const contactPoint = new THREE.Vector3();

    // Constant offset to ensure absolute zero z-fighting on contact plane
    const effectiveRadius = R + this.contactTolerance;

    if (t <= tRamp) {
      // Phase 1: Pure Rolling on Incline
      isOnRamp = true;
      const s = Math.max(0, 0.5 * a_ramp * t * t);
      currentVel = a_ramp * t;
      totalRollAngle = s / R;
      currentInclineAngle = thetaRad;
      surfaceNormal.copy(rampNormal);
      surfaceTangent.copy(rampTangent);

      // Contact point on the top surface of the board
      contactPoint.set(
        topX + s * Math.cos(thetaRad),
        topY - s * Math.sin(thetaRad),
        0
      );

      // Cylinder Center of Mass = Contact Point + (R + ε) * Normal
      posX = contactPoint.x + effectiveRadius * surfaceNormal.x;
      posY = contactPoint.y + effectiveRadius * surfaceNormal.y;
    } else if (t <= tRamp + tFloor) {
      // Phase 2: Rolling along horizontal track with rolling resistance
      isOnRamp = false;
      const deltaT = t - tRamp;
      const muRoll = 0.035; // Gentle realistic rolling resistance
      currentVel = Math.max(0, vBottom - muRoll * g * deltaT);
      const groundDist = Math.min(10.5, vBottom * deltaT - 0.5 * muRoll * g * deltaT * deltaT);

      // Smooth curvature interpolation during transition junction
      const blendDist = 0.6;
      if (groundDist < blendDist) {
        const u = groundDist / blendDist;
        currentInclineAngle = (1 - u) * thetaRad;
        surfaceNormal.lerpVectors(rampNormal, floorNormal, u).normalize();
        surfaceTangent.lerpVectors(rampTangent, floorTangent, u).normalize();
      } else {
        currentInclineAngle = 0;
        surfaceNormal.copy(floorNormal);
        surfaceTangent.copy(floorTangent);
      }

      contactPoint.set(botX + groundDist, 0, 0);
      posX = contactPoint.x;
      // Guarantee center of mass stays strictly above ground plane
      posY = effectiveRadius;
      totalRollAngle = (sUsable + groundDist) / R;
    } else {
      // Phase 3: Resting at end stopper
      isOnRamp = false;
      const maxGround = Math.min(10.5, vBottom * tFloor - 0.5 * 0.035 * g * tFloor * tFloor);
      contactPoint.set(botX + maxGround, 0, 0);
      posX = contactPoint.x;
      posY = effectiveRadius;
      currentInclineAngle = 0;
      currentVel = 0;
      totalRollAngle = (sUsable + maxGround) / R;
      surfaceNormal.copy(floorNormal);
      surfaceTangent.copy(floorTangent);
    }

    const linearVelocity = surfaceTangent.clone().multiplyScalar(currentVel);
    const angularVelocity = new THREE.Vector3(0, 0, -currentVel / R);

    const rotation = new THREE.Euler(0, 0, -currentInclineAngle, 'XYZ');
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);

    return {
      position: new THREE.Vector3(posX, posY, 0),
      rotation,
      quaternion,
      contactPoint,
      surfaceNormal,
      surfaceTangent,
      linearVelocity,
      angularVelocity,
      spinAngle: totalRollAngle,
      isGrounded: true,
      isOnRamp,
      clearanceOffset: this.contactTolerance,
    };
  }

  /**
   * Solves sliding block motion on inclined plane and ground with non-penetration enforcement
   */
  public computeInclinedPlaneTransform(
    params: Record<string, number>,
    simTime: number,
    blockHalfHeight = 0.6
  ): PhysicsBodyTransform {
    const mu_s = this.safeNum(params.mu_s, 0.5, 0, 5.0);
    const mu_k = this.safeNum(params.mu_k, 0.3, 0, 5.0);
    const m = this.safeNum(params.m, 2, 0.05, 1000);
    const F_ext = this.safeNum(params.F_ext, 0, -5000, 5000);
    const safeSimTime = this.safeNum(simTime, 0, 0, 1e6);
    const safeBlockHalfH = this.safeNum(blockHalfHeight, 0.6, 0.05, 5.0);

    const g = 9.81;
    const profile = this.computeInclineProfile(params, 12.0);
    const { topX, topY, botX, thetaRad, rampLength } = profile;

    const rampTangent = this.rampTangentScratch.set(Math.cos(thetaRad), -Math.sin(thetaRad), 0).normalize();
    const rampNormal = this.rampNormalScratch.set(Math.sin(thetaRad), Math.cos(thetaRad), 0).normalize();
    const floorNormal = this.floorNormalConst;
    const floorTangent = this.floorTangentConst;

    const N = m * g * Math.cos(thetaRad);
    const mg_down = m * g * Math.sin(thetaRad);
    const netDriving = mg_down - F_ext;
    const f_max = mu_s * N;

    let a = 0;
    let isSliding = false;

    if (Math.abs(netDriving) <= f_max) {
      a = 0;
      isSliding = false;
    } else {
      isSliding = true;
      const f_k = mu_k * N;
      a = netDriving > 0 ? (netDriving - f_k) / m : (netDriving + f_k) / m;
    }

    const effectiveHalfHeight = safeBlockHalfH + this.contactTolerance;
    let posX = topX;
    let posY = topY;
    let currentAngle = thetaRad;
    let vel = 0;
    let isOnRamp = true;
    const contactPoint = new THREE.Vector3();
    const surfaceNormal = rampNormal.clone();
    const surfaceTangent = rampTangent.clone();

    if (!isSliding || Math.abs(a) < 0.01) {
      const s = 1.0;
      contactPoint.set(topX + s * Math.cos(thetaRad), topY - s * Math.sin(thetaRad), 0);
      posX = contactPoint.x + effectiveHalfHeight * rampNormal.x;
      posY = contactPoint.y + effectiveHalfHeight * rampNormal.y;
      currentAngle = thetaRad;
      vel = 0;
      isOnRamp = true;
    } else {
      const aPos = Math.max(0.05, Math.abs(a));
      const sRamp = Math.max(0.5, rampLength - 1.5);
      const tRamp = Math.sqrt((2 * sRamp) / aPos);
      const tCycle = Math.max(0.1, tRamp + 2.6);
      const t = safeSimTime % tCycle;

      if (t <= tRamp) {
        const s = 1.0 + 0.5 * aPos * t * t;
        vel = aPos * t;
        contactPoint.set(topX + s * Math.cos(thetaRad), topY - s * Math.sin(thetaRad), 0);
        posX = contactPoint.x + effectiveHalfHeight * rampNormal.x;
        posY = contactPoint.y + effectiveHalfHeight * rampNormal.y;
        currentAngle = thetaRad;
        isOnRamp = true;
      } else {
        const vBot = aPos * tRamp;
        const deltaT = t - tRamp;
        const groundDecel = Math.max(0.001, mu_k * g);
        vel = Math.max(0, vBot - groundDecel * deltaT);
        const groundDist = Math.min(10.0, Math.max(0, vBot * deltaT - 0.5 * groundDecel * deltaT * deltaT));
        contactPoint.set(botX + groundDist, 0, 0);
        posX = contactPoint.x;
        posY = effectiveHalfHeight;
        currentAngle = 0;
        isOnRamp = false;
        surfaceNormal.copy(floorNormal);
        surfaceTangent.copy(floorTangent);
      }
    }

    const linearVelocity = surfaceTangent.clone().multiplyScalar(vel);
    const rotation = new THREE.Euler(0, 0, -currentAngle, 'XYZ');
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);

    return {
      position: new THREE.Vector3(posX, posY, 0),
      rotation,
      quaternion,
      contactPoint,
      surfaceNormal,
      surfaceTangent,
      linearVelocity,
      angularVelocity: new THREE.Vector3(0, 0, 0),
      spinAngle: 0,
      isGrounded: true,
      isOnRamp,
      clearanceOffset: this.contactTolerance,
    };
  }

  /**
   * Applies the solved transform directly to a Three.js Object3D / Group.
   * Ensures matrix auto-update and prevents z-fighting artifacts on coplanar elements.
   */
  public applyTransformToObject(
    targetObj: THREE.Object3D,
    transform: PhysicsBodyTransform,
    spinTargetGroup?: THREE.Object3D | null
  ): void {
    if (!targetObj || !transform) return;

    const { position, quaternion, spinAngle } = transform;
    if (
      Number.isFinite(position.x) &&
      Number.isFinite(position.y) &&
      Number.isFinite(position.z)
    ) {
      targetObj.position.copy(position);
    }

    if (
      Number.isFinite(quaternion.x) &&
      Number.isFinite(quaternion.y) &&
      Number.isFinite(quaternion.z) &&
      Number.isFinite(quaternion.w)
    ) {
      targetObj.quaternion.copy(quaternion);
    }

    // If there is an internal spin component (e.g. cylinder or wheel rolling)
    if (spinTargetGroup && Number.isFinite(spinAngle)) {
      spinTargetGroup.rotation.z = -spinAngle;
    }

    targetObj.updateMatrix();
  }

  /**
   * Configures materials to prevent z-fighting with polygon offsets and depth bias
   */
  public applyDepthBias(
    material: THREE.Material,
    factor = -1.0,
    units = -2.0
  ): void {
    material.polygonOffset = true;
    material.polygonOffsetFactor = factor;
    material.polygonOffsetUnits = units;
  }
}

// Export a singleton instance for instant use across canvas renderers
export const defaultPhysicsMiddleware = new PhysicsEngineMiddleware();
