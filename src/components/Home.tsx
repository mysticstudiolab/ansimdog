import { useEffect, useMemo, useState } from 'react';
import type { DailyLog, Dog, Schedule } from '../types';
import { supabase } from '../utils/supabaseClient';
import { fetchDailyLog, fetchDailyLogsRange } from '../utils/records';
import { daysBetween, recentDays, todayISO } from '../utils/dateUtils';
import { buildAiBriefing, buildTodayChecklist, completionRate, detectHealthChanges, summarizePattern } from '../utils/analysis';
import { buildHomeEmotionMessage } from '../utils/emotionalMessages';
import { Badge, Card, IconTile, ProgressBar, SectionTitle } from './ui';
import { CheckIcon, ChevronRightIcon } from './icons';
import { CategoryIcon, type Category } from './categoryIcons';
import catWalkIcon from '../assets/icons/cat-walk.png';
import QuickRecordSheet, { type QuickField } from './QuickRecordSheet';
import TopBar from './TopBar';
import type { EmotionTone } from '../types';

const HERO_TONE_ICON: Record<EmotionTone, string> = {
  celebrate: '🐾',
  encourage: '🌱',
  'calm-alert': '🩺',
};

const HERO_TONE_LABEL: Record<EmotionTone, string> = {
  celebrate: '오늘의 안심',
  encourage: '오늘의 시작',
  'calm-alert': '확인이 필요해요',
};

