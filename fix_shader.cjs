const fs = require('fs');
let code = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

const regex = /\/\/ 6\. Render Secondary Huygens Wavelets[\s\S]*?\/\/ 7\. Render Constructive Interference/;

const replacement = `// 6. Render Realistic Interference Pattern Shader
    const secondaryWaveGroup = this.objectsGroup.getObjectByName('ydse-secondary-waves') as THREE.Group;
    if (secondaryWaveGroup) {
      while (secondaryWaveGroup.children.length > 0) {
        this.disposeObject(secondaryWaveGroup.children[0]);
        secondaryWaveGroup.remove(secondaryWaveGroup.children[0]);
      }

      const propagationDistance = screenX - x_s12;
      
      const planeGeo = new THREE.PlaneGeometry(propagationDistance, 8.0);
      const shaderMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: ctx.simTime * 2.0 },
          uColor: { value: new THREE.Color(spectral.threeColor) },
          uS1: { value: new THREE.Vector2(0.0, s1_pos.y) },
          uS2: { value: new THREE.Vector2(0.0, s2_pos.y) },
          uK: { value: 20.0 }, // Wavenumber
          uWaveSpeed: { value: 15.0 }
        },
        vertexShader: \`
          varying vec2 vUv;
          varying vec2 vWorldPos;
          void main() {
            vUv = uv;
            // Map UV to local plane coordinates (0 to propagationDistance in X, and -4.0 to +4.0 in Y relative to center 0.5)
            vWorldPos = vec2(uv.x * \${propagationDistance.toFixed(4)}, uv.y * 8.0 - 4.0 + 0.5);
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
          varying vec2 vUv;
          varying vec2 vWorldPos;

          void main() {
            // Distances from slits to current point
            float d1 = distance(vWorldPos, uS1);
            float d2 = distance(vWorldPos, uS2);
            
            // Calculate wave amplitudes
            float phase1 = uK * d1 - uWaveSpeed * uTime;
            float phase2 = uK * d2 - uWaveSpeed * uTime;
            
            // Inverse square law for amplitude dropoff
            float amp1 = cos(phase1) / (sqrt(d1) + 0.1);
            float amp2 = cos(phase2) / (sqrt(d2) + 0.1);
            
            // Total amplitude
            float A = amp1 + amp2;
            
            // Intensity (A^2)
            float I = A * A * 0.25;
            
            // Fade out near the slits and edges to blend perfectly
            float fadeX = smoothstep(0.0, 0.5, vWorldPos.x) * smoothstep(\${propagationDistance.toFixed(4)}, \${(propagationDistance - 0.5).toFixed(4)}, vWorldPos.x);
            
            // Add a subtle envelope to restrict it to a forward cone
            float cone = smoothstep(3.5, 0.0, abs(vWorldPos.y - 0.5) - vWorldPos.x * 0.2);

            gl_FragColor = vec4(uColor, I * fadeX * cone * 0.8);
          }
        \`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const plane = new THREE.Mesh(planeGeo, shaderMat);
      // Position plane starting at slits and ending at screen
      plane.position.set(x_s12 + propagationDistance / 2, 0.5, 0);
      secondaryWaveGroup.add(plane);
    }

    // 7. Render Constructive Interference`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', code);
console.log('Shader replaced successfully!');
