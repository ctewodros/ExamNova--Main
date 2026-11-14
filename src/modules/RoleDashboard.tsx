import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Database,
  FilePlus2,
  Grid,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { StatusText } from '../components/StatusText';
import { ROLES } from '../data/seedData';

export const RoleDashboard: React.FC = () => {
  const {
    currentRole,
    users,
    blueprints,
    packages,
    questions,
    examinations,
    auditLogs,
    subjects,
    setActiveModule,
    setSelectedPackageId,
    setSelectedExamId,
  } = useExamNova();

  const roleDef = ROLES.find((r) => r.id === currentRole)!;

  const bankQuestions = questions.filter((q) => q.inBank);
  const activeBlueprints = blueprints.filter((b) => b.status === 'Active');

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const getUserName = (id?: string) => users.find((u) => u.id === id)?.name ?? 'Unassigned';

  // End-to-End Pipeline Summary Bar (shown cleanly across dashboards)
  const pipelineStages = [
    { label: 'Active Blueprints', count: activeBlueprints.length },
    { label: 'Authoring Packages', count: packages.filter((p) => p.status === 'Assigned' || p.status === 'In Progress').length },
    { label: 'In Review / Revision', count: packages.filter((p) => p.status === 'Submitted' || p.status === 'In Review' || p.status === 'Returned to Author').length },
    { label: 'Pending Q. Approval', count: packages.filter((p) => p.status === 'Pending Approval').length },
    { label: 'Question Bank', count: bankQuestions.length },
    { label: 'Exam Bank', count: examinations.filter((e) => e.status === 'Approved').length },
  ];

  // Author metrics
  const authorPackages = packages.filter((p) => p.authorId === 'usr-author' || p.authorId === 'usr-author-2');
  const primaryAuthorPkg = packages.find((p) => p.id === 'pkg-math-author') || authorPackages[0];
  const primaryPkgQuestions = primaryAuthorPkg
    ? questions.filter((q) => q.packageId === primaryAuthorPkg.id)
    : [];
  const readyCount = primaryPkgQuestions.filter((q) => q.authoringStatus === 'Ready').length;
  const draftCount = primaryPkgQuestions.filter((q) => q.authoringStatus !== 'Ready').length;
  const returnedItems = questions.filter((q) => q.reviewStatus === 'Returned');

  // Reviewer metrics
  const reviewPackages = packages.filter(
    (p) => p.status === 'In Review' || p.status === 'Returned to Author' || p.status === 'Submitted'
  );

  // Approver metrics
  const pendingApprovalPackages = packages.filter((p) => p.status === 'Pending Approval');
  const pendingApprovalBlueprints = blueprints.filter((b) => b.status === 'Reviewed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {roleDef.label} Workspace
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">{roleDef.description}</p>
        </div>

        {/* Primary Role CTA */}
        <div className="shrink-0">
          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveModule('admin_users')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
          )}
          {currentRole === 'coordinator' && (
            <button
              type="button"
              onClick={() => setActiveModule('blueprints')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Grid className="w-4 h-4" />
              <span>Open Blueprints</span>
            </button>
          )}
          {currentRole === 'author' && (
            <button
              type="button"
              onClick={() => setActiveModule('my_work')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <PenTool className="w-4 h-4" />
              <span>Continue My Work</span>
            </button>
          )}
          {currentRole === 'reviewer' && (
            <button
              type="button"
              onClick={() => setActiveModule('question_review')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Review Queue</span>
            </button>
          )}
          {currentRole === 'approver' && (
            <button
              type="button"
              onClick={() => setActiveModule('question_approval')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Final Approvals</span>
            </button>
          )}
          {currentRole === 'exam_developer' && (
            <button
              type="button"
              onClick={() => setActiveModule('exam_assembly')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Open Exam Assembly</span>
            </button>
          )}
          {currentRole === 'exam_reviewer' && (
            <button
              type="button"
              onClick={() => setActiveModule('exam_review')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Review Assembled Exams</span>
            </button>
          )}
          {currentRole === 'exam_approver' && (
            <button
              type="button"
              onClick={() => setActiveModule('exam_approval')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize Exam Bank</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Specific KPI Strip */}
      {currentRole === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Total Platform Users" value={users.length} sub={`${users.filter((u) => u.status === 'Active').length} Active accounts`} />
          <StatTile label="Active Subjects" value={subjects.length} sub="Mathematics · Physics · Chemistry" />
          <StatTile label="Question Bank Items" value={bankQuestions.length} sub="Approved & active items" />
          <StatTile label="Audit Events Recorded" value={auditLogs.length} sub="Immutable governance log" />
        </div>
      )}

      {currentRole === 'coordinator' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Active Blueprints" value={activeBlueprints.length} sub={`${blueprints.length} total blueprints`} />
          <StatTile label="Author Workloads" value={packages.length} sub={`${packages.filter((p) => p.status === 'Submitted').length} awaiting assignment`} />
          <StatTile label="Questions In Pipeline" value={questions.filter((q) => !q.inBank).length} sub="Draft, review & approval" />
          <StatTile label="Question Bank Ready" value={bankQuestions.length} sub="Eligible for exam assembly" />
        </div>
      )}

      {currentRole === 'author' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Assigned Questions"
            value={primaryPkgQuestions.length}
            sub={primaryAuthorPkg?.title.split('—')[0].trim() || 'Active assignment'}
          />
          <StatTile
            label="Completion Rate"
            value={`${primaryPkgQuestions.length ? Math.round((readyCount / primaryPkgQuestions.length) * 100) : 0}%`}
            sub={`${readyCount} of ${primaryPkgQuestions.length} Ready`}
          />
          <StatTile label="Incomplete / Not Started" value={draftCount} sub="Editable draft slots" />
          <StatTile label="Returned for Revision" value={returnedItems.length} sub="Require targeted edits" />
        </div>
      )}

      {currentRole === 'reviewer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Assigned Packages" value={reviewPackages.length} sub="Active review queue" />
          <StatTile
            label="Accepted Questions"
            value={questions.filter((q) => q.reviewStatus === 'Accepted').length}
            sub="Passed peer review"
          />
          <StatTile
            label="Returned Questions"
            value={returnedItems.length}
            sub="With revision comments"
          />
          <StatTile
            label="Blueprints to Review"
            value={blueprints.filter((b) => b.status === 'Submitted').length}
            sub="TOS validation queue"
          />
        </div>
      )}

      {currentRole === 'approver' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Packages Pending Approval" value={pendingApprovalPackages.length} sub="Ready for Bank sign-off" />
          <StatTile label="Blueprints Pending Approval" value={pendingApprovalBlueprints.length} sub="Reviewed TOS specifications" />
          <StatTile label="Approved Bank Items" value={bankQuestions.length} sub="Live in Question Bank" />
          <StatTile label="Active Blueprints" value={activeBlueprints.length} sub="Operational standards" />
        </div>
      )}

      {currentRole === 'exam_developer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Exams In Assembly"
            value={examinations.filter((e) => e.status === 'In Assembly' || e.status === 'Returned for Revision').length}
            sub="Active drafts"
          />
          <StatTile
            label="Pending Exam Review"
            value={examinations.filter((e) => e.status === 'Submitted for Review' || e.status === 'Pending Final Approval').length}
            sub="In QA pipeline"
          />
          <StatTile label="Approved Exam Bank" value={examinations.filter((e) => e.status === 'Approved').length} sub="Released papers" />
          <StatTile label="Eligible Bank Questions" value={bankQuestions.length} sub="Available for selection" />
        </div>
      )}

      {(currentRole === 'exam_reviewer' || currentRole === 'exam_approver') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Submitted for Review"
            value={examinations.filter((e) => e.status === 'Submitted for Review').length}
            sub="Awaiting exam reviewer"
          />
          <StatTile
            label="Pending Final Approval"
            value={examinations.filter((e) => e.status === 'Pending Final Approval').length}
            sub="Awaiting exam approver"
          />
          <StatTile
            label="Returned for Revision"
            value={examinations.filter((e) => e.status === 'Returned for Revision').length}
            sub="Sent back to developer"
          />
          <StatTile label="Published in Exam Bank" value={examinations.filter((e) => e.status === 'Approved').length} sub="Certified examinations" />
        </div>
      )}

      {/* Assessment Lifecycle Overview Strip */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">End-to-End Assessment Lifecycle</h2>
          <span className="text-xs text-slate-500">Live platform throughput</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.label} className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <div className="text-[11px] font-medium text-slate-500">
                0{idx + 1}. {stage.label}
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {stage.count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role-Specific Primary Operational Tables */}
      {currentRole === 'coordinator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Blueprint Governance</h2>
              <button
                type="button"
                onClick={() => setActiveModule('blueprints')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {blueprints.map((bp) => (
                <div key={bp.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{bp.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      {getSubjectName(bp.subjectId)} · {bp.totalQuestions} Qs · {bp.totalMarks} Marks · v{bp.version}
                    </div>
                  </div>
                  <StatusText status={bp.status} />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Author Workloads & Submitted Packages</h2>
              <button
                type="button"
                onClick={() => setActiveModule('submitted_packages')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Assign Governance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {packages.map((pkg) => (
                <div key={pkg.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{pkg.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      Author: {getUserName(pkg.authorId)} · {pkg.totalAssigned} Items · Due {pkg.dueDate}
                    </div>
                  </div>
                  <StatusText status={pkg.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {currentRole === 'author' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Assigned Question Workloads</h2>
            <button
              type="button"
              onClick={() => setActiveModule('my_work')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Open My Work</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {packages.map((pkg) => {
              const items = questions.filter((q) => q.packageId === pkg.id);
              const ready = items.filter((q) => q.authoringStatus === 'Ready').length;
              const ret = items.filter((q) => q.reviewStatus === 'Returned').length;
              const pct = items.length ? Math.round((ready / items.length) * 100) : 0;
              return (
                <div key={pkg.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">{pkg.title}</span>
                      <StatusText status={pkg.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 tabular-nums">
                      {getSubjectName(pkg.subjectId)} · {ready} / {items.length} Ready ({pct}%) · Due {pkg.dueDate}
                      {ret > 0 && <span className="text-rose-700 font-medium"> · {ret} Returned for Revision</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPackageId(pkg.id);
                      setActiveModule('authoring_workspace');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shrink-0 whitespace-nowrap"
                  >
                    {ret > 0 ? 'Revise Returned' : 'Open Workspace'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {currentRole === 'reviewer' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Question Packages for Peer Review</h2>
            <button
              type="button"
              onClick={() => setActiveModule('question_review')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Open Review Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {packages
              .filter((p) => p.status === 'In Review' || p.status === 'Returned to Author' || p.status === 'Submitted')
              .map((pkg) => {
                const items = questions.filter((q) => q.packageId === pkg.id);
                const accepted = items.filter((q) => q.reviewStatus === 'Accepted').length;
                const returned = items.filter((q) => q.reviewStatus === 'Returned').length;
                return (
                  <div key={pkg.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">{pkg.title}</span>
                        <StatusText status={pkg.status} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 tabular-nums">
                        {getSubjectName(pkg.subjectId)} — {items.length} Questions · {accepted} Accepted · {returned} Returned · Review progress: {accepted + returned} / {items.length}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setActiveModule('question_review');
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
                    >
                      Review Package
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {currentRole === 'approver' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Final Question Approval Queue</h2>
              <button
                type="button"
                onClick={() => setActiveModule('question_approval')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Go to Approvals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingApprovalPackages.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">All reviewed question packages have been processed.</div>
              ) : (
                pendingApprovalPackages.map((pkg) => (
                  <div key={pkg.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{pkg.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {getSubjectName(pkg.subjectId)} · {pkg.totalAssigned} Accepted Questions · Reviewer: {getUserName(pkg.reviewerId)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setActiveModule('question_approval');
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
                    >
                      Inspect & Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Blueprint Approvals & Decision History</h2>
              <button
                type="button"
                onClick={() => setActiveModule('blueprints')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View Blueprints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {blueprints.map((bp) => (
                <div key={bp.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{bp.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {bp.approvalComment || bp.reviewComment || `Version ${bp.version}`}
                    </div>
                  </div>
                  <StatusText status={bp.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {(currentRole === 'exam_developer' || currentRole === 'exam_reviewer' || currentRole === 'exam_approver') && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Examinations Pipeline</h2>
            <button
              type="button"
              onClick={() =>
                setActiveModule(
                  currentRole === 'exam_developer'
                    ? 'exam_assembly'
                    : currentRole === 'exam_reviewer'
                    ? 'exam_review'
                    : 'exam_approval'
                )
              }
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Open Examination Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {examinations.map((ex) => {
              const bp = blueprints.find((b) => b.id === ex.blueprintId);
              const targetCount = bp?.totalQuestions ?? 20;
              const pct = Math.min(100, Math.round((ex.selectedQuestionIds.length / targetCount) * 100));
              return (
                <div key={ex.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-500">{ex.code}</span>
                      <span className="text-sm font-semibold text-slate-900">{ex.title}</span>
                      <StatusText status={ex.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 tabular-nums">
                      {getSubjectName(ex.subjectId)} · {ex.selectedQuestionIds.length} / {targetCount} Questions ({pct}% Filled) · Updated {ex.updatedAt}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setActiveModule(
                        ex.status === 'Approved'
                          ? 'exam_bank'
                          : currentRole === 'exam_reviewer'
                          ? 'exam_review'
                          : currentRole === 'exam_approver'
                          ? 'exam_approval'
                          : 'exam_assembly'
                      );
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shrink-0"
                  >
                    Open Exam
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {currentRole === 'admin' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent System Audit Activity</h2>
            <button
              type="button"
              onClick={() => setActiveModule('admin_audit')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{log.actorName}</td>
                    <td className="py-2.5 px-4 text-slate-700">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

const StatTile: React.FC<{ label: string; value: string | number; sub: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="text-xs font-medium text-slate-500">{label}</div>
    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1.5">{value}</div>
    <div className="text-xs text-slate-500 mt-1">{sub}</div>
  </div>
);
