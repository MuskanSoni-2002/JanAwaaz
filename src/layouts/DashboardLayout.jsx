import { useContext, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BellDot,
  FileStack,
  LayoutDashboard,
  LogOut,
  MoonStar,
  PlusCircle,
  Sparkles,
  SunMedium,
  UserCircle2,
} from 'lucide-react';
import { logout } from '../features/authSlice';
import { ThemeContext } from '../context/theme-context';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const themeContext = useContext(ThemeContext);
  const isDarkTheme = themeContext?.isDarkTheme ?? false;
  const toggleTheme = themeContext?.toggleTheme ?? (() => {});

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Complaints', path: '/complaints', icon: FileStack },
    { name: 'New Case', path: '/complaints/new', icon: PlusCircle },
    { name: 'Profile', path: '/profile', icon: UserCircle2 },
  ];

  const isNavItemActive = (path) => {
    if (path === '/complaints') {
      return location.pathname === '/complaints' || /^\/complaints\/[^/]+$/.test(location.pathname);
    }

    return location.pathname === path;
  };

  const pageMeta = useMemo(() => {
    if (location.pathname === '/complaints/new') {
      return {
        title: 'Raise Complaint',
        description: 'Submit a new issue with clean details and location context.',
      };
    }

    if (/^\/complaints\/[^/]+$/.test(location.pathname)) {
      return {
        title: 'Complaint Details',
        description: 'Review status, conversation history, and assignment updates.',
      };
    }

    if (location.pathname === '/complaints') {
      return {
        title: 'My Complaints',
        description: 'Search, filter, and follow every complaint in one place.',
      };
    }

    if (location.pathname === '/profile') {
      return {
        title: 'Profile',
        description: 'Keep your citizen details current and accurate.',
      };
    }

    return {
      title: 'Dashboard',
      description: 'Track case volume, updates, and response progress at a glance.',
    };
  }, [location.pathname]);

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date()),
    [],
  );

  const userInitials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) {
      return 'JA';
    }

    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  }, [user]);

  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1600px] gap-4 lg:gap-5">
        <aside className="hidden md:block md:w-[292px] lg:sticky lg:top-4 lg:self-start">
          <div className="nav-shell grid h-[calc(100vh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-4">
            <div className="surface-card-muted px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold tracking-[-0.04em] brand-wordmark">JanAwaaz</p>
                  <p className="mt-2 page-kicker">Citizen portal</p>
                  <h2 className="display-heading mt-2 text-2xl font-bold tracking-[-0.04em]">
                    Citizen Workspace
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    A calmer place to manage civic issues and follow progress.
                  </p>
                </div>
                <div className="icon-badge h-12 w-12 rounded-2xl">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <nav className="mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white/14 text-white' : 'bg-slate-900/[0.04] text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                      <Icon size={18} />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 space-y-3 border-t pt-4 subtle-divider">
              <div className="surface-card-muted flex items-center gap-3 px-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user ? `${user.firstName} ${user.lastName}` : 'Citizen user'}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || 'Citizen portal access'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="secondary-btn w-full justify-center text-rose-600 dark:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-3 z-20 mb-4">
            <div className="topbar-shell flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="page-kicker">{todayLabel}</p>
                <h1 className="display-heading mt-2 truncate text-[1.65rem] font-bold tracking-[-0.05em]">
                  {pageMeta.title}
                </h1>
                <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                  {pageMeta.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleTheme}
                  className="secondary-btn h-11 w-11 rounded-2xl px-0"
                  aria-label="Toggle theme"
                >
                  {isDarkTheme
                    ? <SunMedium className="h-4.5 w-4.5" />
                    : <MoonStar className="h-4.5 w-4.5" />}
                </button>
                <button className="secondary-btn h-11 w-11 rounded-2xl px-0" aria-label="Notifications">
                  <BellDot className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-24 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <div className="nav-shell px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/12 dark:bg-white dark:text-slate-950'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
