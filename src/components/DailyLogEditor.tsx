import { useRef, useState } from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { Button, Chip, ChipItem, TextArea } from '@toss/tds-mobile';
import { supabase } from '../utils/supabaseClient';
import type { DailyLog, DailyLogInput, Dog, Mood, PoopStatus } from '../types';
import { MealIcon, MedicineIcon, PoopIcon, WalkIcon, WaterIcon } from './icons';

function tap() {
  generateHapticFeedback({ type: 'tickWeak' }).catch(() => {});
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span className="thumb" />
    </label>
  );
}

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😄', label: '최고예요' },
  { value: 'good', emoji: '🙂', label: '좋아요' },
  { value: 'normal', emoji: '😐', label: '보통이에요' },
  { value: 'bad', emoji: '😟', label: '안좋아요' },
  { value: 'sick', emoji: '🤒', label: '아파요' },
];

const POOP_OPTIONS: { value: PoopStatus; label: string }[] = [
  { value: 'normal', label: '정상' },
  { value: 'soft', label: '무름' },
  { value: 'hard', label: '딱딱' },
  { value: 'diarrhea', label: '설사' },
];

const WATER_STEP = 50;

function emptyLog(dogId: string, dateKey: string): DailyLogInput {
  return {
    dog_id: dogId,
    log_date: dateKey,
    meal_count: 0,
    water_ml: 0,
    walked: false,
    walk_minutes: 0,
    poop_count: 0,
    poop_status: 'none',
    medicine_taken: false,
    mood: 'normal',
    memo: '',
  };
}

interface DailyLogEditorProps {
  dog: Dog;
  dateKey: string;
  initialLog: DailyLog | null;
  onSavingChange?: (saving: boolean) => void;
  onSaved?: (log: DailyLog) => void;
}

export default function DailyLogEditor({ dog, dateKey, initialLog, onSavingChange, onSaved }: DailyLogEditorProps) {
  const [log, setLog] = useState<DailyLogInput>(() => initialLog ?? emptyLog(dog.id, dateKey));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = (next: DailyLogInput) => {
    setLog(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    onSavingChange?.(true);
    saveTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('daily_logs')
        .upsert(next, { onConflict: 'dog_id,log_date' })
        .select()
        .single();
      onSavingChange?.(false);
      if (data) onSaved?.(data as DailyLog);
    }, 500);
  };

  const update = (patch: Partial<DailyLogInput>) => {
    tap();
    persist({ ...log, ...patch });
  };

  return (
    <div>
      <div className="card">
        <p className="card-title"><span className="icon-tile"><MealIcon /></span> 식사</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="count-display">
            {log.meal_count} / {dog.meal_target}회
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              color="light"
              onClick={() => update({ meal_count: Math.max(0, log.meal_count - 1) })}
            >
              −
            </Button>
            <Button size="small" color="primary" onClick={() => update({ meal_count: log.meal_count + 1 })}>
              +1회
            </Button>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="card-title"><span className="icon-tile"><WaterIcon /></span> 물</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="count-display">{log.water_ml}ml</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              color="light"
              onClick={() => update({ water_ml: Math.max(0, log.water_ml - WATER_STEP) })}
            >
              −
            </Button>
            <Button size="small" color="primary" onClick={() => update({ water_ml: log.water_ml + WATER_STEP })}>
              +{WATER_STEP}ml
            </Button>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="card-title"><span className="icon-tile"><WalkIcon /></span> 산책</p>
        <div className="list-row" style={{ border: 'none', padding: '4px 0' }}>
          <span>{log.walked ? '산책 완료' : '아직 산책 전이에요'}</span>
          <ToggleSwitch
            checked={log.walked}
            onChange={(checked) =>
              update({ walked: checked, walk_minutes: checked ? log.walk_minutes || 20 : 0 })
            }
          />
        </div>
        {log.walked && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span className="count-display">{log.walk_minutes}분</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="small"
                color="light"
                onClick={() => update({ walk_minutes: Math.max(0, log.walk_minutes - 10) })}
              >
                −10분
              </Button>
              <Button size="small" color="light" onClick={() => update({ walk_minutes: log.walk_minutes + 10 })}>
                +10분
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <p className="card-title"><span className="icon-tile"><PoopIcon /></span> 배변</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="count-display">{log.poop_count}회</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              color="light"
              onClick={() =>
                update({
                  poop_count: Math.max(0, log.poop_count - 1),
                  poop_status: log.poop_count - 1 <= 0 ? 'none' : log.poop_status,
                })
              }
            >
              −
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() =>
                update({
                  poop_count: log.poop_count + 1,
                  poop_status: log.poop_status === 'none' ? 'normal' : log.poop_status,
                })
              }
            >
              +1회
            </Button>
          </div>
        </div>
        {log.poop_count > 0 && (
          <Chip kind="select">
            {POOP_OPTIONS.map((opt) => (
              <ChipItem
                key={opt.value}
                selected={log.poop_status === opt.value}
                onClick={() => update({ poop_status: opt.value })}
              >
                {opt.label}
              </ChipItem>
            ))}
          </Chip>
        )}
      </div>

      <div className="card">
        <p className="card-title"><span className="icon-tile"><MedicineIcon /></span> 약 복용</p>
        {dog.medicine_note && (
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 12px' }}>{dog.medicine_note}</p>
        )}
        <div className="list-row" style={{ border: 'none', padding: '4px 0' }}>
          <span>{log.medicine_taken ? '투약했어요' : '투약 기록이 없어요'}</span>
          <ToggleSwitch checked={log.medicine_taken} onChange={(checked) => update({ medicine_taken: checked })} />
        </div>
      </div>

      <div className="card">
        <p className="card-title">컨디션</p>
        <Chip kind="select" wrap>
          {MOOD_OPTIONS.map((opt) => (
            <ChipItem key={opt.value} selected={log.mood === opt.value} onClick={() => update({ mood: opt.value })}>
              {opt.emoji} {opt.label}
            </ChipItem>
          ))}
        </Chip>
      </div>

      <div className="card">
        <p className="card-title">메모</p>
        <TextArea
          variant="box"
          placeholder="특이사항을 자유롭게 남겨보세요"
          minHeight={72}
          value={log.memo}
          onChange={(e) => update({ memo: e.target.value })}
        />
      </div>
    </div>
  );
}
