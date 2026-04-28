import { useEffect, useState, useMemo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, ArrowUpRight, Loader2,
  ClipboardList, CalendarDays, Tag,
} from 'lucide-react';
import officerApi from '../services/officerApi';
import {
  formatGrievanceStatus, getGrievanceStatusClasses,
  GRIEVANCE_FILTER_OPTIONS, normalizeGrievance,
} from '../../utils/grievances';

export default function OfficerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    officerApi.get('/grievances/assigned')
      .then((r) => setComplaints(r.data.map(normalizeGrievance)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(complaints.map((c) => c.categoryName).filter(Boolean))];
    return cats.sort();
  }, [complaints]);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    return complaints.filter((c) => {
      const matchSearch =
        String(c.grievanceId).includes(q) ||
        (c.categoryName?.toLowerCase().includes(q)) ||
        (c.description?.toLowerCase().includes(q));
      const matchStatus = filterStatus === 'ALL' || c.status?.toUpperCase() === filterStatus;
      const matchCat = filterCategory === 'ALL' || c.categoryName === filterCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [complaints, deferredSearch, filterStatus, filterCategory]);

  return (
    <div className="space-y-6 animate-fade-rise">
      {/* Header */}
      <div className="officer-surface-card flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="officer-icon-badge">
            <ClipboardList className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="officer-kicker">Grievance workbench</p>
            <h2 className="officer-section-title mt-0.5">Assigned Complaints</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="officer-badge-pill">
            {filtered.length} of {complaints.length} shown
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="officer-surface-card px-6 py-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px_200px]">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, category or keyword…"
              className="officer-field-input pl-11"
            />
          </div>
          {/* Status filter */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="officer-field-input pl-11"
            >
              {GRIEVANCE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {/* Category filter */}
          <div className="relative">
            <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="officer-field-input pl-11"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="officer-surface-card flex items-center justify-center py-24 text-indigo-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="officer-empty-panel">
          <div className="officer-icon-badge h-14 w-14">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No complaints match this view</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Try adjusting your search term or clearing the filters.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="officer-surface-card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="officer-th px-6 py-4 text-left">Case ID</th>
                  <th className="officer-th px-4 py-4 text-left">Category</th>
                  <th className="officer-th px-4 py-4 text-left">Status</th>
                  <th className="officer-th px-4 py-4 text-left">Submitted</th>
                  <th className="officer-th px-4 py-4 text-left">Citizen</th>
                  <th className="officer-th px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((c) => (
                  <tr key={c.grievanceId} className="officer-table-row group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-indigo-400">
                        #{c.grievanceId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-white">
                        {c.categoryName || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getGrievanceStatusClasses(c.status)}`}>
                        {formatGrievanceStatus(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {c.citizenId ? `Citizen #${c.citizenId}` : '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/officer/complaints/${c.grievanceId}`}
                        className="officer-ghost-btn inline-flex px-3 py-2 text-xs"
                      >
                        Open <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {filtered.map((c) => (
              <Link
                key={c.grievanceId}
                to={`/officer/complaints/${c.grievanceId}`}
                className="officer-surface-card hover-lift block p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="officer-kicker">Case #{c.grievanceId}</p>
                    <p className="mt-1 font-semibold text-white">
                      {c.categoryName || `Grievance #${c.grievanceId}`}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getGrievanceStatusClasses(c.status)}`}>
                    {formatGrievanceStatus(c.status)}
                  </span>
                  <span className="officer-kicker flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-400">{c.description}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
