import axiosInstance from "../../../shared/api/axiosInstance";
import type { ApiSendMessageInput } from "../../../shared/api/swaggerTypes";

export const createChatRoom = (postId: string) =>
  axiosInstance.post(`/chat/rooms`, {
    chatRoom: { postId },
  });

export const getUserChatRooms = (userId: string, limit = 20, offset = 0) =>
  axiosInstance.get(`/chat/rooms/user/${userId}`, {
    params: { limit, offset },
  });

export const getChatRoomByPostId = (postId: string) =>
  axiosInstance.get(`/chat/rooms/post/${postId}`);

export const getChatRoomById = (id: string) =>
  axiosInstance.get(`/chat/rooms/${id}`);

export const deleteChatRoom = (id: string) =>
  axiosInstance.delete(`/chat/rooms/${id}`);

export const sendMessage = (data: ApiSendMessageInput) =>
  axiosInstance.post(`/chat/messages`, {
    message: {
      chatRoomId: data.chatRoomId,
      senderId: data.senderId,
      content: data.content,
      messageType: data.messageType || "text",
    },
  });

export const getMessages = (chatRoomId: string, limit = 50, offset = 0) =>
  axiosInstance.get(`/chat/rooms/${chatRoomId}/messages`, {
    params: { limit, offset },
  });

export const markMessageAsRead = (messageId: string, userId: string) =>
  axiosInstance.patch(`/chat/messages/${messageId}/read`, { userId });

export const markAllMessagesAsRead = (chatRoomId: string, userId: string) =>
  axiosInstance.patch(`/chat/rooms/${chatRoomId}/read-all`, { userId });

export const getUnreadCount = (chatRoomId: string, userId: string) =>
  axiosInstance.get(`/chat/rooms/${chatRoomId}/unread-count`, {
    params: { userId },
  });

export const deleteMessage = (messageId: string) =>
  axiosInstance.delete(`/chat/messages/${messageId}`);
