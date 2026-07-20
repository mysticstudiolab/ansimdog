import { useRef, useState } from 'react';
import { Button, Chip, ChipItem, TextArea, TextField } from '@toss/tds-mobile';
import { supabase } from '../utils/supabaseClient';
import type { Dog, Gender, NewDog } from '../types';
import { PawAvatarIcon } from './icons';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
];

interface DogProfileProps {
  mode: 'register' | 'manage';
  dogs: Dog[];
  selectedDogId?: string;
  onSelectDog?: (dogId: string) => void;
  onRegistered: (dog: Dog) => void;
  onChanged: () => void | Promise<unknown>;
}

function DogForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Partial<Dog> | null;
  onCancel: () => void;
  onSaved: (dog: Dog) => void;
}) {
  const [form, setForm] = useState<NewDog>({
    name: initial?.name ?? '',
    breed: initial?.breed ?? '',
    birth_date: initial?.birth_date ?? '',
    gender: initial?.gender && initial.gender !== 'unknown' ? initial.gender : GENDER_OPTIONS[0].value,
    weight_kg: initial?.weight_kg ?? undefined,
    neutered: initial?.neutered ?? false,
    photo_url: initial?.photo_url ?? null,
    medicine_note: initial?.medicine_note ?? '',
    meal_target: initial?.meal_target ?? 2,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('5MB 이하 이미지만 업로드할 수 있어요.');
      return;
    }

    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error('세션을 확인할 수 없어요.');

      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const path = `${uid}/${initial?.id ?? 'new'}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('dog-photos').getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: publicUrlData.publicUrl }));
    } catch {
      setPhotoError('사진 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const canSubmit = form.name.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      breed: form.breed?.trim() || null,
      birth_date: form.birth_date || null,
      gender: form.gender ?? GENDER_OPTIONS[0].value,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      neutered: form.neutered ?? false,
      photo_url: form.photo_url ?? null,
      medicine_note: form.medicine_note?.trim() || null,
      meal_target: form.meal_target ?? 2,
    };

    const result = initial?.id
      ? await supabase.from('dogs').update(payload).eq('id', initial.id).select().single()
      : await supabase.from('dogs').insert(payload).select().single();

    setSaving(false);

    if (result.error || !result.data) {
      setError('저장에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    onSaved(result.data as Dog);
  };

  return (
    <div>
      <div className="field-group">
        <label className="field-label">프로필 사진</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              background: 'var(--color-bg-sub, #f2f4f6)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {form.photo_url ? (
              <img src={form.photo_url} alt="반려견 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <PawAvatarIcon size={64} />
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" color="light" disabled={uploadingPhoto} onClick={() => fileInputRef.current?.click()}>
              {uploadingPhoto ? '업로드 중...' : form.photo_url ? '사진 변경' : '사진 선택'}
            </Button>
            {form.photo_url && (
              <Button
                size="small"
                color="light"
                onClick={() => setForm((f) => ({ ...f, photo_url: null }))}
              >
                삭제
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoSelect}
          />
        </div>
        {photoError && (
          <p style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 8 }}>{photoError}</p>
        )}
      </div>

      <div className="field-group">
        <label className="field-label">이름 *</label>
        <TextField
          variant="box"
          placeholder="예: 초코"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          maxLength={20}
        />
      </div>

      <div className="field-group">
        <label className="field-label">견종</label>
        <TextField
          variant="box"
          placeholder="예: 말티즈"
          value={form.breed ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
          maxLength={30}
        />
      </div>

      <div className="field-group">
        <label className="field-label">성별</label>
        <Chip kind="select">
          {GENDER_OPTIONS.map((opt) => (
            <ChipItem
              key={opt.value}
              selected={form.gender === opt.value}
              onClick={() => setForm((f) => ({ ...f, gender: opt.value }))}
            >
              {opt.label}
            </ChipItem>
          ))}
        </Chip>
      </div>

      <div className="field-group">
        <label className="field-label">생년월일</label>
        <TextField
          variant="box"
          type="date"
          value={form.birth_date ?? ''}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
        />
      </div>

      <div className="field-group">
        <label className="field-label">몸무게 (kg)</label>
        <TextField
          variant="box"
          type="number"
          inputMode="decimal"
          placeholder="예: 4.5"
          value={form.weight_kg ?? ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, weight_kg: e.target.value ? Number(e.target.value) : undefined }))
          }
        />
      </div>

      <div className="field-group">
        <label className="field-label">중성화 여부</label>
        <Chip kind="select">
          <ChipItem selected={form.neutered === true} onClick={() => setForm((f) => ({ ...f, neutered: true }))}>
            완료
          </ChipItem>
          <ChipItem selected={form.neutered !== true} onClick={() => setForm((f) => ({ ...f, neutered: false }))}>
            미완료
          </ChipItem>
        </Chip>
      </div>

      <div className="field-group">
        <label className="field-label">하루 급식 목표 횟수</label>
        <TextField
          variant="box"
          type="number"
          inputMode="numeric"
          placeholder="예: 2"
          value={form.meal_target ?? ''}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              meal_target: e.target.value ? Math.min(10, Math.max(1, Number(e.target.value))) : undefined,
            }))
          }
        />
      </div>

      <div className="field-group">
        <label className="field-label">평소 복용하는 약 (선택)</label>
        <TextArea
          variant="box"
          placeholder="정기적으로 먹는 약이 있다면 적어주세요. 예: 하트가드 1알, 매일 아침 사료와 함께"
          minHeight={64}
          value={form.medicine_note ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, medicine_note: e.target.value }))}
        />
      </div>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && initial?.id && (
          <Button color="light" onClick={onCancel}>
            취소
          </Button>
        )}
        <div style={{ flex: 1 }}>
          <Button color="primary" display="full" disabled={!canSubmit} onClick={handleSubmit}>
            {saving ? '저장 중...' : initial?.id ? '수정 완료' : '등록하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DogProfile({
  mode,
  dogs,
  onSelectDog,
  onRegistered,
  onChanged,
}: DogProfileProps) {
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  if (mode === 'register') {
    return (
      <div>
        <div className="top-bar" style={{ padding: 0, marginBottom: 20 }}>
          <h1>우리 아이를 소개해주세요</h1>
          <p>등록하면 바로 오늘의 돌봄 기록을 시작할 수 있어요.</p>
        </div>
        <div className="card">
          <DogForm initial={null} onCancel={() => {}} onSaved={onRegistered} />
        </div>
      </div>
    );
  }

  const handleDelete = async (dog: Dog) => {
    const confirmed = window.confirm(`${dog.name}의 프로필과 모든 기록을 삭제할까요?`);
    if (!confirmed) return;
    await supabase.from('dogs').delete().eq('id', dog.id);
    await onChanged();
  };

  return (
    <div>
      <div className="top-bar" style={{ padding: 0, marginBottom: 20 }}>
        <h1>프로필</h1>
        <p>반려견 정보를 관리해요.</p>
      </div>

      {dogs.map((dog) => (
        <div key={dog.id} className="card" onClick={() => onSelectDog?.(dog.id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {dog.photo_url ? (
              <img
                src={dog.photo_url}
                alt={dog.name}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <PawAvatarIcon size={44} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{dog.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginTop: 2 }}>
                {dog.breed || '견종 미등록'} · {dog.gender === 'male' ? '남아' : dog.gender === 'female' ? '여아' : '성별 미등록'}
                {dog.weight_kg ? ` · ${dog.weight_kg}kg` : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <Button
                color="light"
                display="full"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDog(dog);
                }}
              >
                수정
              </Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button
                color="danger"
                variant="weak"
                display="full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(dog);
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      ))}

      {!showAddForm && (
        <Button color="light" display="full" onClick={() => setShowAddForm(true)}>
          + 반려견 추가하기
        </Button>
      )}

      {showAddForm && (
        <div className="card">
          <p className="card-title">새 반려견 등록</p>
          <DogForm
            initial={null}
            onCancel={() => setShowAddForm(false)}
            onSaved={async (dog) => {
              setShowAddForm(false);
              await onChanged();
              onSelectDog?.(dog.id);
            }}
          />
        </div>
      )}

      {editingDog && (
        <div className="modal-overlay" onClick={() => setEditingDog(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDog.name} 정보 수정</h2>
            <DogForm
              initial={editingDog}
              onCancel={() => setEditingDog(null)}
              onSaved={async () => {
                setEditingDog(null);
                await onChanged();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
