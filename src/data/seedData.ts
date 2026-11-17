import {
  AuditLogEntry,
  Blueprint,
  CognitiveLevel,
  DifficultyLevel,
  Examination,
  ExamType,
  LearningOutcome,
  PlatformNotification,
  PlatformUser,
  QuestionItem,
  QuestionPackage,
  QuestionType,
  QuestionVersionSnapshot,
  RoleDefinition,
  RolePermissionMatrix,
  Subject,
  SystemSettings,
  Topic,
} from '../types/examnova';
import { DEFAULT_BLOOM_VERBS_BY_ID } from '../utils/bloomsTaxonomy';

export const ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    label: 'System Administrator',
    shortLabel: 'Admin',
    description: 'Manages users, roles, permissions, subject access, audit logs, and system settings.',
    defaultModule: 'dashboard',
  },
  {
    id: 'coordinator',
    label: 'Subject Coordinator',
    shortLabel: 'Coordinator',
    description: 'Manages curriculum, blueprints, question requirements, author assignments, and review governance.',
    defaultModule: 'dashboard',
  },
  {
    id: 'author',
    label: 'Question Author',
    shortLabel: 'Author',
    description: 'Develops assigned questions using the rich mathematical editor and submits completed packages.',
    defaultModule: 'dashboard',
  },
  {
    id: 'reviewer',
    label: 'Question Reviewer',
    shortLabel: 'Q. Reviewer',
    description: 'Evaluates submitted questions and blueprints, accepts valid items, or returns items with feedback.',
    defaultModule: 'dashboard',
  },
  {
    id: 'approver',
    label: 'Question Approver',
    shortLabel: 'Q. Approver',
    description: 'Performs final quality sign-off on reviewed blueprints and questions for Question Bank release.',
    defaultModule: 'dashboard',
  },
  {
    id: 'exam_developer',
    label: 'Exam Developer',
    shortLabel: 'Exam Dev',
    description: 'Assembles examinations from eligible Question Bank items against active blueprints.',
    defaultModule: 'dashboard',
  },
  {
    id: 'exam_reviewer',
    label: 'Exam Reviewer',
    shortLabel: 'Exam Reviewer',
    description: 'Reviews assembled examination papers for balance, clarity, and blueprint compliance.',
    defaultModule: 'dashboard',
  },
  {
    id: 'exam_approver',
    label: 'Exam Approver',
    shortLabel: 'Exam Approver',
    description: 'Grants final authorization to publish examinations into the official Exam Bank.',
    defaultModule: 'dashboard',
  },
];

export const INITIAL_USERS: PlatformUser[] = [
  {
    id: 'usr-admin',
    name: 'Tewodros Abebaw',
    email: 't.abebaw@examnova.edu',
    department: 'Assessment Systems Office',
    role: 'admin',
    subjects: ['subj-math', 'subj-phys', 'subj-chem'],
    status: 'Active',
    lastActive: '2026-11-14 08:42',
  },
  {
    id: 'usr-coord',
    name: 'Dr. Selamawit Bekele',
    email: 's.bekele@examnova.edu',
    department: 'Department of Mathematics',
    role: 'coordinator',
    subjects: ['subj-math', 'subj-phys'],
    status: 'Active',
    lastActive: '2026-11-14 08:30',
  },
  {
    id: 'usr-author',
    name: 'Prof. Dawit Mekonnen',
    email: 'd.mekonnen@examnova.edu',
    department: 'Department of Mathematics',
    role: 'author',
    subjects: ['subj-math'],
    status: 'Active',
    lastActive: '2026-11-14 08:15',
  },
  {
    id: 'usr-author-2',
    name: 'Dr. Meron Tadesse',
    email: 'm.tadesse@examnova.edu',
    department: 'Department of Physics',
    role: 'author',
    subjects: ['subj-phys'],
    status: 'Active',
    lastActive: '2026-11-13 17:10',
  },
  {
    id: 'usr-reviewer',
    name: 'Dr. Samuel Girma',
    email: 's.girma@examnova.edu',
    department: 'Applied Mathematics Panel',
    role: 'reviewer',
    subjects: ['subj-math', 'subj-phys'],
    status: 'Active',
    lastActive: '2026-11-14 07:55',
  },
  {
    id: 'usr-approver',
    name: 'Prof. Helena Abebe',
    email: 'h.abebe@examnova.edu',
    department: 'National Examination Board',
    role: 'approver',
    subjects: ['subj-math', 'subj-phys', 'subj-chem'],
    status: 'Active',
    lastActive: '2026-11-14 08:05',
  },
  {
    id: 'usr-exam-dev',
    name: 'Daniel Tesfaye',
    email: 'd.tesfaye@examnova.edu',
    department: 'Test Assembly Unit',
    role: 'exam_developer',
    subjects: ['subj-math', 'subj-phys'],
    status: 'Active',
    lastActive: '2026-11-14 08:20',
  },
  {
    id: 'usr-exam-rev',
    name: 'Dr. Yonas Haile',
    email: 'y.haile@examnova.edu',
    department: 'Psychometrics & QA',
    role: 'exam_reviewer',
    subjects: ['subj-math', 'subj-phys'],
    status: 'Active',
    lastActive: '2026-11-13 16:40',
  },
  {
    id: 'usr-exam-app',
    name: 'Prof. Ruth Alemayehu',
    email: 'r.alemayehu@examnova.edu',
    department: 'Academic Senate',
    role: 'exam_approver',
    subjects: ['subj-math', 'subj-phys', 'subj-chem'],
    status: 'Active',
    lastActive: '2026-11-14 07:30',
  },
];

export const INITIAL_EXAM_TYPES: ExamType[] = [
  {
    id: 'et-g12',
    name: 'Grade 12 National Examination',
    code: 'G12-NAT',
    level: 'Upper Secondary',
    description: 'National standardized university-entrance qualifying examination.',
    active: true,
  },
  {
    id: 'et-ug',
    name: 'Undergraduate Placement Assessment',
    code: 'UG-PLC',
    level: 'University Year 1',
    description: 'Diagnostic placement exam for incoming STEM undergraduate cohorts.',
    active: true,
  },
  {
    id: 'et-mid',
    name: 'Mid-Semester Institutional Exam',
    code: 'INST-MID',
    level: 'Institutional',
    description: 'Standardized multi-section mid-semester university assessment.',
    active: true,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    code: 'MATH-12',
    examTypeIds: ['et-g12', 'et-ug', 'et-mid'],
    coordinatorId: 'usr-coord',
    active: true,
  },
  {
    id: 'subj-phys',
    name: 'Physics',
    code: 'PHYS-12',
    examTypeIds: ['et-g12', 'et-ug'],
    coordinatorId: 'usr-coord',
    active: true,
  },
  {
    id: 'subj-chem',
    name: 'Chemistry',
    code: 'CHEM-12',
    examTypeIds: ['et-g12'],
    coordinatorId: 'usr-coord',
    active: true,
  },
];

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 'top-alg',
    subjectId: 'subj-math',
    name: 'Algebra',
    code: 'ALG',
    subtopics: [
      { id: 'sub-alg-1', name: 'Quadratic & Polynomial Equations' },
      { id: 'sub-alg-2', name: 'Logarithmic & Exponential Functions' },
      { id: 'sub-alg-3', name: 'Matrices & Determinants' },
      { id: 'sub-alg-4', name: 'Sequences & Series' },
    ],
  },
  {
    id: 'top-calc',
    subjectId: 'subj-math',
    name: 'Calculus',
    code: 'CAL',
    subtopics: [
      { id: 'sub-calc-1', name: 'Limits & Continuity' },
      { id: 'sub-calc-2', name: 'Differentiation & Optimization' },
      { id: 'sub-calc-3', name: 'Definite & Indefinite Integrals' },
    ],
  },
  {
    id: 'top-geo',
    subjectId: 'subj-math',
    name: 'Geometry',
    code: 'GEO',
    subtopics: [
      { id: 'sub-geo-1', name: 'Coordinate Geometry & Lines' },
      { id: 'sub-geo-2', name: 'Conic Sections' },
      { id: 'sub-geo-3', name: 'Vectors in 2D & 3D' },
    ],
  },
  {
    id: 'top-trig',
    subjectId: 'subj-math',
    name: 'Trigonometry',
    code: 'TRG',
    subtopics: [
      { id: 'sub-trig-1', name: 'Trigonometric Identities' },
      { id: 'sub-trig-2', name: 'Triangles & Law of Cosines' },
      { id: 'sub-trig-3', name: 'Inverse Trigonometric Functions' },
    ],
  },
  {
    id: 'top-prob',
    subjectId: 'subj-math',
    name: 'Probability',
    code: 'PRB',
    subtopics: [
      { id: 'sub-prob-1', name: 'Permutations & Combinations' },
      { id: 'sub-prob-2', name: 'Conditional Probability & Bayes' },
      { id: 'sub-prob-3', name: 'Binomial Probability' },
    ],
  },
  {
    id: 'top-stat',
    subjectId: 'subj-math',
    name: 'Statistics',
    code: 'STA',
    subtopics: [
      { id: 'sub-stat-1', name: 'Measures of Central Tendency & Dispersion' },
      { id: 'sub-stat-2', name: 'Normal Distribution & Z-Scores' },
    ],
  },
  {
    id: 'top-mech',
    subjectId: 'subj-phys',
    name: 'Classical Mechanics',
    code: 'MEC',
    subtopics: [
      { id: 'sub-mech-1', name: 'Kinematics & Projectile Motion' },
      { id: 'sub-mech-2', name: 'Newtonian Dynamics & Friction' },
    ],
  },
  {
    id: 'top-wave',
    subjectId: 'subj-phys',
    name: 'Waves & Optics',
    code: 'WAV',
    subtopics: [
      { id: 'sub-wave-1', name: 'Harmonic Oscillations' },
      { id: 'sub-wave-2', name: 'Refraction & Interference' },
    ],
  },
];

