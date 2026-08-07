import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    // 무료 플랜 프로젝트 1개를 여러 미니앱이 공유하므로, 테이블은 public이 아닌
    // 전용 스키마(ansimdog)에 둔다. supabase/schema.sql 및 대시보드의
    // Exposed schemas 설정과 반드시 함께 맞춰야 한다.
    schema: 'ansimdog',
  },
});

/**
 * 이 앱은 로그인 화면 없이 기기별 익명 세션으로 데이터를 구분합니다.
 * RLS 정책은 auth.uid()와 owner_id를 비교해 다른 사용자의 데이터 접근을 차단합니다.
 */
export async function ensureAnonymousSession(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session?.user) {
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    if (error?.message?.includes('Anonymous sign-ins are disabled')) {
      throw new Error(
        'Supabase 프로젝트에 익명 로그인이 활성화되지 않았습니다. Supabase 대시보드 > Authentication > Providers > Anonymous를 Enabled(활성화)로 변경해주세요.'
      );
    }
    throw new Error(error?.message ?? '익명 로그인에 실패했습니다.');
  }

  return data.user.id;
}
