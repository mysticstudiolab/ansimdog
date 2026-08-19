-- 안심하개 (Ansimdog) — Supabase schema (PRD v4 / 5페이지 구조)
-- 이 앱은 별도 로그인 화면 없이 기기별 익명 인증(auth.signInAnonymously)으로
-- 사용자를 구분합니다. 모든 테이블은 owner_id(auth.uid())로 RLS 격리됩니다.
--
-- 무료 플랜(프로젝트 2개 한도)으로 여러 미니앱이 하나의 Supabase 프로젝트를 공유하기 때문에,
-- 테이블은 public이 아닌 전용 스키마(ansimdog)에 둡니다. 이 SQL을 실행한 뒤
-- Supabase 대시보드 → Project Settings → API → Exposed schemas 에 "ansimdog"를 추가해야
-- 클라이언트(anon key)에서 API로 접근할 수 있습니다.
--
-- 이 파일은 이전 버전(dogs/daily_logs/schedules)에 대한 증분(additive) 마이그레이션도
-- 포함합니다 — 기존에 이미 실행된 프로젝트에 다시 실행해도 데이터가 사라지지 않습니다.

create extension if not exists "pgcrypto";

create schema if not exists ansimdog;

grant usage on schema ansimdog to anon, authenticated;
alter default privileges in schema ansimdog grant all on tables to anon, authenticated;
alter default privileges in schema ansimdog grant all on sequences to anon, authenticated;

-- ---------------------------------------------------------------------------
-- users: 사용자 정보 (PRD §17 / §18 users) — auth.users를 1:1로 확장
-- ---------------------------------------------------------------------------
create table if not exists ansimdog.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

grant all on ansimdog.users to anon, authenticated;
alter table ansimdog.users enable row level security;

drop policy if exists "users_select_own" on ansimdog.users;
drop policy if exists "users_upsert_own" on ansimdog.users;
drop policy if exists "users_update_own" on ansimdog.users;

create policy "users_select_own" on ansimdog.users
  for select using (id = auth.uid());
create policy "users_upsert_own" on ansimdog.users
  for insert with check (id = auth.uid());
create policy "users_update_own" on ansimdog.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- dogs: 반려견 프로필 (PRD §17 / §18 pets)
-- ---------------------------------------------------------------------------
create table if not exists ansimdog.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  breed text,
  birth_date date,
  gender text not null default 'unknown' check (gender in ('male', 'female', 'unknown')),
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg > 0),
  neutered boolean not null default false,
  profile_emoji text not null default '🐶',
  photo_url text,
  medicine_note text,
  meal_target smallint not null default 2 check (meal_target between 1 and 10),
  created_at timestamptz not null default now()
);

alter table ansimdog.dogs add column if not exists meal_target smallint not null default 2;
alter table ansimdog.dogs drop constraint if exists dogs_meal_target_check;
alter table ansimdog.dogs add constraint dogs_meal_target_check check (meal_target between 1 and 10);

-- 입양일 (PRD 확장 컬럼) — 기존 행이 있으므로 adopted_at은 nullable로 추가한다.
alter table ansimdog.dogs add column if not exists adopted_at date;
alter table ansimdog.dogs add column if not exists adopted_at_is_estimated boolean not null default false;

create index if not exists dogs_owner_id_idx on ansimdog.dogs (owner_id);

grant all on ansimdog.dogs to anon, authenticated;
alter table ansimdog.dogs enable row level security;

drop policy if exists "dogs_select_own" on ansimdog.dogs;
drop policy if exists "dogs_insert_own" on ansimdog.dogs;
drop policy if exists "dogs_update_own" on ansimdog.dogs;
drop policy if exists "dogs_delete_own" on ansimdog.dogs;

create policy "dogs_select_own" on ansimdog.dogs for select using (owner_id = auth.uid());
create policy "dogs_insert_own" on ansimdog.dogs for insert with check (owner_id = auth.uid());
create policy "dogs_update_own" on ansimdog.dogs for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "dogs_delete_own" on ansimdog.dogs for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_logs: 하루 단위 건강기록 (PRD §13/§18 health_records — MVP는 하루 요약 모델)
-- 식사/산책/배변/컨디션·증상/약 을 하루에 한 행으로 관리한다 (dog_id + log_date unique).
-- ---------------------------------------------------------------------------
create table if not exists ansimdog.daily_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references ansimdog.dogs (id) on delete cascade,
  log_date date not null,
  meal_count smallint not null default 0 check (meal_count between 0 and 10),
  meal_status text not null default 'unrecorded' check (meal_status in ('unrecorded', 'normal', 'less', 'none')),
  water_ml integer not null default 0 check (water_ml >= 0),
  walked boolean not null default false,
  walk_minutes integer not null default 0 check (walk_minutes >= 0),
  poop_count smallint not null default 0 check (poop_count >= 0),
  poop_status text not null default 'none' check (poop_status in ('normal', 'soft', 'hard', 'diarrhea', 'none')),
  medicine_taken boolean default false, -- null = 복용 없음(해당 없음), false = 아직 안 먹음, true = 복용 완료
  mood text not null default 'normal' check (mood in ('great', 'good', 'normal', 'bad', 'sick')),
  condition text not null default 'unrecorded' check (condition in ('unrecorded', 'normal', 'different', 'concerning')),
  symptom_tags text[] not null default '{}',
  memo text not null default '',
  created_at timestamptz not null default now(),
  unique (dog_id, log_date)
);

-- PRD v4 확장 컬럼 (증분 마이그레이션)
alter table ansimdog.daily_logs add column if not exists meal_status text not null default 'unrecorded';
alter table ansimdog.daily_logs drop constraint if exists daily_logs_meal_status_check;
alter table ansimdog.daily_logs add constraint daily_logs_meal_status_check check (meal_status in ('unrecorded', 'normal', 'less', 'none'));

