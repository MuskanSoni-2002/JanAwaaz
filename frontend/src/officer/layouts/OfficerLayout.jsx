import { useMemo, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  UserCircle2,
  LogOut,
  Shield,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useOfficerAuth } from '../context/OfficerAuthContext';

const navItems = [
  { name: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
  { name: 'Complaints', path: '/officer/complaints', icon: ClipboardList },
  { name: 'Profile', path: '/officer/profile', icon: UserCircle2 },
];

const pageMeta = {
  '/officer/dashboard': {
    title: 'Officer Dashboard',
    description: 'Monitor your assigned caseload and performance at a glance.',
  },
  '/officer/complaints': {
    title: 'Assigned Complaints',
    description: 'Review, filter, and act on grievances assigned to you.',
  },
  '/officer/profile': {
    title: 'My Profile',
    description: 'Manage your officer account details.',
  },
};

export default function OfficerLayout() {
  const { officer, logout } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/officer/login');
  };

  const isActive = (path) => {
    if (path === '/officer/complaints') {
      return location.pathname === path || /^\/officer\/complaints\//.test(location.pathname);
    }
    return location.pathname === path;
  };

  const meta = useMemo(() => {
    if (/^\/officer\/complaints\//.test(location.pathname)) {
      return { title: 'Complaint Details', description: 'Full grievance details, status control, and comments.' };
    }
    return pageMeta[location.pathname] ?? { title: 'Officer Portal', description: '' };
  }, [location.pathname]);

  const initials = useMemo(() => {
    if (!officer) return 'OF';
    return `${officer.firstName?.[0] ?? ''}${officer.lastName?.[0] ?? ''}`.toUpperCase() || 'OF';
  }, [officer]);

  const todayLabel = useMemo(() => new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date()), []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="officer-brand-card mx-3 mt-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span className="officer-wordmark text-base font-bold tracking-[-0.04em]">JanAwaaz</span>
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-indigo-400/80">
              Officer Portal
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.04em] text-white">
              Command Centre
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Resolve grievances, drive civic change.
            </p>
          </div>
          <div className="officer-icon-badge">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`officer-nav-item ${active ? 'officer-nav-item-active' : ''}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                active ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'
              }`}>
                <Icon size={17} />
              </span>
              <span className="flex-1">{item.name}</span>
              {active && <ChevronRight className="h-4 w-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User block */}
      <div className="mx-3 mb-3 mt-4 space-y-2 border-t border-white/8 pt-4">
        <div className="officer-user-card flex items-center gap-3 px-4 py-3">
          <div className="officer-avatar text-sm font-bold">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {officer ? `${officer.firstName ?? ''} ${officer.lastName ?? ''}`.trim() : 'Officer'}
            </p>
            <p className="truncate text-xs text-slate-400">{officer?.email ?? 'Officer portal'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="officer-logout-btn w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="officer-portal min-h-screen">
      {/* Desktop sidebar */}
      <aside className="officer-sidebar hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="officer-sidebar absolute inset-y-0 left-0 w-72">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-72">
        {/* Topbar */}
        <header className="officer-topbar sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              className="officer-icon-btn md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="officer-kicker">{todayLabel}</p>
              <h1 className="officer-topbar-title">{meta.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="officer-icon-btn" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="officer-avatar-sm hidden sm:flex">{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
