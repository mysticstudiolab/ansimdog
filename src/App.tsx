import { useCallback, useEffect, useState } from 'react';
import { ensureAnonymousSession, supabase } from './utils/supabaseClient';
import type { Dog, ScreenName } from './types';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import Home from './components/Home';
import HealthRecords from './components/HealthRecords';
import HealthAnalysis from './components/HealthAnalysis';
import Management from './components/Management';
import Profile from './components/Profile';
import { SecondaryButton } from './components/ui';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [screen, setScreen] = useState<ScreenName>('home');
  const [error, setError] = useState<string | null>(null);
  const [openPetEditOnProfile, setOpenPetEditOnProfile] = useState(false);

  const loadDogs = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[Supabase loadDogs Error]:', fetchError);
      setError(`반려견 정보를 불러오지 못했어요. (${fetchError.message || 'Supabase 설정 확인 필요'})`);
      return [] as Dog[];
    }

    setError(null);
    const list = (data ?? []) as Dog[];
    setDogs(list);
    setSelectedDogId((prev) => {
      if (prev && list.some((d) => d.id === prev)) return prev;
      return list[0]?.id ?? null;
    });
    return list;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await ensureAnonymousSession();
        await loadDogs();
      } catch (e) {
        setError(e instanceof Error ? e.message : '초기화 중 문제가 발생했어요.');
      } finally {
        setBooting(false);
      }
    })();
  }, [loadDogs]);

  const handleDogRegistered = async (dog: Dog) => {
    await loadDogs();
    setSelectedDogId(dog.id);
    setScreen('home');
  };

  if (booting) {
    return (
      <div className="app-shell">
        <div className="loading-screen">안심하개를 준비하고 있어요 🐾</div>
      </div>
    );
  }

  if (error && dogs.length === 0) {
    return (
      <div className="app-shell">
        <div
          className="loading-screen"
          style={{ flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}
        >
          <div style={{ fontSize: 40 }}>⚠️</div>
          <span style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text)' }}>{error}</span>
          <SecondaryButton onClick={() => window.location.reload()} full={false}>
            다시 시도
          </SecondaryButton>
        </div>
      </div>
    );
  }

  if (dogs.length === 0) {
    return <Onboarding onRegistered={handleDogRegistered} />;
  }

  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];

  return (
    <div className="app-shell">
      <div className="app-main">
        {screen === 'home' && (
          <Home
            dog={selectedDog}
            dogs={dogs}
            onSelectDog={setSelectedDogId}
            onGoAnalysis={() => setScreen('analysis')}
            onGoProfileEdit={() => {
              setScreen('profile');
              setOpenPetEditOnProfile(true);
            }}
          />
        )}
        {screen === 'records' && <HealthRecords dog={selectedDog} dogs={dogs} onSelectDog={setSelectedDogId} />}
        {screen === 'analysis' && <HealthAnalysis dog={selectedDog} dogs={dogs} onSelectDog={setSelectedDogId} />}
        {screen === 'management' && <Management dog={selectedDog} dogs={dogs} onSelectDog={setSelectedDogId} />}
        {screen === 'profile' && (
          <Profile
            dogs={dogs}
            selectedDogId={selectedDog.id}
            onSelectDog={setSelectedDogId}
            onChanged={loadDogs}
            autoOpenEdit={openPetEditOnProfile}
            onAutoOpenHandled={() => setOpenPetEditOnProfile(false)}
          />
        )}
      </div>
      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  );
}
