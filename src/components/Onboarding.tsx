import { useState } from 'react';
import { Button } from '@toss/tds-mobile';

interface OnboardingProps {
  onDone: () => void;
}

const STEPS = [
  {
    emoji: '🐶',
    title: '오늘도 우리 아이,\n안심하고 있나요?',
    desc: '안심하개는 반려견 보호자가 매일의 돌봄을 간편하게 기록하고 관리할 수 있는 케어 다이어리예요.',
  },
  {
    emoji: '🍚',
    title: '식사, 물, 산책, 배변,\n약 복용까지 한 번에',
    desc: '매일 10초면 충분해요. 버튼 몇 번만 눌러 오늘 하루 돌봄 기록을 남길 수 있어요.',
  },
  {
    emoji: '📊',
    title: '주간 요약으로\n변화를 한눈에',
    desc: '비교 그래프와 히트맵으로 우리 아이의 컨디션 변화를 놓치지 않고 확인해요.',
  },
  {
    emoji: '🗓️',
    title: '예방접종, 약 구매도\n미리 챙겨드릴게요',
    desc: '반복 일정을 등록해두면 놓치기 쉬운 돌봄 일정을 알림으로 챙길 수 있어요.',
  },
];

export default function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="onboarding-screen">
      <div className="onboarding-emoji">{current.emoji}</div>
      <h1 className="onboarding-title" style={{ whiteSpace: 'pre-line' }}>
        {current.title}
      </h1>
      <p className="onboarding-desc" style={{ whiteSpace: 'pre-line' }}>
        {current.desc}
      </p>

      <div className="progress-dots">
        {STEPS.map((s, i) => (
          <span key={s.title} className={`dot ${i === step ? 'active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-footer">
        {step > 0 && (
          <Button color="light" onClick={() => setStep((s) => s - 1)}>
            이전
          </Button>
        )}
        <div style={{ flex: 1 }}>
          <Button
            color="primary"
            display="full"
            onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
          >
            {isLast ? '시작하기' : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
}