alter table ansimdog.daily_logs add column if not exists condition text not null default 'unrecorded';
alter table ansimdog.daily_logs drop constraint if exists daily_logs_condition_check;
alter table ansimdog.daily_logs add constraint daily_logs_condition_check check (condition in ('unrecorded', 'normal', 'different', 'concerning'));

alter table ansimdog.daily_logs add column if not exists symptom_tags text[] not null default '{}';

create index if not exists daily_logs_owner_id_idx on ansimdog.daily_logs (owner_id);
create index if not exists daily_logs_dog_id_date_idx on ansimdog.daily_logs (dog_id, log_date desc);

grant all on ansimdog.daily_logs to anon, authenticated;
alter table ansimdog.daily_logs enable row level security;

drop policy if exists "daily_logs_select_own" on ansimdog.daily_logs;
drop policy if exists "daily_logs_insert_own" on ansimdog.daily_logs;
drop policy if exists "daily_logs_update_own" on ansimdog.daily_logs;
drop policy if exists "daily_logs_delete_own" on ansimdog.daily_logs;

create policy "daily_logs_select_own" on ansimdog.daily_logs for select using (owner_id = auth.uid());
create policy "daily_logs_insert_own" on ansimdog.daily_logs for insert with check (owner_id = auth.uid());
create policy "daily_logs_update_own" on ansimdog.daily_logs for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "daily_logs_delete_own" on ansimdog.daily_logs for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- schedules: 예방접종/약/병원 등 일정 관리 (PRD §16.1/§18 schedules)
-- ---------------------------------------------------------------------------
create table if not exists ansimdog.schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references ansimdog.dogs (id) on delete cascade,
  category text not null check (category in ('vaccine', 'deworming', 'medicine', 'hospital', 'grooming', 'etc')),
  title text not null check (char_length(trim(title)) > 0),
  place text,
  scheduled_date date not null,
  repeat_days integer check (repeat_days is null or repeat_days > 0),
  notify boolean not null default true,
  is_completed boolean not null default false,
  memo text not null default '',
  created_at timestamptz not null default now()
);

alter table ansimdog.schedules add column if not exists place text;
alter table ansimdog.schedules add column if not exists notify boolean not null default true;

create index if not exists schedules_owner_id_idx on ansimdog.schedules (owner_id);
create index if not exists schedules_dog_id_date_idx on ansimdog.schedules (dog_id, scheduled_date);

grant all on ansimdog.schedules to anon, authenticated;
alter table ansimdog.schedules enable row level security;

drop policy if exists "schedules_select_own" on ansimdog.schedules;
drop policy if exists "schedules_insert_own" on ansimdog.schedules;
drop policy if exists "schedules_update_own" on ansimdog.schedules;
drop policy if exists "schedules_delete_own" on ansimdog.schedules;

create policy "schedules_select_own" on ansimdog.schedules for select using (owner_id = auth.uid());
create policy "schedules_insert_own" on ansimdog.schedules for insert with check (owner_id = auth.uid());
create policy "schedules_update_own" on ansimdog.schedules for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "schedules_delete_own" on ansimdog.schedules for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- expenses: 생활비 관리 (PRD §16.2 — MVP 필수 기능)
-- ---------------------------------------------------------------------------
create table if not exists ansimdog.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references ansimdog.dogs (id) on delete cascade,
  category text not null check (category in ('hospital', 'food', 'snack', 'grooming', 'supplies', 'etc')),
  amount integer not null check (amount >= 0),
  spent_date date not null,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists expenses_owner_id_idx on ansimdog.expenses (owner_id);
create index if not exists expenses_dog_id_date_idx on ansimdog.expenses (dog_id, spent_date desc);

grant all on ansimdog.expenses to anon, authenticated;
alter table ansimdog.expenses enable row level security;

drop policy if exists "expenses_select_own" on ansimdog.expenses;
drop policy if exists "expenses_insert_own" on ansimdog.expenses;
drop policy if exists "expenses_update_own" on ansimdog.expenses;
drop policy if exists "expenses_delete_own" on ansimdog.expenses;

create policy "expenses_select_own" on ansimdog.expenses for select using (owner_id = auth.uid());
create policy "expenses_insert_own" on ansimdog.expenses for insert with check (owner_id = auth.uid());
create policy "expenses_update_own" on ansimdog.expenses for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "expenses_delete_own" on ansimdog.expenses for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ansimdog-dog-photos: 반려견 프로필 사진 저장용 Storage 버킷
-- Storage 버킷은 Postgres 스키마와 무관하게 프로젝트 전체에서 이름을 공유하므로,
-- 다른 미니앱과 충돌하지 않도록 버킷 이름에도 앱 접두사를 붙인다.
-- 경로 규칙: {auth.uid()}/{dog_id}-{timestamp}.{ext}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ansimdog-dog-photos', 'ansimdog-dog-photos', true)
on conflict (id) do nothing;

drop policy if exists "ansimdog_dog_photos_read_all" on storage.objects;
drop policy if exists "ansimdog_dog_photos_insert_own" on storage.objects;
drop policy if exists "ansimdog_dog_photos_update_own" on storage.objects;
drop policy if exists "ansimdog_dog_photos_delete_own" on storage.objects;

create policy "ansimdog_dog_photos_read_all" on storage.objects
  for select using (bucket_id = 'ansimdog-dog-photos');

create policy "ansimdog_dog_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'ansimdog-dog-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "ansimdog_dog_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'ansimdog-dog-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "ansimdog_dog_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'ansimdog-dog-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
