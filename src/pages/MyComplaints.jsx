import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import {
  formatGrievanceStatus,
  getGrievanceStatusClasses,
  GRIEVANCE_FILTER_OPTIONS,
  isActiveGrievance,
  normalizeGrievance,
} from '../utils/grievances';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/grievances/me');
        setComplaints(response.data.map(normalizeGrievance));
      } catch (error) {
        console.error('Failed to load complaints', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const query = deferredSearchTerm.toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch = complaint.categoryName?.toLowerCase().includes(query)
        || complaint.description?.toLowerCase().includes(query);
      const matchesStatus = filterStatus === 'ALL' || String(complaint.status).toUpperCase() === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, deferredSearchTerm, filterStatus]);

  const activeCount = useMemo(
    () => complaints.filter((complaint) => isActiveGrievance(complaint.status)).length,
    [complaints],
  );

  return (
    <div className="space-y-6">
      <section className="surface-card-strong animate-fade-rise px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-kicker">Complaint workspace</p>
            <h2 className="page-title mt-3">Every case, cleanly organized.</h2>
            <p className="page-copy mt-4 max-w-2xl">
              Filter by status, search by description, and jump straight into the complaints that need attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="surface-card-muted px-4 py-3">
              <p className="metric-caption">Total</p>
              <p className="display-heading mt-2 text-2xl font-bold tracking-[-0.04em]">{complaints.length}</p>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <p className="metric-caption">Active</p>
              <p className="display-heading mt-2 text-2xl font-bold tracking-[-0.04em]">{activeCount}</p>
            </div>
            <Link to="/complaints/new" className="primary-btn">
              Raise New Complaint
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="surface-card animate-fade-rise animate-fade-rise-delay-1 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="relative block">
            <span className="field-label">Search complaints</span>
            <Search className="pointer-events-none absolute left-4 top-[3.05rem] h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by category or description..."
              className="field-input pl-11"
            />
          </label>

          <label className="relative block">
            <span className="field-label">Filter by status</span>
            <Filter className="pointer-events-none absolute left-4 top-[3.05rem] h-4.5 w-4.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="field-select pl-11"
            >
              {GRIEVANCE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <div className="surface-card-muted flex w-full items-center justify-between px-4 py-3 lg:justify-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Results</span>
              <span className="display-heading text-lg font-semibold tracking-[-0.03em]">
                {filteredComplaints.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="surface-card flex items-center justify-center py-24 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="empty-panel animate-fade-rise animate-fade-rise-delay-2">
          <div className="icon-badge h-12 w-12 rounded-2xl">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No complaints match this view</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Try widening your search or switching to a different status to surface more cases.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredComplaints.map((complaint, index) => (
            <Link
              key={complaint.grievanceId}
              to={`/complaints/${complaint.grievanceId}`}
              className={`surface-card hover-lift animate-fade-rise p-5 sm:p-6 ${
                index === 0
                  ? 'animate-fade-rise-delay-1'
                  : index === 1
                    ? 'animate-fade-rise-delay-2'
                    : index === 2
                      ? 'animate-fade-rise-delay-3'
                      : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="page-kicker">Case #{complaint.grievanceId}</p>
                  <h3 className="mt-2 truncate text-lg font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                    {complaint.categoryName || `Grievance #${complaint.grievanceId}`}
                  </h3>
                </div>
                <ArrowUpRight className="mt-1 h-4.5 w-4.5 shrink-0 text-slate-400" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getGrievanceStatusClasses(complaint.status)}`}>
                  {formatGrievanceStatus(complaint.status)}
                </span>
                <span className="soft-pill">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {complaint.description}
              </p>

              <div className="mt-5 space-y-3 border-t pt-4 subtle-divider">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Assigned officer</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {complaint.officerName || 'Awaiting assignment'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    Follow-up
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {isActiveGrievance(complaint.status) ? 'Open' : 'Settled'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
