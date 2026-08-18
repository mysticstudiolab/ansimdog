import { useState } from 'react';
import type { Condition, DailyLog, MealStatus, PoopStatus } from '../types';
import { OTHER_SYMPTOM_TAG, SYMPTOM_GROUPS } from '../types';
import { upsertDailyLog } from '../utils/records';
import { BottomSheet, Chip, PrimaryButton } from './ui';

export type QuickField = 'meal' | 'walk' | 'poop' | 'condition' | 'medicine';

const FIELD_TITLE: Record<QuickField, string> = {
  meal: '식사 기록',
  walk: '산책 기록',
  poop: '배변 기록',
  condition: '컨디션 기록',
  medicine: '투약 기록',
};

const MEAL_OPTIONS: { value: MealStatus; label: string }[] = [
  { value: 'normal', label: '정상 섭취' },
  { value: 'less', label: '적게 먹음' },
  { value: 'none', label: '먹지 않음' },
];

const WALK_OPTIONS = [10, 20, 30, 60];

const POOP_OPTIONS: { value: PoopStatus; label: string }[] = [
  { value: 'normal', label: '정상 변' },
  { value: 'soft', label: '무른 변' },
  { value: 'hard', label: '딱딱한 변' },
  { value: 'diarrhea', label: '설사' },
];

const CONDITION_OPTIONS: { value: Condition; emoji: string; label: string }[] = [
  { value: 'normal', emoji: '😊', label: '평소와 같음' },
  { value: 'different', emoji: '😐', label: '조금 다름' },
  { value: 'concerning', emoji: '🚨', label: '많이 다름' },
];

export default function QuickRecordSheet({
  field,
  dogId,
  dateISO,
  current,
  onClose,
  onSaved,
}: {
  field: QuickField;
  dogId: string;
  dateISO: string;
  current?: DailyLog;
  onClose: () => void;
  onSaved: (log: DailyLog) => void;
}) {
  const [customWalk, setCustomWalk] = useState('');
  const [condition, setCondition] = useState<Condition | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>(current?.symptom_tags ?? []);
  const [otherSymptomText, setOtherSymptomText] = useState('');
  const [memo, setMemo] = useState(current?.memo ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (patch: Partial<DailyLog>) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await upsertDailyLog(dogId, dateISO, patch);
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 문제가 발생했어요.');
    } finally {
      setSaving(false);
    }
  };

  const needsDetail = condition === 'different' || condition === 'concerning';

  const finalizeSymptoms = () =>
    symptoms.map((tag) => (tag === OTHER_SYMPTOM_TAG && otherSymptomText.trim() ? `기타: ${otherSymptomText.trim()}` : tag));

  return (
    <BottomSheet open title={FIELD_TITLE[field]} onClose={onClose}>
      {error && <div className="error-banner">{error}</div>}

      {field === 'meal' && (
        <div className="option-grid">
          {MEAL_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={current?.meal_status === opt.value}
              onClick={() => save({ meal_status: opt.value, meal_count: opt.value === 'none' ? 0 : 1 })}
            />
          ))}
        </div>
      )}

      {field === 'walk' && (
        <div>
          <div className="option-grid">
            {WALK_OPTIONS.map((min) => (
              <Chip
                key={min}
                label={`${min}분`}
                active={current?.walked && current.walk_minutes === min}
                onClick={() => save({ walked: true, walk_minutes: min })}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="직접 입력 (분)"
              value={customWalk}
              onChange={(e) => setCustomWalk(e.target.value)}
            />
            <PrimaryButton
              full={false}
              disabled={!customWalk || saving}
              onClick={() => save({ walked: true, walk_minutes: Number(customWalk) })}
            >
              저장
            </PrimaryButton>
          </div>
        </div>
      )}

      {field === 'poop' && (
        <div>
          <div className="option-grid">
            {POOP_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={current?.poop_status === opt.value}
                onClick={() => save({ poop_status: opt.value, poop_count: Math.max(current?.poop_count ?? 0, 1) })}
              />
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-sub)', marginTop: 4 }}>
            오늘 배변을 하지 않았다면 기록하지 않아도 괜찮아요.
          </p>
        </div>
      )}

      {field === 'condition' && (
        <div>
          <div className="option-grid">
            {CONDITION_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={`${opt.emoji} ${opt.label}`}
                active={condition === opt.value || (!condition && current?.condition === opt.value)}
                onClick={() => {
                  if (opt.value === 'normal') {
                    save({ condition: 'normal', symptom_tags: [] });
                  } else {
                    setCondition(opt.value);
                  }
                }}
              />
            ))}
          </div>

          {needsDetail && (
            <div style={{ marginTop: 12 }}>
              <p className="form-label">어떤 증상이 있었나요? (선택, 여러 개 가능)</p>
              {SYMPTOM_GROUPS.map((group) => (
                <div key={group.category} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-faint)', marginBottom: 6 }}>
                    {group.category}
                  </p>
                  <div className="option-grid" style={{ marginBottom: 0 }}>
                    {group.items.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        tone="accent"
                        active={symptoms.includes(tag)}
                        onClick={() =>
                          setSymptoms((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
              {symptoms.includes(OTHER_SYMPTOM_TAG) && (
                <input
                  className="input"
                  placeholder="어떤 증상인지 적어주세요"
                  value={otherSymptomText}
                  onChange={(e) => setOtherSymptomText(e.target.value)}
                  style={{ marginBottom: 10 }}
                />
              )}
              <textarea
                className="input"
                placeholder="메모 (선택)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                style={{ marginTop: 10 }}
              />
              <PrimaryButton
                disabled={saving}
                onClick={() => save({ condition, symptom_tags: finalizeSymptoms(), memo })}
              >
                저장
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {field === 'medicine' && (
        <div className="option-grid">
          <Chip label="복용 완료" active={!!current?.medicine_taken} onClick={() => save({ medicine_taken: true })} />
          <Chip label="아직 안 먹음" active={!current?.medicine_taken} onClick={() => save({ medicine_taken: false })} />
        </div>
      )}
    </BottomSheet>
  );
}
