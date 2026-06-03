import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  GraduationCap,
  Heart,
  ImageIcon,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MoreVertical,
  PackageCheck,
  Store,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  addFavorite,
  cancelParticipation,
  checkFavorite,
  checkParticipation,
  deletePost,
  getParticipants,
  getPostDetail,
  participatePost,
  removeFavorite,
} from "../../features/group-buy/api/groupBuyApi";
import { getChatRoomByPostId } from "../../features/chat/api/chatApi";
import { getUserTrustSummary } from "../../features/user/api/userApi";
import { readFavoriteFlag } from "../../features/group-buy/utils/favoriteResponse";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import {
  background,
  blue50,
  blue500,
  blue600,
  green50,
  green600,
  grey50,
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  grey700,
  grey800,
  grey900,
} from "../../shared/constants/homeTheme";
import { getImageUrl } from "../../shared/utils/imageUrl";


type Participant = {
  userId?: string;
  nickname?: string;
  avatarUrl?: string;
  trustGrade?: number;
  user?: {
    nickname?: string;
    avatarUrl?: string | null;
  };
};

type SellerTrustSummary = {
  trustGrade?: number;
  gradeLabel?: string;
  rankPercent?: number;
  responseRate?: number;
  avgResponseMinutes?: number;
  completedTradeCount?: number;
  badges?: string[];
};

