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

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-white shadow-lg border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 mt-1">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        {unreadCount > 0 && (
          <div className="px-5 py-3 border-b border-slate-200">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <p className="text-slate-600 font-medium">No notifications yet</p>
              <p className="text-sm text-slate-500 mt-1">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 break-all">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notificationId)}
                        disabled={markingId === notificationId}
                        className="mt-1 p-1 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
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

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 text-center">
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  );
}
