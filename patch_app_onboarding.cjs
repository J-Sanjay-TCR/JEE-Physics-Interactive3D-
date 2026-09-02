const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { OnboardingScreen }')) {
    code = code.replace(/import \{ MobileNavBottomSheet \} from '\.\/components\/ui\/MobileNavBottomSheet';/, "import { MobileNavBottomSheet } from './components/ui/MobileNavBottomSheet';\nimport { OnboardingScreen } from './components/ui/OnboardingScreen';");
}

if (!code.includes('const [userName, setUserName]')) {
    code = code.replace(/const \[currentConcept, setCurrentConcept\] = useState<PhysicsConcept>\(ALL_CONCEPTS\[0\]\);/, "const [userName, setUserName] = useState<string>(() => localStorage.getItem('ai_physics_user_name') || '');\n  const [currentConcept, setCurrentConcept] = useState<PhysicsConcept>(ALL_CONCEPTS[0]);");
}

code = code.replace(/<AiPhysicsTutorModal\n\s*isOpen=\{isAiTutorOpen\}\n\s*onClose=\{\(\) => setIsAiTutorOpen\(false\)\}\n\s*currentConcept=\{currentConcept\}\n\s*currentParams=\{paramValues\}\n\s*\/>/, 
`<AiPhysicsTutorModal
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        currentConcept={currentConcept}
        currentParams={paramValues}
        userName={userName}
      />`);

// Insert OnboardingScreen at the very top of return inside the main div if userName is empty
const insertionRegex = /<div className="min-h-screen bg-\[\#070709\] text-zinc-100 font-sans selection:bg-indigo-500\/30">/;
if (code.match(insertionRegex)) {
    code = code.replace(insertionRegex, `<div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-indigo-500/30">\n      {!userName && (\n        <OnboardingScreen \n          onComplete={(name) => {\n            localStorage.setItem('ai_physics_user_name', name);\n            setUserName(name);\n          }}\n        />\n      )}`);
}

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx');
