const fs = require('fs');

let code = fs.readFileSync('src/components/ui/HomePage.tsx', 'utf8');

// Add onOpenAnalytics to interface
code = code.replace(
    /onOpenTutorial: \(\) => void;/,
    "onOpenTutorial: () => void;\n  onOpenAnalytics: () => void;"
);

// Destructure onOpenAnalytics
code = code.replace(
    /onOpenTutorial,\n\s*completedConcepts,/,
    "onOpenTutorial,\n  onOpenAnalytics,\n  completedConcepts,"
);

// Add the button
const analyticsBtn = `
            <button
              onClick={onOpenAnalytics}
              className={\`px-4 py-3 rounded-2xl border font-black text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] \${
                isCyberpunk
                  ? 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : isDark
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
              }\`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Global JEE Analytics</span>
            </button>`;

code = code.replace(
    /<\/button>\n\s*<button\n\s*onClick=\{onOpenTutorial\}/,
    `</button>\n${analyticsBtn}\n            <button\n              onClick={onOpenTutorial}`
);

fs.writeFileSync('src/components/ui/HomePage.tsx', code);
console.log('Patched HomePage.tsx');