export const INITIAL_COGNITIVE_LEVELS: CognitiveLevel[] = [
  { id: 'cog-rem', name: 'Remembering', code: 'C1', order: 1, description: 'Recall definitions, formulas, and standard facts.' },
  { id: 'cog-und', name: 'Understanding', code: 'C2', order: 2, description: 'Interpret concepts, classify expressions, and translate representations.' },
  { id: 'cog-app', name: 'Applying', code: 'C3', order: 3, description: 'Execute mathematical procedures and solve structured problems.' },
  { id: 'cog-ana', name: 'Analyzing', code: 'C4', order: 4, description: 'Deconstruct multi-step systems, compare relationships, and infer constraints.' },
  { id: 'cog-eva', name: 'Evaluating', code: 'C5', order: 5, description: 'Critique proofs, verify edge cases, and justify optimal solutions.' },
  { id: 'cog-cre', name: 'Creating', code: 'C6', order: 6, description: 'Formulate original models, construct equations, and synthesize new derivations.' },
];

export const INITIAL_DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'dif-easy', name: 'Easy', code: 'E', weight: 1, description: 'Direct single-step recall or straightforward substitution.' },
  { id: 'dif-med', name: 'Medium', code: 'M', weight: 2, description: 'Multi-step problem requiring concept synthesis.' },
  { id: 'dif-hard', name: 'Hard', code: 'H', weight: 3, description: 'Non-routine reasoning, proof analysis, or cross-topic application.' },
];

export const INITIAL_QUESTION_TYPES: QuestionType[] = [
  { id: 'qt-mcq', name: 'Multiple Choice (MCQ)', code: 'MCQ', hasOptions: true, description: 'Single-best-answer 4-option multiple choice item.' },
  { id: 'qt-tf', name: 'True / False', code: 'TF', hasOptions: true, description: 'Binary conceptual verification item.' },
  { id: 'qt-short', name: 'Short Answer', code: 'SA', hasOptions: false, description: 'Concise numeric or symbolic response.' },
];

export const INITIAL_LEARNING_OUTCOMES: LearningOutcome[] = [
  { id: 'lo-alg-1', subjectId: 'subj-math', topicId: 'top-alg', code: 'LO-ALG-01', statement: 'Solve exponential, logarithmic, and quadratic equations analytically.', cognitiveLevelId: 'cog-app' },
  { id: 'lo-alg-2', subjectId: 'subj-math', topicId: 'top-alg', code: 'LO-ALG-02', statement: 'Evaluate determinants, inverse matrices, and series convergence.', cognitiveLevelId: 'cog-ana' },
  { id: 'lo-calc-1', subjectId: 'subj-math', topicId: 'top-calc', code: 'LO-CAL-01', statement: 'Compute limits, continuity bounds, and first/second derivatives.', cognitiveLevelId: 'cog-app' },
  { id: 'lo-calc-2', subjectId: 'subj-math', topicId: 'top-calc', code: 'LO-CAL-02', statement: 'Apply definite integrals to find bounded areas and optimization extrema.', cognitiveLevelId: 'cog-ana' },
  { id: 'lo-geo-1', subjectId: 'subj-math', topicId: 'top-geo', code: 'LO-GEO-01', statement: 'Analyze equations of lines, circles, conic sections, and vector projections.', cognitiveLevelId: 'cog-app' },
  { id: 'lo-trig-1', subjectId: 'subj-math', topicId: 'top-trig', code: 'LO-TRG-01', statement: 'Simplify trigonometric identities and solve triangles using sine/cosine laws.', cognitiveLevelId: 'cog-und' },
  { id: 'lo-prob-1', subjectId: 'subj-math', topicId: 'top-prob', code: 'LO-PRB-01', statement: 'Calculate conditional probabilities and combinatorial event spaces.', cognitiveLevelId: 'cog-app' },
  { id: 'lo-stat-1', subjectId: 'subj-math', topicId: 'top-stat', code: 'LO-STA-01', statement: 'Interpret variance, standard deviation, and normal distribution z-scores.', cognitiveLevelId: 'cog-ana' },
  { id: 'lo-mech-1', subjectId: 'subj-phys', topicId: 'top-mech', code: 'LO-MEC-01', statement: 'Analyze projectile trajectories and Newtonian force equilibrium systems.', cognitiveLevelId: 'cog-app' },
  { id: 'lo-wave-1', subjectId: 'subj-phys', topicId: 'top-wave', code: 'LO-WAV-01', statement: 'Determine wave frequency, Snell refraction angles, and interference fringes.', cognitiveLevelId: 'cog-und' },
];

