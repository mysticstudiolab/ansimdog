import { useState } from 'react';
import type { Dog, NewDog } from '../types';
import { supabase } from '../utils/supabaseClient';
import PetForm from './PetForm';
import { PawIcon } from './icons';

export default function Onboarding({ onRegistered }: { onRegistered: (dog: Dog) => void }) {
  const [step, setStep] = useState<'intro' | 'register'>('intro');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: NewDog) => {
    setSubmitting(true);
    setError(null);
    const { data, error: insertError } = await supabase.from('dogs').insert(input).select('*').single();
    setSubmitting(false);
    if (insertError || !data) {
      setError(insertError?.message ?? '반려견 등록에 실패했어요.');
      return;
    }
    onRegistered(data as Dog);
  };

  if (step === 'intro') {
    return (
      <div className="app-shell">
        <div className="app-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', paddingBottom: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ color: 'var(--color-primary)', marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
              <PawIcon size={56} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>안심하개에 오신 걸 환영해요</h1>
            <p style={{ fontSize: 14.5, color: 'var(--color-text-sub)', lineHeight: 1.7 }}>
              매일 조금씩 기록하면,
              <br />
              평소와 다른 변화를 먼저 알아챌 수 있어요.
              <br />
              먼저 우리 아이를 등록해볼까요?
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setStep('register')}>
            반려견 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-main" style={{ paddingTop: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>반려견 정보를 알려주세요</h1>
        <p style={{ fontSize: 13.5, color: 'var(--color-text-sub)', marginBottom: 22 }}>
          이름만 입력해도 바로 시작할 수 있어요. 나머지는 나중에 프로필에서 수정할 수 있어요.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <PetForm submitLabel="시작하기" onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
