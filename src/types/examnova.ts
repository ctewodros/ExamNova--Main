export type UserRole =
  | 'admin'
  | 'coordinator'
  | 'author'
  | 'reviewer'
  | 'approver'
  | 'exam_developer'
  | 'exam_reviewer'
  | 'exam_approver';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  defaultModule: AppModuleId;
}

export type AppModuleId =
  | 'dashboard'
  // Administration
  | 'admin_users'
  | 'admin_roles'
  | 'admin_subject_access'
  | 'admin_settings'
  | 'admin_audit'
  // Curriculum
  | 'curriculum_setup'
  // Blueprints
  | 'blueprints'
  // Question Development
  | 'question_requirements'
  | 'author_workloads'
  | 'my_work'
  | 'authoring_workspace'
  | 'submitted_packages'
  | 'question_review'
  | 'question_approval'
  | 'question_bank'
  // Examinations
  | 'exam_assembly'
  | 'exam_review'
  | 'exam_approval'
  | 'exam_bank'
  // Shared
  | 'analytics'
  | 'notifications';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  subjects: string[]; // Subject IDs
  status: 'Active' | 'Suspended';
  lastActive: string;
}

export interface ExamType {
  id: string;
  name: string;
  code: string;
  level: string;
  description: string;
  active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  examTypeIds: string[];
  coordinatorId: string;
  active: boolean;
}

export interface Subtopic {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  code: string;
  subtopics: Subtopic[];
}

export interface LearningOutcome {
  id: string;
  subjectId: string;
  topicId: string;
  code: string;
  statement: string;
  cognitiveLevelId: string;
}

export interface CognitiveLevel {
  id: string;
  name: string;
  code: string;
  order: number;
  description: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  code: string;
  weight: number;
  description: string;
}

export interface QuestionType {
  id: string;
  name: string;
  code: string;
  hasOptions: boolean;
  description: string;
}

export type BlueprintStatus =
  | 'Draft'
  | 'Submitted'
  | 'Reviewed'
  | 'Approved'
  | 'Active'
  | 'Returned'
  | 'Archived';

export interface TOSRow {
  id: string;
  topicId: string;
  learningOutcomeId: string;
  cognitiveLevelId: string;
  difficultyLevelId: string;
  questionTypeId: string;
  questionCount: number;
  marksPerQuestion: number;
}

export interface BlueprintVersion {
  version: string;
  date: string;
  author: string;
  summary: string;
  status: BlueprintStatus;
}

export interface Blueprint {
  id: string;
  title: string;
  code: string;
  version: string;
  examTypeId: string;
  subjectId: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  passMark: number;
  status: BlueprintStatus;
  createdBy: string;
  createdAt: string;
  reviewerId?: string;
  approverId?: string;
  reviewComment?: string;
  approvalComment?: string;
  requirementsGenerated: boolean;
  tosRows: TOSRow[];
  versions: BlueprintVersion[];
}

export type AuthoringStatus = 'Not Started' | 'Incomplete' | 'Ready';

export type QuestionWorkflowStatus =
  | 'Draft'
  | 'Submitted'
  | 'Accepted'
  | 'Returned'
  | 'Approved'
  | 'Rejected';

export interface AnswerOption {
  id: string;
  label: string; // 'A', 'B', 'C', 'D'
  content: string;
}

export interface RevisionEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  comment?: string;
}

export interface QuestionItem {
  id: string;
  packageId: string;
  slotNumber: number;
  blueprintId: string;
  examTypeId: string;
  subjectId: string;
  topicId: string;
  subtopicName?: string;
  learningOutcomeId: string;
  cognitiveLevelId: string;
  difficultyLevelId: string;
  questionTypeId: string;
  marks: number;
  stem: string;
  options: AnswerOption[];
  correctOptionId: string;
  sampleAnswer?: string; // for Short Answer / Structured Problem
  rationale: string;
  diagramSvg?: string;
  authoringStatus: AuthoringStatus;
  reviewStatus: QuestionWorkflowStatus;
  reviewerComment?: string;
  approverComment?: string;
  authorId: string;
  version: number;
  inBank: boolean;
  bankAvailability: 'Available' | 'Reserved' | 'Used in Active Exam' | 'Retired';
  updatedAt: string;
  history: RevisionEntry[];
}

