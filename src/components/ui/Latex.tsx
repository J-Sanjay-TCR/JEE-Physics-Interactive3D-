import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexProps {
  children?: string;
  math?: string;
  displayMode?: boolean;
  block?: boolean;
  className?: string;
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

    // If caller explicitly passed `math` prop, treat the entire string as LaTeX formula
    if (isExplicitMath) {
      let formula = text;
      let display = isDisplay;
      if (formula.startsWith('$$') && formula.endsWith('$$') && formula.length >= 4) {
        formula = formula.slice(2, -2).trim();
        display = true;
      } else if (formula.startsWith('$') && formula.endsWith('$') && formula.length >= 2) {
        formula = formula.slice(1, -1).trim();
      }
      try {
        return katex.renderToString(formula, {
          displayMode: display,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return text;
      }
    }

    // Case 1: Children wrapped entirely in $$...$$
    if (text.startsWith('$$') && text.endsWith('$$') && text.length >= 4) {
      const inner = text.slice(2, -2).trim();
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
      const inner = text.slice(1, -1).trim();
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

    // Case 3: Mixed text with embedded $...$ or $$...$$ or \(...\) or \[...\]
    if (text.includes('$') || text.includes('\\(') || text.includes('\\[') || text.includes('\\[')) {
      const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
      const parts = text.split(regex);

      const htmlChunks = parts.map((part) => {
        if (!part) return '';
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        if (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const formula = part.slice(1, -1).trim();
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false, strict: false });
          } catch {
            return formula;
          }
        }
        if (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) {
          const formula = part.slice(2, -2).trim();
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
    // Only parse with KaTeX if it starts with \ or has math operators and NO normal sentence structure (no spaces or very short)
    const isPureMathMacro = text.startsWith('\\') || (
      !text.includes(' ') && (text.includes('^') || text.includes('_') || text.includes('='))
    );

    if (isPureMathMacro) {
      try {
        return katex.renderToString(text, {
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


