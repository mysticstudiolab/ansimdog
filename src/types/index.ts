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
      'breed' | 'birth_date' | 'gender' | 'weight_kg' | 'neutered' | 'profile_emoji' | 'photo_url' | 'medicine_note' | 'meal_target'
    >
  >;

export type PoopStatus = 'normal' | 'soft' | 'hard' | 'diarrhea' | 'none';
export type Mood = 'great' | 'good' | 'normal' | 'bad' | 'sick';

export interface DailyLog {
  id: string;
  owner_id: string;
  dog_id: string;
  log_date: string;
  meal_count: number;
  water_ml: number;
  walked: boolean;
  walk_minutes: number;
  poop_count: number;
  poop_status: PoopStatus;
  medicine_taken: boolean;
  mood: Mood;
  memo: string;
  created_at: string;
}

export type DailyLogInput = Omit<DailyLog, 'id' | 'owner_id' | 'created_at'>;

export type ScheduleCategory =
  | 'vaccine'
  | 'deworming'
  | 'medicine'
  | 'hospital'
  | 'grooming'
  | 'etc';

export interface Schedule {
  id: string;
  owner_id: string;
  dog_id: string;
  category: ScheduleCategory;
  title: string;
  scheduled_date: string;
  repeat_days: number | null;
  is_completed: boolean;
  memo: string;
  created_at: string;
}

export type ScheduleInput = Omit<Schedule, 'id' | 'owner_id' | 'created_at' | 'is_completed'> & {
  is_completed?: boolean;
};

export type ScreenName = 'home' | 'weekly' | 'calendar' | 'schedule' | 'profile';
