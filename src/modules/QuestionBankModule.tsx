import React, { useMemo, useState } from 'react';
import {
  Search,
  Eye,
  X,
  CheckCircle2,
  History,
  Download,
  Printer,
  GitBranch,
  Edit3,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { QuestionItem, AnswerOption, QuestionVersionSnapshot } from '../types/examnova';
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
  onlyVersioned: boolean;
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
  onlyVersioned: false,
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
  {
    id: 'qb-preset-versioned',
    name: 'Amended Items (v2+)',
    filters: {
      ...DEFAULT_QB_FILTERS,
      onlyVersioned: true,
    },
    summary: 'Multi-Version Audit Trail (v2+)',
    savedAt: '2026-11-16',
  },
];

type InspectTab = 'overview' | 'history' | 'amend';

interface AmendDraftState {
  stem: string;
  options: AnswerOption[];
  correctOptionId: string;
  sampleAnswer: string;
  rationale: string;
  marks: number;
  topicId: string;
  learningOutcomeId: string;
  cognitiveLevelId: string;
  difficultyLevelId: string;
  bankAvailability: QuestionItem['bankAvailability'];
  reason: string;
}

const buildAmendDraft = (q: QuestionItem): AmendDraftState => ({
  stem: q.stem,
  options: q.options.map((o) => ({ ...o })),
  correctOptionId: q.correctOptionId,
  sampleAnswer: q.sampleAnswer || '',
  rationale: q.rationale,
  marks: q.marks,
  topicId: q.topicId,
  learningOutcomeId: q.learningOutcomeId,
  cognitiveLevelId: q.cognitiveLevelId,
  difficultyLevelId: q.difficultyLevelId,
  bankAvailability: q.bankAvailability,
  reason: '',
});

const getSortedSnapshots = (q: QuestionItem): QuestionVersionSnapshot[] => {
  const list = q.versionHistory && q.versionHistory.length > 0
    ? q.versionHistory
    : [
        {
          version: q.version,
          timestamp: q.updatedAt,
          actorName: 'System Baseline',
          actorRole: 'Audit Tracker',
          changeType: 'Initial Certification' as const,
          changeSummary: 'Certified baseline state.',
          changedFields: [],
          snapshot: {
            stem: q.stem,
            options: q.options,
            correctOptionId: q.correctOptionId,
            sampleAnswer: q.sampleAnswer,
            rationale: q.rationale,
            diagramSvg: q.diagramSvg,
            marks: q.marks,
            topicId: q.topicId,
            learningOutcomeId: q.learningOutcomeId,
            cognitiveLevelId: q.cognitiveLevelId,
            difficultyLevelId: q.difficultyLevelId,
            questionTypeId: q.questionTypeId,
            reviewStatus: q.reviewStatus,
            bankAvailability: q.bankAvailability,
          },
        },
      ];
  return [...list].sort((a, b) => b.version - a.version);
};

