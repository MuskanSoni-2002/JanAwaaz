import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock3,
  ImageIcon,
  Loader2,
  MessageSquareText,
  SendHorizontal,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LocationMap from '../components/maps/LocationMap';
import api from '../services/api';
import { getApiAssetUrl, getApiErrorMessage } from '../utils/api';
import {
  formatGrievanceStatus,
  getGrievanceStatusClasses,
  normalizeGrievance,
} from '../utils/grievances';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    const fetchComplaintData = async () => {
      try {
        setLoading(true);
        const [detailsResponse, commentsResponse] = await Promise.all([
          api.get(`/grievances/${id}`),
          api.get(`/grievances/${id}/comments`),
        ]);

        setComplaint(normalizeGrievance(detailsResponse.data));
        setComments(commentsResponse.data);
      } catch (error) {
        console.error(error);
        toast.error(getApiErrorMessage(error, 'Failed to load complaint details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintData();
  }, [id]);

  const refreshComments = async () => {
    try {
      const response = await api.get(`/grievances/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) {
      return;
    }

    setCommenting(true);
    try {
      await api.post(`/grievances/${id}/comments`, {
        content: commentText,
      });
      toast.success('Comment added');
      setCommentText('');
      refreshComments();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to post comment.'));
      console.error(error);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-24 text-primary"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!complaint) {
    return <div className="empty-panel">Complaint not found.</div>;
  }

  const canComment = Boolean(complaint.officerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/complaints" className="secondary-btn px-4 py-2.5">
          <ArrowLeft className="h-4 w-4" />
          Back to complaints
        </Link>
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${getGrievanceStatusClasses(complaint.status)}`}>
          {formatGrievanceStatus(complaint.status)}
        </span>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
        <div className="surface-card-strong animate-fade-rise p-6 sm:p-8">
          <p className="page-kicker">Case #{complaint.grievanceId}</p>
          <h2 className="display-heading mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.06em]">
            {complaint.categoryName || `Grievance #${complaint.grievanceId}`}
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            {complaint.description}
          </p>

          {complaint.imageUrl && (
            <div className="mt-6">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Attached image
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <img
                  src={getApiAssetUrl(complaint.imageUrl)}
                  alt="Complaint attachment"
                  className="max-h-80 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.parentElement.innerHTML =
                      '<p class="p-4 text-sm text-slate-400">Image could not be loaded.</p>';
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="surface-card-muted p-4">
              <div className="icon-badge h-10 w-10 rounded-2xl">
                <Clock3 className="h-4.5 w-4.5" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Submitted</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div className="surface-card-muted p-4">
              <div className="icon-badge h-10 w-10 rounded-2xl">
                <UserRoundCheck className="h-4.5 w-4.5" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Assigned officer</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {complaint.officerName || 'Awaiting assignment'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card animate-fade-rise animate-fade-rise-delay-1 p-6">
            <p className="page-kicker">Location</p>
            <h3 className="section-title mt-2">Mapped grievance spot</h3>
            <div className="mt-4">
              <LocationMap
                latitude={complaint.latitude}
                longitude={complaint.longitude}
                title={`Grievance #${complaint.grievanceId}`}
                description={complaint.addressText}
                heightClassName="h-[280px]"
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {complaint.addressText || 'No additional address or landmark was attached to this complaint.'}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              {Number.isFinite(complaint.latitude) && Number.isFinite(complaint.longitude)
                ? `${complaint.latitude.toFixed(6)}, ${complaint.longitude.toFixed(6)}`
                : 'Coordinates unavailable'}
            </p>
          </div>

          <div className="surface-card p-6">
            <p className="page-kicker">Conversation access</p>
            <h3 className="section-title mt-2">Comments and follow-up</h3>
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {canComment
                ? 'This complaint has been assigned, so comments are open for follow-up.'
                : 'Comments will open automatically once the complaint is assigned to an officer.'}
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-[24px] bg-slate-950 px-4 py-4 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                {canComment ? 'Conversation enabled' : 'Assignment pending'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card animate-fade-rise animate-fade-rise-delay-2 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">Updates and comments</p>
            <h3 className="section-title mt-2">Conversation timeline</h3>
          </div>
          <div className="soft-pill">
            <MessageSquareText className="h-3.5 w-3.5" />
            {comments.length} message{comments.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {comments.length > 0 ? comments.map((comment) => (
            <div key={comment.commentId} className="surface-card-muted flex gap-4 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
                {comment.senderName ? comment.senderName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {comment.senderName || 'Unknown User'}
                  </p>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          )) : (
            <div className="empty-panel">
              <div className="icon-badge h-12 w-12 rounded-2xl">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No comments yet</h4>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Once conversation starts, every update and reply will appear here in order.
              </p>
            </div>
          )}
        </div>

        {!canComment && (
          <p className="mt-6 text-sm text-amber-600 dark:text-amber-400">
            Comments open once this complaint is assigned to an officer.
          </p>
        )}

        <form onSubmit={handleAddComment} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add a comment or reply..."
            disabled={!canComment}
            className="field-input flex-1"
          />
          <button
            type="submit"
            disabled={!canComment || commenting || !commentText.trim()}
            className="primary-btn sm:px-5"
          >
            {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <SendHorizontal className="h-4 w-4" />
                Post comment
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ComplaintDetails;
