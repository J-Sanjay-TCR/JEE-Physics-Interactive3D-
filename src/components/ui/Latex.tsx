import React, { useMemo } from 'react';
import katex from 'katex';
import { formatToStandardLatexMath } from '../../utils/latexPreprocessor';

interface LatexProps {
  children?: string;
  math?: string;
  displayMode?: boolean;
  block?: boolean;
  className?: string;
}

/**
 * Maps raw Unicode Greek and math symbols into LaTeX inline expressions
 * for rich inline text rendering in descriptions, shortcuts, and exam traps.
 */
function enrichTextMathTokens(text: string): string {
  if (!text) return '';

  let enriched = text;

  // Greek characters -> $\cmd$
  const greekInlineMap: Record<string, string> = {
    'θ': '$\\theta$',
    'Θ': '$\\Theta$',
    'ω': '$\\omega$',
    'Ω': '$\\Omega$',
    'λ': '$\\lambda$',
    'Λ': '$\\Lambda$',
    'α': '$\\alpha$',
    'β': '$\\beta$',
    'γ': '$\\gamma$',
    'Γ': '$\\Gamma$',
    'δ': '$\\delta$',
    'Δ': '$\\Delta$',
    'ε': '$\\varepsilon$',
    'μ': '$\\mu$',
    'ν': '$\\nu$',
    'ρ': '$\\rho$',
    'σ': '$\\sigma$',
    'Σ': '$\\Sigma$',
    'τ': '$\\tau$',
    'φ': '$\\phi$',
    'Φ': '$\\Phi$',
    'ψ': '$\\psi$',
    'Ψ': '$\\Psi$',
    'η': '$\\eta$',
    'π': '$\\pi$',
    'Π': '$\\Pi$',
  };

  for (const [char, repl] of Object.entries(greekInlineMap)) {
    if (enriched.includes(char)) {
      enriched = enriched.split(char).join(repl);
    }
  }

  // Degrees: 45° -> $45^\circ$
  enriched = enriched.replace(/(\d+)°/g, '$$$1^\\circ$$');

  // Multi-character superscripts: ⁻¹, ⁻², ⁻³
  enriched = enriched
    .replace(/⁻¹/g, '$^{-1}$')
    .replace(/⁻²/g, '$^{-2}$')
    .replace(/⁻³/g, '$^{-3}$')
    .replace(/²/g, '$^2$')
    .replace(/³/g, '$^3$');

  return enriched;
}

function sanitizeKatexHtml(html: string): string {
  // Replace jarring bright red error font (#cc0000) with a visually appealing, luminous cyan accent
  return html.replace(/#cc0000/gi, '#38bdf8');
}

export const Latex: React.FC<LatexProps> = ({
  children,
  math,
  displayMode = false,
  block = false,
  className = '',
}) => {
  const isDisplay = displayMode || block;
  const rawInput = (math !== undefined ? math : children) || '';

  const renderedContent = useMemo(() => {
    const text = String(rawInput).trim();
    if (!text) return '';

    // Case 1: Environment equations like \begin{equation}...\end{equation}
    if (/^\\begin\{equation\*?\}[\s\S]*\\end\{equation\*?\}$/.test(text) ||
        /^\\begin\{align\*?\}[\s\S]*\\end\{align\*?\}$/.test(text)) {
      const inner = formatToStandardLatexMath(text);
      try {
        const out = katex.renderToString(inner, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return sanitizeKatexHtml(out);
      } catch {
        return text;
      }
    }

    // Case 2: Pure standalone formula wrapped in $$...$$ or \[...\]
    if ((text.startsWith('$$') && text.endsWith('$$') && text.length >= 4) ||
        (text.startsWith('\\[') && text.endsWith('\\]') && text.length >= 4)) {
      const formula = text.slice(2, -2).trim();
      const inner = formatToStandardLatexMath(formula);
      try {
        const out = katex.renderToString(inner, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return sanitizeKatexHtml(out);
      } catch {
        return formula;
      }
    }

    // Case 3: Pure standalone formula wrapped in $...$ or \(...\) with no text outside
    if ((text.startsWith('$') && text.endsWith('$') && text.length >= 2 && !text.slice(1, -1).includes('$')) ||
        (text.startsWith('\\(') && text.endsWith('\\)') && text.length >= 4 && !text.slice(2, -2).includes('\\('))) {
      const formula = text.startsWith('$') ? text.slice(1, -1).trim() : text.slice(2, -2).trim();
      const inner = formatToStandardLatexMath(formula);
      try {
        const out = katex.renderToString(inner, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        });
        return sanitizeKatexHtml(out);
      } catch {
        return formula;
      }
    }

    // Check if string contains math delimiters or needs Greek symbol enrichment
    const enrichedText = enrichTextMathTokens(text);
    const hasMathDelimiters = enrichedText.includes('$') ||
                              enrichedText.includes('\\(') ||
                              enrichedText.includes('\\[') ||
                              enrichedText.includes('$$');

    // Case 4: Text with embedded math delimiters ($...$, $$...$$, \(...\), \[...\])
    if (hasMathDelimiters) {
      const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
      const parts = enrichedText.split(regex);

      const htmlChunks = parts.map((part) => {
        if (!part) return '';

        const isBlockMath = (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) ||
                            (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4);
        const isInlineMath = (part.startsWith('$') && part.endsWith('$') && part.length >= 2) ||
                             (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4);

        if (isBlockMath || isInlineMath) {
          let formula = part;
          if (part.startsWith('$$') && part.endsWith('$$')) formula = part.slice(2, -2).trim();
          else if (part.startsWith('\\[') && part.endsWith('\\]')) formula = part.slice(2, -2).trim();
          else if (part.startsWith('$') && part.endsWith('$')) formula = part.slice(1, -1).trim();
          else if (part.startsWith('\\(') && part.endsWith('\\)')) formula = part.slice(2, -2).trim();

          const cleanFormula = formatToStandardLatexMath(formula);
          try {
            const out = katex.renderToString(cleanFormula, {
              displayMode: isBlockMath || isDisplay,
              throwOnError: false,
              strict: false,
            });
            return sanitizeKatexHtml(out);
          } catch {
            return `<span class="katex-fallback font-mono text-cyan-300">${cleanFormula}</span>`;
          }
        }

        // Regular text segment: escape HTML entities, support Markdown formatting (**bold**, *italic*, \n)
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
          .replace(/\n\n/g, '<br /><br />')
          .replace(/\n/g, '<br />');
      });

      return htmlChunks.join('');
    }

    // Case 5: Pure LaTeX macro without delimiters (e.g. \frac{1}{2}mv^2 or E = mc^2)
    // Only if it doesn't look like English prose (no long words with spaces)
    const words = text.split(/\s+/);
    const looksLikeProse = words.length > 3 && words.some((w) => /^[a-zA-Z]{4,}$/.test(w));

    if (!looksLikeProse && (text.startsWith('\\') || text.includes('^') || text.includes('_') || text.includes('='))) {
      const cleanFormula = formatToStandardLatexMath(text);
      try {
        const out = katex.renderToString(cleanFormula, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        });
        return sanitizeKatexHtml(out);
      } catch {
        // Fall back to text
      }
    }

    // Default Case: Regular prose text
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '<br /><br />')
      .replace(/\n/g, '<br />');
  }, [rawInput, isDisplay]);

  if (!rawInput.trim()) return null;

  return (
    <span
      className={`latex-container ${isDisplay ? 'my-2 block text-center' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};
