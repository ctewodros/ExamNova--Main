import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppModuleId,
  AuditLogEntry,
  Blueprint,
  BlueprintStatus,
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
  RolePermissionMatrix,
  Subject,
  SystemSettings,
  Topic,
  UserRole,
} from '../types/examnova';
import { PrintExportJob } from '../utils/exportDocument';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BLUEPRINTS,
  INITIAL_COGNITIVE_LEVELS,
  INITIAL_DIFFICULTY_LEVELS,
  INITIAL_EXAM_TYPES,
  INITIAL_EXAMINATIONS,
  INITIAL_LEARNING_OUTCOMES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PACKAGES,
  INITIAL_PERMISSIONS,
  INITIAL_QUESTION_TYPES,
  INITIAL_QUESTIONS,
  INITIAL_SETTINGS,
  INITIAL_SUBJECTS,
  INITIAL_TOPICS,
  INITIAL_USERS,
  ROLES,
} from '../data/seedData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

interface PersistedState {
  currentRole: UserRole;
  users: PlatformUser[];
  examTypes: ExamType[];
  subjects: Subject[];
  topics: Topic[];
  learningOutcomes: LearningOutcome[];
  cognitiveLevels: CognitiveLevel[];
  difficultyLevels: DifficultyLevel[];
  questionTypes: QuestionType[];
  blueprints: Blueprint[];
  packages: QuestionPackage[];
  questions: QuestionItem[];
  examinations: Examination[];
  permissions: RolePermissionMatrix[];
  settings: SystemSettings;
  auditLogs: AuditLogEntry[];
  notifications: PlatformNotification[];
}

const STORAGE_KEY = 'examnova_platform_state_v2';

const getInitialState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        currentRole: parsed.currentRole ?? 'coordinator',
        users: parsed.users ?? INITIAL_USERS,
        examTypes: parsed.examTypes ?? INITIAL_EXAM_TYPES,
        subjects: parsed.subjects ?? INITIAL_SUBJECTS,
        topics: parsed.topics ?? INITIAL_TOPICS,
        learningOutcomes: parsed.learningOutcomes ?? INITIAL_LEARNING_OUTCOMES,
        cognitiveLevels: parsed.cognitiveLevels ?? INITIAL_COGNITIVE_LEVELS,
        difficultyLevels: parsed.difficultyLevels ?? INITIAL_DIFFICULTY_LEVELS,
        questionTypes: parsed.questionTypes ?? INITIAL_QUESTION_TYPES,
        blueprints: parsed.blueprints ?? INITIAL_BLUEPRINTS,
        packages: parsed.packages ?? INITIAL_PACKAGES,
        questions: parsed.questions ?? INITIAL_QUESTIONS,
        examinations: parsed.examinations ?? INITIAL_EXAMINATIONS,
        permissions: parsed.permissions ?? INITIAL_PERMISSIONS,
        settings: { ...INITIAL_SETTINGS, ...(parsed.settings ?? {}) },
        auditLogs: parsed.auditLogs ?? INITIAL_AUDIT_LOGS,
        notifications: parsed.notifications ?? INITIAL_NOTIFICATIONS,
      };
    }
  } catch {
    // fallback to defaults
  }
  return {
    currentRole: 'coordinator',
    users: INITIAL_USERS,
    examTypes: INITIAL_EXAM_TYPES,
    subjects: INITIAL_SUBJECTS,
    topics: INITIAL_TOPICS,
    learningOutcomes: INITIAL_LEARNING_OUTCOMES,
    cognitiveLevels: INITIAL_COGNITIVE_LEVELS,
    difficultyLevels: INITIAL_DIFFICULTY_LEVELS,
    questionTypes: INITIAL_QUESTION_TYPES,
    blueprints: INITIAL_BLUEPRINTS,
    packages: INITIAL_PACKAGES,
    questions: INITIAL_QUESTIONS,
    examinations: INITIAL_EXAMINATIONS,
    permissions: INITIAL_PERMISSIONS,
    settings: INITIAL_SETTINGS,
    auditLogs: INITIAL_AUDIT_LOGS,
    notifications: INITIAL_NOTIFICATIONS,
  };
};

interface ExamNovaContextValue extends PersistedState {
  activeModule: AppModuleId;
  setActiveModule: (mod: AppModuleId) => void;
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string | null) => void;
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  selectedExamId: string | null;
  setSelectedExamId: (id: string | null) => void;
  switchRole: (role: UserRole) => void;
  activeUser: PlatformUser;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  notifyToast: (text: string, type?: ToastMessage['type']) => void;
  resetDemoData: () => void;

  // Admin
  saveUser: (user: PlatformUser) => void;
  toggleUserStatus: (userId: string) => void;
  togglePermission: (role: UserRole, permKey: keyof RolePermissionMatrix['permissions']) => void;
  updateUserSubjects: (userId: string, subjectIds: string[]) => void;
  updateSettings: (settings: SystemSettings) => void;
  testSmtpConfiguration: (recipientEmail: string, draftSettings: SystemSettings) => void;
  testMoodleConnection: (draftSettings: SystemSettings) => void;
  pushExamsToMoodle: (
    examIds: string[],
    source?: 'exam_bank' | 'auto_push' | 'approval',
    settingsOverride?: SystemSettings
  ) => number;
  resetSystemSettings: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Curriculum
  addExamType: (item: Omit<ExamType, 'id'>) => void;
  updateExamType: (item: ExamType) => void;
  addSubject: (item: Omit<Subject, 'id'>) => void;
  updateSubject: (item: Subject) => void;
  addTopic: (subjectId: string, name: string, code: string, subtopics: string[]) => void;
  updateTopic: (topicId: string, subjectId: string, name: string, code: string, subtopics: string[]) => void;
  addLearningOutcome: (item: Omit<LearningOutcome, 'id'>) => void;
  updateLearningOutcome: (item: LearningOutcome) => void;
  addCognitiveLevel: (item: Omit<CognitiveLevel, 'id'>) => void;
  updateCognitiveLevel: (item: CognitiveLevel) => void;
  addDifficultyLevel: (item: Omit<DifficultyLevel, 'id'>) => void;
  updateDifficultyLevel: (item: DifficultyLevel) => void;
  addQuestionType: (item: Omit<QuestionType, 'id'>) => void;
  updateQuestionType: (item: QuestionType) => void;

  // Blueprints
  saveBlueprint: (bp: Blueprint) => void;
  transitionBlueprint: (
    bpId: string,
    nextStatus: BlueprintStatus,
    comment?: string,
    reviewerId?: string,
    approverId?: string
  ) => void;
  activateBlueprint: (bpId: string) => void;

  // Question Authoring & Packages
  createAuthorWorkload: (input: {
    title: string;
    blueprintId: string;
    authorId: string;
    dueDate: string;
    notes?: string;
  }) => void;
  saveQuestionDraft: (questionId: string, patch: Partial<QuestionItem>) => void;
  submitPackageForReview: (packageId: string) => void;
  resubmitReturnedPackage: (packageId: string) => void;
  assignPackageGovernance: (packageId: string, reviewerId: string, approverId: string) => void;
  reviewQuestionDecision: (
    questionId: string,
    decision: 'Accepted' | 'Returned',
    comment: string
  ) => void;
  finalizePackageReview: (packageId: string) => void;
  approverPackageDecision: (
    packageId: string,
    decision: 'Approved' | 'Returned',
    comment: string
  ) => void;

  // Examinations
  createExamination: (input: {
    title: string;
    code: string;
    blueprintId: string;
    instructions: string;
  }) => string;
  updateExamQuestions: (examId: string, questionIds: string[]) => void;
  submitExamForReview: (examId: string) => void;
  reviewExamDecision: (
    examId: string,
    decision: 'Pending Final Approval' | 'Returned for Revision',
    comment: string
  ) => void;
  approveExamDecision: (
    examId: string,
    decision: 'Approved' | 'Returned for Revision',
    comment: string
  ) => void;
  printJob: PrintExportJob | null;
  triggerPdfExport: (job: PrintExportJob) => void;
}

