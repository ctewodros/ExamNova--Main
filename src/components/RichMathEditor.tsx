import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Superscript,
  Subscript,
  List,
  Sigma,
  Image as ImageIcon,
  Eye,
  Code2,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import katex from 'katex';
import { MathRenderer } from './MathRenderer';

interface RichMathEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  compact?: boolean;
  diagramSvg?: string;
  onDiagramChange?: (svg: string | undefined) => void;
  allowDiagrams?: boolean;
}

const SCIENTIFIC_SYMBOLS = [
  { label: 'α (alpha)', value: 'α' },
  { label: 'β (beta)', value: 'β' },
  { label: 'γ (gamma)', value: 'γ' },
  { label: 'θ (theta)', value: 'θ' },
  { label: 'π (pi)', value: 'π' },
  { label: 'λ (lambda)', value: 'λ' },
  { label: 'Δ (delta)', value: 'Δ' },
  { label: '∑ (sum)', value: '∑' },
  { label: '∫ (integral)', value: '∫' },
  { label: '∂ (partial)', value: '∂' },
  { label: '√ (sqrt)', value: '√' },
  { label: '∞ (infinity)', value: '∞' },
  { label: '≤ (less/eq)', value: '≤' },
  { label: '≥ (greater/eq)', value: '≥' },
  { label: '≠ (not eq)', value: '≠' },
  { label: '± (plus-minus)', value: '±' },
  { label: '× (times)', value: '×' },
  { label: '÷ (divide)', value: '÷' },
  { label: '∈ (element)', value: '∈' },
  { label: '∀ (for all)', value: '∀' },
  { label: '∃ (exists)', value: '∃' },
  { label: '→ (implies)', value: '→' },
  { label: '° (degree)', value: '°' },
];

