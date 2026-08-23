import * as THREE from 'three';
import { SimulationType } from '../../types';
import {
  PhysicsEngineMiddleware,
  defaultPhysicsMiddleware,
  PhysicsBodyTransform,
} from './physicsEngineMiddleware';

export interface SimRenderContext {
  scene: THREE.Scene;
  params: Record<string, number>;
  simTime: number;
  showVectors: boolean;
  showLabels: boolean;
  showTrajectory: boolean;
  showGrid: boolean;
  showAxes: boolean;
  isDark: boolean;
}

export class SimulationRenderer {
  private currentType: SimulationType | null = null;
  private objectsGroup: THREE.Group = new THREE.Group();
  private vectorGroup: THREE.Group = new THREE.Group();
  private labelsGroup: THREE.Group = new THREE.Group();
  private trajectoryLine: THREE.Line | null = null;
  private trajectoryPoints: THREE.Vector3[] = [];
  private particleSystem: THREE.Points | null = null;
  private physicsMiddleware: PhysicsEngineMiddleware = defaultPhysicsMiddleware;

  // Projectile caching
  private lastProjectileParamsStr: string = '';
  private projectilePath: {t: number, x: number, y: number, vx: number, vy: number, bounce: boolean}[] = [];
  private projectileTotalTime: number = 0;

  constructor(private scene: THREE.Scene) {
    this.scene.add(this.objectsGroup);
    this.scene.add(this.vectorGroup);
    this.scene.add(this.labelsGroup);
  }

  public initSimulation(type: SimulationType, context: SimRenderContext) {
    this.cleanup();
    this.currentType = type;
    this.trajectoryPoints = [];

    switch (type) {
      case 'projectile-motion':
        this.setupProjectile(context);
        break;
      case 'inclined-plane-friction':
        this.setupInclinedPlane(context);
        break;
      case 'shm-spring-pendulum':
        this.setupSHM(context);
        break;
      case 'electric-field-charges':
        this.setupElectricField(context);
        break;
      case 'lcr-circuit':
        this.setupLCR(context);
        break;
      case 'youngs-double-slit':
        this.setupYDSE(context);
        break;
      case 'vernier-caliper':
        this.setupVernier(context);
        break;
      case 'bohr-atom-spectrum':
        this.setupBohrAtom(context);
        break;
      case 'vector-operations':
        this.setupVectorOps(context);
        break;
      case 'gravitational-orbit':
        this.setupOrbit(context);
        break;
      case 'lorentz-force-cyclotron':
        this.setupCyclotron(context);
        break;
      case 'ray-optics-lens-prism':
        this.setupRayOptics(context);
        break;
      case 'screw-gauge':
        this.setupScrewGauge(context);
        break;
      case 'circular-motion':
        this.setupCircularMotion(context);
        break;
      case 'pure-rolling-motion':
        this.setupPureRolling(context);
        break;
      case 'electromagnetic-induction':
        this.setupEMI(context);
        break;
      case 'photoelectric-effect':
        this.setupPhotoelectric(context);
        break;
      case 'thermo-pv-cycle':
        this.setupThermoPVCycle(context);
        break;
      case 'doppler-effect':
        this.setupDopplerEffect(context);
        break;
      case 'biot-savart-ampere':
        this.setupBiotSavart(context);
        break;
      case 'gauss-law-flux':
        this.setupGaussLaw(context);
        break;
      case 'bernoulli-fluid-flow':
        this.setupBernoulliFlow(context);
        break;
      case 'wave-optics-polarization':
        this.setupPolarization(context);
        break;
      case 'standing-waves-acoustics':
        this.setupStandingWaves(context);
        break;
      case 'radioactivity-nuclear-decay':
        this.setupRadioactivity(context);
        break;
      case 'heat-transfer-radiation':
        this.setupHeatRadiation(context);
        break;
      default:
        this.setupDefault();
        break;
    }
  }

  public update(context: SimRenderContext) {
    if (!this.currentType) return;
    this.vectorGroup.visible = context.showVectors;
    this.labelsGroup.visible = context.showVectors && context.showLabels;

    switch (this.currentType) {
      case 'projectile-motion':
        this.updateProjectile(context);
        break;
      case 'inclined-plane-friction':
        this.updateInclinedPlane(context);
        break;
      case 'shm-spring-pendulum':
        this.updateSHM(context);
        break;
      case 'electric-field-charges':
        this.updateElectricField(context);
        break;
      case 'lcr-circuit':
        this.updateLCR(context);
        break;
      case 'youngs-double-slit':
        this.updateYDSE(context);
        break;
      case 'vernier-caliper':
        this.updateVernier(context);
        break;
      case 'bohr-atom-spectrum':
        this.updateBohrAtom(context);
        break;
      case 'vector-operations':
        this.updateVectorOps(context);
        break;
      case 'gravitational-orbit':
        this.updateOrbit(context);
        break;
      case 'lorentz-force-cyclotron':
        this.updateCyclotron(context);
        break;
      case 'ray-optics-lens-prism':
        this.updateRayOptics(context);
        break;
      case 'screw-gauge':
        this.updateScrewGauge(context);
        break;
      case 'circular-motion':
        this.updateCircularMotion(context);
        break;
      case 'pure-rolling-motion':
        this.updatePureRolling(context);
        break;
      case 'electromagnetic-induction':
        this.updateEMI(context);
        break;
      case 'photoelectric-effect':
        this.updatePhotoelectric(context);
        break;
      case 'thermo-pv-cycle':
        this.updateThermoPVCycle(context);
        break;
      case 'doppler-effect':
        this.updateDopplerEffect(context);
        break;
      case 'biot-savart-ampere':
        this.updateBiotSavart(context);
        break;
      case 'gauss-law-flux':
        this.updateGaussLaw(context);
        break;
      case 'bernoulli-fluid-flow':
        this.updateBernoulliFlow(context);
        break;
      case 'wave-optics-polarization':
        this.updatePolarization(context);
        break;
      case 'standing-waves-acoustics':
        this.updateStandingWaves(context);
        break;
      case 'radioactivity-nuclear-decay':
        this.updateRadioactivity(context);
        break;
      case 'heat-transfer-radiation':
        this.updateHeatRadiation(context);
        break;
    }
  }

  public cleanup() {
    while (this.objectsGroup.children.length > 0) {
      const obj = this.objectsGroup.children[0];
      this.disposeObject(obj);
      this.objectsGroup.remove(obj);
    }
    while (this.vectorGroup.children.length > 0) {
      const obj = this.vectorGroup.children[0];
      this.disposeObject(obj);
      this.vectorGroup.remove(obj);
    }
    while (this.labelsGroup.children.length > 0) {
      const obj = this.labelsGroup.children[0];
      this.disposeObject(obj);
      this.labelsGroup.remove(obj);
    }
    this.trajectoryLine = null;
    this.trajectoryPoints = [];
    this.particleSystem = null;
  }

  private disposeObject(obj: THREE.Object3D) {
    if ((obj as THREE.Mesh).geometry) {
      (obj as THREE.Mesh).geometry.dispose();
    }
    if ((obj as THREE.Mesh).material) {
      const mat = (obj as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
  }

  // --- Helper: Create Text Billboard Sprite for 3D Arrow Labels ---
  private createTextSprite(text: string, colorHex = '#22c55e'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const canvasWidth = Math.max(256, Math.min(720, text.length * 13 + 44));
    canvas.width = canvasWidth;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(12, 12, 18, 0.90)';
      ctx.beginPath();
      ctx.roundRect(6, 6, canvasWidth - 12, 60, 14);
      ctx.fill();

      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvasWidth / 2, 36);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(material);
    const spriteScaleX = (canvasWidth / 256) * 2.2;
    sprite.scale.set(spriteScaleX, 0.62, 1);
    (sprite as any).userData = { text, colorHex };
    return sprite;
  }

  private updateArrowLabel(name: string, text: string, colorHex: string, position: THREE.Vector3, visible = true) {
    let sprite = this.labelsGroup.getObjectByName(`label-${name}`) as THREE.Sprite;
    if (!sprite) {
      sprite = this.createTextSprite(text, colorHex);
      sprite.name = `label-${name}`;
      this.labelsGroup.add(sprite);
    } else if ((sprite as any).userData?.text !== text || (sprite as any).userData?.colorHex !== colorHex) {
      this.labelsGroup.remove(sprite);
      sprite.material.dispose();
      sprite = this.createTextSprite(text, colorHex);
      sprite.name = `label-${name}`;
      this.labelsGroup.add(sprite);
    }
    sprite.position.copy(position);
    sprite.visible = visible;
  }

  // --- Helper: Apply Hidden Vectors Filter ---
  public setHiddenVectors(hiddenIds: Set<string>) {
    this.vectorGroup.children.forEach((child) => {
      if (child.name && hiddenIds.has(child.name)) {
        child.visible = false;
      }
    });
    this.labelsGroup.children.forEach((child) => {
      const arrowName = child.name.replace('label-', '');
      if (hiddenIds.has(arrowName)) {
        child.visible = false;
      }
    });
  }

  // --- Helper: Create Arrow Vector ---
  private createArrow(name: string, color: number, origin = new THREE.Vector3(), dir = new THREE.Vector3(1, 0, 0), length = 1): THREE.ArrowHelper {
    const arrow = new THREE.ArrowHelper(dir.normalize(), origin, Math.max(0.1, length), color, 0.45, 0.22);
    arrow.name = name;
    arrow.renderOrder = 999;
    this.vectorGroup.add(arrow);
    return arrow;
  }

  // ==========================================
  // 1. PROJECTILE MOTION & REALISTIC RAGDOLL PHYSICS
  // ==========================================
  private setupProjectile(ctx: SimRenderContext) {
    const isDark = ctx.isDark;

    // 1. Launch Platform / Ground Terrain Runway
    const terrainGroup = new THREE.Group();
    terrainGroup.name = 'projectile-terrain-group';

    const groundGeo = new THREE.PlaneGeometry(80, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0xe2e8f0,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(25, 0, 0);
    terrainGroup.add(ground);

    // Distance Metric Marker Posts & Grid Stripes (every 5m up to 60m)
    for (let i = 0; i <= 12; i++) {
      const dist = i * 5;
      const stripeGeo = new THREE.BoxGeometry(0.12, 0.02, 18);
      const stripeMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? (isDark ? 0x38bdf8 : 0x0284c7) : (isDark ? 0x475569 : 0x94a3b8),
      });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(dist, 0.01, 0);
      terrainGroup.add(stripe);

      // Distance post marker on side of runway
      const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16);
      const postMat = new THREE.MeshStandardMaterial({
        color: dist % 10 === 0 ? 0xf59e0b : (isDark ? 0x64748b : 0x94a3b8),
        metalness: 0.7,
      });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(dist, 0.4, -9.5);
      terrainGroup.add(post);
    }
    
    this.objectsGroup.add(terrainGroup);

    // 2. Launch Fortress Tower (Scales with initial height h0)
    const towerGroup = new THREE.Group();
    towerGroup.name = 'projectile-tower-base';

