const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes('JeeWeightageAnalyticsModal')) {
    code = code.replace(
        "import { CursorEffect } from './components/ui/CursorEffect';",
        "import { CursorEffect } from './components/ui/CursorEffect';\nimport { JeeWeightageAnalyticsModal } from './components/ui/JeeWeightageAnalyticsModal';"
    );
}

// 2. Add state
if (!code.includes('isAnalyticsOpen')) {
    code = code.replace(
        "const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);",
        "const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);\n  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);"
    );
}

// 3. Add to Sidebar props (in <Sidebar />)
code = code.replace(
    /<Sidebar\s+currentView={currentView}\s+onSetView=\{setCurrentView\}/g,
    "<Sidebar\n            currentView={currentView}\n            onSetView={setCurrentView}\n            onOpenAnalytics={() => setIsAnalyticsOpen(true)}"
);

// 4. Add to MobileNavBottomSheet
code = code.replace(
    /onOpenTutorial=\{\(\) => setIsTutorialOpen\(true\)\}/g,
    "onOpenTutorial={() => setIsTutorialOpen(true)}\n        onOpenAnalytics={() => setIsAnalyticsOpen(true)}"
);

// 5. Add Modal to root render
if (!code.includes('<JeeWeightageAnalyticsModal')) {
    code = code.replace(
        "{/* Global Keyboard Shortcuts Cheat Sheet Modal */}",
        `{/* JEE Weightage Analytics Modal */}\n      <JeeWeightageAnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />\n\n      {/* Global Keyboard Shortcuts Cheat Sheet Modal */}`
    );
}

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx with Analytics');
