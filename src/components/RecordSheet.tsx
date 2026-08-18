import { useState } from 'react';
import type { Condition, DailyLog, MealStatus, PoopStatus } from '../types';
import { OTHER_SYMPTOM_TAG, SYMPTOM_GROUPS } from '../types';
import { upsertDailyLog } from '../utils/records';
import { formatMonthDay } from '../utils/dateUtils';
import { BottomSheet, Chip, FormField, PrimaryButton } from './ui';

const MEAL_OPTIONS: { value: MealStatus; label: string }[] = [
  { value: 'normal', label: '정상 섭취' },
  { value: 'less', label: '적게 먹음' },
  { value: 'none', label: '먹지 않음' },
];

const POOP_OPTIONS: { value: PoopStatus; label: string }[] = [
  { value: 'normal', label: '정상 변' },
  { value: 'soft', label: '무른 변' },
  { value: 'hard', label: '딱딱한 변' },
  { value: 'diarrhea', label: '설사' },
  { value: 'none', label: '오늘 안함' },
];

const CONDITION_OPTIONS: { value: Condition; emoji: string; label: string }[] = [
  { value: 'normal', emoji: '😊', label: '평소와 같음' },
  { value: 'different', emoji: '😐', label: '조금 다름' },
  { value: 'concerning', emoji: '🚨', label: '많이 다름' },
];

export default function RecordSheet({
  dogId,
  dateISO,
  current,
  onClose,
  onSaved,
}: {
  dogId: string;
  dateISO: string;
  current?: DailyLog;
  onClose: () => void;
  onSaved: (log: DailyLog) => void;
}) {
  const [mealStatus, setMealStatus] = useState<MealStatus>(current?.meal_status ?? 'unrecorded');
  const [walked, setWalked] = useState(current?.walked ?? false);
  const [walkMinutes, setWalkMinutes] = useState(current?.walk_minutes ? String(current.walk_minutes) : '');
  const [poopStatus, setPoopStatus] = useState<PoopStatus>(current?.poop_status ?? 'none');
  const [condition, setCondition] = useState<Condition>(current?.condition ?? 'unrecorded');
  const existingOther = current?.symptom_tags.find((t) => t.startsWith('기타:'));
  const [symptoms, setSymptoms] = useState<string[]>(
    (current?.symptom_tags ?? []).map((t) => (t.startsWith('기타:') ? OTHER_SYMPTOM_TAG : t))
  );
  const [otherSymptomText, setOtherSymptomText] = useState(existingOther ? existingOther.replace(/^기타:\s*/, '') : '');
  const [medicineTaken, setMedicineTaken] = useState(current?.medicine_taken ?? false);
  const [memo, setMemo] = useState(current?.memo ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const minutes = Number(walkMinutes) || 0;
      const updated = await upsertDailyLog(dogId, dateISO, {
        meal_status: mealStatus,
        meal_count: mealStatus === 'none' || mealStatus === 'unrecorded' ? 0 : 1,
        walked: walked || minutes > 0,
        walk_minutes: minutes,
        poop_status: poopStatus,
        poop_count: poopStatus === 'none' ? 0 : Math.max(current?.poop_count ?? 0, 1),
        condition,
        symptom_tags:
          condition === 'normal' || condition === 'unrecorded'
            ? []
            : symptoms.map((tag) => (tag === OTHER_SYMPTOM_TAG && otherSymptomText.trim() ? `기타: ${otherSymptomText.trim()}` : tag)),
        medicine_taken: medicineTaken,
        memo,
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 문제가 발생했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open title={`${formatMonthDay(dateISO)} 기록`} onClose={onClose}>
      {error && <div className="error-banner">{error}</div>}

      <FormField label="식사">
        <div className="option-grid">
          {MEAL_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} active={mealStatus === opt.value} onClick={() => setMealStatus(opt.value)} />
          ))}
        </div>
      </FormField>

      <FormField label="산책 시간 (분)">
        <input
          className="input"
          type="number"
          inputMode="numeric"
          value={walkMinutes}
          onChange={(e) => {
            setWalkMinutes(e.target.value);
            setWalked(Number(e.target.value) > 0);
          }}
          placeholder="예) 30"
        />
      </FormField>

      <FormField label="배변">
        <div className="option-grid">
          {POOP_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} active={poopStatus === opt.value} onClick={() => setPoopStatus(opt.value)} />
          ))}
        </div>
      </FormField>

      <FormField label="컨디션">
        <div className="option-grid">
          {CONDITION_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={`${opt.emoji} ${opt.label}`}
              active={condition === opt.value}
              onClick={() => setCondition(opt.value)}
            />
          ))}
        </div>
      </FormField>

      {(condition === 'different' || condition === 'concerning') && (
        <FormField label="증상 (선택, 여러 개 가능)">
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
                    onClick={() => setSymptoms((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))}
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
            />
          )}
        </FormField>
      )}

      <FormField label="약 복용">
        <div className="option-grid">
          <Chip label="복용 완료" active={medicineTaken} onClick={() => setMedicineTaken(true)} />
          <Chip label="아직 안 먹음" active={!medicineTaken} onClick={() => setMedicineTaken(false)} />
        </div>
      </FormField>

      <FormField label="메모 (선택)">
        <textarea className="input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="병원 진단, 특이사항 등을 적어주세요" />
      </FormField>

      <PrimaryButton onClick={handleSave} disabled={saving}>
        {saving ? '저장 중...' : '저장하기'}
      </PrimaryButton>
    </BottomSheet>
  );
}
