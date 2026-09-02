const fs = require('fs');

let code = fs.readFileSync('src/components/ui/MobileNavBottomSheet.tsx', 'utf8');

code = code.replace(
    /onOpenTutorial: \(\) => void;/,
    "onOpenTutorial: () => void;\n  onOpenAnalytics: () => void;"
);

code = code.replace(
    /onOpenTutorial,\n\s*onEnterFocusMode,/,
    "onOpenTutorial,\n  onOpenAnalytics,\n  onEnterFocusMode,"
);

// Add the button in the settings/tools section in mobile nav
const buttonHtml = `
                <button
                  onClick={() => {
                    onOpenAnalytics();
                    setIsOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] active:bg-white/[0.05]"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Analytics</span>
                </button>
`;

code = code.replace(
    /onOpenShortcuts\(\);\n\s*setIsOpen\(false\);\n\s*\}\}\n\s*className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white\/\[0\.03\] border border-white\/\[0\.05\] active:bg-white\/\[0\.05\]"\n\s*>\n\s*<div className="w-10 h-10 rounded-full bg-amber-500\/20 text-amber-400 flex items-center justify-center">\n\s*<Command className="w-5 h-5" \/>\n\s*<\/div>\n\s*<span className="text-\[10px\] text-zinc-400 font-medium">Shortcuts<\/span>\n\s*<\/button>/,
    `onOpenShortcuts();
                    setIsOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] active:bg-white/[0.05]"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Command className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Shortcuts</span>
                </button>
${buttonHtml}`
);

fs.writeFileSync('src/components/ui/MobileNavBottomSheet.tsx', code);
console.log('Patched MobileNavBottomSheet');
