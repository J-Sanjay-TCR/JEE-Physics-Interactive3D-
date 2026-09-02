const fs = require('fs');
let code = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

const regex = /\/\/ 6\. Render Realistic Interference Pattern Shader[\s\S]*?secondaryWaveGroup\.add\(plane\);\n\s*\}/;

const replacement = `// 6. Render Realistic Interference Pattern Shader
    const secondaryWaveGroup = this.objectsGroup.getObjectByName('ydse-secondary-waves') as THREE.Group;
    if (secondaryWaveGroup) {
      const propagationDistance = screenX - x_s12;
      let plane = secondaryWaveGroup.getObjectByName('ydse-interference-plane') as THREE.Mesh;
      
      if (!plane) {
        // Initialize once
        const planeGeo = new THREE.PlaneGeometry(1, 8.0);
        const shaderMat = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(spectral.threeColor) },
            uS1: { value: new THREE.Vector2(0.0, s1_pos.y) },
            uS2: { value: new THREE.Vector2(0.0, s2_pos.y) },
            uK: { value: 20.0 },
            uWaveSpeed: { value: 15.0 },
            uPropDist: { value: propagationDistance }
          },
          vertexShader: \`
            varying vec2 vUv;
            varying vec2 vWorldPos;
            uniform float uPropDist;
            void main() {
              vUv = uv;
              vWorldPos = vec2(uv.x * uPropDist, uv.y * 8.0 - 4.0 + 0.5);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          \`,
          fragmentShader: \`
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec2 uS1;
            uniform vec2 uS2;
            uniform float uK;
            uniform float uWaveSpeed;
            uniform float uPropDist;
            varying vec2 vUv;
            varying vec2 vWorldPos;

            void main() {
              float d1 = distance(vWorldPos, uS1);
              float d2 = distance(vWorldPos, uS2);
              
              float phase1 = uK * d1 - uWaveSpeed * uTime;
              float phase2 = uK * d2 - uWaveSpeed * uTime;
              
              float amp1 = cos(phase1) / (sqrt(d1) + 0.1);
              float amp2 = cos(phase2) / (sqrt(d2) + 0.1);
              
              float A = amp1 + amp2;
              float I = A * A * 0.25;
              
              float fadeX = smoothstep(0.0, 0.5, vWorldPos.x) * smoothstep(uPropDist, uPropDist - 0.5, vWorldPos.x);
              float cone = smoothstep(3.5, 0.0, abs(vWorldPos.y - 0.5) - vWorldPos.x * 0.2);

              gl_FragColor = vec4(uColor, I * fadeX * cone * 0.8);
            }
          \`,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        plane = new THREE.Mesh(planeGeo, shaderMat);
        plane.name = 'ydse-interference-plane';
        secondaryWaveGroup.add(plane);
      }

      // Update uniforms and scale every frame instead of recompiling
      plane.scale.set(propagationDistance, 1, 1);
      plane.position.set(x_s12 + propagationDistance / 2, 0.5, 0);
      
      const mat = plane.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = ctx.simTime * 2.0;
      mat.uniforms.uColor.value.copy(spectral.threeColor);
      mat.uniforms.uS1.value.set(0.0, s1_pos.y);
      mat.uniforms.uS2.value.set(0.0, s2_pos.y);
      mat.uniforms.uPropDist.value = propagationDistance;
      // Adjust K based on wavelength to show correct interference spacing visually!
      // beta = lambda * D / d. Visual spacing is determined by uK. 
      // Higher uK = more fringes.
      mat.uniforms.uK.value = Math.max(10.0, Math.min(60.0, (d_3D / 1.0) * 20.0));
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', code);
console.log('Shader reuse replaced successfully!');
