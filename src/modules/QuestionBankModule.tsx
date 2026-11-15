import React, { useState } from 'react';
import { Search, Eye, X, CheckCircle2, History, Download, Printer } from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { QuestionItem } from '../types/examnova';
import { StatusText } from '../components/StatusText';
import { MathRenderer } from '../components/MathRenderer';
import { ExportModal } from '../components/ExportModal';
import {
  SavedFilterBar,
  SavedFilterPreset,
  useSavedFilters,
} from '../components/SavedFilterBar';

interface QuestionBankFilters {
  search: string;
  filterExamType: string;
  filterSubject: string;
  filterTopic: string;
  filterLO: string;
  filterCognitive: string;
  filterDifficulty: string;
  filterType: string;
  filterAvailability: string;
}

const DEFAULT_QB_FILTERS: QuestionBankFilters = {
  search: '',
  filterExamType: 'all',
  filterSubject: 'all',
  filterTopic: 'all',
  filterLO: 'all',
  filterCognitive: 'all',
  filterDifficulty: 'all',
  filterType: 'all',
  filterAvailability: 'all',
};

const DEFAULT_QB_PRESETS: SavedFilterPreset<QuestionBankFilters>[] = [
  {
    id: 'qb-preset-calc',
    name: 'G12 Math · Calculus',
    filters: {
      ...DEFAULT_QB_FILTERS,
      filterExamType: 'et-g12',
      filterSubject: 'subj-math',
      filterTopic: 'top-calc',
    },
    summary: 'Grade 12 National Exam · Mathematics · Calculus',
    savedAt: '2026-11-14',
  },
  {
    id: 'qb-preset-avail',
    name: 'Available Items Only',
    filters: {
      ...DEFAULT_QB_FILTERS,
      filterAvailability: 'Available',
    },
    summary: 'Availability: Available',
    savedAt: '2026-11-14',
  },
];

