import { expect, test } from "@playwright/test";

test("회원가입은 명지대 이메일을 고정하고 정규화한 값을 전송한다", async ({ page }) => {
  let signupPayload: unknown;
  let sendPayload: unknown;
  let verifyPayload: unknown;

  await page.route("**/api/auth/email-verifications/send", async (route) => {
    sendPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        message: "VERIFICATION_EMAIL_SENT",
        expiresInSeconds: 300,
        resendAfterSeconds: 60,
      }),
    });
  });
  await page.route("**/api/auth/email-verifications/verify", async (route) => {
    verifyPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        verified: true,
        emailVerificationToken: "email-verification-token",
        expiresInSeconds: 900,
      }),
    });
  });

  await page.route("**/api/users", async (route) => {
    signupPayload = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/users/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "user-1", nickname: "테스터" }),
    });
  });

  await page.goto("/register");
  await page.getByLabel("닉네임").fill("  테스터  ");
  await page.getByLabel("학번 8자리").fill("20261234");
  const emailInput = page.getByLabel("명지대학교 이메일 아이디");
  await emailInput.fill(" Student ");
  await page.getByRole("button", { name: "이메일 인증번호 받기" }).click();

  await expect(page.getByLabel("이메일 인증번호 6자리")).toBeVisible();
  expect(sendPayload).toEqual({ email: "student@mju.ac.kr" });

  await page.getByLabel("이메일 인증번호 6자리").fill("381204");
  await page.getByRole("button", { name: "인증 확인" }).click();

  await expect(emailInput).toBeDisabled();
  await expect(page.getByText("명지대학교 이메일 인증이 완료되었어요.")).toBeVisible();
  expect(verifyPayload).toEqual({ email: "student@mju.ac.kr", code: "381204" });

  await page.getByRole("textbox", { name: "비밀번호", exact: true }).fill("damara123");
  await page.getByRole("textbox", { name: "비밀번호 확인", exact: true }).fill("damara123");

  await expect(page.getByText("@mju.ac.kr")).toBeVisible();
  await page.getByRole("button", { name: "회원가입" }).click();

  await expect(page).toHaveURL("/home");
  expect(signupPayload).toEqual({
    user: {
      email: "student@mju.ac.kr",
      passwordHash: "damara123",
      nickname: "테스터",
      studentId: "20261234",
      emailVerificationToken: "email-verification-token",
    },
  });
});

test("인증번호 발송 후 이메일을 바꾸면 인증 상태를 초기화한다", async ({ page }) => {
  await page.route("**/api/auth/email-verifications/send", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        message: "VERIFICATION_EMAIL_SENT",
        expiresInSeconds: 300,
        resendAfterSeconds: 60,
      }),
    });
  });

  await page.goto("/register");
  const emailInput = page.getByLabel("명지대학교 이메일 아이디");
  await emailInput.fill("student");
  await page.getByRole("button", { name: "이메일 인증번호 받기" }).click();
  await expect(page.getByLabel("이메일 인증번호 6자리")).toBeVisible();

  await emailInput.fill("changed");

  await expect(page.getByLabel("이메일 인증번호 6자리")).toBeHidden();
  await expect(page.getByRole("button", { name: "이메일 인증번호 받기" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "회원가입" })).toBeDisabled();
});

