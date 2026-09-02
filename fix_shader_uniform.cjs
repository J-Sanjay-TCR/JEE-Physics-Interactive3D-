const fs = require('fs');
let code = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

const regex = /const shaderMat = new THREE\.ShaderMaterial\(\{[\s\S]*?side: THREE\.DoubleSide\n\s*\}\);/;

const replacement = `const shaderMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: ctx.simTime * 2.0 },
          uColor: { value: new THREE.Color(spectral.threeColor) },
          uS1: { value: new THREE.Vector2(0.0, s1_pos.y) },
          uS2: { value: new THREE.Vector2(0.0, s2_pos.y) },
          uK: { value: 20.0 }, // Wavenumber
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
      });`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', code);
console.log('Shader uniform replaced successfully!');
