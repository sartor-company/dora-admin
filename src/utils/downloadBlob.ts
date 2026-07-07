export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function filenameFromDisposition(header?: string, fallback = 'download') {
  if (!header) return fallback;
  const match = /filename="?([^"]+)"?/i.exec(header);
  return match?.[1] || fallback;
}
