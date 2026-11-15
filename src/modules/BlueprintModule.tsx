import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Send,
  ShieldCheck,
  Zap,
  History,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { Blueprint, TOSRow } from '../types/examnova';
import { StatusText } from '../components/StatusText';
import {
  WorkflowTimeline,
  BLUEPRINT_WORKFLOW_STAGES,
  getBlueprintNextAction,
} from '../components/WorkflowTimeline';

export const BlueprintModule: React.FC = () => {
  const {
    currentRole,
    blueprints,
    examTypes,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    users,
    activeUser,
    saveBlueprint,
    transitionBlueprint,
    activateBlueprint,
    setActiveModule,
  } = useExamNova();

  const [selectedId, setSelectedId] = useState<string | null>(blueprints[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [detailTab, setDetailTab] = useState<'tos' | 'metadata' | 'history'>('tos');
  const [createOpen, setCreateOpen] = useState(false);
  const [decisionComment, setDecisionComment] = useState('');

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newExamType, setNewExamType] = useState(examTypes[0]?.id ?? 'et-g12');
  const [newSubject, setNewSubject] = useState(subjects[0]?.id ?? 'subj-math');
  const [newTotalQ, setNewTotalQ] = useState(10);
  const [newTotalM, setNewTotalM] = useState(20);
  const [newDuration, setNewDuration] = useState(45);
  const [newPass, setNewPass] = useState(10);

  const selectedBp = blueprints.find((b) => b.id === selectedId) || blueprints[0];

  const reviewers = users.filter((u) => u.role === 'reviewer');
  const approvers = users.filter((u) => u.role === 'approver');

  const openDetail = (bp: Blueprint) => {
    setSelectedId(bp.id);
    setViewMode('detail');
    setDetailTab('tos');
    setDecisionComment('');
  };

  const handleCreateBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    const subjTopics = topics.filter((t) => t.subjectId === newSubject);
    const firstTopic = subjTopics[0] ?? topics[0];
    const firstLO = learningOutcomes.find((l) => l.topicId === firstTopic.id) ?? learningOutcomes[0];

    const created: Blueprint = {
      id: `bp-${Date.now()}`,
      title: newTitle.trim(),
      code: newCode.trim().toUpperCase(),
      version: '1.0',
      examTypeId: newExamType,
      subjectId: newSubject,
      totalQuestions: newTotalQ,
      totalMarks: newTotalM,
      durationMinutes: newDuration,
      passMark: newPass,
      status: 'Draft',
      createdBy: users.find((u) => u.role === currentRole)?.name ?? 'Coordinator',
      createdAt: '2026-11-14',
      reviewerId: reviewers[0]?.id,
      approverId: approvers[0]?.id,
      requirementsGenerated: false,
      tosRows: [
        {
          id: `tos-${Date.now()}`,
          topicId: firstTopic.id,
          learningOutcomeId: firstLO.id,
          cognitiveLevelId: cognitiveLevels[1]?.id ?? 'cog-und',
          difficultyLevelId: difficultyLevels[1]?.id ?? 'dif-med',
          questionTypeId: questionTypes[0]?.id ?? 'qt-mcq',
          questionCount: newTotalQ,
          marksPerQuestion: Math.max(1, Math.round(newTotalM / Math.max(1, newTotalQ))),
        },
      ],
      versions: [
        {
          version: '1.0',
          date: '2026-11-14',
          author: users.find((u) => u.role === currentRole)?.name ?? 'Coordinator',
          summary: 'Created initial blueprint specification.',
          status: 'Draft',
        },
      ],
    };

    saveBlueprint(created);
    setSelectedId(created.id);
    setCreateOpen(false);
    setViewMode('detail');
    setNewTitle('');
    setNewCode('');
  };

  // Blueprint Validation Helper
  const validateBp = (bp: Blueprint) => {
    const sumQ = bp.tosRows.reduce((acc, r) => acc + r.questionCount, 0);
    const sumM = bp.tosRows.reduce((acc, r) => acc + r.questionCount * r.marksPerQuestion, 0);
    const checks = [
      {
        label: `Question count matches target (${sumQ} / ${bp.totalQuestions})`,
        passed: sumQ === bp.totalQuestions && bp.totalQuestions > 0,
      },
      {
        label: `Total marks match target (${sumM} / ${bp.totalMarks})`,
        passed: sumM === bp.totalMarks && bp.totalMarks > 0,
      },
      {
        label: `Pass mark (${bp.passMark}) is within total marks (${bp.totalMarks})`,
        passed: bp.passMark > 0 && bp.passMark <= bp.totalMarks,
      },
      {
        label: `At least one TOS specification row defined (${bp.tosRows.length})`,
        passed: bp.tosRows.length > 0,
      },
    ];
    const passedCount = checks.filter((c) => c.passed).length;
    return {
      checks,
      sumQ,
      sumM,
      isValid: passedCount === checks.length,
      progressPct: Math.round((passedCount / checks.length) * 100),
    };
  };

  if (viewMode === 'list' || !selectedBp) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Blueprint Management</h1>
            <p className="text-sm text-slate-500">
              Design Tables of Specifications (TOS), manage peer review and approval, and activate operational requirements.
            </p>
          </div>
          {(currentRole === 'coordinator' || currentRole === 'admin') && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Blueprint</span>
            </button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Code & Version</th>
                <th className="py-3 px-4">Blueprint Title</th>
                <th className="py-3 px-4">Exam Type · Subject</th>
                <th className="py-3 px-4 text-right">Questions</th>
                <th className="py-3 px-4 text-right">Marks</th>
                <th className="py-3 px-4 text-right">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {blueprints.map((bp) => {
                const et = examTypes.find((e) => e.id === bp.examTypeId)?.name ?? '';
                const subj = subjects.find((s) => s.id === bp.subjectId)?.name ?? '';
                return (
                  <tr key={bp.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {bp.code} <span className="text-slate-400">v{bp.version}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{bp.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {subj} · {et}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">{bp.totalQuestions}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">{bp.totalMarks}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">{bp.durationMinutes}m</td>
                    <td className="py-3.5 px-4">
                      <StatusText status={bp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetail(bp)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                      >
                        Open TOS & Workflow
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Create Blueprint Modal */}
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <form onSubmit={handleCreateBlueprint} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Create Examination Blueprint</h3>
                <button type="button" onClick={() => setCreateOpen(false)} className="text-xs text-slate-500 hover:text-slate-800">Close</button>
              </div>
              <div className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blueprint Title</label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Grade 12 Chemistry National Blueprint"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blueprint Code</label>
                    <input
                      required
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="BP-CHEM-G12"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
                    <select value={newExamType} onChange={(e) => setNewExamType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                      {examTypes.map((et) => (
                        <option key={et.id} value={et.id}>{et.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                    <input type="number" min={10} value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Questions</label>
                    <input type="number" min={1} value={newTotalQ} onChange={(e) => setNewTotalQ(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
                    <input type="number" min={1} value={newTotalM} onChange={(e) => setNewTotalM(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pass Mark</label>
                    <input type="number" min={1} value={newPass} onChange={(e) => setNewPass(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-3.5 py-1.5 text-xs font-medium text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Create Draft Blueprint</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Detail View
  const val = validateBp(selectedBp);
  const editable = (selectedBp.status === 'Draft' || selectedBp.status === 'Returned') && currentRole === 'coordinator';
  const subjectTopics = topics.filter((t) => t.subjectId === selectedBp.subjectId);
  const subjectLOs = learningOutcomes.filter((l) => l.subjectId === selectedBp.subjectId);

  const updateRow = (rowId: string, patch: Partial<TOSRow>) => {
    const nextRows = selectedBp.tosRows.map((r) => (r.id === rowId ? { ...r, ...patch } : r));
    saveBlueprint({ ...selectedBp, tosRows: nextRows });
  };

  const addTosRow = () => {
    const firstTopic = subjectTopics[0] ?? topics[0];
    const firstLO = subjectLOs.find((l) => l.topicId === firstTopic.id) ?? subjectLOs[0] ?? learningOutcomes[0];
    const nextRow: TOSRow = {
      id: `tos-${Date.now()}`,
      topicId: firstTopic.id,
      learningOutcomeId: firstLO.id,
      cognitiveLevelId: cognitiveLevels[1]?.id ?? 'cog-und',
      difficultyLevelId: difficultyLevels[1]?.id ?? 'dif-med',
      questionTypeId: questionTypes[0]?.id ?? 'qt-mcq',
      questionCount: 2,
      marksPerQuestion: 2,
    };
    saveBlueprint({ ...selectedBp, tosRows: [...selectedBp.tosRows, nextRow] });
  };

  const removeTosRow = (rowId: string) => {
    saveBlueprint({
      ...selectedBp,
      tosRows: selectedBp.tosRows.filter((r) => r.id !== rowId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Back */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Blueprints</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{selectedBp.title}</h1>
            <StatusText status={selectedBp.status} />
          </div>
          <div className="text-xs text-slate-500 tabular-nums">
            {selectedBp.code} · Version {selectedBp.version} · {subjects.find((s) => s.id === selectedBp.subjectId)?.name} ·{' '}
            {selectedBp.totalQuestions} Questions · {selectedBp.totalMarks} Marks · {selectedBp.durationMinutes} Minutes · Pass Mark {selectedBp.passMark}
          </div>
        </div>

        {/* Role-specific Primary Workflow Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {currentRole === 'coordinator' && (selectedBp.status === 'Draft' || selectedBp.status === 'Returned') && (
            <button
              type="button"
              disabled={!val.isValid}
              onClick={() =>
                transitionBlueprint(
                  selectedBp.id,
                  'Submitted',
                  'TOS validated and submitted for peer review.',
                  selectedBp.reviewerId || reviewers[0]?.id,
                  selectedBp.approverId || approvers[0]?.id
                )
              }
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                val.isValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

          {currentRole === 'coordinator' && selectedBp.status === 'Approved' && (
            <button
              type="button"
              onClick={() => activateBlueprint(selectedBp.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Activate Blueprint & Generate Requirements</span>
            </button>
          )}

          {currentRole === 'coordinator' && selectedBp.status === 'Active' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const nextVer = (parseFloat(selectedBp.version || '1.0') + 0.1).toFixed(1);
                  const cloned: Blueprint = {
                    ...selectedBp,
                    id: `bp-${Date.now()}`,
                    version: nextVer,
                    status: 'Draft',
                    requirementsGenerated: false,
                    versions: [
                      {
                        version: nextVer,
                        date: new Date().toISOString().slice(0, 10),
                        author: activeUser.name,
                        summary: `Branched new draft v${nextVer} from Active v${selectedBp.version}.`,
                        status: 'Draft',
                      },
                      ...selectedBp.versions,
                    ],
                  };
                  saveBlueprint(cloned);
                  setSelectedId(cloned.id);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Version</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModule('question_requirements')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <span>View Question Requirements</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Workflow Timeline */}
      <WorkflowTimeline
        currentStatus={selectedBp.status}
        stages={BLUEPRINT_WORKFLOW_STAGES}
        nextAction={getBlueprintNextAction(selectedBp.status, selectedBp.requirementsGenerated)}
        feedbackComment={selectedBp.approvalComment || selectedBp.reviewComment}
      />

      {/* Reviewer / Approver Action Panel */}
      {((currentRole === 'reviewer' && selectedBp.status === 'Submitted') ||
        (currentRole === 'approver' && selectedBp.status === 'Reviewed')) && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              {currentRole === 'reviewer' ? 'Blueprint Peer Review Decision' : 'Final Blueprint Approval Decision'}
            </span>
          </div>
          <textarea
            rows={2}
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
            placeholder="Add review or approval justification notes..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                transitionBlueprint(
                  selectedBp.id,
                  currentRole === 'reviewer' ? 'Reviewed' : 'Approved',
                  decisionComment || 'Verified blueprint distribution and psychometric balance.'
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentRole === 'reviewer' ? 'Accept & Forward to Approver' : 'Approve Blueprint'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                transitionBlueprint(
                  selectedBp.id,
                  'Returned',
                  decisionComment || 'Returned for TOS weighting adjustment.'
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Coordinator</span>
            </button>
          </div>
        </div>
      )}

      {/* Validation Progress Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900">Blueprint Specification Validation</span>
          <span className="font-mono tabular-nums font-semibold text-slate-700">{val.progressPct}% Validated</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${val.isValid ? 'bg-emerald-600' : 'bg-amber-500'}`}
            style={{ width: `${val.progressPct}%` }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {val.checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              {c.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className={c.passed ? 'text-slate-700' : 'text-amber-800 font-medium'}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Topic, Cognitive & Difficulty Distribution Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-[11px]">
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg space-y-1">
            <div className="font-semibold text-slate-700">Topic Distribution</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 tabular-nums">
              {Array.from(new Set(selectedBp.tosRows.map((r) => r.topicId))).map((tId) => {
                const count = selectedBp.tosRows
                  .filter((r) => r.topicId === tId)
                  .reduce((acc, r) => acc + r.questionCount, 0);
                const marks = selectedBp.tosRows
                  .filter((r) => r.topicId === tId)
                  .reduce((acc, r) => acc + r.questionCount * r.marksPerQuestion, 0);
                return (
                  <span key={tId}>
                    {topics.find((t) => t.id === tId)?.name}: <strong className="font-mono text-slate-900">{count}Q</strong> ({marks}m)
                  </span>
                );
              })}
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg space-y-1">
            <div className="font-semibold text-slate-700">Cognitive Distribution</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 tabular-nums">
              {Array.from(new Set(selectedBp.tosRows.map((r) => r.cognitiveLevelId))).map((cId) => {
                const count = selectedBp.tosRows
                  .filter((r) => r.cognitiveLevelId === cId)
                  .reduce((acc, r) => acc + r.questionCount, 0);
                const pct = val.sumQ ? Math.round((count / val.sumQ) * 100) : 0;
                return (
                  <span key={cId}>
                    {cognitiveLevels.find((c) => c.id === cId)?.name}: <strong className="font-mono text-slate-900">{count}Q</strong> ({pct}%)
                  </span>
                );
              })}
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg space-y-1">
            <div className="font-semibold text-slate-700">Difficulty Balance</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 tabular-nums">
              {Array.from(new Set(selectedBp.tosRows.map((r) => r.difficultyLevelId))).map((dId) => {
                const count = selectedBp.tosRows
                  .filter((r) => r.difficultyLevelId === dId)
                  .reduce((acc, r) => acc + r.questionCount, 0);
                const pct = val.sumQ ? Math.round((count / val.sumQ) * 100) : 0;
                return (
                  <span key={dId}>
                    {difficultyLevels.find((d) => d.id === dId)?.name}: <strong className="font-mono text-slate-900">{count}Q</strong> ({pct}%)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setDetailTab('tos')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg ${detailTab === 'tos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
        >
          Table of Specifications (TOS Matrix)
        </button>
        <button
          type="button"
          onClick={() => setDetailTab('metadata')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg ${detailTab === 'metadata' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
        >
          Metadata & Governance Assignment
        </button>
        <button
          type="button"
          onClick={() => setDetailTab('history')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg ${detailTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
        >
          Version History ({selectedBp.versions.length})
        </button>
      </div>

      {/* TOS Matrix Tab */}
      {detailTab === 'tos' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600 tabular-nums">
              Allocated: <strong className="text-slate-900 font-mono">{val.sumQ}</strong> / {selectedBp.totalQuestions} Questions ·{' '}
              <strong className="text-slate-900 font-mono">{val.sumM}</strong> / {selectedBp.totalMarks} Marks
            </div>
            {editable && (
              <button
                type="button"
                onClick={addTosRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Matrix Row</span>
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Learning Outcome</th>
                  <th className="py-2.5 px-3">Cognitive</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Marks/Q</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  {editable && <th className="py-2.5 px-3 text-right">Remove</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {selectedBp.tosRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3">
                      {editable ? (
                        <select
                          value={row.topicId}
                          onChange={(e) => {
                            const nextTopicId = e.target.value;
                            const topicLOs = subjectLOs.filter((l) => l.topicId === nextTopicId);
                            const nextLoId = topicLOs[0]?.id ?? row.learningOutcomeId;
                            updateRow(row.id, { topicId: nextTopicId, learningOutcomeId: nextLoId });
                          }}
                          className="px-2 py-1 border border-slate-200 rounded bg-white"
                        >
                          {subjectTopics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-slate-900">
                          {topics.find((t) => t.id === row.topicId)?.name}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {editable ? (
                        <select
                          value={row.learningOutcomeId}
                          onChange={(e) => updateRow(row.id, { learningOutcomeId: e.target.value })}
                          className="px-2 py-1 border border-slate-200 rounded bg-white max-w-[180px]"
                        >
                          {(subjectLOs.some((lo) => lo.topicId === row.topicId)
                            ? subjectLOs.filter((lo) => lo.topicId === row.topicId)
                            : subjectLOs
                          ).map((lo) => (
                            <option key={lo.id} value={lo.id}>{lo.code}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-mono text-slate-600">
                          {learningOutcomes.find((lo) => lo.id === row.learningOutcomeId)?.code}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {editable ? (
                        <select
                          value={row.cognitiveLevelId}
                          onChange={(e) => updateRow(row.id, { cognitiveLevelId: e.target.value })}
                          className="px-2 py-1 border border-slate-200 rounded bg-white"
                        >
                          {cognitiveLevels.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        cognitiveLevels.find((c) => c.id === row.cognitiveLevelId)?.name
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {editable ? (
                        <select
                          value={row.difficultyLevelId}
                          onChange={(e) => updateRow(row.id, { difficultyLevelId: e.target.value })}
                          className="px-2 py-1 border border-slate-200 rounded bg-white"
                        >
                          {difficultyLevels.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      ) : (
                        difficultyLevels.find((d) => d.id === row.difficultyLevelId)?.name
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {editable ? (
                        <select
                          value={row.questionTypeId}
                          onChange={(e) => updateRow(row.id, { questionTypeId: e.target.value })}
                          className="px-2 py-1 border border-slate-200 rounded bg-white"
                        >
                          {questionTypes.map((qt) => (
                            <option key={qt.id} value={qt.id}>{qt.code}</option>
                          ))}
                        </select>
                      ) : (
                        questionTypes.find((qt) => qt.id === row.questionTypeId)?.code
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {editable ? (
                        <input
                          type="number"
                          min={1}
                          value={row.questionCount}
                          onChange={(e) => updateRow(row.id, { questionCount: Math.max(1, Number(e.target.value)) })}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-right"
                        />
                      ) : (
                        row.questionCount
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {editable ? (
                        <input
                          type="number"
                          min={1}
                          value={row.marksPerQuestion}
                          onChange={(e) => updateRow(row.id, { marksPerQuestion: Math.max(1, Number(e.target.value)) })}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-right"
                        />
                      ) : (
                        row.marksPerQuestion
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {row.questionCount * row.marksPerQuestion}
                    </td>
                    {editable && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeTosRow(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metadata & Governance Tab */}
      {detailTab === 'metadata' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blueprint Title</label>
            <input
              disabled={!editable}
              value={selectedBp.title}
              onChange={(e) => saveBlueprint({ ...selectedBp, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Version</label>
            <input
              disabled={!editable}
              value={selectedBp.version}
              onChange={(e) => saveBlueprint({ ...selectedBp, version: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
            <select
              disabled={!editable}
              value={selectedBp.examTypeId}
              onChange={(e) => saveBlueprint({ ...selectedBp, examTypeId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
            >
              {examTypes.map((et) => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject</label>
            <select
              disabled={!editable}
              value={selectedBp.subjectId}
              onChange={(e) => saveBlueprint({ ...selectedBp, subjectId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Total Questions</label>
            <input
              type="number"
              disabled={!editable}
              value={selectedBp.totalQuestions}
              onChange={(e) => saveBlueprint({ ...selectedBp, totalQuestions: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Total Marks</label>
            <input
              type="number"
              disabled={!editable}
              value={selectedBp.totalMarks}
              onChange={(e) => saveBlueprint({ ...selectedBp, totalMarks: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              disabled={!editable}
              value={selectedBp.durationMinutes}
              onChange={(e) => saveBlueprint({ ...selectedBp, durationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pass Mark</label>
            <input
              type="number"
              disabled={!editable}
              value={selectedBp.passMark}
              onChange={(e) => saveBlueprint({ ...selectedBp, passMark: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Blueprint Reviewer</label>
            <select
              disabled={!editable}
              value={selectedBp.reviewerId || ''}
              onChange={(e) => saveBlueprint({ ...selectedBp, reviewerId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
            >
              <option value="">Select Reviewer</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Blueprint Approver</label>
            <select
              disabled={!editable}
              value={selectedBp.approverId || ''}
              onChange={(e) => saveBlueprint({ ...selectedBp, approverId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
            >
              <option value="">Select Approver</option>
              {approvers.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Version History Tab */}
      {detailTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {selectedBp.versions.map((v, i) => (
            <div key={i} className="p-4 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <History className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900">
                    Version {v.version} — {v.author}
                  </div>
                  <div className="text-slate-600 mt-0.5">{v.summary}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <StatusText status={v.status} />
                <div className="font-mono tabular-nums text-slate-400 mt-1">{v.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
