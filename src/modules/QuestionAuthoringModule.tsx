import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Send,
  AlertCircle,
  History,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { StatusText } from '../components/StatusText';
import { RichMathEditor } from '../components/RichMathEditor';
import { MathRenderer } from '../components/MathRenderer';

export const QuestionRequirementsView: React.FC = () => {
  const {
    blueprints,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    questions,
    setActiveModule,
  } = useExamNova();

  const activeBlueprints = blueprints.filter((b) => b.status === 'Active' && b.requirementsGenerated);
  const [selectedBpId, setSelectedBpId] = useState(activeBlueprints[0]?.id ?? '');
  const bp = activeBlueprints.find((b) => b.id === selectedBpId) || activeBlueprints[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Operational Question Requirements</h1>
          <p className="text-sm text-slate-500">
            Requirements derived automatically from active approved blueprints, compared against current Question Bank coverage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModule('author_workloads')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Author Workload</span>
        </button>
      </div>

      {activeBlueprints.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          No active blueprints have generated requirements yet. Approve and activate a blueprint first.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Active Blueprint:</label>
            <select
              value={bp?.id || ''}
              onChange={(e) => setSelectedBpId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-medium"
            >
              {activeBlueprints.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.code} v{b.version})
                </option>
              ))}
            </select>
          </div>

          {bp && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">Subject · Topic</th>
                    <th className="py-3 px-4">Learning Outcome</th>
                    <th className="py-3 px-4">Cognitive · Difficulty</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Blueprint Req</th>
                    <th className="py-3 px-4 text-right">In Pipeline</th>
                    <th className="py-3 px-4 text-right">Bank Ready</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {bp.tosRows.map((row) => {
                    const subj = subjects.find((s) => s.id === bp.subjectId)?.name;
                    const top = topics.find((t) => t.id === row.topicId)?.name;
                    const lo = learningOutcomes.find((l) => l.id === row.learningOutcomeId)?.code;
                    const cog = cognitiveLevels.find((c) => c.id === row.cognitiveLevelId)?.name;
                    const dif = difficultyLevels.find((d) => d.id === row.difficultyLevelId)?.name;
                    const qt = questionTypes.find((q) => q.id === row.questionTypeId)?.code;
                    const inPipeline = questions.filter(
                      (q) => !q.inBank && q.subjectId === bp.subjectId && q.topicId === row.topicId && q.difficultyLevelId === row.difficultyLevelId
                    ).length;
                    const inBankCount = questions.filter(
                      (q) => q.inBank && q.subjectId === bp.subjectId && q.topicId === row.topicId && q.difficultyLevelId === row.difficultyLevelId
                    ).length;

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {subj} · {top}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{lo}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {cog} · {dif}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{qt}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {row.questionCount} Qs ({row.questionCount * row.marksPerQuestion}m)
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700">{inPipeline}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">{inBankCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const AuthorWorkloadsView: React.FC = () => {
  const { blueprints, users, packages, questions, subjects, createAuthorWorkload } = useExamNova();
  const activeBlueprints = blueprints.filter((b) => b.status === 'Active');
  const authors = users.filter((u) => u.role === 'author' && u.status === 'Active');

  const [bpId, setBpId] = useState(activeBlueprints[0]?.id ?? '');
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? '');
  const [title, setTitle] = useState('Mathematics Question Development — Set C');
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [notes, setNotes] = useState('Ensure full LaTeX formatting and distractor rationales.');

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpId || !authorId || !title.trim()) return;
    createAuthorWorkload({
      title: title.trim(),
      blueprintId: bpId,
      authorId,
      dueDate,
      notes,
    });
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Author Workload Assignment</h1>
        <p className="text-sm text-slate-500">
          Generate structured question requirement packages from active blueprints and assign them to Question Authors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Assigned Author Packages</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {packages.map((pkg) => {
              const items = questions.filter((q) => q.packageId === pkg.id);
              const ready = items.filter((q) => q.authoringStatus === 'Ready').length;
              const pct = items.length ? Math.round((ready / items.length) * 100) : 0;
              const authorName = users.find((u) => u.id === pkg.authorId)?.name ?? 'Author';
              const subjName = subjects.find((s) => s.id === pkg.subjectId)?.name ?? '';

              return (
                <div key={pkg.id} className="p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{pkg.title}</div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        {subjName} · Assigned to {authorName} · Due {pkg.dueDate}
                      </div>
                    </div>
                    <StatusText status={pkg.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-600">
                      {ready} / {items.length} Ready ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleAssign} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs">
          <h2 className="text-sm font-semibold text-slate-900">Assign New Workload</h2>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Active Blueprint</label>
            <select
              value={bpId}
              onChange={(e) => setBpId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {activeBlueprints.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.title} ({bp.totalQuestions} Qs)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Package Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mathematics Question Development — Set C"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assign to Question Author</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Completion Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Authoring Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={activeBlueprints.length === 0}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate & Assign Package</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const MyWorkView: React.FC = () => {
  const {
    packages,
    questions,
    topics,
    cognitiveLevels,
    difficultyLevels,
    subjects,
    selectedPackageId,
    setSelectedPackageId,
    setSelectedQuestionId,
    setActiveModule,
    submitPackageForReview,
    resubmitReturnedPackage,
  } = useExamNova();

  const activePkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const pkgQuestions = activePkg
    ? questions.filter((q) => q.packageId === activePkg.id).sort((a, b) => a.slotNumber - b.slotNumber)
    : [];

  const readyCount = pkgQuestions.filter((q) => q.authoringStatus === 'Ready').length;
  const totalCount = pkgQuestions.length;
  const pct = totalCount ? Math.round((readyCount / totalCount) * 100) : 0;
  const returnedCount = pkgQuestions.filter((q) => q.reviewStatus === 'Returned').length;
  const allReturnedReady = pkgQuestions
    .filter((q) => q.reviewStatus === 'Returned')
    .every((q) => q.authoringStatus === 'Ready');

  const isDraftStage = activePkg?.status === 'Assigned' || activePkg?.status === 'In Progress';
  const isReturnedStage = activePkg?.status === 'Returned to Author';
  const canSubmit = isDraftStage && totalCount > 0 && readyCount === totalCount;

  const openSlotInWorkspace = (qId: string) => {
    setSelectedQuestionId(qId);
    setActiveModule('authoring_workspace');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Work — Assigned Question Packages</h1>
          <p className="text-sm text-slate-500">
            Track assigned question requirements, author items sequentially, and submit completed packages for review.
          </p>
        </div>

        {/* Package Selector */}
        <select
          value={activePkg?.id || ''}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-800 max-w-sm"
        >
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} [{p.status}]
            </option>
          ))}
        </select>
      </div>

      {activePkg && (
        <>
          {/* Progress Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    {subjects.find((s) => s.id === activePkg.subjectId)?.name} Question Development
                  </h2>
                  <StatusText status={activePkg.status} />
                </div>
                <div className="text-xs text-slate-500 mt-1 tabular-nums">
                  {activePkg.title} · {totalCount} Questions Assigned · Due {activePkg.dueDate}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const firstTarget =
                      pkgQuestions.find((q) => q.reviewStatus === 'Returned') ||
                      pkgQuestions.find((q) => q.authoringStatus !== 'Ready') ||
                      pkgQuestions[0];
                    if (firstTarget) openSlotInWorkspace(firstTarget.id);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                >
                  {isReturnedStage ? 'Revise Returned Items' : 'Open Authoring Workspace'}
                </button>

                {isDraftStage && (
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => submitPackageForReview(activePkg.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                      canSubmit
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Review</span>
                  </button>
                )}

                {isReturnedStage && (
                  <button
                    type="button"
                    disabled={!allReturnedReady}
                    onClick={() => resubmitReturnedPackage(activePkg.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resubmit Revised ({returnedCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">
                  Progress: <strong className="font-mono tabular-nums text-slate-900">{readyCount} / {totalCount}</strong> Questions Ready
                </span>
                <span className="font-mono tabular-nums font-bold text-blue-700">{pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-600' : 'bg-blue-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isDraftStage && readyCount < totalCount && (
                <p className="text-[11px] text-slate-500">
                  Complete all {totalCount - readyCount} remaining question(s) to enable the Submit for Review button.
                </p>
              )}
              {!isDraftStage && !isReturnedStage && (
                <p className="text-[11px] text-slate-500 inline-flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span>This package has been submitted and is read-only to the Author.</span>
                </p>
              )}
            </div>
          </div>

          {/* Assigned Question Requirement List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Topic · Subtopic</th>
                  <th className="py-3 px-4">Cognitive · Difficulty</th>
                  <th className="py-3 px-4 text-right">Marks</th>
                  <th className="py-3 px-4">Authoring Status</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pkgQuestions.map((q) => {
                  const topicName = topics.find((t) => t.id === q.topicId)?.name ?? '';
                  const cogName = cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
                  const difName = difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
                  const isEditable =
                    isDraftStage || (isReturnedStage && q.reviewStatus === 'Returned');

                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50/80 ${q.reviewStatus === 'Returned' ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-700">
                        Q{q.slotNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{topicName}</div>
                        <div className="text-slate-500">{q.subtopicName || 'Aligned to TOS Matrix'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {cogName} · {difName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">{q.marks}</td>
                      <td className="py-3 px-4">
                        <StatusText status={q.authoringStatus} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusText status={q.reviewStatus} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openSlotInWorkspace(q.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                            q.reviewStatus === 'Returned'
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : isEditable
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {q.reviewStatus === 'Returned'
                            ? 'Revise Returned'
                            : isEditable
                            ? 'Author / Edit'
                            : 'View Read-Only'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export const AuthoringWorkspaceView: React.FC = () => {
  const {
    packages,
    questions,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    selectedPackageId,
    setSelectedPackageId,
    selectedQuestionId,
    setSelectedQuestionId,
    setActiveModule,
    saveQuestionDraft,
    submitPackageForReview,
    resubmitReturnedPackage,
    notifyToast,
  } = useExamNova();

  const activePkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const pkgQuestions = activePkg
    ? questions.filter((q) => q.packageId === activePkg.id).sort((a, b) => a.slotNumber - b.slotNumber)
    : [];

  const currentQuestion =
    pkgQuestions.find((q) => q.id === selectedQuestionId) || pkgQuestions[0];

  const [stem, setStem] = useState('');
  const [options, setOptions] = useState(currentQuestion?.options || []);
  const [correctOptionId, setCorrectOptionId] = useState('');
  const [rationale, setRationale] = useState('');
  const [diagramSvg, setDiagramSvg] = useState<string | undefined>(undefined);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    if (currentQuestion) {
      setStem(currentQuestion.stem);
      setOptions(currentQuestion.options);
      setCorrectOptionId(currentQuestion.correctOptionId);
      setRationale(currentQuestion.rationale);
      setDiagramSvg(currentQuestion.diagramSvg);
    }
  }, [currentQuestion?.id]);

  if (!activePkg || !currentQuestion) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-sm text-slate-500">
        No question assignment selected.
      </div>
    );
  }

  const isDraftStage = activePkg.status === 'Assigned' || activePkg.status === 'In Progress';
  const returnedItems = pkgQuestions.filter((q) => q.reviewStatus === 'Returned');
  const isReturnedStage = activePkg.status === 'Returned to Author';
  const canEditThisQuestion =
    isDraftStage || (isReturnedStage && currentQuestion.reviewStatus === 'Returned');

  const readyCount = pkgQuestions.filter((q) => q.authoringStatus === 'Ready').length;
  const pct = pkgQuestions.length ? Math.round((readyCount / pkgQuestions.length) * 100) : 0;
  const canSubmitPackage = isDraftStage && readyCount === pkgQuestions.length;

  const currentIndex = pkgQuestions.findIndex((q) => q.id === currentQuestion.id);
  const prevQuestion = currentIndex > 0 ? pkgQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < pkgQuestions.length - 1 ? pkgQuestions[currentIndex + 1] : null;

  const persistCurrent = (showMessage = true) => {
    if (!canEditThisQuestion) return;
    saveQuestionDraft(currentQuestion.id, {
      stem,
      options,
      correctOptionId,
      rationale,
      diagramSvg,
    });
    if (showMessage) {
      notifyToast(`Saved Question ${currentQuestion.slotNumber} of ${pkgQuestions.length}`);
    }
  };

  const handleSaveAndNext = () => {
    persistCurrent(true);
    if (nextQuestion) {
      setSelectedQuestionId(nextQuestion.id);
    }
  };

  const topicName = topics.find((t) => t.id === currentQuestion.topicId)?.name;
  const loObj = learningOutcomes.find((l) => l.id === currentQuestion.learningOutcomeId);
  const cogName = cognitiveLevels.find((c) => c.id === currentQuestion.cognitiveLevelId)?.name;
  const difName = difficultyLevels.find((d) => d.id === currentQuestion.difficultyLevelId)?.name;

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => setActiveModule('my_work')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Work</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900">
              Question {currentQuestion.slotNumber} of {pkgQuestions.length}
            </h1>
            <StatusText status={currentQuestion.authoringStatus} />
            {currentQuestion.reviewStatus !== 'Draft' && (
              <StatusText status={currentQuestion.reviewStatus} />
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {topicName} · {loObj?.code} · {cogName} · {difName} · {currentQuestion.marks} Marks
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activePkg.id}
            onChange={(e) => {
              const nextPkgId = e.target.value;
              setSelectedPackageId(nextPkgId);
              const firstQ = questions.find((q) => q.packageId === nextPkgId);
              if (firstQ) setSelectedQuestionId(firstQ.id);
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-medium max-w-[240px]"
          >
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFullPreview(!showFullPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showFullPreview ? 'Back to Editor' : 'Preview Item'}</span>
          </button>

          {isDraftStage && (
            <button
              type="button"
              disabled={!canSubmitPackage}
              onClick={() => {
                persistCurrent(false);
                submitPackageForReview(activePkg.id);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg ${
                canSubmitPackage
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Package ({readyCount}/{pkgQuestions.length})</span>
            </button>
          )}

          {isReturnedStage && (
            <button
              type="button"
              onClick={() => {
                persistCurrent(false);
                resubmitReturnedPackage(activePkg.id);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resubmit Returned Questions</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Sequential Slot Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 tabular-nums">
            Package Completion: <strong className="font-mono">{readyCount} / {pkgQuestions.length}</strong> Ready ({pct}%)
          </span>
          <span className="text-slate-500">{activePkg.title}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pkgQuestions.map((q) => {
            const active = q.id === currentQuestion.id;
            const isRet = q.reviewStatus === 'Returned';
            const isAcc = q.reviewStatus === 'Accepted';
            let style = 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400';
            if (isRet) style = 'bg-rose-50 text-rose-800 border-rose-300';
            else if (isAcc) style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            else if (q.authoringStatus === 'Ready') style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            else if (q.authoringStatus === 'Incomplete') style = 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedQuestionId(q.id)}
                className={`w-8 h-8 rounded-lg border text-xs font-mono tabular-nums font-semibold transition-all ${style} ${
                  active ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                }`}
              >
                {q.slotNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Returned Comment Banner or Read-Only Notice */}
      {currentQuestion.reviewStatus === 'Returned' && currentQuestion.reviewerComment && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Reviewer Revision Feedback (Editable)</div>
            <div className="mt-1">
              <MathRenderer content={currentQuestion.reviewerComment} className="text-xs text-rose-900" />
            </div>
          </div>
        </div>
      )}

      {!canEditThisQuestion && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-slate-700">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            This question is locked ({currentQuestion.reviewStatus}).{' '}
            {isReturnedStage
              ? 'Only questions returned by the Reviewer can be edited during revision.'
              : 'Submitted questions cannot be altered by the Author.'}
          </span>
        </div>
      )}

      {/* Main Editor or Full Preview */}
      {showFullPreview ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="text-xs text-slate-500 tabular-nums">
              Question {currentQuestion.slotNumber} · {topicName} · {cogName} · {difName} · {currentQuestion.marks} Marks
            </div>
            <StatusText status={currentQuestion.authoringStatus} />
          </div>
          <div className="text-base">
            <MathRenderer content={stem} />
          </div>
          {diagramSvg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg" dangerouslySetInnerHTML={{ __html: diagramSvg }} />
          )}
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isCorrect = opt.id === correctOptionId;
              return (
                <div
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                    isCorrect ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold text-slate-700 shrink-0">{opt.label}.</span>
                  <div className="flex-1">
                    <MathRenderer content={opt.content} />
                  </div>
                  {isCorrect && (
                    <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Correct Key
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-1">Explanation / Rationale</div>
            <MathRenderer content={rationale} className="text-xs text-slate-700" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left 2 Columns: Rich Editors */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <RichMathEditor
              label="Question Stem (Rich Text, LaTeX Math & Diagrams)"
              value={stem}
              onChange={setStem}
              rows={4}
              disabled={!canEditThisQuestion}
              allowDiagrams
              diagramSvg={diagramSvg}
              onDiagramChange={setDiagramSvg}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Answer Options & Correct Key Selection
                </label>
                <span className="text-[11px] text-slate-500">Select the radio button next to the single best answer</span>
              </div>
              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isCorrect = opt.id === correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        isCorrect ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                          <input
                            type="radio"
                            name={`correct-${currentQuestion.id}`}
                            checked={isCorrect}
                            disabled={!canEditThisQuestion}
                            onChange={() => setCorrectOptionId(opt.id)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Option {opt.label}</span>
                          {isCorrect && <span className="text-emerald-700 font-medium">· Correct Answer</span>}
                        </label>
                      </div>
                      <RichMathEditor
                        value={opt.content}
                        onChange={(val) => {
                          const next = options.map((o, i) => (i === idx ? { ...o, content: val } : o));
                          setOptions(next);
                        }}
                        rows={2}
                        compact
                        disabled={!canEditThisQuestion}
                        placeholder={`Enter Option ${opt.label} content (supports $LaTeX$)...`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <RichMathEditor
              label="Solution Rationale / Marking Explanation"
              value={rationale}
              onChange={setRationale}
              rows={3}
              disabled={!canEditThisQuestion}
              placeholder="Provide step-by-step mathematical justification for the correct option..."
            />

            {/* Footer Controls */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={!prevQuestion}
                onClick={() => {
                  if (canEditThisQuestion) persistCurrent(false);
                  if (prevQuestion) setSelectedQuestionId(prevQuestion.id);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {canEditThisQuestion && (
                  <>
                    <button
                      type="button"
                      onClick={() => persistCurrent(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndNext}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      <span>{nextQuestion ? 'Save & Next' : 'Save Final Slot'}</span>
                      {nextQuestion && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}
                {!canEditThisQuestion && nextQuestion && (
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionId(nextQuestion.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Requirement Context & Revision History */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-slate-900">Requirement Specification</h3>
              <dl className="space-y-2">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Topic</dt>
                  <dd className="font-semibold text-slate-900 text-right">{topicName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Learning Outcome</dt>
                  <dd className="font-mono text-slate-800 text-right">{loObj?.code}</dd>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  {loObj?.statement}
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Cognitive Level</dt>
                  <dd className="font-medium text-slate-800">{cogName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Difficulty</dt>
                  <dd className="font-medium text-slate-800">{difName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Marks Allocated</dt>
                  <dd className="font-mono font-semibold text-slate-900">{currentQuestion.marks}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <History className="w-4 h-4 text-slate-500" />
                <span>Item Revision History</span>
              </div>
              <div className="space-y-3">
                {currentQuestion.history.map((h) => (
                  <div key={h.id} className="pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="font-semibold text-slate-800">{h.action}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {h.actorName} ({h.actorRole}) · <span className="font-mono tabular-nums">{h.timestamp}</span>
                    </div>
                    {h.comment && (
                      <div className="mt-1 text-[11px] text-slate-700 bg-slate-50 p-2 rounded">
                        <MathRenderer content={h.comment} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
