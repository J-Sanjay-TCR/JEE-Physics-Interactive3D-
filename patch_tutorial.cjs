const fs = require('fs');

let code = fs.readFileSync('src/components/ui/UserTutorialModal.tsx', 'utf8');

// 1. Change all "Step X of 7" to "Step X+1 of 8"
code = code.replace(/badge: 'Step 1 of 7'/g, "badge: 'Step 2 of 8'");
code = code.replace(/badge: 'Step 2 of 7'/g, "badge: 'Step 3 of 8'");
code = code.replace(/badge: 'Step 3 of 7'/g, "badge: 'Step 4 of 8'");
code = code.replace(/badge: 'Step 4 of 7'/g, "badge: 'Step 5 of 8'");
code = code.replace(/badge: 'Step 5 of 7'/g, "badge: 'Step 6 of 8'");
code = code.replace(/badge: 'Step 6 of 7'/g, "badge: 'Step 7 of 8'");
code = code.replace(/badge: 'Step 7 of 7'/g, "badge: 'Step 8 of 8'");

// 2. Insert the new Step 1
const newStep = `
    {
      id: 'step-ui-map',
      badge: 'Step 1 of 8',
      title: 'UI Layout & Button Map',
      subtitle: 'Never get lost. Here is a clear map of what every button on your screen does.',
      icon: Compass,
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-500/30',
      accentBg: 'bg-emerald-500/10 text-emerald-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            The workspace is divided into specific functional zones. Hover over or review the map below to understand where to find what you need.
          </p>

          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-[#0A0B12] rounded-xl border border-white/[0.1] overflow-hidden flex flex-col font-mono text-[10px]">
            {/* Top Bar Mockup */}
            <div className="h-8 border-b border-white/[0.1] flex items-center justify-between px-3 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-cyan-400 rounded-full" />
                </div>
                <span className="text-zinc-500">Left Menu / Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold animate-pulse">
                  AI Tutor Button
                </div>
                <div className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300">
                  Export PDF
                </div>
              </div>
            </div>

            {/* Main Area Mockup */}
            <div className="flex-1 flex relative">
              {/* Canvas Left Corner (Diagnostics) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <div className="px-2 py-1 rounded bg-zinc-800/80 border border-white/[0.1] text-zinc-400 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Forces / Vectors
                </div>
                <div className="px-2 py-1 rounded bg-zinc-800/80 border border-white/[0.1] text-zinc-400 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Live Data
                </div>
              </div>

              {/* Center Canvas */}
              <div className="flex-1 flex items-center justify-center relative">
                 <div className="w-16 h-16 rounded-full border border-dashed border-white/[0.1] flex items-center justify-center text-zinc-600 font-black tracking-widest uppercase">
                    3D SCENE
                 </div>
              </div>

              {/* Right/Bottom Controls Area Mockup */}
              <div className="w-32 sm:w-48 border-l border-white/[0.1] bg-white/[0.02] p-2 flex flex-col gap-2 relative">
                 <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Sim Controls</div>
                 <div className="h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center px-2 text-amber-400/80">
                    Sliders (Mass/Angle)
                 </div>
                 <div className="h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center px-2 text-amber-400/80">
                    Time/Speed
                 </div>
                 <div className="mt-auto flex gap-1">
                    <div className="flex-1 h-6 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                      Play/Pause
                    </div>
                 </div>
              </div>
            </div>

            {/* Bottom Bar Mockup */}
            <div className="h-8 border-t border-white/[0.1] flex items-center justify-center px-3 bg-white/[0.02] gap-2">
              <div className="w-16 h-1 bg-white/[0.1] rounded-full" />
              <div className="w-16 h-1 bg-cyan-500/50 rounded-full" />
              <div className="w-16 h-1 bg-white/[0.1] rounded-full" />
              <span className="text-[9px] text-zinc-600 absolute right-3">Topic Tabs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#181924] rounded-xl border border-white/[0.06] flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <strong className="text-zinc-200 block mb-0.5">Top-Right: AI & Export</strong>
                <p className="text-[11px] text-zinc-400">The glowing button opens the AI voice tutor. Next to it are PDF notes & formula sheets.</p>
              </div>
            </div>
            
            <div className="p-3 bg-[#181924] rounded-xl border border-white/[0.06] flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <strong className="text-zinc-200 block mb-0.5">Sidebar/Bottom: Controls</strong>
                <p className="text-[11px] text-zinc-400">Sliders for Mass, Angle, Friction, Play/Pause, and Speed (Slow-mo) controls.</p>
              </div>
            </div>

            <div className="p-3 bg-[#181924] rounded-xl border border-white/[0.06] flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <strong className="text-zinc-200 block mb-0.5">Canvas Top-Left: Toggles</strong>
                <p className="text-[11px] text-zinc-400">Toggle Force vectors, Trajectory lines, and live Data Overlays on the 3D scene.</p>
              </div>
            </div>

            <div className="p-3 bg-[#181924] rounded-xl border border-white/[0.06] flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div>
                <strong className="text-zinc-200 block mb-0.5">Bottom Edge: Navigation</strong>
                <p className="text-[11px] text-zinc-400">Tabs to switch between different physics topics (e.g. Projectile vs. Springs).</p>
              </div>
            </div>
          </div>
        </div>
      )
    },`;

code = code.replace(/const tutorialSteps = \[/, "const tutorialSteps = [\n" + newStep);

fs.writeFileSync('src/components/ui/UserTutorialModal.tsx', code);
console.log('Successfully patched UserTutorialModal');
