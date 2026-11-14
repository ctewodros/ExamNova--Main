import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Send,
  RotateCcw,
  Award,
  Printer,
  X,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { Blueprint, Examination } from '../types/examnova';
import { StatusText } from '../components/StatusText';
import { MathRenderer } from '../components/MathRenderer';

function computeExamValidation(exam: Examination, bp: Blueprint | undefined, allQuestions: ReturnType<typeof useExamNova>['questions']) {
  if (!bp) {
    return {
      isValid: false,
      totalSelected: 0,
      totalMarks: 0,
      rowChecks: [],
      passedChecks: 0,
      totalChecks: 1,
      pct: 0,
    };
  }

  const selectedItems = exam.selectedQuestionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  const totalSelected = selectedItems.length;
  const totalMarks = selectedItems.reduce((acc, q) => acc + q.marks, 0);

  const rowChecks = bp.tosRows.map((row) => {
    const matched = selectedItems.filter(
      (q) =>
        q.topicId === row.topicId &&
        q.cognitiveLevelId === row.cognitiveLevelId &&
        q.difficultyLevelId === row.difficultyLevelId
    ).length;
    return {
      row,
      required: row.questionCount,
      matched,
      satisfied: matched === row.questionCount,
    };
  });

  const qtyOk = totalSelected === bp.totalQuestions;
  const marksOk = totalMarks === bp.totalMarks;
  const allRowsOk = rowChecks.every((r) => r.satisfied);
  const passedChecks = (qtyOk ? 1 : 0) + (marksOk ? 1 : 0) + rowChecks.filter((r) => r.satisfied).length;
  const totalChecks = 2 + rowChecks.length;
  const pct = totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return {
    isValid: qtyOk && marksOk && allRowsOk,
    totalSelected,
    totalMarks,
    rowChecks,
    passedChecks,
    totalChecks,
    pct,
  };
}

