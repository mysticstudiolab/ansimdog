import { supabase } from './supabaseClient';
import type { DailyLog } from '../types';

export async function fetchDailyLog(dogId: string, dateISO: string): Promise<DailyLog | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('dog_id', dogId)
    .eq('log_date', dateISO)
    .maybeSingle();
  if (error) throw error;
  return (data as DailyLog | null) ?? null;
}

export async function fetchDailyLogsRange(dogId: string, fromISO: string, toISO: string): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('dog_id', dogId)
    .gte('log_date', fromISO)
    .lte('log_date', toISO)
    .order('log_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DailyLog[];
}

const EMPTY_PATCH = {
  meal_count: 0,
  meal_status: 'unrecorded' as const,
  water_ml: 0,
  walked: false,
  walk_minutes: 0,
  poop_count: 0,
  poop_status: 'none' as const,
  medicine_taken: false,
  mood: 'normal' as const,
  condition: 'unrecorded' as const,
  symptom_tags: [] as string[],
  memo: '',
};

/** 특정 날짜의 기록을 부분 수정해서 저장한다 (없으면 새로 만든다). */
export async function upsertDailyLog(
  dogId: string,
  dateISO: string,
  patch: Partial<Omit<DailyLog, 'id' | 'owner_id' | 'dog_id' | 'log_date' | 'created_at'>>
): Promise<DailyLog> {
  const existing = await fetchDailyLog(dogId, dateISO);
  const base = existing ?? EMPTY_PATCH;
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(
      {
        ...base,
        ...patch,
        dog_id: dogId,
        log_date: dateISO,
      },
      { onConflict: 'dog_id,log_date' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as DailyLog;
}
