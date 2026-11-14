import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders rich HTML text combined with inline ($...$) and display ($$...$$) LaTeX expressions using KaTeX.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) {
    return <span className={`text-slate-400 italic ${className}`}>No content provided</span>;
  }

  // Split by $$...$$ first, then $...$
  const renderWithKatex = (raw: string): string => {
    // Replace display math $$...$$
    let processed = raw.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expr) => {
      try {
        return `<span class="block my-2 overflow-x-auto">${katex.renderToString(expr.trim(), {
          displayMode: true,
          throwOnError: false,
        })}</span>`;
      } catch {
        return `<code>$$${expr}$$</code>`;
      }
    });

    // Replace inline math $...$
    processed = processed.replace(/\$([^$\n]+?)\$/g, (_match, expr) => {
      try {
        return katex.renderToString(expr.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `<code>$${expr}$</code>`;
      }
    });

    return processed;
  };

  const html = renderWithKatex(content);

  return (
    <div
      className={`math-rich-content text-slate-800 leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
