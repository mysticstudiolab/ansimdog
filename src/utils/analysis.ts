import type { DailyLog, HealthChange, Schedule } from '../types';
import { isDueOn, recentDays, todayISO } from './dateUtils';

export interface TodayChecklist {
  key: 'meal' | 'walk' | 'poop' | 'condition' | 'medicine';
  label: string;
  done: boolean;
  required: boolean;
}

/**
 * 오늘의 기록 달성률 체크리스트를 계산한다 (PRD §9).
 * 약 복용은 해당 날짜에 복용 일정이 있을 때만 항목에 포함한다.
 */
export function buildTodayChecklist(todayLog: DailyLog | undefined, schedules: Schedule[], targetISO: string = todayISO()): TodayChecklist[] {
  const hasMedicineToday = schedules.some(
    (s) => s.category === 'medicine' && isDueOn(s.scheduled_date, s.repeat_days, targetISO)
  );

  const list: TodayChecklist[] = [
    { key: 'meal', label: '식사', done: !!todayLog && todayLog.meal_status !== 'unrecorded', required: true },
    { key: 'walk', label: '산책', done: !!todayLog?.walked, required: true },
    { key: 'poop', label: '배변', done: !!todayLog && todayLog.poop_status !== 'none', required: true },
    { key: 'condition', label: '컨디션', done: !!todayLog && todayLog.condition !== 'unrecorded', required: true },
  ];

  if (hasMedicineToday) {
    list.push({ key: 'medicine', label: '투약', done: !!todayLog?.medicine_taken, required: true });
  }

  return list;
}

export function completionRate(checklist: TodayChecklist[]): number {
  const required = checklist.filter((c) => c.required);
  if (required.length === 0) return 0;
  const done = required.filter((c) => c.done).length;
  return Math.round((done / required.length) * 100);
}

export interface PatternSummary {
  periodLabel: string;
  avgWalkMinutes: number;
  mealNormalRate: number;
  avgPoopCount: number;
  sampleSize: number;
}

export function summarizePattern(logs: DailyLog[], periodLabel = '최근 14일'): PatternSummary {
  if (logs.length === 0) {
    return { periodLabel, avgWalkMinutes: 0, mealNormalRate: 0, avgPoopCount: 0, sampleSize: 0 };
  }
  const avgWalkMinutes = Math.round(logs.reduce((sum, l) => sum + l.walk_minutes, 0) / logs.length);
  const mealNormalRate = Math.round(
    (logs.filter((l) => l.meal_status === 'normal').length / logs.length) * 100
  );
  const avgPoopCount = Math.round((logs.reduce((sum, l) => sum + l.poop_count, 0) / logs.length) * 10) / 10;
  return { periodLabel, avgWalkMinutes, mealNormalRate, avgPoopCount, sampleSize: logs.length };
}

/**
 * 최근 3일 평균과 그 이전 기간(최대 11일) 평균을 비교해 눈에 띄는 변화를 찾는다.
 * 별도 백엔드 계산 없이 클라이언트에서 즉시 계산하는 단순 규칙 기반 비교다.
 */