export const QuestionBankModule: React.FC = () => {
  const {
    currentRole,
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
    amendBankQuestion,
    restoreQuestionVersion,
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
    onlyVersioned,
  } = filters;

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [inspectTab, setInspectTab] = useState<InspectTab>('overview');
  const [selectedSnapshotVersion, setSelectedSnapshotVersion] = useState<number | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [amendDraft, setAmendDraft] = useState<AmendDraftState | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const canModifyBankVersions =
    currentRole === 'admin' ||
    currentRole === 'coordinator' ||
    currentRole === 'approver' ||
    currentRole === 'reviewer';

  const bankQuestions = useMemo(
    () => questions.filter((q) => q.inBank && q.reviewStatus === 'Approved'),
    [questions]
  );

  const totalSnapshotsCount = useMemo(
    () =>
      bankQuestions.reduce(
        (acc, q) => acc + (q.versionHistory?.length ? q.versionHistory.length : 1),
        0
      ),
    [bankQuestions]
  );

  const multiVersionCount = useMemo(
    () => bankQuestions.filter((q) => q.version > 1 || (q.versionHistory?.length ?? 0) > 1).length,
    [bankQuestions]
  );

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
    const matchesVersioned =
      !onlyVersioned || q.version > 1 || (q.versionHistory?.length ?? 0) > 1;
    return (
      matchesSearch &&
      matchesET &&
      matchesSubj &&
      matchesTop &&
      matchesLO &&
      matchesCog &&
      matchesDif &&
      matchesType &&
      matchesAvail &&
      matchesVersioned
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
  if (onlyVersioned) {
    activeFilterParts.push('Amended (v2+)');
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
    setFilters({ ...DEFAULT_QB_FILTERS, ...nextFilters });
    savedStore.recordRecent({ ...DEFAULT_QB_FILTERS, ...nextFilters }, summary || nextFilters.search || 'Saved Filter');
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

  const activePreview = useMemo(
    () => (previewId ? bankQuestions.find((q) => q.id === previewId) ?? null : null),
    [bankQuestions, previewId]
  );

  const openInspectModal = (q: QuestionItem, initialTab: InspectTab = 'overview') => {
    const snaps = getSortedSnapshots(q);
    setPreviewId(q.id);
    setInspectTab(initialTab);
    setSelectedSnapshotVersion(snaps[0]?.version ?? q.version);
    setRollbackReason('');
    setAmendDraft(buildAmendDraft(q));
  };

  const closeInspectModal = () => {
    setPreviewId(null);
    setInspectTab('overview');
    setSelectedSnapshotVersion(null);
    setRollbackReason('');
    setAmendDraft(null);
  };

  const sortedSnapshots = useMemo(
    () => (activePreview ? getSortedSnapshots(activePreview) : []),
    [activePreview]
  );

  const selectedSnapshot = useMemo(() => {
    if (!sortedSnapshots.length) return null;
    return (
      sortedSnapshots.find((s) => s.version === selectedSnapshotVersion) ??
      sortedSnapshots[0]
    );
  }, [sortedSnapshots, selectedSnapshotVersion]);

  // Reference comparison target:
  // If viewing an older historical snapshot, compare it against Current Live state;
  // If viewing the current (latest) snapshot and an earlier snapshot exists, compare against the immediate predecessor (vN-1).
  const comparisonContext = useMemo(() => {
    if (!activePreview || !selectedSnapshot) return null;
    const isLatest = selectedSnapshot.version === activePreview.version;
    if (!isLatest) {
      const latestSnap = sortedSnapshots[0];
      return {
        mode: 'vs_current' as const,
        leftLabel: `Historical Snapshot v${selectedSnapshot.version}`,
        rightLabel: `Current Active State v${activePreview.version}`,
        left: selectedSnapshot.snapshot,
        right: latestSnap
          ? latestSnap.snapshot
          : {
              stem: activePreview.stem,
              options: activePreview.options,
              correctOptionId: activePreview.correctOptionId,
              sampleAnswer: activePreview.sampleAnswer,
              rationale: activePreview.rationale,
              marks: activePreview.marks,
              topicId: activePreview.topicId,
              learningOutcomeId: activePreview.learningOutcomeId,
              cognitiveLevelId: activePreview.cognitiveLevelId,
              difficultyLevelId: activePreview.difficultyLevelId,
              questionTypeId: activePreview.questionTypeId,
              bankAvailability: activePreview.bankAvailability,
            },
      };
    }
    const predecessor = sortedSnapshots.find((s) => s.version < selectedSnapshot.version);
    if (predecessor) {
      return {
        mode: 'vs_previous' as const,
        leftLabel: `Previous Version v${predecessor.version}`,
        rightLabel: `Selected Version v${selectedSnapshot.version}`,
        left: predecessor.snapshot,
        right: selectedSnapshot.snapshot,
      };
    }
    return {
      mode: 'baseline' as const,
      leftLabel: `Baseline Snapshot v${selectedSnapshot.version}`,
      rightLabel: `Baseline Snapshot v${selectedSnapshot.version}`,
      left: selectedSnapshot.snapshot,
      right: selectedSnapshot.snapshot,
    };
  }, [activePreview, selectedSnapshot, sortedSnapshots]);

  const draftChangedFields = useMemo(() => {
    if (!activePreview || !amendDraft) return [];
    const changed: string[] = [];
    if (amendDraft.stem !== activePreview.stem) changed.push('Stem');
    if (JSON.stringify(amendDraft.options) !== JSON.stringify(activePreview.options)) {
      changed.push('Options');
    }
    if (amendDraft.correctOptionId !== activePreview.correctOptionId) {
      changed.push('Correct Answer');
    }
    if ((amendDraft.sampleAnswer || '') !== (activePreview.sampleAnswer || '')) {
      changed.push('Sample Answer');
    }
    if (amendDraft.rationale !== activePreview.rationale) changed.push('Solution Rationale');
    if (Number(amendDraft.marks) !== activePreview.marks) changed.push('Marks');
    if (amendDraft.topicId !== activePreview.topicId) changed.push('Topic');
    if (amendDraft.learningOutcomeId !== activePreview.learningOutcomeId) {
      changed.push('Learning Outcome');
    }
    if (amendDraft.cognitiveLevelId !== activePreview.cognitiveLevelId) {
      changed.push('Cognitive Level');
    }
    if (amendDraft.difficultyLevelId !== activePreview.difficultyLevelId) {
      changed.push('Difficulty');
    }
    if (amendDraft.bankAvailability !== activePreview.bankAvailability) {
      changed.push('Availability');
    }
    return changed;
  }, [activePreview, amendDraft]);

  const handleSaveAmendment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePreview || !amendDraft) return;
    if (!amendDraft.stem.trim()) {
      notifyToast('Question stem cannot be empty.', 'warning');
      return;
    }
    const newVersion = amendBankQuestion(
      activePreview.id,
      {
        stem: amendDraft.stem,
        options: amendDraft.options,
        correctOptionId: amendDraft.correctOptionId,
        sampleAnswer: amendDraft.sampleAnswer,
        rationale: amendDraft.rationale,
        marks: Number(amendDraft.marks) || activePreview.marks,
        topicId: amendDraft.topicId,
        learningOutcomeId: amendDraft.learningOutcomeId,
        cognitiveLevelId: amendDraft.cognitiveLevelId,
        difficultyLevelId: amendDraft.difficultyLevelId,
        bankAvailability: amendDraft.bankAvailability,
      },
      amendDraft.reason
    );
    if (newVersion) {
      setSelectedSnapshotVersion(newVersion);
      setInspectTab('history');
      setAmendDraft({
        ...amendDraft,
        reason: '',
      });
    }
  };

  const handleRestoreSnapshot = (targetVersion: number) => {
    if (!activePreview) return;
    const newVersion = restoreQuestionVersion(
      activePreview.id,
      targetVersion,
      rollbackReason
    );
    if (newVersion) {
      setSelectedSnapshotVersion(newVersion);
      setRollbackReason('');
      setAmendDraft(null);
    }
  };

  const resolveOptionText = (
    opts: AnswerOption[],
    id: string
  ): string => {
    const found = opts.find((o) => o.id === id);
    return found ? `${found.label}. ${found.content}` : id || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Approved Question Bank</h1>
          <p className="text-sm text-slate-500">
            Certified assessment items with automatic immutable versioning and historical audit snapshots.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="text-xs font-mono tabular-nums text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
            <strong>{filtered.length}</strong>/{bankQuestions.length} Items ·{' '}
            <strong>{totalSnapshotsCount}</strong> Snapshots ·{' '}
            <strong>{multiVersionCount}</strong> Amended (v2+)
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
          <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0 select-none">
            <input
              type="checkbox"
              checked={onlyVersioned}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, onlyVersioned: e.target.checked }))
              }
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            <span>Amended Only (v2+)</span>
          </label>
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
              <th className="py-3 px-4">ID · Version Audit</th>
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
                const snapCount = q.versionHistory?.length ? q.versionHistory.length : 1;

                return (
                  <tr key={q.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{q.id}</div>
                      <div className="text-[11px] text-slate-500">
                        <span className={q.version > 1 ? 'text-blue-700 font-semibold' : 'text-slate-600'}>
                          v{q.version}
                        </span>{' '}
                        · {snapCount} {snapCount === 1 ? 'snapshot' : 'snapshots'}
                      </div>
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
                          onClick={() => openInspectModal(q, 'overview')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openInspectModal(q, 'history')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                          title="Inspect Immutable Version Snapshots & Audit Diff"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Audit ({snapCount})</span>
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

      {/* Live-Synced Inspection, Auto-Version Audit & Amendment Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  {activePreview.id} · Active Version v{activePreview.version} ·{' '}
                  {sortedSnapshots.length}{' '}
                  {sortedSnapshots.length === 1 ? 'Immutable Snapshot' : 'Immutable Snapshots'}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {questionTypes.find((qt) => qt.id === activePreview.questionTypeId)?.name ?? 'MCQ'} ·{' '}
                  {subjects.find((s) => s.id === activePreview.subjectId)?.name} ·{' '}
                  {topics.find((t) => t.id === activePreview.topicId)?.name} ·{' '}
                  {cognitiveLevels.find((c) => c.id === activePreview.cognitiveLevelId)?.name} ·{' '}
                  {difficultyLevels.find((d) => d.id === activePreview.difficultyLevelId)?.name} ·{' '}
                  {activePreview.marks} Marks · {activePreview.bankAvailability}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDirectBankPdf(
                      [activePreview],
                      `Single Certified Item (${activePreview.id} v${activePreview.version})`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={closeInspectModal}
                  aria-label="Close inspection modal"
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tab Bar */}
            <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setInspectTab('overview')}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 ${
                  inspectTab === 'overview'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Certified Item (v{activePreview.version})</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectTab('history')}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 ${
                  inspectTab === 'history'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Version History & Audit Diff ({sortedSnapshots.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAmendDraft(buildAmendDraft(activePreview));
                  setInspectTab('amend');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 ${
                  inspectTab === 'amend'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Amend & Auto-Version</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: OVERVIEW */}
              {inspectTab === 'overview' && (
                <>
                  <MathRenderer content={activePreview.stem} className="text-base text-slate-900" />
                  {activePreview.diagramSvg && (
                    <div
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: activePreview.diagramSvg }}
                    />
                  )}
                  {activePreview.questionTypeId === 'qt-short' || activePreview.options.length === 0 ? (
                    <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                        Expected Sample Answer / Marking Rubric
                      </div>
                      <MathRenderer
                        content={activePreview.sampleAnswer || 'No sample answer recorded.'}
                        className="text-sm text-slate-900"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(activePreview.questionTypeId === 'qt-tf'
                        ? activePreview.options.slice(0, 2)
                        : activePreview.options
                      ).map((opt) => {
                        const isKey = opt.id === activePreview.correctOptionId;
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
                    <MathRenderer content={activePreview.rationale} className="text-xs text-slate-700" />
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Last updated <span className="font-mono tabular-nums">{activePreview.updatedAt}</span> ·{' '}
                      {sortedSnapshots.length} preserved historical{' '}
                      {sortedSnapshots.length === 1 ? 'state' : 'states'}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setInspectTab('history')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Inspect Historical States</span>
                      </button>
                      {canModifyBankVersions && (
                        <button
                          type="button"
                          onClick={() => {
                            setAmendDraft(buildAmendDraft(activePreview));
                            setInspectTab('amend');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Amend & Bump to v{activePreview.version + 1}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: VERSION HISTORY & DIFF */}
              {inspectTab === 'history' && selectedSnapshot && comparisonContext && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Immutable Version Timeline */}
                  <div className="lg:col-span-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Immutable Version Timeline</span>
                      <span className="font-mono tabular-nums text-slate-400">
                        Newest first
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sortedSnapshots.map((snap) => {
                        const isSelected = snap.version === selectedSnapshot.version;
                        const isCurrentLive = snap.version === activePreview.version;
                        return (
                          <button
                            key={snap.version}
                            type="button"
                            onClick={() => {
                              setSelectedSnapshotVersion(snap.version);
                              setRollbackReason('');
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/40'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono tabular-nums text-xs font-bold text-slate-900">
                                v{snap.version} · {snap.changeType}
                              </span>
                              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                                {isCurrentLive ? 'ACTIVE' : 'HISTORICAL'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                              {snap.timestamp} · {snap.actorName} ({snap.actorRole})
                            </div>
                            <div className="text-xs text-slate-700 mt-1.5 leading-snug">
                              {snap.changeSummary}
                            </div>
                            {snap.changedFields.length > 0 && (
                              <div className="text-[11px] font-mono text-blue-700 mt-1.5">
                                Modified: {snap.changedFields.join(' · ')}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legacy Event Log */}
                    <div className="pt-3 border-t border-slate-200 space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Lifecycle Event Log
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {[...activePreview.history].reverse().map((h) => (
                          <div
                            key={h.id}
                            className="text-[11px] text-slate-600 flex items-start justify-between gap-2 py-1 border-b border-slate-100 last:border-0"
                          >
                            <div>
                              <span className="font-medium text-slate-800">{h.action}</span>{' '}
                              <span className="text-slate-500">— {h.actorName}</span>
                              {h.comment && (
                                <div className="text-slate-500 mt-0.5">{h.comment}</div>
                              )}
                            </div>
                            <span className="font-mono tabular-nums text-slate-400 shrink-0">
                              {h.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Preserved Historical Snapshot & Diff Inspector */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                            Snapshot State v{selectedSnapshot.version}
                            {selectedSnapshot.version === activePreview.version
                              ? ' (Current Active Version)'
                              : ` · Archived Historical State`}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {comparisonContext.mode === 'vs_current' && (
                              <span>
                                Comparing <strong className="text-slate-800">{comparisonContext.leftLabel}</strong>{' '}
                                <ArrowRight className="w-3 h-3 inline mx-0.5" />{' '}
                                <strong className="text-slate-800">{comparisonContext.rightLabel}</strong>
                              </span>
                            )}
                            {comparisonContext.mode === 'vs_previous' && (
                              <span>
                                Changes introduced from{' '}
                                <strong className="text-slate-800">{comparisonContext.leftLabel}</strong>{' '}
                                <ArrowRight className="w-3 h-3 inline mx-0.5" />{' '}
                                <strong className="text-slate-800">{comparisonContext.rightLabel}</strong>
                              </span>
                            )}
                            {comparisonContext.mode === 'baseline' && (
                              <span>Initial certified snapshot recorded at creation into bank.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rollback Banner for Historical Snapshots */}
                      {selectedSnapshot.version !== activePreview.version && (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              Audit Rollback (Forward-Only Immutable Restore)
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-slate-500">
                              v{selectedSnapshot.version} → v{activePreview.version + 1}
                            </span>
                          </div>
                          {canModifyBankVersions ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={rollbackReason}
                                onChange={(e) => setRollbackReason(e.target.value)}
                                placeholder={`Audit reason to restore v${selectedSnapshot.version} (optional)...`}
                                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleRestoreSnapshot(selectedSnapshot.version)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>
                                  Restore v{selectedSnapshot.version} as v{activePreview.version + 1}
                                </span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500">
                              Switch to Admin, Coordinator, Question Approver, or Question Reviewer to restore historical versions.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Side-by-side / Field Diff */}
                      <div className="space-y-3 text-xs">
                        {/* Stem */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">Question Stem</span>
                            {comparisonContext.left.stem !== comparisonContext.right.stem ? (
                              <span className="font-mono text-[11px] font-semibold text-amber-700">
                                MODIFIED
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-400">UNCHANGED</span>
                            )}
                          </div>
                          {comparisonContext.mode !== 'baseline' &&
                          comparisonContext.left.stem !== comparisonContext.right.stem ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
                                <div className="text-[10px] font-mono uppercase text-amber-800 mb-1">
                                  {comparisonContext.leftLabel}
                                </div>
                                <MathRenderer content={comparisonContext.left.stem} className="text-xs text-slate-900" />
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200">
                                <div className="text-[10px] font-mono uppercase text-emerald-800 mb-1">
                                  {comparisonContext.rightLabel}
                                </div>
                                <MathRenderer content={comparisonContext.right.stem} className="text-xs text-slate-900" />
                              </div>
                            </div>
                          ) : (
                            <MathRenderer content={selectedSnapshot.snapshot.stem} className="text-xs text-slate-900" />
                          )}
                        </div>

                        {/* Options / Answer Key or Sample Answer */}
                        {selectedSnapshot.snapshot.questionTypeId === 'qt-short' ||
                        selectedSnapshot.snapshot.options.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-700">Sample Answer</span>
                              {(comparisonContext.left.sampleAnswer || '') !==
                              (comparisonContext.right.sampleAnswer || '') ? (
                                <span className="font-mono text-[11px] font-semibold text-amber-700">
                                  MODIFIED
                                </span>
                              ) : (
                                <span className="font-mono text-[11px] text-slate-400">UNCHANGED</span>
                              )}
                            </div>
                            <MathRenderer
                              content={selectedSnapshot.snapshot.sampleAnswer || 'No sample answer recorded.'}
                              className="text-xs text-slate-800"
                            />
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-700">
                                Options & Correct Answer Key
                              </span>
                              {JSON.stringify(comparisonContext.left.options) !==
                                JSON.stringify(comparisonContext.right.options) ||
                              comparisonContext.left.correctOptionId !==
                                comparisonContext.right.correctOptionId ? (
                                <span className="font-mono text-[11px] font-semibold text-amber-700">
                                  MODIFIED
                                </span>
                              ) : (
                                <span className="font-mono text-[11px] text-slate-400">UNCHANGED</span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {selectedSnapshot.snapshot.options.map((opt) => {
                                const isKey = opt.id === selectedSnapshot.snapshot.correctOptionId;
                                return (
                                  <div
                                    key={opt.id}
                                    className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 ${
                                      isKey
                                        ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                                        : 'border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-mono font-bold">{opt.label}.</span>
                                    <div className="flex-1 truncate">
                                      <MathRenderer content={opt.content} />
                                    </div>
                                    {isKey && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                            {comparisonContext.mode !== 'baseline' &&
                              comparisonContext.left.correctOptionId !==
                                comparisonContext.right.correctOptionId && (
                                <div className="text-[11px] font-mono text-amber-800 pt-1">
                                  Key changed:{' '}
                                  {resolveOptionText(
                                    comparisonContext.left.options,
                                    comparisonContext.left.correctOptionId
                                  )}{' '}
                                  →{' '}
                                  {resolveOptionText(
                                    comparisonContext.right.options,
                                    comparisonContext.right.correctOptionId
                                  )}
                                </div>
                              )}
                          </div>
                        )}

                        {/* Solution Rationale */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">Solution Rationale</span>
                            {comparisonContext.left.rationale !== comparisonContext.right.rationale ? (
                              <span className="font-mono text-[11px] font-semibold text-amber-700">
                                MODIFIED
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-400">UNCHANGED</span>
                            )}
                          </div>
                          {comparisonContext.mode !== 'baseline' &&
                          comparisonContext.left.rationale !== comparisonContext.right.rationale ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
                                <div className="text-[10px] font-mono uppercase text-amber-800 mb-1">
                                  {comparisonContext.leftLabel}
                                </div>
                                <MathRenderer content={comparisonContext.left.rationale} className="text-xs text-slate-800" />
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200">
                                <div className="text-[10px] font-mono uppercase text-emerald-800 mb-1">
                                  {comparisonContext.rightLabel}
                                </div>
                                <MathRenderer content={comparisonContext.right.rationale} className="text-xs text-slate-800" />
                              </div>
                            </div>
                          ) : (
                            <MathRenderer content={selectedSnapshot.snapshot.rationale} className="text-xs text-slate-700" />
                          )}
                        </div>

                        {/* Metadata Matrix */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="font-semibold text-slate-700 mb-2">
                            Taxonomy & Governance Snapshot
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Marks</span>
                              <span className="font-mono tabular-nums font-semibold text-slate-900">
                                {selectedSnapshot.snapshot.marks}
                                {comparisonContext.mode !== 'baseline' &&
                                comparisonContext.left.marks !== comparisonContext.right.marks
                                  ? ` (${comparisonContext.left.marks} → ${comparisonContext.right.marks})`
                                  : ''}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Availability</span>
                              <span className="font-medium text-slate-900">
                                {selectedSnapshot.snapshot.bankAvailability}
                                {comparisonContext.mode !== 'baseline' &&
                                comparisonContext.left.bankAvailability !==
                                  comparisonContext.right.bankAvailability
                                  ? ` (${comparisonContext.left.bankAvailability} → ${comparisonContext.right.bankAvailability})`
                                  : ''}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Topic</span>
                              <span className="font-medium text-slate-900">
                                {topics.find((t) => t.id === selectedSnapshot.snapshot.topicId)?.name ?? 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Learning Outcome</span>
                              <span className="font-mono text-slate-900">
                                {learningOutcomes.find(
                                  (l) => l.id === selectedSnapshot.snapshot.learningOutcomeId
                                )?.code ?? 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Cognitive</span>
                              <span className="font-medium text-slate-900">
                                {cognitiveLevels.find(
                                  (c) => c.id === selectedSnapshot.snapshot.cognitiveLevelId
                                )?.name ?? 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Difficulty</span>
                              <span className="font-medium text-slate-900">
                                {difficultyLevels.find(
                                  (d) => d.id === selectedSnapshot.snapshot.difficultyLevelId
                                )?.name ?? 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AMEND & AUTO-VERSION */}
              {inspectTab === 'amend' && amendDraft && (
                <>
                  {!canModifyBankVersions ? (
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">
                          Governance Role Required for Bank Amendments
                        </div>
                        <p className="mt-0.5">
                          To preserve certification integrity, only Admin, Coordinator, Question Approver, or Question Reviewer roles can amend active bank items and generate new auto-incremented versions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAmendment} className="space-y-4">
                      {/* Auto-version preview bar */}
                      <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 font-mono tabular-nums">
                            Auto-Version Target: v{activePreview.version} → v{activePreview.version + 1}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Prior snapshot v{activePreview.version} will remain permanently archived in audit history.
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-slate-700">
                          {draftChangedFields.length > 0
                            ? `Detected Changes: ${draftChangedFields.join(' · ')}`
                            : 'No field modifications detected yet'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Question Stem (supports LaTeX $...$)
                        </label>
                        <textarea
                          rows={3}
                          value={amendDraft.stem}
                          onChange={(e) =>
                            setAmendDraft({ ...amendDraft, stem: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                            Rendered Stem Preview
                          </div>
                          <MathRenderer content={amendDraft.stem} className="text-xs text-slate-900" />
                        </div>
                      </div>

                      {/* Options or Sample Answer */}
                      {activePreview.questionTypeId === 'qt-short' ||
                      amendDraft.options.length === 0 ? (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">
                            Expected Sample Answer / Marking Rubric
                          </label>
                          <textarea
                            rows={2}
                            value={amendDraft.sampleAnswer}
                            onChange={(e) =>
                              setAmendDraft({ ...amendDraft, sampleAnswer: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 block">
                            Answer Options & Correct Key
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(activePreview.questionTypeId === 'qt-tf'
                              ? amendDraft.options.slice(0, 2)
                              : amendDraft.options
                            ).map((opt, idx) => {
                              const isKey = opt.id === amendDraft.correctOptionId;
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                                    isKey
                                      ? 'border-emerald-300 bg-emerald-50/40'
                                      : 'border-slate-200 bg-white'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="amend-correct-option"
                                    checked={isKey}
                                    onChange={() =>
                                      setAmendDraft({ ...amendDraft, correctOptionId: opt.id })
                                    }
                                    title="Mark as correct answer"
                                  />
                                  <span className="font-mono text-xs font-bold text-slate-700">
                                    {opt.label}.
                                  </span>
                                  <input
                                    type="text"
                                    value={opt.content}
                                    onChange={(e) => {
                                      const nextOpts = amendDraft.options.map((o, i) =>
                                        i === idx ? { ...o, content: e.target.value } : o
                                      );
                                      setAmendDraft({ ...amendDraft, options: nextOpts });
                                    }}
                                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Solution Rationale
                        </label>
                        <textarea
                          rows={2}
                          value={amendDraft.rationale}
                          onChange={(e) =>
                            setAmendDraft({ ...amendDraft, rationale: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Marks</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={amendDraft.marks}
                            onChange={(e) =>
                              setAmendDraft({ ...amendDraft, marks: Number(e.target.value) || 1 })
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Bank Availability
                          </label>
                          <select
                            value={amendDraft.bankAvailability}
                            onChange={(e) =>
                              setAmendDraft({
                                ...amendDraft,
                                bankAvailability: e.target.value as QuestionItem['bankAvailability'],
                              })
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="Available">Available</option>
                            <option value="Used in Active Exam">Used in Active Exam</option>
                            <option value="Reserved">Reserved</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Cognitive Level
                          </label>
                          <select
                            value={amendDraft.cognitiveLevelId}
                            onChange={(e) =>
                              setAmendDraft({ ...amendDraft, cognitiveLevelId: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            {cognitiveLevels.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Difficulty
                          </label>
                          <select
                            value={amendDraft.difficultyLevelId}
                            onChange={(e) =>
                              setAmendDraft({ ...amendDraft, difficultyLevelId: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            {difficultyLevels.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Topic</label>
                          <select
                            value={amendDraft.topicId}
                            onChange={(e) => {
                              const nextTopic = e.target.value;
                              const firstLo = learningOutcomes.find((l) => l.topicId === nextTopic);
                              setAmendDraft({
                                ...amendDraft,
                                topicId: nextTopic,
                                learningOutcomeId: firstLo ? firstLo.id : amendDraft.learningOutcomeId,
                              });
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            {topics
                              .filter((t) => t.subjectId === activePreview.subjectId)
                              .map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Learning Outcome
                          </label>
                          <select
                            value={amendDraft.learningOutcomeId}
                            onChange={(e) =>
                              setAmendDraft({ ...amendDraft, learningOutcomeId: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            {learningOutcomes
                              .filter((l) => l.topicId === amendDraft.topicId)
                              .map((l) => (
                                <option key={l.id} value={l.id}>{l.code}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Audit Change Reason
                        </label>
                        <input
                          type="text"
                          value={amendDraft.reason}
                          onChange={(e) =>
                            setAmendDraft({ ...amendDraft, reason: e.target.value })
                          }
                          placeholder="Document rationale for this amendment (recorded in immutable audit log)..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setInspectTab('overview')}
                          className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap shrink-0"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={draftChangedFields.length === 0}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg whitespace-nowrap shrink-0"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Save & Auto-Version to v{activePreview.version + 1}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
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

