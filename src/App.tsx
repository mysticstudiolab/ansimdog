import { useEffect, useState, useCallback } from 'react';
import { supabase, ensureAnonymousSession } from './utils/supabaseClient';
import type { Dog, ScreenName } from './types';
import Onboarding from './components/Onboarding';
import DogProfile from './components/DogProfile';
import Home from './components/Home';
import WeeklySummary from './components/WeeklySummary';
import Calendar from './components/Calendar';
import Schedule from './components/Schedule';
import { CalendarIcon, HomeIcon, ProfileIcon, ScheduleIcon, WeeklyIcon } from './components/icons';

const ONBOARDED_KEY = 'ansimdog_onboarded_v1';

const NAV_ITEMS: { key: ScreenName; label: string; Icon: (props: { size?: number }) => JSX.Element }[] = [
  { key: 'home', label: '오늘', Icon: HomeIcon },
  { key: 'weekly', label: '주간요약', Icon: WeeklyIcon },
  { key: 'calendar', label: '캘린더', Icon: CalendarIcon },
  { key: 'schedule', label: '일정', Icon: ScheduleIcon },
  { key: 'profile', label: '프로필', Icon: ProfileIcon },
];

export default function App() {
  const [booting, setBooting] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [screen, setScreen] = useState<ScreenName>('home');
  const [error, setError] = useState<string | null>(null);

  const loadDogs = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError('반려견 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return [] as Dog[];
    }

    const list = (data ?? []) as Dog[];
    setDogs(list);
    setSelectedDogId((prev) => prev ?? list[0]?.id ?? null);
    return list;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await ensureAnonymousSession();
        setHasOnboarded(localStorage.getItem(ONBOARDED_KEY) === 'true');
        await loadDogs();
      } catch (e) {
        setError(e instanceof Error ? e.message : '초기화 중 문제가 발생했어요.');
      } finally {
        setBooting(false);
      }
    })();
  }, [loadDogs]);

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setHasOnboarded(true);
  };

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
        <div className="loading-screen" style={{ flexDirection: 'column', gap: 12 }}>
          <span>{error}</span>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!hasOnboarded && dogs.length === 0) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  if (dogs.length === 0) {
    return (
      <div className="app-shell">
        <div className="app-main" style={{ paddingTop: 12 }}>
          <DogProfile mode="register" dogs={dogs} onRegistered={handleDogRegistered} onChanged={loadDogs} />
        </div>
      </div>
    );
  }

  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];

  return (
    <div className="app-shell">
      <div className="app-main">
        {screen === 'home' && <Home dog={selectedDog} dogs={dogs} onSelectDog={setSelectedDogId} />}
        {screen === 'weekly' && <WeeklySummary dog={selectedDog} />}
        {screen === 'calendar' && <Calendar dog={selectedDog} />}
        {screen === 'schedule' && <Schedule dog={selectedDog} />}
        {screen === 'profile' && (
          <DogProfile
            mode="manage"
            dogs={dogs}
            selectedDogId={selectedDog.id}
            onSelectDog={setSelectedDogId}
            onRegistered={handleDogRegistered}
            onChanged={loadDogs}
          />
        )}
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${screen === item.key ? 'active' : ''}`}
            onClick={() => setScreen(item.key)}
          >
            <span className="nav-icon">
              <item.Icon />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
