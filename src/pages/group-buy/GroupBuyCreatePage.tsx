import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { getImageUploadErrorMessage, uploadImage } from "../../shared/api/uploadApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { getCreatePostErrorFeedback } from "../../shared/utils/apiError";
import {
  blue50,
  blue500,
  blue600,
  grey50,
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  grey800,
  grey900,
} from "../../shared/constants/homeTheme";
import { getImageUrl } from "../../shared/utils/imageUrl";

type TradeType = "PRE_RECRUIT" | "POST_PURCHASE";

const CATEGORIES = [
  { label: "생활용품", value: "daily", icon: Home },
  { label: "먹거리", value: "food", icon: Utensils },
  { label: "뷰티·패션", value: "beauty", icon: ShoppingBag },
  { label: "학용품", value: "school", icon: GraduationCap },
];

const STEP_HINTS = ["상품 정보 입력", "공구 방식 선택", "조건 입력", "수령 정보 입력", "최종 확인"];

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

function toPickupTimeRange(value: string) {
  const matches = Array.from(value.matchAll(/(오전|오후)?\s*(\d{1,2})(?::(\d{2}))?\s*시?/g));
  const to24Hour = (match?: RegExpMatchArray) => {
    if (!match) return undefined;
    const meridiem = match[1];
    let hour = Number(match[2]);
    const minute = match[3] || "00";
    if (meridiem === "오후" && hour < 12) hour += 12;
    if (meridiem === "오전" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minute}`;
  };
  return {
    pickupStartTime: to24Hour(matches[0]),
    pickupEndTime: to24Hour(matches[1]),
  };
}

export default function GroupBuyCreatePage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<{ preview: string; url: string }[]>([]);
  const [productName, setProductName] = useState("");
  const [title, setTitle] = useState("");
  const [tradeType, setTradeType] = useState<TradeType>("PRE_RECRUIT");
  const [category, setCategory] = useState("daily");
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState("");
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => Math.round((step / 5) * 100), [step]);
  const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label ?? "생활용품";

  const isEditMode = Boolean(editId);

  useEffect(() => {
    if (!editId) return;
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    let cancelled = false;

    setLoading(true);
    getPostDetail(editId, userId)
      .then(({ data }) => {
        if (cancelled) return;
        setProductName(String(data.productName || data.title || ""));
        setTitle(String(data.title || ""));
        setTradeType(data.groupBuyType === "post_recruit" || data.groupBuyType === "post_purchase" ? "POST_PURCHASE" : "PRE_RECRUIT");
        setCategory(String(data.category || "daily"));
        setPrice(String(Math.floor(Number(data.price || 0))));
        setPeople(String(data.minParticipants || ""));
        setLocation(String(data.pickupLocation || ""));
        setPickupDate(toDateInputValue(data.pickupDate));
        setDeadline(toDateInputValue(data.deadline));
        setPickupTime([data.pickupStartTime, data.pickupEndTime].filter(Boolean).join(" ~ "));
        setDescription(String(data.content || ""));
        const loadedImages = Array.isArray(data.images)
          ? data.images
              .map((img: any) => getImageUrl(img?.imageUrl || img?.url || img))
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

  const canGoNext = () => {
    if (step === 1) return productName.trim() && title.trim();
    if (step === 2) return tradeType && category;
    if (step === 3) return Number(onlyDigits(price)) > 0 && Number(onlyDigits(people)) > 0;
    if (step === 4) return location.trim() && deadline.trim() && pickupDate.trim();
    return true;
  };

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - images.length);
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
        setImages((prev) => prev.filter((img) => img.preview !== preview));
      } finally {
        setLoading(false);
      }
    }

    e.target.value = "";
  };

  const handleNext = () => {
    if (!canGoNext()) {
      toast.error("필수 정보를 입력해 주세요.");
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
    if (!productName.trim() || !title.trim() || !price || !people || !location.trim() || !deadline || !pickupDate) {
      toast.error("필수 정보를 다시 확인해 주세요.");
      return;
    }
    if (images.some((image) => !image.url)) {
      toast.error("이미지 업로드가 끝난 뒤 등록해 주세요.");
      return;
    }

    try {
      setLoading(true);
      const pickupTimes = toPickupTimeRange(pickupTime);
      const payload = {
        title,
        productName,
        content: description || title,
        price: Number(onlyDigits(price)),
        minParticipants: Number(onlyDigits(people)),
        deadline: toDeadlineIso(deadline),
        pickupType: "custom",
        pickupLocation: location,
        pickupDate,
        ...pickupTimes,
        groupBuyType: tradeType === "PRE_RECRUIT" ? "pre_recruit" : "post_recruit",
        groupBuyMode: "normal",
        authorId: userId,
        images: images.map((img) => img.url).filter(Boolean),
        category,
      };

      if (editId) {
        await updatePost(editId, payload, userId);
      } else {
        await createPost(payload);
      }

      toast.success(editId ? "공구가 수정됐어요." : "공구가 등록됐어요.");
      nav(editId ? `/post/${editId}` : "/home", { replace: true });
    } catch (err) {
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

  return (
    <div data-page="공구 등록" style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" aria-label="뒤로가기" onClick={goBack} style={iconButtonStyle}>
          <ChevronLeft size={21} strokeWidth={2.25} color={grey900} aria-hidden />
        </button>
        <h1 style={headerTitleStyle}>공구 등록</h1>
        <span />
      </header>

      <main style={mainStyle}>
        <StepProgress step={step} progress={progress} />

        {step === 1 ? (
          <section>
            <StepTitle title="어떤 상품을 함께 구매할까요?" desc="사진과 상품명만 먼저 입력해 주세요." />

            <div style={stepOnePanelStyle}>
              <ImageUploadCard
                images={images}
                fileRef={fileRef}
                onSelectFile={handleSelectFile}
                onRemove={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
              />

              <div style={panelDividerStyle} />

              <BasicInfoCard
                productName={productName}
                title={title}
                onProductNameChange={(value) => setProductName(value.slice(0, 50))}
                onTitleChange={(value) => setTitle(value.slice(0, 30))}
              />
            </div>

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

            <StepNotice />

            <div style={categorySectionStyle}>
              <p style={categoryTitleStyle}>카테고리 <span style={categoryOptionalStyle}>(선택)</span></p>
              <div style={categoryGridStyle}>
                {CATEGORIES.map((item) => (
                  <CategoryPill
                    key={item.value}
                    active={category === item.value}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setCategory(item.value)}
                  />
                ))}
              </div>
              <p style={categoryHelperStyle}>정확한 카테고리는 나중에 수정할 수 있어요.</p>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <StepTitle title="가격과 인원을 입력해 주세요" desc="참여자가 바로 이해할 수 있게 간단히 적어요." />
            <div style={{ ...fieldGroupStyle, marginTop: 16 }}>
              <LabeledInput label="1인당 가격" value={money(price)} onChange={(value) => setPrice(onlyDigits(value))} placeholder="예: 5,900" suffix="원" inputMode="numeric" />
              <Divider />
              <LabeledInput label="모집 인원" value={onlyDigits(people)} onChange={(value) => setPeople(onlyDigits(value))} placeholder="예: 3" suffix="명" inputMode="numeric" plain />
            </div>
            <InfoBox title="목표 인원이 모이면" desc="참여자에게 채팅으로 수령 안내를 진행하면 돼요." />
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <StepTitle title="수령 정보를 알려주세요" desc="장소와 날짜는 나중에 채팅으로 조율할 수도 있어요." />
            <div style={{ ...fieldGroupStyle, marginTop: 16 }}>
              <LabeledInput label="수령 장소" value={location} onChange={setLocation} placeholder="예: 명지대 정문 앞" />
              <Divider />
              <DateInput label="마감일" value={deadline} onChange={setDeadline} />
              <Divider />
              <DateInput label="수령 예정일" value={pickupDate} onChange={setPickupDate} />
              <Divider />
              <LabeledInput label="예상 수령 시간" value={pickupTime} onChange={setPickupTime} placeholder="예: 오후 12시 ~ 오후 6시" plain />
            </div>
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

            <div style={{ marginTop: 14, ...sectionCardStyle, background: grey50 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 850 }}>등록 전 확인</p>
              <Review label="상품명" value={productName} />
              <Review label="공구 제목" value={title} />
              <Review label="공구 방식" value={tradeType === "PRE_RECRUIT" ? "함께구매" : "나눔구매"} />
              <Review label="카테고리" value={categoryLabel} />
              <Review label="가격" value={money(price) ? `${money(price)}원` : ""} />
              <Review label="모집 인원" value={people ? `${people}명` : ""} />
              <Review label="수령 장소" value={location} />
              <Review label="마감일" value={deadline} />
              <Review label="수령 예정일" value={pickupDate} />
              <Review label="수령 시간" value={pickupTime} />
              <Review label="상세 설명" value={description} multiline />
            </div>
          </section>
        ) : null}
      </main>

      <div style={ctaWrap}>
        <button type="button" onClick={goBack} disabled={loading} style={secondaryButtonStyle}>
          이전
        </button>
        <button type="button" onClick={step === 5 ? handleSubmit : handleNext} disabled={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.62 : 1 }}>
          {step === 5 ? "등록하기" : "다음"}
        </button>
      </div>
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
        <span style={{ ...progressFillStyle, width: `${progress}%` }} />
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
  fileRef: React.RefObject<HTMLInputElement | null>;
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
        {Array.from({ length: 5 }).map((_, index) => {
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

      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple hidden onChange={onSelectFile} />
      <div style={uploadGuideRowStyle}>
        <p style={uploadGuideStyle}>첫 사진을 기준으로 목록 썸네일이 만들어져요.</p>
        <span style={uploadCountBadgeStyle}>{images.length}/5</span>
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
        maxLength={50}
        onChange={onProductNameChange}
        onClear={() => onProductNameChange("")}
      />
      <div style={softDividerStyle} />
      <TextFieldWithMeta
        label="공구 제목"
        value={title}
        placeholder="예: 물티슈 함께 구매해요"
        maxLength={30}
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

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={fieldPlainStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle} />
    </label>
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

function StepNotice() {
  return (
    <div style={stepNoticeStyle}>
      <span style={noticeIconStyle}>
        <Lightbulb size={16} strokeWidth={2.25} aria-hidden />
      </span>
      <span style={{ minWidth: 0 }}>
        <strong style={noticeTitleStyle}>나중에도 변경할 수 있어요</strong>
        <span style={noticeDescStyle}>다음 단계에서도 방식을 바꿀 수 있어요.</span>
      </span>
      <ChevronRight size={18} color={grey400} strokeWidth={2.4} aria-hidden />
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

function TypeCard({ active, title, badge, desc, onClick }: { active: boolean; title: string; badge: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? "rgba(49, 130, 246, 0.26)" : "rgba(229, 233, 239, 0.92)"}`,
        borderRadius: 16,
        background: active ? "#f7fbff" : "#fff",
        padding: 14,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        gap: 10,
        boxShadow: active ? "0 8px 20px rgba(49, 130, 246, 0.09)" : "0 4px 14px rgba(15, 23, 42, 0.035)",
        transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
      }}
    >
      <span style={{ ...checkCircleStyle, borderColor: active ? blue500 : grey300, background: active ? blue500 : "#fff" }}>
        {active ? <Check size={12} strokeWidth={2.5} color="#fff" aria-hidden /> : null}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <strong style={{ color: grey900, fontSize: 14, fontWeight: 850, lineHeight: "20px" }}>{title}</strong>
          <span style={badgeStyle}>{badge}</span>
        </span>
        <span style={{ display: "block", marginTop: 6, color: grey600, fontSize: 12, lineHeight: "17px" }}>{desc}</span>
      </span>
    </button>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ minHeight: 31, borderRadius: 999, border: `1px solid ${active ? "rgba(49,130,246,0.24)" : "transparent"}`, background: active ? "#edf6ff" : "#f4f6f8", color: active ? blue600 : grey600, padding: "0 12px", fontSize: 12, fontWeight: 750, boxShadow: active ? "inset 0 0 0 1px rgba(49,130,246,0.02)" : "none" }}>
      {children}
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

