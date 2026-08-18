const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(fromISO: string, toISOStr: string): number {
  const a = new Date(`${fromISO}T00:00:00`).getTime();
  const b = new Date(`${toISOStr}T00:00:00`).getTime();
  return Math.round((b - a) / 86400000);
}

export function weekdayLabel(iso: string): string {
  return WEEKDAY_LABELS[new Date(`${iso}T00:00:00`).getDay()];
}

/** 오늘을 포함해 최근 N일의 ISO 날짜 배열을 과거→현재 순으로 반환한다. */
export function recentDays(n: number, endISO: string = todayISO()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    days.push(addDays(endISO, -i));
  }
  return days;
}

/** 이번 주(월~일) 날짜 배열을 반환한다. */
export function currentWeek(baseISO: string = todayISO()): string[] {
  const base = new Date(`${baseISO}T00:00:00`);
  const dow = base.getDay() === 0 ? 7 : base.getDay(); // 월=1 ... 일=7
  const monday = addDays(baseISO, -(dow - 1));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatMonthDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatMonthWeek(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const week = Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7);
  return `${d.getMonth() + 1}월 ${week}주차`;
}

export function ageText(birthDateISO: string | null): string {
  if (!birthDateISO) return '나이 미등록';
  const birth = new Date(`${birthDateISO}T00:00:00`);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) years -= 1;
  if (years < 1) {
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth() - (beforeBirthday ? 1 : 0);
    return `${Math.max(months, 0)}개월`;
  }
  return `${years}살`;
}

/** 예정일과 반복 주기를 기준으로 다음 예정일을 계산한다 (오늘 이후 가장 가까운 날짜). */
export function nextOccurrence(scheduledDateISO: string, repeatDays: number | null, onOrAfterISO: string): string {
  if (!repeatDays || repeatDays <= 0) return scheduledDateISO;
  let occurrence = scheduledDateISO;
  while (daysBetween(occurrence, onOrAfterISO) > 0) {
    occurrence = addDays(occurrence, repeatDays);
  }
  return occurrence;
}

export function isDueOn(scheduledDateISO: string, repeatDays: number | null, targetISO: string): boolean {
  if (daysBetween(scheduledDateISO, targetISO) < 0) return false;
  if (!repeatDays || repeatDays <= 0) return scheduledDateISO === targetISO;
  return daysBetween(scheduledDateISO, targetISO) % repeatDays === 0;
}

export function formatDday(scheduledISO: string, todayISOStr: string = todayISO()): string {
  const diff = daysBetween(todayISOStr, scheduledISO);
  if (diff === 0) return 'D-day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
