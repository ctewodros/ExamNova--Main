import React, { useState } from 'react';
import { Plus, Search, Check, X, Bell } from 'lucide-react';
import { useExamNova } from '../context/ExamNovaContext';
import { PlatformUser, RolePermissionMatrix, UserRole } from '../types/examnova';
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

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings } = useExamNova();
  const [form, setForm] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Settings & Governance Rules</h1>
        <p className="text-sm text-slate-500">Configure institution-wide examination standards and workflow enforcement.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Institution / Board Name</label>
            <input
              value={form.institutionName}
              onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Active Academic Cycle</label>
            <input
              value={form.academicCycle}
              onChange={(e) => setForm({ ...form, academicCycle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Minimum Rationale Length (chars)</label>
            <input
              type="number"
              value={form.minQuestionRationaleLength}
              onChange={(e) => setForm({ ...form, minQuestionRationaleLength: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Default Exam Duration (minutes)</label>
            <input
              type="number"
              value={form.defaultExamDurationMinutes}
              onChange={(e) => setForm({ ...form, defaultExamDurationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 space-y-3">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Require Dual Blueprint Sign-off</div>
              <div className="text-slate-500">Blueprints must pass both Reviewer and Approver before activation.</div>
            </div>
            <input
              type="checkbox"
              checked={form.requireBlueprintDualSignoff}
              onChange={(e) => setForm({ ...form, requireBlueprintDualSignoff: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600"
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Lock Submitted Question Packages</div>
              <div className="text-slate-500">Authors cannot modify submitted items unless explicitly returned by a Reviewer.</div>
            </div>
            <input
              type="checkbox"
              checked={form.lockSubmittedQuestions}
              onChange={(e) => setForm({ ...form, lockSubmittedQuestions: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600"
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Auto-Archive Superseded Blueprints</div>
              <div className="text-slate-500">Activating a new blueprint version automatically archives the prior active version.</div>
            </div>
            <input
              type="checkbox"
              checked={form.autoArchiveSupersededBlueprints}
              onChange={(e) => setForm({ ...form, autoArchiveSupersededBlueprints: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save System Settings
          </button>
        </div>
      </form>
    </div>
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
