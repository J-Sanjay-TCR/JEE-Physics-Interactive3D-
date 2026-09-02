const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The broken string was:
// let systemInstruction = `...`;
// CORE PERSONALITY

code = code.replace(/let systemInstruction = `(.*?)`;\n\nCORE PERSONALITY/g, "let systemInstruction = `$1\n\nCORE PERSONALITY");

fs.writeFileSync('server.ts', code);
console.log('Fixed template literal');
