const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AiPhysicsTutorModal.tsx', 'utf8');
code = code.replace(/currentParams,\n\s*,\s*userName/g, 'currentParams,\n  userName');

fs.writeFileSync('src/components/ui/AiPhysicsTutorModal.tsx', code);
console.log('Fixed comma');
