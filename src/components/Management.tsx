import { useEffect, useMemo, useState } from 'react';
import type { Dog, Expense, ExpenseCategory, Schedule, ScheduleCategory } from '../types';
import { supabase } from '../utils/supabaseClient';
import { formatDday, nextOccurrence, todayISO } from '../utils/dateUtils';
import { Badge, Card, PrimaryButton, Segmented, SectionTitle } from './ui';
import {
  GroomingGlyphIcon,
  HospitalGlyphIcon,
  MedicineGlyphIcon,
  PlusIcon,
  VaccineGlyphIcon,
  WalletIcon,
} from './icons';
import ScheduleForm from './ScheduleForm';
import ExpenseForm from './ExpenseForm';
import TopBar from './TopBar';

type Tab = 'schedule' | 'expense';

const SCHEDULE_CATEGORY_LABEL: Record<ScheduleCategory, string> = {
  vaccine: '예방접종',
  medicine: '약',
  hospital: '병원',
  deworming: '구충',
  grooming: '미용',
  etc: '기타',
};

const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  hospital: '병원',
  food: '사료',
  snack: '간식',
  grooming: '미용',
  supplies: '용품',
  etc: '기타',
};

function scheduleIcon(category: ScheduleCategory) {
  if (category === 'vaccine' || category === 'deworming') return VaccineGlyphIcon;
  if (category === 'medicine') return MedicineGlyphIcon;
  if (category === 'hospital') return HospitalGlyphIcon;
  if (category === 'grooming') return GroomingGlyphIcon;
  return WalletIcon;
}

export default function Management({ dog }: { dog: Dog }) {
  const [tab, setTab] = useState<Tab>('schedule');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      supabase.from('schedules').select('*').eq('dog_id', dog.id).order('scheduled_date', { ascending: true }),
      supabase.from('expenses').select('*').eq('dog_id', dog.id).order('spent_date', { ascending: false }),
    ]).then(([scheduleRes, expenseRes]) => {
      setSchedules((scheduleRes.data ?? []) as Schedule[]);
      setExpenses((expenseRes.data ?? []) as Expense[]);
      setLoading(false);
    });
  };

  useEffect(loadAll, [dog.id]);

  const today = todayISO();

  const upcoming = useMemo(() => {
    return schedules
      .filter((s) => !s.is_completed)
      .map((s) => ({ ...s, nextDate: nextOccurrence(s.scheduled_date, s.repeat_days, today) }))
      .sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1));
  }, [schedules, today]);

  const completed = useMemo(() => schedules.filter((s) => s.is_completed), [schedules]);

  const toggleComplete = async (schedule: Schedule) => {
    await supabase.from('schedules').update({ is_completed: !schedule.is_completed }).eq('id', schedule.id);
    loadAll();
  };

  const thisMonthExpenses = useMemo(() => {
    const ym = today.slice(0, 7);
    return expenses.filter((e) => e.spent_date.startsWith(ym));
  }, [expenses, today]);

  const monthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    thisMonthExpenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [thisMonthExpenses]);

  const maxCategory = Math.max(1, ...categoryTotals.map(([, v]) => v));

  return (
    <div>
      <TopBar dog={dog} />
      <div className="section-title-row">
        <h2 className="section-title">관리</h2>
      </div>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'schedule', label: '건강 일정' },
          { value: 'expense', label: '생활비' },
        ]}
      />
      <div style={{ height: 16 }} />

      {loading ? (
        <p className="empty-state">불러오는 중이에요...</p>
      ) : tab === 'schedule' ? (
        <>
          <SectionTitle>예정된 일정</SectionTitle>
          {upcoming.length === 0 ? (
            <p className="empty-state">예정된 일정이 없어요.<br />예방접종이나 약 일정을 등록해보세요.</p>
          ) : (
            upcoming.map((s) => {
              const Icon = scheduleIcon(s.category);
              const dday = formatDday(s.nextDate, today);
              const urgent = s.nextDate <= today;
              return (
                <div key={s.id} className="schedule-item">
                  <div className="icon-tile icon-tile--primary" style={{ width: 42, height: 42 }}>
                    <Icon size={20} />
                  </div>
                  <div className="schedule-info">
                    <p className="schedule-title">{s.title}</p>
                    <p className="schedule-sub">
                      {SCHEDULE_CATEGORY_LABEL[s.category]}
                      {s.place ? ` · ${s.place}` : ''}
                    </p>
                  </div>
                  <button type="button" onClick={() => toggleComplete(s)}>
                    <Badge tone={urgent ? 'watch' : 'accent'}>{dday}</Badge>
                  </button>
                </div>
              );
            })
          )}

          {completed.length > 0 && (
            <>
              <div style={{ height: 8 }} />
              <SectionTitle>완료된 일정</SectionTitle>
              {completed.map((s) => (
                <div key={s.id} className="schedule-item" style={{ opacity: 0.6 }}>
                  <div className="icon-tile icon-tile--neutral" style={{ width: 42, height: 42 }}>
                    {(() => {
                      const Icon = scheduleIcon(s.category);
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <div className="schedule-info">
                    <p className="schedule-title">{s.title}</p>
                    <p className="schedule-sub">{SCHEDULE_CATEGORY_LABEL[s.category]}</p>
                  </div>
                  <button type="button" onClick={() => toggleComplete(s)}>
                    <Badge tone="primary">완료</Badge>
                  </button>
                </div>
              ))}
            </>
          )}

          <div style={{ height: 8 }} />
          <button type="button" className="btn btn-outline-accent" onClick={() => setScheduleFormOpen(true)}>
            <PlusIcon size={18} /> 일정 추가하기
          </button>
        </>
      ) : (
        <>
          <div className="expense-summary">
            <p className="expense-summary-label">이번 달 생활비</p>
            <p className="expense-summary-value">{monthTotal.toLocaleString()}원</p>
          </div>

          {categoryTotals.length > 0 && (
            <Card>
              {categoryTotals.map(([cat, value]) => (
                <div key={cat} className="expense-category-row">
                  <span className="expense-category-label">{EXPENSE_CATEGORY_LABEL[cat]}</span>
                  <span className="expense-category-bar-track">
                    <span className="expense-category-bar-fill" style={{ width: `${(value / maxCategory) * 100}%` }} />
                  </span>
                  <span className="expense-category-amount">{value.toLocaleString()}원</span>
                </div>
              ))}
            </Card>
          )}

          <SectionTitle>지출 기록</SectionTitle>
          <Card>
            {expenses.length === 0 ? (
              <p className="empty-state">아직 등록된 지출이 없어요.</p>
            ) : (
              expenses.slice(0, 20).map((e) => (
                <div key={e.id} className="expense-row">
                  <div className="icon-tile icon-tile--accent" style={{ width: 38, height: 38 }}>
                    <WalletIcon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5 }}>{EXPENSE_CATEGORY_LABEL[e.category]}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{e.spent_date}{e.memo ? ` · ${e.memo}` : ''}</p>
                  </div>
                  <span style={{ fontWeight: 700 }}>{e.amount.toLocaleString()}원</span>
                </div>
              ))
            )}
          </Card>

          <PrimaryButton onClick={() => setExpenseFormOpen(true)}>지출 추가하기</PrimaryButton>
        </>
      )}

      {scheduleFormOpen && <ScheduleForm dogId={dog.id} onClose={() => setScheduleFormOpen(false)} onSaved={loadAll} />}
      {expenseFormOpen && <ExpenseForm dogId={dog.id} onClose={() => setExpenseFormOpen(false)} onSaved={loadAll} />}
    </div>
  );
}
