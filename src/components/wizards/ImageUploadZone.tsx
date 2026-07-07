interface ImageUploadZoneProps {
  label: string;
  hint?: string;
  required?: boolean;
}

export function ImageUploadZone({ label, hint, required }: ImageUploadZoneProps) {
  return (
    <div className="fg">
      <label className="fi">
        {label}
        {required ? ' *' : ''}
      </label>
      <div className="imgzone" role="button" tabIndex={0}>
        <div className="ic">📷</div>
        <p>Click to upload or drop image here</p>
        <small>{hint || 'PNG, JPG, TIFF · Max 20MB'}</small>
      </div>
    </div>
  );
}
