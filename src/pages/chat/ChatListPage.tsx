import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCheck,
  Clock3,
  Cookie,
  Droplets,
  MapPin,
  MessageCircle,
  MoreVertical,
  Package,
  Package2,
  Plus,
  SendHorizontal,
  Search,
  Store,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { getMessages, getUserChatRooms, markAllMessagesAsRead, sendMessage } from "../../features/chat/api/chatApi";
import { checkParticipation } from "../../features/group-buy/api/groupBuyApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getImageUrl } from "../../shared/utils/imageUrl";
import { damaraToast, damaraToastMessages } from "../../shared/lib/damaraToast";
import EmptyState from "../../shared/components/damara/EmptyState";
import {
  UI_BADGE_FW,
  UI_PAGE_PAD_X,
  UI_R_BADGE,
  UI_SHADOW_SHEET,
} from "../../shared/constants/damaraUISystem";
import {
  BADGE_INFO_BG,
  BADGE_INFO_TEXT,
  BADGE_URGENT_BG,
  BADGE_URGENT_TEXT,
  blue50,
  blue500,
  blue600,
  BRAND_PRIMARY,
  green50,
  grey400,
  grey900,
  HOME_BORDER,
  HOME_CANVAS,
  HOME_CONTROL,
  HOME_CONTROL_TEXT,
  orange50,
  orange500,
  orange600,
  purple50,
  purple500,
  TEXT_META,
  TEXT_SUB,
  TEXT_TITLE,
  teal500,
  background,
} from "../../shared/constants/homeTheme";

type ChatFilter = "all" | "ongoing" | "unread" | "urgent";
type RoomStatus = "ongoing" | "closing" | "seller";

type ChatPreview = {
  id: number | string;
  postId?: string;
  title: string;
  status: RoomStatus;
  timeLabel: string;
  locationLabel: string;
  locationKind: "people" | "seller";
  preview: string;
  unreadCount: number;
  thumbType: "box" | "bar" | "snack" | "bottle" | "note" | "avatar";
  imageUrl?: string;
};

type DetailMessage = {
  id: string;
  type: "seller" | "participant" | "me";
  senderId?: string;
  senderLabel: string;
  subLabel: string;
  text: string;
  time: string;
};

const C_PRIMARY = BRAND_PRIMARY;
const C_TEXT_MAIN = TEXT_TITLE;
const C_TEXT_SUB = TEXT_SUB;
const C_TEXT_META = TEXT_META;
const C_TEXT_TIME = grey400;
const THUMB_TONES = [blue50, purple50, green50, orange50] as const;

function formatChatTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (!sameDay) {
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 1) return "어제";
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours < 12 ? "오전" : "오후"} ${hours % 12 || 12}:${minutes}`;
}

function extractChatRooms(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const candidates = [record.chatRooms, record.rooms, record.items, record.data, record.rows];
  const found = candidates.find(Array.isArray);
  if (found) return found as any[];
  return record.data && typeof record.data === "object" ? extractChatRooms(record.data) : [];
}

function extractMessages(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const candidates = [record.messages, record.items, record.data, record.rows];
  const found = candidates.find(Array.isArray);
  if (found) return found as any[];
  return record.data && typeof record.data === "object" ? extractMessages(record.data) : [];
}

function getPostImage(post: any): string | undefined {
  const firstImage = Array.isArray(post?.images) ? post.images[0] : undefined;
  return (
    (typeof firstImage === "string" ? firstImage : undefined) ||
    firstImage?.imageUrl ||
    firstImage?.url ||
    post?.imageUrl ||
    post?.image
  );
}

function formatDeadlineLabel(value?: string): string {
  if (!value) return "마감일 미정";
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return "마감일 미정";

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).getTime();
  const diffDays = Math.ceil((startOfDeadline - startOfToday) / 86400000);

  if (diffDays < 0) return "마감";
  if (diffDays === 0) return "오늘 마감";
  return `D-${diffDays}`;
}

function getParticipantCount(room: any, post: any): number | null {
  const value =
    post.currentQuantity ??
    post.currentParticipants ??
    post.participantCount ??
    post.participantsCount ??
    room.currentParticipants ??
    room.participantCount ??
    room.participantsCount;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(post.participants)) return post.participants.length;
  if (Array.isArray(room.participants)) {
    return room.participants.filter((participant: any) => participant?.userId !== post.authorId).length;
  }
  return null;
}

function mapPostStatusToRoomStatus(post: any): RoomStatus {
  const deadlineLabel = formatDeadlineLabel(post?.deadline);
  return deadlineLabel === "오늘 마감" || deadlineLabel === "D-1" ? "closing" : "ongoing";
}

function mapRoomToPreview(room: any): ChatPreview {
  const post = room.post ?? {};
  const lastMessage = room.lastMessage ?? {};
  const rawImage = getPostImage(post);
  const participantCount = getParticipantCount(room, post);
  const deadlineLabel = formatDeadlineLabel(post.deadline);
  const pickupLocation = post.pickupLocation || post.location || room.pickupLocation || room.location || "장소 미정";
  return {
    id: String(room.id ?? room.chatRoomId ?? room.postId ?? post.id ?? Date.now()),
    postId: room.postId ?? post.id,
    title: post.title || room.title || "공동구매 채팅",
    status: mapPostStatusToRoomStatus(post),
    timeLabel: formatChatTime(lastMessage.createdAt || room.updatedAt || room.createdAt) || "방금",
    locationLabel: `${pickupLocation} · ${participantCount ?? 0}명 참여 · ${deadlineLabel}`,
    locationKind: "people",
    preview: lastMessage.content || room.preview || "아직 대화가 없어요.",
    unreadCount: Number(room.unreadCount ?? 0),
    thumbType: "box",
    imageUrl: rawImage ? getImageUrl(rawImage) : undefined,
  };
}

function mapMessageToDetail(message: any, currentUserId: string): DetailMessage {
  const senderId = String(message.senderId ?? message.sender?.id ?? "");
  const isMe = Boolean(currentUserId && senderId === currentUserId);
  const senderName = message.sender?.nickname || message.nickname || (isMe ? "나" : "상대");
  return {
    id: String(message.id ?? `${senderId}-${message.createdAt ?? Math.random()}`),
    type: isMe ? "me" : "seller",
    senderId,
    senderLabel: isMe ? "나" : senderName,
    subLabel: isMe ? "" : "공동구매",
    text: message.content || "",
    time: formatChatTime(message.createdAt) || "",
  };
}

function ChatBadge({ status }: { status: RoomStatus }) {
  if (status === "seller") return null;
  const isClosing = status === "closing";
  return (
    <span
      style={{
        height: 23,
        padding: "0 9px",
        borderRadius: 999,
        backgroundColor: isClosing ? BADGE_URGENT_BG : BADGE_INFO_BG,
        color: isClosing ? BADGE_URGENT_TEXT : BADGE_INFO_TEXT,
        fontSize: 10.8,
        fontWeight: UI_BADGE_FW,
        lineHeight: "23px",
        whiteSpace: "nowrap",
      }}
    >
      {isClosing ? "마감임박" : "진행중"}
    </span>
  );
}

function ChatThumb({ type, imageUrl }: { type: ChatPreview["thumbType"]; imageUrl?: string }) {
  const tone = (i: number) => THUMB_TONES[i % THUMB_TONES.length];
  if (imageUrl && imageUrl !== "/placeholder.png") {
    return (
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 17,
          background: "#FFFFFF",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  const shell = (i: number, children: React.ReactNode) => (
    <div
      style={{
        width: 76,
        height: 76,
        borderRadius: 17,
        background: `linear-gradient(145deg, #ffffff 0%, ${tone(i)} 56%, ${blue50} 100%)`,
        display: "grid",
        placeItems: "center",
        border: "1px solid #EEF2F6",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
  if (type === "avatar") {
    return (
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 17,
          background: blue50,
          display: "grid",
          placeItems: "center",
          border: "1px solid #EEF2F6",
          flexShrink: 0,
        }}
      >
        <User size={30} color={blue600} strokeWidth={1.65} aria-hidden />
      </div>
    );
  }
  if (type === "box") return shell(0, <Package size={30} color={blue500} strokeWidth={1.65} aria-hidden />);
  if (type === "bar") return shell(1, <Cookie size={30} color={orange600} strokeWidth={1.6} aria-hidden />);
  if (type === "snack") return shell(2, <Package2 size={30} color={teal500} strokeWidth={1.65} aria-hidden />);
  if (type === "bottle") return shell(3, <Droplets size={30} color={blue600} strokeWidth={1.65} aria-hidden />);
  return shell(0, <BookOpen size={30} color={purple500} strokeWidth={1.65} aria-hidden />);
}

