import { supabase } from './supabaseClient';
import { addDays, todayISO } from './dateUtils';
import type { Condition, MealStatus, PoopStatus } from '../types';

/**
 * 개발/데모용 더미 데이터를 현재 선택된 반려견에 채운다.
 * 최근 14일 건강기록(마지막 3일은 산책 시간 감소 + 컨디션 변화를 포함해
 * 건강분석의 변화 감지 로직을 바로 확인할 수 있게 구성), 일정 3건, 지출 5건을 넣는다.
 */
export async function seedDummyData(dogId: string): Promise<void> {
  const today = todayISO();

  type SeedLog = {
    dog_id: string;
    log_date: string;
    meal_status: MealStatus;
    meal_count: number;
    walked: boolean;
    walk_minutes: number;
    poop_status: PoopStatus;
    poop_count: number;
    condition: Condition;
    symptom_tags: string[];
    medicine_taken: boolean;
    memo: string;
  };

  const logs: SeedLog[] = [];

  // 14일 전 ~ 4일 전: 평소 패턴 (안정적인 산책 30분대, 정상 컨디션 위주)
  for (let i = 14; i >= 4; i -= 1) {
    const date = addDays(today, -i);
    const walk = 28 + Math.round(Math.sin(i) * 5);
    logs.push({
      dog_id: dogId,
      log_date: date,
      meal_status: i === 9 ? 'less' : 'normal',
      meal_count: 1,
      walked: true,
      walk_minutes: walk,
      poop_status: i === 7 ? 'soft' : 'normal',
      poop_count: 1,
      condition: 'normal',
      symptom_tags: [],
      medicine_taken: false,
      memo: '',
    });
  }

  // 최근 3일: 산책 시간이 눈에 띄게 줄고, 컨디션 변화가 있었던 날 포함 (변화 감지 데모용)
  logs.push({
    dog_id: dogId,
    log_date: addDays(today, -3),
    meal_status: 'normal',
    meal_count: 1,
    walked: true,
    walk_minutes: 12,
    poop_status: 'normal',
    poop_count: 1,
    condition: 'different',
    symptom_tags: ['식욕부진'],
    medicine_taken: false,
    memo: '평소보다 기운이 없어 보임',
  });
  logs.push({
    dog_id: dogId,
    log_date: addDays(today, -2),
    meal_status: 'less',
    meal_count: 1,
    walked: true,
    walk_minutes: 10,
    poop_status: 'soft',
    poop_count: 1,
    condition: 'different',
    symptom_tags: ['무기력'],
    medicine_taken: false,
    memo: '',
  });
  logs.push({
    dog_id: dogId,
    log_date: addDays(today, -1),
    meal_status: 'normal',
    meal_count: 1,
    walked: true,
    walk_minutes: 15,
    poop_status: 'normal',
    poop_count: 1,
    condition: 'normal',
    symptom_tags: [],
    medicine_taken: false,
    memo: '',
  });

  // 오늘: 절반 정도만 기록된 상태로 남겨 기록 달성률 UI를 바로 확인할 수 있게 한다
  logs.push({
    dog_id: dogId,
    log_date: today,
    meal_status: 'normal',
    meal_count: 1,
    walked: true,
    walk_minutes: 15,
    poop_status: 'none',
    poop_count: 0,
    condition: 'unrecorded',
    symptom_tags: [],
    medicine_taken: false,
    memo: '',
  });

  const { error: logError } = await supabase.from('daily_logs').upsert(logs, { onConflict: 'dog_id,log_date' });
  if (logError) throw logError;

  const { error: scheduleError } = await supabase.from('schedules').insert([
    {
      dog_id: dogId,
      category: 'vaccine',
      title: '광견병 예방접종',
      place: '다니엘 동물병원',
      scheduled_date: addDays(today, 15),
      repeat_days: null,
      notify: true,
      is_completed: false,
      memo: '',
    },
    {
      dog_id: dogId,
      category: 'medicine',
      title: '심장사상충 예방약',
      place: null,
      scheduled_date: addDays(today, -30),
      repeat_days: 30,
      notify: true,
      is_completed: false,
      memo: '넥스가드 스펙트라',
    },
    {
      dog_id: dogId,
      category: 'hospital',
      title: '정기 건강검진',
      place: '다니엘 동물병원',
      scheduled_date: addDays(today, -10),
      repeat_days: null,
      notify: false,
      is_completed: true,
      memo: '',
    },
  ]);
  if (scheduleError) throw scheduleError;

  const { error: expenseError } = await supabase.from('expenses').insert([
    { dog_id: dogId, category: 'food', amount: 45000, spent_date: addDays(today, -5), memo: '건식 사료' },
    { dog_id: dogId, category: 'hospital', amount: 80000, spent_date: addDays(today, -10), memo: '정기 건강검진' },
    { dog_id: dogId, category: 'snack', amount: 12000, spent_date: addDays(today, -2), memo: '' },
    { dog_id: dogId, category: 'grooming', amount: 35000, spent_date: addDays(today, -14), memo: '목욕 및 미용' },
    { dog_id: dogId, category: 'supplies', amount: 20000, spent_date: addDays(today, -7), memo: '배변패드' },
  ]);
  if (expenseError) throw expenseError;
}
