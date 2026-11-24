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

const MATH_DELIMITER_REGEX = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderKatexSafe(formula: string, displayMode: boolean): string {
  const cleanFormula = formatToStandardLatexMath(formula);
  try {
    const out = katex.renderToString(cleanFormula, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
    return out.replace(/#cc0000/gi, '#38bdf8');
  } catch {
    return `<span class="katex-fallback font-mono text-cyan-400">${escapeHtml(cleanFormula)}</span>`;
  }
}

/**
 * Enriches ONLY plain-prose text segments (never existing $...$ math blocks)
 * with genuine KaTeX mathematical notation for Greek symbols, plain Greek names
 * (including "lamba" typos), physics subscripted symbols, scientific powers,
 * SI exponent units, and arrows.
 */
function enrichProseSegmentWithLatex(prose: string): string {
  if (!prose) return '';

  // Protect inline markdown code spans `...` so code snippets aren't altered
  const codeSpans: string[] = [];
  let s = prose.replace(/`([^`]+)`/g, (_, inner) => {
    const idx = codeSpans.length;
    codeSpans.push(inner);
    return `__PROSE_CODE_${idx}__`;
  });

  // 1. Subscripted physics quantities in plain prose (e.g., H_max, R_max, v_0, v_x, v_y, mu_s, m_e, q_alpha, T_1/2)
  // Run BEFORE single-token Greek replacements so mu_s / q_alpha / lambda_0 stay atomic inside one $...$
  s = s.replace(
    /\b(H_max|R_max|v_max|v_min|v_cm|a_cm|I_cm|F_net|g_eff|v_0|v_x|v_y|v_t|v_r|a_c|a_t|a_r|p_x|p_y|N_0|E_n|r_n|m_e|m_p|m_1|m_2|n_1|n_2|f_s|f_k|T_1\/2|mu_s|mu_k|mu_0|epsilon_0|lambda_0|lambda_dB|theta_c|theta_0|q_alpha|K_alpha)\b/g,
    (token) => {
      const normalized = token
        .replace(/^mu_/, '\\mu_')
        .replace(/^epsilon_/, '\\varepsilon_')
        .replace(/^lambda_/, '\\lambda_')
        .replace(/^theta_/, '\\theta_')
        .replace(/_alpha$/, '_\\alpha')
        .replace(/_1\/2$/, '_{1/2}')
        .replace(/_max$/, '_{\\max}')
        .replace(/_min$/, '_{\\min}')
        .replace(/_net$/, '_{\\text{net}}')
        .replace(/_eff$/, '_{\\text{eff}}')
        .replace(/_cm$/, '_{\\text{cm}}')
        .replace(/_dB$/, '_{\\text{dB}}');
      return `$${normalized}$`;
    }
  );

  // 2. Bare escaped LaTeX commands left unwrapped in prose (e.g. \theta, \\theta, \lambda, \omega, \Delta)
  s = s.replace(
    /(?:\\\\|\\)(theta|Theta|lambda|Lambda|omega|Omega|alpha|beta|gamma|Gamma|delta|Delta|epsilon|varepsilon|mu|nu|rho|sigma|Sigma|tau|phi|Phi|psi|Psi|eta|kappa|zeta|xi|Xi|chi|hbar|infty|approx|neq|le|ge|propto|cdot|times|pm|implies|iff|to)\b/g,
    (_, cmd) => `$\\${cmd}$`
  );

  // 3. Unicode Greek symbols -> $\cmd$
  const unicodeGreekMap: Record<string, string> = {
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
    'κ': '$\\kappa$',
    'ζ': '$\\zeta$',
    'ξ': '$\\xi$',
    'χ': '$\\chi$',
    'ℏ': '$\\hbar$',
    '∞': '$\\infty$',
    '∝': '$\\propto$',
    '≈': '$\\approx$',
    '≠': '$\\neq$',
    '≤': '$\\le$',
    '≥': '$\\ge$',
  };

  for (const [char, repl] of Object.entries(unicodeGreekMap)) {
    if (s.includes(char)) {
      s = s.split(char).join(repl);
    }
  }

  // 4. Plain-English misspelled/unformatted physics Greek words in prose ("lamba", "lambda", "theta", "omega", etc.)
  // Avoid converting inside words; handle exact physics symbol tokens cleanly.
  const wordToLatex: Record<string, string> = {
    lamba: '$\\lambda$',
    lambda: '$\\lambda$',
    Lambda: '$\\Lambda$',
    theta: '$\\theta$',
    Theta: '$\\Theta$',
    omega: '$\\omega$',
    Omega: '$\\Omega$',
    alpha: '$\\alpha$',
    beta: '$\\beta$',
    gamma: '$\\gamma$',
    Gamma: '$\\Gamma$',
    delta: '$\\delta$',
    Delta: '$\\Delta$',
    epsilon: '$\\varepsilon$',
    varepsilon: '$\\varepsilon$',
    sigma: '$\\sigma$',
    Sigma: '$\\Sigma$',
    tau: '$\\tau$',
    phi: '$\\phi$',
    Phi: '$\\Phi$',
    psi: '$\\psi$',
    Psi: '$\\Psi$',
    kappa: '$\\kappa$',
    zeta: '$\\zeta$',
    hbar: '$\\hbar$',
  };

  s = s.replace(
    /\b(lamba|lambda|Lambda|theta|Theta|omega|Omega|alpha|beta|gamma|Gamma|delta|Delta|epsilon|varepsilon|sigma|Sigma|tau|phi|Phi|psi|Psi|kappa|zeta|hbar)\b/g,
    (word) => wordToLatex[word] || word
  );

  // Contextual mu / nu / rho / eta / pi when used with math operators or subscript/primes
  s = s.replace(/\b(mu|nu|rho|eta|chi)(?=\s*(?:[=<>≈≠≤≥·×/+\-₀₁₂]|['′]))/g, (_, w) => `$\\${w}$`);

  // 5. Degrees: 45° -> $45^\circ$ (only when not preceded by $)
  s = s.replace(/(^|[^$0-9])(\d+(?:\.\d+)?)°/g, '$1$$$2^\\circ$$');
  s = s.replace(/^(\d+(?:\.\d+)?)°/g, '$$$1^\\circ$$');

  // 6. Scientific notation & powers in prose: 10^-6, 1.6 x 10^-19, m/s^2, s^-1
  s = s.replace(/\b10\^(-?\d+)\b/g, '$10^{$1}$');
  s = s.replace(/\b(m\/s|kg·m\/s|rad\/s|s|m|cm|km|kg|N|J|W|C|V|K)\^(-?\d+)\b/g, '$\\text{$1}^{$2}$');

  // 7. Unicode superscripts & subscripts outside math blocks
  s = s
    .replace(/⁻¹/g, '$^{-1}$')
    .replace(/⁻²/g, '$^{-2}$')
    .replace(/⁻³/g, '$^{-3}$')
    .replace(/⁻⁴/g, '$^{-4}$')
    .replace(/²/g, '$^2$')
    .replace(/³/g, '$^3$')
    .replace(/₀/g, '$_0$')
    .replace(/₁/g, '$_1$')
    .replace(/₂/g, '$_2$')
    .replace(/₃/g, '$_3$');

  // 8. Arrows in prose
  s = s
    .replace(/<=>|⟺/g, '$\\iff$')
    .replace(/=>|⟹/g, '$\\implies$')
    .replace(/(^|\s)->(\s|$)/g, '$1$\\to$$2')
    .replace(/→/g, '$\\to$');

  // Restore inline code spans wrapped back with backticks
  s = s.replace(/__PROSE_CODE_(\d+)__/g, (_, idx) => `\`${codeSpans[Number(idx)] ?? ''}\``);

  return s;
}

