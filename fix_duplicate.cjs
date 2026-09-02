const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AiPhysicsTutorModal.tsx', 'utf8');

code = code.replace(/ Welcome to the deep dive on \*\*[^]*?\*\*! Welcome to the deep dive on \*\*[^]*?\*\*!/, (match) => {
    return match.replace(/ Welcome to the deep dive on \*\*.*?\*\*!/, '');
});

fs.writeFileSync('src/components/ui/AiPhysicsTutorModal.tsx', code);
console.log('Fixed duplicate');
