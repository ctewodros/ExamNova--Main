import React from 'react';
import { useExamNova } from '../context/ExamNovaContext';
import { MathRenderer } from './MathRenderer';

export const PrintSheet: React.FC = () => {
  const {
    printJob,
    settings,
    examTypes,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
  } = useExamNova();

  if (!printJob) return null;

  const isExam = printJob.kind === 'exam';
  const items = printJob.questions;

  const examSubject = isExam
    ? subjects.find((s) => s.id === printJob.exam.subjectId)?.name ?? ''
    : '';
  const examType = isExam
    ? examTypes.find((e) => e.id === printJob.exam.examTypeId)?.name ?? ''
    : '';

  return (
    <div id="examnova-print-sheet" className="hidden print:block bg-white text-slate-900 p-6 max-w-none">
      {/* Formal Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center space-y-1.5">
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt={settings.institutionName}
            referrerPolicy="no-referrer"
            className="h-12 w-auto mx-auto object-contain mb-1"
          />
        )}
        <div className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
          {settings.institutionName} · {isExam ? examType : 'Certified Question Bank Export'}
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {isExam ? printJob.exam.title : printJob.title}
        </h1>
        {isExam && settings.watermarkDraftPapers && printJob.exam.status !== 'Approved' && (
          <div className="text-[11px] font-mono font-semibold text-amber-800 border border-amber-300 bg-amber-50 inline-block px-3 py-0.5 rounded">
            DRAFT SPECIFICATION — STATUS: {printJob.exam.status.toUpperCase()}
          </div>
        )}
        {isExam ? (
          <>
            <div className="text-xs text-slate-700 font-medium tabular-nums">
              Subject: {examSubject} · Paper Code: <span className="font-mono">{printJob.exam.code}</span> · Version {printJob.exam.version} · Duration:{' '}
              {printJob.blueprint?.durationMinutes ?? settings.defaultExamDurationMinutes} Minutes · Total Marks:{' '}
              {printJob.blueprint?.totalMarks ?? 40} · Pass Mark: {printJob.blueprint?.passMark ?? 20}
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-left mt-2">
              <strong>Candidate Instructions:</strong> {printJob.exam.instructions}
            </p>
          </>
        ) : (
          <div className="text-xs text-slate-600 tabular-nums">
            {printJob.subtitle} · Total Certified Items: {items.length} · Exported {new Date().toISOString().slice(0, 10)}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {items.map((q, idx) => {
          const subj = subjects.find((s) => s.id === q.subjectId)?.name ?? '';
          const top = topics.find((t) => t.id === q.topicId)?.name ?? '';
          const lo = learningOutcomes.find((l) => l.id === q.learningOutcomeId)?.code ?? '';
          const cog = cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
          const dif = difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
          const qt = questionTypes.find((t) => t.id === q.questionTypeId)?.code ?? 'MCQ';
          const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

          return (
            <div key={q.id} className="pb-4 border-b border-slate-200 break-inside-avoid space-y-2">
              {printJob.includeMetadata && (
                <div className="text-[10px] font-mono text-slate-500">
                  [{q.id} v{q.version}] · {subj} · {top} · {lo} · {cog} · {dif} · {qt} · {q.marks} Marks
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2 flex-1">
                  <span className="font-mono font-bold text-sm text-slate-900 shrink-0">{idx + 1}.</span>
                  <MathRenderer content={q.stem} className="text-sm text-slate-900" />
                </div>
                <span className="font-mono text-xs text-slate-600 shrink-0 tabular-nums">
                  [{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]
                </span>
              </div>

              {q.diagramSvg && (
                <div className="pl-6 py-1" dangerouslySetInnerHTML={{ __html: q.diagramSvg }} />
              )}

              {q.questionTypeId === 'qt-short' || q.options.length === 0 ? (
                !printJob.includeAnswerKey && (
                  <div className="pl-6 pt-2 space-y-3">
                    <div className="border-b border-dashed border-slate-300 h-5" />
                    <div className="border-b border-dashed border-slate-300 h-5" />
                  </div>
                )
              ) : (
                <div className="pl-6 grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {(q.questionTypeId === 'qt-tf' ? q.options.slice(0, 2) : q.options).map((opt) => {
                    const isKey = printJob.includeAnswerKey && opt.id === q.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-2 text-xs px-2 py-1 rounded ${
                          isKey ? 'bg-emerald-50 border border-emerald-300 font-semibold text-emerald-950' : 'text-slate-800'
                        }`}
                      >
                        <span className="font-mono font-bold">{opt.label}.</span>
                        <MathRenderer content={opt.content} className="text-xs" />
                      </div>
                    );
                  })}
                </div>
              )}

              {printJob.includeAnswerKey && (
                <div className="ml-6 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                  <strong className="text-slate-900">
                    Key: {q.questionTypeId !== 'qt-short' && correctOpt ? `Option ${correctOpt.label}` : q.sampleAnswer || 'See Rubric'}
                  </strong>{' '}
                  — <MathRenderer content={q.rationale} className="inline text-[11px]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exam Answer Key Summary Table on New Page */}
      {isExam && printJob.includeAnswerKey && (
        <div className="mt-8 pt-6 border-t-2 border-slate-900 break-before-page">
          <h2 className="text-sm font-bold text-slate-900 mb-3">
            Official Answer Key & Blueprint Mapping ({printJob.exam.code})
          </h2>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="py-1.5 px-2">Q#</th>
                <th className="py-1.5 px-2">Item ID</th>
                <th className="py-1.5 px-2">Topic</th>
                <th className="py-1.5 px-2">Cognitive / Difficulty</th>
                <th className="py-1.5 px-2 text-right">Marks</th>
                <th className="py-1.5 px-2 text-center">Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((q, idx) => {
                const top = topics.find((t) => t.id === q.topicId)?.name ?? '';
                const cog = cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
                const dif = difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
                const key =
                  q.questionTypeId === 'qt-short'
                    ? q.sampleAnswer || 'Rubric'
                    : q.options.find((o) => o.id === q.correctOptionId)?.label ?? '-';
                return (
                  <tr key={q.id}>
                    <td className="py-1 px-2 font-mono">{idx + 1}</td>
                    <td className="py-1 px-2 font-mono">{q.id}</td>
                    <td className="py-1 px-2">{top}</td>
                    <td className="py-1 px-2">{cog} / {dif}</td>
                    <td className="py-1 px-2 text-right font-mono">{q.marks}</td>
                    <td className="py-1 px-2 text-center font-mono font-bold">{key}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Footer */}
      <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
        <span>{settings.institutionName} · {isExam ? `${printJob.exam.code} v${printJob.exam.version}` : 'Certified Question Bank'}</span>
        <span>Generated via ExamNova · {new Date().toISOString().slice(0, 10)}</span>
      </div>
    </div>
  );
};
