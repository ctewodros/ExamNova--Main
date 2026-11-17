import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Send,
  UserCheck,
  Award,
  ArrowLeft,
  ArrowRight,
  History,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { StatusText } from '../components/StatusText';
import { MathRenderer } from '../components/MathRenderer';
import { getBloomsMeta } from '../utils/bloomsTaxonomy';
import {
  WorkflowTimeline,
  PACKAGE_WORKFLOW_STAGES,
  getPackageNextAction,
} from '../components/WorkflowTimeline';

export const SubmittedPackagesView: React.FC = () => {
  const { packages, questions, users, subjects, assignPackageGovernance } = useExamNova();
  const reviewers = users.filter((u) => u.role === 'reviewer' && u.status === 'Active');
  const approvers = users.filter((u) => u.role === 'approver' && u.status === 'Active');

  const [revByPkg, setRevByPkg] = useState<Record<string, string>>({});
  const [appByPkg, setAppByPkg] = useState<Record<string, string>>({});
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(packages[0]?.id ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Submitted Question Packages & Governance Assignment</h1>
        <p className="text-sm text-slate-500">
          Assign qualified Reviewers and Approvers to submitted author packages and monitor review throughput.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {packages.map((pkg) => {
          const subj = subjects.find((s) => s.id === pkg.subjectId)?.name ?? '';
          const author = users.find((u) => u.id === pkg.authorId)?.name ?? '';
          const isSubmitted = pkg.status === 'Submitted';
          const selectedRev = revByPkg[pkg.id] ?? pkg.reviewerId ?? reviewers[0]?.id ?? '';
          const selectedApp = appByPkg[pkg.id] ?? pkg.approverId ?? approvers[0]?.id ?? '';
          const pkgQs = questions.filter((q) => q.packageId === pkg.id);
          const readyQ = pkgQs.filter((q) => q.authoringStatus === 'Ready').length;
          const returnedQ = pkgQs.filter((q) => q.reviewStatus === 'Returned').length;
          const isExpanded = expandedPkgId === pkg.id;

          return (
            <div key={pkg.id} className="p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{pkg.title}</span>
                    <StatusText status={pkg.status} />
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    {subj} · Author: {author} · {pkg.totalAssigned} Questions · Submitted {pkg.submittedAt || 'Pending'}
                  </div>
                  {pkg.reviewerId && (
                    <div className="text-xs text-slate-600">
                      Reviewer: <strong>{users.find((u) => u.id === pkg.reviewerId)?.name}</strong> · Approver:{' '}
                      <strong>{users.find((u) => u.id === pkg.approverId)?.name}</strong>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                  {isSubmitted ? (
                    <>
                      <select
                        value={selectedRev}
                        onChange={(e) => setRevByPkg({ ...revByPkg, [pkg.id]: e.target.value })}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        {reviewers.map((r) => (
                          <option key={r.id} value={r.id}>Rev: {r.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedApp}
                        onChange={(e) => setAppByPkg({ ...appByPkg, [pkg.id]: e.target.value })}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        {approvers.map((a) => (
                          <option key={a.id} value={a.id}>App: {a.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => assignPackageGovernance(pkg.id, selectedRev, selectedApp)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign & Route</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 whitespace-nowrap mr-1">
                      {pkg.status === 'In Progress' || pkg.status === 'Assigned'
                        ? 'Awaiting Author Submission'
                        : 'Governance Assigned'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedPkgId(isExpanded ? null : pkg.id)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                  >
                    {isExpanded ? 'Hide Timeline' : 'View Timeline'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <WorkflowTimeline
                  currentStatus={pkg.status}
                  stages={PACKAGE_WORKFLOW_STAGES}
                  compact
                  nextAction={getPackageNextAction(pkg.status, {
                    readyQuestions: readyQ,
                    totalQuestions: pkgQs.length,
                    returnedQuestions: returnedQ,
                  })}
                  feedbackComment={pkgQs.find((q) => q.reviewStatus === 'Returned')?.reviewerComment}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const QuestionReviewView: React.FC = () => {
  const {
    packages,
    questions,
    subjects,
    topics,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    users,
    selectedPackageId,
    setSelectedPackageId,
    reviewQuestionDecision,
    finalizePackageReview,
  } = useExamNova();

  const reviewablePkgs = packages.filter(
    (p) => p.status === 'In Review' || p.status === 'Returned to Author' || p.status === 'Submitted'
  );
  const activePkg =
    reviewablePkgs.find((p) => p.id === selectedPackageId) || reviewablePkgs[0] || packages[1];

  const pkgQuestions = activePkg
    ? questions.filter((q) => q.packageId === activePkg.id).sort((a, b) => a.slotNumber - b.slotNumber)
    : [];

  const [activeSlotIdx, setActiveSlotIdx] = useState(0);
  const [comment, setComment] = useState('');

  const currentQ = pkgQuestions[activeSlotIdx] || pkgQuestions[0];

  const acceptedCount = pkgQuestions.filter((q) => q.reviewStatus === 'Accepted').length;
  const returnedCount = pkgQuestions.filter((q) => q.reviewStatus === 'Returned').length;
  const reviewedCount = acceptedCount + returnedCount;
  const allReviewed = pkgQuestions.length > 0 && reviewedCount === pkgQuestions.length;

  const handleDecision = (decision: 'Accepted' | 'Returned') => {
    if (!currentQ) return;
    reviewQuestionDecision(
      currentQ.id,
      decision,
      comment.trim() ||
        (decision === 'Accepted'
          ? 'Verified technical accuracy and blueprint alignment.'
          : 'Please refine stem clarity and distractor justification.')
    );
    setComment('');
    if (activeSlotIdx < pkgQuestions.length - 1) {
      setActiveSlotIdx(activeSlotIdx + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Question Peer Review Console</h1>
          <p className="text-sm text-slate-500">
            Inspect mathematical rigor, cognitive alignment, and distractor quality. Accept items or return with actionable comments.
          </p>
        </div>

        <select
          value={activePkg?.id || ''}
          onChange={(e) => {
            setSelectedPackageId(e.target.value);
            setActiveSlotIdx(0);
          }}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white max-w-sm"
        >
          {reviewablePkgs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} [{p.status}]
            </option>
          ))}
        </select>
      </div>

      {activePkg && (
        <>
          {/* Reviewer Progress Summary Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-900">
                  {subjects.find((s) => s.id === activePkg.subjectId)?.name} — {pkgQuestions.length} Questions
                </h2>
                <StatusText status={activePkg.status} />
              </div>
              <div className="text-xs text-slate-600 tabular-nums flex flex-wrap items-center gap-3">
                <span className="text-emerald-700 font-semibold">{acceptedCount} Accepted</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-700 font-semibold">{returnedCount} Returned</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-slate-800">
                  Review progress: {reviewedCount} / {pkgQuestions.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>Author: {users.find((u) => u.id === activePkg.authorId)?.name}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!allReviewed}
              onClick={() => finalizePackageReview(activePkg.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap ${
                allReviewed
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {returnedCount > 0 ? `Return ${returnedCount} Item(s) to Author` : 'Forward All to Approver'}
              </span>
            </button>
          </div>

          <WorkflowTimeline
            currentStatus={activePkg.status}
            stages={PACKAGE_WORKFLOW_STAGES}
            compact
            nextAction={getPackageNextAction(activePkg.status, {
              totalQuestions: pkgQuestions.length,
              returnedQuestions: returnedCount,
            })}
          />

          {/* Slot Navigation Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-1.5">
            {pkgQuestions.map((q, idx) => {
              const isAcc = q.reviewStatus === 'Accepted';
              const isRet = q.reviewStatus === 'Returned';
              const active = idx === activeSlotIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveSlotIdx(idx)}
                  className={`w-8 h-8 rounded-lg border text-xs font-mono tabular-nums font-semibold ${
                    isAcc
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isRet
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  } ${active ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
                >
                  {q.slotNumber}
                </button>
              );
            })}
          </div>

          {/* Active Question Inspection Card */}
          {currentQ && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="text-xs text-slate-600 tabular-nums flex flex-wrap items-center gap-1.5">
                    <strong className="text-slate-900 font-mono">Q{currentQ.slotNumber}</strong> ·{' '}
                    {questionTypes.find((qt) => qt.id === currentQ.questionTypeId)?.name ?? 'MCQ'} ·{' '}
                    {topics.find((t) => t.id === currentQ.topicId)?.name} ·{' '}
                    <span className="font-mono font-semibold text-slate-800">
                      {getBloomsMeta(cognitiveLevels.find((c) => c.id === currentQ.cognitiveLevelId)).code}
                    </span>{' '}
                    {cognitiveLevels.find((c) => c.id === currentQ.cognitiveLevelId)?.name} ·{' '}
                    {difficultyLevels.find((d) => d.id === currentQ.difficultyLevelId)?.name} · {currentQ.marks} Marks
                    {currentQ.bloomTags && currentQ.bloomTags.length > 0 && (
                      <span className="font-mono text-[11px] text-blue-700">
                        · [{currentQ.bloomTags.join(' · ')}]
                      </span>
                    )}
                  </div>
                  <StatusText status={currentQ.reviewStatus} />
                </div>

                <div className="text-base">
                  <MathRenderer content={currentQ.stem} />
                </div>

                {currentQ.diagramSvg && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg" dangerouslySetInnerHTML={{ __html: currentQ.diagramSvg }} />
                )}

                {currentQ.questionTypeId === 'qt-short' || currentQ.options.length === 0 ? (
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                      Expected Sample Answer / Marking Rubric
                    </div>
                    <MathRenderer
                      content={currentQ.sampleAnswer || 'No sample answer provided.'}
                      className="text-sm text-slate-900"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(currentQ.questionTypeId === 'qt-tf' ? currentQ.options.slice(0, 2) : currentQ.options).map((opt) => {
                      const isKey = opt.id === currentQ.correctOptionId;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                            isKey ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200'
                          }`}
                        >
                          <span className="font-mono font-bold text-slate-700">{opt.label}.</span>
                          <div className="flex-1">
                            <MathRenderer content={opt.content} />
                          </div>
                          {isKey && <span className="text-xs font-semibold text-emerald-700 shrink-0">Key</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Author Rationale</div>
                  <MathRenderer content={currentQ.rationale} className="text-xs text-slate-700" />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={activeSlotIdx === 0}
                    onClick={() => setActiveSlotIdx((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg disabled:opacity-40"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    disabled={activeSlotIdx >= pkgQuestions.length - 1}
                    onClick={() => setActiveSlotIdx((i) => Math.min(pkgQuestions.length - 1, i + 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Review Action & History */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs">
                  <h3 className="text-sm font-semibold text-slate-900">Reviewer Evaluation</h3>
                  {currentQ.reviewerComment && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Last Reviewer Note</div>
                      <MathRenderer content={currentQ.reviewerComment} className="text-xs text-slate-800" />
                    </div>
                  )}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Review Comment / Feedback</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Specify acceptance note or exact revision required..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision('Accepted')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision('Returned')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Revision History</span>
                  </div>
                  <div className="space-y-2.5">
                    {currentQ.history.map((h) => (
                      <div key={h.id} className="pb-2 border-b border-slate-100 last:border-b-0">
                        <div className="font-medium text-slate-900">{h.action}</div>
                        <div className="text-[11px] text-slate-500">
                          {h.actorName} · <span className="font-mono">{h.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const QuestionApprovalView: React.FC = () => {
  const {
    packages,
    questions,
    subjects,
    topics,
    questionTypes,
    users,
    approverPackageDecision,
  } = useExamNova();

  const pendingPkgs = packages.filter((p) => p.status === 'Pending Approval');
  const [selectedId, setSelectedId] = useState(pendingPkgs[0]?.id ?? '');
  const activePkg = pendingPkgs.find((p) => p.id === selectedId) || pendingPkgs[0];
  const pkgQuestions = activePkg
    ? questions.filter((q) => q.packageId === activePkg.id).sort((a, b) => a.slotNumber - b.slotNumber)
    : [];
  const [approvalNotes, setApprovalNotes] = useState('Verified psychometric compliance and approved for Question Bank release.');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Final Question Approval</h1>
        <p className="text-sm text-slate-500">
          Perform final academic sign-off on peer-reviewed question packages to promote them into the active Question Bank.
        </p>
      </div>

      {pendingPkgs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <Award className="w-8 h-8 text-emerald-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-900">All Reviewed Packages Processed</div>
          <div className="text-xs text-slate-500">No question packages are currently waiting for final approval.</div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Package in Queue:</label>
            <select
              value={activePkg?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
            >
              {pendingPkgs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.totalAssigned} Qs)
                </option>
              ))}
            </select>
          </div>

          {activePkg && (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-slate-900">{activePkg.title}</h2>
                      <StatusText status={activePkg.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      {subjects.find((s) => s.id === activePkg.subjectId)?.name} · Author:{' '}
                      {users.find((u) => u.id === activePkg.authorId)?.name} · Reviewer:{' '}
                      {users.find((u) => u.id === activePkg.reviewerId)?.name}
                    </div>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  placeholder="Enter final approval remarks..."
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => approverPackageDecision(activePkg.id, 'Approved', approvalNotes)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Release {pkgQuestions.length} Items to Question Bank</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => approverPackageDecision(activePkg.id, 'Returned', approvalNotes)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Return Package for Revision</span>
                  </button>
                </div>
              </div>

              <WorkflowTimeline
                currentStatus={activePkg.status}
                stages={PACKAGE_WORKFLOW_STAGES}
                compact
                nextAction={getPackageNextAction(activePkg.status, {
                  totalQuestions: pkgQuestions.length,
                })}
              />

              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {pkgQuestions.map((q) => (
                  <div key={q.id} className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-800">
                        Q{q.slotNumber} · {questionTypes.find((qt) => qt.id === q.questionTypeId)?.code ?? 'MCQ'} · {topics.find((t) => t.id === q.topicId)?.name} · {q.marks} Marks
                      </span>
                      <StatusText status={q.reviewStatus} />
                    </div>
                    <MathRenderer content={q.stem} className="text-sm font-medium text-slate-900" />
                    {q.questionTypeId === 'qt-short' || q.options.length === 0 ? (
                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 text-xs">
                        <span className="font-semibold text-emerald-800 mr-2">Expected Sample Answer:</span>
                        <MathRenderer content={q.sampleAnswer || 'No sample answer provided.'} className="inline text-slate-900" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(q.questionTypeId === 'qt-tf' ? q.options.slice(0, 2) : q.options).map((o) => (
                          <div
                            key={o.id}
                            className={`px-3 py-1.5 rounded border text-xs flex items-center gap-2 ${
                              o.id === q.correctOptionId
                                ? 'border-emerald-300 bg-emerald-50/50 font-semibold'
                                : 'border-slate-200'
                            }`}
                          >
                            <span className="font-mono">{o.label}.</span>
                            <MathRenderer content={o.content} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