export default function GroupBuyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  const [post, setPost] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sellerTrust, setSellerTrust] = useState<SellerTrustSummary | null>(null);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [detailRes, participantRes] = await Promise.allSettled([
          getPostDetail(id, currentUserId),
          getParticipants(id),
        ]);

        if (detailRes.status === "fulfilled") {
          setPost(detailRes.value.data);
          setError("");
        } else {
          setPost(null);
          setError("게시글을 불러오지 못했어요.");
        }
        if (participantRes.status === "fulfilled") {
          const data = participantRes.value.data;
          const list = Array.isArray(data) ? data : data?.participants;
          setParticipants(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error(err);
        setPost(null);
        setError("게시글을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    const authorId = post?.authorId;
    if (!authorId) return;

    let cancelled = false;
    getUserTrustSummary(authorId)
      .then(({ data }) => {
        if (!cancelled) setSellerTrust(data);
      })
      .catch(() => {
        if (!cancelled) setSellerTrust(null);
      });

    return () => {
      cancelled = true;
    };
  }, [post?.authorId]);

  useEffect(() => {
    if (!id || !currentUserId) return;
    checkParticipation(id, currentUserId)
      .then((res) => setIsParticipant(Boolean(res.data?.isParticipant)))
      .catch(() => undefined);
    checkFavorite(id, currentUserId)
      .then((res) => setIsFavorite(readFavoriteFlag(res.data)))
      .catch(() => undefined);
  }, [id, currentUserId]);

  const imageUrls = useMemo(
    () =>
      (post?.images ?? [])
        .map((img: any) => getImageUrl(img?.imageUrl || img?.url || img))
        .filter(Boolean),
    [post?.images]
  );

  useEffect(() => {
    setImageLoadFailed(false);
  }, [imageUrls[0]]);

  const title = post?.title || post?.productName || "공동구매 상품";
  const price = post?.price ?? 0;
  const category = normalizeCategory(post?.category || "");
  const location = post?.pickupLocation || "수령 장소 미정";
  const deadline = formatDeadline(post?.deadline);
  const pickupDate = post?.pickupDate || "채팅으로 협의";
  const current = Number(post?.currentQuantity ?? 0);
  const min = Number(post?.minParticipants ?? 1);
  const isOwner = Boolean(currentUserId && (post?.isOwner || post?.authorId === currentUserId));
  const progress = Math.min(100, Math.round((current / Math.max(min, 1)) * 100));
  const remaining = Math.max(min - current, 0);
  const content = post?.content || "작성자가 상품 소개를 아직 입력하지 않았어요.";
  const sellerNickname = post?.author?.nickname || "판매자";
  const sellerGrade = Number(sellerTrust?.trustGrade ?? post?.author?.trustGrade ?? 0).toFixed(1);
  const sellerGradeLabel = sellerTrust?.gradeLabel || "거래 이력 확인 중";
  const sellerRankPercent = sellerTrust?.rankPercent;
  const sellerResponseRate = sellerTrust?.responseRate;
  const sellerResponseMinutes = sellerTrust?.avgResponseMinutes;
  const sellerBadges = sellerTrust?.badges?.length ? sellerTrust.badges.slice(0, 3) : ["거래 정보를 확인해 보세요"];
  const participantList = participants.length
    ? participants
    : Array.from({ length: Math.min(current, 2) }, (_, index) => ({
        nickname: `참여자 ${index + 1}`,
        trustGrade: index === 0 ? 4.1 : 4.3,
      }));

  const handleFavorite = async () => {
    if (!id || !currentUserId) {
      toast.error("로그인이 필요해요.");
      return;
    }
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) await addFavorite(id, currentUserId);
      else await removeFavorite(id, currentUserId);
    } catch {
      setIsFavorite(!next);
      toast.error("관심 처리에 실패했어요.");
    }
  };

  const handleChat = async () => {
    if (!id || !currentUserId) {
      toast.error("로그인이 필요해요.");
      return;
    }
    try {
      const res = await getChatRoomByPostId(id);
      const roomId = res.data?.id || res.data?.chatRoomId;
      const params = new URLSearchParams({ postId: id, title, location });
      if (roomId) params.set("roomId", String(roomId));
      nav(`/chat?${params.toString()}`);
    } catch {
      const params = new URLSearchParams({ postId: id, title, location });
      nav(`/chat?${params.toString()}`);
    }
  };

  const handleParticipate = async () => {
    if (!id || !currentUserId) {
      toast.error("로그인이 필요해요.");
      return;
    }
    try {
      setBusy(true);
      if (isParticipant) {
        await cancelParticipation(id, currentUserId);
        setIsParticipant(false);
        setPost((prev: any) => ({ ...prev, currentQuantity: Math.max(Number(prev.currentQuantity ?? 1) - 1, 0) }));
        toast.success("참여를 취소했어요.");
      } else {
        await participatePost(id, currentUserId);
        setIsParticipant(true);
        setPost((prev: any) => ({ ...prev, currentQuantity: Number(prev.currentQuantity ?? 0) + 1 }));
        toast.success("공구에 참여했어요.");
      }
    } catch {
      toast.error("처리에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = () => {
    if (!id) return;
    setShowOwnerMenu(false);
    nav(`/create?edit=${encodeURIComponent(id)}`);
  };

  const handleDelete = async () => {
    if (!id || !currentUserId) return;
    const confirmed = window.confirm("이 공구를 삭제할까요? 삭제 후에는 되돌릴 수 없어요.");
    if (!confirmed) return;

    try {
      setBusy(true);
      setShowOwnerMenu(false);
      await deletePost(id, currentUserId);
      toast.success("공구가 삭제됐어요.");
      nav("/home", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("공구 삭제에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-page="공구 상세" style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" aria-label="뒤로가기" onClick={() => nav(-1)} style={headerButtonStyle}>
          <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
        </button>
        <h1 style={headerTitleStyle}>공구 상세</h1>
        {isOwner ? (
          <div style={{ position: "relative" }}>
            <button type="button" aria-label="게시글 관리" onClick={() => setShowOwnerMenu((open) => !open)} style={headerButtonStyle}>
              <MoreVertical size={21} strokeWidth={2.25} aria-hidden />
            </button>
            {showOwnerMenu ? (
              <div style={ownerMenuStyle}>
                <button type="button" onClick={handleEdit} style={ownerMenuItemStyle}>
                  수정하기
                </button>
                <button type="button" onClick={() => void handleDelete()} style={{ ...ownerMenuItemStyle, color: "#E5484D" }}>
                  <Trash2 size={14} strokeWidth={2.1} aria-hidden />
                  삭제하기
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button type="button" aria-label="관심 등록" onClick={handleFavorite} style={headerButtonStyle}>
            <Heart size={21} strokeWidth={2.25} fill={isFavorite ? grey900 : "none"} aria-hidden />
          </button>
        )}
      </header>

      {loading ? (
        <main style={{ padding: "16px 16px 100px" }}>
          <DetailSkeleton />
        </main>
      ) : error || !post ? (
        <main style={mainStyle}>
          <section style={{ ...contentCardStyle, textAlign: "center", padding: "34px 20px" }}>
            <h2 style={{ margin: 0, color: grey900, fontSize: 17, fontWeight: 850 }}>게시글을 찾을 수 없어요</h2>
            <p style={{ margin: "8px 0 0", color: grey500, fontSize: 13, lineHeight: "19px", fontWeight: 600 }}>
              {error || "삭제되었거나 접근할 수 없는 공구예요."}
            </p>
            <button type="button" onClick={() => nav("/home", { replace: true })} style={{ ...chatButtonStyle, width: "100%", marginTop: 18 }}>
              홈으로 돌아가기
            </button>
          </section>
        </main>
      ) : (
        <main style={mainStyle}>
          <section style={heroCardStyle}>
            <div style={heroImageStyle}>
              <span style={statusBadgeStyle}>모집중</span>
              {imageUrls[0] && !imageLoadFailed ? (
                <img
                  data-damara-image
                  src={imageUrls[0]}
                  alt=""
                  onError={() => setImageLoadFailed(true)}
                  style={heroProductImageStyle}
                />
              ) : (
                <ProductMock category={String(post?.category || "")} />
              )}
              <div style={heroOverlayStyle} aria-hidden />
              <div style={dotWrapStyle}>
                {Array.from({ length: Math.max(imageUrls.length || 1, 1) }).slice(0, 4).map((_, dot) => (
                  <span key={dot} style={{ ...dotStyle, background: dot === 0 ? blue500 : grey300 }} />
                ))}
              </div>
            </div>

            <div style={heroBodyStyle}>
              <div style={{ minWidth: 0 }}>
                <span style={heroStatusTextStyle}>
                  {remaining > 0 ? `${remaining}명 더 모이면 진행돼요` : "모집 인원이 모였어요"}
                </span>
                <h2 style={titleStyle}>{title}</h2>
                <p style={priceStyle}>{formatPrice(price)}</p>
              </div>
              <div style={heroPillStackStyle}>
                <Pill icon={<Store size={13} />} label={category} />
                <span style={miniMetaPillStyle}>{current}/{min}명</span>
              </div>
            </div>
          </section>

          <section style={summaryCardStyle}>
            <div style={progressPanelStyle}>
              <div>
                <p style={progressPanelLabelStyle}>모집 현황</p>
                <strong style={progressPanelTitleStyle}>
                  {current}/{min}명 참여 중
                </strong>
              </div>
              <span style={progressPercentPillStyle}>{progress}%</span>
              <div style={progressPanelTrackStyle}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #3182F6 0%, #6EAEFF 100%)",
                  }}
                />
              </div>
            </div>
            <InfoRow icon={<MapPin />} label="수령 장소" value={location} />
            <InfoRow icon={<CalendarDays />} label="마감일" value={deadline} />
            <InfoRow icon={<Clock />} label="예상 수령일" value={pickupDate} />
          </section>

          <section style={sellerCardStyle}>
            <Avatar />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={sectionSmallTitleStyle}>{sellerNickname}</h3>
              <p style={sellerMetaStyle}>판매자 정보</p>
              <div style={sellerStatsStyle}>
                {sellerResponseMinutes !== undefined ? <span>평균 응답 {sellerResponseMinutes}분</span> : null}
                {sellerResponseRate !== undefined ? <span>응답률 {sellerResponseRate}%</span> : null}
              </div>
              <div style={tagRowStyle}>
                {sellerBadges.map((tag) => (
                  <span key={tag} style={softTagStyle}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div style={mannerCardStyle}>
              <GraduationCap size={16} color={blue600} fill="rgba(49,130,246,0.12)" />
              <p style={mannerLabelStyle}>{sellerGradeLabel}</p>
              <p style={mannerScoreStyle}>
                {sellerGrade} <span>/ 4.5</span>
              </p>
              {sellerRankPercent !== undefined ? <p style={mannerRankStyle}>상위 {sellerRankPercent}%</p> : null}
            </div>
          </section>

          <section style={contentCardStyle}>
            <h3 style={sectionTitleStyle}>참여자 {Math.max(current, participantList.length)}명</h3>
            <div style={participantGridStyle}>
              {participantList.slice(0, 4).map((person, index) => (
                <ParticipantCard key={person.userId || `${person.nickname}-${index}`} person={person} index={index} />
              ))}
            </div>
          </section>

          <section style={contentCardStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>상품 소개</h3>
              <PackageCheck size={18} color={blue600} strokeWidth={2.1} />
            </div>
            <p style={contentTextStyle}>{content}</p>
          </section>

          <div style={noticeGridStyle}>
            <NoticeCard
              title="수령 안내"
              icon={<Store size={22} />}
              lines={[
                `수령 장소: ${location}`,
                `수령 예정: ${pickupDate}`,
                "정확한 시간은 채팅으로 확인해요.",
              ]}
            />
            <NoticeCard
              title="거래 유의사항"
              icon={<LockKeyhole size={22} />}
              tone="caution"
              lines={[
                "취소는 마감 전까지만 가능해요.",
                "마감 후 취소 시 참여가 제한될 수 있어요.",
                "문제 발생 시 채팅으로 문의해 주세요.",
              ]}
            />
          </div>
        </main>
      )}

      <div style={bottomBarStyle}>
        {isOwner ? (
          <div style={ownerBottomNoticeStyle}>내가 작성한 공구입니다</div>
        ) : (
          <>
            <button type="button" onClick={handleChat} style={chatButtonStyle}>
              <MessageCircle size={19} strokeWidth={2.15} aria-hidden />
              채팅
            </button>
            <button type="button" disabled={busy} onClick={handleParticipate} style={participateButtonStyle}>
              {isParticipant ? "참여취소" : "참여하기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function formatPrice(value: unknown) {
  return `${Math.floor(Number(value ?? 0)).toLocaleString()}원`;
}

function formatDeadline(value: unknown) {
  if (!value) return "마감일 미정";
  const text = String(value);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function normalizeCategory(value: unknown) {
  const categoryMap: Record<string, string> = {
    food: "먹거리",
    daily: "생활용품",
    beauty: "뷰티·패션",
    electronics: "전자기기",
    school: "학용품",
    freemarket: "프리마켓",
  };
  return categoryMap[String(value)] || String(value || "기타");
}

function ProductMock({ category }: { category?: string }) {
  const isBeauty = category === "beauty";
  const isFood = category === "food";

  return (
    <div style={productMockFrameStyle}>
      <div style={productMockGlowStyle} />
      {isBeauty ? (
        <>
          <Bottle style={{ left: "21%", top: "18%", transform: "rotate(-7deg)" }} tone="#9BC8FF" label="SHAMPOO" />
          <Bottle style={{ right: "23%", top: "26%", transform: "rotate(6deg) scale(.92)" }} tone="#A5E5C7" label="CARE" />
        </>
      ) : isFood ? (
        <>
          <FoodBox style={{ left: "16%", top: "30%", transform: "rotate(-5deg)" }} />
          <FoodBox style={{ right: "16%", top: "26%", transform: "rotate(7deg) scale(.9)" }} />
        </>
      ) : (
        <>
          <Pack style={{ left: "3%", top: "16%", transform: "scale(.86)" }} />
          <Pack style={{ right: "2%", top: "24%", transform: "scale(.78)" }} />
          <Pack style={{ left: "23%", top: "45%", transform: "scale(1.05)" }} />
        </>
      )}
      <span style={mockCaptionStyle}>
        <ImageIcon size={13} strokeWidth={2.1} aria-hidden />
        이미지 준비중
      </span>
    </div>
  );
}

function Bottle({ style, tone, label }: { style: React.CSSProperties; tone: string; label: string }) {
  return (
    <div style={{ ...bottleStyle, ...style }}>
      <span style={{ ...bottleCapStyle, background: tone }} />
      <span style={{ ...bottleBodyStyle, borderColor: tone }}>
        <span style={{ ...bottleLabelStyle, background: tone }}>{label}</span>
      </span>
    </div>
  );
}

function FoodBox({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ ...foodBoxStyle, ...style }}>
      <span style={foodBoxLeafStyle} />
      <span style={foodBoxLabelStyle}>DAMARA</span>
    </div>
  );
}

function Pack({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 178, height: 76, borderRadius: "18px 18px 24px 24px", background: "#fff", boxShadow: "0 14px 32px rgba(30,64,175,.13)", overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", left: -8, top: -8, width: 72, height: 94, background: "#9bd38c", transform: "rotate(18deg)" }} />
      <div style={{ position: "absolute", right: -8, bottom: -14, width: 90, height: 48, borderRadius: "50%", background: "#9bd38c" }} />
      <div style={{ position: "absolute", left: 50, top: 17, right: 50, height: 32, borderRadius: 999, border: `1px solid ${grey200}`, background: "#fff", display: "grid", placeItems: "center", color: grey500, fontSize: 11, fontWeight: 900 }}>WIPES</div>
      <span style={{ position: "absolute", left: 16, bottom: 10, color: green600, fontSize: 9, fontWeight: 900 }}>100매</span>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={pillStyle}>
      {icon}
      {label}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={infoRowStyle}>
      <div style={infoLabelStyle}>
        {icon}
        <span>{label}</span>
      </div>
      <p style={infoValueStyle}>{value}</p>
    </div>
  );
}

function Avatar() {
  return (
    <div style={avatarStyle}>
      <Users size={22} color={blue500} fill="rgba(49,130,246,0.16)" />
    </div>
  );
}

function ParticipantCard({ person, index }: { person: Participant; index: number }) {
  const score = Number(person.trustGrade ?? (index === 0 ? 4.1 : 4.3)).toFixed(1);
  const nickname = person.nickname || person.user?.nickname || `참여자 ${index + 1}`;
  return (
    <div style={participantCardStyle}>
      <span style={avatarSmallStyle}>
        <Users size={15} color={blue500} fill="rgba(49,130,246,0.16)" />
      </span>
      <span style={participantNameStyle}>{nickname}</span>
      <span style={participantScoreStyle}>
        <GraduationCap size={14} strokeWidth={2.2} fill="rgba(49,130,246,0.12)" />
        {score}
      </span>
    </div>
  );
}

function NoticeCard({ title, lines, icon }: { title: string; lines: string[]; icon: React.ReactNode; tone?: "guide" | "caution" }) {
  return (
    <section style={noticeCardStyle}>
      <div style={noticeHeaderStyle}>
        <span style={{ ...noticeIconStyle, color: blue600, background: "#F3F7FF" }}>{icon}</span>
        <h3 style={noticeTitleStyle}>{title}</h3>
      </div>
      <ul style={noticeListStyle}>
        {lines.map((line) => (
          <li key={line} style={noticeListItemStyle}>
            <span style={{ ...noticeDotStyle, background: "#75A7FF" }} aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div data-skeleton style={{ height: 250, borderRadius: 18 }} />
      <div data-skeleton style={{ height: 120, borderRadius: 16 }} />
      <div data-skeleton style={{ height: 110, borderRadius: 16 }} />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: "linear-gradient(180deg, #F6F9FF 0%, #F9FAFB 34%, #F9FAFB 100%)",
  color: grey900,
  paddingBottom: 78,
};

const headerStyle: React.CSSProperties = {
  height: 50,
  display: "grid",
  gridTemplateColumns: "38px 1fr 38px",
  alignItems: "center",
  padding: "0 12px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderBottom: `1px solid rgba(229, 232, 235, 0.76)`,
  position: "sticky",
  top: 0,
  zIndex: 20,
};

const headerButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: 0,
  borderRadius: 13,
  background: "transparent",
  color: grey900,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const ownerMenuStyle: React.CSSProperties = {
  position: "absolute",
  top: 42,
  right: 0,
  zIndex: 40,
  minWidth: 118,
  padding: 6,
  borderRadius: 14,
  border: `1px solid ${grey200}`,
  background,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.14), 0 2px 8px rgba(15, 23, 42, 0.06)",
};

const ownerMenuItemStyle: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 10px",
  border: 0,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  gap: 7,
  background: "transparent",
  color: grey900,
  fontSize: 12.5,
  fontWeight: 800,
  cursor: "pointer",
  textAlign: "left",
};

const headerTitleStyle: React.CSSProperties = {
  margin: 0,
  textAlign: "center",
  fontSize: 15,
  lineHeight: "22px",
  fontWeight: 900,
};

const mainStyle: React.CSSProperties = {
  padding: "10px 14px 132px",
  display: "flex",
  flexDirection: "column",
  gap: 11,
};

const cardBase: React.CSSProperties = {
  border: `1px solid ${grey200}`,
  borderRadius: 20,
  background,
  boxShadow: "0 10px 30px rgba(49, 130, 246, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
};

const heroCardStyle: React.CSSProperties = {
  ...cardBase,
  overflow: "hidden",
};

const heroImageStyle: React.CSSProperties = {
  position: "relative",
  height: 188,
  background: "radial-gradient(circle at 50% 30%, #ffffff 0%, #f3f8ff 36%, #e8f3ff 100%)",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
};

const heroOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.72) 100%)",
  pointerEvents: "none",
};

const heroProductImageStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: "calc(100% - 44px)",
  maxHeight: "calc(100% - 42px)",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  zIndex: 1,
};

const statusBadgeStyle: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: 12,
  borderRadius: 999,
  minHeight: 28,
  padding: "0 11px",
  background: "rgba(232, 255, 244, 0.92)",
  border: "1px solid rgba(22, 167, 101, 0.14)",
  color: green600,
  fontSize: 11,
  fontWeight: 850,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
};

const dotWrapStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 13,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  gap: 7,
};

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
};

const heroBodyStyle: React.CSSProperties = {
  padding: "14px 16px 17px",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-end",
};

const heroPillStackStyle: React.CSSProperties = {
  display: "inline-flex",
  flexShrink: 0,
};

const heroStatusTextStyle: React.CSSProperties = {
  display: "inline-flex",
  marginBottom: 5,
  color: blue600,
  background: blue50,
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 10.5,
  fontWeight: 850,
  lineHeight: "14px",
};

const miniMetaPillStyle: React.CSSProperties = {
  display: "none",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 19,
  fontWeight: 950,
  lineHeight: "26px",
  letterSpacing: 0,
};

const priceStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: blue600,
  fontSize: 22,
  fontWeight: 950,
  lineHeight: "28px",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  height: 32,
  border: `1px solid ${grey200}`,
  borderRadius: 999,
  padding: "0 11px",
  color: grey800,
  background: "#fff",
  fontSize: 11,
  fontWeight: 850,
  whiteSpace: "nowrap",
};

const summaryCardStyle: React.CSSProperties = {
  ...cardBase,
  padding: "13px 14px 14px",
  display: "grid",
  gap: 11,
};

const progressPanelStyle: React.CSSProperties = {
  position: "relative",
  padding: "13px 14px 14px",
  borderRadius: 17,
  background: "linear-gradient(135deg, #F1F7FF 0%, #FFFFFF 100%)",
  border: "1px solid rgba(49, 130, 246, 0.12)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 10,
  alignItems: "center",
};

const progressPanelLabelStyle: React.CSSProperties = {
  margin: 0,
  color: grey500,
  fontSize: 10.5,
  fontWeight: 800,
  lineHeight: "15px",
};

const progressPanelTitleStyle: React.CSSProperties = {
  display: "block",
  marginTop: 2,
  color: grey900,
  fontSize: 15,
  fontWeight: 950,
  lineHeight: "20px",
};

const progressPercentPillStyle: React.CSSProperties = {
  minWidth: 48,
  height: 32,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: blue600,
  background: blue50,
  fontSize: 13,
  fontWeight: 950,
};

const progressPanelTrackStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  height: 7,
  borderRadius: 999,
  background: "#e8f0fb",
  overflow: "hidden",
};

const infoRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "94px 1fr",
  alignItems: "center",
  gap: 10,
  minHeight: 28,
};

const infoLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "#435185",
  fontSize: 11,
  fontWeight: 800,
};

const infoValueStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: "17px",
};

const sellerCardStyle: React.CSSProperties = {
  ...cardBase,
  padding: "13px 14px",
  display: "grid",
  gridTemplateColumns: "44px 1fr 92px",
  gap: 11,
  alignItems: "center",
};

const avatarStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 16,
  background: "linear-gradient(135deg,#e8f0ff,#f7fbff)",
  display: "grid",
  placeItems: "center",
};

const sectionSmallTitleStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 14,
  lineHeight: "19px",
  fontWeight: 900,
};

const sellerMetaStyle: React.CSSProperties = {
  margin: "4px 0 0",
  color: grey700,
  fontSize: 10.5,
  lineHeight: "15px",
};

const sellerStatsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 5,
  marginTop: 6,
  color: grey700,
  fontSize: 10,
  lineHeight: "15px",
  fontWeight: 750,
};

const tagRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 4,
  flexWrap: "wrap",
  marginTop: 7,
};

const softTagStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: "3px 7px",
  background: blue50,
  color: blue600,
  fontSize: 9,
  fontWeight: 850,
};

const mannerCardStyle: React.CSSProperties = {
  border: `1px solid ${grey200}`,
  borderRadius: 14,
  background: "linear-gradient(135deg, #f4f7ff, #ffffff)",
  padding: "9px 6px",
  textAlign: "center",
};

const mannerLabelStyle: React.CSSProperties = {
  margin: "2px 0 0",
  color: blue600,
  fontSize: 9.5,
  fontWeight: 900,
};

const mannerScoreStyle: React.CSSProperties = {
  margin: "4px 0 0",
  color: blue600,
  fontSize: 18,
  fontWeight: 950,
  lineHeight: "21px",
};