export type PackageStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Submitted'
  | 'In Review'
  | 'Returned to Author'
  | 'Pending Approval'
  | 'Approved';

export interface QuestionPackage {
  id: string;
  title: string;
  blueprintId: string;
  examTypeId: string;
  subjectId: string;
  authorId: string;
  coordinatorId: string;
  reviewerId?: string;
  approverId?: string;
  totalAssigned: number;
  status: PackageStatus;
  dueDate: string;
  submittedAt?: string;
  createdAt: string;
  notes?: string;
}

export type ExamStatus =
  | 'In Assembly'
  | 'Submitted for Review'
  | 'Returned for Revision'
  | 'Pending Final Approval'
  | 'Approved';

export interface MoodleSyncRecord {
  status: 'Synced';
  syncedAt: string;
  courseId: string;
  categoryPath: string;
  moodleQuizId: string;
  format: 'moodle_xml' | 'gift';
  autoPushed: boolean;
}

export interface Examination {
  id: string;
  title: string;
  code: string;
  blueprintId: string;
  examTypeId: string;
  subjectId: string;
  developerId: string;
  reviewerId?: string;
  approverId?: string;
  selectedQuestionIds: string[];
  status: ExamStatus;
  version: string;
  instructions: string;
  reviewComment?: string;
  approvalComment?: string;
  createdAt: string;
  updatedAt: string;
  history: RevisionEntry[];
  moodleSync?: MoodleSyncRecord;
}

export interface RolePermissionMatrix {
  role: UserRole;
  permissions: {
    manageUsers: boolean;
    manageCurriculum: boolean;
    createBlueprints: boolean;
    approveBlueprints: boolean;
    assignWorkloads: boolean;
    authorQuestions: boolean;
    reviewQuestions: boolean;
    approveQuestions: boolean;
    assembleExams: boolean;
    approveExams: boolean;
    viewAuditLogs: boolean;
  };
}

export type SmtpEncryption = 'TLS' | 'SSL' | 'NONE';
export type OtpDeliveryChannel = 'email' | 'authenticator' | 'sms';
export type BackupFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface SystemSettings {
  // Branding & Portal
  platformName: string;
  institutionName: string;
  institutionTagline: string;
  academicCycle: string;
  supportEmail: string;
  logoUrl: string;
  faviconUrl: string;
  primaryAccentColor: string;

  // SMTP Configuration
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: SmtpEncryption;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromName: string;
  smtpFromEmail: string;

  // Security & OTP
  otpEnabled: boolean;
  otpDeliveryChannel: OtpDeliveryChannel;
  otpExpiryMinutes: number;
  otpEnforceRoles: UserRole[];
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPasswords: boolean;
  ipAllowlistEnabled: boolean;
  ipAllowlist: string;

  // Examination & Workflow Governance
  minQuestionRationaleLength: number;
  defaultExamDurationMinutes: number;
  reviewSlaDays: number;
  maxQuestionsPerPackage: number;
  requireBlueprintDualSignoff: boolean;
  lockSubmittedQuestions: boolean;
  autoArchiveSupersededBlueprints: boolean;
  watermarkDraftPapers: boolean;

  // Notifications, Retention & Operations
  emailNotificationsOnReturn: boolean;
  emailNotificationsOnApproval: boolean;
  auditLogRetentionDays: number;
  autoBackupEnabled: boolean;
  backupFrequency: BackupFrequency;
  maintenanceMode: boolean;
  maintenanceBannerMessage: string;

  // Assessment Tool Integration (Moodle LMS & Connectors)
  moodleEnabled: boolean;
  moodleBaseUrl: string;
  moodleWebServiceToken: string;
  moodleServiceName: string;
  moodleTargetCourseId: string;
  moodleTargetCategory: string;
  moodleImportFormat: 'moodle_xml' | 'gift';
  moodleAutoPushOnApproval: boolean;
  moodleSyncSelectedExamIds: string[];
  moodleSyncAnswerKeyAndFeedback: boolean;
  moodleQuizTimeLimitSync: boolean;
  moodleShuffleAnswers: boolean;
  moodleLastTestedAt?: string;
  qtiExportEnabled: boolean;
  safeExamBrowserRequired: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  module: string;
  action: string;
  target: string;
  details: string;
}

export interface PlatformNotification {
  id: string;
  targetRole: UserRole | 'all';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  moduleLink?: AppModuleId;
}