export const INITIAL_BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-math-g12',
    title: 'Grade 12 Natural Science Mathematics Blueprint',
    code: 'BP-MATH-G12-2026',
    version: '2.0',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    totalQuestions: 20,
    totalMarks: 40,
    durationMinutes: 60,
    passMark: 20,
    status: 'Active',
    createdBy: 'Dr. Selamawit Bekele',
    createdAt: '2026-10-12',
    reviewerId: 'usr-reviewer',
    approverId: 'usr-approver',
    reviewComment: 'Balanced distribution across all six Grade 12 Natural Science strands.',
    approvalComment: 'Approved for 2026 national examination development cycle.',
    requirementsGenerated: true,
    tosRows: [
      { id: 'tos-1', topicId: 'top-alg', learningOutcomeId: 'lo-alg-1', cognitiveLevelId: 'cog-und', difficultyLevelId: 'dif-easy', questionTypeId: 'qt-mcq', questionCount: 2, marksPerQuestion: 2 },
      { id: 'tos-2', topicId: 'top-alg', learningOutcomeId: 'lo-alg-2', cognitiveLevelId: 'cog-app', difficultyLevelId: 'dif-med', questionTypeId: 'qt-mcq', questionCount: 2, marksPerQuestion: 2 },
      { id: 'tos-3', topicId: 'top-calc', learningOutcomeId: 'lo-calc-1', cognitiveLevelId: 'cog-app', difficultyLevelId: 'dif-med', questionTypeId: 'qt-mcq', questionCount: 3, marksPerQuestion: 2 },
      { id: 'tos-4', topicId: 'top-calc', learningOutcomeId: 'lo-calc-2', cognitiveLevelId: 'cog-ana', difficultyLevelId: 'dif-hard', questionTypeId: 'qt-mcq', questionCount: 2, marksPerQuestion: 2 },
      { id: 'tos-5', topicId: 'top-geo', learningOutcomeId: 'lo-geo-1', cognitiveLevelId: 'cog-app', difficultyLevelId: 'dif-med', questionTypeId: 'qt-mcq', questionCount: 3, marksPerQuestion: 2 },
      { id: 'tos-6', topicId: 'top-trig', learningOutcomeId: 'lo-trig-1', cognitiveLevelId: 'cog-und', difficultyLevelId: 'dif-easy', questionTypeId: 'qt-mcq', questionCount: 3, marksPerQuestion: 2 },
      { id: 'tos-7', topicId: 'top-prob', learningOutcomeId: 'lo-prob-1', cognitiveLevelId: 'cog-app', difficultyLevelId: 'dif-med', questionTypeId: 'qt-mcq', questionCount: 3, marksPerQuestion: 2 },
      { id: 'tos-8', topicId: 'top-stat', learningOutcomeId: 'lo-stat-1', cognitiveLevelId: 'cog-ana', difficultyLevelId: 'dif-hard', questionTypeId: 'qt-mcq', questionCount: 2, marksPerQuestion: 2 },
    ],
    versions: [
      { version: '1.0', date: '2026-09-18', author: 'Dr. Selamawit Bekele', summary: 'Initial draft TOS created.', status: 'Archived' },
      { version: '2.0', date: '2026-10-12', author: 'Dr. Selamawit Bekele', summary: 'Increased Calculus weighting to 5 items and finalized 40-mark scale.', status: 'Active' },
    ],
  },
  {
    id: 'bp-phys-g12',
    title: 'Grade 12 Natural Science Physics Blueprint',
    code: 'BP-PHYS-G12-2026',
    version: '1.0',
    examTypeId: 'et-g12',
    subjectId: 'subj-phys',
    totalQuestions: 10,
    totalMarks: 20,
    durationMinutes: 45,
    passMark: 10,
    status: 'Submitted',
    createdBy: 'Dr. Selamawit Bekele',
    createdAt: '2026-11-08',
    reviewerId: 'usr-reviewer',
    approverId: 'usr-approver',
    requirementsGenerated: false,
    tosRows: [
      { id: 'tos-p1', topicId: 'top-mech', learningOutcomeId: 'lo-mech-1', cognitiveLevelId: 'cog-app', difficultyLevelId: 'dif-med', questionTypeId: 'qt-mcq', questionCount: 6, marksPerQuestion: 2 },
      { id: 'tos-p2', topicId: 'top-wave', learningOutcomeId: 'lo-wave-1', cognitiveLevelId: 'cog-und', difficultyLevelId: 'dif-easy', questionTypeId: 'qt-mcq', questionCount: 4, marksPerQuestion: 2 },
    ],
    versions: [
      { version: '1.0', date: '2026-11-08', author: 'Dr. Selamawit Bekele', summary: 'Submitted for peer review.', status: 'Submitted' },
    ],
  },
  {
    id: 'bp-calc-ug',
    title: 'Undergraduate Calculus Placement Blueprint',
    code: 'BP-MATH-UG-2026',
    version: '1.0',
    examTypeId: 'et-ug',
    subjectId: 'subj-math',
    totalQuestions: 12,
    totalMarks: 24,
    durationMinutes: 40,
    passMark: 12,
    status: 'Draft',
    createdBy: 'Dr. Selamawit Bekele',
    createdAt: '2026-11-12',
    requirementsGenerated: false,
    tosRows: [
      { id: 'tos-u1', topicId: 'top-alg', learningOutcomeId: 'lo-alg-1', cognitiveLevelId: 'cog-und', difficultyLevelId: 'dif-easy', questionTypeId: 'qt-mcq', questionCount: 4, marksPerQuestion: 2 },
      { id: 'tos-u2', topicId: 'top-calc', learningOutcomeId: 'lo-calc-1', cognitiveLevelId: 'cog-app', difficultyLevelId: 'dif-med', questionTypeId: 'qt-mcq', questionCount: 5, marksPerQuestion: 2 },
      { id: 'tos-u3', topicId: 'top-calc', learningOutcomeId: 'lo-calc-2', cognitiveLevelId: 'cog-ana', difficultyLevelId: 'dif-hard', questionTypeId: 'qt-mcq', questionCount: 3, marksPerQuestion: 2 },
    ],
    versions: [
      { version: '1.0', date: '2026-11-12', author: 'Dr. Selamawit Bekele', summary: 'Working draft awaiting validation and submission.', status: 'Draft' },
    ],
  },
];

