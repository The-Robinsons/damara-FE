import React, { useMemo, useRef, useState } from "react";
import { Camera, Check, ChevronLeft, MapPin, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { createPost } from "../../features/group-buy/api/groupBuyApi";
import { uploadImage } from "../../shared/api/uploadApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
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
  HOME_CANVAS,
} from "../../shared/constants/homeTheme";
import { getImageUrl } from "../../shared/utils/imageUrl";

type TradeType = "PRE_RECRUIT" | "POST_PURCHASE";

const CATEGORIES = [
  { label: "생활용품", value: "daily" },
  { label: "먹거리", value: "food" },
  { label: "뷰티·패션", value: "beauty" },
  { label: "학용품", value: "school" },
];

const STEP_LABELS = ["상품", "방식", "조건", "수령", "확인"];

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

function getDateInputValue(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function GroupBuyCreatePage() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<{ preview: string; url: string }[]>([]);
  const [productName, setProductName] = useState("도톰한 엠보싱 물티슈 100매");
  const [title, setTitle] = useState("물티슈 공동구매");
  const [tradeType, setTradeType] = useState<TradeType>("PRE_RECRUIT");
  const [category, setCategory] = useState("daily");
  const [price, setPrice] = useState("5900");
  const [people, setPeople] = useState("3");
  const [location, setLocation] = useState("명지대 정문앞");
  const [pickupDate, setPickupDate] = useState(() => getDateInputValue(5));
  const [deadline, setDeadline] = useState(() => getDateInputValue(3));
  const [pickupTime, setPickupTime] = useState("오후 12시 ~ 오후 6시");
  const [description, setDescription] = useState(
    "도톰한 엠보싱 원단으로 부드럽고 촉촉해요.\n모집이 완료되면 채팅으로 수령 시간과 장소를 안내드릴게요."
  );
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => Math.round((step / 5) * 100), [step]);
  const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label ?? "생활용품";

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
        toast.error("이미지 업로드에 실패했어요.");
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

    try {
      setLoading(true);
      await createPost({
        title,
        content: description || title,
        price: Number(onlyDigits(price)),
        minParticipants: Number(onlyDigits(people)),
        deadline: toDeadlineIso(deadline),
        pickupLocation: `${location}${pickupTime ? ` · ${pickupTime}` : ""}`,
        authorId: userId,
        images: images.map((img) => img.url).filter(Boolean),
        category,
      });

      toast.success("공구가 등록됐어요.");
      nav("/home");
    } catch (err) {
      console.error(err);
      toast.error("공구 등록에 실패했어요.");
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
            <StepTitle title="상품 정보를 알려주세요" desc="사진과 이름만 먼저 가볍게 채워요." />

            <div style={heroInputCardStyle}>
              <button type="button" onClick={() => fileRef.current?.click()} style={imageUploadStyle}>
                <span style={uploadIconStyle}>
                  <Camera size={24} strokeWidth={2} aria-hidden />
                </span>
                <span style={{ display: "grid", gap: 4 }}>
                  <strong style={uploadTitleStyle}>상품 이미지 추가</strong>
                  <span style={uploadDescStyle}>최대 5장까지 등록할 수 있어요</span>
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleSelectFile} />

              {images.length > 0 ? (
                <div style={imageGridStyle}>
                  {images.map((img, index) => (
                    <div key={img.preview} style={previewStyle}>
                      <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        aria-label="이미지 삭제"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        style={removeImageStyle}
                      >
                        <X size={11} strokeWidth={2.4} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={fieldGroupStyle}>
              <LabeledInput label="상품명" value={productName} onChange={setProductName} />
              <Divider />
              <LabeledInput label="공구 제목" value={title} onChange={setTitle} plain />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <StepTitle title="공구 방식을 선택해 주세요" desc="어떤 방식으로 함께 구매할지 정해요." />
            <div style={{ marginTop: 16, display: "grid", gap: 9 }}>
              <TypeCard
                active={tradeType === "PRE_RECRUIT"}
                title="같이 살 사람 모집"
                badge="함께구매"
                desc="참여자를 모은 뒤 목표 인원이 차면 구매해요."
                onClick={() => setTradeType("PRE_RECRUIT")}
              />
              <TypeCard
                active={tradeType === "POST_PURCHASE"}
                title="사둔 물건 나눔"
                badge="나눔구매"
                desc="이미 구매한 대용량 상품을 필요한 만큼 나눠요."
                onClick={() => setTradeType("POST_PURCHASE")}
              />
            </div>

            <div style={{ ...sectionCardStyle, marginTop: 12 }}>
              <p style={fieldLabelStyle}>카테고리</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                {CATEGORIES.map((item) => (
                  <Chip key={item.value} active={category === item.value} onClick={() => setCategory(item.value)}>
                    {item.label}
                  </Chip>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <StepTitle title="가격과 인원을 입력해 주세요" desc="참여자가 바로 이해할 수 있게 간단히 적어요." />
            <div style={{ ...fieldGroupStyle, marginTop: 16 }}>
              <LabeledInput label="1인당 가격" value={money(price)} onChange={(value) => setPrice(onlyDigits(value))} suffix="원" inputMode="numeric" />
              <Divider />
              <LabeledInput label="모집 인원" value={onlyDigits(people)} onChange={(value) => setPeople(onlyDigits(value))} suffix="명" inputMode="numeric" plain />
            </div>
            <InfoBox title="목표 인원이 모이면" desc="참여자에게 채팅으로 수령 안내를 진행하면 돼요." />
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <StepTitle title="수령 정보를 알려주세요" desc="장소와 날짜는 나중에 채팅으로 조율할 수도 있어요." />
            <div style={{ ...fieldGroupStyle, marginTop: 16 }}>
              <LabeledInput label="수령 장소" value={location} onChange={setLocation} />
              <Divider />
              <DateInput label="마감일" value={deadline} onChange={setDeadline} />
              <Divider />
              <DateInput label="수령 예정일" value={pickupDate} onChange={setPickupDate} />
              <Divider />
              <LabeledInput label="예상 수령 시간" value={pickupTime} onChange={setPickupTime} plain />
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
              <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} style={textareaStyle} />
              <p style={{ margin: "6px 2px 0", textAlign: "right", color: grey500, fontSize: 11 }}>{description.length} / 500</p>
            </div>

            <div style={{ marginTop: 14, ...sectionCardStyle, background: grey50 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 850 }}>등록 전 확인</p>
              <Review label="상품명" value={productName} />
              <Review label="공구 방식" value={tradeType === "PRE_RECRUIT" ? "함께구매" : "나눔구매"} />
              <Review label="카테고리" value={categoryLabel} />
              <Review label="가격" value={`${money(price)}원`} />
              <Review label="모집 인원" value={`${people}명`} />
              <Review label="수령 장소" value={location} />
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={stepPillStyle}>{step}</span>
          <span style={stepLabelStyle}>{STEP_LABELS[step - 1]}</span>
        </div>
        <span style={stepPercentStyle}>{progress}%</span>
      </div>
      <div style={progressTrackStyle}>
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

function LabeledInput({
  label,
  value,
  onChange,
  suffix,
  inputMode,
  plain,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  plain?: boolean;
}) {
  return (
    <label style={plain ? fieldPlainStyle : fieldShellStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle} />
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

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 10, marginTop: 10 }}>
      <span style={{ color: grey600, fontSize: 12, lineHeight: "18px" }}>{label}</span>
      <span style={{ color: grey900, fontSize: 12, lineHeight: "18px", textAlign: "right", fontWeight: 700 }}>{value}</span>
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

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: HOME_CANVAS,
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
  borderBottom: "1px solid rgba(229, 233, 239, 0.82)",
  background: "rgba(255,255,255,0.96)",
  backdropFilter: "blur(14px)",
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
  padding: "12px 16px 92px",
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
  padding: "10px 12px",
  marginBottom: 16,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(229, 233, 239, 0.88)",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.045)",
};

const stepPillStyle: React.CSSProperties = {
  minWidth: 24,
  height: 22,
  padding: "0 8px",
  borderRadius: 999,
  background: "#edf6ff",
  color: blue600,
  fontSize: 11.5,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const stepLabelStyle: React.CSSProperties = {
  color: grey500,
  fontSize: 11.5,
  fontWeight: 750,
};

const stepPercentStyle: React.CSSProperties = {
  color: grey400,
  fontSize: 11,
  fontWeight: 700,
};

const progressTrackStyle: React.CSSProperties = {
  height: 4,
  marginTop: 9,
  borderRadius: 999,
  background: "#e7ebf0",
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  display: "block",
  height: "100%",
  borderRadius: 999,
  background: "#4f7df3",
  transition: "width 180ms ease-out",
};

const sectionCardStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(229, 233, 239, 0.92)",
  borderRadius: 16,
  background: "#fff",
  padding: 13,
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
};

const heroInputCardStyle: React.CSSProperties = {
  ...sectionCardStyle,
  marginTop: 16,
  padding: 10,
};

const imageUploadStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 132,
  border: "1px dashed #ccd4de",
  borderRadius: 16,
  background: "#fbfcfe",
  color: blue500,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const uploadIconStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 12,
  background: "#edf6ff",
  color: blue500,
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
};

const uploadTitleStyle: React.CSSProperties = {
  color: blue600,
  fontSize: 13,
  fontWeight: 800,
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
  marginTop: 10,
  border: "1px solid rgba(229, 233, 239, 0.92)",
  borderRadius: 18,
  background: "#fff",
  overflow: "hidden",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.035)",
};

const fieldShellStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "11px 13px",
  boxSizing: "border-box",
};

const fieldPlainStyle: React.CSSProperties = {
  ...fieldShellStyle,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  color: grey600,
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
  fontSize: 14,
  fontWeight: 650,
  lineHeight: "20px",
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
  padding: "10px 16px max(10px, env(safe-area-inset-bottom, 0px))",
  borderTop: "1px solid rgba(229, 233, 239, 0.82)",
  background: "rgba(255,255,255,0.98)",
  boxShadow: "0 -8px 22px rgba(15, 23, 42, 0.05)",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "86px 1fr",
  gap: 8,
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 44,
  border: 0,
  borderRadius: 12,
  background: "#f1f3f5",
  color: grey800,
  fontSize: 14,
  fontWeight: 850,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  height: 44,
  border: 0,
  borderRadius: 12,
  background: "#4f7df3",
  color: "#fff",
  fontSize: 14,
  fontWeight: 850,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(49, 130, 246, 0.24)",
};