export default function Home({
  dog,
  dogs,
  onSelectDog,
  onGoAnalysis,
  onGoProfileEdit,
}: {
  dog: Dog;
  dogs: Dog[];
  onSelectDog: (id: string) => void;
  onGoAnalysis: () => void;
  onGoProfileEdit: () => void;
}) {
  const today = todayISO();
  const [todayLog, setTodayLog] = useState<DailyLog | undefined>(undefined);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState<QuickField | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [log, logs, { data: scheduleRows }] = await Promise.all([
        fetchDailyLog(dog.id, today),
        fetchDailyLogsRange(dog.id, recentDays(14)[0], today),
        supabase.from('schedules').select('*').eq('dog_id', dog.id).order('scheduled_date', { ascending: true }),
      ]);
      if (cancelled) return;
      setTodayLog(log ?? undefined);
      setRecentLogs(logs);
      setSchedules((scheduleRows ?? []) as Schedule[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [dog.id, today]);

  const checklist = useMemo(() => buildTodayChecklist(todayLog, schedules, today), [todayLog, schedules, today]);
  const percent = useMemo(() => completionRate(checklist), [checklist]);
  const logsByDate = useMemo(() => new Map(recentLogs.map((l) => [l.log_date, l])), [recentLogs]);
  const changes = useMemo(() => detectHealthChanges(logsByDate), [logsByDate]);
  const pattern = useMemo(() => summarizePattern(recentLogs), [recentLogs]);
  const emotion = useMemo(() => buildHomeEmotionMessage(checklist, changes), [checklist, changes]);
  const briefing = useMemo(() => buildAiBriefing(dog.name, changes, pattern), [dog.name, changes, pattern]);

  const todaySchedule = schedules.find((s) => s.scheduled_date === today && !s.is_completed);

  const daysTogether = dog.adopted_at ? daysBetween(dog.adopted_at, today) + 1 : null;
  const daysTogetherNode =
    daysTogether !== null ? (
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: 'var(--color-primary)',
          background: 'var(--color-border)',
          padding: '3px 10px',
          borderRadius: 999,
        }}
      >
        함께한 {daysTogether.toLocaleString()}일
      </span>
    ) : (
      <button
        type="button"
        onClick={onGoProfileEdit}
        style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', textAlign: 'left', textDecoration: 'underline' }}
      >
        입양일을 등록하면 함께한 날을 세어드려요
      </button>
    );

  const quickItems: { field: QuickField; label: string; category: Category; done: boolean }[] = [
    { field: 'meal', label: '식사', category: 'meal', done: !!todayLog && todayLog.meal_status !== 'unrecorded' },
    { field: 'walk', label: '산책', category: 'walk', done: !!todayLog?.walked },
    { field: 'poop', label: '배변', category: 'poop', done: !!todayLog && todayLog.poop_status !== 'none' },
    { field: 'condition', label: '컨디션', category: 'mood', done: !!todayLog && todayLog.condition !== 'unrecorded' },
    {
      field: 'medicine',
      label: '투약',
      category: 'med',
      done: todayLog?.medicine_taken === true || todayLog?.medicine_taken === null,
    },
  ];

  if (loading) {
    return (
      <div>
        <TopBar dog={dog} dogs={dogs} onSelectDog={onSelectDog} extra={daysTogetherNode} />
        <div className="empty-state">오늘의 기록을 불러오고 있어요...</div>
      </div>
    );
  }

  return (
    <div>
      <TopBar dog={dog} dogs={dogs} onSelectDog={onSelectDog} extra={daysTogetherNode} />

      <div className={`hero-card hero-card--${emotion.tone}`}>
        <img src={catWalkIcon} alt="" className="hero-card-paw" />
        <div className="hero-card-text">
          <span className="hero-tone-chip">
            {HERO_TONE_ICON[emotion.tone]} {HERO_TONE_LABEL[emotion.tone]}
          </span>
          <p className="hero-title">{emotion.title}</p>
          <p className="hero-body">{emotion.body}</p>
        </div>
      </div>

      {todaySchedule && (
        <Card style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge tone="accent">오늘 일정</Badge>
          <span style={{ fontSize: 13.5 }}>{todaySchedule.title}</span>
        </Card>
      )}

      <div style={{ marginBottom: 16 }}>
        <div className="progress-header">
          <div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>기록 달성률</p>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-sub)' }}>
              오늘의 건강기록 {checklist.filter((c) => c.done).length} / {checklist.length} 완료
            </p>
          </div>
          <span className="progress-percent">{percent}%</span>
        </div>
        <ProgressBar percent={percent} />
        <div className="checklist-row">
          {checklist.map((item) => (
            <span key={item.key} className={`checklist-chip ${item.done ? 'checklist-chip--done' : ''}`}>
              {item.done ? '✓' : '○'} {item.label}
            </span>
          ))}
        </div>
      </div>

      <SectionTitle>빠른 기록</SectionTitle>
      <Card>
        <div className="quick-record-grid">
          {quickItems.map((item) => (
            <button key={item.field} type="button" className={`quick-record-item ${item.done ? 'quick-record-item--done' : ''}`} onClick={() => setActiveField(item.field)}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <IconTile tone={item.category}>
                  <CategoryIcon category={item.category} size={22} />
                </IconTile>
                {item.done && (
                  <span className="quick-record-check">
                    <CheckIcon size={11} />
                  </span>
                )}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {changes.length > 0 && (
        <>
          <SectionTitle>건강 변화 알림</SectionTitle>
          <Card>
            {changes.map((c) => (
              <div key={c.item} style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{c.changeDescription}</p>
                <p style={{ fontSize: 12.5, color: 'var(--color-text-sub)' }}>
                  평소 {c.usualValue} → 최근 {c.recentValue}
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={onGoAnalysis}
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontWeight: 700, fontSize: 13.5 }}
            >
              건강분석에서 자세히 보기 <ChevronRightIcon size={16} />
            </button>
          </Card>
        </>
      )}

      <div className="briefing-card">
        <div className="briefing-header">
          <span>AI 건강 브리핑</span>
        </div>
        <p className="briefing-body">{briefing}</p>
      </div>

      {activeField && (
        <QuickRecordSheet
          field={activeField}
          dogId={dog.id}
          dateISO={today}
          current={todayLog}
          onClose={() => setActiveField(null)}
          onSaved={(log) => setTodayLog(log)}
        />
      )}
    </div>
  );
}
