import { useId, useRef, useState } from 'react';

interface ImageUploadZoneProps {
  label: string;
  hint?: string;
  required?: boolean;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
}

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/tiff';
const MAX_BYTES = 20 * 1024 * 1024;

export function ImageUploadZone({ label, hint, required, file, onFileChange }: ImageUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');

  const setFile = (next: File | null) => {
    setLocalError('');
    if (preview) URL.revokeObjectURL(preview);
    if (next) {
      if (next.size > MAX_BYTES) {
        setLocalError('Image must be 20MB or smaller.');
        onFileChange?.(null);
        setPreview(null);
        return;
      }
      setPreview(URL.createObjectURL(next));
    } else {
      setPreview(null);
    }
    onFileChange?.(next);
  };

  const openPicker = () => inputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type.startsWith('image/')) setFile(dropped);
  };

  const displayName = file?.name;

  return (
    <div className="fg">
      <label className="fi" htmlFor={inputId}>
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
      <div
        className="imgzone"
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={preview ? { padding: 8 } : undefined}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: 140,
                borderRadius: 6,
                objectFit: 'contain',
                marginBottom: 6,
              }}
            />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{displayName}</p>
            <small>Click to replace</small>
          </>
        ) : (
          <>
            <div className="ic">📷</div>
            <p>Click to upload or drop image here</p>
            <small>{hint || 'PNG, JPG, TIFF · Max 20MB'}</small>
          </>
        )}
      </div>
      {localError && (
        <div style={{ fontSize: 11, color: 'var(--rt)', marginTop: 4 }}>{localError}</div>
      )}
    </div>
  );
}
