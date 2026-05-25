import axiosInstance from "../../../shared/api/axiosInstance";

export const getNotifications = (
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }
) => {
  return axiosInstance.get("/notifications", {
    params: {
      userId,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
      unreadOnly: options?.unreadOnly ?? false,
    },
    headers: { "x-user-id": userId },
  });
};

export const getUnreadCount = (userId: string) => {
  return axiosInstance.get("/notifications/unread-count", {
    params: { userId },
    headers: { "x-user-id": userId },
  });
};

export const markAllAsRead = (userId: string) => {
  return axiosInstance.patch("/notifications/read-all", { userId }, {
    headers: { "x-user-id": userId },
  });
};

export const markAsRead = (notificationId: string, userId: string) => {
  return axiosInstance.patch(`/notifications/${notificationId}/read`, { userId }, {
    headers: { "x-user-id": userId },
  });
};

export const deleteNotification = (notificationId: string, userId: string) => {
  return axiosInstance.delete(`/notifications/${notificationId}`, {
    params: { userId },
    headers: { "x-user-id": userId },
  });
};
