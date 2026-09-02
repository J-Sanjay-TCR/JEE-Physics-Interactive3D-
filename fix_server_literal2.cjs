const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /let systemInstruction = `You are the brilliant, witty, and infectious female AI physics tutor, hosting a live breakdown for the 'JEE 3D Physics Lab'\.\n\nCORE PERSONALITY/;
const replacement = `let systemInstruction = \`You are the brilliant, witty, and infectious female AI physics tutor, hosting a live breakdown for the 'JEE 3D Physics Lab'. \${userName ? \`The student you are talking to is named \${userName}. Address them warmly by their name in your responses and personalize answers for them.\` : ''}\n\nCORE PERSONALITY`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
console.log('Fixed second occurrence');
