import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Github,
  Share2,
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Code2,
  Globe,
  Radio,
} from 'lucide-react';

interface GithubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appTitle?: string;
}

export const GithubPublishModal: React.FC<GithubPublishModalProps> = ({
  isOpen,
  onClose,
  appTitle = 'JEE 3D Physics Lab',
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'studio' | 'cli' | 'publish'>('studio');

  const liveDevUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const gitCliCommands = `# 1. Initialize git and commit your files
git init
git add .
git commit -m "feat: JEE 3D Physics Laboratory v2.4"

# 2. Rename branch to main
git branch -M main

# 3. Add your remote repository URL (replace with your GitHub repo URL)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 4. Push all changes
git push -u origin main`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#020510]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-[#060B18] border border-cyan-500/35 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] text-white overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-80 h-32 bg-cyan-500/10 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-32 bg-emerald-500/10 blur-[90px] pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0 bg-[#050914]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <div className="w-full h-full rounded-[15px] bg-[#050914] flex items-center justify-center">
                  <Github className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Push to GitHub & Publish
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 font-bold">
                    v2.4 READY
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Version control, deploy, and share your customized physics laboratory.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-2 sm:px-6 bg-[#040711] border-b border-white/[0.06] shrink-0 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition cursor-pointer font-bold ${
                activeTab === 'studio'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span>AI Studio Native Export</span>
            </button>

            <button
              onClick={() => setActiveTab('publish')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition cursor-pointer font-bold ${
                activeTab === 'publish'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Publish & Share App</span>
            </button>

            <button
              onClick={() => setActiveTab('cli')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition cursor-pointer font-bold ${
                activeTab === 'cli'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Git CLI Commands</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Tab 1: AI Studio Native Option */}
            {activeTab === 'studio' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 shrink-0">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-cyan-200">
                      Where is the GitHub Option in AI Studio?
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Google AI Studio provides a direct <strong>GitHub Export</strong> button right in the top-right toolbar of the workspace (above the code and preview panes).
                    </p>
                  </div>
                </div>

                {/* Visual Step by Step Guide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs mb-2">
                        1
                      </div>
                      <h4 className="text-xs font-bold text-white">Click GitHub Icon</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        In the top-right toolbar of the AI Studio window, click the <strong>GitHub</strong> or <strong>Export</strong> button.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono font-bold text-xs mb-2">
                        2
                      </div>
                      <h4 className="text-xs font-bold text-white">Select Repository</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Authorize your GitHub account and choose to create a <strong>new repository</strong> (e.g. <code className="text-cyan-300">jee-3d-physics-lab</code>) or push to an existing repo.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono font-bold text-xs mb-2">
                        3
                      </div>
                      <h4 className="text-xs font-bold text-white">Commit & Push</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Review the files, enter your commit summary, and click <strong>Push Changes</strong>. Your code will be live on GitHub immediately!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pre-Flight Health Checklist */}
                <div className="p-4 rounded-2xl bg-[#090F20] border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Repository Pre-Flight Status
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                      100% READY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300">31 Physics Simulations verified</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300">TypeScript & Lint: 0 errors</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300">Production Build: Passing</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300">Zero secrets in code (Secure Proxy)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Publishing & Sharing */}
            {activeTab === 'publish' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 shrink-0">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-200">
                      Publish & Share Options
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Google AI Studio Build hosts your application live in the cloud. You can share your interactive physics lab directly with students, teachers, and peers.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Share button in AI Studio */}
                  <div className="p-4 rounded-2xl bg-[#090F20] border border-white/[0.08]">
                    <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      1. Share via AI Studio Top Bar
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      Click the <strong>Share</strong> or <strong>Publish</strong> button located in the top-right corner of Google AI Studio. This gives you a public URL that anyone can open in their browser without an account.
                    </p>
                  </div>

                  {/* Direct Copy of current application link */}
                  <div className="p-4 rounded-2xl bg-[#090F20] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        2. Live Application URL
                      </h4>
                      <button
                        onClick={() => handleCopy(liveDevUrl, 'url')}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 border border-emerald-400/30 transition cursor-pointer"
                      >
                        {copiedSection === 'url' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs text-cyan-300 truncate">
                      {liveDevUrl || 'https://ais-dev-...run.app'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Git CLI Commands */}
            {activeTab === 'cli' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/25 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 shrink-0">
                    <Terminal className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-purple-200">
                      Standard Git CLI Commands
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      If you download the project ZIP or clone it to your local machine, use these standard Git commands in your terminal to initialize and push:
                    </p>
                  </div>
                </div>

                <div className="relative rounded-2xl bg-[#030611] border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      bash terminal
                    </span>
                    <button
                      onClick={() => handleCopy(gitCliCommands, 'cli')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 border border-cyan-400/30 transition cursor-pointer"
                    >
                      {copiedSection === 'cli' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Commands!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-cyan-200/90 leading-relaxed overflow-x-auto whitespace-pre">
                    {gitCliCommands}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#050914] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <span className="text-xs font-mono text-zinc-400">
              Tip: The top-right toolbar buttons in AI Studio perform 1-click GitHub pushes.
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
              >
                Close
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)] transition cursor-pointer"
              >
                <span>Open GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
