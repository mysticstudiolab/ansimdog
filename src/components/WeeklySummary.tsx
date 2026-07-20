import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '../utils/supabaseClient';
import { getLastNDays, toDateKey } from '../utils/dateUtils';
import type { DailyLog, Dog } from '../types';
import { WalkIcon, WaterIcon } from './icons';

interface WeeklySummaryProps {
  dog: Dog;
}

const MOOD_SCORE: Record<DailyLog['mood'], number> = {
  great: 5,
  good: 4,
  normal: 3,
  bad: 2,
  sick: 1,
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function buildInsight(logs: (DailyLog | null)[]): { emoji: string; text: string } {
  const present = logs.filter((l): l is DailyLog => l !== null);

  if (present.length === 0) {
    return { emoji: '📝', text: '이번 주 기록이 아직 없어요. 오늘부터 하나씩 남겨볼까요?' };
  }

  const walkedDays = present.filter((l) => l.walked).length;
  const diarrheaDays = present.filter((l) => l.poop_status === 'diarrhea').length;
  const lowMoodDays = present.filter((l) => l.mood === 'bad' || l.mood === 'sick').length;
  const avgWater = present.reduce((sum, l) => sum + l.water_ml, 0) / present.length;
  const missedMedicine = present.filter((l) => !l.medicine_taken).length;

  if (diarrheaDays >= 2) {
    return { emoji: '⚠️', text: `이번 주 설사 기록이 ${diarrheaDays}일 있었어요. 컨디션이 계속되면 병원 방문을 고려해보세요.` };
  }
  if (lowMoodDays >= 3) {
    return { emoji: '💙', text: `이번 주 컨디션이 좋지 않은 날이 ${lowMoodDays}일이었어요. 평소보다 세심히 살펴봐 주세요.` };
  }
  if (walkedDays <= 2) {
    return { emoji: '🐾', text: `이번 주 산책은 ${walkedDays}일뿐이었어요. 짧은 산책이라도 조금 더 늘려보는 건 어떨까요?` };
  }
  if (avgWater < 150) {
    return { emoji: '💧', text: '평소보다 물 섭취량이 적어 보여요. 급수량을 확인해보세요.' };
  }
  if (missedMedicine >= 3) {
    return { emoji: '💊', text: `약 복용을 놓친 날이 ${missedMedicine}일 있었어요. 복용 시간을 알림으로 등록해보세요.` };
  }

  return { emoji: '🎉', text: '이번 주는 전반적으로 안정적인 한 주였어요! 지금처럼 꾸준히 기록해주세요.' };
}

export default function WeeklySummary({ dog }: WeeklySummaryProps) {
  const days = useMemo(() => getLastNDays(7), []);
  const [logsByDate, setLogsByDate] = useState<Record<string, DailyLog>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const start = toDateKey(days[0]);
      const end = toDateKey(days[days.length - 1]);
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
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [dog.id, days]);

  const chartData = days.map((d) => {
    const key = toDateKey(d);
    const log = logsByDate[key];
    return {
      day: WEEKDAY_LABELS[d.getDay()],
      water: log?.water_ml ?? 0,
      walk: log?.walk_minutes ?? 0,
      mood: log ? MOOD_SCORE[log.mood] : null,
    };
  });

  const orderedLogs = days.map((d) => logsByDate[toDateKey(d)] ?? null);
  const insight = buildInsight(orderedLogs);

  const walkedDays = orderedLogs.filter((l) => l?.walked).length;
  const totalMeals = orderedLogs.reduce((sum, l) => sum + (l?.meal_count ?? 0), 0);
  const recordedDays = orderedLogs.filter(Boolean).length;

  if (loading) {
    return <div className="loading-screen">이번 주 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="top-bar" style={{ padding: 0, marginBottom: 4 }}>
        <h1>주간 요약</h1>
        <p>최근 7일 · {dog.name}</p>
      </div>

      <div className="insight-card">
        <p className="card-title">{insight.emoji} AI 알림</p>
        <p>{insight.text}</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-box">
          <div className="value">{recordedDays}/7</div>
          <div className="label">기록한 날</div>
        </div>
        <div className="stat-box">
          <div className="value">{walkedDays}/7</div>
          <div className="label">산책한 날</div>
        </div>
        <div className="stat-box">
          <div className="value">{totalMeals}</div>
          <div className="label">이번 주 식사 횟수</div>
        </div>
      </div>

      <div className="card">
        <p className="card-title">
          <span className="icon-tile"><WaterIcon /></span> 물 섭취량 (ml)
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8eb" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="water" fill="#3182f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <p className="card-title">
          <span className="icon-tile"><WalkIcon /></span> 산책 시간 (분)
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8eb" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="walk" fill="#ff9f43" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <p className="card-title">컨디션 변화</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8eb" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis hide domain={[1, 5]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#3182f6" strokeWidth={3} dot connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <p className="card-title">🗓️ 이번 주 히트맵</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {orderedLogs.map((log, i) => (
            <div key={days[i].toISOString()} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  height: 40,
                  borderRadius: 10,
                  background: log ? '#3182f6' : '#e5e8eb',
                  opacity: log ? 0.4 + (MOOD_SCORE[log.mood] / 5) * 0.6 : 1,
                  marginBottom: 6,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{WEEKDAY_LABELS[days[i].getDay()]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
