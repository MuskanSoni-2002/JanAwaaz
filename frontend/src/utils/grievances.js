const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  ADDITIONAL_INFO_REQUESTED: 'More Info Needed',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

export const GRIEVANCE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'SUBMITTED', label: STATUS_LABELS.SUBMITTED },
  { value: 'ASSIGNED', label: STATUS_LABELS.ASSIGNED },
  { value: 'IN_PROGRESS', label: STATUS_LABELS.IN_PROGRESS },
  { value: 'ADDITIONAL_INFO_REQUESTED', label: STATUS_LABELS.ADDITIONAL_INFO_REQUESTED },
  { value: 'RESOLVED', label: STATUS_LABELS.RESOLVED },
  { value: 'REJECTED', label: STATUS_LABELS.REJECTED },
];

const ACTIVE_STATUSES = new Set(['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ADDITIONAL_INFO_REQUESTED']);

export function normalizeGrievance(grievance) {
  if (!grievance) {
    return null;
  }

  return {
    ...grievance,
    grievanceId: grievance.grievanceId ?? grievance.id ?? null,
    categoryId: grievance.categoryId ?? grievance.category?.categoryId ?? null,
    categoryName: grievance.categoryName ?? grievance.category?.categoryName ?? null,
    officerId: grievance.officerId ?? grievance.officer?.officerId ?? null,
    officerName: grievance.officerName ?? grievance.officer?.name ?? null,
    citizenId: grievance.citizenId ?? grievance.citizen?.citizenId ?? null,
  };
}

export function formatGrievanceStatus(status) {
  const normalizedStatus = String(status ?? '').toUpperCase();
  return STATUS_LABELS[normalizedStatus] ?? 'Unknown';
}

export function getGrievanceStatusClasses(status) {
  switch (String(status ?? '').toUpperCase()) {
    case 'RESOLVED':
      return 'border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/18 dark:bg-emerald-500/12 dark:text-emerald-300';
    case 'REJECTED':
      return 'border border-rose-500/15 bg-rose-500/10 text-rose-700 dark:border-rose-500/18 dark:bg-rose-500/12 dark:text-rose-300';
    case 'ADDITIONAL_INFO_REQUESTED':
      return 'border border-orange-500/15 bg-orange-500/10 text-orange-700 dark:border-orange-500/18 dark:bg-orange-500/12 dark:text-orange-300';
    case 'ASSIGNED':
    case 'IN_PROGRESS':
      return 'border border-sky-500/15 bg-sky-500/10 text-sky-700 dark:border-sky-500/18 dark:bg-sky-500/12 dark:text-sky-300';
    case 'SUBMITTED':
    default:
      return 'border border-slate-300/70 bg-slate-900/[0.04] text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300';
  }
}

export function isActiveGrievance(status) {
  return ACTIVE_STATUSES.has(String(status ?? '').toUpperCase());
}
