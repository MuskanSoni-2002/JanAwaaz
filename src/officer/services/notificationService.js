import officerApi from './officerApi';

export const notificationService = {
  getNotifications: async () => {
    const response = await officerApi.get('/notifications/me');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await officerApi.patch(`/notifications/${notificationId}`, {
      isRead: true,
    });
    return response.data;
  },

  markAllAsRead: async (notificationIds) => {
    const promises = notificationIds.map((id) => notificationService.markAsRead(id));
    return Promise.all(promises);
  },

  getUnreadCount: async () => {
    const notifications = await notificationService.getNotifications();
    return notifications.filter((n) => !n.isRead).length;
  },
};
