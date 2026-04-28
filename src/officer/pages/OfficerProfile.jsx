import { Shield, UserRound, Mail, Loader2, Lock, CheckCircle2, Phone, BriefcaseBusiness } from 'lucide-react';
import { useOfficerAuth } from '../context/OfficerAuthContext';

export default function OfficerProfile() {
  const { officer } = useOfficerAuth();

  if (!officer) {
    return (
      <div className="officer-empty-panel py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const infoRows = [
    { label: 'Name', value: officer.displayName ?? officer.name ?? '—' },
    { label: 'Email', value: officer.email ?? '—', icon: Mail },
    { label: 'Phone', value: officer.phoneNumber ?? '—', icon: Phone },
    { label: 'Designation', value: officer.designation ?? '—', icon: BriefcaseBusiness },
    { label: 'Role', value: officer.role ?? 'OFFICER' },
    { label: 'Department', value: officer.departmentName ?? '—' },
    { label: 'Officer ID', value: officer.officerId ? `#${officer.officerId}` : '—' },
  ];

  return (
    <div className="space-y-6 animate-fade-rise max-w-3xl">
      {/* Header card */}
      <div className="officer-surface-card px-6 py-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600/20 text-3xl font-bold text-indigo-300">
            {officer.initials ?? 'OF'}
          </div>
          <div>
            <p className="officer-kicker">Your profile</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-white">
              {officer.displayName ?? officer.name ?? 'Officer'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="officer-badge-pill">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                {officer.role ?? 'OFFICER'}
              </span>
              {officer.designation && (
                <span className="officer-badge-pill">{officer.designation}</span>
              )}
              {officer.departmentName && (
                <span className="officer-badge-pill">{officer.departmentName}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="officer-surface-card p-6">
        <div className="flex items-center gap-3">
          <div className="officer-icon-badge">
            <UserRound className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="officer-kicker">Account</p>
            <h3 className="officer-section-title mt-0.5">Officer Information</h3>
          </div>
        </div>

        <div className="mt-6 divide-y divide-white/6">
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-4">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                {row.icon ? <row.icon className="h-4 w-4" /> : null}
                {row.label}
              </span>
              <span className="text-sm font-semibold text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="officer-surface-card p-6">
        <div className="flex items-center gap-3">
          <div className="officer-icon-badge">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="officer-kicker">Security</p>
            <h3 className="officer-section-title mt-0.5">Password & Access</h3>
          </div>
        </div>
        <div className="officer-surface-card-muted mt-6 flex items-start gap-3 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-white">
              {officer.forcePasswordChange ? 'Password rotation required' : 'Session Active'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {officer.forcePasswordChange
                ? 'This account is marked for a required password change. Please contact your administrator to rotate credentials.'
                : 'You are securely authenticated as an officer.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
