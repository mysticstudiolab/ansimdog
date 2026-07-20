-- 안심하개 (Ansimdog) — Supabase schema
-- 이 앱은 별도 로그인 화면 없이 기기별 익명 인증(auth.signInAnonymously)으로
-- 사용자를 구분합니다. 모든 테이블은 owner_id(auth.uid())로 RLS 격리됩니다.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- dogs: 반려견 프로필
-- ---------------------------------------------------------------------------
create table if not exists public.dogs (
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

-- 기존에 schema.sql을 이미 실행한 프로젝트를 위한 마이그레이션(하루 급식 목표 횟수)
alter table public.dogs
  add column if not exists meal_target smallint not null default 2;
alter table public.dogs
  drop constraint if exists dogs_meal_target_check;
alter table public.dogs
  add constraint dogs_meal_target_check check (meal_target between 1 and 10);

create index if not exists dogs_owner_id_idx on public.dogs (owner_id);

alter table public.dogs enable row level security;

create policy "dogs_select_own" on public.dogs
  for select using (owner_id = auth.uid());
create policy "dogs_insert_own" on public.dogs
  for insert with check (owner_id = auth.uid());
create policy "dogs_update_own" on public.dogs
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "dogs_delete_own" on public.dogs
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_logs: 하루 단위 돌봄 기록 (식사/물/산책/배변/약)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  log_date date not null,
  meal_count smallint not null default 0 check (meal_count between 0 and 10),
  water_ml integer not null default 0 check (water_ml >= 0),
  walked boolean not null default false,
  walk_minutes integer not null default 0 check (walk_minutes >= 0),
  poop_count smallint not null default 0 check (poop_count >= 0),
  poop_status text not null default 'none' check (poop_status in ('normal', 'soft', 'hard', 'diarrhea', 'none')),
  medicine_taken boolean not null default false,
  mood text not null default 'normal' check (mood in ('great', 'good', 'normal', 'bad', 'sick')),
  memo text not null default '',
  created_at timestamptz not null default now(),
  unique (dog_id, log_date)
);

create index if not exists daily_logs_owner_id_idx on public.daily_logs (owner_id);
create index if not exists daily_logs_dog_id_date_idx on public.daily_logs (dog_id, log_date desc);

alter table public.daily_logs enable row level security;

create policy "daily_logs_select_own" on public.daily_logs
  for select using (owner_id = auth.uid());
create policy "daily_logs_insert_own" on public.daily_logs
  for insert with check (owner_id = auth.uid());
create policy "daily_logs_update_own" on public.daily_logs
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "daily_logs_delete_own" on public.daily_logs
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- schedules: 예방접종/구충/미용/병원/약 구매 등 일정 관리
-- ---------------------------------------------------------------------------
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  category text not null check (category in ('vaccine', 'deworming', 'medicine', 'hospital', 'grooming', 'etc')),
  title text not null check (char_length(trim(title)) > 0),
  scheduled_date date not null,
  repeat_days integer check (repeat_days is null or repeat_days > 0),
  is_completed boolean not null default false,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists schedules_owner_id_idx on public.schedules (owner_id);
create index if not exists schedules_dog_id_date_idx on public.schedules (dog_id, scheduled_date);

alter table public.schedules enable row level security;

create policy "schedules_select_own" on public.schedules
  for select using (owner_id = auth.uid());
create policy "schedules_insert_own" on public.schedules
  for insert with check (owner_id = auth.uid());
create policy "schedules_update_own" on public.schedules
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "schedules_delete_own" on public.schedules
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- dog-photos: 반려견 프로필 사진 저장용 Storage 버킷
-- 경로 규칙: {auth.uid()}/{dog_id}-{timestamp}.{ext} — 폴더명이 소유자 uid와 같아야
-- 업로드/수정/삭제 가능하도록 RLS로 제한. 읽기는 공개(public read).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('dog-photos', 'dog-photos', true)
on conflict (id) do nothing;

create policy "dog_photos_read_all" on storage.objects
  for select using (bucket_id = 'dog-photos');

create policy "dog_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'dog-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dog_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'dog-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dog_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'dog-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
