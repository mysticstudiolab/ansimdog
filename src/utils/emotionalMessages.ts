import type { EmotionMessage, HealthChange } from '../types';

// buildTodayChecklist의 결과 형태만 필요하므로 최소 형태로 재정의한다.
export type ChecklistItem = { done: boolean; required: boolean; label: string };

/**
 * 홈 화면의 감정 터치 문구를 만든다 (PRD §11).
 * 규칙: 실패/벌점 표현 금지, 과도한 게임화 금지, 변화가 있는 날은 차분한 안내 우선.
 */
export function buildHomeEmotionMessage(checklist: ChecklistItem[], changes: HealthChange[]): EmotionMessage {
  const hasWatch = changes.some((c) => c.severity === 'watch');
  const hasNotice = changes.length > 0;
  const required = checklist.filter((c) => c.required);
  const done = required.filter((c) => c.done);
  const remaining = required.filter((c) => !c.done);

  if (hasWatch) {
    return {
      tone: 'calm-alert',
      title: '오늘은 평소와 조금 달라요.',
      body: '기록을 바탕으로 변화를 확인해보세요. 건강분석에서 자세히 살펴볼 수 있어요.',
    };
  }

  if (remaining.length === 0) {
    return {
      tone: 'celebrate',
      title: '오늘도 잘 돌보고 있어요.',
      body: hasNotice
        ? '오늘의 기록을 모두 남겼어요. 작은 변화도 놓치지 않고 있어요. 🐾'
        : '오늘의 기록을 모두 남겼어요.\n우리 아이의 하루가 하나씩 쌓이고 있어요. 🐾',
    };
  }

  if (done.length === 0) {
    return {
      tone: 'encourage',
      title: '오늘도 시작해볼까요?',
      body: '가벼운 기록 하나로 오늘 하루를 남겨보세요.',
    };
  }

  const nextItem = remaining[0]?.label ?? '나머지 기록';
  return {
    tone: 'encourage',
    title: '오늘도 잘하고 있어요.',
    body: `${nextItem} 기록만 남겨두면 오늘 기록이 완성돼요.`,
  };
}

/** 건강분석 화면 하단 감정 터치 (PRD §15). */
export function buildAnalysisEmotionMessage(changes: HealthChange[]): EmotionMessage {
  const hasWatch = changes.some((c) => c.severity === 'watch');
  if (hasWatch) {
    return {
      tone: 'calm-alert',
      title: '차분히 지켜봐 주세요.',
      body: '변화가 며칠째 이어지고 있어요. 기록을 계속 남기고, 필요하면 병원 상담을 고려해보세요.',
    };
  }
  return {
    tone: 'celebrate',
    title: '오늘도 우리 아이를 잘 살펴보고 있어요.',
    body: '작은 변화를 기록해두는 것만으로도\n더 잘 돌볼 수 있는 시간이 쌓이고 있어요.',
  };
}