    const towerGeo = new THREE.BoxGeometry(4.0, 1.0, 4.0);
    const towerMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x334155 : 0x64748b,
      roughness: 0.7,
      metalness: 0.3,
    });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.name = 'tower-mesh';
    towerMesh.position.y = 0.5;
    towerGroup.add(towerMesh);

    // Safety yellow hazard stripes around tower top
    const hazardGeo = new THREE.BoxGeometry(4.1, 0.15, 4.1);
    const hazardMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
      metalness: 0.5,
    });
    const hazardMesh = new THREE.Mesh(hazardGeo, hazardMat);
    hazardMesh.name = 'tower-hazard';
    hazardMesh.position.y = 1.0;
    towerGroup.add(hazardMesh);

    this.objectsGroup.add(towerGroup);

    // 3. Heavy 155mm Artillery Cannon & Mount
    const launcherGroup = new THREE.Group();
    launcherGroup.name = 'cannon-launcher-group';

    // Turret Base Plate
    const basePlateGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 32);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0x334155,
      metalness: 0.85,
      roughness: 0.3,
    });
    const basePlate = new THREE.Mesh(basePlateGeo, darkMetalMat);
    basePlate.position.y = 0.2;
    launcherGroup.add(basePlate);

    // Carriage side cheeks
    const cheekGeo = new THREE.BoxGeometry(0.4, 1.8, 1.6);
    const carriageMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x475569 : 0x64748b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const cheekL = new THREE.Mesh(cheekGeo, carriageMat);
    cheekL.position.set(0, 1.0, 0.8);
    launcherGroup.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, carriageMat);
    cheekR.position.set(0, 1.0, -0.8);
    launcherGroup.add(cheekR);

    // Elevation Trunnion Pivot
    const trunnionGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.0, 24);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
    const trunnion = new THREE.Mesh(trunnionGeo, brassMat);
    trunnion.rotation.x = Math.PI / 2;
    trunnion.position.y = 1.5;
    launcherGroup.add(trunnion);

    // Elevation Protractor Angle Dial
    const dialGeo = new THREE.RingGeometry(0.5, 0.75, 32, 1, 0, Math.PI / 2);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(0, 1.5, 1.02);
    launcherGroup.add(dial);

    // Cannon Barrel with Recoil Jacket & Muzzle Brake
    const cannon = new THREE.Group();
    cannon.name = 'cannon-barrel';
    cannon.position.y = 1.5;

    // Main rifled tube
    const barrelGeo = new THREE.CylinderGeometry(0.32, 0.48, 3.8, 32);
    const steelMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x64748b : 0x475569,
      metalness: 0.9,
      roughness: 0.2,
    });
    const barrelMesh = new THREE.Mesh(barrelGeo, steelMat);
    barrelMesh.position.y = 1.9;
    cannon.add(barrelMesh);

    // Recoil hydraulic buffer sleeve
    const recoilSleeveGeo = new THREE.CylinderGeometry(0.52, 0.54, 1.6, 28);
    const recoilSleeve = new THREE.Mesh(recoilSleeveGeo, darkMetalMat);
    recoilSleeve.position.y = 1.0;
    cannon.add(recoilSleeve);

    // Muzzle Brake with gas expansion ports
    const muzzleBrakeGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.6, 24);
    const muzzleBrake = new THREE.Mesh(muzzleBrakeGeo, brassMat);
    muzzleBrake.position.y = 3.8;
    cannon.add(muzzleBrake);

    // Muzzle Flash Shockwave Burst Mesh
    const flashGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0,
    });
    const muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    muzzleFlash.name = 'cannon-muzzle-flash';
    muzzleFlash.position.y = 4.2;
    cannon.add(muzzleFlash);

    launcherGroup.add(cannon);
    this.objectsGroup.add(launcherGroup);

    // 4. Aerodynamic Artillery Shell (Projectile)
    
    const shellGroup = new THREE.Group();
    shellGroup.name = 'projectile-ball';

    
    // Dummy inside shell
    const dmyGroup = new THREE.Group();
    dmyGroup.rotation.y = Math.PI / 2; 
    
    const dmySkin = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.9 });

    const dmyTorso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.25), dmySkin);
    dmyTorso.position.y = 0.35;
    dmyGroup.add(dmyTorso);

    const dmyHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), dmySkin);
    dmyHead.position.y = 0.85;
    dmyHead.name = 'dummy-head';
    
    const dmyEyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const dmyEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04), dmyEyeMat);
    dmyEyeR.position.set(0.08, 0.05, 0.17);
    const dmyEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04), dmyEyeMat);
    dmyEyeL.position.set(-0.08, 0.05, 0.17);
    dmyHead.add(dmyEyeR);
    dmyHead.add(dmyEyeL);
    dmyGroup.add(dmyHead);

    const dmyArmGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
    const dmyLarm = new THREE.Group();
    dmyLarm.position.set(-0.25, 0.65, 0);
    dmyLarm.name = 'dummy-larm';
    const dmyLarmMesh = new THREE.Mesh(dmyArmGeo, dmySkin);
    dmyLarmMesh.position.y = -0.25;
    dmyLarm.add(dmyLarmMesh);
    dmyGroup.add(dmyLarm);

    const dmyRarm = new THREE.Group();
    dmyRarm.position.set(0.25, 0.65, 0);
    dmyRarm.name = 'dummy-rarm';
    const dmyRarmMesh = new THREE.Mesh(dmyArmGeo, dmySkin);
    dmyRarmMesh.position.y = -0.25;
    dmyRarm.add(dmyRarmMesh);
    dmyGroup.add(dmyRarm);

    const dmyLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const dmyHipL = new THREE.Group();
    dmyHipL.position.set(-0.12, 0, 0);
    dmyHipL.name = 'dummy-hip-l';
    const dmyLleg = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyLleg.position.y = -0.25;
    dmyHipL.add(dmyLleg);
    
    const dmyKneeL = new THREE.Group();
    dmyKneeL.position.y = -0.5;
    dmyKneeL.name = 'dummy-knee-l';
    const dmyLcalf = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyLcalf.position.y = -0.25;
    dmyKneeL.add(dmyLcalf);
    dmyHipL.add(dmyKneeL);
    dmyGroup.add(dmyHipL);

    const dmyHipR = new THREE.Group();
    dmyHipR.position.set(0.12, 0, 0);
    dmyHipR.name = 'dummy-hip-r';
    const dmyRleg = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyRleg.position.y = -0.25;
    dmyHipR.add(dmyRleg);

    const dmyKneeR = new THREE.Group();
    dmyKneeR.position.y = -0.5;
    dmyKneeR.name = 'dummy-knee-r';
    const dmyRcalf = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyRcalf.position.y = -0.25;
    dmyKneeR.add(dmyRcalf);
    dmyHipR.add(dmyKneeR);
    dmyGroup.add(dmyHipR);

    dmyGroup.position.y = -0.1;
    shellGroup.add(dmyGroup);



    this.objectsGroup.add(shellGroup);

    // 5. Parabolic Trajectory Line
    const trajGeo = new THREE.BufferGeometry();
    const trajMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.6,
      gapSize: 0.3,
      linewidth: 2,
    });
    this.trajectoryLine = new THREE.Line(trajGeo, trajMat);
    this.trajectoryLine.name = 'trajectory';
    this.objectsGroup.add(this.trajectoryLine);

    // 6. Apex Peak Indicator Beacon
    const apexGroup = new THREE.Group();
    apexGroup.name = 'projectile-apex-group';

    const apexSphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const apexSphereMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.8,
    });
    const apexSphere = new THREE.Mesh(apexSphereGeo, apexSphereMat);
    apexGroup.add(apexSphere);

    // Vertical Dotted Height Line
    const apexLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -10, 0),
    ]);
    const apexLineMat = new THREE.LineDashedMaterial({
      color: 0xec4899,
      dashSize: 0.4,
      gapSize: 0.2,
    });
    const apexLine = new THREE.Line(apexLineGeo, apexLineMat);
    apexLine.name = 'apex-line';
    apexGroup.add(apexLine);

    this.objectsGroup.add(apexGroup);

    // 7. Landing Target Bullseye & Impact Crater
    const targetRingGroup = new THREE.Group();
    targetRingGroup.name = 'projectile-target-group';

    const outerRingGeo = new THREE.RingGeometry(1.2, 1.4, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.02;
    targetRingGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(0.4, 0.6, 32);
    const innerRing = new THREE.Mesh(innerRingGeo, outerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.02;
    targetRingGroup.add(innerRing);

    // Impact Scorch Crater (grows and fades upon landing)
    const craterGeo = new THREE.CircleGeometry(1.8, 32);
    const craterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const crater = new THREE.Mesh(craterGeo, craterMat);
    crater.name = 'impact-crater';
    crater.rotation.x = -Math.PI / 2;
    crater.position.y = 0.025;
    targetRingGroup.add(crater);

    // Blast dust ring
    const dustGeo = new THREE.RingGeometry(0.1, 0.8, 24);
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const dust = new THREE.Mesh(dustGeo, dustMat);
    dust.name = 'impact-dust';
    dust.rotation.x = -Math.PI / 2;
    dust.position.y = 0.03;
    targetRingGroup.add(dust);

    this.objectsGroup.add(targetRingGroup);

    // 8. Anatomically Articulated Crash-Test Dummy Ragdoll
    const ragdoll = new THREE.Group();
    ragdoll.name = 'target-ragdoll';

    const dummyYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.35,
      roughness: 0.4,
    });
    const dummyDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.4,
    });
    const dummyAccentMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.6,
      roughness: 0.3,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.2,
    });

    // A. Pelvis / Hips (Root Base of Ragdoll skeleton)
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'ragdoll-pelvis';
    pelvisGroup.position.y = 1.45;

    const pelvisGeo = new THREE.BoxGeometry(0.72, 0.4, 0.45);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, dummyDarkMat);
    pelvisGroup.add(pelvisMesh);

    // B. Spine & Torso with Crash Test Emblem
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'ragdoll-torso';
    torsoGroup.position.y = 0.2; // Pivot at waist/lumbar

    const torsoGeo = new THREE.BoxGeometry(0.85, 0.95, 0.52);
    const torsoMesh = new THREE.Mesh(torsoGeo, dummyYellowMat);
    torsoMesh.position.y = 0.5;
    torsoGroup.add(torsoMesh);

    // Crash Test Quadrant Target on Chest
    const targetGeo = new THREE.CircleGeometry(0.2, 32);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.position.set(0, 0.55, 0.27);
    torsoGroup.add(targetMesh);

    // C. Neck & Crash Helmet Head
    const neckGroup = new THREE.Group();
    neckGroup.name = 'ragdoll-neck';
    neckGroup.position.y = 1.0;

    const headGeo = new THREE.SphereGeometry(0.3, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, dummyAccentMat);
    headMesh.position.y = 0.32;
    neckGroup.add(headMesh);

    // Helmet Visor
    const visorGeo = new THREE.BoxGeometry(0.38, 0.16, 0.2);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.9 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.32, 0.22);
    neckGroup.add(visor);

    torsoGroup.add(neckGroup);

    // D. Left & Right Arm Articulations (Shoulder -> Upper Arm -> Elbow -> Forearm -> Hand)
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.5, 16);
    const forearmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 16);
    const jointGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const handGeo = new THREE.BoxGeometry(0.12, 0.14, 0.08);

    // Left Arm Hierarchy
    const shoulderL = new THREE.Group();
    shoulderL.name = 'ragdoll-shoulder-l';
    shoulderL.position.set(0.55, 0.85, 0);

    const shoulderLJoint = new THREE.Mesh(jointGeo, jointMat);
    shoulderL.add(shoulderLJoint);

    const upperArmL = new THREE.Mesh(armGeo, dummyYellowMat);
    upperArmL.position.y = -0.28;
    shoulderL.add(upperArmL);

    const elbowL = new THREE.Group();
    elbowL.name = 'ragdoll-elbow-l';
    elbowL.position.y = -0.55;

    const elbowLJoint = new THREE.Mesh(jointGeo, jointMat);
    elbowL.add(elbowLJoint);

    const forearmL = new THREE.Mesh(forearmGeo, dummyDarkMat);
    forearmL.position.y = -0.25;
    elbowL.add(forearmL);

    const handL = new THREE.Mesh(handGeo, dummyAccentMat);
    handL.position.y = -0.52;
    elbowL.add(handL);

    shoulderL.add(elbowL);
    torsoGroup.add(shoulderL);

    // Right Arm Hierarchy
    const shoulderR = new THREE.Group();
    shoulderR.name = 'ragdoll-shoulder-r';
    shoulderR.position.set(-0.55, 0.85, 0);

    const shoulderRJoint = new THREE.Mesh(jointGeo, jointMat);
    shoulderR.add(shoulderRJoint);

    const upperArmR = new THREE.Mesh(armGeo, dummyYellowMat);
    upperArmR.position.y = -0.28;
    shoulderR.add(upperArmR);

    const elbowR = new THREE.Group();
    elbowR.name = 'ragdoll-elbow-r';
    elbowR.position.y = -0.55;

    const elbowRJoint = new THREE.Mesh(jointGeo, jointMat);
    elbowR.add(elbowRJoint);

    const forearmR = new THREE.Mesh(forearmGeo, dummyDarkMat);
    forearmR.position.y = -0.25;
    elbowR.add(forearmR);

    const handR = new THREE.Mesh(handGeo, dummyAccentMat);
    handR.position.y = -0.52;
    elbowR.add(handR);

    shoulderR.add(elbowR);
    torsoGroup.add(shoulderR);

    pelvisGroup.add(torsoGroup);

    // E. Left & Right Leg Articulations (Hip -> Thigh -> Knee -> Shin -> Foot)
    const thighGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 16);
    const shinGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.6, 16);
    const footGeo = new THREE.BoxGeometry(0.16, 0.1, 0.32);

    // Left Leg
    const hipL = new THREE.Group();
    hipL.name = 'ragdoll-hip-l';
    hipL.position.set(0.24, -0.15, 0);

    const hipLJoint = new THREE.Mesh(jointGeo, jointMat);
    hipL.add(hipLJoint);

    const thighL = new THREE.Mesh(thighGeo, dummyDarkMat);
    thighL.position.y = -0.35;
    hipL.add(thighL);

    const kneeL = new THREE.Group();
    kneeL.name = 'ragdoll-knee-l';
    kneeL.position.y = -0.7;

    const kneeLJoint = new THREE.Mesh(jointGeo, jointMat);
    kneeL.add(kneeLJoint);

    const shinL = new THREE.Mesh(shinGeo, dummyYellowMat);
    shinL.position.y = -0.32;
    kneeL.add(shinL);

    const footL = new THREE.Mesh(footGeo, dummyAccentMat);
    footL.position.set(0, -0.65, 0.08);
    kneeL.add(footL);

    hipL.add(kneeL);
    pelvisGroup.add(hipL);

    // Right Leg
    const hipR = new THREE.Group();
    hipR.name = 'ragdoll-hip-r';
    hipR.position.set(-0.24, -0.15, 0);

    const hipRJoint = new THREE.Mesh(jointGeo, jointMat);
    hipR.add(hipRJoint);

    const thighR = new THREE.Mesh(thighGeo, dummyDarkMat);
    thighR.position.y = -0.35;
    hipR.add(thighR);

    const kneeR = new THREE.Group();
    kneeR.name = 'ragdoll-knee-r';
    kneeR.position.y = -0.7;

    const kneeRJoint = new THREE.Mesh(jointGeo, jointMat);
    kneeR.add(kneeRJoint);

    const shinR = new THREE.Mesh(shinGeo, dummyYellowMat);
    shinR.position.y = -0.32;
    kneeR.add(shinR);

    const footR = new THREE.Mesh(footGeo, dummyAccentMat);
    footR.position.set(0, -0.65, 0.08);
    kneeR.add(footR);

    hipR.add(kneeR);
    pelvisGroup.add(hipR);

    ragdoll.add(pelvisGroup);
    this.objectsGroup.add(ragdoll);

    // 9. Velocity Arrow & Acceleration Arrows
    this.createArrow('vel-arrow', 0x22c55e);
    this.createArrow('acc-arrow', 0xef4444);
    this.createArrow('vx-arrow', 0x06b6d4);
    this.createArrow('vy-arrow', 0xf59e0b);
  }

  private updateProjectile(ctx: SimRenderContext) {
    const { u, theta, g, h0 = 0, planeAngle = 0 } = ctx.params;
    const rad = (theta * Math.PI) / 180;
    const alpha = (planeAngle * Math.PI) / 180;
    
    // Rotate terrain to match planeAngle
    const terrainGroup = this.objectsGroup.getObjectByName('projectile-terrain-group');
    if (terrainGroup) {
      // Rotate around z-axis, base at x=0
      terrainGroup.position.set(0, 0, 0); // we will move the ground locally
      terrainGroup.rotation.z = alpha;
      
      const ground = terrainGroup.children[0];
      if (ground) {
        // Shift it so it aligns nicely
        ground.position.set(25, 0, 0); 
      }
    }

    // Cache trajectory calculation
    const currentParamsStr = JSON.stringify({ u, theta, g, h0, planeAngle });
    if (this.lastProjectileParamsStr !== currentParamsStr) {
      this.lastProjectileParamsStr = currentParamsStr;
      this.projectilePath = [];
      
      let t = 0, x = 0, y = h0;
      let vx = u * Math.cos(rad);
      let vy = u * Math.sin(rad);
      const dt = 0.01;
      let bounces = 0;
      let isBouncing = false;
      
      this.projectilePath.push({ t, x, y, vx, vy, bounce: false });
      
      while(t < 25 && x < 85 && bounces < 4 && x > -10) {
        t += dt;
        x += vx * dt;
        y += vy * dt - 0.5 * g * dt * dt;
        vy -= g * dt;
        
        // Ground equation
        const planeY = x * Math.tan(alpha);
        
        let bounce = false;
        if (y <= planeY && !isBouncing) {
          y = planeY;
          const v_n = -vx * Math.sin(alpha) + vy * Math.cos(alpha);
          const v_p = vx * Math.cos(alpha) + vy * Math.sin(alpha);
          
          if (v_n < 0 && Math.abs(v_n) < 0.5) {
            isBouncing = true;
          } else if (v_n < 0) {
            const e = 0.55; // bounce factor
            const v_n_new = -v_n * e;
            const v_p_new = v_p * 0.85; // sliding friction
            vx = v_p_new * Math.cos(alpha) - v_n_new * Math.sin(alpha);
            vy = v_p_new * Math.sin(alpha) + v_n_new * Math.cos(alpha);
            bounce = true;
            bounces++;
          }
        }
        if (y > planeY + 0.1) isBouncing = false;
        
        this.projectilePath.push({ t, x, y, vx, vy, bounce });
        if (bounces >= 3) break;
      }
      this.projectileTotalTime = t;
      
      // Update trajectory line geometry
      if (this.trajectoryLine) {
        const pts = this.projectilePath.map(p => new THREE.Vector3(p.x, p.y, 0));
        this.trajectoryLine.geometry.setFromPoints(pts);
        this.trajectoryLine.computeLineDistances();
      }
    }

    if (this.projectilePath.length === 0) return;

    // First impact analytics
    let firstImpactIdx = this.projectilePath.findIndex(p => p.bounce);
    if (firstImpactIdx === -1) firstImpactIdx = this.projectilePath.length - 1;
    const impactPoint = this.projectilePath[firstImpactIdx];
    const T = impactPoint.t;
    const range = Math.hypot(impactPoint.x, impactPoint.y);
    
    // Find apex before first impact
    let max_y = -Infinity;
    let apex_x = 0;
    for(let i = 0; i <= firstImpactIdx; i++) {
       if (this.projectilePath[i].y > max_y) {
           max_y = this.projectilePath[i].y;
           apex_x = this.projectilePath[i].x;
       }
    }

    // Time cycle logic
    const cycleDuration = this.projectileTotalTime + 1.5;
    const tInCycle = ctx.simTime % cycleDuration;
    
    // Interpolate current state
    let currentState = this.projectilePath[this.projectilePath.length - 1];
    let isLanded = true;
    for (let i = 0; i < this.projectilePath.length - 1; i++) {
      if (tInCycle >= this.projectilePath[i].t && tInCycle <= this.projectilePath[i+1].t) {
        const p1 = this.projectilePath[i];
        const p2 = this.projectilePath[i+1];
        const f = (tInCycle - p1.t) / (p2.t - p1.t);
        currentState = {
          t: tInCycle,
          x: p1.x + (p2.x - p1.x) * f,
          y: p1.y + (p2.y - p1.y) * f,
          vx: p1.vx + (p2.vx - p1.vx) * f,
          vy: p1.vy + (p2.vy - p1.vy) * f,
          bounce: p1.bounce || p2.bounce
        };
        isLanded = false;
        break;
      }
    }

    // 1. Tower Elevation Base Update
    const tower = this.objectsGroup.getObjectByName('projectile-tower-base');
    if (tower) {
      tower.visible = h0 > 0.1;
      const mesh = tower.getObjectByName('tower-mesh');
      const hazard = tower.getObjectByName('tower-hazard');
      if (mesh && hazard) {
        mesh.scale.set(1, Math.max(0.1, h0), 1);
        mesh.position.y = h0 / 2;
        hazard.position.y = h0;
      }
    }

    // 2. Cannon Elevation & Recoil Animation
    const launcher = this.objectsGroup.getObjectByName('cannon-launcher-group');
    const barrel = this.objectsGroup.getObjectByName('cannon-barrel');
    const muzzleFlash = this.objectsGroup.getObjectByName('cannon-muzzle-flash') as THREE.Mesh;

    if (launcher && barrel) {
      launcher.position.set(0, h0, 0);
      barrel.rotation.z = rad - Math.PI / 2;

      const recoilDuration = 0.25;
      let recoil = 0;
      if (tInCycle < recoilDuration) {
        const p = tInCycle / recoilDuration;
        recoil = Math.sin(p * Math.PI) * 0.45;
      }
      barrel.position.set(-Math.cos(rad) * recoil, 1.5 - Math.sin(rad) * recoil, 0);

      if (muzzleFlash) {
        if (tInCycle < 0.12) {
          const flashOpacity = Math.max(0, 1 - tInCycle / 0.12);
          (muzzleFlash.material as THREE.MeshBasicMaterial).opacity = flashOpacity;
          muzzleFlash.scale.setScalar(1.0 + (1 - flashOpacity) * 1.5);
        } else {
          (muzzleFlash.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }
    }

    // 3. Projectile Shell Ballistics & Orientation
    const shellGroup = this.objectsGroup.getObjectByName('projectile-ball');
    if (shellGroup) {
      shellGroup.position.set(currentState.x, currentState.y, 0);
      
      const pitchAngle = Math.atan2(currentState.vy, currentState.vx);
      
      // Ragdoll / tumbling effect
      if (tInCycle > T) {
        // Tumble after first impact
        shellGroup.rotation.z += Math.hypot(currentState.vx, currentState.vy) * 0.1;
      } else {
        // Aerodynamic alignment before impact
        shellGroup.rotation.z = pitchAngle - Math.PI / 2;
      }
      
      shellGroup.visible = tInCycle < this.projectileTotalTime + 0.1;
    }

    // 4. Apex Peak Beacon
    const apexGroup = this.objectsGroup.getObjectByName('projectile-apex-group');
    if (apexGroup) {
      apexGroup.position.set(apex_x, max_y, 0);
      apexGroup.visible = ctx.showTrajectory;

      const apexLine = apexGroup.getObjectByName('apex-line') as THREE.Line;
      if (apexLine) {
        const planeYAtApex = apex_x * Math.tan(alpha);
        const linePts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -(max_y - Math.max(0, planeYAtApex)), 0)];
        apexLine.geometry.setFromPoints(linePts);
        apexLine.computeLineDistances();
      }
    }

    // 5. Landing Target & Crater Shockwave (at first impact)
    const targetGroup = this.objectsGroup.getObjectByName('projectile-target-group');
    if (targetGroup) {
      targetGroup.position.set(impactPoint.x, impactPoint.y, 0);
      targetGroup.rotation.z = alpha;

      const crater = targetGroup.getObjectByName('impact-crater') as THREE.Mesh;
      const dust = targetGroup.getObjectByName('impact-dust') as THREE.Mesh;

      if (tInCycle >= T) {
        const dtImpact = tInCycle - T;
        if (crater) {
          (crater.material as THREE.MeshStandardMaterial).opacity = Math.min(0.85, dtImpact * 4);
        }
        if (dust) {
          const maxDust = Math.min(1.0, dtImpact * 8);
          dust.scale.setScalar(1 + dtImpact * 6);
          (dust.material as THREE.MeshStandardMaterial).opacity = Math.max(0, maxDust - dtImpact * 2);
        }
      } else {
        if (crater) (crater.material as THREE.MeshStandardMaterial).opacity = 0;
        if (dust) (dust.material as THREE.MeshStandardMaterial).opacity = 0;
      }
    }

    // 6. Projectile Ragdoll Parts (Flailing Dummy in shell)
    const dummyLarm = this.objectsGroup.getObjectByName('dummy-larm');
    const dummyRarm = this.objectsGroup.getObjectByName('dummy-rarm');
    const hipL = this.objectsGroup.getObjectByName('dummy-hip-l');
    const hipR = this.objectsGroup.getObjectByName('dummy-hip-r');
    const kneeL = this.objectsGroup.getObjectByName('dummy-knee-l');
    const kneeR = this.objectsGroup.getObjectByName('dummy-knee-r');
    const head = this.objectsGroup.getObjectByName('dummy-head');

    if (head) {
      if (tInCycle >= T) {
        // Ragdoll Flail after impact
        const flailFactor = Math.sin((tInCycle - T) * 25) * Math.max(0, 1 - (tInCycle - T));
        if (dummyLarm) dummyLarm.rotation.z = Math.PI/2 + flailFactor;
        if (dummyRarm) dummyRarm.rotation.z = -Math.PI/2 - flailFactor;
        if (hipL) hipL.rotation.z = flailFactor;
        if (hipR) hipR.rotation.z = -flailFactor;
        if (kneeL) kneeL.rotation.z = flailFactor;
        if (kneeR) kneeR.rotation.z = -flailFactor;
        head.rotation.z = flailFactor * 0.5;
      } else {
        // Aerodynamic posture
        if (dummyLarm) dummyLarm.rotation.z = Math.PI - 0.2;
        if (dummyRarm) dummyRarm.rotation.z = -Math.PI + 0.2;
        if (hipL) hipL.rotation.z = 0;
        if (hipR) hipR.rotation.z = 0;
        if (kneeL) kneeL.rotation.z = 0;
        if (kneeR) kneeR.rotation.z = 0;
        head.rotation.z = 0;
      }
    }

    // 7. Trajectory Line visibility
    if (this.trajectoryLine) {
      this.trajectoryLine.visible = ctx.showTrajectory;
    }

    // 8. Vectors & Real-Time Physics Labels
    const velArrow = this.vectorGroup.getObjectByName('vel-arrow') as THREE.ArrowHelper;
    if (velArrow) {
      const vVec = new THREE.Vector3(currentState.vx, currentState.vy, 0);
      const vLen = Math.min(6, vVec.length() * 0.14);
      velArrow.position.set(currentState.x, currentState.y, 0);
      velArrow.setDirection(vVec.clone().normalize());
      velArrow.setLength(Math.max(0.1, vLen), 0.4, 0.2);
    }

    const vxArrow = this.vectorGroup.getObjectByName('vx-arrow') as THREE.ArrowHelper;
    if (vxArrow) {
      vxArrow.position.set(currentState.x, currentState.y, 0);
      vxArrow.setDirection(new THREE.Vector3(Math.sign(currentState.vx) || 1, 0, 0));
      vxArrow.setLength(Math.max(0.1, Math.abs(currentState.vx) * 0.14), 0.3, 0.15);
    }

    const vyArrow = this.vectorGroup.getObjectByName('vy-arrow') as THREE.ArrowHelper;
    if (vyArrow) {
      vyArrow.position.set(currentState.x, currentState.y, 0);
      vyArrow.setDirection(new THREE.Vector3(0, Math.sign(currentState.vy) || 1, 0));
      vyArrow.setLength(Math.max(0.1, Math.abs(currentState.vy) * 0.14), 0.3, 0.15);
    }

    const gArrow = this.vectorGroup.getObjectByName('g-arrow') as THREE.ArrowHelper;
    if (gArrow) {
      gArrow.position.set(currentState.x, currentState.y, 0);
      gArrow.setLength(Math.min(4, g * 0.15), 0.4, 0.2);
    }
  }

  // ==========================================
  // 2. INCLINED PLANE WITH FRICTION
  // ==========================================
  private setupInclinedPlane(ctx: SimRenderContext) {
    const L = 12.0;

    // Wedge Support Structure
    const wedgeGeo = new THREE.BufferGeometry();
    const wedgeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeMesh.name = 'wedge-support-mesh';
    this.objectsGroup.add(wedgeMesh);

    // Incline Board Group
    const boardGroup = new THREE.Group();
    boardGroup.name = 'incline-board-group';

    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.4,
    });
    const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(L, 0.2, 4.4), boardMat);
    boardMesh.position.set(L / 2, -0.1, 0);
    boardGroup.add(boardMesh);

    // Board Surface Track Grid Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });
    for (let d = 1; d < L; d += 1) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(d, 0.01, -2.1),
        new THREE.Vector3(d, 0.01, 2.1),
      ]);
      boardGroup.add(new THREE.Line(lineGeo, lineMat));
    }
    this.objectsGroup.add(boardGroup);

    // Flat Ground Runway Track
    const groundTrackMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const groundTrack = new THREE.Mesh(new THREE.BoxGeometry(14, 0.15, 4.4), groundTrackMat);
    groundTrack.name = 'ground-track';
    this.objectsGroup.add(groundTrack);

    // End Stopper
    const stopperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const stopper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 4.2), stopperMat);
    stopper.name = 'end-stopper';
    this.objectsGroup.add(stopper);

    // Sliding Block
    const blockGroup = new THREE.Group();
    blockGroup.name = 'sliding-block';

    const blockMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.7,
    });
    const blockMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), blockMat);
    blockGroup.add(blockMesh);

    // Inner grip & border on block
    const blockEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 1.2, 1.6));
    const blockEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    blockGroup.add(new THREE.LineSegments(blockEdgeGeo, blockEdgeMat));
    this.objectsGroup.add(blockGroup);

    // Vectors
    const mgArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 2.4, 0xef4444, 0.35, 0.18);
    mgArrow.name = 'mg-arrow';
    this.vectorGroup.add(mgArrow);

    const normArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2.2, 0x38bdf8, 0.35, 0.18);
    normArrow.name = 'normal-arrow';
    this.vectorGroup.add(normArrow);

    const fricArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), 1.8, 0xf97316, 0.35, 0.18);
    fricArrow.name = 'friction-arrow';
    this.vectorGroup.add(fricArrow);

    const appliedArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.8, 0x10b981, 0.35, 0.18);
    appliedArrow.name = 'applied-arrow';
    this.vectorGroup.add(appliedArrow);

    this.updateInclinedPlane(ctx);
  }

  private updateInclinedPlane(ctx: SimRenderContext) {
    const { theta = 30, mu_s = 0.5, mu_k = 0.3, m = 2, F_ext = 0 } = ctx.params;
    const rad = (theta * Math.PI) / 180;
    const L = 12.0;
    const g = 9.8;

    const block = this.objectsGroup.getObjectByName('sliding-block');
    const boardGroup = this.objectsGroup.getObjectByName('incline-board-group');
    const wedge = this.objectsGroup.getObjectByName('wedge-support-mesh') as THREE.Mesh;
    const stopper = this.objectsGroup.getObjectByName('end-stopper');
    const groundTrack = this.objectsGroup.getObjectByName('ground-track');

    const topX = -6.5;
    const topY = L * Math.sin(rad);
    const botX = topX + L * Math.cos(rad);
    const botY = 0;

    // Update Incline Board Position & Rotation
    if (boardGroup) {
      boardGroup.position.set(topX, topY, 0);
      boardGroup.rotation.z = -rad;
    }

    // Update Ground Track Position
    if (groundTrack && stopper) {
      const trackLen = Math.max(8, 18 - botX);
      groundTrack.position.set(botX + trackLen / 2, -0.075, 0);
      groundTrack.scale.set(trackLen / 14, 1, 1);
      stopper.position.set(botX + trackLen - 0.15, 0.5, 0);
    }

    // Dynamic Triangular Wedge Support Geometry
    if (wedge) {
      const depth = 4.8;
      const hDepth = depth / 2;
      // Vertices: TopLeft(topX, topY), BotLeft(topX, 0), BotRight(botX, 0)
      const positions = new Float32Array([
        // Front face (+z)
        topX, topY, hDepth,
        topX, 0, hDepth,
        botX, 0, hDepth,
        // Back face (-z)
        topX, topY, -hDepth,
        botX, 0, -hDepth,
        topX, 0, -hDepth,
        // Left vertical back wall
        topX, topY, hDepth,
        topX, topY, -hDepth,
        topX, 0, -hDepth,
        topX, topY, hDepth,
        topX, 0, -hDepth,
        topX, 0, hDepth,
        // Bottom ground base
        topX, 0, hDepth,
        topX, 0, -hDepth,
        botX, 0, -hDepth,
        topX, 0, hDepth,
        botX, 0, -hDepth,
        botX, 0, hDepth,
      ]);
      wedge.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      wedge.geometry.computeVertexNormals();
    }

    // Compute non-penetrating sliding block transform via PhysicsEngineMiddleware
    const blockHalfH = 0.6;
    const transform = this.physicsMiddleware.computeInclinedPlaneTransform(ctx.params, ctx.simTime, blockHalfH);
    const N = m * g * Math.cos(rad);
    const mg_down = m * g * Math.sin(rad);
    const netDriving = mg_down - F_ext;
    const f_max = mu_s * N;
    const isSliding = Math.abs(netDriving) > f_max;
    const f_actual = isSliding ? mu_k * N : Math.abs(netDriving);

    if (block) {
      this.physicsMiddleware.applyTransformToObject(block, transform);
    }

    // Force Vectors & High-Contrast 3D Floating Labels
    const center = transform.position;
    const currentAngle = -transform.rotation.z;

    const mgArrow = this.vectorGroup.getObjectByName('mg-arrow') as THREE.ArrowHelper;
    if (mgArrow) {
      mgArrow.position.copy(center);
      mgArrow.setDirection(new THREE.Vector3(0, -1, 0));
      mgArrow.setLength(2.4, 0.35, 0.18);
      this.updateArrowLabel(
        'mg-arrow',
        `mg = ${(m * g).toFixed(1)} N`,
        '#ef4444',
        new THREE.Vector3(center.x, center.y - 2.8, center.z),
        ctx.showLabels && ctx.showVectors
      );
    }

    const normArrow = this.vectorGroup.getObjectByName('normal-arrow') as THREE.ArrowHelper;
    if (normArrow) {
      const contactPos = transform.contactPoint;
      normArrow.position.copy(contactPos);
      const nDir = transform.surfaceNormal.clone();
      normArrow.setDirection(nDir);
      normArrow.setLength(2.2, 0.35, 0.18);
      this.updateArrowLabel(
        'normal-arrow',
        `N = ${N.toFixed(1)} N`,
        '#38bdf8',
        contactPos.clone().add(nDir.clone().multiplyScalar(2.6)),
        ctx.showLabels && ctx.showVectors
      );
    }

    const fricArrow = this.vectorGroup.getObjectByName('friction-arrow') as THREE.ArrowHelper;
    if (fricArrow) {
      const contactPos = transform.contactPoint;
      fricArrow.position.copy(contactPos);
      const fricDir = new THREE.Vector3(-Math.cos(currentAngle), Math.sin(currentAngle), 0);
      fricArrow.setDirection(fricDir);
      fricArrow.setLength(Math.max(0.4, (f_actual / (m * g)) * 2.2), 0.35, 0.18);
      this.updateArrowLabel(
        'friction-arrow',
        `f = ${f_actual.toFixed(1)} N (${isSliding ? 'Kinetic' : 'Static'})`,
        '#f97316',
        contactPos.clone().add(fricDir.clone().multiplyScalar(2.4)),
        ctx.showLabels && ctx.showVectors
      );
    }

    const appliedArrow = this.vectorGroup.getObjectByName('applied-arrow') as THREE.ArrowHelper;
    if (appliedArrow) {
      if (Math.abs(F_ext) > 0.01) {
        appliedArrow.visible = ctx.showVectors;
        appliedArrow.position.copy(center);
        const appDir = F_ext >= 0 ? new THREE.Vector3(-Math.cos(currentAngle), Math.sin(currentAngle), 0) : new THREE.Vector3(Math.cos(currentAngle), -Math.sin(currentAngle), 0);
        appliedArrow.setDirection(appDir);
        appliedArrow.setLength(Math.min(4, Math.abs(F_ext) * 0.2 + 0.5), 0.35, 0.18);
        this.updateArrowLabel(
          'applied-arrow',
          `F_{ext} = ${Math.abs(F_ext).toFixed(1)} N`,
          '#10b981',
          center.clone().add(appDir.clone().multiplyScalar(2.2)),
          ctx.showLabels && ctx.showVectors
        );
      } else {
        appliedArrow.visible = false;
        this.updateArrowLabel('applied-arrow', '', '#10b981', center, false);
      }
    }
  }

  // ==========================================
  // 3. SHM (SPRING & OSCILLATOR)
  // ==========================================
  private setupSHM(ctx: SimRenderContext) {
    // Rigid Support Wall
    const wallGeo = new THREE.BoxGeometry(0.8, 4, 3);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(-8, 2, 0);
    this.objectsGroup.add(wall);

    // Track
    const trackGeo = new THREE.BoxGeometry(16, 0.4, 3);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0, 0);
    this.objectsGroup.add(track);

    // Mass Block
    const blockGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.6, roughness: 0.2 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.name = 'shm-block';
    block.position.set(0, 1.0, 0);
    this.objectsGroup.add(block);

    // Dynamic Spring Tube
    const springGroup = new THREE.Group();
    springGroup.name = 'spring-mesh-group';
    this.objectsGroup.add(springGroup);

    // Velocity and Restoring Force Vectors
    this.createArrow('shm-v-arrow', 0x22c55e);
    this.createArrow('shm-f-arrow', 0xef4444);
  }

  private updateSHM(ctx: SimRenderContext) {
    const { k, m, A, phi = 0 } = ctx.params;
    const omega = Math.sqrt(k / m);
    const phiRad = (phi * Math.PI) / 180;
    const phase = omega * ctx.simTime + phiRad;
    const x = A * Math.cos(phase);
    const v = -A * omega * Math.sin(phase);

    const block = this.objectsGroup.getObjectByName('shm-block');
    if (block) {
      block.position.set(x, 1.0, 0);
    }

    // Update spring coils
    const springGroup = this.objectsGroup.getObjectByName('spring-mesh-group');
    if (springGroup) {
      while (springGroup.children.length > 0) {
        this.disposeObject(springGroup.children[0]);
        springGroup.remove(springGroup.children[0]);
      }

      const startX = -7.6;
      const endX = x - 0.8;
      const length = endX - startX;
      const coils = 18;
      const radius = 0.5;
      const points: THREE.Vector3[] = [];
      const segments = 120;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const px = startX + t * length;
        const py = 1.0 + Math.sin(t * coils * Math.PI * 2) * radius;
        const pz = Math.cos(t * coils * Math.PI * 2) * radius;
        points.push(new THREE.Vector3(px, py, pz));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.08, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      const springMesh = new THREE.Mesh(tubeGeo, tubeMat);
      springGroup.add(springMesh);
    }

    // Update vectors
    const vArrow = this.vectorGroup.getObjectByName('shm-v-arrow') as THREE.ArrowHelper;
    if (vArrow) {
      vArrow.position.set(x, 2.2, 0);
      const vDir = v >= 0 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
      vArrow.setDirection(vDir);
      vArrow.setLength(Math.max(0.1, Math.min(3, Math.abs(v) * 0.4)), 0.3, 0.15);
    }

    const fArrow = this.vectorGroup.getObjectByName('shm-f-arrow') as THREE.ArrowHelper;
    if (fArrow) {
      fArrow.position.set(x, 2.8, 0);
      const fDir = -x >= 0 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
      fArrow.setDirection(fDir);
      fArrow.setLength(Math.max(0.1, Math.min(3, Math.abs(x) * 0.8)), 0.3, 0.15);
    }
  }

  // ==========================================
  // 4. ELECTRIC FIELD & POINT CHARGES (REAL-LIFE HIGH VOLTAGE LAB APPARATUS)
  // ==========================================
  private setupElectricField(ctx: SimRenderContext) {
    // 1. Heavy Insulated Laboratory Test Bench
    const benchGroup = new THREE.Group();
    benchGroup.name = 'ef-bench-group';

    const benchGeo = new THREE.BoxGeometry(18, 0.4, 12);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.2,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -4.2, 0);
    benchGroup.add(bench);

    // Grid markings on bench surface
    const gridPlane = new THREE.GridHelper(16, 16, 0x38bdf8, 0x1e293b);
    gridPlane.position.set(0, -3.99, 0);
    benchGroup.add(gridPlane);

    // Aluminum Guide Rail along X-axis
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 15, 16), railMat);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(0, -3.85, 0);
    benchGroup.add(rail);

    this.objectsGroup.add(benchGroup);

    // 2. High-Voltage Electrode Stanchions (Acrylic Insulators & Polished Spheres)
    const createElectrodeAssembly = (name: string, isPos: boolean) => {
      const group = new THREE.Group();
      group.name = name;

      // Heavy weighted base stand
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 24), baseMat);
      baseMesh.position.y = -3.85;
      group.add(baseMesh);

      // Knurled leveling screws
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        const screw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12),
          new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
        );
        screw.position.set(1.1 * Math.cos(ang), -3.95, 1.1 * Math.sin(ang));
        group.add(screw);
      }

      // Transparent Acrylic Insulating Support Pillar
      const acrylicMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transmission: 0.9,
        opacity: 0.45,
        transparent: true,
        roughness: 0.1,
        ior: 1.49,
      });
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.8, 20), acrylicMat);
      pillar.position.y = -1.9;
      group.add(pillar);

      // Chrome mounting collars
      const collarMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
      const collarB = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 20), collarMat);
      collarB.position.y = -3.7;
      group.add(collarB);

      const collarT = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 20), collarMat);
      collarT.position.y = -0.1;
      group.add(collarT);

      // Polished Brass / Metallic High-Voltage Sphere
      const sphereGeo = new THREE.SphereGeometry(1.0, 36, 36);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isPos ? 0xef4444 : 0x3b82f6,
        emissive: isPos ? 0xdc2626 : 0x2563eb,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.15,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.name = `${name}-sphere`;
      group.add(sphereMesh);

      // Glowing Polarity Ring Indicator
      const ringGeo = new THREE.TorusGeometry(1.08, 0.05, 16, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: isPos ? 0xff6b6b : 0x60a5fa });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = `${name}-ring`;
      group.add(ring);

      return group;
    };

    const q1Group = createElectrodeAssembly('charge-1-group', true);
    this.objectsGroup.add(q1Group);

    const q2Group = createElectrodeAssembly('charge-2-group', false);
    this.objectsGroup.add(q2Group);

    // 3. Precision 3D Test Probe & Sensor Wand
    const probeGroup = new THREE.Group();
    probeGroup.name = 'probe-charge-group';

    // Insulated handle & brass shaft
    const wandMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 16), wandMat);
    wand.position.y = 1.1;
    probeGroup.add(wand);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    handle.position.y = 2.1;
    probeGroup.add(handle);

    // Gold-plated sensor tip
    const tipGeo = new THREE.SphereGeometry(0.22, 20, 20);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.9,
      metalness: 0.95,
      roughness: 0.1,
    });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.name = 'probe-tip';
    probeGroup.add(tipMesh);

    // Target reticle rings around probe tip
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const reticle = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 24), reticleMat);
    reticle.name = 'probe-reticle';
    probeGroup.add(reticle);

    this.objectsGroup.add(probeGroup);

    // 4. Dynamic 3D Electric Streamlines Group
    const streamlinesGroup = new THREE.Group();
    streamlinesGroup.name = 'electric-streamlines';
    this.objectsGroup.add(streamlinesGroup);

    // 5. Dynamic 3D Field Vectors Grid
    const fieldGridGroup = new THREE.Group();
    fieldGridGroup.name = 'field-grid';
    this.objectsGroup.add(fieldGridGroup);

    // 6. Equipotential Contours Group
    const equipotentialGroup = new THREE.Group();
    equipotentialGroup.name = 'equipotential-contours';
    this.objectsGroup.add(equipotentialGroup);

    // Vector Helper for Probe E-Field
    this.createArrow('probe-e-arrow', 0xa855f7);
  }

  private updateElectricField(ctx: SimRenderContext) {
    const { q1 = 4, q2 = -4, sep = 4, probeX = 0, probeY = 3 } = ctx.params;
    const d = sep / 2;
    const isQ1Pos = q1 >= 0;
    const isQ2Pos = q2 >= 0;

    // 1. Position Electrode Assemblies
    const q1Group = this.objectsGroup.getObjectByName('charge-1-group');
    if (q1Group) {
      q1Group.position.set(-d, 0, 0);
      const sphere = q1Group.getObjectByName('charge-1-group-sphere') as THREE.Mesh;
      if (sphere) {
        const mat = sphere.material as THREE.MeshStandardMaterial;
        mat.color.setHex(isQ1Pos ? 0xef4444 : 0x3b82f6);
        mat.emissive.setHex(isQ1Pos ? 0xdc2626 : 0x2563eb);
        const radiusScale = 0.7 + Math.min(0.6, (Math.abs(q1) / 10) * 0.5);
        sphere.scale.setScalar(radiusScale);
      }
      const ring = q1Group.getObjectByName('charge-1-group-ring') as THREE.Mesh;
      if (ring) {
        (ring.material as THREE.MeshBasicMaterial).color.setHex(isQ1Pos ? 0xff6b6b : 0x60a5fa);
        ring.rotation.y = ctx.simTime * 0.8;
      }
    }

    const q2Group = this.objectsGroup.getObjectByName('charge-2-group');
    if (q2Group) {
      q2Group.position.set(d, 0, 0);
      const sphere = q2Group.getObjectByName('charge-2-group-sphere') as THREE.Mesh;
      if (sphere) {
        const mat = sphere.material as THREE.MeshStandardMaterial;
        mat.color.setHex(isQ2Pos ? 0xef4444 : 0x3b82f6);
        mat.emissive.setHex(isQ2Pos ? 0xdc2626 : 0x2563eb);
        const radiusScale = 0.7 + Math.min(0.6, (Math.abs(q2) / 10) * 0.5);
        sphere.scale.setScalar(radiusScale);
      }
      const ring = q2Group.getObjectByName('charge-2-group-ring') as THREE.Mesh;
      if (ring) {
        (ring.material as THREE.MeshBasicMaterial).color.setHex(isQ2Pos ? 0xff6b6b : 0x60a5fa);
        ring.rotation.y = -ctx.simTime * 0.8;
      }
    }

    // 2. Position Probe Assembly
    const probeGroup = this.objectsGroup.getObjectByName('probe-charge-group');
    if (probeGroup) {
      probeGroup.position.set(probeX, probeY, 0);
      const reticle = probeGroup.getObjectByName('probe-reticle');
      if (reticle) {
        reticle.rotation.z = ctx.simTime * 1.5;
      }
    }

    // 3. Compute Real-Time 3D Streamlines
    const streamlines = this.objectsGroup.getObjectByName('electric-streamlines') as THREE.Group;
    if (streamlines) {
      while (streamlines.children.length > 0) {
        this.disposeObject(streamlines.children[0]);
        streamlines.remove(streamlines.children[0]);
      }

      if (ctx.showVectors) {
        const numSeeds = 16;
        const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });

        for (let i = 0; i < numSeeds; i++) {
          const theta = (i * 2 * Math.PI) / numSeeds;
          let curPos = new THREE.Vector3(-d + 0.9 * Math.cos(theta), 0.9 * Math.sin(theta), 0);
          const pts: THREE.Vector3[] = [curPos.clone()];
          const maxSteps = 45;
          const stepSize = 0.35;

          for (let step = 0; step < maxSteps; step++) {
            const r1 = new THREE.Vector3().subVectors(curPos, new THREE.Vector3(-d, 0, 0));
            const r2 = new THREE.Vector3().subVectors(curPos, new THREE.Vector3(d, 0, 0));
            const d1 = r1.length();
            const d2 = r2.length();

            if (d1 < 0.8 || d2 < 0.8 || curPos.length() > 14) break;

            const e1 = r1.normalize().multiplyScalar(q1 / Math.max(0.2, d1 * d1));
            const e2 = r2.normalize().multiplyScalar(q2 / Math.max(0.2, d2 * d2));
            const eNet = new THREE.Vector3().addVectors(e1, e2);
            if (eNet.lengthSq() < 0.0001) break;

            const dir = eNet.normalize();
            if (q1 < 0) dir.negate();
            curPos.addScaledVector(dir, stepSize);
            pts.push(curPos.clone());
          }

          if (pts.length > 2) {
            const geom = new THREE.BufferGeometry().setFromPoints(pts);
            streamlines.add(new THREE.Line(geom, lineMat));
          }
        }
      }
    }

    // 4. Update Field Vector Grid
    const fieldGrid = this.objectsGroup.getObjectByName('field-grid') as THREE.Group;
    if (fieldGrid) {
      while (fieldGrid.children.length > 0) {
        this.disposeObject(fieldGrid.children[0]);
        fieldGrid.remove(fieldGrid.children[0]);
      }

      if (ctx.showVectors) {
        for (let gx = -7; gx <= 7; gx += 1.75) {
          for (let gy = -5; gy <= 5; gy += 1.75) {
            const r1x = gx - (-d);
            const r1y = gy;
            const r1 = Math.sqrt(r1x * r1x + r1y * r1y);
            const r2x = gx - d;
            const r2y = gy;
            const r2 = Math.sqrt(r2x * r2x + r2y * r2y);

            if (r1 > 1.1 && r2 > 1.1) {
              const e1x = (q1 * r1x) / Math.pow(r1, 3);
              const e1y = (q1 * r1y) / Math.pow(r1, 3);
              const e2x = (q2 * r2x) / Math.pow(r2, 3);
              const e2y = (q2 * r2y) / Math.pow(r2, 3);

              const ex = e1x + e2x;
              const ey = e1y + e2y;
              const eMag = Math.sqrt(ex * ex + ey * ey);

              if (eMag > 0.001) {
                const dir = new THREE.Vector3(ex, ey, 0).normalize();
                const arrowLen = Math.min(1.3, Math.max(0.35, Math.log10(eMag * 12 + 1) * 0.75));
                const colorHex = eMag > 1.2 ? 0xf43f5e : eMag > 0.5 ? 0xa855f7 : 0x38bdf8;
                const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(gx, gy, 0), arrowLen, colorHex, 0.25, 0.15);
                fieldGrid.add(arrow);
              }
            }
          }
        }
      }
    }

    // 5. Equipotential Contour Lines
    const equipotential = this.objectsGroup.getObjectByName('equipotential-contours') as THREE.Group;
    if (equipotential) {
      while (equipotential.children.length > 0) {
        this.disposeObject(equipotential.children[0]);
        equipotential.remove(equipotential.children[0]);
      }

      if (ctx.showVectors) {
        [1.8, 2.8, 4.0].forEach((rRad) => {
          const ring1 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(
              Array.from({ length: 48 }, (_, i) => {
                const a = (i * 2 * Math.PI) / 48;
                return new THREE.Vector3(-d + rRad * Math.cos(a), rRad * Math.sin(a), -0.01);
              })
            ),
            new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 })
          );
          equipotential.add(ring1);

          const ring2 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(
              Array.from({ length: 48 }, (_, i) => {
                const a = (i * 2 * Math.PI) / 48;
                return new THREE.Vector3(d + rRad * Math.cos(a), rRad * Math.sin(a), -0.01);
              })
            ),
            new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 })
          );
          equipotential.add(ring2);
        });
      }
    }

    // 6. Live Probe Vector & High-Precision Label
    const probeArrow = this.vectorGroup.getObjectByName('probe-e-arrow') as THREE.ArrowHelper;
    const r1x = probeX - (-d);
    const r1y = probeY;
    const r1 = Math.sqrt(r1x * r1x + r1y * r1y);
    const r2x = probeX - d;
    const r2y = probeY;
    const r2 = Math.sqrt(r2x * r2x + r2y * r2y);

    const e1x = (q1 * r1x) / Math.pow(r1, 3);
    const e1y = (q1 * r1y) / Math.pow(r1, 3);
    const e2x = (q2 * r2x) / Math.pow(r2, 3);
    const e2y = (q2 * r2y) / Math.pow(r2, 3);
    const ex = e1x + e2x;
    const ey = e1y + e2y;
    const eMag = Math.sqrt(ex * ex + ey * ey);
    const k_const = 8.99e9;
    const vNet = (k_const * q1 * 1e-6) / Math.max(0.1, r1) + (k_const * q2 * 1e-6) / Math.max(0.1, r2);

    if (probeArrow && probeGroup) {
      const eVec = new THREE.Vector3(ex, ey, 0);
      probeArrow.position.set(probeX, probeY, 0);
      if (eMag > 0.0001) {
        probeArrow.setDirection(eVec.normalize());
        const arrowLen = Math.min(4.2, Math.max(0.8, eMag * 1.6));
        probeArrow.setLength(arrowLen, 0.45, 0.22);
      }
    }

    // 7. Dynamic 3D Labels
    this.updateArrowLabel(
      'ef-q1-label',
      `q₁ = ${q1 >= 0 ? '+' : ''}${q1} μC`,
      isQ1Pos ? '#ef4444' : '#38bdf8',
      new THREE.Vector3(-d, 1.8, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'ef-q2-label',
      `q₂ = ${q2 >= 0 ? '+' : ''}${q2} μC`,
      isQ2Pos ? '#ef4444' : '#38bdf8',
      new THREE.Vector3(d, 1.8, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'ef-probe-hud',
      `|E| = ${(eMag * 1e4).toFixed(1)} N/C | V = ${(vNet * 1e-3).toFixed(1)} kV`,
      '#facc15',
      new THREE.Vector3(probeX, probeY + 1.2, 0),
      ctx.showLabels
    );
  }

  // ==========================================
  // 5. SERIES LCR RESONANCE & AC PHASOR APPARATUS
  // ==========================================
  private setupLCR(ctx: SimRenderContext) {
    // 1. Electronics Experiment Chassis / Breadboard Platform
    const chassisGroup = new THREE.Group();
    chassisGroup.name = 'lcr-chassis-group';

    const chassisGeo = new THREE.BoxGeometry(16, 0.5, 10);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.3 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0, -3.8, 0);
    chassisGroup.add(chassis);

    // Anti-slip rubber feet
    const footMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    [[-7.5, -4.5], [7.5, -4.5], [-7.5, 4.5], [7.5, 4.5]].forEach(([fx, fz]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16), footMat);
      foot.position.set(fx, -4.1, fz);
      chassisGroup.add(foot);
    });

    // 2. AC Function Generator Unit (Left Module)
    const genGroup = new THREE.Group();
    genGroup.name = 'lcr-generator-module';
    const genBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.2, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
    );
    genBody.position.set(-5.5, -2.45, -2.5);
    genGroup.add(genBody);

    // Front Panel LCD Display
    const lcdMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.9),
      new THREE.MeshBasicMaterial({ color: 0x064e3b })
    );
    lcdMesh.position.set(-5.5, -2.1, -0.88);
    genGroup.add(lcdMesh);

    // Control Dials (Fine / Coarse frequency)
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    [-6.2, -4.8].forEach((dx) => {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16), dialMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(dx, -3.0, -0.88);
      genGroup.add(knob);
    });

    // BNC Output Terminals
    const bncMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const bncOut = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16), bncMat);
    bncOut.rotation.x = Math.PI / 2;
    bncOut.position.set(-5.5, -3.0, -0.88);
    genGroup.add(bncOut);

    chassisGroup.add(genGroup);

    // 3. Physical Circuit Components on Circuit Board
    // (a) Precision Inductor (Ferrite core with wound copper wire)
    const indGroup = new THREE.Group();
    indGroup.name = 'lcr-inductor-component';
    const coreMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 1.8, 24),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8, metalness: 0.2 })
    );
    coreMesh.rotation.z = Math.PI / 2;
    coreMesh.position.set(-1.5, -3.2, -2.5);
    indGroup.add(coreMesh);

    // Copper Wire Turns
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.15 });
    for (let i = 0; i < 14; i++) {
      const turn = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 12, 24), copperMat);
      turn.rotation.y = Math.PI / 2;
      turn.position.set(-2.2 + i * 0.11, -3.2, -2.5);
      indGroup.add(turn);
    }
    chassisGroup.add(indGroup);

    // (b) Film Capacitor (Polypropylene Canister)
    const capGroup = new THREE.Group();
    capGroup.name = 'lcr-capacitor-component';
    const capBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 1.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
    );
    capBody.position.set(1.8, -2.75, -2.5);
    capGroup.add(capBody);

    const capTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.66, 0.66, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
    );
    capTop.position.set(1.8, -1.9, -2.5);
    capGroup.add(capTop);
    chassisGroup.add(capGroup);

    // (c) Ceramic Power Resistor (with color stripes)
    const resGroup = new THREE.Group();
    resGroup.name = 'lcr-resistor-component';
    const resBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 2.0, 20),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 })
    );
    resBody.rotation.z = Math.PI / 2;
    resBody.position.set(5.2, -3.2, -2.5);
    resGroup.add(resBody);

    // Color bands (representing resistance R)
    const bandMat1 = new THREE.MeshBasicMaterial({ color: 0x1e3a8a }); // Blue
    const bandMat2 = new THREE.MeshBasicMaterial({ color: 0x991b1b }); // Red
    const bandMat3 = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black
    const bandMat4 = new THREE.MeshBasicMaterial({ color: 0xd97706 }); // Gold
    [-0.6, -0.2, 0.2, 0.6].forEach((bx, idx) => {
      const mat = idx === 0 ? bandMat1 : idx === 1 ? bandMat2 : idx === 2 ? bandMat3 : bandMat4;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20), mat);
      band.rotation.z = Math.PI / 2;
      band.position.set(5.2 + bx, -3.2, -2.5);
      resGroup.add(band);
    });
    chassisGroup.add(resGroup);

    // 4. Connecting Jumper Wires (Series Circuit Loop)
    const wireMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const wireMatBlack = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.0, -3.2, -2.5),
      new THREE.Vector3(-3.2, -3.0, -2.5),
      new THREE.Vector3(-2.4, -3.2, -2.5),
    ]);
    chassisGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 16, 0.06, 8, false), wireMatRed));

    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, -3.2, -2.5),
      new THREE.Vector3(0.6, -3.0, -2.5),
      new THREE.Vector3(1.4, -3.2, -2.5),
    ]);
    chassisGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 16, 0.06, 8, false), wireMatRed));

    const c3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.3, -3.2, -2.5),
      new THREE.Vector3(3.2, -3.0, -2.5),
      new THREE.Vector3(4.1, -3.2, -2.5),
    ]);
    chassisGroup.add(new THREE.Mesh(new THREE.TubeGeometry(c3, 16, 0.06, 8, false), wireMatRed));

    const cReturn = new THREE.CatmullRomCurve3([
      new THREE.Vector3(6.3, -3.2, -2.5),
      new THREE.Vector3(6.5, -3.4, -0.5),
      new THREE.Vector3(0, -3.5, 0),
      new THREE.Vector3(-5.5, -3.4, -0.5),
      new THREE.Vector3(-5.5, -3.2, -2.2),
    ]);
    chassisGroup.add(new THREE.Mesh(new THREE.TubeGeometry(cReturn, 32, 0.06, 8, false), wireMatBlack));

    this.objectsGroup.add(chassisGroup);

    // 5. Dual-Trace Digital Storage Oscilloscope (DSO Display Screen)
    const oscGroup = new THREE.Group();
    oscGroup.name = 'lcr-oscilloscope-screen';
    const oscBezel = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 4.4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    oscBezel.position.set(-4.0, 1.2, 1.0);
    oscGroup.add(oscBezel);

    const oscScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(6.6, 3.8),
      new THREE.MeshBasicMaterial({ color: 0x022c22 })
    );
    oscScreen.position.set(-4.0, 1.2, 1.16);
    oscGroup.add(oscScreen);

    // Oscilloscope Live Waveforms (Line objects)
    const vWaveGeo = new THREE.BufferGeometry();
    const vWaveLine = new THREE.Line(vWaveGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }));
    vWaveLine.name = 'osc-v-wave';
    oscGroup.add(vWaveLine);

    const iWaveGeo = new THREE.BufferGeometry();
    const iWaveLine = new THREE.Line(iWaveGeo, new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 }));
    iWaveLine.name = 'osc-i-wave';
    oscGroup.add(iWaveLine);

    this.objectsGroup.add(oscGroup);

    // 6. Precision 3D Rotating Phasor Wheel (Right Station)
    const phasorStation = new THREE.Group();
    phasorStation.name = 'phasor-wheel-station';
    phasorStation.position.set(4.2, 1.2, 1.0);

    // Precision Circular Protractor Ring Dial
    const ringGeo = new THREE.RingGeometry(3.6, 3.75, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    phasorStation.add(ringMesh);

    // Inner Graticule Ring & Crosshairs
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 1.85, 48),
      new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide })
    );
    phasorStation.add(innerRing);

    const axisX = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.8, 0, 0), new THREE.Vector3(3.8, 0, 0)]),
      new THREE.LineBasicMaterial({ color: 0x475569 })
    );
    phasorStation.add(axisX);

    const axisY = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -3.8, 0), new THREE.Vector3(0, 3.8, 0)]),
      new THREE.LineBasicMaterial({ color: 0x475569 })
    );
    phasorStation.add(axisY);

    // Resonance Flash Glow Ring (Lights up at resonance XL ≈ XC)
    const resGlow = new THREE.Mesh(
      new THREE.RingGeometry(3.76, 4.0, 48),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    resGlow.name = 'lcr-resonance-glow';
    phasorStation.add(resGlow);

    this.objectsGroup.add(phasorStation);

    // Phasors Vector Helpers
    this.createArrow('phasor-i', 0x22c55e);    // Current I (Green)
    this.createArrow('phasor-vr', 0x38bdf8);   // Resistor V_R (Cyan)
    this.createArrow('phasor-vl', 0xef4444);   // Inductor V_L (Red, +90°)
    this.createArrow('phasor-vc', 0xf59e0b);   // Capacitor V_C (Orange, -90°)
    this.createArrow('phasor-vnet', 0xa855f7); // Net EMF V_0 (Purple)
  }

  private updateLCR(ctx: SimRenderContext) {
    const { R = 50, L = 100, C = 20, f = 112, V0 = 220 } = ctx.params;
    const omega = 2 * Math.PI * f;
    const L_H = L * 1e-3;
    const C_F = C * 1e-6;
    const XL = omega * L_H;
    const XC = 1 / Math.max(1e-6, omega * C_F);
    const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
    const I0 = V0 / Math.max(0.1, Z);
    const phi = Math.atan2(XL - XC, R);
    const f0 = 1 / (2 * Math.PI * Math.sqrt(Math.max(1e-9, L_H * C_F)));
    const isResonant = Math.abs(f - f0) < 5;

    // Dynamic rotation angle ωt
    const wt = omega * 0.04 * ctx.simTime;
    const phasorCenter = new THREE.Vector3(4.2, 1.2, 1.0);

    // 1. Current Phasor I (Green: reference at wt)
    const iAngle = wt;
    const iDir = new THREE.Vector3(Math.cos(iAngle), Math.sin(iAngle), 0);
    const iArrow = this.vectorGroup.getObjectByName('phasor-i') as THREE.ArrowHelper;
    if (iArrow) {
      iArrow.position.copy(phasorCenter);
      iArrow.setDirection(iDir);
      iArrow.setLength(2.2, 0.35, 0.18);
    }

    // 2. V_R (in phase with I)
    const vrArrow = this.vectorGroup.getObjectByName('phasor-vr') as THREE.ArrowHelper;
    if (vrArrow) {
      vrArrow.position.copy(phasorCenter);
      vrArrow.setDirection(iDir);
      const vrLen = Math.min(3.5, (I0 * R * 3.0) / V0);
      vrArrow.setLength(Math.max(0.3, vrLen), 0.35, 0.18);
    }

    // 3. V_L (leads I by +90°)
    const vlAngle = iAngle + Math.PI / 2;
    const vlDir = new THREE.Vector3(Math.cos(vlAngle), Math.sin(vlAngle), 0);
    const vlArrow = this.vectorGroup.getObjectByName('phasor-vl') as THREE.ArrowHelper;
    if (vlArrow) {
      vlArrow.position.copy(phasorCenter);
      vlArrow.setDirection(vlDir);
      const vlLen = Math.min(3.5, (I0 * XL * 3.0) / V0);
      vlArrow.setLength(Math.max(0.3, vlLen), 0.35, 0.18);
    }

    // 4. V_C (lags I by -90°)
    const vcAngle = iAngle - Math.PI / 2;
    const vcDir = new THREE.Vector3(Math.cos(vcAngle), Math.sin(vcAngle), 0);
    const vcArrow = this.vectorGroup.getObjectByName('phasor-vc') as THREE.ArrowHelper;
    if (vcArrow) {
      vcArrow.position.copy(phasorCenter);
      vcArrow.setDirection(vcDir);
      const vcLen = Math.min(3.5, (I0 * XC * 3.0) / V0);
      vcArrow.setLength(Math.max(0.3, vcLen), 0.35, 0.18);
    }

    // 5. Net Source Voltage V_0 (at angle wt + phi)
    const vNetAngle = iAngle + phi;
    const vNetDir = new THREE.Vector3(Math.cos(vNetAngle), Math.sin(vNetAngle), 0);
    const vNetArrow = this.vectorGroup.getObjectByName('phasor-vnet') as THREE.ArrowHelper;
    if (vNetArrow) {
      vNetArrow.position.copy(phasorCenter);
      vNetArrow.setDirection(vNetDir);
      vNetArrow.setLength(3.2, 0.45, 0.22);
    }

    // 6. Resonance Ring Pulse
    const resGlow = this.objectsGroup.getObjectByName('lcr-resonance-glow') as THREE.Mesh;
    if (resGlow) {
      const gMat = resGlow.material as THREE.MeshBasicMaterial;
      if (isResonant) {
        gMat.opacity = 0.5 + 0.5 * Math.sin(ctx.simTime * 8);
      } else {
        gMat.opacity = 0.0;
      }
    }

    // 7. Update Oscilloscope Screen Waveforms
    const oscGroup = this.objectsGroup.getObjectByName('lcr-oscilloscope-screen');
    if (oscGroup) {
      const vLine = oscGroup.getObjectByName('osc-v-wave') as THREE.Line;
      const iLine = oscGroup.getObjectByName('osc-i-wave') as THREE.Line;

      if (vLine && iLine) {
        const vPts: THREE.Vector3[] = [];
        const iPts: THREE.Vector3[] = [];
        const numSamples = 60;
        const screenW = 6.2;
        const screenH = 1.4;

        for (let j = 0; j <= numSamples; j++) {
          const sx = -4.0 - screenW / 2 + (j / numSamples) * screenW;
          const tSample = (j / numSamples) * 4 * Math.PI;
          const vy = 1.2 + Math.sin(tSample + wt) * screenH;
          const iy = 1.2 + Math.sin(tSample + wt - phi) * (screenH * Math.min(1.0, I0 / 2.0));
          vPts.push(new THREE.Vector3(sx, vy, 1.18));
          iPts.push(new THREE.Vector3(sx, iy, 1.18));
        }

        vLine.geometry.dispose();
        vLine.geometry = new THREE.BufferGeometry().setFromPoints(vPts);

        iLine.geometry.dispose();
        iLine.geometry = new THREE.BufferGeometry().setFromPoints(iPts);
      }
    }

    // 8. Dynamic 3D Labels
    const phiDeg = (phi * 180) / Math.PI;
    const resonanceStatus = isResonant
      ? `[⚡ RESONANCE] f = f₀ = ${f0.toFixed(1)} Hz | Z = R = ${R} Ω | I_max = ${I0.toFixed(2)} A`
      : `Z = ${Z.toFixed(1)} Ω | φ = ${phiDeg.toFixed(1)}° (${phiDeg >= 0 ? 'Inductive Lag' : 'Capacitive Lead'}) | f₀ = ${f0.toFixed(1)} Hz`;

    this.updateArrowLabel(
      'lcr-status-label',
      resonanceStatus,
      isResonant ? '#facc15' : '#38bdf8',
      new THREE.Vector3(0, 3.4, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'lcr-osc-label',
      `CH1: V(t) [Cyan] | CH2: I(t) [Green]`,
      '#4ade80',
      new THREE.Vector3(-4.0, 3.4, 1.0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'lcr-phasor-label',
      `3D Phasor Wheel: V_net [Purple]`,
      '#c084fc',
      new THREE.Vector3(4.2, 3.4, 1.0),
      ctx.showLabels
    );
  }

  // ==========================================
  // 6. YOUNG'S DOUBLE SLIT EXPERIMENT (YDSE)
  // ==========================================
  private getWavelengthColor(wavelength: number): { r: number; g: number; b: number; hex: string; hexNum: number; threeColor: THREE.Color } {
    let r = 0, g = 0, b = 0;
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380);
      g = 0.0;
      b = 1.0;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0.0;
      g = (wavelength - 440) / (490 - 440);
      b = 1.0;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0.0;
      g = 1.0;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1.0;
      b = 0.0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1.0;
      g = -(wavelength - 645) / (645 - 580);
      b = 0.0;
    } else if (wavelength >= 645 && wavelength <= 780) {
      r = 1.0;
      g = 0.0;
      b = 0.0;
    }

    let factor = 1.0;
    if (wavelength >= 380 && wavelength < 420) {
      factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
    } else if (wavelength >= 700 && wavelength <= 780) {
      factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700);
    }

    const R = Math.min(255, Math.max(0, Math.round(r * factor * 255)));
    const G = Math.min(255, Math.max(0, Math.round(g * factor * 255)));
    const B = Math.min(255, Math.max(0, Math.round(b * factor * 255)));
    const hex = `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    const hexNum = (R << 16) | (G << 8) | B;
    return { r: R, g: G, b: B, hex, hexNum, threeColor: new THREE.Color(R / 255, G / 255, B / 255) };
  }

  private ydseScreenCanvas: HTMLCanvasElement | null = null;
  private ydseScreenTexture: THREE.CanvasTexture | null = null;

  private setupYDSE(ctx: SimRenderContext) {
    const root = this.objectsGroup;

    // 1. Heavy Precision Optical Bench Rail (X axis)
    const railLength = 26;
    const railGeo = new THREE.BoxGeometry(railLength, 0.45, 1.8);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(-1.0, -3.2, 0);
    root.add(rail);

    // Rail Guide Channel
    const grooveGeo = new THREE.BoxGeometry(railLength - 0.2, 0.1, 0.4);
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    groove.position.set(-1.0, -2.95, 0);
    root.add(groove);

    // 4 Leveling Feet
    const footPositions = [
      [-13, -3.55, 0.7],
      [-13, -3.55, -0.7],
      [11, -3.55, 0.7],
      [11, -3.55, -0.7],
    ];
    footPositions.forEach(([fx, fy, fz]) => {
      const footGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.35, 16);
      const footMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      root.add(foot);
    });

    // Optical Bench Measurement Ruler Scale
    const rulerGeo = new THREE.BoxGeometry(railLength - 1, 0.08, 0.12);
    const rulerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 });
    const ruler = new THREE.Mesh(rulerGeo, rulerMat);
    ruler.position.set(-1.0, -2.95, 0.82);
    root.add(ruler);

    // 2. Sliding Carriages / Optical Mount Saddles
    const mountPositions = [
      { name: 'saddle-laser', x: -12.5, w: 2.2 },
      { name: 'saddle-s0', x: -8.5, w: 1.8 },
      { name: 'saddle-s12', x: -3.5, w: 1.8 },
      { name: 'saddle-screen', x: 8.0, w: 2.4 },
    ];
    mountPositions.forEach((m) => {
      const saddleGeo = new THREE.BoxGeometry(m.w, 0.5, 2.2);
      const saddleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
      const saddle = new THREE.Mesh(saddleGeo, saddleMat);
      saddle.position.set(m.x, -2.7, 0);
      saddle.name = m.name;
      root.add(saddle);

      // Clamping Thumbscrew on saddle
      const screwGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.4, 16);
      const screwMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(m.x, -2.7, 1.2);
      root.add(screw);

      // Vertical Upright Post
      const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 24);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(m.x, -1.1, 0);
      root.add(post);
    });

    // 3. Monochromatic Laser Light Source Head ($S_0$ System)
    const laserGroup = new THREE.Group();
    laserGroup.name = 'ydse-laser-head';
    laserGroup.position.set(-12.5, 0.5, 0);

    const laserHousingGeo = new THREE.CylinderGeometry(0.65, 0.65, 3.2, 32);
    const laserHousingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const laserHousing = new THREE.Mesh(laserHousingGeo, laserHousingMat);
    laserHousing.rotation.z = Math.PI / 2;
    laserGroup.add(laserHousing);

    // Laser Front Collimator Bezel
    const bezelGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.4, 32);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.rotation.z = Math.PI / 2;
    bezel.position.set(1.8, 0, 0);
    laserGroup.add(bezel);

    // Laser Emission Aperture Glowing Lens
    const lensGeo = new THREE.CircleGeometry(0.42, 32);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.y = Math.PI / 2;
    lens.position.set(2.01, 0, 0);
    lens.name = 'laser-lens-glow';
    laserGroup.add(lens);
    root.add(laserGroup);

    // Collimated Primary Laser Beam from Laser to S0
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.85 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(-10.5, 0.5, 0);
    beam.name = 'laser-collimated-beam';
    root.add(beam);

    // 4. Primary Single Slit Diaphragm ($S_0$) at x = -8.5
    const s0Group = new THREE.Group();
    s0Group.name = 'ydse-s0-holder';
    s0Group.position.set(-8.5, 0.5, 0);

    const s0FrameGeo = new THREE.BoxGeometry(0.18, 4.8, 3.6);
    const s0FrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const s0Frame = new THREE.Mesh(s0FrameGeo, s0FrameMat);
    s0Group.add(s0Frame);

    const s0PlateGeo = new THREE.BoxGeometry(0.12, 3.4, 2.4);
    const s0PlateMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.4, roughness: 0.6 });
    const s0Plate = new THREE.Mesh(s0PlateGeo, s0PlateMat);
    s0Plate.position.set(0.06, 0, 0);
    s0Group.add(s0Plate);

    // Slit S0 glowing aperture line
    const s0ApertureGeo = new THREE.BoxGeometry(0.14, 0.16, 1.2);
    const s0ApertureMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const s0Aperture = new THREE.Mesh(s0ApertureGeo, s0ApertureMat);
    s0Aperture.position.set(0.08, 0, 0);
    s0Aperture.name = 's0-aperture-glow';
    s0Group.add(s0Aperture);
    root.add(s0Group);

    // 5. Secondary Double Slit Assembly ($S_1, S_2$) at x = -3.5
    const s12Group = new THREE.Group();
    s12Group.name = 'ydse-s12-holder';
    s12Group.position.set(-3.5, 0.5, 0);

    const s12FrameGeo = new THREE.BoxGeometry(0.2, 5.4, 4.2);
    const s12FrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.25 });
    const s12Frame = new THREE.Mesh(s12FrameGeo, s12FrameMat);
    s12Group.add(s12Frame);

    const s12PlateGeo = new THREE.BoxGeometry(0.14, 4.0, 3.0);
    const s12PlateMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.4, roughness: 0.7 });
    const s12Plate = new THREE.Mesh(s12PlateGeo, s12PlateMat);
    s12Plate.position.set(0.06, 0, 0);
    s12Group.add(s12Plate);

    // Top Vernier Micrometer Knob for Slit Separation
    const knobGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.9, 24);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(0, 3.15, 0);
    s12Group.add(knob);

    // Glowing Secondary Slit Apertures (S1 at +y, S2 at -y)
    const s1MeshGeo = new THREE.BoxGeometry(0.16, 0.12, 1.4);
    const s1MeshMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const s1Mesh = new THREE.Mesh(s1MeshGeo, s1MeshMat);
    s1Mesh.name = 's1-slit-mesh';
    s12Group.add(s1Mesh);

    const s2MeshGeo = new THREE.BoxGeometry(0.16, 0.12, 1.4);
    const s2MeshMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const s2Mesh = new THREE.Mesh(s2MeshGeo, s2MeshMat);
    s2Mesh.name = 's2-slit-mesh';
    s12Group.add(s2Mesh);
    root.add(s12Group);

    // 6. Dynamic Huygens Wavelets & Interfering Wavefronts Group
    const primaryWaveGroup = new THREE.Group();
    primaryWaveGroup.name = 'ydse-primary-waves';
    root.add(primaryWaveGroup);

    const secondaryWaveGroup = new THREE.Group();
    secondaryWaveGroup.name = 'ydse-secondary-waves';
    root.add(secondaryWaveGroup);

    const antinodalLinesGroup = new THREE.Group();
    antinodalLinesGroup.name = 'ydse-antinodal-lines';
    root.add(antinodalLinesGroup);

    const rayOpticsGroup = new THREE.Group();
    rayOpticsGroup.name = 'ydse-ray-optics';
    root.add(rayOpticsGroup);

    // 7. Observation Screen with Dynamic Interference Texture
    const screenGroup = new THREE.Group();
    screenGroup.name = 'ydse-screen-group';
    screenGroup.position.set(8.0, 0.5, 0);

    // Screen Housing Frame
    const screenBezelGeo = new THREE.BoxGeometry(0.3, 8.4, 7.2);
    const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const screenBezel = new THREE.Mesh(screenBezelGeo, screenBezelMat);
    screenGroup.add(screenBezel);

    // Dynamic Canvas Texture for Physical Irradiance Pattern I(y)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    this.ydseScreenCanvas = canvas;
    this.ydseScreenTexture = new THREE.CanvasTexture(canvas);
    this.ydseScreenTexture.minFilter = THREE.LinearFilter;
    this.ydseScreenTexture.magFilter = THREE.LinearFilter;

    const screenSurfaceGeo = new THREE.PlaneGeometry(6.6, 7.8);
    const screenSurfaceMat = new THREE.MeshBasicMaterial({
      map: this.ydseScreenTexture,
      side: THREE.DoubleSide,
    });
    const screenSurface = new THREE.Mesh(screenSurfaceGeo, screenSurfaceMat);
    screenSurface.rotation.y = -Math.PI / 2;
    screenSurface.position.set(-0.16, 0, 0);
    screenSurface.name = 'ydse-screen-surface';
    screenGroup.add(screenSurface);
    root.add(screenGroup);

    // 8. Probe Point P 3D Bead Cursor on the Screen
    const probeBeadGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const probeBeadMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const probeBead = new THREE.Mesh(probeBeadGeo, probeBeadMat);
    probeBead.name = 'ydse-probe-bead';
    root.add(probeBead);

    // 9. Floating 3D Irradiance Curve Graph along the Screen
    const intensityCurveGroup = new THREE.Group();
    intensityCurveGroup.name = 'ydse-intensity-curve';
    root.add(intensityCurveGroup);
  }

  private updateYDSE(ctx: SimRenderContext) {
    const { wavelength = 550, d = 0.4, D = 1.5, probeY = 2.06, I0 = 50 } = ctx.params;
    const spectral = this.getWavelengthColor(wavelength);

    // Physical variables in SI units
    const lam_m = wavelength * 1e-9;
    const d_m = d * 1e-3;
    const D_m = D;
    const beta_m = (lam_m * D_m) / d_m;
    const beta_mm = beta_m * 1000;
    const probeY_mm = probeY;
    const probeY_m = probeY_mm * 1e-3;

    // 3D Geometric Scale Factors (mapped so visual layout is balanced and clear)
    const x_s0 = -8.5;
    const x_s12 = -3.5;
    // Map D (0.5 to 2.5 m) to 3D X distance (4.0 to 11.5)
    const screenX = x_s12 + Math.min(12, Math.max(4.0, D * 4.5 + 1.0));
    // Map d (0.1 to 1.5 mm) to 3D slit separation (0.4 to 2.8 units)
    const d_3D = Math.min(2.8, Math.max(0.4, d * 2.2));
    const s1_pos = new THREE.Vector3(x_s12, 0.5 + d_3D / 2, 0);
    const s2_pos = new THREE.Vector3(x_s12, 0.5 - d_3D / 2, 0);
    const s0_pos = new THREE.Vector3(x_s0, 0.5, 0);

    // Map screen Y coordinate (beta scale in 3D: 1 beta_mm corresponds to visual units)
    const beta_3D = Math.min(1.8, Math.max(0.35, (beta_mm / 2.0) * 0.9));
    const y_3D_probe = 0.5 + (probeY_mm / beta_mm) * beta_3D;
    const pointP_pos = new THREE.Vector3(screenX - 0.16, y_3D_probe, 0);

    // 1. Update Laser Light Color & Collimated Beam
    const lens = this.objectsGroup.getObjectByName('laser-lens-glow') as THREE.Mesh;
    if (lens) {
      (lens.material as THREE.MeshBasicMaterial).color.copy(spectral.threeColor);
    }
    const laserBeam = this.objectsGroup.getObjectByName('laser-collimated-beam') as THREE.Mesh;
    if (laserBeam) {
      (laserBeam.material as THREE.MeshBasicMaterial).color.copy(spectral.threeColor);
    }

    // 2. Update Primary Slit Aperture Glow
    const s0Glow = this.objectsGroup.getObjectByName('s0-aperture-glow') as THREE.Mesh;
    if (s0Glow) {
      (s0Glow.material as THREE.MeshBasicMaterial).color.copy(spectral.threeColor);
    }

    // 3. Update Slit S1 & S2 positions according to d parameter
    const s1Mesh = this.objectsGroup.getObjectByName('s1-slit-mesh') as THREE.Mesh;
    if (s1Mesh) {
      s1Mesh.position.set(0.08, d_3D / 2, 0);
      (s1Mesh.material as THREE.MeshBasicMaterial).color.copy(spectral.threeColor);
    }
    const s2Mesh = this.objectsGroup.getObjectByName('s2-slit-mesh') as THREE.Mesh;
    if (s2Mesh) {
      s2Mesh.position.set(0.08, -d_3D / 2, 0);
      (s2Mesh.material as THREE.MeshBasicMaterial).color.copy(spectral.threeColor);
    }

    // 4. Update Screen Position according to D parameter
    const screenGroup = this.objectsGroup.getObjectByName('ydse-screen-group') as THREE.Group;
    if (screenGroup) {
      screenGroup.position.x = screenX;
    }
    const saddleScreen = this.objectsGroup.getObjectByName('saddle-screen');
    if (saddleScreen) {
      saddleScreen.position.x = screenX;
    }

    // 5. Render Expanding Primary Wavefronts from S0 towards S1 & S2 (Spatial Coherence)
    const primaryWaveGroup = this.objectsGroup.getObjectByName('ydse-primary-waves') as THREE.Group;
    if (primaryWaveGroup) {
      while (primaryWaveGroup.children.length > 0) {
        this.disposeObject(primaryWaveGroup.children[0]);
        primaryWaveGroup.remove(primaryWaveGroup.children[0]);
      }

      const primaryDist = x_s12 - x_s0; // = 5.0
      const waveSpeed = 2.4;
      const waveSpacing = 0.75;
      const numPrimaryArcs = 7;
      const animOffsetPrimary = (ctx.simTime * waveSpeed) % waveSpacing;

      for (let i = 0; i < numPrimaryArcs; i++) {
        const radius = i * waveSpacing + animOffsetPrimary;
        if (radius > 0.2 && radius < primaryDist + 0.4) {
          const arcAngle = Math.PI * 0.42;
          const arcGeo = new THREE.RingGeometry(radius - 0.025, radius + 0.025, 32, 1, -arcAngle / 2, arcAngle);
          const opacity = Math.max(0.12, 0.75 * (1 - radius / (primaryDist + 0.8)));
          const arcMat = new THREE.MeshBasicMaterial({
            color: spectral.threeColor,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide,
          });
          const arcMesh = new THREE.Mesh(arcGeo, arcMat);
          arcMesh.position.set(s0_pos.x, s0_pos.y, 0);
          // RingGeometry is in XY plane with arc opening along +X axis (forward towards slits)
          primaryWaveGroup.add(arcMesh);

          // 3D cylindrical wave sheet segment for depth in 3D orbit
          const zDepthLevels = [-0.6, -0.3, 0.3, 0.6];
          zDepthLevels.forEach((zLvl) => {
            const zArc = new THREE.Mesh(
              arcGeo,
              new THREE.MeshBasicMaterial({
                color: spectral.threeColor,
                transparent: true,
                opacity: opacity * 0.35,
                side: THREE.DoubleSide,
              })
            );
            zArc.position.set(s0_pos.x, s0_pos.y, zLvl);
            primaryWaveGroup.add(zArc);
          });
        }
      }
    }

    // 6. Render Secondary Huygens Wavelets & Interfering Wavefronts from S1 and S2
    const secondaryWaveGroup = this.objectsGroup.getObjectByName('ydse-secondary-waves') as THREE.Group;
    if (secondaryWaveGroup) {
      while (secondaryWaveGroup.children.length > 0) {
        this.disposeObject(secondaryWaveGroup.children[0]);
        secondaryWaveGroup.remove(secondaryWaveGroup.children[0]);
      }

      const propagationDistance = screenX - x_s12;
      const waveSpeed = 2.4;
      const waveSpacing = 0.75;
      const numRings = Math.min(18, Math.floor(propagationDistance / waveSpacing) + 2);
      const animOffset = (ctx.simTime * waveSpeed) % waveSpacing;

      for (let i = 0; i < numRings; i++) {
        const radius = i * waveSpacing + animOffset;
        if (radius > 0.2 && radius < propagationDistance + 0.6) {
          const arcSpan = Math.PI * 0.62;
          const fade = Math.max(0.08, 1 - (radius / (propagationDistance + 1.0)) * 0.85);

          // Wave Crest (+A, solid vibrant line in XY plane pointing along +X towards screen)
          const crestGeo = new THREE.RingGeometry(radius - 0.03, radius + 0.03, 40, 1, -arcSpan / 2, arcSpan);
          const crestMat = new THREE.MeshBasicMaterial({
            color: spectral.threeColor,
            transparent: true,
            opacity: 0.75 * fade,
            side: THREE.DoubleSide,
          });

          // Wave Crest from S1
          const ring1 = new THREE.Mesh(crestGeo, crestMat);
          ring1.position.set(s1_pos.x, s1_pos.y, 0);
          secondaryWaveGroup.add(ring1);

          // Wave Crest from S2
          const ring2 = new THREE.Mesh(crestGeo, crestMat);
          ring2.position.set(s2_pos.x, s2_pos.y, 0);
          secondaryWaveGroup.add(ring2);

          // 3D Spatial Depth Arcs along Z-axis for physical cylindrical wave appearance
          const zOffsets = [-0.8, -0.4, 0.4, 0.8];
          zOffsets.forEach((zOff) => {
            const zMat = new THREE.MeshBasicMaterial({
              color: spectral.threeColor,
              transparent: true,
              opacity: 0.25 * fade,
              side: THREE.DoubleSide,
            });
            const zRing1 = new THREE.Mesh(crestGeo, zMat);
            zRing1.position.set(s1_pos.x, s1_pos.y, zOff);
            secondaryWaveGroup.add(zRing1);

            const zRing2 = new THREE.Mesh(crestGeo, zMat);
            zRing2.position.set(s2_pos.x, s2_pos.y, zOff);
            secondaryWaveGroup.add(zRing2);
          });

          // Wave Trough (-A, subtle dashed/dim ring halfway between crests)
          const troughRadius = radius + waveSpacing * 0.5;
          if (troughRadius < propagationDistance + 0.5) {
            const troughGeo = new THREE.RingGeometry(troughRadius - 0.015, troughRadius + 0.015, 40, 1, -arcSpan / 2, arcSpan);
            const troughMat = new THREE.MeshBasicMaterial({
              color: 0x94a3b8,
              transparent: true,
              opacity: 0.28 * fade,
              side: THREE.DoubleSide,
            });

            const tRing1 = new THREE.Mesh(troughGeo, troughMat);
            tRing1.position.set(s1_pos.x, s1_pos.y, 0);
            secondaryWaveGroup.add(tRing1);

            const tRing2 = new THREE.Mesh(troughGeo, troughMat);
            tRing2.position.set(s2_pos.x, s2_pos.y, 0);
            secondaryWaveGroup.add(tRing2);
          }
        }
      }
    }

    // 7. Render Constructive Interference Antinodes (Maxima) & Destructive Nodes (Minima) Loci
    const antinodalGroup = this.objectsGroup.getObjectByName('ydse-antinodal-lines') as THREE.Group;
    if (antinodalGroup) {
      while (antinodalGroup.children.length > 0) {
        this.disposeObject(antinodalGroup.children[0]);
        antinodalGroup.remove(antinodalGroup.children[0]);
      }

      const slitMidpoint = new THREE.Vector3(x_s12, 0.5, 0);

      // Central Maxima (0th order, n=0, Δx = 0)
      const centralLinePts = [slitMidpoint, new THREE.Vector3(screenX - 0.16, 0.5, 0)];
      const centralLineGeo = new THREE.BufferGeometry().setFromPoints(centralLinePts);
      const centralLineMat = new THREE.LineBasicMaterial({ color: spectral.threeColor, transparent: true, opacity: 0.85, linewidth: 2 });
      const centralLine = new THREE.Line(centralLineGeo, centralLineMat);
      antinodalGroup.add(centralLine);

      // Higher order Maxima (n = ±1, ±2, ±3)
      [-3, -2, -1, 1, 2, 3].forEach((n) => {
        const yScreen_n = 0.5 + n * beta_3D;
        const targetPt = new THREE.Vector3(screenX - 0.16, yScreen_n, 0);
        const pts = [slitMidpoint, targetPt];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineDashedMaterial({
          color: spectral.threeColor,
          dashSize: 0.35,
          gapSize: 0.2,
          transparent: true,
          opacity: 0.45,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        antinodalGroup.add(line);
      });

      // Minima lines (n = ±0.5, ±1.5, ±2.5)
      [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].forEach((m) => {
        const yScreen_m = 0.5 + m * beta_3D;
        const targetPt = new THREE.Vector3(screenX - 0.16, yScreen_m, 0);
        const pts = [slitMidpoint, targetPt];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0xef4444,
          dashSize: 0.2,
          gapSize: 0.3,
          transparent: true,
          opacity: 0.3,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        antinodalGroup.add(line);
      });
    }

    // 8. Optical Ray Tracing from S1 and S2 to Point P & Perpendicular Path Difference Segment S1-N
    const rayGroup = this.objectsGroup.getObjectByName('ydse-ray-optics') as THREE.Group;
    if (rayGroup) {
      while (rayGroup.children.length > 0) {
        this.disposeObject(rayGroup.children[0]);
        rayGroup.remove(rayGroup.children[0]);
      }

      // Ray 1: S1 -> P
      const ray1Pts = [s1_pos, pointP_pos];
      const ray1Geo = new THREE.BufferGeometry().setFromPoints(ray1Pts);
      const ray1Mat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2.5 });
      const ray1 = new THREE.Line(ray1Geo, ray1Mat);
      rayGroup.add(ray1);

      // Ray 2: S2 -> P
      const ray2Pts = [s2_pos, pointP_pos];
      const ray2Geo = new THREE.BufferGeometry().setFromPoints(ray2Pts);
      const ray2Mat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2.5 });
      const ray2 = new THREE.Line(ray2Geo, ray2Mat);
      rayGroup.add(ray2);

      // Perpendicular point N dropped from S1 onto ray S2 -> P
      const vRay2 = new THREE.Vector3().subVectors(pointP_pos, s2_pos);
      const lenRay2 = vRay2.length();
      const unitRay2 = vRay2.clone().normalize();
      const vS1S2 = new THREE.Vector3().subVectors(s1_pos, s2_pos);
      const proj = vS1S2.dot(unitRay2);
      const ptN = s2_pos.clone().add(unitRay2.clone().multiplyScalar(proj));

      // Perpendicular Dropped Line S1 -> N
      const perpPts = [s1_pos, ptN];
      const perpGeo = new THREE.BufferGeometry().setFromPoints(perpPts);
      const perpMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.15, gapSize: 0.1, linewidth: 2 });
      const perpLine = new THREE.Line(perpGeo, perpMat);
      perpLine.computeLineDistances();
      rayGroup.add(perpLine);

      // Highlighted Path Difference Segment S2 -> N (Δx = d sin θ)
      const diffPts = [s2_pos, ptN];
      const diffGeo = new THREE.BufferGeometry().setFromPoints(diffPts);
      const diffMat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 4 });
      const diffLine = new THREE.Line(diffGeo, diffMat);
      rayGroup.add(diffLine);

      // Small glowing bead at point N
      const nBeadGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const nBeadMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
      const nBead = new THREE.Mesh(nBeadGeo, nBeadMat);
      nBead.position.copy(ptN);
      rayGroup.add(nBead);
    }

    // 9. Update Point P Probe Cursor Bead
    const probeBead = this.objectsGroup.getObjectByName('ydse-probe-bead') as THREE.Mesh;
    if (probeBead) {
      probeBead.position.copy(pointP_pos);
      (probeBead.material as THREE.MeshBasicMaterial).color.copy(spectral.threeColor);
    }

    // 10. Procedural High-Fidelity Canvas Texture for Screen Interference Pattern I(y)
    if (this.ydseScreenCanvas && this.ydseScreenTexture) {
      const cv = this.ydseScreenCanvas;
      const ctx2d = cv.getContext('2d');
      if (ctx2d) {
        ctx2d.fillStyle = '#060810';
        ctx2d.fillRect(0, 0, cv.width, cv.height);

        // Physical interference pattern: I(y) = 4 I_0 cos^2(π d y / λ D)
        const centerY = cv.height / 2;
        const pixelsPerBeta = (beta_3D / 7.8) * cv.height;

        const imgData = ctx2d.createImageData(cv.width, cv.height);
        const data = imgData.data;

        for (let py = 0; py < cv.height; py++) {
          const dy = py - centerY;
          const phase = (Math.PI * dy) / Math.max(1, pixelsPerBeta);
          const intensity = Math.pow(Math.cos(phase), 2);

          // Horizontal Gaussian profile (beam width envelope)
          for (let px = 0; px < cv.width; px++) {
            const dx = px - cv.width / 2;
            const hFactor = Math.exp(-(dx * dx) / (2 * 110 * 110));
            const netVal = intensity * hFactor;

            const idx = (py * cv.width + px) * 4;
            data[idx] = Math.round(spectral.r * netVal);
            data[idx + 1] = Math.round(spectral.g * netVal);
            data[idx + 2] = Math.round(spectral.b * netVal);
            data[idx + 3] = 255;
          }
        }
        ctx2d.putImageData(imgData, 0, 0);

        // Draw Screen Coordinate Tick Marks on Side
        ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx2d.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx2d.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx2d.lineWidth = 2;

        // Center line (y = 0, Central Bright Fringe)
        ctx2d.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx2d.beginPath();
        ctx2d.moveTo(cv.width - 70, centerY);
        ctx2d.lineTo(cv.width - 10, centerY);
        ctx2d.stroke();
        ctx2d.fillText('y=0 (O)', cv.width - 120, centerY + 5);

        // Maxima ticks (±1β, ±2β, ±3β)
        [-3, -2, -1, 1, 2, 3].forEach((n) => {
          const tickY = centerY + n * pixelsPerBeta;
          if (tickY >= 15 && tickY <= cv.height - 15) {
            ctx2d.beginPath();
            ctx2d.moveTo(cv.width - 50, tickY);
            ctx2d.lineTo(cv.width - 10, tickY);
            ctx2d.stroke();
            ctx2d.fillText(`${n > 0 ? '+' : ''}${n}β`, cv.width - 95, tickY + 5);
          }
        });

        // Minima ticks (±0.5β, ±1.5β, ±2.5β)
        [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].forEach((m) => {
          const tickY = centerY + m * pixelsPerBeta;
          if (tickY >= 15 && tickY <= cv.height - 15) {
            ctx2d.strokeStyle = 'rgba(239, 68, 68, 0.6)';
            ctx2d.beginPath();
            ctx2d.moveTo(cv.width - 35, tickY);
            ctx2d.lineTo(cv.width - 10, tickY);
            ctx2d.stroke();
          }
        });

        // Draw Point P cursor indicator line
        const pPixelY = centerY - (probeY_mm / beta_mm) * pixelsPerBeta;
        if (pPixelY >= 0 && pPixelY <= cv.height) {
          ctx2d.strokeStyle = '#f59e0b';
          ctx2d.lineWidth = 3;
          ctx2d.beginPath();
          ctx2d.moveTo(20, pPixelY);
          ctx2d.lineTo(cv.width - 140, pPixelY);
          ctx2d.stroke();

          ctx2d.fillStyle = '#f59e0b';
          ctx2d.beginPath();
          ctx2d.arc(cv.width / 2, pPixelY, 6, 0, Math.PI * 2);
          ctx2d.fill();
          ctx2d.fillText(`P (y=${probeY_mm.toFixed(2)}mm)`, 25, pPixelY - 8);
        }

        this.ydseScreenTexture.needsUpdate = true;
      }
    }

    // 11. Render 3D Floating Intensity Profile Curve I(y)
    const curveGroup = this.objectsGroup.getObjectByName('ydse-intensity-curve') as THREE.Group;
    if (curveGroup) {
      while (curveGroup.children.length > 0) {
        this.disposeObject(curveGroup.children[0]);
        curveGroup.remove(curveGroup.children[0]);
      }

      const curvePts: THREE.Vector3[] = [];
      const zBase = -3.8;
      const numPts = 120;
      const yRange = 3.6;

      for (let i = 0; i <= numPts; i++) {
        const yVal = -yRange + (i / numPts) * (2 * yRange);
        const dy = yVal;
        const phase = (Math.PI * dy) / beta_3D;
        const I_norm = Math.pow(Math.cos(phase), 2);
        const zOffset = zBase - I_norm * 2.2;
        curvePts.push(new THREE.Vector3(screenX - 0.16, 0.5 + yVal, zOffset));
      }

      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      const curveMat = new THREE.LineBasicMaterial({ color: spectral.threeColor, linewidth: 3 });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      curveGroup.add(curveLine);

      // Baseline reference for intensity curve
      const basePts = [
        new THREE.Vector3(screenX - 0.16, 0.5 - yRange, zBase),
        new THREE.Vector3(screenX - 0.16, 0.5 + yRange, zBase),
      ];
      const baseGeo = new THREE.BufferGeometry().setFromPoints(basePts);
      const baseMat = new THREE.LineBasicMaterial({ color: 0x475569 });
      const baseLine = new THREE.Line(baseGeo, baseMat);
      curveGroup.add(baseLine);
    }

    // 12. Update High-Contrast 3D Floating Billboards & Labels
    const pathDiff_m = (probeY_m * d_m) / D_m;
    const pathDiff_nm = pathDiff_m * 1e9;
    const inLambda = pathDiff_nm / wavelength;
    const roundedN = Math.round(inLambda);
    const isBright = Math.abs(inLambda - roundedN) < 0.08;
    const isDark = Math.abs(Math.abs(inLambda) - (Math.floor(Math.abs(inLambda)) + 0.5)) < 0.08;
    let pStatus = 'Intermediate';
    if (isBright) pStatus = `Bright Maxima (n=${roundedN})`;
    else if (isDark) pStatus = `Dark Minima`;

    this.updateArrowLabel(
      'ydse-s0',
      'Primary Source S₀',
      spectral.hex,
      new THREE.Vector3(x_s0, 3.2, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'ydse-s12',
      `Slits S₁, S₂ (d = ${d.toFixed(2)} mm)`,
      '#38bdf8',
      new THREE.Vector3(x_s12, 3.6, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'ydse-fringe',
      `Fringe Width β = ${beta_mm.toFixed(2)} mm`,
      '#4ade80',
      new THREE.Vector3(screenX, 4.8, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'ydse-central',
      'Central Maxima (0th Order, Δx = 0)',
      spectral.hex,
      new THREE.Vector3(screenX, 0.5, 3.8),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'ydse-probe',
      `P(y=${probeY_mm.toFixed(2)}mm): Δx=${pathDiff_nm.toFixed(0)}nm (${inLambda.toFixed(2)}λ) • ${pStatus}`,
      '#f59e0b',
      new THREE.Vector3(pointP_pos.x, pointP_pos.y + 0.6, pointP_pos.z),
      ctx.showLabels
    );
  }

  // ==========================================
  // 7. VERNIER CALIPER (ACCURATE 3D MODEL)
  // ==========================================
  private setupVernier(ctx: SimRenderContext) {
    const isDark = ctx.isDark;
    const vsdCount = ctx.params.vsdCount || 10;
    const scaleFactor = 0.25;

    // Materials
    const beamMetalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x94a3b8 : 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.25,
    });
    const jawMetalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x64748b : 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.25,
    });

    // 1. Main Beam Scale Texture
    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = 2048;
    mainCanvas.height = 256;
    const mctx = mainCanvas.getContext('2d');
    if (mctx) {
      mctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      mctx.fillRect(0, 0, 2048, 256);
      
      // Top satin border
      mctx.fillStyle = isDark ? '#334155' : '#e2e8f0';
      mctx.fillRect(0, 0, 2048, 20);

      // Engraved Metric Graduations (0 to 80 mm)
      mctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      mctx.strokeStyle = isDark ? '#f8fafc' : '#0f172a';
      mctx.lineWidth = 3;
      mctx.font = 'bold 36px monospace';
      mctx.textAlign = 'center';

      const pxPerMm = 2048 / 80;
      for (let mm = 0; mm <= 75; mm++) {
        const x = mm * pxPerMm;
        let tickHeight = 40;
        if (mm % 10 === 0) {
          tickHeight = 90;
          mctx.fillText(`${mm / 10}`, x, 256 - tickHeight - 20);
        } else if (mm % 5 === 0) {
          tickHeight = 65;
        }

        mctx.beginPath();
        mctx.moveTo(x, 256);
        mctx.lineTo(x, 256 - tickHeight);
        mctx.stroke();
      }

      // Title branding
      mctx.font = 'bold 24px sans-serif';
      mctx.textAlign = 'left';
      mctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      mctx.fillText('STAINLESS HARDENED • 0.1mm / 0.05mm', 400, 50);
    }
    const mainScaleTex = new THREE.CanvasTexture(mainCanvas);

    // 1. Main Beam Mesh
    const beamGeo = new THREE.BoxGeometry(22, 2.2, 0.35);
    const beamMat = new THREE.MeshStandardMaterial({
      map: mainScaleTex,
      metalness: 0.75,
      roughness: 0.3,
    });
    const mainBeam = new THREE.Mesh(beamGeo, beamMat);
    mainBeam.position.set(5.0, 0.5, 0);
    this.objectsGroup.add(mainBeam);

    // Rear Depth Guide Rail Slot
    const slotGeo = new THREE.BoxGeometry(21.5, 0.3, 0.1);
    const slotMesh = new THREE.Mesh(slotGeo, new THREE.MeshBasicMaterial({ color: isDark ? 0x0f172a : 0x64748b }));
    slotMesh.position.set(5.0, 0.5, -0.16);
    this.objectsGroup.add(slotMesh);

    // 2. Fixed Lower External Jaw (Anvil at X = -6.0)
    const fixedLowerShape = new THREE.Shape();
    fixedLowerShape.moveTo(-6.0, 1.6);
    fixedLowerShape.lineTo(-6.0, -4.5); // flat anvil measuring face
    fixedLowerShape.lineTo(-6.8, -4.5); // tip
    fixedLowerShape.lineTo(-7.8, -1.0); // curved ergonomic outer profile
    fixedLowerShape.lineTo(-7.8, 1.6);
    fixedLowerShape.closePath();

    const fixedLowerGeo = new THREE.ExtrudeGeometry(fixedLowerShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    const fixedLowerJaw = new THREE.Mesh(fixedLowerGeo, jawMetalMat);
    fixedLowerJaw.position.set(0, 0, -0.19);
    this.objectsGroup.add(fixedLowerJaw);

    // 3. Fixed Upper Internal Horn (Nib at X = -6.0)
    const fixedUpperShape = new THREE.Shape();
    fixedUpperShape.moveTo(-6.0, 1.6);
    fixedUpperShape.lineTo(-6.0, 3.8); // measuring face
    fixedUpperShape.lineTo(-6.6, 3.8);
    fixedUpperShape.lineTo(-7.6, 1.6);
    fixedUpperShape.closePath();

    const fixedUpperGeo = new THREE.ExtrudeGeometry(fixedUpperShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    const fixedUpperJaw = new THREE.Mesh(fixedUpperGeo, jawMetalMat);
    fixedUpperJaw.position.set(0, 0, -0.19);
    this.objectsGroup.add(fixedUpperJaw);

    // 4. Sliding Vernier Assembly
    const slidingGroup = new THREE.Group();
    slidingGroup.name = 'vernier-slider';

    // Vernier Scale Texture
    const vernierCanvas = document.createElement('canvas');
    vernierCanvas.width = 512;
    vernierCanvas.height = 128;
    const vctx = vernierCanvas.getContext('2d');
    if (vctx) {
      vctx.fillStyle = isDark ? '#0f172a' : '#e2e8f0';
      vctx.fillRect(0, 0, 512, 128);

      vctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      vctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      vctx.lineWidth = 3;
      vctx.font = 'bold 22px monospace';
      vctx.textAlign = 'center';

      const n = vsdCount;
      const totalWidthPx = 450; // maps to (n - 1) mm
      const stepPx = totalWidthPx / n;

      for (let i = 0; i <= n; i++) {
        const x = 30 + i * stepPx;
        const tickH = i === 0 || i === n || i === n / 2 ? 45 : 30;
        vctx.beginPath();
        vctx.moveTo(x, 0);
        vctx.lineTo(x, tickH);
        vctx.stroke();

        if (i === 0) vctx.fillText('0', x, tickH + 25);
        else if (i === n) vctx.fillText(`${n}`, x, tickH + 25);
        else if (i === n / 2) vctx.fillText(`${n / 2}`, x, tickH + 25);
      }
    }
    const vernierTex = new THREE.CanvasTexture(vernierCanvas);

    // Movable slider body with window cutout
    const sliderBodyGeo = new THREE.BoxGeometry(5.2, 2.5, 0.55);
    const sliderBodyMat = new THREE.MeshStandardMaterial({
      map: vernierTex,
      metalness: 0.8,
      roughness: 0.25,
    });
    const sliderBody = new THREE.Mesh(sliderBodyGeo, sliderBodyMat);
    sliderBody.position.set(2.5, 0.5, 0);
    slidingGroup.add(sliderBody);

    // Movable Lower External Jaw (Left face touches object at relative X = 0)
    const movLowerShape = new THREE.Shape();
    movLowerShape.moveTo(0, 1.6);
    movLowerShape.lineTo(0, -4.5); // flat measuring face
    movLowerShape.lineTo(0.8, -4.5);
    movLowerShape.lineTo(1.8, -1.0);
    movLowerShape.lineTo(1.8, 1.6);
    movLowerShape.closePath();

    const movLowerGeo = new THREE.ExtrudeGeometry(movLowerShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    const movLowerJaw = new THREE.Mesh(movLowerGeo, jawMetalMat);
    movLowerJaw.position.set(0, 0, -0.21);
    slidingGroup.add(movLowerJaw);

    // Movable Upper Internal Horn (Measuring face at relative X = 0)
    const movUpperShape = new THREE.Shape();
    movUpperShape.moveTo(0, 1.6);
    movUpperShape.lineTo(0, 3.8);
    movUpperShape.lineTo(0.6, 3.8);
    movUpperShape.lineTo(1.6, 1.6);
    movUpperShape.closePath();

    const movUpperGeo = new THREE.ExtrudeGeometry(movUpperShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    const movUpperJaw = new THREE.Mesh(movUpperGeo, jawMetalMat);
    movUpperJaw.position.set(0, 0, -0.21);
    slidingGroup.add(movUpperJaw);

    // Top Locking Thumbscrew
    const screwKnobGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 24);
    const screwKnob = new THREE.Mesh(screwKnobGeo, brassMat);
    screwKnob.position.set(3.2, 2.0, 0);
    slidingGroup.add(screwKnob);

    // Bottom Ergonomic Thumb Rest with grooved ridges
    const thumbRestGeo = new THREE.BoxGeometry(1.4, 0.5, 0.58);
    const thumbRest = new THREE.Mesh(thumbRestGeo, jawMetalMat);
    thumbRest.position.set(3.6, -0.9, 0);
    slidingGroup.add(thumbRest);

    // Live Coincidence Highlight Indicator Line
    const coincLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.6, 0.3),
      new THREE.Vector3(0, 1.6, 0.3),
    ]);
    const coincLineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 3,
    });
    const coincLine = new THREE.Line(coincLineGeo, coincLineMat);
    coincLine.name = 'vernier-coinc-line';
    slidingGroup.add(coincLine);

    this.objectsGroup.add(slidingGroup);

    // 5. Depth Gauge Rod extending out of rear tail of main beam
    const depthRodGeo = new THREE.BoxGeometry(20, 0.2, 0.08);
    const depthRod = new THREE.Mesh(depthRodGeo, chromeMat);
    depthRod.name = 'vernier-depth-rod';
    depthRod.position.set(15.0, 0.5, -0.16);
    this.objectsGroup.add(depthRod);

    // 6. Measured Object (Cylindrical Specimen)
    const objGeo = new THREE.CylinderGeometry(1, 1, 2.5, 36);
    const objMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.75,
      roughness: 0.2,
    });
    const cylinder = new THREE.Mesh(objGeo, objMat);
    cylinder.name = 'measured-object';
    cylinder.rotation.z = Math.PI / 2;
    cylinder.position.set(-6.0, -2.5, 0);
    this.objectsGroup.add(cylinder);

    // 7. Visual Error Margin & Tolerance Band 3D Representation
    const errorGroup = new THREE.Group();
    errorGroup.name = 'vernier-error-margin-group';

    // (a) Translucent Holographic Error Volume Envelope
    const envelopeGeo = new THREE.CylinderGeometry(1.15, 1.15, 1, 36);
    const envelopeMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
      depthWrite: false,
    });
    this.physicsMiddleware.applyDepthBias(envelopeMat, -2.0, -4.0);
    const errorEnvelope = new THREE.Mesh(envelopeGeo, envelopeMat);
    errorEnvelope.name = 'vernier-error-envelope';
    errorEnvelope.rotation.z = Math.PI / 2;
    errorGroup.add(errorEnvelope);

    // (b) 3D Tolerance Bracket & Limits
    const bracketMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
    const bracketGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -4.2, 0.4),
      new THREE.Vector3(1, -4.2, 0.4),
    ]);
    const bracketLine = new THREE.Line(bracketGeo, bracketMat);
    bracketLine.name = 'vernier-bracket-axis';
    errorGroup.add(bracketLine);

    const minTickGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -4.45, 0.4),
      new THREE.Vector3(0, -3.95, 0.4),
    ]);
    const minTick = new THREE.Line(minTickGeo, new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 }));
    minTick.name = 'vernier-bracket-min';
    errorGroup.add(minTick);

    const maxTickGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -4.45, 0.4),
      new THREE.Vector3(0, -3.95, 0.4),
    ]);
    const maxTick = new THREE.Line(maxTickGeo, new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 }));
    maxTick.name = 'vernier-bracket-max';
    errorGroup.add(maxTick);

    const nomTickGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -4.35, 0.4),
      new THREE.Vector3(0, -4.05, 0.4),
    ]);
    const nomTick = new THREE.Line(nomTickGeo, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }));
    nomTick.name = 'vernier-bracket-nom';
    errorGroup.add(nomTick);

    // (c) Repeated Measurement Sample Trial Points in 3D
    const sampleDotsGroup = new THREE.Group();
    sampleDotsGroup.name = 'vernier-sample-dots';
    const dotGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    for (let i = 0; i < 10; i++) {
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.name = `vernier-sample-dot-${i}`;
      sampleDotsGroup.add(dotMesh);
    }
    errorGroup.add(sampleDotsGroup);

    this.objectsGroup.add(errorGroup);
  }

  private updateVernier(ctx: SimRenderContext) {
    const {
      objectSize = 18.4,
      zeroError = 0,
      vsdCount = 10,
      uncertainty = 0.05,
      sampleTrials = 6,
    } = ctx.params;
    const scaleFactor = 0.25; // 1 mm = 0.25 3D world units
    const apparentLength = Math.max(0, objectSize + zeroError);
    const apparentDisp = apparentLength * scaleFactor;

    // 1. Move Sliding Vernier Assembly
    const slider = this.objectsGroup.getObjectByName('vernier-slider');
    if (slider) {
      slider.position.set(-6.0 + apparentDisp, 0, 0);

      // Calculate Vernier Coincidence
      const msr = Math.floor(apparentLength);
      const remainder = apparentLength - msr;
      const lc = 1.0 / vsdCount;
      const vsr = Math.min(vsdCount, Math.max(0, Math.round(remainder / lc)));

      // Position Coincidence indicator line relative to slider
      const coincLine = slider.getObjectByName('vernier-coinc-line');
      if (coincLine) {
        const vsdSpacing3D = (scaleFactor * (vsdCount - 1)) / vsdCount;
        coincLine.position.set(vsr * vsdSpacing3D, 0, 0);
        coincLine.visible = ctx.showVectors || ctx.showLabels;
      }
    }

    // 2. Adjust Specimen (Cylinder)
    const realWidth = Math.max(0.1, objectSize) * scaleFactor;
    const radius = Math.min(1.8, Math.max(0.6, realWidth / 2));
    const obj = this.objectsGroup.getObjectByName('measured-object');
    if (obj) {
      obj.scale.set(radius, realWidth / 2, radius);
      obj.position.set(-6.0 + realWidth / 2, -2.5, 0);
      obj.visible = objectSize > 0.05;
    }

    // 3. Extend Depth Gauge Rod
    const depthRod = this.objectsGroup.getObjectByName('vernier-depth-rod');
    if (depthRod) {
      depthRod.position.set(16.0 + apparentDisp / 2, 0.5, -0.16);
      depthRod.scale.set(1 + apparentDisp / 20, 1, 1);
    }

    // 4. Update 3D Visual Error Margin & Tolerance Band Representation
    const errorGroup = this.objectsGroup.getObjectByName('vernier-error-margin-group');
    if (errorGroup) {
      const deltaX = Math.max(0.005, uncertainty);
      const deltaXScaled = deltaX * scaleFactor;
      const minX = -6.0 + Math.max(0, objectSize - deltaX) * scaleFactor;
      const maxX = -6.0 + (objectSize + deltaX) * scaleFactor;
      const nomX = -6.0 + realWidth;
      const errorSpan = Math.max(0.02, maxX - minX);

      // (a) Holographic Error Volume Envelope
      const envelope = errorGroup.getObjectByName('vernier-error-envelope') as THREE.Mesh;
      if (envelope) {
        envelope.position.set((minX + maxX) / 2, -2.5, 0);
        envelope.scale.set(radius * 1.18, errorSpan / 2, radius * 1.18);
        envelope.visible = ctx.showVectors || ctx.showLabels || true;
      }

      // (b) 3D Tolerance Bracket & Limits
      const bracketLine = errorGroup.getObjectByName('vernier-bracket-axis') as THREE.Line;
      if (bracketLine) {
        const positions = new Float32Array([
          minX, -4.2, 0.4,
          maxX, -4.2, 0.4,
        ]);
        bracketLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        bracketLine.geometry.computeBoundingSphere();
      }

      const minTick = errorGroup.getObjectByName('vernier-bracket-min') as THREE.Line;
      if (minTick) {
        const pos = new Float32Array([
          minX, -4.45, 0.4,
          minX, -3.95, 0.4,
        ]);
        minTick.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        minTick.geometry.computeBoundingSphere();
      }

      const maxTick = errorGroup.getObjectByName('vernier-bracket-max') as THREE.Line;
      if (maxTick) {
        const pos = new Float32Array([
          maxX, -4.45, 0.4,
          maxX, -3.95, 0.4,
        ]);
        maxTick.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        maxTick.geometry.computeBoundingSphere();
      }

      const nomTick = errorGroup.getObjectByName('vernier-bracket-nom') as THREE.Line;
      if (nomTick) {
        const pos = new Float32Array([
          nomX, -4.35, 0.4,
          nomX, -4.05, 0.4,
        ]);
        nomTick.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        nomTick.geometry.computeBoundingSphere();
      }

      // (c) Repeated Measurement Sample Scatter in 3D
      const sampleGroup = errorGroup.getObjectByName('vernier-sample-dots');
      if (sampleGroup) {
        const nTrials = Math.min(10, Math.max(1, Math.round(sampleTrials)));
        for (let i = 0; i < 10; i++) {
          const dot = sampleGroup.getObjectByName(`vernier-sample-dot-${i}`);
          if (dot) {
            if (i < nTrials) {
              // Deterministic quasi-Gaussian distribution around nominal
              const u1 = ((i * 37 + 17) % 100) / 100;
              const u2 = ((i * 59 + 29) % 100) / 100;
              const normalZ = Math.cos(2 * Math.PI * u1) * Math.sqrt(-2 * Math.log(Math.max(0.05, u2))) * 0.42;
              const clampedZ = Math.max(-1, Math.min(1, normalZ));
              const dotX = nomX + clampedZ * deltaXScaled;
              const dotAngle = (i * 2.399);
              const dotRad = (radius * 0.75) * (0.4 + 0.6 * ((i * 23) % 10) / 10);
              const dotY = -2.5 + Math.sin(dotAngle) * dotRad;
              const dotZ = Math.cos(dotAngle) * dotRad;

              dot.position.set(dotX, dotY, dotZ);
              dot.visible = true;
            } else {
              dot.visible = false;
            }
          }
        }
      }

      // (d) Dynamic 3D Floating Precision & Tolerance Label
      const relErrorPct = ((deltaX / Math.max(0.1, objectSize)) * 100);
      const labelText = `D = (${objectSize.toFixed(2)} ± ${deltaX.toFixed(2)}) mm  [${(objectSize - deltaX).toFixed(2)} ↔ ${(objectSize + deltaX).toFixed(2)} mm] • ±${relErrorPct.toFixed(2)}%`;
      const labelColor = relErrorPct < 0.3 ? '#10b981' : relErrorPct < 1.0 ? '#38bdf8' : '#ec4899';
      this.updateArrowLabel(
        'vernier-error-label',
        labelText,
        labelColor,
        new THREE.Vector3(-6.0 + realWidth / 2, -0.9, 0.4),
        ctx.showLabels
      );
    }
  }

  // ==========================================
  // 8. BOHR ATOM
  // ==========================================
  private setupBohrAtom(ctx: SimRenderContext) {
    // Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.8 });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    this.objectsGroup.add(nucleus);

    // Orbit Rings
    const orbitGroup = new THREE.Group();
    orbitGroup.name = 'bohr-orbits';
    this.objectsGroup.add(orbitGroup);

    // Electron
    const electronGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const electronMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
    const electron = new THREE.Mesh(electronGeo, electronMat);
    electron.name = 'orbiting-electron';
    this.objectsGroup.add(electron);

    // Photon Emission Beam
    const photonGroup = new THREE.Group();
    photonGroup.name = 'photon-group';
    this.objectsGroup.add(photonGroup);
  }

  private updateBohrAtom(ctx: SimRenderContext) {
    const { n_initial = 3, n_final = 2, Z = 1 } = ctx.params;
    const orbitGroup = this.objectsGroup.getObjectByName('bohr-orbits') as THREE.Group;

    if (orbitGroup && orbitGroup.children.length === 0) {
      for (let n = 1; n <= 5; n++) {
        const radius = (n * n * 1.6) / Z;
        const ringGeo = new THREE.RingGeometry(radius - 0.03, radius + 0.03, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        orbitGroup.add(ring);
      }
    }

    // Animate Electron orbit
    const activeOrbit = n_initial;
    const r = (activeOrbit * activeOrbit * 1.6) / Z;
    const omega = 3.0 / Math.pow(activeOrbit, 1.5);
    const angle = ctx.simTime * omega;

    const electron = this.objectsGroup.getObjectByName('orbiting-electron');
    if (electron) {
      electron.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
    }
  }

  // ==========================================
  // 9. VECTOR OPERATIONS (3D)
  // ==========================================
  private setupVectorOps(ctx: SimRenderContext) {
    this.createArrow('vec-A', 0x38bdf8); // Cyan
    this.createArrow('vec-B', 0x4ade80); // Green
    this.createArrow('vec-R', 0xa855f7); // Purple Resultant
    this.createArrow('vec-Cross', 0xf43f5e); // Red Cross Product

    // Parallelogram Plane
    const planeGeo = new THREE.BufferGeometry();
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.name = 'vector-parallelogram';
    this.objectsGroup.add(planeMesh);
  }

  private updateVectorOps(ctx: SimRenderContext) {
    const { Ax = 5, Ay = 3, Az = 2, Bx = 2, By = 6, Bz = -1 } = ctx.params;

    const vecA = new THREE.Vector3(Ax, Ay, Az);
    const vecB = new THREE.Vector3(Bx, By, Bz);
    const vecR = new THREE.Vector3().addVectors(vecA, vecB);
    const vecCross = new THREE.Vector3().crossVectors(vecA, vecB);

    const arrowA = this.vectorGroup.getObjectByName('vec-A') as THREE.ArrowHelper;
    if (arrowA) {
      arrowA.setDirection(vecA.clone().normalize());
      arrowA.setLength(Math.max(0.1, vecA.length()), 0.5, 0.25);
    }

    const arrowB = this.vectorGroup.getObjectByName('vec-B') as THREE.ArrowHelper;
    if (arrowB) {
      arrowB.setDirection(vecB.clone().normalize());
      arrowB.setLength(Math.max(0.1, vecB.length()), 0.5, 0.25);
    }

    const arrowR = this.vectorGroup.getObjectByName('vec-R') as THREE.ArrowHelper;
    if (arrowR) {
      arrowR.setDirection(vecR.clone().normalize());
      arrowR.setLength(Math.max(0.1, vecR.length()), 0.6, 0.3);
    }

    const arrowCross = this.vectorGroup.getObjectByName('vec-Cross') as THREE.ArrowHelper;
    if (arrowCross) {
      arrowCross.setDirection(vecCross.clone().normalize());
      arrowCross.setLength(Math.min(8, Math.max(0.1, vecCross.length() * 0.2)), 0.6, 0.3);
    }

    // Parallelogram mesh
    const polyMesh = this.objectsGroup.getObjectByName('vector-parallelogram') as THREE.Mesh;
    if (polyMesh) {
      const vertices = new Float32Array([
        0, 0, 0,
        vecA.x, vecA.y, vecA.z,
        vecR.x, vecR.y, vecR.z,

        0, 0, 0,
        vecR.x, vecR.y, vecR.z,
        vecB.x, vecB.y, vecB.z,
      ]);
      polyMesh.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      polyMesh.geometry.computeVertexNormals();
    }
  }

  // ==========================================
  // 10. KEPLER GRAVITATIONAL ORBIT
  // ==========================================
  private setupOrbit(ctx: SimRenderContext) {
    // Central Star (Sun)
    const starGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.0 });
    const star = new THREE.Mesh(starGeo, starMat);
    star.name = 'central-star';
    this.objectsGroup.add(star);

    // Planet
    const planetGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.name = 'orbiting-planet';
    this.objectsGroup.add(planet);

    // Ellipse Orbit Path
    const orbitLineGeo = new THREE.BufferGeometry();
    const orbitLineMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.6 });
    const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
    orbitLine.name = 'ellipse-path';
    this.objectsGroup.add(orbitLine);

    this.createArrow('orbit-v-arrow', 0x22c55e);
    this.createArrow('orbit-fg-arrow', 0xef4444);
  }

  private updateOrbit(ctx: SimRenderContext) {
    const { semiMajor = 6, eccentricity = 0.4, centralMass = 1.0 } = ctx.params;
    const a = semiMajor;
    const e = eccentricity;
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e; // Focus offset

    // Central star sits at focus (c, 0, 0)
    const star = this.objectsGroup.getObjectByName('central-star');
    if (star) {
      star.position.set(-c, 0, 0);
    }

    // Elliptical path
    const orbitLine = this.objectsGroup.getObjectByName('ellipse-path') as THREE.Line;
    if (orbitLine) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(a * Math.cos(theta), 0, b * Math.sin(theta)));
      }
      orbitLine.geometry.setFromPoints(pts);
    }

    // Planet position via Mean Anomaly
    const T = Math.sqrt(Math.pow(a, 3) / centralMass);
    const M = (2 * Math.PI * (ctx.simTime % T)) / T;
    // Solve Kepler equation approx
    let E = M;
    for (let i = 0; i < 3; i++) {
      E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    const px = a * Math.cos(E);
    const pz = b * Math.sin(E);

    const planet = this.objectsGroup.getObjectByName('orbiting-planet');
    if (planet) {
      planet.position.set(px, 0, pz);
    }

    // Velocity vector
    const rToStar = new THREE.Vector3(px - (-c), 0, pz);
    const vMag = Math.sqrt(centralMass * (2 / rToStar.length() - 1 / a));
    const vDir = new THREE.Vector3(-a * Math.sin(E), 0, b * Math.cos(E)).normalize();

    const vArrow = this.vectorGroup.getObjectByName('orbit-v-arrow') as THREE.ArrowHelper;
    if (vArrow && planet) {
      vArrow.position.copy(planet.position);
      vArrow.setDirection(vDir);
      vArrow.setLength(Math.max(0.1, vMag * 1.5), 0.4, 0.2);
    }

    const fgArrow = this.vectorGroup.getObjectByName('orbit-fg-arrow') as THREE.ArrowHelper;
    if (fgArrow && planet) {
      fgArrow.position.copy(planet.position);
      fgArrow.setDirection(rToStar.clone().negate().normalize());
      fgArrow.setLength(1.8, 0.4, 0.2);
    }
  }

  // ==========================================
  // 11. CYCLOTRON ACCELERATOR & LORENTZ FORCE (LAWRENCE APPARATUS)
  // ==========================================
  private setupCyclotron(ctx: SimRenderContext) {
    const cycGroup = new THREE.Group();
    cycGroup.name = 'cyclotron-chamber-group';

    // 1. Massive Dual Electromagnet Pole Pieces (Upper North Pole, Lower South Pole)
    const magnetMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
    const poleCopperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });

    // Upper Pole (North)
    const upperPole = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 1.4, 48), magnetMat);
    upperPole.position.y = 2.4;
    cycGroup.add(upperPole);

    const upperCoil = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.4, 16, 48), poleCopperMat);
    upperCoil.rotation.x = Math.PI / 2;
    upperCoil.position.y = 2.4;
    cycGroup.add(upperCoil);

    // Lower Pole (South)
    const lowerPole = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 1.4, 48), magnetMat);
    lowerPole.position.y = -2.4;
    cycGroup.add(lowerPole);

    const lowerCoil = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.4, 16, 48), poleCopperMat);
    lowerCoil.rotation.x = Math.PI / 2;
    lowerCoil.position.y = -2.4;
    cycGroup.add(lowerCoil);

    // Magnetic Yoke Side Pillars (Structural C-Frame support)
    [-7.2, 7.2].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.2, 3.2), magnetMat);
      pillar.position.set(px, 0, 0);
      cycGroup.add(pillar);
    });

    // 2. Transparent Evacuated Chamber Ring (Borosilicate Glass Window)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 0.3,
      transparent: true,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const chamberRing = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 6.0, 1.6, 48, 1, true), glassMat);
    cycGroup.add(chamberRing);

    // 3. Hollow Copper D-Shaped Electrodes ("Dees" D1 and D2)
    const deeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });

    // Left Dee (D1: x < -0.3)
    const createDeeMesh = (isLeft: boolean) => {
      const shape = new THREE.Shape();
      const R = 5.2;
      const gapHalf = 0.35;
      const sign = isLeft ? -1 : 1;

      // Semicircular profile
      shape.moveTo(sign * gapHalf, -R);
      shape.absarc(0, 0, R, isLeft ? Math.PI / 2 : -Math.PI / 2, isLeft ? (3 * Math.PI) / 2 : Math.PI / 2, false);
      shape.lineTo(sign * gapHalf, R);
      shape.lineTo(sign * gapHalf, -R);

      const deeGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.8,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      });
      const mesh = new THREE.Mesh(deeGeo, deeMat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = 0.4;
      return mesh;
    };

    const dee1 = createDeeMesh(true);
    dee1.name = 'dee-left';
    cycGroup.add(dee1);

    const dee2 = createDeeMesh(false);
    dee2.name = 'dee-right';
    cycGroup.add(dee2);

    // RF High-Voltage Feeder Rods
    const rfMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const rfLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 16), rfMat);
    rfLeft.rotation.z = Math.PI / 2;
    rfLeft.position.set(-6.2, 0, 0);
    cycGroup.add(rfLeft);

    const rfRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 16), rfMat);
    rfRight.rotation.z = Math.PI / 2;
    rfRight.position.set(6.2, 0, 0);
    cycGroup.add(rfRight);

    // 4. Central Ion Source Assembly (Plasma Arc Chamber)
    const sourceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 });
    const ionSource = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 16), sourceMat);
    ionSource.name = 'cyc-ion-source';
    cycGroup.add(ionSource);

    // 5. Target Deflector & Extraction Port (at outer perimeter)
    const deflector = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.8, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 })
    );
    deflector.position.set(5.1, 0, -2.2);
    deflector.rotation.y = 0.4;
    cycGroup.add(deflector);

    this.objectsGroup.add(cycGroup);

    // 6. Accelerating RF Electric Field in the Gap (Animated Arrow Helpers Group)
    const gapEFieldGroup = new THREE.Group();
    gapEFieldGroup.name = 'cyc-gap-efield';
    this.objectsGroup.add(gapEFieldGroup);

    // 7. Accelerated Charged Particle & 3D Spiraling Trajectory
    const particleGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.9,
      metalness: 0.4,
      roughness: 0.2,
    });
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.name = 'cyclotron-particle';
    this.objectsGroup.add(particle);

    // Spiraling Trajectory Line
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const trail = new THREE.Line(trailGeo, trailMat);
    trail.name = 'cyclotron-trail';
    this.objectsGroup.add(trail);

    // Vectors: Velocity v (Green), Lorentz Force F_B (Rose Red), Magnetic Field B (Cyan)
    this.createArrow('cyc-v-arrow', 0x22c55e);
    this.createArrow('cyc-f-arrow', 0xf43f5e);
    this.createArrow('cyc-b-arrow', 0x38bdf8);
  }

  private updateCyclotron(ctx: SimRenderContext) {
    const { v_perp = 8, v_para = 0, B = 1.5, q = 2, m = 2, V_rf = 100 } = ctx.params;
    const qAbs = Math.abs(q) || 1;
    const omega_c = (qAbs * B) / Math.max(0.1, m); // Cyclotron resonance frequency ω = qB/m
    const f_c = omega_c / (2 * Math.PI);
    const T_c = 1 / Math.max(0.01, f_c);

    // Cyclotron multi-turn acceleration spiral simulation
    // Each half-cycle crossing the gap x=0 gains energy ΔK = q*V_rf
    const simT = (ctx.simTime * 1.5) % 6.0;
    const maxRadius = 4.9;
    const numTurns = 5;
    const spiralGrowth = Math.min(1.0, simT / 5.5);

    // Instantaneous trajectory computation
    const totalAngle = simT * omega_c * 2.5;
    const currentTurn = totalAngle / (2 * Math.PI);
    const currentRadius = Math.min(maxRadius, 0.35 + Math.sqrt(Math.max(0, currentTurn)) * 1.95);
    const currentSpeed = (qAbs * B * currentRadius) / m;
    const kineticEnergy = 0.5 * m * currentSpeed * currentSpeed;

    const px = currentRadius * Math.cos(totalAngle);
    const pz = currentRadius * Math.sin(totalAngle);
    const py = 0;

    // 1. Update Accelerated Particle
    const particle = this.objectsGroup.getObjectByName('cyclotron-particle');
    if (particle) {
      particle.position.set(px, py, pz);
    }

    // 2. Continuous 3D Spiraling Path Ribbon
    const trail = this.objectsGroup.getObjectByName('cyclotron-trail') as THREE.Line;
    if (trail) {
      const pts: THREE.Vector3[] = [];
      const steps = 180;
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const ti = frac * simT;
        const ang_i = ti * omega_c * 2.5;
        const turn_i = ang_i / (2 * Math.PI);
        const rad_i = Math.min(maxRadius, 0.35 + Math.sqrt(Math.max(0, turn_i)) * 1.95);
        pts.push(new THREE.Vector3(rad_i * Math.cos(ang_i), 0, rad_i * Math.sin(ang_i)));
      }
      trail.geometry.dispose();
      trail.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    }

    // 3. Dynamic Oscillating RF Electric Field in the Gap (x = 0)
    const gapEField = this.objectsGroup.getObjectByName('cyc-gap-efield') as THREE.Group;
    if (gapEField) {
      while (gapEField.children.length > 0) {
        this.disposeObject(gapEField.children[0]);
        gapEField.remove(gapEField.children[0]);
      }

      if (ctx.showVectors) {
        const rfPhase = Math.sin(simT * omega_c * 2.5);
        const rfDir = rfPhase >= 0 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
        const arrowColor = rfPhase >= 0 ? 0x22c55e : 0xf43f5e;

        [-3.0, -1.5, 0, 1.5, 3.0].forEach((zOff) => {
          const origin = rfPhase >= 0 ? new THREE.Vector3(-0.35, 0, zOff) : new THREE.Vector3(0.35, 0, zOff);
          const arrow = new THREE.ArrowHelper(rfDir, origin, 0.7, arrowColor, 0.25, 0.12);
          gapEField.add(arrow);
        });
      }
    }

    // 4. Force & Velocity Vectors
    const vDir = new THREE.Vector3(-Math.sin(totalAngle), 0, Math.cos(totalAngle)).normalize();
    const fDir = new THREE.Vector3(-Math.cos(totalAngle), 0, -Math.sin(totalAngle)).normalize(); // Centripetal toward center

    const vArrow = this.vectorGroup.getObjectByName('cyc-v-arrow') as THREE.ArrowHelper;
    if (vArrow && particle) {
      vArrow.position.copy(particle.position);
      vArrow.setDirection(vDir);
      vArrow.setLength(1.8, 0.35, 0.18);
    }

    const fArrow = this.vectorGroup.getObjectByName('cyc-f-arrow') as THREE.ArrowHelper;
    if (fArrow && particle) {
      fArrow.position.copy(particle.position);
      fArrow.setDirection(fDir);
      fArrow.setLength(1.8, 0.35, 0.18);
    }

    const bArrow = this.vectorGroup.getObjectByName('cyc-b-arrow') as THREE.ArrowHelper;
    if (bArrow && particle) {
      bArrow.position.set(px, 1.2, pz);
      bArrow.setDirection(new THREE.Vector3(0, -1, 0));
      bArrow.setLength(1.4, 0.35, 0.18);
    }

    // 5. 3D Floating Labels
    this.updateArrowLabel(
      'cyc-status-label',
      `f_c = (qB)/(2πm) = ${f_c.toFixed(2)} MHz | r = ${currentRadius.toFixed(2)} m | K_E = ${kineticEnergy.toFixed(1)} MeV`,
      '#38bdf8',
      new THREE.Vector3(0, 3.8, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'cyc-force-label',
      `F_B = q(v × B) [Centripetal]`,
      '#f43f5e',
      new THREE.Vector3(px - fDir.x * 0.8, 0.6, pz - fDir.z * 0.8),
      ctx.showLabels && ctx.showVectors
    );
  }

  // ==========================================
  // 12. RAY OPTICS: LENS & PRISM
  // ==========================================
  private setupRayOptics(ctx: SimRenderContext) {
    // Optical Bench Axis
    const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, 30, 8);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    const axis = new THREE.Mesh(axisGeo, axisMat);
    axis.rotation.z = Math.PI / 2;
    this.objectsGroup.add(axis);

    // Convex Lens
    const lensGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.4, 32);
    const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, opacity: 0.7, transparent: true, roughness: 0.1, ior: 1.5 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.name = 'optical-lens';
    this.objectsGroup.add(lens);

    // Object Arrow
    this.createArrow('opt-object-arrow', 0x22c55e);
    // Image Arrow
    this.createArrow('opt-image-arrow', 0xf59e0b);

    // Rays Group
    const raysGroup = new THREE.Group();
    raysGroup.name = 'optical-rays';
    this.objectsGroup.add(raysGroup);
  }

  private updateRayOptics(ctx: SimRenderContext) {
    const { focalLength = 15, objectDistance = -25, objectHeight = 4 } = ctx.params;
    const scale = 0.25;
    const u = objectDistance * scale;
    const f = focalLength * scale;
    const v = (u * f) / (u + f);
    const h0 = objectHeight * scale;
    const hi = (v / u) * h0;

    // Object Arrow
    const objArrow = this.vectorGroup.getObjectByName('opt-object-arrow') as THREE.ArrowHelper;
    if (objArrow) {
      objArrow.position.set(u, 0, 0);
      objArrow.setDirection(new THREE.Vector3(0, 1, 0));
      objArrow.setLength(Math.max(0.1, h0), 0.3, 0.15);
    }

    // Image Arrow
    const imgArrow = this.vectorGroup.getObjectByName('opt-image-arrow') as THREE.ArrowHelper;
    if (imgArrow) {
      imgArrow.position.set(v, 0, 0);
      imgArrow.setDirection(hi >= 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0));
      imgArrow.setLength(Math.max(0.1, Math.abs(hi)), 0.3, 0.15);
    }

    // Draw Principal Rays
    const raysGroup = this.objectsGroup.getObjectByName('optical-rays') as THREE.Group;
    if (raysGroup) {
      while (raysGroup.children.length > 0) {
        this.disposeObject(raysGroup.children[0]);
        raysGroup.remove(raysGroup.children[0]);
      }

      const rayMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });

      // Ray 1: Parallel to axis -> Passes through Focus F
      const r1Pts = [new THREE.Vector3(u, h0, 0), new THREE.Vector3(0, h0, 0), new THREE.Vector3(v, hi, 0)];
      const r1Geo = new THREE.BufferGeometry().setFromPoints(r1Pts);
      raysGroup.add(new THREE.Line(r1Geo, rayMat));

      // Ray 2: Passes straight through Optical Center (0, 0, 0)
      const r2Pts = [new THREE.Vector3(u, h0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(v, hi, 0)];
      const r2Geo = new THREE.BufferGeometry().setFromPoints(r2Pts);
      raysGroup.add(new THREE.Line(r2Geo, rayMat));
    }
  }

  // ==========================================
  // 13. SCREW GAUGE (ACCURATE 3D MODEL)
  // ==========================================
  private setupScrewGauge(ctx: SimRenderContext) {
    const isDark = ctx.isDark;
    const totalDivisions = ctx.params.totalDivisions || 50;

    // High quality materials
    const frameMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0x334155,
      metalness: 0.7,
      roughness: 0.4,
    });
    const satinMetalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x94a3b8 : 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });
    const knurledMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x475569 : 0x94a3b8,
      metalness: 0.85,
      roughness: 0.5,
    });
    const carbideMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.15,
    });

    // 1. Drop-Forged Cast Steel C-Frame (U-Frame)
    const frameShape = new THREE.Shape();
    frameShape.moveTo(-5.5, 0.8);
    frameShape.lineTo(-5.5, -3.8);
    frameShape.bezierCurveTo(-5.5, -5.5, 1.5, -5.5, 1.5, -3.8);
    frameShape.lineTo(1.5, 0.8);
    frameShape.lineTo(0.0, 0.8);
    frameShape.lineTo(0.0, -3.2);
    frameShape.bezierCurveTo(0.0, -4.2, -4.0, -4.2, -4.0, -3.2);
    frameShape.lineTo(-4.0, 0.8);
    frameShape.closePath();

    const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.9,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0, -0.45);
    this.objectsGroup.add(frame);

    // Frame Specification Inscription Badge
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 128;
    const bctx = badgeCanvas.getContext('2d');
    if (bctx) {
      bctx.fillStyle = isDark ? '#1e293b' : '#334155';
      bctx.fillRect(0, 0, 512, 128);
      bctx.fillStyle = isDark ? '#38bdf8' : '#67e8f9';
      bctx.font = 'bold 30px monospace';
      bctx.textAlign = 'center';
      bctx.fillText('0 - 25 mm   0.01 mm', 256, 50);
      bctx.font = 'bold 22px sans-serif';
      bctx.fillStyle = '#94a3b8';
      bctx.fillText('STAINLESS FORGED STEEL', 256, 95);
    }
    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeGeo = new THREE.PlaneGeometry(3.2, 0.9);
    const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(-2.0, -4.2, 0.46);
    this.objectsGroup.add(badgeMesh);

    // 2. Fixed Anvil on Left Arm
    const anvilCollarGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.2, 32);
    const anvilCollar = new THREE.Mesh(anvilCollarGeo, satinMetalMat);
    anvilCollar.rotation.z = Math.PI / 2;
    anvilCollar.position.set(-4.5, 0.8, 0);
    this.objectsGroup.add(anvilCollar);

    const anvilTipGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 32);
    const anvilTip = new THREE.Mesh(anvilTipGeo, carbideMat);
    anvilTip.rotation.z = Math.PI / 2;
    anvilTip.position.set(-3.7, 0.8, 0); // flat measuring face at X = -3.3
    this.objectsGroup.add(anvilTip);

    // 3. Stationary Hub / Sleeve / Barrel (Rigidly fixed to right collar)
    const barrelCanvas = document.createElement('canvas');
    barrelCanvas.width = 1024;
    barrelCanvas.height = 256;
    const bbctx = barrelCanvas.getContext('2d');
    if (bbctx) {
      bbctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      bbctx.fillRect(0, 0, 1024, 256);

      // Central Datum Reference Line
      bbctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      bbctx.lineWidth = 4;
      bbctx.beginPath();
      bbctx.moveTo(0, 128);
      bbctx.lineTo(1024, 128);
      bbctx.stroke();

      // Main mm graduations (Upper row) & Half-mm (Lower row)
      bbctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      bbctx.strokeStyle = isDark ? '#f8fafc' : '#0f172a';
      bbctx.lineWidth = 3;
      bbctx.font = 'bold 30px monospace';
      bbctx.textAlign = 'center';

      const pxPerMm = 1024 / 25;
      for (let mm = 0; mm <= 20; mm++) {
        const x = 40 + mm * pxPerMm;
        
        // Upper 1.0 mm marks
        bbctx.beginPath();
        bbctx.moveTo(x, 128);
        const tickH = mm % 5 === 0 ? 60 : 40;
        bbctx.lineTo(x, 128 - tickH);
        bbctx.stroke();

        if (mm % 5 === 0) {
          bbctx.fillText(`${mm}`, x, 128 - tickH - 12);
        }

        // Lower 0.5 mm sub-marks
        if (mm < 20) {
          const halfX = x + pxPerMm / 2;
          bbctx.beginPath();
          bbctx.moveTo(halfX, 128);
          bbctx.lineTo(halfX, 128 + 35);
          bbctx.stroke();
        }
      }
    }
    const barrelTex = new THREE.CanvasTexture(barrelCanvas);

    const barrelGeo = new THREE.CylinderGeometry(0.95, 0.95, 6.0, 36);
    const barrelMat = new THREE.MeshStandardMaterial({
      map: barrelTex,
      metalness: 0.8,
      roughness: 0.25,
    });
    const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
    barrelMesh.rotation.z = Math.PI / 2;
    barrelMesh.position.set(3.0, 0.8, 0);
    this.objectsGroup.add(barrelMesh);

    // Spindle Guide Collar & Locking Lever on frame
    const lockCollarGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.8, 32);
    const lockCollar = new THREE.Mesh(lockCollarGeo, satinMetalMat);
    lockCollar.rotation.z = Math.PI / 2;
    lockCollar.position.set(0.4, 0.8, 0);
    this.objectsGroup.add(lockCollar);

    const lockLeverGeo = new THREE.BoxGeometry(0.18, 0.9, 0.3);
    const lockLever = new THREE.Mesh(lockLeverGeo, chromeMat);
    lockLever.position.set(0.4, 1.8, 0);
    this.objectsGroup.add(lockLever);

    // 4. Movable Spindle (Advances through sleeve)
    const spindleGeo = new THREE.CylinderGeometry(0.45, 0.45, 8.0, 32);
    const spindle = new THREE.Mesh(spindleGeo, chromeMat);
    spindle.name = 'screw-spindle';
    spindle.rotation.z = Math.PI / 2;
    spindle.position.set(0.5, 0.8, 0);
    this.objectsGroup.add(spindle);

    // 5. Rotating & Translating Thimble Assembly
    const thimbleGroup = new THREE.Group();
    thimbleGroup.name = 'screw-thimble-group';

    // Circular Scale Canvas Texture (wrapped around beveled head)
    const thimbleCanvas = document.createElement('canvas');
    thimbleCanvas.width = 1024;
    thimbleCanvas.height = 128;
    const tctx = thimbleCanvas.getContext('2d');
    if (tctx) {
      tctx.fillStyle = isDark ? '#0f172a' : '#e2e8f0';
      tctx.fillRect(0, 0, 1024, 128);

      tctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      tctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      tctx.lineWidth = 2.5;
      tctx.font = 'bold 22px monospace';
      tctx.textAlign = 'center';

      const N = totalDivisions;
      const pxPerDiv = 1024 / N;

      for (let d = 0; d < N; d++) {
        const x = d * pxPerDiv;
        const isMajor = d % 5 === 0;
        const tickH = isMajor ? 50 : 30;

        tctx.beginPath();
        tctx.moveTo(x, 0);
        tctx.lineTo(x, tickH);
        tctx.stroke();

        if (isMajor) {
          tctx.fillText(`${d}`, x, tickH + 25);
        }
      }
    }
    const thimbleTex = new THREE.CanvasTexture(thimbleCanvas);
    thimbleTex.wrapS = THREE.RepeatWrapping;

    // Beveled Conical Collar
    const bevelConeGeo = new THREE.CylinderGeometry(1.22, 1.05, 0.8, 48);
    const bevelConeMat = new THREE.MeshStandardMaterial({
      map: thimbleTex,
      metalness: 0.85,
      roughness: 0.2,
    });
    const bevelCone = new THREE.Mesh(bevelConeGeo, bevelConeMat);
    bevelCone.rotation.z = Math.PI / 2;
    bevelCone.position.set(-1.8, 0, 0);
    thimbleGroup.add(bevelCone);

    // Knurled Thimble Body
    const thimbleBodyGeo = new THREE.CylinderGeometry(1.22, 1.22, 3.4, 36);
    const thimbleBody = new THREE.Mesh(thimbleBodyGeo, knurledMat);
    thimbleBody.rotation.z = Math.PI / 2;
    thimbleBody.position.set(0.3, 0, 0);
    thimbleGroup.add(thimbleBody);

    // Ratchet Stop Assembly
    const ratchetNeckGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32);
    const ratchetNeck = new THREE.Mesh(ratchetNeckGeo, chromeMat);
    ratchetNeck.rotation.z = Math.PI / 2;
    ratchetNeck.position.set(2.2, 0, 0);
    thimbleGroup.add(ratchetNeck);

    const ratchetKnobGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.4, 32);
    const ratchetKnob = new THREE.Mesh(ratchetKnobGeo, knurledMat);
    ratchetKnob.rotation.z = Math.PI / 2;
    ratchetKnob.position.set(3.1, 0, 0);
    thimbleGroup.add(ratchetKnob);

    // Initial position on sleeve
    thimbleGroup.position.set(2.8, 0.8, 0);
    this.objectsGroup.add(thimbleGroup);

    // 6. Measured Object (Wire / Sphere / Sheet)
    const wireGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 36);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.25,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.name = 'screw-measured-wire';
    wire.position.set(-2.5, 0.8, 0);
    this.objectsGroup.add(wire);

    // 7. Visual Error Margin & Tolerance Band 3D Representation
    const errorGroup = new THREE.Group();
    errorGroup.name = 'screw-error-margin-group';

    // (a) Translucent Holographic Error Volume Envelope
    const envelopeGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 36);
    const envelopeMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
      depthWrite: false,
    });
    this.physicsMiddleware.applyDepthBias(envelopeMat, -2.0, -4.0);
    const errorEnvelope = new THREE.Mesh(envelopeGeo, envelopeMat);
    errorEnvelope.name = 'screw-error-envelope';
    errorEnvelope.position.set(-2.5, 0.8, 0);
    errorGroup.add(errorEnvelope);

    // (b) 3D Tolerance Bracket & Limits
    const bracketMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
    const bracketGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.2, 0.4),
      new THREE.Vector3(1, -1.2, 0.4),
    ]);
    const bracketLine = new THREE.Line(bracketGeo, bracketMat);
    bracketLine.name = 'screw-bracket-axis';
    errorGroup.add(bracketLine);

    const minTickGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.45, 0.4),
      new THREE.Vector3(0, -0.95, 0.4),
    ]);
    const minTick = new THREE.Line(minTickGeo, new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 }));
    minTick.name = 'screw-bracket-min';
    errorGroup.add(minTick);

    const maxTickGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.45, 0.4),
      new THREE.Vector3(0, -0.95, 0.4),
    ]);
    const maxTick = new THREE.Line(maxTickGeo, new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 }));
    maxTick.name = 'screw-bracket-max';
    errorGroup.add(maxTick);

    const nomTickGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.35, 0.4),
      new THREE.Vector3(0, -1.05, 0.4),
    ]);
    const nomTick = new THREE.Line(nomTickGeo, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }));
    nomTick.name = 'screw-bracket-nom';
    errorGroup.add(nomTick);

    // (c) 3D Angular Uncertainty Wedge / Arc on Thimble Bevel
    const arcGeo = new THREE.RingGeometry(1.08, 1.25, 32, 1, -Math.PI / 8, Math.PI / 4);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    arcMesh.name = 'screw-angular-arc';
    arcMesh.rotation.y = Math.PI / 2;
    arcMesh.position.set(0.98, 0.8, 0);
    errorGroup.add(arcMesh);

    // (d) Repeated Measurement Sample Scatter Dots
    const sampleDotsGroup = new THREE.Group();
    sampleDotsGroup.name = 'screw-sample-dots';
    const dotGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    for (let i = 0; i < 10; i++) {
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.name = `screw-sample-dot-${i}`;
      sampleDotsGroup.add(dotMesh);
    }
    errorGroup.add(sampleDotsGroup);

    this.objectsGroup.add(errorGroup);
  }

  private updateScrewGauge(ctx: SimRenderContext) {
    const {
      objectThickness = 2.45,
      pitch = 0.5,
      totalDivisions = 50,
      zeroError = 2,
      uncertainty = 0.010,
      sampleTrials = 6,
    } = ctx.params;

    const lc = pitch / totalDivisions;
    const apparentThickness = Math.max(0, objectThickness + zeroError * lc);
    const scaleFactor = 0.4; // 1 mm = 0.4 3D world units
    const apparentDisp = apparentThickness * scaleFactor;

    // 1. Move & Rotate Thimble
    const thimble = this.objectsGroup.getObjectByName('screw-thimble-group');
    if (thimble) {
      // Linear translation along X-axis
      thimble.position.set(2.8 + apparentDisp, 0.8, 0);

      // Physical rotational angle based on pitch: 1 pitch = 2*PI radians
      const totalRotations = apparentThickness / pitch;
      thimble.rotation.x = -(totalRotations * 2 * Math.PI);
    }

    // 2. Advance Spindle
    const spindle = this.objectsGroup.getObjectByName('screw-spindle');
    if (spindle) {
      spindle.position.set(0.5 + apparentDisp / 2, 0.8, 0);
    }

    // 3. Adjust Clamped Wire / Specimen
    const realWidth = Math.max(0.05, objectThickness) * scaleFactor;
    const rad = Math.min(1.2, Math.max(0.4, realWidth / 2));
    const wire = this.objectsGroup.getObjectByName('screw-measured-wire');
    if (wire) {
      wire.scale.set(rad, 1, rad);
      wire.position.set(-3.3 + realWidth / 2, 0.8, 0);
      wire.visible = objectThickness > 0.02;
    }

    // 4. Update 3D Visual Error Margin & Tolerance Band Representation
    const errorGroup = this.objectsGroup.getObjectByName('screw-error-margin-group');
    if (errorGroup) {
      const deltaD = Math.max(0.001, uncertainty);
      const deltaDScaled = deltaD * scaleFactor;
      const minX = -3.3 + Math.max(0, objectThickness - deltaD) * scaleFactor;
      const maxX = -3.3 + (objectThickness + deltaD) * scaleFactor;
      const nomX = -3.3 + realWidth;
      const errorSpan = Math.max(0.02, maxX - minX);

      // (a) Holographic Error Volume Envelope
      const envelope = errorGroup.getObjectByName('screw-error-envelope') as THREE.Mesh;
      if (envelope) {
        envelope.position.set((minX + maxX) / 2, 0.8, 0);
        envelope.scale.set(rad * 1.18, 1.05, rad * 1.18);
        envelope.visible = ctx.showVectors || ctx.showLabels || true;
      }

      // (b) 3D Tolerance Bracket & Limits
      const bracketLine = errorGroup.getObjectByName('screw-bracket-axis') as THREE.Line;
      if (bracketLine) {
        const positions = new Float32Array([
          minX, -1.2, 0.4,
          maxX, -1.2, 0.4,
        ]);
        bracketLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        bracketLine.geometry.computeBoundingSphere();
      }

      const minTick = errorGroup.getObjectByName('screw-bracket-min') as THREE.Line;
      if (minTick) {
        const pos = new Float32Array([
          minX, -1.45, 0.4,
          minX, -0.95, 0.4,
        ]);
        minTick.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        minTick.geometry.computeBoundingSphere();
      }

      const maxTick = errorGroup.getObjectByName('screw-bracket-max') as THREE.Line;
      if (maxTick) {
        const pos = new Float32Array([
          maxX, -1.45, 0.4,
          maxX, -0.95, 0.4,
        ]);
        maxTick.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        maxTick.geometry.computeBoundingSphere();
      }

      const nomTick = errorGroup.getObjectByName('screw-bracket-nom') as THREE.Line;
      if (nomTick) {
        const pos = new Float32Array([
          nomX, -1.35, 0.4,
          nomX, -1.05, 0.4,
        ]);
        nomTick.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        nomTick.geometry.computeBoundingSphere();
      }

      // (c) 3D Angular Uncertainty Wedge / Arc on Thimble Bevel
      const arcMesh = errorGroup.getObjectByName('screw-angular-arc') as THREE.Mesh;
      if (arcMesh) {
        const angularDeltaRad = Math.min(Math.PI, (deltaD / pitch) * 2 * Math.PI);
        arcMesh.position.set(1.0 + apparentDisp, 0.8, 0);
        arcMesh.rotation.x = 0;
        arcMesh.rotation.y = Math.PI / 2;
        arcMesh.rotation.z = -angularDeltaRad;
        arcMesh.scale.set(1, 1, Math.max(0.1, (angularDeltaRad * 2) / (Math.PI / 4)));
        arcMesh.visible = ctx.showVectors || ctx.showLabels || true;
      }

      // (d) Repeated Measurement Sample Scatter Dots
      const sampleGroup = errorGroup.getObjectByName('screw-sample-dots');
      if (sampleGroup) {
        const nTrials = Math.min(10, Math.max(1, Math.round(sampleTrials)));
        for (let i = 0; i < 10; i++) {
          const dot = sampleGroup.getObjectByName(`screw-sample-dot-${i}`);
          if (dot) {
            if (i < nTrials) {
              const u1 = ((i * 37 + 17) % 100) / 100;
              const u2 = ((i * 59 + 29) % 100) / 100;
              const normalZ = Math.cos(2 * Math.PI * u1) * Math.sqrt(-2 * Math.log(Math.max(0.05, u2))) * 0.42;
              const clampedZ = Math.max(-1, Math.min(1, normalZ));
              const dotX = nomX + clampedZ * deltaDScaled;
              const dotY = 0.8 + ((i % 5) - 2) * 0.35;
              const dotZ = ((Math.floor(i / 5) % 2 === 0 ? 1 : -1) * (rad * 0.5));

              dot.position.set(dotX, dotY, dotZ);
              dot.visible = true;
            } else {
              dot.visible = false;
            }
          }
        }
      }

      // (e) Dynamic 3D Floating Precision & Tolerance Label
      const relErrorPct = ((deltaD / Math.max(0.01, objectThickness)) * 100);
      const labelText = `d = (${objectThickness.toFixed(3)} ± ${deltaD.toFixed(3)}) mm  [${(objectThickness - deltaD).toFixed(3)} ↔ ${(objectThickness + deltaD).toFixed(3)} mm] • ±${relErrorPct.toFixed(2)}%`;
      const labelColor = relErrorPct < 0.5 ? '#10b981' : relErrorPct < 2.0 ? '#38bdf8' : '#ec4899';
      this.updateArrowLabel(
        'screw-error-label',
        labelText,
        labelColor,
        new THREE.Vector3(-3.3 + realWidth / 2, 2.3, 0.4),
        ctx.showLabels
      );
    }
  }

  // ==========================================
  // 14. CIRCULAR MOTION & BANKING OF ROADS
  // ==========================================
  private setupCircularMotion(ctx: SimRenderContext) {
    const { theta = 20, radius = 35 } = ctx.params;
    const radBank = (theta * Math.PI) / 180;

    // 1. Banked Track Group
    const roadGroup = new THREE.Group();
    roadGroup.name = 'banked-road-group';
    (roadGroup as any).userData = { lastTheta: theta, lastRadius: radius };

    // Build initial conical banked track meshes
    this.buildBankedTrack(roadGroup, radius, radBank);
    this.objectsGroup.add(roadGroup);

    // 2. Surrounding Ground & Stadium Floor
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.0;
    ground.name = 'banked-ground';
    this.objectsGroup.add(ground);

    // Center Radius Origin Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.4, 3.5, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(0, -1.25, 0);
    pillar.name = 'center-pillar';
    this.objectsGroup.add(pillar);

    // 3. High-Precision Articulated 3D Sports Vehicle & Ragdoll Driver
    const carGroup = new THREE.Group();
    carGroup.name = 'circular-car-group';

    // Aerodynamic Chassis (Electric Blue Metallic)
    const chassisGeo = new THREE.BoxGeometry(2.4, 0.55, 1.3);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.2,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.name = 'car-chassis';
    chassis.position.y = 0.35;
    carGroup.add(chassis);

    // Hood scoop & aerodynamic front nose
    const noseGeo = new THREE.ConeGeometry(0.65, 0.8, 4);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9, roughness: 0.15 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.z = -Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.set(1.45, 0.28, 0);
    carGroup.add(nose);

    // Headlights (Dual LED glow)
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
    });
    const hlGeo = new THREE.BoxGeometry(0.12, 0.14, 0.25);
    const hlL = new THREE.Mesh(hlGeo, headlightMat);
    hlL.position.set(1.22, 0.38, 0.45);
    carGroup.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMat);
    hlR.position.set(1.22, 0.38, -0.45);
    carGroup.add(hlR);

    // Racing Stripes along hood
    const stripeGeo = new THREE.BoxGeometry(2.45, 0.56, 0.22);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0.36, 0);
    carGroup.add(stripe);

    // Windshield & Cockpit
    const glassGeo = new THREE.BoxGeometry(0.95, 0.45, 1.1);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.82,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(-0.2, 0.75, 0);
    carGroup.add(glass);

    // Rear Downforce Spoiler
    const spoilerGeo = new THREE.BoxGeometry(0.35, 0.08, 1.45);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(-1.1, 0.92, 0);
    carGroup.add(spoiler);

    // Spoiler Struts
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
    const strutL = new THREE.Mesh(strutGeo, spoilerMat);
    strutL.position.set(-1.1, 0.72, 0.45);
    carGroup.add(strutL);
    const strutR = new THREE.Mesh(strutGeo, spoilerMat);
    strutR.position.set(-1.1, 0.72, -0.45);
    carGroup.add(strutR);

    // 4 Articulated Rotating Wheels with Treads & Chrome Hubs
    // Note: wheel radius = 0.32, centered at y = 0.32, so tire bottom rests exactly at local y = 0
    const wheelPositions = [
      { name: 'wheel-fl', x: 0.75, z: 0.72, isFront: true },
      { name: 'wheel-fr', x: 0.75, z: -0.72, isFront: true },
      { name: 'wheel-rl', x: -0.75, z: 0.72, isFront: false },
      { name: 'wheel-rr', x: -0.75, z: -0.72, isFront: false },
    ];

    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 24);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95, metalness: 0.1 });
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    wheelPositions.forEach((wp) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.name = wp.name;
      wheelAssembly.position.set(wp.x, 0.32, wp.z);

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.x = Math.PI / 2;
      wheelAssembly.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      wheelAssembly.add(rim);

      // Wheel spoke cross
      const spokeGeo = new THREE.BoxGeometry(0.38, 0.05, 0.26);
      const spokeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const spoke1 = new THREE.Mesh(spokeGeo, spokeMat);
      wheelAssembly.add(spoke1);

      carGroup.add(wheelAssembly);
    });

    // Articulated Ragdoll Driver Mannequin (Sitting inside cockpit)
    const ragdollDriver = new THREE.Group();
    ragdollDriver.name = 'driver-ragdoll';
    ragdollDriver.position.set(-0.15, 0.55, 0);

    // Torso / Suit (Orange Racing Suit)
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.48, 0.34);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5, metalness: 0.2 });
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.name = 'driver-torso';
    torso.position.y = 0.24;
    ragdollDriver.add(torso);

    // Harness Straps
    const harnessGeo = new THREE.BoxGeometry(0.4, 0.49, 0.06);
    const harnessMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const harness = new THREE.Mesh(harnessGeo, harnessMat);
    harness.position.set(0, 0.24, 0.16);
    ragdollDriver.add(harness);

    // Articulated Helmet / Head with Visor
    const headGroup = new THREE.Group();
    headGroup.name = 'driver-head-group';
    headGroup.position.set(0, 0.54, 0);

    const helmetGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    headGroup.add(helmet);

    // Glossy Visor
    const visorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.22);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.05, metalness: 0.98 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0.12, 0.02, 0);
    headGroup.add(visor);

    ragdollDriver.add(headGroup);

    // Articulated Arms holding steering wheel
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.32, 12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });

    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(0.16, 0.26, 0.2);
    armL.rotation.z = -Math.PI / 3;
    armL.rotation.x = Math.PI / 6;
    ragdollDriver.add(armL);

    const armR = new THREE.Mesh(armGeo, armMat);
    armR.position.set(0.16, 0.26, -0.2);
    armR.rotation.z = -Math.PI / 3;
    armR.rotation.x = -Math.PI / 6;
    ragdollDriver.add(armR);

    carGroup.add(ragdollDriver);
    this.objectsGroup.add(carGroup);

    // 4. Dynamic Tire Smoke Particles for Drift / Skid
    const smokeGroup = new THREE.Group();
    smokeGroup.name = 'skid-smoke-group';
    for (let i = 0; i < 16; i++) {
      const pGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.name = `smoke-p-${i}`;
      smokeGroup.add(pMesh);
    }
    this.objectsGroup.add(smokeGroup);

    // 5. High-Contrast Physical Force & Velocity Vectors
    this.createArrow('circ-v-arrow', 0x22c55e);
    this.createArrow('circ-fc-arrow', 0xef4444);
    this.createArrow('circ-n-arrow', 0x38bdf8);
    this.createArrow('circ-mg-arrow', 0xf59e0b);
    this.createArrow('circ-fric-arrow', 0xf43f5e);
  }

  // Helper to build 3D conical banked track with curbs, dashed center line, barrier & foundation
  private buildBankedTrack(group: THREE.Group, radiusVal: number, radBank: number) {
    // Clear old children if any
    while (group.children.length > 0) {
      this.disposeObject(group.children[0]);
      group.remove(group.children[0]);
    }

    const R_vis = Math.max(5.5, Math.min(10.0, radiusVal * 0.22));
    const trackWidth = 4.2;
    const R_in = R_vis - trackWidth / 2;
    const R_out = R_vis + trackWidth / 2;
    const segments = 96;

    // 1. Banked Asphalt Track Geometry
    // Surface elevation: y(r) = (r - R_vis) * sin(radBank)
    const posList: number[] = [];
    const normList: number[] = [];
    const uvList: number[] = [];
    const indexList: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const alpha = (i / segments) * Math.PI * 2;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);

      // Inner vertex
      const yIn = - (trackWidth / 2) * Math.sin(radBank);
      const xIn = R_in * cosA;
      const zIn = R_in * sinA;

      // Outer vertex
      const yOut = (trackWidth / 2) * Math.sin(radBank);
      const xOut = R_out * cosA;
      const zOut = R_out * sinA;

      // Surface normal: tilted inwards toward center by radBank
      // Up vector: (-cosA * sin(radBank), cos(radBank), -sinA * sin(radBank))
      const nx = -cosA * Math.sin(radBank);
      const ny = Math.cos(radBank);
      const nz = -sinA * Math.sin(radBank);
      const normLen = Math.hypot(nx, ny, nz) || 1;

      posList.push(xIn, yIn, zIn);
      normList.push(nx / normLen, ny / normLen, nz / normLen);
      uvList.push(0, i / segments * 12);

      posList.push(xOut, yOut, zOut);
      normList.push(nx / normLen, ny / normLen, nz / normLen);
      uvList.push(1, i / segments * 12);

      if (i < segments) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        indexList.push(v0, v2, v1);
        indexList.push(v1, v2, v3);
      }
    }

    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(posList, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normList, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvList, 2));
    roadGeo.setIndex(indexList);

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.75,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.name = 'banked-road-asphalt';
    group.add(roadMesh);

    // 2. Apex Racing Kerbs (Alternating Red and White Kerb Tiles)
    const innerKerbMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const innerKerbMatWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const numKerbs = 48;

    for (let k = 0; k < numKerbs; k++) {
      const a0 = (k / numKerbs) * Math.PI * 2;
      const a1 = ((k + 1) / numKerbs) * Math.PI * 2;
      const kMat = k % 2 === 0 ? innerKerbMatRed : innerKerbMatWhite;

      // Inner Kerb (Width = 0.35)
      const kInGeo = new THREE.BufferGeometry();
      const kInPos = [
        (R_in - 0.35) * Math.cos(a0), - (trackWidth / 2 + 0.35) * Math.sin(radBank) + 0.02, (R_in - 0.35) * Math.sin(a0),
        R_in * Math.cos(a0), - (trackWidth / 2) * Math.sin(radBank) + 0.02, R_in * Math.sin(a0),
        (R_in - 0.35) * Math.cos(a1), - (trackWidth / 2 + 0.35) * Math.sin(radBank) + 0.02, (R_in - 0.35) * Math.sin(a1),

        (R_in - 0.35) * Math.cos(a1), - (trackWidth / 2 + 0.35) * Math.sin(radBank) + 0.02, (R_in - 0.35) * Math.sin(a1),
        R_in * Math.cos(a0), - (trackWidth / 2) * Math.sin(radBank) + 0.02, R_in * Math.sin(a0),
        R_in * Math.cos(a1), - (trackWidth / 2) * Math.sin(radBank) + 0.02, R_in * Math.sin(a1),
      ];
      kInGeo.setAttribute('position', new THREE.Float32BufferAttribute(kInPos, 3));
      kInGeo.computeVertexNormals();
      group.add(new THREE.Mesh(kInGeo, kMat));

      // Outer Kerb (Width = 0.35)
      const kOutGeo = new THREE.BufferGeometry();
      const kOutPos = [
        R_out * Math.cos(a0), (trackWidth / 2) * Math.sin(radBank) + 0.02, R_out * Math.sin(a0),
        (R_out + 0.35) * Math.cos(a0), (trackWidth / 2 + 0.35) * Math.sin(radBank) + 0.02, (R_out + 0.35) * Math.sin(a0),
        R_out * Math.cos(a1), (trackWidth / 2) * Math.sin(radBank) + 0.02, R_out * Math.sin(a1),

        R_out * Math.cos(a1), (trackWidth / 2) * Math.sin(radBank) + 0.02, R_out * Math.sin(a1),
        (R_out + 0.35) * Math.cos(a0), (trackWidth / 2 + 0.35) * Math.sin(radBank) + 0.02, (R_out + 0.35) * Math.sin(a0),
        (R_out + 0.35) * Math.cos(a1), (trackWidth / 2 + 0.35) * Math.sin(radBank) + 0.02, (R_out + 0.35) * Math.sin(a1),
      ];
      kOutGeo.setAttribute('position', new THREE.Float32BufferAttribute(kOutPos, 3));
      kOutGeo.computeVertexNormals();
      group.add(new THREE.Mesh(kOutGeo, kMat));
    }

    // 3. Dashed Center Line along R_vis
    const numDashes = 32;
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    for (let d = 0; d < numDashes; d += 2) {
      const a0 = (d / numDashes) * Math.PI * 2;
      const a1 = ((d + 1) / numDashes) * Math.PI * 2;
      const dashGeo = new THREE.BufferGeometry();
      const dPos = [
        (R_vis - 0.08) * Math.cos(a0), 0.02, (R_vis - 0.08) * Math.sin(a0),
        (R_vis + 0.08) * Math.cos(a0), 0.02, (R_vis + 0.08) * Math.sin(a0),
        (R_vis - 0.08) * Math.cos(a1), 0.02, (R_vis - 0.08) * Math.sin(a1),

        (R_vis - 0.08) * Math.cos(a1), 0.02, (R_vis - 0.08) * Math.sin(a1),
        (R_vis + 0.08) * Math.cos(a0), 0.02, (R_vis + 0.08) * Math.sin(a0),
        (R_vis + 0.08) * Math.cos(a1), 0.02, (R_vis + 0.08) * Math.sin(a1),
      ];
      dashGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
      dashGeo.computeVertexNormals();
      group.add(new THREE.Mesh(dashGeo, dashMat));
    }

    // 4. Outer Concrete Barrier / Guardrail Wall
    const barrierR = R_out + 0.4;
    const barrierHeight = 0.8;
    const bPosList: number[] = [];
    const bIdxList: number[] = [];
    const yB_base = (trackWidth / 2 + 0.4) * Math.sin(radBank);

    for (let i = 0; i <= segments; i++) {
      const alpha = (i / segments) * Math.PI * 2;
      const bx = barrierR * Math.cos(alpha);
      const bz = barrierR * Math.sin(alpha);
      bPosList.push(bx, yB_base, bz);
      bPosList.push(bx, yB_base + barrierHeight, bz);

      if (i < segments) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        bIdxList.push(v0, v2, v1);
        bIdxList.push(v1, v2, v3);
      }
    }
    const barrierGeo = new THREE.BufferGeometry();
    barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPosList, 3));
    barrierGeo.setIndex(bIdxList);
    barrierGeo.computeVertexNormals();
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.6,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(barrierGeo, barrierMat));

    // 5. Solid Architectural Foundation / Earth Embankment
    const fPosList: number[] = [];
    const fIdxList: number[] = [];
    const groundY = -3.0;

    for (let i = 0; i <= segments; i++) {
      const alpha = (i / segments) * Math.PI * 2;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);

      // Outer top
      fPosList.push(barrierR * cosA, yB_base, barrierR * sinA);
      // Outer ground base
      fPosList.push((barrierR + 1.2) * cosA, groundY, (barrierR + 1.2) * sinA);

      if (i < segments) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        fIdxList.push(v0, v2, v1);
        fIdxList.push(v1, v2, v3);
      }
    }
    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute('position', new THREE.Float32BufferAttribute(fPosList, 3));
    fGeo.setIndex(fIdxList);
    fGeo.computeVertexNormals();
    const fMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(fGeo, fMat));
  }

  private updateCircularMotion(ctx: SimRenderContext) {
    const { radius = 35, velocity = 18, theta = 20, mu = 0.35 } = ctx.params;
    const g = 9.8;
    const radBank = (theta * Math.PI) / 180;
    const tanT = Math.tan(radBank);

    // 1. Check if track needs geometry rebuild due to parameter change
    const roadGroup = this.objectsGroup.getObjectByName('banked-road-group') as THREE.Group;
    if (roadGroup) {
      const uData = (roadGroup as any).userData || {};
      if (uData.lastTheta !== theta || uData.lastRadius !== radius) {
        uData.lastTheta = theta;
        uData.lastRadius = radius;
        this.buildBankedTrack(roadGroup, radius, radBank);
      }
    }

    // 2. Real-Life Critical Physics & Frictional Limits
    // v0: Optimum speed (zero lateral friction needed)
    const v0 = Math.sqrt(radius * g * tanT);
    // vMax: Maximum speed before skidding outwards
    const denomMax = Math.max(0.01, 1 - mu * tanT);
    const vMax = Math.sqrt(radius * g * ((tanT + mu) / denomMax));
    // vMin: Minimum speed before slipping inwards (if tan theta > mu)
    const vMin = tanT > mu ? Math.sqrt(radius * g * ((tanT - mu) / (1 + mu * tanT))) : 0;

    // Viewport scaling for 3D track radius
    const R_vis = Math.max(5.5, Math.min(10.0, radius * 0.22));

    // Dynamic Lateral Drift & Skid Physics
    let driftOffset = 0;
    let oversteerYaw = 0;
    let isSkidding = false;

    if (velocity > vMax) {
      isSkidding = true;
      const speedExcess = velocity - vMax;
      driftOffset = Math.min(1.4, speedExcess * 0.18);
      oversteerYaw = -Math.min(0.25, speedExcess * 0.04);
    } else if (velocity < vMin && vMin > 0) {
      const speedDeficit = vMin - velocity;
      driftOffset = -Math.min(1.2, speedDeficit * 0.18);
      oversteerYaw = Math.min(0.15, speedDeficit * 0.03);
    }

    // Effective car radius on the banked cone
    const r_car = R_vis + driftOffset;

    // Azimuthal angle around the circular track
    const angularSpeed = velocity / radius;
    const angle = ctx.simTime * angularSpeed * 0.5;

    // 3. Exact 3D Banked Surface Coordinates
    // Surface elevation: y(r) = (r - R_vis) * sin(radBank)
    const x = r_car * Math.cos(angle);
    const z = r_car * Math.sin(angle);
    const y = (r_car - R_vis) * Math.sin(radBank);

    // 4. Exact Orthonormal Orientation Matrix on Banked Incline
    // Forward direction along circular track tangent + oversteer yaw
    const tangentDir = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize();
    // Upward Road Normal: tilted toward center (0,0,0) by radBank
    const normalDir = new THREE.Vector3(
      -Math.cos(angle) * Math.sin(radBank),
      Math.cos(radBank),
      -Math.sin(angle) * Math.sin(radBank)
    ).normalize();
    // Slope Vector (lateral uphill toward outer rim)
    const slopeDir = new THREE.Vector3(
      Math.cos(angle) * Math.cos(radBank),
      Math.sin(radBank),
      Math.sin(angle) * Math.cos(radBank)
    ).normalize();

    // Combine with oversteer yaw
    const fwdDir = new THREE.Vector3()
      .copy(tangentDir)
      .multiplyScalar(Math.cos(oversteerYaw))
      .add(slopeDir.clone().multiplyScalar(Math.sin(oversteerYaw)))
      .normalize();
    const leftDir = new THREE.Vector3().crossVectors(normalDir, fwdDir).normalize();

    const carGroup = this.objectsGroup.getObjectByName('circular-car-group');
    if (carGroup) {
      // Placing carGroup at (x, y, z) places the bottom of all 4 tires (local y = 0)
      // in 100% continuous, flush contact with the asphalt surface!
      carGroup.position.set(x, y, z);

      const rotMat = new THREE.Matrix4();
      // Local coordinate system: +X is Forward, +Y is Up (Normal), +Z is Left
      rotMat.makeBasis(fwdDir, normalDir, leftDir);
      carGroup.quaternion.setFromRotationMatrix(rotMat);

      // Wheel Rotation Physics (omega_wheel = velocity / r_wheel)
      const wheelAngularSpeed = (velocity / 0.32) * 0.5;
      const wheelRotAngle = ctx.simTime * wheelAngularSpeed;

      ['wheel-fl', 'wheel-fr', 'wheel-rl', 'wheel-rr'].forEach((wName) => {
        const wheel = carGroup.getObjectByName(wName);
        if (wheel) {
          wheel.rotation.z = -wheelRotAngle;
          // Front steering articulation (steers into turn + counter-steer if skidding)
          if (wName.includes('f')) {
            wheel.rotation.y = -0.12 - oversteerYaw * 1.8;
          }
        }
      });

      // 5. Articulated Ragdoll Driver & Real-Life G-Force Physics
      // Net lateral acceleration in car's non-inertial frame: a_lat = (v^2/R)*cos(theta) - g*sin(theta)
      const a_c = (velocity * velocity) / Math.max(1, radius);
      const a_lat = a_c * Math.cos(radBank) - g * Math.sin(radBank);

      // Inertial roll: at optimum speed v = v0, a_lat = 0, so driver sits perfectly upright!
      // If v > v0, driver feels centrifugal push outward and leans right (+Z in car frame).
      // If v < v0, driver leans left down the bank.
      const inertialTilt = Math.max(-0.45, Math.min(0.45, a_lat * 0.04));

      const driverTorso = carGroup.getObjectByName('driver-torso');
      if (driverTorso) {
        driverTorso.rotation.x = inertialTilt;
        driverTorso.rotation.y = -0.05;
        driverTorso.rotation.z = Math.sin(ctx.simTime * 14) * 0.02; // Engine vibration
      }

      const driverHead = carGroup.getObjectByName('driver-head-group');
      if (driverHead) {
        driverHead.rotation.x = inertialTilt * 1.4;
        driverHead.rotation.y = -0.15; // Looks through the apex of the curve
      }

      // Chassis suspension body-roll under cornering load
      const chassis = carGroup.getObjectByName('car-chassis');
      if (chassis) {
        chassis.rotation.x = inertialTilt * 0.15;
      }
    }

    // 6. Dynamic Tire Smoke Particles when Skidding
    const smokeGroup = this.objectsGroup.getObjectByName('skid-smoke-group');
    if (smokeGroup) {
      smokeGroup.children.forEach((pMesh: any, idx) => {
        if (isSkidding) {
          const tOffset = (ctx.simTime * 6 + idx * 0.4) % 2.0;
          const trailAngle = angle - tOffset * 0.4;
          const trailX = (r_car + (Math.random() - 0.5) * 0.3) * Math.cos(trailAngle);
          const trailZ = (r_car + (Math.random() - 0.5) * 0.3) * Math.sin(trailAngle);
          const trailY = (r_car - R_vis) * Math.sin(radBank) + tOffset * 0.35 + 0.1;

          pMesh.position.set(trailX, trailY, trailZ);
          pMesh.scale.setScalar(0.6 + tOffset * 1.2);
          pMesh.material.opacity = Math.max(0, 0.7 - tOffset * 0.35);
          pMesh.visible = true;
        } else {
          pMesh.visible = false;
          pMesh.material.opacity = 0;
        }
      });
    }

    // 7. Physical Force Vectors (Free Body Diagram in 3D)
    // Anchored at the car's center of mass
    const carPos = new THREE.Vector3(x, y, z).add(normalDir.clone().multiplyScalar(0.45));

    // Tangential Velocity Vector (Green)
    const vArrow = this.vectorGroup.getObjectByName('circ-v-arrow') as THREE.ArrowHelper;
    if (vArrow) {
      vArrow.position.copy(carPos);
      vArrow.setDirection(fwdDir);
      const vLen = Math.min(5.5, velocity * 0.18 + 0.8);
      vArrow.setLength(vLen, 0.4, 0.2);
      this.updateArrowLabel(
        'circ-v-arrow',
        `v = ${velocity.toFixed(1)} m/s`,
        '#22c55e',
        carPos.clone().add(fwdDir.clone().multiplyScalar(vLen + 0.6)),
        ctx.showLabels && ctx.showVectors
      );
    }

    // Centripetal Acceleration Vector (Red: pointing horizontally towards center)
    const fcArrow = this.vectorGroup.getObjectByName('circ-fc-arrow') as THREE.ArrowHelper;
    if (fcArrow) {
      fcArrow.position.copy(carPos);
      const centerDir = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle)).normalize();
      fcArrow.setDirection(centerDir);
      const a_c_val = (velocity * velocity) / radius;
      const fcLen = Math.min(5.2, a_c_val * 0.25 + 0.8);
      fcArrow.setLength(fcLen, 0.4, 0.2);
      this.updateArrowLabel(
        'circ-fc-arrow',
        `a_c = ${a_c_val.toFixed(1)} m/s²`,
        '#ef4444',
        carPos.clone().add(centerDir.clone().multiplyScalar(fcLen + 0.7)),
        ctx.showLabels && ctx.showVectors
      );
    }

    // Normal Reaction Vector (Sky Blue: perpendicular to banked surface)
    const nArrow = this.vectorGroup.getObjectByName('circ-n-arrow') as THREE.ArrowHelper;
    if (nArrow) {
      nArrow.position.copy(carPos);
      nArrow.setDirection(normalDir);
      nArrow.setLength(2.6, 0.4, 0.2);
      this.updateArrowLabel(
        'circ-n-arrow',
        'Normal Force N',
        '#38bdf8',
        carPos.clone().add(normalDir.clone().multiplyScalar(3.0)),
        ctx.showLabels && ctx.showVectors
      );
    }

    // Weight mg Vector (Amber: straight down)
    const mgArrow = this.vectorGroup.getObjectByName('circ-mg-arrow') as THREE.ArrowHelper;
    if (mgArrow) {
      mgArrow.position.copy(carPos);
      const downDir = new THREE.Vector3(0, -1, 0);
      mgArrow.setDirection(downDir);
      mgArrow.setLength(2.2, 0.4, 0.2);
      this.updateArrowLabel(
        'circ-mg-arrow',
        'Weight mg',
        '#f59e0b',
        carPos.clone().add(new THREE.Vector3(0, -2.6, 0)),
        ctx.showLabels && ctx.showVectors
      );
    }

    // Lateral Friction Force Vector (Rose)
    // Points down the slope if v > v0, or up the slope if v < v0
    const fricArrow = this.vectorGroup.getObjectByName('circ-fric-arrow') as THREE.ArrowHelper;
    if (fricArrow) {
      fricArrow.position.copy(carPos);
      const speedDiff = velocity - v0;
      if (Math.abs(speedDiff) > 0.4) {
        // Friction direction along banked slope
        const fricDir = speedDiff > 0 ? slopeDir.clone().negate() : slopeDir.clone();
        fricArrow.setDirection(fricDir);
        const fricLen = Math.min(3.5, Math.abs(speedDiff) * 0.25 + 0.6);
        fricArrow.setLength(fricLen, 0.35, 0.18);
        fricArrow.visible = ctx.showVectors;
        this.updateArrowLabel(
          'circ-fric-arrow',
          speedDiff > 0 ? 'Friction f_s (Inward)' : 'Friction f_s (Outward)',
          '#f43f5e',
          carPos.clone().add(fricDir.clone().multiplyScalar(fricLen + 0.6)),
          ctx.showLabels && ctx.showVectors
        );
      } else {
        // Optimum speed: zero friction needed!
        fricArrow.visible = false;
        this.updateArrowLabel(
          'circ-fric-arrow',
          'f_s ≈ 0 (Optimum Speed)',
          '#10b981',
          carPos.clone().add(normalDir.clone().multiplyScalar(1.5)),
          ctx.showLabels && ctx.showVectors
        );
      }
    }
  }

  // ==========================================
  // 15. PURE ROLLING MOTION ON INCLINE
  // ==========================================
  private setupPureRolling(ctx: SimRenderContext) {
    const rollingGroup = new THREE.Group();
    rollingGroup.name = 'rolling-group';

    // 1. Dynamic Incline Board (Slope)
    const boardGroup = new THREE.Group();
    boardGroup.name = 'rolling-incline-board';

    const boardGeo = new THREE.BoxGeometry(13, 0.3, 5.2);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.3,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.name = 'rolling-board-mesh';
    board.position.set(6.5, -0.15, 0); // Origin at top pivot
    boardGroup.add(board);

    // High-contrast yellow runway track lines
    const stripeGeo = new THREE.BoxGeometry(12.8, 0.02, 0.08);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const stripeL = new THREE.Mesh(stripeGeo, stripeMat);
    stripeL.position.set(6.5, 0.01, 1.8);
    boardGroup.add(stripeL);

    const stripeR = new THREE.Mesh(stripeGeo, stripeMat);
    stripeR.position.set(6.5, 0.01, -1.8);
    boardGroup.add(stripeR);

    // Center dash line
    for (let i = 0; i < 12; i++) {
      const dashGeo = new THREE.BoxGeometry(0.5, 0.02, 0.06);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(0.6 + i * 1.0, 0.01, 0);
      boardGroup.add(dash);
    }

    // Distance tick markers along slope (every 2m)
    for (let i = 1; i <= 6; i++) {
      const tickGeo = new THREE.BoxGeometry(0.06, 0.02, 3.4);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(i * 2.0, 0.01, 0);
      boardGroup.add(tick);
    }

    // Aluminum safety guide rails along sides
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 });
    const railGeo = new THREE.BoxGeometry(13, 0.4, 0.15);
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(6.5, 0.2, 2.52);
    boardGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(6.5, 0.2, -2.52);
    boardGroup.add(railR);

    rollingGroup.add(boardGroup);

    // 2. Dynamic Wedge Support Mesh
    const wedgeGeo = new THREE.BufferGeometry();
    const wedgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.65,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeMesh.name = 'rolling-wedge-mesh';
    rollingGroup.add(wedgeMesh);

    // 3. Ground Level Horizontal Track (Extension at bottom)
    const groundTrackGeo = new THREE.BoxGeometry(14, 0.15, 5.2);
    const groundTrackMat = new THREE.MeshStandardMaterial({ color: 0x14141e, roughness: 0.7, metalness: 0.2 });
    const groundTrack = new THREE.Mesh(groundTrackGeo, groundTrackMat);
    groundTrack.name = 'rolling-ground-track';
    groundTrack.position.set(7, -0.075, 0);
    rollingGroup.add(groundTrack);

    // End stopper bumper
    const stopGeo = new THREE.BoxGeometry(0.3, 1.2, 5.0);
    const stopMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.5 });
    const stopper = new THREE.Mesh(stopGeo, stopMat);
    stopper.name = 'rolling-end-stopper';
    stopper.position.set(13.85, 0.6, 0);
    rollingGroup.add(stopper);

    // 4. Rolling Cylinder Assembly (High-contrast, non-blending multi-texture rigid body)
    const rollerGroup = new THREE.Group();
    rollerGroup.name = 'rolling-cylinder';

    const spinGroup = new THREE.Group();
    spinGroup.name = 'roller-spin-group';

    const R = 1.2;
    const depth = 2.6;

    // Main Cylinder Core (Axis oriented along Z)
    const rollGeo = new THREE.CylinderGeometry(R, R, depth, 36);
    rollGeo.rotateX(Math.PI / 2); // Rotate so circular faces point along ±Z
    const rollMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Anodized Cyan
      metalness: 0.75,
      roughness: 0.2,
    });
    const cylinderCore = new THREE.Mesh(rollGeo, rollMat);
    spinGroup.add(cylinderCore);

    // High-contrast circumferential grip treads (8 evenly spaced ribs around perimeter)
    const numRibs = 8;
    for (let i = 0; i < numRibs; i++) {
      const angle = (i * 2 * Math.PI) / numRibs;
      const ribGeo = new THREE.BoxGeometry(0.12, 0.08, depth + 0.02);
      const ribMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set((R - 0.02) * Math.cos(angle), (R - 0.02) * Math.sin(angle), 0);
      rib.rotation.z = angle;
      spinGroup.add(rib);
    }

    // High-contrast 4-Quadrant spoke discs on both circular end caps (±Z)
    [-depth / 2 - 0.01, depth / 2 + 0.01].forEach((zPos, sideIdx) => {
      // Chrome rim ring
      const rimGeo = new THREE.RingGeometry(R * 0.82, R, 32);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.1, side: THREE.DoubleSide });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.z = zPos;
      spinGroup.add(rim);

      // 4 Alternating quadrant sectors (Amber Gold & Dark Slate)
      for (let q = 0; q < 4; q++) {
        const sectorGeo = new THREE.RingGeometry(0.25, R * 0.82, 16, 1, (q * Math.PI) / 2, Math.PI / 2);
        const sectorMat = new THREE.MeshBasicMaterial({
          color: q % 2 === 0 ? 0xf59e0b : 0x0f172a,
          side: THREE.DoubleSide,
        });
        const sector = new THREE.Mesh(sectorGeo, sectorMat);
        sector.position.z = zPos;
        spinGroup.add(sector);
      }

      // Radial spoke arms
      for (let s = 0; s < 4; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.06, R * 1.6, 0.02);
        const spokeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.position.z = zPos + (sideIdx === 0 ? -0.005 : 0.005);
        spoke.rotation.z = (s * Math.PI) / 4;
        spinGroup.add(spoke);
      }
    });

    // Central axle rod with brass end caps
    const axleGeo = new THREE.CylinderGeometry(0.2, 0.2, depth + 0.5, 24);
    axleGeo.rotateX(Math.PI / 2);
    const axleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const axle = new THREE.Mesh(axleGeo, axleMat);
    spinGroup.add(axle);

    rollerGroup.add(spinGroup);

    // Contact shadow beneath rolling cylinder (with depth bias to prevent z-fighting with runway)
    const shadowGeo = new THREE.PlaneGeometry(R * 1.8, depth * 0.9);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
    this.physicsMiddleware.applyDepthBias(shadowMat, -2.0, -4.0);
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.name = 'roller-contact-shadow';
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -R + 0.005;
    rollerGroup.add(contactShadow);

    // Instantaneous Axis of Rotation (IAOR) contact point marker (glowing magenta disc)
    const iaorGeo = new THREE.CylinderGeometry(0.12, 0.12, depth * 0.8, 16);
    iaorGeo.rotateX(Math.PI / 2);
    const iaorMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
    this.physicsMiddleware.applyDepthBias(iaorMat, -1.0, -2.0);
    const iaorMarker = new THREE.Mesh(iaorGeo, iaorMat);
    iaorMarker.name = 'iaor-marker';
    iaorMarker.position.y = -R;
    rollerGroup.add(iaorMarker);

    rollingGroup.add(rollerGroup);
    this.objectsGroup.add(rollingGroup);

    // Vector Arrows: Velocity v_cm, Static Friction f_s, Normal N, Gravity mg
    this.createArrow('roll-v-arrow', 0x22c55e);
    this.createArrow('roll-fric-arrow', 0xf97316);
    this.createArrow('roll-n-arrow', 0x38bdf8);
    this.createArrow('roll-mg-arrow', 0xef4444);
  }

  private updatePureRolling(ctx: SimRenderContext) {
    const { theta = 30, shapeFactor = 0.5, R = 1.2, mass = 2 } = ctx.params;
    const g = 9.81;

    const roller = this.objectsGroup.getObjectByName('rolling-cylinder');
    const spinGroup = roller?.getObjectByName('roller-spin-group');
    const boardGroup = this.objectsGroup.getObjectByName('rolling-incline-board');
    const wedge = this.objectsGroup.getObjectByName('rolling-wedge-mesh') as THREE.Mesh;
    const stopper = this.objectsGroup.getObjectByName('rolling-end-stopper');
    const groundTrack = this.objectsGroup.getObjectByName('rolling-ground-track');

    // 1. Compute geometry profile and physics transforms via physics-engine-middleware
    const profile = this.physicsMiddleware.computeInclineProfile(ctx.params, 12.0);
    const { topX, topY, botX, thetaRad, trackLength } = profile;

    // 2. Update Incline Board Position & Slope
    if (boardGroup) {
      boardGroup.position.set(topX, topY, 0);
      boardGroup.rotation.z = -thetaRad;
    }

    // 3. Update Ground Track Position & Stopper
    if (groundTrack && stopper) {
      groundTrack.position.set(botX + trackLength / 2, -0.075, 0);
      groundTrack.scale.set(trackLength / 14, 1, 1);
      stopper.position.set(botX + trackLength - 0.15, 0.6, 0);
    }

    // 4. Dynamic Triangular Wedge Support Geometry
    if (wedge) {
      const depth = 5.0;
      const hDepth = depth / 2;
      const positions = new Float32Array([
        // Front face (+z)
        topX, topY, hDepth,
        topX, 0, hDepth,
        botX, 0, hDepth,
        // Back face (-z)
        topX, topY, -hDepth,
        botX, 0, -hDepth,
        topX, 0, -hDepth,
        // Left vertical back wall
        topX, topY, hDepth,
        topX, topY, -hDepth,
        topX, 0, -hDepth,
        topX, topY, hDepth,
        topX, 0, -hDepth,
        topX, 0, hDepth,
        // Bottom ground base
        topX, 0, hDepth,
        topX, 0, -hDepth,
        botX, 0, -hDepth,
        topX, 0, hDepth,
        botX, 0, -hDepth,
        botX, 0, hDepth,
      ]);
      wedge.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      wedge.geometry.computeVertexNormals();
    }

    // 5. Compute rigorous non-penetration transform via PhysicsEngineMiddleware
    const transform = this.physicsMiddleware.computePureRollingTransform(ctx.params, ctx.simTime);

    if (roller) {
      // Apply exact non-penetration position, orientation, and spin angle
      this.physicsMiddleware.applyTransformToObject(roller, transform, spinGroup);
      
      // Real-time parameter mapping for cylinder radius
      const rScale = R / 1.2;
      roller.scale.set(rScale, rScale, 1);
    }

    // 6. Force & Velocity Vectors + High-Contrast 3D Floating Labels
    const center = transform.position;
    const currentVel = transform.linearVelocity.length();
    const omega = currentVel / R;
    const currentInclineAngle = -transform.rotation.z;
    const f_s = (shapeFactor / (1 + shapeFactor)) * mass * g * Math.sin(thetaRad);
    const N = mass * g * Math.cos(thetaRad);

    // Velocity Vector (v_cm)
    const vArrow = this.vectorGroup.getObjectByName('roll-v-arrow') as THREE.ArrowHelper;
    if (vArrow) {
      vArrow.position.copy(center);
      const vDir = transform.surfaceTangent.clone();
      vArrow.setDirection(vDir);
      const vLen = Math.min(4.5, Math.max(0.4, currentVel * 0.35 + 0.3));
      vArrow.setLength(vLen, 0.35, 0.18);
      this.updateArrowLabel(
        'roll-v-arrow',
        `v_{cm} = ${currentVel.toFixed(2)} m/s (ω = ${omega.toFixed(1)} rad/s)`,
        '#22c55e',
        center.clone().add(vDir.clone().multiplyScalar(vLen + 0.6)),
        ctx.showLabels && ctx.showVectors
      );
    }

    // Static Friction Vector (f_s) - at contact point
    const fricArrow = this.vectorGroup.getObjectByName('roll-fric-arrow') as THREE.ArrowHelper;
    if (fricArrow) {
      const contactPos = transform.contactPoint;
      fricArrow.position.copy(contactPos);
      if (transform.isOnRamp) {
        fricArrow.visible = ctx.showVectors;
        // Static friction points UP the incline to provide torque opposing sliding
        const fricDir = new THREE.Vector3(-Math.cos(currentInclineAngle), Math.sin(currentInclineAngle), 0);
        fricArrow.setDirection(fricDir);
        fricArrow.setLength(1.8, 0.35, 0.18);
        this.updateArrowLabel(
          'roll-fric-arrow',
          `f_s = ${f_s.toFixed(1)} N (Static Friction, v_{contact} = 0)`,
          '#f97316',
          contactPos.clone().add(fricDir.clone().multiplyScalar(2.2)),
          ctx.showLabels && ctx.showVectors
        );
      } else {
        fricArrow.visible = false;
        this.updateArrowLabel('roll-fric-arrow', '', '#f97316', contactPos, false);
      }
    }

    // Normal Reaction (N)
    const normArrow = this.vectorGroup.getObjectByName('roll-n-arrow') as THREE.ArrowHelper;
    if (normArrow) {
      const contactPos = transform.contactPoint;
      normArrow.position.copy(contactPos);
      const nDir = transform.surfaceNormal.clone();
      normArrow.setDirection(nDir);
      normArrow.setLength(2.2, 0.35, 0.18);
      this.updateArrowLabel(
        'roll-n-arrow',
        `N = ${(transform.isOnRamp ? N : mass * g).toFixed(1)} N`,
        '#38bdf8',
        contactPos.clone().add(nDir.clone().multiplyScalar(2.5)),
        ctx.showLabels && ctx.showVectors
      );
    }

    // Gravity (mg)
    const mgArrow = this.vectorGroup.getObjectByName('roll-mg-arrow') as THREE.ArrowHelper;
    if (mgArrow) {
      mgArrow.position.copy(center);
      mgArrow.setDirection(new THREE.Vector3(0, -1, 0));
      mgArrow.setLength(2.4, 0.35, 0.18);
      this.updateArrowLabel(
        'roll-mg-arrow',
        `mg = ${(mass * g).toFixed(1)} N`,
        '#ef4444',
        new THREE.Vector3(center.x, center.y - 2.8, center.z),
        ctx.showLabels && ctx.showVectors
      );
    }
  }

  // ==========================================
  // 16. ELECTROMAGNETIC INDUCTION (FARADAY-LENZ EXPERIMENTAL APPARATUS)
  // ==========================================
  private setupEMI(ctx: SimRenderContext) {
    const emiGroup = new THREE.Group();
    emiGroup.name = 'emi-apparatus-group';

    // 1. Heavy Laboratory Optical Rail Track
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    const trackGeo = new THREE.BoxGeometry(18, 0.4, 4.0);
    const track = new THREE.Mesh(trackGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }));
    track.position.set(0, -3.2, 0);
    emiGroup.add(track);

    // Dual Chrome Guide Rails
    [-1.2, 1.2].forEach((rz) => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 17.5, 16), railMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, -2.95, rz);
      emiGroup.add(rail);
    });

    // Millimeter distance scale along track
    for (let i = -8; i <= 8; i += 2) {
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.02, 2.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      tick.position.set(i, -2.98, 0);
      emiGroup.add(tick);
    }

    // 2. High-Precision Solenoid Induction Coil Assembly (Fixed at x = -3.5)
    const solGroup = new THREE.Group();
    solGroup.name = 'emi-solenoid-assembly';
    solGroup.position.set(-3.5, 0, 0);

    // Acrylic core tube (transparent bobbin)
    const bobbinMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.9,
      opacity: 0.35,
      transparent: true,
      roughness: 0.1,
    });
    const bobbinTube = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 5.6, 32, 1, true), bobbinMat);
    bobbinTube.rotation.z = Math.PI / 2;
    solGroup.add(bobbinTube);

    // End Flanges (Acrylic bobbin rims)
    [-2.8, 2.8].forEach((fx) => {
      const flange = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.25, 16, 32), bobbinMat);
      flange.rotation.y = Math.PI / 2;
      flange.position.set(fx, 0, 0);
      solGroup.add(flange);
    });

    // Heavy Stanchion Base
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const stand = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.8, 3.2), standMat);
    stand.position.set(0, -2.5, 0);
    solGroup.add(stand);

    // Tightly wound enameled copper magnet wire turns
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.15 });
    const numTurns = 20;
    for (let i = 0; i < numTurns; i++) {
      const xPos = -2.5 + (i * 5.0) / (numTurns - 1);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.08, 12, 36), copperMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(xPos, 0, 0);
      solGroup.add(ring);
    }

    // Brass Binding Post Terminals (Red & Black)
    const termRed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 })
    );
    termRed.position.set(-1.2, 2.4, 1.2);
    solGroup.add(termRed);

    const termBlack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 })
    );
    termBlack.position.set(1.2, 2.4, 1.2);
    solGroup.add(termBlack);

    emiGroup.add(solGroup);

    // 3. Motorized Magnetic Slider Carriage & High-Fidelity AlNiCo Bar Magnet
    const sliderGroup = new THREE.Group();
    sliderGroup.name = 'bar-magnet-slider-group';

    // Slider base on rails
    const sliderBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.5, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 })
    );
    sliderBase.position.set(0, -2.6, 0);
    sliderGroup.add(sliderBase);

    // Magnet Support Stanchion
    const postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.5, 16), postMat);
    post.position.set(0, -1.3, 0);
    sliderGroup.add(post);

    // Cylindrical AlNiCo Bar Magnet (North - Red, South - Blue)
    const northGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 28);
    northGeo.rotateZ(Math.PI / 2);
    const northMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.2 });
    const northMesh = new THREE.Mesh(northGeo, northMat);
    northMesh.position.set(-1.1, 0, 0);
    sliderGroup.add(northMesh);

    // Chrome North Pole Face Plate
    const nFace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.86, 0.86, 0.1, 28),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 })
    );
    nFace.rotation.z = Math.PI / 2;
    nFace.position.set(-2.2, 0, 0);
    sliderGroup.add(nFace);

    const southGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 28);
    southGeo.rotateZ(Math.PI / 2);
    const southMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7, roughness: 0.2 });
    const southMesh = new THREE.Mesh(southGeo, southMat);
    southMesh.position.set(1.1, 0, 0);
    sliderGroup.add(southMesh);

    // Chrome South Pole Face Plate
    const sFace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.86, 0.86, 0.1, 28),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 })
    );
    sFace.rotation.z = Math.PI / 2;
    sFace.position.set(2.2, 0, 0);
    sliderGroup.add(sFace);

    emiGroup.add(sliderGroup);

    // 4. Center-Zero Analog Mirror Galvanometer (Left Station at x = -3.5, y = 3.6)
    const galvoGroup = new THREE.Group();
    galvoGroup.name = 'emi-galvanometer';
    galvoGroup.position.set(-3.5, 3.6, 0);

    // Vintage Bakelite Body
    const galvoBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.6, 36),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
    );
    galvoBody.rotation.x = Math.PI / 2;
    galvoGroup.add(galvoBody);

    // Arched Meter Dial Face
    const dialMesh = new THREE.Mesh(
      new THREE.CircleGeometry(1.65, 36),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    dialMesh.position.z = 0.31;
    galvoGroup.add(dialMesh);

    // Dial Scale markings
    const scaleLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.2, 0.4, 0.32),
        new THREE.Vector3(0, 0.8, 0.32),
        new THREE.Vector3(1.2, 0.4, 0.32),
      ]),
      new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 })
    );
    galvoGroup.add(scaleLine);

    // Pivoting Deflection Needle Pointer
    const needlePivot = new THREE.Group();
    needlePivot.name = 'galvo-needle-pivot';
    needlePivot.position.set(0, -0.4, 0.33);

    const needleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.6, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    needleMesh.position.y = 0.8;
    needlePivot.add(needleMesh);
    galvoGroup.add(needlePivot);

    // High-Brightness Directional LED on top
    const ledGeo = new THREE.SphereGeometry(0.35, 20, 20);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.2 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.name = 'emi-indicator-led';
    led.position.set(0, 2.2, 0);
    galvoGroup.add(led);

    emiGroup.add(galvoGroup);

    // 5. Dynamic 3D Magnetic Flux Lines Group
    const fluxLinesGroup = new THREE.Group();
    fluxLinesGroup.name = 'emi-flux-lines';
    emiGroup.add(fluxLinesGroup);

    // 6. Circulating Lenz Induced Current Arrows
    const inducedIGroup = new THREE.Group();
    inducedIGroup.name = 'emi-induced-current-group';
    emiGroup.add(inducedIGroup);

    this.objectsGroup.add(emiGroup);

    // Dynamic Vectors
    this.createArrow('emi-v-arrow', 0xf59e0b); // Magnet velocity vector (Amber)
    this.createArrow('emi-b-arrow', 0x38bdf8); // Bar magnet B-field vector (Cyan)
  }

  private updateEMI(ctx: SimRenderContext) {
    const { magnetSpeed = 4, magnetDistance = 6 } = ctx.params;
    const oscFreq = magnetSpeed * 0.7;
    const oscX = 1.0 + Math.sin(ctx.simTime * oscFreq) * (magnetDistance * 0.7);
    const v_magnet = Math.cos(ctx.simTime * oscFreq) * oscFreq * (magnetDistance * 0.7);

    // Position Bar Magnet Carriage
    const slider = this.objectsGroup.getObjectByName('bar-magnet-slider-group');
    if (slider) {
      slider.position.set(oscX, 0, 0);
    }

    // Distance between magnet North pole (x = oscX - 2.2) and solenoid center (x = -3.5)
    const distToCoil = Math.abs((oscX - 2.2) - (-3.5));
    const fluxGradient = 1 / Math.pow(1 + distToCoil * distToCoil * 0.08, 1.5);
    // Faraday's Law: Induced EMF ε = -dΦ/dt = - (dΦ/dx) * (dx/dt)
    const inducedEMF = -v_magnet * fluxGradient * 1.8;
    const absEMF = Math.abs(inducedEMF);

    // 1. Update Galvanometer Needle Deflection
    const needlePivot = this.objectsGroup.getObjectByName('galvo-needle-pivot');
    if (needlePivot) {
      const maxDeflect = 0.85; // radians (~48 degrees)
      const targetAngle = -Math.max(-maxDeflect, Math.min(maxDeflect, inducedEMF * 0.35));
      needlePivot.rotation.z = targetAngle;
    }

    // 2. Update Directional Bi-Color LED
    const led = this.objectsGroup.getObjectByName('emi-indicator-led') as THREE.Mesh;
    if (led) {
      const mat = led.material as THREE.MeshStandardMaterial;
      const isApproaching = v_magnet < 0;
      mat.emissiveIntensity = Math.min(2.5, absEMF * 0.8);
      mat.color.setHex(isApproaching ? 0x22c55e : 0xf43f5e);
      mat.emissive.setHex(isApproaching ? 0x16a34a : 0xe11d48);
    }

    // 3. Dynamic Magnetic Flux Streamlines (Bridging Magnet & Solenoid)
    const fluxLines = this.objectsGroup.getObjectByName('emi-flux-lines') as THREE.Group;
    if (fluxLines) {
      while (fluxLines.children.length > 0) {
        this.disposeObject(fluxLines.children[0]);
        fluxLines.remove(fluxLines.children[0]);
      }

      if (ctx.showVectors) {
        const numLines = 8;
        const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });

        for (let i = 0; i < numLines; i++) {
          const phi = (i * 2 * Math.PI) / numLines;
          const curvePts: THREE.Vector3[] = [];
          const magnetTipX = oscX - 2.2;

          for (let step = 0; step <= 30; step++) {
            const t = step / 30;
            const px = magnetTipX - t * 8.0;
            const spread = 0.7 + Math.sin(t * Math.PI) * (1.6 + distToCoil * 0.15);
            const py = spread * Math.cos(phi);
            const pz = spread * Math.sin(phi);
            curvePts.push(new THREE.Vector3(px, py, pz));
          }

          const geom = new THREE.BufferGeometry().setFromPoints(curvePts);
          fluxLines.add(new THREE.Line(geom, lineMat));
        }
      }
    }

    // 4. Circulating Induced Current Arrows in Solenoid
    const inducedIGroup = this.objectsGroup.getObjectByName('emi-induced-current-group') as THREE.Group;
    if (inducedIGroup) {
      while (inducedIGroup.children.length > 0) {
        this.disposeObject(inducedIGroup.children[0]);
        inducedIGroup.remove(inducedIGroup.children[0]);
      }

      if (ctx.showVectors && absEMF > 0.1) {
        const sign = inducedEMF > 0 ? 1 : -1;
        const arrowColor = sign > 0 ? 0x22c55e : 0xf43f5e;
        const numArrows = 4;

        for (let a = 0; a < numArrows; a++) {
          const ang = (a * 2 * Math.PI) / numArrows + ctx.simTime * sign * 4.0;
          const arrowX = -3.5;
          const arrowY = 2.15 * Math.cos(ang);
          const arrowZ = 2.15 * Math.sin(ang);
          const dir = new THREE.Vector3(0, -sign * Math.sin(ang), sign * Math.cos(ang));

          const curArrow = new THREE.ArrowHelper(dir, new THREE.Vector3(arrowX, arrowY, arrowZ), 0.9, arrowColor, 0.3, 0.15);
          inducedIGroup.add(curArrow);
        }
      }
    }

    // 5. Magnet Velocity Vector Arrow
    const vArrow = this.vectorGroup.getObjectByName('emi-v-arrow') as THREE.ArrowHelper;
    if (vArrow && slider) {
      vArrow.position.set(oscX, 1.8, 0);
      const vDir = v_magnet >= 0 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
      vArrow.setDirection(vDir);
      const vLen = Math.min(3.5, Math.max(0.4, Math.abs(v_magnet) * 0.6));
      vArrow.setLength(vLen, 0.35, 0.18);
    }

    // 6. Dynamic 3D Labels
    const lenzOpposition = v_magnet < 0 ? 'Repulsive Opposing Force' : v_magnet > 0 ? 'Attractive Opposing Force' : 'Static (ε = 0)';
    this.updateArrowLabel(
      'emi-status-label',
      `ε = -N(dΦ/dt) = ${inducedEMF.toFixed(2)} V | v_mag = ${v_magnet.toFixed(2)} m/s [${lenzOpposition}]`,
      absEMF > 0.4 ? (v_magnet < 0 ? '#4ade80' : '#f87171') : '#94a3b8',
      new THREE.Vector3(0, 4.4, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'emi-galvo-label',
      `Mirror Galvanometer: ${inducedEMF >= 0 ? '+' : ''}${(inducedEMF * 10).toFixed(1)} μA`,
      '#38bdf8',
      new THREE.Vector3(-3.5, 5.2, 0),
      ctx.showLabels
    );
  }

  // ==========================================
  // 17. PHOTOELECTRIC EFFECT (REAL-LIFE APPARATUS & QUANTUM KINEMATICS)
  // ==========================================
  private getPhotoelectricSpectralColor(freq: number): { hex: number; hexStr: string; label: string } {
    if (freq < 4.8) return { hex: 0xef4444, hexStr: '#ef4444', label: 'Red (680 nm)' };
    if (freq < 5.5) return { hex: 0xf59e0b, hexStr: '#f59e0b', label: 'Amber / Yellow (580 nm)' };
    if (freq < 6.3) return { hex: 0x22c55e, hexStr: '#22c55e', label: 'Green (530 nm)' };
    if (freq < 7.5) return { hex: 0x06b6d4, hexStr: '#06b6d4', label: 'Cyan / Blue (460 nm)' };
    if (freq < 8.8) return { hex: 0x8b5cf6, hexStr: '#8b5cf6', label: 'Violet (400 nm)' };
    return { hex: 0xc084fc, hexStr: '#c084fc', label: 'Ionizing UV (250 nm)' };
  }

  private setupPhotoelectric(ctx: SimRenderContext) {
    // 1. Heavy Laboratory Bench & Dual Optical Rails
    const benchGeo = new THREE.BoxGeometry(16, 0.4, 8);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.3 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -3.8, 0);
    this.objectsGroup.add(bench);

    // Bench Grid and Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const rail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 15, 16), railMat);
    rail1.rotation.z = Math.PI / 2;
    rail1.position.set(0, -3.55, -1.2);
    this.objectsGroup.add(rail1);

    const rail2 = rail1.clone();
    rail2.position.set(0, -3.55, 1.2);
    this.objectsGroup.add(rail2);

    // 2. Dual Insulated Tube Mounting Pillars & Clamps
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    const clampMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });

    [-4.5, 4.5].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 3.4, 20), pillarMat);
      pillar.position.set(px, -2.0, 0);
      this.objectsGroup.add(pillar);

      const clamp = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.12, 16, 32), clampMat);
      clamp.rotation.y = Math.PI / 2;
      clamp.position.set(px, 0, 0);
      this.objectsGroup.add(clamp);
    });

    // 3. Evacuated Quartz Glass Envelope (Lenard Vacuum Tube)
    const glassGeo = new THREE.CylinderGeometry(2.2, 2.2, 11.2, 36, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 0.35,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1,
      reflectivity: 0.9,
      clearcoat: 1.0,
      side: THREE.DoubleSide,
    });
    const glassTube = new THREE.Mesh(glassGeo, glassMat);
    glassTube.rotation.z = Math.PI / 2;
    glassTube.position.set(0, 0, 0);
    this.objectsGroup.add(glassTube);

    // Glass Hemispherical End Caps
    const endCapMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    [-5.6, 5.6].forEach((px, idx) => {
      const capRing = new THREE.Mesh(new THREE.CylinderGeometry(2.26, 2.26, 0.3, 32), endCapMat);
      capRing.rotation.z = Math.PI / 2;
      capRing.position.set(px, 0, 0);
      this.objectsGroup.add(capRing);

      // Terminal binding posts
      const postColor = idx === 0 ? 0x3b82f6 : 0xef4444; // Blue = Cathode (-), Red = Anode (+)
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: postColor, metalness: 0.9, roughness: 0.2 })
      );
      post.position.set(px + (idx === 0 ? -0.4 : 0.4), 0, 0);
      post.rotation.z = Math.PI / 2;
      this.objectsGroup.add(post);
    });

    // Top Evacuation Tip / Nipple
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 16), glassMat);
    tip.position.set(0, 2.4, 0);
    this.objectsGroup.add(tip);

    // Angled Quartz Inlet Window Collar
    const windowCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.4, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 })
    );
    windowCollar.position.set(-4.5, 2.1, 0);
    windowCollar.rotation.z = -Math.PI / 5;
    this.objectsGroup.add(windowCollar);

    // 4. Photosensitive Cathode (Emitter Plate C)
    const cathodePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 1.85, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
    );
    cathodePlate.rotation.z = Math.PI / 2;
    cathodePlate.position.set(-4.5, 0, 0);
    this.objectsGroup.add(cathodePlate);

    // Cathode Active Photosensitive Spot
    const spotGeo = new THREE.CircleGeometry(1.4, 32);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const cathodeSpot = new THREE.Mesh(spotGeo, spotMat);
    cathodeSpot.name = 'photoelectric-cathode-spot';
    cathodeSpot.rotation.y = Math.PI / 2;
    cathodeSpot.position.set(-4.42, 0, 0);
    this.objectsGroup.add(cathodeSpot);

    // Cathode Lead Wire to Post
    const leadC = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), pillarMat);
    leadC.rotation.z = Math.PI / 2;
    leadC.position.set(-5.05, 0, 0);
    this.objectsGroup.add(leadC);

    // 5. Collector Plate (Anode A)
    const anodePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 1.85, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.25 })
    );
    anodePlate.rotation.z = Math.PI / 2;
    anodePlate.position.set(4.5, 0, 0);
    this.objectsGroup.add(anodePlate);

    // Anode Lead Wire to Post
    const leadA = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), pillarMat);
    leadA.rotation.z = Math.PI / 2;
    leadA.position.set(5.05, 0, 0);
    this.objectsGroup.add(leadA);

    // 6. Monochromatic Arc Lamp / UV Illuminator Housing
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-7.5, 3.6, 0);

    const lampBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    lampGroup.add(lampBody);

    const lensBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.75, 1.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
    );
    lensBarrel.rotation.z = -Math.PI / 3.4;
    lensBarrel.position.set(0.8, -0.6, 0);
    lampGroup.add(lensBarrel);

    const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.8, 16), pillarMat);
    lampStand.position.set(0, -3.6, 0);
    lampGroup.add(lampStand);

    this.objectsGroup.add(lampGroup);

    // 7. Dynamic Incident Light Cone Beam
    const beamGeo = new THREE.ConeGeometry(1.85, 5.6, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const lightBeam = new THREE.Mesh(beamGeo, beamMat);
    lightBeam.name = 'incident-light-beam';
    lightBeam.position.set(-5.9, 1.9, 0);
    lightBeam.rotation.z = -Math.PI / 3.4;
    this.objectsGroup.add(lightBeam);

    // 8. Streaming Photon Wave Packets Group
    const photonGroup = new THREE.Group();
    photonGroup.name = 'photoelectric-photons';
    this.objectsGroup.add(photonGroup);

    // 9. Emitted Photoelectron Particles Group
    const electronGroup = new THREE.Group();
    electronGroup.name = 'photoelectron-group';
    this.objectsGroup.add(electronGroup);

    // 10. Stopping Potential Barrier Plane Marker
    const barrierGeo = new THREE.RingGeometry(0.3, 2.1, 32);
    const barrierMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    barrierMesh.name = 'photoelectric-stopping-barrier';
    barrierMesh.rotation.y = Math.PI / 2;
    barrierMesh.position.set(0, 0, 0);
    barrierMesh.visible = false;
    this.objectsGroup.add(barrierMesh);

    // 11. Front Tabletop Instrumentation: Precision Microammeter & Voltmeter Station
    const meterBaseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.4 });

    // Microammeter (μA)
    const ammeterGroup = new THREE.Group();
    ammeterGroup.name = 'photoelectric-ammeter';
    ammeterGroup.position.set(2.8, -3.2, 2.5);

    const ammeterBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.8), meterBaseMat);
    ammeterGroup.add(ammeterBody);

    const ammeterDial = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.8, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 })
    );
    ammeterDial.position.set(0, 0.1, 0.91);
    ammeterGroup.add(ammeterDial);

    // Needle pivot and needle
    const needlePivot = new THREE.Group();
    needlePivot.name = 'photoelectric-ammeter-needle';
    needlePivot.position.set(0, -0.2, 0.94);

    const needle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.65, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    needle.position.set(0, 0.3, 0);
    needlePivot.add(needle);
    ammeterGroup.add(needlePivot);

    this.objectsGroup.add(ammeterGroup);

    // Voltmeter (V)
    const voltGroup = new THREE.Group();
    voltGroup.name = 'photoelectric-voltmeter';
    voltGroup.position.set(-2.8, -3.2, 2.5);

    const voltBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.8), meterBaseMat);
    voltGroup.add(voltBody);

    const voltDial = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.8, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 })
    );
    voltDial.position.set(0, 0.1, 0.91);
    voltGroup.add(voltDial);

    this.objectsGroup.add(voltGroup);

    // Commutator / Battery Station Box
    const commBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.8, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.7, roughness: 0.3 })
    );
    commBox.position.set(0, -3.35, 2.5);
    this.objectsGroup.add(commBox);

    // Circuit Connecting Wires
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.6 });
    const wireCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.8, 0, 0),
      new THREE.Vector3(-5.8, -3.2, 0),
      new THREE.Vector3(-3.8, -3.2, 2.5),
    ]);
    const wire1 = new THREE.Mesh(new THREE.TubeGeometry(wireCurve1, 24, 0.04, 8, false), wireMat);
    this.objectsGroup.add(wire1);

    const wireCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.8, 0, 0),
      new THREE.Vector3(5.8, -3.2, 0),
      new THREE.Vector3(3.8, -3.2, 2.5),
    ]);
    const wire2 = new THREE.Mesh(new THREE.TubeGeometry(wireCurve2, 24, 0.04, 8, false), wireMat);
    this.objectsGroup.add(wire2);

    // 12. Electric Field Arrows Group
    const eFieldGroup = new THREE.Group();
    eFieldGroup.name = 'photoelectric-efield';
    this.objectsGroup.add(eFieldGroup);
  }

  private updatePhotoelectric(ctx: SimRenderContext) {
    const {
      frequency = 8.0,
      workFunction = 2.3,
      intensity = 5,
      retardingV = 0,
      stoppingPotential = 0,
    } = ctx.params;

    // Applied voltage: positive accelerates electrons toward anode, negative retards them
    const appliedV = typeof ctx.params.retardingV !== 'undefined' ? retardingV : -stoppingPotential;

    // Physical Quantum Computations
    const h_eVs = 4.1357e-15;
    const freq_Hz = frequency * 1e14;
    const photonEnergy_eV = h_eVs * freq_Hz; // E = hν (e.g. 8.0 * 0.41357 = 3.31 eV)
    const K_max = Math.max(0, photonEnergy_eV - workFunction);
    const V_stop = K_max; // Stopping potential in Volts: eV_0 = K_max => V_0 = K_max
    const isAboveThreshold = K_max > 0;
    const isStopped = appliedV <= -V_stop && isAboveThreshold;

    // Photocurrent Calculation
    const I_sat = intensity * 2.4; // Saturation current in μA
    let current_uA = 0;
    if (isAboveThreshold) {
      if (appliedV >= 0) {
        current_uA = I_sat; // Saturation regime
      } else if (appliedV > -V_stop) {
        const frac = Math.max(0, (K_max + appliedV) / K_max);
        current_uA = I_sat * Math.pow(frac, 1.25);
      } else {
        current_uA = 0; // Cutoff at stopping potential
      }
    }

    // 1. Spectral Light Beam Color & Geometry
    const spectral = this.getPhotoelectricSpectralColor(frequency);
    const lightBeam = this.objectsGroup.getObjectByName('incident-light-beam') as THREE.Mesh;
    if (lightBeam && lightBeam.material) {
      const bMat = lightBeam.material as THREE.MeshBasicMaterial;
      bMat.color.setHex(spectral.hex);
      bMat.opacity = 0.25 + (intensity / 10) * 0.45;
    }

    // Cathode Spot Glow
    const cathodeSpot = this.objectsGroup.getObjectByName('photoelectric-cathode-spot') as THREE.Mesh;
    if (cathodeSpot && cathodeSpot.material) {
      const sMat = cathodeSpot.material as THREE.MeshBasicMaterial;
      sMat.color.setHex(spectral.hex);
      sMat.opacity = 0.35 + (intensity / 10) * 0.5;
    }

    // 2. Animate Streaming Photons (Quanta E = hν) from Optical Arc Lamp to Cathode
    const photonGroup = this.objectsGroup.getObjectByName('photoelectric-photons') as THREE.Group;
    if (photonGroup) {
      while (photonGroup.children.length > 0) {
        this.disposeObject(photonGroup.children[0]);
        photonGroup.remove(photonGroup.children[0]);
      }

      const pCount = Math.min(30, Math.max(8, Math.floor(intensity * 3.0)));
      const lampPos = new THREE.Vector3(-6.7, 3.0, 0);
      const targetPos = new THREE.Vector3(-4.45, 0, 0);
      const beamDir = new THREE.Vector3().subVectors(targetPos, lampPos);
      const beamLen = beamDir.length();

      for (let i = 0; i < pCount; i++) {
        const speed = 5.4; // Light propagation speed
        const cyclePeriod = beamLen / speed;
        const phase = (i / pCount) * cyclePeriod;
        const t = ((ctx.simTime + phase) % cyclePeriod) / cyclePeriod;
        const pPos = new THREE.Vector3().lerpVectors(lampPos, targetPos, t);

        // Sinusoidal wave packet modulation
        const waveFreq = 16.0;
        const waveAmp = 0.08 * (1 - t * 0.5);
        pPos.z += Math.sin(t * waveFreq + i) * waveAmp;
        pPos.y += Math.cos(t * waveFreq + i) * waveAmp;

        const photonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          new THREE.MeshBasicMaterial({ color: spectral.hex })
        );
        photonMesh.position.copy(pPos);
        photonGroup.add(photonMesh);
      }
    }

    // 3. Physical Photoelectron Trajectories with Real Lenard Kinematics
    const electronGroup = this.objectsGroup.getObjectByName('photoelectron-group') as THREE.Group;
    if (electronGroup) {
      while (electronGroup.children.length > 0) {
        this.disposeObject(electronGroup.children[0]);
        electronGroup.remove(electronGroup.children[0]);
      }

      if (isAboveThreshold) {
        const eCount = Math.min(50, Math.max(12, Math.floor(intensity * 4.8)));
        const plateDist = 9.0; // Distance from cathode (x = -4.5) to anode (x = +4.5)

        for (let i = 0; i < eCount; i++) {
          // Photoelectron Energy Distribution: continuous spectrum up to K_max
          // Fermi-Dirac-like profile with highest emission probability near medium-high energies
          const normIdx = (i + 0.5) / eCount;
          const energyFraction = 0.12 + 0.88 * Math.sin((normIdx * Math.PI) / 2);
          const eK = Math.max(0.01, K_max * energyFraction);
          const v_init = Math.sqrt(eK) * 3.6; // Emission velocity magnitude

          // Conical angular dispersion of liberated electrons
          const spreadAngle = ((i * 17) % 31) / 30 * 0.24; // 0 to ~14 degrees
          const azimuth = i * 2.39996; // Golden angle dispersion
          const v0x = v_init * Math.cos(spreadAngle);
          const v0y = v_init * Math.sin(spreadAngle) * Math.cos(azimuth);
          const v0z = v_init * Math.sin(spreadAngle) * Math.sin(azimuth);

          // Electric field acceleration: a_x = e*E/m = e*(V/d)/m
          const accelX = (appliedV / plateDist) * 4.2;

          // Kinematic trajectory calculation
          let flightTime = 0;
          let doesReachAnode = false;
          let xTurnaround = 4.5;
          let tStop = 0;

          if (accelX >= 0) {
            // Accelerating potential (V >= 0): electrons accelerate toward anode
            doesReachAnode = true;
            if (accelX === 0) {
              flightTime = plateDist / v0x;
            } else {
              // 0.5 * accelX * T^2 + v0x * T - plateDist = 0
              flightTime = (-v0x + Math.sqrt(v0x * v0x + 2 * accelX * plateDist)) / accelX;
            }
          } else {
            // Retarding potential (V < 0, accelX < 0)
            const absA = Math.abs(accelX);
            const discriminant = v0x * v0x - 2 * absA * plateDist;

            if (discriminant >= 0) {
              // Kinetic energy is sufficient to overcome retarding barrier and strike anode
              doesReachAnode = true;
              flightTime = (v0x - Math.sqrt(discriminant)) / absA;
            } else {
              // Electron decelerates to rest and turns back toward cathode
              doesReachAnode = false;
              tStop = v0x / absA;
              flightTime = 2 * tStop;
              xTurnaround = -4.5 + (v0x * v0x) / (2 * absA);
            }
          }

          flightTime = Math.max(0.2, flightTime);

          // Stagger electrons across their entire path for continuous stream
          const phaseOffset = (i / eCount) * flightTime;
          const simTimeFactor = ctx.simTime * 1.5;
          const tCycle = ((simTimeFactor + phaseOffset) % flightTime + flightTime) % flightTime;

          let posX = -4.5;
          let posY = 0;
          let posZ = 0;

          if (doesReachAnode) {
            // Direct flight from cathode (x = -4.5) to anode (x = +4.5)
            posX = -4.5 + v0x * tCycle + 0.5 * accelX * tCycle * tCycle;
            posY = v0y * tCycle;
            posZ = v0z * tCycle;
          } else {
            // Retarded turnaround flight
            if (tCycle <= tStop) {
              // Forward decelerating phase
              posX = -4.5 + v0x * tCycle - 0.5 * Math.abs(accelX) * tCycle * tCycle;
              posY = v0y * tCycle;
              posZ = v0z * tCycle;
            } else {
              // Reverse accelerating phase back to cathode
              const tReturn = tCycle - tStop;
              posX = xTurnaround - 0.5 * Math.abs(accelX) * tReturn * tReturn;
              posY = v0y * tStop - v0y * tReturn * 0.7;
              posZ = v0z * tStop - v0z * tReturn * 0.7;
            }
          }

          // Bound coordinates inside vacuum tube geometry
          posX = Math.max(-4.48, Math.min(4.48, posX));
          posY = Math.max(-1.7, Math.min(1.7, posY));
          posZ = Math.max(-1.7, Math.min(1.7, posZ));

          // Create glowing photoelectron sphere
          const isReturning = !doesReachAnode && tCycle > tStop;
          const eMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 10, 10),
            new THREE.MeshStandardMaterial({
              color: isReturning ? 0x60a5fa : 0x06b6d4,
              emissive: isReturning ? 0x3b82f6 : 0x0891b2,
              emissiveIntensity: 0.9,
              roughness: 0.2,
            })
          );
          eMesh.position.set(posX, posY, posZ);
          electronGroup.add(eMesh);
        }
      }
    }

    // 4. Stopping Potential Barrier Indicator Line / Plane
    const barrierMesh = this.objectsGroup.getObjectByName('photoelectric-stopping-barrier') as THREE.Mesh;
    if (barrierMesh) {
      if (appliedV < 0 && isAboveThreshold && Math.abs(appliedV) <= V_stop * 1.5) {
        const penetrationDist = Math.min(9.0, (K_max / Math.abs(appliedV || 0.001)) * 9.0);
        const barrierX = -4.5 + penetrationDist;
        barrierMesh.position.set(barrierX, 0, 0);
        barrierMesh.visible = barrierX < 4.45;
      } else {
        barrierMesh.visible = false;
      }
    }

    // 5. Dynamic Analog Microammeter Needle & Voltmeter Display
    const ammeterNeedle = this.objectsGroup.getObjectByName('photoelectric-ammeter-needle') as THREE.Group;
    if (ammeterNeedle) {
      const maxCurrent = 30.0;
      const targetAngle = -Math.PI / 4 + (Math.min(maxCurrent, current_uA) / maxCurrent) * (Math.PI / 2);
      ammeterNeedle.rotation.z = -targetAngle;
    }

    // 6. Dynamic Electric Field Vectors between Plates
    const eFieldGroup = this.objectsGroup.getObjectByName('photoelectric-efield') as THREE.Group;
    if (eFieldGroup) {
      while (eFieldGroup.children.length > 0) {
        this.disposeObject(eFieldGroup.children[0]);
        eFieldGroup.remove(eFieldGroup.children[0]);
      }

      if (Math.abs(appliedV) > 0.2) {
        const dir = appliedV > 0 ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0);
        const arrowColor = appliedV > 0 ? 0x22c55e : 0xef4444;

        [-1.0, 1.0].forEach((yOff) => {
          [-0.8, 0.8].forEach((zOff) => {
            const origin = appliedV > 0 ? new THREE.Vector3(3.8, yOff, zOff) : new THREE.Vector3(-3.8, yOff, zOff);
            const arrow = new THREE.ArrowHelper(dir, origin, 7.6, arrowColor, 0.5, 0.3);
            eFieldGroup.add(arrow);
          });
        });
      }
    }

    // 7. Dynamic 3D Floating Status Labels
    this.updateArrowLabel(
      'pe-emitter',
      `Cathode (Φ = ${workFunction.toFixed(1)} eV)`,
      '#06b6d4',
      new THREE.Vector3(-4.5, 2.6, 0),
      true
    );

    this.updateArrowLabel(
      'pe-collector',
      `Anode (${appliedV >= 0 ? '+' : ''}${appliedV.toFixed(1)} V)`,
      appliedV >= 0 ? '#22c55e' : '#ef4444',
      new THREE.Vector3(4.5, 2.6, 0),
      true
    );

    let statusText = `hν = ${photonEnergy_eV.toFixed(2)} eV | K_max = ${K_max.toFixed(2)} eV | I = ${current_uA.toFixed(1)} μA`;
    let statusColor = '#38bdf8';
    if (!isAboveThreshold) {
      statusText = `[!] hν < Φ₀ (Below ν₀): Zero Emission | I = 0 μA`;
      statusColor = '#ef4444';
    } else if (isStopped) {
      statusText = `[!] V ≤ -V₀ (${appliedV.toFixed(2)} V ≤ -${V_stop.toFixed(2)} V): Cutoff | I = 0.00 μA`;
      statusColor = '#f59e0b';
    } else if (appliedV >= 0) {
      statusText = `[✓] Saturation Regime: I_sat = ${current_uA.toFixed(1)} μA | V_stop = ${V_stop.toFixed(2)} V`;
      statusColor = '#10b981';
    }

    this.updateArrowLabel(
      'pe-status',
      statusText,
      statusColor,
      new THREE.Vector3(0, 3.3, 0),
      true
    );

    this.updateArrowLabel(
      'pe-ammeter-read',
      `Microammeter: ${current_uA.toFixed(1)} μA`,
      '#38bdf8',
      new THREE.Vector3(2.8, -2.4, 2.5),
      true
    );
  }

  // ==========================================
  // 18. THERMODYNAMICS: PV CYCLE & CYLINDER
  // ==========================================
  private setupThermoPVCycle(ctx: SimRenderContext) {
    // Glass Cylinder
    const cylGeo = new THREE.CylinderGeometry(2.5, 2.5, 8, 32, 1, true);
    const cylMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, transmission: 0.85, opacity: 0.6, transparent: true, roughness: 0.1 });
    const cylinder = new THREE.Mesh(cylGeo, cylMat);
    cylinder.rotation.z = Math.PI / 2;
    this.objectsGroup.add(cylinder);

    // Movable Piston Head
    const pistonGeo = new THREE.CylinderGeometry(2.45, 2.45, 0.6, 32);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    const piston = new THREE.Mesh(pistonGeo, pistonMat);
    piston.name = 'thermo-piston';
    piston.rotation.z = Math.PI / 2;
    this.objectsGroup.add(piston);

    // Gas Molecules Group
    const gasGroup = new THREE.Group();
    gasGroup.name = 'gas-molecules-group';
    for (let i = 0; i < 40; i++) {
      const molGeo = new THREE.SphereGeometry(0.15, 12, 12);
      const molMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.4 });
      const mol = new THREE.Mesh(molGeo, molMat);
      gasGroup.add(mol);
    }
    this.objectsGroup.add(gasGroup);
  }

  private updateThermoPVCycle(ctx: SimRenderContext) {
    const { T_hot = 500, T_cold = 300, compressionRatio = 2.5 } = ctx.params;
    const cycleTime = ctx.simTime % 4.0;
    let volumeScale = 1.0;

    // 4 Strokes: Isothermal expansion, Adiabatic expansion, Isothermal compression, Adiabatic compression
    if (cycleTime < 1.0) {
      volumeScale = 1.0 + cycleTime * (compressionRatio - 1.0) * 0.5;
    } else if (cycleTime < 2.0) {
      volumeScale = 1.0 + (compressionRatio - 1.0) * 0.5 + (cycleTime - 1.0) * (compressionRatio - 1.0) * 0.5;
    } else if (cycleTime < 3.0) {
      volumeScale = compressionRatio - (cycleTime - 2.0) * (compressionRatio - 1.0) * 0.5;
    } else {
      volumeScale = 1.0 + (compressionRatio - 1.0) * 0.5 - (cycleTime - 3.0) * (compressionRatio - 1.0) * 0.5;
    }

    const pistonX = -3.5 + volumeScale * 2.2;
    const piston = this.objectsGroup.getObjectByName('thermo-piston');
    if (piston) {
      piston.position.set(pistonX, 0, 0);
    }

    // Jiggle gas molecules according to temperature
    const gasGroup = this.objectsGroup.getObjectByName('gas-molecules-group') as THREE.Group;
    if (gasGroup) {
      const currentTemp = cycleTime < 2.0 ? T_hot : T_cold;
      const speed = Math.sqrt(currentTemp / 300) * 0.08;

      gasGroup.children.forEach((mol, idx) => {
        const seed = idx * 1.37;
        const mx = -3.8 + ((Math.sin(ctx.simTime * 8 * speed + seed) + 1) / 2) * (pistonX + 3.5);
        const my = Math.sin(ctx.simTime * 6 * speed + seed * 2) * 1.8;
        const mz = Math.cos(ctx.simTime * 7 * speed + seed * 3) * 1.8;
        mol.position.set(mx, my, mz);
      });
    }
  }

  // ==========================================
  // 19. DOPPLER EFFECT (SOUND WAVES)
  // ==========================================
  private setupDopplerEffect(ctx: SimRenderContext) {
    // Sound Source (Horn / Siren)
    const sourceGeo = new THREE.SphereGeometry(0.6, 24, 24);
    const sourceMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.8 });
    const source = new THREE.Mesh(sourceGeo, sourceMat);
    source.name = 'doppler-source';
    this.objectsGroup.add(source);

    // Observer Ear / Microphone
    const obsGeo = new THREE.BoxGeometry(0.8, 1.4, 0.8);
    const obsMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const obs = new THREE.Mesh(obsGeo, obsMat);
    obs.position.set(8, 0, 0);
    obs.name = 'doppler-observer';
    this.objectsGroup.add(obs);

    // Wavefronts Group
    const wavefronts = new THREE.Group();
    wavefronts.name = 'doppler-wavefronts';
    this.objectsGroup.add(wavefronts);
  }

  private updateDopplerEffect(ctx: SimRenderContext) {
    const { sourceSpeed = 15, soundSpeed = 340, frequency = 400 } = ctx.params;
    const v_s = (sourceSpeed / soundSpeed) * 8; // normalized source speed
    const tCycle = ctx.simTime % 4.0;
    const curSourceX = -8 + v_s * tCycle * 3;

    const source = this.objectsGroup.getObjectByName('doppler-source');
    if (source) {
      source.position.set(curSourceX, 0, 0);
    }

    const wavefronts = this.objectsGroup.getObjectByName('doppler-wavefronts') as THREE.Group;
    if (wavefronts) {
      while (wavefronts.children.length > 0) {
        this.disposeObject(wavefronts.children[0]);
        wavefronts.remove(wavefronts.children[0]);
      }

      const numWaves = 12;
      const c = 6.0; // wave propagation speed in 3D units

      for (let i = 0; i < numWaves; i++) {
        const emissionTime = tCycle - (i * 0.25);
        if (emissionTime > 0) {
          const emitX = -8 + v_s * emissionTime * 3;
          const radius = (tCycle - emissionTime) * c;

          if (radius > 0.2 && radius < 20) {
            const ringGeo = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 48);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: Math.max(0, 1 - radius / 18), side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(emitX, 0, 0);
            ring.rotation.x = Math.PI / 2;
            wavefronts.add(ring);
          }
        }
      }
    }
  }

  // ==========================================
  // 1. BIOT-SAVART & AMPERE CIRCUITAL LAW
  // ==========================================
  private setupBiotSavart(ctx: SimRenderContext) {
    // Central Axis Line
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-15, 0, 0),
      new THREE.Vector3(15, 0, 0),
    ]);
    const axisMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.5, gapSize: 0.2 });
    const axisLine = new THREE.Line(axisGeo, axisMat);
    axisLine.computeLineDistances();
    this.objectsGroup.add(axisLine);

    // Conductor Group
    const coilGroup = new THREE.Group();
    coilGroup.name = 'bs-coil-group';
    this.objectsGroup.add(coilGroup);

    // Magnetic Field Lines Group
    const bFieldGroup = new THREE.Group();
    bFieldGroup.name = 'bs-field-group';
    this.objectsGroup.add(bFieldGroup);

    // Axial Test Point Indicator
    const probeGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.4 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.name = 'bs-probe';
    this.objectsGroup.add(probe);
  }

  private updateBiotSavart(ctx: SimRenderContext) {
    const { current = 10, loopRadius = 8, axialDist = 6, numTurns = 10, geometry = 0 } = ctx.params;
    const R = loopRadius * 0.4;
    const x = axialDist * 0.4;

    const coilGroup = this.objectsGroup.getObjectByName('bs-coil-group') as THREE.Group;
    if (coilGroup) {
      while (coilGroup.children.length > 0) {
        this.disposeObject(coilGroup.children[0]);
        coilGroup.remove(coilGroup.children[0]);
      }

      if (geometry === 0) {
        // Circular Loop Coil
        const torusGeo = new THREE.TorusGeometry(R, 0.15, 16, 64);
        const torusMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.rotation.y = Math.PI / 2;
        coilGroup.add(torus);

        // Circulating Current Arrow Indicator
        const arrowAngle = (ctx.simTime * (current / 5)) % (Math.PI * 2);
        const arrowX = 0;
        const arrowY = R * Math.cos(arrowAngle);
        const arrowZ = R * Math.sin(arrowAngle);
        const curArrow = new THREE.ArrowHelper(
          new THREE.Vector3(0, -Math.sin(arrowAngle), Math.cos(arrowAngle)),
          new THREE.Vector3(arrowX, arrowY, arrowZ),
          1.2,
          0xef4444,
          0.4,
          0.3
        );
        coilGroup.add(curArrow);
      } else if (geometry === 1) {
        // Straight Wire
        const wireGeo = new THREE.CylinderGeometry(0.12, 0.12, 20, 16);
        const wireMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        coilGroup.add(wire);
      } else {
        // Solenoid
        const solLen = 10;
        const solTurns = 16;
        for (let i = 0; i < solTurns; i++) {
          const torusGeo = new THREE.TorusGeometry(R, 0.08, 12, 32);
          const torusMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 });
          const torus = new THREE.Mesh(torusGeo, torusMat);
          torus.rotation.y = Math.PI / 2;
          torus.position.x = -solLen / 2 + (i * solLen) / (solTurns - 1);
          coilGroup.add(torus);
        }
      }
    }

    // Update Probe Position & Live Magnetic Field Vector
    const probe = this.objectsGroup.getObjectByName('bs-probe');
    if (probe) {
      probe.position.set(x, 0, 0);
    }

    // Vector Visuals
    while (this.vectorGroup.children.length > 0) {
      const obj = this.vectorGroup.children[0];
      this.disposeObject(obj);
      this.vectorGroup.remove(obj);
    }

    if (ctx.showVectors) {
      // Calculate B field magnitude proportional scaling
      const bFieldMag = (numTurns * current * R * R) / Math.pow(R * R + x * x, 1.5);
      const arrowLength = Math.min(8, Math.max(0.8, bFieldMag * 1.5));
      const bArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(x, 0, 0),
        arrowLength,
        0x38bdf8,
        0.6,
        0.4
      );
      this.vectorGroup.add(bArrow);

      // Loop field lines curving in 3D
      const numLines = 6;
      for (let i = 0; i < numLines; i++) {
        const phi = (i * Math.PI * 2) / numLines;
        const curvePoints: THREE.Vector3[] = [];
        for (let t = -Math.PI; t <= Math.PI; t += 0.1) {
          const lx = 4 * Math.sin(t);
          const lr = R * 1.2 + 2.5 * Math.pow(Math.cos(t / 2), 2);
          curvePoints.push(new THREE.Vector3(lx, lr * Math.cos(phi), lr * Math.sin(phi)));
        }
        const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const curveMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 });
        this.vectorGroup.add(new THREE.Line(curveGeo, curveMat));
      }
    }
  }

  // ==========================================
  // 2. GAUSS'S LAW & ELECTRIC FLUX (PHYSICAL EXPERIMENTAL APPARATUS)
  // ==========================================
  private setupGaussLaw(ctx: SimRenderContext) {
    const glGroup = new THREE.Group();
    glGroup.name = 'gauss-law-apparatus-group';

    // 1. High-Voltage Laboratory Insulated Stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

    const basePlatform = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.4, 0.6, 36), baseMat);
    basePlatform.position.y = -4.5;
    glGroup.add(basePlatform);

    // Amber Dielectric Insulating Quartz Pillar
    const quartzMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      transmission: 0.85,
      opacity: 0.75,
      transparent: true,
      roughness: 0.15,
      ior: 1.54,
    });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.8, 24), quartzMat);
    pillar.position.y = -2.4;
    glGroup.add(pillar);

    // Brass Top Mount Collar
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
    );
    collar.position.y = -0.4;
    glGroup.add(collar);

    // 2. Charged Sphere / Conducting Metallic Shell Body
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4,
      metalness: 0.75,
      roughness: 0.25,
    });
    const chargeMesh = new THREE.Mesh(new THREE.SphereGeometry(2.0, 36, 36), sphereMat);
    chargeMesh.name = 'gl-charge-body';
    chargeMesh.position.y = 1.6;
    glGroup.add(chargeMesh);

    // Microscopic Surface Charge Distribution Dots Group
    const dotsGroup = new THREE.Group();
    dotsGroup.name = 'gl-surface-charges';
    dotsGroup.position.y = 1.6;
    glGroup.add(dotsGroup);

    // 3. Mathematical Gaussian Closed Surface (High-Refraction Borosilicate Glass Sphere)
    const gaussMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.88,
      opacity: 0.3,
      transparent: true,
      roughness: 0.1,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const gaussMesh = new THREE.Mesh(new THREE.SphereGeometry(3.5, 36, 36), gaussMat);
    gaussMesh.name = 'gl-gaussian-surface';
    gaussMesh.position.y = 1.6;
    glGroup.add(gaussMesh);

    // Gaussian Surface Latitude & Longitude Meridian Rings
    const wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(3.5, 18, 18)), wireMat);
    wireframe.name = 'gl-gaussian-wireframe';
    wireframe.position.y = 1.6;
    glGroup.add(wireframe);

    // 4. Area Normal dA Vector Arrows Group on Gaussian Surface
    const daGroup = new THREE.Group();
    daGroup.name = 'gl-da-vectors';
    glGroup.add(daGroup);

    this.objectsGroup.add(glGroup);
  }

  private updateGaussLaw(ctx: SimRenderContext) {
    const { chargeQ = 20, sphereRadius = 5, gaussianRadius = 8, chargeType = 0 } = ctx.params;
    const R = Math.max(1.0, sphereRadius * 0.4);
    const r = Math.max(0.8, gaussianRadius * 0.4);
    const isPositive = chargeQ >= 0;
    const qAbs = Math.abs(chargeQ);
    const centerY = 1.6;
    const centerPos = new THREE.Vector3(0, centerY, 0);

    // 1. Update Charged Sphere Geometry & Materials
    const chargeBody = this.objectsGroup.getObjectByName('gl-charge-body') as THREE.Mesh;
    if (chargeBody) {
      chargeBody.scale.set(R / 2, R / 2, R / 2);
      const mat = chargeBody.material as THREE.MeshStandardMaterial;
      mat.color.setHex(isPositive ? 0xef4444 : 0x06b6d4);
      mat.emissive.setHex(isPositive ? 0x991b1b : 0x0e7490);
    }

    // 2. Microscopic Discrete Charge Grid on Sphere
    const dotsGroup = this.objectsGroup.getObjectByName('gl-surface-charges') as THREE.Group;
    if (dotsGroup) {
      while (dotsGroup.children.length > 0) {
        this.disposeObject(dotsGroup.children[0]);
        dotsGroup.remove(dotsGroup.children[0]);
      }

      const numDots = Math.min(32, Math.max(8, Math.round(qAbs * 1.2)));
      const dotMat = new THREE.MeshBasicMaterial({ color: isPositive ? 0xfecaca : 0xa5f3fc });
      const dotGeo = new THREE.SphereGeometry(0.08, 8, 8);

      for (let i = 0; i < numDots; i++) {
        const phi = Math.acos(-1 + (2 * i) / numDots);
        const theta = Math.sqrt(numDots * Math.PI) * phi;
        // For conductor (chargeType=0): charges reside on surface r=R
        // For non-conductor (chargeType=1): charges distributed uniformly throughout volume
        const radFrac = chargeType === 0 ? 1.02 : Math.cbrt((i + 1) / numDots) * 0.98;
        const dotRadius = R * radFrac;

        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(
          dotRadius * Math.sin(phi) * Math.cos(theta),
          dotRadius * Math.cos(phi),
          dotRadius * Math.sin(phi) * Math.sin(theta)
        );
        dotsGroup.add(dot);
      }
    }

    // 3. Gaussian Surface Scaling (Radius r)
    const gaussSurface = this.objectsGroup.getObjectByName('gl-gaussian-surface') as THREE.Mesh;
    if (gaussSurface) {
      gaussSurface.scale.set(r / 3.5, r / 3.5, r / 3.5);
    }
    const gaussWire = this.objectsGroup.getObjectByName('gl-gaussian-wireframe') as THREE.LineSegments;
    if (gaussWire) {
      gaussWire.scale.set(r / 3.5, r / 3.5, r / 3.5);
    }

    // 4. Physical Gauss's Law Computations: Enclosed Charge & Electric Field
    let q_enclosed = 0;
    let E_mag = 0;

    if (r >= R) {
      // Outside sphere: all charge is enclosed
      q_enclosed = chargeQ;
      E_mag = (8.99 * qAbs) / (r * r);
    } else {
      // Inside sphere
      if (chargeType === 0) {
        // Conducting shell: zero enclosed charge inside
        q_enclosed = 0;
        E_mag = 0;
      } else {
        // Non-conducting solid uniform sphere: q_enc = Q * (r/R)^3
        const volFraction = Math.pow(r / R, 3);
        q_enclosed = chargeQ * volFraction;
        E_mag = (8.99 * qAbs * r) / Math.pow(R, 3);
      }
    }

    // 5. Electric Field Vector Arrows (E) & Surface Normal Vectors (dA)
    while (this.vectorGroup.children.length > 0) {
      const obj = this.vectorGroup.children[0];
      this.disposeObject(obj);
      this.vectorGroup.remove(obj);
    }

    if (ctx.showVectors) {
      const numArrows = 20;
      for (let i = 0; i < numArrows; i++) {
        const phi = Math.acos(-1 + (2 * i) / numArrows);
        const theta = Math.sqrt(numArrows * Math.PI) * phi;

        const normalDir = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        ).normalize();

        const origin = centerPos.clone().add(normalDir.clone().multiplyScalar(r));
        const fieldDir = isPositive ? normalDir.clone() : normalDir.clone().negate();

        // (a) Surface Area Vector dA (Amber/Cyan Arrow outward)
        const daArrow = new THREE.ArrowHelper(normalDir, origin, 0.7, 0xf59e0b, 0.2, 0.1);
        this.vectorGroup.add(daArrow);

        // (b) Electric Field Vector E (Green Arrow)
        if (E_mag > 0.05) {
          const arrowLen = Math.min(2.5, Math.max(0.4, E_mag * 0.15));
          const eArrow = new THREE.ArrowHelper(fieldDir, origin, arrowLen, 0x22c55e, 0.25, 0.12);
          this.vectorGroup.add(eArrow);
        }
      }
    }

    // 6. Dynamic 3D Floating Labels
    const flux_val = (q_enclosed / 8.854).toFixed(2); // Φ = q_enc / ε_0 (scaled)
    this.updateArrowLabel(
      'gl-flux-label',
      `∮ E·dA = q_enc/ε_0 = ${flux_val} N·m²/C | q_enc = ${q_enclosed.toFixed(1)} μC (r=${r.toFixed(1)}m, R=${R.toFixed(1)}m)`,
      '#38bdf8',
      new THREE.Vector3(0, centerY + r + 1.2, 0),
      ctx.showLabels
    );

    this.updateArrowLabel(
      'gl-field-label',
      `E(r) = ${E_mag.toFixed(2)} N/C [${r < R ? (chargeType === 0 ? 'Conductor Interior: E=0' : 'Dielectric Interior: E∝r') : 'Exterior: E∝1/r²'}]`,
      '#4ade80',
      new THREE.Vector3(0, centerY - r - 1.2, 0),
      ctx.showLabels && ctx.showVectors
    );
  }

  // ==========================================
  // 3. BERNOULLI'S PRINCIPLE & FLUID FLOW
  // ==========================================
  private setupBernoulliFlow(ctx: SimRenderContext) {
    // Water Tank (Cylinder container)
    const tankGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 32, 1, true);
    const tankMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.name = 'bf-tank';
    tank.position.set(-6, 3, 0);
    this.objectsGroup.add(tank);

    // Water Volume
    const waterGeo = new THREE.CylinderGeometry(2.45, 2.45, 5, 32);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.65 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.name = 'bf-water';
    water.position.set(-6, 2.5, 0);
    this.objectsGroup.add(water);

    // Drainage Parabolic Jet Stream Line
    const jetGeo = new THREE.BufferGeometry();
    const jetMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
    const jetLine = new THREE.Line(jetGeo, jetMat);
    jetLine.name = 'bf-jet';
    this.objectsGroup.add(jetLine);

    // Ground Target Marker
    const targetGeo = new THREE.RingGeometry(0.3, 0.6, 24);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.name = 'bf-target';
    target.rotation.x = Math.PI / 2;
    this.objectsGroup.add(target);
  }

  private updateBernoulliFlow(ctx: SimRenderContext) {
    const { tankHeight = 5, orificeHeight = 2 } = ctx.params;
    const g = 9.8;
    const H = tankHeight;
    const h = Math.min(orificeHeight, H - 0.1);
    const depth = Math.max(0, H - h);

    const v_eff = Math.sqrt(2 * g * depth);
    const range = 2 * Math.sqrt(h * depth);

    // Scale to 3D units
    const scale = 1.0;
    const tankX = -6;
    const holeX = tankX + 2.5;
    const holeY = h * scale;

    const water = this.objectsGroup.getObjectByName('bf-water') as THREE.Mesh;
    if (water) {
      const waterH = H * scale;
      water.scale.set(1, waterH / 5, 1);
      water.position.y = waterH / 2;
    }

    // Parabolic Jet Points
    const jet = this.objectsGroup.getObjectByName('bf-jet') as THREE.Line;
    if (jet) {
      const points: THREE.Vector3[] = [];
      const dt = 0.02;
      const t_flight = Math.sqrt((2 * holeY) / g);
      for (let t = 0; t <= t_flight; t += dt) {
        const jx = holeX + (v_eff * scale * 0.6) * t;
        const jy = holeY - 0.5 * g * t * t;
        points.push(new THREE.Vector3(jx, Math.max(0, jy), 0));
      }
      jet.geometry.dispose();
      jet.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }

    // Ground landing target
    const target = this.objectsGroup.getObjectByName('bf-target');
    if (target) {
      const landX = holeX + (range * scale * 0.6);
      target.position.set(landX, 0.05, 0);
    }
  }

  // ==========================================
  // 4. POLARIZATION & WAVE OPTICS (MALUS LAW)
  // ==========================================
  private setupPolarization(ctx: SimRenderContext) {
    // Polarizer 1 (Fixed Vertical)
    const pol1Geo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const pol1Mat = new THREE.MeshPhysicalMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 });
    const pol1 = new THREE.Mesh(pol1Geo, pol1Mat);
    pol1.rotation.z = Math.PI / 2;
    pol1.position.set(-4, 0, 0);
    pol1.name = 'pol-disk-1';
    this.objectsGroup.add(pol1);

    // Analyzer 2 (Rotatable by angle theta)
    const pol2 = pol1.clone();
    pol2.position.set(4, 0, 0);
    pol2.name = 'pol-disk-2';
    this.objectsGroup.add(pol2);

    // Light Wave Line
    const waveGeo = new THREE.BufferGeometry();
    const waveMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const waveLine = new THREE.Line(waveGeo, waveMat);
    waveLine.name = 'pol-wave-line';
    this.objectsGroup.add(waveLine);
  }

  private updatePolarization(ctx: SimRenderContext) {
    const { analyzerAngle = 45 } = ctx.params;
    const thetaRad = (analyzerAngle * Math.PI) / 180;

    const pol2 = this.objectsGroup.getObjectByName('pol-disk-2');
    if (pol2) {
      pol2.rotation.x = thetaRad;
    }

    const waveLine = this.objectsGroup.getObjectByName('pol-wave-line') as THREE.Line;
    if (waveLine) {
      const points: THREE.Vector3[] = [];
      const k = 2.0;
      const omega = 5.0;
      const t = ctx.simTime;

      // Section 1: Unpolarized (x: -12 to -4)
      for (let x = -12; x < -4; x += 0.1) {
        const y = 1.2 * Math.sin(k * x - omega * t);
        const z = 1.2 * Math.cos(k * x - omega * t * 1.3);
        points.push(new THREE.Vector3(x, y, z));
      }

      // Section 2: Vertically Polarized (x: -4 to 4)
      for (let x = -4; x < 4; x += 0.1) {
        const y = 1.2 * Math.sin(k * x - omega * t);
        points.push(new THREE.Vector3(x, y, 0));
      }

      // Section 3: After Analyzer (x: 4 to 12) - Amplitude scaled by cos(theta)
      const transmittedAmp = 1.2 * Math.cos(thetaRad);
      for (let x = 4; x <= 12; x += 0.1) {
        const wave = transmittedAmp * Math.sin(k * x - omega * t);
        const y = wave * Math.cos(thetaRad);
        const z = wave * Math.sin(thetaRad);
        points.push(new THREE.Vector3(x, y, z));
      }

      waveLine.geometry.dispose();
      waveLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
  }

  // ==========================================
  // 5. STANDING WAVES & ORGAN PIPES
  // ==========================================
  private setupStandingWaves(ctx: SimRenderContext) {
    // Pipe body (Transparent Cylinder)
    const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, 14, 32, 1, true);
    const pipeMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.name = 'sw-pipe';
    this.objectsGroup.add(pipe);

    // Wave Line Mesh
    const waveGeo = new THREE.BufferGeometry();
    const waveMat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 3 });
    const wave = new THREE.Line(waveGeo, waveMat);
    wave.name = 'sw-line';
    this.objectsGroup.add(wave);
  }

  private updateStandingWaves(ctx: SimRenderContext) {
    const { tubeLength = 1.5, harmonicMode = 2, soundSpeed = 340, pipeType = 0 } = ctx.params;
    const n = harmonicMode;
    const L = 12; // 3D units

    const wave = this.objectsGroup.getObjectByName('sw-line') as THREE.Line;
    if (wave) {
      const points: THREE.Vector3[] = [];
      const freq = pipeType === 1 ? ((2 * n - 1) * soundSpeed) / (4 * tubeLength) : (n * soundSpeed) / (2 * tubeLength);
      const omega = Math.min(10, (freq / 50) * Math.PI);
      const k = pipeType === 1 ? ((2 * n - 1) * Math.PI) / (2 * L) : (n * Math.PI) / L;

      for (let x = -L / 2; x <= L / 2; x += 0.1) {
        const xNorm = x + L / 2;
        const amp = 1.2 * Math.sin(k * xNorm) * Math.cos(omega * ctx.simTime);
        points.push(new THREE.Vector3(x, amp, 0));
      }
      wave.geometry.dispose();
      wave.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
  }

  // ==========================================
  // 6. RADIOACTIVE DECAY & NUCLEAR PHYSICS
  // ==========================================
  private setupRadioactivity(ctx: SimRenderContext) {
    const cluster = new THREE.Group();
    cluster.name = 'rad-nuclei-cluster';
    this.objectsGroup.add(cluster);

    const emitted = new THREE.Group();
    emitted.name = 'rad-emitted-rays';
    this.objectsGroup.add(emitted);
  }

  private updateRadioactivity(ctx: SimRenderContext) {
    const { initialNuclei = 1000, halfLife = 5, decayType = 0 } = ctx.params;
    const lambda = Math.LN2 / halfLife;
    const remainingFraction = Math.exp(-lambda * ctx.simTime);

    const cluster = this.objectsGroup.getObjectByName('rad-nuclei-cluster') as THREE.Group;
    if (cluster && cluster.children.length === 0) {
      // Build 3D lattice of 64 sample nuclei
      const totalVisual = 64;
      for (let i = 0; i < totalVisual; i++) {
        const nGeo = new THREE.SphereGeometry(0.35, 12, 12);
        const nMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
        const nucleus = new THREE.Mesh(nGeo, nMat);
        const radius = 2.5 * Math.cbrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        nucleus.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        nucleus.userData = { decayThreshold: i / totalVisual };
        cluster.add(nucleus);
      }
    }

    if (cluster) {
      cluster.children.forEach((n) => {
        const mesh = n as THREE.Mesh;
        if (mesh.userData.decayThreshold > remainingFraction) {
          (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x06b6d4); // decayed daughter
        } else {
          (mesh.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b); // parent
        }
      });
    }
  }

  // ==========================================
  // 7. HEAT TRANSFER & RADIATION LAWS
  // ==========================================
  private setupHeatRadiation(ctx: SimRenderContext) {
    // Radiating Blackbody Core
    const sphereGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const radiator = new THREE.Mesh(sphereGeo, sphereMat);
    radiator.name = 'ht-radiator';
    this.objectsGroup.add(radiator);

    // Thermal Wave Emission Ripples Group
    const waves = new THREE.Group();
    waves.name = 'ht-waves';
    this.objectsGroup.add(waves);
  }

  private updateHeatRadiation(ctx: SimRenderContext) {
    const { bodyTemp = 1500, emissivity = 0.8 } = ctx.params;

    const radiator = this.objectsGroup.getObjectByName('ht-radiator') as THREE.Mesh;
    if (radiator) {
      let hexColor = 0x991b1b;
      if (bodyTemp > 4500) hexColor = 0xbae6fd; // Blue-white hot
      else if (bodyTemp > 3000) hexColor = 0xfef08a; // Yellow hot
      else if (bodyTemp > 1200) hexColor = 0xf97316; // Orange hot
      else hexColor = 0xef4444; // Red hot

      (radiator.material as THREE.MeshStandardMaterial).color.setHex(hexColor);
      (radiator.material as THREE.MeshStandardMaterial).emissive.setHex(hexColor);
      (radiator.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.min(2.0, (bodyTemp / 2000) * emissivity);
    }

    const waves = this.objectsGroup.getObjectByName('ht-waves') as THREE.Group;
    if (waves) {
      while (waves.children.length > 0) {
        this.disposeObject(waves.children[0]);
        waves.remove(waves.children[0]);
      }

      const numRipples = 6;
      for (let i = 0; i < numRipples; i++) {
        const phase = (ctx.simTime * 2 + i * 0.8) % 4.0;
        const radius = 2.5 + phase * 2.5;
        const ringGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 36);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: Math.max(0, 1 - phase / 4.0),
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        waves.add(ring);
      }
    }
  }

  private setupDefault() {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    this.objectsGroup.add(new THREE.Mesh(geo, mat));
  }
}
