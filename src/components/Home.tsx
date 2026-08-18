import { useEffect, useMemo, useState } from 'react';
import type { DailyLog, Dog, Schedule } from '../types';
import { supabase } from '../utils/supabaseClient';
import { fetchDailyLog, fetchDailyLogsRange } from '../utils/records';
import { recentDays, todayISO } from '../utils/dateUtils';
import { buildAiBriefing, buildTodayChecklist, completionRate, detectHealthChanges, summarizePattern } from '../utils/analysis';
import { buildHomeEmotionMessage } from '../utils/emotionalMessages';
import { Badge, BottomSheet, Card, IconTile, ProgressBar, SectionTitle } from './ui';
import {
  CheckIcon,
  ChevronRightIcon,
  ConditionGlyphIcon,
  MealGlyphIcon,
  MedicineGlyphIcon,
  PoopGlyphIcon,
  WalkGlyphIcon,
} from './icons';
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
}: {
  dog: Dog;
  dogs: Dog[];
  onSelectDog: (id: string) => void;
  onGoAnalysis: () => void;
}) {
  const today = todayISO();
  const [todayLog, setTodayLog] = useState<DailyLog | undefined>(undefined);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState<QuickField | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

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

  const quickItems: { field: QuickField; label: string; Icon: typeof MealGlyphIcon; tone: 'primary' | 'accent' | 'sky' | 'success' | 'neutral'; done: boolean }[] = [
    { field: 'meal', label: '식사', Icon: MealGlyphIcon, tone: 'success', done: !!todayLog && todayLog.meal_status !== 'unrecorded' },
    { field: 'walk', label: '산책', Icon: WalkGlyphIcon, tone: 'primary', done: !!todayLog?.walked },
    { field: 'poop', label: '배변', Icon: PoopGlyphIcon, tone: 'accent', done: !!todayLog && todayLog.poop_status !== 'none' },
    { field: 'condition', label: '컨디션', Icon: ConditionGlyphIcon, tone: 'sky', done: !!todayLog && todayLog.condition !== 'unrecorded' },
    { field: 'medicine', label: '투약', Icon: MedicineGlyphIcon, tone: 'neutral', done: !!todayLog?.medicine_taken },
  ];

  if (loading) {
    return (
      <div>
        <TopBar dog={dog} onOpenSwitcher={() => setSwitcherOpen(true)} />
        <div className="empty-state">오늘의 기록을 불러오고 있어요...</div>
      </div>
    );
  }

  return (
    <div>
      <TopBar dog={dog} onOpenSwitcher={() => setSwitcherOpen(true)} />

      <div className={`hero-card hero-card--${emotion.tone}`}>
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

      <Card>
        <div className="progress-header">
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>기록 달성률</p>
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
      </Card>

      <SectionTitle>빠른 기록</SectionTitle>
      <Card>
        <div className="quick-record-grid">
          {quickItems.map((item) => (
            <button key={item.field} type="button" className={`quick-record-item ${item.done ? 'quick-record-item--done' : ''}`} onClick={() => setActiveField(item.field)}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <IconTile tone={item.done ? item.tone : 'muted'}>
                  <item.Icon size={20} />
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
          <Badge tone="primary">Beta</Badge>
        </div>
        <p className="briefing-body">{briefing}</p>
      </div>

      {dogs.length > 1 && (
        <BottomSheet open={switcherOpen} title="반려견 전환" onClose={() => setSwitcherOpen(false)}>
          {dogs.map((d) => (
            <button
              key={d.id}
              type="button"
              className="pet-card"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={() => {
                onSelectDog(d.id);
                setSwitcherOpen(false);
              }}
            >
              <div className="avatar avatar-md">
                {d.photo_url ? <img src={d.photo_url} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 999 }} /> : d.profile_emoji}
              </div>
              <div>
                <p className="pet-card-name">{d.name}</p>
                <p className="pet-card-sub">{d.breed || '품종 미등록'}</p>
              </div>
            </button>
          ))}
        </BottomSheet>
      )}

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
