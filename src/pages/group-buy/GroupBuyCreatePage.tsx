import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Home,
  Lightbulb,
  MapPin,
  Plus,
  ShoppingBag,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { createPost, getPostDetail, updatePost } from "../../features/group-buy/api/groupBuyApi";
import { getPickupZones } from "../../features/group-buy/api/pickupZoneApi";
import { getImageUploadErrorMessage, uploadImage } from "../../shared/api/uploadApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getCreatePostErrorFeedback } from "../../shared/utils/apiError";
import {
  blue500,
  blue600,
  grey50,
  grey100,
  grey200,
  grey400,
  grey500,
  grey600,
  grey700,
  grey800,
  grey900,
} from "../../shared/constants/homeTheme";
import { getImageUrl } from "../../shared/utils/imageUrl";
import type { ApiPickupZone, ApiPost } from "../../shared/api/swaggerTypes";
import ActionButton from "../../shared/components/damara/ActionButton";
import SurfaceCard from "../../shared/components/damara/SurfaceCard";

type TradeType = "PRE_RECRUIT" | "POST_PURCHASE";
type SubmitState = "idle" | "submitting" | "success";
type PickupType = "damara_zone" | "custom";

const CATEGORIES = [
  { label: "생활용품", value: "daily", icon: Home },
  { label: "먹거리", value: "food", icon: Utensils },
  { label: "뷰티·패션", value: "beauty", icon: ShoppingBag },
  { label: "학용품", value: "school", icon: GraduationCap },
];

const STEP_HINTS = ["상품 정보 입력", "공구 방식 선택", "조건 입력", "수령 정보 입력", "최종 확인"];
const MAX_IMAGES = 5;
const MAX_PRICE = 10_000_000;
const MAX_PARTICIPANTS = 100;
const MAX_PRODUCT_NAME_LENGTH = 50;
const MAX_TITLE_LENGTH = 30;

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function money(value: string) {
  const digits = onlyDigits(value);
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}

function toDeadlineIso(value: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getTodayInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function extractCreatedPostId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const post = typeof record.post === "object" && record.post ? record.post as Record<string, unknown> : undefined;
  const nestedData = typeof record.data === "object" && record.data ? record.data as Record<string, unknown> : undefined;
  const nestedPost = nestedData && typeof nestedData.post === "object" && nestedData.post
    ? nestedData.post as Record<string, unknown>
    : undefined;
  const createdPost = typeof record.createdPost === "object" && record.createdPost
    ? record.createdPost as Record<string, unknown>
    : undefined;
  const candidates = [
    record.id,
    record.postId,
    post?.id,
    post?.postId,
    nestedData?.id,
    nestedData?.postId,
    nestedPost?.id,
    createdPost?.id,
  ];
  const found = candidates.find((value) => value !== undefined && value !== null && String(value).trim());
  return found ? String(found) : null;
}

