import React, { useState } from 'react';
import {
  Check,
  Clock,
  RotateCcw,
  ArrowRight,
  Circle,
  UserCheck,
  FileCheck2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import {
  BlueprintStatus,
  ExamStatus,
  PackageStatus,
} from '../types/examnova';
import { useExamNova } from '../context/ExamNovaContext';
import { StatusText } from './StatusText';

export type WorkflowEntityType = 'blueprint' | 'package' | 'exam';

export type StageState = 'completed' | 'current' | 'returned' | 'upcoming' | 'archived';

export interface WorkflowStageItem {
  id: string;
  label: string;
  /** Status values (case-insensitive) that place the workflow at this stage */
  statuses?: string[];
  /** Status values (case-insensitive) indicating this stage was returned for revision */
  returnedStatuses?: string[];
  /** Responsible role or actor */
  actor?: string;
  /** Short description displayed under the stage label */
  detail?: string;
  /** Default next required action copy when this stage is active */
  nextAction?: string;
  /** Marks final completed milestone stage */
  isTerminal?: boolean;
}

export interface WorkflowActionConfig {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface WorkflowTimelineProps {
  /** Current workflow status (e.g., 'Draft', 'Under Review', 'Submitted', 'Approved') */
  status?: string;
  /** Optional alias for status */
  currentStatus?: string;
  /** Ordered list of workflow stages (objects or stage label strings) */
  stages: Array<WorkflowStageItem | string>;
  /** Optional header title and unboxed subtitle metadata */
  title?: string;
  subtitle?: string;
  /** Optional explicit override for next required action text & responsible role */
  nextAction?: string;
  nextActionOwner?: string;
  /** Optional feedback comment displayed when in a returned/revision state */
  feedbackComment?: string;
  /** Optional primary action button rendered in the Next Required Action bar */
  action?: WorkflowActionConfig;
  compact?: boolean;
  className?: string;
}

export const BLUEPRINT_WORKFLOW_STAGES: WorkflowStageItem[] = [
  {
    id: 'draft',
    label: 'Draft & TOS',
    statuses: ['Draft'],
    returnedStatuses: ['Returned'],
    actor: 'Subject Coordinator',
    detail: 'Define metadata & matrix',
    nextAction: 'Verify TOS totals match target questions and marks, then submit for peer review.',
  },
  {
    id: 'review',
    label: 'Peer Review',
    statuses: ['Submitted', 'Under Review'],
    actor: 'Question Reviewer',
    detail: 'Validate blueprint balance',
    nextAction: 'Review TOS topic, cognitive, and difficulty distributions and accept or return blueprint.',
  },
  {
    id: 'approval',
    label: 'Final Approval',
    statuses: ['Reviewed'],
    actor: 'Question Approver',
    detail: 'Academic sign-off',
    nextAction: 'Perform final academic approval so the coordinator can activate this blueprint.',
  },
  {
    id: 'activate',
    label: 'Activation',
    statuses: ['Approved'],
    actor: 'Subject Coordinator',
    detail: 'Generate requirements',
    nextAction: 'Activate the approved blueprint and generate question development requirements.',
  },
  {
    id: 'active',
    label: 'Active Standard',
    statuses: ['Active'],
    actor: 'Coordinator / Exam Dev',
    detail: 'Live for authoring & exams',
    nextAction: 'Blueprint is active — assign author workloads or assemble examinations.',
    isTerminal: true,
  },
];

export const PACKAGE_WORKFLOW_STAGES: WorkflowStageItem[] = [
  {
    id: 'assigned',
    label: 'Assigned',
    statuses: ['Assigned'],
    actor: 'Subject Coordinator',
    detail: 'TOS slots allocated',
    nextAction: 'Open Authoring Workspace to begin drafting assigned question slots.',
  },
  {
    id: 'authoring',
    label: 'Authoring',
    statuses: ['In Progress', 'Draft'],
    returnedStatuses: ['Returned to Author', 'Returned'],
    actor: 'Question Author',
    detail: 'Write stems & rationales',
    nextAction: 'Complete remaining question slots and submit the package for governance routing.',
  },
  {
    id: 'routing',
    label: 'Routing',
    statuses: ['Submitted'],
    actor: 'Subject Coordinator',
    detail: 'Assign reviewer & approver',
    nextAction: 'Assign a qualified Question Reviewer and Approver in Submitted Packages to start review.',
  },
  {
    id: 'review',
    label: 'Peer Review',
    statuses: ['In Review', 'Under Review'],
    actor: 'Question Reviewer',
    detail: 'Item-by-item evaluation',
    nextAction: 'Inspect every item in the Peer Review Console, accept or return items, and finalize review.',
  },
  {
    id: 'approval',
    label: 'Final Approval',
    statuses: ['Pending Approval'],
    actor: 'Question Approver',
    detail: 'Bank certification sign-off',
    nextAction: 'Perform final approval to promote all accepted items into the active Question Bank.',
  },
  {
    id: 'bank',
    label: 'Question Bank',
    statuses: ['Approved'],
    actor: 'Exam Developer',
    detail: 'Certified for exam assembly',
    nextAction: 'All items are certified and available in the Question Bank for examination assembly.',
    isTerminal: true,
  },
];

export const EXAM_WORKFLOW_STAGES: WorkflowStageItem[] = [
  {
    id: 'assembly',
    label: 'Exam Assembly',
    statuses: ['In Assembly', 'Draft'],
    returnedStatuses: ['Returned for Revision', 'Returned'],
    actor: 'Exam Developer',
    detail: 'Match Question Bank to TOS',
    nextAction: 'Select certified Question Bank items matching TOS requirements and submit for review.',
  },
  {
    id: 'exam_review',
    label: 'Exam Review',
    statuses: ['Submitted for Review', 'Under Review'],
    actor: 'Exam Reviewer',
    detail: 'Audit balance & formatting',
    nextAction: 'Inspect the full exam paper and TOS balance, then forward to Approver or return for revision.',
  },
  {
    id: 'exam_approval',
    label: 'Final Approval',
    statuses: ['Pending Final Approval'],
    actor: 'Exam Approver',
    detail: 'Authorize Exam Bank entry',
    nextAction: 'Grant final academic sign-off to publish this paper into the Official Exam Bank.',
  },
  {
    id: 'exam_bank',
    label: 'Exam Bank',
    statuses: ['Approved'],
    actor: 'Authorized Roles',
    detail: 'Ready for PDF / Word export',
    nextAction: 'Approved in Exam Bank — open paper to print PDF or export Word (.doc) for distribution.',
    isTerminal: true,
  },
];

interface EvaluatedStage extends WorkflowStageItem {
  state: StageState;
}

function matchesStatus(stage: WorkflowStageItem, normStatus: string): boolean {
  if (stage.statuses?.some((s) => s.toLowerCase() === normStatus)) return true;
  if (stage.id.toLowerCase() === normStatus) return true;
  if (stage.label.toLowerCase() === normStatus) return true;
  // Support common phrasing such as "Under Review" matching "Peer Review" / "Exam Review"
  if (normStatus.includes('review') && stage.label.toLowerCase().includes('review') && !normStatus.includes('reviewed')) {
    return true;
  }
  return false;
}

function normalizeStages(stages: Array<WorkflowStageItem | string>): WorkflowStageItem[] {
  return stages.map((stage, idx) => {
    if (typeof stage === 'string') {
      return {
        id: stage.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        label: stage,
        statuses: [stage],
        isTerminal: idx === stages.length - 1,
      };
    }
    return stage;
  });
}

function evaluateWorkflow(
  currentStatus: string,
  rawStages: Array<WorkflowStageItem | string>,
  overrideNextAction?: string,
  overrideOwner?: string
): {
  evaluatedStages: EvaluatedStage[];
  completedCount: number;
  totalCount: number;
  nextActionOwner: string;
  nextActionText: string;
  isReturned: boolean;
  isComplete: boolean;
} {
  const stages = normalizeStages(rawStages);
  const norm = currentStatus.trim().toLowerCase();

  if (norm === 'archived') {
    const evaluatedStages: EvaluatedStage[] = stages.map((s) => ({ ...s, state: 'archived' }));
    return {
      evaluatedStages,
      completedCount: evaluatedStages.length,
      totalCount: evaluatedStages.length,
      nextActionOwner: overrideOwner || stages[0]?.actor || 'Coordinator',
      nextActionText:
        overrideNextAction || 'Blueprint is archived — create a new version draft if updates are needed.',
      isReturned: false,
      isComplete: true,
    };
  }

  const returnedIdx = stages.findIndex((s) =>
    s.returnedStatuses?.some((r) => r.toLowerCase() === norm)
  );

  if (returnedIdx !== -1) {
    const returnedStage = stages[returnedIdx];
    const evaluatedStages: EvaluatedStage[] = stages.map((s, idx) => ({
      ...s,
      state: idx < returnedIdx ? 'completed' : idx === returnedIdx ? 'returned' : 'upcoming',
    }));
    return {
      evaluatedStages,
      completedCount: returnedIdx,
      totalCount: stages.length,
      nextActionOwner: overrideOwner || returnedStage.actor || 'Owner',
      nextActionText:
        overrideNextAction ||
        `Address revision feedback for ${returnedStage.label} and resubmit for review.`,
      isReturned: true,
      isComplete: false,
    };
  }

  let activeIdx = stages.findIndex((s) => matchesStatus(s, norm));
  if (activeIdx === -1) activeIdx = 0;

  const activeStage = stages[activeIdx];
  const isTerminal =
    Boolean(activeStage?.isTerminal) || activeIdx === stages.length - 1;

  const evaluatedStages: EvaluatedStage[] = stages.map((s, idx) => {
    if (isTerminal) {
      return { ...s, state: 'completed' };
    }
    if (idx < activeIdx) return { ...s, state: 'completed' };
    if (idx === activeIdx) return { ...s, state: 'current' };
    return { ...s, state: 'upcoming' };
  });

  const completedCount = evaluatedStages.filter((s) => s.state === 'completed').length;

  return {
    evaluatedStages,
    completedCount,
    totalCount: stages.length,
    nextActionOwner: overrideOwner || activeStage?.actor || 'Owner',
    nextActionText:
      overrideNextAction ||
      activeStage?.nextAction ||
      activeStage?.detail ||
      'Proceed to next workflow stage.',
    isReturned: false,
    isComplete: isTerminal,
  };
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  status,
  currentStatus,
  stages,
  title,
  subtitle,
  nextAction,
  nextActionOwner,
  feedbackComment,
  action,
  compact = false,
  className = '',
}) => {
  const resolvedStatus = status ?? currentStatus ?? 'Draft';
  const model = evaluateWorkflow(resolvedStatus, stages, nextAction, nextActionOwner);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl ${
        compact ? 'p-4 space-y-3.5' : 'p-5 space-y-4'
      } ${className}`}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-900">
              {title || 'Workflow Timeline'}
            </span>
            <StatusText status={resolvedStatus} />
          </div>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-0.5 tabular-nums truncate">
              {subtitle}
            </div>
          )}
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
          {model.completedCount} / {model.totalCount} stages completed
        </div>
      </div>

      {/* Horizontal Connected Stage Stepper */}
      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-2 min-w-[560px]"
          style={{ gridTemplateColumns: `repeat(${model.evaluatedStages.length}, minmax(0, 1fr))` }}
        >
          {model.evaluatedStages.map((stage, idx) => {
            const isLast = idx === model.evaluatedStages.length - 1;
            const prevCompleted = idx > 0 && model.evaluatedStages[idx - 1].state === 'completed';

            const nodeClasses =
              stage.state === 'completed'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : stage.state === 'current'
                ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                : stage.state === 'returned'
                ? 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100'
                : stage.state === 'archived'
                ? 'bg-slate-400 border-slate-400 text-white'
                : 'bg-white border-slate-300 text-slate-400';

            const labelClasses =
              stage.state === 'completed'
                ? 'text-slate-900 font-semibold'
                : stage.state === 'current'
                ? 'text-blue-700 font-semibold'
                : stage.state === 'returned'
                ? 'text-rose-700 font-semibold'
                : 'text-slate-400 font-medium';

            return (
              <div key={stage.id} className="relative flex flex-col">
                {/* Node + Connector Line */}
                <div className="flex items-center">
                  <div
                    className={`h-0.5 flex-1 ${
                      idx === 0
                        ? 'bg-transparent'
                        : prevCompleted
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${nodeClasses}`}
                    aria-label={`${stage.label}: ${stage.state}`}
                  >
                    {stage.state === 'completed' || stage.state === 'archived' ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : stage.state === 'returned' ? (
                      <RotateCcw className="w-3 h-3" />
                    ) : stage.state === 'current' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <Circle className="w-2 h-2 fill-current" />
                    )}
                  </div>
                  <div
                    className={`h-0.5 flex-1 ${
                      isLast
                        ? 'bg-transparent'
                        : stage.state === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                </div>

                {/* Stage Copy */}
                <div className="mt-2 px-1 text-center">
                  <div className={`text-xs leading-tight ${labelClasses}`}>
                    {stage.label}
                  </div>
                  {stage.actor && (
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={stage.actor}>
                      {stage.actor}
                    </div>
                  )}
                  {!compact && stage.detail && (
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {stage.state === 'returned' ? 'Revision required' : stage.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Required Action Strip */}
      <div
        className={`pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          model.isReturned ? 'text-rose-900' : 'text-slate-700'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`mt-0.5 shrink-0 ${
              model.isReturned
                ? 'text-rose-600'
                : model.isComplete
                ? 'text-emerald-600'
                : 'text-blue-600'
            }`}
          >
            {model.isReturned ? (
              <AlertTriangle className="w-4 h-4" />
            ) : model.isComplete ? (
              <FileCheck2 className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </div>
          <div className="text-xs leading-relaxed min-w-0">
            <span className="font-semibold text-slate-900">
              {model.isComplete ? 'Current Status' : 'Next Required Action'} ({model.nextActionOwner}):{' '}
            </span>
            <span className={model.isReturned ? 'text-rose-800' : 'text-slate-600'}>
              {model.nextActionText}
            </span>
            {feedbackComment && model.isReturned && (
              <span className="block text-[11px] text-rose-700 mt-0.5">
                Note: “{feedbackComment}”
              </span>
            )}
          </div>
        </div>

        {action && (
          <button
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              action.disabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span>{action.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Context-aware next-action helpers for ExamNova domain entities
export function getBlueprintNextAction(status: BlueprintStatus, requirementsGenerated?: boolean): string | undefined {
  if (status === 'Active') {
    return requirementsGenerated
      ? 'Blueprint is active with requirements generated — assign author workloads or assemble examinations.'
      : 'Blueprint is active — open Question Requirements to allocate author workloads.';
  }
  return undefined;
}

export function getPackageNextAction(
  status: PackageStatus,
  counts: { readyQuestions?: number; totalQuestions?: number; returnedQuestions?: number }
): string | undefined {
  const totalQ = counts.totalQuestions ?? 0;
  const readyQ = counts.readyQuestions ?? 0;
  const returnedQ = counts.returnedQuestions ?? 0;
  const remainingQ = Math.max(0, totalQ - readyQ);

  if (status === 'Assigned' && totalQ > 0) {
    return `Open Authoring Workspace to write ${totalQ} assigned question slot(s).`;
  }
  if (status === 'In Progress' && totalQ > 0) {
    return remainingQ === 0
      ? `All ${totalQ} questions are marked Ready — submit the package for governance routing.`
      : `Complete ${remainingQ} remaining question(s) (${readyQ}/${totalQ} Ready) before submitting for review.`;
  }
  if (status === 'Returned to Author' && returnedQ > 0) {
    return `Revise ${returnedQ} returned question(s) per reviewer feedback and resubmit the package.`;
  }
  return undefined;
}

export function getExamNextAction(
  status: ExamStatus,
  counts: { selectedQuestions?: number; targetQuestions?: number }
): string | undefined {
  const sel = counts.selectedQuestions ?? 0;
  const target = counts.targetQuestions ?? 0;
  const missing = Math.max(0, target - sel);
  if (status === 'In Assembly' && target > 0) {
    return missing > 0
      ? `Select ${missing} additional Question Bank item(s) (${sel}/${target}) to satisfy blueprint validation.`
      : 'Verify 100% blueprint compliance and submit the assembled examination for Exam Review.';
  }
  return undefined;
}

/**
 * Interactive multi-entity Workflow Explorer used on Dashboards so any role
 * can inspect live Blueprints, Question Packages, and Examinations side-by-side.
 */
export const WorkflowTimelineExplorer: React.FC = () => {
  const {
    currentRole,
    blueprints,
    packages,
    questions,
    examinations,
    subjects,
    users,
    setActiveModule,
    setSelectedPackageId,
    setSelectedExamId,
  } = useExamNova();

  const defaultTab: WorkflowEntityType =
    currentRole === 'author'
      ? 'package'
      : currentRole === 'exam_developer' || currentRole === 'exam_reviewer' || currentRole === 'exam_approver'
      ? 'exam'
      : currentRole === 'reviewer' || currentRole === 'approver'
      ? 'package'
      : 'blueprint';

  const [tab, setTab] = useState<WorkflowEntityType>(defaultTab);
  const [selectedBpId, setSelectedBpId] = useState<string>(blueprints[0]?.id ?? '');
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id ?? '');
  const [selectedExId, setSelectedExId] = useState<string>(examinations[0]?.id ?? '');

  const activeBp = blueprints.find((b) => b.id === selectedBpId) || blueprints[0];
  const activePkg = packages.find((p) => p.id === selectedPkgId) || packages[0];
  const activeEx = examinations.find((e) => e.id === selectedExId) || examinations[0];

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '';
  const getUserName = (id?: string) => users.find((u) => u.id === id)?.name ?? 'Unassigned';

  const renderSelectedTimeline = () => {
    if (tab === 'blueprint') {
      if (!activeBp) {
        return <div className="p-6 text-xs text-slate-500">No blueprints created yet.</div>;
      }
      return (
        <WorkflowTimeline
          currentStatus={activeBp.status}
          stages={BLUEPRINT_WORKFLOW_STAGES}
          title={`${activeBp.code} — ${activeBp.title}`}
          subtitle={`${getSubjectName(activeBp.subjectId)} · Version ${activeBp.version} · ${activeBp.totalQuestions} Questions · ${activeBp.totalMarks} Marks`}
          nextAction={getBlueprintNextAction(activeBp.status, activeBp.requirementsGenerated)}
          feedbackComment={activeBp.approvalComment || activeBp.reviewComment}
          action={{
            label: 'Open Blueprints',
            onClick: () => setActiveModule('blueprints'),
          }}
          className="border-0 rounded-none p-5"
        />
      );
    }

    if (tab === 'package') {
      if (!activePkg) {
        return <div className="p-6 text-xs text-slate-500">No question packages assigned yet.</div>;
      }
      const pkgQs = questions.filter((q) => q.packageId === activePkg.id);
      const readyQ = pkgQs.filter((q) => q.authoringStatus === 'Ready').length;
      const returnedQ = pkgQs.filter((q) => q.reviewStatus === 'Returned').length;
      const returnedComment = pkgQs.find((q) => q.reviewStatus === 'Returned')?.reviewerComment;

      const targetModule =
        activePkg.status === 'Submitted'
          ? 'submitted_packages'
          : activePkg.status === 'In Review'
          ? 'question_review'
          : activePkg.status === 'Pending Approval'
          ? 'question_approval'
          : activePkg.status === 'Approved'
          ? 'question_bank'
          : 'my_work';

      return (
        <WorkflowTimeline
          currentStatus={activePkg.status}
          stages={PACKAGE_WORKFLOW_STAGES}
          title={activePkg.title}
          subtitle={`${getSubjectName(activePkg.subjectId)} · Author: ${getUserName(activePkg.authorId)} · ${readyQ}/${pkgQs.length} Ready · Due ${activePkg.dueDate}`}
          nextAction={getPackageNextAction(activePkg.status, {
            readyQuestions: readyQ,
            totalQuestions: pkgQs.length,
            returnedQuestions: returnedQ,
          })}
          feedbackComment={returnedComment}
          action={{
            label:
              targetModule === 'submitted_packages'
                ? 'Assign Reviewers'
                : targetModule === 'question_review'
                ? 'Open Review Console'
                : targetModule === 'question_approval'
                ? 'Open Approval Queue'
                : targetModule === 'question_bank'
                ? 'View Question Bank'
                : 'Open Package Work',
            onClick: () => {
              setSelectedPackageId(activePkg.id);
              setActiveModule(targetModule);
            },
          }}
          className="border-0 rounded-none p-5"
        />
      );
    }

    if (!activeEx) {
      return <div className="p-6 text-xs text-slate-500">No examinations created yet.</div>;
    }

    const bp = blueprints.find((b) => b.id === activeEx.blueprintId);
    const targetExModule =
      activeEx.status === 'Submitted for Review'
        ? 'exam_review'
        : activeEx.status === 'Pending Final Approval'
        ? 'exam_approval'
        : activeEx.status === 'Approved'
        ? 'exam_bank'
        : 'exam_assembly';

    return (
      <WorkflowTimeline
        currentStatus={activeEx.status}
        stages={EXAM_WORKFLOW_STAGES}
        title={`${activeEx.code} — ${activeEx.title}`}
        subtitle={`${getSubjectName(activeEx.subjectId)} · ${activeEx.selectedQuestionIds.length}/${bp?.totalQuestions ?? 0} Questions Selected · v${activeEx.version}`}
        nextAction={getExamNextAction(activeEx.status, {
          selectedQuestions: activeEx.selectedQuestionIds.length,
          targetQuestions: bp?.totalQuestions ?? 0,
        })}
        feedbackComment={activeEx.approvalComment || activeEx.reviewComment}
        action={{
          label:
            targetExModule === 'exam_review'
              ? 'Open Exam Review'
              : targetExModule === 'exam_approval'
              ? 'Open Exam Approval'
              : targetExModule === 'exam_bank'
              ? 'Open Exam Bank'
              : 'Open Exam Assembly',
          onClick: () => {
            setSelectedExamId(activeEx.id);
            setActiveModule(targetExModule);
          },
        }}
        className="border-0 rounded-none p-5"
      />
    );
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600 shrink-0" />
          <h2 className="text-sm font-semibold text-slate-900">Interactive Workflow Timeline</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Entity Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(
              [
                { id: 'blueprint', label: `Blueprints (${blueprints.length})` },
                { id: 'package', label: `Packages (${packages.length})` },
                { id: 'exam', label: `Exams (${examinations.length})` },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  tab === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Item Selector */}
          {tab === 'blueprint' && blueprints.length > 0 && (
            <select
              value={activeBp?.id || ''}
              onChange={(e) => setSelectedBpId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white max-w-xs"
            >
              {blueprints.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} — {b.title} [{b.status}]
                </option>
              ))}
            </select>
          )}
          {tab === 'package' && packages.length > 0 && (
            <select
              value={activePkg?.id || ''}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white max-w-xs"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} [{p.status}]
                </option>
              ))}
            </select>
          )}
          {tab === 'exam' && examinations.length > 0 && (
            <select
              value={activeEx?.id || ''}
              onChange={(e) => setSelectedExId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white max-w-xs"
            >
              {examinations.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.code} — {ex.title} [{ex.status}]
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {renderSelectedTimeline()}
    </section>
  );
};