const ExamPaperPreviewModal: React.FC<{
  exam: Examination;
  onClose: () => void;
}> = ({ exam, onClose }) => {
  const { blueprints, subjects, examTypes, questions, topics } = useExamNova();
  const [showKey, setShowKey] = useState(false);

  const bp = blueprints.find((b) => b.id === exam.blueprintId);
  const subj = subjects.find((s) => s.id === exam.subjectId)?.name ?? '';
  const et = examTypes.find((e) => e.id === exam.examTypeId)?.name ?? '';
  const selectedItems = exam.selectedQuestionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-900">Examination Paper Preview</span>
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showKey}
                onChange={(e) => setShowKey(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Show Answer Key & Rationales</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Paper</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          {/* Exam Header Sheet */}
          <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1.5">
            <div className="text-xs font-semibold tracking-wider text-slate-500">{et}</div>
            <h2 className="text-xl font-bold text-slate-900">{exam.title}</h2>
            <div className="text-xs text-slate-700 font-medium tabular-nums">
              Subject: {subj} · Code: <span className="font-mono">{exam.code}</span> · Duration:{' '}
              {bp?.durationMinutes ?? 60} Minutes · Total Marks: {bp?.totalMarks ?? 40} · Pass Mark: {bp?.passMark ?? 20}
            </div>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto pt-2">{exam.instructions}</p>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {selectedItems.map((q, idx) => (
              <div key={q.id} className="space-y-2.5 pb-5 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="font-mono font-bold text-sm text-slate-900 shrink-0">{idx + 1}.</span>
                    <MathRenderer content={q.stem} className="text-sm text-slate-900" />
                  </div>
                  <span className="font-mono text-xs text-slate-500 shrink-0 tabular-nums">
                    [{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]
                  </span>
                </div>

                {q.diagramSvg && (
                  <div className="pl-6 py-2" dangerouslySetInnerHTML={{ __html: q.diagramSvg }} />
                )}

                <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const isKey = opt.id === q.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-2 px-3 py-1.5 rounded text-xs ${
                          showKey && isKey
                            ? 'bg-emerald-50 border border-emerald-300 font-semibold text-emerald-950'
                            : 'text-slate-800'
                        }`}
                      >
                        <span className="font-mono font-semibold">{opt.label}.</span>
                        <MathRenderer content={opt.content} className="text-xs" />
                      </div>
                    );
                  })}
                </div>

                {showKey && (
                  <div className="ml-6 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">
                      Key ({topics.find((t) => t.id === q.topicId)?.name}):
                    </span>{' '}
                    <MathRenderer content={q.rationale} className="inline text-xs" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExamAssemblyView: React.FC = () => {
  const {
    blueprints,
    examinations,
    questions,
    topics,
    cognitiveLevels,
    difficultyLevels,
    subjects,
    selectedExamId,
    setSelectedExamId,
    createExamination,
    updateExamQuestions,
    submitExamForReview,
    notifyToast,
  } = useExamNova();

  const activeBlueprints = blueprints.filter((b) => b.status === 'Active');
  const editableExams = examinations.filter(
    (e) => e.status === 'In Assembly' || e.status === 'Returned for Revision'
  );
  const currentExam =
    examinations.find((e) => e.id === selectedExamId) || editableExams[0] || examinations[0];

  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newBpId, setNewBpId] = useState(activeBlueprints[0]?.id ?? '');
  const [newInstr, setNewInstr] = useState(
    'Answer all questions. Each multiple-choice item carries 2 marks.'
  );
  const [filterTopicId, setFilterTopicId] = useState<string>('all');
  const [filterDifId, setFilterDifId] = useState<string>('all');

  const bp = blueprints.find((b) => b.id === currentExam?.blueprintId);
  const val = currentExam ? computeExamValidation(currentExam, bp, questions) : null;

  const eligibleBank = questions.filter(
    (q) =>
      q.inBank &&
      q.reviewStatus === 'Approved' &&
      (!currentExam || q.subjectId === currentExam.subjectId) &&
      (filterTopicId === 'all' || q.topicId === filterTopicId) &&
      (filterDifId === 'all' || q.difficultyLevelId === filterDifId)
  );

  const canEdit =
    currentExam &&
    (currentExam.status === 'In Assembly' || currentExam.status === 'Returned for Revision');

  const toggleQuestion = (qId: string) => {
    if (!currentExam || !canEdit) return;
    const exists = currentExam.selectedQuestionIds.includes(qId);
    const next = exists
      ? currentExam.selectedQuestionIds.filter((id) => id !== qId)
      : [...currentExam.selectedQuestionIds, qId];
    updateExamQuestions(currentExam.id, next);
  };

  const handleAutoMatchRemaining = () => {
    if (!currentExam || !bp || !canEdit) return;
    const chosen = new Set(currentExam.selectedQuestionIds);
    const pool = questions.filter(
      (q) => q.inBank && q.reviewStatus === 'Approved' && q.subjectId === currentExam.subjectId
    );

    bp.tosRows.forEach((row) => {
      let currentMatchCount = Array.from(chosen).filter((id) => {
        const q = pool.find((item) => item.id === id);
        return (
          q &&
          q.topicId === row.topicId &&
          q.cognitiveLevelId === row.cognitiveLevelId &&
          q.difficultyLevelId === row.difficultyLevelId
        );
      }).length;

      for (const candidate of pool) {
        if (currentMatchCount >= row.questionCount) break;
        if (chosen.has(candidate.id)) continue;
        if (
          candidate.topicId === row.topicId &&
          candidate.cognitiveLevelId === row.cognitiveLevelId &&
          candidate.difficultyLevelId === row.difficultyLevelId
        ) {
          chosen.add(candidate.id);
          currentMatchCount++;
        }
      }
    });

    updateExamQuestions(currentExam.id, Array.from(chosen));
    notifyToast('Matched remaining blueprint requirement slots from certified Question Bank.');
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim() || !newBpId) return;
    const createdId = createExamination({
      title: newTitle.trim(),
      code: newCode.trim().toUpperCase(),
      blueprintId: newBpId,
      instructions: newInstr.trim(),
    });
    setSelectedExamId(createdId);
    setCreateOpen(false);
    setNewTitle('');
    setNewCode('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Exam Creation & Assembly Workspace</h1>
          <p className="text-sm text-slate-500">
            Assemble examinations strictly from certified Question Bank items and validate against active blueprint requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentExam?.id || ''}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white max-w-xs"
          >
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.code} — {ex.title} [{ex.status}]
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Exam</span>
          </button>
        </div>
      </div>

      {currentExam && bp && val && (
        <>
          {/* Validation & Actions Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{currentExam.code}</span>
                  <h2 className="text-base font-bold text-slate-900">{currentExam.title}</h2>
                  <StatusText status={currentExam.status} />
                </div>
                <div className="text-xs text-slate-500 mt-1 tabular-nums">
                  Blueprint: {bp.title} ({bp.code}) · Selected:{' '}
                  <strong className="font-mono text-slate-900">
                    {val.totalSelected} / {bp.totalQuestions}
                  </strong>{' '}
                  Qs · Marks:{' '}
                  <strong className="font-mono text-slate-900">
                    {val.totalMarks} / {bp.totalMarks}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Exam Paper</span>
                </button>

                {canEdit && (
                  <>
                    <button
                      type="button"
                      onClick={handleAutoMatchRemaining}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Match Remaining Slots</span>
                    </button>
                    <button
                      type="button"
                      disabled={!val.isValid}
                      onClick={() => submitExamForReview(currentExam.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg ${
                        val.isValid
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Exam Review</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {currentExam.reviewComment && currentExam.status === 'Returned for Revision' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                <strong>Reviewer Feedback:</strong> {currentExam.reviewComment}
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Blueprint Validation Compliance (Quantities, Marks, Topics, Difficulty & Cognitive)</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">{val.pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${val.isValid ? 'bg-emerald-600' : 'bg-blue-600'}`}
                  style={{ width: `${val.pct}%` }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                  <div className="font-semibold text-slate-700 mb-1">Topic Coverage</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 tabular-nums">
                    {Array.from(new Set(bp.tosRows.map((r) => r.topicId))).map((tId) => {
                      const req = bp.tosRows.filter((r) => r.topicId === tId).reduce((a, r) => a + r.questionCount, 0);
                      const sel = currentExam.selectedQuestionIds.filter((id) => questions.find((q) => q.id === id)?.topicId === tId).length;
                      return (
                        <span key={tId} className={sel === req ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                          {topics.find((t) => t.id === tId)?.name}: {sel}/{req}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                  <div className="font-semibold text-slate-700 mb-1">Difficulty Balance</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 tabular-nums">
                    {Array.from(new Set(bp.tosRows.map((r) => r.difficultyLevelId))).map((dId) => {
                      const req = bp.tosRows.filter((r) => r.difficultyLevelId === dId).reduce((a, r) => a + r.questionCount, 0);
                      const sel = currentExam.selectedQuestionIds.filter((id) => questions.find((q) => q.id === id)?.difficultyLevelId === dId).length;
                      return (
                        <span key={dId} className={sel === req ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                          {difficultyLevels.find((d) => d.id === dId)?.name}: {sel}/{req}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                  <div className="font-semibold text-slate-700 mb-1">Cognitive Distribution</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 tabular-nums">
                    {Array.from(new Set(bp.tosRows.map((r) => r.cognitiveLevelId))).map((cId) => {
                      const req = bp.tosRows.filter((r) => r.cognitiveLevelId === cId).reduce((a, r) => a + r.questionCount, 0);
                      const sel = currentExam.selectedQuestionIds.filter((id) => questions.find((q) => q.id === id)?.cognitiveLevelId === cId).length;
                      return (
                        <span key={cId} className={sel === req ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                          {cognitiveLevels.find((c) => c.id === cId)?.name}: {sel}/{req}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Visual Assembly Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Blueprint Requirement Slots + Selected Items */}
            <div className="xl:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Blueprint Requirement Slots</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTopicId('all');
                      setFilterDifId('all');
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset Slot Filter
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {val.rowChecks.map(({ row, required, matched, satisfied }) => {
                    const topName = topics.find((t) => t.id === row.topicId)?.name;
                    const cogName = cognitiveLevels.find((c) => c.id === row.cognitiveLevelId)?.name;
                    const difName = difficultyLevels.find((d) => d.id === row.difficultyLevelId)?.name;

                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => {
                          setFilterTopicId(row.topicId);
                          setFilterDifId(row.difficultyLevelId);
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-xs">
                          <div className="font-semibold text-slate-900">{topName}</div>
                          <div className="text-slate-500">
                            {cogName} · {difName} · {row.marksPerQuestion}m each
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono tabular-nums text-xs font-semibold ${
                              satisfied ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {matched} / {required}
                          </span>
                          {satisfied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currently Selected Questions Summary */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    Assembled Exam Items ({currentExam.selectedQuestionIds.length})
                  </h3>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {currentExam.selectedQuestionIds.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500">No items selected yet. Choose from eligible Question Bank items on the right.</div>
                  ) : (
                    currentExam.selectedQuestionIds.map((qId, idx) => {
                      const q = questions.find((item) => item.id === qId);
                      if (!q) return null;
                      return (
                        <div key={qId} className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="font-mono font-semibold text-slate-600 mr-2">#{idx + 1}</span>
                            <span className="text-slate-800 truncate">
                              {topics.find((t) => t.id === q.topicId)?.name} ({q.id})
                            </span>
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => toggleQuestion(qId)}
                              className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                              title="Remove from exam"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Available Eligible Question Bank Items */}
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Eligible Question Bank Items ({eligibleBank.length})
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(e.target.value)}
                    className="px-2.5 py-1 border border-slate-200 rounded bg-white"
                  >
                    <option value="all">All Topics</option>
                    {topics
                      .filter((t) => t.subjectId === currentExam.subjectId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                  <select
                    value={filterDifId}
                    onChange={(e) => setFilterDifId(e.target.value)}
                    className="px-2.5 py-1 border border-slate-200 rounded bg-white"
                  >
                    <option value="all">All Difficulties</option>
                    {difficultyLevels.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                {eligibleBank.map((q) => {
                  const selected = currentExam.selectedQuestionIds.includes(q.id);
                  const top = topics.find((t) => t.id === q.topicId)?.name;
                  const cog = cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name;
                  const dif = difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                        selected ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="text-[11px] text-slate-500 font-medium tabular-nums">
                          <span className="font-mono text-slate-700">{q.id}</span> · {top} · {cog} · {dif} · {q.marks} Marks
                        </div>
                        <MathRenderer content={q.stem} className="text-xs text-slate-900" />
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => toggleQuestion(q.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                            selected
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {selected ? 'Selected ✓' : 'Add to Exam'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Examination Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleCreateExam} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Create New Examination</h3>
              <button type="button" onClick={() => setCreateOpen(false)} className="text-xs text-slate-500">Close</button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Active Blueprint</label>
                <select
                  value={newBpId}
                  onChange={(e) => setNewBpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {activeBlueprints.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.totalQuestions} Qs / {b.totalMarks} Marks)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Examination Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Grade 12 Mathematics Final Examination 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Code</label>
                <input
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="EX-MATH-2026-D"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={newInstr}
                  onChange={(e) => setNewInstr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-3.5 py-1.5 text-xs font-medium text-slate-600">Cancel</button>
              <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Initialize Assembly</button>
            </div>
          </form>
        </div>
      )}

      {previewOpen && currentExam && (
        <ExamPaperPreviewModal exam={currentExam} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
};

export const ExamReviewQueueView: React.FC = () => {
  const { examinations, blueprints, subjects, questions, reviewExamDecision } = useExamNova();
  const queue = examinations.filter((e) => e.status === 'Submitted for Review');
  const [selectedId, setSelectedId] = useState(queue[0]?.id ?? '');
  const [comment, setComment] = useState('Blueprint balance, readability, and marking scheme verified.');
  const [previewExam, setPreviewExam] = useState<Examination | null>(null);

  const activeExam = queue.find((e) => e.id === selectedId) || queue[0];
  const bp = blueprints.find((b) => b.id === activeExam?.blueprintId);
  const val = activeExam ? computeExamValidation(activeExam, bp, questions) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Exam Review Queue</h1>
        <p className="text-sm text-slate-500">
          Review assembled examination papers for psychometric balance, blueprint compliance, and formatting accuracy.
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          No examinations are currently awaiting Exam Review.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Examination:</label>
            <select
              value={activeExam?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
            >
              {queue.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.code} — {ex.title}
                </option>
              ))}
            </select>
          </div>

          {activeExam && bp && val && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-900">{activeExam.title}</h2>
                    <StatusText status={activeExam.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 tabular-nums">
                    {subjects.find((s) => s.id === activeExam.subjectId)?.name} · {val.totalSelected} / {bp.totalQuestions} Questions ·{' '}
                    {val.totalMarks} / {bp.totalMarks} Marks · Validation {val.pct}%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewExam(activeExam)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Exam Paper</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                placeholder="Enter Exam Reviewer evaluation notes..."
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => reviewExamDecision(activeExam.id, 'Pending Final Approval', comment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept & Forward to Exam Approver</span>
                </button>
                <button
                  type="button"
                  onClick={() => reviewExamDecision(activeExam.id, 'Returned for Revision', comment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return to Exam Developer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {previewExam && <ExamPaperPreviewModal exam={previewExam} onClose={() => setPreviewExam(null)} />}
    </div>
  );
};

export const ExamApprovalQueueView: React.FC = () => {
  const { examinations, blueprints, subjects, questions, approveExamDecision } = useExamNova();
  const queue = examinations.filter((e) => e.status === 'Pending Final Approval');
  const [selectedId, setSelectedId] = useState(queue[0]?.id ?? '');
  const [comment, setComment] = useState('Approved for official Exam Bank archival and institutional administration.');
  const [previewExam, setPreviewExam] = useState<Examination | null>(null);

  const activeExam = queue.find((e) => e.id === selectedId) || queue[0];
  const bp = blueprints.find((b) => b.id === activeExam?.blueprintId);
  const val = activeExam ? computeExamValidation(activeExam, bp, questions) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Final Examination Approval</h1>
        <p className="text-sm text-slate-500">
          Grant final academic authorization to release reviewed examination papers into the official Exam Bank.
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <Award className="w-8 h-8 text-emerald-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-900">All Pending Examinations Processed</div>
          <div className="text-xs text-slate-500">No examinations are currently awaiting final Exam Bank authorization.</div>
        </div>
      ) : (
        <div className="space-y-5">
          <select
            value={activeExam?.id || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
          >
            {queue.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.code} — {ex.title}
              </option>
            ))}
          </select>

          {activeExam && bp && val && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-900">{activeExam.title}</h2>
                    <StatusText status={activeExam.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 tabular-nums">
                    {subjects.find((s) => s.id === activeExam.subjectId)?.name} · {val.totalSelected} Questions ·{' '}
                    {val.totalMarks} Marks · Blueprint Compliance {val.pct}%
                  </div>
                  {activeExam.reviewComment && (
                    <div className="text-xs text-slate-700 mt-2">
                      <strong>Reviewer Note:</strong> {activeExam.reviewComment}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewExam(activeExam)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Official Paper</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => approveExamDecision(activeExam.id, 'Approved', comment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish to Exam Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => approveExamDecision(activeExam.id, 'Returned for Revision', comment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return for Revision</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {previewExam && <ExamPaperPreviewModal exam={previewExam} onClose={() => setPreviewExam(null)} />}
    </div>
  );
};

export const ExamBankView: React.FC = () => {
  const { examinations, blueprints, subjects, examTypes } = useExamNova();
  const approvedExams = examinations.filter((e) => e.status === 'Approved');
  const [previewExam, setPreviewExam] = useState<Examination | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Official Exam Bank</h1>
        <p className="text-sm text-slate-500">
          Certified, approved examinations ready for secure printing, scheduling, and institutional delivery.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-4">Code · Version</th>
              <th className="py-3 px-4">Examination Title</th>
              <th className="py-3 px-4">Exam Type · Subject</th>
              <th className="py-3 px-4 text-right">Items</th>
              <th className="py-3 px-4 text-right">Marks · Duration</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {approvedExams.map((ex) => {
              const bp = blueprints.find((b) => b.id === ex.blueprintId);
              const subj = subjects.find((s) => s.id === ex.subjectId)?.name ?? '';
              const et = examTypes.find((e) => e.id === ex.examTypeId)?.name ?? '';

              return (
                <tr key={ex.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {ex.code} <span className="text-slate-400">v{ex.version}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{ex.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {subj} · {et}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">
                    {ex.selectedQuestionIds.length}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {bp?.totalMarks ?? 40}m · {bp?.durationMinutes ?? 60}min
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusText status={ex.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setPreviewExam(ex)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Exam Paper</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewExam && <ExamPaperPreviewModal exam={previewExam} onClose={() => setPreviewExam(null)} />}
    </div>
  );
};
