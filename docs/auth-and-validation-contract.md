# 인증 및 입력 검증 API 계약

이 문서는 프론트엔드에서 이미 제공하는 입력 검증을 서버에서도 동일하게 강제하기 위한 계약이다. 클라이언트 검증은 사용자 피드백용이며, 권한·입력값·상태 변경의 최종 판단은 반드시 서버가 한다.

## 공통 오류 응답

모든 4xx 응답은 아래 형식을 사용한다.

```json
{
  "error": "INVALID_STUDENT_ID",
  "message": "학번은 숫자 8자리여야 합니다.",
  "fieldErrors": {
    "studentId": "숫자 8자리로 입력해 주세요."
  }
}
```

- `error`는 프론트 분기용 고정 코드다.
- `message`는 사용자에게 바로 보여줄 수 있는 한국어 문구다.
- `fieldErrors`는 선택 항목이며, 폼 필드별 오류 표시에 사용한다.
- 인증되지 않은 요청은 `401`, 권한 없는 요청은 `403`, 중복 데이터는 `409`를 사용한다.

## 회원가입과 로그인

### `POST /api/users`

현재 프론트는 `{ "user": ... }` 래퍼를 사용한다. 서버는 아래 필드를 검증하고 `201`을 반환한다.

```json
{
  "user": {
    "email": "student@mju.ac.kr",
    "password": "plain-text-over-tls-only",
    "nickname": "테스터",
    "studentId": "20261234"
  }
}
```

| 필드 | 서버 강제 규칙 | 오류 코드 |
| --- | --- | --- |
| `email` | `@mju.ac.kr` 도메인, 중복 불가 | `INVALID_MJU_EMAIL`, `EMAIL_ALREADY_EXISTS` |
| `studentId` | 숫자 8자리, 중복 불가 | `INVALID_STUDENT_ID`, `STUDENT_ID_ALREADY_EXISTS` |
| `nickname` | 앞뒤 공백 제거 후 1~20자, 중복 불가 | `INVALID_NICKNAME`, `NICKNAME_ALREADY_EXISTS` |
| `password` | 영문과 숫자를 각각 포함한 8자 이상 | `WEAK_PASSWORD` |

현재 API 타입의 `passwordHash`는 실제 비밀번호가 전송되는 오해를 낳는다. 클라이언트는 TLS 연결을 통해 `password`만 전송하고, 비밀번호 해싱은 서버에서 수행하도록 `password`로 이름을 변경한다. 호환 기간에는 서버가 `passwordHash`를 받아도 내부적으로 `password`와 동일하게 처리하되, 프론트 전환 후 제거한다.

### `POST /api/users/login`

```json
{
  "studentId": "20261234",
  "password": "plain-text-over-tls-only"
}
```

- 성공 시 사용자 정보와 함께 `HttpOnly`, `Secure`, `SameSite=Lax` 세션 또는 refresh cookie를 설정한다.
- 실패 시 계정 존재 여부를 노출하지 않고 `401 INVALID_CREDENTIALS`를 반환한다.
- 로그인 유지 정책은 서버 세션의 만료 시간으로 결정한다. 프론트는 비밀번호나 장기 토큰을 Web Storage에 보관하지 않는다.

### 추가 인증 API

| 목적 | 제안 엔드포인트 | 성공 응답 |
| --- | --- | --- |
| 닉네임 중복 확인 | `GET /api/users/nickname-availability?nickname=...` | `{ "available": true }` |
| 비밀번호 재설정 메일 요청 | `POST /api/users/password-reset-requests` | `202` |
| 비밀번호 재설정 완료 | `POST /api/users/password-resets` | `204` |
| 명지대 이메일 인증 | `POST /api/users/email-verifications` | `202` |
| 이메일 인증 확인 | `POST /api/users/email-verifications/confirm` | `204` |

재설정과 이메일 인증 토큰은 단회 사용·짧은 만료 시간·rate limit을 적용한다.

## 공구 등록과 수정

`POST /api/posts`, `PATCH /api/posts/:id`는 프론트 제약과 같은 규칙을 강제한다.

| 필드 | 서버 강제 규칙 | 오류 코드 |
| --- | --- | --- |
| `price` | 정수, 1 이상 10,000,000 이하 | `INVALID_PRICE` |
| `minParticipants` | 정수, 1 이상 100 이하 | `INVALID_PARTICIPANT_COUNT` |
| `deadline` | 새 글은 현재 시각 이후 | `INVALID_DEADLINE` |
| `pickupDate` | 마감일과 같거나 이후 | `INVALID_PICKUP_DATE` |
| `pickupStartTime`, `pickupEndTime` | 둘 다 있거나 둘 다 없음, `HH:mm` | `INVALID_PICKUP_TIME` |
| `images` | 허용 형식과 최대 5장 | `INVALID_IMAGE_COUNT`, `INVALID_IMAGE_TYPE` |

수정 요청은 게시글 작성자만 허용하고, 서버 기준 시간대와 마감 여부를 다시 확인한다. 프론트가 과거 마감 게시글을 수정할 수 있어도 서버는 모집 상태를 다시 열지 않는다.

## 구현 순서

1. 오류 응답 형식과 `error` 코드를 백엔드에서 통일한다.
2. 회원가입·로그인·공구 등록 규칙을 서버에 적용한다.
3. `passwordHash` 필드를 `password`로 전환하고 서버 해싱을 확인한다.
4. 세션 cookie와 비밀번호 재설정 API를 추가한 뒤 프론트 인증 UX를 연결한다.