// Helper to build the 20 Grade 12 Math question specs aligned with bp-math-g12
const MATH_SLOT_SPECS = [
  // Algebra (4)
  { topicId: 'top-alg', loId: 'lo-alg-1', cogId: 'cog-und', difId: 'dif-easy', subtopic: 'Quadratic & Polynomial Equations' },
  { topicId: 'top-alg', loId: 'lo-alg-1', cogId: 'cog-und', difId: 'dif-easy', subtopic: 'Logarithmic & Exponential Functions' },
  { topicId: 'top-alg', loId: 'lo-alg-2', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Matrices & Determinants' },
  { topicId: 'top-alg', loId: 'lo-alg-2', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Sequences & Series' },
  // Calculus (5)
  { topicId: 'top-calc', loId: 'lo-calc-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Limits & Continuity' },
  { topicId: 'top-calc', loId: 'lo-calc-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Differentiation & Optimization' },
  { topicId: 'top-calc', loId: 'lo-calc-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Differentiation & Optimization' },
  { topicId: 'top-calc', loId: 'lo-calc-2', cogId: 'cog-ana', difId: 'dif-hard', subtopic: 'Definite & Indefinite Integrals' },
  { topicId: 'top-calc', loId: 'lo-calc-2', cogId: 'cog-ana', difId: 'dif-hard', subtopic: 'Definite & Indefinite Integrals' },
  // Geometry (3)
  { topicId: 'top-geo', loId: 'lo-geo-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Coordinate Geometry & Lines' },
  { topicId: 'top-geo', loId: 'lo-geo-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Conic Sections' },
  { topicId: 'top-geo', loId: 'lo-geo-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Vectors in 2D & 3D' },
  // Trigonometry (3)
  { topicId: 'top-trig', loId: 'lo-trig-1', cogId: 'cog-und', difId: 'dif-easy', subtopic: 'Trigonometric Identities' },
  { topicId: 'top-trig', loId: 'lo-trig-1', cogId: 'cog-und', difId: 'dif-easy', subtopic: 'Triangles & Law of Cosines' },
  { topicId: 'top-trig', loId: 'lo-trig-1', cogId: 'cog-und', difId: 'dif-easy', subtopic: 'Inverse Trigonometric Functions' },
  // Probability (3)
  { topicId: 'top-prob', loId: 'lo-prob-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Permutations & Combinations' },
  { topicId: 'top-prob', loId: 'lo-prob-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Conditional Probability & Bayes' },
  { topicId: 'top-prob', loId: 'lo-prob-1', cogId: 'cog-app', difId: 'dif-med', subtopic: 'Binomial Probability' },
  // Statistics (2)
  { topicId: 'top-stat', loId: 'lo-stat-1', cogId: 'cog-ana', difId: 'dif-hard', subtopic: 'Measures of Central Tendency & Dispersion' },
  { topicId: 'top-stat', loId: 'lo-stat-1', cogId: 'cog-ana', difId: 'dif-hard', subtopic: 'Normal Distribution & Z-Scores' },
];

const MATH_CONTENT_TEMPLATES = [
  {
    stem: 'Find the sum of all real roots of the quadratic equation $2x^2 - 7x + 3 = 0$.',
    opts: ['$\\frac{7}{2}$', '$\\frac{3}{2}$', '$-\\frac{7}{2}$', '$7$'],
    correctIdx: 0,
    rationale: 'By Vieta\'s formulas for $ax^2 + bx + c = 0$, the sum of roots is $-\\frac{b}{a} = -\\frac{-7}{2} = \\frac{7}{2}$.',
  },
  {
    stem: 'Solve for $x$ in the logarithmic equation $\\log_2(x - 3) + \\log_2(x - 1) = 3$, where $x > 3$.',
    opts: ['$x = 5$', '$x = 4$', '$x = 6$', '$x = -1$'],
    correctIdx: 0,
    rationale: 'Combining logarithms gives $\\log_2((x-3)(x-1)) = 3 \\implies x^2 - 4x + 3 = 8 \\implies x^2 - 4x - 5 = 0$. Since $x > 3$, $x = 5$.',
  },
  {
    stem: 'Evaluate the determinant of matrix $A = \\begin{pmatrix} 3 & -2 \\\\ 5 & 4 \\end{pmatrix}$.',
    opts: ['$22$', '$2$', '$-22$', '$12$'],
    correctIdx: 0,
    rationale: '$\\det(A) = (3)(4) - (-2)(5) = 12 + 10 = 22$.',
  },
  {
    stem: 'Determine the sum to infinity of the geometric series $12 + 4 + \\frac{4}{3} + \\frac{4}{9} + \\cdots$',
    opts: ['$18$', '$16$', '$24$', '$36$'],
    correctIdx: 0,
    rationale: 'With first term $a = 12$ and common ratio $r = \\frac{1}{3}$, $S_\\infty = \\frac{a}{1 - r} = \\frac{12}{1 - 1/3} = 18$.',
  },
  {
    stem: 'Evaluate the limit $\\lim_{x \\to 0} \\frac{\\sin(5x)}{2x}$.',
    opts: ['$\\frac{5}{2}$', '$\\frac{2}{5}$', '$5$', '$0$'],
    correctIdx: 0,
    rationale: 'Using $\\lim_{u \\to 0} \\frac{\\sin u}{u} = 1$, rewrite as $\\frac{5}{2} \\lim_{x \\to 0} \\frac{\\sin(5x)}{5x} = \\frac{5}{2}$.',
  },
  {
    stem: 'Find the derivative $f\'(x)$ of the function $f(x) = x^3 e^{2x}$.',
    opts: ['$x^2 e^{2x}(3 + 2x)$', '$3x^2 e^{2x}$', '$2x^3 e^{2x}$', '$x^2 e^{2x}(3 + x)$'],
    correctIdx: 0,
    rationale: 'By the product rule, $f\'(x) = 3x^2 e^{2x} + x^3(2e^{2x}) = x^2 e^{2x}(3 + 2x)$.',
  },
  {
    stem: 'A rectangular enclosure is built along a straight wall using $80\\text{ m}$ of fencing for the remaining three sides. What is the maximum possible area?',
    opts: ['$800\\text{ m}^2$', '$640\\text{ m}^2$', '$400\\text{ m}^2$', '$1600\\text{ m}^2$'],
    correctIdx: 0,
    rationale: 'Let width be $x$ and length $80 - 2x$. Area $A(x) = 80x - 2x^2$. Setting $A\'(x) = 80 - 4x = 0$ gives $x = 20\\text{ m}$, so $A_{\\max} = 20 \\times 40 = 800\\text{ m}^2$.',
  },
  {
    stem: 'Compute the definite integral $\\int_{0}^{2} (3x^2 - 2x + 1)\\,dx$.',
    opts: ['$6$', '$8$', '$4$', '$10$'],
    correctIdx: 0,
    rationale: 'An antiderivative is $F(x) = x^3 - x^2 + x$. Evaluating $F(2) - F(0) = (8 - 4 + 2) - 0 = 6$.',
  },
  {
    stem: 'Find the area of the region bounded by the curve $y = x^2$, the $x$-axis, and the vertical lines $x = 0$ and $x = 2$.',
    opts: ['$\\frac{8}{3}$', '$4$', '$\\frac{4}{3}$', '$\\frac{16}{3}$'],
    correctIdx: 0,
    rationale: 'Area $= \\int_0^2 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3}$ square units.',
    diagramSvg: `<svg viewBox="0 0 260 155" class="w-60 h-36" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="125" x2="230" y2="125" stroke="#64748b" stroke-width="1.5"/><line x1="50" y1="140" x2="50" y2="15" stroke="#64748b" stroke-width="1.5"/><path d="M 50 125 Q 130 125 185 25 L 185 125 Z" fill="#dbeafe" opacity="0.85"/><path d="M 30 115 Q 130 135 200 15" fill="none" stroke="#2563eb" stroke-width="2.5"/><text x="178" y="140" font-size="11" fill="#0f172a">x = 2</text><text x="42" y="140" font-size="11" fill="#0f172a">0</text><text x="150" y="34" font-size="11" fill="#1d4ed8">y = x²</text></svg>`,
  },
  {
    stem: 'Determine the perpendicular distance from the point $P(3, -1)$ to the line $4x - 3y + 5 = 0$.',
    opts: ['$4$', '$2$', '$5$', '$\\frac{20}{7}$'],
    correctIdx: 0,
    rationale: 'Using $d = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}} = \\frac{|4(3) - 3(-1) + 5|}{\\sqrt{16 + 9}} = \\frac{20}{5} = 4$.',
  },
  {
    stem: 'Identify the eccentricity of the ellipse $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$.',
    opts: ['$\\frac{4}{5}$', '$\\frac{3}{5}$', '$\\frac{5}{4}$', '$\\frac{16}{25}$'],
    correctIdx: 0,
    rationale: 'Here $a^2 = 25$ and $b^2 = 9$, so $c = \\sqrt{25 - 9} = 4$. Eccentricity $e = \\frac{c}{a} = \\frac{4}{5}$.',
  },
  {
    stem: 'Given vectors $\\vec{u} = (2, -1, 3)$ and $\\vec{v} = (1, 4, -2)$, calculate the dot product $\\vec{u} \\cdot \\vec{v}$.',
    opts: ['$-8$', '$8$', '$-4$', '$12$'],
    correctIdx: 0,
    rationale: '$\\vec{u} \\cdot \\vec{v} = (2)(1) + (-1)(4) + (3)(-2) = 2 - 4 - 6 = -8$.',
  },
  {
    stem: 'Simplify the trigonometric expression $\\frac{1 - \\cos^2\\theta}{\\sin\\theta \\cos\\theta}$ for $\\sin\\theta \\neq 0, \\cos\\theta \\neq 0$.',
    opts: ['$\\tan\\theta$', '$\\cot\\theta$', '$\\sin\\theta$', '$\\sec\\theta$'],
    correctIdx: 0,
    rationale: 'Since $1 - \\cos^2\\theta = \\sin^2\\theta$, the ratio becomes $\\frac{\\sin^2\\theta}{\\sin\\theta\\cos\\theta} = \\frac{\\sin\\theta}{\\cos\\theta} = \\tan\\theta$.',
  },
  {
    stem: 'In a right-angled triangle with legs $a = 5\\text{ cm}$ and $b = 12\\text{ cm}$, find the value of $\\sin\\theta$ opposite side $a$.',
    opts: ['$\\frac{5}{13}$', '$\\frac{12}{13}$', '$\\frac{5}{12}$', '$\\frac{13}{5}$'],
    correctIdx: 0,
    rationale: 'Hypotenuse $c = \\sqrt{5^2 + 12^2} = 13\\text{ cm}$. Therefore $\\sin\\theta = \\frac{a}{c} = \\frac{5}{13}$.',
    diagramSvg: `<svg viewBox="0 0 250 140" class="w-60 h-32" xmlns="http://www.w3.org/2000/svg"><polygon points="40,115 200,115 200,30" fill="#eff6ff" stroke="#1e40af" stroke-width="2"/><rect x="186" y="101" width="14" height="14" fill="none" stroke="#1e40af" stroke-width="1.5"/><text x="112" y="132" font-size="11" fill="#0f172a">b = 12 cm</text><text x="206" y="75" font-size="11" fill="#0f172a">a = 5 cm</text><text x="64" y="107" font-size="11" fill="#1e293b">θ</text></svg>`,
  },
  {
    stem: 'Evaluate the exact value of $\\arcsin\\left(\\frac{\\sqrt{3}}{2}\\right) + \\arccos\\left(\\frac{1}{2}\\right)$.',
    opts: ['$\\frac{2\\pi}{3}$', '$\\frac{\\pi}{2}$', '$\\frac{\\pi}{3}$', '$\\pi$'],
    correctIdx: 0,
    rationale: '$\\arcsin(\\sqrt{3}/2) = \\frac{\\pi}{3}$ and $\\arccos(1/2) = \\frac{\\pi}{3}$, so their sum is $\\frac{2\\pi}{3}$.',
  },
  {
    stem: 'How many distinct 4-person committees can be formed from a group of 6 mathematicians and 4 physicists if each committee must include at least 2 physicists?',
    opts: ['$115$', '$95$', '$120$', '$85$'],
    correctIdx: 0,
    rationale: 'Valid counts: $\\binom{4}{2}\\binom{6}{2} + \\binom{4}{3}\\binom{6}{1} + \\binom{4}{4}\\binom{6}{0} = 6(15) + 4(6) + 1(1) = 90 + 24 + 1 = 115$.',
  },
  {
    stem: 'Two fair six-sided dice are rolled. Given that the sum of the outcomes is $8$, what is the conditional probability that both dice show even numbers?',
    opts: ['$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{1}{3}$', '$\\frac{1}{2}$'],
    correctIdx: 0,
    rationale: 'Outcomes summing to 8: $(2,6),(3,5),(4,4),(5,3),(6,2)$ (5 total). Both even: $(2,6),(4,4),(6,2)$? Wait: $(2,6),(4,4),(6,2)$ is 3 out of 5, let us adjust stem to "at least one die shows a 4 or greater" or keep exact option $\\frac{3}{5}$! Correct value is $\\frac{3}{5}$.',
    // Let's make index 1 correct for variety!
  },
  {
    stem: 'A fair coin is tossed $5$ times independently. What is the probability of obtaining exactly $3$ heads?',
    opts: ['$\\frac{5}{16}$', '$\\frac{3}{8}$', '$\\frac{1}{4}$', '$\\frac{10}{16}$'],
    correctIdx: 0,
    rationale: 'Using the binomial distribution, $P(X=3) = \\binom{5}{3}\\left(\\frac{1}{2}\\right)^5 = \\frac{10}{32} = \\frac{5}{16}$.',
  },
  {
    stem: 'For the dataset $\\{4, 8, 6, 10, 12\\}$, calculate the population standard deviation $\\sigma$.',
    opts: ['$2\\sqrt{2}$', '$8$', '$\\sqrt{10}$', '$4$'],
    correctIdx: 0,
    rationale: 'Mean $\\mu = 8$. Squared deviations: $16 + 0 + 4 + 4 + 16 = 40$. Variance $\\sigma^2 = \\frac{40}{5} = 8$, so $\\sigma = \\sqrt{8} = 2\\sqrt{2}$.',
  },
  {
    stem: 'Scores on a standardized mathematics exam follow a normal distribution with mean $\\mu = 72$ and standard deviation $\\sigma = 8$. Find the $z$-score corresponding to a score of $84$.',
    opts: ['$1.5$', '$1.25$', '$2.0$', '$0.75$'],
    correctIdx: 0,
    rationale: '$z = \\frac{x - \\mu}{\\sigma} = \\frac{84 - 72}{8} = \\frac{12}{8} = 1.5$.',
    diagramSvg: `<svg viewBox="0 0 260 135" class="w-60 h-32" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="110" x2="240" y2="110" stroke="#475569" stroke-width="1.5"/><path d="M 25 109 C 65 109 85 26 130 26 C 175 26 195 109 235 109" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/><line x1="130" y1="26" x2="130" y2="110" stroke="#1e40af" stroke-dasharray="4 3" stroke-width="1.5"/><text x="122" y="125" font-size="11" fill="#0f172a">μ=72</text><text x="168" y="125" font-size="11" fill="#1d4ed8">x=84</text></svg>`,
  },
];

// Fix item 17 (index 16) rationale & correctIdx to match mathematically (3/5)
MATH_CONTENT_TEMPLATES[16] = {
  stem: 'Two fair six-sided dice are rolled. Given that the sum of the outcomes is $8$, what is the conditional probability that both dice show even numbers?',
  opts: ['$\\frac{2}{5}$', '$\\frac{3}{5}$', '$\\frac{1}{3}$', '$\\frac{1}{2}$'],
  correctIdx: 1,
  rationale: 'Outcomes summing to 8: $(2,6),(3,5),(4,4),(5,3),(6,2)$ ($5$ total). Both numbers are even in $(2,6),(4,4),(6,2)$ ($3$ outcomes), giving $\\frac{3}{5}$.',
};

function buildQuestionFromSpec(
  id: string,
  packageId: string,
  slotNumber: number,
  options: {
    authoringStatus: 'Not Started' | 'Incomplete' | 'Ready';
    reviewStatus: 'Draft' | 'Submitted' | 'Accepted' | 'Returned' | 'Approved';
    inBank: boolean;
    authorId?: string;
    reviewerComment?: string;
    approverComment?: string;
  }
): QuestionItem {
  const spec = MATH_SLOT_SPECS[(slotNumber - 1) % MATH_SLOT_SPECS.length];
  const tpl = MATH_CONTENT_TEMPLATES[(slotNumber - 1) % MATH_CONTENT_TEMPLATES.length];

  const isBlank = options.authoringStatus === 'Not Started';
  const isPartial = options.authoringStatus === 'Incomplete';

  return {
    id,
    packageId,
    slotNumber,
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    topicId: spec.topicId,
    subtopicName: spec.subtopic,
    learningOutcomeId: spec.loId,
    cognitiveLevelId: spec.cogId,
    targetCognitiveLevelId: spec.cogId,
    bloomTags: isBlank ? [] : [...(DEFAULT_BLOOM_VERBS_BY_ID[spec.cogId] ?? ['Solve'])],
    difficultyLevelId: spec.difId,
    questionTypeId: 'qt-mcq',
    marks: 2,
    stem: isBlank ? '' : tpl.stem,
    options: [
      { id: `${id}-a`, label: 'A', content: isBlank ? '' : tpl.opts[0] },
      { id: `${id}-b`, label: 'B', content: isBlank ? '' : tpl.opts[1] },
      { id: `${id}-c`, label: 'C', content: isBlank || isPartial ? '' : tpl.opts[2] },
      { id: `${id}-d`, label: 'D', content: isBlank || isPartial ? '' : tpl.opts[3] },
    ],
    correctOptionId: isBlank ? '' : `${id}-${['a', 'b', 'c', 'd'][tpl.correctIdx]}`,
    rationale: isBlank || isPartial ? '' : tpl.rationale,
    diagramSvg: isBlank ? undefined : tpl.diagramSvg,
    authoringStatus: options.authoringStatus,
    reviewStatus: options.reviewStatus,
    reviewerComment: options.reviewerComment,
    approverComment: options.approverComment,
    authorId: options.authorId ?? 'usr-author',
    version: 1,
    inBank: options.inBank,
    bankAvailability: options.inBank ? 'Available' : 'Available',
    updatedAt: '2026-11-13 15:20',
    history: [
      {
        id: `hist-${id}-1`,
        timestamp: '2026-11-10 09:00',
        actorName: 'Dr. Selamawit Bekele',
        actorRole: 'Subject Coordinator',
        action: 'Requirement slot assigned from Grade 12 Mathematics Blueprint',
      },
      ...(options.reviewStatus !== 'Draft'
        ? [
            {
              id: `hist-${id}-2`,
              timestamp: '2026-11-12 14:15',
              actorName: 'Prof. Dawit Mekonnen',
              actorRole: 'Question Author',
              action: 'Submitted question in batch package',
            },
          ]
        : []),
      ...(options.reviewerComment
        ? [
            {
              id: `hist-${id}-3`,
              timestamp: '2026-11-13 11:30',
              actorName: 'Dr. Samuel Girma',
              actorRole: 'Question Reviewer',
              action: options.reviewStatus === 'Returned' ? 'Returned for revision' : 'Accepted item',
              comment: options.reviewerComment,
            },
          ]
        : []),
    ],
  };
}

export const INITIAL_PACKAGES: QuestionPackage[] = [
  {
    id: 'pkg-math-author',
    title: 'Mathematics Question Development — Set A (20 Questions)',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    authorId: 'usr-author',
    coordinatorId: 'usr-coord',
    totalAssigned: 20,
    status: 'In Progress',
    dueDate: '2026-11-22',
    createdAt: '2026-11-05',
    notes: 'Align every item strictly to the Grade 12 Natural Science Mathematics TOS matrix.',
  },
  {
    id: 'pkg-math-review',
    title: 'Mathematics — Peer Review & Revision Set (20 Questions)',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    authorId: 'usr-author',
    coordinatorId: 'usr-coord',
    reviewerId: 'usr-reviewer',
    approverId: 'usr-approver',
    totalAssigned: 20,
    status: 'In Review',
    dueDate: '2026-11-18',
    submittedAt: '2026-11-12',
    createdAt: '2026-10-28',
    notes: '17 Accepted, 3 Returned for minor algebraic/domain clarification.',
  },
  {
    id: 'pkg-math-submitted',
    title: 'Mathematics — Supplementary Set (6 Questions)',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    authorId: 'usr-author',
    coordinatorId: 'usr-coord',
    totalAssigned: 6,
    status: 'Submitted',
    dueDate: '2026-11-20',
    submittedAt: '2026-11-14',
    createdAt: '2026-11-09',
    notes: 'Awaiting Coordinator assignment of Reviewer and Approver.',
  },
  {
    id: 'pkg-phys-approval',
    title: 'Physics — Mechanics & Waves Set (6 Questions)',
    blueprintId: 'bp-phys-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-phys',
    authorId: 'usr-author-2',
    coordinatorId: 'usr-coord',
    reviewerId: 'usr-reviewer',
    approverId: 'usr-approver',
    totalAssigned: 6,
    status: 'Pending Approval',
    dueDate: '2026-11-19',
    submittedAt: '2026-11-11',
    createdAt: '2026-11-01',
    notes: 'All 6 Physics items accepted by Reviewer; awaiting final Approver release.',
  },
  {
    id: 'pkg-math-revision',
    title: 'Mathematics — Targeted Revision Set (4 Questions)',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    authorId: 'usr-author',
    coordinatorId: 'usr-coord',
    reviewerId: 'usr-reviewer',
    approverId: 'usr-approver',
    totalAssigned: 4,
    status: 'Returned to Author',
    dueDate: '2026-11-17',
    submittedAt: '2026-11-10',
    createdAt: '2026-11-02',
    notes: '2 Accepted (locked) · 2 Returned for stem & distractor refinement.',
  },
];

// Package 1: 20 questions for Author (15 Ready, 3 Incomplete, 2 Not Started = 75%)
const pkg1Questions: QuestionItem[] = Array.from({ length: 20 }, (_, i) => {
  const slot = i + 1;
  const authoringStatus =
    slot <= 15 ? 'Ready' : slot <= 18 ? 'Incomplete' : 'Not Started';
  return buildQuestionFromSpec(`q-p1-${slot}`, 'pkg-math-author', slot, {
    authoringStatus,
    reviewStatus: 'Draft',
    inBank: false,
  });
});

// Package 2: 20 questions in Reviewer queue / Revision demo (17 Accepted, 3 Returned)
const RETURNED_SLOTS = new Set([4, 11, 17]);
const RETURNED_COMMENTS: Record<number, string> = {
  4: 'Specify that the geometric series converges because $|r| = \\frac{1}{3} < 1$ inside the stem.',
  11: 'Clarify whether the standard form requires identifying the major axis orientation explicitly.',
  17: 'Verify distractor C and include the sample space enumeration in the explanation.',
};

const pkg2Questions: QuestionItem[] = Array.from({ length: 20 }, (_, i) => {
  const slot = i + 1;
  const isReturned = RETURNED_SLOTS.has(slot);
  return buildQuestionFromSpec(`q-p2-${slot}`, 'pkg-math-review', slot, {
    authoringStatus: 'Ready',
    reviewStatus: isReturned ? 'Returned' : 'Accepted',
    inBank: false,
    reviewerComment: isReturned
      ? RETURNED_COMMENTS[slot]
      : 'Verified mathematical accuracy, cognitive alignment, and distractor plausibility.',
  });
});

// Package 3: 6 submitted Math questions awaiting Coordinator assignment
const pkg3Questions: QuestionItem[] = Array.from({ length: 6 }, (_, i) => {
  const slot = i + 1;
  return buildQuestionFromSpec(`q-p3-${slot}`, 'pkg-math-submitted', slot, {
    authoringStatus: 'Ready',
    reviewStatus: 'Submitted',
    inBank: false,
  });
});

// Package 4: 6 Physics questions pending final Approval
const PHYSICS_TEMPLATES = [
  {
    topicId: 'top-mech',
    loId: 'lo-mech-1',
    cogId: 'cog-app',
    difId: 'dif-med',
    stem: 'A projectile is launched from level ground with an initial speed of $v_0 = 20\\text{ m/s}$ at an angle of $30^\\circ$ above the horizontal. Taking $g = 10\\text{ m/s}^2$, find the maximum height reached.',
    opts: ['$5\\text{ m}$', '$10\\text{ m}$', '$15\\text{ m}$', '$20\\text{ m}$'],
    correctIdx: 0,
    rationale: '$H = \\frac{v_0^2 \\sin^2 30^\\circ}{2g} = \\frac{400 \\times 0.25}{20} = 5\\text{ m}$.',
  },
  {
    topicId: 'top-mech',
    loId: 'lo-mech-1',
    cogId: 'cog-app',
    difId: 'dif-med',
    stem: 'A $4\\text{ kg}$ block rests on a horizontal surface with coefficient of kinetic friction $\\mu_k = 0.25$. A horizontal force of $18\\text{ N}$ is applied. Find the acceleration ($g = 10\\text{ m/s}^2$).',
    opts: ['$2.0\\text{ m/s}^2$', '$4.5\\text{ m/s}^2$', '$2.5\\text{ m/s}^2$', '$1.5\\text{ m/s}^2$'],
    correctIdx: 0,
    rationale: 'Friction $f_k = \\mu_k mg = 0.25(4)(10) = 10\\text{ N}$. Net force $= 18 - 10 = 8\\text{ N}$, so $a = \\frac{8}{4} = 2.0\\text{ m/s}^2$.',
  },
  {
    topicId: 'top-mech',
    loId: 'lo-mech-1',
    cogId: 'cog-und',
    difId: 'dif-easy',
    stem: 'Which physical quantity equals the area under a velocity-time graph between $t_1$ and $t_2$?',
    opts: ['Displacement', 'Acceleration', 'Momentum', 'Jerk'],
    correctIdx: 0,
    rationale: 'Displacement $\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt$ corresponds to the signed area under the velocity-time curve.',
  },
  {
    topicId: 'top-wave',
    loId: 'lo-wave-1',
    cogId: 'cog-und',
    difId: 'dif-easy',
    stem: 'A transverse wave has frequency $f = 250\\text{ Hz}$ and wavelength $\\lambda = 1.4\\text{ m}$. What is its propagation speed?',
    opts: ['$350\\text{ m/s}$', '$178.6\\text{ m/s}$', '$251.4\\text{ m/s}$', '$700\\text{ m/s}$'],
    correctIdx: 0,
    rationale: '$v = f\\lambda = 250 \\times 1.4 = 350\\text{ m/s}$.',
  },
  {
    topicId: 'top-wave',
    loId: 'lo-wave-1',
    cogId: 'cog-app',
    difId: 'dif-med',
    stem: 'A simple pendulum of length $L = 1.0\\text{ m}$ oscillates with small amplitude where $g = \\pi^2\\text{ m/s}^2$. Determine its period $T$.',
    opts: ['$2.0\\text{ s}$', '$1.0\\text{ s}$', '$\\pi\\text{ s}$', '$4.0\\text{ s}$'],
    correctIdx: 0,
    rationale: '$T = 2\\pi\\sqrt{\\frac{L}{g}} = 2\\pi\\sqrt{\\frac{1}{\\pi^2}} = 2.0\\text{ s}$.',
  },
  {
    topicId: 'top-wave',
    loId: 'lo-wave-1',
    cogId: 'cog-und',
    difId: 'dif-easy',
    stem: 'When light passes from air ($n_1 = 1.0$) into glass ($n_2 = 1.5$), how do its speed and wavelength change?',
    opts: ['Both decrease', 'Speed decreases, wavelength increases', 'Both increase', 'Frequency decreases'],
    correctIdx: 0,
    rationale: 'Frequency remains constant across the boundary while $v = c/n$ and $\\lambda = \\lambda_0/n$ both decrease.',
  },
];

const pkg4Questions: QuestionItem[] = PHYSICS_TEMPLATES.map((tpl, idx) => ({
  id: `q-phys-${idx + 1}`,
  packageId: 'pkg-phys-approval',
  slotNumber: idx + 1,
  blueprintId: 'bp-phys-g12',
  examTypeId: 'et-g12',
  subjectId: 'subj-phys',
  topicId: tpl.topicId,
  learningOutcomeId: tpl.loId,
  cognitiveLevelId: tpl.cogId,
  targetCognitiveLevelId: tpl.cogId,
  bloomTags: [...(DEFAULT_BLOOM_VERBS_BY_ID[tpl.cogId] ?? ['Solve'])],
  difficultyLevelId: tpl.difId,
  questionTypeId: 'qt-mcq',
  marks: 2,
  stem: tpl.stem,
  options: [
    { id: `q-phys-${idx + 1}-a`, label: 'A', content: tpl.opts[0] },
    { id: `q-phys-${idx + 1}-b`, label: 'B', content: tpl.opts[1] },
    { id: `q-phys-${idx + 1}-c`, label: 'C', content: tpl.opts[2] },
    { id: `q-phys-${idx + 1}-d`, label: 'D', content: tpl.opts[3] },
  ],
  correctOptionId: `q-phys-${idx + 1}-a`,
  rationale: tpl.rationale,
  authoringStatus: 'Ready',
  reviewStatus: 'Accepted',
  reviewerComment: 'SI units and numerical precision verified.',
  authorId: 'usr-author-2',
  version: 1,
  inBank: false,
  bankAvailability: 'Available',
  updatedAt: '2026-11-13 10:00',
  history: [
    {
      id: `h-ph-${idx + 1}`,
      timestamp: '2026-11-12 09:30',
      actorName: 'Dr. Samuel Girma',
      actorRole: 'Question Reviewer',
      action: 'Accepted Physics item for final approval',
    },
  ],
}));

function makeSnapshot(
  q: QuestionItem,
  version: number,
  timestamp: string,
  actorName: string,
  actorRole: string,
  changeType: QuestionVersionSnapshot['changeType'],
  changeSummary: string,
  changedFields: string[]
): QuestionVersionSnapshot {
  return {
    version,
    timestamp,
    actorName,
    actorRole,
    changeType,
    changeSummary,
    changedFields,
    snapshot: {
      stem: q.stem,
      options: q.options.map((o) => ({ ...o })),
      correctOptionId: q.correctOptionId,
      sampleAnswer: q.sampleAnswer,
      rationale: q.rationale,
      diagramSvg: q.diagramSvg,
      marks: q.marks,
      topicId: q.topicId,
      learningOutcomeId: q.learningOutcomeId,
      cognitiveLevelId: q.cognitiveLevelId,
      difficultyLevelId: q.difficultyLevelId,
      questionTypeId: q.questionTypeId,
      bloomTags: q.bloomTags ? [...q.bloomTags] : undefined,
      reviewStatus: q.reviewStatus,
      bankAvailability: q.bankAvailability,
    },
  };
}

// Approved Question Bank items: 24 Mathematics items (covering all 20 slots + 4 alternates) + 4 Physics items
const bankMathQuestions: QuestionItem[] = Array.from({ length: 24 }, (_, i) => {
  const slot = (i % 20) + 1;
  const q = buildQuestionFromSpec(`qb-math-${i + 1}`, 'pkg-bank-math', slot, {
    authoringStatus: 'Ready',
    reviewStatus: 'Approved',
    inBank: true,
    reviewerComment: 'Accepted without modification.',
    approverComment: 'Approved for Question Bank release.',
  });
  const v1Snap = makeSnapshot(
    q,
    1,
    '2026-11-11 10:15',
    'Prof. Helena Abebe',
    'Question Approver',
    'Initial Certification',
    'Certified and released into Approved Question Bank.',
    []
  );
  if (i >= 20) {
    q.stem = `[Alternate Form] ${q.stem}`;
    q.rationale = `${q.rationale} (Alternate equivalence form verified for parallel exam paper security.)`;
    q.version = 2;
    q.updatedAt = '2026-11-13 15:20';
    const v2Snap = makeSnapshot(
      q,
      2,
      '2026-11-13 15:20',
      'Dr. Selamawit Bekele',
      'Subject Coordinator',
      'Bank Amendment',
      'Created alternate parallel form with expanded solution rationale for Form B assembly.',
      ['Stem', 'Solution Rationale']
    );
    q.versionHistory = [v1Snap, v2Snap];
    q.history = [
      ...q.history,
      {
        id: `hist-${q.id}-v2`,
        timestamp: '2026-11-13 15:20',
        actorName: 'Dr. Selamawit Bekele',
        actorRole: 'Subject Coordinator',
        action: 'Auto-versioned Question Bank item to v2',
        comment: 'Created alternate parallel form with expanded solution rationale.',
      },
    ];
  } else {
    q.versionHistory = [v1Snap];
  }
  return q;
});

const bankPhysQuestions: QuestionItem[] = PHYSICS_TEMPLATES.slice(0, 4).map((tpl, idx) => {
  const q: QuestionItem = {
    id: `qb-phys-${idx + 1}`,
    packageId: 'pkg-bank-phys',
    slotNumber: idx + 1,
    blueprintId: 'bp-phys-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-phys',
    topicId: tpl.topicId,
    learningOutcomeId: tpl.loId,
    cognitiveLevelId: tpl.cogId,
    targetCognitiveLevelId: tpl.cogId,
    bloomTags: [...(DEFAULT_BLOOM_VERBS_BY_ID[tpl.cogId] ?? ['Solve'])],
    difficultyLevelId: tpl.difId,
    questionTypeId: 'qt-mcq',
    marks: 2,
    stem: tpl.stem,
    options: [
      { id: `qb-phys-${idx + 1}-a`, label: 'A', content: tpl.opts[0] },
      { id: `qb-phys-${idx + 1}-b`, label: 'B', content: tpl.opts[1] },
      { id: `qb-phys-${idx + 1}-c`, label: 'C', content: tpl.opts[2] },
      { id: `qb-phys-${idx + 1}-d`, label: 'D', content: tpl.opts[3] },
    ],
    correctOptionId: `qb-phys-${idx + 1}-a`,
    rationale: tpl.rationale,
    authoringStatus: 'Ready',
    reviewStatus: 'Approved',
    authorId: 'usr-author-2',
    version: 1,
    inBank: true,
    bankAvailability: 'Available',
    updatedAt: '2026-10-30 14:00',
    history: [
      {
        id: `h-qbp-${idx + 1}`,
        timestamp: '2026-10-30 14:00',
        actorName: 'Prof. Helena Abebe',
        actorRole: 'Question Approver',
        action: 'Approved into Question Bank',
      },
    ],
  };
  q.versionHistory = [
    makeSnapshot(
      q,
      1,
      '2026-10-30 14:00',
      'Prof. Helena Abebe',
      'Question Approver',
      'Initial Certification',
      'Approved into Grade 12 Physics Question Bank.',
      []
    ),
  ];
  return q;
});

const pkg5RevisionQuestions: QuestionItem[] = [1, 2, 3, 4].map((slot) => {
  const isReturned = slot === 2 || slot === 4;
  return buildQuestionFromSpec(`q-p5-${slot}`, 'pkg-math-revision', slot + 5, {
    authoringStatus: 'Ready',
    reviewStatus: isReturned ? 'Returned' : 'Accepted',
    inBank: false,
    reviewerComment: isReturned
      ? 'Please state the domain restriction explicitly and verify units in option B.'
      : 'Accepted without further edits.',
  });
});

export const INITIAL_QUESTIONS: QuestionItem[] = [
  ...pkg1Questions,
  ...pkg2Questions,
  ...pkg3Questions,
  ...pkg4Questions,
  ...pkg5RevisionQuestions,
  ...bankMathQuestions,
  ...bankPhysQuestions,
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: 'exam-math-assembly',
    title: 'Grade 12 Mathematics National Mock Exam 2026-A',
    code: 'EX-MATH-2026-A',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    developerId: 'usr-exam-dev',
    reviewerId: 'usr-exam-rev',
    approverId: 'usr-exam-app',
    // Pre-select 16 of 20 items so Exam Developer can assemble the final 4 slots and validate
    selectedQuestionIds: bankMathQuestions.slice(0, 16).map((q) => q.id),
    status: 'In Assembly',
    version: '1.0',
    instructions: 'Answer all 20 multiple-choice questions. Time allowed: 60 minutes. Non-programmable calculators are permitted.',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-14 08:10',
    history: [
      {
        id: 'exh-1',
        timestamp: '2026-11-10 10:00',
        actorName: 'Daniel Tesfaye',
        actorRole: 'Exam Developer',
        action: 'Created examination from Grade 12 Natural Science Mathematics Blueprint',
      },
    ],
  },
  {
    id: 'exam-math-review',
    title: 'Grade 12 Mathematics Practice Paper 2026-B',
    code: 'EX-MATH-2026-B',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    developerId: 'usr-exam-dev',
    reviewerId: 'usr-exam-rev',
    approverId: 'usr-exam-app',
    selectedQuestionIds: bankMathQuestions.slice(0, 20).map((q) => q.id),
    status: 'Submitted for Review',
    version: '1.0',
    instructions: 'Attempt all 20 questions. Each item carries 2 marks. Total marks: 40.',
    createdAt: '2026-11-06',
    updatedAt: '2026-11-13 16:45',
    history: [
      {
        id: 'exh-2',
        timestamp: '2026-11-13 16:45',
        actorName: 'Daniel Tesfaye',
        actorRole: 'Exam Developer',
        action: 'Validated 100% blueprint compliance and submitted for Exam Review',
      },
    ],
  },
  {
    id: 'exam-math-approval',
    title: 'Grade 12 Mathematics Regional Assessment 2026-C',
    code: 'EX-MATH-2026-C',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    developerId: 'usr-exam-dev',
    reviewerId: 'usr-exam-rev',
    approverId: 'usr-exam-app',
    selectedQuestionIds: bankMathQuestions.slice(0, 20).map((q) => q.id),
    status: 'Pending Final Approval',
    version: '1.1',
    instructions: 'All 20 items mandatory. Show rough work on provided scratch sheets.',
    reviewComment: 'Psychometric difficulty curve and TOS compliance verified.',
    createdAt: '2026-11-02',
    updatedAt: '2026-11-12 11:20',
    history: [
      {
        id: 'exh-3',
        timestamp: '2026-11-12 11:20',
        actorName: 'Dr. Yonas Haile',
        actorRole: 'Exam Reviewer',
        action: 'Accepted assembled exam and forwarded for Final Exam Approval',
        comment: 'Psychometric difficulty curve and TOS compliance verified.',
      },
    ],
  },
  {
    id: 'exam-math-bank',
    title: 'Grade 12 Mathematics Official Paper 2025',
    code: 'EX-MATH-2025-FINAL',
    blueprintId: 'bp-math-g12',
    examTypeId: 'et-g12',
    subjectId: 'subj-math',
    developerId: 'usr-exam-dev',
    reviewerId: 'usr-exam-rev',
    approverId: 'usr-exam-app',
    selectedQuestionIds: bankMathQuestions.slice(0, 20).map((q) => q.id),
    status: 'Approved',
    version: '1.0',
    instructions: 'National standardized examination paper. Time allowed: 60 minutes.',
    reviewComment: 'All items verified against national curriculum standards.',
    approvalComment: 'Released to official Exam Bank for secure archival and distribution.',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-25 09:00',
    history: [
      {
        id: 'exh-4',
        timestamp: '2026-10-25 09:00',
        actorName: 'Prof. Ruth Alemayehu',
        actorRole: 'Exam Approver',
        action: 'Approved and published to Exam Bank',
      },
    ],
  },
];

export const INITIAL_PERMISSIONS: RolePermissionMatrix[] = [
  {
    role: 'admin',
    permissions: {
      manageUsers: true,
      manageCurriculum: true,
      createBlueprints: false,
      approveBlueprints: false,
      assignWorkloads: false,
      authorQuestions: false,
      reviewQuestions: false,
      approveQuestions: false,
      assembleExams: false,
      approveExams: false,
      viewAuditLogs: true,
    },
  },
  {
    role: 'coordinator',
    permissions: {
      manageUsers: false,
      manageCurriculum: true,
      createBlueprints: true,
      approveBlueprints: false,
      assignWorkloads: true,
      authorQuestions: false,
      reviewQuestions: false,
      approveQuestions: false,
      assembleExams: false,
      approveExams: false,
      viewAuditLogs: false,
    },
  },
  {
    role: 'author',
    permissions: {
      manageUsers: false,
      manageCurriculum: false,
      createBlueprints: false,
      approveBlueprints: false,
      assignWorkloads: false,
      authorQuestions: true,
      reviewQuestions: false,
      approveQuestions: false,
      assembleExams: false,
      approveExams: false,
      viewAuditLogs: false,
    },
  },
  {
    role: 'reviewer',
    permissions: {
      manageUsers: false,
      manageCurriculum: false,
      createBlueprints: false,
      approveBlueprints: false,
      assignWorkloads: false,
      authorQuestions: false,
      reviewQuestions: true,
      approveQuestions: false,
      assembleExams: false,
      approveExams: false,
      viewAuditLogs: false,
    },
  },
  {
    role: 'approver',
    permissions: {
      manageUsers: false,
      manageCurriculum: false,
      createBlueprints: false,
      approveBlueprints: true,
      assignWorkloads: false,
      authorQuestions: false,
      reviewQuestions: false,
      approveQuestions: true,
      assembleExams: false,
      approveExams: false,
      viewAuditLogs: false,
    },
  },
  {
    role: 'exam_developer',
    permissions: {
      manageUsers: false,
      manageCurriculum: false,
      createBlueprints: false,
      approveBlueprints: false,
      assignWorkloads: false,
      authorQuestions: false,
      reviewQuestions: false,
      approveQuestions: false,
      assembleExams: true,
      approveExams: false,
      viewAuditLogs: false,
    },
  },
  {
    role: 'exam_reviewer',
    permissions: {
      manageUsers: false,
      manageCurriculum: false,
      createBlueprints: false,
      approveBlueprints: false,
      assignWorkloads: false,
      authorQuestions: false,
      reviewQuestions: false,
      approveQuestions: false,
      assembleExams: false,
      approveExams: false,
      viewAuditLogs: false,
    },
  },
  {
    role: 'exam_approver',
    permissions: {
      manageUsers: false,
      manageCurriculum: false,
      createBlueprints: false,
      approveBlueprints: false,
      assignWorkloads: false,
      authorQuestions: false,
      reviewQuestions: false,
      approveQuestions: false,
      assembleExams: false,
      approveExams: true,
      viewAuditLogs: true,
    },
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  platformName: 'ExamNova',
  institutionName: 'National University Assessment Council',
  institutionTagline: 'Academic Examination Development & Item Bank Authority',
  academicCycle: '2026 / 2027 Academic Examination Cycle',
  supportEmail: 'assessment-support@examnova.edu',
  logoUrl: '',
  faviconUrl: '',
  primaryAccentColor: '#2563EB',

  smtpEnabled: true,
  smtpHost: 'smtp.examnova.edu',
  smtpPort: 587,
  smtpEncryption: 'TLS',
  smtpUsername: 'noreply-mailer@examnova.edu',
  smtpPassword: '••••••••••••••',
  smtpFromName: 'ExamNova Assessment Notifications',
  smtpFromEmail: 'noreply@examnova.edu',

  otpEnabled: true,
  otpDeliveryChannel: 'email',
  otpExpiryMinutes: 10,
  otpEnforceRoles: ['admin', 'coordinator', 'approver', 'exam_approver'],
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 12,
  requireStrongPasswords: true,
  ipAllowlistEnabled: false,
  ipAllowlist: '10.24.0.0/16\n192.168.10.0/24',

  minQuestionRationaleLength: 20,
  defaultExamDurationMinutes: 60,
  reviewSlaDays: 5,
  maxQuestionsPerPackage: 50,
  requireBlueprintDualSignoff: true,
  lockSubmittedQuestions: true,
  autoArchiveSupersededBlueprints: true,
  watermarkDraftPapers: true,

  emailNotificationsOnReturn: true,
  emailNotificationsOnApproval: true,
  auditLogRetentionDays: 365,
  autoBackupEnabled: true,
  backupFrequency: 'Daily',
  maintenanceMode: false,
  maintenanceBannerMessage:
    'Scheduled database maintenance window this Sunday 02:00–03:00 UTC. Save active authoring drafts beforehand.',

  moodleEnabled: true,
  moodleBaseUrl: 'https://lms.examnova.edu',
  moodleWebServiceToken: 'mdl_ws_9f82a4c7d10e48b9912c',
  moodleServiceName: 'examnova_quiz_sync',
  moodleTargetCourseId: 'G12-NAT-2026',
  moodleTargetCategory: '$course$/top/ExamNova-Certified',
  moodleImportFormat: 'moodle_xml',
  moodleAutoPushOnApproval: false,
  moodleSyncSelectedExamIds: [],
  moodleSyncAnswerKeyAndFeedback: true,
  moodleQuizTimeLimitSync: true,
  moodleShuffleAnswers: true,
  moodleLastTestedAt: '2026-11-14 09:30',
  qtiExportEnabled: true,
  safeExamBrowserRequired: false,
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-11-14 08:15',
    actorName: 'Prof. Dawit Mekonnen',
    actorRole: 'author',
    module: 'Question Development',
    action: 'Submitted Package',
    target: 'Mathematics — Supplementary Set (6 Questions)',
    details: 'Submitted 6/6 validated items to Subject Coordinator for reviewer assignment.',
  },
  {
    id: 'aud-2',
    timestamp: '2026-11-13 16:45',
    actorName: 'Daniel Tesfaye',
    actorRole: 'exam_developer',
    module: 'Examination Management',
    action: 'Submitted Exam for Review',
    target: 'EX-MATH-2026-B',
    details: 'Assembled 20/20 questions (40 marks) matching BP-MATH-G12-2026.',
  },
  {
    id: 'aud-3',
    timestamp: '2026-11-13 11:30',
    actorName: 'Dr. Samuel Girma',
    actorRole: 'reviewer',
    module: 'Question Review',
    action: 'Completed Package Review',
    target: 'Mathematics — Peer Review & Revision Set',
    details: '17 items accepted, 3 items returned to author with revision notes.',
  },
  {
    id: 'aud-4',
    timestamp: '2026-11-08 14:20',
    actorName: 'Dr. Selamawit Bekele',
    actorRole: 'coordinator',
    module: 'Blueprint Management',
    action: 'Submitted Blueprint',
    target: 'BP-PHYS-G12-2026',
    details: 'Submitted Grade 12 Natural Science Physics Blueprint v1.0 for review.',
  },
];

export const INITIAL_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'author',
    title: '3 Questions Returned for Revision',
    message: 'Dr. Samuel Girma returned Q4, Q11, and Q17 in Mathematics Peer Review Set with specific feedback.',
    timestamp: '2026-11-13 11:32',
    read: false,
    moduleLink: 'my_work',
  },
  {
    id: 'notif-2',
    targetRole: 'coordinator',
    title: 'New Submitted Question Package',
    message: 'Prof. Dawit Mekonnen submitted "Mathematics — Supplementary Set (6 Questions)" for reviewer assignment.',
    timestamp: '2026-11-14 08:16',
    read: false,
    moduleLink: 'submitted_packages',
  },
  {
    id: 'notif-3',
    targetRole: 'reviewer',
    title: 'Blueprint Awaiting Peer Review',
    message: 'Grade 12 Natural Science Physics Blueprint v1.0 has been submitted for technical review.',
    timestamp: '2026-11-08 14:22',
    read: false,
    moduleLink: 'question_review',
  },
  {
    id: 'notif-4',
    targetRole: 'approver',
    title: '6 Physics Questions Pending Approval',
    message: 'Dr. Samuel Girma accepted all 6 items in Physics — Mechanics & Waves Set. Final approval required.',
    timestamp: '2026-11-13 10:05',
    read: false,
    moduleLink: 'question_approval',
  },
  {
    id: 'notif-5',
    targetRole: 'exam_reviewer',
    title: 'Exam Paper Submitted for Review',
    message: 'EX-MATH-2026-B (Grade 12 Mathematics Practice Paper) is ready for psychometric & blueprint review.',
    timestamp: '2026-11-13 16:46',
    read: false,
    moduleLink: 'exam_review',
  },
  {
    id: 'notif-6',
    targetRole: 'exam_approver',
    title: 'Examination Ready for Final Sign-Off',
    message: 'EX-MATH-2026-C passed Exam Review and awaits final Exam Bank publication.',
    timestamp: '2026-11-12 11:22',
    read: false,
    moduleLink: 'exam_approval',
  },
];
