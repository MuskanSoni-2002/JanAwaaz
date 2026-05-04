import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Loader2,
  Mail,
  Phone,
  Power,
  ShieldCheck,
  UserPlus2,
  Users2,
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { getApiErrorMessage } from '../../utils/api';

const INITIAL_FORM = {
  name: '',
  email: '',
  phoneNumber: '',
  designation: '',
  departmentId: '',
  password: '',
};

export default function AdminOfficerManagement() {
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivatingOfficerId, setDeactivatingOfficerId] = useState(null);
  const [formError, setFormError] = useState('');
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const [officerResponse, departmentResponse] = await Promise.all([
          adminApi.get('/admin/officers'),
          adminApi.get('/departments'),
        ]);

        if (ignore) {
          return;
        }

        setOfficers(officerResponse.data);
        setDepartments(departmentResponse.data);
      } catch (error) {
        if (!ignore) {
          toast.error(getApiErrorMessage(error, 'Unable to load officer management data.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const active = officers.filter((officer) => officer.active !== false).length;
    const inactive = officers.length - active;
    return {
      total: officers.length,
      active,
      inactive,
    };
  }, [officers]);

  const updateFormField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        departmentId: Number(form.departmentId),
        active: true,
      };

      const response = await adminApi.post('/admin/officers', payload);
      setOfficers((current) => [response.data, ...current]);
      setLastCreatedCredentials({
        officerName: response.data.name,
        email: form.email,
        password: form.password,
      });
      setForm(INITIAL_FORM);
      toast.success('Officer registered successfully.');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to register the officer.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (officerId) => {
    setDeactivatingOfficerId(officerId);
    try {
      await adminApi.patch(`/admin/officers/${officerId}/deactivate`);
      setOfficers((current) =>
        current.map((officer) =>
          officer.officerId === officerId ? { ...officer, active: false } : officer
        )
      );
      toast.success('Officer deactivated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to deactivate this officer.'));
    } finally {
      setDeactivatingOfficerId(null);
    }
  };

  if (loading) {
    return (
      <div className="surface-card flex items-center justify-center px-6 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Officers', value: stats.total, icon: Users2 },
          { label: 'Active Accounts', value: stats.active, icon: ShieldCheck },
          { label: 'Inactive Accounts', value: stats.inactive, icon: Power },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="surface-card p-5 sm:p-6"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="metric-caption">{card.label}</p>
                  <p className="metric-value mt-3">{card.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#065f46,#0f766e)] text-white shadow-[0_18px_40px_-22px_rgba(15,118,110,0.7)]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {lastCreatedCredentials ? (
        <section className="surface-card-muted border border-emerald-500/18 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="icon-badge h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {lastCreatedCredentials.officerName} is ready to onboard.
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Default login: <span className="font-medium text-slate-700 dark:text-slate-200">{lastCreatedCredentials.email}</span>
                {' '}with password{' '}
                <span className="font-medium text-slate-700 dark:text-slate-200">{lastCreatedCredentials.password}</span>.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="surface-card-strong p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="icon-badge">
              <UserPlus2 className="h-5 w-5" />
            </div>
            <div>
              <p className="page-kicker">Register Officer</p>
              <h3 className="section-title mt-2">Create a new officer account</h3>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="field-label">Officer name</span>
              <input
                value={form.name}
                onChange={updateFormField('name')}
                className="field-input"
                placeholder="Enter full name"
                required
              />
            </label>

            <label className="block">
              <span className="field-label">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={updateFormField('email')}
                  className="field-input pl-11"
                  placeholder="officer@department.gov.in"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="field-label">Phone number</span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.phoneNumber}
                  onChange={updateFormField('phoneNumber')}
                  className="field-input pl-11"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="field-label">Designation</span>
              <input
                value={form.designation}
                onChange={updateFormField('designation')}
                className="field-input"
                placeholder="Sanitation Officer"
                required
              />
            </label>

            <label className="block">
              <span className="field-label">Department</span>
              <select
                value={form.departmentId}
                onChange={updateFormField('departmentId')}
                className="field-select"
                required
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="field-label">Default password</span>
              <input
                type="password"
                value={form.password}
                onChange={updateFormField('password')}
                className="field-input"
                placeholder="Set a default password"
                required
              />
            </label>

            {formError ? <p className="text-sm text-rose-500">{formError}</p> : null}

            <button type="submit" disabled={submitting} className="primary-btn w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register officer'}
            </button>
          </form>
        </div>

        <div className="surface-card p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="page-kicker">Officer Directory</p>
              <h3 className="section-title mt-2">Current officer accounts</h3>
            </div>
            <div className="soft-pill">
              {stats.active} active
            </div>
          </div>

          {officers.length === 0 ? (
            <div className="empty-panel mt-6">
              <Users2 className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
              <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No officers yet</h4>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Register the first officer from the panel on the left to start building the response team.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {officers.map((officer) => (
                <div
                  key={officer.officerId}
                  className="surface-card-muted flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{officer.name}</p>
                      <span className={[
                        'rounded-full px-2.5 py-1 text-[11px] font-medium',
                        officer.active === false
                          ? 'border border-rose-500/15 bg-rose-500/10 text-rose-700 dark:border-rose-500/18 dark:bg-rose-500/12 dark:text-rose-300'
                          : 'border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/18 dark:bg-emerald-500/12 dark:text-emerald-300',
                      ].join(' ')}>
                        {officer.active === false ? 'Inactive' : 'Active'}
                      </span>
                      {officer.forcePasswordChange ? (
                        <span className="rounded-full border border-amber-500/15 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:border-amber-500/18 dark:bg-amber-500/12 dark:text-amber-300">
                          Password reset pending
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{officer.designation}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="soft-pill">{officer.email}</span>
                      <span className="soft-pill">{officer.phoneNumber}</span>
                      <span className="soft-pill">{officer.departmentName ?? 'No department'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={officer.active === false || deactivatingOfficerId === officer.officerId}
                      onClick={() => handleDeactivate(officer.officerId)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/18 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 dark:border-rose-500/18 dark:bg-rose-500/12 dark:text-rose-300"
                    >
                      {deactivatingOfficerId === officer.officerId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                      {officer.active === false ? 'Deactivated' : 'Deactivate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
