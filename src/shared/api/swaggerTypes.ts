export type ApiPostStatus = "open" | "closed" | "in_progress" | "completed" | "cancelled";

export type ApiPostCategory =
  | "food"
  | "daily"
  | "beauty"
  | "electronics"
  | "school"
  | "freemarket";

export type ApiPostSort = "latest" | "deadline" | "popular";
export type ApiMessageType = "text" | "image" | "file";

export type ApiNotificationType =
  | "new_participant"
  | "participant_cancel"
  | "deadline_soon"
  | "post_completed"
  | "post_cancelled"
  | "favorite_deadline"
  | "favorite_completed";

export type ApiTrustEventType =
  | "post_completed_author"
  | "post_completed_participant"
  | "post_cancelled_by_author"
  | "post_deleted_by_author"
  | "participant_cancelled"
  | "participant_no_show"
  | "agreement_confirmed"
  | "manual_adjustment";

export interface ApiUser {
  id: string;
  email: string;
  nickname: string;
  studentId: string;
  department?: string | null;
  avatarUrl?: string | null;
  trustScore: number;
  trustGrade: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiTrustEvent {
  id: string;
  userId: string;
  postId?: string | null;
  actorUserId?: string | null;
  type: ApiTrustEventType;
  scoreChange: number;
  previousScore: number;
  nextScore: number;
  previousGrade: number;
  nextGrade: number;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  price: number;
  minParticipants: number;
  currentQuantity?: number;
  status?: ApiPostStatus;
  deadline: string;
  pickupLocation?: string | null;
  category?: ApiPostCategory | null;
  images?: string[];
  favoriteCount?: number;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiFavorite {
  id: string;
  userId: string;
  postId: string;
  post?: ApiPost;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiNotification {
  id: string;
  userId: string;
  type: ApiNotificationType;
  title: string;
  message: string;
  postId?: string | null;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiChatRoom {
  id: string;
  postId: string;
  post?: {
    id?: string;
    title?: string;
    authorId?: string;
    images?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: ApiMessageType;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiGetPostsParams {
  limit?: number;
  offset?: number;
  category?: ApiPostCategory | "all" | string;
  sort?: ApiPostSort;
  status?: ApiPostStatus;
  keyword?: string;
  q?: string;
  userId?: string | null;
}

export interface ApiCreatePostInput {
  authorId: string;
  title: string;
  content: string;
  price: number;
  minParticipants: number;
  deadline: string;
  pickupLocation: string;
  category?: ApiPostCategory | string | null;
  images?: string[];
}

export interface ApiUpdatePostInput {
  title?: string;
  content?: string;
  price?: number;
  minParticipants?: number;
  status?: ApiPostStatus;
  deadline?: string;
  pickupLocation?: string;
  category?: ApiPostCategory | string | null;
  images?: string[];
}

export interface ApiRegisterUserInput {
  email: string;
  passwordHash: string;
  nickname: string;
  studentId: string;
  department?: string;
  avatarUrl?: string;
}

export interface ApiUpdateUserInput {
  email?: string;
  passwordHash?: string;
  nickname?: string;
  studentId?: string;
  department?: string;
  avatarUrl?: string;
}

export interface ApiSendMessageInput {
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType?: ApiMessageType;
}