test("로그인은 숫자 8자리 학번만 API로 전송한다", async ({ page }) => {
  let loginPayload: unknown;

  await page.route("**/api/users/login", async (route) => {
    loginPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "user-2", nickname: "테스터" }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("학번 8자리").fill("20261234");
  await page.getByRole("textbox", { name: "비밀번호", exact: true }).fill("damara123");
  await page.getByRole("button", { name: "학번 기억" }).click();
  await page.getByRole("button", { name: "로그인", exact: true }).click();

  await expect(page).toHaveURL("/home");
  expect(loginPayload).toEqual({ studentId: "20261234", password: "damara123" });
  await expect.poll(() => page.evaluate(() => localStorage.getItem("damaraRememberedStudentId"))).toBe("20261234");
});

test("공구 등록은 0원 가격으로 다음 단계로 이동하지 않는다", async ({ page }) => {
  await page.goto("/create");
  await page.getByLabel("상품명").fill("공동구매 상품");
  await page.getByLabel("공구 제목").fill("함께 구매해요");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();

  await expect(page.getByText("가격과 인원을 입력해 주세요")).toBeVisible();
  await page.getByLabel("1인당 가격").fill("0");
  await page.getByLabel("모집 인원 (모집자 미포함)").fill("3");
  await page.getByRole("button", { name: "다음", exact: true }).click();

  await expect(page.getByText("가격과 모집 인원을 1명 이상 입력해 주세요.")).toBeVisible();
});

test("공구 등록은 선택한 다마라존을 pickupZoneId로 전송한다", async ({ page }) => {
  let createPayload: unknown;
  const userId = "11111111-1111-4111-8111-111111111111";

  await page.addInitScript(({ id }) => localStorage.setItem("userId", id), { id: userId });
  await page.route("**/api/pickup-zones", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "s2810",
            name: "S2810",
            displayName: "자연캠퍼스 S2810",
            description: "S동 2층 S2810 앞",
            isActive: true,
            sortOrder: 10,
          },
          {
            id: "dormitory-lobby",
            name: "기숙사 로비",
            displayName: "명지대 기숙사 로비",
            description: "기숙사 1층 로비",
            isActive: true,
            sortOrder: 20,
          },
        ],
        total: 2,
      }),
    });
  });
  await page.route("**/api/posts", async (route) => {
    createPayload = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "post-1" }) });
  });

  await page.goto("/create");
  await page.getByLabel("상품명").fill("공동구매 상품");
  await page.getByLabel("공구 제목").fill("함께 구매해요");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByLabel("1인당 가격").fill("5900");
  await page.getByLabel("모집 인원 (모집자 미포함)").fill("3");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "명지대 기숙사 로비" }).click();
  await page.getByLabel("마감일").fill("2099-01-10");
  await page.getByLabel("수령 예정일").fill("2099-01-11");
  await page.getByLabel("수령 시작 시간").fill("17:00");
  await page.getByLabel("수령 종료 시간").fill("19:00");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "등록하기" }).click();

  await expect(page.getByText("공구가 등록됐어요")).toBeVisible();
  expect(createPayload).toMatchObject({
    post: {
      minParticipants: 3,
      pickupType: "damara_zone",
      pickupZoneId: "dormitory-lobby",
      pickupStartTime: "17:00",
      pickupEndTime: "19:00",
    },
  });
  expect(JSON.stringify(createPayload)).not.toContain("pickupLocation");
});

test("직접 입력 수령 장소는 pickupLocation으로 전송한다", async ({ page }) => {
  let createPayload: unknown;
  const userId = "11111111-1111-4111-8111-111111111111";

  await page.addInitScript(({ id }) => localStorage.setItem("userId", id), { id: userId });
  await page.route("**/api/pickup-zones", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route("**/api/posts", async (route) => {
    createPayload = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "post-1" }) });
  });

  await page.goto("/create");
  await page.getByLabel("상품명").fill("공동구매 상품");
  await page.getByLabel("공구 제목").fill("함께 구매해요");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByLabel("1인당 가격").fill("5900");
  await page.getByLabel("모집 인원 (모집자 미포함)").fill("3");
  await page.getByRole("button", { name: "다음", exact: true }).click();

  await page.getByRole("button", { name: "직접 입력" }).click();
  await page.getByLabel("직접 입력 수령 장소").fill("명지대 정문 앞");
  await page.getByLabel("마감일").fill("2099-01-10");
  await page.getByLabel("수령 예정일").fill("2099-01-11");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "등록하기" }).click();

  await expect(page.getByText("공구가 등록됐어요")).toBeVisible();
  expect(createPayload).toMatchObject({
    post: {
      pickupType: "custom",
      pickupLocation: "명지대 정문 앞",
    },
  });
  expect(JSON.stringify(createPayload)).not.toContain("pickupZoneId");
});

test("홈 필터는 선택한 모집 상태로 목록을 다시 조회한다", async ({ page }) => {
  const requestedStatuses: string[] = [];

  await page.route("**/api/posts**", async (route) => {
    const url = new URL(route.request().url());
    requestedStatuses.push(url.searchParams.get("status") || "");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [], total: 0 }) });
  });

  await page.goto("/home");
  await expect(page.getByRole("button", { name: "필터" })).toBeVisible();
  await page.getByRole("button", { name: "필터" }).click();
  await page.getByRole("button", { name: "거래 완료" }).click();
  await page.getByRole("button", { name: "적용하기" }).click();

  await expect.poll(() => requestedStatuses).toContain("completed");
});

test("홈의 같은 공구는 한 곳에서 관심을 바꾸면 즉시 동기화된다", async ({ page }) => {
  const userId = "11111111-1111-4111-8111-111111111111";
  const post = {
    id: "post-1",
    authorId: "author-1",
    title: "동기화 테스트 공구",
    content: "관심 상태 동기화",
    price: 5900,
    minParticipants: 3,
    currentQuantity: 1,
    status: "open",
    deadline: "2099-01-10T00:00:00.000Z",
    pickupLocation: "명지대 정문 앞",
    isFavorite: false,
  };

  await page.addInitScript(({ id }) => localStorage.setItem("userId", id), { id: userId });
  await page.route("**/api/posts?**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [post], total: 1 }) });
  });
  await page.route(`**/api/posts/${post.id}/favorite`, async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ isFavorite: true }) });
  });

  await page.goto("/home");
  const favoriteButtons = page.locator("[data-favorite-button][aria-label='관심 등록']");
  await expect(favoriteButtons.first()).toBeVisible();
  const buttonCount = await favoriteButtons.count();
  expect(buttonCount).toBeGreaterThan(1);
  await favoriteButtons.first().click();

  await expect(page.locator("[data-favorite-button][aria-label='관심 해제']")).toHaveCount(buttonCount);
});

