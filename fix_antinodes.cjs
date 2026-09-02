const fs = require('fs');
let code = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

code = code.replace(/opacity: 0\.85, linewidth: 2/g, 'opacity: 0.4, linewidth: 1');
code = code.replace(/opacity: 0\.45,/g, 'opacity: 0.25,');
code = code.replace(/opacity: 0\.3,/g, 'opacity: 0.1,');

fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', code);
console.log('Fixed antinodes opacity');