function OtherBubble({ msg }: { msg: DetailMessage }) {
  const avatar =
    msg.type === "participant" ? (
      <User size={17} color={HOME_CONTROL_TEXT} strokeWidth={1.85} aria-hidden />
    ) : (
      <Store size={16} color={C_PRIMARY} strokeWidth={2} aria-hidden />
    );
  return (
    <div style={{ display: "flex", gap: 9, padding: "7px 18px" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          background: msg.type === "participant" ? "#fff" : blue50,
          border: "1px solid rgba(229, 232, 235, 0.92)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {avatar}
      </div>
      <div style={{ maxWidth: 286 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
          <span style={{ color: C_TEXT_SUB, fontSize: 10.5, fontWeight: 800 }}>{msg.senderLabel}</span>
          <span style={{ color: C_TEXT_META, fontSize: 11 }}>{msg.subLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div
            style={{
              backgroundColor: background,
              border: "1px solid rgba(229, 232, 235, 0.92)",
              borderRadius: "6px 17px 17px 17px",
              padding: "10px 13px",
              color: C_TEXT_MAIN,
              fontSize: 12.5,
              lineHeight: "19px",
              whiteSpace: "pre-line",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.035)",
            }}
          >
            {msg.text}
          </div>
          <span style={{ color: C_TEXT_TIME, fontSize: 10, lineHeight: "15px", whiteSpace: "nowrap" }}>{msg.time}</span>
        </div>
      </div>
    </div>
  );
}

function MyBubble({ msg }: { msg: DetailMessage }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: 268 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <span style={{ color: C_TEXT_TIME, fontSize: 10, lineHeight: "15px" }}>{msg.time}</span>
          <span style={{ display: "inline-flex", alignItems: "center", color: C_PRIMARY }}>
            <CheckCheck size={12} strokeWidth={2} />
          </span>
        </div>
        <div
          style={{
            background: `linear-gradient(135deg, ${C_PRIMARY} 0%, #5b9fff 100%)`,
            borderRadius: "17px 17px 6px 17px",
            padding: "10px 13px",
            color: background,
            fontSize: 12.5,
            lineHeight: "19px",
            whiteSpace: "pre-line",
            boxShadow: "0 6px 16px rgba(49, 130, 246, 0.2)",
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

function ChatDetailOverlay({ chat, currentUserId, onClose }: { chat: ChatPreview; currentUserId: string; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<DetailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const metaParts = chat.locationLabel.split(" · ");
  const detailLocation = metaParts[0] || "장소 미정";
  const detailParticipant = metaParts[1] || "참여 정보 없음";
  const detailDeadline = metaParts[2] || "마감일 미정";

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!chat.id || typeof chat.id === "number") {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }

      try {
        setLoadingMessages(true);
        const res = await getMessages(String(chat.id), 50, 0);
        if (cancelled) return;
        setMessages(extractMessages(res.data).map((message) => mapMessageToDetail(message, currentUserId)));
        if (currentUserId) {
          markAllMessagesAsRead(String(chat.id), currentUserId).catch(() => undefined);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [chat.id, currentUserId]);

  useEffect(() => {
    let cancelled = false;

    if (!chat.postId || !currentUserId) {
      setIsParticipant(false);
      return;
    }

    checkParticipation(chat.postId, currentUserId)
      .then((res) => {
        if (!cancelled) setIsParticipant(Boolean(res.data?.isParticipant));
      })
      .catch(() => {
        if (!cancelled) setIsParticipant(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chat.postId, currentUserId]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    if (!currentUserId || !chat.id) {
      toast.error("로그인이 필요해요.");
      return;
    }

    const optimistic: DetailMessage = {
      id: `local-${Date.now()}`,
      type: "me",
      senderId: currentUserId,
      senderLabel: "나",
      subLabel: "",
      text: content,
      time: formatChatTime(new Date().toISOString()),
    };

    setDraft("");
    setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage({ chatRoomId: String(chat.id), senderId: currentUserId, content });
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
      toast.error("메시지 전송에 실패했어요.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, backgroundColor: HOME_CANVAS, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100dvh", backgroundColor: HOME_CANVAS, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 56, backgroundColor: HOME_CANVAS, borderBottom: `1px solid rgba(229, 232, 235, 0.56)`, display: "flex", alignItems: "center", padding: `0 ${UI_PAGE_PAD_X}px`, gap: 8 }}>
          <button type="button" onClick={onClose} aria-label="뒤로가기" style={{ width: 36, height: 36, flexShrink: 0, border: 0, background: "transparent", borderRadius: 999, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <ArrowLeft size={18} strokeWidth={2} color={grey900} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, color: grey900, fontSize: 16, lineHeight: "22px", fontWeight: 850, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</h1>
            <p style={{ margin: 0, color: C_TEXT_META, fontSize: 11, lineHeight: "16px", fontWeight: 600 }}>공동구매 채팅방</p>
          </div>
          <button type="button" onClick={() => toast.message("메뉴는 곧 연결돼요.")} aria-label="더보기" style={{ width: 36, height: 36, flexShrink: 0, border: 0, background: "transparent", borderRadius: 999, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <MoreVertical size={17} strokeWidth={2} color={C_TEXT_META} />
          </button>
        </header>

        <div style={{ padding: `12px ${UI_PAGE_PAD_X}px 2px` }}>
          <div
            style={{
              minHeight: 46,
              border: "1px solid rgba(229, 232, 235, 0.92)",
              background: "linear-gradient(135deg, #fff 0%, #f8fbff 100%)",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              gap: 8,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.035)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
              <MapPin size={13} color={C_PRIMARY} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 11, color: C_TEXT_SUB, fontWeight: 500 }}>
                수령 <span style={{ color: C_TEXT_META, fontWeight: 600 }}>{detailLocation}</span>
              </span>
            </div>
            <div style={{ width: 1, height: 18, backgroundColor: HOME_BORDER, flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
              <CalendarClock size={13} color={C_PRIMARY} strokeWidth={2} aria-hidden />
              <span style={{ fontSize: 11, color: C_TEXT_SUB, fontWeight: 500 }}>
                마감 <span style={{ color: C_TEXT_META, fontWeight: 600 }}>{detailDeadline}</span>
              </span>
            </div>
            <span style={{ marginLeft: "auto", padding: "0 8px", height: 20, borderRadius: UI_R_BADGE, backgroundColor: chat.status === "closing" ? BADGE_URGENT_BG : BADGE_INFO_BG, color: chat.status === "closing" ? BADGE_URGENT_TEXT : BADGE_INFO_TEXT, fontSize: 10, lineHeight: "20px", fontWeight: UI_BADGE_FW, flexShrink: 0 }}>{chat.status === "closing" ? "마감임박" : "진행중"}</span>
          </div>
        </div>

        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingTop: 8, paddingBottom: 18 }}>
          {loadingMessages ? (
            <p style={{ margin: "24px 0", textAlign: "center", color: C_TEXT_META, fontSize: 12, fontWeight: 650 }}>
              메시지를 불러오는 중이에요
            </p>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<MessageCircle size={54} strokeWidth={1.25} />}
              title="아직 메시지가 없어요"
              description="공구 관련 대화를 시작해보세요."
            />
          ) : (
            messages.map((msg) => (msg.type === "me" ? <MyBubble key={msg.id} msg={msg} /> : <OtherBubble key={msg.id} msg={msg} />))
          )}

          {isParticipant ? (
            <div style={{ margin: `12px ${UI_PAGE_PAD_X}px 0`, borderRadius: 18, backgroundColor: blue50, border: "1px solid rgba(49, 130, 246, 0.1)", padding: "13px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: "20px", color: grey900, fontWeight: 800, letterSpacing: "-0.02em" }}>공구 참여가 확정됐어요</p>
              <p style={{ margin: "5px 0 0", fontSize: 12, lineHeight: "18px", color: TEXT_META }}>수령 시간과 장소를 채팅으로 확인해 주세요.</p>
            </div>
          ) : null}

          <div style={{ margin: `12px ${UI_PAGE_PAD_X}px 0`, border: "1px solid rgba(229, 232, 235, 0.92)", borderRadius: 20, background: "linear-gradient(135deg, #fff 0%, #f8fbff 100%)", padding: "14px", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.035)" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: 17, background: `linear-gradient(145deg, ${THUMB_TONES[0]} 0%, ${blue50} 100%)`, display: "grid", placeItems: "center", border: "1px solid rgba(229, 232, 235, 0.92)", flexShrink: 0 }}>
                {chat.imageUrl ? (
                  <img src={chat.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 17, display: "block" }} />
                ) : (
                  <Package size={26} color={C_PRIMARY} strokeWidth={1.65} aria-hidden />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: 14.5, lineHeight: "20px", color: grey900, fontWeight: 850, letterSpacing: "-0.02em" }}>{chat.title}</strong>
                  <span style={{ height: 20, padding: "0 8px", borderRadius: UI_R_BADGE, backgroundColor: chat.status === "closing" ? BADGE_URGENT_BG : BADGE_INFO_BG, color: chat.status === "closing" ? BADGE_URGENT_TEXT : BADGE_INFO_TEXT, fontSize: 10, lineHeight: "20px", fontWeight: UI_BADGE_FW }}>{chat.status === "closing" ? "마감임박" : "진행중"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, color: C_TEXT_META, fontSize: 12 }}>
                  <MapPin size={12} strokeWidth={2} aria-hidden /> {detailLocation}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: C_TEXT_META, fontSize: 12 }}>
                  <Clock3 size={12} strokeWidth={2} aria-hidden /> 마감 <span style={{ color: C_TEXT_SUB, fontWeight: 600 }}>{detailDeadline}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <span style={{ color: C_TEXT_META, fontSize: 12, whiteSpace: "nowrap" }}>
                    <Users size={12} style={{ marginRight: 3, verticalAlign: "middle" }} aria-hidden /> <span style={{ color: C_TEXT_SUB, fontWeight: 600 }}>{detailParticipant}</span>
                  </span>
                  <div style={{ flex: 1, height: 5, borderRadius: 999, backgroundColor: HOME_CONTROL, overflow: "hidden" }}>
                    <div style={{ width: "30%", height: "100%", backgroundColor: C_PRIMARY }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => toast.message("수령 정보 보기 기능은 준비 중입니다.")} style={{ flex: 1, height: 34, borderRadius: 12, border: "1px solid rgba(229, 232, 235, 0.92)", background: "#fff", color: C_TEXT_SUB, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>수령 정보</button>
              <button type="button" onClick={() => toast.message("참여 내역 기능은 준비 중입니다.")} style={{ flex: 1, height: 34, borderRadius: 12, border: `1px solid ${blue50}`, background: blue50, color: C_PRIMARY, fontSize: 11.5, fontWeight: 800, cursor: "pointer" }}>참여 내역</button>
            </div>
          </div>
        </main>

        <footer style={{ minHeight: 66, padding: `10px ${UI_PAGE_PAD_X}px calc(10px + env(safe-area-inset-bottom, 0px))`, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(229, 232, 235, 0.72)", display: "flex", alignItems: "center", gap: 8, boxShadow: UI_SHADOW_SHEET }}>
          <button type="button" onClick={() => toast.message("첨부는 곧 연결돼요.")} style={{ width: 40, height: 40, borderRadius: 14, border: "1px solid rgba(229, 232, 235, 0.92)", background: background, display: "grid", placeItems: "center", cursor: "pointer" }} aria-label="첨부">
            <Plus size={20} color={C_TEXT_SUB} strokeWidth={2} />
          </button>
          <label style={{ flex: 1, height: 42, borderRadius: 16, border: "1px solid rgba(229, 232, 235, 0.92)", backgroundColor: "#f7f9fc", padding: "0 14px", display: "flex", alignItems: "center" }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="메시지를 입력해 주세요" className="placeholder:text-[#b0b8c1]" style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: grey900, fontSize: 14, fontWeight: 500 }} />
          </label>
          <button type="button" onClick={handleSend} style={{ width: 42, height: 42, borderRadius: 16, border: 0, background: C_PRIMARY, color: background, display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 6px 16px rgba(49, 130, 246, 0.22)" }} aria-label="전송">
            <SendHorizontal size={15} strokeWidth={2.1} />
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function ChatListPage() {
  const routeLocation = useLocation();
  const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID) || "";
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [openedChat, setOpenedChat] = useState<ChatPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!currentUserId) {
        setChats([]);
        setError("로그인 후 채팅을 확인할 수 있어요.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await getUserChatRooms(currentUserId, 50, 0);
        if (!cancelled) setChats(extractChatRooms(res.data).map(mapRoomToPreview));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setChats([]);
          setError("채팅방 목록을 불러오지 못했어요.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  useEffect(() => {
    const params = new URLSearchParams(routeLocation.search);
    const roomId = params.get("roomId");
    const postId = params.get("postId");
    const title = params.get("title");
    const locationLabel = params.get("location");

    if (!roomId && !postId && !title) return;

    const sourceChats = chats;
    const matchedChat =
      sourceChats.find((chat) => String(chat.id) === String(roomId || postId)) ||
      sourceChats.find((chat) => title && chat.title === title);
    const fallbackId = Number(roomId || postId);

    setOpenedChat(
      matchedChat ?? {
        id: roomId || (Number.isFinite(fallbackId) ? fallbackId : Date.now()),
        postId: postId || undefined,
        title: title || "공동구매 채팅",
        status: "ongoing",
        timeLabel: "방금",
        locationLabel: locationLabel || "공동구매",
        locationKind: "people",
        preview: "공구 관련 대화를 시작해보세요.",
        unreadCount: 0,
        thumbType: "box",
      }
    );
  }, [routeLocation.search, chats]);

  const displayChats = chats;

  const filterItems = useMemo(() => {
    const ongoingCount = displayChats.filter((chat) => chat.status === "ongoing" || chat.status === "closing").length;
    const unreadCount = displayChats.filter((chat) => chat.unreadCount > 0).length;
    const urgentCount = displayChats.filter((chat) => chat.status === "closing").length;
    return [
      { id: "all" as ChatFilter, label: `전체 ${displayChats.length}` },
      { id: "ongoing" as ChatFilter, label: `진행중 ${ongoingCount}` },
      { id: "unread" as ChatFilter, label: `안 읽음 ${unreadCount}` },
      { id: "urgent" as ChatFilter, label: `마감임박 ${urgentCount}` },
    ];
  }, [displayChats]);

  const visibleChats = useMemo(() => {
    if (filter === "all") return displayChats;
    if (filter === "unread") return displayChats.filter((chat) => chat.unreadCount > 0);
    if (filter === "urgent") return displayChats.filter((chat) => chat.status === "closing");
    return displayChats.filter((chat) => chat.status === "ongoing" || chat.status === "closing");
  }, [displayChats, filter]);

  return (
    <div data-page="채팅" style={{ minHeight: "100dvh", width: "100%", backgroundColor: HOME_CANVAS, display: "flex", flexDirection: "column" }}>
      <section style={{ flexShrink: 0, backgroundColor: HOME_CANVAS, padding: `18px ${UI_PAGE_PAD_X}px 12px`, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0, color: grey900, fontSize: 25, lineHeight: "32px", fontWeight: 900, letterSpacing: 0 }}>
              채팅
            </h1>
            <p style={{ margin: "4px 0 0", color: C_TEXT_META, fontSize: 13, lineHeight: "18px", fontWeight: 650 }}>
              참여 중인 공구 대화를 모아봤어요
            </p>
          </div>
          <button
            type="button"
            aria-label="채팅 검색"
            onClick={() => toast.message("채팅 검색은 곧 연결돼요.")}
            style={{
              width: 34,
              height: 34,
              border: `1px solid ${HOME_BORDER}`,
              background: background,
              borderRadius: 999,
              color: TEXT_META,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 1px 3px rgba(15,23,42,0.035)",
            }}
          >
            <Search size={17} strokeWidth={2.1} color={TEXT_META} />
          </button>
        </div>
        <div className="no-scrollbar" style={{ display: "flex", alignItems: "center", gap: 7, overflowX: "auto", scrollbarWidth: "none" }}>
        {filterItems.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              style={{
                height: 30,
                padding: "0 13px",
                borderRadius: UI_R_BADGE,
                border: active ? `1px solid ${BRAND_PRIMARY}` : `1px solid ${HOME_BORDER}`,
                backgroundColor: active ? BRAND_PRIMARY : background,
                color: active ? background : C_TEXT_META,
                fontSize: 12,
                fontWeight: active ? 800 : 650,
                lineHeight: "30px",
                boxShadow: active ? "0 5px 14px rgba(49,130,246,0.18)" : "0 1px 3px rgba(15, 23, 42, 0.035)",
                cursor: "pointer",
                transition: "background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {item.label}
            </button>
          );
        })}
        </div>
      </section>

      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 0 96px" }}>
        {loading && chats.length === 0 ? (
          <p style={{ margin: "32px 0", textAlign: "center", color: C_TEXT_META, fontSize: 12, fontWeight: 650 }}>
            채팅방을 불러오는 중이에요
          </p>
        ) : visibleChats.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={64} strokeWidth={1.25} />}
            title="채팅방이 없어요"
            description={error || "공동구매에 참여하면 작성자·참여자와 여기서 대화할 수 있어요."}
          />
        ) : (
          visibleChats.map((chat) => {
            return (
            <button
              key={chat.id}
              type="button"
              onClick={() => {
                damaraToast.show(damaraToastMessages.chatRoomEntered);
                setOpenedChat(chat);
              }}
              className="transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]"
              style={{
                width: `calc(100% - ${UI_PAGE_PAD_X * 2}px)`,
                margin: `0 ${UI_PAGE_PAD_X}px 10px`,
                minHeight: 112,
                border: "1px solid #EEF2F6",
                borderRadius: 24,
                background: "#fff",
                display: "flex",
                alignItems: "stretch",
                gap: 12,
                padding: "14px",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: "0 7px 22px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.022)",
                position: "relative",
              }}
            >
              <ChatThumb type={chat.thumbType} imageUrl={chat.imageUrl} />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", paddingRight: 56 }}>
                  <strong
                    style={{
                      minWidth: 0,
                      color: grey900,
                      fontSize: 15.2,
                      lineHeight: "21px",
                      fontWeight: 850,
                      letterSpacing: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.title}
                  </strong>
                  <ChatBadge status={chat.status} />
                </div>
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: 15,
                    color: C_TEXT_TIME,
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: "17px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chat.timeLabel}
                </span>
                <p style={{ margin: "6px 0 0", color: C_TEXT_META, fontSize: 12, lineHeight: "17px", fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {chat.locationLabel}
                </p>
                <p style={{ margin: "7px 0 0", color: C_TEXT_SUB, fontSize: 12.5, lineHeight: "18px", fontWeight: 550, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: chat.unreadCount > 0 ? 32 : 0 }}>
                  {chat.preview}
                </p>
                  {chat.unreadCount > 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        right: 14,
                        bottom: 13,
                        minWidth: 20,
                        height: 20,
                        padding: "0 7px",
                        borderRadius: UI_R_BADGE,
                        background: BRAND_PRIMARY,
                        color: background,
                        fontSize: 10.5,
                        fontWeight: 850,
                        lineHeight: "20px",
                        textAlign: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {chat.unreadCount}
                    </span>
                  ) : null}
              </div>
            </button>
            );
          })
        )}
      </main>

      {openedChat ? <ChatDetailOverlay chat={openedChat} currentUserId={currentUserId} onClose={() => setOpenedChat(null)} /> : null}
    </div>
  );
}