export const QuestionBankModule: React.FC = () => {
  const {
    questions,
    examTypes,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    triggerPdfExport,
    notifyToast,
  } = useExamNova();

  const [filters, setFilters] = useState<QuestionBankFilters>(DEFAULT_QB_FILTERS);
  const {
    search,
    filterExamType,
    filterSubject,
    filterTopic,
    filterLO,
    filterCognitive,
    filterDifficulty,
    filterType,
    filterAvailability,
  } = filters;

  const [previewItem, setPreviewItem] = useState<QuestionItem | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const bankQuestions = questions.filter((q) => q.inBank && q.reviewStatus === 'Approved');

  const filtered = bankQuestions.filter((q) => {
    const matchesSearch =
      !search.trim() ||
      q.stem.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase());
    const matchesET = filterExamType === 'all' || q.examTypeId === filterExamType;
    const matchesSubj = filterSubject === 'all' || q.subjectId === filterSubject;
    const matchesTop = filterTopic === 'all' || q.topicId === filterTopic;
    const matchesLO = filterLO === 'all' || q.learningOutcomeId === filterLO;
    const matchesCog = filterCognitive === 'all' || q.cognitiveLevelId === filterCognitive;
    const matchesDif = filterDifficulty === 'all' || q.difficultyLevelId === filterDifficulty;
    const matchesType = filterType === 'all' || q.questionTypeId === filterType;
    const matchesAvail = filterAvailability === 'all' || q.bankAvailability === filterAvailability;
    return (
      matchesSearch &&
      matchesET &&
      matchesSubj &&
      matchesTop &&
      matchesLO &&
      matchesCog &&
      matchesDif &&
      matchesType &&
      matchesAvail
    );
  });

  const visibleTopics =
    filterSubject === 'all' ? topics : topics.filter((t) => t.subjectId === filterSubject);
  const visibleLOs =
    filterTopic !== 'all'
      ? learningOutcomes.filter((l) => l.topicId === filterTopic)
      : filterSubject !== 'all'
      ? learningOutcomes.filter((l) => l.subjectId === filterSubject)
      : learningOutcomes;

  const activeFilterParts: string[] = [];
  if (filterExamType !== 'all') {
    const name = examTypes.find((e) => e.id === filterExamType)?.name;
    if (name) activeFilterParts.push(name);
  }
  if (filterSubject !== 'all') {
    const name = subjects.find((s) => s.id === filterSubject)?.name;
    if (name) activeFilterParts.push(name);
  }
  if (filterTopic !== 'all') {
    const name = topics.find((t) => t.id === filterTopic)?.name;
    if (name) activeFilterParts.push(name);
  }
  if (filterLO !== 'all') {
    const code = learningOutcomes.find((l) => l.id === filterLO)?.code;
    if (code) activeFilterParts.push(code);
  }
  if (filterCognitive !== 'all') {
    const name = cognitiveLevels.find((c) => c.id === filterCognitive)?.name;
    if (name) activeFilterParts.push(name);
  }
  if (filterDifficulty !== 'all') {
    const name = difficultyLevels.find((d) => d.id === filterDifficulty)?.name;
    if (name) activeFilterParts.push(name);
  }
  if (filterType !== 'all') {
    const code = questionTypes.find((t) => t.id === filterType)?.code;
    if (code) activeFilterParts.push(code);
  }
  if (filterAvailability !== 'all') {
    activeFilterParts.push(filterAvailability);
  }
  if (search.trim()) {
    activeFilterParts.push(`Search: "${search.trim()}"`);
  }

  const hasActiveFilters = activeFilterParts.length > 0;
  const filterSummary = hasActiveFilters
    ? `Filtered View: ${activeFilterParts.join(' · ')}`
    : 'All Certified Question Bank Items';
  const suggestedName = activeFilterParts.slice(0, 3).join(' · ') || 'Custom Question Search';

  const savedStore = useSavedFilters<QuestionBankFilters>({
    storageKey: 'examnova_qb_saved_searches_v1',
    currentFilters: filters,
    activeSummary: activeFilterParts.join(' · ') || 'All Items',
    hasActiveFilters,
    defaultPresets: DEFAULT_QB_PRESETS,
  });

  const handleApplySaved = (nextFilters: QuestionBankFilters, summary?: string) => {
    setFilters(nextFilters);
    savedStore.recordRecent(nextFilters, summary || nextFilters.search || 'Saved Filter');
  };

  const handleDirectBankPdf = (targetItems: QuestionItem[], subtitleText: string) => {
    triggerPdfExport({
      kind: 'question_bank',
      title: 'ExamNova Certified Question Bank',
      subtitle: subtitleText,
      questions: targetItems,
      includeAnswerKey: true,
      includeMetadata: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Approved Question Bank</h1>
          <p className="text-sm text-slate-500">
            Certified, approved, and active examination items eligible for assembly against active blueprints.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="text-xs font-mono tabular-nums text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
            Showing <strong>{filtered.length}</strong> of <strong>{bankQuestions.length}</strong> Certified Items
          </div>
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={() => handleDirectBankPdf(filtered, filterSummary)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            disabled={bankQuestions.length === 0}
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 rounded-lg whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Options</span>
          </button>
        </div>
      </div>

      {/* Multi-Faceted Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (search.trim() || hasActiveFilters)) {
                  e.preventDefault();
                  savedStore.recordRecent(filters, activeFilterParts.join(' · '));
                }
              }}
              placeholder="Search question stems, LaTeX expressions, or item IDs (press Enter to save to recent)..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          <select
            value={filterExamType}
            onChange={(e) => setFilters((prev) => ({ ...prev, filterExamType: e.target.value }))}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Exam Type</option>
            {examTypes.map((et) => (
              <option key={et.id} value={et.id}>{et.name}</option>
            ))}
          </select>
          <select
            value={filterSubject}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                filterSubject: e.target.value,
                filterTopic: 'all',
                filterLO: 'all',
              }))
            }
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterTopic}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                filterTopic: e.target.value,
                filterLO: 'all',
              }))
            }
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Topic</option>
            {visibleTopics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={filterLO}
            onChange={(e) => setFilters((prev) => ({ ...prev, filterLO: e.target.value }))}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Outcome</option>
            {visibleLOs.map((lo) => (
              <option key={lo.id} value={lo.id}>{lo.code}</option>
            ))}
          </select>
          <select
            value={filterCognitive}
            onChange={(e) => setFilters((prev) => ({ ...prev, filterCognitive: e.target.value }))}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Cognitive</option>
            {cognitiveLevels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilters((prev) => ({ ...prev, filterDifficulty: e.target.value }))}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Difficulty</option>
            {difficultyLevels.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilters((prev) => ({ ...prev, filterType: e.target.value }))}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Type</option>
            {questionTypes.map((qt) => (
              <option key={qt.id} value={qt.id}>{qt.code}</option>
            ))}
          </select>
          <select
            value={filterAvailability}
            onChange={(e) => setFilters((prev) => ({ ...prev, filterAvailability: e.target.value }))}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Availability</option>
            <option value="Available">Available</option>
            <option value="Used in Active Exam">Used in Active Exam</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>

        <SavedFilterBar<QuestionBankFilters>
          presets={savedStore.presets}
          recent={savedStore.recent}
          hasActiveFilters={hasActiveFilters}
          suggestedName={suggestedName}
          activeSummary={activeFilterParts.join(' · ') || 'All Items'}
          onApply={handleApplySaved}
          onSavePreset={(name) => {
            savedStore.savePreset(name);
            notifyToast(`Saved Question Bank filter "${name}".`);
          }}
          onDeletePreset={savedStore.deletePreset}
          onDeleteRecent={savedStore.deleteRecent}
          onClearRecent={savedStore.clearRecent}
          onResetFilters={() => setFilters(DEFAULT_QB_FILTERS)}
        />
      </div>

      {/* Question Bank Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-4">ID · Ver</th>
              <th className="py-3 px-4">Question Stem</th>
              <th className="py-3 px-4">Subject · Topic · LO</th>
              <th className="py-3 px-4">Cognitive · Difficulty · Type</th>
              <th className="py-3 px-4 text-right">Marks</th>
              <th className="py-3 px-4">Status · Availability</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No certified questions match the active filters.
                </td>
              </tr>
            ) : (
              filtered.map((q) => {
                const subj = subjects.find((s) => s.id === q.subjectId)?.name ?? '';
                const top = topics.find((t) => t.id === q.topicId)?.name ?? '';
                const lo = learningOutcomes.find((l) => l.id === q.learningOutcomeId)?.code ?? '';
                const cog = cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
                const dif = difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
                const qt = questionTypes.find((t) => t.id === q.questionTypeId)?.code ?? '';

                return (
                  <tr key={q.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {q.id} <span className="text-slate-400">v{q.version}</span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <MathRenderer content={q.stem} className="text-xs text-slate-900 line-clamp-2" />
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{subj} · {top}</div>
                      <div className="font-mono text-[11px] text-slate-500">{lo}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {cog} · {dif} · <span className="font-mono">{qt}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {q.marks}
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <div><StatusText status={q.reviewStatus} /></div>
                      <div><StatusText status={q.bankAvailability} /></div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(q)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectBankPdf([q], `Single Certified Item (${q.id} v${q.version})`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                          title="Print / Download Item as PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Question Bank Item {previewItem.id} (v{previewItem.version})
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {questionTypes.find((qt) => qt.id === previewItem.questionTypeId)?.name ?? 'MCQ'} ·{' '}
                  {subjects.find((s) => s.id === previewItem.subjectId)?.name} ·{' '}
                  {topics.find((t) => t.id === previewItem.topicId)?.name} ·{' '}
                  {cognitiveLevels.find((c) => c.id === previewItem.cognitiveLevelId)?.name} ·{' '}
                  {difficultyLevels.find((d) => d.id === previewItem.difficultyLevelId)?.name} ·{' '}
                  {previewItem.marks} Marks
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDirectBankPdf(
                      [previewItem],
                      `Single Certified Item (${previewItem.id} v${previewItem.version})`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button type="button" onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <MathRenderer content={previewItem.stem} className="text-base text-slate-900" />
              {previewItem.diagramSvg && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg" dangerouslySetInnerHTML={{ __html: previewItem.diagramSvg }} />
              )}
              {previewItem.questionTypeId === 'qt-short' || previewItem.options.length === 0 ? (
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    Expected Sample Answer / Marking Rubric
                  </div>
                  <MathRenderer
                    content={previewItem.sampleAnswer || 'No sample answer recorded.'}
                    className="text-sm text-slate-900"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {(previewItem.questionTypeId === 'qt-tf' ? previewItem.options.slice(0, 2) : previewItem.options).map((opt) => {
                    const isKey = opt.id === previewItem.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                          isKey ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
                        }`}
                      >
                        <span className="font-mono font-bold text-slate-700">{opt.label}.</span>
                        <div className="flex-1"><MathRenderer content={opt.content} /></div>
                        {isKey && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-1">Solution Rationale</div>
                <MathRenderer content={previewItem.rationale} className="text-xs text-slate-700" />
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <History className="w-3.5 h-3.5" />
                  <span>Certification & Version History</span>
                </div>
                <div className="space-y-2 text-xs">
                  {previewItem.history.map((h) => (
                    <div key={h.id} className="flex justify-between gap-4 text-slate-600">
                      <span><strong>{h.action}</strong> — {h.actorName}</span>
                      <span className="font-mono text-slate-400 shrink-0">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {exportOpen && (
        <ExportModal
          mode="question_bank"
          filteredQuestions={filtered}
          allBankQuestions={bankQuestions}
          filterSummary={filterSummary}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
};
