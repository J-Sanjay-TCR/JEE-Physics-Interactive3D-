const fs = require('fs');
let code = fs.readFileSync('src/components/ui/JeeWeightageAnalyticsModal.tsx', 'utf8');

// Fix the \` and \${
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\${/g, '${');

fs.writeFileSync('src/components/ui/JeeWeightageAnalyticsModal.tsx', code);
console.log('Fixed JSX syntax');
