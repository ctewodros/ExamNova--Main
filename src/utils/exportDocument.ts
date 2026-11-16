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

export interface MoodleExportOptions {
  categoryPath?: string;
  shuffleAnswers?: boolean;
  includeFeedback?: boolean;
  includeMetadata?: boolean;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapCdata(html: string): string {
  // Guard against literal ]]> inside CDATA
  return `<![CDATA[${html.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * Converts $...$ and $$...$$ delimiters to Moodle's standard MathJax filter delimiters \(...\) and \[...\].
 */
function formatHtmlForMoodle(raw: string): string {
  if (!raw) return '';
  let out = raw.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => `\\[${expr.trim()}\\]`);
  out = out.replace(/\$([^$\n]+?)\$/g, (_m, expr) => `\\(${expr.trim()}\\)`);
  return out.replace(/\n/g, '<br/>');
}

function buildMoodleQuestionXml(
  q: QuestionItem,
  indexNumber: number,
  lookup: ExportLookup,
  options: MoodleExportOptions
): string {
  const top = lookup.topics.find((t) => t.id === q.topicId)?.name ?? 'General';
  const lo = lookup.learningOutcomes.find((l) => l.id === q.learningOutcomeId)?.code ?? '';
  const cog = lookup.cognitiveLevels.find((c) => c.id === q.cognitiveLevelId)?.name ?? '';
  const dif = lookup.difficultyLevels.find((d) => d.id === q.difficultyLevelId)?.name ?? '';
  const shuffle = options.shuffleAnswers ?? true;
  const includeFeedback = options.includeFeedback ?? true;
  const includeMetadata = options.includeMetadata ?? true;

  const qTitle = `Q${String(indexNumber).padStart(2, '0')} [${q.id}] - ${top}`;
  const diagramHtml = q.diagramSvg ? `<div style="margin:8px 0;">${q.diagramSvg}</div>` : '';
  const stemHtml = `<p>${formatHtmlForMoodle(q.stem)}</p>${diagramHtml}`;
  const feedbackXml =
    includeFeedback && q.rationale
      ? `    <generalfeedback format="html">
      <text>${wrapCdata(`<p>${formatHtmlForMoodle(q.rationale)}</p>`)}</text>
    </generalfeedback>\n`
      : '';

  const tags = [top, lo, cog, dif, `v${q.version}`].filter(Boolean);
  const tagsXml =
    includeMetadata && tags.length > 0
      ? `    <tags>\n${tags
          .map((t) => `      <tag><text>${escapeXml(t)}</text></tag>`)
          .join('\n')}\n    </tags>\n`
      : '';

  // True / False
  if (q.questionTypeId === 'qt-tf') {
    const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
    const isTrueCorrect =
      correctOpt?.content.trim().toLowerCase() === 'true' || correctOpt?.label === 'A';
    return `  <question type="truefalse">
    <name><text>${escapeXml(qTitle)}</text></name>
    <questiontext format="html">
      <text>${wrapCdata(stemHtml)}</text>
    </questiontext>
${feedbackXml}    <defaultgrade>${q.marks.toFixed(7)}</defaultgrade>
    <penalty>1.0000000</penalty>
    <hidden>0</hidden>
    <answer fraction="${isTrueCorrect ? '100' : '0'}" format="moodle_auto_format">
      <text>true</text>
    </answer>
    <answer fraction="${isTrueCorrect ? '0' : '100'}" format="moodle_auto_format">
      <text>false</text>
    </answer>
${tagsXml}  </question>`;
  }

  // Short Answer
  if (q.questionTypeId === 'qt-short' || q.options.length === 0) {
    const acceptedText = (q.sampleAnswer || 'Manual rubric grading required').trim();
    return `  <question type="shortanswer">
    <name><text>${escapeXml(qTitle)}</text></name>
    <questiontext format="html">
      <text>${wrapCdata(stemHtml)}</text>
    </questiontext>
${feedbackXml}    <defaultgrade>${q.marks.toFixed(7)}</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
    <usecase>0</usecase>
    <answer fraction="100" format="moodle_auto_format">
      <text>${escapeXml(acceptedText)}</text>
      <feedback format="html"><text>${wrapCdata('<p>Accepted key answer.</p>')}</text></feedback>
    </answer>
${tagsXml}  </question>`;
  }

  // Multiple Choice (Default)
  const answersXml = q.options
    .map((opt) => {
      const fraction = opt.id === q.correctOptionId ? '100' : '0';
      return `    <answer fraction="${fraction}" format="html">
      <text>${wrapCdata(`<p>${formatHtmlForMoodle(opt.content)}</p>`)}</text>
    </answer>`;
    })
    .join('\n');

  return `  <question type="multichoice">
    <name><text>${escapeXml(qTitle)}</text></name>
    <questiontext format="html">
      <text>${wrapCdata(stemHtml)}</text>
    </questiontext>
${feedbackXml}    <defaultgrade>${q.marks.toFixed(7)}</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
    <single>true</single>
    <shuffleanswers>${shuffle ? 'true' : 'false'}</shuffleanswers>
    <answernumbering>abc</answernumbering>
${answersXml}
${tagsXml}  </question>`;
}

export function buildExamsMoodleXmlString(
  examsWithQuestions: Array<{ exam: Examination; blueprint?: Blueprint; questions: QuestionItem[] }>,
  lookup: ExportLookup,
  options: MoodleExportOptions = {}
): string {
  const baseCategory = (options.categoryPath || '$course$/top/ExamNova-Certified').replace(/\/+$/, '');
  const sections = examsWithQuestions
    .map(({ exam, questions }) => {
      const catLine = `  <question type="category">
    <category><text>${escapeXml(`${baseCategory}/${exam.code}_v${exam.version}`)}</text></category>
    <info format="html"><text>${wrapCdata(`<p>${escapeXml(exam.title)} — ${escapeXml(exam.instructions)}</p>`)}</text></info>
  </question>`;
      const qBlocks = questions
        .map((q, idx) => buildMoodleQuestionXml(q, idx + 1, lookup, options))
        .join('\n');
      return `${catLine}\n${qBlocks}`;
    })
    .join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
<!-- Generated by ${escapeXml(lookup.institutionName)} · Moodle Import-Ready XML -->
${sections}
</quiz>
`;
}

export function exportExamToMoodleXml(
  job: ExamExportJob,
  lookup: ExportLookup,
  options: MoodleExportOptions = {}
): string {
  const xml = buildExamsMoodleXmlString(
    [{ exam: job.exam, blueprint: job.blueprint, questions: job.questions }],
    lookup,
    {
      ...options,
      includeFeedback: options.includeFeedback ?? job.includeAnswerKey,
      includeMetadata: options.includeMetadata ?? job.includeMetadata,
    }
  );
  const filename = `${sanitizeFilename(job.exam.code || job.exam.title)}_moodle.xml`;
  triggerBlobDownload(filename, xml, 'application/xml;charset=utf-8');
  return filename;
}

export function exportExamsBatchToMoodleXml(
  examsWithQuestions: Array<{ exam: Examination; blueprint?: Blueprint; questions: QuestionItem[] }>,
  lookup: ExportLookup,
  options: MoodleExportOptions = {}
): string {
  if (examsWithQuestions.length === 1) {
    const single = examsWithQuestions[0];
    return exportExamToMoodleXml(
      {
        kind: 'exam',
        exam: single.exam,
        blueprint: single.blueprint,
        questions: single.questions,
        includeAnswerKey: options.includeFeedback ?? true,
        includeMetadata: options.includeMetadata ?? true,
      },
      lookup,
      options
    );
  }
  const xml = buildExamsMoodleXmlString(examsWithQuestions, lookup, options);
  const filename = `ExamNova_Moodle_Bundle_${examsWithQuestions.length}_Exams.xml`;
  triggerBlobDownload(filename, xml, 'application/xml;charset=utf-8');
  return filename;
}

function escapeGift(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/~/g, '\\~')
    .replace(/=/g, '\\=')
    .replace(/#/g, '\\#')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/:/g, '\\:');
}

export function exportExamToMoodleGift(
  job: ExamExportJob,
  lookup: ExportLookup,
  options: MoodleExportOptions = {}
): string {
  const baseCategory = (options.categoryPath || '$course$/top/ExamNova-Certified').replace(/\/+$/, '');
  const includeFeedback = options.includeFeedback ?? job.includeAnswerKey;
  const lines: string[] = [
    `// ${lookup.institutionName} — Moodle GIFT Format`,
    `$CATEGORY: ${baseCategory}/${job.exam.code}_v${job.exam.version}`,
    '',
  ];

  job.questions.forEach((q, idx) => {
    const qName = `Q${String(idx + 1).padStart(2, '0')} [${q.id}]`;
    const stem = escapeGift(q.stem.replace(/\n+/g, ' '));
    const rationale = includeFeedback && q.rationale ? ` #### ${escapeGift(q.rationale)}` : '';

    if (q.questionTypeId === 'qt-tf') {
      const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
      const isTrue = correctOpt?.content.trim().toLowerCase() === 'true' || correctOpt?.label === 'A';
      lines.push(`::${qName}:: ${stem} {${isTrue ? 'T' : 'F'}${rationale}}`);
    } else if (q.questionTypeId === 'qt-short' || q.options.length === 0) {
      const ans = escapeGift(q.sampleAnswer || 'See Rubric');
      lines.push(`::${qName}:: ${stem} {=${ans}${rationale}}`);
    } else {
      const opts = q.options
        .map((opt) => `${opt.id === q.correctOptionId ? '=' : '~'}${escapeGift(opt.content)}`)
        .join(' ');
      lines.push(`::${qName}:: ${stem} {${opts}${rationale}}`);
    }
    lines.push('');
  });

  const filename = `${sanitizeFilename(job.exam.code || job.exam.title)}_moodle_gift.txt`;
  triggerBlobDownload(filename, lines.join('\n'), 'text/plain;charset=utf-8');
  return filename;
}

