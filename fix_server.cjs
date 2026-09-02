const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const \{\n\s*question,\n\s*conceptTitle,\n\s*currentParams,\n\s*thinkingMode = false,\n\s*enableWebSearch = false,\n\s*isVoiceInput = false,\n\s*\} = req\.body \|\| \{\};/;
const replacement = `const {
    question,
    conceptTitle,
    currentParams,
    thinkingMode = false,
    enableWebSearch = false,
    isVoiceInput = false,
    userName,
  } = req.body || {};`;
code = code.replace(regex, replacement);

const regex2 = /let systemInstruction = `You are the brilliant, witty, and infectious female AI physics tutor, hosting a live breakdown for the 'JEE 3D Physics Lab'\./;
const replacement2 = `let systemInstruction = \`You are the brilliant, witty, and infectious female AI physics tutor, hosting a live breakdown for the 'JEE 3D Physics Lab'. \${userName ? \`The student you are talking to is named \${userName}. Address them warmly by their name in your responses and personalize answers for them.\` : ''}\`;`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts');
