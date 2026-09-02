const fs = require('fs');
let code = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

const regex = /\/\/ Wave Trough \(-A[\s\S]*?secondaryWaveGroup\.add\(tRing2\);\n\s*\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', code);
console.log('Removed troughs!');
