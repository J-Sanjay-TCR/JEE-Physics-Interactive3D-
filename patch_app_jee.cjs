const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('conceptTitle={currentConcept.title}')) {
    code = code.replace(
        "<JeeInsightsPanel\n                      jeeMain={currentConcept.jeeMain}\n                      jeeAdvanced={currentConcept.jeeAdvanced}\n                    />",
        "<JeeInsightsPanel\n                      jeeMain={currentConcept.jeeMain}\n                      jeeAdvanced={currentConcept.jeeAdvanced}\n                      conceptTitle={currentConcept.title}\n                    />"
    );
    fs.writeFileSync('src/App.tsx', code);
    console.log('Patched App.tsx for conceptTitle');
} else {
    console.log('App.tsx already has conceptTitle');
}