test("공구 작성 텍스트는 상품명 50자와 제목 30자를 넘기지 않는다", async ({ page }) => {
  await page.goto("/create");
  const productName = page.getByRole("textbox", { name: /^상품명/ });
  const title = page.getByRole("textbox", { name: /^공구 제목/ });

  await productName.fill("가".repeat(51));
  await title.fill("나".repeat(31));

  await expect(productName).toHaveValue("가".repeat(50));
  await expect(title).toHaveValue("나".repeat(30));
  await expect(page.getByText("50/50")).toBeVisible();
  await expect(page.getByText("30/30")).toBeVisible();
});

test("공구 작성 방식 팁은 안내 화면을 열고 작성 단계로 돌아온다", async ({ page }) => {
  await page.goto("/create");
  await page.getByLabel("상품명").fill("공동구매 상품");
  await page.getByLabel("공구 제목").fill("함께 구매해요");
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: /나중에도 변경할 수 있어요/ }).click();
  await expect(page.getByRole("heading", { name: "공구 방식 안내" })).toBeVisible();
  await page.getByRole("button", { name: "작성으로 돌아가기", exact: true }).click();
  await expect(page.getByText("공구 방식을 선택해 주세요")).toBeVisible();
  await page.getByRole("button", { name: "이전" }).click();
  await expect(page.getByRole("textbox", { name: /^상품명/ })).toHaveValue("공동구매 상품");
});

test("완료된 거래에서 서버 허용 태그로 평가를 제출한다", async ({ page }) => {
  let reviewPayload: unknown;
  const userId = "11111111-1111-4111-8111-111111111111";
  const authorId = "22222222-2222-4222-8222-222222222222";
  const postId = "33333333-3333-4333-8333-333333333333";

  await page.addInitScript(({ id }) => localStorage.setItem("userId", id), { id: userId });
  await page.route(new RegExp(`/api/posts/${postId}(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: postId,
        authorId,
        title: "완료된 공동구매",
        content: "평가 테스트",
        price: 1000,
        minParticipants: 2,
        currentQuantity: 2,
        status: "completed",
        deadline: "2026-08-01T00:00:00.000Z",
        author: { nickname: "모집자" },
      }),
    });
  });
  await page.route(`**/api/posts/${postId}/participants**`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ participants: [] }) });
  });
  await page.route(`**/api/posts/${postId}/participate/${userId}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isParticipant: true }) });
  });
  await page.route(`**/api/posts/${postId}/favorite/${userId}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isFavorite: false }) });
  });
  await page.route(`**/api/users/${authorId}/trust-summary`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ trustGrade: 3.8 }) });
  });
  await page.route(`**/api/posts/${postId}/reviews/eligibility`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        postId,
        targets: [{
          reviewee: { id: authorId, nickname: "모집자" },
          revieweeRole: "organizer",
          allowedTags: { positive: ["ON_TIME", "KIND_COMMUNICATION"], neutral: [], negative: ["LATE_FOR_PICKUP"] },
          status: "not_submitted",
          reviewId: null,
          expiresAt: "2026-08-08T00:00:00.000Z",
        }],
      }),
    });
  });
  await page.route(`**/api/posts/${postId}/reviews`, async (route) => {
    reviewPayload = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "review-1", status: "pending" }) });
  });

  await page.goto(`/post/${postId}`);
  await page.getByRole("button", { name: "작성", exact: true }).click();
  await page.getByRole("button", { name: "시간 약속을 잘 지켜요" }).click();
  await page.getByRole("button", { name: "평가 제출" }).click();

  await expect(page.getByText("평가를 제출했어요.")).toBeVisible();
  expect(reviewPayload).toEqual({ revieweeId: authorId, rating: "positive", tags: ["ON_TIME"] });
});

test("게시글과 참여자 거래 단계는 축소된 흐름으로 독립 변경된다", async ({ page }) => {
  let postStatusPayload: unknown;
  let participantStatusPayload: unknown;
  const ownerId = "11111111-1111-4111-8111-111111111111";
  const participantId = "22222222-2222-4222-8222-222222222222";
  const postId = "33333333-3333-4333-8333-333333333333";

  await page.addInitScript(({ id }) => localStorage.setItem("userId", id), { id: ownerId });
  await page.route(new RegExp(`/api/posts/${postId}(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: postId,
        authorId: ownerId,
        title: "단계 테스트 공동구매",
        content: "독립 단계 테스트",
        price: 1000,
        minParticipants: 2,
        currentQuantity: 2,
        status: "closed",
        deadline: "2026-08-30T00:00:00.000Z",
        isOwner: true,
        author: { nickname: "모집자" },
      }),
    });
  });
  await page.route(`**/api/posts/${postId}/status`, async (route) => {
    postStatusPayload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "completed" }) });
  });
  await page.route(`**/api/posts/${postId}/participants**`, async (route) => {
    if (route.request().method() === "PATCH") {
      participantStatusPayload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ participantStatus: "pickup_ready" }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        participants: [{
          userId: participantId,
          nickname: "참여자",
          participantStatus: "payment_pending",
          participantStatusLabel: "참여 확정",
          participantStatusStep: 2,
          participantStatusTotalSteps: 4,
          nextStatus: "pickup_ready",
          nextActionLabel: "입금 확인하기",
          nextActionActor: "organizer",
        }],
      }),
    });
  });
  await page.route(`**/api/posts/${postId}/participate/${ownerId}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isParticipant: false }) });
  });
  await page.route(`**/api/posts/${postId}/favorite/${ownerId}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isFavorite: false }) });
  });
  await page.route(`**/api/users/${ownerId}/trust-summary`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ trustGrade: 4.0 }) });
  });
  await page.route(`**/api/posts/${postId}/reviews/eligibility`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ postId, targets: [] }) });
  });

  await page.goto(`/post/${postId}`);

  await expect(page.getByText("게시글과 참여자 단계는 따로 움직여요.")).toBeVisible();
  await expect(page.getByText("게시글 전체 단계 · 2/3")).toBeVisible();
  await expect(page.getByText("참여 확정 · 2/4")).toBeVisible();
  await expect(page.getByText("거래 진행", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "입금 확인하기" }).click();
  await expect(page.getByText("입금 확인 · 3/4")).toBeVisible();
  expect(participantStatusPayload).toEqual({ participantStatus: "pickup_ready" });

  await page.getByRole("button", { name: "거래 완료하기" }).click();
  await expect(page.getByText("게시글 전체 단계 · 3/3")).toBeVisible();
  expect(postStatusPayload).toEqual({ status: "completed" });
});