export default function GroupBuyCreatePage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<{ preview: string; url: string }[]>([]);
  const [productName, setProductName] = useState("");
  const [title, setTitle] = useState("");
  const [tradeType, setTradeType] = useState<TradeType>("PRE_RECRUIT");
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState("");
  const [location, setLocation] = useState("");
  const [pickupType, setPickupType] = useState<PickupType>("damara_zone");
  const [pickupZones, setPickupZones] = useState<ApiPickupZone[]>([]);
  const [selectedPickupZoneId, setSelectedPickupZoneId] = useState("");
  const [pickupZoneLoading, setPickupZoneLoading] = useState(true);
  const [pickupZoneError, setPickupZoneError] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [pickupStartTime, setPickupStartTime] = useState("");
  const [pickupEndTime, setPickupEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  const progress = useMemo(() => Math.round((step / 5) * 100), [step]);
  const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label ?? "미선택";

  const isEditMode = Boolean(editId);
  const today = getTodayInputValue();
  const priceValue = Number(onlyDigits(price));
  const participantValue = Number(onlyDigits(people));
  const selectedPickupZone = pickupZones.find((zone) => zone.id === selectedPickupZoneId);
  const pickupLocationLabel = pickupType === "damara_zone"
    ? selectedPickupZone?.displayName || selectedPickupZone?.name || location
    : location;

  useEffect(() => {
    let cancelled = false;

    getPickupZones()
      .then(({ data }) => {
        if (cancelled) return;
        const activeZones = data.items.filter((zone) => zone.isActive !== false);
        setPickupZones(activeZones);
        setSelectedPickupZoneId((current) => current || activeZones[0]?.id || "");
      })
      .catch(() => {
        if (!cancelled) setPickupZoneError(true);
      })
      .finally(() => {
        if (!cancelled) setPickupZoneLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editId) return;
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    let cancelled = false;

    setLoading(true);
    getPostDetail(editId, userId)
      .then(({ data }: { data: ApiPost }) => {
        if (cancelled) return;
        setProductName(String(data.productName || data.title || ""));
        setTitle(String(data.title || ""));
        setTradeType(data.groupBuyType === "post_recruit" || data.groupBuyType === "post_purchase" ? "POST_PURCHASE" : "PRE_RECRUIT");
        setCategory(data.category ? String(data.category) : null);
        setPrice(String(Math.floor(Number(data.price || 0))));
        setPeople(String(data.minParticipants || ""));
        setLocation(String(data.pickupLocation || ""));
        setPickupType(data.pickupType === "damara_zone" ? "damara_zone" : "custom");
        setSelectedPickupZoneId(String(data.pickupZoneId || ""));
        setPickupDate(toDateInputValue(data.pickupDate));
        setDeadline(toDateInputValue(data.deadline));
        setPickupStartTime(String(data.pickupStartTime || "").slice(0, 5));
        setPickupEndTime(String(data.pickupEndTime || "").slice(0, 5));
        setDescription(String(data.content || ""));
        const loadedImages = Array.isArray(data.images)
          ? data.images
              .map((img) => getImageUrl(typeof img === "string" ? img : img.imageUrl))
              .filter(Boolean)
              .map((url: string) => ({ preview: url, url }))
          : [];
        setImages(loadedImages);
      })
      .catch(() => toast.error("수정할 공구 정보를 불러오지 못했어요."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const getStepValidationError = (targetStep: number) => {
    if (targetStep === 1 && (!productName.trim() || !title.trim())) return "상품명과 공구 제목을 입력해 주세요.";
    if (targetStep === 2 && !tradeType) return "공구 방식을 선택해 주세요.";
    if (targetStep === 3) {
      if (priceValue <= 0 || participantValue <= 0) return "가격과 모집 인원을 1명 이상 입력해 주세요.";
      if (priceValue > MAX_PRICE) return "1인당 가격은 1,000만 원 이하로 입력해 주세요.";
      if (participantValue > MAX_PARTICIPANTS) return "모집 인원은 100명 이하로 입력해 주세요.";
    }
    if (targetStep === 4) {
      const hasPickupLocation = pickupType === "damara_zone"
        ? Boolean(selectedPickupZoneId && selectedPickupZone)
        : Boolean(location.trim());
      if (!hasPickupLocation || !deadline || !pickupDate) return "수령 장소와 날짜를 모두 입력해 주세요.";
      if (!isEditMode && deadline < today) return "마감일은 오늘 이후로 선택해 주세요.";
      if (pickupDate < deadline) return "수령 예정일은 마감일과 같거나 이후여야 해요.";
      if (Boolean(pickupStartTime) !== Boolean(pickupEndTime)) return "수령 시작 시간과 종료 시간을 모두 입력해 주세요.";
      if (pickupStartTime && pickupEndTime && pickupStartTime >= pickupEndTime) return "수령 종료 시간은 시작 시간보다 늦어야 해요.";
    }
    return null;
  };

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      toast.error("이미지는 최대 5장까지 등록할 수 있어요.");
      e.target.value = "";
      return;
    }
    if (selectedFiles.length > availableSlots) {
      toast.message(`이미지는 최대 5장까지 등록할 수 있어요. ${availableSlots}장만 추가했어요.`);
    }
    const files = selectedFiles.slice(0, availableSlots);
    if (files.length === 0) return;

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { preview, url: "" }]);

      try {
        setLoading(true);
        const res = await uploadImage(file);
        const imageUrl = getImageUrl(res.url);
        setImages((prev) => prev.map((img) => (img.preview === preview ? { ...img, url: imageUrl } : img)));
      } catch (err) {
        console.error("Image upload failed", err);
        toast.error(getImageUploadErrorMessage(err));
        URL.revokeObjectURL(preview);
        setImages((prev) => prev.filter((img) => img.preview !== preview));
      } finally {
        setLoading(false);
      }
    }

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const image = prev[index];
      if (image?.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview);
      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const handleNext = () => {
    const validationError = getStepValidationError(step);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      toast.error("로그인이 필요해요.");
      nav("/login");
      return;
    }
    const validationError = [1, 2, 3, 4]
      .map((targetStep) => getStepValidationError(targetStep))
      .find(Boolean);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (images.some((image) => !image.url)) {
      toast.error("이미지 업로드가 끝난 뒤 등록해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setSubmitState("submitting");
      const payload = {
        title,
        productName,
        content: description || title,
        price: priceValue,
        minParticipants: participantValue,
        deadline: toDeadlineIso(deadline),
        pickupType,
        ...(pickupType === "damara_zone"
          ? { pickupZoneId: selectedPickupZoneId }
          : { pickupLocation: location.trim() }),
        pickupDate,
        ...(pickupStartTime && pickupEndTime ? { pickupStartTime, pickupEndTime } : {}),
        groupBuyType: tradeType === "PRE_RECRUIT" ? "pre_recruit" : "post_recruit",
        groupBuyMode: "normal",
        authorId: userId,
        images: images.map((img) => img.url).filter(Boolean),
        category,
      };

      if (editId) {
        await updatePost(editId, payload, userId);
        setCreatedPostId(editId);
      } else {
        const { data } = await createPost(payload);
        setCreatedPostId(extractCreatedPostId(data));
      }

      setSubmitState("success");
    } catch (err) {
      setSubmitState("idle");
      console.error("공구 등록 실패", err);
      const feedback = getCreatePostErrorFeedback(err);
      toast.error(feedback.message);
      if (feedback.requiresLogin) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        nav("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      return;
    }
    nav(-1);
  };

  const openMethodGuide = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("guide", "method");
    nav({ search: `?${nextParams.toString()}` });
  };

  const closeMethodGuide = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("guide");
    const search = nextParams.toString();
    nav({ search: search ? `?${search}` : "" }, { replace: true });
  };

  if (searchParams.get("guide") === "method") {
    return <CreateMethodGuide onBack={closeMethodGuide} />;
  }

  if (submitState === "success") {
    return (
      <CreateSuccessPage
        isEditMode={isEditMode}
        postId={createdPostId}
        onGoPost={() => {
          if (createdPostId) {
            nav(`/post/${createdPostId}`, { replace: true });
            return;
          }
          nav("/my-posts", { replace: true });
        }}
        onGoHome={() => nav("/home", { replace: true })}
      />
    );
  }

  return (
    <div data-page="공구 등록" style={pageStyle}>
      <style>{createMotionStyle}</style>
      <header style={headerStyle}>
        <button type="button" aria-label="뒤로가기" onClick={goBack} style={iconButtonStyle}>
          <ChevronLeft size={21} strokeWidth={2.25} color={grey900} aria-hidden />
        </button>
        <h1 style={headerTitleStyle}>공구 등록</h1>
        <span />
      </header>

      <main style={mainStyle}>
        <StepProgress step={step} progress={progress} />

        <div key={step} className="damara-create-step">
        {step === 1 ? (
          <section>
            <StepTitle title="어떤 상품을 함께 구매할까요?" desc="사진과 상품명만 먼저 입력해 주세요." />

            <SurfaceCard as="div" padding="18px 15px 16px" style={stepOnePanelStyle}>
              <ImageUploadCard
                images={images}
                fileRef={fileRef}
                onSelectFile={handleSelectFile}
                onRemove={handleRemoveImage}
              />

              <div style={panelDividerStyle} />

              <BasicInfoCard
                productName={productName}
                title={title}
                onProductNameChange={(value) => setProductName(value.slice(0, MAX_PRODUCT_NAME_LENGTH))}
                onTitleChange={(value) => setTitle(value.slice(0, MAX_TITLE_LENGTH))}
              />
            </SurfaceCard>

          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <StepTitle title="공구 방식을 선택해 주세요" desc="어떤 방식으로 함께 구매할지 정해요." />
            <div style={methodListStyle}>
              <MethodOptionCard
                active={tradeType === "PRE_RECRUIT"}
                title="같이 살 사람 모집"
                badge="함께구매"
                desc="참여자를 모은 뒤 목표 인원이 차면 구매해요."
                icon={Users}
                onClick={() => setTradeType("PRE_RECRUIT")}
              />
              <MethodOptionCard
                active={tradeType === "POST_PURCHASE"}
                title="사둔 물건 나눔"
                badge="나눔구매"
                desc="이미 구매한 대용량 상품을 필요한 만큼 나눠요."
                icon={Box}
                accent="green"
                onClick={() => setTradeType("POST_PURCHASE")}
              />
            </div>

            <StepNotice onClick={openMethodGuide} />

            <div style={categorySectionStyle}>
              <p style={categoryTitleStyle}>카테고리 <span style={categoryOptionalStyle}>(선택)</span></p>
              <div style={categoryGridStyle}>
                {CATEGORIES.map((item) => (
                  <CategoryPill
                    key={item.value}
                    active={category === item.value}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setCategory((current) => current === item.value ? null : item.value)}
                  />
                ))}
              </div>
              <p style={categoryHelperStyle}>선택한 항목을 한 번 더 누르면 해제할 수 있어요.</p>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <StepTitle title="가격과 인원을 입력해 주세요" desc="참여자가 바로 이해할 수 있게 간단히 적어요." />
            <SurfaceCard as="div" padding={0} style={{ marginTop: 16, overflow: "hidden" }}>
              <LabeledInput label="1인당 가격" value={money(price)} onChange={(value) => setPrice(onlyDigits(value))} placeholder="예: 5,900" suffix="원" inputMode="numeric" />
              <Divider />
              <LabeledInput label="모집 인원 (모집자 미포함)" value={onlyDigits(people)} onChange={(value) => setPeople(onlyDigits(value))} placeholder="예: 3" suffix="명" inputMode="numeric" plain />
            </SurfaceCard>
            <InfoBox title="모집자 본인은 인원에 포함되지 않아요" desc="참여자를 3명 모집하려면 3명을 입력해 주세요. 목표 인원이 모이면 참여자에게 채팅으로 수령을 안내하면 돼요." />
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <StepTitle title="수령 정보를 알려주세요" desc="장소와 날짜는 나중에 채팅으로 조율할 수도 있어요." />
            <PickupLocationSelector
              pickupType={pickupType}
              pickupZones={pickupZones}
              selectedPickupZoneId={selectedPickupZoneId}
              location={location}
              loading={pickupZoneLoading}
              hasError={pickupZoneError}
              onPickupTypeChange={setPickupType}
              onSelectZone={setSelectedPickupZoneId}
              onLocationChange={setLocation}
            />
            <SurfaceCard as="div" padding={0} style={{ marginTop: 16, overflow: "hidden" }}>
              <DateInput label="마감일" value={deadline} onChange={setDeadline} min={isEditMode ? undefined : today} />
              <Divider />
              <DateInput label="수령 예정일" value={pickupDate} onChange={setPickupDate} min={deadline || today} />
              <Divider />
              <PickupTimeRangeInput
                startTime={pickupStartTime}
                endTime={pickupEndTime}
                onStartTimeChange={setPickupStartTime}
                onEndTimeChange={setPickupEndTime}
              />
            </SurfaceCard>
            <div style={locationTipStyle}>
              <span style={tipIconStyle}>
                <MapPin size={15} fill="rgba(49,130,246,0.12)" aria-hidden />
              </span>
              <span>
                <strong style={{ display: "block", color: grey900, fontSize: 12, lineHeight: "18px" }}>찾기 쉬운 장소가 좋아요</strong>
                <span style={{ display: "block", marginTop: 2, color: grey500, fontSize: 11, lineHeight: "16px" }}>
                  예: 학생회관 앞, 정문 앞, 기숙사 로비
                </span>
              </span>
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section>
            <StepTitle title="소개를 작성해 주세요" desc="마지막으로 상세 설명을 확인해요." />
            <div style={{ marginTop: 16 }}>
              <p style={subTitleStyle}>상세 설명</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="상품 특징, 구매 이유, 수령 방법처럼 참여자가 알아야 할 내용을 적어 주세요."
                style={textareaStyle}
              />
              <p style={{ margin: "6px 2px 0", textAlign: "right", color: grey500, fontSize: 11 }}>{description.length} / 500</p>
            </div>

            <SurfaceCard as="div" padding={13} style={{ marginTop: 14, background: grey50 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 850 }}>등록 전 확인</p>
              <Review label="상품명" value={productName} />
              <Review label="공구 제목" value={title} />
              <Review label="공구 방식" value={tradeType === "PRE_RECRUIT" ? "함께구매" : "나눔구매"} />
              <Review label="카테고리" value={categoryLabel} />
              <Review label="가격" value={money(price) ? `${money(price)}원` : ""} />
              <Review label="모집 인원 (모집자 미포함)" value={people ? `${people}명` : ""} />
              <Review label="수령 장소" value={pickupLocationLabel} />
              <Review label="마감일" value={deadline} />
              <Review label="수령 예정일" value={pickupDate} />
              <Review label="수령 시간" value={pickupStartTime && pickupEndTime ? `${pickupStartTime} ~ ${pickupEndTime}` : "미정"} />
              <Review label="상세 설명" value={description} multiline />
            </SurfaceCard>
          </section>
        ) : null}
        </div>
      </main>

      <div style={ctaWrap}>
        <ActionButton variant="secondary" size="compact" onClick={goBack} disabled={loading} style={{ width: "100%" }}>
          이전
        </ActionButton>
        <ActionButton size="compact" onClick={step === 5 ? handleSubmit : handleNext} disabled={loading} style={{ width: "100%" }}>
          {step === 5 ? "등록하기" : "다음"}
        </ActionButton>
      </div>

      {submitState === "submitting" ? <CreateSubmitOverlay isEditMode={isEditMode} /> : null}
    </div>
  );
}

