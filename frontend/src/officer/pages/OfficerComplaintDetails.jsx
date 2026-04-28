import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Loader2, MapPinned, Clock3, UserRound, ImageIcon,
  MessageSquareText, SendHorizontal, RefreshCw, ChevronDown, CheckCircle2,
} from 'lucide-react';
import officerApi from '../services/officerApi';
import { getApiErrorMessage } from '../../utils/api';
import { formatGrievanceStatus, getGrievanceStatusClasses, normalizeGrievance } from '../../utils/grievances';

const ALLOWED_STATUS_TRANSITIONS = {
  SUBMITTED: ['ASSIGNED', 'IN_PROGRESS', 'ADDITIONAL_INFO_REQUESTED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'ADDITIONAL_INFO_REQUESTED', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'ADDITIONAL_INFO_REQUESTED', 'REJECTED'],
  ADDITIONAL_INFO_REQUESTED: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: [],
};

const ALL_STATUSES = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ADDITIONAL_INFO_REQUESTED', label: 'More Info Needed' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function OfficerComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Comments
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailRes, commentsRes] = await Promise.all([
        officerApi.get(`/grievances/${id}`),
        officerApi.get(`/grievances/${id}/comments`),
      ]);
      const normalized = normalizeGrievance(detailRes.data);
      setComplaint(normalized);
      setSelectedStatus(normalized.status || '');
      setComments(commentsRes.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load complaint details.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const refreshComments = async () => {
    try {
      const r = await officerApi.get(`/grievances/${id}/comments`);
      setComments(r.data);
    } catch (e) { console.error(e); }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === complaint.status) {
      toast.error('Please select a different status to update.');
      return;
    }
    setUpdatingStatus(true);
    try {
      // Post status change
      await officerApi.patch(`/grievances/${id}/status?status=${selectedStatus}`);
      // Optionally post remarks as a comment
      if (remarks.trim()) {
        await officerApi.post(`/grievances/${id}/comments`, { content: remarks.trim() });
        setRemarks('');
      }
      toast.success('Status updated successfully.');
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update status.'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await officerApi.post(`/grievances/${id}/comments`, { content: commentText.trim() });
      toast.success('Comment posted.');
      setCommentText('');
      refreshComments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to post comment.'));
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-indigo-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="officer-empty-panel">
        <p className="text-white">Complaint not found.</p>
        <Link to="/officer/complaints" className="officer-ghost-btn mt-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    );
  }

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[complaint.status] ?? [];
  const availableStatuses = ALL_STATUSES.filter((s) =>
    s.value === complaint.status || allowedNextStatuses.includes(s.value)
  );
  const canUpdate = allowedNextStatuses.length > 0;

  return (
    <div className="space-y-6 animate-fade-rise">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/officer/complaints" className="officer-ghost-btn">
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Link>
        <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${getGrievanceStatusClasses(complaint.status)}`}>
          {formatGrievanceStatus(complaint.status)}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        {/* ── Left column ── */}
        <div className="space-y-6">
          {/* Main detail card */}
          <div className="officer-surface-card p-6 sm:p-8">
            <p className="officer-kicker">Case #{complaint.grievanceId}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
              {complaint.categoryName || `Grievance #${complaint.grievanceId}`}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{complaint.description}</p>

            {/* Image */}
            {complaint.imageUrl && (
              <div className="mt-6">
                <p className="flex items-center gap-1.5 officer-kicker">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Attached Image
                </p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/8">
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint attachment"
                    className="max-h-72 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.parentElement.innerHTML =
                        '<p class="p-4 text-sm text-slate-400">Image could not be loaded.</p>';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Meta grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Clock3, label: 'Submitted', value: complaint.createdAt ? new Date(complaint.createdAt).toLocaleString('en-IN') : 'N/A' },
                { icon: MapPinned, label: 'Coordinates', value: complaint.latitude != null ? `${complaint.latitude}, ${complaint.longitude}` : 'Not provided' },
                { icon: UserRound, label: 'Citizen', value: complaint.citizenId ? `ID #${complaint.citizenId}` : 'Unknown' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="officer-surface-card-muted p-4">
                    <div className="officer-icon-badge h-9 w-9 rounded-xl">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Address */}
            {complaint.addressText && (
              <div className="officer-surface-card-muted mt-4 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Address / Landmark</p>
                <p className="mt-1 text-sm text-slate-300">{complaint.addressText}</p>
              </div>
            )}
          </div>

          {/* Comments section */}
          <div className="officer-surface-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="officer-icon-badge">
                  <MessageSquareText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="officer-kicker">Conversation</p>
                  <h3 className="officer-section-title mt-0.5">Comments & Updates</h3>
                </div>
              </div>
              <button onClick={refreshComments} className="officer-ghost-btn p-2" aria-label="Refresh comments">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Comment list */}
            <div className="mt-6 space-y-4">
              {comments.length === 0 ? (
                <div className="officer-empty-panel py-10">
                  <MessageSquareText className="h-8 w-8 text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500">No comments yet. Start the conversation.</p>
                </div>
              ) : comments.map((cmt) => (
                <div key={cmt.commentId} className="officer-surface-card-muted flex gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-sm font-bold text-indigo-300">
                    {cmt.senderName ? cmt.senderName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{cmt.senderName || 'Unknown'}</p>
                      <span className="text-xs text-slate-500">
                        {cmt.createdAt ? new Date(cmt.createdAt).toLocaleString('en-IN') : ''}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300 whitespace-pre-wrap">{cmt.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="mt-6 flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add an update or internal note…"
                className="officer-field-input flex-1"
              />
              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="officer-primary-btn shrink-0 px-5"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right column: Status update ── */}
        <div className="space-y-6">
          <div className="officer-surface-card p-6">
            <div className="flex items-center gap-3">
              <div className="officer-icon-badge">
                <RefreshCw className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="officer-kicker">Action Centre</p>
                <h3 className="officer-section-title mt-0.5">Update Status</h3>
              </div>
            </div>

            {!canUpdate ? (
              <div className="officer-surface-card-muted mt-6 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <p className="mt-2 text-sm font-medium text-white">Case is closed</p>
                <p className="mt-1 text-xs text-slate-400">
                  Status is <span className="text-white">{formatGrievanceStatus(complaint.status)}</span>. No further transitions available.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {/* Current status */}
                <div className="officer-surface-card-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current Status</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getGrievanceStatusClasses(complaint.status)}`}>
                    {formatGrievanceStatus(complaint.status)}
                  </span>
                </div>

                {/* New status picker */}
                <div>
                  <label className="officer-field-label">
                    <ChevronDown className="inline h-3.5 w-3.5" /> Change to
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="officer-field-input mt-2"
                  >
                    {availableStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="officer-field-label">Remarks (optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add a note explaining this status change…"
                    rows={4}
                    className="officer-field-input mt-2 resize-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">Remarks will be posted as a comment.</p>
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || selectedStatus === complaint.status}
                  className="officer-primary-btn w-full py-3"
                >
                  {updatingStatus ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
                  ) : (
                    <><RefreshCw className="h-4 w-4" /> Apply Status Change</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Officer info */}
          <div className="officer-surface-card p-6">
            <p className="officer-kicker">Assignment</p>
            <h3 className="officer-section-title mt-1">Officer Details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Officer ID</span>
                <span className="font-medium text-white">{complaint.officerId ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-white">{complaint.officerName ?? 'Not assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-white">{complaint.departmentName ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