test("채팅 참여자를 카테고리 또는 상세 내용으로 신고한다", async ({ page }) => {
  let reportPayload: unknown;
  let reportHeader: string | undefined;
  const currentUserId = "11111111-1111-4111-8111-111111111111";
  const reportedUserId = "22222222-2222-4222-8222-222222222222";
  const roomId = "33333333-3333-4333-8333-333333333333";
  const postId = "44444444-4444-4444-8444-444444444444";

  await page.addInitScript(({ id }) => localStorage.setItem("userId", id), { id: currentUserId });
  await page.route(`**/api/chat/rooms/user/${currentUserId}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [{
          id: roomId,
          postId,
          post: { id: postId, authorId: reportedUserId, title: "신고 테스트 공구", status: "open" },
          participants: [
            { userId: currentUserId, nickname: "나" },
            { userId: reportedUserId, nickname: "신고 대상" },
          ],
          unreadCount: 0,
        }],
      }),
    });
  });
  await page.route(`**/api/chat/rooms/${roomId}/messages**`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ messages: [] }) });
  });
  await page.route(`**/api/chat/rooms/${roomId}/read-all`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route(`**/api/posts/${postId}/participate/${currentUserId}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isParticipant: true }) });
  });
  await page.route(`**/api/chat/rooms/${roomId}/reports`, async (route) => {
    reportPayload = route.request().postDataJSON();
    reportHeader = await route.request().headerValue("x-user-id") ?? undefined;
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ message: "CHAT_REPORT_ACCEPTED", reportId: "55555555-5555-4555-8555-555555555555" }) });
  });

  await page.goto("/chat");
  await page.getByRole("button", { name: /신고 테스트 공구/ }).click();
  await page.getByRole("button", { name: "더보기" }).click();
  await page.getByRole("button", { name: "신고하기" }).click();

  await expect(page.getByRole("dialog", { name: "신고할 사용자 선택" })).toBeVisible();
  await expect(page.getByRole("button", { name: /신고 대상/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^나$/ })).toHaveCount(0);
  await page.getByRole("button", { name: /신고 대상/ }).click();
  await page.getByRole("button", { name: "다음" }).click();

  const submitButton = page.getByRole("button", { name: "신고 제출" });
  await expect(submitButton).toBeDisabled();
  await page.getByRole("button", { name: "욕설·비방" }).click();
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page.getByText("신고가 접수됐어요. 운영팀이 확인할게요.")).toBeVisible();
  expect(reportPayload).toEqual({ reportedUserId, category: "ABUSIVE_LANGUAGE" });
  expect(reportHeader).toBe(currentUserId);
});
