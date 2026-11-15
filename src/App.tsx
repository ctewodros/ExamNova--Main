import React from 'react';
import { ExamNovaProvider, useExamNova } from './context/ExamNovaContext';
import { LayoutShell } from './components/LayoutShell';
import { RoleDashboard } from './modules/RoleDashboard';
import {
  AdminAuditLogsView,
  AdminRolesView,
  AdminSettingsView,
  AdminSubjectAccessView,
  AdminUsersView,
  NotificationsView,
} from './modules/AdminModule';
import { CurriculumModule } from './modules/CurriculumModule';
import { BlueprintModule } from './modules/BlueprintModule';
import {
  AuthoringWorkspaceView,
  AuthorWorkloadsView,
  MyWorkView,
  QuestionRequirementsView,
} from './modules/QuestionAuthoringModule';
import {
  QuestionApprovalView,
  QuestionReviewView,
  SubmittedPackagesView,
} from './modules/QuestionGovernanceModule';
import { QuestionBankModule } from './modules/QuestionBankModule';
import {
  ExamApprovalQueueView,
  ExamAssemblyView,
  ExamBankView,
  ExamReviewQueueView,
} from './modules/ExamManagementModule';
import { PrintSheet } from './components/PrintSheet';

const ActiveModuleRouter: React.FC = () => {
  const { activeModule } = useExamNova();

  switch (activeModule) {
    case 'dashboard':
      return <RoleDashboard />;
    case 'admin_users':
      return <AdminUsersView />;
    case 'admin_roles':
      return <AdminRolesView />;
    case 'admin_subject_access':
      return <AdminSubjectAccessView />;
    case 'admin_settings':
      return <AdminSettingsView />;
    case 'admin_audit':
      return <AdminAuditLogsView />;
    case 'notifications':
      return <NotificationsView />;
    case 'curriculum_setup':
      return <CurriculumModule />;
    case 'blueprints':
      return <BlueprintModule />;
    case 'question_requirements':
      return <QuestionRequirementsView />;
    case 'author_workloads':
      return <AuthorWorkloadsView />;
    case 'my_work':
      return <MyWorkView />;
    case 'authoring_workspace':
      return <AuthoringWorkspaceView />;
    case 'submitted_packages':
      return <SubmittedPackagesView />;
    case 'question_review':
      return <QuestionReviewView />;
    case 'question_approval':
      return <QuestionApprovalView />;
    case 'question_bank':
      return <QuestionBankModule />;
    case 'exam_assembly':
      return <ExamAssemblyView />;
    case 'exam_review':
      return <ExamReviewQueueView />;
    case 'exam_approval':
      return <ExamApprovalQueueView />;
    case 'exam_bank':
      return <ExamBankView />;
    default:
      return <RoleDashboard />;
  }
};

export default function App() {
  return (
    <ExamNovaProvider>
      <div className="no-print">
        <LayoutShell>
          <ActiveModuleRouter />
        </LayoutShell>
      </div>
      <PrintSheet />
    </ExamNovaProvider>
  );
}
