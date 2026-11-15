import React, { useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { StatusText } from '../components/StatusText';

type CurriculumTab =
  | 'exam_types'
  | 'subjects'
  | 'topics'
  | 'outcomes'
  | 'cognitive'
  | 'difficulty'
  | 'question_types';

export const CurriculumModule: React.FC = () => {
  const {
    examTypes,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    users,
    addExamType,
    updateExamType,
    addSubject,
    updateSubject,
    addTopic,
    updateTopic,
    addLearningOutcome,
    updateLearningOutcome,
    addCognitiveLevel,
    updateCognitiveLevel,
    addDifficultyLevel,
    updateDifficultyLevel,
    addQuestionType,
    updateQuestionType,
  } = useExamNova();

  const [tab, setTab] = useState<CurriculumTab>('exam_types');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [etName, setEtName] = useState('');
  const [etCode, setEtCode] = useState('');
  const [etLevel, setEtLevel] = useState('Upper Secondary');
  const [etDesc, setEtDesc] = useState('');

  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjCoord, setSubjCoord] = useState('usr-coord');

  const [topSubj, setTopSubj] = useState('subj-math');
  const [topName, setTopName] = useState('');
  const [topCode, setTopCode] = useState('');
  const [topSubs, setTopSubs] = useState('');

  const [loSubj, setLoSubj] = useState('subj-math');
  const [loTopic, setLoTopic] = useState('top-alg');
  const [loCode, setLoCode] = useState('');
  const [loStmt, setLoStmt] = useState('');
  const [loCog, setLoCog] = useState('cog-app');

  const [cogName, setCogName] = useState('');
  const [cogCode, setCogCode] = useState('');
  const [cogDesc, setCogDesc] = useState('');

  const [difName, setDifName] = useState('');
  const [difCode, setDifCode] = useState('');
  const [difWeight, setDifWeight] = useState(2);
  const [difDesc, setDifDesc] = useState('');

  const [qtName, setQtName] = useState('');
  const [qtCode, setQtCode] = useState('');
  const [qtHasOpts, setQtHasOpts] = useState(true);
  const [qtDesc, setQtDesc] = useState('');

  const tabs: { id: CurriculumTab; label: string; count: number }[] = [
    { id: 'exam_types', label: 'Exam Types', count: examTypes.length },
    { id: 'subjects', label: 'Subjects', count: subjects.length },
    { id: 'topics', label: 'Topics & Subtopics', count: topics.length },
    { id: 'outcomes', label: 'Learning Outcomes', count: learningOutcomes.length },
    { id: 'cognitive', label: 'Cognitive Levels', count: cognitiveLevels.length },
    { id: 'difficulty', label: 'Difficulty Levels', count: difficultyLevels.length },
    { id: 'question_types', label: 'Question Types', count: questionTypes.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Curriculum Management</h1>
        <p className="text-sm text-slate-500">
          Define academic hierarchies, taxonomy dimensions, and learning outcomes used by examination blueprints.
        </p>
      </div>

      {/* Segmented Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setEditingId(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label} <span className="font-mono tabular-nums text-slate-400 ml-1">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {tab === 'exam_types' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Exam Type</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {examTypes.map((et) => (
                  <tr key={et.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{et.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{et.name}</div>
                      <div className="text-slate-500 mt-0.5">{et.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{et.level}</td>
                    <td className="py-3 px-4">
                      <StatusText status={et.active ? 'Active' : 'Archived'} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(et.id);
                          setEtName(et.name);
                          setEtCode(et.code);
                          setEtLevel(et.level);
                          setEtDesc(et.description);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateExamType({ ...et, active: !et.active })}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        {et.active ? 'Archive' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!etName.trim() || !etCode.trim()) return;
              if (editingId) {
                const existing = examTypes.find((x) => x.id === editingId);
                updateExamType({
                  id: editingId,
                  name: etName.trim(),
                  code: etCode.trim().toUpperCase(),
                  level: etLevel,
                  description: etDesc.trim() || 'Standardized institutional assessment.',
                  active: existing?.active ?? true,
                });
                setEditingId(null);
              } else {
                addExamType({
                  name: etName.trim(),
                  code: etCode.trim().toUpperCase(),
                  level: etLevel,
                  description: etDesc.trim() || 'Standardized institutional assessment.',
                  active: true,
                });
              }
              setEtName('');
              setEtCode('');
              setEtDesc('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Exam Type' : 'Add Exam Type'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEtName('');
                    setEtCode('');
                    setEtDesc('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Exam Type Name</label>
              <input
                required
                value={etName}
                onChange={(e) => setEtName(e.target.value)}
                placeholder="e.g. Graduate Entrance Exam"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Code</label>
                <input
                  required
                  value={etCode}
                  onChange={(e) => setEtCode(e.target.value)}
                  placeholder="GRAD-ENT"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Academic Level</label>
                <input
                  value={etLevel}
                  onChange={(e) => setEtLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={etDesc}
                onChange={(e) => setEtDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Exam Type'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Coordinator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{s.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {users.find((u) => u.id === s.coordinatorId)?.name ?? 'Assigned'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusText status={s.active ? 'Active' : 'Archived'} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(s.id);
                          setSubjName(s.name);
                          setSubjCode(s.code);
                          setSubjCoord(s.coordinatorId);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSubject({ ...s, active: !s.active })}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        {s.active ? 'Archive' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!subjName.trim() || !subjCode.trim()) return;
              if (editingId) {
                const existing = subjects.find((x) => x.id === editingId);
                updateSubject({
                  id: editingId,
                  name: subjName.trim(),
                  code: subjCode.trim().toUpperCase(),
                  examTypeIds: existing?.examTypeIds ?? examTypes.map((ex) => ex.id),
                  coordinatorId: subjCoord,
                  active: existing?.active ?? true,
                });
                setEditingId(null);
              } else {
                addSubject({
                  name: subjName.trim(),
                  code: subjCode.trim().toUpperCase(),
                  examTypeIds: examTypes.map((e) => e.id),
                  coordinatorId: subjCoord,
                  active: true,
                });
              }
              setSubjName('');
              setSubjCode('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Subject' : 'Add Subject'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setSubjName('');
                    setSubjCode('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Name</label>
              <input
                required
                value={subjName}
                onChange={(e) => setSubjName(e.target.value)}
                placeholder="e.g. Biology"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Code</label>
              <input
                required
                value={subjCode}
                onChange={(e) => setSubjCode(e.target.value)}
                placeholder="BIOL-12"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Lead Coordinator</label>
              <select
                value={subjCoord}
                onChange={(e) => setSubjCoord(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {users
                  .filter((u) => u.role === 'coordinator')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Subject'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {topics.map((t) => {
              const subj = subjects.find((s) => s.id === t.subjectId);
              return (
                <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{t.code}</span>
                      <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                      <span className="text-xs text-slate-400">· {subj?.name}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Subtopics: {t.subtopics.map((st) => st.name).join(' · ') || 'None'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      {t.subtopics.length} subtopics
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(t.id);
                        setTopSubj(t.subjectId);
                        setTopName(t.name);
                        setTopCode(t.code);
                        setTopSubs(t.subtopics.map((st) => st.name).join(', '));
                      }}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!topName.trim() || !topCode.trim()) return;
              if (editingId) {
                updateTopic(
                  editingId,
                  topSubj,
                  topName.trim(),
                  topCode.trim().toUpperCase(),
                  topSubs.split(',')
                );
                setEditingId(null);
              } else {
                addTopic(
                  topSubj,
                  topName.trim(),
                  topCode.trim().toUpperCase(),
                  topSubs.split(',')
                );
              }
              setTopName('');
              setTopCode('');
              setTopSubs('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Topic & Subtopics' : 'Add Topic & Subtopics'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTopName('');
                    setTopCode('');
                    setTopSubs('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject</label>
              <select
                value={topSubj}
                onChange={(e) => setTopSubj(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Topic Name</label>
                <input
                  required
                  value={topName}
                  onChange={(e) => setTopName(e.target.value)}
                  placeholder="Linear Algebra"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Code</label>
                <input
                  required
                  value={topCode}
                  onChange={(e) => setTopCode(e.target.value)}
                  placeholder="LIN"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subtopics (comma-separated)</label>
              <textarea
                rows={2}
                value={topSubs}
                onChange={(e) => setTopSubs(e.target.value)}
                placeholder="Eigenvalues, Vector Spaces, Linear Maps"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Topic'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'outcomes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Learning Outcome Statement</th>
                  <th className="py-3 px-4">Target Cognitive</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {learningOutcomes.map((lo) => (
                  <tr key={lo.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{lo.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {topics.find((t) => t.id === lo.topicId)?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{lo.statement}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {cognitiveLevels.find((c) => c.id === lo.cognitiveLevelId)?.name}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(lo.id);
                          setLoSubj(lo.subjectId);
                          setLoTopic(lo.topicId);
                          setLoCode(lo.code);
                          setLoStmt(lo.statement);
                          setLoCog(lo.cognitiveLevelId);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loCode.trim() || !loStmt.trim()) return;
              if (editingId) {
                updateLearningOutcome({
                  id: editingId,
                  subjectId: loSubj,
                  topicId: loTopic,
                  code: loCode.trim().toUpperCase(),
                  statement: loStmt.trim(),
                  cognitiveLevelId: loCog,
                });
                setEditingId(null);
              } else {
                addLearningOutcome({
                  subjectId: loSubj,
                  topicId: loTopic,
                  code: loCode.trim().toUpperCase(),
                  statement: loStmt.trim(),
                  cognitiveLevelId: loCog,
                });
              }
              setLoCode('');
              setLoStmt('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Learning Outcome' : 'Add Learning Outcome'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setLoCode('');
                    setLoStmt('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={loSubj}
                  onChange={(e) => {
                    const nextSubj = e.target.value;
                    setLoSubj(nextSubj);
                    const firstT = topics.find((t) => t.subjectId === nextSubj);
                    if (firstT) setLoTopic(firstT.id);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Topic</label>
                <select
                  value={loTopic}
                  onChange={(e) => setLoTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {topics.filter((t) => t.subjectId === loSubj).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Outcome Code</label>
                <input
                  required
                  value={loCode}
                  onChange={(e) => setLoCode(e.target.value)}
                  placeholder="LO-CAL-03"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Cognitive Level</label>
                <select
                  value={loCog}
                  onChange={(e) => setLoCog(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {cognitiveLevels.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Statement</label>
              <textarea
                required
                rows={3}
                value={loStmt}
                onChange={(e) => setLoStmt(e.target.value)}
                placeholder="Demonstrate mastery of..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Learning Outcome'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'cognitive' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Cognitive Level</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cognitiveLevels.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.description}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(c.id);
                          setCogName(c.name);
                          setCogCode(c.code);
                          setCogDesc(c.description);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!cogName.trim() || !cogCode.trim()) return;
              if (editingId) {
                const existing = cognitiveLevels.find((x) => x.id === editingId);
                updateCognitiveLevel({
                  id: editingId,
                  name: cogName.trim(),
                  code: cogCode.trim().toUpperCase(),
                  order: existing?.order ?? cognitiveLevels.length,
                  description: cogDesc.trim() || 'Cognitive taxonomy tier.',
                });
                setEditingId(null);
              } else {
                addCognitiveLevel({
                  name: cogName.trim(),
                  code: cogCode.trim().toUpperCase(),
                  order: cognitiveLevels.length + 1,
                  description: cogDesc.trim() || 'Cognitive taxonomy tier.',
                });
              }
              setCogName('');
              setCogCode('');
              setCogDesc('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Cognitive Level' : 'Add Cognitive Level'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setCogName('');
                    setCogCode('');
                    setCogDesc('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Level Name</label>
                <input required value={cogName} onChange={(e) => setCogName(e.target.value)} placeholder="Creating" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Code</label>
                <input required value={cogCode} onChange={(e) => setCogCode(e.target.value)} placeholder="C6" className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Description</label>
              <textarea rows={2} value={cogDesc} onChange={(e) => setCogDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Cognitive Level'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'difficulty' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Criteria</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {difficultyLevels.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{d.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">{d.weight}</td>
                    <td className="py-3 px-4 text-slate-600">{d.description}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(d.id);
                          setDifName(d.name);
                          setDifCode(d.code);
                          setDifWeight(d.weight);
                          setDifDesc(d.description);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!difName.trim() || !difCode.trim()) return;
              if (editingId) {
                updateDifficultyLevel({
                  id: editingId,
                  name: difName.trim(),
                  code: difCode.trim().toUpperCase(),
                  weight: difWeight,
                  description: difDesc.trim() || 'Difficulty calibration tier.',
                });
                setEditingId(null);
              } else {
                addDifficultyLevel({
                  name: difName.trim(),
                  code: difCode.trim().toUpperCase(),
                  weight: difWeight,
                  description: difDesc.trim() || 'Difficulty calibration tier.',
                });
              }
              setDifName('');
              setDifCode('');
              setDifDesc('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Difficulty Level' : 'Add Difficulty Level'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setDifName('');
                    setDifCode('');
                    setDifDesc('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Name</label>
                <input required value={difName} onChange={(e) => setDifName(e.target.value)} placeholder="Challenge" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Weight</label>
                <input type="number" value={difWeight} onChange={(e) => setDifWeight(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Code</label>
              <input required value={difCode} onChange={(e) => setDifCode(e.target.value)} placeholder="CH" className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Criteria</label>
              <textarea rows={2} value={difDesc} onChange={(e) => setDifDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Difficulty Level'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'question_types' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Format Name</th>
                  <th className="py-3 px-4">Response Structure</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {questionTypes.map((qt) => (
                  <tr key={qt.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{qt.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{qt.name}</td>
                    <td className="py-3 px-4 text-slate-700">{qt.hasOptions ? 'Fixed Choice Options' : 'Constructed Response'}</td>
                    <td className="py-3 px-4 text-slate-600">{qt.description}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(qt.id);
                          setQtName(qt.name);
                          setQtCode(qt.code);
                          setQtHasOpts(qt.hasOptions);
                          setQtDesc(qt.description);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!qtName.trim() || !qtCode.trim()) return;
              if (editingId) {
                updateQuestionType({
                  id: editingId,
                  name: qtName.trim(),
                  code: qtCode.trim().toUpperCase(),
                  hasOptions: qtHasOpts,
                  description: qtDesc.trim() || 'Assessment item format.',
                });
                setEditingId(null);
              } else {
                addQuestionType({
                  name: qtName.trim(),
                  code: qtCode.trim().toUpperCase(),
                  hasOptions: qtHasOpts,
                  description: qtDesc.trim() || 'Assessment item format.',
                });
              }
              setQtName('');
              setQtCode('');
              setQtDesc('');
            }}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Question Type' : 'Add Question Type'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setQtName('');
                    setQtCode('');
                    setQtDesc('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Type Name</label>
                <input required value={qtName} onChange={(e) => setQtName(e.target.value)} placeholder="Structured Essay" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Code</label>
                <input required value={qtCode} onChange={(e) => setQtCode(e.target.value)} placeholder="SE" className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={qtHasOpts} onChange={(e) => setQtHasOpts(e.target.checked)} className="rounded text-blue-600" />
              <span>Uses Multiple-Choice Answer Options</span>
            </label>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Description</label>
              <textarea rows={2} value={qtDesc} onChange={(e) => setQtDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Question Type'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