const stepOnePanelStyle: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 24,
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(235,240,247,0.96)",
  boxShadow: "0 14px 34px rgba(30, 64, 175, 0.055), 0 2px 8px rgba(15, 23, 42, 0.025)",
  padding: "18px 15px 16px",
  boxSizing: "border-box",
};

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

const sectionCardStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.78)",
  borderRadius: 20,
  background: "rgba(255,255,255,0.72)",
  padding: 13,
  boxSizing: "border-box",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255,255,255,0.86)",
  backdropFilter: "blur(16px) saturate(150%)",
  WebkitBackdropFilter: "blur(16px) saturate(150%)",
};

const heroInputCardStyle: React.CSSProperties = {
  ...sectionCardStyle,
  marginTop: 16,
  padding: 12,
};

const imageUploadStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 124,
  border: "1px dashed rgba(143, 159, 181, 0.46)",
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(247,249,252,0.74) 100%)",
  color: blue500,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
};

const uploadIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 14,
  background: "rgba(234,242,255,0.94)",
  color: blue500,
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), 0 5px 14px rgba(49,130,246,0.08)",
};

const uploadTitleStyle: React.CSSProperties = {
  color: blue600,
  fontSize: 13.5,
  fontWeight: 850,
  lineHeight: "19px",
};

