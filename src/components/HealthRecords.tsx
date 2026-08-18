import { useEffect, useMemo, useState } from 'react';
import type { DailyLog, Dog } from '../types';
import { fetchDailyLogsRange } from '../utils/records';
import { currentWeek, formatMonthDay, formatMonthWeek, recentDays, todayISO, weekdayLabel } from '../utils/dateUtils';
import { IconTile, PrimaryButton, SectionTitle } from './ui';
import { ConditionGlyphIcon, MealGlyphIcon, PlusIcon, PoopGlyphIcon, WalkGlyphIcon } from './icons';
import RecordSheet from './RecordSheet';
import TopBar from './TopBar';

const MEAL_LABEL: Record<string, string> = { unrecorded: '미기록', normal: '정상', less: '적게 먹음', none: '먹지 않음' };
const POOP_LABEL: Record<string, string> = { none: '기록 없음', normal: '정상 변', soft: '무른 변', hard: '딱딱한 변', diarrhea: '설사' };
const CONDITION_LABEL: Record<string, string> = { unrecorded: '미기록', normal: '평소와 같음', different: '조금 다름', concerning: '많이 다름' };

export default function HealthRecords({ dog }: { dog: Dog }) {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const week = useMemo(() => currentWeek(today), [today]);
  const historyStart = useMemo(() => recentDays(14)[0], []);

  const loadLogs = () => {
    setLoading(true);
    fetchDailyLogsRange(dog.id, historyStart, today).then((rows) => {
      setLogs(rows);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dog.id]);

  const logsByDate = useMemo(() => new Map(logs.map((l) => [l.log_date, l])), [logs]);
  const selectedLog = logsByDate.get(selectedDate);
  const timelineDates = useMemo(
    () => [...logs].filter((l) => l.log_date !== selectedDate).sort((a, b) => (a.log_date < b.log_date ? 1 : -1)).slice(0, 10),
    [logs, selectedDate]
  );

  return (
    <div>
      <TopBar dog={dog} />
      <SectionTitle>건강기록</SectionTitle>

      <p style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 8 }}>{formatMonthWeek(selectedDate)}</p>
      <div className="day-strip">
        {week.map((d) => (
          <button
            key={d}
            type="button"
            className={`day-cell ${d === selectedDate ? 'day-cell--active' : ''} ${logsByDate.has(d) ? 'day-cell--has-log' : ''}`}
            onClick={() => setSelectedDate(d)}
          >
            <span>{weekdayLabel(d)}</span>
            <strong>{Number(d.slice(-2))}</strong>
          </button>
        ))}
      </div>

      <SectionTitle>{selectedDate === today ? '오늘의 요약' : `${formatMonthDay(selectedDate)} 요약`}</SectionTitle>
      <div className="summary-grid">
        <div className="summary-card">
          <IconTile tone="success" size={38}>
            <MealGlyphIcon size={18} />
          </IconTile>
          <div>
            <p className="summary-card-label">식사</p>
            <p className="summary-card-value">{MEAL_LABEL[selectedLog?.meal_status ?? 'unrecorded']}</p>
          </div>
        </div>
        <div className="summary-card">
          <IconTile tone="primary" size={38}>
            <WalkGlyphIcon size={18} />
          </IconTile>
          <div>
            <p className="summary-card-label">산책</p>
            <p className="summary-card-value">{selectedLog?.walked ? `${selectedLog.walk_minutes}분` : '미기록'}</p>
          </div>
        </div>
        <div className="summary-card">
          <IconTile tone="accent" size={38}>
            <PoopGlyphIcon size={18} />
          </IconTile>
          <div>
            <p className="summary-card-label">배변</p>
            <p className="summary-card-value">{POOP_LABEL[selectedLog?.poop_status ?? 'none']}</p>
          </div>
        </div>
        <div className="summary-card">
          <IconTile tone="sky" size={38}>
            <ConditionGlyphIcon size={18} />
          </IconTile>
          <div>
            <p className="summary-card-label">컨디션</p>
            <p className="summary-card-value">{CONDITION_LABEL[selectedLog?.condition ?? 'unrecorded']}</p>
          </div>
        </div>
      </div>

      <PrimaryButton onClick={() => setSheetOpen(true)}>
        {selectedLog ? `${formatMonthDay(selectedDate)} 기록 수정` : `${formatMonthDay(selectedDate)} 기록하기`}
      </PrimaryButton>

      <div style={{ height: 24 }} />
      <SectionTitle>최근 기록</SectionTitle>
      {loading ? (
        <p className="empty-state">불러오는 중이에요...</p>
      ) : timelineDates.length === 0 ? (
        <p className="empty-state">아직 다른 날짜의 기록이 없어요.<br />꾸준히 기록할수록 평소 패턴을 더 잘 알 수 있어요.</p>
      ) : (
        <div className="timeline">
          {timelineDates.map((log) => (
            <button
              key={log.id}
              type="button"
              className="timeline-item"
              style={{ display: 'block', width: '100%', textAlign: 'left' }}
              onClick={() => setSelectedDate(log.log_date)}
            >
              <div className="timeline-dot" />
              <p className="timeline-time">{formatMonthDay(log.log_date)} · {weekdayLabel(log.log_date)}요일</p>
              <div className="timeline-card">
                <p className="timeline-card-title">
                  식사 {MEAL_LABEL[log.meal_status]} · 산책 {log.walked ? `${log.walk_minutes}분` : '없음'}
                </p>
                <p className="timeline-card-sub">
                  배변 {POOP_LABEL[log.poop_status]} · 컨디션 {CONDITION_LABEL[log.condition]}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <button type="button" className="fab" onClick={() => setSheetOpen(true)} aria-label="기록 추가">
        <PlusIcon size={26} />
      </button>

      {sheetOpen && (
        <RecordSheet
          dogId={dog.id}
          dateISO={selectedDate}
          current={selectedLog}
          onClose={() => setSheetOpen(false)}
          onSaved={loadLogs}
        />
      )}
    </div>
  );
}
