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
  // If already full of $ delimiters, let standard parser handle it
  if (text.includes('$$') || text.includes('\\(') || text.includes('\\[') || text.includes('\\begin{equation}')) {
    return text;
  }

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
    enriched = enriched.split(char).join(repl);
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

  // Subscripts: _max, _min
  enriched = enriched.replace(/_max\b/g, '$_{\\max}$');
  enriched = enriched.replace(/_min\b/g, '$_{\\min}$');

  return enriched;
}

export const Latex: React.FC<LatexProps> = ({
  children,
  math,
  displayMode = false,
  block = false,
  className = '',
}) => {
  const isDisplay = displayMode || block;
  const isExplicitMath = math !== undefined;
  const rawInput = (isExplicitMath ? math : children) || '';

  const renderedContent = useMemo(() => {
    const text = rawInput.trim();
    if (!text) return '';

    // If caller explicitly passed `math` prop, normalize into clean standard LaTeX and render
    if (isExplicitMath) {
      let formula = text;
      let display = isDisplay;

      if (formula.startsWith('$$') && formula.endsWith('$$') && formula.length >= 4) {
        formula = formula.slice(2, -2).trim();
        display = true;
      } else if (formula.startsWith('$') && formula.endsWith('$') && formula.length >= 2) {
        formula = formula.slice(1, -1).trim();
      } else if (formula.startsWith('\\(') && formula.endsWith('\\)')) {
        formula = formula.slice(2, -2).trim();
      } else if (formula.startsWith('\\[') && formula.endsWith('\\]')) {
        formula = formula.slice(2, -2).trim();
        display = true;
      } else if (formula.includes('\\begin{equation}') || formula.includes('\\begin{align}')) {
        display = true;
      }

      // Convert Unicode Greek, powers, fractions to standard LaTeX
      const cleanFormula = formatToStandardLatexMath(formula);

      try {
        return katex.renderToString(cleanFormula, {
          displayMode: display,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return text;
      }
    }

    // Check if the children string is a display equation environment
    if (/^\\begin\{equation\*?\}[\s\S]*\\end\{equation\*?\}$/.test(text)) {
      const inner = formatToStandardLatexMath(text);
      try {
        return katex.renderToString(inner, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return text;
      }
    }

    // Case 1: Children wrapped entirely in $$...$$
    if (text.startsWith('$$') && text.endsWith('$$') && text.length >= 4) {
      const inner = formatToStandardLatexMath(text.slice(2, -2).trim());
      try {
        return katex.renderToString(inner, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return inner;
      }
    }

    // Case 2: Children wrapped entirely in $...$
    if (text.startsWith('$') && text.endsWith('$') && text.length >= 2 && !text.slice(1, -1).includes('$')) {
      const inner = formatToStandardLatexMath(text.slice(1, -1).trim());
      try {
        return katex.renderToString(inner, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return inner;
      }
    }

    // Auto-enrich raw math symbols in text so KaTeX can render them
    const enrichedText = enrichTextMathTokens(text);

    // Case 3: Mixed text with embedded $...$ or $$...$$ or \(...\) or \[...\]
    if (enrichedText.includes('$') || enrichedText.includes('\\(') || enrichedText.includes('\\[') || enrichedText.includes('\\[')) {
      const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
      const parts = enrichedText.split(regex);

      const htmlChunks = parts.map((part) => {
        if (!part) return '';
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const formula = formatToStandardLatexMath(part.slice(2, -2).trim());
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        if (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4) {
          const formula = formatToStandardLatexMath(part.slice(2, -2).trim());
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const formula = formatToStandardLatexMath(part.slice(1, -1).trim());
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        if (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) {
          const formula = formatToStandardLatexMath(part.slice(2, -2).trim());
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        // Plain text segment - escape HTML while preserving all spaces
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      });

      return htmlChunks.join('');
    }

    // Case 4: Check if string is a pure LaTeX command sequence (e.g. "\frac{1}{2}" without $)
    const isPureMathMacro = text.startsWith('\\') || (
      !text.includes(' ') && (text.includes('^') || text.includes('_') || text.includes('='))
    );

    if (isPureMathMacro) {
      const cleanFormula = formatToStandardLatexMath(text);
      try {
        return katex.renderToString(cleanFormula, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        });
      } catch {
        // Fallback to text
      }
    }

    // Default Case: Regular text paragraph or synopsis. Escape HTML and preserve normal word spacing.
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [rawInput, isDisplay, isExplicitMath]);

  if (!rawInput.trim()) return null;

  return (
    <span
      className={`latex-container ${isDisplay ? 'my-2 block text-center' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};
