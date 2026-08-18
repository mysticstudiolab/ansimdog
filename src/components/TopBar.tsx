import type { Dog } from '../types';
import { BellIcon } from './icons';

export default function TopBar({ dog, onOpenSwitcher }: { dog: Dog; onOpenSwitcher?: () => void }) {
  const avatar = (
    <div className="avatar avatar-sm">
      {dog.photo_url ? (
        <img src={dog.photo_url} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 999 }} />
      ) : (
        dog.profile_emoji
      )}
    </div>
  );

  return (
    <div className="top-bar">
      {onOpenSwitcher ? (
        <button type="button" className="top-bar-left" onClick={onOpenSwitcher}>
          {avatar}
          <span className="top-bar-title">{dog.name}</span>
        </button>
      ) : (
        <div className="top-bar-left">
          {avatar}
          <span className="top-bar-title">{dog.name}</span>
        </div>
      )}
      <button type="button" className="icon-btn" aria-label="알림">
        <BellIcon size={22} />
      </button>
    </div>
  );
}
