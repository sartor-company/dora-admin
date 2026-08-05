import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { giftsApi } from '../../api/gifts';
import { PageHeader } from '../../components/ui/PageHeader';
import { RestrictBanner } from '../../components/ui/RestrictBanner';
import { useApp } from '../../context/AppContext';
import { useContinuousQrScan } from '../../hooks/useContinuousQrScan';
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
  if (opts.consoleRole === 'brand' || opts.consoleRole === 'batch') return true;
  if (opts.giftRedemption === true) return true;
  if (opts.role === 'Sales Rep' || opts.role === 'Merchandiser') return true;
  if (opts.role === 'Manager' || opts.role === 'Admin') return true;
  return false;
}

function outcomeKind(outcome?: string): SheetKind {
  if (outcome === 'SUCCESS') return 'ok';
  if (outcome === 'PENDING_STOCK') return 'warn';
  return 'bad';
}

export function RedeemGiftPage() {
  const { companyName, displayUser, displayRole } = useApp();
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
  const [camReady, setCamReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const sheetOpenRef = useRef(false);
  const poolsRef = useRef(pools);
  poolsRef.current = pools;

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  useEffect(() => {
    sheetOpenRef.current = Boolean(sheet);
  }, [sheet]);

  const loadSidePanels = useCallback(async () => {
    try {
      const [poolRows, mine] = await Promise.all([
        giftsApi.redeemPools(),
        giftsApi.myRedemptionsToday(),
      ]);
      setPools(poolRows);
      setToday(mine);
    } catch {
      /* non-fatal */
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
      setCamReady(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setCamError('');
      setCamReady(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
          setCamReady(true);
        }
      } catch {
        setCamError('Camera access denied or unavailable. Use Enter PIN instead.');
        setCamReady(false);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCamReady(false);
    };
  }, [allowed, mode]);

  const processCode = useCallback(
    async (raw: string, method: 'QR_SCAN' | 'MANUAL_ENTRY') => {
      const code = raw.trim().toUpperCase();
      if (!code || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      try {
        const result = await giftsApi.redeemGift({ code, method });
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
                    ['Code entered', code],
                    ['Method', method === 'QR_SCAN' ? 'QR Scan' : 'Manual Entry'],
                  ],
                }
              : s,
          );
        }
        if (result.outcome === 'SUCCESS') {
          setPin('');
          await loadSidePanels();
          const match = poolsRef.current.find((p) => p.name === result.giftName);
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
        busyRef.current = false;
        setBusy(false);
      }
    },
    [loadSidePanels],
  );

  useContinuousQrScan({
    enabled: allowed && mode === 'qr' && camReady && !busy && !sheet && !camError,
    videoRef,
    onDetect: (value) => {
      if (busyRef.current || sheetOpenRef.current) return;
      void processCode(value, 'QR_SCAN');
    },
  });

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
      <PageHeader title="Redeem Gift" subtitle={`${companyName} · Staff gift collection`} />
      <RestrictBanner>
        Point the camera at the customer’s PIN QR — it auto-captures in under 2 seconds. You can also
        enter the PIN manually. Redemption is verified server-side and logged against your name and
        role.
      </RestrictBanner>

      <div className="rg-layout">
        <div className="rg-card">
          <div className="rg-ct">Redeem a gift</div>
          <div className="rg-rep-line">
            Signed in as <strong>{displayUser}</strong>
            {displayRole ? ` · ${displayRole}` : ''}
          </div>
          <div className="rg-seg">
            <button type="button" className={mode === 'qr' ? 'on' : ''} onClick={() => setMode('qr')}>
              Scan QR
            </button>
            <button type="button" className={mode === 'pin' ? 'on' : ''} onClick={() => setMode('pin')}>
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
                  {camError ||
                    (busy
                      ? 'Verifying…'
                      : camReady
                        ? 'Hold steady — QR auto-captures when detected'
                        : 'Starting camera…')}
                </div>
              </div>
              {busy && (
                <button type="button" className="rg-btn rg-bpri" disabled>
                  Verifying…
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className="rg-fl" htmlFor="rg-pin">
                Authentication PIN from the customer’s product / e-mail / SMS
              </label>
              <input
                id="rg-pin"
                ref={pinInputRef}
                className="rg-pin"
                placeholder="PIN or RDM-XXXXXXXXXX"
                maxLength={20}
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void processCode(pin, 'MANUAL_ENTRY');
                }}
              />
              <div style={{ height: 11 }} />
              <button
                type="button"
                className="rg-btn rg-bnav"
                disabled={busy || !pin.trim()}
                onClick={() => void processCode(pin, 'MANUAL_ENTRY')}
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
          Scan the customer’s <strong>authentication PIN QR</strong> (same PIN as on the bottle).
          Each gift is single-use: the PIN must already be authenticated, an entitlement must exist,
          and points are awarded only at authentication — not at redeem.
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
