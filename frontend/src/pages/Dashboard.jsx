import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../features/authSlice';
import api from '../services/api';
import {
  formatGrievanceStatus,
  getGrievanceStatusClasses,
  isActiveGrievance,
  normalizeGrievance,
} from '../utils/grievances';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await api.get('/citizens/me');
        dispatch(setUser(profileRes.data));

        try {
          const grievanceRes = await api.get('/grievances/me');
          const data = grievanceRes.data.map(normalizeGrievance);
          setRecent(data.slice(0, 5));
          setStats({
            total: data.length,
            active: data.filter((grievance) => isActiveGrievance(grievance.status)).length,
            resolved: data.filter((grievance) => String(grievance.status).toUpperCase() === 'RESOLVED').length,
          });
        } catch {
          // Keep the dashboard usable even if grievance stats fail to load.
        }
      } catch (error) {
        console.error('Dashboard fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const resolutionRate = useMemo(
    () => (stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0),
    [stats.resolved, stats.total],
  );

  const latestComplaint = recent[0];

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      icon: FileText,
      detail: 'All complaints filed in your account',
      tone: 'from-slate-950 to-slate-700',
      delayClass: 'animate-fade-rise-delay-1',
    },
    {
      title: 'Active Cases',
      value: stats.active,
      icon: Clock3,
      detail: 'Cases currently being reviewed or worked',
      tone: 'from-amber-500 to-orange-500',
      delayClass: 'animate-fade-rise-delay-2',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      detail: 'Complaints already closed out successfully',
      tone: 'from-emerald-500 to-teal-500',
      delayClass: 'animate-fade-rise-delay-3',
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate}%`,
      icon: Activity,
      detail: 'A quick read on completion progress',
      tone: 'from-primary to-sky-500',
      delayClass: 'animate-fade-rise-delay-3',
    },
  ];

  if (loading) {
    return <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="surface-card-strong animate-fade-rise relative overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/12 blur-3xl dark:bg-primary/16" />
        <div className="absolute bottom-0 right-16 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <div>
            <div className="soft-pill w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Operational overview
            </div>
            <h2 className="display-heading mt-5 text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.06em]">
              {user ? `Good to see you, ${user.firstName}.` : 'Your civic dashboard, refined.'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
              Keep every complaint in one elegant workspace, follow status changes without noise,
              and move faster from submission to resolution.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/complaints/new" className="primary-btn">
                Raise Complaint
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/complaints" className="secondary-btn">
                View All Cases
              </Link>
            </div>
          </div>

          <div className="surface-card-muted flex flex-col justify-between gap-5 p-5 sm:p-6">
            <div>
              <p className="page-kicker">Latest movement</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="section-title">
                    {latestComplaint ? latestComplaint.categoryName || `Grievance #${latestComplaint.grievanceId}` : 'No recent complaint yet'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {latestComplaint
                      ? latestComplaint.description
                      : 'Your most recent complaint activity will appear here as soon as you file a case.'}
                  </p>
                </div>
                <div className="icon-badge hidden sm:flex">
                  <CircleDashed className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getGrievanceStatusClasses(latestComplaint?.status)}`}>
                  {formatGrievanceStatus(latestComplaint?.status)}
                </span>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Resolution progress</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{resolutionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary via-sky-500 to-cyan-400"
                    style={{ width: `${Math.max(resolutionRate, stats.total > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className={`surface-card hover-lift animate-fade-rise ${stat.delayClass} p-5 sm:p-6`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="metric-caption">{stat.title}</p>
                  <p className="metric-value mt-3">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.tone} text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="surface-card animate-fade-rise animate-fade-rise-delay-2 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="page-kicker">Recent activity</p>
              <h3 className="section-title mt-2">Latest complaint updates</h3>
            </div>
            <Link to="/complaints" className="ghost-btn">
              Open list
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty-panel mt-6">
              <div className="icon-badge h-12 w-12 rounded-2xl">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No complaints yet</h4>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Start with a new complaint and the dashboard will immediately begin tracking progress here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {recent.map((grievance) => (
                <Link
                  key={grievance.grievanceId}
                  to={`/complaints/${grievance.grievanceId}`}
                  className="surface-card-muted hover-lift flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="icon-badge h-12 w-12 rounded-2xl shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {grievance.categoryName || `Grievance #${grievance.grievanceId}`}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getGrievanceStatusClasses(grievance.status)}`}>
                          {formatGrievanceStatus(grievance.status)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {grievance.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {grievance.createdAt ? new Date(grievance.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="surface-card animate-fade-rise animate-fade-rise-delay-3 p-6">
            <p className="page-kicker">Performance snapshot</p>
            <h3 className="section-title mt-2">Case health</h3>
            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Resolved</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats.resolved}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/70 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.max(resolutionRate, stats.resolved > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Active workload</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats.active}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/70 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                    style={{ width: `${stats.total > 0 ? Math.max(Math.round((stats.active / stats.total) * 100), 8) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="page-kicker">Next best action</p>
            <h3 className="section-title mt-2">Keep complaints moving</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <li className="surface-card-muted flex items-start gap-3 p-4">
                <span className="soft-pill shrink-0">1</span>
                Add precise address details when filing a new complaint.
              </li>
              <li className="surface-card-muted flex items-start gap-3 p-4">
                <span className="soft-pill shrink-0">2</span>
                Revisit active cases and reply once comments become available.
              </li>
              <li className="surface-card-muted flex items-start gap-3 p-4">
                <span className="soft-pill shrink-0">3</span>
                Keep your profile updated so authorities can contact you quickly.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
