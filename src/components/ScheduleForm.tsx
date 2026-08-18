import { useState } from 'react';
import type { ScheduleCategory } from '../types';
import { supabase } from '../utils/supabaseClient';
import { todayISO } from '../utils/dateUtils';
import { BottomSheet, Chip, FormField, PrimaryButton } from './ui';

const CATEGORY_OPTIONS: { value: ScheduleCategory; label: string }[] = [
  { value: 'vaccine', label: '예방접종' },
  { value: 'medicine', label: '약' },
  { value: 'hospital', label: '병원' },
  { value: 'deworming', label: '구충' },
  { value: 'grooming', label: '미용' },
  { value: 'etc', label: '기타' },
];

export default function ScheduleForm({ dogId, onClose, onSaved }: { dogId: string; onClose: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState<ScheduleCategory>('vaccine');
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [scheduledDate, setScheduledDate] = useState(todayISO());
  const [repeatDays, setRepeatDays] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('일정 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('schedules').insert({
      dog_id: dogId,
      category,
      title: title.trim(),
      place: place.trim() || null,
      scheduled_date: scheduledDate,
      repeat_days: repeatDays ? Number(repeatDays) : null,
      notify: true,
      memo: memo.trim(),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <BottomSheet open title="일정 추가" onClose={onClose}>
      {error && <div className="error-banner">{error}</div>}

      <FormField label="종류">
        <div className="option-grid">
          {CATEGORY_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} active={category === opt.value} onClick={() => setCategory(opt.value)} />
          ))}
        </div>
      </FormField>

      <FormField label="일정 이름">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 광견병 예방접종" />
      </FormField>

      <div className="form-row">
        <FormField label="예정일">
          <input type="date" className="input" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </FormField>
        <FormField label="반복 주기 (일, 선택)">
          <input
            type="number"
            inputMode="numeric"
            className="input"
            value={repeatDays}
            onChange={(e) => setRepeatDays(e.target.value)}
            placeholder="1회성이면 비워두세요"
          />
        </FormField>
      </div>

      <FormField label="장소 (선택)">
        <input className="input" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="예) 다니엘 동물병원" />
      </FormField>

      <FormField label="메모 (선택)">
        <textarea className="input" value={memo} onChange={(e) => setMemo(e.target.value)} />
      </FormField>

      <PrimaryButton onClick={handleSave} disabled={saving}>
        {saving ? '저장 중...' : '일정 저장하기'}
      </PrimaryButton>
    </BottomSheet>
  );
}