const ExamNovaContext = createContext<ExamNovaContextValue | null>(null);

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayDate(): string {
  return nowStamp().slice(0, 10);
}

export function computeAuthoringStatus(q: Pick<QuestionItem, 'stem' | 'options' | 'correctOptionId' | 'rationale' | 'questionTypeId' | 'sampleAnswer'>): 'Not Started' | 'Incomplete' | 'Ready' {
  const hasStem = q.stem.trim().length >= 8;
  const hasRationale = q.rationale.trim().length >= 8;

  if (q.questionTypeId === 'qt-short') {
    const hasSample = (q.sampleAnswer || '').trim().length > 0;
    if (!hasStem && !hasSample && !hasRationale) return 'Not Started';
    if (hasStem && hasSample && hasRationale) return 'Ready';
    return 'Incomplete';
  }

  const activeOpts = q.questionTypeId === 'qt-tf' ? q.options.slice(0, 2) : q.options;
  const filledOptsCount = activeOpts.filter((o) => o.content.trim().length > 0).length;
  const hasCorrect = activeOpts.some((o) => o.id === q.correctOptionId && o.content.trim().length > 0);

  if (!hasStem && filledOptsCount === 0 && !hasRationale) {
    return 'Not Started';
  }
  if (hasStem && filledOptsCount === activeOpts.length && hasCorrect && hasRationale) {
    return 'Ready';
  }
  return 'Incomplete';
}

