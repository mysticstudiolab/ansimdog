import { useEffect, useMemo, useState } from 'react';
import type { DailyLog, Dog } from '../types';
import { fetchDailyLogsRange } from '../utils/records';
import { recentDays, todayISO, weekdayLabel } from '../utils/dateUtils';
import { buildAiBriefing, detectHealthChanges, summarizePattern } from '../utils/analysis';
import { buildAnalysisEmotionMessage } from '../utils/emotionalMessages';
import { Badge, Card, EmotionCard, Segmented, SectionTitle } from './ui';
import TopBar from './TopBar';
import HealthReportSheet from './HealthReportSheet';

type Period = 'week' | 'month';

export default function HealthAnalysis({
  dog,
  dogs,
  onSelectDog,
}: {
  dog: Dog;
  dogs: Dog[];
  onSelectDog: (id: string) => void;
}) {
  const today = todayISO();
  const [period, setPeriod] = useState<Period>('week');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState<'weekly' | 'hospital' | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDailyLogsRange(dog.id, recentDays(30)[0], today).then((rows) => {
      setLogs(rows);
      setLoading(false);
    });
  }, [dog.id, today]);

  const logsByDate = useMemo(() => new Map(logs.map((l) => [l.log_date, l])), [logs]);
  const changes = useMemo(() => detectHealthChanges(logsByDate), [logsByDate]);
  const periodLogs = useMemo(() => {
    const days = new Set(recentDays(period === 'week' ? 7 : 30));
    return logs.filter((l) => days.has(l.log_date));
  }, [logs, period]);
  const pattern = useMemo(
    () => summarizePattern(periodLogs, period === 'week' ? '최근 7일' : '최근 30일'),
    [periodLogs, period]
  );
  const briefing = useMemo(() => buildAiBriefing(dog.name, changes, pattern), [dog.name, changes, pattern]);
  const emotion = useMemo(() => buildAnalysisEmotionMessage(changes), [changes]);

  const chartDays = useMemo(() => recentDays(7), []);
  const maxWalk = Math.max(1, ...chartDays.map((d) => logsByDate.get(d)?.walk_minutes ?? 0));

  const primaryChange = changes[0];

  return (
    <div>
      <TopBar dog={dog} dogs={dogs} onSelectDog={onSelectDog} />
      <div className="section-title-row">
        <h2 className="section-title">건강분석</h2>
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'week', label: '주간' },
            { value: 'month', label: '월간' },
          ]}
        />
      </div>

      {loading ? (
        <p className="empty-state">분석 중이에요...</p>
      ) : (
        <>
          <Card>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-sub)', marginBottom: 10 }}>
              평소 패턴 · {pattern.periodLabel}
            </p>
            <div className="summary-grid" style={{ marginBottom: 0 }}>
              <StatTile label="평균 산책" value={`${pattern.avgWalkMinutes}분`} />
              <StatTile label="식사 정상 비율" value={`${pattern.mealNormalRate}%`} />
              <StatTile label="평균 배변" value={`${pattern.avgPoopCount}회`} />
              <StatTile label="기록 일수" value={`${pattern.sampleSize}일`} />
            </div>
          </Card>

          <Card>
            <div className="insight-card">
              <span className="insight-icon">{primaryChange ? (primaryChange.severity === 'watch' ? '🩺' : '📉') : '🙂'}</span>
              <div>
                <p className="insight-title">{primaryChange ? primaryChange.changeDescription : '평소와 비슷하게 지내고 있어요'}</p>
                <p className="insight-sub">{primaryChange ? '산책 시간 기준' : '최근 기록 기준'}</p>
              </div>
            </div>
            <div className="bar-chart">
              {chartDays.map((d) => {
                const minutes = logsByDate.get(d)?.walk_minutes ?? 0;
                const isToday = d === today;
                return (
                  <div key={d} className="bar-chart-col">
                    <div
                      className={`bar-chart-bar ${isToday ? 'bar-chart-bar--today' : ''}`}
                      style={{ height: `${Math.max((minutes / maxWalk) * 100, minutes > 0 ? 8 : 2)}%` }}
                    />
                    <span className="bar-chart-label">{isToday ? '오늘' : weekdayLabel(d)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="briefing-card">
            <div className="briefing-header">
              <span>AI 건강 브리핑</span>
              <Badge tone="primary">Beta</Badge>
            </div>
            <p className="briefing-body">{briefing}</p>
          </div>

          <SectionTitle>리포트</SectionTitle>
          <div className="report-buttons">
            <button type="button" className="report-btn" onClick={() => setReportOpen('weekly')}>
              📄 건강 리포트
            </button>
            <button type="button" className="report-btn report-btn--primary" onClick={() => setReportOpen('hospital')}>
              ➕ 병원용 리포트
            </button>
          </div>

          <EmotionCard tone={emotion.tone} title={emotion.title} body={emotion.body} />
        </>
      )}

      {reportOpen && (
        <HealthReportSheet
          type={reportOpen}
          dog={dog}
          pattern={pattern}
          changes={changes}
          logs={periodLogs}
          onClose={() => setReportOpen(null)}
        />
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="summary-card-label">{label}</p>
      <p className="summary-card-value" style={{ fontSize: 16 }}>
        {value}
      </p>
    </div>
  );
}
