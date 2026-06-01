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
export type ApiMyPostsTab = "registered" | "participated" | "favorites";
export type ApiFaqCategory = "trade" | "account" | "payment" | "pickup" | "etc";
export type ApiNoticeType = "service" | "event" | "maintenance" | "policy";
export type ApiParticipantStatus =
  | "participating"
  | "payment_pending"
  | "pickup_ready"
  | "received"
  | "cancelled"
  | "no_show";
export type ApiPostExceptionStatus = "open" | "resolved" | "dismissed";
export type ApiPostExceptionSeverity = "info" | "warning" | "critical";

export type ApiNotificationType =
  | "new_participant"
  | "new_chat_message"
  | "post_status_changed"
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
  productName?: string | null;
  content: string;
  price: number;
  minParticipants: number;
  currentQuantity?: number;
  status?: ApiPostStatus;
  deadline: string;
  pickupLocation?: string | null;
  pickupDate?: string | null;
  pickupStartTime?: string | null;
  pickupEndTime?: string | null;
  pickupGuide?: string | null;
  pickupType?: "damara_zone" | "custom" | string | null;
  pickupZoneId?: string | null;
  groupBuyType?: "pre_recruit" | "post_purchase" | string | null;
  groupBuyMode?: "normal" | "price_unlock" | string | null;
  targetParticipants?: number | null;
  targetPrice?: number | null;
  currentPrice?: number | null;
  participantsToUnlock?: number | null;
  priceUnlocked?: boolean;
  dealMessage?: string | null;
  tags?: string[] | null;
  notice?: string | null;
  category?: ApiPostCategory | null;
  images?: Array<string | ApiPostImage>;
  thumbnailUrl?: string | null;
  favoriteCount?: number;
  isFavorite?: boolean;
  isParticipant?: boolean;
  isOwner?: boolean;
  deadlineStatus?: string;
  deadlineLabel?: string;
  remainingSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiPostProductSearchResponse {
  exists: boolean;
  exactMatchExists: boolean;
  partialMatchExists: boolean;
  total: number;
  items: ApiPost[];
}

export interface ApiPostImage {
  id?: string;
  imageUrl: string;
  sortOrder?: number;
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
  chatRoomId?: string | null;
  actionUrl?: string | null;
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
    status?: ApiPostStatus;
    pickupLocation?: string;
    deadline?: string;
    thumbnailUrl?: string;
  };
  participants?: Array<{
    userId: string;
    nickname?: string;
    avatarUrl?: string | null;
  }>;
  lastMessage?: Pick<ApiMessage, "id" | "content" | "senderId" | "messageType" | "createdAt">;
  unreadCount?: number;
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
  productName?: string;
  content: string;
  price: number;
  minParticipants: number;
  deadline: string;
  pickupLocation?: string;
  pickupType?: "damara_zone" | "custom" | string;
  pickupZoneId?: string;
  pickupDate?: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
  pickupGuide?: string;
  groupBuyType?: "pre_recruit" | "post_purchase" | string;
  groupBuyMode?: "normal" | "price_unlock" | string;
  targetParticipants?: number;
  targetPrice?: number;
  tags?: string[];
  notice?: string;
  category?: ApiPostCategory | string | null;
  images?: string[];
}

export interface ApiUpdatePostInput {
  title?: string;
  productName?: string;
  content?: string;
  price?: number;
  minParticipants?: number;
  status?: ApiPostStatus;
  deadline?: string;
  pickupLocation?: string;
  pickupType?: "damara_zone" | "custom" | string;
  pickupZoneId?: string;
  pickupDate?: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
  pickupGuide?: string;
  groupBuyType?: "pre_recruit" | "post_purchase" | string;
  groupBuyMode?: "normal" | "price_unlock" | string;
  targetParticipants?: number;
  targetPrice?: number;
  tags?: string[];
  notice?: string;
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

export interface ApiUserSummaryResponse {
  user: Pick<ApiUser, "id" | "nickname" | "studentId" | "department" | "avatarUrl" | "trustScore" | "trustGrade">;
  counts: {
    createdPostCount: number;
    participatedPostCount: number;
    favoriteCount: number;
    unreadChatCount: number;
    unreadNotificationCount: number;
  };
  trust: {
    label: string;
    badges: string[];
    completedTradeCount: number;
    responseRate: number;
    cancelCount: number;
    noShowCount: number;
  };
}

export interface ApiTrustSummaryResponse {
  trustScore: number;
  trustGrade: number;
  gradeLabel: string;
  rankPercent: number;
  completedTradeCount: number;
  responseRate: number;
  avgResponseMinutes: number;
  cancelCount: number;
  noShowCount: number;
  badges: string[];
}

export interface ApiUserSettings {
  pushEnabled: boolean;
  chatNotificationEnabled: boolean;
  postNotificationEnabled: boolean;
  marketingNotificationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface ApiMyPostsListParams {
  tab?: ApiMyPostsTab;
  status?: string;
  q?: string;
  keyword?: string;
  category?: ApiPostCategory;
  sort?: ApiPostSort;
  limit?: number;
  offset?: number;
  deadlineSoonHours?: number;
  recentDays?: number;
}

export interface ApiMyPostsListResponse {
  tab: ApiMyPostsTab;
  items: ApiPost[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

export interface ApiNotice {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  category?: string | null;
  type: ApiNoticeType;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFaq {
  id: string;
  category: ApiFaqCategory;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPickupZone {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  isActive?: boolean;
}