function CreateSubmitOverlay({ isEditMode }: { isEditMode: boolean }) {
  return (
    <div role="status" aria-live="polite" style={submitOverlayStyle}>
      <style>{createMotionStyle}</style>
      <div style={submitCardStyle}>
        <span className="damara-submit-orb" style={submitOrbStyle}>
          <span className="damara-submit-ring" style={submitOrbRingStyle} />
          <span style={submitOrbCoreStyle}>
            <Check size={27} strokeWidth={3} aria-hidden />
          </span>
        </span>
        <strong style={submitTitleStyle}>{isEditMode ? "공구를 수정하고 있어요" : "공구를 등록하고 있어요"}</strong>
        <p style={submitDescStyle}>입력한 내용을 정리하고 게시물 화면을 준비하는 중이에요.</p>
        <div style={submitProgressTrackStyle}>
          <span className="damara-submit-fill" style={submitProgressFillStyle} />
        </div>
      </div>
    </div>
  );
}

function CreateSuccessPage({
  isEditMode,
  postId,
  onGoPost,
  onGoHome,
}: {
  isEditMode: boolean;
  postId: string | null;
  onGoPost: () => void;
  onGoHome: () => void;
}) {
  return (
    <div data-page="공구 등록 완료" style={successPageStyle}>
      <style>{createMotionStyle}</style>
      <main style={successMainStyle}>
        <SurfaceCard className="damara-success-card" padding="32px 24px 24px" style={successCardStyle}>
          <span style={successBadgeStyle}>
            <span style={successPulseStyle} />
            <Check size={34} strokeWidth={3.1} aria-hidden />
          </span>
          <span style={successEyebrowStyle}>{isEditMode ? "수정 완료" : "등록 완료"}</span>
          <h1 style={successTitleStyle}>{isEditMode ? "공구 수정이 끝났어요" : "공구가 등록됐어요"}</h1>
          <p style={successDescriptionStyle}>
            {isEditMode
              ? "변경한 내용이 게시물에 반영됐어요. 바로 상세 화면에서 확인해볼 수 있어요."
              : "이제 참여자를 기다리면 돼요. 게시물 상세에서 모집 현황과 참여자를 바로 확인할 수 있어요."}
          </p>

          <div style={successInfoStyle}>
            <span style={successInfoIconStyle}>
              <Users size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <span>
              <strong style={successInfoTitleStyle}>다음 단계</strong>
              <span style={successInfoDescStyle}>게시물 상세에서 참여 현황을 확인하고 채팅으로 수령 정보를 조율해보세요.</span>
            </span>
          </div>

          <div style={successButtonGridStyle}>
            <ActionButton size="compact" onClick={onGoPost} style={successPrimaryButtonStyle}>
              <ExternalLink size={17} strokeWidth={2.3} aria-hidden />
              {postId ? "게시물 바로가기" : "내가 올린 공구 보기"}
            </ActionButton>
            <ActionButton variant="secondary" size="compact" onClick={onGoHome} style={successSecondaryButtonStyle}>
              홈으로 이동
            </ActionButton>
          </div>
        </SurfaceCard>
      </main>
    </div>
  );
}

