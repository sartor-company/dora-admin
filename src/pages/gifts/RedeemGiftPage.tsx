import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { giftsApi } from '../../api/gifts';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { useApp } from '../../context/AppContext';
import { useAuthStore } from '../../store/authStore';
import type { RedeemGiftResult, RedeemPoolStock, RedeemTodayItem } from '../../types/gifts';
import './RedeemGiftPage.css';

type Mode = 'qr' | 'pin';
type SheetKind = 'ok' | 'bad' | 'warn';

function canAccessRedeemGift(opts: {
  accountType?: string;
  consoleRole?: string;
  giftRedemption?: boolean;
  role?: string;
}): boolean {
  if (opts.accountType === 'admin' || opts.consoleRole === 'owner') return true;
  if (opts.consoleRole === 'brand') return opts.giftRedemption === true;
  if (opts.giftRedemption === true) return true;
  if (opts.role === 'Sales Rep' || opts.role === 'Merchandiser') return true;
  return false;
}

function outcomeKind(outcome?: string): SheetKind {
  if (outcome === 'SUCCESS') return 'ok';
  if (outcome === 'PENDING_STOCK') return 'warn';
  return 'bad';
}

export function RedeemGiftPage() {
  const { companyName, displayUser } = useApp();
  const user = useAuthStore((s) => s.user);
  const allowed = canAccessRedeemGift({
    accountType: user?.accountType,
    consoleRole: user?.consoleRole,
    giftRedemption: user?.giftRedemption,
    role: user?.role,
  });

  const [mode, setMode] = useState<Mode>('qr');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [pools, setPools] = useState<RedeemPoolStock[]>([]);
  const [today, setToday] = useState<RedeemTodayItem[]>([]);
  const [flashGiftId, setFlashGiftId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{
    kind: SheetKind;
    title: string;
    subtitle: string;
    rows: [string, string][];
    giftName?: string;
    remaining?: number;
  } | null>(null);
  const [camError, setCamError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const loadSidePanels = useCallback(async () => {
    try {
      const [poolRows, mine] = await Promise.all([
        giftsApi.redeemPools(),
        giftsApi.myRedemptionsToday(),
      ]);
      setPools(poolRows);
      setToday(mine);
    } catch {
      /* non-fatal for empty state */
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void loadSidePanels();
  }, [allowed, loadSidePanels]);

  useEffect(() => {
    if (!allowed || mode !== 'qr') {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }

    let cancelled = false;
    (async () => {
      setCamError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setCamError('Camera access denied or unavailable. Use Enter PIN instead.');
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [allowed, mode]);

  const showResult = (result: RedeemGiftResult, fallbackCode: string) => {
    const kind = outcomeKind(result.outcome);
    setSheet({
      kind,
      title: result.title || (kind === 'ok' ? 'Redemption successful' : 'Unable to redeem'),
      subtitle: result.subtitle || '',
      rows: (result.rows || []).map((r) => [r[0], r[1]] as [string, string]),
      giftName: result.giftName,
      remaining: result.remaining,
    });
    if (!result.rows?.length && kind === 'bad') {
      setSheet((s) =>
        s
          ? {
              ...s,
              rows: [
                ['Code entered', fallbackCode],
                ['Method', mode === 'qr' ? 'QR Scan' : 'Manual Entry'],
              ],
            }
          : s,
      );
    }
  };

  const processCode = async (raw: string, method: 'QR_SCAN' | 'MANUAL_ENTRY') => {
    const code = raw.trim().toUpperCase();
    if (!code || busy) return;
    setBusy(true);
    try {
      const result = await giftsApi.redeemGift({ code, method });
      showResult(result, code);
      if (result.outcome === 'SUCCESS') {
        setPin('');
        setFlashGiftId(null);
        await loadSidePanels();
        // flash matching pool if present
        const match = pools.find((p) => p.name === result.giftName);
        if (match) {
          setFlashGiftId(match.giftId);
          window.setTimeout(() => setFlashGiftId(null), 1100);
        }
      }
    } catch (err) {
      setSheet({
        kind: 'bad',
        title: 'Request failed',
        subtitle: err instanceof Error ? err.message : 'Could not reach the server.',
        rows: [['Code entered', code]],
      });
    } finally {
      setBusy(false);
    }
  };

  const captureQr = async () => {
    if (busy) return;
    const video = videoRef.current;
    // Prefer BarcodeDetector when available
    const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
    if (Detector && video && video.readyState >= 2) {
      try {
        const detector = new Detector({ formats: ['qr_code'] });
        const codes = await detector.detect(video);
        const value = codes[0]?.rawValue?.trim();
        if (value) {
          await processCode(value, 'QR_SCAN');
          return;
        }
      } catch {
        /* fall through */
      }
    }
    setSheet({
      kind: 'warn',
      title: 'No QR detected',
      subtitle: 'Point the camera at the customer’s QR, or switch to Enter PIN and type RDM-…',
      rows: [],
    });
  };

  const submitPin = () => {
    void processCode(pin, 'MANUAL_ENTRY');
  };

  const closeSheet = () => {
    setSheet(null);
    if (mode === 'pin') {
      window.setTimeout(() => pinInputRef.current?.focus(), 60);
    }
  };

  if (!allowed) {
    return <Navigate to="/gifts" replace />;
  }

  return (
    <>
      <PageHeader
        title="Redeem Gift"
        subtitle={`${companyName} · Staff gift collection`}
      />
      <RestrictBanner>
        Scan or enter the customer’s RDM code. Redemption is verified server-side and logged against your account.
      </RestrictBanner>

      <div className="rg-layout">
        <div className="rg-card">
          <div className="rg-ct">Redeem a gift</div>
          <div className="rg-rep-line">
            Signed in as <strong>{displayUser}</strong>
          </div>
          <div className="rg-seg">
            <button
              type="button"
              className={mode === 'qr' ? 'on' : ''}
              onClick={() => setMode('qr')}
            >
              Scan QR
            </button>
            <button
              type="button"
              className={mode === 'pin' ? 'on' : ''}
              onClick={() => setMode('pin')}
            >
              Enter PIN
            </button>
          </div>

          {mode === 'qr' ? (
            <div>
              <div className="rg-scanner">
                <video ref={videoRef} playsInline muted className="rg-video" />
                <div className="rg-vf">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="rg-laser" />
                <div className="rg-scanhint">
                  {camError || 'Scan the QR from the customer’s e-mail or SMS link'}
                </div>
              </div>
              <button
                type="button"
                className="rg-btn rg-bpri"
                disabled={busy || Boolean(camError)}
                onClick={() => void captureQr()}
              >
                {busy ? 'Verifying…' : 'Capture code'}
              </button>
            </div>
          ) : (
            <div>
              <label className="rg-fl" htmlFor="rg-pin">
                Redemption code from the customer’s e-mail or SMS
              </label>
              <input
                id="rg-pin"
                ref={pinInputRef}
                className="rg-pin"
                placeholder="RDM-XXXXXXXXXX"
                maxLength={14}
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitPin();
                }}
              />
              <div style={{ height: 11 }} />
              <button
                type="button"
                className="rg-btn rg-bnav"
                disabled={busy || !pin.trim()}
                onClick={submitPin}
              >
                {busy ? 'Verifying…' : 'Verify & redeem'}
              </button>
            </div>
          )}
        </div>

        <div className="rg-card">
          <div className="rg-ct">Gift pool stock — live</div>
          {pools.length === 0 ? (
            <div className="rg-empty">No active gift pools.</div>
          ) : (
            pools.map((p) => {
              const cls =
                p.qty === 0 ? 'out' : p.qty < (p.lowStockThreshold || 5) ? 'low' : '';
              return (
                <div
                  key={`${p.campaignId}-${p.giftId}`}
                  className={`rg-pool ${cls}${flashGiftId === p.giftId ? ' flash' : ''}`}
                >
                  <div>
                    <div className="rg-pn">{p.name}</div>
                    <div className="rg-pt">
                      {p.trigger}
                      {p.campaignName ? ` · ${p.campaignName}` : ''}
                    </div>
                  </div>
                  <div className="rg-pq">
                    <div className="rg-pqv">{p.qty}</div>
                    <div className="rg-pql">{p.qty === 0 ? 'Out of stock' : 'remaining'}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="rg-card">
          <div className="rg-ct">My redemptions — today</div>
          {today.length === 0 ? (
            <div className="rg-empty">No redemptions yet today.</div>
          ) : (
            today.map((r) => (
              <div key={r._id} className="rg-log">
                <div className="rg-ldot" />
                <div className="rg-lmain">
                  <div className="rg-lg">{r.gift}</div>
                  <div className="rg-lc">
                    {r.consumer} · {r.method}
                  </div>
                </div>
                <div className="rg-lt">{r.time}</div>
              </div>
            ))
          )}
        </div>

        <div className="rg-note">
          The redemption code is <strong>RDM-</strong> plus the product scratch PIN. Each code is
          single-use: on success the gift pool decrements, the PIN is marked redeemed, and the
          redemption is recorded against your staff ID.
        </div>
      </div>

      {sheet && (
        <div
          className="rg-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSheet();
          }}
          role="presentation"
        >
          <div className={`rg-sheet ${sheet.kind}`}>
            <div className="rg-rico">{sheet.kind === 'ok' ? '✓' : sheet.kind === 'bad' ? '✕' : '!'}</div>
            <div className="rg-rtitle">{sheet.title}</div>
            <div className="rg-rsub">{sheet.subtitle}</div>
            {sheet.giftName && (
              <div className="rg-giftbox">
                <div className="rg-giftlbl">Gift to hand over</div>
                <div className="rg-giftname">{sheet.giftName}</div>
                <div className="rg-chips">
                  <span className="rg-chip">Collection confirm (later)</span>
                </div>
              </div>
            )}
            {sheet.rows.length > 0 && (
              <div style={{ marginTop: 4 }}>
                {sheet.rows.map(([k, v]) => (
                  <div key={k} className="rg-kv">
                    <span className="k">{k}</span>
                    <span className="v">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {typeof sheet.remaining === 'number' && (
              <div className="rg-remain">
                Pool stock updated — <strong className="mono">{sheet.remaining}</strong> remaining
              </div>
            )}
            <div style={{ height: 16 }} />
            <button
              type="button"
              className={`rg-btn ${sheet.kind === 'ok' ? 'rg-bnav' : 'rg-bsec'}`}
              onClick={closeSheet}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
