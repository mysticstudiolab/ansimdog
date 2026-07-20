import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatKoreanDate, toDateKey } from '../utils/dateUtils';
import type { DailyLog, Dog } from '../types';
import { PawAvatarIcon } from './icons';
import DailyLogEditor from './DailyLogEditor';

interface HomeProps {
  dog: Dog;
  dogs: Dog[];
  onSelectDog: (dogId: string) => void;
}

export default function Home({ dog, dogs, onSelectDog }: HomeProps) {
  const today = new Date();
  const dateKey = toDateKey(today);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('dog_id', dog.id)
        .eq('log_date', dateKey)
        .maybeSingle();

      if (cancelled) return;
      setLog(data ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [dog.id, dateKey]);

  if (loading) {
    return <div className="loading-screen">불러오는 중...</div>;
  }

  return (
    <div>
      {dogs.length > 1 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 0 12px' }}>
          {dogs.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDog(d.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                flexShrink: 0,
                opacity: d.id === dog.id ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  background: 'var(--color-surface)',
                  border: d.id === dog.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                }}
              >
                {d.photo_url ? (
                  <img
                    src={d.photo_url}
                    alt={d.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PawAvatarIcon size={48} />
                )}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{d.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="top-bar" style={{ padding: 0, marginBottom: 4 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {dog.photo_url ? (
            <img
              src={dog.photo_url}
              alt={dog.name}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <PawAvatarIcon size={28} />
          )}
          {dog.name}
        </h1>
        <p>
          {formatKoreanDate(today)} · {saving ? '저장 중...' : '오늘 기록 저장됨'}
        </p>
      </div>

      <DailyLogEditor
        key={`${dog.id}-${dateKey}`}
        dog={dog}
        dateKey={dateKey}
        initialLog={log}
        onSavingChange={setSaving}
        onSaved={setLog}
      />
    </div>
  );
}