export const ExamNovaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(getInitialState);
  const [activeModule, setActiveModule] = useState<AppModuleId>('dashboard');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('pkg-math-author');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>('exam-math-assembly');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [printJob, setPrintJob] = useState<PrintExportJob | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  const activeUser =
    state.users.find((u) => u.role === state.currentRole && u.status === 'Active') ||
    state.users[0];

  const notifyToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerPdfExport = (job: PrintExportJob) => {
    setPrintJob(job);
    const originalTitle = document.title;
    const suggestedTitle =
      job.kind === 'exam'
        ? `${job.exam.code} - ${job.exam.title}${job.includeAnswerKey ? ' (Answer Key)' : ''}`
        : job.questions.length === 1
        ? `ExamNova Question Bank - ${job.questions[0].id}`
        : `${job.title} (${job.questions.length} Items)`;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);
    notifyToast('Opening print-to-PDF dialog. Choose "Save as PDF" as the destination.', 'info');

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.title = suggestedTitle;
        window.print();
        // Fallback restore for browsers where afterprint does not fire consistently
        setTimeout(() => {
          if (document.title === suggestedTitle) {
            restoreTitle();
          }
        }, 1500);
      }, 120);
    });
  };

  const appendLogAndNotif = (
    prev: PersistedState,
    log: Omit<AuditLogEntry, 'id' | 'timestamp'>,
    notif?: Omit<PlatformNotification, 'id' | 'timestamp' | 'read'>
  ): Pick<PersistedState, 'auditLogs' | 'notifications'> => {
    const ts = nowStamp();
    const nextLogs: AuditLogEntry[] = [
      { ...log, id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, timestamp: ts },
      ...prev.auditLogs,
    ];
    const nextNotifs: PlatformNotification[] = notif
      ? [
          {
            ...notif,
            id: `not-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            timestamp: ts,
            read: false,
          },
          ...prev.notifications,
        ]
      : prev.notifications;
    return { auditLogs: nextLogs, notifications: nextNotifs };
  };

  const switchRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, currentRole: role }));
    const def = ROLES.find((r) => r.id === role);
    setActiveModule(def?.defaultModule ?? 'dashboard');
    notifyToast(`Switched perspective to ${def?.label ?? role}`, 'info');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh: PersistedState = {
      currentRole: state.currentRole,
      users: INITIAL_USERS,
      examTypes: INITIAL_EXAM_TYPES,
      subjects: INITIAL_SUBJECTS,
      topics: INITIAL_TOPICS,
      learningOutcomes: INITIAL_LEARNING_OUTCOMES,
      cognitiveLevels: INITIAL_COGNITIVE_LEVELS,
      difficultyLevels: INITIAL_DIFFICULTY_LEVELS,
      questionTypes: INITIAL_QUESTION_TYPES,
      blueprints: INITIAL_BLUEPRINTS,
      packages: INITIAL_PACKAGES,
      questions: INITIAL_QUESTIONS,
      examinations: INITIAL_EXAMINATIONS,
      permissions: INITIAL_PERMISSIONS,
      settings: INITIAL_SETTINGS,
      auditLogs: INITIAL_AUDIT_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
    };
    setState(fresh);
    setSelectedPackageId('pkg-math-author');
    setSelectedExamId('exam-math-assembly');
    notifyToast('Platform demo data restored to initial state.', 'info');
  };

  // Admin
  const saveUser = (user: PlatformUser) => {
    setState((prev) => {
      const exists = prev.users.some((u) => u.id === user.id);
      const users = exists
        ? prev.users.map((u) => (u.id === user.id ? user : u))
        : [...prev.users, user];
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'Administration',
        action: exists ? 'Updated User' : 'Created User',
        target: user.name,
        details: `Role: ${user.role}, Department: ${user.department}`,
      });
      return { ...prev, users, ...meta };
    });
    notifyToast(`Saved user record for ${user.name}`);
  };

  const toggleUserStatus = (userId: string) => {
    setState((prev) => {
      const target = prev.users.find((u) => u.id === userId);
      const nextStatus: PlatformUser['status'] = target?.status === 'Active' ? 'Suspended' : 'Active';
      const users = prev.users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u));
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'Administration',
        action: 'Changed Account Status',
        target: target?.name ?? userId,
        details: `Account status changed to ${nextStatus}`,
      });
      return { ...prev, users, ...meta };
    });
    notifyToast('User account status updated');
  };

  const togglePermission = (role: UserRole, permKey: keyof RolePermissionMatrix['permissions']) => {
    setState((prev) => {
      const permissions = prev.permissions.map((p) =>
        p.role === role
          ? { ...p, permissions: { ...p.permissions, [permKey]: !p.permissions[permKey] } }
          : p
      );
      return { ...prev, permissions };
    });
  };

  const updateUserSubjects = (userId: string, subjectIds: string[]) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, subjects: subjectIds } : u)),
    }));
    notifyToast('Subject access scope updated');
  };

  const updateSettings = (settings: SystemSettings) => {
    setState((prev) => {
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'System Settings',
        action: 'Updated Platform & Security Policy',
        target: settings.institutionName,
        details: `Cycle: ${settings.academicCycle} · SMTP: ${settings.smtpEnabled ? settings.smtpHost : 'Disabled'} · OTP: ${settings.otpEnabled ? `Enabled (${settings.otpDeliveryChannel})` : 'Disabled'}`,
      });
      return { ...prev, settings, ...meta };
    });
    notifyToast('System settings saved and applied');
  };

  const testSmtpConfiguration = (recipientEmail: string, draftSettings: SystemSettings) => {
    setState((prev) => {
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'System Settings',
        action: 'SMTP Relay Diagnostic Test',
        target: `${draftSettings.smtpHost}:${draftSettings.smtpPort} (${draftSettings.smtpEncryption})`,
        details: `Simulated test dispatch sent to ${recipientEmail} from ${draftSettings.smtpFromEmail}.`,
      });
      return { ...prev, ...meta };
    });
    notifyToast(`SMTP test email dispatched to ${recipientEmail}`);
  };

  const resetSystemSettings = () => {
    setState((prev) => {
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'System Settings',
        action: 'Restored Default Settings',
        target: INITIAL_SETTINGS.platformName,
        details: 'Restored platform branding, SMTP, OTP, and workflow policies to factory defaults.',
      });
      return { ...prev, settings: INITIAL_SETTINGS, ...meta };
    });
    notifyToast('System settings restored to defaults', 'info');
  };

  useEffect(() => {
    const platform = state.settings.platformName?.trim() || 'ExamNova';
    document.title = `${platform} — Examination Development & Question Bank Platform`;

    const favHref = state.settings.faviconUrl?.trim();
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (favHref) {
      link.href = favHref;
    } else {
      const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${state.settings.primaryAccentColor || '#2563EB'}"/><path d="M16 7 5 12.5 16 18l11-5.5L16 7zm-6.5 8.5v4.5c0 2.2 2.9 4 6.5 4s6.5-1.8 6.5-4v-4.5l-6.5 3.2-6.5-3.2z" fill="#fff"/></svg>`;
      link.href = `data:image/svg+xml,${encodeURIComponent(defaultSvg)}`;
    }
  }, [state.settings.faviconUrl, state.settings.platformName, state.settings.primaryAccentColor]);

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  // Curriculum
  const addExamType = (item: Omit<ExamType, 'id'>) => {
    setState((prev) => ({
      ...prev,
      examTypes: [...prev.examTypes, { ...item, id: `et-${Date.now()}` }],
    }));
    notifyToast(`Added Exam Type "${item.name}"`);
  };

  const updateExamType = (item: ExamType) => {
    setState((prev) => ({
      ...prev,
      examTypes: prev.examTypes.map((e) => (e.id === item.id ? item : e)),
    }));
    notifyToast(`Updated Exam Type "${item.name}"`);
  };

  const addSubject = (item: Omit<Subject, 'id'>) => {
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...item, id: `subj-${Date.now()}` }],
    }));
    notifyToast(`Added Subject "${item.name}"`);
  };

  const updateSubject = (item: Subject) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === item.id ? item : s)),
    }));
    notifyToast(`Updated Subject "${item.name}"`);
  };

  const addTopic = (subjectId: string, name: string, code: string, subtopics: string[]) => {
    setState((prev) => ({
      ...prev,
      topics: [
        ...prev.topics,
        {
          id: `top-${Date.now()}`,
          subjectId,
          name,
          code,
          subtopics: subtopics
            .filter((s) => s.trim())
            .map((s, idx) => ({ id: `sub-${Date.now()}-${idx}`, name: s.trim() })),
        },
      ],
    }));
    notifyToast(`Added Topic "${name}"`);
  };

  const updateTopic = (topicId: string, subjectId: string, name: string, code: string, subtopics: string[]) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subjectId,
              name,
              code,
              subtopics: subtopics
                .filter((s) => s.trim())
                .map((s, idx) => ({ id: t.subtopics[idx]?.id ?? `sub-${Date.now()}-${idx}`, name: s.trim() })),
            }
          : t
      ),
    }));
    notifyToast(`Updated Topic "${name}"`);
  };

  const addLearningOutcome = (item: Omit<LearningOutcome, 'id'>) => {
    setState((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, { ...item, id: `lo-${Date.now()}` }],
    }));
    notifyToast(`Added Learning Outcome ${item.code}`);
  };

  const updateLearningOutcome = (item: LearningOutcome) => {
    setState((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((l) => (l.id === item.id ? item : l)),
    }));
    notifyToast(`Updated Learning Outcome ${item.code}`);
  };

  const addCognitiveLevel = (item: Omit<CognitiveLevel, 'id'>) => {
    setState((prev) => ({
      ...prev,
      cognitiveLevels: [...prev.cognitiveLevels, { ...item, id: `cog-${Date.now()}` }],
    }));
    notifyToast(`Added Cognitive Level "${item.name}"`);
  };

  const updateCognitiveLevel = (item: CognitiveLevel) => {
    setState((prev) => ({
      ...prev,
      cognitiveLevels: prev.cognitiveLevels.map((c) => (c.id === item.id ? item : c)),
    }));
    notifyToast(`Updated Cognitive Level "${item.name}"`);
  };

  const addDifficultyLevel = (item: Omit<DifficultyLevel, 'id'>) => {
    setState((prev) => ({
      ...prev,
      difficultyLevels: [...prev.difficultyLevels, { ...item, id: `dif-${Date.now()}` }],
    }));
    notifyToast(`Added Difficulty Level "${item.name}"`);
  };

  const updateDifficultyLevel = (item: DifficultyLevel) => {
    setState((prev) => ({
      ...prev,
      difficultyLevels: prev.difficultyLevels.map((d) => (d.id === item.id ? item : d)),
    }));
    notifyToast(`Updated Difficulty Level "${item.name}"`);
  };

  const addQuestionType = (item: Omit<QuestionType, 'id'>) => {
    setState((prev) => ({
      ...prev,
      questionTypes: [...prev.questionTypes, { ...item, id: `qt-${Date.now()}` }],
    }));
    notifyToast(`Added Question Type "${item.name}"`);
  };

  const updateQuestionType = (item: QuestionType) => {
    setState((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.map((qt) => (qt.id === item.id ? item : qt)),
    }));
    notifyToast(`Updated Question Type "${item.name}"`);
  };

  // Blueprints
  const saveBlueprint = (bp: Blueprint) => {
    setState((prev) => {
      const exists = prev.blueprints.some((b) => b.id === bp.id);
      const blueprints = exists
        ? prev.blueprints.map((b) => (b.id === bp.id ? bp : b))
        : [bp, ...prev.blueprints];
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'Blueprint Management',
        action: exists ? 'Updated Blueprint TOS' : 'Created Blueprint',
        target: bp.title,
        details: `${bp.totalQuestions} questions, ${bp.totalMarks} marks (${bp.version})`,
      });
      return { ...prev, blueprints, ...meta };
    });
    notifyToast(`Saved blueprint "${bp.title}"`);
  };

  const transitionBlueprint = (
    bpId: string,
    nextStatus: BlueprintStatus,
    comment?: string,
    reviewerId?: string,
    approverId?: string
  ) => {
    setState((prev) => {
      const target = prev.blueprints.find((b) => b.id === bpId);
      if (!target) return prev;

      const blueprints = prev.blueprints.map((b) => {
        if (b.id !== bpId) return b;
        const versionEntry = {
          version: b.version,
          date: todayDate(),
          author: activeUser.name,
          summary: comment || `Transitioned status to ${nextStatus}`,
          status: nextStatus,
        };
        return {
          ...b,
          status: nextStatus,
          reviewerId: reviewerId ?? b.reviewerId,
          approverId: approverId ?? b.approverId,
          reviewComment: nextStatus === 'Reviewed' || nextStatus === 'Returned' ? comment || b.reviewComment : b.reviewComment,
          approvalComment: nextStatus === 'Approved' ? comment || b.approvalComment : b.approvalComment,
          versions: [versionEntry, ...b.versions],
        };
      });

      const notifTarget: UserRole =
        nextStatus === 'Submitted'
          ? 'reviewer'
          : nextStatus === 'Reviewed'
          ? 'approver'
          : 'coordinator';

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Blueprint Management',
          action: `Blueprint ${nextStatus}`,
          target: target.title,
          details: comment || `Blueprint moved to ${nextStatus}.`,
        },
        {
          targetRole: notifTarget,
          title: `Blueprint ${nextStatus}: ${target.code}`,
          message: `${target.title} was marked ${nextStatus} by ${activeUser.name}.`,
          moduleLink: nextStatus === 'Reviewed' ? 'question_approval' : nextStatus === 'Submitted' ? 'question_review' : 'blueprints',
        }
      );

      return { ...prev, blueprints, ...meta };
    });
    notifyToast(`Blueprint status updated to ${nextStatus}`);
  };

  const activateBlueprint = (bpId: string) => {
    setState((prev) => {
      const target = prev.blueprints.find((b) => b.id === bpId);
      if (!target || target.status !== 'Approved') return prev;

      const blueprints = prev.blueprints.map((b) => {
        if (b.id === bpId) {
          return {
            ...b,
            status: 'Active' as BlueprintStatus,
            requirementsGenerated: true,
            versions: [
              {
                version: b.version,
                date: todayDate(),
                author: activeUser.name,
                summary: 'Activated blueprint and generated operational Question Requirements.',
                status: 'Active' as BlueprintStatus,
              },
              ...b.versions,
            ],
          };
        }
        if (
          prev.settings.autoArchiveSupersededBlueprints &&
          b.examTypeId === target.examTypeId &&
          b.subjectId === target.subjectId &&
          b.status === 'Active'
        ) {
          return { ...b, status: 'Archived' as BlueprintStatus };
        }
        return b;
      });

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Blueprint Management',
          action: 'Activated Blueprint',
          target: target.title,
          details: `Generated ${target.totalQuestions} operational Question Requirements.`,
        },
        {
          targetRole: 'exam_developer',
          title: `New Active Blueprint: ${target.code}`,
          message: `${target.title} is now Active and available for Question Requirements & Exam Assembly.`,
          moduleLink: 'exam_assembly',
        }
      );

      return { ...prev, blueprints, ...meta };
    });
    notifyToast('Blueprint activated and Question Requirements generated!');
  };

  // Author Workload Assignment
  const createAuthorWorkload = (input: {
    title: string;
    blueprintId: string;
    authorId: string;
    dueDate: string;
    notes?: string;
  }) => {
    setState((prev) => {
      const bp = prev.blueprints.find((b) => b.id === input.blueprintId);
      const author = prev.users.find((u) => u.id === input.authorId);
      if (!bp || !author) return prev;

      const pkgId = `pkg-${Date.now()}`;
      const generatedQuestions: QuestionItem[] = [];
      let slot = 1;

      bp.tosRows.forEach((row) => {
        for (let i = 0; i < row.questionCount; i++) {
          const qId = `q-${pkgId}-${slot}`;
          const isShort = row.questionTypeId === 'qt-short';
          const isTF = row.questionTypeId === 'qt-tf';
          const defaultOptions = isShort
            ? []
            : isTF
            ? [
                { id: `${qId}-a`, label: 'A', content: 'True' },
                { id: `${qId}-b`, label: 'B', content: 'False' },
              ]
            : [
                { id: `${qId}-a`, label: 'A', content: '' },
                { id: `${qId}-b`, label: 'B', content: '' },
                { id: `${qId}-c`, label: 'C', content: '' },
                { id: `${qId}-d`, label: 'D', content: '' },
              ];
          generatedQuestions.push({
            id: qId,
            packageId: pkgId,
            slotNumber: slot,
            blueprintId: bp.id,
            examTypeId: bp.examTypeId,
            subjectId: bp.subjectId,
            topicId: row.topicId,
            learningOutcomeId: row.learningOutcomeId,
            cognitiveLevelId: row.cognitiveLevelId,
            difficultyLevelId: row.difficultyLevelId,
            questionTypeId: row.questionTypeId,
            marks: row.marksPerQuestion,
            stem: '',
            options: defaultOptions,
            correctOptionId: isShort ? '' : `${qId}-a`,
            sampleAnswer: isShort ? '' : undefined,
            rationale: '',
            authoringStatus: 'Not Started',
            reviewStatus: 'Draft',
            authorId: author.id,
            version: 1,
            inBank: false,
            bankAvailability: 'Available',
            updatedAt: nowStamp(),
            history: [
              {
                id: `h-${qId}-1`,
                timestamp: nowStamp(),
                actorName: activeUser.name,
                actorRole: 'Subject Coordinator',
                action: `Assigned slot ${slot} from ${bp.code}`,
              },
            ],
          });
          slot++;
        }
      });

      const newPkg: QuestionPackage = {
        id: pkgId,
        title: input.title,
        blueprintId: bp.id,
        examTypeId: bp.examTypeId,
        subjectId: bp.subjectId,
        authorId: author.id,
        coordinatorId: activeUser.id,
        totalAssigned: generatedQuestions.length,
        status: 'Assigned',
        dueDate: input.dueDate,
        createdAt: todayDate(),
        notes: input.notes,
      };

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Question Development',
          action: 'Assigned Author Workload',
          target: input.title,
          details: `Assigned ${generatedQuestions.length} questions to ${author.name}`,
        },
        {
          targetRole: 'author',
          title: `New Workload Assigned: ${generatedQuestions.length} Questions`,
          message: `${activeUser.name} assigned "${input.title}" due ${input.dueDate}.`,
          moduleLink: 'my_work',
        }
      );

      return {
        ...prev,
        packages: [newPkg, ...prev.packages],
        questions: [...prev.questions, ...generatedQuestions],
        ...meta,
      };
    });
    notifyToast('Author workload package assigned and generated from TOS Matrix.');
  };

  const saveQuestionDraft = (questionId: string, patch: Partial<QuestionItem>) => {
    setState((prev) => {
      let targetPkgId = '';
      const questions = prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        targetPkgId = q.packageId;
        const merged = { ...q, ...patch, updatedAt: nowStamp() };
        const authoringStatus = computeAuthoringStatus(merged);
        return { ...merged, authoringStatus };
      });

      const packages = prev.packages.map((pkg) => {
        if (pkg.id !== targetPkgId) return pkg;
        if (pkg.status === 'Assigned') {
          return { ...pkg, status: 'In Progress' as const };
        }
        return pkg;
      });

      return { ...prev, questions, packages };
    });
  };

  const submitPackageForReview = (packageId: string) => {
    setState((prev) => {
      const pkg = prev.packages.find((p) => p.id === packageId);
      if (!pkg) return prev;

      const packages = prev.packages.map((p) =>
        p.id === packageId
          ? { ...p, status: 'Submitted' as const, submittedAt: todayDate() }
          : p
      );

      const questions = prev.questions.map((q) => {
        if (q.packageId !== packageId) return q;
        return {
          ...q,
          reviewStatus: 'Submitted' as const,
          updatedAt: nowStamp(),
          history: [
            ...q.history,
            {
              id: `h-${Date.now()}-${q.slotNumber}`,
              timestamp: nowStamp(),
              actorName: activeUser.name,
              actorRole: 'Question Author',
              action: 'Submitted question in complete package',
            },
          ],
        };
      });

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Question Development',
          action: 'Submitted Question Package',
          target: pkg.title,
          details: `Submitted all ${pkg.totalAssigned} questions for Coordinator assignment.`,
        },
        {
          targetRole: 'coordinator',
          title: `Package Submitted: ${pkg.title}`,
          message: `${activeUser.name} completed and submitted ${pkg.totalAssigned} questions. Assign Reviewer & Approver.`,
          moduleLink: 'submitted_packages',
        }
      );

      return { ...prev, packages, questions, ...meta };
    });
    notifyToast('Question package submitted! All items are now locked for review.');
  };

  const assignPackageGovernance = (packageId: string, reviewerId: string, approverId: string) => {
    setState((prev) => {
      const pkg = prev.packages.find((p) => p.id === packageId);
      const reviewer = prev.users.find((u) => u.id === reviewerId);
      const approver = prev.users.find((u) => u.id === approverId);
      if (!pkg) return prev;

      const packages = prev.packages.map((p) =>
        p.id === packageId
          ? { ...p, reviewerId, approverId, status: 'In Review' as const }
          : p
      );

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Governance Assignment',
          action: 'Assigned Reviewer & Approver',
          target: pkg.title,
          details: `Reviewer: ${reviewer?.name}, Approver: ${approver?.name}`,
        },
        {
          targetRole: 'reviewer',
          title: `Review Package Assigned: ${pkg.title}`,
          message: `You have been assigned to review ${pkg.totalAssigned} questions.`,
          moduleLink: 'question_review',
        }
      );

      return { ...prev, packages, ...meta };
    });
    notifyToast('Reviewer and Approver assigned. Package moved to Review Queue.');
  };

  const reviewQuestionDecision = (
    questionId: string,
    decision: 'Accepted' | 'Returned',
    comment: string
  ) => {
    setState((prev) => {
      const questions = prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          reviewStatus: decision,
          reviewerComment: comment || (decision === 'Accepted' ? 'Accepted by reviewer.' : 'Revision requested.'),
          updatedAt: nowStamp(),
          history: [
            ...q.history,
            {
              id: `hr-${Date.now()}`,
              timestamp: nowStamp(),
              actorName: activeUser.name,
              actorRole: 'Question Reviewer',
              action: decision === 'Accepted' ? 'Accepted item' : 'Returned item for revision',
              comment,
            },
          ],
        };
      });
      return { ...prev, questions };
    });
    notifyToast(`Question marked as ${decision}`, decision === 'Accepted' ? 'success' : 'warning');
  };

  const finalizePackageReview = (packageId: string) => {
    setState((prev) => {
      const pkg = prev.packages.find((p) => p.id === packageId);
      if (!pkg) return prev;
      const pkgItems = prev.questions.filter((q) => q.packageId === packageId);
      const returnedCount = pkgItems.filter((q) => q.reviewStatus === 'Returned').length;
      const nextStatus = returnedCount > 0 ? 'Returned to Author' : 'Pending Approval';

      const packages = prev.packages.map((p) =>
        p.id === packageId ? { ...p, status: nextStatus as QuestionPackage['status'] } : p
      );

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Question Review',
          action: returnedCount > 0 ? 'Returned Items to Author' : 'Forwarded Package to Approver',
          target: pkg.title,
          details:
            returnedCount > 0
              ? `${returnedCount} returned item(s) sent back to Author for targeted revision.`
              : `All ${pkgItems.length} items accepted and forwarded for final approval.`,
        },
        {
          targetRole: returnedCount > 0 ? 'author' : 'approver',
          title:
            returnedCount > 0
              ? `Revision Required: ${returnedCount} Question(s) Returned`
              : `Package Ready for Final Approval: ${pkg.title}`,
          message:
            returnedCount > 0
              ? `Reviewer returned ${returnedCount} question(s) in "${pkg.title}". Only returned items are editable.`
              : `All ${pkgItems.length} questions passed peer review and await final approval.`,
          moduleLink: returnedCount > 0 ? 'my_work' : 'question_approval',
        }
      );

      return { ...prev, packages, ...meta };
    });
    notifyToast('Package review decision finalized and routed.');
  };

  const resubmitReturnedPackage = (packageId: string) => {
    setState((prev) => {
      const pkg = prev.packages.find((p) => p.id === packageId);
      if (!pkg) return prev;

      const packages = prev.packages.map((p) =>
        p.id === packageId ? { ...p, status: 'In Review' as const } : p
      );

      const questions = prev.questions.map((q) => {
        if (q.packageId !== packageId || q.reviewStatus !== 'Returned') return q;
        return {
          ...q,
          reviewStatus: 'Submitted' as const,
          version: q.version + 1,
          updatedAt: nowStamp(),
          history: [
            ...q.history,
            {
              id: `hres-${Date.now()}-${q.slotNumber}`,
              timestamp: nowStamp(),
              actorName: activeUser.name,
              actorRole: 'Question Author',
              action: `Revised and resubmitted (v${q.version + 1}) to Reviewer`,
            },
          ],
        };
      });

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Question Revision',
          action: 'Resubmitted Revised Questions',
          target: pkg.title,
          details: 'Returned questions updated and resubmitted to assigned Reviewer.',
        },
        {
          targetRole: 'reviewer',
          title: `Revisions Resubmitted: ${pkg.title}`,
          message: `${activeUser.name} revised and resubmitted the returned questions.`,
          moduleLink: 'question_review',
        }
      );

      return { ...prev, packages, questions, ...meta };
    });
    notifyToast('Revised questions resubmitted to the assigned Reviewer.');
  };

  const approverPackageDecision = (
    packageId: string,
    decision: 'Approved' | 'Returned',
    comment: string
  ) => {
    setState((prev) => {
      const pkg = prev.packages.find((p) => p.id === packageId);
      if (!pkg) return prev;

      const nextPkgStatus = decision === 'Approved' ? 'Approved' : 'Returned to Author';
      const packages = prev.packages.map((p) =>
        p.id === packageId ? { ...p, status: nextPkgStatus as QuestionPackage['status'] } : p
      );

      const questions = prev.questions.map((q) => {
        if (q.packageId !== packageId) return q;
        const isApproved = decision === 'Approved';
        return {
          ...q,
          reviewStatus: isApproved ? ('Approved' as const) : ('Returned' as const),
          approverComment: comment,
          inBank: isApproved,
          bankAvailability: 'Available' as const,
          updatedAt: nowStamp(),
          history: [
            ...q.history,
            {
              id: `hap-${Date.now()}-${q.slotNumber}`,
              timestamp: nowStamp(),
              actorName: activeUser.name,
              actorRole: 'Question Approver',
              action: isApproved
                ? 'Approved and released into Question Bank'
                : 'Returned from Approver for revision',
              comment,
            },
          ],
        };
      });

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Question Approval',
          action: decision === 'Approved' ? 'Approved Package into Bank' : 'Returned Package',
          target: pkg.title,
          details: comment || `Package ${decision} by Question Approver.`,
        },
        {
          targetRole: decision === 'Approved' ? 'exam_developer' : 'author',
          title:
            decision === 'Approved'
              ? `Questions Released to Bank: ${pkg.title}`
              : `Package Returned by Approver: ${pkg.title}`,
          message:
            decision === 'Approved'
              ? `${pkg.totalAssigned} approved questions are now active in the Question Bank.`
              : `Approver returned "${pkg.title}": ${comment}`,
          moduleLink: decision === 'Approved' ? 'question_bank' : 'my_work',
        }
      );

      return { ...prev, packages, questions, ...meta };
    });
    notifyToast(
      decision === 'Approved'
        ? 'Package approved! Questions are now active in the Question Bank.'
        : 'Package returned to Author with Approver feedback.'
    );
  };

  // Examinations
  const createExamination = (input: {
    title: string;
    code: string;
    blueprintId: string;
    instructions: string;
  }) => {
    const id = `exam-${Date.now()}`;
    setState((prev) => {
      const bp = prev.blueprints.find((b) => b.id === input.blueprintId);
      if (!bp) return prev;
      const newExam: Examination = {
        id,
        title: input.title,
        code: input.code,
        blueprintId: bp.id,
        examTypeId: bp.examTypeId,
        subjectId: bp.subjectId,
        developerId: activeUser.id,
        reviewerId: 'usr-exam-rev',
        approverId: 'usr-exam-app',
        selectedQuestionIds: [],
        status: 'In Assembly',
        version: '1.0',
        instructions: input.instructions,
        createdAt: todayDate(),
        updatedAt: nowStamp(),
        history: [
          {
            id: `eh-${Date.now()}`,
            timestamp: nowStamp(),
            actorName: activeUser.name,
            actorRole: 'Exam Developer',
            action: `Initialized examination from blueprint ${bp.code}`,
          },
        ],
      };

      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'Examination Management',
        action: 'Created Examination',
        target: input.code,
        details: input.title,
      });

      return { ...prev, examinations: [newExam, ...prev.examinations], ...meta };
    });
    notifyToast(`Created examination "${input.title}"`);
    return id;
  };

  const updateExamQuestions = (examId: string, questionIds: string[]) => {
    setState((prev) => ({
      ...prev,
      examinations: prev.examinations.map((ex) =>
        ex.id === examId
          ? { ...ex, selectedQuestionIds: questionIds, updatedAt: nowStamp() }
          : ex
      ),
    }));
  };

  const submitExamForReview = (examId: string) => {
    setState((prev) => {
      const ex = prev.examinations.find((e) => e.id === examId);
      if (!ex) return prev;
      const examinations = prev.examinations.map((e) =>
        e.id === examId
          ? {
              ...e,
              status: 'Submitted for Review' as const,
              updatedAt: nowStamp(),
              history: [
                ...e.history,
                {
                  id: `eh-${Date.now()}`,
                  timestamp: nowStamp(),
                  actorName: activeUser.name,
                  actorRole: 'Exam Developer',
                  action: 'Validated and submitted examination for Exam Review',
                },
              ],
            }
          : e
      );

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Examination Management',
          action: 'Submitted Exam for Review',
          target: ex.code,
          details: `${ex.title} (${ex.selectedQuestionIds.length} questions)`,
        },
        {
          targetRole: 'exam_reviewer',
          title: `Exam Ready for Review: ${ex.code}`,
          message: `${activeUser.name} submitted "${ex.title}" for Exam Review.`,
          moduleLink: 'exam_review',
        }
      );

      return { ...prev, examinations, ...meta };
    });
    notifyToast('Examination submitted for Exam Review!');
  };

  const reviewExamDecision = (
    examId: string,
    decision: 'Pending Final Approval' | 'Returned for Revision',
    comment: string
  ) => {
    setState((prev) => {
      const ex = prev.examinations.find((e) => e.id === examId);
      if (!ex) return prev;
      const examinations = prev.examinations.map((e) =>
        e.id === examId
          ? {
              ...e,
              status: decision,
              reviewComment: comment,
              updatedAt: nowStamp(),
              history: [
                ...e.history,
                {
                  id: `ehr-${Date.now()}`,
                  timestamp: nowStamp(),
                  actorName: activeUser.name,
                  actorRole: 'Exam Reviewer',
                  action:
                    decision === 'Pending Final Approval'
                      ? 'Accepted examination and forwarded for Final Approval'
                      : 'Returned examination to Exam Developer for revision',
                  comment,
                },
              ],
            }
          : e
      );

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Exam Review',
          action: decision === 'Pending Final Approval' ? 'Accepted Exam' : 'Returned Exam',
          target: ex.code,
          details: comment,
        },
        {
          targetRole: decision === 'Pending Final Approval' ? 'exam_approver' : 'exam_developer',
          title:
            decision === 'Pending Final Approval'
              ? `Exam Ready for Final Approval: ${ex.code}`
              : `Exam Returned for Revision: ${ex.code}`,
          message: comment,
          moduleLink: decision === 'Pending Final Approval' ? 'exam_approval' : 'exam_assembly',
        }
      );

      return { ...prev, examinations, ...meta };
    });
    notifyToast(
      decision === 'Pending Final Approval'
        ? 'Examination accepted and routed to Exam Approver.'
        : 'Examination returned to Exam Developer.'
    );
  };

  const testMoodleConnection = (draftSettings: SystemSettings) => {
    const testedAt = nowStamp();
    setState((prev) => {
      const meta = appendLogAndNotif(prev, {
        actorName: activeUser.name,
        actorRole: prev.currentRole,
        module: 'Assessment Integration',
        action: 'Verified Moodle LMS Connection',
        target: `${draftSettings.moodleBaseUrl} (Course ${draftSettings.moodleTargetCourseId})`,
        details: `Service "${draftSettings.moodleServiceName}" authenticated via REST token. Default import format: ${draftSettings.moodleImportFormat.toUpperCase()}.`,
      });
      return {
        ...prev,
        settings: { ...prev.settings, moodleLastTestedAt: testedAt },
        ...meta,
      };
    });
    notifyToast(`Moodle LMS handshake verified on ${draftSettings.moodleBaseUrl}`);
  };

  const pushExamsToMoodle = (
    examIds: string[],
    source: 'exam_bank' | 'auto_push' | 'approval' = 'exam_bank',
    settingsOverride?: SystemSettings
  ): number => {
    if (examIds.length === 0) {
      notifyToast('Select at least one examination to push to Moodle.', 'warning');
      return 0;
    }
    const cfg = settingsOverride ?? state.settings;
    if (!cfg.moodleEnabled) {
      notifyToast('Enable Moodle LMS Integration in System Settings first.', 'warning');
      return 0;
    }
    if (!cfg.moodleBaseUrl.trim() || !cfg.moodleWebServiceToken.trim()) {
      notifyToast('Configure Moodle Site URL and Web Service Token in System Settings.', 'warning');
      return 0;
    }

    const idSet = new Set(examIds);
    const targetExams = state.examinations.filter((e) => idSet.has(e.id) && e.status === 'Approved');
    if (targetExams.length === 0) {
      notifyToast('Only Approved Exam Bank examinations can be pushed to Moodle.', 'warning');
      return 0;
    }

    const syncTimestamp = nowStamp();
    setState((prev) => {
      const examinations = prev.examinations.map((e, idx) => {
        if (!idSet.has(e.id) || e.status !== 'Approved') return e;
        const quizNum = 4100 + idx * 17 + (Date.now() % 89);
        const categoryPath = `${cfg.moodleTargetCategory}/${e.code}_v${e.version}`;
        return {
          ...e,
          updatedAt: syncTimestamp,
          moodleSync: {
            status: 'Synced' as const,
            syncedAt: syncTimestamp,
            courseId: cfg.moodleTargetCourseId,
            categoryPath,
            moodleQuizId: `MDL-QZ-${quizNum}`,
            format: cfg.moodleImportFormat,
            autoPushed: source !== 'exam_bank',
          },
          history: [
            ...e.history,
            {
              id: `mdl-${Date.now()}-${e.id}`,
              timestamp: syncTimestamp,
              actorName: activeUser.name,
              actorRole: ROLES.find((r) => r.id === prev.currentRole)?.label ?? 'Administrator',
              action:
                source === 'auto_push'
                  ? 'Auto-pushed examination to Moodle LMS'
                  : 'Pushed examination to Moodle LMS',
              comment: `Course ${cfg.moodleTargetCourseId} · Category ${categoryPath} · Format ${cfg.moodleImportFormat.toUpperCase()}`,
            },
          ],
        };
      });

      const codes = targetExams.map((e) => e.code).join(', ');
      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Assessment Integration',
          action: source === 'auto_push' ? 'Auto-Pushed Exams to Moodle' : 'Pushed Exams to Moodle',
          target: codes,
          details: `Dispatched ${targetExams.length} exam(s) to ${cfg.moodleBaseUrl} (Course: ${cfg.moodleTargetCourseId}) as ${cfg.moodleImportFormat.toUpperCase()}.`,
        },
        {
          targetRole: 'exam_developer',
          title: `Moodle Sync Completed (${targetExams.length} Exam${targetExams.length > 1 ? 's' : ''})`,
          message: `${codes} pushed to ${cfg.moodleBaseUrl} (${cfg.moodleTargetCourseId}).`,
          moduleLink: 'exam_bank',
        }
      );

      return { ...prev, examinations, ...meta };
    });

    notifyToast(
      `Pushed ${targetExams.length} selected examination${targetExams.length > 1 ? 's' : ''} to Moodle (${cfg.moodleTargetCourseId})`
    );
    return targetExams.length;
  };

  const approveExamDecision = (
    examId: string,
    decision: 'Approved' | 'Returned for Revision',
    comment: string
  ) => {
    setState((prev) => {
      const ex = prev.examinations.find((e) => e.id === examId);
      if (!ex) return prev;

      const autoPush =
        decision === 'Approved' && prev.settings.moodleEnabled && prev.settings.moodleAutoPushOnApproval;
      const syncStamp = nowStamp();

      const examinations = prev.examinations.map((e) =>
        e.id === examId
          ? {
              ...e,
              status: decision,
              approvalComment: comment,
              updatedAt: syncStamp,
              moodleSync: autoPush
                ? {
                    status: 'Synced' as const,
                    syncedAt: syncStamp,
                    courseId: prev.settings.moodleTargetCourseId,
                    categoryPath: `${prev.settings.moodleTargetCategory}/${e.code}_v${e.version}`,
                    moodleQuizId: `MDL-QZ-${4200 + (Date.now() % 700)}`,
                    format: prev.settings.moodleImportFormat,
                    autoPushed: true,
                  }
                : e.moodleSync,
              history: [
                ...e.history,
                {
                  id: `eha-${Date.now()}`,
                  timestamp: syncStamp,
                  actorName: activeUser.name,
                  actorRole: 'Exam Approver',
                  action:
                    decision === 'Approved'
                      ? autoPush
                        ? 'Approved, published to Exam Bank, and auto-pushed to Moodle LMS'
                        : 'Approved and published examination to Exam Bank'
                      : 'Returned examination for revision',
                  comment,
                },
              ],
            }
          : e
      );

      // Mark used questions in bank if approved
      const usedSet = new Set(ex.selectedQuestionIds);
      const questions =
        decision === 'Approved'
          ? prev.questions.map((q) =>
              usedSet.has(q.id) ? { ...q, bankAvailability: 'Used in Active Exam' as const } : q
            )
          : prev.questions;

      const meta = appendLogAndNotif(
        prev,
        {
          actorName: activeUser.name,
          actorRole: prev.currentRole,
          module: 'Exam Approval',
          action: decision === 'Approved' ? 'Published Exam to Exam Bank' : 'Returned Exam',
          target: ex.code,
          details: autoPush
            ? `${comment} · Auto-pushed to Moodle (${prev.settings.moodleTargetCourseId}).`
            : comment,
        },
        {
          targetRole: 'exam_developer',
          title:
            decision === 'Approved'
              ? `Examination Published to Exam Bank: ${ex.code}`
              : `Examination Returned by Approver: ${ex.code}`,
          message: comment,
          moduleLink: decision === 'Approved' ? 'exam_bank' : 'exam_assembly',
        }
      );

      return { ...prev, examinations, questions, ...meta };
    });
    notifyToast(
      decision === 'Approved'
        ? state.settings.moodleEnabled && state.settings.moodleAutoPushOnApproval
          ? 'Examination approved, published to Exam Bank, and auto-pushed to Moodle!'
          : 'Examination approved and published to the official Exam Bank!'
        : 'Examination returned for revision.'
    );
  };

  return (
    <ExamNovaContext.Provider
      value={{
        ...state,
        activeModule,
        setActiveModule,
        selectedPackageId,
        setSelectedPackageId,
        selectedQuestionId,
        setSelectedQuestionId,
        selectedExamId,
        setSelectedExamId,
        switchRole,
        activeUser,
        toasts,
        dismissToast,
        notifyToast,
        resetDemoData,
        saveUser,
        toggleUserStatus,
        togglePermission,
        updateUserSubjects,
        updateSettings,
        testSmtpConfiguration,
        testMoodleConnection,
        pushExamsToMoodle,
        resetSystemSettings,
        markNotificationRead,
        markAllNotificationsRead,
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
        saveBlueprint,
        transitionBlueprint,
        activateBlueprint,
        createAuthorWorkload,
        saveQuestionDraft,
        submitPackageForReview,
        resubmitReturnedPackage,
        assignPackageGovernance,
        reviewQuestionDecision,
        finalizePackageReview,
        approverPackageDecision,
        createExamination,
        updateExamQuestions,
        submitExamForReview,
        reviewExamDecision,
        approveExamDecision,
        printJob,
        triggerPdfExport,
      }}
    >
      {children}
    </ExamNovaContext.Provider>
  );
};

export function useExamNova() {
  const ctx = useContext(ExamNovaContext);
  if (!ctx) throw new Error('useExamNova must be used within ExamNovaProvider');
  return ctx;
}