const FORMULA_PRESETS = [
  { name: 'Fraction', latex: '\\frac{a}{b}' },
  { name: 'Definite Integral', latex: '\\int_{a}^{b} f(x)\\,dx' },
  { name: 'Limit', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
  { name: 'Derivative', latex: '\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}' },
  { name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { name: 'Summation', latex: '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}' },
  { name: '2×2 Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { name: 'Binomial Coefficient', latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}' },
  { name: 'Normal Density', latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
];

const DIAGRAM_TEMPLATES = [
  {
    id: 'right_triangle',
    name: 'Right Triangle (Trigonometry)',
    svg: `<svg viewBox="0 0 260 150" class="w-64 h-36 mx-auto" xmlns="http://www.w3.org/2000/svg">
  <polygon points="40,120 210,120 210,30" fill="#eff6ff" stroke="#1e40af" stroke-width="2"/>
  <rect x="196" y="106" width="14" height="14" fill="none" stroke="#1e40af" stroke-width="1.5"/>
  <text x="120" y="138" font-size="12" fill="#0f172a" font-family="sans-serif">b = 12 cm</text>
  <text x="218" y="80" font-size="12" fill="#0f172a" font-family="sans-serif">a = 5 cm</text>
  <text x="95" y="65" font-size="12" fill="#1d4ed8" font-family="sans-serif">c = ?</text>
  <text x="64" y="112" font-size="11" fill="#1e293b" font-family="sans-serif">θ</text>
</svg>`,
  },
  {
    id: 'parabola_area',
    name: 'Parabola & Shaded Area (Calculus)',
    svg: `<svg viewBox="0 0 260 160" class="w-64 h-40 mx-auto" xmlns="http://www.w3.org/2000/svg">
  <line x1="20" y1="130" x2="240" y2="130" stroke="#64748b" stroke-width="1.5"/>
  <line x1="50" y1="145" x2="50" y2="15" stroke="#64748b" stroke-width="1.5"/>
  <path d="M 50 130 Q 130 130 190 25 L 190 130 Z" fill="#dbeafe" opacity="0.8"/>
  <path d="M 30 120 Q 130 140 205 18" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <text x="184" y="145" font-size="11" fill="#0f172a" font-family="sans-serif">x = 2</text>
  <text x="42" y="145" font-size="11" fill="#0f172a" font-family="sans-serif">0</text>
  <text x="155" y="34" font-size="11" fill="#1d4ed8" font-family="sans-serif">y = x²</text>
</svg>`,
  },
  {
    id: 'circle_chord',
    name: 'Circle & Inscribed Angle (Geometry)',
    svg: `<svg viewBox="0 0 220 160" class="w-56 h-40 mx-auto" xmlns="http://www.w3.org/2000/svg">
  <circle cx="110" cy="80" r="60" fill="#f8fafc" stroke="#1e40af" stroke-width="2"/>
  <circle cx="110" cy="80" r="2.5" fill="#0f172a"/>
  <line x1="58" y1="110" x2="162" y2="110" stroke="#0f172a" stroke-width="1.5"/>
  <polyline points="58,110 110,20 162,110" fill="none" stroke="#2563eb" stroke-width="2"/>
  <text x="115" y="84" font-size="11" fill="#0f172a">O</text>
  <text x="106" y="14" font-size="11" fill="#0f172a">A</text>
  <text x="44" y="116" font-size="11" fill="#0f172a">B</text>
  <text x="167" y="116" font-size="11" fill="#0f172a">C</text>
</svg>`,
  },
  {
    id: 'normal_curve',
    name: 'Normal Distribution Curve (Statistics)',
    svg: `<svg viewBox="0 0 260 140" class="w-64 h-36 mx-auto" xmlns="http://www.w3.org/2000/svg">
  <line x1="20" y1="115" x2="240" y2="115" stroke="#475569" stroke-width="1.5"/>
  <path d="M 25 114 C 65 114 85 28 130 28 C 175 28 195 114 235 114" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <line x1="130" y1="28" x2="130" y2="115" stroke="#1e40af" stroke-dasharray="4 3" stroke-width="1.5"/>
  <text x="125" y="130" font-size="11" fill="#0f172a">μ</text>
  <text x="84" y="130" font-size="11" fill="#64748b">μ-σ</text>
  <text x="162" y="130" font-size="11" fill="#64748b">μ+σ</text>
</svg>`,
  },
];

export const RichMathEditor: React.FC<RichMathEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter content. Use $...$ for inline LaTeX or click Insert Formula.',
  rows = 4,
  disabled = false,
  compact = false,
  diagramSvg,
  onDiagramChange,
  allowDiagrams = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [latexInput, setLatexInput] = useState('\\int_{0}^{2} (3x^2 - 2x + 1)\\,dx');
  const [displayMode, setDisplayMode] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const insertAtCursor = (before: string, after = '', fallbackText = '') => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || fallbackText;
    const nextValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleInsertFormula = () => {
    const delimiter = displayMode ? '$$' : '$';
    const trimmed = latexInput.trim();
    if (!trimmed) return;
    insertAtCursor(`${delimiter}${trimmed}${delimiter}`);
    setFormulaModalOpen(false);
  };

  const renderedFormulaPreview = (() => {
    try {
      return katex.renderToString(latexInput || '\\text{Enter LaTeX}', {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return '<span class="text-rose-600 text-xs">Invalid LaTeX syntax</span>';
    }
  })();

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {showPreview ? (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span>Edit Source</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered Preview</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className={`border rounded-lg overflow-hidden transition-colors ${disabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 focus-within:border-blue-500'}`}>
        {/* Toolbar */}
        {!disabled && !showPreview && (
          <div className="flex flex-wrap items-center gap-1 px-2.5 py-1.5 bg-slate-50 border-b border-slate-200">
            <button
              type="button"
              title="Bold"
              onClick={() => insertAtCursor('<b>', '</b>', 'bold text')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => insertAtCursor('<i>', '</i>', 'italic text')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Underline"
              onClick={() => insertAtCursor('<u>', '</u>', 'underlined')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <span className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              type="button"
              title="Superscript"
              onClick={() => insertAtCursor('<sup>', '</sup>', '2')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded"
            >
              <Superscript className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Subscript"
              onClick={() => insertAtCursor('<sub>', '</sub>', 'n')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded"
            >
              <Subscript className="w-3.5 h-3.5" />
            </button>
            {!compact && (
              <button
                type="button"
                title="Bullet List"
                onClick={() => insertAtCursor('<ul><li>', '</li></ul>', 'Item')}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="h-4 w-px bg-slate-200 mx-0.5" />

            {/* Scientific Symbols Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSymbols(!showSymbols)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded"
              >
                <span>Ω Symbols</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSymbols && (
                <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[11px] font-semibold text-slate-500">Insert Scientific Symbol</span>
                    <button
                      type="button"
                      onClick={() => setShowSymbols(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {SCIENTIFIC_SYMBOLS.map((sym) => (
                      <button
                        key={sym.label}
                        type="button"
                        title={sym.label}
                        onClick={() => {
                          insertAtCursor(sym.value);
                          setShowSymbols(false);
                        }}
                        className="h-7 flex items-center justify-center text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-100"
                      >
                        {sym.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Formula Insertion Dialog Trigger */}
            <button
              type="button"
              onClick={() => setFormulaModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
            >
              <Sigma className="w-3.5 h-3.5" />
              <span>Insert Formula</span>
            </button>

            {allowDiagrams && onDiagramChange && (
              <button
                type="button"
                onClick={() => setDiagramModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Diagram / Image</span>
              </button>
            )}

            {!label && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 rounded"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            )}
          </div>
        )}

        {/* Editor or Preview */}
        {showPreview ? (
          <div className="p-3 bg-white min-h-[72px] space-y-3">
            {!label && !disabled && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Back to Editor</span>
                </button>
              </div>
            )}
            <MathRenderer content={value} className="text-sm" />
            {diagramSvg && (
              <div className="pt-2 border-t border-slate-100">
                <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
              </div>
            )}
          </div>
        ) : (
          <div className="p-2.5 space-y-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-y bg-transparent leading-relaxed"
            />
            {value && value.includes('$') && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-medium text-slate-500 mr-2">Live Math Preview:</span>
                <MathRenderer content={value} className="inline text-sm text-slate-900" />
              </div>
            )}
            {diagramSvg && (
              <div className="pt-2 border-t border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70 p-2 rounded">
                <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
                {!disabled && onDiagramChange && (
                  <button
                    type="button"
                    onClick={() => onDiagramChange(undefined)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium shrink-0"
                  >
                    Remove Diagram
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formula Insertion Dialog */}
      {formulaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Insert Mathematical Formula (LaTeX)</h3>
                <p className="text-xs text-slate-500">Select a preset or author custom LaTeX with real-time KaTeX preview.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormulaModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">Common Academic Presets</div>
                <div className="flex flex-wrap gap-1.5">
                  {FORMULA_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setLatexInput(preset.latex)}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">LaTeX Expression</label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={displayMode}
                      onChange={(e) => setDisplayMode(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Display Block Mode ($$...$$)</span>
                  </label>
                </div>
                <textarea
                  value={latexInput}
                  onChange={(e) => setLatexInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
                  placeholder="e.g. \int_{0}^{1} x^2\,dx"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">Live Preview</div>
                <div
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[72px] flex items-center justify-center text-base text-slate-900 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderedFormulaPreview }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setFormulaModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertFormula}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert into Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagram / Image Dialog */}
      {diagramModalOpen && onDiagramChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Insert Diagram or Figure</h3>
                <p className="text-xs text-slate-500">Choose a standard examination vector diagram or embed a clean SVG/figure.</p>
              </div>
              <button
                type="button"
                onClick={() => setDiagramModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIAGRAM_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      onDiagramChange(tpl.svg);
                      setDiagramModalOpen(false);
                    }}
                    className="p-3 border border-slate-200 hover:border-blue-500 rounded-lg text-left transition-colors bg-slate-50/50 hover:bg-blue-50/30"
                  >
                    <div className="text-xs font-semibold text-slate-800 mb-2">{tpl.name}</div>
                    <div dangerouslySetInnerHTML={{ __html: tpl.svg }} />
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload Image File (PNG, JPG, SVG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          onDiagramChange(
                            `<img src="${reader.result}" alt="${file.name}" class="max-h-56 mx-auto rounded border border-slate-200" />`
                          );
                          setDiagramModalOpen(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Or Insert Image Caption / Figure Placeholder
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Figure label (e.g., Graph of f'(x) on [-2, 4])"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!imageUrlInput.trim()) return;
                        onDiagramChange(
                          `<div class="p-3 border border-slate-200 rounded bg-slate-50 text-center text-xs text-slate-600 font-medium">[Figure: ${imageUrlInput.trim()}]</div>`
                        );
                        setImageUrlInput('');
                        setDiagramModalOpen(false);
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                      Attach Figure Box
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
