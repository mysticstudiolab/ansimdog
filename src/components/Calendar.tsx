import { useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Button } from '@toss/tds-mobile';
import { supabase } from '../utils/supabaseClient';
import { formatKoreanMonth, getMonthGrid, isCurrentMonth, isToday, toDateKey } from '../utils/dateUtils';
import type { DailyLog, Dog } from '../types';
import { MealIcon, MedicineIcon, PoopIcon, WalkIcon, WaterIcon } from './icons';
import DailyLogEditor from './DailyLogEditor';

interface CalendarProps {
  dog: Dog;
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const POOP_LABEL: Record<DailyLog['poop_status'], string> = {
  normal: '정상',
  soft: '무름',
  hard: '딱딱',
  diarrhea: '설사',
  none: '기록 없음',
};

const MOOD_LABEL: Record<DailyLog['mood'], string> = {
  great: '😄 최고예요',
  good: '🙂 좋아요',
  normal: '😐 보통이에요',
  bad: '😟 안좋아요',
  sick: '🤒 아파요',
};

export default function Calendar({ dog }: CalendarProps) {
  const [month, setMonth] = useState(new Date());
  const [logsByDate, setLogsByDate] = useState<Record<string, DailyLog>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const grid = useMemo(() => getMonthGrid(month), [month]);
  const todayKey = toDateKey(new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const start = toDateKey(grid[0]);
      const end = toDateKey(grid[grid.length - 1]);
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('dog_id', dog.id)
        .gte('log_date', start)
        .lte('log_date', end);

      if (cancelled) return;
      const map: Record<string, DailyLog> = {};
      (data ?? []).forEach((row) => {
        map[(row as DailyLog).log_date] = row as DailyLog;
      });
      setLogsByDate(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [dog.id, grid]);

  const selectedLog = selectedKey ? logsByDate[selectedKey] : undefined;

  return (
    <div>
      <div className="top-bar" style={{ padding: 0, marginBottom: 4 }}>
        <h1>캘린더</h1>
        <p>{dog.name}의 돌봄 기록을 날짜별로 확인해요.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn btn-ghost" onClick={() => setMonth((m) => subMonths(m, 1))}>
            ◀
          </button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{formatKoreanMonth(month)}</span>
          <button className="btn btn-ghost" onClick={() => setMonth((m) => addMonths(m, 1))}>
            ▶
          </button>
        </div>

        <div className="calendar-grid" style={{ marginBottom: 4 }}>
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="calendar-weekday">
              {w}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {grid.map((date) => {
            const key = toDateKey(date);
            const hasLog = Boolean(logsByDate[key]);
            const classNames = [
              'calendar-cell',
              !isCurrentMonth(date, month) ? 'other-month' : '',
              isToday(date) ? 'today' : '',
              selectedKey === key ? 'selected' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={key}
                className={classNames}
                onClick={() => {
                  setSelectedKey(key);
                  setEditingKey(null);
                }}
              >
                <span>{date.getDate()}</span>
                {hasLog && <span className="calendar-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedKey && (
        <div className="card">
          <p className="card-title">{selectedKey} 기록</p>
          {editingKey === selectedKey ? (
            <>
              <DailyLogEditor
                key={`${dog.id}-${selectedKey}`}
                dog={dog}
                dateKey={selectedKey}
                initialLog={selectedLog ?? null}
                onSaved={(next) => {
                  setLogsByDate((m) => ({ ...m, [selectedKey]: next }));
                }}
              />
              <Button color="light" display="full" onClick={() => setEditingKey(null)} style={{ marginTop: 4 }}>
                완료
              </Button>
            </>
          ) : selectedLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="list-row">
                <span className="list-row-label"><MealIcon size={18} /> 식사</span>
                <span>{selectedLog.meal_count}회</span>
              </div>
              <div className="list-row">
                <span className="list-row-label"><WaterIcon size={18} /> 물</span>
                <span>{selectedLog.water_ml}ml</span>
              </div>
              <div className="list-row">
                <span className="list-row-label"><WalkIcon size={18} /> 산책</span>
                <span>{selectedLog.walked ? `${selectedLog.walk_minutes}분` : '안함'}</span>
              </div>
              <div className="list-row">
                <span className="list-row-label"><PoopIcon size={18} /> 배변</span>
                <span>
                  {selectedLog.poop_count}회 · {POOP_LABEL[selectedLog.poop_status]}
                </span>
              </div>
              <div className="list-row">
                <span className="list-row-label"><MedicineIcon size={18} /> 약 복용</span>
                <span>{selectedLog.medicine_taken ? '완료' : '안함'}</span>
              </div>
              <div className="list-row">
                <span>컨디션</span>
                <span>{MOOD_LABEL[selectedLog.mood]}</span>
              </div>
              {selectedLog.memo && (
                <div style={{ paddingTop: 8 }}>
                  <div className="field-label">메모</div>
                  <p style={{ margin: 0, fontSize: 14 }}>{selectedLog.memo}</p>
                </div>
              )}
              {selectedKey <= todayKey && (
                <Button color="light" display="full" onClick={() => setEditingKey(selectedKey)} style={{ marginTop: 4 }}>
                  수정하기
                </Button>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="emoji">📭</div>
              <p>이 날은 기록이 없어요.</p>
              {selectedKey <= todayKey && (
                <Button color="primary" onClick={() => setEditingKey(selectedKey)} style={{ marginTop: 12 }}>
                  기록 추가하기
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
