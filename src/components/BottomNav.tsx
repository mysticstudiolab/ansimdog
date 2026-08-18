import type { ScreenName } from '../types';
import { AnalysisIcon, HomeIcon, ManagementIcon, ProfileIcon, RecordsIcon } from './icons';

const NAV_ITEMS: { key: ScreenName; label: string; Icon: (props: { size?: number }) => JSX.Element }[] = [
  { key: 'home', label: '홈', Icon: HomeIcon },
  { key: 'records', label: '기록', Icon: RecordsIcon },
  { key: 'analysis', label: '분석', Icon: AnalysisIcon },
  { key: 'management', label: '관리', Icon: ManagementIcon },
  { key: 'profile', label: '프로필', Icon: ProfileIcon },
];

export default function BottomNav({ screen, onChange }: { screen: ScreenName; onChange: (s: ScreenName) => void }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`nav-item ${screen === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          <span className="nav-icon">
            <item.Icon size={22} />
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
