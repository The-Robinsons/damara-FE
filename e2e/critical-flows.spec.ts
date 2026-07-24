import { expect, test } from "@playwright/test";

test("회원가입은 명지대 이메일을 고정하고 정규화한 값을 전송한다", async ({ page }) => {
  let signupPayload: unknown;

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
  await page.getByLabel("명지대학교 이메일 아이디").fill("student");
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
    },
  });
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
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByRole("button", { name: "다음" }).click();

  await expect(page.getByText("가격과 인원을 입력해 주세요")).toBeVisible();
  await page.getByLabel("1인당 가격").fill("0");
  await page.getByLabel("모집 인원").fill("3");
  await page.getByRole("button", { name: "다음" }).click();

  await expect(page.getByText("가격과 모집 인원을 1 이상으로 입력해 주세요.")).toBeVisible();
});
