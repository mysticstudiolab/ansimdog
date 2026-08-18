import { useState } from 'react';
import type { ExpenseCategory } from '../types';
import { supabase } from '../utils/supabaseClient';
import { todayISO } from '../utils/dateUtils';
import { BottomSheet, Chip, FormField, PrimaryButton } from './ui';

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'hospital', label: '병원' },
  { value: 'food', label: '사료' },
  { value: 'snack', label: '간식' },
  { value: 'grooming', label: '미용' },
  { value: 'supplies', label: '용품' },
  { value: 'etc', label: '기타' },
];

export default function ExpenseForm({ dogId, onClose, onSaved }: { dogId: string; onClose: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [spentDate, setSpentDate] = useState(todayISO());
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('금액을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('expenses').insert({
      dog_id: dogId,
      category,
      amount: value,
      spent_date: spentDate,
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
    <BottomSheet open title="지출 추가" onClose={onClose}>
      {error && <div className="error-banner">{error}</div>}

      <FormField label="분류">
        <div className="option-grid">
          {CATEGORY_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} active={category === opt.value} onClick={() => setCategory(opt.value)} />
          ))}
        </div>
      </FormField>

      <div className="form-row">
        <FormField label="금액 (원)">
          <input
            type="number"
            inputMode="numeric"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="예) 35000"
          />
        </FormField>
        <FormField label="날짜">
          <input type="date" className="input" value={spentDate} onChange={(e) => setSpentDate(e.target.value)} />
        </FormField>
      </div>

      <FormField label="메모 (선택)">
        <textarea className="input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예) 심장사상충 예방약" />
      </FormField>

      <PrimaryButton onClick={handleSave} disabled={saving}>
        {saving ? '저장 중...' : '지출 저장하기'}
      </PrimaryButton>
    </BottomSheet>
  );
}
