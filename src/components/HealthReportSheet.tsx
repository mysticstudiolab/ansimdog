import { useState } from 'react';
import type { DailyLog, Dog, HealthChange } from '../types';
import type { PatternSummary } from '../utils/analysis';
import { ageText, formatMonthDay, todayISO } from '../utils/dateUtils';
import { BottomSheet, SecondaryButton } from './ui';

const MEAL_LABEL: Record<string, string> = { unrecorded: '미기록', normal: '정상', less: '적게 먹음', none: '먹지 않음' };
const POOP_LABEL: Record<string, string> = { none: '기록 없음', normal: '정상 변', soft: '무른 변', hard: '딱딱한 변', diarrhea: '설사' };
const CONDITION_LABEL: Record<string, string> = { unrecorded: '미기록', normal: '평소와 같음', different: '조금 다름', concerning: '많이 다름' };

function buildReportText(
  type: 'weekly' | 'hospital',
  dog: Dog,
  pattern: PatternSummary,
  changes: HealthChange[],
  logs: DailyLog[]
): string {
  const sorted = [...logs].sort((a, b) => (a.log_date < b.log_date ? 1 : -1));
  const lines: string[] = [];

  if (type === 'weekly') {
    lines.push(`📋 ${dog.name} 건강 리포트 (${pattern.periodLabel})`);
    lines.push('');
    lines.push(`· 평균 산책 시간: ${pattern.avgWalkMinutes}분`);
    lines.push(`· 식사 정상 비율: ${pattern.mealNormalRate}%`);
    lines.push(`· 평균 배변 횟수: ${pattern.avgPoopCount}회`);
    lines.push(`· 기록한 날: ${pattern.sampleSize}일`);
    lines.push('');
    lines.push('주요 변화');
    if (changes.length === 0) {
      lines.push('· 이 기간 동안 눈에 띄는 변화는 없었어요.');
    } else {
      changes.forEach((c) => lines.push(`· ${c.changeDescription} (평소 ${c.usualValue} → 최근 ${c.recentValue})`));
    }
    lines.push('');
    lines.push('작은 변화를 기록해두는 것만으로도 더 잘 돌볼 수 있는 시간이 쌓이고 있어요.');
    return lines.join('\n');
  }

  lines.push(`🏥 ${dog.name} 병원 방문용 리포트`);
  lines.push(`작성일: ${formatMonthDay(todayISO())}`);
  lines.push('');
  lines.push('[기본 정보]');
  lines.push(`이름: ${dog.name}${dog.breed ? ` / ${dog.breed}` : ''}`);
  lines.push(`나이: ${ageText(dog.birth_date)}${dog.weight_kg ? ` / 체중 ${dog.weight_kg}kg` : ''}`);
  if (dog.medicine_note) lines.push(`지속 복용약: ${dog.medicine_note}`);
  lines.push('');
  lines.push('[주요 변화]');
  if (changes.length === 0) {
    lines.push('- 최근 눈에 띄는 변화는 없었습니다.');
  } else {
    changes.forEach((c) => lines.push(`- ${c.item}: 평소 ${c.usualValue} → 최근 ${c.recentValue} (${c.changeDescription})`));
  }
  lines.push('');
  lines.push('[최근 기록]');
  if (sorted.length === 0) {
    lines.push('- 최근 기록이 없습니다.');
  } else {
    sorted.slice(0, 14).forEach((l) => {
      lines.push(
        `- ${formatMonthDay(l.log_date)} : 식사 ${MEAL_LABEL[l.meal_status]} / 산책 ${l.walked ? `${l.walk_minutes}분` : '없음'} / 배변 ${POOP_LABEL[l.poop_status]} / 컨디션 ${CONDITION_LABEL[l.condition]}${l.symptom_tags.length ? ` / 증상: ${l.symptom_tags.join(', ')}` : ''}${l.memo ? ` / 메모: ${l.memo}` : ''}`
      );
    });
  }
  return lines.join('\n');
}

export default function HealthReportSheet({
  type,
  dog,
  pattern,
  changes,
  logs,
  onClose,
}: {
  type: 'weekly' | 'hospital';
  dog: Dog;
  pattern: PatternSummary;
  changes: HealthChange[];
  logs: DailyLog[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = buildReportText(type, dog, pattern, changes, logs);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근이 막힌 환경일 수 있어 조용히 무시한다.
    }
  };

  return (
    <BottomSheet open title={type === 'weekly' ? '건강 리포트' : '병원용 리포트'} onClose={onClose}>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          fontSize: 13.5,
          lineHeight: 1.7,
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 14,
        }}
      >
        {text}
      </pre>
      <SecondaryButton onClick={handleCopy}>{copied ? '복사됐어요 ✓' : '텍스트 복사하기'}</SecondaryButton>
    </BottomSheet>
  );
}
