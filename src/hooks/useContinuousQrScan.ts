import { useEffect, useRef } from 'react';
import jsQR from 'jsqr';

type DetectFn = (source: ImageBitmapSource) => Promise<string | null>;

function createBarcodeDetector(): DetectFn | null {
  const Detector = (
    window as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => {
        detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
      };
    }
  ).BarcodeDetector;
  if (!Detector) return null;
  try {
    const detector = new Detector({ formats: ['qr_code'] });
    return async (source) => {
      const codes = await detector.detect(source);
      const value = codes[0]?.rawValue?.trim();
      return value || null;
    };
  } catch {
    return null;
  }
}

function detectWithJsQr(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  // Downscale for speed while keeping QR readable (~640px wide).
  const scale = Math.min(1, 640 / w);
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, cw, ch);
  const image = ctx.getImageData(0, 0, cw, ch);
  const code = jsQR(image.data, image.width, image.height, {
    inversionAttempts: 'attemptBoth',
  });
  return code?.data?.trim() || null;
}

export type ContinuousQrOptions = {
  /** Scan only when true (camera ready, QR mode, no result sheet, not busy). */
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDetect: (value: string) => void;
  /** Ignore identical codes for this many ms after a hit. */
  cooldownMs?: number;
  /** Target scan interval; under 2s detection with ~100ms polling. */
  intervalMs?: number;
};

/**
 * Continuous live QR decode: BarcodeDetector when available, else jsQR on canvas.
 * Auto-fires onDetect as soon as a code is in frame (typically well under 2s).
 */
export function useContinuousQrScan({
  enabled,
  videoRef,
  onDetect,
  cooldownMs = 2500,
  intervalMs = 120,
}: ContinuousQrOptions) {
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;
  const lastHitRef = useRef<{ value: string; at: number }>({ value: '', at: 0 });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: number | null = null;
    const canvas = document.createElement('canvas');
    const barcodeDetect = createBarcodeDetector();

    const tick = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        try {
          let value: string | null = null;
          if (barcodeDetect) {
            value = await barcodeDetect(video);
          }
          if (!value) {
            value = detectWithJsQr(video, canvas);
          }
          if (value) {
            const now = Date.now();
            const last = lastHitRef.current;
            if (value !== last.value || now - last.at > cooldownMs) {
              lastHitRef.current = { value, at: now };
              onDetectRef.current(value);
            }
          }
        } catch {
          /* keep scanning */
        }
      }
      if (!cancelled) {
        timer = window.setTimeout(() => {
          void tick();
        }, intervalMs);
      }
    };

    timer = window.setTimeout(() => {
      void tick();
    }, 80);

    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [enabled, videoRef, cooldownMs, intervalMs]);
}
