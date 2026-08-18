import { useEffect, useState } from 'react';
import type { Dog, NewDog, UserProfile } from '../types';
import { supabase } from '../utils/supabaseClient';
import { ageText } from '../utils/dateUtils';
import { BottomSheet, FormField, PrimaryButton, SecondaryButton } from './ui';
import { EditIcon, InfoIcon, PlusIcon, ProfileIcon, SparkleIcon } from './icons';
import PetForm from './PetForm';
import { seedDummyData } from '../utils/seed';

export default function Profile({
  dogs,
  selectedDogId,
  onSelectDog,
  onChanged,
}: {
  dogs: Dog[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
  onChanged: () => void;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [petSheet, setPetSheet] = useState<'add' | Dog | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleSeedDummyData = async () => {
    setSeeding(true);
    setSeedError(null);
    setSeedDone(false);
    try {
      await seedDummyData(selectedDogId);
      setSeedDone(true);
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : '더미 데이터 생성에 실패했어요.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      if (!uid) return;
      const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
      setProfile((data as UserProfile | null) ?? { id: uid, name: null, email: null });
    })();
  }, []);

  const handlePetSubmit = async (input: NewDog) => {
    setSaving(true);
    if (petSheet === 'add') {
      const { data, error } = await supabase.from('dogs').insert(input).select('*').single();
      setSaving(false);
      if (!error && data) {
        onSelectDog(data.id);
        onChanged();
        setPetSheet(null);
      }
    } else if (petSheet) {
      const { error } = await supabase.from('dogs').update(input).eq('id', petSheet.id);
      setSaving(false);
      if (!error) {
        onChanged();
        setPetSheet(null);
      }
    }
  };

  return (
    <div>
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">프로필</span>
        </div>
      </div>

      <div className="profile-header">
        <div className="avatar avatar-lg">
          <ProfileIcon size={36} />
        </div>
        <p className="profile-name">{profile?.name || '보호자님'}</p>
        <p className="profile-email">{profile?.email || '이름과 이메일을 등록해보세요'}</p>
        <div style={{ marginTop: 12 }}>
          <SecondaryButton full={false} onClick={() => setProfileSheetOpen(true)}>
            <EditIcon size={16} /> 프로필 수정
          </SecondaryButton>
        </div>
      </div>

      <h2 className="section-title">나의 반려견</h2>
      {dogs.map((dog) => (
        <div key={dog.id} className="pet-card">
          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, textAlign: 'left' }} onClick={() => onSelectDog(dog.id)}>
            <div className="avatar avatar-md">
              {dog.photo_url ? (
                <img src={dog.photo_url} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 999 }} />
              ) : (
                dog.profile_emoji
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p className="pet-card-name">
                {dog.name} {dog.id === selectedDogId && <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>· 선택됨</span>}
              </p>
              <p className="pet-card-sub">
                {dog.breed || '품종 미등록'}, {ageText(dog.birth_date)}
              </p>
            </div>
          </button>
          <button type="button" className="icon-btn" onClick={() => setPetSheet(dog)} aria-label="수정">
            <EditIcon size={18} />
          </button>
        </div>
      ))}

      <button type="button" className="btn btn-primary" onClick={() => setPetSheet('add')}>
        <PlusIcon size={18} /> 새로운 아이 등록하기
      </button>

      <div style={{ height: 24 }} />
      <h2 className="section-title">설정</h2>
      <div className="card" style={{ padding: '4px 16px' }}>
        <div className="list-item">
          <InfoIcon size={20} />
          <span className="list-item-label">앱 정보</span>
          <span className="list-item-value">v4.0.0</span>
        </div>
        <button type="button" className="list-item" style={{ width: '100%', textAlign: 'left' }} onClick={handleSeedDummyData} disabled={seeding}>
          <SparkleIcon size={20} />
          <span className="list-item-label">{seeding ? '더미 데이터 채우는 중...' : '더미 데이터 채우기 (테스트용)'}</span>
        </button>
      </div>
      {seedError && <div className="error-banner">{seedError}</div>}
      {seedDone && <p style={{ fontSize: 12.5, color: 'var(--color-primary)', marginTop: 8 }}>완료했어요. 홈/기록/분석/관리 탭에서 확인해보세요.</p>}

      {profileSheetOpen && profile && (
        <UserProfileSheet
          profile={profile}
          onClose={() => setProfileSheetOpen(false)}
          onSaved={(p) => {
            setProfile(p);
            setProfileSheetOpen(false);
          }}
        />
      )}

      {petSheet && (
        <BottomSheet open title={petSheet === 'add' ? '반려견 등록' : '반려견 정보 수정'} onClose={() => setPetSheet(null)}>
          <PetForm
            initial={petSheet === 'add' ? undefined : petSheet}
            submitLabel={petSheet === 'add' ? '등록하기' : '저장하기'}
            submitting={saving}
            onSubmit={handlePetSubmit}
          />
        </BottomSheet>
      )}
    </div>
  );
}

function UserProfileSheet({
  profile,
  onClose,
  onSaved,
}: {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (p: UserProfile) => void;
}) {
  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('users').upsert({ id: profile.id, name: name.trim() || null, email: email.trim() || null });
    setSaving(false);
    if (!error) onSaved({ id: profile.id, name: name.trim() || null, email: email.trim() || null });
  };

  return (
    <BottomSheet open title="프로필 수정" onClose={onClose}>
      <FormField label="이름">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="보호자님 이름" />
      </FormField>
      <FormField label="이메일 (선택)">
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
      </FormField>
      <PrimaryButton onClick={handleSave} disabled={saving}>
        {saving ? '저장 중...' : '저장하기'}
      </PrimaryButton>
    </BottomSheet>
  );
}
