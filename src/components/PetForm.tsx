import { useState } from 'react';
import type { Gender, NewDog } from '../types';
import { supabase } from '../utils/supabaseClient';
import { Chip, FormField, PrimaryButton } from './ui';
import { CameraIcon } from './icons';

const EMOJI_OPTIONS = ['🐶', '🐕', '🦮', '🐩', '🐕‍🦺'];
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
  { value: 'unknown', label: '미상' },
];

export default function PetForm({
  initial,
  submitLabel,
  onSubmit,
  submitting,
}: {
  initial?: Partial<NewDog>;
  submitLabel: string;
  onSubmit: (dog: NewDog) => Promise<void>;
  submitting?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.profile_emoji ?? '🐶');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [breed, setBreed] = useState(initial?.breed ?? '');
  const [birthDate, setBirthDate] = useState(initial?.birth_date ?? '');
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'unknown');
  const [weight, setWeight] = useState(initial?.weight_kg != null ? String(initial.weight_kg) : '');
  const [neutered, setNeutered] = useState(initial?.neutered ?? false);
  const [medicineNote, setMedicineNote] = useState(initial?.medicine_note ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setLocalError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      if (!uid) throw new Error('세션을 확인할 수 없어요.');
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('ansimdog-dog-photos').upload(path, file, {
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('ansimdog-dog-photos').getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : '사진 업로드에 실패했어요.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setLocalError('이름을 입력해주세요.');
      return;
    }
    setLocalError(null);
    await onSubmit({
      name: name.trim(),
      profile_emoji: emoji,
      photo_url: photoUrl,
      breed: breed.trim() || null,
      birth_date: birthDate || null,
      gender,
      weight_kg: weight ? Number(weight) : null,
      neutered,
      medicine_note: medicineNote.trim() || null,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <label style={{ position: 'relative', cursor: 'pointer' }}>
          <div className="avatar avatar-lg">
            {photoUrl ? <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 999 }} /> : emoji}
          </div>
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 30,
              height: 30,
              borderRadius: 999,
              background: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-surface)',
            }}
          >
            <CameraIcon size={15} />
          </span>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {!photoUrl && (
        <div className="option-grid" style={{ justifyContent: 'center' }}>
          {EMOJI_OPTIONS.map((opt) => (
            <Chip key={opt} label={opt} active={emoji === opt} onClick={() => setEmoji(opt)} />
          ))}
        </div>
      )}

      <FormField label="이름">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 초코" />
      </FormField>

      <div className="form-row">
        <FormField label="품종">
          <input className="input" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="예) 토이푸들" />
        </FormField>
        <FormField label="생년월일">
          <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </FormField>
      </div>

      <FormField label="성별">
        <div className="option-grid">
          {GENDER_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} active={gender === opt.value} onClick={() => setGender(opt.value)} />
          ))}
        </div>
      </FormField>

      <div className="form-row">
        <FormField label="체중 (kg)">
          <input
            type="number"
            inputMode="decimal"
            className="input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="예) 5.2"
          />
        </FormField>
        <FormField label="중성화 여부">
          <div className="option-grid">
            <Chip label="완료" active={neutered} onClick={() => setNeutered(true)} />
            <Chip label="안함" active={!neutered} onClick={() => setNeutered(false)} />
          </div>
        </FormField>
      </div>

      <FormField label="지속 복용 중인 약 (선택)">
        <textarea
          className="input"
          value={medicineNote}
          onChange={(e) => setMedicineNote(e.target.value)}
          placeholder="예) 심장사상충 예방약 매달 1회"
        />
      </FormField>

      {localError && <div className="error-banner">{localError}</div>}

      <PrimaryButton onClick={handleSubmit} disabled={submitting || uploading}>
        {uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : submitLabel}
      </PrimaryButton>
    </div>
  );
}