const uploadDescStyle: React.CSSProperties = {
  color: grey500,
  fontSize: 11,
  lineHeight: "16px",
};

const imageGridStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 12,
  overflowX: "auto",
};

const previewStyle: React.CSSProperties = {
  position: "relative",
  width: 60,
  height: 60,
  borderRadius: 12,
  overflow: "hidden",
  background: grey100,
  flexShrink: 0,
};

const removeImageStyle: React.CSSProperties = {
  position: "absolute",
  right: 4,
  top: 4,
  width: 18,
  height: 18,
  borderRadius: 999,
  border: 0,
  background: "rgba(25,31,40,0.78)",
  color: "#fff",
  display: "grid",
  placeItems: "center",
};

const fieldGroupStyle: React.CSSProperties = {
  marginTop: 12,
  border: "1px solid rgba(255,255,255,0.78)",
  borderRadius: 20,
  background: "rgba(255,255,255,0.72)",
  overflow: "hidden",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255,255,255,0.86)",
  backdropFilter: "blur(16px) saturate(150%)",
  WebkitBackdropFilter: "blur(16px) saturate(150%)",
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

const checkCircleStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 999,
  border: `1.5px solid ${grey300}`,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  marginTop: 1,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 20,
  borderRadius: 999,
  padding: "0 8px",
  color: blue600,
  background: "#edf6ff",
  fontSize: 10.5,
  fontWeight: 800,
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

const secondaryButtonStyle: React.CSSProperties = {
  height: 44,
  border: 0,
  borderRadius: 16,
  background: "rgba(255,255,255,0.66)",
  color: grey800,
  fontSize: 14,
  fontWeight: 850,
  cursor: "pointer",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
};

const primaryButtonStyle: React.CSSProperties = {
  height: 44,
  border: 0,
  borderRadius: 16,
  background: "rgba(49, 130, 246, 0.92)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 850,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 1px rgba(255,255,255,0.34), inset 0 -3px 7px rgba(18,87,190,0.16), 0 8px 18px rgba(49,130,246,0.22)",
};
