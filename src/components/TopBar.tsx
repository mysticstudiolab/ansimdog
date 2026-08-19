import { useState, type ReactNode } from 'react';
import type { Dog } from '../types';
import { BellIcon, ChevronDownIcon } from './icons';
import { BottomSheet } from './ui';

export default function TopBar({
  dog,
  dogs,
  onSelectDog,
  extra,
}: {
  dog: Dog;
  dogs?: Dog[];
  onSelectDog?: (id: string) => void;
  extra?: ReactNode;
}) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const canSwitch = !!dogs && dogs.length > 1 && !!onSelectDog;

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
      <div className="top-bar-left">
        {canSwitch ? (
          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setSwitcherOpen(true)}>
            {avatar}
            <span className="top-bar-title">{dog.name}</span>
            <ChevronDownIcon size={18} />
          </button>
        ) : (
          <>
            {avatar}
            <span className="top-bar-title">{dog.name}</span>
          </>
        )}
        {extra}
      </div>
      <button type="button" className="icon-btn" aria-label="알림">
        <BellIcon size={22} />
      </button>

      {canSwitch && (
        <BottomSheet open={switcherOpen} title="반려견 전환" onClose={() => setSwitcherOpen(false)}>
          {dogs!.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`pet-card ${d.id === dog.id ? 'pet-card--selected' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
              onClick={() => {
                onSelectDog!(d.id);
                setSwitcherOpen(false);
              }}
            >
              <div className="avatar avatar-md">
                {d.photo_url ? (
                  <img src={d.photo_url} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 999 }} />
                ) : (
                  d.profile_emoji
                )}
              </div>
              <div>
                <p className="pet-card-name">
                  {d.name} {d.id === dog.id && <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>· 선택됨</span>}
                </p>
                <p className="pet-card-sub">{d.breed || '품종 미등록'}</p>
              </div>
            </button>
          ))}
        </BottomSheet>
      )}
    </div>
  );
}
