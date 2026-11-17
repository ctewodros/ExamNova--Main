import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, CheckCircle2, AlertTriangle, Tag } from 'lucide-react';
import {
  Blueprint,
  CognitiveLevel,
  DifficultyLevel,
  Examination,
  QuestionItem,
} from '../types/examnova';
import { getBloomsMeta } from '../utils/bloomsTaxonomy';

interface ExamAssemblyChartsProps {
  exam: Examination;
  blueprint: Blueprint;
  selectedQuestions: QuestionItem[];
  cognitiveLevels: CognitiveLevel[];
  difficultyLevels: DifficultyLevel[];
}

type MetricMode = 'count' | 'marks';

export const ExamAssemblyCharts: React.FC<ExamAssemblyChartsProps> = ({
  exam,
  blueprint,
  selectedQuestions,
  cognitiveLevels,
  difficultyLevels,
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('count');

  const orderedBlooms = useMemo(
    () => [...cognitiveLevels].sort((a, b) => a.order - b.order),
    [cognitiveLevels]
  );

  const bloomChartData = useMemo(() => {
    return orderedBlooms.map((cog) => {
      const meta = getBloomsMeta(cog);
      const targetRows = blueprint.tosRows.filter((r) => r.cognitiveLevelId === cog.id);
      const targetCount = targetRows.reduce((acc, r) => acc + r.questionCount, 0);
      const targetMarks = targetRows.reduce(
        (acc, r) => acc + r.questionCount * r.marksPerQuestion,
        0
      );

      const matchedQs = selectedQuestions.filter((q) => q.cognitiveLevelId === cog.id);
      const assembledCount = matchedQs.length;
      const assembledMarks = matchedQs.reduce((acc, q) => acc + q.marks, 0);

      const targetVal = metricMode === 'count' ? targetCount : targetMarks;
      const assembledVal = metricMode === 'count' ? assembledCount : assembledMarks;

      return {
        id: cog.id,
        label: `${meta.code} ${meta.shortLabel}`,
        fullName: `${meta.code} · ${cog.name}`,
        target: targetVal,
        assembled: assembledVal,
        targetCount,
        assembledCount,
        targetMarks,
        assembledMarks,
        delta: assembledVal - targetVal,
        aligned: targetVal === assembledVal,
      };
    });
  }, [orderedBlooms, blueprint.tosRows, selectedQuestions, metricMode]);

  const difficultyChartData = useMemo(() => {
    return difficultyLevels.map((dif) => {
      const targetRows = blueprint.tosRows.filter((r) => r.difficultyLevelId === dif.id);
      const targetCount = targetRows.reduce((acc, r) => acc + r.questionCount, 0);
      const targetMarks = targetRows.reduce(
        (acc, r) => acc + r.questionCount * r.marksPerQuestion,
        0
      );

      const matchedQs = selectedQuestions.filter((q) => q.difficultyLevelId === dif.id);
      const assembledCount = matchedQs.length;
      const assembledMarks = matchedQs.reduce((acc, q) => acc + q.marks, 0);

      const targetVal = metricMode === 'count' ? targetCount : targetMarks;
      const assembledVal = metricMode === 'count' ? assembledCount : assembledMarks;

      return {
        id: dif.id,
        label: `${dif.name} (${dif.code})`,
        fullName: dif.name,
        target: targetVal,
        assembled: assembledVal,
        targetCount,
        assembledCount,
        targetMarks,
        assembledMarks,
        delta: assembledVal - targetVal,
        aligned: targetVal === assembledVal,
      };
    });
  }, [difficultyLevels, blueprint.tosRows, selectedQuestions, metricMode]);

  // Aggregate Bloom's action verb tags across assembled exam items
  const bloomVerbSummary = useMemo(() => {
    const counts = new Map<string, number>();
    selectedQuestions.forEach((q) => {
      (q.bloomTags ?? []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [selectedQuestions]);

  const bloomsAligned = bloomChartData.every((d) => d.aligned);
  const difficultyAligned = difficultyChartData.every((d) => d.aligned);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-start gap-2.5">
          <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Blueprint Alignment Analytics — Bloom&apos;s Taxonomy &amp; Difficulty Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Live comparison of assembled draft (<span className="font-mono">{exam.code}</span>) against{' '}
              <span className="font-mono">{blueprint.code}</span> targets.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span
              className={`inline-flex items-center gap-1 ${
                bloomsAligned ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {bloomsAligned ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>Bloom&apos;s {bloomsAligned ? 'Matched' : 'Variance'}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 ${
                difficultyAligned ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {difficultyAligned ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>Difficulty {difficultyAligned ? 'Matched' : 'Variance'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap shrink-0 transition-colors ${
                metricMode === 'count'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Questions
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('marks')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap shrink-0 transition-colors ${
                metricMode === 'marks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Marks
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Bloom's Taxonomy Distribution */}
        <div className="lg:col-span-7 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Bloom&apos;s Taxonomy Level Distribution (C1–C6)
              </h4>
              <p className="text-[11px] text-slate-500">
                {metricMode === 'count' ? 'Question count' : 'Marks weight'} per cognitive level vs. Blueprint TOS
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-500">
              {selectedQuestions.length} / {blueprint.totalQuestions} Qs
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bloomChartData}
                margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value, name) => [
                    `${value ?? 0} ${metricMode === 'count' ? 'Qs' : 'Marks'}`,
                    String(name ?? ''),
                  ]}
                  labelFormatter={(label) => {
                    const row = bloomChartData.find((d) => d.label === label);
                    return row ? row.fullName : String(label);
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="target"
                  name="Blueprint Target"
                  fill="#CBD5E1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="assembled"
                  name="Assembled Draft"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                >
                  {bloomChartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={
                        entry.target === 0 && entry.assembled === 0
                          ? '#E2E8F0'
                          : entry.aligned
                          ? '#059669'
                          : entry.assembled > entry.target
                          ? '#D97706'
                          : '#2563EB'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tagged Bloom Action Verbs in Current Draft */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Tag className="w-3 h-3 text-blue-600" />
              <span>Tagged Action Verbs in Draft:</span>
            </span>
            {bloomVerbSummary.length === 0 ? (
              <span className="text-slate-400">No Bloom verb tags on selected items yet.</span>
            ) : (
              <span className="font-mono text-slate-600 tabular-nums">
                {bloomVerbSummary.map((v) => `${v.tag} (${v.count})`).join(' · ')}
              </span>
            )}
          </div>
        </div>

        {/* Chart 2: Difficulty Level Distribution */}
        <div className="lg:col-span-5 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Difficulty Level Distribution
              </h4>
              <p className="text-[11px] text-slate-500">
                {metricMode === 'count' ? 'Question count' : 'Marks weight'} per difficulty tier vs. Blueprint
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-500">
              {selectedQuestions.reduce((acc, q) => acc + q.marks, 0)} / {blueprint.totalMarks}m
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={difficultyChartData}
                margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value, name) => [
                    `${value ?? 0} ${metricMode === 'count' ? 'Qs' : 'Marks'}`,
                    String(name ?? ''),
                  ]}
                  labelFormatter={(label) => {
                    const row = difficultyChartData.find((d) => d.label === label);
                    return row ? `${row.fullName} Difficulty` : String(label);
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="target"
                  name="Blueprint Target"
                  fill="#CBD5E1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="assembled"
                  name="Assembled Draft"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                >
                  {difficultyChartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={
                        entry.target === 0 && entry.assembled === 0
                          ? '#E2E8F0'
                          : entry.aligned
                          ? '#059669'
                          : entry.assembled > entry.target
                          ? '#D97706'
                          : '#2563EB'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-Tier Exact Readout */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono tabular-nums">
            {difficultyChartData.map((row) => (
              <span
                key={row.id}
                className={
                  row.aligned
                    ? 'text-emerald-700 font-semibold'
                    : 'text-amber-700 font-medium'
                }
              >
                {row.fullName}: {row.assembled}/{row.target}
                {metricMode === 'marks' ? 'm' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
