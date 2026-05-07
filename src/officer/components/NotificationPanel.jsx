import { useState } from 'react';
import { X, Check, CheckCheck, Loader } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const getNotificationId = (notification) => notification.notificationId ?? notification.id;

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [markingId, setMarkingId] = useState(null);

  const handleMarkAsRead = async (notificationId) => {
    setMarkingId(notificationId);
    await markAsRead(notificationId);
    setMarkingId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-slate-500">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 transition-colors hover:text-slate-700"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="border-b border-slate-200 px-5 py-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center px-4 text-center">
              <p className="font-medium text-slate-600">No notifications yet</p>
              <p className="mt-1 text-sm text-slate-500">
                You'll see updates about your grievances here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {notifications.map((notification) => {
                const notificationId = getNotificationId(notification);

                return (
                  <div
                    key={notificationId}
                    className={`px-5 py-4 transition-colors hover:bg-slate-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium text-slate-900">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notificationId)}
                          disabled={markingId === notificationId}
                          className="mt-1 p-1 text-slate-400 transition-colors hover:text-blue-600 disabled:opacity-50"
                          aria-label="Mark as read"
                        >
                          {markingId === notificationId ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-3 text-center text-xs text-slate-500">
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  );
}