const mannerRankStyle: React.CSSProperties = {
  margin: "2px 0 0",
  color: blue600,
  fontSize: 9.5,
  fontWeight: 700,
};

const contentCardStyle: React.CSSProperties = {
  ...cardBase,
  padding: 15,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 14,
  fontWeight: 950,
  lineHeight: "20px",
};

const participantGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 10,
};

const participantCardStyle: React.CSSProperties = {
  border: "1px solid rgba(49, 130, 246, 0.12)",
  borderRadius: 14,
  padding: "9px 9px",
  display: "grid",
  gridTemplateColumns: "30px 1fr auto",
  gap: 7,
  alignItems: "center",
  background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)",
};

const avatarSmallStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 12,
  background: "linear-gradient(135deg,#e8f0ff,#f7fbff)",
  display: "grid",
  placeItems: "center",
};

const participantNameStyle: React.CSSProperties = {
  color: grey900,
  fontSize: 10.5,
  fontWeight: 750,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const participantScoreStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  color: blue600,
  fontSize: 13,
  fontWeight: 950,
};

const contentTextStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: grey700,
  whiteSpace: "pre-wrap",
  fontSize: 12,
  lineHeight: "18px",
  fontWeight: 550,
};

const noticeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 9,
};

const noticeCardStyle: React.CSSProperties = {
  ...cardBase,
  padding: "13px 14px",
  background: "#FFFFFF",
};

const noticeHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};

const noticeIconStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
};

const noticeTitleStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 12.5,
  fontWeight: 900,
};

const noticeListStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  margin: "10px 0 0",
  padding: 0,
  color: grey700,
  fontSize: 10.5,
  lineHeight: "16px",
  listStyle: "none",
};

const noticeListItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 7,
};

const noticeDotStyle: React.CSSProperties = {
  width: 4,
  height: 4,
  marginTop: 6,
  borderRadius: 999,
  flexShrink: 0,
};

const bottomBarStyle: React.CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: 0,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: 430,
  padding: "10px 14px max(10px, env(safe-area-inset-bottom, 0px))",
  display: "grid",
  gridTemplateColumns: "104px 1fr",
  gap: 8,
  background: "rgba(255,255,255,0.97)",
  borderTop: `1px solid ${grey200}`,
  boxSizing: "border-box",
  zIndex: 30,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const chatButtonStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 14,
  border: `1.5px solid ${blue500}`,
  background: "#fff",
  color: blue600,
  fontSize: 13,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  cursor: "pointer",
};

const participateButtonStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 14,
  border: 0,
  background: blue500,
  color: "#fff",
  fontSize: 14,
  fontWeight: 900,
  boxShadow: "0 10px 22px rgba(49, 130, 246, 0.22)",
  cursor: "pointer",
};

const ownerBottomNoticeStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  height: 46,
  borderRadius: 14,
  border: `1px solid ${grey200}`,
  background: grey50,
  color: grey600,
  display: "grid",
  placeItems: "center",
  fontSize: 13,
  fontWeight: 850,
};

const productMockFrameStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
};

const productMockGlowStyle: React.CSSProperties = {
  position: "absolute",
  width: 238,
  height: 124,
  borderRadius: "50%",
  background: "linear-gradient(90deg, rgba(49,130,246,0.08), rgba(32,201,151,0.08))",
  filter: "blur(2px)",
  transform: "translateY(20px)",
};

const mockCaptionStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: 24,
  transform: "translateX(-50%)",
  height: 28,
  padding: "0 11px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "rgba(255, 255, 255, 0.88)",
  border: "1px solid rgba(49, 130, 246, 0.12)",
  color: grey600,
  fontSize: 10.5,
  fontWeight: 850,
  boxShadow: "0 8px 22px rgba(15, 23, 42, 0.07)",
};

const bottleStyle: React.CSSProperties = {
  position: "absolute",
  width: 66,
  height: 120,
  display: "grid",
  justifyItems: "center",
  filter: "drop-shadow(0 16px 22px rgba(49, 130, 246, 0.14))",
};

