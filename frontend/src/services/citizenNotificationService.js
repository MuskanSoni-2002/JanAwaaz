import api from './api';

export const citizenNotificationService = {
  // Get all notifications for the current user
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}`, {
        isRead: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (notificationIds) => {
    try {
      const promises = notificationIds.map((id) => citizenNotificationService.markAsRead(id));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const notifications = await citizenNotificationService.getNotifications();
      return notifications.filter((n) => !n.isRead).length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },
};
