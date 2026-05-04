import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowRightLeft,
  Filter,
  Loader2,
  MapPinned,
  Send,
  ShieldCheck,
  UserCog2,
} from 'lucide-react';
import GrievanceOverviewMap from '../../components/maps/GrievanceOverviewMap';
import { getApiErrorMessage } from '../../utils/api';
import {
  formatGrievanceStatus,
  getGrievanceStatusClasses,
  isActiveGrievance,
} from '../../utils/grievances';
import adminApi from '../services/adminApi';

function buildAssignmentSelections(grievances, previousSelections = {}) {
  return grievances.reduce((accumulator, grievance) => {
    accumulator[grievance.grievanceId] =
      previousSelections[grievance.grievanceId]
      ?? (grievance.officerId ? String(grievance.officerId) : '');
    return accumulator;
  }, {});
}

export default function AdminGrievanceManagement() {
  const [grievances, setGrievances] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [assignmentSelections, setAssignmentSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [assigningGrievanceId, setAssigningGrievanceId] = useState(null);
  const initialFilterLoad = useRef(true);

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        const [grievanceResponse, officerResponse] = await Promise.all([
          adminApi.get('/admin/grievances'),
          adminApi.get('/admin/officers'),
        ]);

        if (ignore) {
          return;
        }

        const initialGrievances = grievanceResponse.data;
        setGrievances(initialGrievances);
        setOfficers(officerResponse.data);
        setAssignmentSelections(buildAssignmentSelections(initialGrievances));
        setAllAreas(
          [...new Set(
            initialGrievances
              .map((grievance) => grievance.addressText?.trim())
              .filter(Boolean)
          )].sort((left, right) => left.localeCompare(right))
        );
      } catch (error) {
        if (!ignore) {
          toast.error(getApiErrorMessage(error, 'Unable to load grievances.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (initialFilterLoad.current) {
      initialFilterLoad.current = false;
      return;
    }

    let ignore = false;

    const loadFilteredGrievances = async () => {
      setFilterLoading(true);
      try {
        const response = await adminApi.get('/admin/grievances', {
          params: selectedArea ? { area: selectedArea } : {},
        });

        if (ignore) {
          return;
        }

        setGrievances(response.data);
        setAssignmentSelections((current) => buildAssignmentSelections(response.data, current));
      } catch (error) {
        if (!ignore) {
          toast.error(getApiErrorMessage(error, 'Unable to refresh grievances for this area.'));
        }
      } finally {
        if (!ignore) {
          setFilterLoading(false);
        }
      }
    };

    loadFilteredGrievances();

    return () => {
      ignore = true;
    };
  }, [selectedArea]);

  const activeOfficers = useMemo(
    () => officers.filter((officer) => officer.active !== false),
    [officers]
  );

  const stats = useMemo(() => {
    const assigned = grievances.filter((grievance) => grievance.officerId).length;
    const unassigned = grievances.length - assigned;
    const active = grievances.filter((grievance) => isActiveGrievance(grievance.status)).length;
    return {
      total: grievances.length,
      assigned,
      unassigned,
      active,
    };
  }, [grievances]);

  const mappedGrievanceCount = useMemo(
    () => grievances.filter((grievance) => Number.isFinite(grievance.latitude) && Number.isFinite(grievance.longitude)).length,
    [grievances]
  );

  const handleAssign = async (grievanceId) => {
    const selectedOfficerId = assignmentSelections[grievanceId];
    if (!selectedOfficerId) {
      toast.error('Select an officer before assigning this grievance.');
      return;
    }

    setAssigningGrievanceId(grievanceId);
    try {
      const response = await adminApi.patch(`/admin/grievances/${grievanceId}/assignment`, {
        officerId: Number(selectedOfficerId),
      });

      setGrievances((current) =>
        current.map((grievance) =>
          grievance.grievanceId === grievanceId ? response.data : grievance
        )
      );
      setAssignmentSelections((current) => ({
        ...current,
        [grievanceId]: String(response.data.officerId ?? ''),
      }));
      toast.success(response.data.officerName ? `Assigned to ${response.data.officerName}.` : 'Grievance updated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update grievance assignment.'));
    } finally {
      setAssigningGrievanceId(null);
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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Grievances', value: stats.total, icon: ShieldCheck },
          { label: 'Active Cases', value: stats.active, icon: MapPinned },
          { label: 'Assigned', value: stats.assigned, icon: Send },
          { label: 'Awaiting Assignment', value: stats.unassigned, icon: ArrowRightLeft },
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0891b2)] text-white shadow-[0_18px_40px_-22px_rgba(8,145,178,0.7)]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="surface-card-strong p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-kicker">Area Filter</p>
            <h3 className="section-title mt-2">View grievances area-wise</h3>
            <p className="section-copy mt-2">
              Areas are derived from the grievance address text currently recorded in the system.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[240px]">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedArea}
                onChange={(event) => setSelectedArea(event.target.value)}
                className="field-select pl-11"
              >
                <option value="">All areas</option>
                {allAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div className="soft-pill">
              {filterLoading ? 'Refreshing...' : `${grievances.length} visible`}
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-kicker">Map View</p>
            <h3 className="section-title mt-2">Spatial view of visible grievances</h3>
            <p className="section-copy mt-2">
              This map stays synced with the current area filter so dispatch decisions are easier to make.
            </p>
          </div>
          <div className="soft-pill">
            {mappedGrievanceCount} mapped grievance{mappedGrievanceCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-6">
          <GrievanceOverviewMap grievances={grievances} />
        </div>
      </section>

      <section className="surface-card p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="page-kicker">Case Queue</p>
            <h3 className="section-title mt-2">Assign or reassign grievances</h3>
          </div>
          {filterLoading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-300" /> : null}
        </div>

        {grievances.length === 0 ? (
          <div className="empty-panel mt-6">
            <MapPinned className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No grievances in this view</h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try another area filter or wait for new grievances to enter the queue.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {grievances.map((grievance) => {
              const hasOfficer = Boolean(grievance.officerId);
              const assignmentLabel = hasOfficer ? 'Reassign' : 'Assign';

              return (
                <div
                  key={grievance.grievanceId}
                  className="surface-card-muted p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 xl:max-w-[56%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Grievance #{grievance.grievanceId}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getGrievanceStatusClasses(grievance.status)}`}>
                          {formatGrievanceStatus(grievance.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {grievance.categoryName ?? 'Uncategorized grievance'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {grievance.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="soft-pill">{grievance.addressText || 'Area not provided'}</span>
                        <span className="soft-pill">{grievance.departmentName || 'No department'}</span>
                        <span className="soft-pill">{grievance.citizenName || 'Citizen unavailable'}</span>
                      </div>
                    </div>

                    <div className="xl:min-w-[320px] xl:max-w-[340px]">
                      <div className="rounded-[26px] border border-slate-200/80 bg-white/76 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="icon-badge h-10 w-10 rounded-2xl">
                            <UserCog2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="page-kicker">Assignment</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                              {hasOfficer ? `Currently with ${grievance.officerName}` : 'Unassigned grievance'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <select
                            value={assignmentSelections[grievance.grievanceId] ?? ''}
                            onChange={(event) =>
                              setAssignmentSelections((current) => ({
                                ...current,
                                [grievance.grievanceId]: event.target.value,
                              }))
                            }
                            className="field-select"
                          >
                            <option value="">Select officer</option>
                            {activeOfficers.map((officer) => (
                              <option key={officer.officerId} value={officer.officerId}>
                                {officer.name} - {officer.departmentName || 'No department'}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={assigningGrievanceId === grievance.grievanceId}
                            onClick={() => handleAssign(grievance.grievanceId)}
                            className="primary-btn w-full"
                          >
                            {assigningGrievanceId === grievance.grievanceId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRightLeft className="h-4 w-4" />
                            )}
                            {assignmentLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
