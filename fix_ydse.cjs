const fs = require('fs');

let code = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

// 1. Remove primary wave Z-depths
let pWaveDepth = `          // 3D cylindrical wave sheet segment for depth in 3D orbit
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
          });`;
code = code.replace(pWaveDepth, '');

// 2. Remove secondary wave Z-depths
let sWaveDepth = `          // 3D Spatial Depth Arcs along Z-axis for physical cylindrical wave appearance
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
          });`;
code = code.replace(sWaveDepth, '');

// 3. Remove secondary wave troughs
let sWaveTroughs = `          // Wave Trough (-A, subtle dashed/dim ring halfway between crests)
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
          }`;
code = code.replace(sWaveTroughs, '');

// 4. Tone down opacity and reduce visual clutter of the crest rings
code = code.replace(/opacity: 0\.75 \* fade,/g, 'opacity: 0.4 * fade,');

// 5. Tone down antinodal lines
code = code.replace(/opacity: 0\.45,/g, 'opacity: 0.25,');
code = code.replace(/opacity: 0\.3,/g, 'opacity: 0.15,');

fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', code);
console.log('Cleaned up YDSE waves!');
