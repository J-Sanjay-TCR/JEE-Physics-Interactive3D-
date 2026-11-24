import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Latex } from './Latex';
import { Sparkles, AlertTriangle, Lightbulb, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedCode(text);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Split content by major block structures: fenced code blocks, block math ($$...$$ or \[...\]), blockquotes, headers, lists, paragraphs
  const parsedElements = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const elements: Array<{
      type: 'header' | 'blockquote' | 'math-block' | 'code-block' | 'list-item' | 'paragraph' | 'derivation-step';
      level?: number;
      text: string;
      subtype?: 'trap' | 'shortcut' | 'info';
    }> = [];

    let inBlockMath = false;
    let blockMathBuffer: string[] = [];
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle fenced code blocks ```...```
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockBuffer = [];
        } else {
          elements.push({
            type: 'code-block',
            text: codeBlockBuffer.join('\n'),
          });
          inCodeBlock = false;
          codeBlockBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        continue;
      }

      // Check for standalone single-line $$...$$
      if (!inBlockMath && trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
        elements.push({
          type: 'math-block',
          text: trimmed.slice(2, -2).trim(),
        });
        continue;
      }

      // Multi-line $$ block math start
      if (!inBlockMath && trimmed.startsWith('$$')) {
        inBlockMath = true;
        blockMathBuffer = [trimmed.slice(2)];
        continue;
      }

      if (inBlockMath) {
        if (trimmed.endsWith('$$')) {
          blockMathBuffer.push(trimmed.slice(0, -2));
          elements.push({
            type: 'math-block',
            text: blockMathBuffer.join('\n').trim(),
          });
          inBlockMath = false;
          blockMathBuffer = [];
        } else {
          blockMathBuffer.push(line);
        }
        continue;
      }

      if (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length >= 4) {
        elements.push({
          type: 'math-block',
          text: trimmed.slice(2, -2).trim(),
        });
        continue;
      }

      if (!trimmed) {
        continue;
      }

      // Check for Step 1, Step 2, etc. in derivation
      const stepMatch = trimmed.match(/^(?:###\s*)?(?:Step\s*(\d+)[:.]|(\d+)\.\s*(?:Step[:.]\s*)?)\s*(.*)/i);
      if (stepMatch && (trimmed.toLowerCase().includes('step') || trimmed.toLowerCase().includes('derivation'))) {
        elements.push({
          type: 'derivation-step',
          level: parseInt(stepMatch[1] || stepMatch[2] || '1', 10),
          text: trimmed.replace(/^###\s*/, ''),
        });
        continue;
      }

      // Headers (#, ##, ###)
      if (trimmed.startsWith('### ')) {
        elements.push({ type: 'header', level: 3, text: trimmed.slice(4) });
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push({ type: 'header', level: 2, text: trimmed.slice(3) });
        continue;
      }
      if (trimmed.startsWith('# ')) {
        elements.push({ type: 'header', level: 1, text: trimmed.slice(2) });
        continue;
      }

      // Blockquotes (e.g. > **Trap Alert:** or > **Shortcut:**)
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s*/, '');
        let subtype: 'trap' | 'shortcut' | 'info' = 'info';
        if (/trap|warning|danger|caution/i.test(quoteText)) subtype = 'trap';
        else if (/shortcut|trick|tip|pro-tip|key/i.test(quoteText)) subtype = 'shortcut';

        elements.push({ type: 'blockquote', text: quoteText, subtype });
        continue;
      }

      // List items (- or * or 1.)
      if (/^[-*]\s+/.test(trimmed)) {
        elements.push({ type: 'list-item', text: trimmed.replace(/^[-*]\s+/, '') });
        continue;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        elements.push({ type: 'list-item', text: trimmed.replace(/^\d+\.\s+/, '') });
        continue;
      }

      // Default paragraph
      elements.push({ type: 'paragraph', text: line });
    }

    // Flush any unclosed streaming block math / code block at EOF so nothing is dropped during live streaming
    if (inBlockMath && blockMathBuffer.length > 0) {
      const residual = blockMathBuffer.join('\n').trim();
      if (residual) {
        elements.push({ type: 'math-block', text: residual });
      }
    }
    if (inCodeBlock && codeBlockBuffer.length > 0) {
      elements.push({ type: 'code-block', text: codeBlockBuffer.join('\n') });
    }

    return elements;
  }, [content]);

  // Always pass inline spans through <Latex> so inline math, bold/italic, and physics prose notations render cleanly
  const renderInlineFormatted = (text: string) => {
    return <Latex className="inline">{text}</Latex>;
  };

  return (
    <div className={`space-y-2.5 text-xs text-zinc-300 leading-relaxed font-sans ${className}`}>
      {parsedElements.map((el, idx) => {
        switch (el.type) {
          case 'header':
            if (el.level === 1) {
              return (
                <h2
                  key={idx}
                  className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300 pt-2 pb-1 border-b border-white/[0.08]"
                >
                  {renderInlineFormatted(el.text)}
                </h2>
              );
            }
            if (el.level === 2) {
              return (
                <h3
                  key={idx}
                  className="text-xs sm:text-sm font-bold text-cyan-300 pt-2 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{renderInlineFormatted(el.text)}</span>
                </h3>
              );
            }
            return (
              <h4 key={idx} className="text-xs font-bold text-indigo-300 pt-1">
                {renderInlineFormatted(el.text)}
              </h4>
            );

          case 'derivation-step':
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#141420] border border-indigo-500/25 my-1.5 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[11px] font-bold shrink-0">
                    {el.level || '✓'}
                  </span>
                  <span className="text-xs font-bold text-zinc-100">{renderInlineFormatted(el.text)}</span>
                </div>
              </div>
            );

          case 'math-block':
            return (
              <div
                key={idx}
                className="relative group my-2 p-3.5 rounded-xl bg-[#13131D] border border-cyan-500/30 shadow-md text-center overflow-x-auto"
              >
                <Latex math={el.text} displayMode className="text-cyan-200 text-xs sm:text-sm" />
                <button
                  type="button"
                  onClick={() => handleCopy(el.text)}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/40 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                  title="Copy LaTeX formula"
                >
                  {copiedCode === el.text ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            );

          case 'code-block':
            return (
              <div
                key={idx}
                className="relative group my-2 p-3 rounded-xl bg-[#0D0E16] border border-white/[0.08] font-mono text-[11px] text-cyan-200 overflow-x-auto"
              >
                <pre className="whitespace-pre-wrap break-words">{el.text}</pre>
                <button
                  type="button"
                  onClick={() => handleCopy(el.text)}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/50 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                  title="Copy snippet"
                >
                  {copiedCode === el.text ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            );

          case 'blockquote':
            if (el.subtype === 'trap') {
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200/90 text-xs flex items-start gap-2.5 my-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed min-w-0 flex-1">{renderInlineFormatted(el.text)}</div>
                </div>
              );
            }
            if (el.subtype === 'shortcut') {
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200/90 text-xs flex items-start gap-2.5 my-2"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed min-w-0 flex-1">{renderInlineFormatted(el.text)}</div>
                </div>
              );
            }
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#14141E] border-l-2 border-cyan-400 text-zinc-300 text-xs my-2 italic"
              >
                {renderInlineFormatted(el.text)}
              </div>
            );

          case 'list-item':
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0 leading-relaxed">{renderInlineFormatted(el.text)}</div>
              </div>
            );

          case 'paragraph':
          default:
            return (
              <p key={idx} className="leading-relaxed">
                {renderInlineFormatted(el.text)}
              </p>
            );
        }
      })}
    </div>
  );
};
