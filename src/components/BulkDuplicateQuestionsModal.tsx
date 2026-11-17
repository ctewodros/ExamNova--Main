import React, { useMemo, useState } from 'react';
import { Copy, Search, X, CheckSquare, Square, Layers, Tag } from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { QuestionItem } from '../types/examnova';
import { MathRenderer } from './MathRenderer';
import { getBloomsMeta } from '../utils/bloomsTaxonomy';

interface BulkDuplicateQuestionsModalProps {
  activePackageId: string;
  initialSelectedIds?: string[];
  onClose: () => void;
  onDuplicated: (result: { createdIds: string[]; targetPackageId: string }) => void;
}

type SourceScope = 'current_pkg' | 'all_drafts' | 'question_bank';

export const BulkDuplicateQuestionsModal: React.FC<BulkDuplicateQuestionsModalProps> = ({
  activePackageId,
  initialSelectedIds = [],
  onClose,
  onDuplicated,
}) => {
  const {
    packages,
    questions,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    duplicateQuestionsToPackage,
  } = useExamNova();

  const editablePackages = useMemo(
    () => packages.filter((p) => p.status === 'Assigned' || p.status === 'In Progress'),
    [packages]
  );

  const defaultTargetId = editablePackages.some((p) => p.id === activePackageId)
    ? activePackageId
    : editablePackages[0]?.id ?? '__NEW__';

  const [scope, setScope] = useState<SourceScope>('current_pkg');
  const [search, setSearch] = useState('');
  const [bloomFilter, setBloomFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [targetPackageId, setTargetPackageId] = useState<string>(defaultTargetId);
  const [newPackageTitle, setNewPackageTitle] = useState('');
  const [copiesPerQuestion, setCopiesPerQuestion] = useState<number>(1);
  const [stemPrefix, setStemPrefix] = useState<string>('');
  const [markIncomplete, setMarkIncomplete] = useState<boolean>(false);

  const orderedBlooms = useMemo(
    () => [...cognitiveLevels].sort((a, b) => a.order - b.order),
    [cognitiveLevels]
  );

  const scopedQuestions = useMemo(() => {
    let base: QuestionItem[];
    if (scope === 'current_pkg') {
      base = questions
        .filter((q) => q.packageId === activePackageId)
        .sort((a, b) => a.slotNumber - b.slotNumber);
    } else if (scope === 'question_bank') {
      base = questions.filter((q) => q.inBank && q.reviewStatus === 'Approved');
    } else {
      base = questions.filter((q) => !q.inBank);
    }
    return base.filter((q) => q.stem.trim().length > 0);
  }, [questions, scope, activePackageId]);

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return scopedQuestions.filter((q) => {
      const matchesBloom = bloomFilter === 'all' || q.cognitiveLevelId === bloomFilter;
      if (!matchesBloom) return false;
      if (!query) return true;
      const topName = topics.find((t) => t.id === q.topicId)?.name.toLowerCase() ?? '';
      const loCode =
        learningOutcomes.find((l) => l.id === q.learningOutcomeId)?.code.toLowerCase() ?? '';
      const tagsText = (q.bloomTags ?? []).join(' ').toLowerCase();
      return (
        q.stem.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query) ||
        topName.includes(query) ||
        loCode.includes(query) ||
        tagsText.includes(query)
      );
    });
  }, [scopedQuestions, bloomFilter, search, topics, learningOutcomes]);

  const selectedSet = new Set(selectedIds);
  const visibleIds = filteredSources.map((q) => q.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const visibleSet = new Set(visibleIds);
      setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const totalDraftsToCreate = selectedIds.length * copiesPerQuestion;

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    const result = duplicateQuestionsToPackage(selectedIds, targetPackageId, {
      copiesPerQuestion,
      stemPrefix,
      markIncomplete,
      newPackageTitle,
    });
    if (result.createdIds.length > 0) {
      onDuplicated(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-2.5">
            <Copy className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bulk Duplicate Questions into New Draft Versions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy one or more existing questions as fresh draft slots while preserving taxonomy metadata and Bloom&apos;s Taxonomy tags.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bulk duplication dialog"
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope & Filter Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'current_pkg', label: 'Current Package' },
                  { id: 'all_drafts', label: 'All Package Items' },
                  { id: 'question_bank', label: 'Approved Question Bank' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScope(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 ${
                    scope === tab.id
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600">
              <span>
                Selected: <strong className="text-slate-900">{selectedIds.length}</strong>
              </span>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-blue-700 hover:underline font-sans font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-7 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by question stem, topic, LO code, or Bloom tag..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={bloomFilter}
                onChange={(e) => setBloomFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Bloom&apos;s Levels</option>
                {orderedBlooms.map((b) => {
                  const meta = getBloomsMeta(b);
                  return (
                    <option key={b.id} value={b.id}>
                      {meta.code} · {meta.shortLabel}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                disabled={visibleIds.length === 0}
                onClick={toggleAllVisible}
                className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-lg whitespace-nowrap"
              >
                {allVisibleSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{allVisibleSelected ? 'Deselect All' : 'Select All'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Source Question Checklist */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {filteredSources.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No authored questions match the current scope and filters.
            </div>
          ) : (
            filteredSources.map((q) => {
              const checked = selectedSet.has(q.id);
              const topName = topics.find((t) => t.id === q.topicId)?.name ?? '';
              const loCode =
                learningOutcomes.find((l) => l.id === q.learningOutcomeId)?.code ?? '';
              const cogObj = cognitiveLevels.find((c) => c.id === q.cognitiveLevelId);
              const cogMeta = getBloomsMeta(cogObj);
              const difName =
                difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
              const qtCode =
                questionTypes.find((qt) => qt.id === q.questionTypeId)?.code ?? 'MCQ';
              const pkgTitle = packages.find((p) => p.id === q.packageId)?.title ?? '';

              return (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    checked
                      ? 'border-blue-500 bg-blue-50/40'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(q.id)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="font-mono tabular-nums text-slate-600">
                        <strong className="text-slate-900">
                          {q.inBank ? q.id : `Q${q.slotNumber}`}
                        </strong>{' '}
                        · v{q.version} · {qtCode} · {q.marks}m · {topName} ({loCode}) · {difName}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono ${cogMeta.badgeClass}`}
                      >
                        <strong>{cogMeta.code}</strong>
                        <span>{cogMeta.shortLabel}</span>
                      </span>
                    </div>

                    <MathRenderer
                      content={q.stem}
                      className="text-xs text-slate-900 line-clamp-2"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="truncate">{pkgTitle}</span>
                      {q.bloomTags && q.bloomTags.length > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono text-blue-700 shrink-0">
                          <Tag className="w-3 h-3" />
                          <span>{q.bloomTags.join(' · ')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Duplication Settings & Action Footer */}
        <form
          onSubmit={handleDuplicate}
          className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-5">
              <label className="font-semibold text-slate-700 block mb-1">
                Destination Authoring Package
              </label>
              <select
                value={targetPackageId}
                onChange={(e) => setTargetPackageId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                {editablePackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                  </option>
                ))}
                <option value="__NEW__">+ Create New Draft Package</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Copies / Item
              </label>
              <select
                value={copiesPerQuestion}
                onChange={(e) => setCopiesPerQuestion(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono tabular-nums"
              >
                <option value={1}>1× Copy</option>
                <option value={2}>2× Copies</option>
                <option value={3}>3× Copies</option>
              </select>
            </div>

            <div className="sm:col-span-5">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Optional Stem Prefix
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setStemPrefix((prev) =>
                      prev === '[Draft Copy] ' ? '' : '[Draft Copy] '
                    )
                  }
                  className="text-[11px] font-medium text-blue-700 hover:underline"
                >
                  {stemPrefix === '[Draft Copy] ' ? 'Clear prefix' : 'Use [Draft Copy]'}
                </button>
              </div>
              <input
                type="text"
                value={stemPrefix}
                onChange={(e) => setStemPrefix(e.target.value)}
                placeholder="Leave blank or e.g. [Variant] "
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          {targetPackageId === '__NEW__' && (
            <div className="text-xs">
              <label className="font-semibold text-slate-700 block mb-1">
                New Draft Package Title
              </label>
              <input
                type="text"
                value={newPackageTitle}
                onChange={(e) => setNewPackageTitle(e.target.value)}
                placeholder={`Draft Variants Package (${totalDraftsToCreate || 1} Qs)`}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={markIncomplete}
                  onChange={(e) => setMarkIncomplete(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Mark duplicated drafts as Incomplete until reviewed by Author</span>
              </label>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Preserves Topic, Learning Outcome, Difficulty, Marks, Question Type, and Bloom&apos;s Taxonomy tags.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg whitespace-nowrap shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>
                  Duplicate {totalDraftsToCreate > 0 ? `${totalDraftsToCreate} ` : ''}
                  {totalDraftsToCreate === 1 ? 'Draft' : 'Drafts'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