/**
 * Formats plain prose with safe HTML escaping, inline code pills, bold, italics, and newlines.
 */
function renderPlainProseHtml(prosePart: string): string {
  return escapeHtml(prosePart)
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-mono text-[0.92em] text-cyan-400">$1</code>'
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/(^|[^\*])\*([^\*\n]+?)\*(?!\*)/g, '$1<em class="italic">$2</em>')
    .replace(/\n\n/g, '<br /><br />')
    .replace(/\n/g, '<br />');
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
    if (
      /^\\begin\{equation\*?\}[\s\S]*\\end\{equation\*?\}$/.test(text) ||
      /^\\begin\{align\*?\}[\s\S]*\\end\{align\*?\}$/.test(text)
    ) {
      return renderKatexSafe(text, true);
    }

    // Case 2: Pure standalone formula wrapped in $$...$$ or \[...\]
    if (
      (text.startsWith('$$') && text.endsWith('$$') && text.length >= 4 && !text.slice(2, -2).includes('$$')) ||
      (text.startsWith('\\[') && text.endsWith('\\]') && text.length >= 4 && !text.slice(2, -2).includes('\\['))
    ) {
      return renderKatexSafe(text.slice(2, -2).trim(), true);
    }

    // Case 3: Pure standalone formula wrapped in $...$ or \(...\) with no text outside
    if (
      (text.startsWith('$') && text.endsWith('$') && text.length >= 2 && !text.slice(1, -1).includes('$')) ||
      (text.startsWith('\\(') && text.endsWith('\\)') && text.length >= 4 && !text.slice(2, -2).includes('\\('))
    ) {
      return renderKatexSafe(text.slice(text.startsWith('$') ? 1 : 2, text.startsWith('$') ? -1 : -2).trim(), isDisplay);
    }

    // Case 4: Mixed prose + math OR pure math without outer delimiters
    // First test Case 5 (un-delimited pure LaTeX equation passed directly via <Latex math="..." />)
    if (math !== undefined) {
      const words = text.split(/\s+/);
      const looksLikeProse = words.length > 4 && words.some((w) => /^[a-zA-Z]{4,}$/.test(w) && !/^(sin|cos|tan|cot|sec|csc|log|exp|max|min|sqrt|frac|left|right|text|quad|sqrt)$/.test(w));
      if (!looksLikeProse && !text.includes('$')) {
        return renderKatexSafe(text, isDisplay);
      }
    }

    // Split text on ALREADY existing math spans first so we never double-wrap inside $...$!
    const existingSegments = text.split(MATH_DELIMITER_REGEX);

    const processedChunks: string[] = [];
    for (const seg of existingSegments) {
      if (!seg) continue;

      const isBlockMath =
        (seg.startsWith('$$') && seg.endsWith('$$') && seg.length >= 4) ||
        (seg.startsWith('\\[') && seg.endsWith('\\]') && seg.length >= 4);
      const isInlineMath =
        (seg.startsWith('$') && seg.endsWith('$') && seg.length >= 2) ||
        (seg.startsWith('\\(') && seg.endsWith('\\)') && seg.length >= 4);

      if (isBlockMath || isInlineMath) {
        const inner = seg.startsWith('$') && !seg.startsWith('$$') ? seg.slice(1, -1).trim() : seg.slice(2, -2).trim();
        processedChunks.push(renderKatexSafe(inner, isBlockMath || isDisplay));
        continue;
      }

      // Check if an un-delimited pure math expression was passed via children
      const segWords = seg.split(/\s+/);
      const segLooksLikeProse =
        segWords.length > 3 &&
        segWords.some((w) => /^[a-zA-Z]{4,}$/.test(w));

      if (
        existingSegments.length === 1 &&
        !segLooksLikeProse &&
        (seg.startsWith('\\') || /[=^_]/.test(seg))
      ) {
        processedChunks.push(renderKatexSafe(seg, isDisplay));
        continue;
      }

      // Plain prose segment: enrich physics tokens into $...$ and split again cleanly
      const enriched = enrichProseSegmentWithLatex(seg);
      const subParts = enriched.split(MATH_DELIMITER_REGEX);

      for (const sub of subParts) {
        if (!sub) continue;
        const subBlock =
          (sub.startsWith('$$') && sub.endsWith('$$') && sub.length >= 4) ||
          (sub.startsWith('\\[') && sub.endsWith('\\]') && sub.length >= 4);
        const subInline =
          (sub.startsWith('$') && sub.endsWith('$') && sub.length >= 2) ||
          (sub.startsWith('\\(') && sub.endsWith('\\)') && sub.length >= 4);

        if (subBlock || subInline) {
          const inner = sub.startsWith('$') && !sub.startsWith('$$') ? sub.slice(1, -1).trim() : sub.slice(2, -2).trim();
          processedChunks.push(renderKatexSafe(inner, subBlock || isDisplay));
        } else {
          processedChunks.push(renderPlainProseHtml(sub));
        }
      }
    }

    return processedChunks.join('');
  }, [rawInput, math, isDisplay]);

  if (!rawInput || !String(rawInput).trim()) return null;

  return (
    <span
      className={`latex-container ${isDisplay ? 'my-2 block text-center' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};