const bottleCapStyle: React.CSSProperties = {
  width: 28,
  height: 16,
  borderRadius: "7px 7px 3px 3px",
  border: "1px solid rgba(255,255,255,.8)",
};

const bottleBodyStyle: React.CSSProperties = {
  width: 60,
  height: 94,
  borderRadius: "19px 19px 16px 16px",
  background: "linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.82))",
  border: "2px solid",
  display: "grid",
  placeItems: "center",
};

const bottleLabelStyle: React.CSSProperties = {
  width: 44,
  height: 32,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  color: "#fff",
  fontSize: 7,
  fontWeight: 950,
};

const foodBoxStyle: React.CSSProperties = {
  position: "absolute",
  width: 112,
  height: 78,
  borderRadius: 22,
  background: "#fff",
  boxShadow: "0 16px 28px rgba(49, 130, 246, 0.13)",
  overflow: "hidden",
};

const foodBoxLeafStyle: React.CSSProperties = {
  position: "absolute",
  right: -18,
  top: -20,
  width: 68,
  height: 74,
  borderRadius: "50%",
  background: "#A5E5C7",
};

const foodBoxLabelStyle: React.CSSProperties = {
  position: "absolute",
  left: 18,
  top: 24,
  color: blue600,
  fontSize: 12,
  fontWeight: 950,
};
