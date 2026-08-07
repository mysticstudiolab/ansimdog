import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Badge, Button, Chip, ChipItem, TextArea, TextField } from '@toss/tds-mobile';
import { supabase } from '../utils/supabaseClient';
import { addDaysToKey, daysUntil, toDateKey } from '../utils/dateUtils';
import type { Schedule as ScheduleType, ScheduleCategory } from '../types';
import { CalendarIcon, DewormingIcon, EtcIcon, GroomingIcon, HospitalIcon, MedicineIcon, VaccineIcon } from './icons';

interface ScheduleProps {
  dog: { id: string; name: string };
}

const CATEGORY_OPTIONS: { value: ScheduleCategory; label: string; emoji: ReactNode }[] = [
  { value: 'vaccine', label: '예방접종', emoji: <VaccineIcon size={16} /> },
  { value: 'deworming', label: '구충', emoji: <DewormingIcon size={16} /> },
  { value: 'medicine', label: '약 구매', emoji: <MedicineIcon size={16} /> },
  { value: 'hospital', label: '병원', emoji: <HospitalIcon size={16} /> },
  { value: 'grooming', label: '미용', emoji: <GroomingIcon size={16} /> },
  { value: 'etc', label: '기타', emoji: <EtcIcon size={16} /> },
];

const REPEAT_OPTIONS = [
  { label: '반복 없음', value: null },
  { label: '매주', value: 7 },
  { label: '매월', value: 30 },
  { label: '3개월마다', value: 90 },
  { label: '매년', value: 365 },
];

function categoryMeta(category: ScheduleCategory) {
  return CATEGORY_OPTIONS.find((c) => c.value === category) ?? CATEGORY_OPTIONS[5];
}

