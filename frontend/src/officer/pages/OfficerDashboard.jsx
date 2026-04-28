import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Clock4, Loader2,
  ArrowUpRight, TrendingUp, AlertCircle, BarChart3, Shield,
} from 'lucide-react';
import officerApi from '../services/officerApi';
import { useOfficerAuth } from '../context/OfficerAuthContext';
import { formatGrievanceStatus, getGrievanceStatusClasses, normalizeGrievance } from '../../utils/grievances';

const STATUS_ORDER = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ADDITIONAL_INFO_REQUESTED', 'RESOLVED', 'REJECTED'];

export default function OfficerDashboard() {
  const { officer } = useOfficerAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officerApi.get('/grievances/assigned')
      .then((r) => setComplaints(r.data.map(normalizeGrievance)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
    const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
    const rejected = complaints.filter((c) => c.status === 'REJECTED').length;
    const resolutionRate = total > 0 ? Math.round(((resolved + rejected) / total) * 100) : 0;
    return { total, pending, inProgress, resolved, rejected, resolutionRate };
  }, [complaints]);

  const recentComplaints = useMemo(() =>
    [...complaints]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [complaints]
  );

  const statusBreakdown = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => ({
      status: s,
      count: counts[s],
      pct: Math.round((counts[s] / complaints.length) * 100),
    }));
  }, [complaints]);

  const statCards = [
    {
      label: 'Total Assigned',
      value: stats.total,
      icon: ClipboardList,
      color: 'indigo',
      sub: 'All cases',
    },
    {
      label: 'Pending / New',
      value: stats.pending,
      icon: AlertCircle,
      color: 'amber',
      sub: 'Needs attention',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock4,
      color: 'sky',
      sub: 'Being handled',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'emerald',
      sub: `${stats.resolutionRate}% resolution rate`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-indigo-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-rise">
      {/* Welcome bar */}
      <div className="officer-surface-card flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="officer-icon-badge">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="officer-kicker">Welcome back</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-white">
              {officer ? `${officer.firstName ?? ''} ${officer.lastName ?? ''}`.trim() : 'Officer'}
            </h2>
          </div>
        </div>
        <Link to="/officer/complaints" className="officer-primary-btn px-5 py-2.5 text-sm">
          View All Complaints
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`officer-stat-card-main animate-fade-rise`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={`officer-stat-icon officer-stat-icon-${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white">{card.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-300">{card.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Recent complaints */}
        <div className="officer-surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="officer-icon-badge">
                <ClipboardList className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="officer-kicker">Latest</p>
                <h3 className="officer-section-title mt-0.5">Recent Complaints</h3>
              </div>
            </div>
            <Link to="/officer/complaints" className="officer-ghost-btn text-xs">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 divide-y divide-white/6">
            {recentComplaints.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No complaints assigned yet.</p>
            ) : recentComplaints.map((c) => (
              <Link
                key={c.grievanceId}
                to={`/officer/complaints/${c.grievanceId}`}
                className="officer-table-row group flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="officer-kicker">Case #{c.grievanceId}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {c.categoryName || `Grievance #${c.grievanceId}`}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getGrievanceStatusClasses(c.status)}`}>
                    {formatGrievanceStatus(c.status)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-indigo-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="officer-surface-card p-6">
          <div className="flex items-center gap-3">
            <div className="officer-icon-badge">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="officer-kicker">Breakdown</p>
              <h3 className="officer-section-title mt-0.5">Status Distribution</h3>
            </div>
          </div>

          {complaints.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">No data yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {statusBreakdown.map((row) => (
                <div key={row.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{formatGrievanceStatus(row.status)}</span>
                    <span className="font-semibold text-white">{row.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Resolution metric */}
              <div className="officer-surface-card-muted mt-6 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Resolution Rate
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">
                  {stats.resolutionRate}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {stats.resolved + stats.rejected} of {stats.total} cases closed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
