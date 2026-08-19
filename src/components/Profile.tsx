import { useEffect, useState } from 'react';
import type { Dog, NewDog } from '../types';
import { supabase } from '../utils/supabaseClient';
import { ageText } from '../utils/dateUtils';
import { BottomSheet } from './ui';
import { EditIcon, PlusIcon } from './icons';
import PetForm from './PetForm';

export default function Profile({
  dogs,
  selectedDogId,
  onSelectDog,
  onChanged,
  autoOpenEdit,
  onAutoOpenHandled,
}: {
  dogs: Dog[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
  onChanged: () => void;
  autoOpenEdit?: boolean;
  onAutoOpenHandled?: () => void;
}) {
  const [petSheet, setPetSheet] = useState<'add' | Dog | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoOpenEdit) return;
    const current = dogs.find((d) => d.id === selectedDogId);
    if (current) {
      setFormError(null);
      setPetSheet(current);
    }
    onAutoOpenHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenEdit]);

  const handlePetSubmit = async (input: NewDog) => {
    setSaving(true);
    setFormError(null);
    if (petSheet === 'add') {
      const { data, error } = await supabase.from('dogs').insert(input).select('*').single();
      setSaving(false);
      if (error || !data) {
        setFormError(error?.message ?? '반려견 등록에 실패했어요.');
        return;
      }
      onSelectDog(data.id);
      onChanged();
      setPetSheet(null);
    } else if (petSheet) {
      const { error } = await supabase.from('dogs').update(input).eq('id', petSheet.id);
      setSaving(false);
      if (error) {
        setFormError(error.message);
        return;
      }
      onChanged();
      setPetSheet(null);
    }
  };

  return (
    <div>
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">프로필</span>
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
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              setFormError(null);
              setPetSheet(dog);
            }}
            aria-label="수정"
          >
            <EditIcon size={18} />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          setFormError(null);
          setPetSheet('add');
        }}
      >
        <PlusIcon size={18} /> 새로운 아이 등록하기
      </button>

      {petSheet && (
        <BottomSheet open title={petSheet === 'add' ? '반려견 등록' : '반려견 정보 수정'} onClose={() => setPetSheet(null)}>
          {formError && <div className="error-banner">{formError}</div>}
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