function dDayLabel(dateKey: string) {
  const diff = daysUntil(dateKey);
  if (diff === 0) return 'D-DAY';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function Schedule({ dog }: ScheduleProps) {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    category: ScheduleCategory;
    title: string;
    scheduled_date: string;
    repeat_days: number | null;
    memo: string;
  }>({
    category: 'vaccine',
    title: '',
    scheduled_date: toDateKey(new Date()),
    repeat_days: null,
    memo: '',
  });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('dog_id', dog.id)
      .order('scheduled_date', { ascending: true });
    setSchedules((data ?? []) as ScheduleType[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [dog.id]);

  const resetForm = () =>
    setForm({ category: 'vaccine', title: '', scheduled_date: toDateKey(new Date()), repeat_days: null, memo: '' });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await supabase.from('schedules').insert({
      dog_id: dog.id,
      category: form.category,
      title: form.title.trim(),
      scheduled_date: form.scheduled_date,
      repeat_days: form.repeat_days,
      memo: form.memo.trim(),
    });
    setSaving(false);
    setShowForm(false);
    resetForm();
    await load();
  };

  const handleComplete = async (item: ScheduleType) => {
    if (actionId) return;
    setActionId(item.id);
    try {
      await supabase.from('schedules').update({ is_completed: true }).eq('id', item.id);

      if (item.repeat_days) {
        await supabase.from('schedules').insert({
          dog_id: dog.id,
          category: item.category,
          title: item.title,
          scheduled_date: addDaysToKey(item.scheduled_date, item.repeat_days),
          repeat_days: item.repeat_days,
          memo: item.memo,
        });
      }
      await load();
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item: ScheduleType) => {
    if (actionId) return;
    setActionId(item.id);
    try {
      await supabase.from('schedules').delete().eq('id', item.id);
      await load();
    } finally {
      setActionId(null);
    }
  };

  const upcoming = schedules.filter((s) => !s.is_completed);
  const completed = schedules.filter((s) => s.is_completed);

  return (
    <div>
      <div className="top-bar" style={{ padding: 0, marginBottom: 4 }}>
        <h1>일정 관리</h1>
        <p>{dog.name}의 예방접종, 병원, 약 구매 일정을 챙겨요.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button color="primary" display="full" onClick={() => setShowForm(true)}>
          + 새 일정 등록
        </Button>
      </div>

      {loading ? (
        <div className="loading-screen">불러오는 중...</div>
      ) : (
        <>
          <p className="section-title">다가오는 일정</p>
          {upcoming.length === 0 && (
            <div className="empty-state">
              <div className="emoji" style={{ display: 'flex', justifyContent: 'center' }}>
                <CalendarIcon size={48} />
              </div>
              <p>등록된 일정이 없어요.</p>
            </div>
          )}
          {upcoming.map((item) => {
            const meta = categoryMeta(item.category);
            const overdue = daysUntil(item.scheduled_date) < 0;
            const isProcessing = actionId === item.id;
            return (
              <div key={item.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Badge size="small" variant="fill" color={overdue ? 'yellow' : 'blue'}>
                      {dDayLabel(item.scheduled_date)}
                    </Badge>
                    <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15 }}>
                      {meta.emoji} {item.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginTop: 4 }}>
                      {item.scheduled_date} · {meta.label}
                      {item.repeat_days ? ` · 반복` : ''}
                    </div>
                    {item.memo && <p style={{ fontSize: 13, marginTop: 6 }}>{item.memo}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <div style={{ flex: 1 }}>
                    <Button
                      color="primary"
                      variant="weak"
                      display="full"
                      disabled={isProcessing || actionId !== null}
                      onClick={() => handleComplete(item)}
                    >
                      {isProcessing ? '처리 중...' : '완료 처리'}
                    </Button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Button
                      color="danger"
                      variant="weak"
                      display="full"
                      disabled={isProcessing || actionId !== null}
                      onClick={() => handleDelete(item)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {completed.length > 0 && (
            <>
              <p className="section-title" style={{ marginTop: 24 }}>
                완료한 일정
              </p>
              <div className="card">
                {completed.map((item) => {
                  const meta = categoryMeta(item.category);
                  return (
                    <div className="list-row" key={item.id}>
                      <span style={{ color: 'var(--color-text-sub)' }}>
                        {meta.emoji} {item.title}
                      </span>
                      <Badge size="small" variant="weak" color="elephant">
                        {item.scheduled_date}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>새 일정 등록</h2>

            <div className="field-group">
              <label className="field-label">종류</label>
              <Chip kind="select" wrap>
                {CATEGORY_OPTIONS.map((opt) => (
                  <ChipItem
                    key={opt.value}
                    selected={form.category === opt.value}
                    onClick={() => setForm((f) => ({ ...f, category: opt.value }))}
                  >
                    {opt.emoji} {opt.label}
                  </ChipItem>
                ))}
              </Chip>
            </div>

            <div className="field-group">
              <label className="field-label">제목 *</label>
              <TextField
                variant="box"
                placeholder="예: 종합백신 2차"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={40}
              />
            </div>

            <div className="field-group">
              <label className="field-label">날짜</label>
              <TextField
                variant="box"
                type="date"
                value={form.scheduled_date}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label">반복</label>
              <Chip kind="select" wrap>
                {REPEAT_OPTIONS.map((opt) => (
                  <ChipItem
                    key={opt.label}
                    selected={form.repeat_days === opt.value}
                    onClick={() => setForm((f) => ({ ...f, repeat_days: opt.value }))}
                  >
                    {opt.label}
                  </ChipItem>
                ))}
              </Chip>
            </div>

            <div className="field-group">
              <label className="field-label">메모</label>
              <TextArea
                variant="box"
                minHeight={56}
                value={form.memo}
                onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button color="light" onClick={() => setShowForm(false)}>
                취소
              </Button>
              <div style={{ flex: 1 }}>
                <Button
                  color="primary"
                  display="full"
                  disabled={!form.title.trim() || saving}
                  onClick={handleCreate}
                >
                  {saving ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