function StepProgress({ step, progress }: { step: number; progress: number }) {
  return (
    <div style={progressShellStyle}>
      <div style={progressHeaderRowStyle}>
        <div style={progressTitleWrapStyle}>
          <span style={stepPillStyle}>STEP {step}</span>
        </div>
        <span style={progressHintStyle}>{STEP_HINTS[step - 1]}</span>
      </div>
      <div
        role="progressbar"
        aria-label={`공구 등록 진행률 ${progress}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        style={progressTrackStyle}
      >
        <span className="damara-create-progress-fill" style={{ ...progressFillStyle, width: `${progress}%` }} />
      </div>
    </div>
  );
}

function StepTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <h2 style={stepTitleStyle}>{title}</h2>
      <p style={stepDescStyle}>{desc}</p>
    </>
  );
}

function RequiredBadge() {
  return <span style={requiredBadgeStyle}>필수</span>;
}

function ImageUploadCard({
  images,
  fileRef,
  onSelectFile,
  onRemove,
}: {
  images: { preview: string; url: string }[];
  fileRef: React.RefObject<HTMLInputElement>;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div style={stepOneSectionStyle}>
      <div style={cardHeaderRowStyle}>
        <h3 style={sectionTitleStyle}>대표 상품 이미지</h3>
        <RequiredBadge />
      </div>
      <p style={sectionDescStyle}>첫 번째 이미지는 공구 목록에 대표 이미지로 보여요.</p>

      <div style={uploadSlotRowStyle}>
        {Array.from({ length: MAX_IMAGES }).map((_, index) => {
          const image = images[index];
          const isFirst = index === 0;

          if (image) {
            return (
              <div key={image.preview} style={isFirst ? uploadPrimarySlotStyle : uploadSlotStyle}>
                <img src={image.preview} alt="" style={uploadPreviewImageStyle} />
                {isFirst ? <span style={representativeBadgeStyle}>대표</span> : null}
                <button type="button" aria-label="이미지 삭제" onClick={() => onRemove(index)} style={slotRemoveButtonStyle}>
                  <X size={11} strokeWidth={2.4} aria-hidden />
                </button>
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={isFirst ? "상품 이미지 추가" : "이미지 슬롯"}
              style={isFirst ? uploadPrimarySlotEmptyStyle : uploadSlotEmptyStyle}
            >
              {isFirst ? (
                <>
                  <Camera size={20} strokeWidth={2.1} aria-hidden />
                  <span style={slotTextStyle}>사진 추가</span>
                </>
              ) : (
                <Plus size={17} strokeWidth={2.2} aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple hidden onChange={onSelectFile} />
      <div style={uploadGuideRowStyle}>
        <p style={uploadGuideStyle}>JPG, PNG, GIF, WEBP 이미지를 최대 5장 등록할 수 있어요.</p>
        <span style={uploadCountBadgeStyle}>{images.length}/{MAX_IMAGES}</span>
      </div>
    </div>
  );
}

function BasicInfoCard({
  productName,
  title,
  onProductNameChange,
  onTitleChange,
}: {
  productName: string;
  title: string;
  onProductNameChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}) {
  return (
    <div style={stepOneSectionStyle}>
      <h3 style={sectionTitleStyle}>공구 기본 정보</h3>
      <TextFieldWithMeta
        label="상품명"
        value={productName}
        placeholder="예: 도톰한 엠보싱 물티슈 100매"
        maxLength={MAX_PRODUCT_NAME_LENGTH}
        onChange={onProductNameChange}
        onClear={() => onProductNameChange("")}
      />
      <div style={softDividerStyle} />
      <TextFieldWithMeta
        label="공구 제목"
        value={title}
        placeholder="예: 물티슈 함께 구매해요"
        maxLength={MAX_TITLE_LENGTH}
        onChange={onTitleChange}
        onClear={() => onTitleChange("")}
        helper="추천 제목이에요. 자유롭게 수정할 수 있어요."
      />
    </div>
  );
}

function TextFieldWithMeta({
  label,
  value,
  placeholder,
  maxLength,
  helper,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  placeholder?: string;
  maxLength: number;
  helper?: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <label style={basicFieldBlockStyle}>
      <span style={labelRowStyle}>
        <span style={fieldLabelTextStyle}>{label}</span>
        <RequiredBadge />
      </span>
      <span style={basicInputShellStyle}>
        <input
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          style={basicInputStyle}
        />
        {value ? (
          <button type="button" aria-label={`${label} 지우기`} onClick={onClear} style={clearButtonStyle}>
            <X size={13} strokeWidth={2.4} aria-hidden />
          </button>
        ) : null}
      </span>
      <span style={fieldMetaRowStyle}>
        {helper ? <span style={helperTextStyle}>{helper}</span> : <span />}
        <span style={countTextStyle}>
          {value.length}/{maxLength}
        </span>
      </span>
    </label>
  );
}

function PickupLocationSelector({
  pickupType,
  pickupZones,
  selectedPickupZoneId,
  location,
  loading,
  hasError,
  onPickupTypeChange,
  onSelectZone,
  onLocationChange,
}: {
  pickupType: PickupType;
  pickupZones: ApiPickupZone[];
  selectedPickupZoneId: string;
  location: string;
  loading: boolean;
  hasError: boolean;
  onPickupTypeChange: (value: PickupType) => void;
  onSelectZone: (id: string) => void;
  onLocationChange: (value: string) => void;
}) {
  const canSelectZone = !loading && pickupZones.length > 0;

  return (
    <div style={pickupSelectorStyle}>
      <div style={pickupSelectorHeaderStyle}>
        <span style={pickupSelectorLabelStyle}>수령 장소</span>
        <RequiredBadge />
      </div>
      <div role="group" aria-label="수령 장소 입력 방식" style={pickupTypeTabsStyle}>
        <button
          type="button"
          aria-pressed={pickupType === "damara_zone"}
          disabled={!canSelectZone}
          onClick={() => onPickupTypeChange("damara_zone")}
          style={pickupType === "damara_zone" ? pickupTypeTabActiveStyle : pickupTypeTabStyle}
        >
          다마라존
        </button>
        <button
          type="button"
          aria-pressed={pickupType === "custom"}
          onClick={() => onPickupTypeChange("custom")}
          style={pickupType === "custom" ? pickupTypeTabActiveStyle : pickupTypeTabStyle}
        >
          직접 입력
        </button>
      </div>

      {pickupType === "damara_zone" ? (
        <div aria-live="polite" style={pickupZoneListStyle}>
          {loading ? <p style={pickupZoneStatusStyle}>다마라존을 불러오는 중이에요.</p> : null}
          {!loading && hasError ? <p style={pickupZoneErrorStyle}>다마라존을 불러오지 못했어요. 직접 입력으로 계속할 수 있어요.</p> : null}
          {!loading && !hasError && pickupZones.map((zone) => {
            const selected = zone.id === selectedPickupZoneId;
            const zoneName = zone.displayName || zone.name;
            return (
              <button
                key={zone.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectZone(zone.id)}
                style={selected ? pickupZoneOptionActiveStyle : pickupZoneOptionStyle}
              >
                <span style={selected ? pickupZoneIconActiveStyle : pickupZoneIconStyle}>
                  {selected ? <Check size={15} strokeWidth={3} aria-hidden /> : <MapPin size={15} strokeWidth={2.35} aria-hidden />}
                </span>
                <span style={pickupZoneTextStyle}>
                  <strong style={pickupZoneNameStyle}>{zoneName}</strong>
                  {zone.description ? <span style={pickupZoneDescriptionStyle}>{zone.description}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <label style={customPickupInputStyle}>
          <span style={fieldLabelStyle}>직접 입력</span>
          <input
            aria-label="직접 입력 수령 장소"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="예: 명지대 정문 앞"
            style={fieldInputStyle}
          />
        </label>
      )}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  inputMode,
  plain,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  plain?: boolean;
}) {
  return (
    <label style={plain ? fieldPlainStyle : fieldShellStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input value={value} placeholder={placeholder} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle} />
        {suffix ? <span style={{ color: grey500, fontSize: 13, fontWeight: 750 }}>{suffix}</span> : null}
      </span>
    </label>
  );
}

function DateInput({ label, value, onChange, min }: { label: string; value: string; onChange: (value: string) => void; min?: string }) {
  return (
    <label style={fieldPlainStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input type="date" value={value} min={min} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle} />
    </label>
  );
}

function PickupTimeRangeInput({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}) {
  return (
    <fieldset style={timeRangeFieldsetStyle}>
      <legend style={fieldLabelStyle}>예상 수령 시간</legend>
      <div style={timeRangeGridStyle}>
        <label style={timeInputLabelStyle}>
          <span style={timeInputCaptionStyle}>시작</span>
          <input aria-label="수령 시작 시간" type="time" value={startTime} onChange={(event) => onStartTimeChange(event.target.value)} style={fieldInputStyle} />
        </label>
        <span aria-hidden style={timeRangeSeparatorStyle}>~</span>
        <label style={timeInputLabelStyle}>
          <span style={timeInputCaptionStyle}>종료</span>
          <input aria-label="수령 종료 시간" type="time" value={endTime} onChange={(event) => onEndTimeChange(event.target.value)} style={fieldInputStyle} />
        </label>
      </div>
    </fieldset>
  );
}

function MethodOptionCard({
  active,
  title,
  badge,
  desc,
  icon: Icon,
  accent = "blue",
  onClick,
}: {
  active: boolean;
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  accent?: "blue" | "green";
  onClick: () => void;
}) {
  const isGreen = accent === "green";

  return (
    <button type="button" onClick={onClick} style={active ? methodCardActiveStyle : methodCardStyle}>
      <span style={active ? methodCheckActiveStyle : methodCheckStyle}>
        {active ? <Check size={15} strokeWidth={3} color="#fff" aria-hidden /> : null}
      </span>
      <span style={methodTextWrapStyle}>
        <span style={methodTitleRowStyle}>
          <strong style={methodTitleStyle}>{title}</strong>
          <span style={methodBadgeStyle}>{badge}</span>
        </span>
        <span style={methodDescStyle}>{desc}</span>
      </span>
      <span style={isGreen ? methodIconGreenStyle : methodIconBlueStyle}>
        <Icon size={21} strokeWidth={2.3} aria-hidden />
      </span>
    </button>
  );
}

function StepNotice({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={stepNoticeStyle}>
      <span style={noticeIconStyle}>
        <Lightbulb size={16} strokeWidth={2.25} aria-hidden />
      </span>
      <span style={{ minWidth: 0 }}>
        <strong style={noticeTitleStyle}>나중에도 변경할 수 있어요</strong>
        <span style={noticeDescStyle}>다음 단계에서도 방식을 바꿀 수 있어요.</span>
      </span>
      <ChevronRight size={18} color={grey400} strokeWidth={2.4} aria-hidden />
    </button>
  );
}

function CreateMethodGuide({ onBack }: { onBack: () => void }) {
  return (
    <div data-page="공구 방식 안내" style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" aria-label="공구 작성으로 돌아가기" onClick={onBack} style={iconButtonStyle}>
          <ChevronLeft size={21} strokeWidth={2.25} color={grey900} aria-hidden />
        </button>
        <h1 style={headerTitleStyle}>공구 방식 안내</h1>
        <span />
      </header>
      <main style={mainStyle}>
        <StepTitle title="어떤 방식으로 올릴지 알아볼까요?" desc="작성 중에도 다시 선택할 수 있어요." />
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <SurfaceCard as="section" padding={16} style={{ borderColor: "rgba(49,130,246,0.2)", background: "#F7FBFF" }}>
            <strong style={{ color: grey900, fontSize: 15, lineHeight: "22px" }}>같이 살 사람 모집</strong>
            <p style={{ margin: "6px 0 0", color: grey600, fontSize: 12.5, lineHeight: "19px" }}>구매 전에 참여자를 모아요. 목표 인원이 모이면 함께 주문하고 수령을 조율해요.</p>
          </SurfaceCard>
          <SurfaceCard as="section" padding={16} style={{ borderColor: "rgba(54, 179, 126, 0.2)", background: "#F6FCF9" }}>
            <strong style={{ color: grey900, fontSize: 15, lineHeight: "22px" }}>사둔 물건 나눔</strong>
            <p style={{ margin: "6px 0 0", color: grey600, fontSize: 12.5, lineHeight: "19px" }}>이미 구매한 대용량 상품을 필요한 만큼 나눠요. 수령 일정과 위치를 분명하게 적어 주세요.</p>
          </SurfaceCard>
        </div>
        <div style={{ ...locationTipStyle, marginTop: 16 }}>
          <span style={tipIconStyle}><Lightbulb size={15} aria-hidden /></span>
          <span style={{ color: grey600, fontSize: 12, lineHeight: "18px" }}>공구 방식은 등록 전까지 언제든 바꿀 수 있어요.</span>
        </div>
      </main>
      <div style={ctaWrap}>
        <ActionButton size="compact" onClick={onBack} style={{ gridColumn: "1 / -1" }}>작성으로 돌아가기</ActionButton>
      </div>
    </div>
  );
}

function CategoryPill({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} style={active ? categoryPillActiveStyle : categoryPillStyle}>
      <Icon size={16} strokeWidth={2.25} aria-hidden />
      <span>{label}</span>
    </button>
  );
}

function InfoBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginTop: 12, borderRadius: 16, background: "#f1f7ff", padding: 13, display: "flex", gap: 10 }}>
      <span style={{ width: 32, height: 32, borderRadius: 12, background: "#fff", color: blue500, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Users size={17} fill="rgba(49,130,246,0.14)" aria-hidden />
      </span>
      <div>
        <p style={{ margin: 0, color: blue600, fontSize: 12.5, fontWeight: 850 }}>{title}</p>
        <p style={{ margin: "4px 0 0", color: grey600, fontSize: 11.5, lineHeight: "17px" }}>{desc}</p>
      </div>
    </div>
  );
}

function Review({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const displayValue = value.trim() || "입력되지 않음";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 10, marginTop: 10 }}>
      <span style={{ color: grey600, fontSize: 12, lineHeight: "18px" }}>{label}</span>
      <span
        style={{
          color: value.trim() ? grey900 : grey400,
          fontSize: 12,
          lineHeight: "18px",
          textAlign: "right",
          fontWeight: value.trim() ? 700 : 600,
          whiteSpace: multiline ? "pre-wrap" : "normal",
          overflowWrap: "anywhere",
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}

function Divider() {
  return <span aria-hidden style={{ display: "block", height: 1, background: grey100, margin: "0 13px" }} />;
}

const stepTitleStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 18,
  fontWeight: 900,
  lineHeight: "25px",
  letterSpacing: 0,
};

const stepDescStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: grey500,
  fontSize: 12,
  fontWeight: 550,
  lineHeight: "17px",
};

const stepOnePanelStyle: React.CSSProperties = { marginTop: 16 };

const stepOneSectionStyle: React.CSSProperties = {
  margin: 0,
};

const panelDividerStyle: React.CSSProperties = {
  height: 1,
  background: "#F0F3F7",
  margin: "18px 0 3px",
};

const cardHeaderRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: grey900,
  fontSize: 14,
  fontWeight: 850,
  lineHeight: "20px",
};

const sectionDescStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: grey500,
  fontSize: 11.5,
  fontWeight: 550,
  lineHeight: "17px",
};

const requiredBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 19,
  borderRadius: 999,
  padding: "0 7px",
  color: blue600,
  background: "rgba(234,242,255,0.96)",
  fontSize: 10.5,
  fontWeight: 850,
  lineHeight: "19px",
};

const uploadSlotRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: 8,
  marginTop: 14,
};

const uploadSlotStyle: React.CSSProperties = {
  position: "relative",
  aspectRatio: "1 / 1",
  minHeight: 0,
  borderRadius: 16,
  overflow: "hidden",
  background: "#F7F9FC",
  border: "1px solid #EEF2F6",
};

const uploadSlotEmptyStyle: React.CSSProperties = {
  ...uploadSlotStyle,
  border: "1px solid rgba(224, 230, 239, 0.92)",
  color: "rgba(49,130,246,0.82)",
  display: "grid",
  placeItems: "center",
  gap: 4,
  cursor: "pointer",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.88)",
};

const uploadPrimarySlotStyle: React.CSSProperties = {
  ...uploadSlotStyle,
  border: "1.5px solid rgba(49,130,246,0.46)",
  boxShadow: "0 6px 14px rgba(49,130,246,0.1)",
};

const uploadPrimarySlotEmptyStyle: React.CSSProperties = {
  ...uploadSlotEmptyStyle,
  border: "1.5px dashed rgba(49,130,246,0.5)",
  color: blue500,
  background: "linear-gradient(145deg, rgba(246,250,255,0.96) 0%, rgba(237,246,255,0.96) 100%)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.94), 0 6px 14px rgba(49,130,246,0.08)",
};

const uploadPreviewImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const representativeBadgeStyle: React.CSSProperties = {
  position: "absolute",
  left: 5,
  bottom: 5,
  height: 18,
  padding: "0 6px",
  borderRadius: 999,
  color: "#fff",
  background: "rgba(49,130,246,0.88)",
  fontSize: 9,
  fontWeight: 850,
  lineHeight: "18px",
  backdropFilter: "blur(6px)",
};

const slotTextStyle: React.CSSProperties = {
  color: blue600,
  fontSize: 10.5,
  fontWeight: 800,
  lineHeight: "14px",
};

const slotRemoveButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: 5,
  top: 5,
  width: 19,
  height: 19,
  borderRadius: 999,
  border: 0,
  background: "rgba(25,31,40,0.74)",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const uploadGuideRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginTop: 10,
};

const uploadGuideStyle: React.CSSProperties = {
  margin: 0,
  color: grey500,
  fontSize: 11,
  fontWeight: 550,
  lineHeight: "16px",
};

const uploadCountBadgeStyle: React.CSSProperties = {
  height: 21,
  minWidth: 34,
  padding: "0 7px",
  borderRadius: 999,
  color: grey500,
  background: "#F3F6FA",
  fontSize: 10,
  fontWeight: 800,
  lineHeight: "21px",
  textAlign: "center",
  flexShrink: 0,
};

const basicFieldBlockStyle: React.CSSProperties = {
  display: "block",
  marginTop: 12,
};

const labelRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 8,
};

const fieldLabelTextStyle: React.CSSProperties = {
  color: grey600,
  fontSize: 12,
  fontWeight: 800,
  lineHeight: "18px",
};

const basicInputShellStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 15,
  border: "1px solid #E1E7F0",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "0 10px 0 12px",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 1px rgba(15,23,42,0.015)",
};

const basicInputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: 0,
  outline: "none",
  background: "transparent",
  color: grey900,
  fontSize: 13.5,
  fontWeight: 700,
  lineHeight: "20px",
};

const clearButtonStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 999,
  border: 0,
  background: "#EEF1F5",
  color: grey500,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  flexShrink: 0,
};

const fieldMetaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  minHeight: 18,
  marginTop: 7,
};

const helperTextStyle: React.CSSProperties = {
  color: grey500,
  fontSize: 11,
  fontWeight: 550,
  lineHeight: "16px",
};

const countTextStyle: React.CSSProperties = {
  color: grey400,
  fontSize: 11,
  fontWeight: 700,
  lineHeight: "16px",
  whiteSpace: "nowrap",
};

const softDividerStyle: React.CSSProperties = {
  height: 1,
  margin: "14px 0 0",
  background: "#F0F3F7",
};

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background:
    "radial-gradient(circle at 50% -8%, rgba(49,130,246,0.08) 0%, rgba(246,248,252,0) 34%), #F6F8FC",
  color: grey900,
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  height: 50,
  display: "grid",
  gridTemplateColumns: "42px 1fr 42px",
  alignItems: "center",
  padding: "0 14px",
  flexShrink: 0,
  borderBottom: "1px solid rgba(255,255,255,0.72)",
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(16px) saturate(150%)",
  WebkitBackdropFilter: "blur(16px) saturate(150%)",
};

const headerTitleStyle: React.CSSProperties = {
  margin: 0,
  textAlign: "center",
  fontSize: 16,
  fontWeight: 900,
  lineHeight: "23px",
};

const mainStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 430,
  margin: "0 auto",
  padding: "14px 16px 104px",
  flex: 1,
  boxSizing: "border-box",
};

const iconButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: 0,
  background: "transparent",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const progressShellStyle: React.CSSProperties = {
  padding: "13px 14px 14px",
  marginBottom: 18,
  borderRadius: 20,
  background: "linear-gradient(145deg, rgba(255,255,255,0.86) 0%, rgba(248,251,255,0.8) 100%)",
  border: "1px solid rgba(235,240,247,0.88)",
  boxShadow: "0 10px 24px rgba(30,64,175,0.045), inset 0 1px 1px rgba(255,255,255,0.9)",
};

const progressHeaderRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const progressTitleWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const stepPillStyle: React.CSSProperties = {
  minWidth: 48,
  height: 22,
  padding: "0 9px",
  borderRadius: 999,
  background: "rgba(49,130,246,0.11)",
  color: blue600,
  fontSize: 10,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  letterSpacing: 0,
};

const progressHintStyle: React.CSSProperties = {
  color: grey500,
  fontSize: 11.5,
  fontWeight: 700,
  lineHeight: "18px",
};

const progressTrackStyle: React.CSSProperties = {
  height: 5,
  marginTop: 12,
  borderRadius: 999,
  background: "rgba(225, 231, 240, 0.78)",
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  display: "block",
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #3182F6 0%, #7AA7FF 100%)",
  boxShadow: "0 3px 8px rgba(49,130,246,0.18)",
  transition: "width 220ms ease-out",
};

const methodListStyle: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gap: 8,
};

const methodCardStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 82,
  border: "1px solid rgba(229,233,239,0.92)",
  borderRadius: 20,
  background: "rgba(255,255,255,0.88)",
  boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
  padding: "12px 13px",
  display: "grid",
  gridTemplateColumns: "27px 1fr 48px",
  alignItems: "center",
  gap: 9,
  textAlign: "left",
  cursor: "pointer",
  boxSizing: "border-box",
};

const methodCardActiveStyle: React.CSSProperties = {
  ...methodCardStyle,
  border: "1.4px solid rgba(49,130,246,0.42)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,251,255,0.92) 100%)",
  boxShadow: "0 10px 26px rgba(49,130,246,0.09)",
};

const methodCheckStyle: React.CSSProperties = {
  width: 23,
  height: 23,
  borderRadius: 999,
  border: "1.5px solid #D7DEE8",
  background: "#fff",
  display: "grid",
  placeItems: "center",
};

const methodCheckActiveStyle: React.CSSProperties = {
  ...methodCheckStyle,
  border: "1.5px solid #4F7DF3",
  background: "linear-gradient(180deg, #6B8DFF 0%, #3182F6 100%)",
  boxShadow: "0 7px 14px rgba(49,130,246,0.2)",
};

const methodTextWrapStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 5,
};

const methodTitleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const methodTitleStyle: React.CSSProperties = {
  color: grey900,
  fontSize: 14.5,
  fontWeight: 900,
  lineHeight: "20px",
};

const methodBadgeStyle: React.CSSProperties = {
  height: 20,
  borderRadius: 999,
  padding: "0 8px",
  background: "rgba(234,242,255,0.95)",
  color: blue600,
  fontSize: 10.5,
  fontWeight: 850,
  display: "inline-flex",
  alignItems: "center",
};

const methodDescStyle: React.CSSProperties = {
  color: grey600,
  fontSize: 11.5,
  fontWeight: 600,
  lineHeight: "16px",
};

const methodIconBlueStyle: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 999,
  background: "rgba(234,242,255,0.86)",
  color: blue500,
  display: "grid",
  placeItems: "center",
};

const methodIconGreenStyle: React.CSSProperties = {
  ...methodIconBlueStyle,
  background: "rgba(231,247,236,0.92)",
  color: "#4AB66A",
};

const stepNoticeStyle: React.CSSProperties = {
  marginTop: 12,
  minHeight: 62,
  borderRadius: 18,
  background: "linear-gradient(90deg, rgba(244,247,255,0.92) 0%, rgba(255,255,255,0.82) 100%)",
  border: "1px solid rgba(238,242,246,0.86)",
  boxShadow: "0 8px 20px rgba(15,23,42,0.035)",
  display: "grid",
  gridTemplateColumns: "36px 1fr 22px",
  alignItems: "center",
  gap: 7,
  padding: "0 12px",
  boxSizing: "border-box",
};

const noticeIconStyle: React.CSSProperties = {
  width: 31,
  height: 31,
  borderRadius: 999,
  background: "rgba(234,242,255,0.95)",
  color: blue500,
  display: "grid",
  placeItems: "center",
};

const noticeTitleStyle: React.CSSProperties = {
  display: "block",
  color: grey900,
  fontSize: 12.5,
  fontWeight: 850,
  lineHeight: "18px",
};

const noticeDescStyle: React.CSSProperties = {
  display: "block",
  marginTop: 2,
  color: grey500,
  fontSize: 10.8,
  fontWeight: 600,
  lineHeight: "15px",
};

const categorySectionStyle: React.CSSProperties = {
  marginTop: 18,
};

const categoryTitleStyle: React.CSSProperties = {
  margin: 0,
  color: grey800,
  fontSize: 13,
  fontWeight: 850,
  lineHeight: "19px",
};

const categoryOptionalStyle: React.CSSProperties = {
  color: grey500,
  fontWeight: 700,
};

const categoryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 7,
  marginTop: 10,
};

const categoryPillStyle: React.CSSProperties = {
  minHeight: 40,
  borderRadius: 15,
  border: "1px solid rgba(229,233,239,0.92)",
  background: "rgba(255,255,255,0.86)",
  color: grey600,
  boxShadow: "0 7px 16px rgba(15,23,42,0.035)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};

const categoryPillActiveStyle: React.CSSProperties = {
  ...categoryPillStyle,
  border: "1.2px solid rgba(49,130,246,0.44)",
  background: "rgba(238,244,255,0.9)",
  color: blue600,
  boxShadow: "0 8px 18px rgba(49,130,246,0.08)",
};

const categoryHelperStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: grey500,
  fontSize: 10.8,
  fontWeight: 600,
  lineHeight: "16px",
};

const fieldShellStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "13px 14px",
  boxSizing: "border-box",
};

const fieldPlainStyle: React.CSSProperties = {
  ...fieldShellStyle,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  color: grey500,
  fontSize: 11.5,
  lineHeight: "17px",
  marginBottom: 5,
  fontWeight: 700,
};

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: 0,
  outline: "none",
  color: grey900,
  fontSize: 14.5,
  fontWeight: 750,
  lineHeight: "21px",
  background: "transparent",
};

const timeRangeFieldsetStyle: React.CSSProperties = {
  ...fieldPlainStyle,
  margin: 0,
  border: 0,
};

const timeRangeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 14px minmax(0, 1fr)",
  alignItems: "end",
  gap: 8,
};

const timeInputLabelStyle: React.CSSProperties = {
  minWidth: 0,
  padding: "8px 10px",
  borderRadius: 10,
  background: grey50,
  border: `1px solid ${grey200}`,
};

const timeInputCaptionStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 3,
  color: grey500,
  fontSize: 10.5,
  fontWeight: 700,
};

const timeRangeSeparatorStyle: React.CSSProperties = {
  paddingBottom: 11,
  color: grey500,
  fontSize: 13,
  fontWeight: 800,
  textAlign: "center",
};

const pickupSelectorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  border: "1px solid rgba(229, 233, 239, 0.92)",
  borderRadius: 16,
  background: "#fff",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.035)",
};

const pickupSelectorHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
};

const pickupSelectorLabelStyle: React.CSSProperties = {
  color: grey900,
  fontSize: 13,
  fontWeight: 850,
  lineHeight: "20px",
};

const pickupTypeTabsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  marginTop: 11,
  padding: 4,
  borderRadius: 12,
  background: "#F3F6FA",
};

const pickupTypeTabStyle: React.CSSProperties = {
  minHeight: 34,
  border: 0,
  borderRadius: 9,
  background: "transparent",
  color: grey500,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const pickupTypeTabActiveStyle: React.CSSProperties = {
  ...pickupTypeTabStyle,
  background: "#fff",
  color: blue600,
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
};

const pickupZoneListStyle: React.CSSProperties = {
  display: "grid",
  gap: 7,
  marginTop: 10,
};

const pickupZoneOptionStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 58,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 11px",
  border: "1px solid #E7ECF2",
  borderRadius: 12,
  background: "#fff",
  color: grey900,
  textAlign: "left",
  cursor: "pointer",
};

const pickupZoneOptionActiveStyle: React.CSSProperties = {
  ...pickupZoneOptionStyle,
  border: "1.5px solid rgba(49,130,246,0.55)",
  background: "rgba(243, 248, 255, 0.9)",
  boxShadow: "0 5px 12px rgba(49,130,246,0.08)",
};

const pickupZoneIconStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: 10,
  color: grey500,
  background: "#F3F6FA",
};

const pickupZoneIconActiveStyle: React.CSSProperties = {
  ...pickupZoneIconStyle,
  color: "#fff",
  background: blue500,
};

const pickupZoneTextStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 2,
};

const pickupZoneNameStyle: React.CSSProperties = {
  color: grey900,
  fontSize: 12.5,
  fontWeight: 800,
  lineHeight: "18px",
};

const pickupZoneDescriptionStyle: React.CSSProperties = {
  color: grey500,
  fontSize: 10.5,
  fontWeight: 550,
  lineHeight: "15px",
  overflowWrap: "anywhere",
};

const pickupZoneStatusStyle: React.CSSProperties = {
  margin: "6px 0 2px",
  color: grey500,
  fontSize: 11.5,
  fontWeight: 650,
  lineHeight: "18px",
};

const pickupZoneErrorStyle: React.CSSProperties = {
  ...pickupZoneStatusStyle,
  color: grey600,
};

const customPickupInputStyle: React.CSSProperties = {
  display: "block",
  marginTop: 10,
  padding: "11px 12px",
  border: "1px solid #E7ECF2",
  borderRadius: 12,
  background: "#fff",
};

const locationTipStyle: React.CSSProperties = {
  marginTop: 12,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(229, 233, 239, 0.92)",
  padding: 12,
  display: "flex",
  gap: 10,
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.035)",
};

const tipIconStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 12,
  background: "#edf6ff",
  display: "grid",
  placeItems: "center",
  color: blue500,
  flexShrink: 0,
};

const subTitleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 13,
  fontWeight: 850,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  resize: "none",
  border: "1px solid rgba(229, 233, 239, 0.92)",
  borderRadius: 16,
  padding: 13,
  color: grey900,
  fontSize: 13,
  fontWeight: 550,
  lineHeight: "19px",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

const ctaWrap: React.CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: 0,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: 430,
  padding: "12px 16px max(12px, env(safe-area-inset-bottom, 0px))",
  borderTop: "1px solid rgba(255,255,255,0.72)",
  background: "rgba(255,255,255,0.66)",
  boxShadow: "0 -10px 26px rgba(15, 23, 42, 0.06), inset 0 1px 1px rgba(255,255,255,0.86)",
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "86px 1fr",
  gap: 8,
};


const createMotionStyle = `
  @keyframes damara-create-step-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes damara-submit-orb {
    0%, 100% { transform: scale(1); filter: saturate(1); }
    45% { transform: scale(1.055); filter: saturate(1.08); }
  }
  @keyframes damara-submit-ring {
    0% { opacity: 0.72; transform: scale(0.78); }
    100% { opacity: 0; transform: scale(1.75); }
  }
  @keyframes damara-submit-fill {
    0% { transform: translateX(-82%); }
    100% { transform: translateX(112%); }
  }
  @keyframes damara-success-pop {
    0% { opacity: 0; transform: translateY(10px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes damara-success-pulse {
    0%, 100% { opacity: 0.42; transform: scale(0.92); }
    50% { opacity: 0.08; transform: scale(1.42); }
  }
  @keyframes damara-success-content-enter {
    from { opacity: 0; transform: translateY(7px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .damara-create-step {
    animation: damara-create-step-enter 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .damara-create-progress-fill {
    transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .damara-success-card > * {
    animation: damara-success-content-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .damara-success-card > *:nth-child(1) { animation-delay: 60ms; }
  .damara-success-card > *:nth-child(2) { animation-delay: 105ms; }
  .damara-success-card > *:nth-child(3) { animation-delay: 145ms; }
  .damara-success-card > *:nth-child(4) { animation-delay: 185ms; }
  .damara-success-card > *:nth-child(5) { animation-delay: 225ms; }
  @media (prefers-reduced-motion: reduce) {
    .damara-create-step,
    .damara-success-card,
    .damara-success-card *,
    .damara-submit-orb,
    .damara-submit-ring,
    .damara-submit-fill {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const submitOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 180,
  display: "grid",
  placeItems: "center",
  padding: 22,
  background: "rgba(14, 20, 32, 0.48)",
  backdropFilter: "blur(14px) saturate(130%)",
  WebkitBackdropFilter: "blur(14px) saturate(130%)",
};

const submitCardStyle: React.CSSProperties = {
  width: "min(100%, 318px)",
  padding: "27px 22px 22px",
  borderRadius: 28,
  border: "1px solid rgba(234, 240, 249, 0.94)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.96) 100%)",
  boxShadow: "0 26px 68px rgba(0, 20, 52, 0.26), inset 0 1px 0 rgba(255,255,255,0.98)",
  textAlign: "center",
  boxSizing: "border-box",
};

const submitOrbStyle: React.CSSProperties = {
  position: "relative",
  width: 74,
  height: 74,
  margin: "0 auto 16px",
  display: "grid",
  placeItems: "center",
};

const submitOrbRingStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 999,
  background: "rgba(49, 130, 246, 0.18)",
  animation: "damara-submit-ring 1280ms ease-out infinite",
};

const submitOrbCoreStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: 62,
  height: 62,
  borderRadius: 22,
  display: "grid",
  placeItems: "center",
  color: "#FFFFFF",
  background: "linear-gradient(180deg, #6EA2FF 0%, #3182F6 100%)",
  boxShadow: "0 14px 28px rgba(49,130,246,0.28), inset 0 1px 0 rgba(255,255,255,0.38)",
  animation: "damara-submit-orb 980ms cubic-bezier(0.22, 1, 0.36, 1) infinite",
};

const submitTitleStyle: React.CSSProperties = {
  display: "block",
  color: grey900,
  fontSize: 18,
  fontWeight: 900,
  lineHeight: "25px",
  letterSpacing: "-0.03em",
};

const submitDescStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: grey500,
  fontSize: 12.5,
  fontWeight: 650,
  lineHeight: "19px",
};

const submitProgressTrackStyle: React.CSSProperties = {
  position: "relative",
  height: 6,
  marginTop: 19,
  borderRadius: 999,
  overflow: "hidden",
  background: "rgba(221, 230, 243, 0.86)",
};

const submitProgressFillStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "64%",
  borderRadius: 999,
  background: "linear-gradient(90deg, rgba(49,130,246,0) 0%, rgba(49,130,246,0.95) 45%, rgba(126,162,255,0) 100%)",
  animation: "damara-submit-fill 1180ms ease-in-out infinite",
};

const successPageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: "radial-gradient(circle at 50% -10%, rgba(49,130,246,0.16) 0%, rgba(246,248,252,0) 38%), #F6F8FC",
  color: grey900,
  display: "grid",
  placeItems: "center",
  padding: "24px 16px",
  boxSizing: "border-box",
};

const successMainStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 430,
};

const successCardStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "34px 20px 20px",
  borderRadius: 30,
  border: "1px solid rgba(234, 240, 249, 0.96)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.96) 100%)",
  boxShadow: "0 22px 58px rgba(30, 64, 175, 0.12), 0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.98)",
  textAlign: "center",
  animation: "damara-success-pop 420ms cubic-bezier(0.22, 1, 0.36, 1)",
};

const successBadgeStyle: React.CSSProperties = {
  position: "relative",
  width: 82,
  height: 82,
  margin: "0 auto 17px",
  borderRadius: 28,
  display: "grid",
  placeItems: "center",
  color: "#FFFFFF",
  background: "linear-gradient(180deg, #73A5FF 0%, #3182F6 100%)",
  boxShadow: "0 18px 38px rgba(49,130,246,0.28), inset 0 1px 0 rgba(255,255,255,0.4)",
};

const successPulseStyle: React.CSSProperties = {
  position: "absolute",
  inset: -10,
  borderRadius: 34,
  background: "rgba(49, 130, 246, 0.24)",
  animation: "damara-success-pulse 1600ms ease-in-out infinite",
};

const successEyebrowStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 26,
  padding: "0 11px",
  borderRadius: 999,
  color: blue600,
  background: "rgba(234,242,255,0.94)",
  fontSize: 11.5,
  fontWeight: 900,
};

const successTitleStyle: React.CSSProperties = {
  margin: "12px 0 0",
  color: grey900,
  fontSize: 23,
  fontWeight: 950,
  lineHeight: "31px",
  letterSpacing: "-0.04em",
};

const successDescriptionStyle: React.CSSProperties = {
  margin: "9px auto 0",
  maxWidth: 300,
  color: grey600,
  fontSize: 13,
  fontWeight: 650,
  lineHeight: "20px",
};

const successInfoStyle: React.CSSProperties = {
  marginTop: 22,
  padding: 14,
  borderRadius: 20,
  display: "flex",
  gap: 11,
  textAlign: "left",
  background: "rgba(246, 249, 255, 0.92)",
  border: "1px solid rgba(229, 235, 246, 0.92)",
};

const successInfoIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  color: blue600,
  background: "#FFFFFF",
  boxShadow: "0 5px 14px rgba(49,130,246,0.08)",
};

const successInfoTitleStyle: React.CSSProperties = {
  display: "block",
  color: grey900,
  fontSize: 13,
  fontWeight: 900,
  lineHeight: "19px",
};

const successInfoDescStyle: React.CSSProperties = {
  display: "block",
  marginTop: 3,
  color: grey500,
  fontSize: 11.5,
  fontWeight: 650,
  lineHeight: "17px",
};

const successButtonGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 9,
  marginTop: 20,
};

const successPrimaryButtonStyle: React.CSSProperties = {
  height: 48,
  border: 0,
  borderRadius: 17,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  color: "#FFFFFF",
  background: "linear-gradient(180deg, #4F95FF 0%, #3182F6 100%)",
  fontSize: 14,
  fontWeight: 900,
  boxShadow: "0 12px 24px rgba(49,130,246,0.24), inset 0 1px 0 rgba(255,255,255,0.28)",
  cursor: "pointer",
};

const successSecondaryButtonStyle: React.CSSProperties = {
  height: 46,
  border: "1px solid rgba(222, 229, 240, 0.96)",
  borderRadius: 17,
  color: grey700,
  background: "#FFFFFF",
  fontSize: 13.5,
  fontWeight: 850,
  cursor: "pointer",
};
