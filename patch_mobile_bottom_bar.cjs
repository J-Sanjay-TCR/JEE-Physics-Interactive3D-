const fs = require('fs');

let code = fs.readFileSync('src/components/ui/MobileNavBottomSheet.tsx', 'utf8');

// 1. Add Analytics to the HOME MODE BOTTOM NAVIGATION BAR
const analyticsHomeBtn = `
            {/* 6. Analytics */}
            <button
              onClick={onOpenAnalytics}
              className={\`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] \${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
              }\`}
            >
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Analytics</span>
            </button>
`;

code = code.replace(
    /<\/div>\n\s*<span className="text-\[10px\] mt-0\.5">AI Tutor<\/span>\n\s*<\/button>\n\s*<\/div>/,
    `</div>\n              <span className="text-[10px] mt-0.5">AI Tutor</span>\n            </button>\n${analyticsHomeBtn}\n          </div>`
);


// 2. Add Analytics to the LAB MODE BOTTOM HUD ACTION BAR
const analyticsLabBtn = `
            {/* 6. Analytics */}
            <button
              onClick={onOpenAnalytics}
              className={\`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-h-[48px] min-w-[56px] \${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">Analytics</span>
            </button>
`;

code = code.replace(
    /<\/div>\n\s*<span className="text-\[10px\] mt-0\.5">Home<\/span>\n\s*<\/button>\n\s*<\/div>\n\s*\)\}\n\s*<\/nav>/,
    `</div>\n              <span className="text-[10px] mt-0.5">Home</span>\n            </button>\n${analyticsLabBtn}\n          </div>\n        )}\n      </nav>`
);

fs.writeFileSync('src/components/ui/MobileNavBottomSheet.tsx', code);
console.log('Patched MobileNavBottomSheet.tsx');
