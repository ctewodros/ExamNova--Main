import React, { useState } from 'react';
import { FileText, Printer, X, Download } from 'lucide-react';
import { Examination, QuestionItem } from '../types/examnova';
import { useExamNova } from '../context/ExamNovaContext';
import { exportExamToWord, exportQuestionBankToWord } from '../utils/exportDocument';

interface ExportModalProps {
  mode: 'exam' | 'question_bank';
  exam?: Examination;
  filteredQuestions?: QuestionItem[];
  allBankQuestions?: QuestionItem[];
  filterSummary?: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  mode,
  exam,
  filteredQuestions = [],
  allBankQuestions = [],
  filterSummary = 'All Certified Question Bank Items',
  onClose,
}) => {
  const {
    blueprints,
    questions,
    settings,
    examTypes,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
    triggerPdfExport,
    notifyToast,
  } = useExamNova();

  const [format, setFormat] = useState<'pdf' | 'word'>('pdf');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(mode === 'question_bank');
  const [includeMetadata, setIncludeMetadata] = useState(mode === 'question_bank');
  const [bankScope, setBankScope] = useState<'filtered' | 'all'>('filtered');

  const lookup = {
    institutionName: settings.institutionName,
    examTypes,
    subjects,
    topics,
    learningOutcomes,
    cognitiveLevels,
    difficultyLevels,
    questionTypes,
  };

  const handleExport = () => {
    if (mode === 'exam' && exam) {
      const bp = blueprints.find((b) => b.id === exam.blueprintId);
      const examQuestions = exam.selectedQuestionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is NonNullable<typeof q> => Boolean(q));

      if (format === 'word') {
        const filename = exportExamToWord(
          {
            kind: 'exam',
            exam,
            blueprint: bp,
            questions: examQuestions,
            includeAnswerKey,
            includeMetadata,
          },
          lookup
        );
        notifyToast(`Downloaded Word document: ${filename}`);
        onClose();
      } else {
        onClose();
        triggerPdfExport({
          kind: 'exam',
          exam,
          blueprint: bp,
          questions: examQuestions,
          includeAnswerKey,
          includeMetadata,
        });
      }
      return;
    }

    if (mode === 'question_bank') {
      const targetQuestions = bankScope === 'filtered' ? filteredQuestions : allBankQuestions;
      const subtitle =
        bankScope === 'filtered'
          ? filterSummary
          : 'Complete Certified Repository';

      if (format === 'word') {
        const filename = exportQuestionBankToWord(
          {
            kind: 'question_bank',
            title: 'ExamNova Certified Question Bank',
            subtitle,
            questions: targetQuestions,
            includeAnswerKey,
            includeMetadata,
          },
          lookup
        );
        notifyToast(`Downloaded Word document: ${filename}`);
        onClose();
      } else {
        onClose();
        triggerPdfExport({
          kind: 'question_bank',
          title: 'ExamNova Certified Question Bank',
          subtitle,
          questions: targetQuestions,
          includeAnswerKey,
          includeMetadata,
        });
      }
    }
  };

  const targetCount =
    mode === 'exam' && exam
      ? exam.selectedQuestionIds.length
      : bankScope === 'filtered'
      ? filteredQuestions.length
      : allBankQuestions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 no-print">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'exam' ? 'Export Examination Paper' : 'Export Question Bank'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'exam'
                ? `${exam?.code} — ${targetCount} questions`
                : `Prepare offline review & distribution package`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Format Selector */}
          <div>
            <div className="font-semibold text-slate-700 mb-2">Export Format</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  format === 'pdf'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>PDF Document</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Print-ready vector LaTeX & diagrams via Save as PDF.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('word')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  format === 'word'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Word (.doc)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Editable Word file with MathML equations & tables.
                </div>
              </button>
            </div>
          </div>

          {/* Scope for Question Bank */}
          {mode === 'question_bank' && (
            <div>
              <div className="font-semibold text-slate-700 mb-1.5">Question Scope</div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bank-scope"
                    checked={bankScope === 'filtered'}
                    onChange={() => setBankScope('filtered')}
                    className="text-blue-600"
                  />
                  <span>Current Filtered View ({filteredQuestions.length} items)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bank-scope"
                    checked={bankScope === 'all'}
                    onChange={() => setBankScope('all')}
                    className="text-blue-600"
                  />
                  <span>All Certified Question Bank Items ({allBankQuestions.length} items)</span>
                </label>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <div className="font-semibold text-slate-700">Document Options</div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <div>
                <div className="font-medium text-slate-800">Include Answer Key & Solution Rationales</div>
                <div className="text-[11px] text-slate-500">
                  Highlights correct keys, appends rationales, and includes a summary key table for exams.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <div>
                <div className="font-medium text-slate-800">Include Taxonomy & Item Metadata</div>
                <div className="text-[11px] text-slate-500">
                  Displays Item ID, version, Topic, Learning Outcome, Cognitive, and Difficulty tags.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={targetCount === 0}
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{format === 'pdf' ? 'Export as PDF' : 'Download Word (.doc)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
