import katex from 'katex';
import {
  Blueprint,
  CognitiveLevel,
  DifficultyLevel,
  Examination,
  ExamType,
  LearningOutcome,
  QuestionItem,
  QuestionType,
  Subject,
  Topic,
} from '../types/examnova';

export interface ExportLookup {
  institutionName: string;
  examTypes: ExamType[];
  subjects: Subject[];
  topics: Topic[];
  learningOutcomes: LearningOutcome[];
  cognitiveLevels: CognitiveLevel[];
  difficultyLevels: DifficultyLevel[];
  questionTypes: QuestionType[];
}

export interface ExamExportJob {
  kind: 'exam';
  exam: Examination;
  blueprint?: Blueprint;
  questions: QuestionItem[];
  includeAnswerKey: boolean;
  includeMetadata: boolean;
}

export interface QuestionBankExportJob {
  kind: 'question_bank';
  title: string;
  subtitle: string;
  questions: QuestionItem[];
  includeAnswerKey: boolean;
  includeMetadata: boolean;
}

export type PrintExportJob = ExamExportJob | QuestionBankExportJob;

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

/**
 * Converts LaTeX ($...$ and $$...$$) to Word-compatible MathML using KaTeX.
 */
function renderMathMLForWord(raw: string): string {
  if (!raw) return '';
  let out = raw.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    try {
      const ml = katex.renderToString(expr.trim(), {
        displayMode: true,
        output: 'mathml',
        throwOnError: false,
      });
      return `<div style="margin:6pt 0; text-align:center;">${ml}</div>`;
    } catch {
      return `<code>$$${expr}$$</code>`;
    }
  });

  out = out.replace(/\$([^$\n]+?)\$/g, (_m, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: false,
        output: 'mathml',
        throwOnError: false,
      });
    } catch {
      return `<code>$${expr}$</code>`;
    }
  });

  return out;
}

function triggerBlobDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob(['\ufeff', content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wrapWordHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: 2cm 2cm 2cm 2cm;
  }
  body {
    font-family: "Calibri", "Segoe UI", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #0f172a;
  }
  .doc-header {
    border-bottom: 2pt solid #0f172a;
    padding-bottom: 10pt;
    margin-bottom: 16pt;
    text-align: center;
  }
  .inst {
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.8pt;
    color: #475569;
    margin-bottom: 3pt;
  }
  .title {
    font-size: 16pt;
    font-weight: bold;
    color: #0f172a;
    margin: 0 0 4pt 0;
  }
  .meta-line {
    font-size: 9.5pt;
    color: #334155;
    margin-bottom: 6pt;
  }
  .instructions {
    font-size: 10pt;
    color: #1e293b;
    background: #f8fafc;
    border: 1pt solid #cbd5e1;
    padding: 8pt 10pt;
    text-align: left;
    margin-top: 8pt;
  }
  .q-block {
    margin-bottom: 14pt;
    padding-bottom: 10pt;
    border-bottom: 0.5pt solid #e2e8f0;
    page-break-inside: avoid;
  }
  .q-meta {
    font-size: 8.5pt;
    color: #475569;
    margin-bottom: 3pt;
  }
  .q-stem {
    font-size: 11pt;
    margin-bottom: 6pt;
  }
  .options-table {
    width: 100%;
    border-collapse: collapse;
    margin-left: 14pt;
  }
  .options-table td {
    padding: 2.5pt 6pt;
    vertical-align: top;
    font-size: 10.5pt;
  }
  .key-box {
    margin-top: 6pt;
    margin-left: 14pt;
    padding: 5pt 8pt;
    background: #f0fdf4;
    border: 0.75pt solid #86efac;
    font-size: 9.5pt;
    color: #14532d;
  }
  .answer-summary {
    margin-top: 20pt;
    page-break-before: always;
  }
  .answer-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8pt;
    font-size: 9.5pt;
  }
  .answer-table th, .answer-table td {
    border: 0.75pt solid #cbd5e1;
    padding: 4pt 6pt;
    text-align: left;
  }
  .answer-table th {
    background: #f1f5f9;
    font-weight: bold;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function buildQuestionBlockHtml(
  q: QuestionItem,
  indexNumber: number,
  lookup: ExportLookup,
  includeAnswerKey: boolean,
  includeMetadata: boolean
): string {
  const subj = lookup.subjects.find((s) => s.id === q.subjectId)?.name ?? '';
  const top = lookup.topics.find((t) => t.id === q.topicId)?.name ?? '';
  const lo = lookup.learningOutcomes.find((l) => l.id === q.learningOutcomeId)?.code ?? '';
  const cog = lookup.cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
  const dif = lookup.difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
  const qt = lookup.questionTypes.find((t) => t.id === q.questionTypeId)?.code ?? 'MCQ';
  const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

  const metaHtml = includeMetadata
    ? `<div class="q-meta">[${q.id} v${q.version}] · ${subj} · ${top} · ${lo} · ${cog} · ${dif} · ${qt} · ${q.marks} Marks</div>`
    : '';

  const diagramHtml = q.diagramSvg
    ? `<div style="margin: 6pt 0 6pt 14pt;">${q.diagramSvg}</div>`
    : '';

  const optionsHtml =
    q.options.length > 0
      ? `<table class="options-table">
          ${q.options
            .map((opt) => {
              const isCorrect = includeAnswerKey && opt.id === q.correctOptionId;
              return `<tr>
                <td style="width: 24pt; font-weight: bold;">${opt.label}.</td>
                <td style="${isCorrect ? 'font-weight: bold; color: #166534;' : ''}">${renderMathMLForWord(opt.content)}${
                isCorrect ? ' &nbsp;[Correct]' : ''
              }</td>
              </tr>`;
            })
            .join('')}
        </table>`
      : '';

  const keyHtml = includeAnswerKey
    ? `<div class="key-box">
        <strong>Answer Key: ${correctOpt ? `Option ${correctOpt.label}` : q.sampleAnswer || 'See Rubric'}</strong><br/>
        <span>Rationale: ${renderMathMLForWord(q.rationale)}</span>
      </div>`
    : '';

  return `<div class="q-block">
    ${metaHtml}
    <div class="q-stem"><strong>${indexNumber}.</strong> ${renderMathMLForWord(q.stem)} <span style="color:#475569; font-size:9.5pt;">[${q.marks} ${
    q.marks === 1 ? 'mark' : 'marks'
  }]</span></div>
    ${diagramHtml}
    ${optionsHtml}
    ${keyHtml}
  </div>`;
}

export function exportExamToWord(job: ExamExportJob, lookup: ExportLookup): string {
  const { exam, blueprint, questions, includeAnswerKey, includeMetadata } = job;
  const subj = lookup.subjects.find((s) => s.id === exam.subjectId)?.name ?? '';
  const et = lookup.examTypes.find((e) => e.id === exam.examTypeId)?.name ?? '';

  const headerHtml = `<div class="doc-header">
    <div class="inst">${lookup.institutionName} · ${et}</div>
    <h1 class="title">${exam.title}</h1>
    <div class="meta-line">
      <strong>Paper Code:</strong> ${exam.code} &nbsp;|&nbsp;
      <strong>Subject:</strong> ${subj} &nbsp;|&nbsp;
      <strong>Version:</strong> ${exam.version} &nbsp;|&nbsp;
      <strong>Duration:</strong> ${blueprint?.durationMinutes ?? 60} Minutes &nbsp;|&nbsp;
      <strong>Total Marks:</strong> ${blueprint?.totalMarks ?? 40} &nbsp;|&nbsp;
      <strong>Pass Mark:</strong> ${blueprint?.passMark ?? 20}
    </div>
    <div class="instructions"><strong>Candidate Instructions:</strong> ${exam.instructions}</div>
  </div>`;

  const questionsHtml = questions
    .map((q, idx) => buildQuestionBlockHtml(q, idx + 1, lookup, includeAnswerKey, includeMetadata))
    .join('');

  const summaryHtml = includeAnswerKey
    ? `<div class="answer-summary">
        <h2 style="font-size:13pt; margin-bottom:6pt;">Official Answer Key & Blueprint Mapping (${exam.code})</h2>
        <table class="answer-table">
          <thead>
            <tr>
              <th>Q#</th>
              <th>Item ID</th>
              <th>Topic</th>
              <th>Cognitive / Difficulty</th>
              <th>Marks</th>
              <th>Correct Key</th>
            </tr>
          </thead>
          <tbody>
            ${questions
              .map((q, idx) => {
                const top = lookup.topics.find((t) => t.id === q.topicId)?.name ?? '';
                const cog = lookup.cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
                const dif = lookup.difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
                const key = q.options.find((o) => o.id === q.correctOptionId)?.label ?? '-';
                return `<tr>
                  <td>${idx + 1}</td>
                  <td>${q.id}</td>
                  <td>${top}</td>
                  <td>${cog} / ${dif}</td>
                  <td>${q.marks}</td>
                  <td><strong>${key}</strong></td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>`
    : '';

  const html = wrapWordHtml(exam.title, headerHtml + questionsHtml + summaryHtml);
  const filename = `${sanitizeFilename(exam.code || exam.title)}${includeAnswerKey ? '_with_Key' : ''}.doc`;
  triggerBlobDownload(filename, html, 'application/msword;charset=utf-8');
  return filename;
}

export function exportQuestionBankToWord(job: QuestionBankExportJob, lookup: ExportLookup): string {
  const { title, subtitle, questions, includeAnswerKey, includeMetadata } = job;

  const headerHtml = `<div class="doc-header">
    <div class="inst">${lookup.institutionName} · Certified Question Bank Export</div>
    <h1 class="title">${title}</h1>
    <div class="meta-line">${subtitle} &nbsp;|&nbsp; Total Items: <strong>${questions.length}</strong> &nbsp;|&nbsp; Generated: ${new Date().toISOString().slice(0, 10)}</div>
  </div>`;

  const questionsHtml = questions
    .map((q, idx) => buildQuestionBlockHtml(q, idx + 1, lookup, includeAnswerKey, includeMetadata))
    .join('');

  const html = wrapWordHtml(title, headerHtml + questionsHtml);
  const filename = `${sanitizeFilename(title)}_${questions.length}_Items.doc`;
  triggerBlobDownload(filename, html, 'application/msword;charset=utf-8');
  return filename;
}
