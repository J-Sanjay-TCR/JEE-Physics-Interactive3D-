const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
const searchStr = '{/* Top Navigation Header */}';
const replaceStr = `{!userName && (
        <OnboardingScreen 
          onComplete={(name) => {
            localStorage.setItem('ai_physics_user_name', name);
            setUserName(name);
          }}
        />
      )}
      {/* Top Navigation Header */}`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Fixed onboarding injection');
} else {
    console.log('Could not find search string');
}
