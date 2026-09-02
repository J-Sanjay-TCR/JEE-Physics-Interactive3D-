const fs = require('fs');
let code = fs.readFileSync('src/components/ui/TrendAnalysisChart.tsx', 'utf8');

// Fix the \` and \${
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\${/g, '${');

fs.writeFileSync('src/components/ui/TrendAnalysisChart.tsx', code);
console.log('Fixed JSX syntax in TrendAnalysisChart');
