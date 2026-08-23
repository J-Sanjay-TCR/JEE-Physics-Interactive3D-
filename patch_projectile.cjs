const fs = require('fs');

let fileContent = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

const regex = /private updateProjectile\(ctx: SimRenderContext\) \{([\s\S]*?)private updateInclinedPlane/g;
const match = regex.exec(fileContent);

if (!match) {
  console.log('Could not find updateProjectile');
  process.exit(1);
}

const newUpdateProjectile = `private updateProjectile(ctx: SimRenderContext) {
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
`;

fileContent = fileContent.replace(regex, newUpdateProjectile + '\n  private updateInclinedPlane');

fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', fileContent);
