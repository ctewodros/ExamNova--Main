import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  Settings,
  FileText,
  Bell,
  Layers,
  Grid,
  ClipboardList,
  UserCheck,
  PenTool,
  Send,
  CheckSquare,
  Award,
  Database,
  FilePlus2,
  Eye,
  Archive,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  RotateCcw,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { AppModuleId, UserRole } from '../types/examnova';
import { ROLES } from '../data/seedData';
import { useExamNova } from '../context/ExamNovaContext';

interface NavItem {
  id: AppModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentRole,
    switchRole,
    activeModule,
    setActiveModule,
    activeUser,
    notifications,
    packages,
    blueprints,
    examinations,
    settings,
    toasts,
    dismissToast,
    resetDemoData,
  } = useExamNova();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  React.useEffect(() => {
    setLogoFailed(false);
  }, [settings.logoUrl]);

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.targetRole === currentRole || n.targetRole === 'all')
  ).length;

  const submittedPkgCount = packages.filter((p) => p.status === 'Submitted').length;
  const reviewPkgCount = packages.filter((p) => p.status === 'In Review').length;
  const approvalPkgCount = packages.filter((p) => p.status === 'Pending Approval').length;
  const reviewExamCount = examinations.filter((e) => e.status === 'Submitted for Review').length;
  const approvalExamCount = examinations.filter((e) => e.status === 'Pending Final Approval').length;
  const reviewBpCount = blueprints.filter((b) => b.status === 'Submitted').length;
  const approvalBpCount = blueprints.filter((b) => b.status === 'Reviewed').length;

  const getNavGroups = (role: UserRole): NavGroup[] => {
    switch (role) {
      case 'admin':
        return [
          {
            title: 'Overview',
            items: [
              { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ],
          },
          {
            title: 'Administration',
            items: [
              { id: 'admin_users', label: 'User Management', icon: Users },
              { id: 'admin_roles', label: 'Roles & Permissions', icon: Shield },
              { id: 'admin_subject_access', label: 'Subject Access', icon: BookOpen },
              { id: 'admin_settings', label: 'System Settings', icon: Settings },
              { id: 'admin_audit', label: 'Audit Logs', icon: FileText },
            ],
          },
          {
            title: 'Repositories',
            items: [
              { id: 'question_bank', label: 'Question Bank', icon: Database },
              { id: 'exam_bank', label: 'Exam Bank', icon: Archive },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'coordinator':
        return [
          {
            title: 'Overview',
            items: [
              { id: 'dashboard', label: 'Coordinator Dashboard', icon: LayoutDashboard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ],
          },
          {
            title: 'Curriculum & Blueprints',
            items: [
              { id: 'curriculum_setup', label: 'Curriculum Setup', icon: Layers },
              { id: 'blueprints', label: 'Blueprint Management', icon: Grid },
            ],
          },
          {
            title: 'Question Governance',
            items: [
              { id: 'question_requirements', label: 'Question Requirements', icon: ClipboardList },
              { id: 'author_workloads', label: 'Author Workload', icon: UserCheck },
              { id: 'submitted_packages', label: 'Submitted Packages', icon: Send, badge: submittedPkgCount || undefined },
              { id: 'question_bank', label: 'Question Bank', icon: Database },
            ],
          },
          {
            title: 'Communication',
            items: [
              { id: 'exam_bank', label: 'Exam Bank', icon: Archive },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'author':
        return [
          {
            title: 'Overview',
            items: [{ id: 'dashboard', label: 'Author Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'Question Authoring',
            items: [
              { id: 'my_work', label: 'My Work', icon: ClipboardList },
              { id: 'authoring_workspace', label: 'Authoring Workspace', icon: PenTool },
            ],
          },
          {
            title: 'Reference',
            items: [
              { id: 'question_bank', label: 'Question Bank', icon: Database },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'reviewer':
        return [
          {
            title: 'Overview',
            items: [{ id: 'dashboard', label: 'Reviewer Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'Peer Review',
            items: [
              { id: 'question_review', label: 'Question Review', icon: CheckSquare, badge: reviewPkgCount || undefined },
              { id: 'blueprints', label: 'Blueprint Review', icon: Grid, badge: reviewBpCount || undefined },
            ],
          },
          {
            title: 'Reference',
            items: [
              { id: 'question_bank', label: 'Question Bank', icon: Database },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'approver':
        return [
          {
            title: 'Overview',
            items: [{ id: 'dashboard', label: 'Approver Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'Final Sign-Off',
            items: [
              { id: 'question_approval', label: 'Question Approval', icon: Award, badge: approvalPkgCount || undefined },
              { id: 'blueprints', label: 'Blueprint Approval', icon: Grid, badge: approvalBpCount || undefined },
            ],
          },
          {
            title: 'Repositories',
            items: [
              { id: 'question_bank', label: 'Question Bank', icon: Database },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'exam_developer':
        return [
          {
            title: 'Overview',
            items: [{ id: 'dashboard', label: 'Exam Dev Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'Examination Assembly',
            items: [
              { id: 'exam_assembly', label: 'Exam Assembly', icon: FilePlus2 },
              { id: 'blueprints', label: 'Active Blueprints', icon: Grid },
              { id: 'question_bank', label: 'Question Bank', icon: Database },
            ],
          },
          {
            title: 'Published',
            items: [
              { id: 'exam_bank', label: 'Exam Bank', icon: Archive },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'exam_reviewer':
        return [
          {
            title: 'Overview',
            items: [{ id: 'dashboard', label: 'Exam Reviewer Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'Quality Assurance',
            items: [
              { id: 'exam_review', label: 'Exam Review Queue', icon: Eye, badge: reviewExamCount || undefined },
              { id: 'exam_bank', label: 'Exam Bank', icon: Archive },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];

      case 'exam_approver':
        return [
          {
            title: 'Overview',
            items: [{ id: 'dashboard', label: 'Exam Approver Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'Authorization',
            items: [
              { id: 'exam_approval', label: 'Exam Approval Queue', icon: Award, badge: approvalExamCount || undefined },
              { id: 'exam_bank', label: 'Exam Bank', icon: Archive },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
            ],
          },
        ];
    }
  };

  const navGroups = getNavGroups(currentRole);
  const currentRoleDef = ROLES.find((r) => r.id === currentRole)!;

  const moduleLabels: Record<AppModuleId, string> = {
    dashboard: `${currentRoleDef.shortLabel} Dashboard`,
    admin_users: 'User Management',
    admin_roles: 'Roles & Permissions',
    admin_subject_access: 'Subject Access',
    admin_settings: 'System Settings',
    admin_audit: 'Audit Logs',
    curriculum_setup: 'Curriculum Management',
    blueprints: 'Blueprint Management',
    question_requirements: 'Question Requirements',
    author_workloads: 'Author Workload Assignment',
    my_work: 'My Work',
    authoring_workspace: 'Question Authoring Workspace',
    submitted_packages: 'Submitted Packages & Governance',
    question_review: 'Question Review',
    question_approval: 'Question Approval',
    question_bank: 'Question Bank',
    exam_assembly: 'Exam Creation & Assembly',
    exam_review: 'Exam Review',
    exam_approval: 'Exam Approval',
    exam_bank: 'Exam Bank',
    analytics: 'Analytics & Insights',
    notifications: 'Notifications',
  };

  const handleSelectNav = (id: AppModuleId) => {
    setActiveModule(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Dark Navy Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0B1324] text-slate-200 border-r border-slate-800/80 transition-all duration-200 lg:static ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {settings.logoUrl && !logoFailed ? (
              <img
                src={settings.logoUrl}
                alt={settings.platformName || 'ExamNova'}
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: settings.primaryAccentColor || '#2563EB' }}
              >
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
            )}
            {!collapsed && (
              <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap truncate">
                {settings.platformName || 'ExamNova'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-3 mb-2 text-[11px] font-medium tracking-wide text-slate-400">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectNav(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Reset Demo Control */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={resetDemoData}
            title="Reset prototype demo data"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Reset Demo State</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-6 shrink-0 no-print">
          {/* Left: Hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-semibold text-slate-900 hidden sm:inline whitespace-nowrap">
                {currentRoleDef.label}
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">/</span>
              <span className="text-slate-600 font-medium truncate">
                {moduleLabels[activeModule]}
              </span>
            </div>
          </div>

          {/* Right: Role Switcher + Notifications + User Identity */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <label htmlFor="role-switcher" className="text-xs font-medium text-slate-500 hidden md:inline whitespace-nowrap">
                Perspective:
              </label>
              <select
                id="role-switcher"
                value={currentRole}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setActiveModule('notifications')}
              title="Notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 flex items-center justify-center text-[10px] font-mono font-semibold text-white bg-blue-600 rounded-full tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {activeUser.name
                  .split(' ')
                  .slice(-2)
                  .map((p) => p[0])
                  .join('')}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-slate-900 whitespace-nowrap">{activeUser.name}</div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">{activeUser.department}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto">
          {settings.maintenanceMode && (
            <div className="mb-5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center justify-between gap-3 no-print">
              <span className="font-medium">
                <strong className="font-semibold">Maintenance Notice:</strong>{' '}
                {settings.maintenanceBannerMessage || 'System maintenance mode is currently enabled.'}
              </span>
              {currentRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveModule('admin_settings')}
                  className="text-amber-900 underline font-semibold whitespace-nowrap shrink-0"
                >
                  Manage Settings
                </button>
              )}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm no-print">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg text-xs font-medium bg-white ${
                t.type === 'warning'
                  ? 'border-amber-300 text-amber-900'
                  : t.type === 'info'
                  ? 'border-blue-200 text-slate-800'
                  : 'border-emerald-200 text-slate-800'
              }`}
            >
              <span>{t.text}</span>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-slate-400 hover:text-slate-700 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
