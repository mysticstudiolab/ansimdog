# 안심하개 (Ansimdog)

반려견 보호자가 매일 반려견의 생활을 간편하게 기록하고 관리할 수 있는 앱인토스 미니앱입니다.
식사, 물, 산책, 배변, 약 복용 등 일상 돌봄 기록을 남기고 주간 요약·캘린더·일정 관리를 통해 반려견의 변화를 놓치지 않도록 돕습니다.

## 기술 스택

- React + TypeScript + Vite
- `@apps-in-toss/web-framework` (앱인토스 미니앱 프레임워크, 햅틱 피드백 등 네이티브 브릿지 포함)
- `@toss/tds-mobile` (Toss Design System — `Button`/`TextField`/`TextArea`/`Switch`/`Chip`/`Badge` 사용, 앱 최상단은 `ThemeProvider`로 감싸야 동작함)
- `recharts`, `date-fns`
- `@supabase/supabase-js`

## 시작하기

```bash
npm install
cp .env.example .env   # Supabase URL / anon key 확인
npm run dev
```

`npm run build`는 `granite.config.ts`의 `web.commands.build`와 동일한 `tsc -b && vite build`를 실행하며, 결과물은 `outdir`(`dist`)에 생성됩니다.

## Supabase 설정

1. Supabase 프로젝트의 SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql)을 실행해 `dogs`, `daily_logs`, `schedules` 테이블과 RLS 정책을 생성합니다.
2. Authentication → Providers에서 **Anonymous Sign-In**을 활성화합니다. 이 앱은 별도 로그인 화면 없이 기기별 익명 세션(`auth.signInAnonymously`)으로 사용자를 구분하며, 모든 테이블은 `owner_id = auth.uid()` 조건의 RLS로 격리됩니다.
3. `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 설정합니다.

> 참고: 익명 인증은 기기(브라우저)별로 세션이 유지되는 방식입니다. 여러 기기에서 같은 데이터를 보려면 추후 이메일/소셜 로그인으로 전환이 필요합니다.

## 핵심 기능

1. **온보딩** — 4단계 소개 화면 (`src/components/Onboarding.tsx`)
2. **반려견 등록/관리** — 이름, 견종, 생년월일, 몸무게 등 프로필 (`src/components/DogProfile.tsx`)
3. **오늘의 체크** — 식사·물·산책·배변·약 복용을 10초 안에 기록 (`src/components/Home.tsx`, 변경 시 자동 저장)
4. **주간 요약** — 물/산책/컨디션 비교 그래프, 히트맵, 규칙 기반 AI 알림 (`src/components/WeeklySummary.tsx`)
5. **캘린더** — 월간 기록 유무 표시 및 날짜별 상세 보기 (`src/components/Calendar.tsx`)
6. **일정 관리** — 예방접종/구충/미용/병원/약 구매 등 반복 일정 (`src/components/Schedule.tsx`)

## 폴더 구조

```
ansimdog/
├── src/
│   ├── components/
│   │   ├── Home.tsx
│   │   ├── WeeklySummary.tsx
│   │   ├── Calendar.tsx
│   │   ├── Schedule.tsx
│   │   ├── DogProfile.tsx
│   │   └── Onboarding.tsx
│   ├── utils/
│   │   ├── supabaseClient.ts
│   │   └── dateUtils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── supabase/
│   └── schema.sql
├── granite.config.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── .env.example
```