export function detectHealthChanges(logsByDate: Map<string, DailyLog>): HealthChange[] {
  const changes: HealthChange[] = [];
  const days = recentDays(14);
  const recentKeys = days.slice(-3);
  const usualKeys = days.slice(0, 11);

  const recentLogs = recentKeys.map((d) => logsByDate.get(d)).filter((l): l is DailyLog => !!l);
  const usualLogs = usualKeys.map((d) => logsByDate.get(d)).filter((l): l is DailyLog => !!l);

  if (recentLogs.length === 0 || usualLogs.length < 3) return changes;

  const avg = (arr: DailyLog[], pick: (l: DailyLog) => number) =>
    arr.length ? arr.reduce((s, l) => s + pick(l), 0) / arr.length : 0;

  const usualWalk = avg(usualLogs, (l) => l.walk_minutes);
  const recentWalk = avg(recentLogs, (l) => l.walk_minutes);
  if (usualWalk > 0) {
    const diff = recentWalk - usualWalk;
    const ratio = Math.abs(diff) / usualWalk;
    if (ratio >= 0.3 && Math.abs(diff) >= 5) {
      const direction = diff < 0 ? '줄었어요' : '늘었어요';
      changes.push({
        item: '산책 시간',
        usualValue: `평균 ${Math.round(usualWalk)}분`,
        recentValue: `최근 ${Math.round(recentWalk)}분`,
        changeDescription: `평소보다 산책 시간이 ${Math.round(Math.abs(diff))}분 ${direction}`,
        severity: 'notice',
      });
    }
  }

  const usualPoop = avg(usualLogs, (l) => l.poop_count);
  const recentPoop = avg(recentLogs, (l) => l.poop_count);
  if (usualPoop > 0 && Math.abs(recentPoop - usualPoop) >= 1) {
    const direction = recentPoop < usualPoop ? '줄었어요' : '늘었어요';
    changes.push({
      item: '배변 횟수',
      usualValue: `평균 ${usualPoop.toFixed(1)}회`,
      recentValue: `최근 ${recentPoop.toFixed(1)}회`,
      changeDescription: `평소보다 배변 횟수가 ${direction}`,
      severity: 'notice',
    });
  }

  const concerningRecent = recentLogs.filter((l) => l.condition === 'concerning' || l.condition === 'different').length;
  if (concerningRecent >= 2) {
    changes.push({
      item: '컨디션',
      usualValue: '평소와 같음',
      recentValue: `최근 3일 중 ${concerningRecent}일 평소와 다름`,
      changeDescription: '최근 컨디션이 평소와 다른 날이 이어지고 있어요',
      severity: 'watch',
    });
  }

  const abnormalPoop = recentLogs.filter((l) => l.poop_status === 'diarrhea' || l.poop_status === 'hard').length;
  if (abnormalPoop >= 2) {
    changes.push({
      item: '배변 상태',
      usualValue: '정상 변',
      recentValue: `최근 3일 중 ${abnormalPoop}일 이상 변`,
      changeDescription: '배변 상태가 평소와 다른 날이 이어지고 있어요',
      severity: 'watch',
    });
  }

  // 증상 태그 누적 빈도 — 같은 증상이 최근 7일 중 반복해서 나타나면 알려준다.
  const recentWeekKeys = days.slice(-7);
  const recentWeekLogs = recentWeekKeys.map((d) => logsByDate.get(d)).filter((l): l is DailyLog => !!l);
  const symptomCounts = new Map<string, number>();
  recentWeekLogs.forEach((l) => l.symptom_tags.forEach((tag) => symptomCounts.set(tag, (symptomCounts.get(tag) ?? 0) + 1)));
  const recurringSymptoms = [...symptomCounts.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);
  if (recurringSymptoms.length > 0) {
    const [topTag, topCount] = recurringSymptoms[0];
    changes.push({
      item: '증상',
      usualValue: '해당 없음',
      recentValue: `최근 7일 중 ${topCount}일`,
      changeDescription:
        recurringSymptoms.length === 1
          ? `'${topTag}' 증상이 최근 7일 중 ${topCount}일 나타났어요`
          : `'${topTag}' 외 ${recurringSymptoms.length - 1}개 증상이 반복해서 나타났어요`,
      severity: 'watch',
    });
  }

  return changes;
}

/**
 * 규칙 기반 AI 건강 브리핑 문구를 생성한다.
 * 진단을 내리지 않고 기록 요약과 확인 포인트만 제공한다 (PRD §14.3 / §20 AI 진단 금지).
 */
export function buildAiBriefing(dogName: string, changes: HealthChange[], pattern: PatternSummary): string {
  if (pattern.sampleSize === 0) {
    return `${dogName}의 건강기록이 아직 부족해요. 며칠만 더 기록하면 평소 패턴을 분석해드릴게요.`;
  }
  if (changes.length === 0) {
    return `${dogName}는 최근 기록이 평소 패턴과 비슷하게 유지되고 있어요. 꾸준한 기록 덕분에 작은 변화도 놓치지 않을 수 있어요.`;
  }
  const watch = changes.filter((c) => c.severity === 'watch');
  const notice = changes.filter((c) => c.severity === 'notice');
  const parts: string[] = [];
  if (notice.length) parts.push(notice.map((c) => c.changeDescription).join(', ') + '.');
  if (watch.length) {
    parts.push(
      `${watch.map((c) => c.item).join(', ')} 변화가 며칠째 이어지고 있으니 조금 더 지켜봐 주시고, 계속되면 병원 방문을 고려해보세요.`
    );
  }
  return `${dogName}는 ${parts.join(' ')}`;
}
