/* eslint-disable react-hooks/static-components */
import { useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  PanelTop,
  ShieldCheck,
  Users2,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const navItems = [
  { name: 'Officer Management', path: '/admin/officers', icon: Users2 },
  { name: 'Grievance Management', path: '/admin/grievances', icon: ClipboardList },
];

const pageMeta = {
  '/admin/officers': {
    title: 'Officer Management',
    description: 'Register officers, monitor account status, and deactivate access when needed.',
  },
  '/admin/grievances': {
    title: 'Grievance Management',
    description: 'View area-wise grievances and manage assignment or reassignment in one place.',
  },
};

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = pageMeta[location.pathname] ?? {
    title: 'Admin Console',
    description: 'Administrative controls for the JanAwaaz grievance system.',
  };

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
    []
  );

  const initials = admin?.initials ?? 'AD';
  const displayName = admin?.displayName ?? admin?.name ?? 'Administrator';

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="mx-3 mt-3 rounded-[30px] border border-emerald-500/18 bg-[linear-gradient(180deg,rgba(8,47,73,0.96),rgba(4,22,34,0.98))] p-5 text-white shadow-[0_28px_80px_-42px_rgba(6,78,59,0.7)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.05em]">Control Tower</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Manage officers and keep grievance ownership moving without friction.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-emerald-200">
            <Building2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-2 overflow-y-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={[
                'group flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[linear-gradient(135deg,rgba(6,78,59,0.96),rgba(8,145,178,0.92))] text-white shadow-[0_16px_36px_-22px_rgba(14,116,144,0.68)]'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
              ].join(' ')}
            >
              <span className={[
                'flex h-10 w-10 items-center justify-center rounded-2xl transition-colors',
                active ? 'bg-white/14 text-white' : 'bg-slate-900/[0.04] text-slate-500 group-hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:group-hover:text-white',
              ].join(' ')}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 mt-5 rounded-[26px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_22px_54px_-34px_rgba(15,23,42,0.32)] backdrop-blur dark:border-white/8 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#065f46,#0f766e)] text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{admin?.email ?? 'Admin session'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_32%)]">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-80 md:flex-col">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/68 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="absolute inset-y-0 left-0 w-80 bg-transparent">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="md:ml-80">
        <header className="sticky top-0 z-30 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
          <div className="surface-card flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="page-kicker">{todayLabel}</p>
                <h1 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-900 dark:text-white">
                  {meta.title}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  {meta.description}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-500/18 dark:bg-emerald-500/12 dark:text-emerald-300">
                Live admin session
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#065f46,#0f766e)] text-sm font-bold text-white">
                {initials}
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 sm:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="mb-6 surface-card-strong overflow-hidden px-6 py-6 sm:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_280px]">
              <div>
                <div className="soft-pill w-fit">
                  <PanelTop className="h-3.5 w-3.5" />
                  Administrative workflow
                </div>
                <h2 className="mt-4 text-[clamp(1.9rem,3.2vw,3.1rem)] font-bold tracking-[-0.06em] text-slate-900 dark:text-white">
                  Keep grievance operations disciplined and visible.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                  Register field officers, control access, and shift case ownership quickly whenever
                  work needs to move across teams or areas.
                </p>
              </div>

              <div className="surface-card-muted flex flex-col justify-between p-5">
                <div>
                  <p className="page-kicker">Session owner</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{displayName}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{admin?.email}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-slate-500 dark:text-slate-400">Role</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{admin?.role ?? 'ADMIN'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-slate-500 dark:text-slate-400">Status</p>
                    <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                      {admin?.active === false ? 'Inactive' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
