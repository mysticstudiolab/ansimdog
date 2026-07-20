import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday as isTodayFns,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export const DATE_KEY_FORMAT = 'yyyy-MM-dd';

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function fromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function formatKoreanDate(date: Date): string {
  return format(date, 'M월 d일 (EEE)', { locale: ko });
}

export function formatKoreanMonth(date: Date): string {
  return format(date, 'yyyy년 M월', { locale: ko });
}

export function isToday(date: Date): boolean {
  return isTodayFns(date);
}

export function isSameDate(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export function getLastNDays(n: number, from: Date = new Date()): Date[] {
  return Array.from({ length: n }, (_, i) => subDays(from, n - 1 - i));
}

export function getWeekRange(from: Date = new Date()): Date[] {
  const start = startOfWeek(from, { weekStartsOn: 1 });
  const end = endOfWeek(from, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getMonthGrid(from: Date = new Date()): Date[] {
  const monthStart = startOfMonth(from);
  const monthEnd = endOfMonth(from);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isCurrentMonth(date: Date, referenceMonth: Date): boolean {
  return isSameMonth(date, referenceMonth);
}

export function daysUntil(dateKey: string, from: Date = new Date()): number {
  return differenceInCalendarDays(fromDateKey(dateKey), from);
}

export function addDaysToKey(dateKey: string, days: number): string {
  return toDateKey(addDays(fromDateKey(dateKey), days));
}

export function koreanWeekdayShort(date: Date): string {
  return format(date, 'EEEEE', { locale: ko });
}
