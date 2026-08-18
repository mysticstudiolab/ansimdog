export type Gender = 'male' | 'female' | 'unknown';

export interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  birth_date: string | null;
  gender: Gender;
  weight_kg: number | null;
  neutered: boolean;
  profile_emoji: string;
  photo_url: string | null;
  medicine_note: string | null;
  meal_target: number;
  created_at: string;
}

export type NewDog = Pick<Dog, 'name'> &
  Partial<
    Pick<
      Dog,
      | 'breed'
      | 'birth_date'
      | 'gender'
      | 'weight_kg'
      | 'neutered'
      | 'profile_emoji'
      | 'photo_url'
      | 'medicine_note'
      | 'meal_target'
    >
  >;

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
}

export type MealStatus = 'unrecorded' | 'normal' | 'less' | 'none';
export type PoopStatus = 'normal' | 'soft' | 'hard' | 'diarrhea' | 'none';
export type Mood = 'great' | 'good' | 'normal' | 'bad' | 'sick';
export type Condition = 'unrecorded' | 'normal' | 'different' | 'concerning';

/**
 * 증상 선택 항목 (PRD §25 Q1 — 최종 목록 미확정 상태였던 항목을 신체 부위별로 구조화).
 * AI 분석·병원용 리포트에서 실제로 누적 집계할 수 있도록 카테고리로 묶어 관리한다.
 * 겹치는 항목은 하나로 합쳐 빠르게 훑어볼 수 있는 개수로 유지한다.
 */
export const SYMPTOM_GROUPS = [
  { category: '소화기', items: ['구토', '설사', '식욕부진'] },
  { category: '호흡기', items: ['기침', '재채기·콧물'] },
  { category: '피부', items: ['가려움', '발진·탈모'] },
  { category: '눈·귀', items: ['눈곱·눈물', '귀 긁음'] },
  { category: '행동·기력', items: ['무기력', '불안·떨림'] },
  { category: '근골격', items: ['절뚝거림'] },
  { category: '기타', items: ['기타'] },
] as const;

export const SYMPTOM_OPTIONS = SYMPTOM_GROUPS.flatMap((g) => g.items);

export type SymptomTag = (typeof SYMPTOM_OPTIONS)[number];

export const OTHER_SYMPTOM_TAG = '기타';

export interface DailyLog {
  id: string;
  owner_id: string;
  dog_id: string;
  log_date: string;
  meal_count: number;
  meal_status: MealStatus;
  water_ml: number;
  walked: boolean;
  walk_minutes: number;
  poop_count: number;
  poop_status: PoopStatus;
  medicine_taken: boolean;
  mood: Mood;
  condition: Condition;
  symptom_tags: string[];
  memo: string;
  created_at: string;
}

export type DailyLogInput = Omit<DailyLog, 'id' | 'owner_id' | 'created_at'>;

export type ScheduleCategory = 'vaccine' | 'deworming' | 'medicine' | 'hospital' | 'grooming' | 'etc';

export interface Schedule {
  id: string;
  owner_id: string;
  dog_id: string;
  category: ScheduleCategory;
  title: string;
  place: string | null;
  scheduled_date: string;
  repeat_days: number | null;
  notify: boolean;
  is_completed: boolean;
  memo: string;
  created_at: string;
}

export type ScheduleInput = Omit<Schedule, 'id' | 'owner_id' | 'created_at' | 'is_completed'> & {
  is_completed?: boolean;
};

export type ExpenseCategory = 'hospital' | 'food' | 'snack' | 'grooming' | 'supplies' | 'etc';

export interface Expense {
  id: string;
  owner_id: string;
  dog_id: string;
  category: ExpenseCategory;
  amount: number;
  spent_date: string;
  memo: string;
  created_at: string;
}

export type ExpenseInput = Omit<Expense, 'id' | 'owner_id' | 'created_at'>;

export type ScreenName = 'home' | 'records' | 'analysis' | 'management' | 'profile';

export type EmotionTone = 'celebrate' | 'encourage' | 'calm-alert';

export interface EmotionMessage {
  tone: EmotionTone;
  title: string;
  body: string;
}

export interface HealthChange {
  item: string;
  usualValue: string;
  recentValue: string;
  changeDescription: string;
  severity: 'notice' | 'watch';
}
