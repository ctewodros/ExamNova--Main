import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Check,
  X,
  Bell,
  Upload,
  Globe,
  Mail,
  ShieldCheck,
  Sliders,
  HardDrive,
  Eye,
  EyeOff,
  Send,
  RotateCcw,
  Download,
  GraduationCap,
  Image as ImageIcon,
  Plug,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import {
  BackupFrequency,
  OtpDeliveryChannel,
  PlatformUser,
  RolePermissionMatrix,
  SmtpEncryption,
  SystemSettings,
  UserRole,
} from '../types/examnova';
import { ROLES } from '../data/seedData';
import { StatusText } from '../components/StatusText';

export const AdminUsersView: React.FC = () => {
  const { users, subjects, saveUser, toggleUserStatus } = useExamNova();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('author');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['subj-math']);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setEmail('');
    setDepartment('Department of Mathematics');
    setRole('author');
    setSelectedSubjects(['subj-math']);
    setModalOpen(true);
  };

  const openEdit = (u: PlatformUser) => {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setDepartment(u.department);
    setRole(u.role);
    setSelectedSubjects(u.subjects);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    saveUser({
      id: editing?.id ?? `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      department: department.trim() || 'Academic Affairs',
      role,
      subjects: selectedSubjects,
      status: editing?.status ?? 'Active',
      lastActive: editing?.lastActive ?? '2026-11-14 08:45',
    });
    setModalOpen(false);
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Manage institutional staff accounts, role assignments, and active access.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff User</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Subject Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{u.department}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {ROLES.find((r) => r.id === u.role)?.label}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {u.subjects
                      .map((sid) => subjects.find((s) => s.id === sid)?.code ?? sid)
                      .join(' · ')}
                  </td>
                  <td className="py-3 px-4">
                    <StatusText status={u.status} />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(u.id)}
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                {editing ? 'Edit User Account' : 'Create Staff Account'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Dr. Abebe Kebede"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="a.kebede@examnova.edu"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Access</label>
                <div className="flex flex-wrap gap-3 pt-1">
                  {subjects.map((s) => {
                    const checked = selectedSubjects.includes(s.id);
                    return (
                      <label key={s.id} className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedSubjects((prev) =>
                              checked ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                            )
                          }
                          className="rounded border-slate-300 text-blue-600"
                        />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 text-xs font-medium text-slate-600">
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const AdminRolesView: React.FC = () => {
  const { permissions, togglePermission, notifyToast } = useExamNova();

  const permLabels: { key: keyof RolePermissionMatrix['permissions']; label: string }[] = [
    { key: 'manageUsers', label: 'Manage Users' },
    { key: 'manageCurriculum', label: 'Manage Curriculum' },
    { key: 'createBlueprints', label: 'Create Blueprints' },
    { key: 'approveBlueprints', label: 'Approve Blueprints' },
    { key: 'assignWorkloads', label: 'Assign Workloads' },
    { key: 'authorQuestions', label: 'Author Questions' },
    { key: 'reviewQuestions', label: 'Review Questions' },
    { key: 'approveQuestions', label: 'Approve Questions' },
    { key: 'assembleExams', label: 'Assemble Exams' },
    { key: 'approveExams', label: 'Approve Exams' },
    { key: 'viewAuditLogs', label: 'Audit Logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Roles & Permissions Matrix</h1>
          <p className="text-sm text-slate-500">Configure fine-grained governance capabilities across all eight institutional roles.</p>
        </div>
        <button
          type="button"
          onClick={() => notifyToast('Role permission matrix saved')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Save Policy Matrix
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-4 sticky left-0 bg-slate-50">Capability</th>
              {ROLES.map((r) => (
                <th key={r.id} className="py-3 px-3 text-center whitespace-nowrap">
                  {r.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {permLabels.map((perm) => (
              <tr key={perm.key} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-medium text-slate-800 sticky left-0 bg-white">
                  {perm.label}
                </td>
                {ROLES.map((r) => {
                  const row = permissions.find((p) => p.role === r.id);
                  const enabled = row?.permissions[perm.key] ?? false;
                  return (
                    <td key={r.id} className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => togglePermission(r.id, perm.key)}
                        className={`w-6 h-6 rounded inline-flex items-center justify-center border transition-colors ${
                          enabled
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminSubjectAccessView: React.FC = () => {
  const { users, subjects, updateUserSubjects } = useExamNova();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Subject Access Control</h1>
        <p className="text-sm text-slate-500">Restrict question bank, blueprint, and authoring access by academic subject.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Role</th>
              {subjects.map((s) => (
                <th key={s.id} className="py-3 px-4 text-center">
                  {s.name} ({s.code})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                <td className="py-3 px-4 text-slate-600">
                  {ROLES.find((r) => r.id === u.role)?.label}
                </td>
                {subjects.map((s) => {
                  const has = u.subjects.includes(s.id);
                  return (
                    <td key={s.id} className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={has}
                        onChange={() => {
                          const next = has
                            ? u.subjects.filter((id) => id !== s.id)
                            : [...u.subjects, s.id];
                          updateUserSubjects(u.id, next);
                        }}
                        className="rounded border-slate-300 text-blue-600 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type SettingsTabId = 'branding' | 'smtp' | 'security' | 'workflow' | 'integrations' | 'operations';

const SAMPLE_CREST_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E3A8A"/><path d="M32 12L12 21v12c0 12.6 8.5 23.8 20 27 11.5-3.2 20-14.4 20-27V21L32 12z" fill="#2563EB" stroke="#DBEAFE" stroke-width="2"/><path d="M32 21l-12 5.5L32 32l12-5.5L32 21zm-7 9v5.2c0 2.4 3.1 4.3 7 4.3s7-1.9 7-4.3V30l-7 3.2L25 30z" fill="#FFFFFF"/></svg>`
)}`;

const SAMPLE_FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1E3A8A"/><path d="M16 6L6 10.5v6.2c0 6.4 4.3 12 10 13.5 5.7-1.5 10-7.1 10-13.5v-6.2L16 6z" fill="#2563EB"/><path d="M16 10.5l-6 2.8 6 2.8 6-2.8-6-2.8z" fill="#FFFFFF"/></svg>`
)}`;

const ACCENT_SWATCHES = [
  { label: 'Royal Blue', hex: '#2563EB' },
  { label: 'Deep Indigo', hex: '#4F46E5' },
  { label: 'Academic Teal', hex: '#0F766E' },
  { label: 'Ocean Slate', hex: '#0369A1' },
  { label: 'Executive Navy', hex: '#1E293B' },
];

const SettingToggle: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}> = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
    <div className="min-w-0">
      <div className="text-xs font-semibold text-slate-800">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{description}</div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
        checked ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-[1px] ${
          checked ? 'translate-x-4 ml-[1px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

export const AdminSettingsView: React.FC = () => {
  const {
    settings,
    examinations,
    subjects,
    updateSettings,
    testSmtpConfiguration,
    testMoodleConnection,
    pushExamsToMoodle,
    resetSystemSettings,
    notifyToast,
  } = useExamNova();
  const [form, setForm] = useState<SystemSettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTabId>('branding');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showMoodleToken, setShowMoodleToken] = useState(false);
  const [testRecipient, setTestRecipient] = useState(settings.supportEmail || 'admin@examnova.edu');
  const [smtpTestResult, setSmtpTestResult] = useState<{
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
  } | null>(null);
  const [moodleTestResult, setMoodleTestResult] = useState<{
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const approvedExams = examinations.filter((e) => e.status === 'Approved');

  const isDirty = JSON.stringify(form) !== JSON.stringify(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleImageFileUpload = (
    file: File | undefined,
    field: 'logoUrl' | 'faviconUrl',
    maxBytes = 512 * 1024
  ) => {
    if (!file) return;
    if (file.size > maxBytes) {
      notifyToast('Image file must be under 512 KB for browser storage', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunSmtpTest = () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (!form.smtpEnabled) {
      setSmtpTestResult({
        status: 'error',
        message: 'Enable SMTP outbound relay before running a connection test.',
        timestamp: now,
      });
      return;
    }
    if (!form.smtpHost.trim() || !form.smtpFromEmail.trim() || !testRecipient.trim()) {
      setSmtpTestResult({
        status: 'error',
        message: 'SMTP Host, Sender Email, and Test Recipient Email are all required.',
        timestamp: now,
      });
      return;
    }
    testSmtpConfiguration(testRecipient.trim(), form);
    setSmtpTestResult({
      status: 'ok',
      message: `Handshake verified on ${form.smtpHost}:${form.smtpPort} (${form.smtpEncryption}). Test message queued for ${testRecipient.trim()}.`,
      timestamp: now,
    });
  };

  const handleDownloadBackupJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: form.platformName,
      institution: form.institutionName,
      settings: {
        ...form,
        smtpPassword: form.smtpPassword ? '***REDACTED***' : '',
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examnova-settings-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifyToast('Configuration snapshot downloaded');
  };

  const toggleOtpRole = (roleId: UserRole) => {
    setForm((prev) => {
      const exists = prev.otpEnforceRoles.includes(roleId);
      return {
        ...prev,
        otpEnforceRoles: exists
          ? prev.otpEnforceRoles.filter((r) => r !== roleId)
          : [...prev.otpEnforceRoles, roleId],
      };
    });
  };

  const toggleMoodleSyncExam = (examId: string) => {
    setForm((prev) => {
      const exists = prev.moodleSyncSelectedExamIds.includes(examId);
      return {
        ...prev,
        moodleSyncSelectedExamIds: exists
          ? prev.moodleSyncSelectedExamIds.filter((id) => id !== examId)
          : [...prev.moodleSyncSelectedExamIds, examId],
      };
    });
  };

  const handleRunMoodleTest = () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (!form.moodleEnabled) {
      setMoodleTestResult({
        status: 'error',
        message: 'Enable Moodle LMS Integration before running a connection check.',
        timestamp: now,
      });
      return;
    }
    if (!form.moodleBaseUrl.trim() || !form.moodleWebServiceToken.trim()) {
      setMoodleTestResult({
        status: 'error',
        message: 'Moodle Site Base URL and Web Service Token are required.',
        timestamp: now,
      });
      return;
    }
    testMoodleConnection(form);
    setForm((prev) => ({ ...prev, moodleLastTestedAt: now }));
    setMoodleTestResult({
      status: 'ok',
      message: `REST Web Service "${form.moodleServiceName}" verified at ${form.moodleBaseUrl}. Course ${form.moodleTargetCourseId} is ready for import.`,
      timestamp: now,
    });
  };

  const handleAutoPushSelectedExams = () => {
    if (form.moodleSyncSelectedExamIds.length === 0) {
      notifyToast('Select at least one approved examination from the list below.', 'warning');
      return;
    }
    updateSettings(form);
    pushExamsToMoodle(form.moodleSyncSelectedExamIds, 'auto_push', form);
  };

  const tabs: { id: SettingsTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'branding', label: 'Branding & Portal', icon: ImageIcon },
    { id: 'smtp', label: 'SMTP & Email', icon: Mail },
    { id: 'security', label: 'Security & OTP', icon: ShieldCheck },
    { id: 'workflow', label: 'Workflow & Governance', icon: Sliders },
    { id: 'integrations', label: 'Assessment Integration', icon: Plug },
    { id: 'operations', label: 'Backup & Operations', icon: HardDrive },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Settings & Governance</h1>
          <p className="text-sm text-slate-500">
            Configure institutional branding, SMTP relay, OTP authentication, examination rules, and operations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isDirty && (
            <span className="text-xs font-medium text-amber-700 whitespace-nowrap">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={resetSystemSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRANDING & PORTAL */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Institutional Identity</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Applied across the workspace header, examination print papers, and Word/PDF exports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Platform Display Name</label>
                <input
                  value={form.platformName}
                  onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  placeholder="ExamNova"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Institution / Board Name</label>
                <input
                  value={form.institutionName}
                  onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Institution Subtitle / Tagline</label>
                <input
                  value={form.institutionTagline}
                  onChange={(e) => setForm({ ...form, institutionTagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Active Academic Cycle</label>
                <input
                  value={form.academicCycle}
                  onChange={(e) => setForm({ ...form, academicCycle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Institutional Support Email</label>
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Primary Brand Accent</label>
                <div className="flex items-center gap-2">
                  {ACCENT_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      title={swatch.label}
                      onClick={() => setForm({ ...form, primaryAccentColor: swatch.hex })}
                      className={`w-7 h-7 rounded-lg border transition-transform ${
                        form.primaryAccentColor.toLowerCase() === swatch.hex.toLowerCase()
                          ? 'ring-2 ring-slate-900 ring-offset-1 scale-105'
                          : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  ))}
                  <input
                    type="text"
                    value={form.primaryAccentColor}
                    onChange={(e) => setForm({ ...form, primaryAccentColor: e.target.value })}
                    className="w-24 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
                    aria-label="Accent hex code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Favicon Configuration */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 text-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Logo & Browser Favicon</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload custom image assets (PNG, SVG, JPG, ICO up to 512 KB) or provide an image URL.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              {/* Organization Logo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Institution Logo</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: SAMPLE_CREST_SVG })}
                      className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Use Sample Crest
                    </button>
                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, logoUrl: '' })}
                        className="text-slate-500 hover:text-slate-800 font-medium whitespace-nowrap"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Dark/Light Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#0B1324] p-3.5 flex items-center gap-2.5 border border-slate-800">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Sidebar logo preview"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shrink-0"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: form.primaryAccentColor || '#2563EB' }}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{form.platformName || 'ExamNova'}</div>
                      <div className="text-[10px] text-slate-400">Sidebar Preview</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3.5 flex items-center gap-2.5 border border-slate-200">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Print header preview"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-contain shrink-0"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: form.primaryAccentColor || '#2563EB' }}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-slate-900 font-semibold truncate">
                        {form.institutionName || 'Institution'}
                      </div>
                      <div className="text-[10px] text-slate-500">Print Sheet Header</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={(e) => handleImageFileUpload(e.target.files?.[0], 'logoUrl')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={form.logoUrl.startsWith('data:') ? 'Uploaded embedded image asset' : form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="Or paste logo image URL (https://...)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Browser Favicon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">Browser Favicon</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, faviconUrl: SAMPLE_FAVICON_SVG })}
                      className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Use Crest Favicon
                    </button>
                    {form.faviconUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, faviconUrl: '' })}
                        className="text-slate-500 hover:text-slate-800 font-medium whitespace-nowrap"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Browser Tab Preview */}
                <div className="rounded-lg bg-slate-100 border border-slate-200 p-3">
                  <div className="text-[10px] font-medium text-slate-500 mb-2">Browser Tab Preview</div>
                  <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-t-lg px-3 py-1.5 max-w-full shadow-xs">
                    {form.faviconUrl ? (
                      <img
                        src={form.faviconUrl}
                        alt="Favicon preview"
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded-xs object-contain shrink-0"
                      />
                    ) : (
                      <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <span className="text-xs font-medium text-slate-800 truncate max-w-[220px]">
                      {form.platformName || 'ExamNova'} — Assessment Platform
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Favicon</span>
                    <input
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                      onChange={(e) => handleImageFileUpload(e.target.files?.[0], 'faviconUrl')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={form.faviconUrl.startsWith('data:') ? 'Uploaded embedded favicon asset' : form.faviconUrl}
                    onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                    placeholder="Or paste .ico / .png / .svg URL"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMTP & EMAIL */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-4">
              <SettingToggle
                title="Enable Outbound SMTP Email Relay"
                description="Deliver one-time passcodes, workflow assignments, and review return notices via institutional SMTP."
                checked={form.smtpEnabled}
                onChange={(next) => setForm({ ...form, smtpEnabled: next })}
              />
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${!form.smtpEnabled ? 'opacity-60' : ''}`}>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">SMTP Server Host</label>
                <input
                  disabled={!form.smtpEnabled}
                  value={form.smtpHost}
                  onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                  placeholder="smtp.institution.edu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Port</label>
                <input
                  type="number"
                  disabled={!form.smtpEnabled}
                  value={form.smtpPort}
                  onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Transport Encryption</label>
                <select
                  disabled={!form.smtpEnabled}
                  value={form.smtpEncryption}
                  onChange={(e) => setForm({ ...form, smtpEncryption: e.target.value as SmtpEncryption })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="TLS">STARTTLS (Port 587 Recommended)</option>
                  <option value="SSL">SSL / TLS (Port 465)</option>
                  <option value="NONE">Plaintext (Internal Relay Only)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">SMTP Username</label>
                <input
                  disabled={!form.smtpEnabled}
                  value={form.smtpUsername}
                  onChange={(e) => setForm({ ...form, smtpUsername: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">SMTP Password / App Token</label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    disabled={!form.smtpEnabled}
                    value={form.smtpPassword}
                    onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })}
                    className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword((v) => !v)}
                    aria-label={showSmtpPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">Sender Display Name</label>
                <input
                  disabled={!form.smtpEnabled}
                  value={form.smtpFromName}
                  onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Sender Email Address</label>
                <input
                  type="email"
                  disabled={!form.smtpEnabled}
                  value={form.smtpFromEmail}
                  onChange={(e) => setForm({ ...form, smtpFromEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* SMTP Test Harness */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="font-semibold text-slate-800">SMTP Connectivity & Delivery Test</div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="Enter recipient email for diagnostic test..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleRunSmtpTest}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </button>
              </div>
              {smtpTestResult && (
                <div
                  className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                    smtpTestResult.status === 'ok'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <span>{smtpTestResult.message}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80 shrink-0">
                    {smtpTestResult.timestamp}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & OTP */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-4">
              <SettingToggle
                title="Enable Multi-Factor OTP Verification"
                description="Require a one-time verification code at sign-in and prior to high-privilege exam approval actions."
                checked={form.otpEnabled}
                onChange={(next) => setForm({ ...form, otpEnabled: next })}
              />
            </div>

            <div className={`space-y-5 ${!form.otpEnabled ? 'opacity-60' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">OTP Delivery Channel</label>
                  <select
                    disabled={!form.otpEnabled}
                    value={form.otpDeliveryChannel}
                    onChange={(e) =>
                      setForm({ ...form, otpDeliveryChannel: e.target.value as OtpDeliveryChannel })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="email">Email OTP (via configured SMTP)</option>
                    <option value="authenticator">Authenticator App (TOTP RFC 6238)</option>
                    <option value="sms">Institutional SMS Gateway</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    OTP Validity Window (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    disabled={!form.otpEnabled}
                    value={form.otpExpiryMinutes}
                    onChange={(e) => setForm({ ...form, otpExpiryMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">Enforce OTP for Selected Roles</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={!form.otpEnabled}
                      onClick={() => setForm({ ...form, otpEnforceRoles: ROLES.map((r) => r.id) })}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      All Roles
                    </button>
                    <button
                      type="button"
                      disabled={!form.otpEnabled}
                      onClick={() =>
                        setForm({
                          ...form,
                          otpEnforceRoles: ['admin', 'coordinator', 'approver', 'exam_approver'],
                        })
                      }
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Approvers & Admins Only
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {ROLES.map((r) => {
                    const checked = form.otpEnforceRoles.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? 'border-blue-200 bg-blue-50/60 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={!form.otpEnabled}
                          checked={checked}
                          onChange={() => toggleOtpRole(r.id)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                        <span className="truncate font-medium">{r.shortLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Session, Password & Network Policy */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Session, Password & Network Access</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Protect examination item banks with automatic idle timeouts, lockout thresholds, and CIDR allowlists.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Idle Session Timeout (min)</label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={form.sessionTimeoutMinutes}
                  onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Max Failed Login Attempts</label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={form.maxLoginAttempts}
                  onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Minimum Password Length</label>
                <input
                  type="number"
                  min={8}
                  max={64}
                  value={form.passwordMinLength}
                  onChange={(e) => setForm({ ...form, passwordMinLength: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
              <SettingToggle
                title="Enforce Strong Password Complexity"
                description="Require uppercase, lowercase, numeric digit, and special symbol characters on password reset."
                checked={form.requireStrongPasswords}
                onChange={(next) => setForm({ ...form, requireStrongPasswords: next })}
              />
              <SettingToggle
                title="Restrict Sign-In to Trusted Campus / VPN IP Allowlist"
                description="Block administrative and exam approval access from outside authorized institutional CIDR blocks."
                checked={form.ipAllowlistEnabled}
                onChange={(next) => setForm({ ...form, ipAllowlistEnabled: next })}
              />
            </div>

            {form.ipAllowlistEnabled && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Allowed IPv4 / CIDR Ranges (one per line)
                </label>
                <textarea
                  rows={3}
                  value={form.ipAllowlist}
                  onChange={(e) => setForm({ ...form, ipAllowlist: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WORKFLOW & GOVERNANCE */}
      {activeTab === 'workflow' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Examination & Item Bank Governance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce quality thresholds, SLA turnaround targets, and paper export safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Minimum Rationale Length (chars)
              </label>
              <input
                type="number"
                value={form.minQuestionRationaleLength}
                onChange={(e) =>
                  setForm({ ...form, minQuestionRationaleLength: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Default Exam Duration (minutes)
              </label>
              <input
                type="number"
                value={form.defaultExamDurationMinutes}
                onChange={(e) =>
                  setForm({ ...form, defaultExamDurationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Blueprint & Review SLA Target (days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.reviewSlaDays}
                onChange={(e) => setForm({ ...form, reviewSlaDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Max Questions per Authoring Package
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={form.maxQuestionsPerPackage}
                onChange={(e) => setForm({ ...form, maxQuestionsPerPackage: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
            <SettingToggle
              title="Require Dual Blueprint Sign-off"
              description="Blueprints must pass both Reviewer and Approver before activation."
              checked={form.requireBlueprintDualSignoff}
              onChange={(next) => setForm({ ...form, requireBlueprintDualSignoff: next })}
            />
            <SettingToggle
              title="Lock Submitted Question Packages"
              description="Authors cannot modify submitted items unless explicitly returned by a Reviewer."
              checked={form.lockSubmittedQuestions}
              onChange={(next) => setForm({ ...form, lockSubmittedQuestions: next })}
            />
            <SettingToggle
              title="Auto-Archive Superseded Blueprints"
              description="Activating a new blueprint version automatically archives the prior active version."
              checked={form.autoArchiveSupersededBlueprints}
              onChange={(next) => setForm({ ...form, autoArchiveSupersededBlueprints: next })}
            />
            <SettingToggle
              title="Watermark Unapproved Exam Printouts"
              description="Stamp DRAFT SPECIFICATION headers onto printed or exported examinations prior to final approval."
              checked={form.watermarkDraftPapers}
              onChange={(next) => setForm({ ...form, watermarkDraftPapers: next })}
            />
            <SettingToggle
              title="Email Authors on Returned Items"
              description="Send immediate email alert via SMTP when a Reviewer returns questions for revision."
              checked={form.emailNotificationsOnReturn}
              onChange={(next) => setForm({ ...form, emailNotificationsOnReturn: next })}
            />
            <SettingToggle
              title="Email Coordinators on Final Approval"
              description="Notify the Subject Coordinator whenever a question package or exam reaches Approved status."
              checked={form.emailNotificationsOnApproval}
              onChange={(next) => setForm({ ...form, emailNotificationsOnApproval: next })}
            />
          </div>
        </div>
      )}

      {/* TAB 5: ASSESSMENT TOOL INTEGRATION */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Moodle LMS Assessment Integration</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect ExamNova to Moodle Question Bank & Quiz REST APIs for direct or automated exam delivery.
                </p>
              </div>
              {form.moodleLastTestedAt && (
                <div className="text-[11px] font-mono tabular-nums text-slate-500 whitespace-nowrap">
                  Last Verified: {form.moodleLastTestedAt}
                </div>
              )}
            </div>

            <div className="border-b border-slate-100 pb-4">
              <SettingToggle
                title="Enable Moodle LMS Integration"
                description="Allow authorized users to push approved Exam Bank papers directly to Moodle and download Moodle import formats."
                checked={form.moodleEnabled}
                onChange={(next) => setForm({ ...form, moodleEnabled: next })}
              />
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!form.moodleEnabled ? 'opacity-60' : ''}`}>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Moodle Site Base URL</label>
                <input
                  disabled={!form.moodleEnabled}
                  value={form.moodleBaseUrl}
                  onChange={(e) => setForm({ ...form, moodleBaseUrl: e.target.value })}
                  placeholder="https://lms.institution.edu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Web Service Token</label>
                <div className="relative">
                  <input
                    type={showMoodleToken ? 'text' : 'password'}
                    disabled={!form.moodleEnabled}
                    value={form.moodleWebServiceToken}
                    onChange={(e) => setForm({ ...form, moodleWebServiceToken: e.target.value })}
                    className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMoodleToken((v) => !v)}
                    aria-label={showMoodleToken ? 'Hide token' : 'Show token'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showMoodleToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Moodle External Service Name</label>
                <input
                  disabled={!form.moodleEnabled}
                  value={form.moodleServiceName}
                  onChange={(e) => setForm({ ...form, moodleServiceName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Target Course Shortname / ID</label>
                <input
                  disabled={!form.moodleEnabled}
                  value={form.moodleTargetCourseId}
                  onChange={(e) => setForm({ ...form, moodleTargetCourseId: e.target.value })}
                  placeholder="G12-NAT-2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Default Question Bank Category Path</label>
                <input
                  disabled={!form.moodleEnabled}
                  value={form.moodleTargetCategory}
                  onChange={(e) => setForm({ ...form, moodleTargetCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Preferred Import Payload Format</label>
                <select
                  disabled={!form.moodleEnabled}
                  value={form.moodleImportFormat}
                  onChange={(e) =>
                    setForm({ ...form, moodleImportFormat: e.target.value as 'moodle_xml' | 'gift' })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="moodle_xml">Moodle XML (.xml) — Recommended for LaTeX & Diagrams</option>
                  <option value="gift">Moodle GIFT (.txt) — Plain Text Format</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-slate-600">
                  Verify REST web service token permissions and target Moodle course accessibility.
                </div>
                <button
                  type="button"
                  onClick={handleRunMoodleTest}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Plug className="w-3.5 h-3.5" />
                  <span>Test Moodle Connection</span>
                </button>
              </div>
              {moodleTestResult && (
                <div
                  className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                    moodleTestResult.status === 'ok'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <span>{moodleTestResult.message}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80 shrink-0">
                    {moodleTestResult.timestamp}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Auto-Push Policy & Selected Exam Bank Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Auto-Push & Exam Bank Synchronization Rules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automate Moodle quiz publishing upon approval or select specific Exam Bank examinations to auto-push.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
              <SettingToggle
                title="Auto-Push Newly Approved Exams to Moodle"
                description="Automatically sync an examination to Moodle immediately when the Exam Approver publishes it to the Exam Bank."
                checked={form.moodleAutoPushOnApproval}
                onChange={(next) => setForm({ ...form, moodleAutoPushOnApproval: next })}
              />
              <SettingToggle
                title="Sync Answer Keys & Solution Rationales"
                description="Include correct answer fractions and <generalfeedback> rationales when exporting or pushing to Moodle."
                checked={form.moodleSyncAnswerKeyAndFeedback}
                onChange={(next) => setForm({ ...form, moodleSyncAnswerKeyAndFeedback: next })}
              />
              <SettingToggle
                title="Sync Blueprint Duration & Pass Mark to Quiz"
                description="Apply active Blueprint time limit and passing grade threshold automatically to the Moodle Quiz activity."
                checked={form.moodleQuizTimeLimitSync}
                onChange={(next) => setForm({ ...form, moodleQuizTimeLimitSync: next })}
              />
              <SettingToggle
                title="Shuffle Answer Choices on Import"
                description="Enable <shuffleanswers> randomization for multiple-choice questions imported into Moodle."
                checked={form.moodleShuffleAnswers}
                onChange={(next) => setForm({ ...form, moodleShuffleAnswers: next })}
              />
            </div>

            {/* Select Exam Bank Exams to Auto-Push */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">
                    Select Exam Bank Papers for Auto-Push ({form.moodleSyncSelectedExamIds.length} Selected)
                  </div>
                  <div className="text-slate-500">
                    Choose approved examinations from the Exam Bank to enroll and dispatch to Moodle.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!form.moodleEnabled || form.moodleSyncSelectedExamIds.length === 0}
                  onClick={handleAutoPushSelectedExams}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>
                    Auto-Push Selected to Moodle ({form.moodleSyncSelectedExamIds.length})
                  </span>
                </button>
              </div>

              {approvedExams.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-center">
                  No approved examinations available in the Exam Bank yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {approvedExams.map((ex) => {
                    const checked = form.moodleSyncSelectedExamIds.includes(ex.id);
                    const subjName = subjects.find((s) => s.id === ex.subjectId)?.name ?? '';
                    return (
                      <label
                        key={ex.id}
                        className={`px-4 py-3 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMoodleSyncExam(ex.id)}
                            className="rounded border-slate-300 text-blue-600"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              <span className="font-mono text-slate-600 mr-2">{ex.code}</span>
                              {ex.title}
                            </div>
                            <div className="text-[11px] text-slate-500 tabular-nums">
                              {subjName} · {ex.selectedQuestionIds.length} Questions · v{ex.version}
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono tabular-nums shrink-0">
                          {ex.moodleSync ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {ex.moodleSync.moodleQuizId} ({ex.moodleSync.syncedAt})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Not Pushed</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Standards & Proctoring Connectors */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Additional Assessment Standards & Security</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Interoperability and exam delivery browser safeguards across external assessment platforms.
              </p>
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
              <SettingToggle
                title="Enable IMS QTI 2.1 Compatibility Metadata"
                description="Embed QTI-compliant item identifiers and scoring metadata for LMS interoperability."
                checked={form.qtiExportEnabled}
                onChange={(next) => setForm({ ...form, qtiExportEnabled: next })}
              />
              <SettingToggle
                title="Require Safe Exam Browser (SEB) Policy on Moodle Push"
                description="Flag pushed Moodle Quiz activities to require Safe Exam Browser lockdown during administration."
                checked={form.safeExamBrowserRequired}
                onChange={(next) => setForm({ ...form, safeExamBrowserRequired: next })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BACKUP & OPERATIONS */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Audit Retention & Configuration Backups</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control compliance log retention windows and export a redacted JSON policy snapshot.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackupJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Config JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Audit Log Retention Period (days)
                </label>
                <input
                  type="number"
                  min={30}
                  max={3650}
                  value={form.auditLogRetentionDays}
                  onChange={(e) => setForm({ ...form, auditLogRetentionDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Automated Backup Frequency</label>
                <select
                  disabled={!form.autoBackupEnabled}
                  value={form.backupFrequency}
                  onChange={(e) => setForm({ ...form, backupFrequency: e.target.value as BackupFrequency })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Daily">Daily (02:00 UTC)</option>
                  <option value="Weekly">Weekly (Sunday 02:00 UTC)</option>
                  <option value="Monthly">Monthly (1st Day 02:00 UTC)</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
              <SettingToggle
                title="Enable Automated Encrypted Item Bank Backups"
                description="Archive blueprints, certified question items, and audit history on the selected schedule."
                checked={form.autoBackupEnabled}
                onChange={(next) => setForm({ ...form, autoBackupEnabled: next })}
              />
              <SettingToggle
                title="Enable Platform Maintenance Banner"
                description="Display a workspace-wide maintenance notice across all active user roles."
                checked={form.maintenanceMode}
                onChange={(next) => setForm({ ...form, maintenanceMode: next })}
              />
            </div>

            {form.maintenanceMode && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Maintenance Notice Message
                </label>
                <textarea
                  rows={2}
                  value={form.maintenanceBannerMessage}
                  onChange={(e) => setForm({ ...form, maintenanceBannerMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs } = useExamNova();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(
    (l) =>
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Audit Logs</h1>
          <p className="text-sm text-slate-500">Chronological trail of blueprint, authoring, review, and examination approvals.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter audit trail..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">{l.timestamp}</td>
                <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">{l.actorName}</td>
                <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{l.module}</td>
                <td className="py-3 px-4 font-medium text-blue-700 whitespace-nowrap">{l.action}</td>
                <td className="py-3 px-4 text-slate-800">{l.target}</td>
                <td className="py-3 px-4 text-slate-500">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const NotificationsView: React.FC = () => {
  const { notifications, currentRole, markNotificationRead, markAllNotificationsRead, setActiveModule } =
    useExamNova();

  const roleNotifs = notifications.filter(
    (n) => n.targetRole === currentRole || n.targetRole === 'all'
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications Center</h1>
          <p className="text-sm text-slate-500">Workflow alerts, returned items, and sign-off assignments for your active role.</p>
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
        >
          Mark All Read
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {roleNotifs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            No notifications for this role yet.
          </div>
        ) : (
          roleNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.read ? 'bg-white' : 'bg-blue-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{n.title}</span>
                  {!n.read && <span className="text-[11px] font-semibold text-blue-700">· Unread</span>}
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <div className="text-[11px] font-mono tabular-nums text-slate-400">{n.timestamp}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {n.moduleLink && (
                  <button
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setActiveModule(n.moduleLink!);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Open Module
                  </button>
                )}
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
