interface ImgUploadZoneProps {
  title: string;
  hint?: string;
}

export function ImgUploadZone({ title, hint }: ImgUploadZoneProps) {
  return (
    <div className="imgzone">
      <div className="ic">📷</div>
      <p>{title}</p>
      {hint && <small>{hint}</small>}
    </div>
  );
}
